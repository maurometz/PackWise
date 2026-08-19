# PackWise

MVP do planejador de viagens e checklist inteligente colaborativo.

## Requisitos

- Node.js 20+
- Docker Desktop

## Executar localmente

1. Copie `server/.env.example` para `server/.env`.
2. Instale as dependências com `npm install`.
3. Suba o banco com `docker compose up -d`.
4. Gere o cliente Prisma e aplique o schema:

   `npm run db:generate`

   `npm run db:push`

5. Inicie frontend e API com `npm run dev`.

O frontend ficará em `http://localhost:5173` e a API em `http://localhost:3333`.
