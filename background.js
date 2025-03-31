// Função para obter as configurações
async function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['airtableToken', 'airtableBase', 'imgbbKey'], (data) => {
            resolve({
                AIRTABLE_ACCESS_TOKEN: data.airtableToken,
                AIRTABLE_BASE_ID: data.airtableBase,
                IMGBB_API_KEY: data.imgbbKey
            });
        });
    });
}

// Função para verificar se as configurações existem
async function checkConfig() {
    const config = await getConfig();
    return config.AIRTABLE_ACCESS_TOKEN && config.AIRTABLE_BASE_ID && config.IMGBB_API_KEY;
}

// Constantes
const TABLE_NAME = "Feedbacks";
const USERS_TABLE_NAME = "Users";

// Função para buscar usuários do Airtable
async function fetchUsers() {
    try {
        const config = await getConfig();
        if (!await checkConfig()) {
            throw new Error('Configurações não encontradas. Por favor, configure as chaves de API nas opções da extensão.');
        }

        const response = await fetch(
            `https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${USERS_TABLE_NAME}?view=Grid%20view`,
            {
                headers: {
                    "Authorization": `Bearer ${config.AIRTABLE_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
        
        const data = await response.json();
        return data.records.map(record => ({
            id: record.id,
            name: record.fields.Name,
            displayName: record.fields.Name
        }));
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
}

// Função para capturar a tela inteira
async function captureFullScreen() {
    try {
        // Obter a aba ativa
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Capturar a tela usando a API do Chrome
        const imageData = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        return imageData;
    } catch (error) {
        console.error('Erro ao capturar tela:', error);
        throw error;
    }
}

// Função para capturar a área selecionada
async function captureSelectedArea(area) {
    try {
        // Obter a aba ativa
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Capturar a tela usando a API do Chrome
        const imageData = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        
        // Converter data URL para Blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Criar bitmap da imagem
        const bitmap = await createImageBitmap(blob);
        
        // Criar um canvas com o tamanho da tela inteira
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext('2d');
        
        // Desenhar a imagem inteira primeiro
        ctx.drawImage(bitmap, 0, 0);
        
        // Criar um segundo canvas para o overlay
        const overlayCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const overlayCtx = overlayCanvas.getContext('2d');
        
        // Desenhar o overlay escuro
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        overlayCtx.fillRect(0, 0, bitmap.width, bitmap.height);
        
        // Limpar a área selecionada no overlay
        overlayCtx.clearRect(area.x, area.y, area.width, area.height);
        
        // Desenhar a borda verde
        overlayCtx.strokeStyle = '#4CAF50';
        overlayCtx.lineWidth = 2;
        overlayCtx.strokeRect(area.x, area.y, area.width, area.height);
        
        // Sobrepor o overlay na imagem original
        ctx.drawImage(overlayCanvas, 0, 0);
        
        // Converter para blob
        const finalBlob = await canvas.convertToBlob({ type: 'image/png' });
        
        // Converter blob para data URL
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(finalBlob);
        });
    } catch (error) {
        console.error('Erro ao capturar área:', error);
        throw error;
    }
}

// Função para fazer upload da imagem para o ImgBB
async function uploadToImgBB(imageData) {
    try {
        const config = await getConfig();
        if (!await checkConfig()) {
            throw new Error('Configurações não encontradas. Por favor, configure as chaves de API nas opções da extensão.');
        }

        // Converter data URL para Blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        // Criar FormData
        const formData = new FormData();
        formData.append('image', blob);
        
        // Fazer upload para o ImgBB
        const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${config.IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await uploadResponse.json();
        
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error('Falha no upload da imagem');
        }
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        return null;
    }
}

// Adicione um event listener para processar mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getUsers") {
        fetchUsers().then(users => {
            sendResponse({ success: true, users });
        });
        return true;
    }
    
    if (message.action === "captureFullScreen") {
        captureFullScreen().then(imageData => {
            sendResponse({ imageData });
        });
        return true;
    }
    
    if (message.action === "captureSelectedArea") {
        captureSelectedArea(message.area).then(imageData => {
            sendResponse({ imageData });
        });
        return true;
    }
    
    if (message.action === "sendFeedback") {
        console.log("Mensagem recebida no background:", message);
        
        // Extrair dados do elemento e screenshot
        const elementData = JSON.parse(message.element);
        const screenshotData = elementData.screenshot;
        
        // Upload da screenshot para o ImgBB
        uploadToImgBB(screenshotData).then(async (imageUrl) => {
            const config = await getConfig();
            if (!await checkConfig()) {
                sendResponse({
                    success: false,
                    error: 'Configurações não encontradas. Por favor, configure as chaves de API nas opções da extensão.'
                });
                return;
            }

            // Preparar dados para o Airtable
            const feedbackData = {
                records: [
                    {
                        fields: {
                            "Elemento": JSON.stringify({
                                type: elementData.type,
                                x: elementData.x,
                                y: elementData.y,
                                width: elementData.width,
                                height: elementData.height
                            }),
                            "Feedback": message.feedback,
                            "URL": message.url,
                            "Screenshot": imageUrl,
                            "Data": new Date().toISOString(),
                            "Usuario": message.userName
                        }
                    }
                ]
            };
            
            console.log("Dados a serem enviados para o Airtable:", feedbackData);
            
            // Enviar para o Airtable
            return fetch(`https://api.airtable.com/v0/${config.AIRTABLE_BASE_ID}/${TABLE_NAME}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.AIRTABLE_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(feedbackData)
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.records) {
                sendResponse({ success: true });
            } else {
                sendResponse({
                    success: false,
                    error: 'Erro ao salvar no Airtable'
                });
            }
        })
        .catch(error => {
            console.error('Erro ao enviar feedback:', error);
            sendResponse({
                success: false,
                error: error.message
            });
        });
        return true;
    }
});