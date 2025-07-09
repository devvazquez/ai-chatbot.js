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
        .chatbot-overlay {
          display: ${this.isOpen ? 'block' : 'none'};
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(30,40,60,0.18);
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
          background: #fff;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          ${this.isOpen ? 'box-shadow: 0 8px 32px rgba(45,127,249,0.25); transform: scale(1.08) rotate(-6deg); pointer-events: none;' : ''}
        }
        .chatbot-bubble:hover {
          box-shadow: 0 8px 32px rgba(45,127,249,0.25);
          transform: scale(1.08) rotate(-6deg);
        }
        .chatbot-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 340px;
          max-width: 95vw;
          height: 480px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 10000;
        }
        .chatbot-window.pop {
          animation: chatbot-pop 0.2s;
        }
        @keyframes chatbot-pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .chatbot-header {
          background: #2d7ff9;
          color: #fff;
          padding: 16px;
          font-size: 1.1em;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .chatbot-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.3em;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .chatbot-close svg {
          width: 1.5em;
          height: 1.5em;
          display: block;
        }
        .chatbot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f7f8fa;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chatbot-msg {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 1em;
          line-height: 1.4;
          word-break: break-word;
        }
        .chatbot-msg.bot {
          background: #e6f0ff;
          color: #1a2a3a;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .chatbot-msg.user {
          background: #2d7ff9;
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .chatbot-input-area {
          display: flex;
          padding: 12px;
          background: #fff;
          border-top: 1px solid #e0e0e0;
        }
        .chatbot-input {
          flex: 1;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 1em;
          outline: none;
        }
        .chatbot-send {
          background: #2d7ff9;
          color: #fff;
          border: none;
          border-radius: 8px;
          margin-left: 8px;
          padding: 0 18px;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chatbot-send:disabled {
          background: #b0c8f9;
          cursor: not-allowed;
        }
        .chatbot-loader {
          text-align: center;
          margin: 8px 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 24px;
        }
        .chatbot-thinking {
          display: inline-block;
          width: 40px;
          height: 16px;
        }
        .chatbot-thinking span {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background: #2d7ff9;
          border-radius: 50%;
          opacity: 0.5;
          animation: thinking-bounce 1s infinite;
        }
        .chatbot-thinking span:nth-child(2) { animation-delay: 0.2s; }
        .chatbot-thinking span:nth-child(3) { animation-delay: 0.4s; }
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