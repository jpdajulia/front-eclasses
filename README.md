# Front E-Classes (GamerClass)

Interface em HTML/CSS/JS puro. Consome a API (`api-eclasses`) e faz GET, POST, PUT e DELETE de jogos, times, competidores e confrontos.

## Como rodar

1. Deixe a API rodando (veja o README dela).
2. Confira a `BASE_URL` em `service/api.js` (padrão: `http://localhost:3000/api/`).
3. Abra o front por um servidor local (recomendado), na pasta do front:
   ```bash
   npx serve .
   ```
   ou use a extensão **Live Server** do VS Code. Abrir o `index.html` direto também funciona.

## Estrutura

- `index.html` — telas
- `service/api.js` — chamadas à API (GET/POST/PUT/DELETE)
- `controller/app.js` — estado, renderização, formulários, editar/excluir
- `style/` — estilos
