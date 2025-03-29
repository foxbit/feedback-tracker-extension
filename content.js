// Variável global para controlar o modo de captura
let captureMode = false;
let hoveredElement = null;
let selectedElement = null;

// Função para criar o indicador visual
function createIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'feedback-capture-indicator';
    indicator.textContent = 'Modo de captura ativo - Clique em qualquer elemento para selecionar';
    indicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: rgba(255, 193, 7, 0.9);
        color: black;
        text-align: center;
        padding: 10px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(indicator);
}

// Função para destacar elemento no hover
function highlightElement(element) {
    if (hoveredElement) {
        hoveredElement.style.outline = '';
        hoveredElement.style.backgroundColor = '';
    }
    
    if (element) {
        element.style.outline = '2px solid #4CAF50';
        element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        hoveredElement = element;
    }
}

// Função para capturar screenshot com área destacada
async function captureScreenshotWithHighlight(element) {
    // Salvar o estilo original
    const originalOutline = element.style.outline;
    const originalBackground = element.style.backgroundColor;
    
    // Aplicar destaque para screenshot
    element.style.outline = '3px solid #FF4081';
    element.style.backgroundColor = 'rgba(255, 64, 129, 0.2)';
    
    // Scroll para o elemento
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Esperar um pouco para garantir que o scroll terminou
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capturar as dimensões do elemento e da viewport
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calcular a área de captura
    const captureArea = {
        x: Math.max(0, rect.left - 100),
        y: Math.max(0, rect.top - 100),
        width: Math.min(viewportWidth, rect.width + 200),
        height: Math.min(viewportHeight, rect.height + 200)
    };
    
    // Enviar mensagem para o background script fazer a captura
    chrome.runtime.sendMessage({
        action: "captureScreen",
        area: captureArea
    }, async (response) => {
        if (response && response.imageData) {
            // Restaurar o estilo original do elemento
            element.style.outline = originalOutline;
            element.style.backgroundColor = originalBackground;
            
            // Salvar os dados da captura
            const elementInfo = {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                textContent: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : ''),
                xpath: getXPath(element),
                screenshot: response.imageData
            };
            
            chrome.storage.local.set({ selectedElement: JSON.stringify(elementInfo) });
        }
    });
}

// Função para iniciar o modo de captura
function startCaptureMode() {
    captureMode = true;
    createIndicator();
    document.body.style.cursor = 'crosshair';
    
    // Adicionar listeners para hover e clique
    document.addEventListener("mouseover", handleElementHover);
    document.addEventListener("click", handleElementCapture);
}

// Função para finalizar o modo de captura
function endCaptureMode() {
    captureMode = false;
    
    // Remover o indicador visual
    const indicator = document.getElementById('feedback-capture-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // Remover highlight do elemento
    if (hoveredElement) {
        hoveredElement.style.outline = '';
        hoveredElement.style.backgroundColor = '';
        hoveredElement = null;
    }
    
    // Restaurar o cursor
    document.body.style.cursor = 'default';
    
    // Remover os listeners
    document.removeEventListener("mouseover", handleElementHover);
    document.removeEventListener("click", handleElementCapture);
}

// Função para lidar com o hover sobre elementos
function handleElementHover(event) {
    if (captureMode) {
        highlightElement(event.target);
    }
}

// Função para lidar com a captura do elemento
async function handleElementCapture(event) {
    if (captureMode) {
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        selectedElement = element;
        
        // Capturar screenshot com área destacada
        await captureScreenshotWithHighlight(element);
        
        // Finalizar o modo de captura
        endCaptureMode();
        
        // Notificar o usuário
        const notification = document.createElement('div');
        notification.textContent = 'Elemento capturado! Adicione o feedback no popup.';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(33, 150, 243, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
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

// Função para remover o highlight do elemento selecionado
function removeHighlight() {
    if (selectedElement) {
        selectedElement.style.outline = '';
        selectedElement.style.backgroundColor = '';
        selectedElement = null;
    }
}

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startCapture") {
        startCaptureMode();
        sendResponse({ success: true });
    } else if (message.action === "feedbackSent") {
        removeHighlight();
        sendResponse({ success: true });
    }
});