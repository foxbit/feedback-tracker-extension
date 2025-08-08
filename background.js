// Função para obter as configurações
async function getConfig() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['jiraUrl', 'jiraEmail', 'jiraToken', 'jiraProject', 'imgbbKey'], (data) => {
            resolve({
                JIRA_URL: data.jiraUrl,
                JIRA_EMAIL: data.jiraEmail,
                JIRA_TOKEN: data.jiraToken,
                JIRA_PROJECT: data.jiraProject,
                IMGBB_API_KEY: data.imgbbKey
            });
        });
    });
}

// Função para verificar se as configurações existem
async function checkConfig() {
    const config = await getConfig();
    // Projeto agora é opcional - não é mais obrigatório
    return config.JIRA_URL && config.JIRA_EMAIL && config.JIRA_TOKEN && config.IMGBB_API_KEY;
}

// Constantes
const ISSUE_TYPE_ID = "10001"; // Bug - pode ser ajustado conforme necessário

// Função para buscar tipos de issue válidos para um projeto
async function fetchIssueTypes(projectKey) {
    try {
        const config = await getConfig();
        if (!config.JIRA_URL || !config.JIRA_EMAIL || !config.JIRA_TOKEN) {
            throw new Error('Configuração do Jira incompleta');
        }

        const credentials = btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`);
        
        const response = await fetch(`${config.JIRA_URL}/rest/api/3/project/${projectKey}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const project = await response.json();
        console.log('Tipos de issue disponíveis para', projectKey, ':', project.issueTypes);
        
        // Retornar o primeiro tipo disponível (geralmente Bug ou Task)
        if (project.issueTypes && project.issueTypes.length > 0) {
            return project.issueTypes[0].id;
        }
        
        return ISSUE_TYPE_ID; // Fallback para o ID padrão
    } catch (error) {
        console.error('Erro ao buscar tipos de issue:', error);
        return ISSUE_TYPE_ID; // Fallback para o ID padrão
    }
}

// Função para testar conexão com Jira
async function testJiraConnection() {
    try {
        const config = await getConfig();
        if (!await checkConfig()) {
            return { success: false, error: 'Configurações não encontradas. Por favor, configure as chaves de API.' };
        }

        // Testar conexão básica com Jira (buscar informações do usuário)
        const response = await fetch(`${config.JIRA_URL}/rest/api/3/myself`, {
            headers: {
                'Authorization': `Basic ${btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`)}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: 'Credenciais inválidas. Verifique email e token.' };
            } else {
                return { success: false, error: `Erro na conexão com Jira: ${response.status}` };
            }
        }

        return { success: true, message: 'Conexão com Jira testada com sucesso!' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função para buscar projetos do Jira
async function fetchProjects() {
    try {
        const config = await getConfig();
        if (!config.JIRA_URL || !config.JIRA_EMAIL || !config.JIRA_TOKEN) {
            throw new Error('Configurações básicas não encontradas. Por favor, configure URL, email e token nas opções da extensão.');
        }

        // Criar credenciais base64 para autenticação básica
        const credentials = btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`);

        const response = await fetch(
            `${config.JIRA_URL}/rest/api/3/project/search?maxResults=50`,
            {
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Accept": "application/json"
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar projetos: ${response.status}`);
        }
        
        const data = await response.json();
        return data.values.map(project => ({
            key: project.key,
            name: project.name,
            id: project.id
        }));
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        return [];
    }
}

// Função para buscar usuários do Jira
async function fetchUsers(projectKey = null) {
    try {
        const config = await getConfig();
        if (!config.JIRA_URL || !config.JIRA_EMAIL || !config.JIRA_TOKEN) {
            throw new Error('Configurações básicas não encontradas. Por favor, configure URL, email e token nas opções da extensão.');
        }

        // Usar o projeto selecionado ou o projeto das configurações
        const project = projectKey || config.JIRA_PROJECT;
        if (!project) {
            throw new Error('Nenhum projeto selecionado.');
        }

        // Criar credenciais base64 para autenticação básica
        const credentials = btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`);

        const response = await fetch(
            `${config.JIRA_URL}/rest/api/3/users/search?project=${project}&maxResults=50`,
            {
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Accept": "application/json"
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar usuários: ${response.status}`);
        }
        
        const users = await response.json();
        return users.map(user => ({
            id: user.accountId,
            name: user.emailAddress || user.displayName,
            displayName: user.displayName
        }));
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
}

// Função para buscar status de um projeto
async function fetchProjectStatuses(projectKey) {
    try {
        console.log('Buscando status para projeto:', projectKey);
        const config = await getConfig();
        if (!config.JIRA_URL || !config.JIRA_EMAIL || !config.JIRA_TOKEN) {
            console.error('Configurações básicas não encontradas');
            throw new Error('Configurações básicas não encontradas. Por favor, configure URL, email e token nas opções da extensão.');
        }

        if (!projectKey) {
            console.error('Chave do projeto é obrigatória');
            throw new Error('Chave do projeto é obrigatória.');
        }

        // Criar credenciais base64 para autenticação básica
        const credentials = btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`);

        console.log('Fazendo requisição para:', `${config.JIRA_URL}/rest/api/3/project/${projectKey}/statuses`);

        const response = await fetch(
            `${config.JIRA_URL}/rest/api/3/project/${projectKey}/statuses`,
            {
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Accept": "application/json"
                }
            }
        );
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ao buscar status do projeto: ${response.status} - ${errorText}`);
        }
        
        const statusData = await response.json();
        console.log('Dados recebidos:', statusData);
        
        // Extrair todos os status únicos de todos os tipos de issue
        const allStatuses = new Set();
        statusData.forEach(issueType => {
            if (issueType.statuses) {
                issueType.statuses.forEach(status => {
                    allStatuses.add(JSON.stringify({
                        id: status.id,
                        name: status.name,
                        description: status.description || '',
                        statusCategory: status.statusCategory
                    }));
                });
            }
        });
        
        // Converter de volta para array de objetos e ordenar
        const uniqueStatuses = Array.from(allStatuses)
            .map(statusStr => JSON.parse(statusStr))
            .sort((a, b) => {
                // Ordenar por categoria de status primeiro (To Do, In Progress, Done)
                const categoryOrder = { 'new': 1, 'indeterminate': 2, 'done': 3 };
                const aCategoryOrder = categoryOrder[a.statusCategory?.key] || 999;
                const bCategoryOrder = categoryOrder[b.statusCategory?.key] || 999;
                
                if (aCategoryOrder !== bCategoryOrder) {
                    return aCategoryOrder - bCategoryOrder;
                }
                
                // Se mesma categoria, ordenar por nome
                return a.name.localeCompare(b.name);
            });
        
        console.log('Status únicos encontrados:', uniqueStatuses.length);
        return uniqueStatuses;
    } catch (error) {
        console.error('Erro ao buscar status do projeto:', error);
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
    if (message.action === "testConnection") {
        testJiraConnection().then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Indica que a resposta será assíncrona
    } else if (message.action === "getProjects") {
        fetchProjects().then(projects => {
            sendResponse({ success: true, projects });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    
    if (message.action === "getUsers") {
        fetchUsers(message.projectKey).then(users => {
            sendResponse({ success: true, users });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true;
    }
    
    if (message.action === "getProjectStatuses") {
        fetchProjectStatuses(message.projectKey).then(statuses => {
            sendResponse({ success: true, statuses });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
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
        (async () => {
            try {
                console.log("Mensagem recebida no background:", message);
                console.log("ProjectKey recebido:", message.projectKey);
                console.log("StatusId recebido:", message.statusId);
                
                const config = await getConfig();
                
                // Buscar tipo de issue válido para o projeto
                const validIssueTypeId = await fetchIssueTypes(message.projectKey || config.JIRA_PROJECT);
                console.log("Tipo de issue a ser usado:", validIssueTypeId);
        
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

            // Preparar dados para o Jira
            const issueData = {
                fields: {
                    project: {
                        key: message.projectKey || config.JIRA_PROJECT
                    },
                    summary: `Feedback: ${message.feedback.substring(0, 100)}${message.feedback.length > 100 ? '...' : ''}`,
                    description: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: `Feedback: ${message.feedback}\n\n`
                                    }
                                ]
                            },
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: `URL: ${message.url}\n\n`
                                    }
                                ]
                            },
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: `Elemento capturado:\nTipo: ${elementData.type}\nPosição: ${elementData.x}, ${elementData.y}\nTamanho: ${elementData.width}x${elementData.height}\n\n`
                                    }
                                ]
                            },
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: "Screenshot: "
                                    },
                                    {
                                        type: "text",
                                        text: imageUrl,
                                        marks: [
                                            {
                                                type: "link",
                                                attrs: {
                                                    href: imageUrl
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    issuetype: {
                        id: validIssueTypeId
                    }
                }
            };
            
            // Nota: Campos 'reporter' e 'status' removidos pois não estão disponíveis na tela de criação
            // O reporter será automaticamente definido como o usuário autenticado
            // O status será definido como o padrão do projeto
            
            console.log("Dados a serem enviados para o Jira:", issueData);
            
            // Criar credenciais base64 para autenticação básica
            const credentials = btoa(`${config.JIRA_EMAIL}:${config.JIRA_TOKEN}`);
            
            // Enviar para o Jira
            return fetch(`${config.JIRA_URL}/rest/api/3/issue`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(issueData)
            });
        })
        .then(async response => {
            const data = await response.json();
            if (response.ok && data.key) {
                sendResponse({ 
                    success: true, 
                    issueKey: data.key,
                    issueUrl: `${config.JIRA_URL}/browse/${data.key}`
                });
            } else {
                console.error('Erro na resposta do Jira:', data);
                sendResponse({
                    success: false,
                    error: data.errorMessages ? data.errorMessages.join(', ') : 'Erro ao criar issue no Jira'
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
            } catch (error) {
                console.error('Erro geral ao processar sendFeedback:', error);
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        })();
        return true;
    }
});