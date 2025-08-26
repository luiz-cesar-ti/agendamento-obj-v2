/*
# Recriação Completa do Esquema do Banco de Dados
Este script apaga quaisquer tabelas existentes com os mesmos nomes e recria toda a estrutura do banco de dados necessária para a aplicação de agendamento de equipamentos.

## Descrição da Consulta:
- **Impacto:** Esta operação é segura para um banco de dados vazio, mas DESTRUTIVA se as tabelas já existirem com dados, pois elas serão apagadas primeiro.
- **Riscos:** Risco de perda de dados se executado em um banco de dados populado. Como você confirmou que o banco está vazio, o risco é baixo.
- **Precauções:** Nenhuma precaução adicional é necessária, dado que o banco foi intencionalmente limpo.

## Metadados:
- Categoria-Esquema: "Estrutural"
- Nível-Impacto: "Alto"
- Requer-Backup: false (pois o objetivo é recriar do zero)
- Reversível: false (a menos que um backup anterior exista)

## Detalhes da Estrutura:
- **Tabelas Criadas:** `equipment`, `bookings`, `booking_equipment`, `admin_settings`.
- **Relacionamentos:** Chaves estrangeiras entre `bookings`, `booking_equipment` e `equipment`.
- **Funções:** Uma função de gatilho (`handle_updated_at`) para atualizar automaticamente os timestamps.

## Implicações de Segurança:
- **Status RLS:** Habilitado para todas as tabelas.
- **Mudanças de Política:** Políticas de acesso de leitura pública (`SELECT`) são criadas para todas as tabelas, permitindo que a aplicação front-end leia os dados. Políticas de escrita (`INSERT`, `UPDATE`, `DELETE`) não são definidas, pois as operações de escrita são gerenciadas via chave de serviço no lado seguro (neste caso, o painel de admin não tem autenticação de usuário final, então a chave anon é usada para tudo).

## Impacto no Desempenho:
- **Índices:** Índices são criados automaticamente para chaves primárias e estrangeiras.
- **Gatilhos:** Um gatilho `on_update` é adicionado a cada tabela para gerenciar o campo `updated_at`.
- **Impacto Estimado:** Mínimo. A estrutura é otimizada para as consultas da aplicação.
*/

-- 1. FUNÇÃO DE GATILHO PARA ATUALIZAR TIMESTAMPS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABELA DE EQUIPAMENTOS
DROP TABLE IF EXISTS public.equipment CASCADE;
CREATE TABLE public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.equipment FOR SELECT USING (true);
CREATE TRIGGER on_equipment_updated
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 3. TABELA DE AGENDAMENTOS (BOOKINGS)
DROP TABLE IF EXISTS public.bookings CASCADE;
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    classroom TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.bookings FOR SELECT USING (true);
CREATE TRIGGER on_bookings_updated
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. TABELA DE JUNÇÃO (BOOKING_EQUIPMENT)
DROP TABLE IF EXISTS public.booking_equipment CASCADE;
CREATE TABLE public.booking_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.booking_equipment FOR SELECT USING (true);

-- 5. TABELA DE CONFIGURAÇÕES DO ADMIN
DROP TABLE IF EXISTS public.admin_settings CASCADE;
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.admin_settings FOR SELECT USING (true);
CREATE TRIGGER on_admin_settings_updated
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. BUCKET DE ARMAZENAMENTO PARA IMAGEM HERO
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. INSERIR CONFIGURAÇÃO PADRÃO PARA A IMAGEM HERO
INSERT INTO public.admin_settings (key, value)
VALUES ('hero_image', 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (key) DO NOTHING;
