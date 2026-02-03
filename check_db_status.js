const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) { console.error('No .env.local'); process.exit(1); }

const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    console.log('--- VERIFICACIÓN DE ESTADO DE BASE DE DATOS ---');

    // 1. Verificar Tabla programas_ocp
    console.log('1. Verificando tabla programas_ocp...');
    const { error: ocpError } = await supabase
        .from('programas_ocp')
        .select('count', { count: 'exact', head: true });

    if (ocpError) {
        console.error('❌ ERROR tabla programas_ocp:', ocpError.message);
        console.log('   (Es probable que no se haya ejecutado el SQL de creación)');
    } else {
        console.log('✅ Tabla programas_ocp existe y es accesible.');
    }

    // 2. Verificar columna 'tipo' en programas_catalogo
    console.log('\n2. Verificando columna "tipo" en programas_catalogo...');
    const { data: progData, error: progError } = await supabase
        .from('programas_catalogo')
        .select('tipo')
        .limit(1);

    if (progError) {
        if (progError.message.includes('does not exist')) {
            console.error('❌ La columna "tipo" NO existe en programas_catalogo.');
        } else {
            console.error('❌ Error verificando columna tipo:', progError.message);
        }
    } else {
        console.log('✅ Columna "tipo" detectada.');
    }
}

test();
