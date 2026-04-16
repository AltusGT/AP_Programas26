import type { Database } from './database.types'

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']

// Specific table types
export type Estudiante = Tables<'estudiantes'>
export type ProgramaCatalogo = Tables<'programas_catalogo'>
export type RegistroPrograma = Tables<'registros_programas'>
export type RolUsuario = Tables<'roles_usuarios'>
export type ProgramaOCP = Tables<'programas_ocp'>

// Insert types
export type EstudianteInsert = Inserts<'estudiantes'>
export type ProgramaCatalogoInsert = Inserts<'programas_catalogo'>
export type RegistroProgramaInsert = Inserts<'registros_programas'>
export type ProgramaOCPInsert = Inserts<'programas_ocp'>

// Update types
export type EstudianteUpdate = Updates<'estudiantes'>
export type ProgramaCatalogoUpdate = Updates<'programas_catalogo'>
export type RegistroProgramaUpdate = Updates<'registros_programas'>
export type ProgramaOCPUpdate = Updates<'programas_ocp'>

// View types
export type ProgramaActivo = Database['public']['Views']['vista_programas_activos']['Row'] & {
    id: string; // Ensure id is indexed
    estado?: 'Abierto' | 'Logrado';
    post_test?: number | null;
    fecha_final?: string | null;
}
export type MetricasDashboard = Database['public']['Views']['vista_metricas_dashboard']['Row']

// Enum types
export type EstadoPrograma = 'Abierto' | 'Logrado'
export type Rol = 'terapeuta' | 'supervisora' | 'admin'
export type FaseOCP = 'Inicial' | 'Final' | 'Generalización'

// Extended types with computed fields
export interface RegistroProgramaExtended extends RegistroPrograma {
    promedioGeneralizacion?: number
    diasTranscurridos?: number
    progreso?: number
}

// Form types
export interface RegistroFormData {
    estudiante: string
    programa: string
    ocp: number
    criterio: string
    fecha_inicio: string
    pre_test?: number
    post_test?: number
    fecha_final?: string
    estado?: EstadoPrograma
    fecha_g1?: string
    resultado_g1?: number
    fecha_g2?: string
    resultado_g2?: number
    fecha_g3?: string
    resultado_g3?: number
}

export interface CerrarProgramaData {
    registro_id: string
    fecha_final: string
    post_test: number
}

// Auth types
export interface UserSession {
    user: {
        id: string
        email?: string
    }
    rol?: Rol
}

// Re-export database type
export type { Database }
