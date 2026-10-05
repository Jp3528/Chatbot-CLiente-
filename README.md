# Chatbot Clientes API — Multi-Business AI & Customer Support Engine

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Vercel Ready](https://img.shields.io/badge/Vercel-Serverless_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)
![AI Hybrid](https://img.shields.io/badge/AI_Engine-Local_NLP_%2B_LLM-0d9488?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

Plataforma full-stack de **asistentes virtuales de atención al cliente multi-negocio**. Permite que cualquier empresa (inmobiliaria, restaurante, clínica dental, tienda de tecnología o e-commerce) configure su base de conocimiento, responda preguntas de catálogo de forma instantánea, capture prospectos calificados (*leads*) y despliegue un **widget flotante embebible** en cualquier sitio web con solo una línea de código.

---

## Características Principales

### 1. Motor Híbrido de Inteligencia Artificial & NLP
* **Modo Autónomo Local (Zero-Cost / Offline):** Búsqueda semántica, similitud Jaccard/TF-IDF y coincidencia de intención por N-gramas que opera **100% gratis**, sin depender de saldo en APIs externas y con respuesta instantánea (< 5ms).
* **Modo LLM Generativo (OpenAI / Gemini):** Si se configura una API Key (`OPENAI_API_KEY` o `GEMINI_API_KEY`), el motor genera respuestas empáticas, humanas y conversacionales mediante *Prompt Grounding* estricto para evitar alucinaciones.
* **Fallback Automático Resiliente:** Si el servicio de IA externa se queda sin saldo o pierde conexión, el sistema conmuta de forma transparente al motor semántico local sin interrumpir el servicio al cliente.

### 2. Arquitectura Multi-Tenant (Multi-Negocio)
Un solo servidor puede gestionar la atención de cientos de negocios independientes. Incluye 4 perfiles preconfigurados listos para producción:
1. **`premium-home`:** Inmobiliaria residencial de lujo (casas, villas, mansiones, agendamiento de visitas guiadas).
2. **`la-esquina`:** Restaurante y pollo crujiente (combos, precios, delivery express, medios de pago contraentrega).
3. **`sonrisa-dental`:** Clínica odontológica (diseño de sonrisa, ortodoncia, citas de diagnóstico gratuito).
4. **`nexus-tech`:** Tienda de computación y gaming (laptops gamer, periféricos, garantías y envíos a provincia).

### 3. Captura Inteligente de Prospectos (Lead Generation)
* Detección automática de intenciones comerciales (solicitud de visitas, cotizaciones, llamadas de asesor o compra).
* Despliegue de banner para captura de **Nombre**, **WhatsApp/Teléfono** y **Correo**.
* Almacenamiento seguro en base de datos (`data/leads.json`) y consulta protegida vía API REST.

### 4. Widget Web Embebible (`widget.js`)
* Script vanilla JS ultra liviano (< 6KB, zero dependencies).
* Se integra en cualquier web moderna (WordPress, Shopify, Webflow o HTML puro) con solo agregar:
  ```html
  <script src="https://tu-dominio.com/widget.js" data-project="premium-home"></script>
  ```
* Incluye botón flotante con animaciones, ventana de chat estilizada, chips de preguntas frecuentes sugeridas y formulario de contacto integrado.

### 5. Dashboard & Playground Interactivo (`/`)
* Panel web visual para probar las respuestas de cada negocio en tiempo real.
* Selector instantáneo de negocio para verificar catálogos y bases de conocimiento.
* Inspección técnica de la carga útil JSON devuelta por la API (`intencion`, `esLeadPotencial`, `tiempoMs`, `motor`).
* Visualizador en vivo de prospectos capturados.

---

## Estructura del Proyecto

```text
chatbot-clientes-api/
├── api/
│   └── index.mjs           # Entry point serverless para Vercel
├── data/
│   ├── negocios.json       # Bases de conocimiento, FAQs y catálogos multi-negocio
│   └── leads.json          # Registro estructurado de prospectos capturados
├── public/
│   ├── index.html          # Playground y Dashboard interactivo de pruebas
│   └── widget.js           # SDK y script embebible para sitios web externos
├── src/
│   ├── aiEngine.mjs        # Orquestador híbrido (OpenAI GPT-4o-mini + Gemini)
│   ├── nlpEngine.mjs       # Motor local de búsqueda semántica y detección de intenciones
│   └── storage.mjs         # Capa de persistencia con soporte para entornos /tmp serverless
├── test/
│   └── api.test.mjs        # Suite de pruebas unitarias automatizadas (Node Test Runner)
├── .env.example            # Plantilla de variables de entorno
├── .gitignore              # Archivos excluidos de control de versiones
├── package.json            # Metadatos, scripts y dependencias
├── vercel.json             # Enrutamiento y configuración de despliegue en Vercel
├── server.mjs              # Servidor HTTP Express y API REST
└── README.md               # Documentación técnica completa
```

---

## Inicio Rápido (Local)

### 1. Clonar el proyecto
```bash
git clone https://github.com/Jp3528/Chatbot-CLiente-.git
cd Chatbot-CLiente-
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (Opcional)
```bash
cp .env.example .env
```
> **Nota:** Si dejas `.env` vacío, el chatbot funcionará al 100% de sus capacidades utilizando el motor semántico local gratuito.

### 4. Iniciar el servidor
```bash
npm start
```

Abre tu navegador en: **`http://localhost:3000`** para ingresar al playground interactivo.

### 5. Ejecutar pruebas unitarias
```bash
npm test
```

---

## Especificación de la API REST

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y motor de IA activo | Público |
| `GET` | `/api/negocios` | Lista todos los negocios registrados | Público |
| `GET` | `/api/negocios/:id` | Obtiene el perfil, catálogo y FAQs de un negocio | Público |
| `POST` | `/api/negocios` | Registra dinámicamente un nuevo negocio | Admin / API |
| `POST` | `/api/chat` | Envía mensaje al chatbot y recibe respuesta inteligente | Público |
| `POST` | `/api/leads` | Registra los datos de un prospecto interesado | Público |
| `GET` | `/api/leads` | Consulta la lista de leads capturados | Privado |

### Ejemplo: Conversación con el Chatbot (`POST /api/chat`)

**Petición:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "premium-home",
    "pregunta": "¿Tienen propiedades con piscina y cuál es su precio?"
  }'
```

**Respuesta JSON:**
```json
{
  "projectId": "premium-home",
  "negocio": "Premium Home Inmobiliaria",
  "respuesta": "Sí, disponemos de 'Villa Moderna' (US$ 50,000) y 'Mansión Lujosa' (US$ 700,000), ambas con amplias piscinas y jardines privados.",
  "intencion": "faq",
  "esLeadPotencial": false,
  "sugerencias": [
    "¿Cómo puedo agendar una visita guiada?",
    "¿Cuál es la propiedad más económica?"
  ],
  "motor": "local_nlp",
  "tiempoMs": 1
}
```

---

## Cómo Embeber el Widget en Cualquier Sitio Web

Para integrar el chatbot en cualquier página web (WordPress, Shopify, Landing Page HTML, etc.), añade el siguiente fragmento antes de la etiqueta de cierre `</body>`:

```html
<!-- Widget de Chatbot de Atención al Cliente -->
<script 
  src="https://tu-dominio.vercel.app/widget.js" 
  data-project="premium-home" 
  data-color="#0f766e">
</script>
```

### Parámetros Configurables:
* `data-project`: Identificador del negocio (`premium-home`, `la-esquina`, `sonrisa-dental`, `nexus-tech` o uno personalizado).
* `data-color`: Color hexadecimal del tema para que combine con la identidad visual de la marca (ej. `#0f766e`, `#ea580c`, `#2563eb`).
* `data-api`: (Opcional) URL base del backend si el widget se aloja en un dominio independiente.

---

## Despliegue en la Nube (Vercel)

El proyecto incluye `vercel.json` y la función serverless `api/index.mjs` preconfigurada:

1. Sube tu código a un repositorio en tu cuenta de GitHub (`Jp3528/Chatbot-CLiente-`).
2. Entra a [vercel.com](https://vercel.com/) y pulsa **Add New... > Project**.
3. Selecciona tu repositorio y pulsa **Deploy**.
4. (Opcional) En *Settings > Environment Variables*, añade `OPENAI_API_KEY` o `GEMINI_API_KEY` si deseas utilizar modelos de lenguaje generativos en la nube.

---

## Licencia

Este proyecto está liberado bajo la Licencia **MIT**. Puedes utilizarlo y modificarlo libremente para proyectos comerciales o personales.
