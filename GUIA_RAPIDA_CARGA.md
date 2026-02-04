# 🎯 GUÍA RÁPIDA - Carga de Datos Históricos

## ✅ ESTRUCTURA ACTUALIZADA

Tu Google Sheet debe tener **3 HOJAS**:

### 📑 HOJA 1: "Registros_Historicos"
**Para:** Datos ya trabajados en papel (registros antiguos)

```
| estudiante | programa | ocp | criterio | fecha_inicio | pre_test | post_test | fecha_final | estado | resultado_g1 | resultado_g2 | resultado_g3 |
```

**Ejemplo:**
```
| María González | Lenguaje Expresivo | 1 | Nombrar 10 objetos | 2025-01-15 | 30 | 85 | 2025-03-20 | Logrado | 80 | 85 | 90 |
| Carlos López | Autonomía Personal | 1 | Lavarse las manos | 2025-03-01 | 50 | | | Abierto | | | |
```

---

### 📑 HOJA 2: "Catalogo_Programas"
**Para:** Programas disponibles para asignar a nuevos estudiantes

```
| programa_nombre | ocp_numero | ocp_criterio |
```

**Ejemplo:**
```
| Lenguaje Expresivo | 1 | Nombrar 10 objetos comunes |
| Lenguaje Expresivo | 2 | Formar frases de 2 palabras |
```

---

### 📑 HOJA 3: "Estudiantes"
**Para:** Lista de todos los estudiantes

```
| nombre_estudiante |
```

**Ejemplo:**
```
| María González |
| Carlos López |
```

---

## 📝 REGLAS IMPORTANTES

### Para Registros Históricos (Hoja 1):

✅ **Columnas REQUERIDAS:**
- `estudiante` - Nombre del estudiante
- `programa` - Nombre del programa
- `ocp` - Número 1-9
- `criterio` - Descripción
- `fecha_inicio` - Formato: YYYY-MM-DD (ej: 2025-01-15)
- `estado` - "Abierto" o "Logrado"

⚠️ **Columnas OPCIONALES:**
- `pre_test` - Número 0-100 (sin %)
- `post_test` - Número 0-100 (solo si estado = "Logrado")
- `fecha_final` - Formato: YYYY-MM-DD (solo si estado = "Logrado")
- `resultado_g1`, `resultado_g2`, `resultado_g3` - Números 0-100

❌ **NO hacer:**
- Poner "0", "-", o "N/A" en celdas opcionales vacías
- Dejar vacías las columnas requeridas
- Usar formato de fecha diferente a YYYY-MM-DD
- Poner símbolos de % en los números

✅ **SÍ hacer:**
- Dejar en BLANCO las celdas opcionales sin datos
- Si estado = "Logrado", llenar `post_test` y `fecha_final`
- Si estado = "Abierto", dejar vacíos `post_test` y `fecha_final`

---

## 💾 DESCARGA

1. Descargar cada hoja como CSV por separado:
   - `Registros_Historicos.csv`
   - `Catalogo_Programas.csv`
   - `Estudiantes.csv`

2. Ejecutar el script:
   ```bash
   python3 cargar_datos_csv.py
   ```

---

## 📊 EJEMPLO COMPLETO

**Caso:** María trabajó Lenguaje Expresivo y lo completó

**Hoja 1 - Registros_Historicos:**
```csv
estudiante,programa,ocp,criterio,fecha_inicio,pre_test,post_test,fecha_final,estado,resultado_g1,resultado_g2,resultado_g3
María González,Lenguaje Expresivo,1,Nombrar 10 objetos,2025-01-15,30,85,2025-03-20,Logrado,80,85,90
María González,Lenguaje Expresivo,2,Formar frases 2 palabras,2025-02-01,25,80,2025-04-10,Logrado,75,80,85
```

**Hoja 2 - Catalogo_Programas:**
```csv
programa_nombre,ocp_numero,ocp_criterio
Lenguaje Expresivo,1,Nombrar 10 objetos comunes
Lenguaje Expresivo,2,Formar frases de 2 palabras
Lenguaje Expresivo,3,Formar frases de 3-4 palabras
```

**Hoja 3 - Estudiantes:**
```csv
nombre_estudiante
María González
```

---

## ✅ CHECKLIST

Antes de descargar, verificar:

- [ ] Las 3 hojas tienen los nombres correctos
- [ ] Los encabezados son exactos (copiar de las plantillas)
- [ ] Las fechas están en formato YYYY-MM-DD
- [ ] Los números NO tienen símbolos de %
- [ ] Las celdas opcionales vacías están EN BLANCO (no "0" ni "-")
- [ ] Los programas "Logrado" tienen post_test y fecha_final
- [ ] Los programas "Abierto" NO tienen post_test ni fecha_final
- [ ] Los nombres de estudiantes coinciden en todas las hojas

---

## 🚀 RESULTADO

Después de ejecutar el script, tendrás:

✅ **Estudiantes** cargados en la base de datos  
✅ **Catálogo** de programas disponibles para asignar  
✅ **Registros históricos** de todo lo trabajado anteriormente  

La aplicación mostrará:
- Programas ya completados en el historial
- Programas abiertos que se pueden continuar
- Catálogo completo para asignar a nuevos estudiantes

¡Listo para usar! 🎯
