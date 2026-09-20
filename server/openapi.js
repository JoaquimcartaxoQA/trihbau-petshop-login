const openapi = {
  openapi: "3.0.3",
  info: {
    title: "TrihbAU PetShop API",
    version: "1.0.0",
    description: "API de autenticação da TrihbAU PetShop.",
  },
  servers: [{ url: "http://localhost:3001", description: "Servidor local" }],
  tags: [
    { name: "Health", description: "Status da API" },
    { name: "Auth", description: "Autenticação de tutores" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica a saúde da API",
        responses: {
          200: { description: "API disponível" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastra um tutor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: { name: "João", email: "joao@email.com", password: "123456" },
            },
          },
        },
        responses: {
          200: {
            description: "Tutor cadastrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { description: "Campos obrigatórios ausentes" },
          409: { description: "E-mail já cadastrado" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica um tutor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: { email: "joao@email.com", password: "123456" },
            },
          },
        },
        responses: {
          200: {
            description: "Login realizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          401: { description: "Credenciais inválidas" },
        },
      },
    },
  },
  components: {
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "João" },
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: { type: "string", format: "password", minLength: 1, example: "123456" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "joao@email.com" },
          password: { type: "string", format: "password", minLength: 1, example: "123456" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["token", "name"],
        properties: {
          token: { type: "string", description: "JWT válido por 7 dias" },
          name: { type: "string", example: "João" },
        },
      },
    },
  },
};

export default openapi;