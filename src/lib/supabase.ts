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
export const SUPABASE_SETUP_SQL = `-- 1. ELIMINAR TABLAS SI YA EXISTEN PARA EVITAR CONFLICTOS
DROP TABLE IF EXISTS CALIFICACIONES;
DROP TABLE IF EXISTS ESTUDIANTES;

-- 2. CREACIÓN DE LA TABLA ESTUDIANTES
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
    ESTADO VARCHAR(100),
    SITUACION VARCHAR(100)
);

-- 3. CREACIÓN DE LA TABLA CALIFICACIONES
CREATE TABLE CALIFICACIONES (
    ID SERIAL PRIMARY KEY,
    NUMERO INT,
    ANO INT,
    PERIODO INT,
    CODCLI VARCHAR(100),
    RUT INT,
    NOMBRE_ALUMNO VARCHAR(255),
    ANO_INGRESO INT,
    CAT_ALUMNO VARCHAR(100),
    ESTADO_ALUMNO VARCHAR(100),
    COD_SEDE VARCHAR(50),
    NOMBRE_SEDE VARCHAR(255),
    CARRERA_ALUM VARCHAR(50),
    NOMBRE_CARRERA_ALUMNO VARCHAR(255),
    REGIMEN_CARRERA_ALUMNO VARCHAR(100),
    CODCARR_PLANIFICADA VARCHAR(50),
    NOMBRE_CARRERA_PLANIFICADA VARCHAR(255),
    JORNADA VARCHAR(50),
    RUT_PROF VARCHAR(50),
    NOMBRE_PROF VARCHAR(255),
    NIVEL INT,
    COD_CURSO VARCHAR(100),
    NOMBRE_CURSO VARCHAR(255),
    SECCION VARCHAR(50),
    ACTIVIDAD VARCHAR(100),
    NUM_NOTA INT,
    NOTA_PARCIAL NUMERIC(3,1),
    NOTA_FINAL_CURSO NUMERIC(3,1),
    PORCENTAJE_ASISTENCIA INT
);

-- 4. HABILITAR SEGURIDAD A NIVEL DE FILAS (RLS)
ALTER TABLE ESTUDIANTES ENABLE ROW LEVEL SECURITY;
ALTER TABLE CALIFICACIONES ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir lectura y escritura pública para demo/pruebas
CREATE POLICY "Permitir lectura para todos ESTUDIANTES" ON ESTUDIANTES FOR SELECT USING (true);
CREATE POLICY "Permitir escritura para todos ESTUDIANTES" ON ESTUDIANTES FOR ALL USING (true);

CREATE POLICY "Permitir lectura para todos CALIFICACIONES" ON CALIFICACIONES FOR SELECT USING (true);
CREATE POLICY "Permitir escritura para todos CALIFICACIONES" ON CALIFICACIONES FOR ALL USING (true);

-- 5. INSERCIÓN DE REGISTRO DE EJEMPLO DE ESTUDIANTES
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
    ESTADO,
    SITUACION
) VALUES (
    'VERDUGO',
    'ZAMORA',
    'KATIA PRISCILA',
    2025,
    20023539,
    '7',
    '+56911728512',
    'AVENIDA VALPARAISO 123',
    'LA LIGUA',
    'D',
    'ADMINISTRACIÓN DE EMPRESAS',
    'katia.verdugo@estudiante.cftpucv.cl',
    'katia.verdugo@estudiante.cftpucv.cl',
    'NORMAL',
    'VIGENTE'
) ON CONFLICT (RUT) DO NOTHING;

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
    ESTADO,
    SITUACION
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
    'ESTÉTICA, COSMETOLOGÍA Y TERAPIAS COMPLEMENTARIAS',
    'Fabiolaacamila02@GMAIL.COM',
    'acuna.fabiolacamilamadelayne@estudiante.cftpucv.cl',
    'NORMAL',
    'REGULAR'
) ON CONFLICT (RUT) DO NOTHING;

-- 6. INSERCIÓN DE REGISTRO DE EJEMPLO DE CALIFICACIONES
INSERT INTO CALIFICACIONES (
    NUMERO, ANO, PERIODO, CODCLI, RUT, NOMBRE_ALUMNO, ANO_INGRESO, CAT_ALUMNO, ESTADO_ALUMNO, COD_SEDE, NOMBRE_SEDE, CARRERA_ALUM, NOMBRE_CARRERA_ALUMNO, REGIMEN_CARRERA_ALUMNO, CODCARR_PLANIFICADA, NOMBRE_CARRERA_PLANIFICADA, JORNADA, RUT_PROF, NOMBRE_PROF, NIVEL, COD_CURSO, NOMBRE_CURSO, SECCION, ACTIVIDAD, NUM_NOTA, NOTA_PARCIAL, NOTA_FINAL_CURSO, PORCENTAJE_ASISTENCIA
) VALUES (
    1, 2026, 1, '20251LGADM006', 20023539, 'VERDUGO ZAMORA KATIA PRISCILA', 2025, 'NORMAL', 'VIGENTE', 'LG', 'LA LIGUA', 'LGADM', 'ADMINISTRACIÓN DE EMPRESAS', 'SEMESTRAL', 'LGADM', 'ADMINISTRACIÓN DE EMPRESAS', 'D', '11728512', 'SANTANDER OLIVARES MAURICIO ADOLFO', 3, 'ADM301', 'GESTIÓN DE PERSONAS', '1', 'EVALUACION1', 1, 4.5, 4.9, 94
);
`;

