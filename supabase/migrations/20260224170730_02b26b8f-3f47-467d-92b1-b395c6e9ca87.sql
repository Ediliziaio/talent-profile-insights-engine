
-- RLS policies for candidate_sessions: deny all client access (only service_role used by edge functions)
CREATE POLICY "Deny all client access to candidate_sessions"
ON public.candidate_sessions
FOR ALL
TO authenticated
USING (false);

-- RLS policies for login_attempts: deny all client access (only service_role used by edge functions)
CREATE POLICY "Deny all client access to login_attempts"
ON public.login_attempts
FOR ALL
TO authenticated
USING (false);

-- Allow superadmin SELECT on candidate_sessions for debugging
CREATE POLICY "Superadmin can view candidate_sessions"
ON public.candidate_sessions
FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));

-- Allow superadmin SELECT on login_attempts for debugging
CREATE POLICY "Superadmin can view login_attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (is_superadmin(auth.uid()));
