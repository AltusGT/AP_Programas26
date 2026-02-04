#!/usr/bin/env node
/**
 * Script para actualizar la vista de métricas en Supabase
 * Ejecuta: node actualizar_vista.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: No se encontraron las credenciales de Supabase en .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function actualizarVista() {
    console.log('🔄 Actualizando vista de métricas...\n')

    try {
        // Leer el archivo SQL
        const sql = fs.readFileSync('actualizar_vista_metricas.sql', 'utf8')

        console.log('📝 SQL a ejecutar:')
        console.log('─'.repeat(60))
        console.log(sql)
        console.log('─'.repeat(60))
        console.log()

        // Ejecutar el SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

        if (error) {
            // Si no existe la función exec_sql, dar instrucciones manuales
            if (error.message.includes('function') || error.code === '42883') {
                console.log('⚠️  No se puede ejecutar SQL directamente desde el cliente.')
                console.log('📋 Por favor, ejecuta manualmente en Supabase:')
                console.log()
                console.log('1. Ve a tu proyecto en Supabase Dashboard')
                console.log('2. Navega a: SQL Editor')
                console.log('3. Copia y pega el contenido de: actualizar_vista_metricas.sql')
                console.log('4. Haz clic en "Run"')
                console.log()
                console.log('O ejecuta este comando SQL directamente:')
                console.log()
                console.log('─'.repeat(60))
                console.log(`
CREATE OR REPLACE VIEW vista_metricas_dashboard AS
SELECT 
  COUNT(*) FILTER (WHERE estado = 'Abierto') as programas_abiertos,
  COUNT(*) FILTER (WHERE estado = 'Logrado') as programas_logrados,
  COUNT(DISTINCT estudiante) FILTER (WHERE estado = 'Abierto') as total_estudiantes,
  COUNT(DISTINCT programa) as total_programas,
  ROUND(AVG(pre_test) FILTER (WHERE pre_test IS NOT NULL), 2) as promedio_pre_test,
  ROUND(AVG(post_test) FILTER (WHERE post_test IS NOT NULL), 2) as promedio_post_test
FROM registros_programas;
                `)
                console.log('─'.repeat(60))
                return
            }
            throw error
        }

        console.log('✅ Vista actualizada exitosamente!')

        // Verificar la vista
        console.log('\n🔍 Verificando la vista...')
        const { data: metricas, error: metricasError } = await supabase
            .from('vista_metricas_dashboard')
            .select('*')
            .single()

        if (metricasError) throw metricasError

        console.log('\n📊 Métricas actuales:')
        console.log('─'.repeat(60))
        console.log(`Programas Abiertos: ${metricas.programas_abiertos}`)
        console.log(`Programas Logrados: ${metricas.programas_logrados}`)
        console.log(`Total Estudiantes (con programas activos): ${metricas.total_estudiantes}`)
        console.log(`Total Programas: ${metricas.total_programas}`)
        console.log(`Promedio Pre-Test: ${metricas.promedio_pre_test}%`)
        console.log(`Promedio Post-Test: ${metricas.promedio_post_test}%`)
        console.log('─'.repeat(60))
        console.log()
        console.log('✅ ¡Todo listo! La vista ahora cuenta correctamente los estudiantes únicos con programas activos.')

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('\n💡 Solución: Ejecuta el SQL manualmente en Supabase Dashboard > SQL Editor')
        process.exit(1)
    }
}

actualizarVista()
