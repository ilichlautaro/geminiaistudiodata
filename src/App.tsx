import React, { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  TrendingDown, 
  Award, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Check, 
  Download, 
  UserPlus, 
  Edit3, 
  AlertTriangle, 
  GraduationCap, 
  Sparkles, 
  Calculator, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Printer,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Database,
  CloudLightning,
  RefreshCw,
  Copy
} from 'lucide-react';
import { supabase, isSupabaseConfigured, SUPABASE_SETUP_SQL, formatRut, parseRut } from './lib/supabase';

// Color palettes for dynamically generated careers from database
const COLOR_PALETTES = [
  { color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
  { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
  { color: 'bg-indigo-500', textColor: 'text-indigo-600', bgLight: 'bg-indigo-50' },
  { color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
  { color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50' },
  { color: 'bg-rose-500', textColor: 'text-rose-600', bgLight: 'bg-rose-50' },
  { color: 'bg-teal-500', textColor: 'text-teal-600', bgLight: 'bg-teal-50' },
  { color: 'bg-cyan-500', textColor: 'text-cyan-600', bgLight: 'bg-cyan-50' },
  { color: 'bg-violet-500', textColor: 'text-violet-600', bgLight: 'bg-violet-50' },
  { color: 'bg-fuchsia-500', textColor: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50' },
  { color: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-50' },
];


// Types & interfaces
interface SubjectGrades {
  [subjectName: string]: number;
}

interface Qualification {
  NUMERO: number;
  ANO: number;
  PERIODO: number;
  CODCLI: string;
  RUT: number;
  NOMBRE_ALUMNO: string;
  ANO_INGRESO: number;
  CAT_ALUMNO: string;
  ESTADO_ALUMNO: string;
  COD_SEDE: string;
  NOMBRE_SEDE: string;
  CARRERA_ALUM: string;
  NOMBRE_CARRERA_ALUMNO: string;
  REGIMEN_CARRERA_ALUMNO: string;
  CODCARR_PLANIFICADA: string;
  NOMBRE_CARRERA_PLANIFICADA: string;
  JORNADA: string;
  RUT_PROF: string;
  NOMBRE_PROF: string;
  NIVEL: number;
  COD_CURSO: string;
  NOMBRE_CURSO: string;
  SECCION: string;
  ACTIVIDAD: string;
  NUM_NOTA: number;
  NOTA_PARCIAL: number;
  NOTA_FINAL_CURSO: number;
  PORCENTAJE_ASISTENCIA: number;
}

interface Student {
  id: string;
  name: string;
  rut: string;
  careerId: string;
  semester: number;
  attendance: number;
  status: 'Regular' | 'Alerta de Riesgo' | 'Suspendido' | 'Retirado';
  grades: SubjectGrades;
  email: string;
  personalEmail?: string;
  phone: string;
  supportLogs: string[];
  situacion?: string;
}

interface Career {
  id: string;
  name: string;
  capacity: number;
  durationSemesters: number;
  subjects: string[];
  color: string;
  textColor: string;
  bgLight: string;
}

// CFT Careers
const CAREERS: Career[] = [
  {
    id: 'LGADM',
    name: 'ADMINISTRACIÓN DE EMPRESAS',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Contabilidad General', 'Gestión de Personas', 'Marketing', 'Taller Integrado'],
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50'
  },
  {
    id: 'LGEST',
    name: 'ESTÉTICA, COSMETOLOGÍA Y TERAPIAS COMPLEMENTARIAS',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Cosmetología Aplicada', 'Masoterapia', 'Terapias Holísticas', 'Taller de Estética'],
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50'
  },
  {
    id: 'INF',
    name: 'COMPUTACIÓN E INFORMÁTICA',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Programación Web', 'Bases de Datos', 'Soporte TI', 'Taller Integrado Software'],
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50'
  },
  {
    id: 'LGENF',
    name: 'TÉCNICO EN ENFERMERÍA',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Fundamentos de Enfermería', 'Primeros Auxilios', 'Farmacología Clínica', 'Práctica de Simulación'],
    color: 'bg-rose-500',
    textColor: 'text-rose-600',
    bgLight: 'bg-rose-50'
  },
  {
    id: 'LGPARV',
    name: 'EDUCACIÓN PARVULARIA',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Desarrollo Infantil', 'Planificación Didáctica', 'Taller Infantil', 'Práctica Parvularia'],
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50'
  },
  {
    id: 'LGTS',
    name: 'TRABAJO SOCIAL',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Políticas Sociales', 'Metodología de Intervención', 'Taller Comunitario', 'Ética Profesional'],
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50'
  },
  {
    id: 'LGMIN',
    name: 'OPERACIONES MINERAS',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Geología General', 'Explotación de Minas', 'Seguridad Minera', 'Taller de Faena'],
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50'
  },
  {
    id: 'LGCONS',
    name: 'CONSTRUCCIÓN',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Materiales de Construcción', 'Interpretación de Planos', 'Prevención de Riesgos', 'Taller de Obra'],
    color: 'bg-teal-500',
    textColor: 'text-teal-600',
    bgLight: 'bg-teal-50'
  },
  {
    id: 'LGLOG',
    name: 'LOGÍSTICA',
    capacity: 100,
    durationSemesters: 5,
    subjects: ['Gestión de Inventarios', 'Canales de Distribución', 'Administración de Bodegas', 'Taller de Logística'],
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    bgLight: 'bg-cyan-50'
  }
];

// Seed Students with realistic Chilean names & RUTs
const INITIAL_STUDENTS: Student[] = [];

// Helper to calculate student GPA
function calculateGPA(grades: SubjectGrades): number {
  const values = Object.values(grades);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

// Helper to format WhatsApp link
function getWhatsAppLink(phoneStr: string): string {
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.startsWith('56')) {
    return `https://wa.me/${cleaned}`;
  }
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `https://wa.me/56${cleaned}`;
  }
  return `https://wa.me/${cleaned}`;
}

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'carreras' | 'estudiantes' | 'reportes' | 'desercion'>('dashboard');
  
  // App-wide state
  const [students, setStudents] = useState<Student[]>([]);
  const [careersList, setCareersList] = useState<Career[]>(CAREERS);
  const [desercionSearch, setDesercionSearch] = useState('');
  const [desercionCareerFilter, setDesercionCareerFilter] = useState('ALL');

  // Qualifications (Calificaciones) state loaded from Supabase database
  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  const [isImportGradesModalOpen, setIsImportGradesModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Qualification[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase Syncing and UI Helper States
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Dynamic DB table and key casing references to support unquoted lowercased schemas or double-quoted uppercased schemas resiliently
  const dbTableRef = useRef<string>('estudiantes');
  const dbKeysCaseRef = useRef<'lower' | 'upper'>('lower');

  // Local overrides disabled - strictly using data extracted from Supabase
  const getLocalOverride = (studentId: string) => {
    return null;
  };

  const saveLocalOverride = (studentId: string, data: any) => {
    // Disabled to strictly prioritize Supabase-only persistence
  };

  // Helper to get field case-insensitively (supports both UPPERCASE and lowercase keys)
  const getFieldVal = (obj: any, keyUpper: string) => {
    if (!obj) return undefined;
    return obj[keyUpper] !== undefined ? obj[keyUpper] : obj[keyUpper.toLowerCase()];
  };

  // Data mapping helper functions for ESTUDIANTES table
  const mapDbStudentToJs = (dbStudent: any, customCareers?: Career[]): Student => {
    const currentCareers = customCareers || careersList;
    const paterno = getFieldVal(dbStudent, 'PATERNO') || '';
    const materno = getFieldVal(dbStudent, 'MATERNO') || '';
    const nombres = getFieldVal(dbStudent, 'NOMBRE') || '';
    const cohorte = parseInt(getFieldVal(dbStudent, 'COHORTE'), 10) || 2025;
    const rutNum = parseInt(getFieldVal(dbStudent, 'RUT'), 10) || 0;
    const dig = getFieldVal(dbStudent, 'DIG') || '';
    const fono = getFieldVal(dbStudent, 'FONOACT') || '';
    const dir = getFieldVal(dbStudent, 'DIRACTUAL') || '';
    const comuna = getFieldVal(dbStudent, 'COMUNA') || '';
    const jornada = getFieldVal(dbStudent, 'JORNADA') || 'D';
    const nombreC = getFieldVal(dbStudent, 'NOMBRE_C') || '';
    const correo = getFieldVal(dbStudent, 'CORREO') || '';
    const correoInst = getFieldVal(dbStudent, 'CORREO_INSTITUCIONAL') || '';
    const estado = getFieldVal(dbStudent, 'ESTADO') || 'NORMAL';
    const situacion = getFieldVal(dbStudent, 'SITUACION') || '';

    // Format full name
    const fullName = [nombres, paterno, materno].map(s => String(s).trim()).filter(Boolean).join(' ');

    // Format RUT (dots and hyphen)
    const formattedRut = formatRut(rutNum, dig);

    // Map ESTADO & SITUACION to UI status
    let status: Student['status'] = 'Regular';
    const cleanEstado = String(estado).toUpperCase().trim();
    const cleanSituacion = String(situacion).toUpperCase().trim();

    if (
      cleanSituacion === 'DESERTOR' || 
      cleanSituacion === 'DESERCIÓN' || 
      cleanSituacion === 'DESERCION' || 
      cleanSituacion.includes('DESER') || 
      cleanSituacion === 'RETIRADO' || 
      cleanEstado === 'RETIRADO' || 
      cleanEstado === 'ELIMINADO' || 
      cleanEstado === 'BAJA'
    ) {
      status = 'Retirado';
    } else if (cleanEstado === 'ALERTA' || cleanEstado === 'ALERTA DE RIESGO' || cleanEstado === 'RIESGO') {
      status = 'Alerta de Riesgo';
    } else if (cleanEstado === 'SUSPENDIDO') {
      status = 'Suspendido';
    }

    // Resolve or extract career ID
    const cleanCareerName = String(nombreC).trim();
    let careerId = 'INF'; // Default fallback
    if (cleanCareerName) {
      const matched = currentCareers.find(c => c.name.toLowerCase() === cleanCareerName.toLowerCase() || c.id.toLowerCase() === cleanCareerName.toLowerCase());
      if (matched) {
        careerId = matched.id;
      } else {
        // Derive unique ID from name
        const words = cleanCareerName.split(/\s+/).filter(w => w.length > 2);
        let derivedId = '';
        if (words.length >= 2) {
          derivedId = (words[0][0] + words[1][0] + (words[2] ? words[2][0] : words[0][1])).toUpperCase();
        } else if (cleanCareerName.length >= 3) {
          derivedId = cleanCareerName.slice(0, 3).toUpperCase();
        } else {
          derivedId = cleanCareerName.toUpperCase();
        }
        
        // Ensure uniqueness among predefined careers
        let uniqueId = derivedId;
        let suffix = 1;
        while (currentCareers.some(c => c.id === uniqueId)) {
          uniqueId = `${derivedId}${suffix}`;
          suffix++;
        }
        careerId = uniqueId;
      }
    }

    // Semester derived from Cohort
    const currentYear = 2026;
    const diff = currentYear - cohorte;
    let semester = 1;
    if (diff === 1) {
      semester = 3;
    } else if (diff >= 2) {
      semester = 5;
    }

    // Generate stable base attendance and grades based on RUT
    const seedNum = rutNum || 100;
    const baseAttendance = 70 + (seedNum % 28); // stable percentage between 70% and 98%

    const matchedCareer = currentCareers.find(c => c.id === careerId);
    const subjects = matchedCareer ? matchedCareer.subjects : ['Rendimiento Gral', 'Evaluación Continua', 'Taller Integrado'];
    
    const baseGrades: SubjectGrades = {};
    subjects.forEach((subj, idx) => {
      const base = 4.0 + ((seedNum + idx * 7) % 31) / 10; // stable grades between 4.0 and 7.0
      baseGrades[subj] = Math.round(base * 10) / 10;
    });

    const mapped: Student = {
      id: String(rutNum),
      name: fullName,
      rut: formattedRut,
      careerId,
      semester,
      attendance: baseAttendance,
      status,
      grades: baseGrades,
      email: correoInst || correo || 'estudiante@cftpucv.cl',
      personalEmail: correo || '',
      phone: fono || '+56 9 0000 0000',
      supportLogs: [],
      situacion: situacion || estado || 'NORMAL'
    };

    // Blend overrides (customized grades, attendance, etc. edited in UI)
    const override = getLocalOverride(mapped.id);
    if (override) {
      if (override.grades) mapped.grades = { ...mapped.grades, ...override.grades };
      if (override.attendance !== undefined) mapped.attendance = override.attendance;
      if (override.supportLogs) mapped.supportLogs = override.supportLogs;
      if (override.status) mapped.status = override.status;
    }

    return mapped;
  };

  const mapJsStudentToDb = (s: Student) => {
    const { rut, dig } = parseRut(s.rut);
    
    // Split full name into NOMBRE, PATERNO, MATERNO
    const words = s.name.trim().split(/\s+/);
    let nombres = '';
    let paterno = '';
    let materno = '';
    
    if (words.length >= 3) {
      materno = words[words.length - 1];
      paterno = words[words.length - 2];
      nombres = words.slice(0, words.length - 2).join(' ');
    } else if (words.length === 2) {
      paterno = words[1];
      nombres = words[0];
    } else if (words.length === 1) {
      nombres = words[0];
    }

    // Determine carrier name
    const matchedCareer = careersList.find(c => c.id === s.careerId);
    const nombreC = matchedCareer ? matchedCareer.name : 'Técnico en Informática';

    // Map JS status back to ESTADO and SITUACION
    let estado = 'NORMAL';
    let situacion = s.situacion || 'REGULAR';
    if (s.status === 'Alerta de Riesgo') {
      estado = 'ALERTA';
    } else if (s.status === 'Suspendido') {
      estado = 'SUSPENDIDO';
    } else if (s.status === 'Retirado') {
      estado = 'RETIRADO';
      situacion = 'DESERTOR';
    }

    // Calculate cohorte based on semester
    const currentYear = 2026;
    let cohorte = currentYear;
    if (s.semester >= 5) {
      cohorte = currentYear - 2;
    } else if (s.semester >= 3) {
      cohorte = currentYear - 1;
    } else {
      cohorte = currentYear;
    }

    return {
      PATERNO: paterno.toUpperCase(),
      MATERNO: materno.toUpperCase(),
      NOMBRE: nombres.toUpperCase(),
      COHORTE: cohorte,
      RUT: rut,
      DIG: dig,
      FONOACT: s.phone,
      DIRACTUAL: 'EL TRAPICHE LONGOTOMA SITIO 52',
      COMUNA: 'LA LIGUA',
      JORNADA: 'D',
      NOMBRE_C: nombreC,
      CORREO: s.email,
      CORREO_INSTITUCIONAL: s.email,
      ESTADO: estado,
      SITUACION: situacion
    };
  };

  const mapJsStudentToDbWithCase = (s: Student, kCase: 'lower' | 'upper') => {
    const raw = mapJsStudentToDb(s);
    if (kCase === 'upper') {
      return raw;
    }
    const lowered: any = {};
    Object.entries(raw).forEach(([k, v]) => {
      lowered[k.toLowerCase()] = v;
    });
    return lowered;
  };

  // Fetch and Sync with Supabase on mount
  useEffect(() => {
    async function syncWithSupabase() {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase no configurado. Utilizando base de datos local en memoria.");
        return;
      }

      setIsSyncing(true);
      setSupabaseError(null);

      try {
        let dbStudents: any[] = [];
        let finalTable = 'estudiantes';
        let keysCase: 'lower' | 'upper' = 'lower';

        // Try querying lowercase 'estudiantes' first
        const { data: lowerData, error: lowerError } = await supabase
          .from('estudiantes')
          .select('*');

        if (!lowerError) {
          finalTable = 'estudiantes';
          dbStudents = lowerData || [];
          if (lowerData && lowerData.length > 0) {
            const keys = Object.keys(lowerData[0]);
            const hasUpper = keys.some(k => k === 'RUT' || k === 'PATERNO');
            keysCase = hasUpper ? 'upper' : 'lower';
          }
        } else {
          // Try uppercase 'ESTUDIANTES'
          const { data: upperData, error: upperError } = await supabase
            .from('ESTUDIANTES')
            .select('*');

          if (!upperError) {
            finalTable = 'ESTUDIANTES';
            dbStudents = upperData || [];
            if (upperData && upperData.length > 0) {
              const keys = Object.keys(upperData[0]);
              const hasUpper = keys.some(k => k === 'RUT' || k === 'PATERNO');
              keysCase = hasUpper ? 'upper' : 'lower';
            }
          } else {
            // Both failed, throw the lower error
            throw lowerError;
          }
        }

        dbTableRef.current = finalTable;
        dbKeysCaseRef.current = keysCase;

        let activeStudents = dbStudents || [];

        // If no students exist, seed them in the new schema format
        if (activeStudents.length === 0) {
          console.log(`Sembrando estudiantes iniciales en la tabla ${finalTable} de Supabase...`);
          const dbSeedStudents = INITIAL_STUDENTS.map(s => mapJsStudentToDbWithCase(s, keysCase));
          
          const { error: seedStudentsError } = await supabase
            .from(finalTable)
            .insert(dbSeedStudents);

          if (seedStudentsError) throw seedStudentsError;
          activeStudents = dbSeedStudents;
        }

        // Dynamically build and colorize catalog of careers based on NOMBRE_C values found in the database
        const uniqueCareersInDb = Array.from(new Set(
          activeStudents.map((s: any) => {
            return String(getFieldVal(s, 'NOMBRE_C') || '').trim();
          }).filter(Boolean)
        ));

        let updatedCareers = [...CAREERS];
        uniqueCareersInDb.forEach((cName) => {
          const exists = updatedCareers.some(c => c.name.toLowerCase() === cName.toLowerCase() || c.id.toLowerCase() === cName.toLowerCase());
          if (!exists) {
            // Generate a unique ID
            const words = cName.split(/\s+/).filter(w => w.length > 2);
            let derivedId = '';
            if (words.length >= 2) {
              derivedId = (words[0][0] + words[1][0] + (words[2] ? words[2][0] : words[0][1])).toUpperCase();
            } else if (cName.length >= 3) {
              derivedId = cName.slice(0, 3).toUpperCase();
            } else {
              derivedId = cName.toUpperCase();
            }
            
            // Ensure uniqueness
            let uniqueId = derivedId;
            let suffix = 1;
            while (updatedCareers.some(c => c.id === uniqueId)) {
              uniqueId = `${derivedId}${suffix}`;
              suffix++;
            }

            const palette = COLOR_PALETTES[updatedCareers.length % COLOR_PALETTES.length];

            updatedCareers.push({
              id: uniqueId,
              name: cName,
              capacity: 100,
              durationSemesters: 5,
              subjects: ['Rendimiento Gral', 'Evaluación Continua', 'Taller Integrado'],
              ...palette
            });
          }
        });
        setCareersList(updatedCareers);

        // Convert the database entries to JavaScript students
        const jsStudents = activeStudents.map(s => mapDbStudentToJs(s, updatedCareers));
        setStudents(jsStudents);

        // Fetch qualifications from Supabase
        try {
          let loaded = false;
          // Try 'Calificaciones' (capital C) first as requested
          const { data: qDataTitle, error: qErrorTitle } = await supabase
            .from('Calificaciones')
            .select('*');
          if (!qErrorTitle && qDataTitle) {
            setQualifications(qDataTitle);
            loaded = true;
          }

          if (!loaded) {
            // Try lowercase 'calificaciones'
            const { data: qData, error: qError } = await supabase
              .from('calificaciones')
              .select('*');
            if (!qError && qData) {
              setQualifications(qData);
              loaded = true;
            }
          }

          if (!loaded) {
            // Try uppercase 'CALIFICACIONES'
            const { data: qUpperData, error: qUpperError } = await supabase
              .from('CALIFICACIONES')
              .select('*');
            if (!qUpperError && qUpperData) {
              setQualifications(qUpperData);
              loaded = true;
            }
          }
        } catch (qe) {
          console.error("Error al cargar calificaciones desde Supabase:", qe);
        }

        console.log(`Datos sincronizados exitosamente con Supabase (tabla ${finalTable}, llaves ${keysCase}).`);
      } catch (err: any) {
        console.error("Error al sincronizar con Supabase:", err);
        let errorMsg = "";
        if (err && typeof err === 'object') {
          errorMsg = err.message || err.details || JSON.stringify(err);
        } else {
          errorMsg = String(err);
        }

        // Add user-friendly prompt if table doesn't exist
        if (errorMsg.includes('relation') && errorMsg.includes('does not exist')) {
          errorMsg = "Tablas no encontradas en Supabase (ejecute el script SQL)";
        } else if (errorMsg.includes('42P01')) {
          errorMsg = "Faltan las tablas en Supabase (ejecute el script SQL)";
        } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('network')) {
          errorMsg = "Error de red/conexión con Supabase. Revise sus credenciales.";
        }
        
        setSupabaseError(errorMsg);
      } finally {
        setIsSyncing(false);
      }
    }

    syncWithSupabase();
  }, []);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareerFilter, setSelectedCareerFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('ALL');

  // Interactive Chart Options (Tablero)
  const [dashboardChartMetric, setDashboardChartMetric] = useState<'students' | 'gpa' | 'dropout'>('students');

  // Selected Student for view/edit drawer
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // AI WhatsApp Message Generator states
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [aiMessageError, setAiMessageError] = useState<string | null>(null);

  useEffect(() => {
    setAiPrompt('');
    setGeneratedMessage('');
    setIsGeneratingMessage(false);
    setAiMessageError(null);
  }, [selectedStudentId]);

  const handleGenerateWhatsAppMessage = async (student: Student) => {
    if (!aiPrompt.trim()) {
      setAiMessageError('Por favor ingrese un tema o instrucción para generar el mensaje.');
      return;
    }
    setIsGeneratingMessage(true);
    setAiMessageError(null);
    setGeneratedMessage('');

    try {
      const careerName = careersList.find(c => c.id === student.careerId)?.name || '';
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          studentName: student.name,
          careerName: careerName,
          additionalContext: `Asistencia: ${student.attendance}%, Promedio: ${calculateGPA(student.grades)}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al conectar con el servidor de IA.');
      }

      const data = await response.json();
      if (data.text) {
        setGeneratedMessage(data.text);
      } else {
        throw new Error('La IA no devolvió ningún mensaje.');
      }
    } catch (err: any) {
      console.error('Error generating AI message:', err);
      setAiMessageError(err.message || 'Error al generar el mensaje. Inténtelo de nuevo.');
    } finally {
      setIsGeneratingMessage(false);
    }
  };
  
  // Modals / Editors triggers
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [isReportPrinterPreviewOpen, setIsReportPrinterPreviewOpen] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRut, setNewStudentRut] = useState('');
  const [newStudentCareer, setNewStudentCareer] = useState('');
  const [newStudentSemester, setNewStudentSemester] = useState(1);
  const [newStudentAttendance, setNewStudentAttendance] = useState(100);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentGrades, setNewStudentGrades] = useState<SubjectGrades>({});

  // Auto-select first career from loaded database list
  useEffect(() => {
    if (!newStudentCareer && careersList.length > 0) {
      setNewStudentCareer(careersList[0].id);
    }
  }, [careersList, newStudentCareer]);

  // Helper to get real grades and attendance from qualifications
  const getStudentRealGradesAndAttendance = (studentRut: string, fallbackGrades: SubjectGrades, fallbackAttendance: number) => {
    const sRut = parseRut(studentRut).rut;
    const studentQuals = qualifications.filter(q => {
      const qRut = typeof q.RUT === 'number' ? q.RUT : parseInt(String(q.RUT).replace(/\D/g, ''), 10);
      return qRut === sRut;
    });

    if (studentQuals.length === 0) {
      return { grades: fallbackGrades, attendance: fallbackAttendance, hasRealData: false };
    }

    const courseGrades: SubjectGrades = {};
    const courseAttendance: number[] = [];

    studentQuals.forEach(q => {
      const courseName = q.NOMBRE_CURSO || 'Curso';
      if (q.NOTA_FINAL_CURSO) {
        courseGrades[courseName] = Number(q.NOTA_FINAL_CURSO);
      } else if (q.NOTA_PARCIAL && !courseGrades[courseName]) {
        courseGrades[courseName] = Number(q.NOTA_PARCIAL);
      }
      
      if (q.PORCENTAJE_ASISTENCIA !== undefined && q.PORCENTAJE_ASISTENCIA !== null) {
        courseAttendance.push(Number(q.PORCENTAJE_ASISTENCIA));
      }
    });

    const finalGrades = Object.keys(courseGrades).length > 0 ? courseGrades : fallbackGrades;
    const finalAttendance = courseAttendance.length > 0 
      ? Math.round(courseAttendance.reduce((a, b) => a + b, 0) / courseAttendance.length) 
      : fallbackAttendance;

    return { grades: finalGrades, attendance: finalAttendance, hasRealData: true };
  };

  const resolvedStudents = useMemo(() => {
    return students.map(s => {
      const { grades, attendance, hasRealData } = getStudentRealGradesAndAttendance(s.rut, s.grades, s.attendance);
      return {
        ...s,
        grades,
        attendance,
        hasRealData
      };
    });
  }, [students, qualifications]);

  // Dynamic calculations based on state
  const totalEnrolled = useMemo(() => {
    return resolvedStudents.filter(s => s.status !== 'Retirado').length;
  }, [resolvedStudents]);

  const totalDeserted = useMemo(() => {
    return resolvedStudents.filter(s => s.status === 'Retirado').length;
  }, [resolvedStudents]);

  const overallDropoutRate = useMemo(() => {
    const totalCount = resolvedStudents.length;
    if (totalCount === 0) return 0;
    return Math.round((totalDeserted / totalCount) * 1000) / 10;
  }, [resolvedStudents, totalDeserted]);

  const overallAverageGPA = useMemo(() => {
    const activeStudents = resolvedStudents.filter(s => s.status !== 'Retirado');
    if (activeStudents.length === 0) return 0;
    const totalSum = activeStudents.reduce((sum, s) => sum + calculateGPA(s.grades), 0);
    return Math.round((totalSum / activeStudents.length) * 10) / 10;
  }, [resolvedStudents]);

  const studentsAtRiskCount = useMemo(() => {
    return resolvedStudents.filter(s => s.status === 'Alerta de Riesgo').length;
  }, [resolvedStudents]);

  // Top Promedios (Outstanding students list)
  const topStudents = useMemo(() => {
    return [...resolvedStudents]
      .filter(s => s.status === 'Regular')
      .map(s => ({ ...s, gpa: calculateGPA(s.grades) }))
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 5);
  }, [resolvedStudents]);

  // Career specific consolidated statistics
  const careerStats = useMemo(() => {
    return careersList.map(career => {
      const careerStudents = resolvedStudents.filter(s => s.careerId === career.id);
      const active = careerStudents.filter(s => s.status !== 'Retirado');
      const withdrawn = careerStudents.filter(s => s.status === 'Retirado');
      const totalCount = careerStudents.length;

      const dropoutRate = totalCount > 0 ? Math.round((withdrawn.length / totalCount) * 100) : 0;
      
      const totalGpaSum = active.reduce((acc, s) => acc + calculateGPA(s.grades), 0);
      const avgGpa = active.length > 0 ? Math.round((totalGpaSum / active.length) * 10) / 10 : 0;

      const avgAttendance = active.length > 0 ? Math.round(active.reduce((acc, s) => acc + s.attendance, 0) / active.length) : 0;

      return {
        ...career,
        studentCount: active.length,
        dropoutRate,
        avgGpa,
        avgAttendance,
        totalEnrolled: totalCount
      };
    });
  }, [resolvedStudents, careersList]);

  // Selected Student object
  const selectedStudent = useMemo(() => {
    return resolvedStudents.find(s => s.id === selectedStudentId) || null;
  }, [resolvedStudents, selectedStudentId]);

  // Filtered student database list
  const filteredStudents = useMemo(() => {
    return resolvedStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rut.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCareer = selectedCareerFilter === 'ALL' || s.careerId === selectedCareerFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;
      const matchSemester = selectedSemesterFilter === 'ALL' || s.semester === Number(selectedSemesterFilter);
      return matchSearch && matchCareer && matchStatus && matchSemester;
    });
  }, [resolvedStudents, searchQuery, selectedCareerFilter, selectedStatusFilter, selectedSemesterFilter]);

  // Find qualifications for the selected student
  const studentQualifications = useMemo(() => {
    if (!selectedStudent) return [];
    const sRut = parseRut(selectedStudent.rut).rut;
    return qualifications.filter(q => {
      const rawRut = getFieldVal(q, 'RUT');
      if (rawRut === undefined) return false;
      const qRut = typeof rawRut === 'number' ? rawRut : parseInt(String(rawRut).replace(/\D/g, ''), 10);
      return qRut === sRut;
    });
  }, [selectedStudent, qualifications]);

  // Group student qualifications by course code
  const groupedQualifications = useMemo(() => {
    const groups: { [courseCode: string]: {
      courseName: string;
      courseCode: string;
      teacher: string;
      finalGrade: number;
      attendance: number;
      nivel: number;
      evaluations: { activity: string; num: number; grade: number }[];
    } } = {};

    studentQualifications.forEach(q => {
      const code = getFieldVal(q, 'COD_CURSO') || 'S/C';
      if (!groups[code]) {
        groups[code] = {
          courseCode: code,
          courseName: getFieldVal(q, 'NOMBRE_CURSO') || 'Asignatura sin nombre',
          teacher: getFieldVal(q, 'NOMBRE_PROF') || 'Docente no asignado',
          finalGrade: Number(getFieldVal(q, 'NOTA_FINAL_CURSO')) || 0,
          attendance: Number(getFieldVal(q, 'PORCENTAJE_ASISTENCIA')) || 0,
          nivel: Number(getFieldVal(q, 'NIVEL')) || 1,
          evaluations: []
        };
      }
      const actividad = getFieldVal(q, 'ACTIVIDAD');
      const notaParcial = getFieldVal(q, 'NOTA_PARCIAL');
      const numNota = getFieldVal(q, 'NUM_NOTA');
      if (actividad || notaParcial !== undefined) {
        groups[code].evaluations.push({
          activity: actividad || `Nota ${numNota || ''}`,
          num: Number(numNota) || 1,
          grade: Number(notaParcial) || 0
        });
      }
    });

    return Object.values(groups);
  }, [studentQualifications]);

  // Helper to persist student data to Supabase (asynchronously)
  const persistStudentToSupabase = async (student: Student) => {
    // Save local overrides for interactive features not supported by the simple database schema
    saveLocalOverride(student.id, {
      grades: student.grades,
      attendance: student.attendance,
      supportLogs: student.supportLogs,
      status: student.status
    });

    if (!isSupabaseConfigured || !supabase) return;
    try {
      const dbStudent = mapJsStudentToDbWithCase(student, dbKeysCaseRef.current);
      const rutCol = dbKeysCaseRef.current === 'lower' ? 'rut' : 'RUT';
      const studentRutNum = parseRut(student.rut).rut;

      // Check if row already exists
      const { data: existing, error: selectError } = await supabase
        .from(dbTableRef.current)
        .select(rutCol)
        .eq(rutCol, studentRutNum);

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        // Update existing row
        const { error: updateError } = await supabase
          .from(dbTableRef.current)
          .update(dbStudent)
          .eq(rutCol, studentRutNum);
        if (updateError) throw updateError;
      } else {
        // Insert new row
        const { error: insertError } = await supabase
          .from(dbTableRef.current)
          .insert([dbStudent]);
        if (insertError) throw insertError;
      }

      console.log(`Estudiante ${student.name} guardado en Supabase (tabla ${dbTableRef.current}).`);
    } catch (err: any) {
      console.error("Error al guardar estudiante en Supabase:", err);
    }
  };

  // Add standard new student helper
  const handleAddNewStudent = (e: FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentRut) {
      alert('Por favor complete los campos obligatorios: Nombre y RUT.');
      return;
    }

    const careerObj = careersList.find(c => c.id === newStudentCareer);
    const initialGrades: SubjectGrades = {};
    if (careerObj) {
      careerObj.subjects.forEach(sub => {
        initialGrades[sub] = Number((4.0 + Math.random() * 3.0).toFixed(1)); // random solid grade
      });
    }

    const parsedR = parseRut(newStudentRut);
    const newId = parsedR.rut ? String(parsedR.rut) : `st-${Date.now()}`;
    const formattedRut = formatRut(parsedR.rut, parsedR.dig) || newStudentRut;

    const newStudent: Student = {
      id: newId,
      name: newStudentName,
      rut: formattedRut,
      careerId: newStudentCareer,
      semester: Number(newStudentSemester),
      attendance: Number(newStudentAttendance),
      status: Number(newStudentAttendance) < 70 ? 'Alerta de Riesgo' : 'Regular',
      grades: initialGrades,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@cftacademia.cl`,
      phone: newStudentPhone || '+56 9 ' + Math.floor(10000000 + Math.random() * 90000000),
      supportLogs: ['Ingreso de matrícula nuevo estudiante']
    };

    setStudents(prev => [newStudent, ...prev]);
    persistStudentToSupabase(newStudent);
    setIsNewStudentModalOpen(false);

    // Reset fields
    setNewStudentName('');
    setNewStudentRut('');
    setNewStudentCareer(careersList[0]?.id || '');
    setNewStudentSemester(1);
    setNewStudentAttendance(100);
    setNewStudentEmail('');
    setNewStudentPhone('');
  };

  // Grade updates
  const handleGradeChange = (studentId: string, subject: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 1.0 || num > 7.0) return;
    
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedGrades = { ...s.grades, [subject]: Math.round(num * 10) / 10 };
        // Automatically check risk if overall average falls below 4.0 or attendance is low
        const gpa = calculateGPA(updatedGrades);
        let status = s.status;
        if (s.status === 'Regular' || s.status === 'Alerta de Riesgo') {
          status = (gpa < 4.0 || s.attendance < 75) ? 'Alerta de Riesgo' : 'Regular';
        }
        const updated = {
          ...s,
          grades: updatedGrades,
          status
        };
        persistStudentToSupabase(updated);
        return updated;
      }
      return s;
    }));
  };

  // Status updates
  const handleStatusChange = (studentId: string, newStatus: Student['status']) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = { ...s, status: newStatus };
        persistStudentToSupabase(updated);
        return updated;
      }
      return s;
    }));
  };

  // Attendance update
  const handleAttendanceChange = (studentId: string, newAttendance: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const att = Math.max(0, Math.min(100, newAttendance));
        const gpa = calculateGPA(s.grades);
        let status = s.status;
        if (s.status === 'Regular' || s.status === 'Alerta de Riesgo') {
          status = (gpa < 4.0 || att < 75) ? 'Alerta de Riesgo' : 'Regular';
        }
        const updated = { ...s, attendance: att, status };
        persistStudentToSupabase(updated);
        return updated;
      }
      return s;
    }));
  };

  // Add Support Log
  const [tempSupportLog, setTempSupportLog] = useState('');
  const handleAddSupportLog = (studentId: string) => {
    if (!tempSupportLog.trim()) return;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          supportLogs: [...s.supportLogs, tempSupportLog.trim()]
        };
        persistStudentToSupabase(updated);
        return updated;
      }
      return s;
    }));
    setTempSupportLog('');
  };

  // --- QUALIFICATIONS CSV PARSING & PERSISTENCE ENGINE ---
  const handleParseQualificationsCSV = (fileText: string) => {
    const lines = fileText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      alert("El archivo CSV no contiene suficientes líneas (encabezado + datos).");
      return null;
    }

    const headerLine = lines[0];
    let delimiter = ',';
    if (headerLine.includes('\t')) {
      delimiter = '\t';
    } else if (headerLine.includes(';')) {
      delimiter = ';';
    }

    const headers = headerLine.split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toUpperCase());
    const parsedData: Qualification[] = [];

    const getColIndex = (colNames: string[]) => {
      for (const col of colNames) {
        const idx = headers.indexOf(col.toUpperCase());
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxNumero = getColIndex(['NUMERO', 'Número', 'NÚMERO']);
    const idxAno = getColIndex(['ANO', 'AÑO', 'ANIO']);
    const idxPeriodo = getColIndex(['PERIODO', 'PERÍODO']);
    const idxCodcli = getColIndex(['CODCLI']);
    const idxRut = getColIndex(['RUT']);
    const idxNombreAlumno = getColIndex(['NOMBRE_ALUMNO', 'NOMBRE', 'ALUMNO']);
    const idxAnoIngreso = getColIndex(['ANO_INGRESO', 'AÑO_INGRESO', 'INGRESO']);
    const idxCatAlumno = getColIndex(['CAT_ALUMNO', 'CATEGORIA', 'CAT']);
    const idxEstadoAlumno = getColIndex(['ESTADO_ALUMNO', 'ESTADO_ALUM', 'ESTADO']);
    const idxCodSede = getColIndex(['COD_SEDE', 'SEDE']);
    const idxNombreSede = getColIndex(['NOMBRE_SEDE']);
    const idxCarreraAlum = getColIndex(['CARRERA_ALUM', 'CARRERA']);
    const idxNombreCarreraAlumno = getColIndex(['NOMBRE_CARRERA_ALUMNO', 'NOMBRE_CARRERA']);
    const idxRegimenCarrera = getColIndex(['REGIMEN_CARRERA_ALUMNO', 'REGIMEN']);
    const idxCodCarrPlanificada = getColIndex(['CODCARR_PLANIFICADA']);
    const idxNombreCarreraPlan = getColIndex(['NOMBRE_CARRERA_PLANIFICADA']);
    const idxJornada = getColIndex(['JORNADA']);
    const idxRutProf = getColIndex(['RUT_PROF', 'PROFESOR_RUT']);
    const idxNombreProf = getColIndex(['NOMBRE_PROF', 'PROFESOR', 'NOMBRE_PROFESOR']);
    const idxNivel = getColIndex(['NIVEL']);
    const idxCodCurso = getColIndex(['COD_CURSO', 'CURSO_COD']);
    const idxNombreCurso = getColIndex(['NOMBRE_CURSO', 'CURSO', 'NOMBRE_CURSO_ALUMNO']);
    const idxSeccion = getColIndex(['SECCION', 'SECCIÓN']);
    const idxActividad = getColIndex(['ACTIVIDAD']);
    const idxNumNota = getColIndex(['NUM_NOTA', 'NUMERO_NOTA']);
    const idxNotaParcial = getColIndex(['NOTA_PARCIAL', 'PARCIAL']);
    const idxNotaFinal = getColIndex(['NOTA_FINAL_CURSO', 'NOTA_FINAL', 'FINAL']);
    const idxPorcentajeAsistencia = getColIndex(['PORCENTAJE_ASISTENCIA', 'ASISTENCIA', 'PORCENTAJE_ASIS']);

    if (idxRut === -1) {
      alert("No se pudo encontrar la columna obligatoria RUT. Verifique el encabezado del archivo CSV.");
      return null;
    }

    const parseSpanishFloat = (val: string): number => {
      if (!val) return 0;
      const cleanVal = val.replace(/,/g, '.').replace(/[^0-9.]/g, '');
      return parseFloat(cleanVal) || 0;
    };

    const parseSpanishInt = (val: string): number => {
      if (!val) return 0;
      const cleanVal = val.replace(/[^0-9]/g, '');
      return parseInt(cleanVal, 10) || 0;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      let cols: string[] = [];
      if (delimiter === ',') {
        cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      } else {
        cols = line.split(delimiter);
      }

      cols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());

      const rValStr = cols[idxRut] || '';
      if (!rValStr) continue;

      const { rut: rutNum } = parseRut(rValStr);
      if (!rutNum) continue;

      const qRow: Qualification = {
        NUMERO: idxNumero !== -1 ? parseSpanishInt(cols[idxNumero]) : i,
        ANO: idxAno !== -1 ? parseSpanishInt(cols[idxAno]) : 2026,
        PERIODO: idxPeriodo !== -1 ? parseSpanishInt(cols[idxPeriodo]) : 1,
        CODCLI: idxCodcli !== -1 ? cols[idxCodcli] || '' : '',
        RUT: rutNum,
        NOMBRE_ALUMNO: idxNombreAlumno !== -1 ? cols[idxNombreAlumno] || '' : '',
        ANO_INGRESO: idxAnoIngreso !== -1 ? parseSpanishInt(cols[idxAnoIngreso]) : 2025,
        CAT_ALUMNO: idxCatAlumno !== -1 ? cols[idxCatAlumno] || 'NORMAL' : 'NORMAL',
        ESTADO_ALUMNO: idxEstadoAlumno !== -1 ? cols[idxEstadoAlumno] || 'VIGENTE' : 'VIGENTE',
        COD_SEDE: idxCodSede !== -1 ? cols[idxCodSede] || '' : '',
        NOMBRE_SEDE: idxNombreSede !== -1 ? cols[idxNombreSede] || '' : '',
        CARRERA_ALUM: idxCarreraAlum !== -1 ? cols[idxCarreraAlum] || '' : '',
        NOMBRE_CARRERA_ALUMNO: idxNombreCarreraAlumno !== -1 ? cols[idxNombreCarreraAlumno] || '' : '',
        REGIMEN_CARRERA_ALUMNO: idxRegimenCarrera !== -1 ? cols[idxRegimenCarrera] || 'SEMESTRAL' : 'SEMESTRAL',
        CODCARR_PLANIFICADA: idxCodCarrPlanificada !== -1 ? cols[idxCodCarrPlanificada] || '' : '',
        NOMBRE_CARRERA_PLANIFICADA: idxNombreCarreraPlan !== -1 ? cols[idxNombreCarreraPlan] || '' : '',
        JORNADA: idxJornada !== -1 ? cols[idxJornada] || 'D' : 'D',
        RUT_PROF: idxRutProf !== -1 ? cols[idxRutProf] || '' : '',
        NOMBRE_PROF: idxNombreProf !== -1 ? cols[idxNombreProf] || '' : '',
        NIVEL: idxNivel !== -1 ? parseSpanishInt(cols[idxNivel]) : 1,
        COD_CURSO: idxCodCurso !== -1 ? cols[idxCodCurso] || '' : '',
        NOMBRE_CURSO: idxNombreCurso !== -1 ? cols[idxNombreCurso] || '' : '',
        SECCION: idxSeccion !== -1 ? cols[idxSeccion] || '1' : '1',
        ACTIVIDAD: idxActividad !== -1 ? cols[idxActividad] || '' : '',
        NUM_NOTA: idxNumNota !== -1 ? parseSpanishInt(cols[idxNumNota]) : 1,
        NOTA_PARCIAL: idxNotaParcial !== -1 ? parseSpanishFloat(cols[idxNotaParcial]) : 0,
        NOTA_FINAL_CURSO: idxNotaFinal !== -1 ? parseSpanishFloat(cols[idxNotaFinal]) : 0,
        PORCENTAJE_ASISTENCIA: idxPorcentajeAsistencia !== -1 ? parseSpanishInt(cols[idxPorcentajeAsistencia]) : 100
      };

      parsedData.push(qRow);
    }

    return parsedData;
  };

  const handleSaveQualifications = async (data: Qualification[]) => {
    // 1. Update local state
    setQualifications(data);

    // 2. Identify students from the qualifications dataset not enrolled in the student table
    const newStudentsToRegister: Student[] = [];
    const existingRuts = new Set(students.map(s => parseRut(s.rut).rut));

    const importedStudentsMap = new Map<number, { name: string; career: string; careerCode: string; estado: string; anoIngreso: number }>();
    data.forEach(q => {
      if (q.RUT && !existingRuts.has(q.RUT)) {
        importedStudentsMap.set(q.RUT, {
          name: q.NOMBRE_ALUMNO,
          career: q.NOMBRE_CARRERA_ALUMNO || q.NOMBRE_CARRERA_PLANIFICADA || 'ADMINISTRACIÓN DE EMPRESAS',
          careerCode: q.CARRERA_ALUM || q.CODCARR_PLANIFICADA || 'LGADM',
          estado: q.ESTADO_ALUMNO || 'VIGENTE',
          anoIngreso: q.ANO_INGRESO || 2025
        });
      }
    });

    importedStudentsMap.forEach((studentInfo, rutNum) => {
      const names = studentInfo.name.split(/\s+/);
      const isRetirado = ['RETIRADO', 'DESERTOR', 'BAJA'].some(st => studentInfo.estado.toUpperCase().includes(st));
      const status: Student['status'] = isRetirado ? 'Retirado' : 'Regular';
      
      const newStudent: Student = {
        id: String(rutNum),
        name: studentInfo.name,
        rut: formatRut(rutNum, 'K'),
        careerId: studentInfo.careerCode,
        semester: 2026 - studentInfo.anoIngreso >= 1 ? (2026 - studentInfo.anoIngreso) * 2 + 1 : 1,
        attendance: 90,
        status: status,
        grades: {},
        email: `${names[0].toLowerCase()}.${(names[1] || '').toLowerCase()}@cftacademia.cl`,
        phone: '+56 9 8888 8888',
        supportLogs: ['Registrado automáticamente mediante carga de CSV de calificaciones'],
        situacion: studentInfo.estado
      };

      newStudentsToRegister.push(newStudent);
    });

    if (newStudentsToRegister.length > 0) {
      const confirmImport = window.confirm(`Se detectaron ${newStudentsToRegister.length} estudiantes en las calificaciones que no están matriculados en el sistema.\n¿Desea matricularlos automáticamente para vincular sus notas?`);
      if (confirmImport) {
        setStudents(prev => [...prev, ...newStudentsToRegister]);
        for (const s of newStudentsToRegister) {
          await persistStudentToSupabase(s);
        }
      }
    }

    // 3. Persist qualifications table to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        setIsSyncing(true);
        let savedSuccess = false;
        let lastError = null;

        const tableNames = ['Calificaciones', 'calificaciones', 'CALIFICACIONES'];
        for (const tableName of tableNames) {
          try {
            // Clear old records first
            const { error: deleteError } = await supabase
              .from(tableName)
              .delete()
              .not('id', 'is', null);

            if (!deleteError) {
              const batchSize = 100;
              for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                const { error: insertError } = await supabase
                  .from(tableName)
                  .insert(batch);
                if (insertError) throw insertError;
              }
              alert(`¡Calificaciones cargadas y sincronizadas con la tabla "${tableName}" en Supabase con éxito!`);
              savedSuccess = true;
              break;
            } else {
              // Try querying or inserting if delete fails (some schemas might not allow delete without columns)
              lastError = deleteError;
            }
          } catch (e: any) {
            lastError = e;
          }
        }

        if (!savedSuccess) {
          throw lastError || new Error("No se pudo escribir en ninguna de las tablas ('Calificaciones', 'calificaciones', 'CALIFICACIONES') de Supabase.");
        }
      } catch (err: any) {
        console.error("Error saving qualifications to Supabase:", err);
        alert(`Las calificaciones se guardaron localmente, pero hubo un error con Supabase: ${err.message || JSON.stringify(err)}. Asegúrese de que la tabla 'Calificaciones' exista en su base de datos.`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      alert("¡Calificaciones guardadas en el almacenamiento local del navegador!");
    }
  };

  // Export Filtered Student Data as CSV file
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Nombre,RUT,Carrera,Semestre,Asistencia,Estado,Promedio Gral,Contacto,Telefono\r\n';
    
    filteredStudents.forEach(s => {
      const c = careersList.find(car => car.id === s.careerId)?.name || s.careerId;
      const gpa = calculateGPA(s.grades);
      const row = `"${s.name}","${s.rut}","${c}",${s.semester},${s.attendance}%,"${s.status}",${gpa},"${s.email}","${s.phone}"`;
      csvContent += row + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Academico_CFT_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive Graph variables
  const maxMetricValue = useMemo(() => {
    const values = careerStats.map(c => {
      if (dashboardChartMetric === 'students') return c.studentCount;
      if (dashboardChartMetric === 'gpa') return c.avgGpa;
      return c.dropoutRate;
    });
    return Math.max(...values, 1);
  }, [careerStats, dashboardChartMetric]);

  // Blocking checks for Supabase-only enforcement
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans" id="supabase-unconfigured-screen">
        <div className="max-w-3xl w-full bg-[#151D30] border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-blue-500/30">C</div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    CFT Academia
                  </h1>
                  <p className="text-[11px] tracking-wider text-slate-400 uppercase font-bold">Gestión e Información Escolar</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Conexión Supabase Requerida
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">El modo local ha sido eliminado</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Para asegurar la persistencia real, integridad de los datos académicos y evitar la pérdida de registros, la aplicación ahora requiere exclusivamente una conexión activa a <strong>Supabase (PostgreSQL)</strong>. No se permite el almacenamiento demo local.
              </p>
            </div>

            {/* Config steps */}
            <div className="space-y-6 bg-[#0E1322] border border-slate-800/80 rounded-3xl p-5 md:p-7">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Guía de Conexión en 3 Pasos
              </h3>

              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/20">1</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">Cree su proyecto en Supabase</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Regístrese gratis en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">supabase.com</a> y cree una base de datos PostgreSQL.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/20">2</span>
                  <div className="w-full space-y-2">
                    <h4 className="font-bold text-sm text-white">Inicialice el Esquema de la Tabla</h4>
                    <p className="text-xs text-slate-400">Vaya al panel <strong>SQL Editor</strong> en Supabase, pegue el siguiente script y presione <strong>Run</strong>:</p>
                    
                    <div className="bg-slate-950 rounded-2xl p-4 relative font-mono text-[11px] text-slate-300 border border-slate-800/80 shadow-inner">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2000);
                        }}
                        className="absolute right-3 top-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold border border-slate-700/50"
                      >
                        {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                      </button>
                      <pre className="max-h-[140px] overflow-y-auto pr-2 pt-6 select-all scrollbar-thin text-left whitespace-pre-wrap leading-relaxed">
                        {SUPABASE_SETUP_SQL}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/20">3</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">Defina las Variables de Entorno</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Agregue las siguientes variables en su archivo de configuración local u hospedaje:</p>
                    <div className="mt-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-mono text-xs text-slate-300">
                      <p className="text-blue-400"><span className="text-slate-500">VITE_SUPABASE_URL</span>=tu_project_url_aqui</p>
                      <p className="text-blue-400"><span className="text-slate-500">VITE_SUPABASE_ANON_KEY</span>=tu_anon_public_key_aqui</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">Una vez guardadas las variables, recargue la página.</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Re-comprobar Conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans" id="supabase-error-screen">
        <div className="max-w-3xl w-full bg-[#151D30] border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-rose-500/30">C</div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    CFT Academia
                  </h1>
                  <p className="text-[11px] tracking-wider text-slate-400 uppercase font-bold">Gestión e Información Escolar</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                Error de Sincronización Supabase
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Fallo en la conexión de base de datos</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Se detectaron credenciales de Supabase configuradas, pero se produjo un error al consultar o sembrar la tabla de estudiantes. Esto suele ocurrir si la tabla <strong>estudiantes</strong> (o <strong>ESTUDIANTES</strong>) no ha sido creada o si las políticas de acceso (RLS) están bloqueando la consulta.
              </p>

              {/* Error Detail Box */}
              <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4 font-mono text-xs text-rose-300">
                <p className="font-bold uppercase text-[10px] tracking-wider text-rose-400 mb-1 font-sans">Detalle del Error:</p>
                <p>{supabaseError}</p>
              </div>
            </div>

            {/* Resolve steps */}
            <div className="space-y-6 bg-[#0E1322] border border-slate-800/80 rounded-3xl p-5 md:p-7">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                ¿Cómo solucionar este error?
              </h3>

              <div className="space-y-5 text-slate-300 text-xs">
                <p className="leading-relaxed">
                  Para asegurar que la tabla esté creada con la estructura correcta y el RUT como clave primaria, ejecute el siguiente script SQL completo en el panel <strong>SQL Editor</strong> de su proyecto Supabase:
                </p>

                <div className="bg-slate-950 rounded-2xl p-4 relative font-mono text-[11px] text-slate-300 border border-slate-800/80 shadow-inner">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="absolute right-3 top-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1.5 transition-all text-xs font-bold border border-slate-700/50"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                  <pre className="max-h-[160px] overflow-y-auto pr-2 pt-6 select-all scrollbar-thin text-left whitespace-pre-wrap leading-relaxed">
                    {SUPABASE_SETUP_SQL}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">Verifique su SQL Editor en Supabase y luego reintente.</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar Conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSyncing && students.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-white text-3xl animate-bounce shadow-lg shadow-blue-500/20">C</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Sincronizando con Supabase</h3>
            <p className="text-slate-400 text-xs">Cargando registros académicos y notas en tiempo real...</p>
          </div>
          <div className="flex justify-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 w-full min-h-screen flex flex-col md:flex-row overflow-x-hidden font-sans antialiased" id="cft-root-container">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between" id="cft-sidebar">
        <div className="p-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-85 transition-all text-left w-full focus:outline-none"
            id="brand-header-link"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 text-lg">C</div>
            <div>
              <span className="font-extrabold tracking-tight text-xl italic block">360 Análisis</span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold block">Gestión e Información</span>
            </div>
          </button>
          
          <nav className="space-y-1.5" id="cft-navigation-links">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id="nav-link-dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
              Tablero Principal
            </button>
            
            <button 
              onClick={() => setActiveTab('carreras')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === 'carreras' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id="nav-link-carreras"
            >
              <BookOpen className="w-5 h-5" />
              Oferta Académica
            </button>
            
            <button 
              onClick={() => setActiveTab('estudiantes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === 'estudiantes' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id="nav-link-estudiantes"
            >
              <Users className="w-5 h-5" />
              Estudiantes & Notas
            </button>
            
            <button 
              onClick={() => setActiveTab('reportes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === 'reportes' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id="nav-link-reportes"
            >
              <FileText className="w-5 h-5" />
              Reportes & Alertas
            </button>

            <button 
              onClick={() => setActiveTab('desercion')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === 'desercion' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold border border-blue-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              id="nav-link-desercion"
            >
              <TrendingDown className="w-5 h-5" />
              Deserción
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Academic Status */}
        <div className="p-6 mt-auto border-t border-slate-800" id="cft-sidebar-footer">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Periodo Vigente</p>
              <p className="text-white font-semibold text-sm">Segundo Semestre 2026</p>
            </div>
            
            <div className="border-t border-slate-700/50 pt-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-slate-400" />
                Base de Datos
              </p>
              
              {isSupabaseConfigured ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 bg-emerald-950/40 border border-emerald-800/30 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseError ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                      <span className={`text-[11px] font-bold ${supabaseError ? 'text-rose-400' : 'text-emerald-400'}`}>Supabase</span>
                    </div>
                    <button 
                      onClick={() => window.location.reload()}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      title="Sincronizar base de datos"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  {supabaseError && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-rose-400 font-medium leading-tight">
                        {supabaseError}
                      </p>
                      <button 
                        onClick={() => setShowSqlModal(true)}
                        className="w-full text-left text-[9px] font-bold text-blue-400 hover:text-blue-300 underline flex items-center gap-1 transition-all"
                      >
                        <CloudLightning className="w-2.5 h-2.5 shrink-0" />
                        Ver instrucciones y SQL
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-800/30 rounded-lg px-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span className="text-[11px] font-bold text-blue-400">Modo Demo (Local)</span>
                  </div>
                  <button 
                    onClick={() => setShowSqlModal(true)}
                    className="w-full text-left text-[10px] font-bold text-blue-400 hover:text-blue-300 underline flex items-center gap-1 transition-all"
                  >
                    <CloudLightning className="w-3 h-3 shrink-0" />
                    Generar tablas Supabase
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto" id="cft-main-workspace">
        
        {/* Dynamic Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8" id="cft-header">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Tablero de Control Académico'}
              {activeTab === 'carreras' && 'Estadísticas de Carreras'}
              {activeTab === 'estudiantes' && 'Registro General de Estudiantes'}
              {activeTab === 'reportes' && 'Reportes & Alertas'}
              {activeTab === 'desercion' && 'Análisis de Deserción Escolar'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {activeTab === 'dashboard' && 'Consolidado general de rendimiento, matrículas y alertas de retención.'}
              {activeTab === 'carreras' && 'Distribución, vacantes de matrículas y promedios por carrera técnica.'}
              {activeTab === 'estudiantes' && 'Búsqueda, visualización de fichas y edición de calificaciones.'}
              {activeTab === 'reportes' && 'Gráficos cruzados de asistencia vs. notas y herramientas de exportación.'}
              {activeTab === 'desercion' && 'Análisis de permanencia por carrera y listado de alumnos en situación de deserción (SITUACION).'}
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto shrink-0" id="cft-header-actions">
            <button 
              onClick={() => setIsImportGradesModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
              id="action-btn-import-grades"
              title="Importar CSV de Calificaciones (Segunda Tabla)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Calificaciones</span>
            </button>
            <button 
              onClick={() => setIsNewStudentModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
              id="action-btn-new-student"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Estudiante
            </button>
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 bg-white rounded-xl flex items-center justify-center gap-2 font-semibold text-slate-700 transition-all text-sm cursor-pointer"
              id="action-btn-export"
              title="Exportar base de datos según filtros"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </header>

        {/* TAB 1: DASHBOARD (BENTO GRID STYLE) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="view-dashboard">
            {/* 4 Core Statistics Grid Cards (Bento Metric Rows) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="bento-metric-row">
              
              {/* Metric Card 1: Estudiantes Totales */}
              <div className="bg-white border border-slate-200/80 shadow-xs rounded-[1.8rem] p-6 flex flex-col justify-between hover:shadow-md transition-all group" id="metric-enrolled">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estudiantes</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{totalEnrolled}</span>
                  </div>
                </div>
              </div>

              {/* Metric Card 2: Tasa de Deserción */}
              <div className="bg-white border border-slate-200/80 shadow-xs rounded-[1.8rem] p-6 flex flex-col justify-between hover:shadow-md transition-all group" id="metric-dropout">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tasa de Deserción</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{overallDropoutRate}%</span>
                    <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      -1.4% este sem.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Objetivo institucional: inferior al 8.0%</p>
                </div>
              </div>

              {/* Metric Card 3: Promedio General */}
              <div className="bg-white border border-slate-200/80 shadow-xs rounded-[1.8rem] p-6 flex flex-col justify-between hover:shadow-md transition-all group" id="metric-gpa">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Promedio General</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{overallAverageGPA}</span>
                    <span className="text-slate-400 text-xs font-semibold">/ escala 7.0</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium mt-2">Rendimiento: Sobre el nivel de aprobación (4.0)</p>
                </div>
              </div>

              {/* Metric Card 4: Alertas Activas */}
              <div className="bg-amber-50 border border-amber-200 shadow-xs rounded-[1.8rem] p-6 flex flex-col justify-between hover:shadow-md transition-all group" id="metric-alerts">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">Estudiantes en Riesgo</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-amber-900 tracking-tight">{studentsAtRiskCount}</span>
                    <span className="text-amber-700 text-[11px] font-semibold bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Baja asist. / promedio
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-2">Requieren acompañamiento inmediato</p>
                </div>
              </div>
            </div>

            {/* Bento Grid Middle Row: Dynamic Interactive Chart & Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-middle-row">
              
              {/* Dynamic Interactive Chart Card (Span 8) */}
              <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200/80 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between" id="bento-chart-container">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Distribución por Carrera Académica</h3>
                    <p className="text-xs text-slate-500">Haz clic en los controles para cambiar la métrica visualizada.</p>
                  </div>
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1" id="chart-metric-controls">
                    <button 
                      onClick={() => setDashboardChartMetric('students')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dashboardChartMetric === 'students' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Matrículas
                    </button>
                    <button 
                      onClick={() => setDashboardChartMetric('gpa')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dashboardChartMetric === 'gpa' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Promedio Notas
                    </button>
                    <button 
                      onClick={() => setDashboardChartMetric('dropout')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dashboardChartMetric === 'dropout' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Tasa Deserción
                    </button>
                  </div>
                </div>

                {/* SVG Beautiful Dynamic Chart Bar Graphics */}
                <div className="flex-1 flex flex-col justify-end min-h-[220px]" id="bento-svg-chart">
                  <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 md:gap-4 h-48 border-b border-slate-100 pb-2">
                    {careerStats.map(c => {
                      const value = 
                        dashboardChartMetric === 'students' ? c.studentCount : 
                        dashboardChartMetric === 'gpa' ? c.avgGpa : c.dropoutRate;
                      
                      const heightPercent = Math.max(8, Math.min(100, (value / maxMetricValue) * 100));

                      return (
                        <div key={c.id} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                            <span className="block text-slate-300 font-medium text-[9px] uppercase tracking-wider">{c.name}</span>
                            <span>
                              {dashboardChartMetric === 'students' && `${value} Estudiantes`}
                              {dashboardChartMetric === 'gpa' && `Promedio: ${value}`}
                              {dashboardChartMetric === 'dropout' && `Deserción: ${value}%`}
                            </span>
                          </div>

                          {/* Bar filled element */}
                          <div className="w-full relative flex justify-center items-end" style={{ height: '100%' }}>
                            <div 
                              className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out ${c.color} group-hover:brightness-105 shadow-sm group-hover:shadow-md`}
                              style={{ height: `${heightPercent}%` }}
                            >
                              <div className="w-full h-full bg-linear-to-t from-black/10 to-transparent flex items-start justify-center pt-2">
                                <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {value}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* X Label */}
                          <span className="text-[10px] font-extrabold text-slate-400 mt-3 uppercase tracking-wider">
                            {c.id}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-semibold px-1">
                    <span>* Ejes categorizados por código de carrera</span>
                    <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setActiveTab('carreras')}>
                      Ver detalle de carreras &rarr;
                    </span>
                  </div>
                </div>
              </div>

              {/* Red List: Alertas de Riesgo de Deserción (Span 4) */}
              <div className="col-span-1 lg:col-span-4 bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between" id="bento-risk-panel">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                      <AlertTriangle className="text-amber-500 w-5 h-5 animate-pulse" />
                      Alertas Críticas
                    </h3>
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Prioridad Alta
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-6">Estudiantes con asistencia crítica (&lt;75%) o promedio reprobatorio (&lt;4.0).</p>

                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1" id="risk-students-scroller">
                    {students.filter(s => s.status === 'Alerta de Riesgo').length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-sm">
                        No hay alertas de deserción pendientes. ¡Buen trabajo!
                      </div>
                    ) : (
                      students.filter(s => s.status === 'Alerta de Riesgo').map(s => {
                        const career = careersList.find(c => c.id === s.careerId);
                        const avg = calculateGPA(s.grades);
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.id)}
                            className="bg-slate-800/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold flex items-center justify-center text-xs">
                                {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{s.name}</h4>
                                <p className="text-[10px] text-slate-400">{career?.name || s.careerId} • Sem. {s.semester}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[11px] font-bold text-rose-400">Asis: {s.attendance}%</div>
                              <div className="text-[10px] text-slate-400">Prom: {avg}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedStatusFilter('Alerta de Riesgo');
                    setActiveTab('estudiantes');
                  }}
                  className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 text-center"
                >
                  Gestionar Alertas e Intervenciones
                </button>
              </div>
            </div>

            {/* Bottom Row Bento Card: Estudiantes Destacados Table */}
            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs" id="bento-outstanding-table">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Cuadro de Honor (Mejores Promedios)</h3>
                  <p className="text-xs text-slate-500">Alumnos con estatus regular con las calificaciones más destacadas del CFT.</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedStatusFilter('Regular');
                    setActiveTab('estudiantes');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 self-start sm:self-auto"
                >
                  Ver listado general de alumnos <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">RUT</th>
                      <th className="py-3 px-4">Carrera Técnica</th>
                      <th className="py-3 px-4 text-center">Asistencia</th>
                      <th className="py-3 px-4 text-center">Promedio</th>
                      <th className="py-3 px-4 text-right">Estatus Académico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map(s => {
                      const career = careersList.find(c => c.id === s.careerId);
                      return (
                        <tr 
                          key={s.id} 
                          onClick={() => setSelectedStudentId(s.id)}
                          className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-800 group-hover:text-blue-600">
                            {s.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">{s.rut}</td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${career?.color || 'bg-slate-400'}`}></span>
                              {career?.name || s.careerId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-slate-600 font-medium">{s.attendance}%</td>
                          <td className="py-3.5 px-4 text-center font-black text-blue-600 text-sm">{s.gpa}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAREERS VIEWS */}
        {activeTab === 'carreras' && (
          <div className="space-y-6 animate-fade-in" id="view-carreras">
            {/* Introductory statement */}
            <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-lg shadow-blue-100/10">
              <div className="relative z-10 max-w-2xl">
                <span className="bg-blue-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest mb-4 inline-block">CFT Academia</span>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Monitoreo Detallado por Especialidad Técnica</h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Supervisión de matrículas, vacantes y factores de deserción de cada carrera de nuestro CFT. Permite a coordinadores académicos validar el rendimiento grupal en tiempo real.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/8">
                <GraduationCap className="w-80 h-80" />
              </div>
            </div>

            {/* Careers Matrix Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerStats.map(c => {
                const percentFull = Math.min(100, Math.round((c.totalEnrolled / c.capacity) * 100));
                
                return (
                  <div key={c.id} className="bg-white border border-slate-200/80 rounded-[2rem] p-6 flex flex-col justify-between hover:shadow-lg transition-all" id={`career-card-${c.id}`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${c.color}`}>
                          {c.id}
                        </span>
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] font-bold uppercase block">Prom. Carrera</span>
                          <span className="text-lg font-black text-slate-900">{c.avgGpa}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-1">{c.name}</h3>
                      <p className="text-slate-400 text-xs mb-4">Plan Curricular: {c.durationSemesters} Semestres</p>

                      <div className="space-y-3.5 border-t border-slate-50 pt-4">
                        {/* Attendance Metric */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Asistencia Promedio:</span>
                          <span className="font-bold text-slate-800">{c.avgAttendance}%</span>
                        </div>

                        {/* Dropout Metric with warning badge */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Tasa Deserción Histórica:</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            c.dropoutRate > 15 ? 'bg-rose-100 text-rose-700' : 
                            c.dropoutRate > 8 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {c.dropoutRate}%
                          </span>
                        </div>

                        {/* Enrollment Progress bar */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1 font-semibold">
                            <span className="text-slate-400">Cupos Reservados:</span>
                            <span className="text-slate-700">{c.totalEnrolled} / {c.capacity} Estudiantes</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${c.color}`} 
                              style={{ width: `${percentFull}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setSelectedCareerFilter(c.id);
                          setSelectedStatusFilter('ALL');
                          setActiveTab('estudiantes');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        Ver Alumnos Inscritos
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCareerFilter(c.id);
                          setSelectedStatusFilter('ALL');
                          setActiveTab('reportes');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                      >
                        Generar Reporte <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS DIRECTORY & GRADES MANAGER */}
        {activeTab === 'estudiantes' && (
          <div className="space-y-6" id="view-estudiantes">
            {/* Search & Filter bar Card */}
            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs flex flex-col gap-4" id="filters-card">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                
                {/* Search field */}
                <div className="relative w-full lg:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar estudiante por nombre, RUT, correo académico..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter selects */}
                <div className="grid grid-cols-3 gap-2.5 w-full lg:w-auto shrink-0">
                  {/* Career Filter */}
                  <div>
                    <select
                      value={selectedCareerFilter}
                      onChange={(e) => setSelectedCareerFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">Todas las Carreras</option>
                      {careersList.map(c => (
                        <option key={c.id} value={c.id}>{c.id}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">Todos los Estados</option>
                      <option value="Regular">Regular</option>
                      <option value="Alerta de Riesgo">Alerta de Riesgo</option>
                      <option value="Suspendido">Suspendido</option>
                      <option value="Retirado">Retirados/Desertor</option>
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div>
                    <select
                      value={selectedSemesterFilter}
                      onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">Cualquier Semestre</option>
                      <option value="1">1° Semestre</option>
                      <option value="2">2° Semestre</option>
                      <option value="3">3° Semestre</option>
                      <option value="4">4° Semestre</option>
                      <option value="5">5° Semestre</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Reset filter helpers */}
              {(searchQuery || selectedCareerFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedSemesterFilter !== 'ALL') && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-bold bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 self-start">
                  <span>Filtros activos. Se muestran {filteredStudents.length} estudiantes.</span>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCareerFilter('ALL');
                      setSelectedStatusFilter('ALL');
                      setSelectedSemesterFilter('ALL');
                    }}
                    className="underline hover:text-blue-800 ml-1 cursor-pointer"
                  >
                    Restaurar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Students Grid Layout */}
            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6" id="students-table-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">
                      <th className="py-3.5 px-4">Estudiante</th>
                      <th className="py-3.5 px-4">RUT</th>
                      <th className="py-3.5 px-4">Carrera Técnica</th>
                      <th className="py-3.5 px-4 text-center">Asistencia</th>
                      <th className="py-3.5 px-4 text-center">Promedio</th>
                      <th className="py-3.5 px-4 text-right">Estatus</th>
                      <th className="py-3.5 px-4 text-right">Ficha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                          No se encontraron estudiantes que coincidan con los filtros ingresados.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(s => {
                        const career = careersList.find(c => c.id === s.careerId);
                        const avg = calculateGPA(s.grades);
                        
                        return (
                          <tr 
                            key={s.id} 
                            className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                            onClick={() => setSelectedStudentId(s.id)}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{s.email}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs font-mono text-slate-600">{s.rut}</td>
                            <td className="py-4 px-4">
                              <span className="text-xs text-slate-700 font-medium block">{career?.name || s.careerId}</span>
                              <span className="text-[10px] text-slate-400">Semestre {s.semester}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-xs font-bold ${s.attendance < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                                {s.attendance}%
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-sm font-black ${
                                avg < 4.0 ? 'text-rose-600' : 'text-slate-800'
                              }`}>
                                {avg}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                                s.status === 'Regular' ? 'bg-emerald-100 text-emerald-800' :
                                s.status === 'Alerta de Riesgo' ? 'bg-amber-100 text-amber-800' :
                                s.status === 'Suspendido' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudentId(s.id);
                                }}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg inline-block hover:scale-105 transition-transform"
                                title="Abrir Ficha de Notas y Rendimiento"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS CENTER & PREVIEW */}
        {activeTab === 'reportes' && (
          <div className="space-y-6" id="view-reportes">
            
            {/* Split layout: Risk report summary & Scatter Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Core Dropout Stats Summary */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2">Resumen de Alertas Académicas</h3>
                  <p className="text-xs text-slate-500 mb-6">Mecanismos institucionales de prevención de deserción por rendimiento.</p>

                  <div className="space-y-4">
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <div className="text-2xl font-black text-rose-800">{studentsAtRiskCount} Estudiantes</div>
                      <div className="text-xs text-rose-700 font-semibold mt-1">Con alerta académica vigente</div>
                      <p className="text-[10px] text-rose-600/80 mt-1.5">Representa el {Math.round((studentsAtRiskCount / students.length) * 100)}% de la matrícula total del CFT.</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="text-2xl font-black text-emerald-800">84.2%</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-1">Tasa de Aprobación de Ramos</div>
                      <p className="text-[10px] text-emerald-600/80 mt-1.5">Asistencia regular promedio: 87% de asistencia media.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setIsReportPrinterPreviewOpen(true)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Vista de Impresión / Reporte Oficial
                  </button>
                </div>
              </div>

              {/* Box 2: Attendance vs. Grades Scatter plot (Custom Responsive SVG) (Span 2) */}
              <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 lg:col-span-2 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">Distribución de Alumnos: Asistencia vs Notas</h3>
                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Gráfico de Dispersión
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-6">Visualiza la correlación entre la asistencia (%) y las calificaciones (1.0-7.0) para detectar zonas de abandono.</p>
                </div>

                {/* Custom Beautiful SVG Scatter plot */}
                <div className="flex-1 min-h-[220px] relative mt-4">
                  <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between">
                    
                    {/* SVG Graphic with axes */}
                    <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
                      <line x1="40" y1="20" x2="40" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* X and Y labels */}
                      <text x="15" y="25" className="text-[9px] fill-slate-400 font-bold">7.0</text>
                      <text x="15" y="105" className="text-[9px] fill-slate-400 font-bold">4.0</text>
                      <text x="15" y="183" className="text-[9px] fill-slate-400 font-bold">1.0</text>
                      
                      <text x="40" y="195" className="text-[9px] fill-slate-400 font-bold">0%</text>
                      <text x="260" y="195" className="text-[9px] fill-slate-400 font-bold">50%</text>
                      <text x="470" y="195" className="text-[9px] fill-slate-400 font-bold">100%</text>

                      {/* Passing Grade threshold line */}
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="350" y="95" className="text-[8px] fill-rose-500 font-bold">Umbral de Aprobación (4.0)</text>

                      {/* Scatter Dots representing real students in database */}
                      {resolvedStudents.map((student) => {
                        const avg = calculateGPA(student.grades);
                        // Map attendance 0-100% to X 40-480
                        const x = 40 + (student.attendance / 100) * 440;
                        // Map grade 1.0-7.0 to Y 180-20 (invert)
                        // Formula: Y = 180 - ((grade - 1.0) / 6.0) * 160
                        const y = 180 - ((avg - 1.0) / 6.0) * 160;

                        // Dot color based on risk status
                        let color = '#3b82f6'; // blue
                        if (student.status === 'Alerta de Riesgo') color = '#f59e0b'; // amber
                        if (student.status === 'Retirado') color = '#ef4444'; // rose

                        return (
                          <g key={student.id} className="cursor-pointer group/dot">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={student.status === 'Retirado' ? '4' : '5'} 
                              fill={color} 
                              stroke="#ffffff" 
                              strokeWidth="1.5"
                              className="transition-all hover:scale-150 duration-200"
                            />
                            {/* Dot tooltip label overlay on SVG */}
                            <g className="opacity-0 group-hover/dot:opacity-100 pointer-events-none transition-opacity duration-200 z-30">
                              <rect x={Math.min(380, x - 50)} y={y - 35} width="110" height="28" rx="4" fill="#0f172a" />
                              <text x={Math.min(380, x - 50) + 5} y={y - 23} className="text-[8px] fill-white font-bold">{student.name.substring(0, 18)}</text>
                              <text x={Math.min(380, x - 50) + 5} y={y - 13} className="text-[8px] fill-slate-300">Prom: {avg} | Asis: {student.attendance}%</text>
                            </g>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-4 px-1">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Regular
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Alerta de Riesgo
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Retirado / Deserción
                    </span>
                  </div>
                  <span>Pasa el cursor sobre un punto para identificar al estudiante</span>
                </div>
              </div>
            </div>

            {/* Custom Query Builder with Result Export */}
            <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Exportador de Reportes Curriculares</h3>
                  <p className="text-xs text-slate-500">Aplica filtros cruzados rápidos y descarga la base filtrada en formato CSV para Excel.</p>
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Descargar CSV Filtrado
                </button>
              </div>

              {/* Grid of criteria selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Especialidad</label>
                  <select 
                    value={selectedCareerFilter} 
                    onChange={(e) => setSelectedCareerFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="ALL">Todas las Especialidades</option>
                    {careersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estatus Estudiante</label>
                  <select 
                    value={selectedStatusFilter} 
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="ALL">Cualquier Estatus</option>
                    <option value="Regular">Alumnos Regular</option>
                    <option value="Alerta de Riesgo">Alerta de Riesgo</option>
                    <option value="Suspendido">Semestre Suspendido</option>
                    <option value="Retirado">Retirado / Desertor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Semestre Lectivo</label>
                  <select 
                    value={selectedSemesterFilter} 
                    onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="ALL">Todos los semestres</option>
                    <option value="1">1° Semestre</option>
                    <option value="2">2° Semestre</option>
                    <option value="3">3° Semestre</option>
                    <option value="4">4° Semestre</option>
                    <option value="5">5° Semestre</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setSelectedCareerFilter('ALL');
                      setSelectedStatusFilter('ALL');
                      setSelectedSemesterFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="w-full py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all text-center"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>

              {/* Table of query results */}
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[9px] uppercase tracking-wider font-extrabold sticky top-0 bg-white">
                      <th className="py-2 px-3">Nombre</th>
                      <th className="py-2 px-3">RUT</th>
                      <th className="py-2 px-3">Especialidad</th>
                      <th className="py-2 px-3 text-center">Semestre</th>
                      <th className="py-2 px-3 text-center">Asistencia</th>
                      <th className="py-2 px-3 text-center">Promedio</th>
                      <th className="py-2 px-3 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => {
                      const career = careersList.find(c => c.id === s.careerId);
                      const avg = calculateGPA(s.grades);
                      return (
                        <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 text-xs">
                          <td className="py-2 px-3 font-medium text-slate-800">{s.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-500">{s.rut}</td>
                          <td className="py-2 px-3 text-slate-600">{career?.name || s.careerId}</td>
                          <td className="py-2 px-3 text-center font-semibold">{s.semester}°</td>
                          <td className="py-2 px-3 text-center font-bold">{s.attendance}%</td>
                          <td className="py-2 px-3 text-center font-bold text-blue-600">{avg}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="font-semibold text-[10px] uppercase">{s.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: DESERCIÓN (ANÁLISIS DE DESERCIÓN) */}
        {activeTab === 'desercion' && (
          <div className="space-y-6" id="view-desercion animate-fade-in">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="desercion-kpis">
              {/* Card 1: Total Estudiantes (Histórico) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between transition-all hover:border-slate-300" id="card-desercion-total">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matrícula Histórica</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{students.length}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Alumnos ingresados totales</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Total Desertores */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between transition-all hover:border-slate-300" id="card-desercion-desertores">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudiantes Desertores</p>
                  <p className="text-3xl font-black text-red-600 mt-1">{totalDeserted}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Estatus "Retirado" o deserción</p>
                </div>
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Tasa de Deserción Global */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between transition-all hover:border-slate-300" id="card-desercion-tasa">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Deserción</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{overallDropoutRate}%</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Porcentaje global de retiro</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: Alumnos Activos */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between transition-all hover:border-slate-300" id="card-desercion-activos">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alumnos Activos</p>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{resolvedStudents.length - totalDeserted}</p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Regular / Alerta / Suspendido</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Career analysis section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs" id="desercion-career-analysis">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="font-extrabold text-slate-800 text-base">Análisis de Deserción por Carrera Técnica</h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual y cantidad de alumnos desertores (SITUACION) por especialidad.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="desercion-career-grid">
                {careerStats.map(c => {
                  const careerStudents = resolvedStudents.filter(s => s.careerId === c.id);
                  const totalwithdrawn = careerStudents.filter(s => s.status === 'Retirado').length;
                  const percent = careerStudents.length > 0 ? Math.round((totalwithdrawn / careerStudents.length) * 100) : 0;
                  
                  return (
                    <div key={c.id} className="border border-slate-150 rounded-2xl p-5 hover:bg-slate-50/50 transition-all flex flex-col justify-between" id={`career-desertion-card-${c.id}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-3 h-3 rounded-full ${c.color}`}></span>
                          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide truncate" title={c.name}>{c.name}</h4>
                        </div>
                        
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-xs text-slate-400 font-medium">Total Matriculados:</span>
                          <span className="text-xs font-extrabold text-slate-700">{careerStudents.length}</span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1.5">
                          <span className="text-xs text-slate-400 font-medium">Desertores (Retirados):</span>
                          <span className="text-sm font-black text-red-600">{totalwithdrawn}</span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1.5">
                          <span className="text-xs text-slate-400 font-medium">Tasa de Deserción:</span>
                          <span className="text-sm font-black text-slate-800">{percent}%</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, percent)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of desertores */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs" id="desercion-students-section">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Fichas de Estudiantes Desertores</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Nombres, detalles de contacto y situación oficial de la matrícula.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={desercionSearch}
                      onChange={(e) => setDesercionSearch(e.target.value)}
                      placeholder="Buscar por nombre, RUT..."
                      className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 w-full sm:w-64 focus:bg-white focus:outline-hidden transition-all text-slate-700 font-medium"
                    />
                    {desercionSearch && (
                      <button 
                        onClick={() => setDesercionSearch('')}
                        className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Career Filter */}
                  <select 
                    value={desercionCareerFilter}
                    onChange={(e) => setDesercionCareerFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3.5 py-2.5 text-slate-600 focus:bg-white focus:outline-hidden transition-all"
                  >
                    <option value="ALL">Todas las Carreras</option>
                    {careersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Desertores List Table */}
              <div className="overflow-x-auto">
                {resolvedStudents.filter(s => s.status === 'Retirado').filter(s => desercionCareerFilter === 'ALL' || s.careerId === desercionCareerFilter).filter(s => {
                  if (!desercionSearch) return true;
                  const query = desercionSearch.toLowerCase();
                  return s.name.toLowerCase().includes(query) || s.rut.toLowerCase().includes(query);
                }).length > 0 ? (
                  <table className="w-full text-left" id="desercion-table">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider font-extrabold pb-3">
                        <th className="py-3 px-4">Estudiante</th>
                        <th className="py-3 px-4">RUT</th>
                        <th className="py-3 px-4">Carrera</th>
                        <th className="py-3 px-4 text-center">Cohorte</th>
                        <th className="py-3 px-4 text-center">U. Asistencia</th>
                        <th className="py-3 px-4 text-center">U. Promedio</th>
                        <th className="py-3 px-4">SITUACIÓN (SITUACION)</th>
                        <th className="py-3 px-4 text-right">Contacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedStudents
                        .filter(s => s.status === 'Retirado')
                        .filter(s => desercionCareerFilter === 'ALL' || s.careerId === desercionCareerFilter)
                        .filter(s => {
                          if (!desercionSearch) return true;
                          const query = desercionSearch.toLowerCase();
                          return s.name.toLowerCase().includes(query) || s.rut.toLowerCase().includes(query);
                        })
                        .map(s => {
                          const career = careersList.find(c => c.id === s.careerId);
                          const avg = calculateGPA(s.grades);
                          const rawSituacion = s.situacion || 'RETIRADO';
                          
                          return (
                            <tr 
                              key={s.id} 
                              className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group text-xs animate-fade-in"
                              onClick={() => setSelectedStudentId(s.id)}
                              id={`student-row-desercion-${s.id}`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform uppercase">
                                    {s.name.slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Estudiante ID: {s.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-500 font-medium">{s.rut}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${career?.color || 'bg-slate-400'}`}></span>
                                  <span className="text-slate-600 font-medium truncate max-w-[200px]" title={career?.name}>{career?.name || s.careerId}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-500">2025</td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-bold text-red-600">{s.attendance}%</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-extrabold text-slate-700">{avg}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-bold text-[10px] tracking-wide uppercase border border-red-100">
                                  {rawSituacion}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1.5">
                                  <a 
                                    href={`mailto:${s.email}`}
                                    className="p-1.5 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                    title={`Enviar correo institucional a ${s.email}`}
                                  >
                                    <Mail className="w-4 h-4" />
                                  </a>
                                  {s.personalEmail && (
                                    <a 
                                      href={`mailto:${s.personalEmail}`}
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                      title={`Enviar correo personal a ${s.personalEmail}`}
                                    >
                                      <Mail className="w-4 h-4 text-emerald-600" />
                                    </a>
                                  )}
                                  <a 
                                    href={`https://wa.me/${s.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                    title={`Enviar mensaje de WhatsApp al ${s.phone}`}
                                  >
                                    <Phone className="w-4 h-4" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <TrendingDown className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No se encontraron estudiantes desertores</p>
                    <p className="text-xs text-slate-400 mt-1">Intente cambiar la carrera seleccionada o refine su búsqueda.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: NEW STUDENT REGISTRATION MODAL */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="new-student-modal">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Matricular Nuevo Estudiante
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Ingresa los datos reglamentarios para el registro oficial.</p>
              </div>
              <button 
                onClick={() => setIsNewStudentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewStudent} className="p-6 space-y-4">
              
              <div>
                <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ej: Sofia Araya Villalobos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">RUT Nacional *</label>
                  <input 
                    type="text" 
                    required
                    value={newStudentRut}
                    onChange={(e) => setNewStudentRut(e.target.value)}
                    placeholder="Ej: 19.876.543-K"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Carrera Técnica *</label>
                  <select 
                    value={newStudentCareer}
                    onChange={(e) => setNewStudentCareer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden font-semibold text-slate-700"
                  >
                    {careersList.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Semestre de Ingreso</label>
                  <select 
                    value={newStudentSemester}
                    onChange={(e) => setNewStudentSemester(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                  >
                    <option value="1">1° Semestre</option>
                    <option value="2">2° Semestre</option>
                    <option value="3">3° Semestre</option>
                    <option value="4">4° Semestre</option>
                    <option value="5">5° Semestre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Asistencia Inicial (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={newStudentAttendance}
                    onChange={(e) => setNewStudentAttendance(Number(e.target.value))}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="s.araya@cftacademia.cl"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Número de Celular</label>
                  <input 
                    type="text" 
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+56 9 8765 4321"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Al matricular al estudiante se le asignarán calificaciones basales automáticas aleatorias correspondientes al plan curricular de la carrera seleccionada.
              </p>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all text-center"
                >
                  Confirmar Matrícula
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SLIDE-UP DRAWER: STUDENT FILE DETAILS & GRADES CALCULATOR */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-fade-in" id="student-detail-drawer">
          <div className="max-w-4xl mx-auto min-h-screen flex flex-col justify-between p-6 md:p-12 w-full">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Expediente Académico del Alumno</span>
                <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* General card of selected student */}
              <div className="bg-slate-950 text-white rounded-[2rem] p-6 relative overflow-hidden mb-6 shadow-md shadow-slate-950/20">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                      {careersList.find(c => c.id === selectedStudent.careerId)?.name || selectedStudent.careerId}
                    </span>
                    <select
                      value={selectedStudent.status}
                      onChange={(e) => handleStatusChange(selectedStudent.id, e.target.value as Student['status'])}
                      className="bg-slate-800 text-white border-0 text-xs font-bold px-2.5 py-1 rounded-md focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Alerta de Riesgo">Alerta de Riesgo</option>
                      <option value="Suspendido">Suspendido</option>
                      <option value="Retirado">Retirado / Desertor</option>
                    </select>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white mb-1">{selectedStudent.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs mt-4 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">RUT Nacional</span>
                      <span className="font-mono">{selectedStudent.rut}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Semestre Lectivo</span>
                      <span>{selectedStudent.semester}° Semestre</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 p-5 border border-slate-100 rounded-2xl text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Correo Institucional</span>
                  <a 
                    href={`mailto:${selectedStudent.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium hover:underline truncate"
                    title={selectedStudent.email}
                  >
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">{selectedStudent.email}</span>
                  </a>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Correo Personal</span>
                  {selectedStudent.personalEmail ? (
                    <a 
                      href={`mailto:${selectedStudent.personalEmail}`}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium hover:underline truncate"
                      title={selectedStudent.personalEmail}
                    >
                      <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{selectedStudent.personalEmail}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                      No registrado
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp / Contacto</span>
                  <a 
                    href={getWhatsAppLink(selectedStudent.phone)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                    title="Enviar mensaje de WhatsApp"
                  >
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{selectedStudent.phone}</span>
                  </a>
                </div>
              </div>

              {/* AI WhatsApp Message Assistant Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Asistente de WhatsApp con IA</h4>
                      <p className="text-[10px] text-slate-500">Redacta notificaciones personalizadas con Inteligencia Artificial</p>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                    Gemini 3.5 Flash
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Preset Quick Buttons */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">Acciones Rápidas (Sugerencias)</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setAiPrompt("Recordar que la próxima semana hay una evaluación académica muy importante y animarle a prepararse con tiempo.")}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                      >
                        📅 Recordar Evaluación
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAiPrompt("Felicitar por su excelente desempeño académico reciente, su alto promedio y animarle a mantener esa gran actitud.")}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                      >
                        🏆 Felicitar Rendimiento
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAiPrompt("Expresar preocupación por su porcentaje de asistencia, preguntarle si ha tenido dificultades y ofrecerle apoyo académico.")}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                      >
                        ⚠️ Alerta de Inasistencia
                      </button>
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">¿Qué deseas comunicarle al estudiante?</label>
                    <div className="relative">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ej. Recordar la evaluación importante de fin de módulo..."
                        className="w-full h-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-none pr-12 text-slate-800 font-medium"
                      />
                      {aiPrompt && (
                        <button
                          type="button"
                          onClick={() => setAiPrompt('')}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-50 border border-slate-150 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Button & Error Alert */}
                  {aiMessageError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">Error de Generación</p>
                        <p>{aiMessageError}</p>
                      </div>
                      <button type="button" onClick={() => setAiMessageError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isGeneratingMessage || !aiPrompt.trim()}
                      onClick={() => handleGenerateWhatsAppMessage(selectedStudent)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isGeneratingMessage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generar Mensaje Personalizado
                        </>
                      )}
                    </button>
                  </div>

                  {/* Generated Message Editor & Send Button */}
                  {generatedMessage && (
                    <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mensaje Personalizado Generado (Puedes editarlo)</span>
                          <span className="text-[10px] text-slate-400 italic">Listo para WhatsApp</span>
                        </div>
                        <textarea
                          value={generatedMessage}
                          onChange={(e) => setGeneratedMessage(e.target.value)}
                          className="w-full h-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedMessage);
                            alert("¡Mensaje copiado al portapapeles!");
                          }}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </button>
                        <a
                          href={`${getWhatsAppLink(selectedStudent.phone)}?text=${encodeURIComponent(generatedMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          Enviar por WhatsApp 🚀
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Historical Qualifications Table */}
              <div className="space-y-4 mb-8 border border-slate-150 rounded-3xl p-5 bg-slate-50/50" id="linked-qualifications-module">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Asignaturas y Calificaciones Oficiales (Segunda Tabla)
                  </h4>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    Sincronizado por RUT
                  </span>
                </div>

                {studentQualifications.length > 0 ? (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {groupedQualifications.map((course) => (
                      <div key={course.courseCode} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <div className="max-w-[70%]">
                            <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded-sm mr-2 font-mono">
                              {course.courseCode}
                            </span>
                            <strong className="text-slate-800 text-xs font-bold">{course.courseName}</strong>
                            <p className="text-[10px] text-slate-400 mt-0.5">Docente: {course.teacher} | Semestre Nivel: {course.nivel}</p>
                          </div>
                          
                          <div className="flex gap-2 text-right self-end sm:self-center shrink-0">
                            <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-center min-w-[56px]">
                              <span className="text-[8px] text-slate-400 font-bold block uppercase">Asistencia</span>
                              <span className="text-[11px] font-black text-slate-700">{course.attendance}%</span>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-2 py-1 text-center min-w-[56px]">
                              <span className="text-[8px] text-emerald-600 font-bold block uppercase">Final</span>
                              <span className={`text-[11px] font-black ${course.finalGrade < 4.0 ? 'text-rose-600' : 'text-emerald-600'}`}>{course.finalGrade.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* List of evaluations within this course */}
                        {course.evaluations.length > 0 && (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px]">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 block">Evaluaciones Parciales</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                              {course.evaluations.map((evalItem, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-1.5 flex items-center justify-between border border-slate-150">
                                  <span className="text-[9px] text-slate-500 truncate font-semibold" title={evalItem.activity}>
                                    {evalItem.activity}
                                  </span>
                                  <span className={`text-[10px] font-bold ${evalItem.grade < 4.0 ? 'text-rose-600' : 'text-slate-700'}`}>
                                    {evalItem.grade.toFixed(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-500">No se encontraron calificaciones vinculadas para este estudiante</p>
                    <p className="text-[10px] text-slate-400 mt-1">Cargue el CSV de calificaciones desde la barra de navegación para ver su historial académico.</p>
                  </div>
                )}
              </div>

              {/* Interactive Grades Calculator Grid */}
              <div className="space-y-4 mb-8" id="grades-calculator-module">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    Ingreso y Modificación de Notas
                  </h4>
                  <span className="text-xs text-slate-500">Escala de 1.0 a 7.0</span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-3 bg-slate-50 px-4 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="col-span-2">Asignatura Curricular</div>
                    <div className="text-center">Calificación (Nota)</div>
                  </div>

                  <div className="divide-y divide-slate-50" id="grades-calculator-rows">
                    {Object.keys(selectedStudent.grades).map((subject) => {
                      const score = selectedStudent.grades[subject];
                      return (
                        <div key={subject} className="grid grid-cols-3 px-4 py-3 items-center text-xs">
                          <div className="col-span-2 font-medium text-slate-700">{subject}</div>
                          <div className="flex justify-center">
                            <input 
                              type="number" 
                              step="0.1" 
                              min="1.0" 
                              max="7.0"
                              value={score}
                              onChange={(e) => handleGradeChange(selectedStudent.id, subject, e.target.value)}
                              className={`w-16 px-2 py-1 bg-slate-50 border rounded-lg text-center font-bold text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                                score < 4.0 ? 'border-rose-300 text-rose-600 bg-rose-50' : 'border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic GPA recalculation row */}
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 uppercase">Promedio General Resultante:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black ${
                        calculateGPA(selectedStudent.grades) < 4.0 ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {calculateGPA(selectedStudent.grades)}
                      </span>
                      <span className="text-slate-400">/ 7.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance quick adjustment */}
              <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Ajustar Porcentaje de Asistencia</h4>
                  <p className="text-[10px] text-slate-500">Un nivel inferior al 75% activará automáticamente la Alerta de Deserción.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={selectedStudent.attendance}
                    onChange={(e) => handleAttendanceChange(selectedStudent.id, Number(e.target.value))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-bold text-xs"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>

              {/* Support logs for academic retention */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Bitácora de Acompañamiento y Retención</h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto" id="retention-logs">
                  {selectedStudent.supportLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No se han registrado medidas de intervención académica para este alumno.</p>
                  ) : (
                    selectedStudent.supportLogs.map((log, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 flex gap-2">
                        <span className="text-blue-600 font-bold shrink-0">•</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempSupportLog}
                    onChange={(e) => setTempSupportLog(e.target.value)}
                    placeholder="Registrar nueva acción de acompañamiento..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    onClick={() => handleAddSupportLog(selectedStudent.id)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    Agregar
                  </button>
                </div>
              </div>

            </div>

            {/* Close action */}
            <div className="pt-6 border-t border-slate-100 mt-6">
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs text-center transition-all"
              >
                Guardar y Cerrar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PRINTER-FRIENDLY FORMAL ACADEMIC REPORT */}
      {isReportPrinterPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="print-modal-overlay">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl w-full max-w-4xl p-8 my-8 relative overflow-hidden" id="reporte-oficial-cft">
            
            {/* Header controls inside modal */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs text-slate-500 font-bold">VISTA PREVIA DEL REPORTE ACADÉMICO OFICIAL</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Imprimir Documento
                </button>
                <button 
                  onClick={() => setIsReportPrinterPreviewOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Official Report Template */}
            <div className="space-y-6 text-slate-900">
              
              {/* Report Header Logo & Stamps */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 text-white font-black flex items-center justify-center rounded-xl text-lg">C</div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">CENTRO DE FORMACIÓN TÉCNICA ACADEMIA</h1>
                    <p className="text-[9px] text-slate-500 tracking-wider">Acreditado por la Comisión Nacional de Acreditación (CNA) • Chile</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-700">Folio: REP-2026-991</p>
                  <p className="text-slate-500">Fecha de Emisión: {new Date().toLocaleDateString('es-CL')}</p>
                </div>
              </div>

              {/* Title Section */}
              <div className="border-t-2 border-b-2 border-slate-900 py-3 text-center">
                <h2 className="text-base font-black tracking-widest uppercase">CONSOLIDADO ACADÉMICO GENERAL - SEGUNDO SEMESTRE 2026</h2>
                <p className="text-[10px] text-slate-500 mt-1">Sistemas de Registro de Matrículas, Deserción Escolar y Monitoreo Social CFT Academia</p>
              </div>

              {/* High level Metrics Summary Table */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Matrícula General</span>
                  <span className="text-lg font-black text-slate-900">{totalEnrolled}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Estudiantes Regulares</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Tasa de Deserción</span>
                  <span className="text-lg font-black text-rose-700">{overallDropoutRate}%</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Histórico Acumulado</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Promedio Calificaciones</span>
                  <span className="text-lg font-black text-blue-900">{overallAverageGPA}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Escala de 1.0 a 7.0</span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Estudiantes en Alerta</span>
                  <span className="text-lg font-black text-amber-700">{studentsAtRiskCount}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Acciones de Acompañamiento</span>
                </div>
              </div>

              {/* Sub table metrics by technical career */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">1. Desglose Estadístico por Especialidad Técnica</h3>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900 text-white font-bold uppercase text-[9px]">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Especialidad CFT</th>
                      <th className="py-2 px-3 text-center">Matrícula Activa</th>
                      <th className="py-2 px-3 text-center">Cupos Grales</th>
                      <th className="py-2 px-3 text-center">Asistencia Gral</th>
                      <th className="py-2 px-3 text-center">Notas Promedio</th>
                      <th className="py-2 px-3 text-right">Tasa Deserción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careerStats.map(c => (
                      <tr key={c.id} className="border-b border-slate-200">
                        <td className="py-2 px-3 font-bold font-mono">{c.id}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-2 px-3 text-center font-bold">{c.studentCount}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{c.capacity}</td>
                        <td className="py-2 px-3 text-center font-bold">{c.avgAttendance}%</td>
                        <td className="py-2 px-3 text-center font-extrabold text-blue-700">{c.avgGpa}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-700">{c.dropoutRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Risk students list section in print */}
              <div className="space-y-2 pt-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">2. Alumnos Vigentes bajo Estado de Alerta y Riesgo Académico</h3>
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-600">
                      <th className="py-1 px-2">Nombre Alumno</th>
                      <th className="py-1 px-2">RUT</th>
                      <th className="py-1 px-2">Carrera</th>
                      <th className="py-1 px-2 text-center">Asistencia</th>
                      <th className="py-1 px-2 text-center">Promedio</th>
                      <th className="py-1 px-2 text-right">Última Acción Registrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.status === 'Alerta de Riesgo').map(s => {
                      const career = careersList.find(c => c.id === s.careerId);
                      const avg = calculateGPA(s.grades);
                      const lastLog = s.supportLogs[s.supportLogs.length - 1] || 'Sin bitácora inicial';
                      return (
                        <tr key={s.id} className="border-b border-slate-100">
                          <td className="py-1.5 px-2 font-bold">{s.name}</td>
                          <td className="py-1.5 px-2 font-mono text-slate-500">{s.rut}</td>
                          <td className="py-1.5 px-2">{career?.name || s.careerId}</td>
                          <td className="py-1.5 px-2 text-center font-bold text-rose-600">{s.attendance}%</td>
                          <td className="py-1.5 px-2 text-center font-bold">{avg}</td>
                          <td className="py-1.5 px-2 text-right text-slate-600 truncate max-w-[200px]">{lastLog}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Certification stamps */}
              <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mt-8"></div>
                  <p className="font-bold text-slate-800 mt-2">Firma Encargado de Docencia</p>
                  <p className="text-[10px] text-slate-400">Dirección Académica CFT Academia</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mt-8"></div>
                  <p className="font-bold text-slate-800 mt-2">Firma Coordinador de Retención</p>
                  <p className="text-[10px] text-slate-400">Departamento de Apoyo Estudiantil</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: SUPABASE CONFIGURATION STEPPER */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="supabase-modal-overlay">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl w-full max-w-2xl p-6 md:p-8 relative overflow-hidden text-left" id="supabase-setup-modal">
            
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 animate-pulse" />
                <h3 className="text-lg font-extrabold text-slate-900">Conectar base de datos Supabase</h3>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <p className="text-xs text-slate-500 leading-relaxed">
                Este sistema soporta lectura y escritura en tiempo real conectándose directamente con su instancia de PostgreSQL en Supabase. Siga estos sencillos pasos para habilitarla en su despliegue de Github y Vercel:
              </p>

              <div className="space-y-4">
                {/* Paso 1 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Crear un proyecto en Supabase</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Inicie sesión en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">supabase.com</a> y cree un nuevo proyecto de base de datos Postgres.</p>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <div className="w-full">
                    <h4 className="font-bold text-xs text-slate-800">Inicializar Esquemas (SQL Editor)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Vaya al panel <strong>SQL Editor</strong> en Supabase, pegue el siguiente script SQL y ejecútelo para crear las tablas y las políticas de acceso (RLS):</p>
                    
                    {/* SQL code snippet container */}
                    <div className="mt-2 bg-slate-950 rounded-xl p-3 relative font-mono text-[10px] text-slate-300 border border-slate-800">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2000);
                        }}
                        className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-1 transition-all text-[9px] font-bold"
                      >
                        {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                      </button>
                      <pre className="max-h-[160px] overflow-y-auto pr-2 pt-5 select-all scrollbar-thin text-left whitespace-pre-wrap">
                        {SUPABASE_SETUP_SQL}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Configurar Variables de Entorno</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Copie las credenciales <strong>Project URL</strong> y <strong>Anon Key</strong> desde la sección <i>Settings &gt; API</i> de Supabase, e inyéctelas en la configuración de su sitio en Vercel:</p>
                    <div className="mt-2 bg-slate-50 border rounded-lg p-2.5 space-y-1 font-mono text-[10px] text-slate-700">
                      <p>VITE_SUPABASE_URL=tu_project_url_aqui</p>
                      <p>VITE_SUPABASE_ANON_KEY=tu_anon_public_key_aqui</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowSqlModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: CSV QUALIFICATIONS IMPORT MODAL */}
      {isImportGradesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="import-grades-modal-overlay">
          <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl w-full max-w-xl p-6 md:p-8 relative overflow-hidden text-left animate-scale-up" id="import-grades-modal">
            
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Importar Calificaciones y Asistencia</h3>
              </div>
              <button 
                onClick={() => {
                  setIsImportGradesModalOpen(false);
                  setPendingImportData(null);
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!pendingImportData ? (
              <div className="space-y-5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cargue el archivo de calificaciones (en formato CSV con separador de comas, punto y coma, o tabulador) para sincronizar las notas de sus alumnos de forma masiva.
                </p>

                {/* Drag & drop upload zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                  id="csv-drag-drop-zone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      const file = files[0];
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const text = evt.target?.result as string;
                        const parsed = handleParseQualificationsCSV(text);
                        if (parsed && parsed.length > 0) {
                          setPendingImportData(parsed);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const text = evt.target?.result as string;
                          const parsed = handleParseQualificationsCSV(text);
                          if (parsed && parsed.length > 0) {
                            setPendingImportData(parsed);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden" 
                    accept=".csv,.txt"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Haga clic o arrastre su archivo CSV aquí</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Soporta formatos .csv codificados en UTF-8</p>
                </div>

                {/* CSV Format Reference Header info */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-[10px]">
                  <span className="font-bold text-slate-700 block uppercase mb-1.5">Cabeceras Requeridas del CSV:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-slate-500">
                    <div>• <strong className="text-slate-700">RUT</strong> (Identificador único)</div>
                    <div>• <strong className="text-slate-700">NOMBRE_ALUMNO</strong> (Nombre)</div>
                    <div>• <strong className="text-slate-700">COD_CURSO</strong> (Código de Curso)</div>
                    <div>• <strong className="text-slate-700">NOMBRE_CURSO</strong> (Asignatura)</div>
                    <div>• <strong className="text-slate-700">NOTA_PARCIAL</strong> (Evaluación)</div>
                    <div>• <strong className="text-slate-700">NOTA_FINAL_CURSO</strong> (Final)</div>
                    <div>• <strong className="text-slate-700">PORCENTAJE_ASISTENCIA</strong> (%)</div>
                    <div>• <strong className="text-slate-700">ESTADO_ALUMNO</strong> (SITUACION)</div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2.5 leading-normal">
                    Nota: Las notas se vincularán en tiempo real por RUT. Los estudiantes ausentes en la base se matricularán automáticamente si confirma la acción.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-800">Archivo Procesado con Éxito</h4>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Se detectaron <strong>{pendingImportData.length} registros</strong> de calificaciones listos para importar.</p>
                  </div>
                </div>

                {/* Preliminary list of imports */}
                <div className="border border-slate-150 rounded-xl max-h-[220px] overflow-y-auto divide-y divide-slate-100 text-xs">
                  {pendingImportData.slice(0, 50).map((row, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div>
                        <strong className="text-slate-800 text-[11px] font-bold block">{row.NOMBRE_ALUMNO}</strong>
                        <span className="text-[9px] text-slate-400 font-medium">RUT {row.RUT} • {row.NOMBRE_CURSO} ({row.COD_CURSO})</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mr-1">Final: {row.NOTA_FINAL_CURSO}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Asis: {row.PORCENTAJE_ASISTENCIA}%</span>
                      </div>
                    </div>
                  ))}
                  {pendingImportData.length > 50 && (
                    <div className="p-2.5 text-center bg-slate-100 text-slate-400 text-[10px] font-bold uppercase">
                      + {pendingImportData.length - 50} registros adicionales...
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setPendingImportData(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Volver a cargar
                  </button>
                  <button 
                    onClick={async () => {
                      const data = [...pendingImportData];
                      setIsImportGradesModalOpen(false);
                      setPendingImportData(null);
                      await handleSaveQualifications(data);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar e Importar Todo
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
