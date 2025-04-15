const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');

// Configurações do Abacus
const ABACUS_CONFIG = {
    BASE_URL: 'https://api.abacus.ai',
    DEPLOYMENT_ID: '14241f6bc4',  // seu deployment ID
    API_VERSION: 'v0'
};

exports.chatWithLucida = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        try {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Método não permitido', details: 'Apenas POST é aceito' });
            }

            // const abacusToken = functions.config().abacus.api_token;
            const abacusToken = "89a0671ce5904784a08129f771c9d0e0";
            console.log("abacus token", abacusToken);
            if (!abacusToken) {
                return res.status(500).json({ error: 'Erro de configuração', details: 'Token não configurado' });
            }

            const { message, conversation_id } = req.body;
            if (!message) {
                return res.status(400).json({ error: 'Mensagem inválida', details: 'A mensagem é obrigatória' });
            }

            const abacusUrl = `https://apps.abacus.ai/api/getChatResponse?deploymentToken=${abacusToken}&deploymentId=${ABACUS_CONFIG.DEPLOYMENT_ID}`;
            console.log("abacus url", abacusUrl);            

            const payload = {
                messages: [
                    { is_user: true, text: message }
                ]
            };
            const stringifiedPayload = JSON.stringify(payload);
            console.log("payload", stringifiedPayload);

            const abacusResponse = await axios.post(abacusUrl, stringifiedPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            });
            console.log("resposta da abacus:", abacusResponse)

            if (!abacusResponse.data || !abacusResponse.data.response) {
                throw new Error('Resposta inválida da Abacus');
            }

            return res.json({
                answer: abacusResponse.data.response,
                conversation_id: abacusResponse.data.conversation_id
            });

        } catch (error) {
            console.error('Erro geral:', error.response?.data || error.message);
            return res.status(500).json({
                error: 'Erro na comunicação com Abacus',
                details: error.response?.data || error.message
            });
        }
    });
});
