# 📐 Planejamento Técnico e Arquitetura do Sistema de Filmes (Estilo Filmow)

Este documento descreve a arquitetura detalhada, a modelagem de banco de dados MySQL, as rotas de API, a integração com serviços externos e o plano de desenvolvimento para o sistema de filmes estilo **Filmow / Letterboxd**.

---

## 1. 🏗️ Visão Geral da Arquitetura

O sistema adota uma arquitetura em camadas (Layered Architecture / MVC), garantindo separação de responsabilidades, alta manutenibilidade e facilidade de escala.

```
                  ┌─────────────────────────────────────────┐
                  │       Frontend (Tailwind CSS UI)        │
                  └────────────────────┬────────────────────┘
                                       │ HTTP / REST
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          Express.js (App Server)        │
                  └──────┬─────────────┬─────────────┬──────┘
                         │             │             │
                         ▼             ▼             ▼
                  ┌────────────┐ ┌───────────┐ ┌────────────┐
                  │Auth / User │ │   Movie   │ │ Social /   │
                  │ Controller │ │Controller │ │   Lists    │
                  └──────┬─────┘ └─────┬─────┘ └─────┬──────┘
                         │             │             │
                         ▼             ▼             ▼
                  ┌─────────────────────────────────────────┐
                  │           Services & Business           │
                  └──────┬─────────────────────┬────────────┘
                         │                     │
                         ▼                     ▼
              ┌─────────────────────┐ ┌───────────────────┐
              │   MySQL Database    │ │   TMDb External   │
              │  (Prisma/mysql2/    │ │     API v3        │
              │     Sequelize)      │ └───────────────────┘
              └─────────────────────┘
```

---

## 2. 🗄️ Modelagem do Banco de Dados MySQL

### Diagrama Entidade-Relacionamento (Conceitual)
- **Users**: Guarda dados cadastrais, biografia e avatar.
- **Movies**: Armazena informações dos filmes sincronizados da API do TMDb.
- **User_Movies**: Relacionamento N:M entre usuário e filme. Guarda o histórico (Já vi, Quero ver, Vendo, Abandonei), nota (0.5 a 5.0), crítica escrita e se é favorito.
- **Lists & List_Movies**: Listas personalizadas criadas pelos usuários contendo filmes.
- **User_Followers**: Tabela de auto-relacionamento N:M para controle de seguidores.
- **Comments & Likes**: Interações sociais em críticas/reviews e listas.

### Script DDL SQL (MySQL)

```sql
CREATE DATABASE IF NOT EXISTS filmow_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE filmow_clone;

-- 1. Tabela de Usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabela de Filmes (Cache dos dados da TMDb API)
CREATE TABLE movies (
    id INT PRIMARY KEY, -- ID vindo diretamente do TMDb
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255) DEFAULT NULL,
    poster_path VARCHAR(255) DEFAULT NULL,
    backdrop_path VARCHAR(255) DEFAULT NULL,
    overview TEXT DEFAULT NULL,
    release_date DATE DEFAULT NULL,
    runtime INT DEFAULT NULL,
    vote_average DECIMAL(3,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Gêneros
CREATE TABLE genres (
    id INT PRIMARY KEY, -- ID vindo do TMDb
    name VARCHAR(50) NOT NULL
);

-- 4. Tabela de Relacionamento Filme-Gênero
CREATE TABLE movie_genres (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- 5. Tabela de Interação Usuário-Filme (Avaliações, Status e Críticas)
CREATE TABLE user_movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    status ENUM('JA_VI', 'QUERO_VER', 'VENDO', 'ABANDONEI') NOT NULL DEFAULT 'JA_VI',
    rating DECIMAL(2,1) CHECK (rating IS NULL OR (rating >= 0.5 AND rating <= 5.0)),
    review TEXT DEFAULT NULL,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    watched_at DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_movie (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- 6. Tabela de Listas Personalizadas
CREATE TABLE lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabela de Filmes em Listas Personalizadas
CREATE TABLE list_movies (
    list_id INT NOT NULL,
    movie_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, movie_id),
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- 8. Tabela de Seguidores (Rede Social)
CREATE TABLE user_followers (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Tabela de Curtidas (Em Reviews e Listas)
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('REVIEW', 'LIST', 'COMMENT') NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_like (user_id, target_type, target_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Tabela de Comentários
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    target_type ENUM('REVIEW', 'LIST') NOT NULL,
    target_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3. 📁 Estrutura de Pastas Sugerida (Projeto Node.js)

```
teste-node-jamees/
├── plan/
│   ├── PROMPT_MASTER.md
│   └── PLANEJAMENTO_TECNICO.md
├── src/
│   ├── config/
│   │   ├── database.js          # Conexão MySQL / Configuração Prisma
│   │   └── tmdb.js              # Configuração da API do TMDb
│   ├── controllers/
│   │   ├── authController.js    # Login, Registro
│   │   ├── movieController.js   # Busca, Detalhes, Avaliações
│   │   ├── userController.js    # Perfil, Seguidores, Estatísticas
│   │   ├── listController.js    # Criação e gestão de listas
│   │   └── feedController.js    # Activity feed/timeline
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Validação de JWT/Sessão
│   │   └── errorHandler.js      # Tratamento global de erros
│   ├── models/                  # Queries ou entidades do banco
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── movieRoutes.js
│   │   ├── userRoutes.js
│   │   ├── listRoutes.js
│   │   └── index.js
│   ├── services/
│   │   ├── tmdbService.js       # Integração com API externa do TMDb
│   │   └── movieCacheService.js # Sincronização e cache no MySQL
│   ├── views/                   # Se for SSR com EJS ou Motor de Template
│   │   ├── partials/
│   │   ├── pages/
│   │   └── index.ejs
│   ├── public/                  # Arquivos estáticos (CSS Tailwind, JS cliente, Imagens)
│   └── app.js                   # Servidor Express Principal
├── .env.example
├── package.json
└── tailwind.config.js
```

---

## 4. 🌐 Especificação das Rotas de API (Endpoints)

### Autenticação & Usuários (`/api/auth` & `/api/users`)
- `POST /api/auth/register` — Cadastrar novo usuário.
- `POST /api/auth/login` — Autenticar usuário.
- `GET /api/users/:username` — Obter dados do perfil público.
- `PUT /api/users/profile` — Atualizar bio, nome e avatar (Requer Autenticação).
- `POST /api/users/:id/follow` — Seguir / Deixar de seguir um usuário.
- `GET /api/users/:username/stats` — Obter estatísticas do usuário (horas assistidas, gráfico de notas).

### Filmes & Avaliações (`/api/movies`)
- `GET /api/movies/popular` — Filmes populares (TMDb + Cache MySQL).
- `GET /api/movies/search?q=query` — Buscar filmes no catálogo TMDb.
- `GET /api/movies/:id` — Detalhes do filme, elenco, notas dos usuários e críticas.
- `POST /api/movies/:id/interact` — Salvar status (`JA_VI`, `QUERO_VER`, etc), Nota (0.5-5.0), Crítica e Favorito.
- `DELETE /api/movies/:id/interact` — Remover marcação de um filme.

### Feed & Interações (`/api/feed` & `/api/social`)
- `GET /api/feed` — Exibir atualizações dos usuários seguidos.
- `POST /api/social/like` — Curtir/descurtir uma crítica ou lista.
- `POST /api/social/comment` — Adicionar comentário em uma crítica ou lista.

### Listas Personalizadas (`/api/lists`)
- `POST /api/lists` — Criar nova lista.
- `GET /api/lists/:id` — Obter detalhes e filmes de uma lista.
- `POST /api/lists/:id/movies` — Adicionar filme à lista.
- `DELETE /api/lists/:id/movies/:movieId` — Remover filme da lista.

---

## 5. 🔌 Estratégia de Cache da API TMDb

Para evitar ultrapassar os limites de requisições da API do TMDb e garantir performance rápida:
1. Quando um filme é pesquisado ou aberto em detalhes, o backend verifica se ele já existe na tabela `movies` do MySQL.
2. Se **não existir**: faz a requisição à API do TMDb, salva os dados básicos (`id`, `title`, `poster_path`, `overview`, `release_date`, etc.) na tabela `movies` do MySQL e retorna ao usuário.
3. Se **já existir**: retorna os dados direto do MySQL, atualizando o registro em background caso esteja desatualizado (mais de 7 dias).

---

## 6. 📅 Cronograma de Implementação (Roadmap)

| Fase | Descrição | Principais Entregáveis |
|---|---|---|
| **Fase 1: Setup & Banco** | Configuração do projeto, Express, Tailwind e MySQL | Estrutura de pastas, conexão DB e script DDL rodado |
| **Fase 2: Auth & Usuários** | Sistema de Login/Registro e Perfis | Autenticação JWT/Session, rotas de cadastro e perfil |
| **Fase 3: TMDb & Filmes** | Integração da API externa de filmes e busca | Service do TMDb, tela de busca, lista de populares e página do filme |
| **Fase 4: Avaliação & Status** | Interação com filmes | Botões de Já Vi, Quero Ver, Nota em Estrelas e Críticas |
| **Fase 5: Feed & Social** | Rede Social de Cinefilia | Sistema de seguidores, Timeline de atividades, Curtidas e Comentários |
| **Fase 6: Listas & Stats** | Funcionalidades Avançadas | Listas personalizadas, gráficos de estatísticas do perfil |
| **Fase 7: Polimento UI/UX** | Refinamento com Tailwind CSS | Responsividade mobile, dark mode elegante, micro-animações |
