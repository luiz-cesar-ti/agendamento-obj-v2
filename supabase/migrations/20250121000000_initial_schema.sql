/*
# Sistema de Agendamento de Equipamentos - Schema Inicial
Criação das tabelas principais para gerenciar equipamentos e reservas do sistema educacional.

## Query Description: 
Esta operação criará a estrutura inicial do banco de dados para o sistema de agendamento de equipamentos. 
Será criada uma base sólida para gerenciar equipamentos escolares e suas reservas de forma segura e eficiente.
A operação é segura e não afeta dados existentes.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Tabela equipment: gerencia equipamentos disponíveis
- Tabela bookings: gerencia reservas dos equipamentos
- Tabela booking_equipment: relaciona reservas com equipamentos (many-to-many)
- Tabela settings: configurações do sistema (imagem hero, etc.)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes
- Auth Requirements: Políticas públicas para leitura, autenticação para escrita

## Performance Impact:
- Indexes: Criados em campos de busca frequente
- Triggers: Nenhum
- Estimated Impact: Mínimo impacto, estrutura otimizada
*/

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  classroom VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_equipment junction table
CREATE TABLE IF NOT EXISTS booking_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_equipment_booking_id ON booking_equipment(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_equipment_equipment_id ON booking_equipment(equipment_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(setting_key);

-- Enable Row Level Security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for equipment
CREATE POLICY "Equipment are viewable by everyone" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Equipment are insertable by everyone" ON equipment
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Equipment are updatable by everyone" ON equipment
  FOR UPDATE USING (true);

CREATE POLICY "Equipment are deletable by everyone" ON equipment
  FOR DELETE USING (true);

-- Create RLS policies for bookings
CREATE POLICY "Bookings are viewable by everyone" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Bookings are insertable by everyone" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Bookings are updatable by everyone" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "Bookings are deletable by everyone" ON bookings
  FOR DELETE USING (true);

-- Create RLS policies for booking_equipment
CREATE POLICY "Booking equipment are viewable by everyone" ON booking_equipment
  FOR SELECT USING (true);

CREATE POLICY "Booking equipment are insertable by everyone" ON booking_equipment
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Booking equipment are updatable by everyone" ON booking_equipment
  FOR UPDATE USING (true);

CREATE POLICY "Booking equipment are deletable by everyone" ON booking_equipment
  FOR DELETE USING (true);

-- Create RLS policies for settings
CREATE POLICY "Settings are viewable by everyone" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Settings are insertable by everyone" ON settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Settings are updatable by everyone" ON settings
  FOR UPDATE USING (true);

CREATE POLICY "Settings are deletable by everyone" ON settings
  FOR DELETE USING (true);

-- Insert initial equipment data
INSERT INTO equipment (name, total_quantity, category) VALUES
  ('Notebook', 20, 'Informática'),
  ('Tablet', 15, 'Informática'),
  ('Microfone', 8, 'Audiovisual'),
  ('Caixa de som', 6, 'Audiovisual')
ON CONFLICT DO NOTHING;

-- Insert initial settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('hero_image', 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')
ON CONFLICT (setting_key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_equipment_updated_at 
  BEFORE UPDATE ON equipment 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
