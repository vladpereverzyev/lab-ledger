# Lab Ledger

[![Versión](https://img.shields.io/github/v/release/vladpereverzyev/lab-ledger)](https://github.com/vladpereverzyev/lab-ledger/releases/latest)
[![Descargas](https://img.shields.io/github/downloads/vladpereverzyev/lab-ledger/total)](https://github.com/vladpereverzyev/lab-ledger/releases)
[![Licencia](https://img.shields.io/badge/licencia-BUSL--1.1-blue)](LICENSE)
![Plataforma](https://img.shields.io/badge/plataforma-Windows%20%7C%20macOS%20%7C%20Linux-0078D6)
[![GitHub REST API](https://img.shields.io/badge/GitHub%20REST%20API-2022--11--28-181717?logo=github&logoColor=white)](#github-api)

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![it](https://img.shields.io/badge/lang-it-green.svg)](./README.it.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README.es.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./README.fr.md)
[![de](https://img.shields.io/badge/lang-de-lightgrey.svg)](./README.de.md)

**Lab Ledger muestra a un laboratorio dental lo que gana de verdad.**

Registra cada trabajo cuando entra y cuando sale. Lab Ledger calcula lo que ha
costado en materiales, suma alquiler, personal e impuestos, y te dice el
beneficio por año, por mes y por día laborable.

Gratis para Windows, macOS y Linux. Sin cuenta, sin suscripción y sin necesidad
de internet para usarla: cada número se queda en tu ordenador.

**[Descarga la app](https://github.com/vladpereverzyev/lab-ledger/releases/latest)** · **[Pruébala en el navegador](https://vladpereverzyev.github.io/lab-ledger/)**

## ¿Por qué Lab Ledger?

- **Un programa de escritorio de verdad**: se instala como cualquier otro,
  funciona sin conexión y no hay nada en lo que registrarse.
- **Privada por diseño**: los datos se quedan en tu ordenador. En el código no
  hay ningún dato de pacientes ni de clientes: los tuyos los escribes en local y
  los guardas en archivos cuando quieras.
- **Costes reales**: un material se compra por paquete y de ese paquete salen un
  número de unidades utilizables. La división da el coste de una unidad. Cada
  tipo de trabajo declara lo que consume, así que cambiar el precio de un
  paquete actualiza todos los trabajos que lo usan.
- **La foto completa**: no solo el margen bruto. También entran alquiler,
  energía, seguro, asesoría, personal e impuestos, para que la aplicación pueda
  responder a la única pregunta que importa: qué queda, al año, al mes, por día
  trabajado.

## Capturas

Primer arranque: los datos del laboratorio y la cuenta del administrador, y nada más que configurar.

![Configuración del laboratorio](docs/screenshot-setup.png)

Trabajos: cada trabajo con paciente, envio, coste de material, precio y margen.

![Vista Trabajos](docs/screenshot-works.png)

La misma pantalla en modo claro, que es como se abre por defecto:

![Vista Trabajos, claro](docs/screenshot-works-light.png)

Resumen: el ano en tarjetas, graficos y una cuenta de resultados.

![Vista Resumen](docs/screenshot-summary.png)

![Vista Resumen, claro](docs/screenshot-summary-light.png)

Catalogo: cada tipo de trabajo conectado a los materiales que consume.

![Vista Catalogo](docs/screenshot-catalog.png)

![Vista Catalogo, claro](docs/screenshot-catalog-light.png)

Entradas: el trabajo que sigue en el banco, que no cuenta hasta que se marca como hecho.

![Trabajos en entrada](docs/screenshot-incoming.png)

Usuarios: lo que puede hacer cada operador, modificable cuando quieras.

![Editar un operador](docs/screenshot-users.png)

Ajustes: actualizaciones, copia automática en Excel y código de recuperación.

![Ajustes](docs/screenshot-settings.png)

## Funciones

### Trabajos
- Registra cada trabajo: fecha, cliente, **paciente** (nombre completo o un código de caso), tipo de
  trabajo, unidades, quién lo hizo y si es facturable o **rehecho**.
- **Un trabajo rehecho es una pérdida, y se cuenta como tal.** No se factura:
  gasta el material y no genera ingresos, así que en la columna del precio
  aparece el coste del material en negativo y el margen baja exactamente eso.
- **Envío**: marca un trabajo como enviado con fecha, transportista y número de
  seguimiento. Filtra por enviados / por enviar.
- **Entradas y Salidas**: el trabajo que sigue en el banco espera en Entradas y
  todavía no cuenta; márcalo terminado y pasa a Salidas, donde genera ingresos y
  se envía.
- **Un paquete, muchos trabajos**: marca varios trabajos y envíalos juntos con
  una sola fecha, transportista y número de seguimiento.
- **Eliminar no es destruir**: un trabajo eliminado desaparece de listas y
  totales, pero se guarda en un archivo dentro del fichero de datos, así que
  también en las copias.
- Busca por cliente, paciente, trabajo, operador, transportista y seguimiento;
  filtra por año, mes, operador, envío y rehecho.

### Quién lo usa
- **El primer arranque** pide los datos del laboratorio y crea el administrador.
  A partir de ahí la aplicación abre en una pantalla de acceso.
- **Los operadores** los añade el administrador, marcando lo que cada uno puede
  hacer, y puede cambiarlo cuando quiera: ver precios y beneficios, añadir
  trabajos nuevos, editar los ya registrados, eliminarlos, editar el catálogo,
  exportar y copiar. Quien no puede ver el dinero no ve la pestaña
  Resumen, ni las columnas de precio y margen, ni los precios del catálogo.
- **Las contraseñas nunca se guardan**: solo PBKDF2-SHA256 sobre una sal
  aleatoria por usuario, 150000 vueltas. Una contraseña olvidada se reinicia, no
  se recupera.
- **Una contraseña de administrador olvidada no te deja fuera del archivo.** Al
  configurar el laboratorio se genera un **código de recuperación**, mostrado
  una vez para apuntarlo, que restablece la contraseña del administrador desde
  la pantalla de acceso. Queda una copia en la carpeta de datos de la
  aplicación en ese ordenador, para poder leerla por teléfono, y el
  administrador la encuentra en **Catálogo > Ajustes** cuando quiera. El
  archivo de datos que está al lado es JSON en claro: el código no está más
  expuesto que el archivo al que te devuelve, y a los dos los protege quién
  puede usar ese ordenador.
- **El historial** registra cada cambio con quién y cuándo. El administrador lo
  lee en Catálogo > Historial.

### Resumen
- Tarjetas de actividad: trabajos, unidades, ingresos, coste de materiales,
  margen bruto, rehechos y cuánto han costado.
- Gráficos, todos con tus filas reales: ingresos y coste de materiales por mes
  (área), margen por mes (barras, rojas cuando el mes pierde), beneficio
  acumulado frente a la línea de costes fijos, trabajos más rentables (barras
  horizontales), cuota de ingresos por cliente (anillo), trabajos por operador
  divididos en facturables / rehechos (barras apiladas), los tipos de trabajo
  que hace cada operador (barras apiladas) y a dónde van los
  ingresos (barra apilada: materiales, costes fijos, impuestos, lo que queda).
- Tarjetas de rentabilidad: costes fijos, impuestos y cotizaciones, beneficio
  neto y el beneficio **por día trabajado, por semana, por mes**, la media por
  trabajo y los ingresos necesarios solo para cubrir gastos.
- Una tabla de **cuenta de resultados** con cada línea al año, al mes, por día
  trabajado y en porcentaje sobre los ingresos.

### Catálogo
- **Clientes**: nombre, email, teléfono, NIF/CIF, dirección, notas.
- **Materiales**: coste del paquete, unidades por paquete, unidad, nota. El
  coste por unidad es la división, y se muestra en la fila.
- **Tipos de trabajo**: cada uno lista los materiales que usa y en qué cantidad.
  El coste de material se calcula, no se escribe, y con él llegan el margen y el
  margen %.
- **Operadores** y **transportistas**: listas cortas para elegir.
- **Costes fijos**: local (alquiler, hipoteca, comunidad), energía (luz, gas,
  agua), seguro, asesoría, personal y cualquier otra partida, mensual o anual,
  con el importe anual y mensual en cada fila.
- **Impuestos y calendario**: régimen de tipo fijo o general con porcentajes
  sencillos, más cuántos días por semana y semanas al año trabaja realmente el
  laboratorio: eso es lo que convierte un beneficio anual en uno diario.
- **Ajustes**: comprobación de actualizaciones sí o no, la copia automática
  en Excel, el código de recuperación (solo administrador), versión, licencia y
  ruta del archivo de datos.
- **Usuarios** e **Historial**: cuentas y permisos, y cada cambio con quién lo
  hizo; solo para el administrador.

### En todas partes
- **Importar / Exportar**: exportación a Excel de trabajos, resumen por tipo,
  catálogo y costes fijos; importación de trabajos desde Excel, de una hoja
  propia o de un archivo escrito por Lab Ledger; copias completas, en claro o
  **cifradas con contraseña** (AES-256-GCM), restaurables en cualquier
  ordenador. Restaurar una copia sustituye también las cuentas, así que solo
  puede hacerlo el administrador.
- **Cinco idiomas**, y al cambiar de idioma la barra no se mueve: cada control
  tiene un ancho fijo.
- **Se adapta a la pantalla**: en el móvil cada fila de la tabla se convierte en
  una tarjeta con cada valor etiquetado por su columna.
- **Un solo desplegable** para todas las opciones, en lugar de la lista que
  dibuja cada sistema operativo.
- **El símbolo del euro va siempre detrás del número**, en todos los idiomas.
- **Claro por defecto**, oscuro a un clic, recordado en el ordenador.

## Sin conexión por diseño

Lab Ledger no necesita internet para funcionar. Los datos viven en un archivo
JSON de tu ordenador: sin cuenta, sin servidor, sin telemetría, y nada de lo que
escribes se envía nunca a ninguna parte. La única forma de que una copia salga
del ordenador la eliges tú: poner la copia automática en Excel en una carpeta que
tu nube sincroniza, y la aplicación te avisa antes de escribirla.

La aplicación se conecta por un único motivo: **las actualizaciones**. Entonces
habla con la API REST pública de GitHub, y solo en estos tres casos:

- **la comprobación automática**: como mucho una vez al día, al arrancar, si
  está activada. Lo está por defecto; se apaga en **Catálogo > Ajustes**;
- **la comprobación a mano**: cuando pulsas el número de versión en la esquina
  inferior derecha de la ventana;
- **la descarga**: cuando pulsas **Descargar** en el diálogo de actualización.

Ninguno de los tres envía cuenta, identificadores ni nada de tus trabajos,
clientes o pacientes. Sin conexión, la aplicación simplemente no ve las nuevas
versiones; todo lo demás funciona igual. Los detalles están en
[GitHub API](#github-api).

## La copia automática en Excel

**Qué es.** Un archivo de Excel normal (.xlsx) con todos los números del
laboratorio, que Lab Ledger reescribe solo cada vez que la aplicación se abre y
cada vez que se cierra. Está apagada hasta que la activas en
**Catálogo > Ajustes** y eliges dónde guardar el archivo.

**Para qué sirve.** Para ver los números sin la aplicación. Cualquiera puede
abrir el archivo - con Excel, Google Sheets, LibreOffice o Numbers, en el
ordenador o en el móvil - sin instalar nada.

**Compartirla a través de la nube.** Guarda el archivo en una carpeta que
OneDrive, Google Drive o Dropbox ya sincronizan, y ese servicio subirá solo cada
nueva versión: quien tenga acceso a esa carpeta - tu asesor, un socio - encuentra
siempre los números al día. Lab Ledger no sube nada: solo escribe el archivo en
tu ordenador, y la subida la hace tu servicio en la nube. Como el archivo
contiene todos los datos, la aplicación te pide confirmación antes de empezar a
escribirlo.

**Va en un solo sentido.** El archivo es una copia para leer. Los cambios hechos
en él no vuelven a Lab Ledger y se sobrescriben la próxima vez que la aplicación
escribe el archivo. Para llevar filas de una hoja de cálculo a la aplicación usa
**Importar Excel**, que las añade como trabajos nuevos.

**Qué contiene.** Ocho hojas: trabajos, el año mes a mes, materiales con el coste
de una unidad, tipos de trabajo con materiales y precios, costes fijos,
clínicas, operadores y una hoja Info con la versión. Solo valores - sin macros,
sin fórmulas - y anchos de columna ya puestos, para que se lea igual en cualquier
programa. Los encabezados están en italiano si la aplicación está en italiano, y
en inglés en los demás casos.

## Idiomas

La interfaz está disponible en **inglés, italiano, español, francés y alemán**:
se cambia con el botón de idioma de la barra. Añadir un idioma es una
contribución de solo traducción: ver [CONTRIBUTING.md](CONTRIBUTING.md).

## GitHub API

[![GitHub REST API](https://img.shields.io/badge/Powered%20by%20the-GitHub%20REST%20API-181717?logo=github&logoColor=white)](https://docs.github.com/rest)

Lab Ledger usa la **API REST de GitHub** para una sola cosa: avisarte de que
existe una versión más reciente.

| | |
|---|---|
| Endpoint | `GET /repos/vladpereverzyev/lab-ledger/releases/latest` |
| Versión de la API | `X-GitHub-Api-Version: 2022-11-28` |
| Autenticación | ninguna: la API pública sin autenticar |
| Límite de peticiones | las 60 por hora e IP de la API pública; la aplicación pregunta como mucho una vez al día |
| Qué se envía | la petición y un `User-Agent` `LabLedger/<versión>`. Sin cuenta, sin identificadores, nada de tus trabajos, clientes o pacientes |
| Qué se recibe | la etiqueta de la última versión, la URL de su página y los nombres de sus archivos |
| Y después | la etiqueta se compara con la versión instalada; si es más reciente aparece un diálogo. Pulsa **Descargar** y la aplicación baja sola el instalador para tu sistema en la carpeta Descargas, lo comprueba con las sumas SHA-256 publicadas con la versión (un archivo que no coincide se borra) y ofrece ejecutarlo. Sin ese botón no descarga ni instala nada |

La comprobación automática se desactiva en **Catálogo > Ajustes**. Desactivada,
la aplicación solo se conecta cuando pulsas el número de versión en la esquina
inferior derecha de la ventana para comprobar a mano, o cuando pulsas
**Descargar**. En Ajustes se muestran también la versión instalada y la versión
de la API de GitHub en uso.

GitHub y el logotipo de GitHub son marcas de GitHub, Inc. Lab Ledger es un
proyecto independiente, no afiliado, patrocinado ni respaldado
por GitHub.

## Dónde se guardan los datos

Tus datos viven en un único archivo JSON local dentro de la carpeta de datos de
la aplicación; la ruta exacta se muestra en **Catálogo > Ajustes**. No se sube
nada a ninguna parte. Usa **Copia** o **Copia cifrada** para guardar una copia e
**Importar copia** para restaurarla.

Cada guardado va primero a un archivo temporal y luego sustituye al anterior,
así que un fallo o un corte de luz a mitad dejan entero el archivo previo. Si
algún día el archivo no se puede leer, la aplicación lo aparta intacto, junto
con su código de recuperación, y te dice dónde, en lugar de empezar de cero
encima.

## Ejecutar desde el código

Requiere [Node.js](https://nodejs.org/) 22.12 o posterior.

```bash
npm install
npm start
```

## Compilar

```bash
npm run dist
```

Los instaladores se generan en la carpeta `release/`: instalador NSIS y `.exe`
portable en Windows, `.dmg` y `.zip` universales en macOS (Intel y Apple Silicon), `AppImage` y `.deb` en Linux.

Los iconos se regeneran desde `build/icon.svg` con
[Pillow](https://pillow.readthedocs.io/):

```bash
python -m pip install pillow
python build/make-icons.py
```

## Tecnología

- [Electron](https://www.electronjs.org/) - envoltorio de escritorio
- [Chart.js](https://www.chartjs.org/) - gráficos (incluidos, sin CDN)
- [SheetJS](https://sheetjs.com/) - importación/exportación de Excel
- [API REST de GitHub](https://docs.github.com/rest) - comprobación de actualizaciones

## Contribuir

Las contribuciones son bienvenidas, sobre todo las traducciones. Ver
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

Lab Ledger es **source-available**, no código abierto: libre de usar en tu
propio laboratorio, no libre de revender. Rige la
[Business Source License 1.1](LICENSE).

- **Cualquier laboratorio dental o clínica puede usarlo en producción,
  gratis** - en tantos ordenadores y sedes como quiera.
- **Hace falta una licencia comercial** para ofrecer Lab Ledger, o una versión
  modificada, a terceros a cambio de dinero: como producto, como servicio
  alojado, junto con hardware o integrado en otro programa. Escribe a
  <info@vladpereverzyev.com>.
- **El 2030-09-14 esta versión pasa a Apache 2.0** automáticamente. Cada
  publicación lleva su propia fecha, cuatro años después de salir.
