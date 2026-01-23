/**
 * Billing hooks
 */

import { useQuery, type UseQueryOptions } from './useQuery';
import { useMutation, type UseMutationOptions } from './useMutation';
import { billingEndpoints } from '../services/endpoints';
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
} from '../types/api';

export function useBillingPlans(options?: UseQueryOptions<BillingPlan[]>) {
  return useQuery('billingPlans', billingEndpoints.getPlans, options);
}

export function useMySubscription(options?: UseQueryOptions<BillingSubscription>) {
  return useQuery('billingMe', billingEndpoints.getMySubscription, { cacheTime: 0, staleTime: 0, ...options });
}

export function useCreateCheckoutSession(options?: UseMutationOptions<BillingCheckoutSessionResponse, { planId: string; couponCode?: string }>) {
  return useMutation(billingEndpoints.createCheckoutSession, options);
}

export function useCreatePortalSession(options?: UseMutationOptions<BillingPortalSessionResponse, void>) {
  return useMutation((_: void) => billingEndpoints.createPortalSession(), options);
}

export function useInvoices(options?: UseQueryOptions<BillingInvoice[]>) {
  return useQuery('billingInvoices', billingEndpoints.getInvoices, { cacheTime: 0, staleTime: 0, ...options });
}

export function usePayments(options?: UseQueryOptions<BillingPayment[]>) {
  return useQuery('billingPayments', billingEndpoints.getPayments, { cacheTime: 0, staleTime: 0, ...options });
}

// Admin
export function useBillingAdminOverview(options?: UseQueryOptions<BillingAdminOverview>) {
  return useQuery('billingAdminOverview', billingEndpoints.adminOverview, { cacheTime: 0, staleTime: 0, ...options });
}

export function useBillingAdminSubscriptions(options?: UseQueryOptions<BillingAdminSubscriptionRow[]>) {
  return useQuery('billingAdminSubscriptions', billingEndpoints.adminSubscriptions, { cacheTime: 0, staleTime: 0, ...options });
}

export function useBillingAdminPayments(options?: UseQueryOptions<BillingAdminPaymentRow[]>) {
  return useQuery('billingAdminPayments', billingEndpoints.adminPayments, { cacheTime: 0, staleTime: 0, ...options });
}

export function useBillingAdminCoupons(options?: UseQueryOptions<BillingCoupon[]>) {
  return useQuery('billingAdminCoupons', billingEndpoints.adminCoupons, { cacheTime: 0, staleTime: 0, ...options });
}
