# 📊 GUÍA COMPLETA: Carga Masiva de Datos

## 🎯 Resumen del Proceso

1. **Crear Google Sheets** con la estructura correcta
2. **Llenar los datos** (tu equipo)
3. **Descargar como CSV**
4. **Ejecutar script** para subir a Supabase

---

## 📋 PASO 1: Crear Google Sheets

### Estructura del archivo:

Crear un Google Sheet con **2 hojas/pestañas**:

#### **Hoja 1: "Programas_y_OCPs"**

| programa_nombre | ocp_numero | ocp_criterio |
|----------------|------------|--------------|
| Sentado | 1 | Sentado con luring |
| Sentado | 2 | Sentado sin luring (señal de voz) |
| Comunicación Funcional | 1 | Solicitar objetos mediante señas |

**Reglas:**
- ✅ `programa_nombre`: Nombre del programa (texto)
- ✅ `ocp_numero`: Número del 1 al 9 (entero)
- ✅ `ocp_criterio`: Descripción del criterio (texto)
- ⚠️ Un programa puede tener múltiples filas (una por OCP)

#### **Hoja 2: "Estudiantes"**

| nombre_estudiante |
|-------------------|
| Juan Pérez |
| María González |

**Reglas:**
- ✅ `nombre_estudiante`: Nombre completo
- ⚠️ NO duplicar nombres

---

## ✍️ PASO 2: Llenar los Datos

### Instrucciones para el equipo:

**IMPORTANTE - NO hacer:**
- ❌ Dejar celdas vacías
- ❌ Usar saltos de línea dentro de celdas
- ❌ Usar comillas dobles `"` en el texto
- ❌ Duplicar nombres de estudiantes
- ❌ Usar números decimales en `ocp_numero` (usar 1, 2, 3... no 1.0)

**IMPORTANTE - SÍ hacer:**
- ✅ Revisar que no haya espacios extra
- ✅ Verificar que cada programa tenga al menos 1 OCP
- ✅ Asegurar que los números de OCP sean 1-9
- ✅ Usar nombres completos para estudiantes

---

## 💾 PASO 3: Descargar como CSV

1. En Google Sheets, seleccionar la hoja **"Programas_y_OCPs"**
2. Ir a: `Archivo` → `Descargar` → `Valores separados por comas (.csv)`
3. Guardar como: `Programas_y_OCPs.csv`

4. Repetir para la hoja **"Estudiantes"**
5. Guardar como: `Estudiantes.csv`

**Resultado:** Tendrás 2 archivos CSV

---

## 🚀 PASO 4: Subir a Supabase

### Opción A: Usar el Script Automático (Recomendado)

#### 1. Instalar dependencias:

```bash
pip install supabase pandas python-dotenv
```

#### 2. Ejecutar el script:

```bash
python3 cargar_datos_csv.py
```

#### 3. Seguir las instrucciones:
- Ingresar la ruta del archivo `Estudiantes.csv`
- Ingresar la ruta del archivo `Programas_y_OCPs.csv`
- Confirmar la carga

El script:
- ✅ Valida los datos automáticamente
- ✅ Elimina duplicados
- ✅ Muestra progreso en tiempo real
- ✅ Maneja errores gracefully
- ✅ Carga en lotes para mejor rendimiento

---

### Opción B: Carga Manual en Supabase

Si prefieres hacerlo manualmente:

1. **Ir a Supabase Dashboard** → Tu proyecto → `Table Editor`

2. **Cargar Estudiantes:**
   - Seleccionar tabla `estudiantes`
   - Click en `Insert` → `Import data from CSV`
   - Subir `Estudiantes.csv`
   - Mapear: `nombre_estudiante` → `nombre`

3. **Cargar Programas:**
   - Primero necesitas extraer programas únicos del CSV
   - Crear un nuevo CSV con solo los nombres únicos de programas
   - Subir a tabla `programas_catalogo`

4. **Cargar OCPs:**
   - Necesitas los IDs de los programas primero
   - Luego subir los OCPs vinculados a cada programa
   - Esto es más complejo manualmente, **se recomienda usar el script**

---

## 🔍 Validación Post-Carga

Después de cargar los datos, verificar en Supabase:

### En la tabla `estudiantes`:
```sql
SELECT COUNT(*) FROM estudiantes;
```
Debe mostrar el número correcto de estudiantes

### En la tabla `programas_catalogo`:
```sql
SELECT COUNT(*) FROM programas_catalogo;
```
Debe mostrar el número de programas únicos

### En la tabla `programas_ocp`:
```sql
SELECT 
  pc.nombre as programa,
  COUNT(po.id) as total_ocps
FROM programas_catalogo pc
LEFT JOIN programas_ocp po ON pc.id = po.programa_id
GROUP BY pc.nombre
ORDER BY pc.nombre;
```
Debe mostrar cada programa con su cantidad de OCPs

---

## ⚠️ Solución de Problemas

### Error: "duplicate key value violates unique constraint"
**Causa:** Intentas insertar un nombre duplicado  
**Solución:** Revisar el CSV y eliminar duplicados

### Error: "violates check constraint"
**Causa:** Número de OCP fuera del rango 1-9  
**Solución:** Revisar que todos los `ocp_numero` sean 1-9

### Error: "null value in column"
**Causa:** Hay celdas vacías en el CSV  
**Solución:** Llenar todas las celdas requeridas

### El script no encuentra el archivo CSV
**Causa:** Ruta incorrecta  
**Solución:** Usar ruta completa, ejemplo:
```
/Users/tu-usuario/Downloads/Estudiantes.csv
```

---

## 📞 Contacto

Si tienes problemas con la carga, contacta al administrador del sistema.

---

## 📝 Checklist Final

Antes de ejecutar la carga, verificar:

- [ ] Google Sheets tiene 2 hojas con nombres correctos
- [ ] Los encabezados son exactos (copiar/pegar recomendado)
- [ ] No hay celdas vacías
- [ ] No hay nombres de estudiantes duplicados
- [ ] Los números de OCP están entre 1-9
- [ ] Se descargaron ambos archivos CSV
- [ ] Las dependencias de Python están instaladas
- [ ] El archivo `.env.local` tiene las credenciales de Supabase

✅ Todo listo para cargar!
