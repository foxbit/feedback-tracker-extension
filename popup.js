// Elementos da interface
const captureButton = document.getElementById("capture");
const sendButton = document.getElementById("send");
const resetButton = document.getElementById("resetBtn");
const feedbackInput = document.getElementById("feedback");
const selectedElementDiv = document.getElementById("selectedElement");
const statusMessageDiv = document.getElementById("statusMessage");
const userSelect = document.getElementById("userSelect");
const steps = document.querySelectorAll('.step');
const step1Content = document.getElementById("step1Content");
const step2Content = document.getElementById("step2Content");

// Estado inicial
let isCapturing = false;
let currentStep = 1;
let selectedUserId = null;
let selectedUserName = null;

// Carregar usuários ao iniciar
loadUsers();

// Função para carregar usuários
async function loadUsers() {
    try {
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "getUsers" }, (response) => {
                if (chrome.runtime.lastError) {
                    resolve({ success: false, error: chrome.runtime.lastError });
                } else {
                    resolve(response);
                }
            });
        });

        if (response.success && response.users) {
            // Limpar opções existentes
            userSelect.innerHTML = '<option value="">Selecione um usuário</option>';
            
            // Adicionar usuários ao select
            response.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                option.dataset.name = user.displayName;
                userSelect.appendChild(option);
            });

            // Carregar usuário salvo
            chrome.storage.local.get(['selectedUserId'], (data) => {
                if (data.selectedUserId) {
                    userSelect.value = data.selectedUserId;
                    selectedUserId = data.selectedUserId;
                    const selectedOption = userSelect.querySelector(`option[value="${data.selectedUserId}"]`);
                    if (selectedOption) {
                        selectedUserName = selectedOption.dataset.name;
                    }
                }
            });
        } else {
            throw new Error('Erro ao carregar usuários');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showStatus('Erro ao carregar lista de usuários', true);
    }
}

// Event listener para o select de usuários
userSelect.addEventListener('change', (event) => {
    selectedUserId = event.target.value;
    const selectedOption = event.target.options[event.target.selectedIndex];
    selectedUserName = selectedOption.dataset.name;
    chrome.storage.local.set({ 
        selectedUserId: selectedUserId,
        selectedUserName: selectedUserName 
    });
});

// Função para atualizar os passos
function updateSteps(step) {
    currentStep = step;
    steps.forEach((stepElement, index) => {
        const stepNumber = index + 1;
        stepElement.classList.remove('active', 'completed');
        
        if (stepNumber === step) {
            stepElement.classList.add('active');
        } else if (stepNumber < step) {
            stepElement.classList.add('completed');
        }
    });
    showStep(step);
}

// Função para mostrar o passo atual
function showStep(step) {
    step1Content.classList.remove('active');
    step2Content.classList.remove('active');
    
    if (step === 1) {
        step1Content.classList.add('active');
    } else if (step === 2) {
        step2Content.classList.add('active');
    }
}

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

// Função para atualizar o elemento selecionado na interface
function updateSelectedElement(elementInfo) {
    if (elementInfo) {
        const element = JSON.parse(elementInfo);
        selectedElementDiv.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="font-medium">Elemento Capturado:</span>
            </div>
            <div class="text-sm text-gray-600">
                <div>Tipo: ${element.tagName.toLowerCase()}</div>
                ${element.id ? `<div>ID: ${element.id}</div>` : ''}
                ${element.className ? `<div>Classes: ${element.className}</div>` : ''}
                <div>Texto: ${element.textContent}</div>
            </div>
        `;
        selectedElementDiv.classList.add('active');
        captureButton.classList.add('completed');
        captureButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Elemento Capturado
        `;
        updateSteps(2);
    } else {
        selectedElementDiv.classList.remove('active');
        captureButton.classList.remove('completed');
        captureButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
            </svg>
            Selecionar Elemento
        `;
        updateSteps(1);
    }
}

// Carregar elemento selecionado ao abrir o popup
chrome.storage.local.get(["selectedElement"], (data) => {
    updateSelectedElement(data.selectedElement);
});

// Event listener para o botão de captura
captureButton.addEventListener("click", () => {
    console.log("Botão de captura clicado");
    isCapturing = true;
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

// Event listener para o botão de enviar
sendButton.addEventListener("click", async () => {
    console.log("Botão de enviar clicado");
    const feedback = feedbackInput.value.trim();
    
    if (!selectedUserId || !selectedUserName) {
        showStatus("Por favor, selecione um usuário antes de enviar.", true);
        return;
    }
    
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
                        url: tabs[0].url,
                        userId: selectedUserId,
                        userName: selectedUserName
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
            // Notificar o content script que o feedback foi enviado
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "feedbackSent" });
                }
            });
            
            showStatus("Feedback enviado com sucesso!");
            resetForm();
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

// Event listener para o botão de reset
resetButton.addEventListener("click", () => {
    resetForm();
    showStatus("Formulário limpo!");
});

// Função para resetar o formulário
function resetForm() {
    feedbackInput.value = "";
    chrome.storage.local.remove(["selectedElement"]);
    updateSelectedElement(null);
    updateSteps(1);
    // Não resetamos o usuário selecionado para manter a preferência
}