const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testWrite() {
    console.log('--- PRUEBA DE ESCRITURA ---');

    // Buscar un programa existente para asociar
    const { data: progs } = await supabase.from('programas_catalogo').select('id').limit(1);
    if (!progs?.length) { console.log('Necesito al menos un programa para probar.'); return; }
    const progId = progs[0].id;

    console.log('Intentando insertar OCP de prueba...');
    const { data, error } = await supabase.from('programas_ocp').insert([{
        programa_id: progId,
        numero_ocp: 9999,
        criterio: 'TEST WRITE PERMISSION'
    }]).select();

    if (error) {
        console.error('❌ FALLÓ LA ESCRITURA:', error.message);
        console.log('Código:', error.code);
        if (error.code === '42501') console.log('⚠️ ERROR DE PERMISOS (RLS). Falta política para INSERT.');
    } else {
        console.log('✅ ESCRITURA EXITOSA. ID:', data[0].id);
        // Limpiar
        await supabase.from('programas_ocp').delete().eq('id', data[0].id);
        console.log('✅ Limpieza exitosa (DELETE funciona).');
    }
}

testWrite();
