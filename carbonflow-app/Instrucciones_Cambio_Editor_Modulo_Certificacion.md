# Instrucciones para implementar el módulo “Validación y Registro” en CarbonFlow

## Objetivo

Reemplazar el módulo actual llamado **“Certificación”** por un módulo llamado **“Validación y Registro”**. No modificar el chatbot existente ni su lógica: debe conservarse tal como está y ubicarse como un panel de apoyo contextual dentro del nuevo módulo.

El módulo debe consumir la información producida por los módulos previos **Diagnóstico** y **Formulación**, sin pedir al usuario que diligencie nuevamente los mismos datos. Su función es mostrar, de forma clara y accionable, cómo una iniciativa pasa desde la formulación hasta la validación por una OVV, el registro y reporte en RENARE, la implementación, la verificación de resultados y, posteriormente, la posibilidad de conectar con interesados en el Marketplace.

El módulo no certifica, no valida, no verifica, no registra directamente en RENARE y no garantiza pagos por resultados. Debe usar lenguaje de orientación y preparación.

---

## Cambio de navegación

Cambiar el ítem del menú superior:

```text
Antes: Certificación
Después: Validación y Registro
```

Cambiar también:

- Ruta sugerida: `/validacion-registro`.
- Título de página.
- Breadcrumbs, botones, enlaces internos y textos relacionados.
- Cualquier etiqueta que afirme o sugiera que CarbonFlow certifica proyectos.

Mantener el Marketplace como módulo separado. Su propósito es conectar desarrolladores con compradores, financiadores, consultores y OVV; no debe mezclarse con la gestión de ruta de validación y registro.

---

## Encabezado de la página

Usar esta estructura:

```text
Validación y Registro
Prepara tu iniciativa para la validación independiente, el registro y reporte en RENARE, y la futura verificación de resultados.

[Proyecto activo: selector de proyecto]
```

Debajo, incluir una alerta permanente y discreta:

```text
CarbonFlow orienta y organiza la preparación del proyecto. No valida, verifica, certifica, registra ante RENARE ni garantiza emisión de créditos o pagos por resultados.
```

---

## Principio de experiencia de usuario

La página debe responder una sola pregunta:

> “Con la información que ya tengo en Diagnóstico y Formulación, ¿qué me falta, cuál es mi etapa actual y qué debo hacer para avanzar hacia validación, RENARE y resultados verificables?”

No crear un nuevo formulario extenso. Reutilizar los datos ya capturados.

---

# Estructura de la pantalla

Diseñar la página con tres zonas principales:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Encabezado + selector de proyecto                                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Estado de preparación       │ 2. Ruta de Validación y Registro   │
│    + brechas prioritarias      │    + etapa actual + acciones       │
├─────────────────────────────────────────────────────────────────────┤
│ 3. Paquete de preevaluación    │ 4. RENARE y trazabilidad           │
├─────────────────────────────────────────────────────────────────────┤
│ 5. Recursos y referentes       │ Chatbot existente sin cambios      │
└─────────────────────────────────────────────────────────────────────┘
```

En escritorio, utilizar dos columnas para las secciones superiores. En móvil, apilar las secciones de forma vertical. Mantener el chatbot existente en una columna lateral o al final de la página, sin modificar su contenido, prompt, comportamiento ni mensajes.

---

# 1. Selector de proyecto y carga de datos

## Comportamiento

- Al entrar al módulo, cargar el último proyecto activo del usuario.
- Permitir cambiar de proyecto con un selector.
- Si no existen proyectos, mostrar un estado vacío con botones:

```text
Aún no tienes un proyecto preparado.

[Ir a Diagnóstico] [Ir a Formulación]
```

- Si existe proyecto pero no tiene diagnóstico o formulación, mostrar una ruta incompleta y enlaces directos para completarlos.

## Datos a reutilizar

### Desde Diagnóstico

- Nombre del proyecto.
- Tipo de proyecto.
- Polígono/ubicación general.
- Área.
- Cobertura boscosa o información geoespacial disponible.
- Alertas de deforestación o restricciones detectadas.
- Score y factores del diagnóstico.
- Estimación indicativa de CO2e.
- Fecha del diagnóstico.

### Desde Formulación

- Descripción del proyecto.
- Línea base preliminar.
- Adicionalidad.
- Riesgos de permanencia/fuga.
- Salvaguardas y partes interesadas.
- Cronograma.
- Presupuesto.
- Plan inicial de monitoreo.
- Estado de diligenciamiento por sección.

---

# 2. Estado de preparación para validación y registro

## Propósito

Mostrar una síntesis automática y accionable del nivel de preparación del proyecto. No llamarlo “elegibilidad” ni “certificación”.

## Título y texto

```text
Estado de preparación
Evalúa qué información ya está disponible y qué brechas debes resolver antes de solicitar una revisión técnica o de avanzar en la ruta de registro.
```

## Tarjeta principal

```text
Preparación para validación y registro: 64/100
Estado: En estructuración

Fortalezas
✓ Polígono y ubicación definidos
✓ Diagnóstico geoespacial disponible
✓ Línea base preliminar diligenciada
✓ Riesgos iniciales identificados

Brechas prioritarias
! Falta soporte de tenencia o autorización de uso
! Metodología/estándar por definir con revisión especializada
! Salvaguardas y participación por completar
! Plan de monitoreo requiere mayor detalle

[Ver detalle de brechas] [Descargar resumen]
```

## Regla de cálculo sugerida

Calcular el indicador sobre 100 puntos. Mostrar siempre el detalle de cómo se calcula.

| Criterio | Puntaje máximo | Fuente |
|---|---:|---|
| Proyecto y polígono definidos | 10 | Diagnóstico |
| Datos geoespaciales y área disponibles | 10 | Diagnóstico |
| Control/tenencia declarada y soporte indicado | 15 | Diagnóstico/Formulación |
| Línea base preliminar completa | 15 | Formulación |
| Adicionalidad documentada | 10 | Formulación |
| Riesgos de permanencia y fuga identificados | 10 | Formulación |
| Salvaguardas y partes interesadas registradas | 10 | Formulación |
| Cronograma y presupuesto iniciales | 10 | Formulación |
| Plan de monitoreo inicial | 10 | Formulación |

### Reglas de presentación

- 0–39: **Inicial**.
- 40–69: **En estructuración**.
- 70–84: **Preparación avanzada**.
- 85–100: **Listo para solicitar revisión técnica**.

Mostrar siempre debajo:

```text
Este indicador es una herramienta de preparación interna. No constituye una decisión de validación, registro, certificación ni elegibilidad.
```

## Brechas accionables

Cada brecha debe tener:

- Nombre.
- Explicación corta.
- Nivel: crítico, importante o recomendado.
- Fuente del vacío: Diagnóstico o Formulación.
- Botón para ir al campo/sección correspondiente.

Ejemplo:

```text
CRÍTICO · Control del predio
No se ha registrado soporte de propiedad, tenencia, autorización o derecho de uso.
[Completar en Formulación]
```

---

# 3. Ruta de Validación y Registro

## Propósito

Mostrar la secuencia general aplicable a iniciativas de mitigación que buscan resultados verificables y, eventualmente, pagos por resultados. Debe mostrar la etapa actual del proyecto y explicar los roles de RENARE y OVV.

## Título

```text
Ruta de la iniciativa
Esta ruta organiza las etapas frecuentes desde la factibilidad hasta los resultados verificables. La ruta definitiva depende de la metodología, estándar, requisitos nacionales y revisión de un profesional competente.
```

## Línea de tiempo

Crear una línea de tiempo vertical o horizontal con estos estados:

```text
1. Factibilidad
2. Formulación
3. Validación por OVV
4. Registro y reporte en RENARE
5. Implementación y monitoreo
6. Verificación de resultados por OVV
7. Resultados verificados / emisión según la ruta aplicable
8. Pago por resultados, transferencia o retiro
9. Cierre y seguimiento
```

## Estado por etapa

Cada etapa debe usar uno de estos estados visuales:

- Completada.
- En curso.
- Pendiente.
- Bloqueada.
- Futura.
- Requiere verificación externa.

## Lógica inicial para determinar etapa actual

- Si no hay diagnóstico: etapa actual = Factibilidad.
- Si hay diagnóstico pero falta formulación mínima: etapa actual = Formulación.
- Si la formulación tiene menos de 70% de completitud: etapa actual = Formulación.
- Si formulación >= 70% y preparación < 85: etapa actual = Preparación para validación.
- Si preparación >= 85: etapa actual = Listo para solicitar revisión técnica / Validación por OVV.
- Las etapas de implementación, monitoreo, verificación, emisión y pago deben verse como futuras en el MVP, salvo que el usuario registre manualmente una referencia externa.

## Contenido de cada etapa

Al hacer clic o expandir una etapa, mostrar:

- Objetivo.
- Qué debe preparar el titular.
- Quién interviene.
- Resultado esperado.
- Acción sugerida.

### Contenido sugerido

#### 1. Factibilidad

```text
Objetivo: determinar si existe una iniciativa con información mínima para estructurarse.

Titular: delimita el área, describe la actividad y registra información inicial.
RENARE: la iniciativa debe revisar su ruta de inscripción y reporte desde factibilidad cuando aplique.
OVV: normalmente no interviene aún.
Resultado: diagnóstico y decisión de continuar a formulación.
Acción: [Ver diagnóstico]
```

#### 2. Formulación

```text
Objetivo: estructurar la línea base, adicionalidad, riesgos, salvaguardas, cronograma, presupuesto y monitoreo inicial.

Titular: completa el expediente preliminar.
RENARE: revisar requisitos de registro/reporte aplicables.
OVV: puede revisar posteriormente el diseño bajo el marco aplicable.
Resultado: paquete de preevaluación para revisión técnica.
Acción: [Completar formulación]
```

#### 3. Validación por OVV

```text
Objetivo: obtener evaluación independiente del diseño de la iniciativa, según la ruta aplicable.

Titular: contrata una OVV competente e independiente y entrega el paquete de diseño.
OVV: valida metodología, línea base, adicionalidad, cuantificación, salvaguardas y plan de monitoreo, según su alcance acreditado.
RENARE: registrar/actualizar fase y soportes cuando corresponda.
Resultado: declaración o informe de validación.
Acción: [Preparar paquete para OVV] [Ver OVV en Marketplace]
```

#### 4. Registro y reporte en RENARE

```text
Objetivo: asegurar trazabilidad nacional de la iniciativa y de sus resultados, conforme a los requisitos aplicables.

Titular: registra o actualiza información de la iniciativa y reporta avances/resultados cuando corresponda.
RENARE: concentra el registro y trazabilidad de las iniciativas de mitigación de GEI.
OVV: puede aportar documentos de validación/verificación cuando sean requeridos.
Resultado: referencia o constancia de la gestión realizada, según la fuente oficial.
Acción: [Preparar información RENARE] [Registrar referencia]
```

#### 5. Implementación y monitoreo

```text
Objetivo: ejecutar las actividades y recopilar evidencia de resultados.

Titular: implementa el proyecto y aplica el plan de monitoreo.
OVV: no monitorea por el titular; interviene en la verificación independiente posterior.
RENARE: se reportan resultados y cambios según requisitos aplicables.
Resultado: informe de monitoreo y evidencia.
Acción: [Ver roadmap MRV]
```

#### 6. Verificación de resultados por OVV

```text
Objetivo: comprobar de manera independiente los resultados de mitigación reportados.

Titular: entrega informe de monitoreo, cálculos y soportes.
OVV: verifica datos, metodología, resultados, fugas, permanencia y evidencia, según alcance acreditado.
RENARE: recibe o referencia resultados reportados conforme a la ruta aplicable.
Resultado: declaración o informe de verificación.
Acción: [Ver requisitos futuros de MRV]
```

#### 7. Resultados verificados / emisión según ruta aplicable

```text
Objetivo: obtener el reconocimiento, certificación o emisión aplicable a los resultados verificados.

Titular: tramita el reconocimiento ante el estándar, programa o registro aplicable.
OVV: su informe de verificación respalda el trámite, pero no emite créditos.
RENARE: mantiene trazabilidad nacional de los resultados cuando aplique.
Resultado: resultados reconocidos o certificados según la ruta aplicable.
Acción: [Consultar referentes]
```

#### 8. Pago por resultados, transferencia o retiro

```text
Objetivo: acordar el uso comercial o programático de resultados verificables.

Titular: negocia con comprador, programa o financiador y formaliza el acuerdo.
Marketplace: conecta titulares con compradores, financiadores, consultores y OVV; no ejecuta pagos en el MVP.
RENARE: puede requerirse trazabilidad o reporte para prevenir doble uso, según el caso.
Resultado: pago por resultados, transferencia o retiro conforme a contrato y normas aplicables.
Acción: [Ir a Marketplace]
```

#### 9. Cierre y seguimiento

```text
Objetivo: cerrar formalmente la iniciativa o cumplir obligaciones posteriores de seguimiento.

Titular: reporta cierre, conserva soportes y gestiona obligaciones pendientes.
RENARE: se actualiza el estado de cierre cuando corresponda.
OVV: puede intervenir si la ruta exige una verificación final.
Resultado: iniciativa cerrada o en seguimiento post-cierre.
Acción: [Ver guía de cierre]
```

---

# 4. Paquete de preevaluación para OVV

## Propósito

Permitir que el usuario genere un paquete ordenado para solicitar una revisión preliminar a una firma consultora o a una OVV, sin afirmar que el expediente cumple requisitos oficiales.

## Título

```text
Paquete de preevaluación
Reúne la información ya disponible para solicitar una revisión técnica. Este paquete no equivale a una solicitud formal de validación ni a un expediente certificado.
```

## Contenido dinámico

Mostrar una lista con estado de inclusión:

```text
✓ Resumen de proyecto
✓ Polígono y área
✓ Resultado de diagnóstico geoespacial
✓ Línea base preliminar
✓ Adicionalidad preliminar
✓ Riesgos iniciales
✓ Salvaguardas y partes interesadas
✓ Cronograma y presupuesto
✓ Plan inicial de monitoreo
! Soporte de control del predio: pendiente
! Metodología objetivo: pendiente
```

## Acciones

```text
[Vista previa] [Descargar PDF] [Compartir enlace] [Solicitar revisión en Marketplace]
```

## Reglas

- Si faltan campos críticos, permitir descargar el paquete pero incluir una portada: “Paquete incompleto — contiene brechas críticas”.
- El PDF debe mostrar fuentes, fecha de generación, campos faltantes y advertencias.
- No incluir coordenadas precisas ni datos sensibles en una versión compartible, salvo autorización explícita del titular.
- El botón “Solicitar revisión en Marketplace” debe pasar el resumen no sensible del proyecto, el estado de preparación y las brechas, nunca documentos privados sin consentimiento.

---

# 5. RENARE y trazabilidad

## Propósito

Orientar al usuario sobre RENARE sin afirmar que CarbonFlow está integrado o puede registrar iniciativas en su nombre.

## Sección de página

```text
RENARE y trazabilidad nacional
RENARE es el Registro Nacional de Reducción de Emisiones de Gases de Efecto Invernadero. CarbonFlow te ayuda a preparar y organizar información, pero no presenta ni modifica registros ante RENARE.
```

## Estado de referencia RENARE

Permitir almacenar información declarada por el usuario:

- Estado de gestión:
  - No iniciado.
  - En preparación.
  - Referencia RENARE registrada por el usuario.
  - Resultados reportados por el usuario.
  - Cierre reportado por el usuario.
- Número o ID de referencia, opcional.
- URL pública, opcional.
- Fecha de última actualización.
- Observaciones.

## Etiquetas de confianza

Mostrar una etiqueta visible según el caso:

```text
Información declarada por el usuario
```

o

```text
Referencia externa enlazada — validar en la fuente oficial
```

No usar etiquetas como “RENARE confirmado” a menos que exista una integración autorizada y evidencia de consulta verificable.

## Acciones

```text
[Preparar información requerida] [Registrar referencia] [Abrir RENARE/SUIA] [Consultar al asistente]
```

## Lista de información a preparar

- Identificación del titular o responsable.
- Ubicación y polígono.
- Tipo de iniciativa y actividad.
- Línea base y metodología prevista.
- Periodo de implementación.
- Salvaguardas y partes interesadas.
- Plan de monitoreo.
- Resultados reportados, cuando existan.

Agregar el texto:

```text
La obligación, los campos y el procedimiento aplicable deben verificarse directamente en RENARE/SUIA y con la regulación vigente.
```

---

# 6. Recursos y referentes

## Objetivo

Reemplazar el enfoque de “buscador de proyectos” como herramienta central. Crear una biblioteca de apoyo que ayude a preparar y entender la ruta, sin depender de APIs de registros que pueden no estar disponibles.

## Nombre de sección

```text
Recursos y referentes
Guías, plantillas y casos públicos para entender la ruta de validación y registro.
```

## Pestañas

```text
[Guías y plantillas] [Casos de referencia] [Preguntas frecuentes]
```

### Guías y plantillas

Crear tarjetas para:

- Guía de línea base preliminar.
- Matriz de adicionalidad.
- Lista de información sobre control del predio.
- Matriz de riesgos de permanencia y fuga.
- Guía de salvaguardas y participación.
- Plantilla de cronograma y presupuesto.
- Preguntas para contratar consultor o OVV.
- Guía de información inicial para RENARE.

Cada tarjeta debe incluir:

- Descripción corta.
- Etapa de la ruta donde se usa.
- Botón “Ver guía” o “Descargar plantilla”.
- Etiqueta “Orientativo — adaptar a metodología y estándar aplicable”.

### Casos de referencia

Usar fichas curadas, no un buscador en vivo obligatorio.

Cada ficha debe incluir:

- Nombre del caso.
- Tipo de iniciativa.
- País/región general.
- Estándar o registro público.
- Etapa/estado únicamente si aparece en fuente pública.
- Metodología, si es pública.
- Enlace oficial.
- “Qué aprender de este caso”.
- Fecha de última consulta.

Etiqueta obligatoria:

```text
Caso público de referencia. CarbonFlow no certifica ni garantiza la información o disponibilidad de resultados asociados.
```

### Preguntas frecuentes

Incluir preguntas que enlacen o activen el chatbot existente:

- ¿Qué diferencia hay entre validación y verificación?
- ¿Qué hace una OVV?
- ¿Qué debo preparar para RENARE?
- ¿Qué es adicionalidad?
- ¿Qué significa un resultado verificado?
- ¿Qué necesito antes de buscar un comprador?

---

# 7. Integración con Marketplace

## Regla de separación de roles

- **Validación y Registro:** prepara el proyecto para revisión técnica, orienta sobre OVV y RENARE, genera paquete de preevaluación.
- **Marketplace:** conecta personas y organizaciones: desarrolladores, compradores, financiadores, consultores y OVV.

No crear compra, contratación, pago, validación ni registro real dentro de este módulo.

## Enlaces de acción

Desde “Paquete de preevaluación” y “Ruta de Validación”, crear enlaces hacia Marketplace:

```text
[Encontrar consultor] [Encontrar OVV] [Buscar comprador] [Buscar financiador]
```

Al abrir el Marketplace desde este módulo, aplicar filtros o contexto automático:

```text
Tipo de necesidad: Revisión de validación
Tipo de proyecto: Conservación/restauración forestal
Estado: En estructuración
Preparación: 64/100
Brechas: control del predio, metodología, salvaguardas
```

Mostrar al usuario una vista previa y pedir consentimiento antes de compartir información con terceros.

---

# 8. Reglas de lenguaje y cumplimiento

## Usar

- “Preparación para validación y registro”.
- “Ruta preliminar”.
- “Revisión técnica”.
- “Paquete de preevaluación”.
- “Información declarada por el usuario”.
- “Referencia externa”.
- “Resultado reportado en una fuente”.
- “Requiere validación/verificación independiente”.

## No usar

- “Proyecto certificado” salvo que se muestre literalmente el estado y fuente externa verificable.
- “Elegible garantizado”.
- “Bonos garantizados”.
- “Créditos disponibles” sin fuente verificable.
- “Registro RENARE confirmado” sin integración autorizada.
- “CarbonFlow valida/verifica/certifica”.
- “Pago asegurado”.

## Avisos obligatorios

En “Estado de preparación” y “Ruta” incluir:

```text
La información de CarbonFlow es orientativa y se basa en datos ingresados por el usuario y módulos previos. No reemplaza a una OVV, una autoridad competente, RENARE/SUIA, un estándar ni asesoría jurídica, técnica o financiera.
```

---

# 9. Estados vacíos y errores

## Sin proyecto

```text
No encontramos un proyecto activo para evaluar.

Para usar esta ruta, primero crea un proyecto y completa el diagnóstico inicial.

[Crear proyecto] [Ir a Diagnóstico]
```

## Diagnóstico incompleto

```text
Tu proyecto aún no tiene un diagnóstico completo.

Necesitamos al menos un polígono, área, actividad y ubicación general para construir la ruta de preparación.

[Completar diagnóstico]
```

## Formulación incompleta

```text
Tu formulación aún está en progreso.

Completa línea base, adicionalidad, riesgos, salvaguardas, presupuesto y plan de monitoreo para obtener una evaluación más útil.

[Continuar formulación]
```

## RENARE sin integración

```text
La consulta directa a RENARE no está habilitada en esta versión.

Puedes registrar una referencia, preparar tu información y abrir la fuente oficial para continuar el trámite.

[Registrar referencia] [Abrir fuente oficial]
```

---

# 10. Criterios de aceptación funcionales

La implementación estará completa cuando:

1. El menú y la ruta cambien de “Certificación” a “Validación y Registro”.
2. El módulo cargue un proyecto existente y reutilice datos de Diagnóstico y Formulación.
3. El usuario vea un indicador de preparación con puntaje, fortalezas, brechas y acciones directas.
4. El usuario pueda abrir una línea de tiempo con las nueve etapas de la iniciativa.
5. Cada etapa explique el rol del titular, RENARE y OVV cuando aplique.
6. El sistema identifique la etapa actual con reglas simples basadas en datos previos.
7. El usuario pueda generar un paquete de preevaluación en PDF, incluso si está incompleto, con brechas visibles.
8. El usuario pueda registrar una referencia RENARE declarada, sin que CarbonFlow afirme validación o integración oficial.
9. Exista biblioteca de guías, plantillas y casos curados en reemplazo del buscador como función central.
10. Los botones de buscar consultor, OVV, comprador o financiador redirijan al Marketplace con contexto y consentimiento.
11. El chatbot actual siga funcionando exactamente como está, sin cambios de lógica ni contenido.
12. La interfaz muestre advertencias consistentes que eviten promesas de certificación, emisión, pago o registro.

---

# 11. Prioridad para implementación rápida

## Implementar primero

1. Cambio de nombre, ruta y encabezado.
2. Selector de proyecto y carga de datos desde Diagnóstico/Formulación.
3. Estado de preparación con score, fortalezas, brechas y enlaces internos.
4. Línea de tiempo de nueve etapas con contenido estático y estado dinámico básico.
5. Paquete de preevaluación en pantalla y exportación PDF simple.
6. Sección RENARE con referencia declarada por usuario.
7. Enlaces al Marketplace con filtros/contexto.
8. Chatbot existente sin modificaciones.

## Implementar después

- Biblioteca descargable de plantillas.
- Casos públicos curados.
- Comparación de rutas/estándares.
- Integración autorizada con RENARE/SUIA.
- Integración con directorio real de consultores y OVV.
- MRV operativo, evidencia, versionamiento y monitoreo continuo.
