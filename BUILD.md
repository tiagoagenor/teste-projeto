# 🛠️ Guia de Build e Execução do Projeto

Este guia contém o passo a passo completo para compilar, configurar e rodar o projeto **Filmow Clone** (Node.js, Express, React/Vite e MongoDB).

---

## 📋 Pré-requisitos

- **Node.js** (v18.x ou superior)
- **npm** (v9.x ou superior)
- **Docker** e **Docker Compose** *(Recomendado)*

---

## 🐳 Opção 1: Build e Execução via Docker Compose (Recomendado)

Esta é a forma mais simples e rápida, pois o Docker gerenciará tanto o banco **MongoDB** quanto a aplicação Node.js automaticamente.

### 1. Construir e Iniciar os Containers
No terminal, dentro da pasta raiz do projeto, execute:

```bash
docker compose up --build -d
```

> **Nota:** O Docker irá:
> - Baixar as imagens do MongoDB e Node.js.
> - Instalar todas as dependências.
> - Gerar o build de produção do frontend React.
> - Iniciar o MongoDB e a API Node.js.
> - Semear automaticamente o banco MongoDB com usuários e filmes de demonstração.

### 2. Acessar a Aplicação
- 🌐 **Aplicação Web:** [http://localhost:5001](http://localhost:5001)
- 🔌 **API Endpoints:** [http://localhost:5001/api](http://localhost:5001/api)

### 3. Comandos Úteis do Docker

- **Ver logs da aplicação:**
  ```bash
  docker compose logs -f app
  ```

- **Verificar o status dos containers:**
  ```bash
  docker compose ps
  ```

- **Parar os containers:**
  ```bash
  docker compose down
  ```

---

## 💻 Opção 2: Build e Execução Manual (Desenvolvimento Local)

Se você preferir rodar a aplicação diretamente no seu ambiente local (sem Docker):

### 1. Instalar Dependências
Instale as dependências da raiz e do frontend cliente executando:

```bash
npm install
```

*(O comando acima executará automaticamente o `npm install` no diretório `client` através do script `postinstall`).*

### 2. Configurar Variáveis de Ambiente
Verifique se o arquivo `.env` na raiz do projeto possui as configurações corretas:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/filmow
JWT_SECRET=filmow_super_secret_key_2026_jwt_token
TMDB_API_KEY=
TMDB_BASE_URL=https://api.themoviedb.org/3
```

> Certifique-se de que o **MongoDB** esteja rodando localmente na sua máquina (`mongodb://127.0.0.1:27017`).

### 3. Gerar o Build do Frontend (React)
Para compilar os arquivos estáticos do frontend:

```bash
npm run build
```

Isso gerará a pasta `client/dist`, que será servida estaticamente pelo backend Express.

### 4. Semeamento Inicial do Banco (Opcional)
Se for a primeira vez rodando no MongoDB local, você pode popular os dados iniciais com:

```bash
npm run migrate
```

### 5. Iniciar o Servidor
Para iniciar a aplicação:

- **Modo Produção / Padrão:**
  ```bash
  npm start
  ```

- **Modo Desenvolvimento (Backend + Frontend separados):**
  - Backend: `npm run dev` (Roda na porta `5001`)
  - Frontend (Vite Hot Reload): `npm run client` (Roda na porta `5173`)

---

## 📜 Resumo dos Scripts Disponíveis no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o servidor Node.js que serve a API e os arquivos estáticos compilados |
| `npm run dev` | Inicia o servidor Node.js |
| `npm run build` | Compila o projeto React/Vite em `client/dist` para produção |
| `npm run client` | Inicia o servidor de desenvolvimento do Vite com suporte a Hot Reload |
| `npm run migrate` | Executa o script de migração e semeamento inicial do MongoDB |
