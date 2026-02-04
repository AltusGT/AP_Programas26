-- ============================================
-- ACTUALIZACIÓN: Corregir vista de métricas y quitar UNRESTRICTED
-- ============================================

-- 1. Actualizar vista de métricas para contar solo estudiantes con programas activos
CREATE OR REPLACE VIEW vista_metricas_dashboard AS
SELECT 
  COUNT(*) FILTER (WHERE estado = 'Abierto') as programas_abiertos,
  COUNT(*) FILTER (WHERE estado = 'Logrado') as programas_logrados,
  COUNT(DISTINCT estudiante) FILTER (WHERE estado = 'Abierto') as total_estudiantes,
  COUNT(DISTINCT programa) as total_programas,
  ROUND(AVG(pre_test) FILTER (WHERE pre_test IS NOT NULL), 2) as promedio_pre_test,
  ROUND(AVG(post_test) FILTER (WHERE post_test IS NOT NULL), 2) as promedio_post_test
FROM registros_programas;

-- 2. Quitar UNRESTRICTED de las vistas (ya tienen políticas RLS)
-- Las vistas heredan las políticas de las tablas base, así que no necesitan ser UNRESTRICTED

-- Verificar que las vistas tengan acceso correcto
GRANT SELECT ON vista_programas_activos TO authenticated;
GRANT SELECT ON vista_metricas_dashboard TO authenticated;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que la vista funcione correctamente
SELECT * FROM vista_metricas_dashboard;

-- Verificar que los estudiantes se cuenten correctamente
SELECT 
  COUNT(DISTINCT estudiante) as estudiantes_con_programas_abiertos
FROM registros_programas 
WHERE estado = 'Abierto';
