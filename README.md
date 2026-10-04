# GameHub

> Plataforma web para descobrir jogos, organizar sua biblioteca pessoal, avaliar títulos, publicar reviews e gerenciar um catálogo integrado à IGDB.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-API%20%2B%20Database-0B0D0E?logo=railway)](https://railway.com/)

## 🌐 Aplicação

- **Frontend:** https://projectgamehub.vercel.app
- **API:** https://api-production-a527.up.railway.app
- **Repositório:** https://github.com/vitor9167/gamehub

---

## 📖 Sobre o projeto

O **GameHub** é uma aplicação full stack para gerenciamento e descoberta de jogos.

A plataforma permite pesquisar títulos, visualizar informações detalhadas, montar uma biblioteca pessoal, acompanhar o status de cada jogo, registrar avaliações e publicar reviews.

O catálogo pode ser abastecido por administradores através da integração com a **IGDB**, permitindo importar informações como título, capa, descrição, data de lançamento, gêneros, plataformas, desenvolvedores e publicadoras.

O projeto foi construído em arquitetura monorepo com frontend em **Next.js**, backend em **NestJS**, persistência em **PostgreSQL** e acesso ao banco através do **Prisma ORM**.

---

## ✨ Funcionalidades

### Catálogo de jogos

- Listagem de jogos cadastrados.
- Busca por nome.
- Filtro por gênero.
- Filtro por plataforma.
- Paginação.
- Página individual de cada jogo.
- Capas em alta resolução provenientes da IGDB.
- Exibição de gêneros, plataformas, desenvolvedores, publicadoras, data de lançamento e descrição.

### Biblioteca pessoal

Usuários autenticados podem adicionar jogos à própria biblioteca e escolher um status:

- **Quero jogar**
- **Jogando**
- **Concluído**
- **Pausado**
- **Abandonado**
- **Na biblioteca**

Também é possível alterar o status posteriormente, remover jogos e visualizar todos os títulos salvos na biblioteca.

### Avaliações

- Notas de **1 a 10**.
- Atualização da própria nota.
- Exibição da média das avaliações.
- Exibição da quantidade total de avaliações.

### Reviews

- Criar review.
- Editar a própria review.
- Excluir a própria review.
- Marcar conteúdo como spoiler.
- Curtir e descurtir reviews.
- Exibir a nota do autor junto da review.
- Leitura pública das reviews.

### Autenticação

- Cadastro de usuário.
- Login.
- Logout.
- JWT para autenticação.
- Recuperação do usuário autenticado.
- Proteção de rotas privadas.
- Controle de acesso por função.

### Perfil

- Nome de exibição.
- Bio.
- Avatar.
- Informações da conta.
- Alteração de senha.

### Administração

Usuários com role `ADMIN` possuem acesso a um painel administrativo com:

- estatísticas gerais;
- gerenciamento de usuários;
- alteração de role;
- proteção contra alteração da própria role;
- gerenciamento do catálogo;
- edição de jogos;
- exclusão de jogos;
- importação de jogos pela IGDB;
- reimportação e atualização de jogos existentes.

---

## 🧱 Arquitetura

```text
┌──────────────────────────────┐
│           Vercel             │
│                              │
│        Next.js Web           │
│    projectgamehub.vercel.app │
└──────────────┬───────────────┘
               │ HTTPS / REST
               ▼
┌──────────────────────────────┐
│           Railway            │
│                              │
│         NestJS API           │
│ api-production-a527...       │
└──────────────┬───────────────┘
               │ Prisma
               ▼
┌──────────────────────────────┐
│           Railway            │
│                              │
│        PostgreSQL            │
└──────────────────────────────┘

               +
               │
               ▼

┌──────────────────────────────┐
│        Twitch / IGDB         │
│                              │
│ Dados externos de jogos      │
└──────────────────────────────┘
```

---

## 🗂️ Estrutura do projeto

```text
gamehub/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── admin/
│   │       ├── auth/
│   │       ├── games/
│   │       ├── igdb/
│   │       ├── library/
│   │       ├── prisma/
│   │       ├── ratings/
│   │       └── reviews/
│   │
│   └── web/
│       ├── app/
│       │   ├── admin/
│       │   ├── games/
│       │   ├── library/
│       │   ├── login/
│       │   ├── profile/
│       │   └── register/
│       ├── components/
│       ├── contexts/
│       └── lib/
│
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── package.json
```

---

## 🛠️ Tecnologias

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- CSS
- Context API
- Fetch API

### Backend

- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **JWT**
- **bcrypt**
- **Axios**

### Banco de dados

- **PostgreSQL**

### Integrações

- **IGDB API**
- **Twitch OAuth**

### Infraestrutura

- **GitHub**
- **Vercel**
- **Railway**
- **Railway PostgreSQL**

---

## 🗃️ Principais entidades

O banco contém entidades relacionadas a:

- `User`
- `Game`
- `Genre`
- `Platform`
- `Developer`
- `Publisher`
- `UserGame`
- `Rating`
- `Review`
- `ReviewLike`

Além das tabelas de relacionamento necessárias para jogos, gêneros, plataformas, desenvolvedores e publicadoras.

---

## 🔐 Roles

O sistema possui dois níveis de acesso:

```text
USER
ADMIN
```

### USER

Pode navegar pelo catálogo, usar a biblioteca, avaliar jogos, publicar reviews, curtir reviews e editar o próprio perfil.

### ADMIN

Possui todas as permissões de usuário e também pode acessar o painel administrativo, gerenciar usuários, alterar roles, editar jogos, excluir jogos e importar jogos da IGDB.

---

## 🚀 Instalação local

### Pré-requisitos

Tenha instalado:

- Node.js
- pnpm
- PostgreSQL
- Git

Clone o projeto:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd gamehub
```

Instale as dependências:

```bash
pnpm install
```

---

## ⚙️ Configuração do backend

Crie:

```text
apps/api/.env
```

Exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gamehub?schema=public"

IGDB_CLIENT_ID="seu_client_id"
IGDB_CLIENT_SECRET="seu_client_secret"

JWT_SECRET="uma_chave_secreta_forte"

FRONTEND_URL="http://localhost:3000"
```

> Nunca envie o arquivo `.env` real para o GitHub.

---

## 🗄️ Prisma

Entre no backend:

```bash
cd apps/api
```

Gere o Prisma Client:

```bash
pnpm prisma generate
```

Aplique as migrations em desenvolvimento:

```bash
pnpm prisma migrate dev
```

Ou, para aplicar migrations já existentes:

```bash
pnpm prisma migrate deploy
```

Volte para a raiz:

```bash
cd ../..
```

---

## 🖥️ Configuração do frontend

Crie:

```text
apps/web/.env.local
```

Adicione:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## ▶️ Executando o projeto

Em terminais separados, execute o backend e o frontend.

### Backend

```bash
pnpm --filter api start:dev
```

API local:

```text
http://localhost:4000
```

### Frontend

```bash
pnpm --filter web dev
```

Aplicação local:

```text
http://localhost:3000
```

---

## 🧪 Build local

### Backend

```bash
pnpm --filter api build
```

### Frontend

```bash
pnpm --filter web build
```

---

## 🌍 Deploy

### Frontend — Vercel

```text
Root Directory:
apps/web
```

Variável:

```env
NEXT_PUBLIC_API_URL="https://api-production-a527.up.railway.app"
```

Aplicação publicada em:

https://projectgamehub.vercel.app

### Backend — Railway

Build:

```bash
pnpm --filter api exec prisma generate && pnpm --filter api build
```

Pre-deploy:

```bash
pnpm --filter api exec prisma migrate deploy
```

Start:

```bash
pnpm --filter api start:prod
```

Variáveis principais:

```env
DATABASE_URL="${{Postgres.DATABASE_URL}}"
IGDB_CLIENT_ID="..."
IGDB_CLIENT_SECRET="..."
JWT_SECRET="..."
FRONTEND_URL="https://projectgamehub.vercel.app"
```

API publicada em:

https://api-production-a527.up.railway.app

---

## 🔄 Fluxo de importação IGDB

```text
Administrador
      │
      ▼
Pesquisa na interface
      │
      ▼
NestJS API
      │
      ▼
Twitch OAuth
      │
      ▼
IGDB API
      │
      ▼
Normalização dos dados
      │
      ▼
Prisma Transaction
      │
      ├── Game
      ├── Genres
      ├── Platforms
      ├── Developers
      └── Publishers
```

A importação usa `upsert`, permitindo atualizar jogos já existentes sem criar duplicidades pelo mesmo `igdbId`.

---

## 🔒 Segurança

O projeto utiliza:

- autenticação via JWT;
- hash de senha com bcrypt;
- guards no backend;
- autorização por role;
- validação global dos DTOs;
- CORS configurado para o frontend;
- variáveis de ambiente para secrets;
- proteção das rotas administrativas no backend;
- IDs UUID nas rotas internas relevantes.

> O frontend pode esconder controles administrativos por UX, mas a autorização real é validada pelo backend.

---

## 📌 Status do projeto

### Implementado

- [x] Cadastro
- [x] Login
- [x] Perfil
- [x] Catálogo
- [x] Busca
- [x] Filtros
- [x] Paginação
- [x] Biblioteca
- [x] Status de jogos
- [x] Avaliações
- [x] Reviews
- [x] Spoilers
- [x] Likes
- [x] Painel administrativo
- [x] Roles
- [x] Importação IGDB
- [x] Deploy do frontend
- [x] Deploy da API
- [x] PostgreSQL em produção
- [x] Layout responsivo

### Possíveis evoluções

- [ ] Recuperação de senha
- [ ] Login social
- [ ] Favoritos independentes da biblioteca
- [ ] Listas personalizadas
- [ ] Ranking de jogos
- [ ] Página pública de usuário
- [ ] Sistema de seguidores
- [ ] Comentários em reviews
- [ ] Busca avançada
- [ ] Ordenação por nota e lançamento
- [ ] Upload de avatar
- [ ] Dashboard com métricas adicionais
- [ ] Testes automatizados
- [ ] CI/CD com validações adicionais
- [ ] Domínio próprio

---

## 🧭 Roadmap sugerido

```text
MVP ✅
 │
 ├── Autenticação
 ├── Catálogo
 ├── Biblioteca
 ├── Avaliações
 ├── Reviews
 ├── Administração
 ├── IGDB
 └── Deploy
      │
      ▼
Próxima fase
 │
 ├── Recuperação de senha
 ├── Social
 ├── Rankings
 ├── Listas
 ├── Testes automatizados
 └── Observabilidade
```

---

## 👨‍💻 Autor

Desenvolvido por **Vitor**.

Projeto criado para estudo e aplicação prática de desenvolvimento full stack, arquitetura frontend/backend, APIs externas, autenticação, banco de dados relacional e deploy em produção.

---

## 📄 Licença

Este projeto pode ser utilizado como projeto pessoal e educacional.


