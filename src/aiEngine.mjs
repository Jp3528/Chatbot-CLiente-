import { procesarMensajeLocal } from './nlpEngine.mjs';

/**
 * Motor Híbrido de Inteligencia Artificial
 * - Utiliza OpenAI o Gemini si existen credenciales configuradas en .env
 * - Fallback automático y transparente al motor semántico local si no hay API key o si ocurre un error
 */
export async function generarRespuesta({ negocio, mensaje, historial = [] }) {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // Si no hay API Keys configuradas, usar el motor local ultrarrápido
  if (!openaiKey && !geminiKey) {
    const localResult = procesarMensajeLocal(negocio, mensaje);
    return {
      ...localResult,
      motor: 'local_nlp',
      tiempoMs: 1
    };
  }

  const startTime = Date.now();

  // 1. Intentar con OpenAI si existe key
  if (openaiKey && openaiKey !== 'coloca_aqui_tu_clave_api') {
    try {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: openaiKey });

      const contextoNegocio = `
IDENTIDAD DEL NEGOCIO:
- Nombre: ${negocio.nombre}
- Categoría: ${negocio.categoria}
- Descripción: ${negocio.descripcion}
- Teléfono / WhatsApp: ${negocio.telefono}
- Horario de atención: ${negocio.horario}
- Ubicación: ${negocio.ubicacion}

BASE DE CONOCIMIENTO AUTORIZADA:
${negocio.informacion.map(i => `• ${i}`).join('\n')}

CATÁLOGO DE PRODUCTOS / PRECIOS:
${(negocio.catalogo || []).map(c => `• ${c.nombre}: ${c.moneda || 'S/'} ${c.precio} - ${c.descripcion} ${c.detalles ? '(' + c.detalles + ')' : ''}`).join('\n')}

PREGUNTAS FRECUENTES RECOMENDADAS:
${(negocio.faqs || []).map(f => `P: ${f.pregunta}\nR: ${f.respuesta}`).join('\n\n')}
`;

      const systemPrompt = `Eres el asistente virtual oficial de atención al cliente de "${negocio.nombre}".
REGLAS OBLIGATORIAS:
1. Responde de forma amable, empática, concisa y profesional en español.
2. Utiliza ÚNICAMENTE los datos y precios del negocio proporcionados abajo.
3. Si el usuario te pregunta por algo que NO está en la información autorizada (ej. descuentos no mencionados, direcciones no confirmadas, o temas no relacionados), NO lo inventes; explícale que no dispones de ese dato y sugiere amablemente dejar sus datos o escribir al WhatsApp para que un asesor lo oriente.
4. Si el usuario expresa interés en comprar, agendar cita o ser contactado, invítalo cordialmente a dejar su nombre y número telefónico.
5. Mantén respuestas breves (máximo 2 a 3 párrafos cortos) con formato markdown legible (negritas, viñetas).

${contextoNegocio}
`;

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Añadir historial previo si existe
      if (Array.isArray(historial)) {
        for (const msg of historial.slice(-6)) {
          if (msg.role && msg.content) {
            messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: String(msg.content) });
          }
        }
      }

      messages.push({ role: 'user', content: mensaje });

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 350
      });

      const respuestaIa = completion.choices[0]?.message?.content?.trim();
      if (respuestaIa) {
        // Detectar si la pregunta contiene intención de lead
        const localMeta = procesarMensajeLocal(negocio, mensaje);
        return {
          respuesta: respuestaIa,
          intencion: localMeta.intencion,
          esLeadPotencial: localMeta.esLeadPotencial,
          sugerencias: negocio.preguntasSugeridas?.slice(0, 3) || [],
          motor: 'openai_llm',
          tiempoMs: Date.now() - startTime
        };
      }
    } catch (err) {
      console.warn('OpenAI error, fallback a motor local:', err.message);
    }
  }

  // 2. Intentar con Gemini API directa si existe key
  if (geminiKey) {
    try {
      const prompt = `Eres el asistente virtual de "${negocio.nombre}".
Contexto:
${negocio.informacion.join('\n')}
Catálogo:
${(negocio.catalogo || []).map(c => `${c.nombre}: ${c.precio}`).join(', ')}

Pregunta del cliente: "${mensaje}"
Responde en español de forma concisa y basada exclusivamente en el contexto:`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          const localMeta = procesarMensajeLocal(negocio, mensaje);
          return {
            respuesta: geminiText.trim(),
            intencion: localMeta.intencion,
            esLeadPotencial: localMeta.esLeadPotencial,
            sugerencias: negocio.preguntasSugeridas?.slice(0, 3) || [],
            motor: 'gemini_llm',
            tiempoMs: Date.now() - startTime
          };
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini error, fallback a motor local:', geminiErr.message);
    }
  }

  // Fallback garantizado a motor semántico local
  const fallbackResult = procesarMensajeLocal(negocio, mensaje);
  return {
    ...fallbackResult,
    motor: 'local_nlp_fallback',
    tiempoMs: Date.now() - startTime
  };
}
