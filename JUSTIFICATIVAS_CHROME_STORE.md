# Justificativas para Cadastro no Chrome Web Store

## Descrição do Único Propósito

**Propósito único**: Capturar elementos visuais de páginas web e criar automaticamente issues no Jira com screenshots para facilitar o processo de feedback e bug reporting.

A extensão tem uma função específica e bem definida: permitir que usuários selecionem elementos em páginas web, capturem screenshots automaticamente e enviem feedback diretamente para projetos Jira configurados.

## Justificativas para Permissões

### 1. activeTab
**Justificativa**: Necessária para acessar a aba ativa onde o usuário deseja capturar elementos. A extensão precisa interagir com o conteúdo da página atual para:
- Permitir seleção visual de elementos
- Injetar scripts de captura
- Obter informações da página (URL, título)
- Capturar screenshots do elemento selecionado

### 2. desktopCapture
**Justificativa**: Essencial para capturar screenshots dos elementos selecionados pelo usuário. Esta permissão é usada exclusivamente para:
- Gerar screenshots automáticos dos elementos selecionados
- Criar evidências visuais para anexar aos issues do Jira
- Melhorar a qualidade do feedback com contexto visual

### 3. Host Permissions (<all_urls>)
**Justificativa**: Necessária para permitir que a extensão funcione em qualquer site onde o usuário precise reportar feedback. As permissões específicas são:
- `https://api.imgbb.com/*`: Para upload de imagens capturadas
- `https://*.atlassian.net/*`: Para comunicação com APIs do Jira
- `<all_urls>`: Para permitir captura de elementos em qualquer site

### 4. Código Remoto
**Justificativa**: A extensão NÃO utiliza código remoto. Todo o código é empacotado localmente nos arquivos:
- `background.js`: Service worker local
- `content.js`: Script de conteúdo local
- `popup.js`: Script do popup local
- `options.js`: Script de opções local

Nenhum código é carregado de fontes externas durante a execução.

### 5. scripting
**Justificativa**: Necessária para injetar scripts de captura nas páginas web. Usada para:
- Injetar funcionalidade de seleção de elementos
- Executar scripts de captura de screenshot
- Comunicar entre content script e background script
- Implementar a interface de seleção visual

### 6. storage
**Justificativa**: Essencial para armazenar configurações do usuário localmente. Usada para:
- Salvar configurações de conexão com Jira (URL, token, usuário)
- Armazenar preferências de projeto selecionado
- Manter estado da extensão entre sessões
- Cache de dados de projetos para melhor performance

### 7. tabs
**Justificativa**: Necessária para obter informações da aba atual e gerenciar contexto. Usada para:
- Obter URL e título da página para contexto do feedback
- Identificar a aba ativa para captura
- Gerenciar estado entre diferentes abas
- Comunicação entre popup e content scripts

## Conformidade com Políticas de Privacidade

### Coleta de Dados
- **Dados coletados**: Apenas configurações de usuário (URL Jira, token de acesso, preferências)
- **Armazenamento**: Todos os dados são armazenados localmente no navegador
- **Transmissão**: Dados são enviados apenas para o Jira configurado pelo usuário
- **Terceiros**: Apenas ImgBB para hospedagem temporária de imagens

### Uso de Dados
- **Propósito único**: Criar issues no Jira com feedback visual
- **Não compartilhamento**: Dados não são compartilhados com terceiros além do Jira do usuário
- **Transparência**: Usuário tem controle total sobre configurações e dados

### Segurança
- **Criptografia**: Comunicação via HTTPS
- **Tokens**: Armazenados localmente de forma segura
- **Acesso limitado**: Apenas aos recursos necessários para funcionamento

## Coleta de Dados do Usuário

### Dados que a extensão coleta:

**❌ Informações de identificação pessoal**: NÃO coletamos nome, endereço, e-mail, idade ou números de identificação.

**❌ Informações sobre saúde**: NÃO coletamos dados de saúde, histórico médico ou informações relacionadas.

**❌ Informações financeiras e de pagamento**: NÃO coletamos dados financeiros, cartões de crédito ou informações de pagamento.

**✅ Informações de autenticação**: Coletamos APENAS tokens de API do Jira fornecidos voluntariamente pelo usuário para autenticação com sua instância Jira. Estes tokens são armazenados localmente no navegador e nunca compartilhados.

**❌ Comunicações pessoais**: NÃO acessamos e-mails, mensagens ou conversas.

**✅ Local**: Coletamos APENAS a URL da página atual onde o usuário está capturando feedback, necessária para fornecer contexto ao issue criado no Jira.

**✅ Histórico da Web**: Coletamos APENAS o título e URL da página atual durante a captura de feedback, usado exclusivamente para contexto do issue.

**❌ Atividade do usuário**: NÃO monitoramos navegação, cliques, mouse, rolagem ou teclas pressionadas além da interação específica com a extensão.

**✅ Conteúdo do site**: Capturamos APENAS screenshots dos elementos específicos selecionados pelo usuário para anexar ao feedback no Jira.

### Finalidade dos dados coletados:
- **Tokens de API**: Autenticação com Jira do usuário
- **URL/Título da página**: Contexto para o issue criado
- **Screenshots**: Evidência visual do feedback reportado
- **Configurações**: Preferências do usuário (projeto, servidor Jira)

### Armazenamento e compartilhamento:
- **Local**: Todos os dados são armazenados localmente no navegador
- **Compartilhamento**: Dados são enviados APENAS para o servidor Jira configurado pelo usuário
- **Terceiros**: Imagens são temporariamente hospedadas no ImgBB para anexar ao Jira

## Declarações de Conformidade

### ✅ Declarações Verdadeiras:

**✅ Não vendo nem transfiro dados do usuário a terceiros** fora dos casos de uso aprovados:
- Os únicos terceiros que recebem dados são:
  - Servidor Jira do próprio usuário (para criar issues)
  - ImgBB (para hospedagem temporária de screenshots)

**✅ Não uso nem transfiro dados do usuário para fins não relacionados ao único objetivo do item:**
- Todos os dados coletados são usados exclusivamente para criar issues no Jira com feedback visual
- Nenhum dado é usado para analytics, publicidade ou outros fins

**✅ Não uso nem transfiro dados do usuário para determinar credibilidade ou para fins de empréstimo:**
- A extensão não realiza análises de crédito, scoring ou avaliações financeiras
- Não há coleta de dados para fins de empréstimo ou avaliação de risco

## Verificação de E-mail

Para completar o processo de publicação, será necessário verificar o e-mail de contato na aba "Conta" do painel de desenvolvedor do Chrome Web Store.

---

**Resumo**: Esta extensão tem um propósito específico e bem definido, coleta apenas dados essenciais para sua funcionalidade, armazena tudo localmente, e compartilha informações apenas com os serviços necessários (Jira do usuário e ImgBB para imagens) mantendo total transparência sobre o uso dos dados.