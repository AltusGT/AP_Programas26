-- ============================================
-- THERAPEUTIC PROGRAMS TRACKING DATABASE
-- Supabase SQL Schema with RLS Policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: estudiantes
-- Stores student information
-- ============================================
CREATE TABLE IF NOT EXISTS estudiantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: programas_catalogo
-- Catalog of available therapeutic programs
-- ============================================
CREATE TABLE IF NOT EXISTS programas_catalogo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: programas_ocp
-- Stores specific criteria for each OCP of a program
-- ============================================
CREATE TABLE IF NOT EXISTS programas_ocp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programa_id UUID REFERENCES programas_catalogo(id) ON DELETE CASCADE,
  numero_ocp INTEGER NOT NULL CHECK (numero_ocp BETWEEN 1 AND 9),
  criterio TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(programa_id, numero_ocp)
);

-- ============================================
-- TABLE: registros_programas
-- Main table for program tracking and results
-- ============================================
CREATE TABLE IF NOT EXISTS registros_programas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Student and Program Information
  estudiante TEXT NOT NULL,
  programa TEXT NOT NULL,
  ocp INTEGER NOT NULL CHECK (ocp > 0),
  criterio TEXT NOT NULL,
  
  -- Program Timeline and Results
  fecha_inicio DATE NOT NULL,
  pre_test NUMERIC(5,2) CHECK (pre_test >= 0 AND pre_test <= 100),
  fecha_final DATE,
  post_test NUMERIC(5,2) CHECK (post_test >= 0 AND post_test <= 100),
  
  -- Program Status
  estado TEXT NOT NULL DEFAULT 'Abierto' CHECK (estado IN ('Abierto', 'Logrado')),
  
  -- Generalization Sessions (G1, G2, G3)
  fecha_g1 DATE,
  resultado_g1 NUMERIC(5,2) CHECK (resultado_g1 >= 0 AND resultado_g1 <= 100),
  fecha_g2 DATE,
  resultado_g2 NUMERIC(5,2) CHECK (resultado_g2 >= 0 AND resultado_g2 <= 100),
  fecha_g3 DATE,
  resultado_g3 NUMERIC(5,2) CHECK (resultado_g3 >= 0 AND resultado_g3 <= 100),
  
  -- Metadata
  creado_por UUID REFERENCES auth.users(id),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  actualizado_por UUID REFERENCES auth.users(id),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (
    fecha_final IS NULL OR fecha_final >= fecha_inicio
  ),
  CONSTRAINT valid_g_dates CHECK (
    (fecha_g1 IS NULL OR fecha_g1 >= fecha_inicio) AND
    (fecha_g2 IS NULL OR fecha_g2 >= fecha_inicio) AND
    (fecha_g3 IS NULL OR fecha_g3 >= fecha_inicio)
  )
);

-- ============================================
-- TABLE: roles_usuarios
-- User roles and permissions
-- ============================================
CREATE TABLE IF NOT EXISTS roles_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('terapeuta', 'supervisora', 'admin')),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, rol)
);

-- ============================================
-- INDEXES for Performance Optimization
-- ============================================

-- Indexes for estudiantes
CREATE INDEX idx_estudiantes_nombre ON estudiantes(nombre);
CREATE INDEX idx_estudiantes_activo ON estudiantes(activo);

-- Indexes for programas_catalogo
CREATE INDEX idx_programas_nombre ON programas_catalogo(nombre);
CREATE INDEX idx_programas_activo ON programas_catalogo(activo);

-- Indexes for programas_ocp
CREATE INDEX idx_programas_ocp_programa_id ON programas_ocp(programa_id);

-- Indexes for registros_programas (optimized for queries)
CREATE INDEX idx_registros_estudiante ON registros_programas(estudiante);
CREATE INDEX idx_registros_programa ON registros_programas(programa);
CREATE INDEX idx_registros_estado ON registros_programas(estado);
CREATE INDEX idx_registros_fecha_inicio ON registros_programas(fecha_inicio);
CREATE INDEX idx_registros_ocp ON registros_programas(ocp);
CREATE INDEX idx_registros_creado_por ON registros_programas(creado_por);

-- Composite indexes for common queries
CREATE INDEX idx_registros_estudiante_estado ON registros_programas(estudiante, estado);
CREATE INDEX idx_registros_estado_fecha ON registros_programas(estado, fecha_inicio DESC);

-- Indexes for roles_usuarios
CREATE INDEX idx_roles_user_id ON roles_usuarios(user_id);
CREATE INDEX idx_roles_email ON roles_usuarios(email);
CREATE INDEX idx_roles_rol ON roles_usuarios(rol);

-- ============================================
-- TRIGGERS for automatic timestamp updates
-- ============================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_estudiantes_timestamp
  BEFORE UPDATE ON estudiantes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_programas_timestamp
  BEFORE UPDATE ON programas_catalogo
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_programas_ocp_timestamp
  BEFORE UPDATE ON programas_ocp
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_registros_timestamp
  BEFORE UPDATE ON registros_programas
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas_ocp ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function to get user role
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT rol FROM roles_usuarios 
  WHERE user_id = auth.uid() 
  AND activo = true 
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- POLICIES: estudiantes
-- ============================================

-- Anyone authenticated can read active students
CREATE POLICY "Anyone can read active students"
  ON estudiantes FOR SELECT
  TO authenticated
  USING (activo = true);

-- Only supervisors and admins can insert students
CREATE POLICY "Supervisors can insert students"
  ON estudiantes FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role() IN ('supervisora', 'admin')
  );

-- Only supervisors and admins can update students
CREATE POLICY "Supervisors can update students"
  ON estudiantes FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('supervisora', 'admin'))
  WITH CHECK (get_user_role() IN ('supervisora', 'admin'));

-- Only admins can delete students
CREATE POLICY "Admins can delete students"
  ON estudiantes FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- ============================================
-- POLICIES: programas_catalogo
-- ============================================

-- Anyone authenticated can read active programs
CREATE POLICY "Anyone can read active programs"
  ON programas_catalogo FOR SELECT
  TO authenticated
  USING (activo = true);

-- Only supervisors and admins can manage programs
CREATE POLICY "Supervisors can insert programs"
  ON programas_catalogo FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('supervisora', 'admin'));

CREATE POLICY "Supervisors can update programs"
  ON programas_catalogo FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('supervisora', 'admin'))
  WITH CHECK (get_user_role() IN ('supervisora', 'admin'));

CREATE POLICY "Admins can delete programs"
  ON programas_catalogo FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- ============================================
-- POLICIES: programas_ocp
-- ============================================

-- Anyone authenticated can read OCPs
CREATE POLICY "Anyone can read program OCPs"
  ON programas_ocp FOR SELECT
  TO authenticated
  USING (true);

-- Only supervisors and admins can manage OCPs
CREATE POLICY "Supervisors can manage OCPs"
  ON programas_ocp FOR ALL
  TO authenticated
  USING (get_user_role() IN ('supervisora', 'admin'))
  WITH CHECK (get_user_role() IN ('supervisora', 'admin'));

-- ============================================
-- POLICIES: registros_programas
-- ============================================

-- Everyone can read all records (for dashboard)
CREATE POLICY "Anyone can read program records"
  ON registros_programas FOR SELECT
  TO authenticated
  USING (true);

-- Therapists can insert their own records
CREATE POLICY "Therapists can insert records"
  ON registros_programas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Therapists can update their own records, supervisors can update any
CREATE POLICY "Users can update records"
  ON registros_programas FOR UPDATE
  TO authenticated
  USING (
    creado_por = auth.uid() OR 
    get_user_role() IN ('supervisora', 'admin')
  )
  WITH CHECK (
    creado_por = auth.uid() OR 
    get_user_role() IN ('supervisora', 'admin')
  );

-- Only supervisors and admins can delete records
CREATE POLICY "Supervisors can delete records"
  ON registros_programas FOR DELETE
  TO authenticated
  USING (get_user_role() IN ('supervisora', 'admin'));

-- ============================================
-- POLICIES: roles_usuarios
-- ============================================

-- Users can read their own role
CREATE POLICY "Users can read own role"
  ON roles_usuarios FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON roles_usuarios FOR ALL
  TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ============================================
-- INITIAL DATA (Example/Default)
-- ============================================

-- Insert example programs
INSERT INTO programas_catalogo (nombre, descripcion) VALUES
  ('Sentado', 'Programa para enseñar al perro a sentarse a la señal'),
  ('Comunicación Funcional', 'Programa para desarrollar habilidades de comunicación'),
  ('Habilidades Sociales', 'Desarrollo de interacciones sociales apropiadas'),
  ('Conducta Adaptativa', 'Mejora de conductas adaptativas en diferentes contextos'),
  ('Autonomía Personal', 'Desarrollo de independencia en actividades diarias')
ON CONFLICT (nombre) DO NOTHING;

-- Insert example OCPs for "Sentado"
WITH p AS (SELECT id FROM programas_catalogo WHERE nombre = 'Sentado' LIMIT 1)
INSERT INTO programas_ocp (programa_id, numero_ocp, criterio)
SELECT p.id, t.num, t.crit
FROM p, (VALUES 
  (1, 'Sentado con luring'),
  (2, 'Sentado sin luring (señal de voz)'),
  (3, 'Sentado con el guía alejándose 5m'),
  (4, 'Sentado con el guía alejándose 10m'),
  (5, 'Sentado con el guía alejándose 10m y tocando muros y objetos'),
  (6, 'Sentado con el guía alejándose 10m regresar ponerle la correa y alejarse 10m'),
  (7, 'Sentado con el guía alejándose fuera de la vista del perro por 10s'),
  (8, 'Sentado con el guía alejándose de la vista del perro por 1 minuto'),
  (9, 'Sentado + otros perros y personas corriendo, moviéndose y gritando')
) AS t(num, crit)
ON CONFLICT (programa_id, numero_ocp) DO NOTHING;

-- Insert example students
INSERT INTO estudiantes (nombre) VALUES
  ('Estudiante Ejemplo 1'),
  ('Estudiante Ejemplo 2'),
  ('Estudiante Ejemplo 3')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View: Active programs summary
CREATE OR REPLACE VIEW vista_programas_activos AS
SELECT 
  id,
  estudiante,
  programa,
  ocp,
  criterio,
  fecha_inicio,
  pre_test,
  fecha_g1,
  resultado_g1,
  fecha_g2,
  resultado_g2,
  fecha_g3,
  resultado_g3,
  CASE 
    WHEN resultado_g1 IS NOT NULL AND resultado_g2 IS NOT NULL AND resultado_g3 IS NOT NULL 
    THEN ROUND((resultado_g1 + resultado_g2 + resultado_g3) / 3, 2)
    WHEN resultado_g1 IS NOT NULL AND resultado_g2 IS NOT NULL 
    THEN ROUND((resultado_g1 + resultado_g2) / 2, 2)
    WHEN resultado_g1 IS NOT NULL 
    THEN resultado_g1
    ELSE NULL
  END as promedio_generalizacion,
  fecha_creacion
FROM registros_programas
WHERE estado = 'Abierto'
ORDER BY fecha_inicio DESC;

-- View: Dashboard metrics
CREATE OR REPLACE VIEW vista_metricas_dashboard AS
SELECT 
  COUNT(*) FILTER (WHERE estado = 'Abierto') as programas_abiertos,
  COUNT(*) FILTER (WHERE estado = 'Logrado') as programas_logrados,
  COUNT(DISTINCT estudiante) as total_estudiantes,
  COUNT(DISTINCT programa) as total_programas,
  ROUND(AVG(pre_test) FILTER (WHERE pre_test IS NOT NULL), 2) as promedio_pre_test,
  ROUND(AVG(post_test) FILTER (WHERE post_test IS NOT NULL), 2) as promedio_post_test
FROM registros_programas;

-- Grant access to views
GRANT SELECT ON vista_programas_activos TO authenticated;
GRANT SELECT ON vista_metricas_dashboard TO authenticated;

-- ============================================
-- FUNCTIONS for Common Operations
-- ============================================

-- Function to close a program (mark as "Logrado")
CREATE OR REPLACE FUNCTION cerrar_programa(
  p_registro_id UUID,
  p_fecha_final DATE,
  p_post_test NUMERIC
)
RETURNS void AS $$
BEGIN
  UPDATE registros_programas
  SET 
    estado = 'Logrado',
    fecha_final = p_fecha_final,
    post_test = p_post_test,
    actualizado_por = auth.uid()
  WHERE id = p_registro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cerrar_programa TO authenticated;
