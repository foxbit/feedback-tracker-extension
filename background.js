const AIRTABLE_ACCESS_TOKEN = "patx1SJ9p9OJbInHO.8f1b579dbd8b7b2445a7ba193f6aef1fcb36e11ad0e0da36eed60edebdd63fa1";
const AIRTABLE_BASE_ID = "appuXzTJFuxvHHMPs";
const TABLE_NAME = "Feedbacks";

// Adicione um event listener para processar mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendFeedback") {
        console.log("Mensagem recebida no background:", message);
        
        // Usar a URL fornecida na mensagem ou tentar obter da aba atual
        const url = message.url || (sender.tab ? sender.tab.url : "URL não disponível");
        console.log("URL a ser usada:", url);
        
        const feedbackData = {
            records: [
                {
                    fields: {
                        "Elemento": message.element,
                        "Feedback": message.feedback,
                        "URL": url,
                        "Data": new Date().toISOString()
                    }
                }
            ]
        };

        console.log("Dados a serem enviados para o Airtable:", feedbackData);
        
        fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AIRTABLE_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(feedbackData)
        })
        .then(async response => {
            const responseText = await response.text();
            console.log("Resposta do Airtable:", responseText);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
            }
            
            try {
                return JSON.parse(responseText);
            } catch (e) {
                console.error("Erro ao fazer parse da resposta:", e);
                throw new Error("Resposta inválida do Airtable");
            }
        })
        .then(data => {
            console.log("Feedback enviado com sucesso para o Airtable:", data);
            sendResponse({success: true, data});
        })
        .catch(error => {
            console.error("Erro ao enviar para o Airtable:", error);
            sendResponse({success: false, error: error.message});
        });
        
        return true; // Indica que a resposta será enviada de forma assíncrona
    }
});