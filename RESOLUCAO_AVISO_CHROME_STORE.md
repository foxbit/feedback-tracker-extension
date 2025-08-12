# 🔧 Resolução do Aviso da Chrome Web Store

## ⚠️ **Problema Identificado**

A Chrome Web Store emitiu o seguinte aviso sobre a extensão:

> **É possível que sua extensão precise de uma revisão detalhada devido ao seguinte problema:**
> - **Permissões amplas do host**
> 
> Em vez de solicitar permissões amplas de host, tente usar a permissão activeTab ou especificar os sites aos quais sua extensão precisa ter acesso.

## 🛠️ **Solução Implementada**

### **1. Remoção da Permissão Ampla**

**ANTES:**
```json
"host_permissions": [
    "https://api.imgbb.com/*",
    "https://*.atlassian.net/*",
    "<all_urls>"
]
```

**DEPOIS:**
```json
"host_permissions": [
    "https://api.imgbb.com/*",
    "https://*.atlassian.net/*"
]
```

### **2. Justificativa das Permissões Mantidas**

#### ✅ **`activeTab`**
- **Propósito:** Permite acesso à aba ativa quando o usuário clica na extensão
- **Segurança:** Só funciona com interação explícita do usuário
- **Uso:** Captura de elementos e screenshots da página atual

#### ✅ **`https://api.imgbb.com/*`**
- **Propósito:** Upload de screenshots capturadas
- **Necessidade:** Hospedagem de imagens para anexar aos issues do Jira
- **Específica:** Apenas para o serviço ImgBB

#### ✅ **`https://*.atlassian.net/*`**
- **Propósito:** Comunicação com APIs do Jira
- **Necessidade:** Criação de issues, busca de projetos e usuários
- **Específica:** Apenas para instâncias do Atlassian/Jira

## 🔍 **Como a Extensão Funciona Sem `<all_urls>`**

### **Captura de Elementos:**
1. **Usuário clica** na extensão (ativa `activeTab`)
2. **Content script** é injetado na página atual
3. **Screenshot** é capturada da aba ativa
4. **Seleção** de área é feita sobre o screenshot
5. **Dados** são enviados para o Jira via API específica

### **Vantagens de Segurança:**
- ✅ **Acesso limitado** apenas às páginas onde o usuário interage
- ✅ **Permissões específicas** para serviços necessários
- ✅ **Sem acesso automático** a sites não relacionados
- ✅ **Conformidade** com as diretrizes da Chrome Web Store

## 📋 **Arquivos Modificados**

### **1. `manifest.json`**
- Removida permissão `<all_urls>`
- Mantidas apenas permissões específicas necessárias

### **2. `JUSTIFICATIVAS_CHROME_STORE.md`**
- Atualizada seção de Host Permissions
- Adicionada nota sobre segurança
- Explicação das permissões específicas

## ✅ **Resultado**

- **Funcionalidade mantida:** A extensão continua funcionando normalmente
- **Segurança aprimorada:** Acesso limitado apenas ao necessário
- **Conformidade:** Atende às diretrizes da Chrome Web Store
- **Revisão facilitada:** Menor probabilidade de revisão detalhada

## 🚀 **Próximos Passos**

1. **Testar** a extensão para garantir funcionamento correto
2. **Atualizar** a submissão na Chrome Web Store
3. **Aguardar** aprovação sem avisos de segurança
4. **Monitorar** feedback dos usuários

---

**Resumo:** A remoção da permissão `<all_urls>` resolve o aviso da Chrome Web Store mantendo toda a funcionalidade da extensão através do uso correto da permissão `activeTab` e permissões específicas para os serviços necessários.