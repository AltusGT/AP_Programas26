#!/usr/bin/env python3
"""
Script para cargar datos masivos desde CSV a Supabase
Carga: Estudiantes, Catálogo de Programas y Registros Históricos

Uso: python3 cargar_datos_csv.py

Requisitos:
- pip install supabase pandas python-dotenv
"""

import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Cargar variables de entorno
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: No se encontraron las credenciales de Supabase en .env.local")
    exit(1)

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def cargar_estudiantes(csv_path: str):
    """Carga estudiantes desde CSV a Supabase"""
    print("\n📚 PASO 1: Cargando estudiantes...")
    
    # Leer CSV
    df = pd.read_csv(csv_path)
    
    # Validar columnas
    if 'nombre_estudiante' not in df.columns:
        print("❌ Error: El CSV debe tener la columna 'nombre_estudiante'")
        return False
    
    # Limpiar datos
    df['nombre_estudiante'] = df['nombre_estudiante'].str.strip()
    df = df.dropna(subset=['nombre_estudiante'])
    df = df.drop_duplicates(subset=['nombre_estudiante'])
    
    print(f"   Encontrados {len(df)} estudiantes únicos")
    
    # Preparar datos para inserción
    estudiantes = [{'nombre': row['nombre_estudiante']} for _, row in df.iterrows()]
    
    # Insertar en lotes de 100
    batch_size = 100
    total_insertados = 0
    
    for i in range(0, len(estudiantes), batch_size):
        batch = estudiantes[i:i+batch_size]
        try:
            result = supabase.table('estudiantes').upsert(
                batch,
                on_conflict='nombre',
                ignore_duplicates=False
            ).execute()
            total_insertados += len(batch)
            print(f"   ✅ Insertados {total_insertados}/{len(estudiantes)} estudiantes")
        except Exception as e:
            print(f"   ⚠️  Error en lote {i//batch_size + 1}: {str(e)}")
    
    print(f"✅ Estudiantes cargados: {total_insertados}")
    return True

def cargar_catalogo_programas(csv_path: str):
    """Carga catálogo de programas y OCPs desde CSV a Supabase"""
    print("\n📋 PASO 2: Cargando catálogo de programas...")
    
    # Leer CSV
    df = pd.read_csv(csv_path)
    
    # Validar columnas
    required_cols = ['programa_nombre', 'ocp_numero', 'ocp_criterio']
    if not all(col in df.columns for col in required_cols):
        print(f"❌ Error: El CSV debe tener las columnas: {', '.join(required_cols)}")
        return False, {}
    
    # Limpiar datos
    df['programa_nombre'] = df['programa_nombre'].str.strip()
    df['ocp_criterio'] = df['ocp_criterio'].str.strip()
    df['ocp_numero'] = pd.to_numeric(df['ocp_numero'], errors='coerce').astype('Int64')
    
    # Eliminar filas con datos faltantes
    df = df.dropna(subset=required_cols)
    
    # Validar números de OCP
    invalid_ocps = df[~df['ocp_numero'].between(1, 9)]
    if len(invalid_ocps) > 0:
        print(f"⚠️  Advertencia: {len(invalid_ocps)} filas tienen números de OCP inválidos (deben ser 1-9)")
        df = df[df['ocp_numero'].between(1, 9)]
    
    print(f"   Encontrados {len(df)} OCPs en total")
    
    # Paso 2.1: Insertar programas únicos
    programas_unicos = df['programa_nombre'].unique()
    print(f"\n   Paso 2.1: Insertando {len(programas_unicos)} programas únicos...")
    
    programas_data = [{'nombre': nombre} for nombre in programas_unicos]
    
    try:
        result = supabase.table('programas_catalogo').upsert(
            programas_data,
            on_conflict='nombre',
            ignore_duplicates=False
        ).execute()
        print(f"   ✅ Programas insertados correctamente")
    except Exception as e:
        print(f"   ❌ Error al insertar programas: {str(e)}")
        return False, {}
    
    # Paso 2.2: Obtener IDs de programas
    print(f"\n   Paso 2.2: Obteniendo IDs de programas...")
    try:
        programas_db = supabase.table('programas_catalogo').select('id, nombre').execute()
        programa_id_map = {p['nombre']: p['id'] for p in programas_db.data}
        print(f"   ✅ Obtenidos {len(programa_id_map)} programas")
    except Exception as e:
        print(f"   ❌ Error al obtener programas: {str(e)}")
        return False, {}
    
    # Paso 2.3: Insertar OCPs
    print(f"\n   Paso 2.3: Insertando OCPs...")
    
    ocps_data = []
    for _, row in df.iterrows():
        programa_id = programa_id_map.get(row['programa_nombre'])
        if programa_id:
            ocps_data.append({
                'programa_id': programa_id,
                'numero_ocp': int(row['ocp_numero']),
                'criterio': row['ocp_criterio']
            })
    
    print(f"   Preparados {len(ocps_data)} OCPs para insertar")
    
    # Insertar en lotes de 50
    batch_size = 50
    total_insertados = 0
    errores = 0
    
    for i in range(0, len(ocps_data), batch_size):
        batch = ocps_data[i:i+batch_size]
        try:
            result = supabase.table('programas_ocp').upsert(
                batch,
                on_conflict='programa_id,numero_ocp',
                ignore_duplicates=False
            ).execute()
            total_insertados += len(batch)
            print(f"   ✅ Insertados {total_insertados}/{len(ocps_data)} OCPs")
        except Exception as e:
            errores += len(batch)
            print(f"   ⚠️  Error en lote {i//batch_size + 1}: {str(e)}")
    
    print(f"\n✅ Catálogo cargado:")
    print(f"   - {len(programas_unicos)} programas")
    print(f"   - {total_insertados} OCPs")
    if errores > 0:
        print(f"   - {errores} OCPs con errores")
    
    return True, programa_id_map

def cargar_registros_historicos(csv_path: str):
    """Carga registros históricos desde CSV a Supabase"""
    print("\n📊 PASO 3: Cargando registros históricos...")
    
    # Leer CSV
    df = pd.read_csv(csv_path)
    
    # Validar columnas requeridas
    required_cols = ['estudiante', 'programa', 'ocp', 'criterio', 'fecha_inicio', 'estado']
    if not all(col in df.columns for col in required_cols):
        print(f"❌ Error: El CSV debe tener las columnas: {', '.join(required_cols)}")
        return False
    
    # Limpiar datos
    df['estudiante'] = df['estudiante'].str.strip()
    df['programa'] = df['programa'].str.strip()
    df['criterio'] = df['criterio'].str.strip()
    df['estado'] = df['estado'].str.strip()
    df['ocp'] = pd.to_numeric(df['ocp'], errors='coerce').astype('Int64')
    
    # Eliminar filas con datos faltantes en columnas requeridas
    df = df.dropna(subset=required_cols)
    
    print(f"   Encontrados {len(df)} registros históricos")
    
    # Preparar datos para inserción
    registros_data = []
    errores_validacion = 0
    
    for idx, row in df.iterrows():
        # Validar estado
        if row['estado'] not in ['Abierto', 'Logrado']:
            print(f"   ⚠️  Fila {idx+2}: Estado inválido '{row['estado']}' (debe ser 'Abierto' o 'Logrado')")
            errores_validacion += 1
            continue
        
        # Validar OCP
        if not (1 <= row['ocp'] <= 9):
            print(f"   ⚠️  Fila {idx+2}: OCP inválido {row['ocp']} (debe ser 1-9)")
            errores_validacion += 1
            continue
        
        # Construir registro
        registro = {
            'estudiante': row['estudiante'],
            'programa': row['programa'],
            'ocp': int(row['ocp']),
            'criterio': row['criterio'],
            'fecha_inicio': row['fecha_inicio'],
            'estado': row['estado']
        }
        
        # Campos opcionales numéricos
        for campo in ['pre_test', 'post_test', 'resultado_g1', 'resultado_g2', 'resultado_g3']:
            if campo in df.columns and pd.notna(row[campo]):
                try:
                    valor = float(row[campo])
                    if 0 <= valor <= 100:
                        registro[campo] = valor
                    else:
                        print(f"   ⚠️  Fila {idx+2}: {campo} fuera de rango (0-100): {valor}")
                except:
                    pass
        
        # Campos opcionales de fecha
        for campo in ['fecha_final']:
            if campo in df.columns and pd.notna(row[campo]) and str(row[campo]).strip():
                registro[campo] = row[campo]
        
        registros_data.append(registro)
    
    if errores_validacion > 0:
        print(f"   ⚠️  {errores_validacion} registros omitidos por errores de validación")
    
    print(f"   Preparados {len(registros_data)} registros válidos para insertar")
    
    # Insertar en lotes de 50
    batch_size = 50
    total_insertados = 0
    errores = 0
    
    for i in range(0, len(registros_data), batch_size):
        batch = registros_data[i:i+batch_size]
        try:
            result = supabase.table('registros_programas').insert(batch).execute()
            total_insertados += len(batch)
            print(f"   ✅ Insertados {total_insertados}/{len(registros_data)} registros")
        except Exception as e:
            errores += len(batch)
            print(f"   ⚠️  Error en lote {i//batch_size + 1}: {str(e)}")
    
    print(f"\n✅ Registros históricos cargados: {total_insertados}")
    if errores > 0:
        print(f"   ⚠️  {errores} registros con errores")
    
    return True

def main():
    print("=" * 70)
    print("🚀 CARGA MASIVA DE DATOS A SUPABASE")
    print("   Estudiantes + Catálogo + Registros Históricos")
    print("=" * 70)
    
    # Solicitar archivos CSV
    print("\n📁 Por favor, ingresa la ruta de los archivos CSV:")
    estudiantes_csv = input("   1. Estudiantes.csv: ").strip()
    catalogo_csv = input("   2. Catalogo_Programas.csv: ").strip()
    registros_csv = input("   3. Registros_Historicos.csv: ").strip()
    
    # Verificar que existan los archivos
    archivos_faltantes = []
    if not os.path.exists(estudiantes_csv):
        archivos_faltantes.append(f"Estudiantes: {estudiantes_csv}")
    if not os.path.exists(catalogo_csv):
        archivos_faltantes.append(f"Catálogo: {catalogo_csv}")
    if not os.path.exists(registros_csv):
        archivos_faltantes.append(f"Registros: {registros_csv}")
    
    if archivos_faltantes:
        print("\n❌ Error: No se encontraron los siguientes archivos:")
        for archivo in archivos_faltantes:
            print(f"   - {archivo}")
        return
    
    # Confirmar antes de proceder
    print("\n⚠️  ADVERTENCIA: Este proceso insertará/actualizará datos en Supabase")
    print("   Se cargarán:")
    print("   - Estudiantes → tabla 'estudiantes'")
    print("   - Catálogo → tablas 'programas_catalogo' y 'programas_ocp'")
    print("   - Registros → tabla 'registros_programas'")
    confirmar = input("\n¿Deseas continuar? (si/no): ").strip().lower()
    
    if confirmar not in ['si', 'sí', 's', 'yes', 'y']:
        print("❌ Operación cancelada")
        return
    
    # Cargar datos en orden
    try:
        # Paso 1: Estudiantes
        if not cargar_estudiantes(estudiantes_csv):
            print("\n❌ Error al cargar estudiantes. Proceso detenido.")
            return
        
        # Paso 2: Catálogo
        exito, programa_map = cargar_catalogo_programas(catalogo_csv)
        if not exito:
            print("\n❌ Error al cargar catálogo. Proceso detenido.")
            return
        
        # Paso 3: Registros históricos
        if not cargar_registros_historicos(registros_csv):
            print("\n⚠️  Hubo errores al cargar registros históricos")
        
        print("\n" + "=" * 70)
        print("✅ CARGA COMPLETADA EXITOSAMENTE")
        print("=" * 70)
        print("\n📊 Resumen:")
        print("   ✅ Estudiantes cargados")
        print("   ✅ Catálogo de programas creado")
        print("   ✅ Registros históricos importados")
        print("\n💡 Ahora puedes usar la aplicación con todos los datos cargados!")
        
    except Exception as e:
        print(f"\n❌ Error general: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
