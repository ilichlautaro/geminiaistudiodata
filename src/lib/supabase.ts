import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Resilient initialization: don't crash if keys are missing
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * SQL script for Supabase Database setup.
 * Users can copy and run this in their Supabase SQL Editor.
 */
export const SUPABASE_SETUP_SQL = `-- 1. CREATE CAREERS TABLE
CREATE TABLE IF NOT EXISTS careers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  duration_semesters INTEGER NOT NULL,
  subjects TEXT[] NOT NULL,
  color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  bg_light TEXT NOT NULL
);

-- 2. CREATE STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rut TEXT NOT NULL,
  career_id TEXT REFERENCES careers(id) ON DELETE SET NULL,
  semester INTEGER NOT NULL,
  attendance INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Regular', 'Alerta de Riesgo', 'Suspendido', 'Retirado')),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  grades JSONB NOT NULL,
  support_logs TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (Optional, disable or add rules as needed)
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (or customized Auth rules)
CREATE POLICY "Permitir lectura para todos" ON careers FOR SELECT USING (true);
CREATE POLICY "Permitir escritura para todos" ON careers FOR ALL USING (true);
CREATE POLICY "Permitir lectura para todos" ON students FOR SELECT USING (true);
CREATE POLICY "Permitir escritura para todos" ON students FOR ALL USING (true);

-- 4. INSERT DEFAULT CAREERS
INSERT INTO careers (id, name, capacity, duration_semesters, subjects, color, text_color, bg_light)
VALUES 
('MIN', 'Técnico en Minería', 250, 5, ARRAY['Carguío y Transporte', 'Sistemas de Ventilación', 'Prevención de Riesgos', 'Geología General'], 'bg-amber-500', 'text-amber-600', 'bg-amber-50'),
('MEC', 'Téc. Mecánica Automotriz', 220, 5, ARRAY['Motores Combustión', 'Sistemas Transmisión', 'Inyección Electrónica', 'Diagnóstico Computarizado'], 'bg-blue-500', 'text-blue-600', 'bg-blue-50'),
('INF', 'Técnico en Informática', 300, 5, ARRAY['Fundamentos Progra', 'Bases de Datos', 'Sistemas Operativos', 'Desarrollo Web'], 'bg-indigo-500', 'text-indigo-600', 'bg-indigo-50'),
('ENE', 'Téc. Energías Renovables', 180, 5, ARRAY['Sistemas Solares', 'Sistemas Eólicos', 'Eficiencia Energética', 'Redes Inteligentes'], 'bg-emerald-500', 'text-emerald-600', 'bg-emerald-50'),
('ADM', 'Téc. Admin de Empresas', 240, 5, ARRAY['Administración Gral', 'Contabilidad Básica', 'Marketing Digital', 'Recursos Humanos'], 'bg-purple-500', 'text-purple-600', 'bg-purple-50'),
('CON', 'Técnico en Construcción', 190, 5, ARRAY['Materiales de Obra', 'Interpretación Planos', 'Cubicación y Costos', 'Seguridad en Obra'], 'bg-rose-500', 'text-rose-600', 'bg-rose-50')
ON CONFLICT (id) DO NOTHING;
`;
