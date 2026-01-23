import type Stripe from 'stripe';
import { query } from '../config/database.js';
import { getStripe } from './stripeService';
import { sendEmail } from './emailService';

function unixToDate(ts?: number | null): Date | null {
  if (!ts) return null;
  return new Date(ts * 1000);
}

async function logAudit(params: {
  userId?: string | null;
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: any;
}) {
  const { userId = null, actorId = null, action, entityType = null, entityId = null, details = null } = params;
  try {
    await query(
      `INSERT INTO billing_audit_logs (user_id, actor_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, actorId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch {
    // Best effort; audit failures should not break billing.
  }
}

export async function getPlansSafe(): Promise<any[]> {
  try {
    const result = await query(
      `SELECT id, code, name, price_amount, currency, interval, features, trial_days, stripe_price_id, active
       FROM plans
       WHERE active = TRUE
       ORDER BY price_amount ASC`
    );
    return result.rows;
  } catch {
    return [
      {
        id: 'free',
        code: 'FREE',
        name: 'Free',
        price_amount: 0,
        currency: 'idr',
        interval: 'month',
        features: ['Basic access', 'Limited exam attempts', 'Community support'],
        trial_days: 0,
        stripe_price_id: null,
        active: true,
      },
      {
        id: 'premium',
        code: 'PREMIUM',
        name: 'Premium',
        price_amount: 99000,
        currency: 'idr',
        interval: 'month',
        features: ['Unlimited exams', 'Advanced analytics', 'Priority support'],
        trial_days: 7,
        stripe_price_id: null,
        active: true,
      },
      {
        id: 'professional',
        code: 'PROFESSIONAL',
        name: 'Professional',
        price_amount: 199000,
        currency: 'idr',
        interval: 'month',
        features: ['All Premium features', 'Mentor access', 'OSCE sessions'],
        trial_days: 7,
        stripe_price_id: null,
        active: true,
      },
    ];
  }
}

export async function ensureStripeCustomerForUser(userId: string): Promise<string> {
  const userResult = await query('SELECT id, email, name, stripe_customer_id FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];
  if (user.stripe_customer_id) return user.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });

  await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, userId]);
  await logAudit({ userId, actorId: userId, action: 'stripe.customer.created', entityType: 'stripe_customer', entityId: customer.id });

  return customer.id;
}

export async function getUserByStripeCustomerId(customerId: string): Promise<{ id: string; email: string; name: string } | null> {
  const result = await query('SELECT id, email, name FROM users WHERE stripe_customer_id = $1', [customerId]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getMySubscriptionSafe(userId: string): Promise<any> {
  try {
    const result = await query(
      `SELECT s.*, p.code as plan_code, p.name as plan_name, p.price_amount, p.currency, p.interval, p.features, p.trial_days
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      const plans = await getPlansSafe();
      const free = plans.find((p) => p.code === 'FREE') || plans[0];
      return {
        status: 'free',
        plan: free,
      };
    }

    const row = result.rows[0];
    return {
      id: row.id,
      status: row.status,
      startDate: row.start_date,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      canceledAt: row.canceled_at,
      trialEnd: row.trial_end,
      stripeSubscriptionId: row.stripe_subscription_id,
      plan: {
        id: row.plan_id,
        code: row.plan_code,
        name: row.plan_name,
        price_amount: row.price_amount,
        currency: row.currency,
        interval: row.interval,
        features: row.features,
        trial_days: row.trial_days,
      },
    };
  } catch {
    const plans = await getPlansSafe();
    const free = plans.find((p) => p.code === 'FREE') || plans[0];
    return {
      status: 'free',
      plan: free,
    };
  }
}

export async function createCheckoutSession(params: {
  userId: string;
  planId: string;
  couponCode?: string | null;
}): Promise<{ url: string; sessionId: string }> {
  const { userId, planId, couponCode } = params;
  const planResult = await query('SELECT * FROM plans WHERE id = $1 AND active = TRUE', [planId]);
  if (planResult.rows.length === 0) {
    throw new Error('Plan not found');
  }
  const plan = planResult.rows[0];

  if (!plan.stripe_price_id) {
    throw new Error('Stripe price is not configured for this plan');
  }

  const stripe = getStripe();
  const customerId = await ensureStripeCustomerForUser(userId);

  let discount: { coupon: string } | null = null;
  if (couponCode) {
    const couponResult = await query('SELECT * FROM coupons WHERE code = $1 AND active = TRUE', [couponCode.trim().toUpperCase()]);
    if (couponResult.rows.length > 0 && couponResult.rows[0].stripe_coupon_id) {
      discount = { coupon: couponResult.rows[0].stripe_coupon_id };
    }
  }

  const successUrl = process.env.STRIPE_SUCCESS_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?billing=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?billing=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    allow_promotion_codes: true,
    discounts: discount ? [discount] : undefined,
    subscription_data: {
      trial_period_days: plan.trial_days && plan.trial_days > 0 ? plan.trial_days : undefined,
      metadata: {
        userId,
        planId,
        planCode: plan.code,
      },
    },
    metadata: {
      userId,
      planId,
      planCode: plan.code,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: { enabled: true },
  });

  await logAudit({ userId, actorId: userId, action: 'checkout.session.created', entityType: 'stripe_checkout_session', entityId: session.id, details: { planId } });

  if (!session.url) {
    throw new Error('Stripe did not return a Checkout URL');
  }

  return { url: session.url, sessionId: session.id };
}

export async function createOneTimeCheckoutSession(params: {
  userId: string;
  amount: number;
  currency: string;
  description: string;
}): Promise<{ url: string; sessionId: string }> {
  const { userId, amount, currency, description } = params;
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  const stripe = getStripe();
  const customerId = await ensureStripeCustomerForUser(userId);

  const successUrl = process.env.STRIPE_SUCCESS_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?billing=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?billing=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: { name: description },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      type: 'one_time',
      description,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: { enabled: true },
  });

  await logAudit({ userId, actorId: userId, action: 'checkout.session.created.one_time', entityType: 'stripe_checkout_session', entityId: session.id, details: { amount, currency } });

  if (!session.url) {
    throw new Error('Stripe did not return a Checkout URL');
  }

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(params: { userId: string }): Promise<{ url: string }> {
  const customerId = await ensureStripeCustomerForUser(params.userId);
  const stripe = getStripe();
  const returnUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${returnUrl}/?billing=portal_return`,
  });

  await logAudit({ userId: params.userId, actorId: params.userId, action: 'billing.portal.created', entityType: 'stripe_portal_session', entityId: session.id });

  return { url: session.url };
}

export async function insertWebhookEventIfNew(event: Stripe.Event): Promise<string | null> {
  try {
    const res = await query(
      `INSERT INTO webhook_events (gateway, event_id, event_type, payload)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING id`,
      ['stripe', event.id, event.type, JSON.stringify(event)]
    );

    if (res.rows.length === 0) return null;
    return res.rows[0].id;
  } catch {
    return null;
  }
}

export async function markWebhookEventProcessed(params: {
  id: string;
  status: 'processed' | 'ignored' | 'failed';
  error?: string | null;
}) {
  const { id, status, error = null } = params;
  try {
    await query(
      `UPDATE webhook_events
       SET processed_at = CURRENT_TIMESTAMP,
           processing_status = $2,
           error = $3
       WHERE id = $1`,
      [id, status, error]
    );
  } catch {
    // ignore
  }
}

async function findPlanIdByStripePriceId(priceId: string | null | undefined): Promise<string | null> {
  if (!priceId) return null;
  try {
    const res = await query('SELECT id FROM plans WHERE stripe_price_id = $1 LIMIT 1', [priceId]);
    return res.rows.length ? res.rows[0].id : null;
  } catch {
    return null;
  }
}

async function findPlanIdByCode(code: string): Promise<string | null> {
  try {
    const res = await query('SELECT id FROM plans WHERE code = $1 LIMIT 1', [code]);
    return res.rows.length ? res.rows[0].id : null;
  } catch {
    return null;
  }
}

async function upsertSubscriptionRow(params: {
  userId: string;
  planId: string;
  status: string;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  startDate?: Date | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean | null;
  canceledAt?: Date | null;
  trialEnd?: Date | null;
  metadata?: any;
}) {
  const {
    userId,
    planId,
    status,
    stripeSubscriptionId = null,
    stripeCustomerId = null,
    startDate = null,
    currentPeriodStart = null,
    currentPeriodEnd = null,
    cancelAtPeriodEnd = null,
    canceledAt = null,
    trialEnd = null,
    metadata = null,
  } = params;

  const existing = stripeSubscriptionId
    ? await query('SELECT id FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1', [stripeSubscriptionId])
    : { rows: [] as any[] };

  if (stripeCustomerId) {
    await query('UPDATE users SET stripe_customer_id = COALESCE(stripe_customer_id, $1) WHERE id = $2', [stripeCustomerId, userId]);
  }

  if (existing.rows.length) {
    await query(
      `UPDATE subscriptions
       SET user_id = $2,
           plan_id = $3,
           status = $4,
           start_date = $5,
           current_period_start = $6,
           current_period_end = $7,
           cancel_at_period_end = $8,
           canceled_at = $9,
           trial_end = $10,
           stripe_customer_id = $11,
           metadata = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        existing.rows[0].id,
        userId,
        planId,
        status,
        startDate,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        canceledAt,
        trialEnd,
        stripeCustomerId,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );

    return existing.rows[0].id as string;
  }

  const inserted = await query(
    `INSERT INTO subscriptions (
        user_id, plan_id, status, start_date, current_period_start, current_period_end,
        cancel_at_period_end, canceled_at, trial_end, stripe_subscription_id, stripe_customer_id, metadata
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      userId,
      planId,
      status,
      startDate,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      canceledAt,
      trialEnd,
      stripeSubscriptionId,
      stripeCustomerId,
      metadata ? JSON.stringify(metadata) : null,
    ]
  );

  return inserted.rows[0].id as string;
}

export async function handleStripeSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const metadataUserId = (subscription.metadata && subscription.metadata.userId) || null;

  const user = metadataUserId ? { id: metadataUserId } : await getUserByStripeCustomerId(customerId);
  if (!user) {
    await logAudit({ userId: null, actorId: null, action: 'subscription.unmapped_customer', entityType: 'stripe_subscription', entityId: subscription.id, details: { customerId } });
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id || null;
  const planId = (await findPlanIdByStripePriceId(priceId)) || (await findPlanIdByCode('FREE'));
  if (!planId) {
    await logAudit({ userId: user.id, actorId: null, action: 'subscription.unknown_plan', entityType: 'stripe_subscription', entityId: subscription.id, details: { priceId } });
    return;
  }

  await upsertSubscriptionRow({
    userId: user.id,
    planId,
    status: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
    startDate: unixToDate(subscription.start_date),
    currentPeriodStart: unixToDate(subscription.current_period_start),
    currentPeriodEnd: unixToDate(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: unixToDate(subscription.canceled_at),
    trialEnd: unixToDate(subscription.trial_end),
    metadata: subscription.metadata,
  });

  await logAudit({ userId: user.id, actorId: null, action: 'subscription.upserted', entityType: 'stripe_subscription', entityId: subscription.id, details: { status: subscription.status } });
}

async function upsertPayment(params: {
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  subscriptionId?: string | null;
  planId?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  paidAt?: Date | null;
}): Promise<string> {
  const {
    userId,
    amount,
    currency,
    status,
    paymentMethod = null,
    stripePaymentIntentId = null,
    stripeChargeId = null,
    subscriptionId = null,
    planId = null,
    failureCode = null,
    failureMessage = null,
    paidAt = null,
  } = params;

  if (stripePaymentIntentId) {
    const existing = await query('SELECT id FROM payments WHERE stripe_payment_intent_id = $1', [stripePaymentIntentId]);
    if (existing.rows.length) {
      await query(
        `UPDATE payments
         SET status = $2,
             payment_method = COALESCE($3, payment_method),
             stripe_charge_id = COALESCE($4, stripe_charge_id),
             failure_code = $5,
             failure_message = $6,
             paid_at = COALESCE($7, paid_at),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [existing.rows[0].id, status, paymentMethod, stripeChargeId, failureCode, failureMessage, paidAt]
      );
      return existing.rows[0].id;
    }
  }

  const inserted = await query(
    `INSERT INTO payments (user_id, subscription_id, plan_id, amount, currency, status, payment_method, stripe_payment_intent_id, stripe_charge_id, failure_code, failure_message, paid_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      userId,
      subscriptionId,
      planId,
      amount,
      currency,
      status,
      paymentMethod,
      stripePaymentIntentId,
      stripeChargeId,
      failureCode,
      failureMessage,
      paidAt,
    ]
  );

  return inserted.rows[0].id;
}

async function upsertInvoice(params: {
  userId: string;
  paymentId?: string | null;
  stripeInvoiceId?: string | null;
  invoiceNumber?: string | null;
  hostedInvoiceUrl?: string | null;
  pdfUrl?: string | null;
  amountDue?: number | null;
  amountPaid?: number | null;
  currency?: string | null;
  status?: string | null;
  issuedAt?: Date | null;
  dueDate?: Date | null;
  paidAt?: Date | null;
}) {
  const {
    userId,
    paymentId = null,
    stripeInvoiceId = null,
    invoiceNumber = null,
    hostedInvoiceUrl = null,
    pdfUrl = null,
    amountDue = null,
    amountPaid = null,
    currency = null,
    status = null,
    issuedAt = null,
    dueDate = null,
    paidAt = null,
  } = params;

  if (stripeInvoiceId) {
    const existing = await query('SELECT id FROM invoices WHERE stripe_invoice_id = $1', [stripeInvoiceId]);
    if (existing.rows.length) {
      await query(
        `UPDATE invoices
         SET payment_id = COALESCE($2, payment_id),
             invoice_number = COALESCE($3, invoice_number),
             hosted_invoice_url = COALESCE($4, hosted_invoice_url),
             pdf_url = COALESCE($5, pdf_url),
             amount_due = COALESCE($6, amount_due),
             amount_paid = COALESCE($7, amount_paid),
             currency = COALESCE($8, currency),
             status = COALESCE($9, status),
             issued_at = COALESCE($10, issued_at),
             due_date = COALESCE($11, due_date),
             paid_at = COALESCE($12, paid_at)
         WHERE id = $1`,
        [
          existing.rows[0].id,
          paymentId,
          invoiceNumber,
          hostedInvoiceUrl,
          pdfUrl,
          amountDue,
          amountPaid,
          currency,
          status,
          issuedAt,
          dueDate,
          paidAt,
        ]
      );
      return;
    }
  }

  await query(
    `INSERT INTO invoices (user_id, payment_id, invoice_number, stripe_invoice_id, hosted_invoice_url, pdf_url, amount_due, amount_paid, currency, status, issued_at, due_date, paid_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [userId, paymentId, invoiceNumber, stripeInvoiceId, hostedInvoiceUrl, pdfUrl, amountDue, amountPaid, currency, status, issuedAt, dueDate, paidAt]
  );
}

export async function handleStripeInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const stripeSubscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  let subscriptionId: string | null = null;
  let planId: string | null = null;

  if (stripeSubscriptionId) {
    const subRes = await query('SELECT id, plan_id FROM subscriptions WHERE stripe_subscription_id = $1', [stripeSubscriptionId]);
    if (subRes.rows.length) {
      subscriptionId = subRes.rows[0].id;
      planId = subRes.rows[0].plan_id;
    }
  }

  const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;
  const paymentId = await upsertPayment({
    userId: user.id,
    subscriptionId,
    planId,
    amount: invoice.amount_paid || invoice.amount_due || 0,
    currency: invoice.currency || 'idr',
    status: 'succeeded',
    stripePaymentIntentId: paymentIntentId || null,
    paidAt: invoice.status_transitions?.paid_at ? unixToDate(invoice.status_transitions.paid_at) : new Date(),
  });

  await upsertInvoice({
    userId: user.id,
    paymentId,
    stripeInvoiceId: invoice.id,
    invoiceNumber: invoice.number || null,
    hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    pdfUrl: invoice.invoice_pdf || null,
    amountDue: invoice.amount_due ?? null,
    amountPaid: invoice.amount_paid ?? null,
    currency: invoice.currency || null,
    status: invoice.status || null,
    issuedAt: unixToDate((invoice as any).created),
    dueDate: invoice.due_date ? unixToDate(invoice.due_date) : null,
    paidAt: invoice.status_transitions?.paid_at ? unixToDate(invoice.status_transitions.paid_at) : null,
  });

  await logAudit({ userId: user.id, actorId: null, action: 'invoice.paid', entityType: 'stripe_invoice', entityId: invoice.id, details: { amount: invoice.amount_paid, currency: invoice.currency } });

  if (user.email) {
    const url = invoice.hosted_invoice_url || invoice.invoice_pdf || '';
    const html = `
      <h2>Payment received</h2>
      <p>Thank you for your payment. Your invoice is available here:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Invoice: ${invoice.number || invoice.id}</p>
    `;
    await sendEmail(user.email, 'Sinaesta - Invoice Paid', html);
  }
}

export async function handleStripeInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

  await upsertPayment({
    userId: user.id,
    amount: invoice.amount_due || 0,
    currency: invoice.currency || 'idr',
    status: 'failed',
    stripePaymentIntentId: paymentIntentId || null,
    failureMessage: 'Invoice payment failed',
  });

  await logAudit({ userId: user.id, actorId: null, action: 'invoice.payment_failed', entityType: 'stripe_invoice', entityId: invoice.id });

  if (user.email) {
    const html = `
      <h2>Payment failed</h2>
      <p>We couldn't process your payment. Please update your payment method to avoid interruption.</p>
      <p>You can manage your billing from within the app under Subscription.</p>
    `;
    await sendEmail(user.email, 'Sinaesta - Payment Failed', html);
  }
}

export async function handleStripePaymentIntent(intent: Stripe.PaymentIntent): Promise<void> {
  const customerId = typeof intent.customer === 'string' ? intent.customer : intent.customer?.id;
  if (!customerId) return;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  const status = intent.status === 'succeeded' ? 'succeeded' : intent.status;
  const paymentMethod = intent.payment_method_types?.[0] || null;

  await upsertPayment({
    userId: user.id,
    amount: intent.amount_received || intent.amount,
    currency: intent.currency,
    status,
    paymentMethod,
    stripePaymentIntentId: intent.id,
    paidAt: status === 'succeeded' ? new Date() : null,
    failureCode: (intent.last_payment_error as any)?.code || null,
    failureMessage: (intent.last_payment_error as any)?.message || null,
  });

  await logAudit({ userId: user.id, actorId: null, action: `payment_intent.${intent.status}`, entityType: 'stripe_payment_intent', entityId: intent.id });
}

export async function listInvoicesForUser(userId: string): Promise<any[]> {
  const res = await query(
    `SELECT id, invoice_number, stripe_invoice_id, hosted_invoice_url, pdf_url, amount_due, amount_paid, currency, status, issued_at, due_date, paid_at, created_at
     FROM invoices
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );
  return res.rows;
}

export async function listPaymentsForUser(userId: string): Promise<any[]> {
  const res = await query(
    `SELECT id, amount, currency, status, payment_method, stripe_payment_intent_id, stripe_charge_id, failure_code, failure_message, paid_at, created_at
     FROM payments
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );
  return res.rows;
}

export async function adminOverview(): Promise<any> {
  const revenueTotal = await query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'succeeded'`);
  const revenueMonth = await query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM payments
     WHERE status = 'succeeded'
       AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)`
  );
  const activeSubs = await query(`SELECT COUNT(*)::int as count FROM subscriptions WHERE status IN ('active', 'trialing')`);
  const pastDue = await query(`SELECT COUNT(*)::int as count FROM subscriptions WHERE status IN ('past_due', 'unpaid')`);

  return {
    revenueTotal: Number(revenueTotal.rows[0].total || 0),
    revenueThisMonth: Number(revenueMonth.rows[0].total || 0),
    activeSubscriptions: Number(activeSubs.rows[0].count || 0),
    pastDueSubscriptions: Number(pastDue.rows[0].count || 0),
  };
}

export async function adminListSubscriptions(): Promise<any[]> {
  const res = await query(
    `SELECT s.id, s.status, s.current_period_end, s.trial_end, s.cancel_at_period_end, s.stripe_subscription_id,
            u.id as user_id, u.email, u.name,
            p.code as plan_code, p.name as plan_name, p.price_amount, p.currency, p.interval
     FROM subscriptions s
     JOIN users u ON u.id = s.user_id
     JOIN plans p ON p.id = s.plan_id
     ORDER BY s.updated_at DESC
     LIMIT 100`
  );
  return res.rows;
}

export async function adminListPayments(): Promise<any[]> {
  const res = await query(
    `SELECT p.id, p.amount, p.currency, p.status, p.payment_method, p.stripe_payment_intent_id, p.paid_at, p.created_at,
            u.email, u.name
     FROM payments p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT 100`
  );
  return res.rows;
}

export async function adminListCoupons(): Promise<any[]> {
  const res = await query(
    `SELECT id, code, percent_off, amount_off, currency, active, stripe_coupon_id, max_redemptions, redeem_by, created_at
     FROM coupons
     ORDER BY created_at DESC
     LIMIT 100`
  );
  return res.rows;
}

export async function adminCreateCoupon(params: {
  code: string;
  percentOff?: number | null;
  amountOff?: number | null;
  currency?: string | null;
}): Promise<any> {
  const stripe = getStripe();
  const code = params.code.trim().toUpperCase();
  if (!code) throw new Error('Invalid code');

  const coupon = await stripe.coupons.create({
    percent_off: params.percentOff ?? undefined,
    amount_off: params.amountOff ?? undefined,
    currency: params.amountOff ? (params.currency || 'idr') : undefined,
    duration: 'once',
    name: code,
  });

  await query(
    `INSERT INTO coupons (code, percent_off, amount_off, currency, stripe_coupon_id, active)
     VALUES ($1,$2,$3,$4,$5,TRUE)
     ON CONFLICT (code) DO UPDATE SET stripe_coupon_id = EXCLUDED.stripe_coupon_id
     RETURNING *`,
    [code, params.percentOff ?? null, params.amountOff ?? null, params.currency || null, coupon.id]
  );

  await logAudit({ userId: null, actorId: null, action: 'coupon.created', entityType: 'stripe_coupon', entityId: coupon.id, details: { code } });

  return coupon;
}

export async function adminAssignPlan(params: {
  actorId: string;
  userId: string;
  planCode: string;
  status?: string;
}): Promise<void> {
  const planRes = await query('SELECT id FROM plans WHERE code = $1', [params.planCode]);
  if (planRes.rows.length === 0) throw new Error('Plan not found');

  const planId = planRes.rows[0].id;

  await query(
    `INSERT INTO subscriptions (user_id, plan_id, status, start_date, current_period_start, current_period_end)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
    [params.userId, planId, params.status || 'manual_active']
  );

  await logAudit({ userId: params.userId, actorId: params.actorId, action: 'admin.plan_assigned', entityType: 'subscription', entityId: planId, details: { planCode: params.planCode } });
}

export async function adminRefundPayment(params: {
  actorId: string;
  paymentIntentId: string;
  reason?: string;
}): Promise<void> {
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    reason: (params.reason as any) || undefined,
  });

  await query(
    `UPDATE payments
     SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
     WHERE stripe_payment_intent_id = $1`,
    [params.paymentIntentId]
  );

  await logAudit({ userId: null, actorId: params.actorId, action: 'admin.refund_processed', entityType: 'stripe_refund', entityId: refund.id, details: { paymentIntentId: params.paymentIntentId } });
}
