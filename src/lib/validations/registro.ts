import { z } from 'zod'

/**
 * Zod schema para validación del formulario de registro de programas
 */
export const registroSchema = z.object({
    // Información Básica (Requerida)
    estudiante: z.string().min(1, 'Estudiante es requerido'),
    programa: z.string().min(1, 'Programa es requerido'),
    ocp: z.coerce.number().int('OCP debe ser un número entero').positive('OCP debe ser mayor a 0'),
    criterio: z.string().min(10, 'El criterio debe tener al menos 10 caracteres'),
    fecha_inicio: z.string().min(1, 'Fecha de inicio es requerida'),
    pre_test: z.coerce.number().min(0, 'Pre-test debe ser al menos 0').max(100, 'Pre-test no puede exceder 100').nullable().optional(),

    // Finalización (Opcional)
    fecha_final: z.string().nullable().optional(),
    post_test: z.coerce.number().min(0, 'Post-test debe ser al menos 0').max(100, 'Post-test no puede exceder 100').nullable().optional(),
    estado: z.enum(['Abierto', 'Logrado']).default('Abierto'),

    // Generalizaciones (Opcional)
    fecha_g1: z.string().nullable().optional(),
    resultado_g1: z.coerce.number().min(0).max(100).nullable().optional(),
    fecha_g2: z.string().nullable().optional(),
    resultado_g2: z.coerce.number().min(0).max(100).nullable().optional(),
    fecha_g3: z.string().nullable().optional(),
    resultado_g3: z.coerce.number().min(0).max(100).nullable().optional(),
}).refine(data => {
    // Validación: Si hay fecha_final, debe ser >= fecha_inicio
    if (data.fecha_final && data.fecha_inicio) {
        return new Date(data.fecha_final) >= new Date(data.fecha_inicio)
    }
    return true
}, {
    message: 'Fecha final debe ser posterior o igual a la fecha de inicio',
    path: ['fecha_final']
}).refine(data => {
    // Validación: Si hay resultado_g1, debe haber fecha_g1
    if (data.resultado_g1 !== null && data.resultado_g1 !== undefined && !data.fecha_g1) {
        return false
    }
    return true
}, {
    message: 'Debe especificar la fecha de G1',
    path: ['fecha_g1']
}).refine(data => {
    // Validación: Si hay resultado_g2, debe haber fecha_g2
    if (data.resultado_g2 !== null && data.resultado_g2 !== undefined && !data.fecha_g2) {
        return false
    }
    return true
}, {
    message: 'Debe especificar la fecha de G2',
    path: ['fecha_g2']
}).refine(data => {
    // Validación: Si hay resultado_g3, debe haber fecha_g3
    if (data.resultado_g3 !== null && data.resultado_g3 !== undefined && !data.fecha_g3) {
        return false
    }
    return true
}, {
    message: 'Debe especificar la fecha de G3',
    path: ['fecha_g3']
})

export type RegistroFormData = z.infer<typeof registroSchema>

/**
 * Valores por defecto del formulario
 */
export const defaultValues: Partial<RegistroFormData> = {
    estado: 'Abierto',
    pre_test: null,
    post_test: null,
    fecha_final: null,
    fecha_g1: null,
    resultado_g1: null,
    fecha_g2: null,
    resultado_g2: null,
    fecha_g3: null,
    resultado_g3: null,
}
