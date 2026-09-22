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
    "/api/auth/users": {
      get: {
        tags: ["Auth"],
        summary: "Lista tutores cadastrados",
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            description: "Filtra por nome ou e-mail",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Lista de tutores sem dados de senha",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Tutor" },
                },
              },
            },
          },
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
    "/api/auth/pets": {
      get: {
        tags: ["Auth"],
        summary: "Lista os pets do tutor autenticado",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Pets do tutor",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Pet" } } } },
          },
          401: { description: "Token inválido ou ausente" },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Cadastra um pet para o tutor autenticado",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PetRequest" },
              example: { breed: "Golden Retriever", name: "Luna", age: 3, weight: 24.5, contactPhone: "85999999999" },
            },
          },
        },
        responses: {
          201: { description: "Pet cadastrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } },
          400: { description: "Dados inválidos" },
          401: { description: "Token inválido ou ausente" },
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Edita um pet do tutor autenticado",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PetRequest" } } },
        },
        responses: {
          200: { description: "Pet atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } },
          400: { description: "Dados inválidos" },
          401: { description: "Token inválido ou ausente" },
          404: { description: "Pet não encontrado" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Exclui um pet do tutor autenticado",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Pet excluído" },
          401: { description: "Token inválido ou ausente" },
          404: { description: "Pet não encontrado" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
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
      Tutor: {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "João" },
          email: { type: "string", format: "email", example: "joao@email.com" },
        },
      },
      PetRequest: {
        type: "object",
        required: ["breed", "name", "age", "weight", "contactPhone"],
        properties: {
          breed: { type: "string", example: "Golden Retriever" },
          name: { type: "string", example: "Luna" },
          age: { type: "integer", minimum: 0, example: 3 },
          weight: { type: "number", exclusiveMinimum: 0, example: 24.5 },
          contactPhone: { type: "string", example: "85999999999" },
        },
      },
      Pet: {
        allOf: [
          { $ref: "#/components/schemas/PetRequest" },
          { type: "object", required: ["id"], properties: { id: { type: "integer", example: 1 } } },
        ],
      },
    },
  },
};

export default openapi;