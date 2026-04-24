const N8N_WEBHOOK_URL = "";

const header = document.querySelector(".site-header");
const form = document.querySelector("#lead-form");
const statusNode = document.querySelector("#form-status");
const utmFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
});

const params = new URLSearchParams(window.location.search);
utmFields.forEach((field) => {
  const input = document.querySelector(`#${field}`);
  if (input) {
    input.value = params.get(field) || "";
  }
});

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    if (!N8N_WEBHOOK_URL) {
      statusNode.textContent = "Formulario preparado, mas falta configurar a URL publica do webhook do n8n em script.js.";
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    statusNode.textContent = "";

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          page: window.location.href,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook respondeu ${response.status}`);
      }

      form.reset();
      utmFields.forEach((field) => {
        const input = document.querySelector(`#${field}`);
        if (input) {
          input.value = params.get(field) || "";
        }
      });
      statusNode.textContent = "Dados enviados. A equipe pode seguir o atendimento a partir do webhook configurado.";
    } catch (error) {
      console.error(error);
      statusNode.textContent = "Nao foi possivel enviar agora. Use o WhatsApp como contato principal.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar dados";
    }
  });
}
