document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // URL do webhook do Make.com
    const webhookUrl = "https://hook.us2.make.com/a3vuminl246b9dq22fsvork3zlbpt9d1";

    /**
     * Adiciona uma nova mensagem ao chat.
     */
    const addMessage = (text, sender) => {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.textContent = text;

        if (sender === 'user') {
            messageBubble.classList.add('message-user');
        } else if (sender === 'agent') {
            messageBubble.classList.add('message-agent');
        } else if (sender === 'system') {
            messageBubble.classList.add('message-system');
        }

        chatMessages.appendChild(messageBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    /**
     * Indicador de digitação
     */
    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.classList.add('message-bubble', 'typing-indicator');
        indicator.textContent = 'Digitando...';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    };

    /**
     * Função corrigida para enviar mensagem ao webhook e interpretar JSON
     */
    const sendMessage = async () => {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        showTypingIndicator();

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText })
            });

            const contentType = response.headers.get("content-type");
            let data;

            // Se vier JSON, converte. Se vier texto, tenta converter e fallback como texto.
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { response: text };
                }
            }

            // Exibe a resposta final
            addMessage(
                data.response ||
                data.reply ||
                "Desculpe, não consegui interpretar a resposta do servidor.",
                "agent"
            );

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            addMessage("Ocorreu um erro ao se comunicar com o assistente. Por favor, tente novamente.", "system");
        } finally {
            removeTypingIndicator();
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    };

    // Enviar pelo botão
    sendButton.addEventListener('click', sendMessage);

    // Enviar pelo Enter
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });

    // Mensagem inicial
    addMessage(
    "Olá! 👋 Sou o Assistente Estudar+. Vamos começar?\n\n" +
    "Qual programa você tem interesse em seguir?\n" +
    "1) Graduação\n" +
    "2) Pós-graduação\n" +
    "3) Summer Program",
    "agent"
);
