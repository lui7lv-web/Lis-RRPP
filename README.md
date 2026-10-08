# LIS RRPP — Seguimiento comercial

Demostración académica en español, con HTML, CSS y JavaScript nativos. Sin servidor de aplicación, bibliotecas externas ni proceso de compilación.

## Ejecutar

1. Descomprime el proyecto conservando las carpetas.
2. Abre `dist/index.html` en un navegador moderno.
3. Para un almacenamiento consistente, se recomienda servir `dist` desde una dirección HTTP estable. Si tienes Python instalado, ejecuta desde la carpeta del proyecto:

   ```sh
   python -m http.server 8000 --directory dist --bind 127.0.0.1
   ```

4. Abre `http://127.0.0.1:8000`. El servidor opcional solo entrega archivos estáticos; no recibe ni guarda registros.

Abrir archivos directamente suele funcionar, pero el comportamiento de `localStorage` con direcciones `file://` depende del navegador. No muevas la carpeta esperando conservar los datos. La vista previa de la entrega utiliza `http://127.0.0.1:4173`; abrir en otro puerto crea un almacenamiento independiente.

## Utilizar

- Pulsa **Nueva oportunidad**, completa los campos y guarda.
- **Ver / editar** permite consultar todos los datos y modificarlos.
- Las oportunidades abiertas exigen próxima acción y fecha. Se admiten fechas pasadas.
- Busca por organización o contacto; la búsqueda ignora mayúsculas y tildes. Combínala con el filtro de estado.
- Los seguimientos vencidos aparecen primero, después los de hoy y los futuros. Las oportunidades ganadas o perdidas aparecen al final y no generan alertas.
- Los indicadores incluyen todos los registros guardados, aunque la lista tenga un filtro activo.
- **Eliminar** solicita confirmación y permite cancelar.
- Los cinco ejemplos ficticios se guardan solo cuando aún no existe almacenamiento. Si eliminas todos, queda una lista vacía que se conserva al recargar.

## Archivos

```text
dist/index.html             Interfaz y formulario accesible
dist/styles.css             Diseño adaptable y colores de LIS RRPP
dist/app.js                 Validación, registros, seguimiento y almacenamiento
vercel.json                 Configuración para servir dist sin compilación
tests/storage.test.cjs      Pruebas de integración con almacenamiento simulado
PRUEBAS.md                  Evidencia y pruebas pendientes
captura-escritorio.jpg      Evidencia visual
captura-movil.jpg           Evidencia visual
```

## Publicar mediante GitHub y Vercel

No se ha publicado en cuentas externas. El proyecto incluye la configuración necesaria.

1. Crea un repositorio vacío en GitHub. Para una publicación sin comandos, usa **Add file → Upload files** y sube el contenido de esta carpeta, manteniendo `dist/` y colocando `vercel.json` en la raíz del repositorio. No subas el ZIP como único archivo.
2. Alternativamente, desde esta carpeta, con Git instalado:

   ```sh
   git init
   git add .
   git commit -m "Crear demostración LIS RRPP"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/lis-rrpp.git
   git push -u origin main
   ```

   Sustituye `TU-USUARIO` por tu usuario y utiliza la URL de tu repositorio. Autentícate mediante las herramientas de GitHub; no agregues credenciales al código.

3. En Vercel, selecciona **Add New → Project**, conecta GitHub e importa el repositorio.
4. Conserva la raíz del repositorio como **Root Directory**. El archivo `vercel.json` establece **Framework Preset: Other**, comando de compilación vacío y **Output Directory: dist**. Si cambias estos campos en la interfaz, mantén esos mismos valores. No hay dependencias que instalar ni variables de entorno que configurar.
5. Selecciona **Deploy** y abre la dirección HTTPS resultante. Comprueba creación, edición y persistencia en esa dirección. Los cambios posteriores enviados a GitHub pueden generar nuevos despliegues.

Referencias oficiales verificadas para estas instrucciones: [subir código local a GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github), [configurar un proyecto estático en Vercel](https://vercel.com/docs/builds/configure-a-build) y [despliegues desde Git](https://vercel.com/docs/deployments/overview).

## Almacenamiento y limitaciones

**Los datos se guardan únicamente en este navegador; no se sincronizan entre dispositivos y pueden perderse al borrar los datos del navegador**.

La clave `lis-rrpp.opportunities.v1` guarda un JSON con versión y registros. Cada registro contiene identificador único, organización, contacto, cargo, correo, teléfono, servicio, estado, próxima acción, fecha de seguimiento, observaciones, creación, actualización y una marca de ejemplo ficticio. Los identificadores nuevos usan `crypto.randomUUID()`; en producción utiliza HTTPS.

La fecha de seguimiento se guarda como `AAAA-MM-DD` y se compara con el día local del dispositivo. Creación y actualización se guardan como marcas ISO y se muestran en horario local. La lista se recalcula al volver a la ventana y cada minuto para actualizar el día.

Cambiar de navegador, perfil, dispositivo, dominio, protocolo o puerto muestra un almacenamiento distinto. Los registros de la vista previa no se transfieren al publicar. La navegación privada puede borrar los datos al cerrar la sesión. No existe copia de seguridad, cifrado de registros, control de acceso, recuperación después de eliminar ni sincronización; las escrituras simultáneas desde varias pestañas pueden sobrescribirse. La aplicación escucha cambios de otras pestañas, pero no resuelve conflictos.

Si una escritura falla, conserva los registros anteriores y muestra un error; el formulario conserva lo escrito. Si no se pueden leer los datos o están dañados, bloquea la edición para evitar sobrescribirlos. Conserva los datos antes de restablecer el almacenamiento. Borrar los datos del navegador reinicia la demostración y sus ejemplos.

Usa exclusivamente datos ficticios. No es un sistema preparado para información confidencial. No incluye inicio de sesión, correo automático, WhatsApp, facturación ni inteligencia artificial.

## Repetir las pruebas

Con Node.js instalado, desde la carpeta del proyecto:

```sh
node --check dist/app.js
node tests/storage.test.cjs
```

Estas pruebas usan únicamente módulos incorporados de Node.js. Verifican la lógica real con un DOM mínimo y almacenamiento simulado; no emulan la presentación ni sustituyen las pruebas en un navegador. Consulta `PRUEBAS.md` para el alcance comprobado.
