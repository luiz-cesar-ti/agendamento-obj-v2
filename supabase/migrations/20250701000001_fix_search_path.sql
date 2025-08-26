/*
# [SECURITY] Fix Function Search Path
This migration updates the `update_updated_at_column` function to explicitly set the `search_path`. This addresses a security warning and prevents potential schema hijacking vulnerabilities by ensuring the function always operates on the intended `public` schema.

## Query Description:
This operation modifies an existing database function. It is a safe, non-destructive change that improves security. No data will be altered.

## Metadata:
- Schema-Category: ["Safe", "Security"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true (can be reverted to the previous function definition)

## Structure Details:
- Function affected: `public.update_updated_at_column()`

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None
- Mitigates: "Function Search Path Mutable" security warning.

## Performance Impact:
- Indexes: None
- Triggers: Unchanged
- Estimated Impact: Negligible performance impact.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$
LANGUAGE 'plpgsql'
SECURITY DEFINER
SET search_path = 'public';
