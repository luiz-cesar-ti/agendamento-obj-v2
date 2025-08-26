/*
# OPERAÇÃO DE RESET COMPLETO DO SCHEMA

Este script irá apagar completamente as tabelas principais da aplicação e recriá-las.
É uma operação perigosa que resultará na perda de todos os dados existentes nessas tabelas.

## Descrição da Query:
- **Impacto:** Alto. Todos os dados das tabelas `equipment`, `bookings`, `booking_equipment` e `settings` serão perdidos.
- **Risco:** Elevado. Use este script apenas se tiver certeza de que deseja reiniciar o banco de dados para este projeto.
- **Precauções:** Faça um backup dos seus dados se houver algo que você não queira perder.

## Metadata:
- Schema-Category: "Dangerous"
- Impact-Level: "High"
- Requires-Backup: true
- Reversible: false

## Detalhes da Estrutura:
- Tabelas a serem apagadas: `booking_equipment`, `bookings`, `equipment`, `settings`.
- Tabelas a serem criadas: `equipment`, `bookings`, `booking_equipment`, `settings` com a estrutura correta para a aplicação.

## Implicações de Segurança:
- RLS Status: Será habilitado em todas as tabelas.
- Policy Changes: Políticas de acesso permissivas serão criadas para a role `anon`, permitindo todas as operações (SELECT, INSERT, UPDATE, DELETE).
*/

-- Apaga as tabelas existentes na ordem correta para evitar erros de chave estrangeira.
DROP TABLE IF EXISTS public.booking_equipment;
DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.equipment;
DROP TABLE IF EXISTS public.settings;

-- Cria a tabela de equipamentos.
CREATE TABLE public.equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    total_quantity integer NOT NULL,
    category text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.equipment FOR ALL USING (true) WITH CHECK (true);

-- Cria a tabela de agendamentos.
CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    full_name text NOT NULL,
    classroom text NOT NULL,
    booking_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text])))
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- Cria a tabela de junção entre agendamentos e equipamentos.
CREATE TABLE public.booking_equipment (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.booking_equipment FOR ALL USING (true) WITH CHECK (true);

-- Cria a tabela de configurações.
CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    setting_key text NOT NULL UNIQUE,
    setting_value text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON public.settings FOR ALL USING (true) WITH CHECK (true);
