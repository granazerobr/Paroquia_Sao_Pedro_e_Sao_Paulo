const { isSpam, sendContactEmail, ALLOWED_ORIGINS } = require('../lib/contactMailer');

module.exports = async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Método não permitido' });
        return;
    }

    try {
        const { nome, email, telefone, assunto, mensagem, website, elapsed } = req.body;

        if (!nome || !email || !assunto || !mensagem) {
            res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' });
            return;
        }

        if (isSpam({ website, elapsed })) {
            res.status(200).json({ success: true });
            return;
        }

        await sendContactEmail({ nome, email, telefone, assunto, mensagem });

        res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar mensagem. Tente novamente.' });
    }
};
