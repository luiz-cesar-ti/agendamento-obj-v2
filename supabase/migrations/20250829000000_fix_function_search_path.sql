/*
# [Fix Function Search Path]
This migration sets the default search_path for the database to enhance security by explicitly defining schema search order. This helps prevent certain types of security vulnerabilities, such as function hijacking.

## Query Description: 
This operation alters the database configuration. It does not modify any table data and is considered a safe, non-destructive change. It ensures that when SQL functions are executed, schemas are searched in a predictable and secure order (`"$user"`, `public`, `extensions`).

## Metadata:
- Schema-Category: "Security"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Affects database-level configuration, not specific tables.

## Security Implications:
- RLS Status: Not Applicable
- Policy Changes: No
- Auth Requirements: No
- Mitigates: Potential for search_path-based attacks by setting a secure default.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;
