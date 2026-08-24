# 🎬 PROMPT MASTER: Sistema de Filmes Estilo Filmow

> **Instruções de Uso:** Copie e cole este prompt na sua IA de desenvolvimento (ou utilize no seu agente de código) para gerar a aplicação completa passo a passo.

---

```markdown
Você é um desenvolvedor Full-Stack Senior especializado em Node.js, bancos de dados relacionais (MySQL) e interfaces modernas com Tailwind CSS. 

Sua tarefa é criar um sistema completo de rede social e catálogo de filmes inspirado no **Filmow** / **Letterboxd**, utilizando a seguinte stack tecnológica:

### 🛠️ Stack Tecnológica Exigida
1. **Backend**: Node.js com Express.js (Arquitetura MVC limpa).
2. **Banco de Dados**: MySQL (usando Prisma ORM ou `mysql2` / Sequelize para manipulação relacional).
3. **Frontend**: HTML5 / EJS ou React/Next.js estético com **Tailwind CSS**.
4. **API Externa**: Integração com a API do **TMDb (The Movie Database)** para busca de dados reais de filmes, pôsteres, sinopses e elenco.
5. **Autenticação**: JSON Web Tokens (JWT) ou Sessão via Cookies com senhas criptografadas (bcrypt).

---

### 📌 Funcionalidades Principais do Sistema

#### 1. Módulo de Autenticação e Perfil de Usuário
- Registro de conta (Nome, Username único, Email, Senha, Foto de Perfil/Avatar, Bio).
- Login / Logout com armazenamento seguro de credenciais.
- Perfil público contendo:
  - Avatar, Bio e Estatísticas (Total de filmes assistidos, tempo total assistido em horas/dias).
  - Distribuição de notas (Gráfico de barras das notas 1 a 5 estrelas).
  - Filmes favoritos do usuário (Top 4 filmes destaques).
  - Atividade recente (Filmes marcados recentemente, avaliações escritas).
  - Listas criadas pelo usuário.
  - Botão de "Seguir / Deixar de Seguir" outro usuário.

#### 2. Catálogo e Busca de Filmes (Integração TMDb)
- **Home Page**:
  - Banner com lançamentos / filmes em alta.
  - Carrossel / Grid de Filmes Populares, Mais Bem Avaliados e Lançamentos.
- **Busca de Filmes**:
  - Barra de busca em tempo real por título.
  - Filtro por gênero, ano de lançamento e ordenação (Popularidade, Nota, Título).
- **Página do Filme (Detalhes)**:
  - Capa (Poster), Backdrop de fundo em altíssima qualidade.
  - Título, Título Original, Ano, Duração, Gênero, Direção e Elenco principal.
  - Sinopse completa.
  - Média de avaliações dos usuários da plataforma vs. Nota TMDb.
  - **Ações do Usuário na Página do Filme**:
    - Alterar Status: `Já Vi` (Assistido), `Quero Ver`, `Vendo` ou `Abandonei`.
    - Dar Nota de 0.5 a 5.0 estrelas.
    - Marcar como "Favorito".
    - Escrever Crítica / Avaliação (Review) com opção de marcar spoiler.
    - Adicionar a uma Lista Personalizada.

#### 3. Feed Social e Interações
- **Timeline / Feed**:
  - Feed global e feed dos usuários seguidos.
  - Exibe atualizações quando um amigo assiste a um filme, avalia com estrelas ou publica uma crítica.
- **Interações**:
  - Curtir avaliações de outros usuários.
  - Comentar nas avaliações/críticas.

#### 4. Listas Personalizadas
- Criar listas temáticas (ex: "Melhores Filmes de Ficção Científica dos Anos 80", "Para Assistir no Fim de Semana").
- Adicionar/remover filmes da lista.
- Descrição da lista e privacidade (Pública ou Privada).
- Curtidas e comentários nas listas de outros usuários.

#### 5. Dashboard Administrativo (Opcional/Bônus)
- Gerenciamento de usuários (banir/promover).
- Moderação de avaliações/comentários denunciados.

---

### 🎨 Design & Interface (Tailwind CSS)
- Design **Dark Mode nativo** (inspirado na paleta escura elegante do Filmow / Letterboxd: tons de azul escuro/cinza escuro `#0f172a`, `#1e293b`, detalhes em amarelo/dourado `#f59e0b` para estrelas e destaques).
- Componentes modernos com efeitos de **glassmorphism**, hover cards com escala suave, feedbacks visuais (toasts) para ações de curtir/marcar filme.
- Layout 100% responsivo para Mobile, Tablet e Desktop.

---

### 🗄️ Estrutura do Banco de Dados MySQL
Crie as tabelas com relacionamentos apropriados:
- `users`: Usuários do sistema.
- `movies`: Cache/registro dos filmes consultados via TMDb.
- `genres` e `movie_genres`: Gêneros cinematográficos.
- `user_movies`: Tabela associativa entre usuário e filme (guarda `status`, `rating`, `review`, `is_favorite`, `watched_at`).
- `lists` e `list_movies`: Listas personalizadas e seus filmes.
- `user_followers`: Relacionamento de seguidores (follower_id -> following_id).
- `comments`: Comentários em reviews ou listas.
- `likes`: Curtidas em reviews, comentários ou listas.

---

### 🚀 Plano de Execução Passo a Passo

Por favor, siga estas etapas para construir a aplicação:
1. **Fase 1**: Inicializar projeto Node.js, configurar variáveis de ambiente (`.env` para conexões MySQL e API Key do TMDb) e banco de dados.
2. **Fase 2**: Criar os Models e Migrations/Scripts SQL do banco MySQL.
3. **Fase 3**: Criar o serviço de integração com a API do TMDb (`tmdbService.js`) com sistema de cache no MySQL para rápida resposta.
4. **Fase 4**: Desenvolver o sistema de Autenticação e Perfis de Usuário.
5. **Fase 5**: Criar as rotas e telas de filmes (Detalhes, Marcação de Assistido, Avaliação com Estrelas, Favoritos).
6. **Fase 6**: Implementar o Feed Social, Seguir Usuários, Comentários e Curtidas.
7. **Fase 7**: Criar a funcionalidade de Listas Personalizadas e Estatísticas do Perfil.
8. **Fase 8**: Ajustar o design com Tailwind CSS, responsividade e tratamento de erros.

Por favor, comece fornecendo a estrutura de pastas do projeto e o script SQL / esquema Prisma para o banco de dados MySQL.
```
