// ===============================
// APS DEVELOPER - cerebro.js FIX
// Copiar y pegar completo
// ===============================

// ⚠️ Tu método de dividir clave NO protege realmente.
// Solo oculta visualmente. Ideal: backend/proxy.
const P1 = "gsk_";
const P2 = "RAHceE1v5YPoKgCRn0OxWGdyb3FYjFFr7SjQi7oBUVK0fFVd1qMZ";
const API_KEY = P1 + P2;

// MODELOS ACTUALES
const MODEL_TEXT = "llama-3.1-8b-instant";
const MODEL_VISION = "llama-3.2-11b-vision-preview";

// ===============================
// CHAT TEXTO
// ===============================
async function ejecutarIA() {
    const input = document.getElementById("user-input");
    const mensaje = input.value.trim();

    if (!mensaje) return;

    mostrarMensaje(mensaje, "usuario");
    input.value = "";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_TEXT,
                temperature: 0.7,
                messages: [
                    {
                        role: "system",
                        content: "Eres APS Developer, experto en Apple, hardware, soporte técnico y ventas."
                    },
                    {
                        role: "user",
                        content: mensaje
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            throw new Error(data?.error?.message || "Error API");
        }

        const respuesta = data.choices?.[0]?.message?.content || "Sin respuesta.";
        mostrarMensaje(respuesta, "ia");

    } catch (error) {
        console.error("Error real:", error);
        mostrarMensaje("No pude responder en este momento. Reintenta en unos segundos.", "ia");
    }
}

// ===============================
// ANALISIS DE IMAGEN
// ===============================
async function analizarImagen(archivo) {

    mostrarMensaje("Analizando imagen...", "ia");

    const reader = new FileReader();

    reader.readAsDataURL(archivo);

    reader.onload = async () => {

        const base64 = reader.result;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_VISION,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: "Analiza esta imagen. Si es un iPhone o hardware, indica estado, daños visibles y recomendación."
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: base64
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(data);
                throw new Error(data?.error?.message || "Error visión");
            }

            const respuesta = data.choices?.[0]?.message?.content || "No pude analizar la imagen.";
            mostrarMensaje(respuesta, "ia");

        } catch (error) {
            console.error("Error imagen:", error);
            mostrarMensaje("No pude analizar la imagen ahora mismo.", "ia");
        }
    };
}

// ===============================
// MOSTRAR MENSAJES
// ===============================
function mostrarMensaje(contenido, remitente, esImagen = false) {

    const chat = document.getElementById("chat-container");
    const div = document.createElement("div");

    div.className = remitente === "usuario"
        ? "mensaje-usuario"
        : "mensaje-ia";

    if (esImagen) {
        const img = document.createElement("img");
        img.src = contenido;
        img.style.maxWidth = "220px";
        img.style.borderRadius = "12px";
        div.appendChild(img);
    } else {
        div.innerText = contenido;
    }

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// ===============================
// BOTON IMAGEN
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    const btnImagen = document.getElementById("btn-imagen");

    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";

    if (btnImagen) {
        btnImagen.addEventListener("click", () => {
            inputFile.click();
        });
    }

    inputFile.addEventListener("change", (e) => {

        const archivo = e.target.files[0];

        if (!archivo) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            mostrarMensaje(evt.target.result, "usuario", true);
            analizarImagen(archivo);
        };

        reader.readAsDataURL(archivo);
    });
});
