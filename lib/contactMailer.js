const nodemailer = require('nodemailer');

const CONTACT_EMAIL = 'testes.site.empresa@gmail.com';

const ALLOWED_ORIGINS = [
    'https://paroquia-sao-pedro-e-sao-paulo.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500'
];

const MIN_FILL_TIME_MS = 3000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: CONTACT_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// honeypot preenchido ou envio rápido demais para ter sido digitado por uma pessoa
function isSpam({ website, elapsed }) {
    if (website) return true;
    if (typeof elapsed === 'number' && elapsed < MIN_FILL_TIME_MS) return true;
    return false;
}

async function sendContactEmail({ nome, email, telefone, assunto, mensagem }) {
    await transporter.sendMail({
        from: CONTACT_EMAIL,
        to: CONTACT_EMAIL,
        subject: `Novo contato - ${assunto}`,
        html: `
            <h2>Nova Mensagem de Contato</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
            <p><strong>Assunto:</strong> ${assunto}</p>
            <hr>
            <p><strong>Mensagem:</strong></p>
            <p>${mensagem.replace(/\n/g, '<br>')}</p>
        `
    });

    await transporter.sendMail({
        from: CONTACT_EMAIL,
        to: email,
        subject: 'Paróquia São Pedro e São Paulo - Mensagem Recebida',
        html: `
            <h2>Obrigado por sua mensagem!</h2>
            <p>Olá ${nome},</p>
            <p>Recebemos sua mensagem e entraremos em contato em breve.</p>
            <hr>
            <p><strong>Resumo da sua mensagem:</strong></p>
            <p><strong>Assunto:</strong> ${assunto}</p>
            <p><strong>Mensagem:</strong> ${mensagem.substring(0, 100)}...</p>
            <hr>
            <p>Paróquia São Pedro e São Paulo</p>
        `
    });
}

module.exports = { isSpam, sendContactEmail, ALLOWED_ORIGINS, CONTACT_EMAIL };
