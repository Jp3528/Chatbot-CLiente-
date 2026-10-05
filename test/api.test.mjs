import test from 'node:test';
import assert from 'node:assert/strict';
import { getNegocios, getNegocioById, getLeads, saveLead } from '../src/storage.mjs';
import { procesarMensajeLocal } from '../src/nlpEngine.mjs';
import { generarRespuesta } from '../src/aiEngine.mjs';

test('1. Debe cargar los 4 negocios preconfigurados', async () => {
  const negocios = await getNegocios();
  const keys = Object.keys(negocios);
  assert.ok(keys.includes('premium-home'), 'Debe incluir premium-home');
  assert.ok(keys.includes('la-esquina'), 'Debe incluir la-esquina');
  assert.ok(keys.includes('sonrisa-dental'), 'Debe incluir sonrisa-dental');
  assert.ok(keys.includes('nexus-tech'), 'Debe incluir nexus-tech');
  assert.strictEqual(keys.length >= 4, true);
});

test('2. NLP Engine responde correctamente a saludo en Premium Home', async () => {
  const negocio = await getNegocioById('premium-home');
  const res = procesarMensajeLocal(negocio, 'Hola, buenos dias');
  assert.strictEqual(res.intencion, 'saludo');
  assert.ok(res.respuesta.toLowerCase().includes('premium home'));
  assert.ok(Array.isArray(res.sugerencias));
});

test('3. NLP Engine detecta preguntas sobre piscina en Premium Home', async () => {
  const negocio = await getNegocioById('premium-home');
  const res = procesarMensajeLocal(negocio, '¿Tienen casas con piscina?');
  assert.ok(res.respuesta.toLowerCase().includes('piscina'));
  assert.ok(res.respuesta.includes('Villa Moderna') || res.respuesta.includes('Mansión Lujosa'));
});

test('4. NLP Engine identifica la propiedad más barata', async () => {
  const negocio = await getNegocioById('premium-home');
  const res = procesarMensajeLocal(negocio, '¿Cual es la propiedad mas economica o barata?');
  assert.ok(res.respuesta.includes('Residencial Lujoso'));
  assert.ok(res.respuesta.includes('20,000'));
});

test('5. NLP Engine responde consultas de delivery para La Esquina', async () => {
  const negocio = await getNegocioById('la-esquina');
  const res = procesarMensajeLocal(negocio, '¿Hacen delivery y cuanto cobran por el envio?');
  assert.ok(res.respuesta.includes('3.00') || res.respuesta.toLowerCase().includes('delivery'));
});

test('6. NLP Engine detecta intención de lead/cita para clínica dental', async () => {
  const negocio = await getNegocioById('sonrisa-dental');
  const res = procesarMensajeLocal(negocio, 'Quiero agendar una cita con un especialista');
  assert.strictEqual(res.esLeadPotencial, true);
});

test('7. Storage guarda y recupera leads correctamente', async () => {
  const leadNuevo = await saveLead({
    projectId: 'premium-home',
    nombre: 'Test User',
    contacto: '+51 900 111 222',
    interes: 'Prueba unitaria automatizada'
  });

  assert.ok(leadNuevo.id.startsWith('LEAD-'));
  const leads = await getLeads('premium-home');
  const found = leads.find(l => l.id === leadNuevo.id);
  assert.ok(found);
  assert.strictEqual(found.nombre, 'Test User');
});
