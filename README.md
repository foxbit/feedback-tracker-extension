# Feedback Tracker Extension

Extensão do Chrome para coletar feedback visual de elementos em páginas web e criar issues no Jira. Versão 2.0.0

## Funcionalidades

- Seleção visual de elementos na página com destaque zebrado
- Sistema de feedback com usuários do Jira
- Integração com Jira para criação automática de issues
- Interface moderna e intuitiva com sistema de passos
- Persistência de preferências do usuário
- Configuração segura de credenciais de API
- Feedback visual durante a seleção de elementos
- Tratamento de erros e notificações ao usuário
- Upload automático de screenshots como anexo

## Configuração

Para usar a extensão, você precisará configurar as seguintes credenciais:

1. **Jira**
   - URL do Jira (ex: https://suaempresa.atlassian.net)
   - Email do usuário
   - API Token (gerado nas configurações de segurança do Atlassian)
   - Chave do projeto onde os issues serão criados

2. **ImgBB**
   - Chave de API para upload de screenshots

### Como configurar

1. Instale a extensão no Chrome
2. Clique com o botão direito no ícone da extensão
3. Selecione "Opções"
4. Preencha as credenciais necessárias
5. Clique em "Testar Configuração" para validar
6. Clique em "Salvar"

### Como obter o API Token do Jira

1. Acesse https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Dê um nome para o token
4. Copie o token gerado e cole nas configurações da extensão

## Integração com Jira

A extensão cria automaticamente issues no Jira com as seguintes informações:

### Campos do Issue
- **Summary**: Resumo do feedback (primeiros 100 caracteres)
- **Description**: Descrição completa incluindo:
  - Texto do feedback
  - URL da página
  - Informações do elemento capturado (tipo, posição, tamanho)
  - Link para a screenshot
- **Issue Type**: Bug (configurável)
- **Project**: Projeto configurado nas opções
- **Reporter**: Usuário selecionado na extensão

### Usuários
A extensão busca automaticamente os usuários do projeto Jira configurado, permitindo selecionar quem será o reporter do issue.

## Como usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Selecione o usuário que será o reporter do issue (se não tiver preferência salva)
3. Clique em "Selecionar Elemento"
4. Clique e arraste para selecionar uma área da página ou clique em um elemento específico
5. Digite seu feedback no campo de texto
6. Clique em "Enviar"
7. Um novo issue será criado no Jira com a screenshot e informações do feedback

## Segurança

- Todas as chaves de API são armazenadas localmente no navegador
- Nenhuma chave é exposta no código fonte
- As chamadas de API são feitas de forma segura através do background script
- As preferências do usuário são salvas localmente

## Desenvolvimento

Para contribuir com o projeto:

1. Clone o repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta do projeto

## Estrutura do Projeto

```
├── manifest.json      # Configuração da extensão
├── popup.html        # Interface principal
├── popup.js         # Lógica da interface
├── popup.css        # Estilos da interface
├── content.js       # Script injetado nas páginas
├── background.js    # Script de background
├── options.html     # Página de configurações
├── options.js       # Lógica das configurações
└── icon.png         # Ícone da extensão
```

## Versão 2.0.0

Esta versão inclui a migração completa para integração com Jira:
- Sistema completo de feedback integrado ao Jira
- Criação automática de issues com screenshots
- Busca automática de usuários do projeto
- Interface moderna e responsiva
- Sistema de passos intuitivo
- Persistência de preferências
- Configuração segura de credenciais
- Validação de configurações com teste de conectividade

## Licença

MIT