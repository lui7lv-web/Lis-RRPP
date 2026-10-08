# Verificación del MVP

Realizada el 7 de octubre de 2026. Se corrigió un aviso de éxito anterior que podía permanecer visible después de fallar una escritura: ahora se limpia antes de cada intento de almacenamiento.

## Ejecutadas y aprobadas

### Vista previa en navegador

- Creación de una oportunidad ficticia con seguimiento pasado: registros de 5 a 6, abiertas de 3 a 4 y vencidas de 1 a 2.
- Validación de organización obligatoria mediante envío de un formulario vacío.
- Recarga y consulta: el registro, contacto, próxima acción y fecha se conservaron.
- Edición a **Ganado** con próxima acción y fecha vacías: abiertas volvieron a 3, vencidas a 1 y ganadas aumentaron a 2.
- Confirmación de eliminación y cancelación; eliminación del registro de prueba: ganadas volvieron a 1.
- Búsqueda por contacto y filtro combinado sin coincidencias: mensaje de ausencia de resultados.
- Clasificación visible de los cinco ejemplos: vencido, hoy, futuro y dos cerradas sin alertas.
- Diseño de escritorio de 1440 × 1000 y móvil de 390 × 844; capturas incluidas.
- Medición móvil: contenido de página de 375 px dentro de una vista de 390 px; formulario de 328 px sin desbordamiento interno.
- Respuesta HTTP 200 de la aplicación y comprobación de sintaxis JavaScript.

Los registros de prueba se eliminaron. La vista previa conserva únicamente los cinco ejemplos.

### Integración con almacenamiento y DOM simulados: 15 pruebas aprobadas

Se ejecutó el código real de `dist/app.js` mediante `tests/storage.test.cjs`:

1. Primer inicio con cinco ejemplos guardados.
2. Clasificación de fechas, orden y exclusión de cerradas.
3. Validación de fechas, incluido año bisiesto.
4. Validación de obligatorios, correo, próxima acción y fecha.
5. Creación con fecha pasada y campos opcionales vacíos.
6. Persistencia tras reinicializar usando los registros guardados.
7. Edición que conserva identificador y fecha de creación; cierre con campos opcionales.
8. Fallo de escritura: datos anteriores intactos, formulario conservado y sin éxito falso.
9. Fallo de eliminación: registro e indicadores intactos.
10. Eliminación con actualización de indicadores.
11. Búsqueda sin tildes y filtro combinado.
12. Eliminación de todos y reinicio sin recreación de ejemplos.
13. Datos dañados conservados y edición bloqueada.
14. Error de lectura informado.
15. Primer inicio sin posibilidad de escribir: no muestra ejemplos sin guardar como cifras reales.

## Pendientes y límites de la verificación

- Prueba en celulares físicos con Safari iOS y Chrome Android; se verificó una vista móvil del navegador de escritorio.
- Compatibilidad manual con Firefox y Safari, lector de pantalla y ampliación de texto al 200 %.
- Cambio real de día a medianoche y cambio manual de zona horaria. La clasificación usa el calendario local y se comprobó con las fechas de los ejemplos.
- Fallos reales por cuota llena o restricciones del navegador: se simularon en las pruebas de integración.
- Publicación y comprobación en GitHub/Vercel: se entregan instrucciones y configuración; no se accedió a cuentas externas.

Un intento de ejecutar una suite completa en Edge automatizado fue bloqueado por el entorno (`spawn EPERM`); no se cuenta como prueba aprobada. Los flujos descritos arriba se verificaron mediante la vista previa disponible, y los casos de almacenamiento mediante las pruebas de integración.
