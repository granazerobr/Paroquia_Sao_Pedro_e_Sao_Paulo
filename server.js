const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configurar transporter de email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testes.site.empresa@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Use variável de ambiente para senha
    }
});

// Rota para receber formulário
app.post('/api/contact', async (req, res) => {
    try {
        const { nome, email, telefone, assunto, mensagem } = req.body;

        // Validar dados
        if (!nome || !email || !assunto || !mensagem) {
            return res.status(400).json({
                success: false,
                error: 'Campos obrigatórios faltando'
            });
        }

        // Preparar email
        const mailOptions = {
            from: 'testes.site.empresa@gmail.com',
            to: 'testes.site.empresa@gmail.com',
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
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        // Enviar confirmação para o usuário
        const confirmationMail = {
            from: 'testes.site.empresa@gmail.com',
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
        };

        await transporter.sendMail(confirmationMail);

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
