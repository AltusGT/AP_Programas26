/**
 * Servicio para interactuar con Google Sheets a través de Google Apps Script.
 * Reemplaza la funcionalidad de Supabase para el Catálogo y Registros.
 */

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

export async function fetchCatalog() {
    try {
        const response = await fetch(`${GAS_URL}?api=true&action=getCatalog`);
        if (!response.ok) throw new Error('Error al cargar catálogo');
        const rawData = await response.json();
        
        // Formatear los datos para garantizar que 'criterios' siempre sea un array
        return rawData.map((prog: any) => {
            let parsedCriterios = prog.criterios;
            
            // Si G.A.S nos devuelve la celda directamente como un string con saltos de línea o punto y coma
            if (typeof parsedCriterios === 'string') {
                if (parsedCriterios.includes('\n')) {
                    parsedCriterios = parsedCriterios.split('\n');
                } else if (parsedCriterios.includes(';')) {
                    parsedCriterios = parsedCriterios.split(';');
                } else {
                    // Intento de parsear si fuera JSON stringificado erróneamente devuelto como string
                    try {
                        parsedCriterios = JSON.parse(parsedCriterios);
                    } catch (e) {
                        parsedCriterios = [parsedCriterios]; // Es un solo criterio
                    }
                }
            }
            
            // Limpiamos los criterios para evitar espacios en blanco
            if (Array.isArray(parsedCriterios)) {
                parsedCriterios = parsedCriterios.map(c => typeof c === 'string' ? c.trim() : String(c)).filter(c => c.length > 0);
            } else {
                parsedCriterios = [];
            }
            
            return {
                ...prog,
                criterios: parsedCriterios
            };
        });
    } catch (error) {
        console.error('fetchCatalog error:', error);
        return [];
    }
}

export async function saveCatalogProgram(nombre: string, criterios: string[]) {
    try {
        const params = new URLSearchParams();
        params.append('action', 'saveCatalog');
        params.append('nombre_programa', nombre);
        params.append('criterios', JSON.stringify(criterios));

        await fetch(GAS_URL!, {
            method: 'POST',
            mode: 'no-cors', // Seguimos usando no-cors para máxima compatibilidad con redirecciones de Google
            body: params
        });
        return { success: true };
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
        const params = new URLSearchParams();
        params.append('action', 'saveSession');
        params.append('records', JSON.stringify(records));

        await fetch(GAS_URL!, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        });
        return { success: true };
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
        const params = new URLSearchParams();
        params.append('action', 'saveStudent');
        params.append('nombre', nombre);

        await fetch(GAS_URL!, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        });
        return { success: true };
    } catch (error) {
        console.error('saveStudent error:', error);
        throw error;
    }
}

export async function saveAssignment(data: any) {
    try {
        const params = new URLSearchParams();
        params.append('action', 'saveAssignment');
        params.append('data', JSON.stringify(data));

        await fetch(GAS_URL!, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        });
        return { success: true };
    } catch (error) {
        console.error('saveAssignment error:', error);
        throw error;
    }
}
