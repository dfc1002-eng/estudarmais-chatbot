document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Configure a URL do seu webhook aqui
    const webhookUrl = "https://hook.make.com/SEU_WEBHOOK_AQUI"; 

    /**
     * Adiciona uma nova mensagem ao chat.
     * @param {string} text - O texto da mensagem.
     * @param {'user' | 'agent' | 'system'} sender - O remetente da mensagem.
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
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rola para a última mensagem
    };

    /**
     * Exibe o indicador de digitação do assistente.
     */
    const showTypingIndicator = () => {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message-bubble', 'typing-indicator');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.textContent = 'Digitando...';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    /**
     * Remove o indicador de digitação do assistente.
     */
    const removeTypingIndicator = () => {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    };

    /**
     * Envia a mensagem do usuário para o webhook e exibe a resposta do assistente.
     */
    const sendMessage = async () => {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        userInput.value = '';
        sendButton.disabled = true; // Desabilita o botão enquanto aguarda a resposta
        userInput.disabled = true; // Desabilita o input

        showTypingIndicator();

        try {
            if (webhookUrl === 'https://hook.us2.make.com/a3vuminl246b9dq22fsvork3zlbpt9d1' || !webhookUrl) {
                addMessage("Por favor, configure a URL do webhook no arquivo script.js para que o chatbot possa funcionar.", "system");
                return;
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                addMessage(`Erro do assistente: ${errorData.message || response.statusText}`, 'system');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.reply || "Desculpe, não consegui obter uma resposta do assistente.", 'agent');

        } catch (error) {
            console.error('Erro ao enviar mensagem para o assistente:', error);
            addMessage("Ocorreu um erro ao se comunicar com o assistente. Por favor, tente novamente.", 'system');
        } finally {
            removeTypingIndicator();
            sendButton.disabled = false; // Habilita o botão novamente
            userInput.disabled = false; // Habilita o input
            userInput.focus(); // Foca no input para facilitar a próxima mensagem
        }
    };

    // Event listener para o botão de enviar
    sendButton.addEventListener('click', sendMessage);

    // Event listener para a tecla Enter no campo de input
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });

    // Mensagem de boas-vindas inicial do assistente
    addMessage("Olá! Sou o Assistente Estudar+. Como posso ajudar você hoje?", "agent");
});
