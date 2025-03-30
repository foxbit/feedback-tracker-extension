// Elementos da interface
const airtableTokenInput = document.getElementById('airtableToken');
const airtableBaseInput = document.getElementById('airtableBase');
const imgbbKeyInput = document.getElementById('imgbbKey');
const saveButton = document.getElementById('saveConfig');
const testButton = document.getElementById('testConfig');
const statusMessage = document.getElementById('statusMessage');

// Carregar configurações salvas
chrome.storage.sync.get(['airtableToken', 'airtableBase', 'imgbbKey'], (data) => {
    if (data.airtableToken) airtableTokenInput.value = data.airtableToken;
    if (data.airtableBase) airtableBaseInput.value = data.airtableBase;
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
    const airtableToken = airtableTokenInput.value.trim();
    const airtableBase = airtableBaseInput.value.trim();
    const imgbbKey = imgbbKeyInput.value.trim();
    
    if (!airtableToken || !airtableBase || !imgbbKey) {
        showStatus('Por favor, preencha todos os campos', true);
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
        // Testar Airtable
        const airtableResponse = await fetch(
            `https://api.airtable.com/v0/${airtableBaseInput.value}/Users?maxRecords=1`,
            {
                headers: {
                    'Authorization': `Bearer ${airtableTokenInput.value}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!airtableResponse.ok) {
            throw new Error('Falha na conexão com o Airtable');
        }
        
        // Testar ImgBB (apenas verificar se a chave tem o formato correto)
        const imgbbKey = imgbbKeyInput.value.trim();
        if (imgbbKey.length < 32) {
            throw new Error('Chave do ImgBB parece inválida');
        }
        
        showStatus('Configurações testadas com sucesso!');
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
        airtableToken: airtableTokenInput.value.trim(),
        airtableBase: airtableBaseInput.value.trim(),
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