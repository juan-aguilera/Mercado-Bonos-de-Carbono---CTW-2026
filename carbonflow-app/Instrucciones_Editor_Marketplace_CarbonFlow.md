# Instrucciones para mejorar el Marketplace de CarbonFlow

## Objetivo de la mejora

Evolucionar el Marketplace desde un catálogo pasivo de perfiles hacia un sistema de **matching de necesidades y oportunidades**.

El Marketplace no debe operar como exchange, bolsa, sistema de pagos o mecanismo de compra/venta de créditos. Debe permitir que proyectos, OVV, compradores y financiadores publiquen lo que ofrecen o necesitan, encuentren coincidencias transparentes y compartan información de manera gradual y controlada.

Mantener las tres categorías actuales:

1. **Validación y Verificación (OVV)**
2. **Créditos de Carbono**
3. **Financiación Verde**

Agregar dentro de cada categoría tres vistas:

```text
[ Explorar oferta ] [ Necesidades activas ] [ Publicar necesidad ]
```

---

# 1. Principios obligatorios

## No cambiar el alcance regulatorio

No implementar:

- Pagos.
- Checkout.
- Compra o venta vinculante.
- Custodia.
- Transferencia o retiro de créditos.
- Contratación automática de OVV.
- Recomendaciones financieras.
- Aprobación de crédito o financiación.
- Ratings de calidad climática o probabilidad de emisión.

## Usar lenguaje correcto

Usar:

```text
Manifestación de interés
Solicitud de información
Necesidad activa
Solicitud de propuesta no vinculante
Compatibilidad de criterios
Proyecto en estructuración
Información declarada
Documento compartido por el titular
```

No usar:

```text
Comprar ahora
Oferta garantizada
Créditos disponibles
Proyecto certificado por CarbonFlow
OVV recomendada
Aprobación financiera
Inversión garantizada
Rating de calidad
```

## Aviso común

Mostrar en todas las vistas del Marketplace:

```text
CarbonFlow facilita conexiones y el intercambio controlado de información. No ejecuta transacciones, certificaciones, validaciones, verificaciones, transferencias, pagos ni recomendaciones de inversión.
```

---

# 2. Navegación principal

Mantener la ruta:

```text
/marketplace
```

Estructura superior:

```text
Marketplace
Conecta proyectos climáticos con validación, demanda y financiación.

[ Validación y Verificación ] [ Créditos de Carbono ] [ Financiación Verde ]
```

Debajo de cada categoría, mostrar el submenú:

```text
[ Explorar oferta ] [ Necesidades activas ] [ Publicar necesidad ]
```

Agregar acceso rápido global:

```text
[ Publicar mi proyecto ] [ Publicar una necesidad ] [ Mis coincidencias ] [ Mis solicitudes ]
```

---

# 3. Nueva funcionalidad: Necesidades activas

## Propósito

Permitir que cualquier actor publique criterios de búsqueda, de forma que los demás usuarios no tengan que explorar perfiles a ciegas.

## Modelo de datos sugerido

Crear entidad `marketplace_needs`:

```ts
id: string
category: 'ovv' | 'carbon' | 'green_finance'
created_by_user_id: string
organization_id: string
status: 'draft' | 'published' | 'paused' | 'closed'
title: string
summary: string
need_type: string
project_type: string[]
location_scope: string[]
minimum_preparation_level?: 'initial' | 'structured' | 'advanced' | 'ready_for_review'
validation_service?: 'pre_evaluation' | 'validation' | 'verification' | 'both'
carbon_interest?: 'future_purchase' | 'anchor_buyer' | 'technical_partnership' | 'project_financing'
finance_instrument?: 'green_debt' | 'impact_capital' | 'guarantee' | 'technical_assistance' | 'results_based_payment' | 'other'
funding_ticket_min?: number
funding_ticket_max?: number
currency?: string
co_benefits: string[]
required_documents: string[]
required_preparation_items: string[]
target_date?: string
is_simulated: boolean
published_at?: string
expires_at?: string
created_at: string
updated_at: string
```

No almacenar información personal sensible dentro de la necesidad. El contacto inicial debe operar mediante solicitud interna.

## Tarjeta de necesidad activa

```text
[Etiqueta de categoría] [Necesidad activa]

Título: Fondo busca proyectos de restauración en Colombia
Publica: Fondo de impacto (perfil demostrativo)

Busca:
• Tipo: Restauración forestal
• Etapa mínima: Preparación avanzada
• Ubicación: Colombia
• Uso de recursos: Implementación y monitoreo
• Ticket orientativo: COP 500 M – 2.000 M
• Co-beneficios: Biodiversidad y comunidades

Compatibilidad con tu proyecto: Alta

[Ver necesidad] [Ver coincidencia] [Manifestar interés]
```

## Detalle de necesidad

Mostrar:

- Organización publicadora, si autorizó mostrarla.
- Tipo de actor: OVV, comprador, financiador, desarrollador, consultor.
- Objetivo de la necesidad.
- Criterios requeridos y preferidos.
- Información/documentos solicitados.
- Fecha objetivo y vigencia.
- Estado de la publicación.
- Etiquetas de transparencia.
- Botón de manifestación de interés.

Aviso:

```text
Esta necesidad es informativa y no constituye una oferta vinculante, una aprobación, una contratación ni un compromiso de compra o financiación.
```

---

# 4. Nueva funcionalidad: Publicar necesidad

## Flujo inicial

Al hacer clic en `Publicar necesidad`, mostrar:

```text
¿Qué necesitas?

( ) Servicios de validación o verificación
( ) Proyecto o resultados de carbono
( ) Proyecto para financiación verde
( ) Comprador ancla o acuerdo futuro no vinculante
( ) Asistencia técnica o alianza especializada
```

Después, mostrar el formulario correspondiente a la categoría.

## 4.1 Formulario de necesidad OVV

```text
Título de la necesidad
Servicio requerido: Preevaluación | Validación | Verificación | Ambos
Tipo de iniciativa
Cobertura geográfica
Etapa mínima esperada
Documentos o información requerida
Fecha objetivo
Mensaje adicional
```

## 4.2 Formulario de necesidad de créditos/proyectos

```text
Título de la necesidad
Busco: Proyecto en desarrollo | Resultados reportados
Tipo de iniciativa
Ubicación
Etapa mínima
Interés: Compra futura | Comprador ancla | Alianza técnica | Financiación de desarrollo
Co-beneficios deseados
Información requerida
Volumen orientativo opcional
Fecha objetivo
Mensaje adicional
```

## 4.3 Formulario de financiación verde

```text
Título de la necesidad
Instrumento: Deuda verde | Capital de impacto | Garantía | Asistencia técnica | Pago por resultados | Otro
Categoría ambiental
Etapa mínima
Ubicación
Ticket mínimo y máximo opcional
Moneda
Uso de recursos aceptado
Documentación mínima requerida
Co-beneficios deseados
Fecha objetivo
Mensaje adicional
```

## Validaciones

- Requerir título, categoría, tipo de necesidad, etapa mínima y descripción.
- Si se informa ticket, validar mínimo <= máximo.
- Si se selecciona “resultados reportados”, exigir que la necesidad no se interprete como compra inmediata.
- Agregar un checkbox obligatorio:

```text
[ ] Confirmo que esta publicación no constituye oferta vinculante, contrato, recomendación financiera ni garantía de compra, validación o financiación.
```

## Publicación

Estados:

```text
Borrador
Publicado
Pausado
Cerrado
Vencido
```

Para demo, cualquier necesidad simulada debe mostrar:

```text
Perfil demostrativo / Necesidad simulada para demo
```

---

# 5. Nueva funcionalidad: Perfil de preparación comercial

## Propósito

Enriquecer cada publicación de proyecto con una síntesis de preparación para que OVV, compradores y financiadores entiendan rápidamente la madurez de la iniciativa.

No usar el término “rating”, “score de calidad” ni “probabilidad de emisión”. Usar:

```text
Perfil de preparación del proyecto
```

## Datos a reutilizar

Consumir datos del módulo Diagnóstico, Formulación y Validación y Registro:

```text
- Tipo de proyecto
- Ubicación general
- Área o capacidad
- Estado de preparación para validación y registro
- Estado de formulación
- Diagnóstico geoespacial disponible
- Brechas prioritarias
- Referencia RENARE declarada
- Necesidad comercial/financiera
- Documentos disponibles para compartir
- Co-beneficios declarados
```

## Componente de perfil

```text
Perfil de preparación del proyecto

Etapa: Preparación avanzada
Validación y Registro: 72/100
Diagnóstico geoespacial: Disponible
Formulación: 80% completada
Trazabilidad: Referencia RENARE no iniciada
Documentos compartibles: 5 de 8

Brechas prioritarias
• Metodología/estándar por definir
• Soporte de control del predio pendiente
• Salvaguardas por ampliar

[Ver detalle] [Compartir perfil] [Completar brechas]
```

## Reglas

- Mostrar fuentes del dato: Diagnóstico, Formulación o Validación y Registro.
- El usuario debe poder seleccionar qué campos de este perfil se hacen públicos.
- Las brechas deben ser visibles para el propietario y opcionalmente compartibles con la contraparte.
- No mostrar coordenadas exactas ni documentos privados.

---

# 6. Nueva funcionalidad: Match de compatibilidad

## Propósito

Mostrar qué tan bien encaja un proyecto con una necesidad activa, usando reglas transparentes. No usar IA ni modelos opacos en el MVP.

## Nombre en interfaz

```text
Compatibilidad de criterios
```

No usar “probabilidad de aprobación”, “rating”, “calidad del crédito” ni “proyecto recomendado”.

## Reglas de cálculo

Calcular una compatibilidad sobre 100 con reglas simples y visibles:

| Criterio | Peso | Fuente |
|---|---:|---|
| Tipo de proyecto coincide | 25 | Proyecto + necesidad |
| Ubicación coincide | 15 | Proyecto + necesidad |
| Etapa/preparación mínima cumplida | 20 | Perfil de preparación |
| Necesidad/uso de recursos coincide | 15 | Proyecto + necesidad |
| Co-beneficios coinciden | 10 | Proyecto + necesidad |
| Documentos/información solicitada disponible | 15 | Perfil de preparación |

## Resultado de compatibilidad

```text
Compatibilidad de criterios: Alta — 82/100

Coincide en
✓ Tipo: Restauración forestal
✓ Ubicación: Colombia
✓ Etapa: Preparación avanzada
✓ Uso de recursos: Implementación
✓ Co-beneficios: Biodiversidad

Requiere validar
! Falta definir metodología
! Documento de control del predio no disponible para compartir

[Ver detalle] [Manifestar interés]
```

## Rangos visuales

```text
0–39: Baja
40–69: Parcial
70–84: Alta
85–100: Muy alta
```

## Aviso obligatorio

```text
La compatibilidad compara únicamente criterios declarados. No representa una recomendación, aprobación, calificación de calidad, probabilidad de certificación ni compromiso comercial.
```

---

# 7. Nueva funcionalidad: Responder a una necesidad

## Flujo

Desde una necesidad activa, permitir que un proyecto responda usando información ya registrada en CarbonFlow.

```text
Responder a necesidad

Proyecto seleccionado: Restauración La Esperanza
Compatibilidad de criterios: Alta — 82/100

Información a compartir
[x] Resumen público
[x] Perfil de preparación
[x] Ubicación general
[ ] Diagnóstico geoespacial resumido
[ ] Presupuesto agregado
[ ] Cronograma
[ ] Data room bajo solicitud

Mensaje para la contraparte
[________________________________________________]

[ ] Autorizo compartir la información seleccionada y mis datos de contacto con la organización publicadora, exclusivamente para esta solicitud.

[Enviar manifestación de interés]
```

## Resultado

Crear una entidad `marketplace_responses`:

```ts
id: string
need_id: string
project_id?: string
responder_user_id: string
responder_organization_id: string
response_category: 'ovv' | 'carbon' | 'green_finance'
message: string
compatibility_score: number
compatibility_breakdown: json
shared_fields: string[]
shared_document_ids: string[]
consent_at: string
status: 'sent' | 'simulated_response_received' | 'in_contact' | 'closed' | 'archived'
is_simulated: boolean
created_at: string
updated_at: string
```

## Confirmación

```text
Tu manifestación de interés fue enviada.

La contraparte recibirá la información que autorizaste compartir. Esta acción no constituye compra, oferta vinculante, contratación, validación, financiación ni contrato.
```

---

# 8. Nueva funcionalidad: Data room por niveles

## Objetivo

Permitir compartir información progresivamente, sin exponer datos sensibles desde el primer contacto.

## Niveles

### Nivel 1 — Público

Visible para cualquier usuario:

```text
- Nombre del proyecto
- Tipo de iniciativa
- Ubicación general
- Etapa
- Necesidad
- Resumen
- Co-beneficios declarados
- Perfil de preparación resumido
```

### Nivel 2 — Bajo solicitud

Visible solo después de autorización del titular:

```text
- Diagnóstico geoespacial resumido
- Perfil de preparación completo
- Brechas principales
- Cronograma
- Presupuesto agregado
- Resumen de formulación
```

### Nivel 3 — Confidencial

Visible únicamente cuando el titular concede acceso manual:

```text
- Polígono o mapas detallados
- Soportes de control/tenencia
- Documento de formulación completo
- Presupuesto detallado
- Modelo financiero
- Evidencias sensibles
- Información comunitaria sensible
```

## Interfaz sugerida

```text
Data room

Público                         4 elementos disponibles
Bajo solicitud                  5 elementos disponibles
Confidencial                    Solicitar acceso al titular

[Solicitar acceso] [Gestionar permisos]
```

## Reglas de privacidad

- Coordenadas exactas siempre privadas por defecto.
- Soportes de tenencia/control siempre confidenciales por defecto.
- Datos personales no se muestran en el data room.
- Antes de otorgar acceso, mostrar qué documentos/campos se compartirán.
- Registrar fecha, usuario, nivel y alcance de cada autorización.

---

# 9. Nueva funcionalidad: Proyectos comunitarios y pequeños productores

## Objetivo

Alinear el Marketplace con el track Planeta y Comunidad — Resiliencia y hacer visibles proyectos que requieren acompañamiento técnico o financiero, no solo proyectos maduros.

## Filtro y etiqueta

Agregar filtro:

```text
Tipo de titular:
[Todos | Comunidad | Asociación | Cooperativa | Pequeño productor | Desarrollador]
```

Agregar etiqueta visible:

```text
Proyecto comunitario / Pequeño productor
```

## Campos opcionales en perfil de proyecto

```text
Tipo de organización/titular
Número estimado de beneficiarios
Mecanismo de participación declarado
Estado de distribución de beneficios: Por definir | En construcción | Documentado
Necesidad de asistencia técnica
Necesidad de financiación inicial
```

## Reglas de lenguaje

- Usar “declarado por el titular” para participación y distribución de beneficios.
- No afirmar impacto comunitario, consulta previa o beneficio compartido sin documentación.
- No solicitar datos personales de beneficiarios en el Marketplace.

---

# 10. Comparadores por categoría

## 10.1 Comparador de OVV/firma técnica

Permitir comparar hasta tres perfiles:

```text
Servicios declarados
Alcance/acreditación declarada
Tipos de iniciativa
Cobertura geográfica
Modalidad
Idiomas
Documentos públicos
Fecha de última actualización
```

No incluir ranking ni recomendación automática.

## 10.2 Comparador de proyectos de carbono

```text
Tipo de proyecto
Ubicación general
Etapa
Perfil de preparación
Área/capacidad
Estado de trazabilidad
Necesidad comercial
Co-beneficios declarados
Documentos compartibles
Brechas prioritarias
```

No comparar precio, rentabilidad o calidad climática en el MVP.

## 10.3 Comparador de financiación verde

```text
Categoría ambiental
Etapa
Uso de recursos
Monto/rango orientativo
Tipo de financiación buscada
Estado documental
Impacto esperado indicativo
Brechas prioritarias
```

---

# 11. Mis coincidencias y Mis solicitudes

## Nueva vista: Mis coincidencias

Ruta sugerida:

```text
/marketplace/matches
```

Mostrar:

```text
Coincidencias para tus proyectos

[Proyecto] [Necesidad] [Categoría] [Compatibilidad] [Estado] [Acción]

Restauración La Esperanza | Fondo busca restauración | Financiación Verde | Alta 82/100 | Nueva | Ver necesidad
Proyecto X | OVV busca proyectos forestales | Validación | Parcial 61/100 | Nueva | Ver necesidad
```

Filtros:

```text
Proyecto
Categoría
Compatibilidad
Estado
Fecha
```

## Vista: Mis solicitudes

Ruta sugerida:

```text
/marketplace/requests
```

Mostrar:

```text
Categoría
Necesidad/perfil
Proyecto asociado
Fecha
Información compartida
Estado
Respuesta
```

Estados:

```text
Enviada
Respuesta simulada recibida
En contacto
Cerrada
Archivada
```

---

# 12. Respuestas simuladas para demo

Después de enviar una manifestación, mostrar una espera breve y generar respuesta simulada. Debe quedar claramente etiquetada.

## OVV

```text
Respuesta simulada para demo

“Hemos recibido la información preliminar. Para evaluar un posible alcance de preevaluación, requeriríamos revisar la información de control del predio, línea base y objetivo de validación. Esto no constituye aceptación, cotización, contratación ni inicio de validación.”
```

## Comprador / proyecto de carbono

```text
Respuesta simulada para demo

“Hemos recibido tu manifestación de interés. La organización evaluará la compatibilidad con su necesidad declarada y podrá solicitar información adicional. Esto no constituye disponibilidad de créditos, precio, reserva, compra ni contrato.”
```

## Financiación verde

```text
Respuesta simulada para demo

“Hemos recibido la información preliminar. La solicitud será revisada frente a criterios de etapa, documentación, uso previsto de recursos y perfil de riesgo. Esto no constituye una aprobación, oferta, compromiso de financiación ni recomendación de inversión.”
```

---

# 13. Componentes a crear o actualizar

```text
MarketplaceCategoryTabs
MarketplaceModeTabs
NeedCard
NeedDetail
NeedPublisherForm
ProjectReadinessProfile
CompatibilityScoreCard
CompatibilityBreakdown
NeedResponseModal
SharedInformationSelector
DataRoomAccessPanel
DataRoomPermissionModal
CommunityProjectBadge
MarketplaceComparisonTable
MatchesDashboard
RequestsDashboard
SimulatedResponsePanel
```

---

# 14. Estados vacíos y errores

## Sin necesidades activas

```text
Aún no hay necesidades activas con estos filtros.

Puedes explorar la oferta disponible, publicar una necesidad o ajustar los filtros.

[Explorar oferta] [Publicar necesidad] [Limpiar filtros]
```

## Sin coincidencias

```text
No encontramos coincidencias actuales para este proyecto.

Puedes publicar tu proyecto, ampliar criterios o completar información para mejorar la compatibilidad con futuras necesidades.

[Publicar proyecto] [Completar perfil] [Ver necesidades]
```

## Perfil incompleto

```text
Tu perfil de preparación aún no tiene información suficiente para calcular compatibilidad.

Completa diagnóstico, formulación o Validación y Registro para activar coincidencias.

[Ir a Validación y Registro]
```

## Error de permisos del data room

```text
No tienes acceso a este nivel de información.

Puedes solicitar acceso al titular. El titular decidirá qué información compartir.

[Solicitar acceso]
```

---

# 15. Criterios de aceptación

La mejora estará completa cuando:

1. Cada categoría del Marketplace tenga las vistas Explorar oferta, Necesidades activas y Publicar necesidad.
2. Un usuario pueda publicar una necesidad para OVV, créditos/proyectos o financiación verde.
3. Cada necesidad tenga criterios, estado, vigencia, etiquetas de transparencia y aviso de no vinculatoriedad.
4. Los proyectos tengan un Perfil de preparación comercial basado en datos de Diagnóstico, Formulación y Validación y Registro.
5. El sistema calcule Compatibilidad de criterios con reglas visibles y sin usarla como rating de calidad, aprobación o recomendación.
6. Un usuario pueda responder a una necesidad eligiendo qué información compartir.
7. Toda respuesta requiera consentimiento explícito.
8. Exista data room en tres niveles: público, bajo solicitud y confidencial.
9. Coordenadas exactas, soportes de tenencia y datos sensibles sean privados por defecto.
10. Exista filtro y etiqueta para proyectos comunitarios y pequeños productores.
11. Se puedan comparar perfiles de OVV, proyectos y oportunidades de financiación dentro de su categoría.
12. Existan vistas Mis coincidencias y Mis solicitudes.
13. Las respuestas simuladas estén claramente identificadas en la demo.
14. No se implementen pagos, compra/venta vinculante, transferencias, custodia, retiro de créditos, contratación automática ni recomendación de inversión.

---

# 16. Orden de implementación recomendado

## Prioridad 1 — Valor visible para demo

1. Agregar submenú Explorar oferta / Necesidades activas / Publicar necesidad.
2. Crear tarjetas de necesidades activas de demostración.
3. Implementar Perfil de preparación comercial para los proyectos existentes.
4. Implementar Compatibilidad de criterios con reglas simples.
5. Implementar modal Responder a necesidad con selector de información compartida y consentimiento.
6. Mostrar respuesta simulada claramente etiquetada.
7. Crear vista Mis coincidencias.

## Prioridad 2 — Confianza y profundidad

1. Data room con niveles público y bajo solicitud.
2. Filtro para proyectos comunitarios y pequeños productores.
3. Comparadores por categoría.
4. Vista Mis solicitudes.
5. Publicar necesidad desde un formulario real.

## Prioridad 3 — Evolución posterior

1. Data room confidencial con permisos manuales.
2. Matching automático recurrente y notificaciones.
3. Perfiles reales verificados de OVV, compradores y financiadores.
4. Moderación de publicaciones.
5. Mensajería segura.
6. Integraciones con CRM, registros, KYC/AML, pagos, contratos y mecanismos transaccionales autorizados.
