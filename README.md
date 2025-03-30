# Feedback Tracker Extension

Extensão do Chrome para coletar feedback visual de elementos em páginas web. Versão 1.0.0

## Funcionalidades

- Seleção visual de elementos na página com destaque zebrado
- Sistema de feedback com usuários e projetos
- Integração com Airtable para armazenamento
- Interface moderna e intuitiva com sistema de passos
- Persistência de preferências do usuário
- Configuração segura de chaves de API
- Feedback visual durante a seleção de elementos
- Tratamento de erros e notificações ao usuário

## Configuração

Para usar a extensão, você precisará configurar as seguintes chaves de API:

1. **Airtable**
   - Token de acesso pessoal
   - ID da base

2. **ImgBB**
   - Chave de API

### Como configurar

1. Instale a extensão no Chrome
2. Clique com o botão direito no ícone da extensão
3. Selecione "Opções"
4. Preencha as chaves de API necessárias
5. Clique em "Salvar"

## Estrutura do Airtable

A extensão requer três tabelas no Airtable:

### Tabela "Users"
- Campo "Name" (Single line text)

### Tabela "Feedbacks"
- Campo "Element" (Long text)
- Campo "Feedback" (Long text)
- Campo "URL" (URL)
- Campo "Usuario" (Single line text)
- Campo "Projeto" (Single line text)

### Tabela "Projetos"
- Campo "Nome" (Single line text)

## Como usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Selecione o projeto (se não tiver preferência salva)
3. Selecione o usuário (se não tiver preferência salva)
4. Clique em "Selecionar Elemento"
5. Clique no elemento da página que deseja dar feedback
6. Digite seu feedback no campo de texto
7. Clique em "Enviar"

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

## Versão 1.0.0

Esta é a primeira versão estável da extensão, incluindo todas as funcionalidades básicas:
- Sistema completo de feedback
- Integração com Airtable
- Interface moderna e responsiva
- Sistema de passos intuitivo
- Persistência de preferências
- Configuração segura de APIs

## Licença

MIT 