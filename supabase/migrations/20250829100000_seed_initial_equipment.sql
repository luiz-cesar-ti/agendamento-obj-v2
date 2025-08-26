/*
# Seed Initial Equipment
This script populates the 'equipment' table with a default set of items commonly used in an educational environment.

## Query Description:
This operation inserts four types of equipment: Notebooks, Tablets, Microphones, and Speakers, each with a starting quantity. It is a safe, non-destructive operation that only adds new data. It will not affect any existing equipment records. The 'ON CONFLICT (name) DO NOTHING' clause prevents errors if you run this script multiple times.

## Metadata:
- Schema-Category: ["Data"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Table: public.equipment
- Columns Affected: name, total_quantity, category

## Security Implications:
- RLS Status: Enabled
- Policy Changes: No
- Auth Requirements: Requires a role with INSERT permissions on the 'equipment' table.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Inserts a small number of rows.
*/

INSERT INTO public.equipment (name, total_quantity, category)
VALUES
  ('Notebook', 15, 'Eletrônicos'),
  ('Tablet', 10, 'Eletrônicos'),
  ('Microfone', 5, 'Áudio'),
  ('Caixa de som', 5, 'Áudio')
ON CONFLICT (name) DO NOTHING;
