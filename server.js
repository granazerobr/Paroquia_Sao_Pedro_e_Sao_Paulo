const express = require('express');
const cors = require('cors');
const path = require('path');
const { isSpam, sendContactEmail, ALLOWED_ORIGINS } = require('./lib/contactMailer');

const app = express();

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota para receber formulário
app.post('/api/contact', async (req, res) => {
    try {
        const { nome, email, telefone, assunto, mensagem, website, elapsed } = req.body;

        // Validar dados
        if (!nome || !email || !assunto || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios faltando'
            });
        }

        // Bot detectado: finge sucesso para não revelar o bloqueio
        if (isSpam({ website, elapsed })) {
            return res.json({ success: true });
        }

        await sendContactEmail({ nome, email, telefone, assunto, mensagem });

        res.json({
            success: true,
            message: 'Mensagem enviada com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao enviar mensagem. Tente novamente.'
        });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
