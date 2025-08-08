# Guia de Teste da Extensão Feedback Tracker

## Problema Identificado
O botão "Selecionar Elemento" não estava funcionando. Foram feitas as seguintes correções:

1. **Adicionados logs de debug** para identificar onde o problema estava ocorrendo
2. **Removido 'type: module'** do manifest.json que pode causar problemas com service workers
3. **Melhorada a comunicação** entre popup e content script

## Como Testar

### Passo 1: Recarregar a Extensão
1. Abra o Chrome
2. Vá para `chrome://extensions/`
3. Encontre a extensão "Feedback Tracker"
4. Clique no botão de "Recarregar" (ícone de refresh)

### Passo 2: Testar a Funcionalidade
1. Abra a página de teste (`test.html`) que foi criada
2. Abra o DevTools (F12) e vá para a aba "Console"
3. Clique no ícone da extensão na barra de ferramentas
4. Clique no botão "Selecionar Elemento"
5. Verifique os logs no console:
   - Deve aparecer "Botão de captura clicado"
   - Deve aparecer "Content script carregado"
   - Deve aparecer "Mensagem recebida no content script"

### Passo 3: Verificar se a Captura Funciona
1. Após clicar em "Selecionar Elemento", o cursor deve mudar para uma cruz
2. Você deve conseguir selecionar uma área na página
3. A área selecionada deve ser capturada

## Possíveis Problemas e Soluções

### Se ainda não funcionar:
1. **Recarregue a página** onde está testando
2. **Recarregue a extensão** novamente
3. **Verifique o console** para mensagens de erro
4. **Teste em uma página diferente** (como google.com)

### Logs Esperados no Console:
```
Content script carregado
Botão de captura clicado
Tab ativa encontrada: {objeto da tab}
Mensagem recebida no content script: {action: "startCapture"}
Iniciando modo de captura
startCaptureMode chamada
Capturando tela
```

## Próximos Passos
Se o teste for bem-sucedido, você pode:
1. Remover os logs de debug (se desejar)
2. Testar em diferentes sites
3. Configurar suas credenciais do Jira e ImgBB
4. Testar o envio completo de feedback