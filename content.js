const OPENAI_API_KEY = CONFIG.OPENAI_API_KEY;
// 🔥 Replace your key carefully

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateReply(messageText) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { "role": "system", "content": "You are a helpful assistant that answers politely." },
                    { "role": "user", "content": messageText }
                ]
            })
        });

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            console.error("[AI Replier] API Error:", data.error || "Unknown error");
            return "Sorry, AI could not generate a reply.";
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("[AI Replier] Network/Error generating reply:", error);
        return "Sorry, something went wrong.";
    }
}


async function monitorMessages() {
    console.log("[AI Replier] Monitoring WhatsApp chat...");

    while (true) {
        const messages = document.querySelectorAll("div[data-testid='msg-container'] span[data-testid='conversation-turn-3']");
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
            const text = lastMessage.innerText;

            if (!lastMessage.dataset.responded) {
                console.log("[AI Replier] New Message Detected:", text);
                const aiReply = await generateReply(text);
                console.log("[AI Replier] AI Response:", aiReply);

                // Type and send the reply
                const inputBox = document.querySelector("div[data-testid='conversation-compose-box-input'] p");
                if (!inputBox) {
                    console.error("[AI Replier] Could not find input box");
                    continue;
                }

                const event = new InputEvent("input", { bubbles: true });
                inputBox.textContent = aiReply;
                inputBox.dispatchEvent(event);

                const sendButton = document.querySelector("button[data-testid='compose-btn-send']");
                if (sendButton) {
                    sendButton.click();
                } else {
                    console.error("[AI Replier] Could not find send button");
                }

                lastMessage.dataset.responded = "true"; // Mark as handled
            }
        }

        await sleep(3000); // Check every 3 seconds
    }
}

monitorMessages();
