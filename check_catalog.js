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

async function checkCatalogWrite() {
    console.log('--- PRUEBA DE ESCRITURA EN CATALOGO ---');

    const { data, error } = await supabase.from('programas_catalogo').insert([{
        nombre: 'TEST WRITE PERMISSION',
        descripcion: 'Checking permissions',
        tipo: 'Terapéutico'
    }]).select();

    if (error) {
        console.error('❌ FALLÓ LA ESCRITURA EN CATALOGO:', error.message);
        if (error.code === '42501') console.log('⚠️ ERROR RLS. Falta política.');
    } else {
        console.log('✅ ESCRITURA EN CATALOGO EXITOSA. ID:', data[0].id);
        await supabase.from('programas_catalogo').delete().eq('id', data[0].id);
        console.log('✅ Limpieza exitosa.');
    }
}

checkCatalogWrite();
