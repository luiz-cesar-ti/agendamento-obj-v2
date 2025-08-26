/*
# [FIX & SEED] Adicionar constraint UNIQUE e popular equipamentos
Este script corrige a estrutura da tabela 'equipment' e insere os dados iniciais.

## Descrição da Query:
1.  **ALTER TABLE**: Adiciona uma restrição UNIQUE na coluna 'name' da tabela 'equipment'. Isso garante que não haverá dois equipamentos com o mesmo nome e corrige o erro 'ON CONFLICT' da migração anterior.
2.  **INSERT ... ON CONFLICT**: Insere a lista de equipamentos (Notebook, Tablet, etc.) no banco de dados. A cláusula 'ON CONFLICT' previne a inserção de duplicatas se o script for executado múltiplas vezes.

## Metadados:
- Categoria do Schema: ["Estrutural", "Dados"]
- Nível de Impacto: ["Baixo"]
- Requer Backup: false
- Reversível: true (a constraint pode ser removida e os dados deletados)

## Detalhes da Estrutura:
- Tabela Afetada: public.equipment
- Coluna Afetada: name (adiciona constraint UNIQUE)

## Implicações de Segurança:
- Status RLS: Mantido (Habilitado)
- Mudanças de Política: Não
- Requisitos de Autenticação: Não

## Impacto de Performance:
- Índices: Adiciona um novo índice UNIQUE na coluna 'name', o que pode melhorar a performance de buscas por nome.
- Triggers: Nenhum
- Impacto Estimado: Mínimo. A adição do índice é rápida em tabelas pequenas.
*/

-- Adiciona a restrição UNIQUE à coluna 'name' para corrigir o erro ON CONFLICT.
-- Isso garante que cada equipamento tenha um nome único.
ALTER TABLE public.equipment
ADD CONSTRAINT equipment_name_key UNIQUE (name);

-- Insere os equipamentos iniciais, evitando duplicatas caso o script seja executado novamente.
INSERT INTO public.equipment (name, total_quantity, category)
VALUES
    ('Notebook', 20, 'Eletrônicos'),
    ('Tablet', 24, 'Eletrônicos'),
    ('Microfone', 2, 'Áudio'),
    ('Caixa de Som', 1, 'Áudio')
ON CONFLICT (name) DO NOTHING;
