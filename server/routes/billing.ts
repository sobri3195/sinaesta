import { Router, Request, Response } from 'express';
import type Stripe from 'stripe';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { getStripe, getStripeWebhookSecret } from '../services/stripeService';
import {
  getPlansSafe,
  getMySubscriptionSafe,
  createCheckoutSession,
  createOneTimeCheckoutSession,
  createBillingPortalSession,
  insertWebhookEventIfNew,
  markWebhookEventProcessed,
  handleStripeSubscription,
  handleStripeInvoicePaid,
  handleStripeInvoicePaymentFailed,
  handleStripePaymentIntent,
  listInvoicesForUser,
  listPaymentsForUser,
  adminOverview,
  adminListSubscriptions,
  adminListPayments,
  adminListCoupons,
  adminCreateCoupon,
  adminAssignPlan,
  adminRefundPayment,
} from '../services/billingService';

const router = Router();

router.get('/plans', async (_req: Request, res: Response) => {
  const plans = await getPlansSafe();
  res.json({ success: true, data: plans });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await getMySubscriptionSafe(req.user!.id);
    res.json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch subscription' });
  }
});

router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, couponCode } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, error: 'planId is required' });
    }

    const session = await createCheckoutSession({ userId: req.user!.id, planId, couponCode });
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/checkout/one-time', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'idr', description } = req.body;
    if (!amount || !description) {
      return res.status(400).json({ success: false, error: 'amount and description are required' });
    }

    const session = await createOneTimeCheckoutSession({
      userId: req.user!.id,
      amount: Number(amount),
      currency,
      description,
    });

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/portal', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const session = await createBillingPortalSession({ userId: req.user!.id });
    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create portal session' });
  }
});

router.get('/invoices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await listInvoicesForUser(req.user!.id);
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch invoices' });
  }
});

router.get('/payments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payments = await listPaymentsForUser(req.user!.id);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch payments' });
  }
});

// --------------------------
// Admin
// --------------------------

router.get('/admin/overview', isAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const overview = await adminOverview();
    res.json({ success: true, data: overview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch overview' });
  }
});

router.get('/admin/subscriptions', isAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const subs = await adminListSubscriptions();
    res.json({ success: true, data: subs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch subscriptions' });
  }
});

router.get('/admin/payments', isAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const payments = await adminListPayments();
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch payments' });
  }
});

router.get('/admin/coupons', isAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const coupons = await adminListCoupons();
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch coupons' });
  }
});

router.post('/admin/coupons', isAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const { code, percentOff, amountOff, currency } = _req.body;
    const coupon = await adminCreateCoupon({
      code,
      percentOff: percentOff !== undefined ? Number(percentOff) : null,
      amountOff: amountOff !== undefined ? Number(amountOff) : null,
      currency: currency || 'idr',
    });
    res.json({ success: true, data: coupon });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create coupon' });
  }
});

router.post('/admin/users/:userId/assign-plan', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { planCode, status } = req.body;
    if (!planCode) return res.status(400).json({ success: false, error: 'planCode is required' });

    await adminAssignPlan({ actorId: req.user!.id, userId: req.params.userId, planCode, status });
    res.json({ success: true, message: 'Plan assigned' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to assign plan' });
  }
});

router.post('/admin/refund', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId, reason } = req.body;
    if (!paymentIntentId) return res.status(400).json({ success: false, error: 'paymentIntentId is required' });

    await adminRefundPayment({ actorId: req.user!.id, paymentIntentId, reason });
    res.json({ success: true, message: 'Refund processed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to process refund' });
  }
});

// --------------------------
// Stripe Webhook
// --------------------------

router.post('/webhook', async (req: any, res: Response) => {
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) {
      return res.status(400).send('Missing Stripe-Signature header');
    }

    const rawBody: Buffer | undefined = req.rawBody;
    if (!rawBody) {
      return res.status(400).send('Missing raw body');
    }

    event = stripe.webhooks.constructEvent(rawBody, sig, getStripeWebhookSecret());
  } catch (err: any) {
    console.error('[billing webhook] signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const webhookRowId = await insertWebhookEventIfNew(event);
  if (!webhookRowId) {
    return res.json({ received: true, deduped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
          await handleStripeSubscription(subscription);
        }

        if (session.mode === 'payment' && session.payment_intent) {
          const stripe = getStripe();
          const intent = await stripe.paymentIntents.retrieve(String(session.payment_intent));
          await handleStripePaymentIntent(intent);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleStripeSubscription(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleStripeInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleStripeInvoicePaymentFailed(invoice);
        break;
      }

      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handleStripePaymentIntent(intent);
        break;
      }

      default:
        // Ignored but logged in webhook_events
        break;
    }

    await markWebhookEventProcessed({ id: webhookRowId, status: 'processed' });
    res.json({ received: true });
  } catch (error: any) {
    console.error('[billing webhook] processing failed:', error);
    await markWebhookEventProcessed({ id: webhookRowId, status: 'failed', error: error.message || 'Unknown error' });
    res.status(500).json({ received: true });
  }
});

export default router;
