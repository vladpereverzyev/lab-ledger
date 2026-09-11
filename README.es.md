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

**Aplicación de escritorio gratuita y sin conexión para laboratorios dentales**:
registra lo que sale del banco y descubre qué queda realmente a final de año.

<p align="center">
  <img src="src/assets/icon-256.png" alt="Lab Ledger" width="160" height="160">
</p>

### [**Prueba la demo en vivo**](https://vladpereverzyev.github.io/lab-ledger/)

Datos de ejemplo, nada que instalar: todo se queda en tu navegador. ¿Prefieres la
aplicación de verdad? Descárgala de la
[última versión](https://github.com/vladpereverzyev/lab-ledger/releases/latest).

## ¿Por qué Lab Ledger?

- **Gratuita y sin conexión**: sin cuenta, sin servidor, sin suscripción. Se
  empaqueta como una aplicación de escritorio real y se usa como un programa
  normal.
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

## Funciones

### Trabajos
- Registra cada trabajo: fecha, cliente, **paciente** (nombre completo o un código de caso), tipo de
  trabajo, unidades, quién lo hizo y si es facturable o **rehecho**.
- **Un trabajo rehecho es una pérdida, y se cuenta como tal.** No se factura:
  gasta el material y no genera ingresos, así que en la columna del precio
  aparece el coste del material en negativo y el margen baja exactamente eso.
- **Envío**: marca un trabajo como enviado con fecha, transportista y número de
  seguimiento. Filtra por enviados / por enviar.
- Busca por cliente, paciente, trabajo, operador, transportista y seguimiento;
  filtra por año, mes, operador, envío y rehecho.

### Quién lo usa
- **El primer arranque** pide los datos del laboratorio y crea el administrador.
  A partir de ahí la aplicación abre en una pantalla de acceso.
- **Los operadores** los añade el administrador, marcando lo que cada uno puede
  hacer: ver precios y beneficios, añadir y editar trabajos, eliminarlos, editar
  el catálogo, exportar y copiar. Quien no puede ver el dinero no ve la pestaña
  Resumen, ni las columnas de precio y margen, ni los precios del catálogo.
- **Las contraseñas nunca se guardan**: solo PBKDF2-SHA256 sobre una sal
  aleatoria por usuario, 150000 vueltas. Una contraseña olvidada se reinicia, no
  se recupera.
- **El historial** registra cada cambio con quién y cuándo. El administrador lo
  lee en Catálogo > Historial.

### Resumen
- Tarjetas de actividad: trabajos, unidades, ingresos, coste de materiales,
  margen bruto, rehechos y cuánto han costado.
- Gráficos, todos con tus filas reales: ingresos y coste de materiales por mes
  (área), margen por mes (barras, rojas cuando el mes pierde), beneficio
  acumulado frente a la línea de costes fijos, trabajos más rentables (barras
  horizontales), cuota de ingresos por cliente (anillo), trabajos por operador
  divididos en facturables / rehechos (barras apiladas) y a dónde van los
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
- **Ajustes**: comprobación de actualizaciones sí o no, versión, ruta del
  archivo de datos.

### En todas partes
- **Importar / Exportar**: exportación a Excel de trabajos, resumen por tipo,
  catálogo y costes fijos; importación de trabajos desde Excel; copias de
  seguridad JSON completas restaurables en cualquier ordenador.
- **Modo claro y oscuro**, recordado en el ordenador.
- **Cinco idiomas**, y al cambiar de idioma la barra no se mueve: cada control
  tiene un ancho fijo.
- **Se adapta a la pantalla**: en el movil cada fila de la tabla se convierte en
  una tarjeta con cada valor etiquetado por su columna.
- **Un solo desplegable** para todas las opciones, en lugar de la lista que
  dibuja cada sistema operativo.
- **El simbolo del euro va siempre detras del numero**, en todos los idiomas.
- **Claro por defecto**, oscuro a un clic, recordado en el ordenador.

## Sin conexión por diseño

Lab Ledger no es un producto en la nube con modo sin conexión. Es un programa
sin conexión, y punto. Los datos viven en un archivo JSON de tu ordenador: sin
cuenta, sin servidor, sin telemetría, y nada de lo que escribes sale de la
máquina.

Hay una única excepción, y se puede apagar: **la comprobación de
actualizaciones**. Una vez al día, si la dejas activada, la aplicación pregunta
a la API REST pública de GitHub cuál es la última versión y la compara con la
tuya. Es el único momento en que Lab Ledger usa internet. No envía cuenta, ni
identificadores, ni nada de tus trabajos, clientes o pacientes; y solo descarga
un instalador cuando lo pides con el botón. Apágala en **Catálogo > Ajustes** y la aplicación
no hace ninguna llamada de red. Ver [GitHub API](#github-api).

## El archivo Excel asociado

Un laboratorio ya tiene una carpeta que se sincroniza, y cualquiera a su
alrededor sabe abrir una hoja de cálculo sin instalar nada. Así que Lab Ledger
la escribe.

Indícale un archivo en **Catálogo > Ajustes** y la aplicación lo reescribe cada
vez que se abre y cada vez que se cierra. Ponlo en la carpeta que tu nube ya
sincroniza y los números del laboratorio viajan con él, compartibles por ti, con
quien tú quieras, sin que nadie instale la aplicación. Lab Ledger sigue sin
subir nada: solo escribe un archivo local.

Ocho hojas legibles por sí solas: trabajos, el año mes a mes, materiales con el
coste de una unidad, tipos de trabajo con sus recetas y precios, costes fijos,
clínicas, operadores y una hoja Info con la versión y el copyright.

Es un archivo deliberadamente simple: solo valores, sin macros, sin tablas
dinámicas, sin fórmulas que solo entiende un programa, con los anchos de columna
puestos. Microsoft Excel, Google Sheets, LibreOffice y Numbers lo abren **y lo
editan** igual. Desactivado por defecto.

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
| Qué se recibe | la etiqueta de la última versión y la URL de su página |
| Y después | la etiqueta se compara con la versión instalada; si es más reciente aparece un diálogo. Pulsa **Descargar** y la aplicación baja sola el instalador para tu sistema en la carpeta Descargas y ofrece ejecutarlo. Sin ese botón no descarga ni instala nada |

La comprobación se desactiva en **Catálogo > Ajustes**; desactivada, la
aplicación no hace ninguna llamada de red. Allí se muestran también la versión
instalada y la versión de la API de GitHub en uso; la versión está además en la
barra superior: púlsala para comprobar actualizaciones a mano.

GitHub y el logotipo de GitHub son marcas de GitHub, Inc. Lab Ledger es un
proyecto independiente, no afiliado, patrocinado ni respaldado
por GitHub.

## Dónde se guardan los datos

Tus datos viven en un único archivo JSON local dentro de la carpeta de datos de
la aplicación; la ruta exacta se muestra en **Catálogo > Ajustes**. No se sube
nada a ninguna parte. Usa **Copia** para guardar una copia e **Importar copia**
para restaurarla.

## Ejecutar desde el código

Requiere [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm start
```

## Compilar

```bash
npm run dist
```

Los instaladores se generan en la carpeta `release/`: instalador NSIS y `.exe`
portable en Windows, `.dmg` y `.zip` en macOS, `AppImage` y `.deb` en Linux.

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

## Cómo se hizo

Lab Ledger es el trabajo de un técnico dental, no de una empresa de software.
Parte del código se escribió con la ayuda de Claude, el asistente de IA de
Anthropic. Las decisiones sobre qué debe hacer el programa, la revisión de lo
que salió y las pruebas en el laboratorio son del autor, y también lo es la
responsabilidad del resultado.

## Contribuir

Las contribuciones son bienvenidas, sobre todo las traducciones. Ver
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

Lab Ledger es **source-available**, no código abierto: libre de usar en tu
propio laboratorio, no libre de revender. Desde la versión 1.3.0 rige la
[Business Source License 1.1](LICENSE).

- **Cualquier laboratorio dental o clínica puede usarlo en producción,
  gratis** - en tantos ordenadores y sedes como quiera - y puede pagar a
  alguien para que se lo instale, aloje, mantenga o personalice.
- **Hace falta una licencia comercial** para ofrecer Lab Ledger, o una versión
  modificada, a terceros a cambio de dinero: como producto, como servicio
  alojado, junto con hardware o integrado en otro programa. Escribe a
  <info@vladpereverzyev.com>.
- **El 2030-09-11 esta versión pasa a Apache 2.0** automáticamente. Cada
  publicación lleva su propia fecha, cuatro años después de salir.
