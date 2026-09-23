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

### Fluxo de agendamento

O botão `Agendar agora` e o CTA `Agende seu horario` exigem login antes de abrir o WhatsApp. Após um login existente, a mensagem inclui o nome do tutor e os nomes e raças dos pets cadastrados.

Quando o tutor cria uma nova conta, ele permanece na Área do Tutor. Nessa tela existe o botão `Agendar pelo WhatsApp`, que usa os dados dos pets cadastrados. O acesso iniciado pelo botão `Área do Tutor` também abre normalmente a área, sem redirecionamento automático.

O calendário permite agendar de segunda a sexta-feira, entre `08:00` e `19:30`, em intervalos de 1h30:

- `08:00`, `09:30`, `11:00`, `12:30`, `14:00`, `15:30` e `17:00`: 4 vagas por horário.
- `18:00` até `19:30`: 2 vagas.

Cada vaga pode ser ocupada por apenas um pet. A disponibilidade é consultada no banco e a reserva é feita em uma transação, então uma vaga ocupada fica indisponível para todos os tutores.

Endpoints de agendamento:

```http
GET /api/auth/appointments/availability?date=2026-09-25
GET /api/auth/appointments
POST /api/auth/appointments
```

O cadastro exige `petId`, `date`, `slotStart` e ao menos um serviço em `services`, além do token JWT do tutor. Os serviços disponíveis são `Banho`, `Tosa completa`, `Tosa higiênica`, `Limpeza de ouvidos`, `Corte de unhas` e `Hidratação premium`. `Tosa completa` e `Tosa higiênica` não podem ser selecionadas juntas.

## Testes

Testes unitários:

```bash
npx vitest run
```

Testes E2E:

```bash
npm run test:e2e
```

Teste de API com Java e REST Assured:

Com o backend em execução em `http://localhost:3001`, execute:

```bash
npm run test:api-java
```

Os testes em `api-tests/src/test/java/com/trihbau/api/` cobrem:

- Login com sucesso, incluindo status `200`, nome do tutor e token JWT.
- Cadastro de um pet e agendamento de serviços para uma vaga disponível.
- Retorno do agendamento com pet, raça, data, horário e serviços concatenados, dados usados pelo botão `Agendar pelo WhatsApp`.
- Rejeição da seleção simultânea de `Tosa completa` e `Tosa higiênica`.

Requisitos do teste Java:

- Java 21 ou superior
- Maven 3.9 ou superior

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
