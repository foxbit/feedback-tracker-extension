# Feedback Tracker - Extensão Chrome

Uma extensão para o Chrome que permite selecionar elementos em uma página web e enviar feedbacks para o Airtable.

## Funcionalidades

- Seleção visual de elementos na página
- Interface intuitiva para envio de feedbacks
- Integração com Airtable para armazenamento dos dados
- Feedback visual durante a seleção de elementos
- Tratamento de erros e notificações ao usuário

## Tecnologias Utilizadas

- JavaScript
- Chrome Extension API
- Airtable API
- HTML/CSS

## Instalação

1. Clone este repositório:
```bash
git clone [URL_DO_SEU_REPOSITORIO]
```

2. Abra o Chrome e navegue até `chrome://extensions/`

3. Ative o "Modo do desenvolvedor" no canto superior direito

4. Clique em "Carregar sem compactação" e selecione a pasta do projeto

## Configuração

1. Crie uma base no Airtable com a seguinte estrutura:
   - Elemento (texto longo)
   - Feedback (texto longo)
   - URL (texto)
   - Data (data/hora)

2. Configure sua chave API do Airtable no arquivo `background.js`

## Uso

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Clique em "Selecionar Elemento"
3. Clique no elemento da página que deseja dar feedback
4. Digite seu feedback no campo de texto
5. Clique em "Enviar"

## Estrutura do Projeto

```
├── manifest.json      # Configuração da extensão
├── popup.html        # Interface principal
├── popup.js         # Lógica da interface
├── popup.css        # Estilos da interface
├── content.js       # Script injetado nas páginas
├── background.js    # Script de background
└── icon.png         # Ícone da extensão
```

## Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Segurança

⚠️ **Importante**: Nunca compartilhe suas chaves API do Airtable. Mantenha-as em um arquivo de configuração separado que não seja versionado.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 