// Variáveis globais
const conversationId = "14241f6bc4";
const FIREBASE_URL = 'https://us-central1-lucidaservice-bd03c.cloudfunctions.net/chatWithLucida';

// Função para enviar mensagem
async function sendMessage(message) {
    try {
        console.log('Enviando mensagem:', message);
        console.log('ID da conversa:', conversationId);
        const response = await fetch(FIREBASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
                message: message,
                conversation_id: conversationId
            })
        });

        console.log('Status da resposta:', response.status);

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${JSON.stringify(data)}`);
        }

        // Atualizar conversation_id se existir
        if (data.conversation_id) {
            conversationId = data.conversation_id;
        }

        return data;

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
}

// Função para adicionar mensagem ao chat
function addMessage(message, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função para mostrar indicador de digitação
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message bot-message typing';
    typingDiv.textContent = 'Digitando...';
    chatMessages.appendChild(typingDiv);
    return typingDiv;
}

// Função para remover indicador de digitação
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Função principal para lidar com o envio de mensagem
async function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const message = messageInput.value.trim();

    if (!message) return;

    try {
        // Desabilitar input e botão
        messageInput.disabled = true;
        sendButton.disabled = true;

        // Adicionar mensagem do usuário ao chat
        addMessage(message, true);

        // Limpar input
        messageInput.value = '';

        // Mostrar indicador de digitação
        showTypingIndicator();

        // Enviar mensagem e esperar resposta
        const response = await sendMessage(message);

        // Remover indicador de digitação
        removeTypingIndicator();

        // Adicionar resposta do bot
        if (response.answer) {
            addMessage(response.answer, false);
        }

    } catch (error) {
        console.error('Erro:', error);
        removeTypingIndicator();
        addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', false);
    } finally {
        // Reabilitar input e botão
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Adicionar event listener para o botão de enviar
document.getElementById('sendButton').addEventListener('click', handleSendMessage);

// Adicionar event listener para envio com Enter
document.getElementById('messageInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
});

// Função para verificar se os elementos existem
function checkElements() {
    const elements = ['messageInput', 'sendButton', 'chatMessages'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Elemento com ID '${id}' não encontrado!`);
        }
    });
}

// Executar verificação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', checkElements);