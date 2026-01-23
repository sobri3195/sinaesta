/**
 * Billing API Endpoints (Stripe)
 */

import { apiClient } from '../apiClient';
import type {
  BillingPlan,
  BillingSubscription,
  BillingCheckoutSessionResponse,
  BillingPortalSessionResponse,
  BillingInvoice,
  BillingPayment,
  BillingAdminOverview,
  BillingAdminSubscriptionRow,
  BillingAdminPaymentRow,
  BillingCoupon,
} from '../../types/api';

export const billingEndpoints = {
  async getPlans(): Promise<BillingPlan[]> {
    const response = await apiClient.get<{ data: BillingPlan[] }>('/billing/plans');
    return response.data;
  },

  async getMySubscription(): Promise<BillingSubscription> {
    const response = await apiClient.get<{ data: BillingSubscription }>('/billing/me', { cache: false });
    return response.data;
  },

  async createCheckoutSession(data: { planId: string; couponCode?: string }): Promise<BillingCheckoutSessionResponse> {
    const response = await apiClient.post<{ data: BillingCheckoutSessionResponse }>('/billing/checkout', data);
    return response.data;
  },

  async createOneTimeCheckoutSession(data: { amount: number; currency: string; description: string }): Promise<BillingCheckoutSessionResponse> {
    const response = await apiClient.post<{ data: BillingCheckoutSessionResponse }>('/billing/checkout/one-time', data);
    return response.data;
  },

  async createPortalSession(): Promise<BillingPortalSessionResponse> {
    const response = await apiClient.post<{ data: BillingPortalSessionResponse }>('/billing/portal');
    return response.data;
  },

  async getInvoices(): Promise<BillingInvoice[]> {
    const response = await apiClient.get<{ data: BillingInvoice[] }>('/billing/invoices', { cache: false });
    return response.data;
  },

  async getPayments(): Promise<BillingPayment[]> {
    const response = await apiClient.get<{ data: BillingPayment[] }>('/billing/payments', { cache: false });
    return response.data;
  },

  // Admin
  async adminOverview(): Promise<BillingAdminOverview> {
    const response = await apiClient.get<{ data: BillingAdminOverview }>('/billing/admin/overview', { cache: false });
    return response.data;
  },

  async adminSubscriptions(): Promise<BillingAdminSubscriptionRow[]> {
    const response = await apiClient.get<{ data: BillingAdminSubscriptionRow[] }>('/billing/admin/subscriptions', { cache: false });
    return response.data;
  },

  async adminPayments(): Promise<BillingAdminPaymentRow[]> {
    const response = await apiClient.get<{ data: BillingAdminPaymentRow[] }>('/billing/admin/payments', { cache: false });
    return response.data;
  },

  async adminCoupons(): Promise<BillingCoupon[]> {
    const response = await apiClient.get<{ data: BillingCoupon[] }>('/billing/admin/coupons', { cache: false });
    return response.data;
  },

  async adminCreateCoupon(data: { code: string; percentOff?: number; amountOff?: number; currency?: string }): Promise<any> {
    const response = await apiClient.post<{ data: any }>('/billing/admin/coupons', data);
    return response.data;
  },

  async adminAssignPlan(userId: string, data: { planCode: string; status?: string }): Promise<void> {
    await apiClient.post(`/billing/admin/users/${userId}/assign-plan`, data);
  },

  async adminRefund(data: { paymentIntentId: string; reason?: string }): Promise<void> {
    await apiClient.post('/billing/admin/refund', data);
  },
};
