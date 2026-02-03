graph TD
    Start((Inicio)) --> Login{Rol de Usuario}
    
    %% RUTA TERAPEUTA
    Login -- Terapeuta --> T1[Seleccionar Niño]
    T1 --> T2[Seleccionar Programa Activo]
    T2 --> T_Choice{¿Qué registrar?}
    
    T_Choice -- OCP (Pre-test) --> T3[Seleccionar OCP]
    T3 --> T4{¿Fase?}
    T4 -- Inicial --> T5[Fecha y Resultado Inicial %]
    T4 -- Final --> T6[Fecha y Resultado Final %]
    
    T_Choice -- Generalización --> T7[Registrar Fecha y Resultado % de Generalización]
    
    T5 --> End((Fin Registro))
    T6 --> End
    T7 --> End

    %% RUTA SUPERVISORA
    Login -- Supervisora --> S_Choice{Vista}
    
    S_Choice -- Panel General --> S_Dash[Dashboard Global: Resultados, OCPs y Generalizaciones]
    S_Choice -- Gestión por Niño --> S1[Seleccionar Niño]
    
    S1 --> S2[Visualizar Programas y Resultados Detallados]
    S2 --> S3{Acción a realizar}
    
    S3 -- Añadir/Cerrar Programa --> S4[Modificar Programas]
    S3 -- Gestionar OCPs --> S5[Añadir OCPs y Criterios]
    
    S_Dash --> S1
    S4 --> S1
    S5 --> S1