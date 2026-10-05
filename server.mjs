import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getNegocios, getNegocioById, saveNegocio, getLeads, saveLead } from './src/storage.mjs';
import { generarRespuesta } from './src/aiEngine.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir archivos estáticos del playground y widget embebible
app.use(express.static(path.join(__dirname, 'public')));

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'Chatbot Clientes API — Multi-Business AI Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    motorActivo: process.env.OPENAI_API_KEY ? 'OpenAI LLM + Local NLP' : 'Local NLP Semantic Engine (Zero-Cost)'
  });
});

// 2. Listar todos los negocios disponibles
app.get('/api/negocios', async (req, res) => {
  try {
    const negocios = await getNegocios();
    const resumen = Object.values(negocios).map(n => ({
      id: n.id,
      nombre: n.nombre,
      categoria: n.categoria,
      color: n.color || '#0f766e',
      descripcion: n.descripcion,
      telefono: n.telefono,
      preguntasSugeridas: n.preguntasSugeridas || []
    }));
    res.json({ total: resumen.length, negocios: resumen });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener negocios: ' + err.message });
  }
});

// 3. Obtener detalle de un negocio específico
app.get('/api/negocios/:id', async (req, res) => {
  try {
    const negocio = await getNegocioById(req.params.id);
    if (!negocio) {
      return res.status(404).json({ error: `Negocio '${req.params.id}' no encontrado.` });
    }
    res.json({ negocio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Crear o registrar nuevo negocio dinámicamente
app.post('/api/negocios', async (req, res) => {
  try {
    const { id, nombre, categoria, descripcion, telefono, email, horario, ubicacion, informacion, catalogo, faqs, preguntasSugeridas, color } = req.body;

    if (!id || !nombre || !Array.isArray(informacion)) {
      return res.status(400).json({
        error: "Campos requeridos: 'id' (string único), 'nombre' (string) e 'informacion' (array de strings)."
      });
    }

    const cleanId = String(id).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const nuevoNegocio = {
      id: cleanId,
      nombre: String(nombre).trim(),
      categoria: categoria || 'General',
      color: color || '#2563eb',
      descripcion: descripcion || '',
      telefono: telefono || '',
      email: email || '',
      horario: horario || 'Atención en horario comercial',
      ubicacion: ubicacion || '',
      saludo: `¡Hola! Bienvenido a ${nombre}. ¿En qué podemos ayudarte hoy?`,
      despedida: `¡Gracias por contactar a ${nombre}! Estamos para servirte.`,
      preguntasSugeridas: Array.isArray(preguntasSugeridas) ? preguntasSugeridas : [],
      informacion,
      catalogo: Array.isArray(catalogo) ? catalogo : [],
      faqs: Array.isArray(faqs) ? faqs : []
    };

    const guardado = await saveNegocio(cleanId, nuevoNegocio);
    res.status(201).json({ mensaje: 'Negocio registrado con éxito.', negocio: guardado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Endpoint Principal: Chat Inteligente Multi-Negocio
app.post('/api/chat', async (req, res) => {
  try {
    const { projectId, pregunta, mensaje, historial } = req.body;
    const promptUsuario = String(pregunta || mensaje || '').trim();
    const idNegocio = String(projectId || 'premium-home').trim();

    if (!promptUsuario) {
      return res.status(400).json({
        error: 'Debes proporcionar una pregunta o mensaje válido en el cuerpo de la petición.'
      });
    }

    const negocio = await getNegocioById(idNegocio);
    if (!negocio) {
      return res.status(404).json({
        error: `El proyecto o negocio '${idNegocio}' no existe en el sistema.`
      });
    }

    const resultado = await generarRespuesta({
      negocio,
      mensaje: promptUsuario,
      historial: Array.isArray(historial) ? historial : []
    });

    res.json({
      projectId: idNegocio,
      negocio: negocio.nombre,
      respuesta: resultado.respuesta,
      intencion: resultado.intencion,
      esLeadPotencial: Boolean(resultado.esLeadPotencial),
      sugerencias: resultado.sugerencias || [],
      item: resultado.item || null,
      motor: resultado.motor,
      tiempoMs: resultado.tiempoMs
    });
  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.status(500).json({ error: 'Error interno al procesar el mensaje: ' + err.message });
  }
});

// 6. Captura de Leads / Prospectos
app.post('/api/leads', async (req, res) => {
  try {
    const { projectId, nombre, contacto, telefono, email, interes, mensaje } = req.body;

    if (!nombre || (!contacto && !telefono && !email)) {
      return res.status(400).json({
        error: 'Debes proporcionar al menos tu nombre y un método de contacto (teléfono, whatsapp o email).'
      });
    }

    const leadData = {
      projectId: projectId || 'general',
      nombre: String(nombre).trim(),
      contacto: String(contacto || telefono || email).trim(),
      email: email ? String(email).trim() : null,
      interes: String(interes || mensaje || 'Consulta general desde chatbot web').trim(),
      origen: 'chatbot-api'
    };

    const nuevoLead = await saveLead(leadData);
    res.status(201).json({
      ok: true,
      mensaje: '¡Prospecto registrado exitosamente! Un asesor se comunicará a la brevedad.',
      lead: nuevoLead
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar prospecto: ' + err.message });
  }
});

// 7. Consultar Leads Capturados
app.get('/api/leads', async (req, res) => {
  try {
    const { projectId } = req.query;
    const leads = await getLeads(projectId);
    res.json({ total: leads.length, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada.',
    rutasDisponibles: [
      'GET  /',
      'GET  /api/health',
      'GET  /api/negocios',
      'GET  /api/negocios/:id',
      'POST /api/negocios',
      'POST /api/chat',
      'POST /api/leads',
      'GET  /api/leads'
    ]
  });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO] Chatbot Clientes API ejecutándose en http://localhost:${PORT}`);
    console.log(`[INFO] Playground interactivo disponible en http://localhost:${PORT}`);
    console.log(`[INFO] Script widget embebible: http://localhost:${PORT}/widget.js`);
  });
}