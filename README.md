# Portal C-137 — Explorador Rick and Morty

Projeto acadêmico de desenvolvimento front-end que consome a API pública **The Rick and Morty API** e apresenta personagens em cards criados dinamicamente com JavaScript.

## Funcionalidades

- Consulta de personagens diretamente na API com `fetch`.
- Cards criados pelo JavaScript usando `document.createElement()` e `appendChild()`.
- Exibição de imagem, nome, status, espécie, gênero, origem e localização.
- Busca por nome e filtros por status e espécie.
- Paginação baseada nos dados `info.next`, `info.prev`, `info.pages` e `info.count` retornados pela API.
- Estados de carregamento, resultado vazio e falha de conexão.
- Layout responsivo para desktop, tablet e celular.

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Fetch API
- The Rick and Morty API

Não são utilizados frameworks ou bibliotecas JavaScript.

## Como executar localmente

Como o projeto utiliza apenas arquivos estáticos, não é necessário instalar dependências ou executar um processo de build.

**Opção 1 — VS Code:** abra a pasta no Visual Studio Code e execute o `index.html` com a extensão Live Server.

**Opção 2 — Python:** abra o terminal na pasta do projeto e execute:

```bash
python3 -m http.server 5500
```

Depois, acesse `http://localhost:5500` no navegador.

É necessária uma conexão com a internet para consultar a API e carregar as imagens dos personagens.

## API utilizada

- Documentação: https://rickandmortyapi.com/documentation
- Endpoint de personagens: https://rickandmortyapi.com/api/character

A aplicação utiliza o recurso REST de personagens, com filtros `name`, `status` e `species`, além do parâmetro `page` para navegar pelos resultados.

## Publicação no GitHub Pages

1. Crie um repositório público no GitHub, por exemplo `portal-c137-rick-and-morty`.
2. Envie os arquivos e pastas deste projeto para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`, depois salve.
6. Aguarde a publicação e acesse o endereço informado pelo GitHub Pages.

## Estrutura do projeto

```text
rick-and-morty-explorer/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Observação acadêmica

Os dados dos personagens são obtidos da API no momento de cada consulta. A aplicação não mantém uma conexão contínua para receber atualizações automáticas em tempo real; ela realiza novas requisições quando a página é carregada, quando uma busca é enviada ou quando o usuário navega entre páginas.
