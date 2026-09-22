# TrihbAU PetShop

Aplicação web da TrihbAU PetShop, com uma experiência de pet care em React e uma API Express para cadastro e autenticação de tutores.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Express
- SQLite com `better-sqlite3`
- JWT e `bcrypt` para autenticação
- Swagger / OpenAPI
- Vitest e Testing Library para testes unitários
- Playwright para testes E2E

## Requisitos

- Node.js `24.15.0` ou superior compatível com as dependências atuais
- npm

## Instalação

```bash
npm ci
```

Para executar os testes E2E localmente pela primeira vez, instale o navegador do Playwright:

```bash
npx playwright install chromium
```

No Ubuntu ou em outros ambientes Linux de CI, use:

```bash
npx playwright install --with-deps chromium
```

## Desenvolvimento

O frontend e o backend são executados separadamente. Abra dois terminais na raiz do projeto.

Terminal 1, frontend:

```bash
npm run dev
```

Frontend disponível em `http://localhost:5173`.

Terminal 2, backend:

```bash
npm run server
```

API disponível em `http://localhost:3001`.

O backend cria o banco SQLite `trihbau.db` na raiz do projeto quando necessário. Esse arquivo é ignorado pelo Git.

### Redefinir senha para testes manuais

Para acessar manualmente um usuário de desenvolvimento, redefina a senha informando o ID e uma nova senha:

```bash
npm run reset-password -- 7 "Teste123!"
```

O script atualiza o `password_hash` usando bcrypt e não exibe nem armazena a senha em texto puro. Use esse comando apenas com o banco local de desenvolvimento.

## Swagger

Com o backend em execução, acesse:

- Interface Swagger: `http://localhost:3001/api-docs`
- Especificação OpenAPI: `http://localhost:3001/api-docs.json`

## API

### Health check

```http
GET /health
```

Retorna status `200` quando a API está disponível.

### Cadastro de tutor

```http
POST /api/auth/register
Content-Type: application/json
```

Corpo da requisição:

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "123456"
}
```

Respostas principais:

- `200`: tutor cadastrado e token JWT retornado
- `400`: campos obrigatórios ausentes
- `409`: e-mail já cadastrado

### Login de tutor

```http
POST /api/auth/login
Content-Type: application/json
```

Corpo da requisição:

```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

Respostas principais:

- `200`: login realizado e token JWT retornado
- `401`: credenciais inválidas

### Busca de tutores cadastrados

```http
GET /api/auth/users
```

A busca pode ser filtrada por nome ou e-mail usando o parâmetro `search`:

```http
GET /api/auth/users?search=joao
```

A resposta contém apenas `id`, `name` e `email`. Dados de senha não são retornados.

> Esta rota ainda não possui autenticação administrativa e deve ser protegida antes de ser disponibilizada em produção.

### Pets do tutor autenticado

As rotas de pets exigem um token JWT no cabeçalho `Authorization`:

```http
Authorization: Bearer <token>
```

Listar os pets do tutor:

```http
GET /api/auth/pets
```

Cadastrar um pet:

```http
POST /api/auth/pets
Content-Type: application/json
Authorization: Bearer <token>
```

Corpo da requisição:

```json
{
  "breed": "Golden Retriever",
  "name": "Luna",
  "age": 3,
  "weight": 24.5,
  "contactPhone": "85999999999"
}
```

Editar um pet:

```http
PUT /api/auth/pets/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Excluir um pet:

```http
DELETE /api/auth/pets/:id
Authorization: Bearer <token>
```

Na Área do Tutor, cada pet cadastrado possui ações para editar ou excluir seus dados.

## Testes

Testes unitários:

```bash
npx vitest run
```

Testes E2E:

```bash
npm run test:e2e
```

Listar os testes Playwright sem executá-los:

```bash
npx playwright test --list
```

Os testes Playwright usam o Chromium e iniciam automaticamente o frontend e o backend conforme a configuração em `playwright.config.ts`.

Screenshots e traces são mantidos somente quando um teste falha.

## Qualidade de código

Executar o ESLint:

```bash
npm run lint
```

Corrigir problemas encontrados pelo ESLint:

```bash
npm run lint:fix
```

Formatar os arquivos com Prettier:

```bash
npm run format
```

Verificar a formatação sem alterar arquivos:

```bash
npm run format:check
```

Verificar os tipos TypeScript:

```bash
npx tsc --noEmit
```

Gerar o build de produção:

```bash
npm run build
```

## Estrutura principal

```text
src/                    Frontend React
src/components/         Telas de login, cadastro e área do tutor
server/                 API Express, autenticação e banco SQLite
pages/                  Page Objects dos testes Playwright
tests/                  Testes E2E
fixtures/               Fixtures dos testes Playwright
data/                   Dados auxiliares dos testes
.github/workflows/      Pipeline de CI
```

## CI

O workflow em `.github/workflows/ci.yml` é executado em pushes e pull requests para a branch `main`. Ele:

1. Instala as dependências com `npm ci`.
2. Instala o Chromium do Playwright.
3. Verifica os tipos TypeScript.
4. Gera o build de produção.
5. Executa os testes unitários.
6. Executa todos os testes E2E do Playwright.
