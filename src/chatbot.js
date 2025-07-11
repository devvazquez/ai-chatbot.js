class AIChatbot extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.messages = [];
      this.loading = false;
      this.sessionId = this.generateSessionId();
      this._justOpened = false; // Nueva bandera para controlar la animación
    }
  
    generateSessionId() {
      return 'sess-' + Math.random().toString(36).substr(2, 10);
    }
  
    static get observedAttributes() {
      return ['title', 'webhook', 'first-messages'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      // Solo actualiza si el valor realmente cambió
      if (oldValue === newValue) return;
      if (name === 'title') this.title = newValue;
      if (name === 'webhook') this.webhook = newValue;
      if (name === 'first-messages') this.firstMessages = newValue;
      this.render();
    }
  
    connectedCallback() {
      this.title = this.getAttribute('title') || 'AI Asistente';
      this.webhook = this.getAttribute('webhook') || '';
      this.firstMessages = this.getAttribute('first-messages') || '';
      this.messages = [];
      this.sessionId = this.generateSessionId();
      if (this.firstMessages) {
        this.firstMessages.split('|').forEach(msg => {
          this.messages.push({ from: 'bot', text: msg.trim() });
        });
      }
      this.render();
    }
  
    newConversation() {
      this.sessionId = this.generateSessionId();
      this.messages = [];
      if (this.firstMessages) {
        this.firstMessages.split('|').forEach(msg => {
          this.messages.push({ from: 'bot', text: msg.trim() });
        });
      }
      this.render();
    }
  
    toggleChat() {
      const wasClosed = !this.isOpen;
      this.isOpen = !this.isOpen;
      // Solo activar animación si se está abriendo
      if (this.isOpen && wasClosed) this._justOpened = true;
      this.render();
      if (this.isOpen) {
        setTimeout(() => {
          const msgList = this.shadowRoot.querySelector('.chatbot-messages');
          if (msgList) msgList.scrollTop = msgList.scrollHeight;
        }, 100);
      }
    }
  
    async sendMessage(e) {
      e.preventDefault();
      const input = this.shadowRoot.querySelector('.chatbot-input');
      const text = input.value.trim();
      if (!text) return;
      this.messages.push({ from: 'user', text });
      this.loading = false; 
      this.render();
      input.value = '';
      try {
        const res = await fetch(this.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            action: 'sendMessage',
            chatInput: text
          })
        });
        let data = await res.json();
        let botMsg = data.reply || data.message || data.output || JSON.stringify(data);
        this.messages.push({ from: 'bot', text: botMsg });
      } catch (err) {
        console.error('Error al enviar el mensaje:', err);
        this.messages.push({ from: 'bot', text: 'Error de conexión.' });
      }
      this.loading = false;
      this.render();
      setTimeout(() => {
        const msgList = this.shadowRoot.querySelector('.chatbot-messages');
        if (msgList) msgList.scrollTop = msgList.scrollHeight;
      }, 100);
    }
  
    render() {
      const style = `
        :host {
          --main-bg: rgba(24, 28, 38, 0.85);
          --main-blur: 18px;
          --main-border: rgba(60, 130, 255, 0.18);
          --main-shadow: 0 8px 32px rgba(30, 60, 120, 0.25);
          --bubble-gradient: linear-gradient(135deg, #3a8bfd 0%, #1e2746 100%);
          --bubble-shadow: 0 4px 24px rgba(58,139,253,0.25);
          --bot-msg-bg: rgba(60,130,255,0.12);
          --user-msg-bg: linear-gradient(135deg, #3a8bfd 0%, #1e2746 100%);
          --input-bg: rgba(30, 36, 54, 0.95);
          --input-border: #3a8bfd;
          --header-bg: linear-gradient(90deg, #1e2746 0%, #3a8bfd 100%);
          --header-shadow: 0 2px 12px rgba(30,60,120,0.18);
          --scrollbar-bg: #23283a;
          --scrollbar-thumb: #3a8bfd;
        }
        .chatbot-overlay {
          display: ${this.isOpen ? 'block' : 'none'};
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10,16,32,0.45);
          z-index: 9998;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .chatbot-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          background: var(--bubble-gradient);
          border-radius: 50%;
          width: 64px;
          height: 64px;
          box-shadow: var(--bubble-shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          border: 2.5px solid var(--main-border);
          ${this.isOpen ? 'box-shadow: 0 12px 36px #3a8bfd44; transform: scale(1.08) rotate(-6deg); pointer-events: none;' : ''}
        }
        .chatbot-bubble:hover {
          box-shadow: 0 16px 48px #3a8bfd55;
          transform: scale(1.12) rotate(-8deg);
        }
        .chatbot-bubble svg {
          filter: drop-shadow(0 2px 6px #3a8bfd44);
        }
        .chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 370px;
          max-width: 98vw;
          height: 520px;
          background: var(--main-bg);
          border-radius: 22px;
          box-shadow: var(--main-shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 10000;
          border: 1.5px solid var(--main-border);
          backdrop-filter: blur(var(--main-blur));
        }
        .chatbot-window.pop {
          animation: chatbot-pop 0.2s;
        }
        @keyframes chatbot-pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .chatbot-header {
          background: var(--header-bg);
          color: #fff;
          padding: 18px 20px;
          font-size: 1.13em;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--header-shadow);
        }
        .chatbot-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.3em;
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 8px;
          transition: background 0.18s;
          padding: 2px 6px;
        }
        .chatbot-close:hover {
          background: #3a8bfd33;
        }
        .chatbot-close svg {
          width: 1.7em;
          height: 1.7em;
          display: block;
        }
        .chatbot-header-btn {
          background: #3a8bfd22;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 5px 12px;
          margin-left: 10px;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.18s;
        }
        .chatbot-header-btn:hover {
          background: #3a8bfd55;
        }
        .chatbot-messages {
          flex: 1;
          padding: 20px 16px 16px 16px;
          overflow-y: auto;
          background: transparent;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-bg);
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 7px;
          background: var(--scrollbar-bg);
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 6px;
        }
        .chatbot-msg {
          max-width: 82%;
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 1.04em;
          line-height: 1.5;
          word-break: break-word;
          box-shadow: 0 2px 12px #0002;
          position: relative;
          margin-bottom: 2px;
        }
        .chatbot-msg.bot {
          background: var(--bot-msg-bg);
          color: #b6d0ff;
          align-self: flex-start;
          border-bottom-left-radius: 6px;
        }
        .chatbot-msg.user {
          background: var(--user-msg-bg);
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 6px;
        }
        .chatbot-input-area {
          display: flex;
          padding: 16px 14px 14px 14px;
          background: transparent;
          border-top: 1.5px solid var(--main-border);
        }
        .chatbot-input {
          flex: 1;
          border: 1.5px solid var(--input-border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 1.05em;
          background: var(--input-bg);
          color: #eaf2ff;
          outline: none;
          transition: border 0.18s, box-shadow 0.18s;
        }
        .chatbot-input:focus {
          border: 1.5px solid #6cb8ff;
          box-shadow: 0 0 0 2px #3a8bfd33;
        }
        .chatbot-send {
          background: linear-gradient(135deg, #3a8bfd 0%, #1e2746 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          margin-left: 10px;
          padding: 0 22px;
          font-size: 1.05em;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s;
          box-shadow: 0 2px 8px #3a8bfd33;
        }
        .chatbot-send:disabled {
          background: #3a8bfd55;
          cursor: not-allowed;
        }
        .chatbot-loader {
          text-align: center;
          margin: 12px 0 0 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 32px;
        }
        .chatbot-thinking {
          display: inline-block;
          width: 48px;
          height: 18px;
        }
        .chatbot-thinking span {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin: 0 3px;
          background: #3a8bfd;
          border-radius: 50%;
          opacity: 0.5;
          animation: thinking-bounce 1.1s infinite;
        }
        .chatbot-thinking span:nth-child(2) { animation-delay: 0.22s; }
        .chatbot-thinking span:nth-child(3) { animation-delay: 0.44s; }
        @keyframes thinking-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `;
      this.shadowRoot.innerHTML = `
        <style>${style}</style>
        <div>
          <div class="chatbot-overlay"></div>
          <div class="chatbot-bubble" title="Abrir chat" tabindex="0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d7ff9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
          </div>
          ${this.isOpen ? `
            <div class="chatbot-window${this._justOpened ? ' pop' : ''}">
              <div class="chatbot-header">
                <span>${this.title}</span>
                <div>
                  <button class="chatbot-header-btn" title="Nueva conversación">⟳</button>
                  <button class="chatbot-close" title="Cerrar">
                    <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </button>
                </div>
              </div>
              <div class="chatbot-messages">
                ${this.messages.map(m => `<div class="chatbot-msg ${m.from}">${m.text}</div>`).join('')}
                ${this.loading ? `<div class="chatbot-loader"><span class="chatbot-thinking"><span></span><span></span><span></span></span></div>` : ''}
              </div>
              <form class="chatbot-input-area">
                <input class="chatbot-input" type="text" placeholder="Escribe tu mensaje..." autocomplete="off" ${this.loading ? 'disabled' : ''} />
                <button class="chatbot-send" type="submit" ${this.loading ? 'disabled' : ''}>Enviar</button>
              </form>
            </div>
          ` : ''}
        </div>
      `;
      // Eventos
      const bubble = this.shadowRoot.querySelector('.chatbot-bubble');
      if (bubble) bubble.onclick = () => this.toggleChat();
      const close = this.shadowRoot.querySelector('.chatbot-close');
      if (close) close.onclick = () => this.toggleChat();
      const form = this.shadowRoot.querySelector('form');
      if (form) form.onsubmit = (e) => this.sendMessage(e);
      const newConv = this.shadowRoot.querySelector('.chatbot-header-btn');
      if (newConv) newConv.onclick = () => this.newConversation();
      // Overlay click para cerrar
      const overlay = this.shadowRoot.querySelector('.chatbot-overlay');
      if (overlay) overlay.onclick = () => { if (this.isOpen) this.toggleChat(); };
      // Resetear bandera de animación
      this._justOpened = false;
    }
  }
  
  customElements.define('ai-chatbot', AIChatbot); 