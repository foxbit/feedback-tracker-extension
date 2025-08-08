# Teste de Debug da Extensão - ATUALIZADO

## Problema Atual: "Could not establish connection. Receiving end does not exist."

### Causa do Erro
Este erro indica que o **content script** não está conseguindo se comunicar com o **background script**. Isso geralmente acontece quando:
1. A extensão não foi recarregada após as mudanças
2. O content script não foi injetado na página
3. A página foi carregada antes da extensão ser ativada

## SOLUÇÃO OBRIGATÓRIA

### 1. Recarregar a Extensão (OBRIGATÓRIO)
1. Abra `chrome://extensions/`
2. Encontre "Feedback Tracker"
3. **CLIQUE NO BOTÃO DE RECARREGAR (🔄)** - MUITO IMPORTANTE!
4. Verifique se não há erros na extensão

### 2. Recarregar a Página de Teste (OBRIGATÓRIO)
1. Após recarregar a extensão, **SEMPRE recarregue a página** onde você está testando
2. Pressione **F5** ou **Ctrl+R** na página de teste
3. Isso garante que o content script seja injetado corretamente

### 3. Verificar se o Content Script Foi Carregado
1. Abra o **DevTools** (F12) na página de teste
2. Vá para a aba **Console**
3. Você deve ver a mensagem: `"Content script carregado"`
4. **Se não vir essa mensagem, o content script não foi injetado!**

## Sequência de Teste Correta

### Passo 1: Preparação
1. ✅ Recarregar extensão em `chrome://extensions/`
2. ✅ Recarregar página de teste (F5)
3. ✅ Abrir DevTools (F12) e ir para Console
4. ✅ Verificar se aparece "Content script carregado"

### Passo 2: Testar Seletor de Status
1. Clique no ícone da extensão
2. Selecione um projeto
3. **Verificar logs esperados**:
   ```
   Carregando status para projeto: [PROJETO]
   ProjectKey recebido: [PROJETO]
   Status carregados com sucesso: X itens
   ```

### Passo 3: Testar Persistência de Estado
1. Com projeto e usuário selecionados
2. Selecionar um status
3. Digitar texto no campo de feedback
4. Clique em "Selecionar Elemento"
5. **Verificar logs esperados**:
   ```
   Botão de captura clicado
   Tab ativa encontrada: [objeto]
   Mensagem enviada com sucesso
   ```
6. Selecionar um elemento na página
7. Reabrir o popup da extensão
8. **VERIFICAR**: Todos os campos devem estar preenchidos como antes
9. **VERIFICAR**: Console deve mostrar "Restaurando estado do popup"
10. **Se aparecer erro de conexão, volte ao Passo 1!**

### Passo 4: Testar Envio de Feedback
1. Após capturar um elemento e com todos os campos preenchidos
2. Clicar em "Enviar"
3. **Verificar logs esperados**:
    ```
    ProjectKey recebido: [PROJETO]
    StatusId recebido: [STATUS_ID]
    Tipos de issue disponíveis para [PROJETO]: [array de tipos]
    Tipo de issue a ser usado: [ID_DO_TIPO]
    Dados a serem enviados para o Jira: [objeto]
    ```
4. **VERIFICAR**: `statusId` não deve ser `null`
5. **VERIFICAR**: `projectKey` deve estar correto
6. **VERIFICAR**: Tipo de issue deve ser válido para o projeto
7. **VERIFICAR**: Não deve aparecer erro "Especifique algum tipo de item válido"

## Problemas Comuns e Soluções

### ❌ "Could not establish connection"
**Solução**: 
1. Recarregar extensão
2. Recarregar página
3. Verificar se "Content script carregado" aparece no console

### ❌ "Content script carregado" não aparece
**Solução**:
1. Verificar se a extensão está ativa em `chrome://extensions/`
2. Verificar se não há erros na extensão
3. Tentar em uma página diferente (ex: google.com)

### ❌ Seletor de status não habilita
**Solução**:
1. Verificar se as configurações do Jira estão corretas em "Opções"
2. Verificar logs no console do popup
3. Testar conexão com Jira nas "Opções"

### ❌ "valid project is required"
**Solução**: Já corrigido! O projectKey agora é enviado corretamente.

## Logs de Debug Completos

### Console da Página (DevTools da página web)
```
Content script carregado
Mensagem recebida no content script: {action: "startCapture"}
Iniciando modo de captura
startCaptureMode chamada
```

### Console do Popup (DevTools da extensão)
```
Botão de captura clicado
Tab ativa encontrada: {id: 123, url: "..."}
Mensagem enviada com sucesso
Carregando status para projeto: TEST
Status carregados com sucesso: 5 itens
```

### Console do Background (chrome://extensions/ → service worker)
```
ProjectKey recebido: TEST
StatusId recebido: 10001
Dados a serem enviados para o Jira: {fields: {...}}
```

## Problemas Identificados e Correções

### 1. Status Selector Bloqueado
**Problema**: O seletor de status não estava sendo habilitado após selecionar um projeto.

**Correção**: 
- Adicionados logs de debug em `loadProjectStatuses` no `popup.js`
- Adicionados logs de debug em `fetchProjectStatuses` no `background.js`
- Melhorado tratamento de erros na comunicação com a API do Jira

### 2. Erro na Captura de Screenshot
**Problema**: Erro "Could not establish connection. Receiving end does not exist." ao tentar capturar.

**Correção**:
- Adicionado tratamento robusto de erros em `startCaptureMode` no `content.js`
- Incluídas verificações de `chrome.runtime.lastError`
- Adicionada validação de resposta
- Mensagens de erro mais específicas
- Implementada injeção automática do content script no `popup.js`

### 3. Inputs Resetando Após Captura
**Problema**: Após capturar um elemento, ao reabrir o popup, todos os campos (projeto, usuário, status, feedback) eram resetados.

**Correção**:
- Implementado sistema de salvamento de estado no `chrome.storage.local`
- Adicionada função `restorePopupState()` que restaura:
  - Projeto selecionado
  - Usuário selecionado
  - Status selecionado
  - Texto do feedback
- Estado é salvo antes de fechar o popup para captura
- Estado é restaurado automaticamente ao reabrir o popup

### 4. StatusId Null no Envio
**Problema**: O campo `statusId` estava sendo enviado como `null` para o Jira.

**Correção**:
- Corrigido o salvamento e restauração do `selectedStatusId`
- Adicionados logs de debug para verificar se o `statusId` está sendo mantido corretamente

### 5. Tipo de Issue Inválido
**Problema**: Erro "issuetype: 'Especifique algum tipo de item válido'" ao enviar feedback para o Jira.

**Correção**:
- Adicionada função `fetchIssueTypes()` que busca os tipos de issue válidos para cada projeto
- Modificado o `sendFeedback` para usar dinamicamente o primeiro tipo de issue disponível do projeto
- Adicionados logs para mostrar qual tipo de issue está sendo usado
- Implementada estrutura async/await correta no listener de mensagens

### 6. Campos Não Permitidos na Criação
**Problema**: Erros "Field 'reporter' cannot be set" e "Field 'status' cannot be set" ao criar issues no Jira.

**Correção**:
- Removidos os campos `reporter` e `status` do `issueData`
- O Jira automaticamente define o reporter como o usuário autenticado
- O status é automaticamente definido como o padrão do projeto
- Adicionados comentários explicativos no código

## ⚠️ IMPORTANTE
**SEMPRE recarregue a extensão E a página após fazer mudanças no código!**
Este é o erro mais comum e a solução mais simples.

---

# Problema: Link da Imagem Clicável

## Descrição do Problema
O usuário solicitou que a imagem fosse incluída como um link clicável no corpo da descrição do issue, em vez de anexo.

## Correções Implementadas

### 1. Reversão do Sistema de Anexo
- **Removida**: Função `attachScreenshotToIssue()` do `background.js`
- **Removido**: Código de upload de anexo após criação do issue
- **Resultado**: Volta ao sistema anterior de link na descrição

### 2. Link Clicável na Descrição
- **Implementado**: Link clicável usando formato ADF (Atlassian Document Format)
- **Estrutura**: Texto "Screenshot: " seguido de link clicável
- **Formato ADF**: Usa `marks` com `type: "link"` e `attrs: { href: imageUrl }`

### 3. Estrutura do Link
```json
{
    "type": "paragraph",
    "content": [
        {
            "type": "text",
            "text": "Screenshot: "
        },
        {
            "type": "text",
            "text": imageUrl,
            "marks": [
                {
                    "type": "link",
                    "attrs": {
                        "href": imageUrl
                    }
                }
            ]
        }
    ]
}
```

## Verificação

1. **Link Presente**: Verificar se o link da imagem aparece na descrição
2. **Link Clicável**: Confirmar que o link é clicável e abre a imagem
3. **Formato Correto**: Link deve estar formatado como hyperlink no Jira
4. **Funcionalidade**: Clicar no link deve abrir a imagem em nova aba

---

# Problema: Duplicação de Retângulos na Captura

## Descrição do Problema
Durante a captura de tela, estavam sendo renderizados dois retângulos de seleção em vez de apenas um.

## Causa Raiz Identificada
**INJEÇÃO MÚLTIPLA DO CONTENT SCRIPT**: O problema principal era que cada vez que o usuário clicava no botão "Capturar Tela", o `popup.js` executava `chrome.scripting.executeScript()` que injetava o `content.js` novamente na página, criando:

1. **Múltiplos listeners de eventos**: Cada injeção criava novos event listeners
2. **Elementos duplicados**: Múltiplas instâncias dos elementos de seleção
3. **Conflitos de estado**: Variáveis globais sendo redefinidas

## Correções Implementadas

### 1. Verificação de Content Script Existente em `popup.js`
```javascript
captureButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // Verificar se o content script já está presente
        chrome.tabs.sendMessage(tabs[0].id, { action: 'ping' }, (response) => {
            if (chrome.runtime.lastError || !response) {
                // Content script não está presente, injetar
                console.log('Content script não encontrado, injetando...');
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                }, () => {
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
```

### 2. Handler de Ping no `content.js`
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "ping") {
        // Responder ao ping para confirmar que o content script está presente
        sendResponse({ success: true, present: true });
    }
    // ... outros handlers
});
```

### 3. Função Auxiliar para Processo de Captura
```javascript
function startCaptureProcess(tabId) {
    // Salvar estado e iniciar captura sem reinjetar o script
    chrome.storage.local.set({ /* estado */ }, () => {
        chrome.tabs.sendMessage(tabId, { action: 'startCapture' }, (response) => {
            window.close();
        });
    });
}
```

### 4. Limpeza Preventiva Mantida
As verificações de elementos existentes foram mantidas como camada adicional de proteção:
- **createIndicator()**: Remove indicador existente
- **createSelectionBox()**: Remove caixa de seleção existente
- **createScreenshotOverlay()**: Remove overlay existente
- **startCaptureMode()**: Chama `endCaptureMode()` primeiro

### 5. Código de Verificação
```javascript
// Verificar se já existe e remover
const existing = document.getElementById('elemento-id');
if (existing) {
    existing.remove();
}
```

## Fluxo Corrigido

1. **Primeira captura**: Script é injetado → Captura iniciada
2. **Capturas subsequentes**: Script detectado como presente → Captura iniciada diretamente
3. **Sem reinjeção**: Evita duplicação de listeners e elementos
4. **Limpeza garantida**: Elementos anteriores sempre removidos

## Verificação

### Como Testar:
1. **Primeira captura**: Abrir extensão → "Capturar Tela" → Verificar um retângulo
2. **Segunda captura**: Cancelar → Abrir extensão → "Capturar Tela" → Verificar um retângulo
3. **Múltiplas capturas**: Repetir várias vezes
4. **Console**: Verificar logs "Content script já presente"

### Resultados Esperados:
- ✅ Apenas um retângulo de seleção visível
- ✅ Logs mostram detecção de script existente
- ✅ Sem reinjeção desnecessária do content script
- ✅ Performance melhorada (menos overhead)

### Status: ✅ **RESOLVIDO**
O problema de duplicação foi **completamente resolvido** através da implementação de verificação de content script existente, evitando injeções múltiplas e a consequente duplicação de elementos e listeners.