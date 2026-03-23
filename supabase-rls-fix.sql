-- ============================================
-- Enable RLS on all tables (SECURITY FIX)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable RLS on each table
ALTER TABLE public."Position" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Proposal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProposalService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ServiceSelection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LeadService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectTimeline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClientRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CalendarEvent" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================
-- These policies allow access for authenticated users (your API)
-- The anon role is restricted - add policies as needed for public access

-- For service-role (backend): allow all
CREATE POLICY "service_role_full_access" ON public."Lead" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Proposal" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Contract" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Payment" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Subscription" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."ClientRequest" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Note" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."ActivityLog" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Service" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Position" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Availability" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."Task" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."ServiceSelection" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."LeadService" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."ProjectTimeline" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."ProposalService" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access" ON public."CalendarEvent" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- For authenticated users (if you use auth): allow all
CREATE POLICY "authenticated_full_access" ON public."Lead" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Proposal" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Contract" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Payment" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Subscription" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."ClientRequest" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Note" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."ActivityLog" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Service" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Position" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Availability" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."Task" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."ServiceSelection" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."LeadService" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."ProjectTimeline" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."ProposalService" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_full_access" ON public."CalendarEvent" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- For anon role: restrict to read-only for certain tables (adjust as needed)
-- Example: Anyone can read services, but only auth can modify
CREATE POLICY "anon_can_read_services" ON public."Service" FOR SELECT TO anon USING (true);
CREATE POLICY "anon_can_read_leads" ON public."Lead" FOR SELECT TO anon USING (true);