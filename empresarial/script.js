const N8N_WEBHOOK_URL = "";

const form = document.querySelector("#lead-form");
const statusNode = document.querySelector("#form-status");
const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const params = new URLSearchParams(window.location.search);

utmFields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    if (input) input.value = params.get(field) || "";
});

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        if (!N8N_WEBHOOK_URL) {
            statusNode.textContent = "Formulario preparado, mas a URL publica do webhook do n8n ainda nao foi configurada.";
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const payload = Object.fromEntries(new FormData(form).entries());

        button.disabled = true;
        button.textContent = "Enviando...";
        statusNode.textContent = "";

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    page: window.location.href,
                    submittedAt: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error(`Webhook respondeu ${response.status}`);

            form.reset();
            utmFields.forEach((field) => {
                const input = document.querySelector(`#${field}`);
                if (input) input.value = params.get(field) || "";
            });
            statusNode.textContent = "Dados enviados com sucesso.";
        } catch (error) {
            console.error(error);
            statusNode.textContent = "Nao foi possivel enviar agora. Use o WhatsApp como canal principal.";
        } finally {
            button.disabled = false;
            button.textContent = "Enviar dados";
        }
    });
}
