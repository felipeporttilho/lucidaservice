// Variáveis globais
const conversationId = "14241f6bc4";
const FIREBASE_URL = 'https://us-central1-lucidaservice-bd03c.cloudfunctions.net/chatWithLucida';

/**
 * 
 * @param {string} message Mensagem do input do usuario
 * @returns Retorna um objeto contendo answer com a resposta da Lucida :)
 */
async function sendMessage(message) {
    try {
        const response = await fetch('https://us-central1-lucidaservice-bd03c.cloudfunctions.net/chatWithLucida', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
    
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
    
        const data = await response.json();
        console.log('Resposta da API:', data);
        if (data) {
            return data;
        }
        return null;
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
        console.log("message antes de chamar o sendMessage", message);
        
        const response = await sendMessage(message);
        console.log("response no front", response);

        // Remover indicador de digitação
        removeTypingIndicator();

        // Adicionar resposta do bot
        if (response && response.answer) {
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