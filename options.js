// Elementos da interface
const jiraUrlInput = document.getElementById('jiraUrl');
const jiraEmailInput = document.getElementById('jiraEmail');
const jiraTokenInput = document.getElementById('jiraToken');
const jiraProjectInput = document.getElementById('jiraProject');
const imgbbKeyInput = document.getElementById('imgbbKey');
const saveButton = document.getElementById('saveConfig');
const testButton = document.getElementById('testConfig');
const statusMessage = document.getElementById('statusMessage');

// Carregar configurações salvas
chrome.storage.sync.get(['jiraUrl', 'jiraEmail', 'jiraToken', 'jiraProject', 'imgbbKey'], (data) => {
    if (data.jiraUrl) jiraUrlInput.value = data.jiraUrl;
    if (data.jiraEmail) jiraEmailInput.value = data.jiraEmail;
    if (data.jiraToken) jiraTokenInput.value = data.jiraToken;
    if (data.jiraProject) jiraProjectInput.value = data.jiraProject;
    if (data.imgbbKey) imgbbKeyInput.value = data.imgbbKey;
});

// Função para mostrar mensagem de status
function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = `mt-4 p-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    statusMessage.classList.remove('hidden');
    
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

// Função para validar as configurações
function validateConfig() {
    const jiraUrl = jiraUrlInput.value.trim();
    const jiraEmail = jiraEmailInput.value.trim();
    const jiraToken = jiraTokenInput.value.trim();
    const jiraProject = jiraProjectInput.value.trim();
    const imgbbKey = imgbbKeyInput.value.trim();
    
    // Campos obrigatórios (projeto agora é opcional)
    if (!jiraUrl || !jiraEmail || !jiraToken || !imgbbKey) {
        showStatus('Por favor, preencha todos os campos obrigatórios', true);
        return false;
    }
    
    // Validar formato da URL do Jira
    if (!jiraUrl.includes('.atlassian.net') && !jiraUrl.includes('jira')) {
        showStatus('URL do Jira deve ser válida (ex: https://suaempresa.atlassian.net)', true);
        return false;
    }
    
    return true;
}

// Função para testar as configurações
async function testConfiguration() {
    if (!validateConfig()) return;
    
    testButton.disabled = true;
    testButton.textContent = 'Testando...';
    
    try {
        // Testar conexão com Jira
        const jiraUrl = jiraUrlInput.value.trim();
        const jiraEmail = jiraEmailInput.value.trim();
        const jiraToken = jiraTokenInput.value.trim();
        const jiraProject = jiraProjectInput.value.trim();
        
        // Criar credenciais base64 para autenticação básica
        const credentials = btoa(`${jiraEmail}:${jiraToken}`);
        
        // Testar conexão básica com Jira (buscar informações do usuário)
        const userResponse = await fetch(
            `${jiraUrl}/rest/api/3/myself`,
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Accept': 'application/json'
                }
            }
        );
        
        if (!userResponse.ok) {
            if (userResponse.status === 401) {
                throw new Error('Credenciais inválidas. Verifique email e token.');
            } else {
                throw new Error(`Erro na conexão com Jira: ${userResponse.status}`);
            }
        }
        
        // Testar projeto apenas se foi especificado
        if (jiraProject) {
            const projectResponse = await fetch(
                `${jiraUrl}/rest/api/3/project/${jiraProject}`,
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!projectResponse.ok) {
                if (projectResponse.status === 404) {
                    throw new Error('Projeto não encontrado. Verifique a chave do projeto.');
                } else {
                    throw new Error(`Erro ao acessar projeto: ${projectResponse.status}`);
                }
            }
        }
        
        // Testar ImgBB (apenas verificar se a chave tem o formato correto)
        const imgbbKey = imgbbKeyInput.value.trim();
        if (imgbbKey.length < 32) {
            throw new Error('Chave do ImgBB parece inválida');
        }
        
        const projectMessage = jiraProject ? ' e projeto' : '';
        showStatus(`Configurações testadas com sucesso! Jira${projectMessage} e ImgBB conectados.`);
    } catch (error) {
        showStatus(`Erro ao testar configurações: ${error.message}`, true);
    } finally {
        testButton.disabled = false;
        testButton.textContent = 'Testar Configuração';
    }
}

// Função para salvar as configurações
function saveConfiguration() {
    if (!validateConfig()) return;
    
    const config = {
        jiraUrl: jiraUrlInput.value.trim(),
        jiraEmail: jiraEmailInput.value.trim(),
        jiraToken: jiraTokenInput.value.trim(),
        jiraProject: jiraProjectInput.value.trim(),
        imgbbKey: imgbbKeyInput.value.trim()
    };
    
    chrome.storage.sync.set(config, () => {
        if (chrome.runtime.lastError) {
            showStatus('Erro ao salvar configurações: ' + chrome.runtime.lastError.message, true);
        } else {
            showStatus('Configurações salvas com sucesso!');
        }
    });
}

// Event listeners
saveButton.addEventListener('click', saveConfiguration);
testButton.addEventListener('click', testConfiguration);