# 📊 ESTRUCTURA ACTUALIZADA - Google Sheets para Carga Masiva

## 🎯 OBJETIVO ACTUALIZADO

Cargar **DOS TIPOS DE DATOS**:
1. **Registros históricos** - Programas ya trabajados con estudiantes (datos en papel)
2. **Catálogo de programas** - Programas y OCPs disponibles para asignar a nuevos estudiantes

---

## 📋 ESTRUCTURA DEL GOOGLE SHEETS

### Tu Google Sheet debe tener **3 HOJAS**:

```
📄 Google Sheets: "Base_Datos_Completa"
├── 📑 Hoja 1: "Registros_Historicos"      ← DATOS YA TRABAJADOS
├── 📑 Hoja 2: "Catalogo_Programas"        ← PROGRAMAS DISPONIBLES
└── 📑 Hoja 3: "Estudiantes"               ← LISTA DE ESTUDIANTES
```

---

## 📑 HOJA 1: "Registros_Historicos" ⭐ NUEVA

**Propósito:** Registros de programas ya trabajados con estudiantes (datos históricos en papel)

### Encabezados (Fila 1):
```
| estudiante | programa | ocp | criterio | fecha_inicio | pre_test | post_test | fecha_final | estado | resultado_g1 | resultado_g2 | resultado_g3 |
```

### Ejemplo de datos (Fila 2+):
```
| María González | Lenguaje Expresivo | 1 | Nombrar 10 objetos comunes | 2025-01-15 | 30 | 85 | 2025-03-20 | Logrado | 80 | 85 | 90 |
| María González | Lenguaje Expresivo | 2 | Formar frases de 2 palabras | 2025-02-01 | 25 | 80 | 2025-04-10 | Logrado | 75 | 80 | 85 |
| Juan Pérez | Habilidades Sociales | 1 | Saludar apropiadamente | 2025-01-10 | 40 | 90 | 2025-02-28 | Logrado | 85 | 90 | 95 |
| Carlos López | Autonomía Personal | 1 | Lavarse las manos solo | 2025-03-01 | 50 | | | Abierto | | | |
```

### 📝 Descripción de columnas:

| Columna | Tipo | Requerido | Descripción | Ejemplo |
|---------|------|-----------|-------------|---------|
| **estudiante** | Texto | ✅ Sí | Nombre completo del estudiante | María González |
| **programa** | Texto | ✅ Sí | Nombre del programa | Lenguaje Expresivo |
| **ocp** | Número | ✅ Sí | Número del OCP (1-9) | 1 |
| **criterio** | Texto | ✅ Sí | Descripción del criterio | Nombrar 10 objetos comunes |
| **fecha_inicio** | Fecha | ✅ Sí | Fecha de inicio (YYYY-MM-DD) | 2025-01-15 |
| **pre_test** | Número | ⚠️ Opcional | Resultado inicial (0-100) | 30 |
| **post_test** | Número | ⚠️ Opcional | Resultado final (0-100) | 85 |
| **fecha_final** | Fecha | ⚠️ Opcional | Fecha de cierre (YYYY-MM-DD) | 2025-03-20 |
| **estado** | Texto | ✅ Sí | "Abierto" o "Logrado" | Logrado |
| **resultado_g1** | Número | ⚠️ Opcional | Generalización 1 (0-100) | 80 |
| **resultado_g2** | Número | ⚠️ Opcional | Generalización 2 (0-100) | 85 |
| **resultado_g3** | Número | ⚠️ Opcional | Generalización 3 (0-100) | 90 |

### ⚠️ REGLAS IMPORTANTES:
- ✅ Si el programa está **"Logrado"**, debe tener `post_test` y `fecha_final`
- ✅ Si el programa está **"Abierto"**, dejar vacíos `post_test` y `fecha_final`
- ✅ Las fechas deben estar en formato: `YYYY-MM-DD` (ejemplo: `2025-01-15`)
- ✅ Los números deben ser entre 0 y 100 (sin símbolos de %)
- ✅ Dejar vacías las celdas opcionales si no tienen datos (no poner 0 ni guiones)

---

## 📑 HOJA 2: "Catalogo_Programas"

**Propósito:** Catálogo de programas y OCPs disponibles para asignar a nuevos estudiantes

### Encabezados (Fila 1):
```
| programa_nombre | ocp_numero | ocp_criterio |
```

### Ejemplo de datos (Fila 2+):
```
| Lenguaje Expresivo | 1 | Nombrar 10 objetos comunes |
| Lenguaje Expresivo | 2 | Formar frases de 2 palabras |
| Lenguaje Expresivo | 3 | Formar frases de 3-4 palabras |
| Habilidades Sociales | 1 | Saludar apropiadamente a compañeros |
| Habilidades Sociales | 2 | Mantener contacto visual |
| Autonomía Personal | 1 | Lavarse las manos solo |
```

### 📝 Notas importantes:
- ✅ Esta hoja crea el **catálogo maestro** de programas
- ✅ Se usa para asignar programas a **nuevos estudiantes**
- ✅ Puede tener programas que aún no están en los registros históricos
- ✅ Un programa puede tener hasta 9 OCPs

---

## � HOJA 3: "Estudiantes"

**Propósito:** Lista completa de estudiantes (históricos y actuales)

### Encabezados (Fila 1):
```
| nombre_estudiante |
```

### Ejemplo de datos (Fila 2+):
```
| María González |
| Juan Pérez |
| Carlos López |
| Ana Martínez |
```

### 📝 Notas importantes:
- ✅ Incluir **todos** los estudiantes (históricos y actuales)
- ❌ NO duplicar nombres
- ✅ Usar nombres completos

---

## � RELACIÓN ENTRE LAS HOJAS

```
┌─────────────────────────────────────────────────────────────┐
│  HOJA 1: Registros_Historicos                               │
│  ┌──────────────┬──────────────┬─────┬──────────────┐       │
│  │ María G.     │ Lenguaje     │ 1   │ Nombrar...   │       │
│  │ María G.     │ Lenguaje     │ 2   │ Formar...    │       │
│  └──────────────┴──────────────┴─────┴──────────────┘       │
│  ↓ Se carga a: registros_programas                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HOJA 2: Catalogo_Programas                                 │
│  ┌──────────────┬─────┬──────────────────────────┐          │
│  │ Lenguaje     │ 1   │ Nombrar 10 objetos       │          │
│  │ Lenguaje     │ 2   │ Formar frases 2 palabras │          │
│  └──────────────┴─────┴──────────────────────────┘          │
│  ↓ Se carga a: programas_catalogo + programas_ocp           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HOJA 3: Estudiantes                                        │
│  ┌──────────────┐                                           │
│  │ María G.     │                                           │
│  │ Juan P.      │                                           │
│  └──────────────┘                                           │
│  ↓ Se carga a: estudiantes                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 VENTAJAS DE ESTA ESTRUCTURA

✅ **Doble propósito:**
   - Migras todos los registros históricos
   - Creas el catálogo para nuevos estudiantes

✅ **Eficiente:**
   - El script extrae automáticamente los programas únicos del catálogo
   - No necesitas duplicar información

✅ **Flexible:**
   - Puedes tener programas en el catálogo que aún no están en registros históricos
   - Puedes tener registros históricos de programas que ya no usarás

---

## ⚠️ REGLAS GENERALES

### ❌ NO HACER:
- Dejar celdas vacías en columnas **requeridas**
- Usar saltos de línea dentro de celdas
- Usar comillas dobles `"` en el texto
- Poner "N/A", "-", o "0" en celdas opcionales vacías (dejarlas en blanco)
- Usar formato de fecha diferente a YYYY-MM-DD
- Poner símbolos de % en los números

### ✅ SÍ HACER:
- Copiar los encabezados exactamente como están
- Usar formato de fecha: YYYY-MM-DD (2025-01-15)
- Usar números sin símbolos (85, no 85%)
- Dejar en blanco las celdas opcionales sin datos
- Verificar que los nombres de estudiantes coincidan exactamente

---

## 📝 EJEMPLO COMPLETO

### Caso real: María González trabajó Lenguaje Expresivo

**En Hoja 1 (Registros_Historicos):**
```
| María González | Lenguaje Expresivo | 1 | Nombrar 10 objetos | 2025-01-15 | 30 | 85 | 2025-03-20 | Logrado | 80 | 85 | 90 |
| María González | Lenguaje Expresivo | 2 | Formar frases 2 palabras | 2025-02-01 | 25 | 80 | 2025-04-10 | Logrado | 75 | 80 | 85 |
```

**En Hoja 2 (Catalogo_Programas):**
```
| Lenguaje Expresivo | 1 | Nombrar 10 objetos comunes |
| Lenguaje Expresivo | 2 | Formar frases de 2 palabras |
| Lenguaje Expresivo | 3 | Formar frases de 3-4 palabras |
```

**En Hoja 3 (Estudiantes):**
```
| María González |
```

---

## � PROCESO DE DESCARGA

1. **Descargar Hoja 1:**
   - Seleccionar pestaña "Registros_Historicos"
   - `Archivo` → `Descargar` → `Valores separados por comas (.csv)`
   - Guardar como: `Registros_Historicos.csv`

2. **Descargar Hoja 2:**
   - Seleccionar pestaña "Catalogo_Programas"
   - `Archivo` → `Descargar` → `Valores separados por comas (.csv)`
   - Guardar como: `Catalogo_Programas.csv`

3. **Descargar Hoja 3:**
   - Seleccionar pestaña "Estudiantes"
   - `Archivo` → `Descargar` → `Valores separados por comas (.csv)`
   - Guardar como: `Estudiantes.csv`

**Resultado:** Tendrás 3 archivos CSV

---

## ✅ CHECKLIST ANTES DE DESCARGAR

- [ ] Las 3 hojas tienen los nombres correctos
- [ ] Los encabezados están exactamente como se muestran
- [ ] No hay celdas vacías en columnas requeridas
- [ ] Las fechas están en formato YYYY-MM-DD
- [ ] Los números no tienen símbolos de %
- [ ] Los programas "Logrado" tienen post_test y fecha_final
- [ ] Los programas "Abierto" NO tienen post_test ni fecha_final
- [ ] No hay nombres de estudiantes duplicados en Hoja 3
- [ ] Los nombres de estudiantes coinciden en todas las hojas

---

## 🚀 SIGUIENTE PASO

Una vez descargados los 3 CSV, ejecutar el script actualizado:
```bash
python3 cargar_datos_csv.py
```

El script cargará automáticamente:
1. Estudiantes → tabla `estudiantes`
2. Catálogo → tablas `programas_catalogo` y `programas_ocp`
3. Registros históricos → tabla `registros_programas`

¡Eso es todo! 🎯
