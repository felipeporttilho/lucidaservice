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
            // Validar método
            if (req.method !== 'POST') {
                return res.status(405).json({
                    error: 'Método não permitido',
                    details: 'Apenas POST é aceito'
                });
            }

            // Validar token
            const abacusToken = functions.config().abacus.api_token;
            if (!abacusToken) {
                console.error('Token do Abacus não configurado');
                return res.status(500).json({
                    error: 'Erro de configuração',
                    details: 'Token não configurado'
                });
            }

            // Validar mensagem
            const { message, conversation_id } = req.body;
            if (!message) {
                return res.status(400).json({
                    error: 'Mensagem inválida',
                    details: 'A mensagem é obrigatória'
                });
            }

            // Configurar request para o Abacus
            const abacusUrl = `${ABACUS_CONFIG.BASE_URL}/api/${ABACUS_CONFIG.API_VERSION}/deployment/predict`;
            const payload = {
                deployment_token: abacusToken,
                deployment_id: ABACUS_CONFIG.DEPLOYMENT_ID,
                prediction_input: {
                    question: message
                }
            };

            // Adicionar conversation_id se existir
            if (conversation_id) {
                payload.conversation_id = conversation_id;
            }

            try {
                // Fazer request para o Abacus
                const abacusResponse = await axios({
                    method: 'post',
                    url: abacusUrl,
                    data: payload,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 30000 // 30 segundos timeout
                });

                // Validar resposta
                if (!abacusResponse.data || !abacusResponse.data.prediction_output) {
                    throw new Error('Resposta inválida do Abacus');
                }

                // Retornar resposta formatada
                return res.json({
                    answer: abacusResponse.data.prediction_output.answer,
                    conversation_id: abacusResponse.data.conversation_id
                });

            } catch (abacusError) {
                console.error('Erro na chamada do Abacus:', {
                    status: abacusError.response?.status,
                    data: abacusError.response?.data,
                    message: abacusError.message
                });

                // Tratamento específico de erros do Abacus
                if (abacusError.response?.status === 401) {
                    return res.status(500).json({
                        error: 'Erro de autenticação',
                        details: 'Token do Abacus inválido'
                    });
                }

                if (abacusError.response?.status === 404) {
                    return res.status(500).json({
                        error: 'Deployment não encontrado',
                        details: 'Verifique o ID do deployment'
                    });
                }

                return res.status(500).json({
                    error: 'Erro na comunicação com Abacus',
                    details: abacusError.message
                });
            }

        } catch (error) {
            console.error('Erro geral:', error);
            return res.status(500).json({
                error: 'Erro interno',
                details: error.message
            });
        }
    });
});