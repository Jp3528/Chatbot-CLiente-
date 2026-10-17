# Chatbot Clientes | Customer Support API & Widget

[Español](#espanol) · [English](#english)

[Demo](https://chatbotcliente.vercel.app) · [GitHub](https://github.com/Jp3528/Chatbot-CLiente-)

<a id="espanol"></a>

## Español

### Descripción

Prototipo de atención al cliente para varios negocios con API REST, playground y widget embebible. Responde mediante reglas y coincidencia de texto locales, con adaptadores opcionales para proveedores de modelos de lenguaje.

### Funcionalidades

- Perfiles de negocio con catálogo, información y preguntas frecuentes.
- Respuestas locales sin necesidad de una clave de IA.
- Adaptadores para OpenAI y Gemini con fallback al motor local ante fallos.
- Captura de prospectos y widget JavaScript para integrar el chat en otras páginas.

### Tecnologías

Node.js · Express 5 · JavaScript ES Modules · Node Test Runner

### Ejecutar localmente

**Requisitos:** Node.js 22 y npm. Las claves de proveedores externos son opcionales.

```bash
git clone https://github.com/Jp3528/Chatbot-CLiente-.git
cd Chatbot-CLiente-
```

```bash
npm ci
```

**Configuración.** Copia [`.env.example`](.env.example) a `.env` si necesitas cambiar `PORT` o configurar un proveedor. Sin claves se utiliza el motor local. Los adaptadores externos dependen de la disponibilidad del modelo y de la cuenta configurada; su presencia no implica una integración validada actualmente.

```bash
npm start
```

Playground: `http://localhost:3000`. Salud: `/api/health`. Negocios: `/api/negocios`. Conversación: `POST /api/chat`. Prospectos: `/api/leads`.

### Comprobaciones

```bash
npm test
```

Comandos disponibles para comprobar el proyecto en un entorno con sus dependencias instaladas.

### Estructura

| Ruta                                     | Contenido                                         |
| ---------------------------------------- | ------------------------------------------------- |
| [`server.mjs`](server.mjs)               | Servidor Express y rutas HTTP.                    |
| [`src/aiEngine.mjs`](src/aiEngine.mjs)   | Selección de motor y adaptadores de proveedores.  |
| [`src/nlpEngine.mjs`](src/nlpEngine.mjs) | Reglas y recuperación local por texto.            |
| [`src/storage.mjs`](src/storage.mjs)     | Persistencia JSON local y temporal en serverless. |
| [`public/`](public/)                     | Playground y widget embebible.                    |
| [`test/`](test/)                         | Pruebas de API.                                   |

### Alcance

Prototipo para datos de prueba. Las rutas de registro de negocios y consulta de prospectos no implementan autenticación administrativa en el código actual. El almacenamiento JSON en `/tmp` de un despliegue serverless es temporal. Una versión con datos reales requiere autorización por negocio, controles de acceso y una base persistente.

---

<a id="english"></a>

## English

### Overview

A multi-business customer support prototype with a REST API, playground and embeddable widget. It responds through local rules and text matching, with optional language model provider adapters.

### Features

- Business profiles with catalogs, information and FAQs.
- Local responses without an AI API key.
- OpenAI and Gemini adapters with fallback to the local engine on failure.
- Lead capture and a JavaScript widget for embedding chat on other pages.

### Technology

Node.js · Express 5 · JavaScript ES Modules · Node Test Runner

### Run locally

**Requirements:** Node.js 22 and npm. External provider keys are optional.

```bash
git clone https://github.com/Jp3528/Chatbot-CLiente-.git
cd Chatbot-CLiente-
```

```bash
npm ci
```

**Configuration.** Copy [`.env.example`](.env.example) to `.env` to change `PORT` or configure a provider. Without keys, the local engine is used. External adapters depend on model availability and the configured account; their presence does not imply a currently validated integration.

```bash
npm start
```

Playground: `http://localhost:3000`. Health: `/api/health`. Businesses: `/api/negocios`. Chat: `POST /api/chat`. Leads: `/api/leads`.

### Checks

```bash
npm test
```

Available commands for checking the project in an environment with its dependencies installed.

### Structure

| Path                                     | Contents                                     |
| ---------------------------------------- | -------------------------------------------- |
| [`server.mjs`](server.mjs)               | Express server and HTTP routes.              |
| [`src/aiEngine.mjs`](src/aiEngine.mjs)   | Engine selection and provider adapters.      |
| [`src/nlpEngine.mjs`](src/nlpEngine.mjs) | Local rules and text retrieval.              |
| [`src/storage.mjs`](src/storage.mjs)     | Local and temporary serverless JSON storage. |
| [`public/`](public/)                     | Playground and embeddable widget.            |
| [`test/`](test/)                         | API tests.                                   |

### Scope

A prototype for test data. Business registration and lead listing routes do not implement administrative authentication in the current code. JSON stored in a serverless deployment's `/tmp` directory is temporary. A version handling real data requires business-level authorization, access controls and persistent storage.
