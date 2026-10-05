(function () {
  // Detectar script y projectId configurado
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const projectId = currentScript?.getAttribute('data-project') || 'premium-home';
  const apiBase = currentScript?.getAttribute('data-api') || (currentScript?.src ? new URL(currentScript.src).origin : window.location.origin);
  const primaryColor = currentScript?.getAttribute('data-color') || '#0f766e';

  // Evitar duplicados
  if (document.getElementById('chatbot-widget-container')) return;

  // Inyectar Estilos
  const style = document.createElement('style');
  style.id = 'chatbot-widget-styles';
  style.textContent = `
    .cb-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      z-index: 999990;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      border: none;
      outline: none;
    }
    .cb-launcher:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
    }
    .cb-launcher svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
      transition: transform 0.25s ease;
    }
    .cb-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 18px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 999991;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .cb-window.cb-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .cb-header {
      background: ${primaryColor};
      color: #ffffff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cb-header-title {
      font-weight: 700;
      font-size: 15px;
      line-height: 1.2;
    }
    .cb-header-sub {
      font-size: 11px;
      opacity: 0.85;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 3px;
    }
    .cb-online-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4ade80;
      display: inline-block;
    }
    .cb-close-btn {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
      padding: 4px;
    }
    .cb-close-btn:hover { opacity: 1; }
    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }
    .cb-bubble {
      max-width: 82%;
      padding: 11px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .cb-bubble.cb-bot {
      background: #ffffff;
      color: #1e293b;
      align-self: flex-start;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      border-bottom-left-radius: 3px;
    }
    .cb-bubble.cb-user {
      background: ${primaryColor};
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 3px;
    }
    .cb-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .cb-chip {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 6px 10px;
      border-radius: 12px;
      font-size: 11.5px;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .cb-chip:hover {
      background: #cbd5e1;
    }
    .cb-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      width: fit-content;
      border-bottom-left-radius: 3px;
    }
    .cb-dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: cbBounce 1.4s infinite both;
    }
    .cb-dot:nth-child(1) { animation-delay: -0.32s; }
    .cb-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes cbBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .cb-lead-banner {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 12px;
      color: #166534;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cb-lead-banner button {
      background: #16a34a;
      color: #fff;
      border: none;
      padding: 6px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .cb-input-box {
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      display: flex;
      gap: 8px;
    }
    .cb-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13.5px;
      outline: none;
      font-family: inherit;
    }
    .cb-input:focus {
      border-color: ${primaryColor};
    }
    .cb-send-btn {
      background: ${primaryColor};
      color: #ffffff;
      border: none;
      border-radius: 10px;
      width: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cb-send-btn:hover { opacity: 0.9; }
  `;
  document.head.appendChild(style);

  // Crear elementos del DOM
  const container = document.createElement('div');
  container.id = 'chatbot-widget-container';
  container.innerHTML = `
    <button class="cb-launcher" aria-label="Abrir asistente de chat">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
    </button>
    <div class="cb-window" role="dialog" aria-modal="true">
      <div class="cb-header">
        <div>
          <div class="cb-header-title" id="cbTitle">Asistente Virtual</div>
          <div class="cb-header-sub">
            <span class="cb-online-dot"></span>
            <span id="cbStatus">En línea · Respuestas automáticas</span>
          </div>
        </div>
        <button class="cb-close-btn" aria-label="Cerrar chat">×</button>
      </div>
      <div class="cb-messages" id="cbMessages"></div>
      <form class="cb-input-box" id="cbForm">
        <input type="text" class="cb-input" id="cbInput" placeholder="Escribe tu consulta aquí..." autocomplete="off">
        <button type="submit" class="cb-send-btn" aria-label="Enviar">
          <svg style="width:18px;height:18px;fill:currentColor;" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(container);

  const launcher = container.querySelector('.cb-launcher');
  const windowEl = container.querySelector('.cb-window');
  const closeBtn = container.querySelector('.cb-close-btn');
  const messagesEl = container.querySelector('#cbMessages');
  const formEl = container.querySelector('#cbForm');
  const inputEl = container.querySelector('#cbInput');
  const titleEl = container.querySelector('#cbTitle');

  let history = [];
  let businessInfo = null;

  // Toggle Ventana
  launcher.addEventListener('click', () => {
    windowEl.classList.toggle('cb-open');
    if (windowEl.classList.contains('cb-open')) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    windowEl.classList.remove('cb-open');
  });

  // Cargar datos del negocio
  async function loadBusiness() {
    try {
      const res = await fetch(`${apiBase}/api/negocios/${encodeURIComponent(projectId)}`);
      if (res.ok) {
        const data = await res.json();
        businessInfo = data.negocio;
        if (businessInfo) {
          titleEl.textContent = businessInfo.nombre;
          addBotMessage(businessInfo.saludo || '¡Hola! ¿En qué puedo ayudarte hoy?', businessInfo.preguntasSugeridas);
        }
      } else {
        addBotMessage('¡Hola! Soy tu asistente virtual. Puedes preguntarme sobre productos, precios y horarios.');
      }
    } catch {
      addBotMessage('¡Hola! Bienvenido. ¿En qué podemos ayudarte hoy?');
    }
  }

  function formatText(txt) {
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function addBotMessage(text, chips = [], showLeadBanner = false) {
    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble cb-bot';
    bubble.innerHTML = formatText(text);

    if (showLeadBanner) {
      const leadBanner = document.createElement('div');
      leadBanner.className = 'cb-lead-banner';
      leadBanner.style.marginTop = '10px';
      leadBanner.innerHTML = `
        <strong>¿Deseas que un asesor se comunique contigo?</strong>
        <span>Deja tu nombre y teléfono para contactarte de inmediato.</span>
        <button type="button" class="cb-lead-open">Dejar mis datos 📲</button>
      `;
      leadBanner.querySelector('.cb-lead-open').addEventListener('click', promptLeadForm);
      bubble.appendChild(leadBanner);
    }

    if (chips && chips.length > 0) {
      const chipsContainer = document.createElement('div');
      chipsContainer.className = 'cb-chips';
      chips.forEach(chipText => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'cb-chip';
        chip.textContent = chipText;
        chip.addEventListener('click', () => {
          sendMessage(chipText);
        });
        chipsContainer.appendChild(chip);
      });
      bubble.appendChild(chipsContainer);
    }

    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    history.push({ role: 'assistant', content: text });
  }

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'cb-bubble cb-user';
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    history.push({ role: 'user', content: text });
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'cb-typing';
    typing.id = 'cbTypingIndicator';
    typing.innerHTML = '<div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('cbTypingIndicator');
    if (typing) typing.remove();
  }

  function promptLeadForm() {
    const nombre = prompt('Ingresa tu nombre completo:');
    if (!nombre) return;
    const contacto = prompt('Ingresa tu WhatsApp o correo electrónico:');
    if (!contacto) return;

    fetch(`${apiBase}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        nombre,
        contacto,
        interes: 'Solicitud enviada a través del widget de chat'
      })
    })
      .then(res => res.json())
      .then(data => {
        addBotMessage(`✓ ¡Muchas gracias ${nombre}! Hemos registrado tus datos con el código **${data.lead?.id || 'LEAD'}**. Un asesor te escribirá en breve.`);
      })
      .catch(() => {
        addBotMessage(`✓ Datos recibidos. Nos pondremos en contacto al ${contacto}.`);
      });
  }

  async function sendMessage(text) {
    if (!text || !text.trim()) return;
    addUserMessage(text.trim());
    inputEl.value = '';
    showTyping();

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          pregunta: text.trim(),
          historial: history.slice(-6)
        })
      });

      hideTyping();

      if (res.ok) {
        const data = await res.json();
        addBotMessage(data.respuesta, data.sugerencias, data.esLeadPotencial);
      } else {
        const err = await res.json();
        addBotMessage(err.error || 'Disculpa, no pude procesar tu consulta en este momento.');
      }
    } catch (err) {
      hideTyping();
      addBotMessage('No se pudo conectar con el servidor de chat. Revisa tu conexión a internet.');
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputEl.value.trim();
    if (val) sendMessage(val);
  });

  loadBusiness();
})();
