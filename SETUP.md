# Configuración Rápida - Supabase & GitHub

## 🚀 Inicio Rápido

### 1. Supabase (Base de Datos)

**a) Crear proyecto:**
- Ve a https://supabase.com
- Click "New Project"
- Nombre: `Programas Terapeuticos`
- **Guarda la contraseña** (la necesitarás)

**b) Ejecutar Schema:**
1. En Supabase: SQL Editor (menú lateral)
2. Copia TODO el contenido de `supabase-schema.sql`
3. Pégalo y haz click en "Run"

**c) Obtener credenciales:**
- Settings > API
- Copia estas 3 cosas:
  - URL del proyecto
  - `anon` key
  - `service_role` key

**d) Crear archivo `.env.local` en la raíz del proyecto:**

```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

### 2. GitHub (Control de Versiones)

**a) Crear repositorio:**
- Ve a https://github.com
- Click "+" > "New repository"
- Nombre: `programas-terapeuticos`
- Visibilidad: **Private** (recomendado)
- **NO** marques ninguna opción adicional
- Click "Create repository"

**b) Subir código (en Terminal):**

```bash
cd "/Users/raulmaroto/Documents/01 Proyectos 🎯& ⏰/AP_programas26"
git init
git add .
git commit -m "Initial commit: Altus PWA setup"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/programas-terapeuticos.git
git push -u origin main
```

### 3. Probar que Funciona

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` - ¡Deberías ver el Dashboard con el logo de Altus!

---

## 📖 Guía Detallada

Para instrucciones paso a paso con capturas y solución de problemas, consulta la [Guía Completa de Configuración](file:///Users/raulmaroto/.gemini/antigravity/brain/433b1128-535d-4704-add6-bed641cb881d/setup_guide.md).

---

## ⚠️ IMPORTANTE

- **NUNCA** subas el archivo `.env.local` a GitHub
- El archivo `.gitignore` ya está configurado para protegerlo
- La `service_role` key es **SECRETA** - no la compartas

---

## 🆘 ¿Problemas?

1. **Supabase no ejecuta el SQL**: Verifica que estés en el proyecto correcto
2. **Git pide contraseña**: Usa un Personal Access Token de GitHub
3. **npm run dev da error**: Ejecuta `npm install` primero

¿Necesitas ayuda? Revisa la guía completa o pregúntame.
