document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Configure a URL do seu webhook aqui
    const WEBHOOK_URL = 'SUA_URL_DO_WEBHOOK_AQUI'; 

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
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rola para a última mensagem
    };

    const showTypingIndicator = () => {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message-bubble', 'typing-indicator');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.textContent = 'Digitando...';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    };

    const sendMessage = async () => {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        userInput.value = '';
        sendButton.disabled = true; // Desabilita o botão enquanto aguarda a resposta
        userInput.disabled = true; // Desabilita o input

        showTypingIndicator();

        try {
            if (WEBHOOK_URL === 'SUA_URL_DO_WEBHOOK_AQUI' || !WEBHOOK_URL) {
                addMessage("Por favor, configure a URL do webhook no arquivo script.js para que o chatbot possa funcionar.", "system");
                return;
            }

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                addMessage(`Erro do agente: ${errorData.message || response.statusText}`, 'system');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.reply || "Desculpe, não consegui obter uma resposta do agente.", 'agent');

        } catch (error) {
            console.error('Erro ao enviar mensagem para o agente:', error);
            addMessage("Ocorreu um erro ao se comunicar com o agente. Por favor, tente novamente.", 'system');
        } finally {
            removeTypingIndicator();
            sendButton.disabled = false; // Habilita o botão novamente
            userInput.disabled = false; // Habilita o input
            userInput.focus(); // Foca no input para facilitar a próxima mensagem
        }
    };

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });

    // Mensagem de boas-vindas inicial
    addMessage("Olá! Como posso ajudar você hoje?", "agent");
});