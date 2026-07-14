import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Resilient initialization: don't crash if keys are missing
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Helper to format RUT in Chile with dots and hyphen (e.g. 20.551.295-0)
 */
export function formatRut(rutNum: number | string, dig: string): string {
  if (!rutNum) return '';
  const numStr = String(rutNum).replace(/\D/g, '');
  if (!numStr) return '';
  const formattedNum = new Intl.NumberFormat('es-CL').format(parseInt(numStr, 10));
  const cleanDig = String(dig || '').trim().toUpperCase();
  return cleanDig ? `${formattedNum}-${cleanDig}` : formattedNum;
}

/**
 * Helper to parse RUT string back into a numeric RUT and character verifier (DIG)
 */
export function parseRut(rutStr: string): { rut: number; dig: string } {
  const clean = rutStr.replace(/[^0-9kK]/g, '');
  if (clean.length === 0) return { rut: 0, dig: '' };
  
  if (rutStr.includes('-')) {
    const parts = rutStr.split('-');
    const rNum = parseInt(parts[0].replace(/\D/g, ''), 10) || 0;
    const dVal = parts[1].trim().toUpperCase().slice(0, 1);
    return { rut: rNum, dig: dVal };
  }
  
  const dig = clean.slice(-1).toUpperCase();
  const rutNumStr = clean.slice(0, -1);
  const rut = parseInt(rutNumStr, 10) || 0;
  return { rut, dig };
}

/**
 * SQL script for Supabase Database setup.
 * Users can copy and run this in their Supabase SQL Editor.
 */
export const SUPABASE_SETUP_SQL = `-- 1. ELIMINAR TABLA SI YA EXISTE PARA EVITAR CONFLICTOS
DROP TABLE IF EXISTS ESTUDIANTES;

-- 2. CREACIÓN DE LA TABLA CON LOS CAMPOS CORRESPONDIENTES
-- Definimos RUT como PRIMARY KEY para permitir sincronización bidireccional mediante upsert
CREATE TABLE ESTUDIANTES (
    PATERNO VARCHAR(100),
    MATERNO VARCHAR(100),
    NOMBRE VARCHAR(255),
    COHORTE INT,
    RUT INT PRIMARY KEY,
    DIG VARCHAR(1),
    FONOACT VARCHAR(50),
    DIRACTUAL VARCHAR(255),
    COMUNA VARCHAR(100),
    JORNADA VARCHAR(50),
    NOMBRE_C VARCHAR(255),
    CORREO VARCHAR(255),
    CORREO_INSTITUCIONAL VARCHAR(255),
    ESTADO VARCHAR(100)
);

-- 3. HABILITAR SEGURIDAD A NIVEL DE FILAS (OPCIONAL, SE HABILITA ACCESO PÚBLICO SIMPLE)
ALTER TABLE ESTUDIANTES ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir lectura y escritura pública para demo/pruebas
CREATE POLICY "Permitir lectura para todos" ON ESTUDIANTES FOR SELECT USING (true);
CREATE POLICY "Permitir escritura para todos" ON ESTUDIANTES FOR ALL USING (true);

-- 4. INSERCIÓN DE UN REGISTRO DE EJEMPLO
INSERT INTO ESTUDIANTES (
    PATERNO,
    MATERNO,
    NOMBRE,
    COHORTE,
    RUT,
    DIG,
    FONOACT,
    DIRACTUAL,
    COMUNA,
    JORNADA,
    NOMBRE_C,
    CORREO,
    CORREO_INSTITUCIONAL,
    ESTADO
) VALUES (
    'ACUÑA',
    'ACOSTA',
    'FABIOLA CAMILA MADELAYNE',
    2025,
    20551295,
    '0',
    '56942296099',
    'EL TRAPICHE LONGOTOMA SITIO 52',
    'LA LIGUA',
    'D',
    'ESTÉTICA, COSMETOLOGÍA  Y TERAPIAS COMPLEMENTARIAS',
    'Fabiolaacamila02@GMAIL.COM',
    'acuna.fabiolacamilamadelayne@estudiante.cftpucv.cl',
    'NORMAL'
) ON CONFLICT (RUT) DO NOTHING;
`;

