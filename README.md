# AI Chatbot

Un chatbot de IA personalizable como Web Component que se puede integrar fácilmente en cualquier sitio web.

## 🚀 Instalación

### Opción 1: CDN (Recomendado)

```html
<script src="https://cdn.jsdelivr.net/npm/ai-chatbot@1.0.0/dist/ai-chatbot.min.js"></script>
```

### Opción 2: NPM

```bash
npm install ai-chatbot
```

```html
<script src="node_modules/ai-chatbot/dist/ai-chatbot.min.js"></script>
```

## 📖 Uso

### Básico

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mi Sitio Web</title>
</head>
<body>
    <h1>Bienvenido a mi sitio</h1>
    
    <!-- Incluir el script del chatbot -->
    <script src="https://cdn.jsdelivr.net/npm/ai-chatbot@1.0.0/dist/ai-chatbot.min.js"></script>
    
    <!-- Usar el chatbot -->
    <ai-chatbot 
        title="Mi Asistente"
        webhook="https://tu-api.com/chat"
        first-messages="¡Hola! ¿En qué puedo ayudarte?|Estoy aquí para asistirte">
    </ai-chatbot>
</body>
</html>
```

### Configuración Avanzada

```html
<ai-chatbot 
    title="Asistente Virtual"
    webhook="https://api.openai.com/v1/chat/completions"
    first-messages="¡Hola! Soy tu asistente virtual|¿En qué puedo ayudarte hoy?|Estoy listo para responder tus preguntas">
</ai-chatbot>
```

## ⚙️ Atributos

| Atributo | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `title` | Título del chatbot | "AI Asistente" |
| `webhook` | URL del endpoint para procesar mensajes | "" |
| `first-messages` | Mensajes iniciales separados por `\|` | "" |

## 🔧 API del Webhook

El chatbot envía peticiones POST al webhook con el siguiente formato:

```json
{
  "sessionId": "sess-abc123def",
  "action": "sendMessage",
  "chatInput": "Mensaje del usuario"
}
```

### Respuesta esperada

```json
{
  "reply": "Respuesta del bot"
}
```

O alternativamente:

```json
{
  "message": "Respuesta del bot"
}
```

## 🎨 Personalización

El chatbot usa Shadow DOM, por lo que los estilos están encapsulados. Para personalizar, puedes modificar el código fuente o crear tu propia versión.

## 📝 Características

- ✅ Web Component estándar
- ✅ Diseño responsive
- ✅ Animaciones suaves
- ✅ Gestión de sesiones
- ✅ Mensajes iniciales configurables
- ✅ Botón de nueva conversación
- ✅ Indicador de carga
- ✅ Compatible con todos los navegadores modernos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas, por favor abre un issue en GitHub.