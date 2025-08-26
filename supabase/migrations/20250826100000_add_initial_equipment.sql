/*
          # Inserir Equipamentos Iniciais
          Este script popula a tabela 'equipment' com um conjunto inicial de itens e suas quantidades.

          ## Query Description:
          Esta operação é segura e apenas adiciona novos registros à tabela de equipamentos. Se um equipamento com o mesmo nome já existir, a operação será ignorada para evitar duplicatas, garantindo que não haja perda ou corrupção de dados existentes.

          ## Metadata:
          - Schema-Category: "Data"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true (os registros podem ser removidos manualmente)

          ## Structure Details:
          - Tabela afetada: `equipment`
          - Colunas: `name`, `total_quantity`, `category`

          ## Security Implications:
          - RLS Status: Habilitado (a inserção respeitará as políticas existentes)
          - Policy Changes: Não
          - Auth Requirements: Requer permissão de escrita na tabela `equipment`.

          ## Performance Impact:
          - Indexes: A operação utilizará o índice da chave primária e o índice único no nome do equipamento, se houver.
          - Triggers: Nenhum.
          - Estimated Impact: Mínimo, pois se trata de uma pequena quantidade de inserções.
          */

INSERT INTO public.equipment (name, total_quantity, category)
VALUES
    ('Notebook', 20, 'Informática'),
    ('Tablet', 24, 'Informática'),
    ('Microfone', 2, 'Áudio'),
    ('Caixa de Som', 1, 'Áudio')
ON CONFLICT (name) DO NOTHING;
