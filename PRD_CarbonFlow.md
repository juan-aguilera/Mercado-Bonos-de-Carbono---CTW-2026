# PRD — CarbonFlow

**Versión:** 2.3 (plan final, listo para ejecución)
**Estado:** Final — listo para ejecución
**Producto:** CarbonFlow
**Mercado inicial:** Colombia
**Tipo de producto:** Plataforma web SaaS con marketplace de instrumentos ambientales
**Contexto:** Este PRD define (a) la visión completa del producto y (b) el recorte exacto que se construirá en las 24 horas del hackathon. La sección 2 es la fuente de verdad para lo que el equipo debe construir; el resto del documento sostiene el pitch y el roadmap posterior.

## 1. Resumen del producto

CarbonFlow es una plataforma digital para facilitar el acceso al mercado de carbono y al financiamiento verde. Permite a propietarios de tierra, comunidades, desarrolladores de proyectos, empresas compradoras e inversores evaluar predios, formular proyectos de mitigación, orientarse en su proceso de certificación y conectar oferta y demanda de créditos de carbono y bonos verdes.

La visión completa reúne cinco capacidades: (1) diagnóstico geoespacial y de prefactibilidad, (2) formulación guiada de proyectos, (3) orientación de certificación y MRV/dMRV, (4) marketplace informativo y transaccional, y (5) bonos verdes. CarbonFlow no certifica, verifica ni emite créditos por cuenta propia.

**Para el hackathon, el equipo construye cinco módulos funcionales:**

1. Diagnóstico geoespacial con APIs en vivo (núcleo diferenciador).
2. Formulación guiada completa, con selector de tipo de proyecto.
3. **Módulo de certificación**: chatbot de orientación normativa + búsqueda del proyecto en registros oficiales.
4. Marketplace, funcional con contraparte simulada.
5. Bonos verdes, funcional con contraparte simulada.

El **MRV operativo** (checklist de evidencias, versionado documental, bitácora, monitoreo continuo) queda explícitamente fuera del hackathon y se muestra solo como visión de roadmap — no debe confundirse con el módulo de certificación (3), que es informativo/de orientación y de consulta, no un sistema de gestión documental.

## 2. Alcance del MVP para el hackathon (24 horas)

### 2.1 Jerarquía de los módulos

- **Núcleo diferenciador:** diagnóstico geoespacial de predio forestal, de punta a punta, con datos en vivo vía API. Es lo que más debe brillar y lo que se ensaya con más cuidado.
- **Módulos funcionales de soporte (deben funcionar de verdad):** formulación guiada completa, certificación (chatbot + búsqueda en registros), marketplace y bonos verdes con contraparte simulada.
- **Excluido del hackathon:** MRV operativo (checklist, evidencias, versionado, bitácora, monitoreo continuo).

### 2.2 Qué entra y qué no entra

| Incluido en el hackathon | Fuera del hackathon (visión en el pitch, no se construye) |
|---|---|
| Diagnóstico geoespacial completo con APIs en vivo (polígono, área, cobertura boscosa, deforestación, áreas protegidas, score explicable, CO2e, export PDF) | **MRV operativo completo** (checklist, evidencias georreferenciadas, versionado de documentos, bitácora, importación de datos operativos, series satelitales continuas) |
| **Selector de tipo de proyecto (desplegable)** en diagnóstico y formulación — todos los tipos visibles (conservación/restauración forestal, reforestación, agroforestería, solar, eólica, biogás, biomasa, eficiencia energética); solo **conservación/restauración forestal** está habilitado y funcional, el resto se muestra marcado como "próximamente" | Flujo funcional completo para los demás tipos de proyecto |
| Formulación guiada completa (línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto) | — |
| **Módulo de certificación:** chatbot de orientación (normatividad, requisitos, estándares, metodologías, entidades acreditadas) + interfaz de búsqueda del proyecto en registros oficiales | Gestión documental de certificación (eso es MRV, ver arriba) |
| Marketplace funcional: catálogo real, solicitud de cotización real, con **respuesta de contraparte simulada** | Marketplace transaccional real (pagos, custodia, retiro de créditos vía registro) |
| Bonos verdes funcional: perfil de proyecto elegible, data room real, solicitud de conexión con **aliado financiero simulado** | Negociación real de bonos verdes o recomendaciones de inversión |
| Autenticación real (Supabase Auth) y organizaciones básicas | RBAC granular multi-organización con delegación fina de permisos |

**Por qué el MRV operativo sigue excluido:** el chatbot y la búsqueda en registros del módulo de certificación son informativos/de consulta — no requieren modelar checklist, versionado de documentos ni bitácora inmutable, que es lo que hacía a MRV riesgoso en 24h (ver análisis previo). El nuevo módulo 3 es más liviano de construir que el MRV que se descartó, por eso puede incluirse sin reintroducir ese riesgo.

### 2.3 Estrategia de datos: APIs en vivo, no datos precargados

| Necesidad | Fuente en vivo | Notas |
|---|---|---|
| Cobertura boscosa % y alertas de deforestación por polígono | **Global Forest Watch Data API** | Key gratuita autoservicio, sin aprobación manual. |
| Traslape con áreas protegidas de Colombia | **RUNAP / Parques Nacionales — ArcGIS REST** o WFS del SIAC | Público, sin API key. |
| Ubicación administrativa (municipio/vereda) | **Nominatim (OpenStreetMap)** | Gratuito, límite 1 req/seg, cachear por sesión. |
| Cálculo de área y geometría | **Turf.js en el cliente** | Se mantiene local, sin dependencia de red. |
| Orientación normativa de certificación | **LLM (ej. Claude API) + documento de conocimiento curado** | Ver sección 2.4bis — contenido acotado a conservación/restauración forestal en Colombia, no RAG completo. |
| Búsqueda del proyecto en registros oficiales | Consulta en vivo a Verra, Gold Standard y RENARE/SUIA | Se asume disponibilidad; ver sección 2.4bis. |

**Patrón de resiliencia obligatorio para toda llamada a API/servicio externo:** caché de respuestas reales por clave de consulta (polígono o término de búsqueda), timeout de 5-8s + un reintento, y estado de error legible en la UI si falla — nunca pantalla en blanco. Ensayar con el polígono y las consultas exactas de la demo antes de presentar.

### 2.4 Metodología del score y del estimado de CO2e

**Score de prefactibilidad (0-100), suma ponderada de factores normalizados 0-100:**

| Factor | Peso | Fuente |
|---|---|---|
| Cobertura boscosa actual (%) | 30% | GFW Data API (en vivo) |
| Presión de deforestación (alertas recientes) | 20% | GFW Data API (en vivo) |
| Proximidad/traslape con área protegida | 15% | RUNAP/ArcGIS REST (en vivo) |
| Tamaño del polígono vs. mínimo viable por tipo de proyecto | 15% | Cálculo geométrico (Turf.js, local) |
| Completitud de la información declarada por el usuario | 20% | Formulario |

Cada factor se muestra con su valor, peso y una frase explicativa. **Estimación de CO2e:** `área (ha) × factor de emisión/remoción por tipo de cobertura (valores por defecto tipo IPCC Tier 1) × horizonte temporal`, siempre junto a fuente, fecha y aviso "estimación no certificada".

### 2.4bis Módulo de certificación: alcance concreto

**Chatbot de orientación:**
- Acotado exclusivamente a conservación/restauración forestal en Colombia (el único tipo de proyecto funcional en el MVP).
- Implementado como un LLM (ej. Claude API) con un **documento de conocimiento curado** como contexto/system prompt — no un pipeline de RAG con base vectorial, para que sea construible en horas. El documento cubre: marco normativo colombiano relevante (p. ej. Decreto 926 de 2017 y Resolución 1447 de 2018 sobre impuesto al carbono y no causación), estándares aplicables (Verra VCS, Gold Standard), metodologías típicas para bosques (p. ej. REDD+/evitación de deforestación, restauración), etapas del proceso de certificación (documento de proyecto, validación, registro, monitoreo, verificación, emisión) y ejemplos de entidades validadoras/verificadoras acreditadas.
- El chatbot responde solo con base en ese contenido curado; si la pregunta excede el alcance, debe decirlo explícitamente y sugerir consulta profesional — nunca inventar un requisito normativo.
- Aviso permanente en la interfaz: "orientación informativa, no constituye asesoría legal ni garantiza elegibilidad ante ningún estándar o registro".

**Búsqueda en registros oficiales:**
- Se implementa como consulta en vivo directa contra Verra Registry, Gold Standard Impact Registry y RENARE/SUIA, por nombre/ubicación/desarrollador del proyecto.
- Cada resultado incluye además un enlace directo "ver en el registro oficial" como complemento informativo, no como contingencia.
- *Supuesto aceptado para el alcance del hackathon:* la disponibilidad y estabilidad de estas consultas se da por sentada, por decisión explícita del equipo — no se dedica tiempo a validarla antes de construir sobre ella.

### 2.5 Stack recomendado

- **Frontend:** Next.js/React + Leaflet + Turf.js.
- **Backend-as-a-service:** **Supabase** (Postgres + Auth + Storage + API REST instantánea) para proyectos, expedientes, catálogo de tipos de proyecto, publicaciones de marketplace y perfiles de bonos verdes.
- **Capa de integración de APIs externas:** funciones de servidor (Supabase Edge Functions o un pequeño servicio Node/FastAPI) para GFW/RUNAP/Nominatim y para el registro/búsqueda oficial, con caché y timeout uniformes.
- **Chatbot de certificación:** llamada a un LLM (ej. Claude API) con el documento de conocimiento curado como contexto del sistema.
- **Simulador de contraparte** (marketplace y bonos verdes): función que, tras un breve retraso, inserta automáticamente una respuesta simulada.
- **Exportación PDF:** librería cliente (jsPDF/react-pdf).
- **Hosting demo:** Vercel/Render como respaldo del laptop del equipo.

### 2.6 Guion de demo sugerido (5-7 minutos)

1. (30s) Problema y visión completa de CarbonFlow en una pantalla resumen (incluyendo MRV operativo como "próximo módulo").
2. (2 min) Núcleo: seleccionar tipo de proyecto (mostrar el desplegable completo, elegir conservación/restauración forestal), dibujar polígono → consultas en vivo → score explicado → CO2e → exportar PDF.
3. (1 min) Formulación guiada completa a partir del predio diagnosticado.
4. (1 min) Módulo de certificación: preguntarle algo al chatbot (p. ej. "¿qué estándar me conviene?") y mostrar la búsqueda del proyecto en el registro oficial.
5. (1 min) Marketplace: publicar/consultar una oferta y mostrar la respuesta simulada.
6. (1 min) Bonos verdes: data room y conexión simulada con aliado financiero.
7. (30s) Cierre: modelo de negocio y próximos pasos (incluyendo MRV operativo y demás tipos de proyecto como Fase 2).

### 2.7 Plan de 24 horas

| Bloque | Horas | Foco |
|---|---|---|
| 1 | 0-2 | Setup de repos y Supabase; alta de API keys (GFW, LLM, registros oficiales); prueba de conectividad de GFW/RUNAP/Nominatim/Verra/Gold Standard/RENARE |
| 2 | 2-4 | Fórmula final de score/CO2e; borrador del documento de conocimiento curado del chatbot |
| 3 | 4-9 | Mapa + polígono + selector de tipo de proyecto + integración en vivo GFW/RUNAP/Nominatim + caché/timeout/fallback |
| 4 | 9-11 | UI de resultados + exportación PDF (cierre del núcleo) |
| 5 | 11-14 | Formulación guiada completa (con selector de tipo de proyecto) conectada al expediente |
| 6 | 14-17 | Módulo de certificación: chatbot (integración LLM + documento curado) + interfaz de búsqueda en registros oficiales |
| 7 | 17-19 | Marketplace funcional (catálogo + cotización + simulador de vendedor) |
| 8 | 19-20.5 | Bonos verdes funcional (data room + simulador de aliado financiero) |
| 9 | 20.5-22 | Integración end-to-end entre los 5 módulos, pantalla resumen de visión, control de errores del camino feliz |
| 10 | 22-23.5 | Pitch deck, guion de demo, ensayo con conexión real, video de respaldo |
| 11 | 23.5-24 | Buffer y despliegue final |

### 2.8 Criterios de éxito específicos del hackathon

- El flujo de diagnóstico responde en menos de 10 segundos por consulta en vivo, menos de 1 segundo en repeticiones cacheadas.
- El desplegable de tipo de proyecto muestra todas las categorías; solo conservación/restauración forestal es seleccionable de forma funcional, el resto aparece claramente como "próximamente" sin engañar al jurado.
- El chatbot de certificación responde con información correcta y acotada al alcance curado, y declara sus límites cuando corresponde.
- La búsqueda en registros oficiales devuelve un resultado real o, como mínimo, dirige a la fuente oficial correcta.
- Formulación, marketplace y bonos verdes son funcionales con datos reales del usuario (solo la contraparte es simulada).
- MRV operativo se presenta únicamente en la pantalla de visión/roadmap.
- Existe un video de respaldo del flujo completo.
- El equipo puede explicar en menos de 2 minutos qué es real, qué es simulado y qué es solo visión futura.

## 3. Problema

- La identificación inicial de predios con potencial de proyectos de carbono exige análisis geoespaciales, ambientales y financieros especializados, inaccesibles para propietarios pequeños.
- La formulación de proyectos requiere documentos, líneas base y evidencia técnica que la mayoría de propietarios no sabe producir.
- Entender qué estándar, metodología o entidad acreditada aplica es confuso incluso para desarrolladores con experiencia.
- Los propietarios y desarrolladores tienen visibilidad limitada sobre compradores, precios y calidad de créditos.
- Existe confusión entre créditos de carbono, bonos verdes y otros instrumentos ambientales.

## 4. Oportunidad

Colombia concentra un alto potencial forestal, agroforestal y de conservación con muy baja digitalización del proceso de originación de proyectos. CarbonFlow ofrece un punto de entrada digital de bajo costo para el diagnóstico, la formulación, la orientación de certificación y la conexión comercial, con expansión futura a otros tipos de proyecto, MRV operativo y marketplace transaccional en Latinoamérica.

## 5. Análisis competitivo (breve, para el pitch)

- **Pachama, Sylvera, Renoster** (internacionales): fuerte en monitoreo satelital y rating de créditos ya emitidos, orientados a compradores institucionales grandes.
- **Registros y estándares (Verra, Gold Standard, RENARE):** son sistemas de registro y certificación, no herramientas de diagnóstico, formulación ni orientación accesible al propietario.
- **Consultoras tradicionales:** ofrecen el mismo acompañamiento de forma manual, lenta y costosa, sin un chatbot de orientación inmediata.
- **Diferenciador de CarbonFlow:** conecta diagnóstico accesible + formulación guiada + orientación de certificación con IA + comercialización en un solo flujo, con datos en vivo, pensado para el propietario/desarrollador pequeño.

## 6. Objetivos

### Objetivos de negocio
- Reducir el tiempo de un diagnóstico preliminar de días/semanas a minutos.
- Reducir la fricción de entender el proceso de certificación mediante orientación conversacional inmediata.
- Generar una base verificable de proyectos potencialmente elegibles para certificación.
- Validar el interés comercial de propietarios, desarrolladores, compradores e inversores.

### Objetivos de usuario (hackathon)
- Que un usuario obtenga un diagnóstico preliminar explicado en menos de un minuto.
- Que pueda avanzar de diagnóstico a expediente formulado sin re-ingresar información.
- Que pueda resolver una duda de certificación con el chatbot sin buscar en fuentes externas.
- Que un comprador o financiador reciba una respuesta (simulada) a su solicitud sin quedar en un vacío de flujo.

### Objetivos de impacto
- Mejorar la trazabilidad y transparencia de proyectos ambientales.
- Favorecer la participación de propietarios pequeños y comunidades rurales.
- Evitar mensajes de compensación engañosa o greenwashing.

## 7. No objetivos

Ni en el hackathon ni en el MVP post-hackathon, CarbonFlow:

- Emitirá, certificará o verificará créditos de carbono.
- Garantizará la elegibilidad de un proyecto ante un estándar o registro.
- Ejecutará operaciones bursátiles, custodia de valores, asesoría de inversión ni captación de recursos del público.
- Permitirá tokenización o negociación de valores sin evaluación jurídica y autorizaciones específicas.
- Sustituirá estudios de campo, consulta previa, licencias, permisos o títulos de propiedad.
- Afirmará neutralidad climática para compradores solo por adquirir créditos.
- Ejecutará transacciones reales de créditos o bonos, ni negociación real con contrapartes humanas (en el hackathon, las contrapartes son simuladas por diseño).
- El chatbot de certificación no constituye asesoría legal ni garantiza elegibilidad ante ningún estándar, metodología o registro; es orientación informativa acotada al contenido curado.

## 8. Modelo de negocio (hipótesis para el pitch)

- **Propietarios/comunidades:** acceso gratuito al diagnóstico (gancho de adquisición).
- **Desarrolladores de proyecto:** suscripción SaaS para formulación, orientación de certificación y gestión documental.
- **Compradores corporativos:** acceso gratuito al catálogo; comisión de intermediación sobre transacciones cuando el marketplace transaccional real esté habilitado.
- **Consultores/verificadores:** modelo de referidos o suscripción por acceso a pipeline de proyectos (ligado al futuro MRV operativo).

Se declara explícitamente como hipótesis a validar en Fase 0 (sección 18), no como modelo cerrado.

## 9. Usuarios y roles

| Rol | Necesidad principal | En el hackathon |
|---|---|---|
| Propietario de predio | Entender potencial y requisitos | **Sí** — diagnóstico, formulación y certificación completos |
| Desarrollador de proyecto | Formular, orientarse en certificación y comercializar | **Sí** — todos los módulos funcionales |
| Comprador corporativo | Adquirir créditos | **Sí** — cotización real con respuesta de contraparte simulada |
| Inversor/financiador | Encontrar oportunidades verdes | **Sí** — data room y conexión con aliado financiero simulado |
| Consultor técnico / Verificador | Apoyo especializado a MRV operativo | No — visión futura (ligado a Fase 2) |
| Administrador CarbonFlow | Operar la plataforma | No — se narra en el pitch, no se construye |

## 10. Propuesta de valor

**Para propietarios y desarrolladores:** diagnóstico en minutos con datos en vivo, formulación completa sin re-ingresar información, y un chatbot que resuelve dudas de certificación al instante.

**Para compradores e inversores:** catálogo y data room reales, con respuesta rápida (simulada en el hackathon) que demuestra la experiencia comercial futura.

**Para aliados técnicos y financieros:** visión de un pipeline ordenado de proyectos digitalizados desde el origen, con MRV operativo como siguiente capa (Fase 2).

## 11. Alcance funcional (visión completa, con etiqueta de fase)

### 11.1 Diagnóstico geoespacial `[Hackathon]`
Selector de tipo de proyecto, dibujo de polígono, carga de GeoJSON/KML, cálculo de área, consultas en vivo a GFW y RUNAP, reverse geocoding con Nominatim, score explicable, estimación de CO2e, export PDF.

### 11.2 Formulación guiada `[Hackathon: versión completa para conservación/restauración forestal | Fase 2: demás tipos de proyecto]`
Descripción y localización, titularidad y consentimientos, línea base y escenario, adicionalidad, riesgos y permanencia, plan de monitoreo, salvaguardas, cronograma y presupuesto. Selector de tipo de proyecto compartido con el diagnóstico.

### 11.3 Módulo de certificación `[Hackathon: chatbot + búsqueda en registros | Fase 2: MRV operativo completo]`
En el hackathon: chatbot de orientación normativa/estándares/metodologías/entidades acreditadas (acotado a conservación/restauración forestal), e interfaz de búsqueda del proyecto en registros oficiales. El MRV operativo (checklist, evidencias georreferenciadas, versionado, bitácora, monitoreo continuo) queda en Fase 2.

### 11.4 Marketplace `[Hackathon: funcional con contraparte simulada | Fase 3: transaccional real]`
Catálogo, filtros, ficha de proyecto, solicitud de cotización con respuesta simulada. La versión completa añade negociación real e integración con registros/custodios.

### 11.5 Módulo de bonos verdes `[Hackathon: funcional con contraparte simulada | Fase 3: negociación real]`
Biblioteca educativa, perfil de proyecto elegible, data room real, conexión con respuesta simulada de aliado financiero.

## 12. Flujos principales

### Flujo A: diagnóstico de predio forestal `[Hackathon — núcleo diferenciador]`

1. El usuario inicia sesión (Supabase Auth).
2. Selecciona el tipo de proyecto en el desplegable (solo conservación/restauración forestal está habilitado; los demás aparecen como "próximamente").
3. Registra un predio dibujando o cargando un polígono.
4. Completa información básica (uso del suelo, tenencia declarada).
5. El sistema consulta en vivo GFW, RUNAP y Nominatim, con caché y fallback.
6. Recibe el informe preliminar con score explicado, CO2e y alertas, y lo exporta en PDF.

### Flujo B: formulación de proyecto forestal `[Hackathon]`

1. El desarrollador continúa desde un predio ya diagnosticado (tipo de proyecto ya seleccionado en el Flujo A).
2. El asistente guía la captura de línea base, adicionalidad, riesgos, salvaguardas, cronograma y presupuesto.
3. El sistema genera un expediente preliminar exportable.
4. El desarrollador puede continuar a certificación o publicar en marketplace/bonos verdes.

### Flujo C: orientación de certificación `[Hackathon]`

1. El desarrollador entra al módulo de certificación desde el expediente formulado.
2. Consulta al chatbot sobre normatividad, requisitos, estándares, metodologías o entidades acreditadas aplicables a su proyecto.
3. El chatbot responde con base en el contenido curado y declara sus límites si la pregunta excede el alcance.
4. El usuario busca su proyecto (por nombre, ubicación o desarrollador) en los registros oficiales disponibles.
5. El sistema muestra el resultado en vivo, con enlace directo a la fuente oficial para más detalle.

### Flujo D: compra de créditos `[Hackathon: funcional con vendedor simulado]`

1. El comprador explora el catálogo con filtros de calidad.
2. Consulta ficha, documentos disponibles y condiciones.
3. Envía una solicitud de cotización real.
4. El sistema simula automáticamente la respuesta del vendedor tras un breve retraso.
5. *(Fuera del hackathon)* La transacción real se ejecuta mediante un proveedor autorizado y el crédito se retira del registro correspondiente.

### Flujo E: conexión con financiación verde `[Hackathon: funcional con aliado financiero simulado]`

1. El desarrollador marca su proyecto como elegible para financiación verde y habilita el data room.
2. Un inversor/financiador consulta el perfil y la documentación disponible.
3. Envía un formulario de conexión.
4. El sistema simula automáticamente una respuesta de interés tras un breve retraso.
5. *(Fuera del hackathon)* Negociación real y cierre de financiación, sujeto a autorizaciones regulatorias.

## 13. Requisitos funcionales

| ID | Requisito | Alcance |
|---|---|---|
| FR-01 | Autenticación real (Supabase Auth) | Hackathon |
| FR-02 | Selector de tipo de proyecto (desplegable) en diagnóstico y formulación, con todos los tipos visibles y solo conservación/restauración forestal habilitado | Hackathon |
| FR-03 | Creación de predio/proyecto con geometría (dibujo o carga de GeoJSON/KML) | Hackathon |
| FR-04 | Cálculo de área y ubicación administrativa (Nominatim) | Hackathon |
| FR-05 | Consulta en vivo a GFW (cobertura boscosa y alertas de deforestación) por polígono | Hackathon |
| FR-06 | Consulta en vivo a RUNAP/ArcGIS (traslape con áreas protegidas) | Hackathon |
| FR-07 | Caché de respuestas de API por consulta + timeout + reintento + fallback visible | Hackathon |
| FR-08 | Score de prefactibilidad explicable con desglose por factor | Hackathon |
| FR-09 | Estimación indicativa de CO2e con fuente, fecha y supuestos visibles | Hackathon |
| FR-10 | Exportación de informe de diagnóstico a PDF | Hackathon |
| FR-11 | Formulario guiado completo (línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto) | Hackathon |
| FR-12 | Exportación de expediente de formulación a PDF | Hackathon |
| FR-13 | Chatbot de orientación de certificación (normatividad, estándares, metodologías, entidades acreditadas) basado en contenido curado, acotado a conservación/restauración forestal | Hackathon |
| FR-14 | Interfaz de búsqueda/consulta en vivo del proyecto en registros oficiales (Verra, Gold Standard, RENARE), con enlace directo complementario a la fuente | Hackathon |
| FR-15 | Catálogo de marketplace real con filtros | Hackathon |
| FR-16 | Solicitud de cotización real + simulador de respuesta de vendedor | Hackathon |
| FR-17 | Data room de bonos verdes real + formulario de conexión | Hackathon |
| FR-18 | Simulador de respuesta de aliado financiero | Hackathon |
| FR-19 | MRV operativo completo (checklist, evidencias, versionado, bitácora, monitoreo continuo) | Fase 2 |
| FR-20 | Formulación y diagnóstico funcional para los demás tipos de proyecto (energía renovable, agroforestería, etc.) | Fase 2 |
| FR-21 | Alertas satelitales continuas (procesamiento asíncrono) | Fase 2 |
| FR-22 | Marketplace transaccional real (pago, custodia, retiro vía registro) | Fase 3 |
| FR-23 | Integraciones con registros, KYC/AML y proveedores de pago | Fase 3 |
| FR-24 | RBAC granular multi-organización, panel administrativo y auditoría | Fase 3 |
| FR-25 | API para integraciones externas | Fase 4 |

## 14. Requisitos no funcionales

### Para el hackathon (realista)
- El flujo de diagnóstico responde en menos de 10 segundos incluyendo llamadas a APIs externas; menos de 1 segundo en repeticiones cacheadas.
- HTTPS en el despliegue de demo.
- Toda llamada a API/servicio externo (incluido el LLM y la búsqueda en registros) tiene timeout, reintento y estado de error visible.
- Todo score, estimación o respuesta del chatbot muestra su fuente/alcance y limitaciones.
- El producto nunca presenta las estimaciones como créditos emitidos ni el chatbot como asesoría legal.
- Toda respuesta simulada de contraparte está etiquetada como tal en el código y declarada abiertamente en el pitch si se pregunta.

### Visión completa (post-hackathon)
- Cifrado en tránsito y en reposo, control de acceso por rol y organización, auditoría de operaciones sensibles, autenticación multifactor.
- El propietario del proyecto controla permisos de visualización y descarga; datos geográficos sensibles no públicos por defecto.
- Disponibilidad objetivo 99,5% mensual; arquitectura desacoplada para procesamiento geoespacial asíncrono.
- Cumplimiento del régimen de protección de datos personales aplicable en Colombia.

## 15. Datos principales

**Entidades del hackathon:** Usuario, Tipo de proyecto (con estado habilitado/próximamente), Predio, Geometría/polígono, Diagnóstico, Estimación de CO2e, Expediente, Documento (PDF exportado), Conversación de chatbot, Consulta a registro oficial, Publicación de marketplace, Solicitud de cotización, Respuesta simulada de vendedor, Perfil de bonos verdes, Solicitud de conexión financiera, Respuesta simulada de aliado financiero.

**Entidades de la visión completa (no se modelan en el hackathon):** Organización multi-rol, Checklist/Tarea de MRV, Evidencia georreferenciada, Riesgo, Consultor/verificador, Crédito o lote, Transacción real, Registro de auditoría.

**Datos sensibles a tener en cuenta incluso en demo:** ubicación precisa de predios reales (usar solo predios ilustrativos o datos anonimizados/ficticios, nunca coordenadas reales de un propietario sin su consentimiento).

## 16. Arquitectura

Ver stack recomendado en sección 2.5. Para la visión post-hackathon: PostgreSQL con PostGIS, almacenamiento de archivos compatible con S3, sistema de colas para procesamiento satelital asíncrono, fuentes satelitales de mayor resolución, base de conocimiento del chatbot ampliada (RAG con más tipos de proyecto), e integraciones futuras con registros de créditos, proveedores KYC/AML y pagos.

## 17. Métricas de éxito

### Métricas de la demo (hackathon)
- Diagnóstico completo de inicio a fin en menos de 10 segundos con datos en vivo, demostrado al menos 2 veces sin fallas.
- 100% de los scores y estimaciones muestran fuente, fecha y supuestos.
- El chatbot responde correctamente a al menos 3 preguntas ensayadas de certificación.
- La búsqueda en vivo en registros oficiales devuelve resultado válido en el 100% de los intentos ensayados.
- El flujo completo (diagnóstico → formulación → certificación → marketplace o bonos verdes) se completa sin intervención manual.

### Métricas de la visión completa (post-hackathon)
- Usuarios registrados por mes y % que crean al menos un predio/proyecto.
- % de diagnósticos que avanzan a formulación y de formulaciones que llegan a certificación o se publican en marketplace.
- Ingreso mensual recurrente SaaS y tasa de conversión de interés a acuerdo comercial.
- Incidentes de datos, fraude o doble publicación detectados (cero tolerado).

## 18. Criterios de aceptación del hackathon

El proyecto está listo para presentarse cuando:

1. Un usuario puede seleccionar tipo de proyecto, dibujar/cargar un polígono y recibir un diagnóstico con datos en vivo en menos de 10 segundos.
2. El score y el CO2e muestran explicación de factores, fuente y fecha.
3. El sistema maneja sin errores una falla temporal de cualquier API/servicio externo.
4. El usuario puede exportar diagnóstico y expediente de formulación en PDF.
5. El desarrollador puede completar la formulación completa y consultar al chatbot de certificación con respuestas correctas y acotadas.
6. El usuario puede buscar su proyecto en vivo en los registros oficiales disponibles, con enlace directo a la fuente para más detalle.
7. Un desarrollador puede publicar en marketplace o bonos verdes, y un comprador/inversor recibe una respuesta simulada sin quedar en un flujo incompleto.
8. Existe una pantalla de visión que muestra MRV operativo y los demás tipos de proyecto como próximos pasos.
9. Existe un video de respaldo del flujo funcionando.
10. El equipo puede explicar en menos de 2 minutos qué es real, qué es simulado y qué es solo visión futura.

## 19. Roadmap

### Hackathon (0-24 horas)
Ver sección 2 completa.

### Fase 0: Descubrimiento y validación (post-hackathon, 0-3 meses)
Entrevistas con propietarios, desarrolladores, compradores y consultores; validación del modelo de negocio (sección 8); mapeo jurídico preliminar (sección 21); selección del siguiente tipo de proyecto a habilitar.

### Fase 1: Consolidación del diagnóstico y formulación (4-8 meses)
RBAC real multi-organización, integración con datos satelitales de mayor resolución, piloto cerrado en Colombia.

### Fase 2: MRV operativo y ampliación de tipos de proyecto (9-15 meses)
Checklists por metodología, evidencias georreferenciadas, versionado de documentos, bitácora inmutable, alertas satelitales continuas, habilitación de energía renovable/agroforestería en diagnóstico y formulación, ampliación del chatbot y su base de conocimiento (RAG) a esos tipos de proyecto.

### Fase 3: Marketplace y bonos verdes transaccionales (16-24 meses)
Reemplazo de las contrapartes simuladas por negociación real, integraciones con brokers/registros, evaluación de mecanismos de pago y retiro según viabilidad regulatoria.

### Fase 4: Escala regional (24+ meses)
Adaptación normativa por país, nuevos tipos de proyecto, API para aliados.

## 20. Riesgos y mitigaciones

### Riesgos específicos del hackathon

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Falla o lentitud de una API externa (GFW, RUNAP, Nominatim) durante la demo | Alto | Caché de respuestas reales, timeout + reintento, ensayo previo (sección 2.3) |
| Alcance de 5 módulos funcionales en 24h | Alto | Orden de prioridad: 1) diagnóstico, 2) formulación, 3) certificación, 4) marketplace, 5) bonos verdes; jerarquía de esfuerzo en sección 2.1 |
| Alucinación del chatbot en temas normativos | Alto | Contenido curado y acotado como único contexto, instrucción explícita de declarar límites, disclaimer visible (sección 2.4bis) |
| Confundir al jurado entre lo real, lo simulado y la visión futura | Medio | Guion de demo explícito, pantalla de visión separada, declaración abierta de qué es simulado |
| Integración tardía entre módulos (expediente ↔ certificación ↔ marketplace ↔ bonos verdes) | Medio | Esquema de datos único desde el bloque 1 del plan (2.7) |

### Riesgos de la visión completa (post-hackathon)

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Estimaciones satelitales inexactas o interpretadas como certificación | Alto | Mostrar incertidumbre, fuentes y limitaciones; no prometer elegibilidad |
| Cambios regulatorios | Alto | Comité jurídico y parametrización normativa por país |
| Greenwashing o créditos de baja integridad | Alto | Filtros de calidad, moderación y transparencia documental |
| Doble conteo o doble venta | Alto | Identificadores de registro, reconciliación y controles de publicación |
| Conflictos de tenencia o derechos comunitarios | Alto | Checklist obligatorio y validación documental antes de publicación (parte del MRV operativo, Fase 2) |
| Mercado con baja liquidez | Medio | Comenzar como directorio y RFQ, alianzas con brokers y compradores ancla |
| Riesgo financiero al ofrecer bonos verdes | Alto | Limitar a información y conexión; asesoría y licencias antes de intermediar realmente |

## 21. Consideraciones legales y de cumplimiento

No aplican controles legales para la demo del hackathon: no se procesan datos reales de propietarios ni transacciones, toda respuesta de contraparte es simulada, y el chatbot declara explícitamente que no es asesoría legal. Se declara en el pitch que, antes de operar con datos reales o transacciones, CarbonFlow requerirá revisión jurídica sobre: regulación colombiana de mercados de carbono y registros; protección de datos personales; prevención de lavado de activos y KYC; publicidad ambiental y afirmaciones climáticas; normativa financiera y de valores aplicable a bonos verdes; y derechos territoriales/consulta previa cuando corresponda. Este gate legal debe completarse antes de iniciar la Fase 1 con usuarios reales y, en particular, antes de reemplazar las contrapartes simuladas por negociación real (Fase 3) o de ampliar el chatbot a contenido normativo no revisado por un experto.

## 22. Decisiones pendientes (post-hackathon)

- Validar el modelo de negocio (sección 8) con entrevistas reales.
- Seleccionar fuentes y licencias definitivas de información satelital para producción (más allá de GFW).
- Confirmar con un experto legal el contenido curado del chatbot antes de exponerlo a usuarios reales.
- Definir si el modelo comercial será B2B, B2B2C o marketplace administrado.
- Validar socios de certificación, verificación, corretaje y financiación reales (para reemplazar a los simulados).
- Evaluar estructura societaria y jurisdicción de operación.

## 23. Próximos pasos inmediatos

1. Ejecutar el plan de 24 horas de la sección 2.7.
2. Dar de alta las API keys (GFW, LLM) y probar conectividad de GFW/RUNAP/Nominatim y la vía elegida para búsqueda en registros oficiales antes de iniciar el desarrollo.
3. Redactar el documento de conocimiento curado del chatbot de certificación en el bloque 2-4h.
4. Preparar el pitch y el guion de demo (sección 2.6) con al menos un ensayo completo.
5. Grabar el video de respaldo del flujo funcionando.
6. Tras el hackathon: iniciar Fase 0 (entrevistas de validación, mapeo jurídico y revisión experta del contenido del chatbot) antes de invertir en Fase 1 y en el MRV operativo de Fase 2.
