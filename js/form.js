// ===== FORM VALIDATION =====
document.addEventListener('DOMContentLoaded', function() {
    const formLoadedAt = Date.now();
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const websiteInput = document.getElementById('website');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const assuntoInput = document.getElementById('assunto');
    const mensagemInput = document.getElementById('mensagem');
    const privacyCheckbox = document.getElementById('privacy');

    // Regex para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Máscara de telefone (fixo com 8 dígitos ou celular com 9 dígitos)
    function phoneMask(value) {
        const digits = value.replace(/\D/g, '').slice(0, 11);

        if (digits.length <= 2) {
            return digits.replace(/(\d{0,2})/, '($1');
        }
        if (digits.length <= 6) {
            return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        }
        if (digits.length <= 10) {
            return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        }
        return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }

    // Aplicar máscara de telefone ao digitar
    telefoneInput.addEventListener('input', function() {
        this.value = phoneMask(this.value);
        validateForm();
    });

    // Validação em tempo real para cada campo
    nomeInput.addEventListener('input', validateForm);
    emailInput.addEventListener('input', validateForm);
    assuntoInput.addEventListener('change', validateForm);
    mensagemInput.addEventListener('input', validateForm);
    privacyCheckbox.addEventListener('change', validateForm);

    // Função de validação
    function validateForm() {
        const isNomeValid = nomeInput.value.trim().length > 0;
        const isEmailValid = emailRegex.test(emailInput.value.trim());
        const isAssuntoValid = assuntoInput.value !== '';
        const isMensagemValid = mensagemInput.value.trim().length >= 10;
        const isPrivacyChecked = privacyCheckbox.checked;

        const isFormValid = isNomeValid && isEmailValid && isAssuntoValid && isMensagemValid && isPrivacyChecked;

        // Ativar/desativar botão
        submitBtn.disabled = !isFormValid;

        // Feedback visual
        updateFieldStyle(nomeInput, isNomeValid || nomeInput.value === '');
        updateFieldStyle(emailInput, isEmailValid || emailInput.value === '');
        updateFieldStyle(assuntoInput, isAssuntoValid);
        updateFieldStyle(mensagemInput, isMensagemValid || mensagemInput.value === '');
    }

    // Aplicar estilo visual aos campos
    function updateFieldStyle(field, isValid) {
        if (field.value === '' && field !== privacyCheckbox) {
            field.style.borderColor = '#ddd';
            return;
        }

        if (field === privacyCheckbox) return;

        if (isValid) {
            field.style.borderColor = '#FFD700';
            field.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.3)';
        } else {
            field.style.borderColor = '#e74c3c';
            field.style.boxShadow = '0 0 5px rgba(231, 76, 60, 0.3)';
        }
    }

    // Submit do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validação final
        if (!validateFormBeforeSubmit()) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        // Dados do formulário
        const formData = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            telefone: telefoneInput.value.trim(),
            assunto: assuntoInput.value,
            mensagem: mensagemInput.value.trim(),
            website: websiteInput.value,
            elapsed: Date.now() - formLoadedAt
        };

        // Desabilitar botão durante envio
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        try {
            // Enviar para o servidor
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Mensagem de sucesso
                alert('Obrigado! Sua mensagem foi enviada com sucesso. Em breve entraremos em contato!');

                // Limpar formulário
                form.reset();
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviar Mensagem';

                // Limpar estilos
                nomeInput.style.borderColor = '#ddd';
                emailInput.style.borderColor = '#ddd';
                assuntoInput.style.borderColor = '#ddd';
                mensagemInput.style.borderColor = '#ddd';
                nomeInput.style.boxShadow = '';
                emailInput.style.boxShadow = '';
                assuntoInput.style.boxShadow = '';
                mensagemInput.style.boxShadow = '';
            } else {
                alert('Erro: ' + result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensagem';
            }
        } catch (error) {
            console.error('Erro ao enviar:', error);
            alert('Erro ao enviar mensagem. Tente novamente.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Mensagem';
        }
    });

    // Validação completa antes de submit
    function validateFormBeforeSubmit() {
        return (
            nomeInput.value.trim().length > 0 &&
            emailRegex.test(emailInput.value.trim()) &&
            assuntoInput.value !== '' &&
            mensagemInput.value.trim().length >= 10 &&
            privacyCheckbox.checked
        );
    }

    // Inicializar validação
    validateForm();
});