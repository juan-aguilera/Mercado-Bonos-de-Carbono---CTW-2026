# Backlog técnico — CarbonFlow PRD 2.3

**Versión:** 1.0  
**Fuente:** PRD_CarbonFlow-1.md, versión 2.3  
**Alcance:** Hackathon de 24 horas  
**Mercado inicial:** Colombia  
**Producto:** CarbonFlow

> Este backlog toma como fuente de verdad el recorte del hackathon definido en la sección 2 del PRD. El orden de prioridad es: diagnóstico geoespacial en vivo, formulación guiada, certificación, marketplace y bonos verdes. El MRV operativo queda fuera del hackathon.

---

## 1. Alcance del backlog

### Incluido

- Autenticación real con Supabase Auth.
- Organizaciones básicas.
- Selector de tipo de proyecto visible en diagnóstico y formulación.
- Conservación/restauración forestal habilitada.
- Reforestación, agroforestería, solar, eólica, biogás, biomasa y eficiencia energética visibles como “próximamente”.
- Diagnóstico geoespacial con APIs en vivo.
- Geometría por dibujo y carga de GeoJSON/KML.
- Área mediante Turf.js.
- Cobertura boscosa y alertas de deforestación vía Global Forest Watch.
- Áreas protegidas vía RUNAP/ArcGIS REST o SIAC.
- Geocodificación inversa vía Nominatim.
- Score explicable y estimación indicativa de CO2e.
- Exportación PDF.
- Formulación guiada completa para conservación/restauración forestal.
- Chatbot informativo de certificación basado en contenido curado.
- Búsqueda del proyecto en registros oficiales, con enlace directo a la fuente.
- Marketplace con catálogo y solicitud de cotización real.
- Respuesta simulada de contraparte vendedora.
- Perfil de bonos verdes, data room y solicitud de conexión.
- Respuesta simulada de aliado financiero.
- Caché, timeout, reintento y estados de error para servicios externos.

### Excluido

- MRV operativo: checklist de evidencias, evidencias georreferenciadas, versionamiento documental, bitácora, importación operativa y monitoreo continuo.
- Flujos funcionales para tipos distintos de conservación/restauración forestal.
- Marketplace transaccional real, pagos, custodia, retiro y transferencia de créditos.
- Negociación real de bonos verdes.
- Recomendaciones de inversión.
- KYC/AML, panel administrativo, RBAC granular y auditoría completa.
- API pública para terceros.

---

## 2. Convenciones

### Prioridad

- **P0:** imprescindible para la demo y el flujo de hackathon.
- **P1:** importante; incluir si no pone en riesgo el núcleo.
- **P2:** opcional; solo si queda tiempo.

### Estimación

- **XS:** hasta 1 hora.
- **S:** 1–3 horas.
- **M:** 3–6 horas.
- **L:** 6–10 horas.
- **XL:** debe dividirse en subtareas y ejecutarse por más de una persona.

### Definition of Done

Una historia está terminada cuando:

- Cumple sus criterios de aceptación.
- Funciona en el entorno de demo.
- Tiene estados de carga, error y vacío cuando aplique.
- No expone claves secretas en el frontend.
- Muestra límites y advertencias requeridos.
- Se prueba dentro del camino feliz y en al menos un caso de error.
- Queda integrada con el modelo de datos compartido.

---

# EP-01 — Fundación, autenticación y datos

## CF-001 — Inicializar aplicación y despliegue

**Prioridad:** P0  
**Estimación:** M

**Como** equipo de desarrollo,  
**quiero** disponer de una aplicación desplegada con repositorio, variables de entorno y ambientes,  
**para** construir y demostrar CarbonFlow durante el hackathon.

### Criterios de aceptación

- Existe repositorio compartido con instrucciones mínimas de ejecución.
- La aplicación se puede ejecutar localmente y está disponible en una URL de demo.
- Las claves de GFW, LLM y servicios externos se manejan mediante variables de entorno.
- Las claves secretas no aparecen en el repositorio ni en el bundle del navegador.
- Existe un mecanismo básico de respaldo si el despliegue principal falla.
- Se documentan variables obligatorias y valores de ejemplo no sensibles.

## CF-002 — Configurar Supabase y modelo de datos base

**Prioridad:** P0  
**Estimación:** L

**Como** equipo de desarrollo,  
**quiero** configurar Supabase con tablas mínimas,  
**para** compartir datos entre diagnóstico, formulación, certificación, marketplace y bonos verdes.

### Criterios de aceptación

- Supabase contiene tablas o estructuras equivalentes para usuarios, proyectos, tipos de proyecto, geometrías, diagnósticos, expedientes, consultas de registros, publicaciones marketplace, solicitudes de cotización, perfiles verdes y solicitudes de financiación.
- Cada proyecto tiene identificador único, propietario, tipo, estado y fecha de creación.
- Los módulos pueden acceder al mismo proyecto sin duplicar información manualmente.
- Se han definido relaciones mínimas entre proyecto, diagnóstico, formulación y publicación.
- Se incluye una política básica de aislamiento por usuario u organización para datos privados.
- El esquema de datos está documentado en el repositorio.

## CF-003 — Registro e inicio de sesión

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** registrarme e iniciar sesión,  
**para** conservar mis proyectos y continuar el flujo.

### Criterios de aceptación

- El usuario puede registrarse mediante Supabase Auth.
- Puede iniciar y cerrar sesión.
- Se muestra un mensaje legible si las credenciales son inválidas.
- Las rutas de proyecto y formulación requieren sesión.
- Se puede usar un usuario de demo preparado para la presentación.
- El flujo no expone tokens ni datos de autenticación en la interfaz.

## CF-004 — Crear organización básica

**Prioridad:** P0  
**Estimación:** S

**Como** usuario autenticado,  
**quiero** registrar el nombre de mi organización,  
**para** asociar mis proyectos y solicitudes a una entidad reconocible.

### Criterios de aceptación

- El usuario puede crear una organización con nombre y país.
- El creador queda asociado como propietario principal.
- Los proyectos creados se vinculan automáticamente a la organización seleccionada.
- En el hackathon no se requiere delegación granular de permisos.
- El nombre de la organización aparece en las fichas públicas cuando el usuario lo autoriza.

## CF-005 — Seleccionar tipo de proyecto

**Prioridad:** P0  
**Estimación:** S

**Como** usuario,  
**quiero** seleccionar el tipo de proyecto desde un desplegable,  
**para** indicar qué estoy evaluando y entender las futuras capacidades de CarbonFlow.

### Criterios de aceptación

- El desplegable muestra: conservación/restauración forestal, reforestación, agroforestería, solar, eólica, biogás, biomasa y eficiencia energética.
- Conservación/restauración forestal aparece como habilitada y seleccionable.
- Los demás tipos aparecen con etiqueta “Próximamente” y no permiten iniciar un flujo funcional.
- Si el usuario selecciona un tipo no habilitado, recibe explicación clara y opción de volver.
- El tipo seleccionado se conserva entre diagnóstico y formulación.
- El sistema no presenta capacidades futuras como disponibles.

---

# EP-02 — Diagnóstico geoespacial en vivo

## CF-006 — Crear proyecto forestal

**Prioridad:** P0  
**Estimación:** M

**Como** propietario o desarrollador,  
**quiero** crear un proyecto de conservación/restauración forestal,  
**para** iniciar el diagnóstico.

### Criterios de aceptación

- El formulario solicita como mínimo nombre, organización, tipo de proyecto, uso del suelo declarado y situación de tenencia/control declarada.
- El proyecto se crea en estado “Borrador”.
- El sistema solicita una ubicación mediante polígono o archivo.
- El sistema conserva los datos ingresados aunque el procesamiento externo falle.
- El proyecto puede continuar a formulación después de completar el diagnóstico.

## CF-007 — Dibujar polígono en el mapa

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** dibujar un polígono en un mapa,  
**para** delimitar el predio a diagnosticar.

### Criterios de aceptación

- El usuario puede buscar una ubicación aproximada y dibujar un polígono.
- Se muestra el área calculada con Turf.js en hectáreas.
- Se puede editar, borrar y volver a dibujar el polígono.
- Se rechazan polígonos vacíos, inválidos o autointersectados con mensaje comprensible.
- La geometría se guarda asociada al proyecto.
- La interfaz advierte que el diagnóstico no sustituye la validación de linderos o títulos.

## CF-008 — Cargar GeoJSON/KML

**Prioridad:** P1  
**Estimación:** M

**Como** usuario con información espacial existente,  
**quiero** cargar un archivo GeoJSON o KML,  
**para** evitar dibujar manualmente el predio.

### Criterios de aceptación

- Se aceptan archivos GeoJSON y KML dentro de un límite configurado.
- El archivo se previsualiza antes de confirmar.
- Se muestra error si el formato o geometría no son válidos.
- El sistema calcula y muestra el área después de cargarlo.
- El archivo y la geometría resultante quedan relacionados con el proyecto.
- Si la carga falla, el usuario puede volver al dibujo manual.

## CF-009 — Calcular área y ubicación administrativa

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** conocer el área y la ubicación administrativa aproximada,  
**para** contextualizar el diagnóstico.

### Criterios de aceptación

- El área se calcula localmente con Turf.js.
- La aplicación consulta Nominatim mediante una función de servidor o backend protegido.
- El resultado muestra municipio/vereda o nivel administrativo disponible.
- La consulta respeta el límite de 1 solicitud por segundo y utiliza caché por sesión.
- Si Nominatim falla, la interfaz conserva coordenadas/polígono y muestra que la ubicación administrativa no pudo resolverse.
- La UI identifica la ubicación como aproximada cuando corresponda.

## CF-010 — Consultar Global Forest Watch

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** consultar datos de cobertura boscosa y alertas de deforestación para mi polígono,  
**para** obtener evidencia geoespacial inicial.

### Criterios de aceptación

- La consulta se realiza desde backend o Edge Function, sin exponer la API key.
- Se envía el polígono y los parámetros de periodo definidos por CarbonFlow.
- El resultado contiene, cuando esté disponible, cobertura boscosa y alertas recientes.
- La respuesta se guarda con fecha, parámetros, fuente y estado.
- El sistema muestra el resultado como dato indicativo, no como certificación.
- Si la API no responde, se muestra un estado de error legible y se permite reintentar.

## CF-011 — Consultar RUNAP/ArcGIS o SIAC

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** conocer si mi polígono se superpone preliminarmente con áreas protegidas,  
**para** identificar una condición que requiere validación adicional.

### Criterios de aceptación

- La consulta usa la fuente configurada: RUNAP/Parques Nacionales vía ArcGIS REST o WFS/SIAC.
- Se envía la geometría con el sistema de referencia requerido.
- El resultado indica si existe traslape, área afectada o “no determinable”.
- La UI muestra fuente, fecha y advertencia de que no constituye concepto oficial.
- Si el servicio falla, el diagnóstico no se bloquea completamente; muestra “consulta no disponible”.
- La respuesta se conserva en el diagnóstico con su estado.

## CF-012 — Implementar resiliencia de APIs externas

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** recibir una respuesta clara aun cuando una fuente externa falle,  
**para** no enfrentar una pantalla en blanco ni perder mi proyecto.

### Criterios de aceptación

- Cada llamada externa tiene timeout configurable entre 5 y 8 segundos.
- Se ejecuta un único reintento controlado cuando corresponda.
- Las respuestas exitosas se cachean por clave de consulta y parámetros.
- Las repeticiones cacheadas se entregan sin repetir innecesariamente la llamada externa.
- La interfaz indica si el dato es en vivo, cacheado, no disponible o ilustrativo.
- El error incluye acción de reintentar y no borra datos del formulario.
- La demo se puede ejecutar con el polígono y consultas ensayadas aunque haya una falla temporal, usando caché de respuestas reales previamente generadas.

## CF-013 — Calcular score explicable

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** recibir un score de prefactibilidad explicado,  
**para** entender los factores que favorecen o dificultan el proyecto.

### Criterios de aceptación

- El score está en escala de 0 a 100.
- Utiliza los pesos del PRD: cobertura boscosa 30%, presión de deforestación 20%, proximidad/traslape con área protegida 15%, tamaño 15% y completitud de información 20%.
- Cada factor se normaliza a 0–100 antes de ponderarse.
- El resultado muestra valor, peso y frase explicativa de cada factor.
- Si falta un dato, el sistema lo marca como no disponible y explica cómo afecta la confianza del score.
- El score conserva la versión de la fórmula y la fecha de cálculo.
- Se muestra permanentemente “score preliminar; no confirma elegibilidad ni certificación”.

## CF-014 — Estimar CO2e indicativo

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** ver una estimación indicativa de CO2e,  
**para** dimensionar el potencial inicial del proyecto.

### Criterios de aceptación

- El cálculo utiliza el patrón indicado: área en hectáreas × factor por cobertura × horizonte temporal.
- Los factores por defecto son configurables y se identifican como valores tipo IPCC Tier 1 cuando aplique.
- El resultado muestra unidad, periodo, factor utilizado, fuente, fecha y supuestos.
- El resultado se presenta como rango o valor indicativo con advertencia de incertidumbre.
- La UI muestra “estimación no certificada”.
- El sistema no genera un crédito, certificado, oferta de venta ni garantía de ingresos.

## CF-015 — Mostrar resultado completo de diagnóstico

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** consultar un resultado de diagnóstico integrado,  
**para** decidir si continúo con la formulación.

### Criterios de aceptación

- El resultado integra mapa/polígono, área, ubicación, cobertura, alertas, áreas protegidas, score y CO2e.
- Cada resultado muestra fuente y fecha.
- Se distinguen datos en vivo, datos cacheados, datos ingresados por el usuario y datos calculados.
- Se muestran riesgos, datos faltantes y recomendaciones.
- Existe un botón para iniciar la formulación sin volver a ingresar datos.
- Se muestra la advertencia de no certificación y de necesidad de revisión profesional.

## CF-016 — Exportar diagnóstico a PDF

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** descargar un PDF del diagnóstico,  
**para** compartir el resultado con un consultor o aliado.

### Criterios de aceptación

- El PDF contiene proyecto, fecha, geometría o mapa general, área, ubicación, fuentes, resultados, score, CO2e, supuestos y limitaciones.
- Incluye versión de fórmula y estado de caché/en vivo cuando sea relevante.
- Incluye advertencia visible: “estimación preliminar; no constituye certificación, verificación ni garantía de emisión o venta”.
- El PDF se genera desde la aplicación sin exponer claves de API.
- Si la generación falla, se muestra error legible y el usuario puede reintentar.

---

# EP-03 — Formulación guiada

## CF-017 — Iniciar formulación desde diagnóstico

**Prioridad:** P0  
**Estimación:** S

**Como** desarrollador,  
**quiero** iniciar la formulación desde el diagnóstico,  
**para** reutilizar la información ya capturada.

### Criterios de aceptación

- El botón “Continuar a formulación” crea o abre un expediente asociado al mismo proyecto.
- Se heredan nombre, tipo, área, ubicación y resultados del diagnóstico como datos de referencia.
- La formulación no duplica manualmente los campos heredados.
- El usuario puede corregir datos declarados, manteniendo la relación con el diagnóstico original.
- El expediente muestra fecha y estado de completitud.

## CF-018 — Completar datos generales y descripción

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** describir el proyecto y su intervención,  
**para** construir el expediente preliminar.

### Criterios de aceptación

- El formulario incluye resumen, objetivos, localización, área, intervención, titulares/actores y fecha estimada de inicio.
- Los datos del diagnóstico aparecen precargados cuando existan.
- Se puede guardar parcialmente.
- Los campos obligatorios faltantes se identifican con claridad.
- El sistema indica qué información es declarada por el usuario y cuál proviene del diagnóstico.

## CF-019 — Formular línea base preliminar

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** describir el escenario sin proyecto y la situación actual,  
**para** documentar una línea base inicial.

### Criterios de aceptación

- El formulario solicita situación actual, uso del suelo, tendencia sin proyecto y periodo de referencia.
- Permite agregar texto y valores de referencia básicos.
- Muestra ejemplos orientativos sin presentarlos como texto certificado.
- Se muestra advertencia de que la línea base requiere metodología y revisión profesional.
- El usuario puede avanzar aunque existan campos opcionales pendientes, pero los obligatorios bloquean la finalización.

## CF-020 — Documentar adicionalidad preliminar

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** describir barreras y necesidad de financiación,  
**para** preparar una hipótesis de adicionalidad.

### Criterios de aceptación

- Se pueden registrar barreras financieras, técnicas, regulatorias y de mercado.
- Se puede describir escenario alternativo sin proyecto.
- Se pueden registrar fuentes de financiación previstas y estado de obtención.
- La interfaz declara que no determina adicionalidad aprobada.
- El expediente conserva las respuestas para el chatbot y para la exportación.

## CF-021 — Registrar riesgos y permanencia

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** documentar riesgos del proyecto,  
**para** identificar condiciones que requieren gestión.

### Criterios de aceptación

- Se pueden registrar riesgo, categoría, impacto, probabilidad y medida propuesta.
- Categorías mínimas: tenencia, permanencia, fuga, incendios, deforestación, operación, social y regulatoria.
- Se pueden registrar riesgos abiertos sin afirmar que están mitigados.
- Los riesgos se muestran en el resumen del expediente.
- La interfaz indica que el listado no reemplaza estudio de riesgo ni evaluación de salvaguardas.

## CF-022 — Registrar salvaguardas y partes interesadas

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** registrar partes interesadas y salvaguardas,  
**para** preparar la revisión social y ambiental.

### Criterios de aceptación

- Se pueden registrar grupos/partes interesadas, posibles impactos y medidas de participación.
- El formulario pregunta si existen comunidades étnicas, consulta previa u otros procesos por validar.
- Se evitan datos personales sensibles innecesarios.
- Las respuestas se etiquetan como preliminares.
- El sistema muestra advertencia de que no sustituye consulta previa, permisos ni revisión jurídica.

## CF-023 — Registrar cronograma y presupuesto

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** registrar hitos, costos y fuentes de financiación,  
**para** estructurar la viabilidad inicial del proyecto.

### Criterios de aceptación

- Se pueden agregar actividades, fechas, responsables y estado.
- Se pueden agregar rubros, monto, moneda y fuente.
- El sistema calcula totales básicos.
- Se identifican fechas o valores faltantes.
- La salida se etiqueta como presupuesto preliminar, no como proyección financiera garantizada.

## CF-024 — Crear plan de monitoreo preliminar

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** definir indicadores y frecuencia de seguimiento,  
**para** completar la formulación requerida para una revisión posterior.

### Criterios de aceptación

- Se pueden agregar indicador, definición, fuente, frecuencia, responsable y método.
- Se muestra que este plan es una formulación preliminar y no el MRV operativo.
- El sistema no implementa evidencias, versionamiento, bitácora ni monitoreo continuo.
- El plan se incluye en el PDF del expediente.

## CF-025 — Selector compartido de tipo de proyecto en formulación

**Prioridad:** P0  
**Estimación:** S

**Como** desarrollador,  
**quiero** ver el tipo de proyecto seleccionado y el catálogo de futuras opciones,  
**para** mantener consistencia con el diagnóstico.

### Criterios de aceptación

- El tipo seleccionado en diagnóstico aparece precargado.
- Puede cambiarse solo mediante confirmación, reiniciando o ajustando campos incompatibles cuando aplique.
- Las opciones no habilitadas muestran “Próximamente”.
- No se permite exportar un expediente funcional para una vertical no habilitada.

## CF-026 — Exportar expediente de formulación

**Prioridad:** P0  
**Estimación:** L

**Como** desarrollador,  
**quiero** descargar el expediente formulado,  
**para** revisarlo o compartirlo con un profesional.

### Criterios de aceptación

- El PDF incluye todas las secciones completadas: descripción, línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto y monitoreo.
- Muestra porcentaje o estado de completitud y campos pendientes.
- Incluye advertencia de borrador preliminar.
- Incluye datos del diagnóstico como anexo o sección de referencia.
- La generación no requiere reingresar datos.

---

# EP-04 — Módulo de certificación

## CF-027 — Preparar documento de conocimiento curado

**Prioridad:** P0  
**Estimación:** L

**Como** equipo de producto,  
**quiero** disponer de un documento de conocimiento acotado y revisado,  
**para** que el chatbot responda sobre certificación forestal en Colombia sin inventar requisitos.

### Criterios de aceptación

- El documento cubre, como mínimo, marco normativo colombiano relevante, Decreto 926 de 2017, Resolución 1447 de 2018, Verra VCS, Gold Standard, metodologías típicas, etapas de certificación y entidades acreditadas.
- El alcance se limita a conservación/restauración forestal en Colombia.
- El documento distingue hechos normativos, orientaciones generales y asuntos que requieren revisión profesional.
- Cada afirmación normativa tiene fuente o referencia interna para revisión del equipo.
- Se documentan preguntas fuera de alcance.
- El chatbot recibe el documento como contexto/system prompt sin pipeline RAG complejo.

## CF-028 — Interfaz de chatbot de certificación

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** conversar con un chatbot sobre certificación,  
**para** recibir orientación inmediata sobre requisitos, estándares y metodologías.

### Criterios de aceptación

- La interfaz permite escribir y enviar preguntas.
- Se muestran mensajes de usuario y asistente con estados de carga y error.
- La conversación puede abrirse desde el proyecto formulado y recibe contexto del tipo de proyecto.
- La interfaz muestra permanentemente: “Orientación informativa; no constituye asesoría legal ni garantiza elegibilidad”.
- Las respuestas fuera del alcance indican explícitamente la limitación y recomiendan consulta profesional.
- No se envían al LLM claves, documentos o datos sensibles innecesarios.

## CF-029 — Respuestas acotadas y seguras del chatbot

**Prioridad:** P0  
**Estimación:** L

**Como** usuario,  
**quiero** recibir respuestas fundamentadas y limitadas al contenido curado,  
**para** no tomar decisiones basadas en requisitos inventados.

### Criterios de aceptación

- El prompt del sistema ordena responder solo con base en el conocimiento curado y declarar incertidumbre.
- El chatbot no afirma que un proyecto es elegible, certificado, verificado o aprobado.
- El chatbot no presenta asesoría jurídica ni financiera personalizada.
- Ante preguntas sobre otros tipos de proyecto, informa que el alcance funcional se limita a conservación/restauración forestal.
- Ante información insuficiente, solicita datos o recomienda revisión experta.
- Se prueban al menos tres preguntas ensayadas y sus respuestas son aceptables para la demo.
- Los errores de API del LLM muestran mensaje legible y permiten reintento.

## CF-030 — Registro de conversación para la sesión

**Prioridad:** P1  
**Estimación:** S

**Como** usuario,  
**quiero** consultar las preguntas y respuestas de mi sesión,  
**para** recordar la orientación recibida durante la formulación.

### Criterios de aceptación

- La conversación permanece visible mientras el usuario está en el módulo.
- Se puede iniciar una nueva conversación.
- Si se guarda en Supabase, queda asociada al usuario/proyecto con permisos adecuados.
- Se informa que la respuesta es orientativa y no constituye un documento oficial.
- No se requiere memoria permanente entre proyectos en el MVP.

## CF-031 — Buscar proyecto en registros oficiales

**Prioridad:** P0  
**Estimación:** XL; dividir por fuente

**Como** desarrollador o comprador,  
**quiero** buscar un proyecto por nombre, ubicación o desarrollador en registros oficiales,  
**para** consultar su posible estado y obtener la fuente primaria.

### Criterios de aceptación

- La interfaz permite seleccionar fuente: Verra, Gold Standard o RENARE/SUIA, según disponibilidad implementada.
- Permite ingresar nombre, ubicación o desarrollador.
- Cada consulta tiene estado: pendiente, consultando, resultados, sin resultados, no disponible o error.
- Cada resultado muestra nombre, ubicación o desarrollador disponible, identificador, estado reportado y enlace directo a la fuente oficial.
- La interfaz diferencia resultado de registro oficial de dato ingresado en CarbonFlow.
- Si una fuente no está disponible, el usuario recibe mensaje explícito y enlace al sitio oficial cuando exista.
- No se modifican registros externos ni se presenta el resultado como certificación propia.

## CF-032 — Caché de consultas de registros

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** que consultas repetidas se respondan rápidamente,  
**para** mantener una demo estable y reducir llamadas externas.

### Criterios de aceptación

- La clave de caché incluye fuente, término y parámetros relevantes.
- Las consultas repetidas devuelven el resultado cacheado indicando fecha de consulta original.
- La interfaz permite actualizar o reintentar cuando el resultado esté vencido o falle.
- El caché no se presenta como resultado en vivo actual si no se ha consultado nuevamente.
- El sistema conserva enlace a la fuente primaria.

---

# EP-05 — Marketplace simulado

## CF-033 — Cargar catálogo de proyectos

**Prioridad:** P0  
**Estimación:** M

**Como** comprador,  
**quiero** explorar un catálogo de proyectos,  
**para** encontrar iniciativas de mi interés.

### Criterios de aceptación

- El catálogo se alimenta de datos reales de usuario o datos de demo claramente etiquetados.
- Cada publicación contiene nombre, tipo, ubicación general, resumen, estado y etiquetas de trazabilidad.
- Se pueden filtrar proyectos por tipo, ubicación general, estado y atributos disponibles.
- El catálogo no afirma que los proyectos ofrecen créditos disponibles salvo evidencia y lenguaje cuidadosamente acotado.
- El catálogo funciona aunque no existan proyectos reales mediante registros de demostración identificados.

## CF-034 — Consultar ficha de marketplace

**Prioridad:** P0  
**Estimación:** M

**Como** comprador,  
**quiero** consultar la ficha de un proyecto,  
**para** evaluar si deseo solicitar una cotización.

### Criterios de aceptación

- La ficha muestra descripción, tipo, ubicación general, CO2e estimado cuando exista, documentos públicos y estado.
- Las estimaciones muestran fuente, fecha y advertencia de no certificación.
- La ficha no muestra coordenadas precisas ni documentos privados.
- Incluye botón “Solicitar cotización”.
- Declara que la contraparte y la transacción real no están habilitadas en el hackathon.

## CF-035 — Solicitar cotización

**Prioridad:** P0  
**Estimación:** M

**Como** comprador,  
**quiero** enviar una solicitud de cotización real,  
**para** expresar interés en un proyecto y recibir una respuesta.

### Criterios de aceptación

- El formulario solicita nombre, organización, correo, volumen/interés, mensaje y aceptación de compartir datos.
- La solicitud se guarda asociada a proyecto y comprador.
- El comprador recibe confirmación de envío.
- El desarrollador o vendedor simulado puede recibir la solicitud en el flujo de demo.
- La solicitud no crea una compra, reserva, contrato ni transferencia.
- Se registra si la respuesta posterior es simulada.

## CF-036 — Simular respuesta del vendedor

**Prioridad:** P0  
**Estimación:** M

**Como** comprador,  
**quiero** recibir una respuesta simulada después de solicitar cotización,  
**para** experimentar el flujo comercial completo durante la demo.

### Criterios de aceptación

- Después de un retraso breve y visible, el sistema inserta o muestra una respuesta predeterminada de contraparte.
- La respuesta está etiquetada inequívocamente como “Respuesta simulada para demo”.
- La respuesta no contiene precio vinculante, promesa de disponibilidad ni condiciones contractuales reales.
- El estado de la solicitud cambia a “Respuesta simulada recibida”.
- El usuario puede volver al catálogo o consultar el proyecto.
- Si el simulador falla, la UI permite reintentar.

---

# EP-06 — Bonos verdes simulados

## CF-037 — Crear perfil de proyecto elegible para financiación verde

**Prioridad:** P0  
**Estimación:** M

**Como** desarrollador,  
**quiero** presentar el perfil ambiental y financiero de mi proyecto,  
**para** explorar una conexión con un posible aliado financiero.

### Criterios de aceptación

- El perfil incluye proyecto asociado, descripción, uso previsto de recursos, monto orientativo, categoría ambiental y etapa.
- El sistema permite indicar documentos disponibles para data room.
- El perfil usa lenguaje de “potencial elegibilidad” o “proyecto en evaluación”, no aprobación financiera.
- Se diferencia bono verde de crédito de carbono.
- El perfil puede quedar visible solo con autorización del desarrollador.

## CF-038 — Data room básico

**Prioridad:** P0  
**Estimación:** M

**Como** financiador,  
**quiero** consultar un data room autorizado,  
**para** revisar información básica del proyecto antes de manifestar interés.

### Criterios de aceptación

- El data room muestra únicamente documentos/links marcados como públicos o compartidos.
- La ficha diferencia documento informativo de documento validado.
- Los documentos se pueden abrir o descargar según permisos.
- La interfaz muestra que el data room no sustituye debida diligencia.
- No se permite presentar una recomendación de inversión ni calificación financiera automática.

## CF-039 — Solicitar conexión financiera

**Prioridad:** P0  
**Estimación:** M

**Como** financiador o inversor,  
**quiero** enviar una solicitud de conexión,  
**para** expresar interés en conversar sobre el proyecto.

### Criterios de aceptación

- El formulario solicita nombre, organización, correo, tipo de interés, mensaje y consentimiento.
- La solicitud queda asociada al perfil de bonos verdes/proyecto.
- El usuario recibe confirmación de envío.
- La interfaz indica que no se está ofreciendo, recomendando ni negociando un valor.
- La solicitud llega al flujo de simulación financiera.

## CF-040 — Simular respuesta de aliado financiero

**Prioridad:** P0  
**Estimación:** M

**Como** financiador,  
**quiero** recibir una respuesta simulada del aliado financiero,  
**para** completar la demostración de conexión.

### Criterios de aceptación

- El sistema muestra una respuesta después de un retraso breve.
- La respuesta está etiquetada como “Aliado financiero simulado para demo”.
- No incluye aprobación, oferta vinculante, tasa, recomendación ni compromiso de inversión.
- El estado cambia a “Respuesta simulada recibida”.
- La UI permite reiniciar el flujo si el simulador falla.

## CF-041 — Diferenciar bonos verdes y créditos de carbono

**Prioridad:** P0  
**Estimación:** XS

**Como** usuario,  
**quiero** ver una explicación breve de la diferencia entre ambos instrumentos,  
**para** no confundir sus características.

### Criterios de aceptación

- El módulo explica que un crédito de carbono representa una reducción/remoción de emisiones, mientras que un bono verde es un instrumento de deuda destinado a proyectos ambientales.
- La explicación aparece antes o durante la solicitud de conexión.
- No se presenta el bono verde como crédito ni como inversión recomendada.
- El contenido incluye aviso de que la operación real requeriría revisión regulatoria.

---

# EP-07 — Integración, demo y calidad

## CF-042 — Conectar los cinco módulos

**Prioridad:** P0  
**Estimación:** L

**Como** equipo de demo,  
**quiero** que los módulos compartan el mismo proyecto,  
**para** demostrar un flujo continuo sin reingreso de información.

### Criterios de aceptación

- El flujo puede seguirse: diagnóstico → formulación → certificación → marketplace o bonos verdes.
- El tipo de proyecto seleccionado se mantiene entre módulos.
- El diagnóstico alimenta el expediente de formulación.
- El expediente puede abrir chatbot y búsqueda de registros.
- El proyecto o perfil formulado puede alimentar ficha marketplace y perfil verde.
- No se requiere copiar/pegar datos para completar el camino feliz.

## CF-043 — Pantalla de visión y roadmap

**Prioridad:** P0  
**Estimación:** S

**Como** jurado o usuario,  
**quiero** distinguir lo funcional de lo futuro,  
**para** entender el alcance real de CarbonFlow.

### Criterios de aceptación

- La pantalla muestra MRV operativo como “Próximo módulo / Fase 2”.
- Muestra los tipos de proyecto adicionales como “Próximamente”.
- Diferencia etiquetas: “Funcional”, “Simulado para demo” y “Roadmap”.
- No se presenta MRV ni marketplace transaccional como capacidades actuales.
- La pantalla permite volver al flujo funcional.

## CF-044 — Estados de carga, vacío y error

**Prioridad:** P0  
**Estimación:** M

**Como** usuario,  
**quiero** recibir estados claros durante el uso,  
**para** saber qué está ocurriendo y qué acción tomar.

### Criterios de aceptación

- Cada llamada externa presenta estado de carga.
- Las búsquedas sin resultados presentan estado vacío y sugerencias.
- Los errores presentan causa comprensible, código o referencia y acción de reintento.
- Los fallos no eliminan formularios o proyectos guardados.
- No existen pantallas en blanco en el camino de demo.

## CF-045 — Pruebas del camino feliz

**Prioridad:** P0  
**Estimación:** M

**Como** equipo de desarrollo,  
**quiero** probar el flujo completo de demo,  
**para** detectar fallas antes de presentar.

### Criterios de aceptación

- Se prueba un usuario autenticado desde selección de tipo hasta diagnóstico.
- Se prueba diagnóstico con polígono real de demostración, datos en vivo y resultado.
- Se prueba formulación y exportación PDF.
- Se prueban al menos tres preguntas del chatbot.
- Se prueba búsqueda en registros oficiales o el comportamiento definido de fuente no disponible.
- Se prueba solicitud de cotización y respuesta simulada.
- Se prueba data room y respuesta financiera simulada.
- El flujo completo se ejecuta sin intervención manual de base de datos.

## CF-046 — Grabar video de respaldo

**Prioridad:** P0  
**Estimación:** S

**Como** equipo de demo,  
**quiero** tener un video del flujo completo funcionando,  
**para** contar con respaldo ante problemas de conectividad o servicios externos.

### Criterios de aceptación

- El video muestra diagnóstico, formulación, certificación, marketplace y bonos verdes.
- Se identifica visualmente qué es real, qué es simulado y qué es roadmap.
- El video no expone API keys, datos personales ni coordenadas sensibles.
- El equipo puede reproducir el flujo en vivo siguiendo el mismo guion.

## CF-047 — Validar desempeño del diagnóstico

**Prioridad:** P0  
**Estimación:** M

**Como** equipo de demo,  
**quiero** que el diagnóstico cumpla el tiempo objetivo,  
**para** ofrecer una demostración fluida.

### Criterios de aceptación

- La primera consulta ensayada completa el resultado en menos de 10 segundos en condiciones normales.
- La repetición cacheada completa en menos de 1 segundo cuando sea técnicamente posible.
- Se miden tiempos de cada API y del cálculo local.
- Si el tiempo excede el objetivo, la UI muestra progreso y no parece congelada.
- Los tiempos se documentan para el ensayo final.

## CF-048 — Validar transparencia de simulaciones

**Prioridad:** P0  
**Estimación:** XS

**Como** jurado,  
**quiero** saber qué respuestas son simuladas,  
**para** evaluar correctamente la propuesta.

### Criterios de aceptación

- Cada respuesta de vendedor o aliado financiero incluye etiqueta visible de simulación.
- La pantalla de visión y el pitch explican el alcance.
- No se usan nombres reales ni se aparenta una contraparte real sin autorización.
- El código o configuración permite identificar fácilmente los simuladores.

---

## 3. Historias de soporte técnico

| ID | Historia | Prioridad | Estimación |
|---|---|---:|---:|
| EN-001 | Como desarrollador, quiero funciones servidor para ocultar API keys y centralizar integraciones | P0 | L |
| EN-002 | Como desarrollador, quiero caché persistente o de sesión para respuestas externas | P0 | M |
| EN-003 | Como desarrollador, quiero un adaptador común con timeout/reintento para cada API | P0 | M |
| EN-004 | Como desarrollador, quiero normalizar geometrías y sistemas de referencia | P0 | M |
| EN-005 | Como desarrollador, quiero generar PDF en cliente sin bloquear la interfaz | P0 | M |
| EN-006 | Como desarrollador, quiero manejar estados de error del LLM y registros | P0 | M |
| EN-007 | Como equipo, quiero datos de demo anonimizados/ficticios para no exponer ubicaciones sensibles | P0 | S |
| EN-008 | Como equipo, quiero una guía de despliegue y recuperación | P0 | S |
| EN-009 | Como equipo, quiero logs mínimos sin secretos ni contenido sensible | P1 | S |
| EN-010 | Como equipo, quiero pruebas de integración con respuestas cacheadas y respuestas en vivo | P0 | M |

---

## 4. Corte de alcance para 24 horas

### Obligatorio para la demo

- CF-001 a CF-007.
- CF-009 a CF-016.
- CF-017 a CF-026.
- CF-027 a CF-029 y CF-031.
- CF-033 a CF-036.
- CF-037 a CF-041.
- CF-042 a CF-048.
- EN-001 a EN-008 y EN-010.

### Puede simplificarse sin romper la demo

- CF-008: carga de KML/GeoJSON puede limitarse a GeoJSON si el tiempo es crítico.
- CF-011: si RUNAP/SIAC falla, mostrar estado “no disponible” y conservar el resultado de las demás fuentes.
- CF-030: persistencia de conversación puede reducirse a sesión.
- CF-032: caché puede ser de sesión o tabla simple con TTL.
- CF-038: data room puede usar enlaces/archivos mínimos de demo.
- CF-045: pruebas pueden ejecutarse manualmente con checklist.

### No iniciar durante el hackathon

- MRV operativo.
- Multi-vertical funcional.
- Transacciones o pagos.
- Integración de escritura con registros.
- RBAC granular, panel administrativo completo y auditoría inmutable.
- RAG con base vectorial.
- Modelos avanzados de biomasa o dMRV.

---

## 5. Orden de implementación en 24 horas

| Bloque | Horas | Historias prioritarias | Resultado |
|---|---:|---|---|
| 1 | 0–2 | CF-001–CF-005, EN-001 | App, Supabase, autenticación, claves y catálogo |
| 2 | 2–4 | CF-013, CF-014, CF-027 | Fórmula score/CO2e y conocimiento curado |
| 3 | 4–9 | CF-006–CF-012, EN-002–EN-004 | Mapa, polígono, APIs en vivo, resiliencia |
| 4 | 9–11 | CF-015–CF-016, EN-005 | Resultado y PDF |
| 5 | 11–14 | CF-017–CF-026 | Formulación completa y expediente |
| 6 | 14–17 | CF-028–CF-032, EN-006 | Chatbot y búsqueda en registros |
| 7 | 17–19 | CF-033–CF-036 | Marketplace y vendedor simulado |
| 8 | 19–20.5 | CF-037–CF-041 | Bonos verdes y aliado simulado |
| 9 | 20.5–22 | CF-042–CF-045 | Integración, estados y pruebas |
| 10 | 22–23.5 | CF-046–CF-048 | Video, pitch y transparencia |
| 11 | 23.5–24 | Buffer | Correcciones y despliegue final |

---

## 6. Criterios de aceptación globales

El MVP del hackathon está listo cuando:

1. El usuario inicia sesión y selecciona un tipo de proyecto.
2. El desplegable muestra todas las categorías; solo conservación/restauración forestal es funcional.
3. El usuario dibuja o carga un polígono y recibe área y ubicación aproximada.
4. Se consultan GFW y RUNAP/SIAC en vivo, con caché, timeout, reintento y error visible.
5. El sistema genera score explicable y CO2e indicativo con fuentes, fecha y supuestos.
6. El usuario exporta diagnóstico y expediente de formulación a PDF.
7. El usuario completa línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto y plan de monitoreo preliminar.
8. El chatbot responde correctamente a preguntas acotadas de certificación y declara sus límites.
9. La búsqueda en registros muestra resultado real o dirige a la fuente oficial correcta sin modificarla.
10. El marketplace permite catálogo y solicitud de cotización, con respuesta simulada claramente etiquetada.
11. El módulo de bonos verdes permite data room y conexión, con respuesta financiera simulada claramente etiquetada.
12. Se muestra una pantalla separada de roadmap para MRV y capacidades futuras.
13. No se presentan simulaciones como operaciones reales.
14. Existe video de respaldo y el camino completo puede ejecutarse sin intervención manual.

---

## 7. Backlog post-hackathon

Estas historias no deben entrar en las 24 horas, pero derivan directamente del PRD:

| ID | Historia | Fase |
|---|---|---|
| PH-001 | Implementar MRV con checklist, evidencias, versionamiento y bitácora | Fase 2 |
| PH-002 | Añadir monitoreo satelital continuo y alertas | Fase 2 |
| PH-003 | Habilitar formulación de solar, eólica, biogás, biomasa, agroforestería y eficiencia | Fase 2 |
| PH-004 | Ampliar chatbot mediante base de conocimiento revisada/RAG | Fase 2 |
| PH-005 | Integrar validación autorizada con registros externos | Fase 3 |
| PH-006 | Reemplazar vendedores simulados por contrapartes reales | Fase 3 |
| PH-007 | Implementar pagos, custodia y retiro mediante proveedores autorizados | Fase 3 |
| PH-008 | Implementar negociación real de bonos verdes | Fase 3 |
| PH-009 | Incorporar KYC/AML y controles de cumplimiento | Fase 3 |
| PH-010 | Crear RBAC granular multi-organización y panel administrativo | Fase 3 |
| PH-011 | Incorporar datos satelitales de mayor resolución | Fase 1/2 |
| PH-012 | Crear API para aliados y entidades financieras | Fase 4 |
