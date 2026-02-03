/**
 * Database types - Generated from Supabase schema
 * 
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            estudiantes: {
                Row: {
                    id: string
                    nombre: string
                    activo: boolean
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    activo?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    activo?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Relationships: []
            }
            programas_catalogo: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string | null
                    activo: boolean
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    nombre: string
                    descripcion?: string | null
                    activo?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    nombre?: string
                    descripcion?: string | null
                    activo?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Relationships: []
            }
            programas_ocp: {
                Row: {
                    id: string
                    programa_id: string
                    numero_ocp: number
                    criterio: string
                    fecha_creacion: string
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    programa_id: string
                    numero_ocp: number
                    criterio: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    programa_id?: string
                    numero_ocp?: number
                    criterio?: string
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'programas_ocp_programa_id_fkey'
                        columns: ['programa_id']
                        referencedRelation: 'programas_catalogo'
                        referencedColumns: ['id']
                    }
                ]
            }
            registros_programas: {
                Row: {
                    id: string
                    estudiante: string
                    programa: string
                    ocp: number
                    criterio: string
                    fecha_inicio: string
                    pre_test: number | null
                    fecha_final: string | null
                    post_test: number | null
                    estado: 'Abierto' | 'Logrado'
                    fecha_g1: string | null
                    resultado_g1: number | null
                    fecha_g2: string | null
                    resultado_g2: number | null
                    fecha_g3: string | null
                    resultado_g3: number | null
                    creado_por: string | null
                    fecha_creacion: string
                    actualizado_por: string | null
                    fecha_actualizacion: string
                }
                Insert: {
                    id?: string
                    estudiante: string
                    programa: string
                    ocp: number
                    criterio: string
                    fecha_inicio: string
                    pre_test?: number | null
                    fecha_final?: string | null
                    post_test?: number | null
                    estado?: 'Abierto' | 'Logrado'
                    fecha_g1?: string | null
                    resultado_g1?: number | null
                    fecha_g2?: string | null
                    resultado_g2?: number | null
                    fecha_g3?: string | null
                    resultado_g3?: number | null
                    creado_por?: string | null
                    fecha_creacion?: string
                    actualizado_por?: string | null
                    fecha_actualizacion?: string
                }
                Update: {
                    id?: string
                    estudiante?: string
                    programa?: string
                    ocp?: number
                    criterio?: string
                    fecha_inicio?: string
                    pre_test?: number | null
                    fecha_final?: string | null
                    post_test?: number | null
                    estado?: 'Abierto' | 'Logrado'
                    fecha_g1?: string | null
                    resultado_g1?: number | null
                    fecha_g2?: string | null
                    resultado_g2?: number | null
                    fecha_g3?: string | null
                    resultado_g3?: number | null
                    creado_por?: string | null
                    fecha_creacion?: string
                    actualizado_por?: string | null
                    fecha_actualizacion?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'registros_programas_creado_por_fkey'
                        columns: ['creado_por']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'registros_programas_actualizado_por_fkey'
                        columns: ['actualizado_por']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    }
                ]
            }
            roles_usuarios: {
                Row: {
                    id: string
                    user_id: string | null
                    email: string
                    rol: 'terapeuta' | 'supervisora' | 'admin'
                    activo: boolean
                    fecha_creacion: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    email: string
                    rol: 'terapeuta' | 'supervisora' | 'admin'
                    activo?: boolean
                    fecha_creacion?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    email?: string
                    rol?: 'terapeuta' | 'supervisora' | 'admin'
                    activo?: boolean
                    fecha_creacion?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'roles_usuarios_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    }
                ]
            }
        }
        Views: {
            vista_programas_activos: {
                Row: {
                    id: string
                    estudiante: string
                    programa: string
                    ocp: number
                    criterio: string
                    fecha_inicio: string
                    pre_test: number | null
                    fecha_g1: string | null
                    resultado_g1: number | null
                    fecha_g2: string | null
                    resultado_g2: number | null
                    fecha_g3: string | null
                    resultado_g3: number | null
                    promedio_generalizacion: number | null
                    fecha_creacion: string
                }
            }
            vista_metricas_dashboard: {
                Row: {
                    programas_abiertos: number
                    programas_logrados: number
                    total_estudiantes: number
                    total_programas: number
                    promedio_pre_test: number | null
                    promedio_post_test: number | null
                }
            }
        }
        Functions: {
            get_user_role: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            cerrar_programa: {
                Args: {
                    p_registro_id: string
                    p_fecha_final: string
                    p_post_test: number
                }
                Returns: void
            }
        }
        Enums: {
            estado_programa: 'Abierto' | 'Logrado'
            rol_usuario: 'terapeuta' | 'supervisora' | 'admin'
        }
    }
}
