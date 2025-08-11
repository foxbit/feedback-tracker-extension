// Elementos da interface
const captureButton = document.getElementById("capture");
const sendButton = document.getElementById("send");
const resetButton = document.getElementById("resetBtn");
const feedbackInput = document.getElementById("feedback");
const selectedElementDiv = document.getElementById("selectedElement");
const statusMessageDiv = document.getElementById("statusMessage");
const projectSelect = document.getElementById("projectSelect");
const statusSelect = document.getElementById("statusSelect");
const steps = document.querySelectorAll('.step');
const step1Content = document.getElementById("step1Content");
const step2Content = document.getElementById("step2Content");

// Estado inicial
let isCapturing = false;
let currentStep = 1;
let selectedProjectKey = null;
let selectedStatusId = null;
let selectedElement = null;

// Carregar projetos ao iniciar
loadProjects();

// Função para carregar projetos
async function loadProjects() {
    try {
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "getProjects" }, (response) => {
                if (chrome.runtime.lastError) {
                    resolve({ success: false, error: chrome.runtime.lastError });
                } else {
                    resolve(response);
                }
            });
        });

        if (response.success && response.projects) {
            // Limpar opções existentes
            projectSelect.innerHTML = '<option value="">Selecione um projeto</option>';
            
            // Ordenar projetos alfabeticamente por nome
            const sortedProjects = response.projects.sort((a, b) => a.name.localeCompare(b.name));
            
            // Adicionar projetos ao select
            sortedProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.key;
                option.textContent = `${project.key} - ${project.name}`;
                projectSelect.appendChild(option);
            });

            // Carregar projeto salvo
            chrome.storage.local.get(['selectedProjectKey'], (data) => {
                if (data.selectedProjectKey) {
                    projectSelect.value = data.selectedProjectKey;
                    selectedProjectKey = data.selectedProjectKey;
                }
            });
        } else {
            console.error('Erro ao carregar projetos:', response.error);
            showStatus('Erro ao carregar projetos. Verifique as configurações.', true);
        }
    } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        showStatus('Erro ao carregar projetos.', true);
    }
}



// Função para carregar status do projeto
async function loadProjectStatuses(projectKey) {
    try {
        console.log('Carregando status para projeto:', projectKey);
        statusSelect.disabled = true;
        statusSelect.innerHTML = '<option value="">Carregando status...</option>';
        
        const response = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "getProjectStatuses", projectKey }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Erro no chrome.runtime:', chrome.runtime.lastError);
                    resolve({ success: false, error: chrome.runtime.lastError });
                } else {
                    console.log('Resposta recebida:', response);
                    resolve(response);
                }
            });
        });

        if (response.success && response.statuses) {
            console.log('Status carregados com sucesso:', response.statuses.length, 'itens');
            // Limpar opções existentes
            statusSelect.innerHTML = '<option value="">Selecione um status</option>';
            
            // Adicionar status ao select
            response.statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status.id;
                option.textContent = status.name;
                option.dataset.category = status.statusCategory.key;
                statusSelect.appendChild(option);
            });
            
            // Selecionar automaticamente o primeiro status (backlog)
            if (response.statuses.length > 0) {
                statusSelect.value = response.statuses[0].id;
                selectedStatusId = response.statuses[0].id;
                console.log('Status padrão selecionado:', response.statuses[0].name);
            }
            
            statusSelect.disabled = false;
            console.log('StatusSelect habilitado');
        } else {
            console.error('Falha ao carregar status:', response);
            statusSelect.innerHTML = '<option value="">Erro ao carregar status</option>';
            console.error('Erro ao carregar status:', response.error);
        }
    } catch (error) {
        console.error('Exceção ao carregar status:', error);
        statusSelect.innerHTML = '<option value="">Erro ao carregar status</option>';
        console.error('Erro ao carregar status do projeto:', error);
    }
}

// Event listener para seleção de projeto
projectSelect.addEventListener('change', (event) => {
    selectedProjectKey = event.target.value;
    
    // Salvar projeto selecionado
    chrome.storage.local.set({ selectedProjectKey });
    
    // Carregar status do projeto selecionado
    if (selectedProjectKey) {
        loadProjectStatuses(selectedProjectKey);
    } else {
        // Limpar seleção de status
        statusSelect.innerHTML = '<option value="">Selecione um status</option>';
        statusSelect.disabled = true;
        selectedStatusId = null;
    }
});



// Event listener para seleção de status
statusSelect.addEventListener('change', (event) => {
    selectedStatusId = event.target.value;
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
    selectedElement = elementInfo;
    
    if (elementInfo) {
        const element = JSON.parse(elementInfo);
        selectedElementDiv.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="font-medium">Área Capturada:</span>
            </div>
            <div class="text-sm text-gray-600 mb-3">
                <div>Posição: (${element.x}, ${element.y})</div>
                <div>Dimensões: ${element.width}x${element.height} pixels</div>
            </div>
            <div class="border rounded-lg overflow-hidden mb-4">
                <img src="${element.screenshot}" alt="Área capturada" class="w-full h-auto">
            </div>
        `;
        selectedElementDiv.classList.add('active');
        captureButton.classList.add('completed');
        captureButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Área Capturada
        `;
        updateSteps(2);
    } else {
        selectedElementDiv.classList.remove('active');
        captureButton.classList.remove('completed');
        captureButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
            </svg>
            Selecionar Área
        `;
        updateSteps(1);
    }
}

// Carregar elemento selecionado ao abrir o popup
chrome.storage.local.get(["selectedElement"], (data) => {
    updateSelectedElement(data.selectedElement);
});

// Função para restaurar estado do popup
function restorePopupState() {
    chrome.storage.local.get(['popupState'], (data) => {
        if (data.popupState) {
            console.log('Restaurando estado do popup:', data.popupState);
            
            // Restaurar valores das variáveis
            selectedProjectKey = data.popupState.selectedProjectKey;
            selectedStatusId = data.popupState.selectedStatusId;
            
            // Restaurar texto do feedback
            if (data.popupState.feedbackText) {
                feedbackInput.value = data.popupState.feedbackText;
            }
            
            // Restaurar seleções dos selects
            if (selectedProjectKey) {
                projectSelect.value = selectedProjectKey;
                // Recarregar status para o projeto selecionado
                loadProjectStatuses(selectedProjectKey);
                
                // Aguardar um pouco para o select carregar e então restaurar o valor
                setTimeout(() => {
                    if (selectedStatusId) {
                        statusSelect.value = selectedStatusId;
                    }
                }, 500);
            }
            
            // Limpar estado salvo após restaurar
            chrome.storage.local.remove(['popupState']);
        }
    });
}

// Restaurar estado do popup ao carregar
restorePopupState();

// Event listener para o botão de captura
captureButton.addEventListener("click", () => {
    console.log('Botão de captura clicado');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log('Tab ativa encontrada:', tabs[0]);
        
        // Primeiro, verificar se o content script já está presente
        chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError || !response) {
                // Content script não está presente, injetar
                console.log('Content script não encontrado, injetando...');
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Erro ao injetar content script:', chrome.runtime.lastError);
                        showStatus('Erro: Não foi possível injetar o script na página. Verifique se a página permite extensões.', true);
                        return;
                    }
                    
                    // Aguardar um pouco para o script ser carregado
                    setTimeout(() => {
                        startCaptureProcess(tabs[0].id);
                    }, 100);
                });
            } else {
                // Content script já está presente
                console.log('Content script já presente, iniciando captura...');
                startCaptureProcess(tabs[0].id);
            }
        });
    });
});

// Função auxiliar para iniciar o processo de captura
function startCaptureProcess(tabId) {
    // Salvar estado atual antes de fechar o popup
    chrome.storage.local.set({
        'popupState': {
            selectedProjectKey: selectedProjectKey,
            selectedStatusId: selectedStatusId,
            feedbackText: feedbackInput.value
        }
    }, () => {
        chrome.tabs.sendMessage(tabId, { action: 'startCapture' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Erro ao enviar mensagem:', chrome.runtime.lastError);
                showStatus('Erro: Não foi possível iniciar a captura. Recarregue a página e tente novamente.', true);
                return;
            }
            console.log('Mensagem enviada com sucesso:', response);
            // Fechar o popup
            window.close();
        });
    });
}

// Função para enviar feedback
async function sendFeedback() {
    if (!selectedProjectKey) {
        showStatus('Por favor, selecione um projeto', true);
        return;
    }
    
    if (!selectedElement) {
        showStatus('Por favor, selecione um elemento', true);
        return;
    }

    const feedback = feedbackInput.value.trim();
    if (!feedback) {
        showStatus('Por favor, escreva seu feedback', true);
        return;
    }

    sendButton.disabled = true;
    sendButton.classList.add('loading');

    try {
        const response = await chrome.runtime.sendMessage({
            action: 'sendFeedback',
            element: selectedElement,
            feedback: feedback,
            projectKey: selectedProjectKey,
            statusId: selectedStatusId
        });

        if (response.success) {
            showStatus('Feedback enviado com sucesso!', false);
            // Desativa o modo de seleção
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopCapture' });
            });
            resetForm();
        } else {
            showStatus(response.error || 'Erro ao enviar feedback', true);
        }
    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        showStatus('Erro ao enviar feedback', true);
    } finally {
        sendButton.disabled = false;
        sendButton.classList.remove('loading');
    }
}

// Event listener para o botão de enviar
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
                        url: tabs[0].url,
                        projectKey: selectedProjectKey,
                        statusId: selectedStatusId
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
            
            const successMessage = data.issueKey ? 
                `Feedback enviado com sucesso! Issue criado: ${data.issueKey}` : 
                "Feedback enviado com sucesso!";
            showStatus(successMessage);
            resetForm();
        } else {
            throw new Error(data.error || "Erro ao enviar feedback. Tente novamente.");
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
    selectedElement = null;
}

// Função para verificar configurações
async function checkConfiguration() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['jiraUrl', 'jiraEmail', 'jiraToken', 'imgbbKey'], (data) => {
            // Projeto agora é opcional - não é mais obrigatório
            const hasConfig = data.jiraUrl && data.jiraEmail && data.jiraToken && data.imgbbKey;
            resolve(hasConfig);
        });
    });
}

// Função para mostrar aviso de configuração
function showConfigurationWarning() {
    const warning = document.createElement('div');
    warning.id = 'configurationWarning';
    warning.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4';
    warning.innerHTML = `
        <p class="font-bold">Configuração Necessária</p>
        <p>Por favor, configure as chaves de API nas opções da extensão antes de usar.</p>
        <button id="openOptions" class="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Abrir Configurações
        </button>
        <button id="testConfig" class="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Testar Configuração
        </button>
    `;
    
    document.querySelector('.popup-container').prepend(warning);
    
    document.getElementById('openOptions').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
    
    document.getElementById('testConfig').addEventListener('click', async () => {
        await testConfigurationFromPopup();
    });
    
    // Desabilitar botões
    captureButton.disabled = true;
    sendButton.disabled = true;
}

// Função para remover aviso de configuração
function removeConfigurationWarning() {
    const warning = document.getElementById('configurationWarning');
    if (warning) {
        warning.remove();
    }
    
    // Reabilitar botões
    captureButton.disabled = false;
    sendButton.disabled = false;
}

// Função para testar configuração a partir do popup
async function testConfigurationFromPopup() {
    try {
        const hasConfig = await checkConfiguration();
        if (hasConfig) {
            // Testar conexão com Jira
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: "testConnection" }, (response) => {
                    if (chrome.runtime.lastError) {
                        resolve({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        resolve(response);
                    }
                });
            });
            
            if (response.success) {
                removeConfigurationWarning();
                showStatus('Configuração testada com sucesso!');
                // Recarregar projetos agora que a configuração está funcionando
                loadProjects();
            } else {
                showStatus(`Erro na configuração: ${response.error}`, true);
            }
        } else {
            showStatus('Por favor, preencha todos os campos obrigatórios nas configurações.', true);
        }
    } catch (error) {
        showStatus(`Erro ao testar configuração: ${error.message}`, true);
    }
}

// Verificar configuração ao carregar
window.addEventListener('load', async () => {
    const hasConfig = await checkConfiguration();
    if (!hasConfig) {
        showConfigurationWarning();
    } else {
        // Se tem configuração, testar se está funcionando
        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: "testConnection" }, (response) => {
                    if (chrome.runtime.lastError) {
                        resolve({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        resolve(response);
                    }
                });
            });
            
            if (!response.success) {
                // Se a configuração existe mas não está funcionando, mostrar aviso
                showConfigurationWarning();
            }
        } catch (error) {
            // Se houver erro no teste, mostrar aviso
            showConfigurationWarning();
        }
    }
});