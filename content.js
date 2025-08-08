// Variáveis globais para controlar o modo de captura
let captureMode = false;
let isDrawing = false;
let startX = 0;
let startY = 0;
let selectionBox = null;
let screenshotOverlay = null;

// Função para criar o indicador visual
function createIndicator() {
    // Verificar se já existe e remover
    const existing = document.getElementById('feedback-capture-indicator');
    if (existing) {
        existing.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.id = 'feedback-capture-indicator';
    indicator.textContent = 'Clique e arraste para selecionar uma área';
    indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: rgba(255, 193, 7, 0.9);
        color: black;
        text-align: center;
        padding: 10px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        pointer-events: none;
    `;
    document.body.appendChild(indicator);
}

// Função para criar a caixa de seleção
function createSelectionBox() {
    // Verificar se já existe e remover
    const existing = document.getElementById('feedback-selection-box');
    if (existing) {
        existing.remove();
    }
    
    const box = document.createElement('div');
    box.id = 'feedback-selection-box';
    box.style.cssText = `
        position: fixed;
        border: 2px solid #4CAF50;
        background-color: rgba(76, 175, 80, 0.1);
        z-index: 999998;
        pointer-events: none;
        display: none;
        user-select: none;
    `;
    document.body.appendChild(box);
    return box;
}

// Função para criar o overlay com a screenshot
function createScreenshotOverlay(imageData) {
    // Verificar se já existe e remover
    const existing = document.getElementById('feedback-screenshot-overlay');
    if (existing) {
        existing.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'feedback-screenshot-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999997;
        cursor: crosshair;
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        position: relative;
        max-width: 100%;
        max-height: 100%;
        overflow: auto;
    `;

    const img = document.createElement('img');
    img.src = imageData;
    img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
    `;

    imageContainer.appendChild(img);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);
    return overlay;
}

// Função para iniciar o modo de captura
async function startCaptureMode() {
    console.log('startCaptureMode chamada');
    
    // Limpar elementos existentes primeiro
    endCaptureMode();
    
    captureMode = true;
    
    // Criar a caixa de seleção (que está invisível inicialmente)
    console.log('Criando caixa de seleção');
    selectionBox = createSelectionBox();
    
    // Capturar a tela primeiro
    console.log('Capturando tela');
    chrome.runtime.sendMessage({ action: "captureFullScreen" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error('Erro no chrome.runtime ao capturar tela:', chrome.runtime.lastError);
            alert('Erro: Não foi possível iniciar a captura. Recarregue a página e tente novamente.');
            captureMode = false;
            return;
        }
        
        if (response && response.imageData) {
            console.log('Screenshot capturada com sucesso');
            // Criar overlay com a screenshot
            console.log('Criando overlay com screenshot');
            screenshotOverlay = createScreenshotOverlay(response.imageData);
            
            // Só criar o indicador depois que o overlay estiver pronto
            console.log('Criando indicador visual');
            createIndicator();
            
            // Adicionar listeners para mouse no overlay
            console.log('Adicionando event listeners');
            screenshotOverlay.addEventListener("mousedown", handleMouseDown);
            screenshotOverlay.addEventListener("mousemove", handleMouseMove);
            screenshotOverlay.addEventListener("mouseup", handleMouseUp);
            
            // Prevenir seleção de texto
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.mozUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
            
            console.log('Modo de captura ativado');
        } else {
            console.error('Resposta inválida ao capturar tela:', response);
            alert('Erro: Não foi possível capturar a tela. Recarregue a página e tente novamente.');
            captureMode = false;
        }
    });
}

// Função para finalizar o modo de captura
function endCaptureMode() {
    captureMode = false;
    
    // Remover elementos visuais
    const indicator = document.getElementById('feedback-capture-indicator');
    if (indicator) indicator.remove();
    
    if (screenshotOverlay) {
        screenshotOverlay.remove();
        screenshotOverlay = null;
    }
    
    if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
    }
    
    // Restaurar seleção de texto
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.mozUserSelect = '';
    document.body.style.msUserSelect = '';
}

// Função para lidar com o início da seleção
function handleMouseDown(event) {
    if (!captureMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    isDrawing = true;
    startX = event.clientX;
    startY = event.clientY;
    
    // Remover o indicador quando começar a desenhar
    const indicator = document.getElementById('feedback-capture-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    selectionBox.style.display = 'block';
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    selectionBox.style.width = '0';
    selectionBox.style.height = '0';
}

// Função para lidar com o movimento do mouse durante a seleção
function handleMouseMove(event) {
    if (!isDrawing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const currentX = event.clientX;
    const currentY = event.clientY;
    
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
    selectionBox.style.left = (currentX > startX ? startX : currentX) + 'px';
    selectionBox.style.top = (currentY > startY ? startY : currentY) + 'px';
}

// Função para lidar com o final da seleção
async function handleMouseUp(event) {
    if (!isDrawing) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    isDrawing = false;
    
    // Capturar a área selecionada
    const rect = selectionBox.getBoundingClientRect();
    const captureArea = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
    
    // Enviar mensagem para o background script fazer a captura da área
    chrome.runtime.sendMessage({
        action: "captureSelectedArea",
        area: captureArea
    }, async (response) => {
        if (response && response.imageData) {
            // Salvar os dados da captura
            const elementInfo = {
                type: 'area',
                x: captureArea.x,
                y: captureArea.y,
                width: captureArea.width,
                height: captureArea.height,
                screenshot: response.imageData
            };
            
            chrome.storage.local.set({ selectedElement: JSON.stringify(elementInfo) });
            
            // Notificar o usuário
            const notification = document.createElement('div');
            notification.textContent = 'Área capturada! Adicione o feedback no popup.';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(33, 150, 243, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 999999;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                pointer-events: none;
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    });
    
    // Finalizar o modo de captura
    endCaptureMode();
}

// Função para gerar XPath do elemento
function getXPath(element) {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }
    
    if (element === document.body) {
        return '/html/body';
    }
    
    let path = '';
    while (element.parentNode) {
        let siblings = element.parentNode.childNodes;
        let index = 1;
        for (let sibling of siblings) {
            if (sibling === element) {
                path = `/${element.tagName.toLowerCase()}[${index}]${path}`;
                break;
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                index++;
            }
        }
        element = element.parentNode;
    }
    return path;
}

// Log para verificar se o content script foi carregado
console.log('Content script carregado');

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Mensagem recebida no content script:', message);
    if (message.action === "ping") {
        // Responder ao ping para confirmar que o content script está presente
        sendResponse({ success: true, present: true });
    } else if (message.action === "startCapture") {
        console.log('Iniciando modo de captura');
        startCaptureMode();
        sendResponse({ success: true });
    } else if (message.action === "stopCapture") {
        captureMode = false;
        endCaptureMode();
        sendResponse({ success: true });
    } else if (message.action === "feedbackSent") {
        sendResponse({ success: true });
    }
    return true; // Indica que a resposta será assíncrona
});