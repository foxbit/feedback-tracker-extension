// Elementos da interface
const captureButton = document.getElementById("capture");
const sendButton = document.getElementById("send");
const feedbackInput = document.getElementById("feedback");
const selectedElementDiv = document.getElementById("selectedElement");
const statusMessageDiv = document.getElementById("statusMessage");

// Função para mostrar mensagens de status
function showStatus(message, isError = false) {
    console.log(`Status: ${message} (${isError ? 'erro' : 'sucesso'})`);
    statusMessageDiv.textContent = message;
    statusMessageDiv.className = `status-message ${isError ? 'error' : 'success'}`;
    statusMessageDiv.style.display = 'block';
    
    setTimeout(() => {
        statusMessageDiv.style.display = 'none';
    }, 3000);
}

captureButton.addEventListener("click", () => {
    console.log("Botão de captura clicado");
    captureButton.disabled = true;
    captureButton.classList.add('loading');
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            console.error("Nenhuma aba ativa encontrada");
            showStatus("Erro: Nenhuma aba ativa encontrada", true);
            captureButton.disabled = false;
            captureButton.classList.remove('loading');
            return;
        }

        console.log("Tab atual:", tabs[0].url);
        
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => true
        }, () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startCapture" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log("Injetando content script...");
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        files: ["content.js"]
                    }, () => {
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, { action: "startCapture" });
                        }, 100);
                    });
                }
                captureButton.disabled = false;
                captureButton.classList.remove('loading');
            });
        });
    });
});

sendButton.addEventListener("click", async () => {
    console.log("Botão de enviar clicado");
    const feedback = feedbackInput.value.trim();
    
    if (!feedback) {
        showStatus("Por favor, digite um feedback antes de enviar.", true);
        return;
    }
    
    sendButton.disabled = true;
    sendButton.classList.add('loading');
    
    try {
        const data = await new Promise((resolve) => {
            chrome.storage.local.get(["selectedElement"], (data) => {
                console.log("Elemento selecionado:", data.selectedElement);
                
                if (!data.selectedElement) {
                    resolve({ error: "Por favor, selecione um elemento primeiro." });
                    return;
                }
                
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (!tabs[0]) {
                        resolve({ error: "Nenhuma aba ativa encontrada" });
                        return;
                    }
                    
                    console.log("Enviando feedback para URL:", tabs[0].url);
                    
                    chrome.runtime.sendMessage({
                        action: "sendFeedback",
                        element: data.selectedElement,
                        feedback: feedback,
                        url: tabs[0].url // Adicionando a URL diretamente na mensagem
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Erro ao enviar mensagem:", chrome.runtime.lastError);
                            resolve({ error: chrome.runtime.lastError.message });
                            return;
                        }
                        resolve(response);
                    });
                });
            });
        });
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.success) {
            showStatus("Feedback enviado com sucesso!");
            feedbackInput.value = "";
            chrome.storage.local.remove(["selectedElement"]);
            selectedElementDiv.style.display = 'none';
        } else {
            throw new Error("Erro ao enviar feedback. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro durante o envio:", error);
        showStatus(error.message, true);
    } finally {
        sendButton.disabled = false;
        sendButton.classList.remove('loading');
    }
});