/**
 * Motor Local de Búsqueda Semántica & NLP
 * Permite responder de manera inteligente, contextual y precisa sin costo de API
 */

export function normalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:#$%&/\\()="'`´]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'en', 'para',
  'por', 'con', 'sin', 'que', 'me', 'te', 'se', 'mi', 'tu', 'su', 'es', 'son', 'al',
  'del', 'a', 'como', 'cual', 'cuales', 'donde', 'cuando', 'quien', 'tienen', 'tiene',
  'tienes', 'puedo', 'pueden', 'puede', 'quiero', 'quisiera', 'necesito', 'busco'
]);

export function tokenizar(texto) {
  const norm = normalizarTexto(texto);
  return norm.split(' ').filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

export function similitudJaccard(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let interseccion = 0;
  for (const t of setA) {
    if (setB.has(t)) interseccion++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : interseccion / union;
}

export function procesarMensajeLocal(negocio, mensajeUsuario) {
  const norm = normalizarTexto(mensajeUsuario);
  const tokensPregunta = tokenizar(mensajeUsuario);

  // 1. Saludo
  const saludos = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'saludos', 'buen dia', 'hello', 'hi'];
  if (saludos.some(s => norm === s || norm.startsWith(s + ' ') || norm.includes(' ' + s + ' '))) {
    return {
      respuesta: negocio.saludo || `¡Hola! Bienvenido a ${negocio.nombre}. ¿En qué podemos ayudarte hoy?`,
      intencion: 'saludo',
      esLeadPotencial: false,
      sugerencias: negocio.preguntasSugeridas?.slice(0, 3) || []
    };
  }

  // 2. Despedida o agradecimiento
  const agradecimientos = ['gracias', 'muchas gracias', 'chau', 'adios', 'hasta luego', 'bye', 'ok gracias', 'vale gracias'];
  if (agradecimientos.some(a => norm === a || norm.includes(a))) {
    return {
      respuesta: negocio.despedida || `¡Con mucho gusto! Estamos a tu servicio en ${negocio.nombre}.`,
      intencion: 'despedida',
      esLeadPotencial: false,
      sugerencias: ['¿Cuál es su horario?', '¿Cómo los contacto?']
    };
  }

  // 3. Intención de contacto humano / visita / asesor / cotización / lead
  const palabrasLead = ['asesor', 'visita', 'visitar', 'agendar', 'cita', 'reservar', 'cotizar', 'quiero comprar', 'interesado', 'contacto', 'llamenme', 'comunicarme', 'reunion', 'presupuesto'];
  const esIntencionLead = palabrasLead.some(p => norm.includes(p));

  // 4. Preguntas Frecuentes (FAQ) matching
  let mejorFaq = null;
  let maxPuntajeFaq = 0;

  if (Array.isArray(negocio.faqs)) {
    for (const faq of negocio.faqs) {
      let puntaje = 0;

      // Coincidencia por tags directos
      if (Array.isArray(faq.tags)) {
        for (const tag of faq.tags) {
          const normTag = normalizarTexto(tag);
          if (norm.includes(normTag)) {
            puntaje += 3;
          }
        }
      }

      // Similitud de texto con la pregunta de la FAQ
      const tokensFaq = tokenizar(faq.pregunta);
      const sim = similitudJaccard(tokensPregunta, tokensFaq);
      puntaje += sim * 4;

      if (puntaje > maxPuntajeFaq) {
        maxPuntajeFaq = puntaje;
        mejorFaq = faq;
      }
    }
  }

  if (mejorFaq && maxPuntajeFaq >= 2) {
    return {
      respuesta: mejorFaq.respuesta,
      intencion: 'faq',
      esLeadPotencial: esIntencionLead,
      sugerencias: negocio.preguntasSugeridas?.filter(p => p !== mejorFaq.pregunta).slice(0, 3) || []
    };
  }

  // 5. Búsqueda en catálogo de productos / servicios
  let mejorItem = null;
  let maxPuntajeItem = 0;

  if (Array.isArray(negocio.catalogo)) {
    for (const item of negocio.catalogo) {
      let puntaje = 0;
      const normNombre = normalizarTexto(item.nombre);
      const normDesc = normalizarTexto(item.descripcion || '');

      if (norm.includes(normNombre)) {
        puntaje += 5;
      }

      for (const t of tokensPregunta) {
        if (normNombre.includes(t)) puntaje += 2;
        if (normDesc.includes(t)) puntaje += 1;
      }

      if (puntaje > maxPuntajeItem) {
        maxPuntajeItem = puntaje;
        mejorItem = item;
      }
    }
  }

  if (mejorItem && maxPuntajeItem >= 2.5) {
    const moneda = mejorItem.moneda === 'USD' ? 'US$' : (mejorItem.moneda === 'PEN' ? 'S/' : mejorItem.moneda);
    const precioStr = mejorItem.precio === 0 ? 'Gratis (incluido)' : `${moneda} ${mejorItem.precio.toLocaleString('es-PE')}`;
    const detalleExtra = mejorItem.detalles ? ` · ${mejorItem.detalles}` : '';

    return {
      respuesta: `**${mejorItem.nombre}**: ${mejorItem.descripcion}\n**Precio:** ${precioStr}${detalleExtra}.\n\n¿Te gustaría solicitar más información o coordinar la compra/visita?`,
      intencion: 'catalogo',
      item: mejorItem,
      esLeadPotencial: true,
      sugerencias: ['¿Cómo coordino la compra o visita?', '¿Qué otras opciones tienen?', '¿Aceptan tarjetas o cuotas?']
    };
  }

  // 6. Búsqueda en base de conocimiento (informacion array)
  let mejorInfo = null;
  let maxPuntajeInfo = 0;

  if (Array.isArray(negocio.informacion)) {
    for (const info of negocio.informacion) {
      const tokensInfo = tokenizar(info);
      const sim = similitudJaccard(tokensPregunta, tokensInfo);
      
      let puntaje = sim * 3;
      for (const t of tokensPregunta) {
        if (normalizarTexto(info).includes(t)) puntaje += 1;
      }

      if (puntaje > maxPuntajeInfo) {
        maxPuntajeInfo = puntaje;
        mejorInfo = info;
      }
    }
  }

  if (mejorInfo && maxPuntajeInfo >= 1.5) {
    return {
      respuesta: mejorInfo,
      intencion: 'informacion',
      esLeadPotencial: esIntencionLead,
      sugerencias: negocio.preguntasSugeridas?.slice(0, 3) || []
    };
  }

  // 7. Si fue detectado como intención de contacto/lead pero no coincidió con FAQ
  if (esIntencionLead) {
    return {
      respuesta: `Con gusto coordinamos la atención para ti. Puedes dejar tu **Nombre, Teléfono o WhatsApp y correo**, o comunicarte directamente a nuestro canal oficial: **${negocio.telefono || 'nuestro WhatsApp'}**.`,
      intencion: 'lead',
      esLeadPotencial: true,
      sugerencias: ['Dejar mis datos para contacto', 'Ver catálogo completo', '¿Cuál es el horario?']
    };
  }

  // 8. Fallback general amigable basado en la identidad del negocio
  return {
    respuesta: `No tengo información confirmada sobre esa consulta específica en mi base de datos de **${negocio.nombre}**. Te sugiero consultar sobre nuestros productos, precios o dejar tus datos para que un asesor especializado te responda directamente.`,
    intencion: 'desconocido',
    esLeadPotencial: false,
    sugerencias: negocio.preguntasSugeridas?.slice(0, 3) || []
  };
}
