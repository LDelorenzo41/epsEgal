-- ============================================
-- Fix: Remove SECURITY DEFINER from cp_weight_by_establishment view
-- ============================================
-- The view cp_weight_by_establishment was flagged by Supabase linter
-- because SECURITY DEFINER causes the view to execute with the
-- permissions of its creator, bypassing RLS policies.
--
-- This migration recreates the view with SECURITY INVOKER so that
-- queries respect the calling user's RLS policies.
-- ============================================

-- Change the view's security property to INVOKER
-- This ensures RLS policies are enforced for the querying user
ALTER VIEW public.cp_weight_by_establishment SET (security_invoker = on);
