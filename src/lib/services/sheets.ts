/**
 * Servicio para interactuar con Google Sheets a través de Google Apps Script.
 * Reemplaza la funcionalidad de Supabase para el Catálogo y Registros.
 */

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

export async function fetchCatalog() {
    try {
        const response = await fetch(`${GAS_URL}?api=true&action=getCatalog`);
        if (!response.ok) throw new Error('Error al cargar catálogo');
        return await response.json();
    } catch (error) {
        console.error('fetchCatalog error:', error);
        return [];
    }
}

export async function saveCatalogProgram(nombre: string, criterios: string[]) {
    try {
        const response = await fetch(GAS_URL!, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveCatalog',
                nombre_programa: nombre,
                criterios: criterios
            })
        });
        if (!response.ok) throw new Error('Error al guardar programa en catálogo');
        return await response.json();
    } catch (error) {
        console.error('saveCatalogProgram error:', error);
        throw error;
    }
}

export async function fetchBaseData() {
    try {
        const response = await fetch(`${GAS_URL}?api=true&action=getData`);
        if (!response.ok) throw new Error('Error al cargar datos base');
        return await response.json();
    } catch (error) {
        console.error('fetchBaseData error:', error);
        return { students: [], educational: [], therapeutic: [] };
    }
}

export async function saveSession(records: any[]) {
    try {
        const response = await fetch(GAS_URL!, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveSession',
                records: records
            })
        });
        if (!response.ok) throw new Error('Error al guardar sesión');
        return await response.json();
    } catch (error) {
        console.error('saveSession error:', error);
        throw error;
    }
}

export async function fetchDashboardData(student?: string, start?: string, end?: string, program?: string) {
    try {
        let url = `${GAS_URL}?api=true&action=getDashboardData`;
        if (student) url += `&student=${encodeURIComponent(student)}`;
        if (start) url += `&start=${start}`;
        if (end) url += `&end=${end}`;
        if (program) url += `&program=${encodeURIComponent(program)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar datos del dashboard');
        return await response.json();
    } catch (error) {
        console.error('fetchDashboardData error:', error);
        return { records: [], recommendations: [] };
    }
}

export async function saveStudent(nombre: string) {
    try {
        const response = await fetch(GAS_URL!, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveStudent',
                nombre: nombre
            })
        });
        if (!response.ok) throw new Error('Error al guardar estudiante');
        return await response.json();
    } catch (error) {
        console.error('saveStudent error:', error);
        throw error;
    }
}
