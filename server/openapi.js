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
    { name: "Products", description: "Catálogo público de produtos" },
  ],
  paths: {
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Lista os produtos ativos",
        responses: {
          200: {
            description: "Produtos disponíveis",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Product" } },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Busca um produto ativo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Produto encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } },
          },
          404: { description: "Produto não encontrado" },
        },
      },
    },
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
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
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
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
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
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Pet" } },
              },
            },
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
              example: {
                breed: "Golden Retriever",
                name: "Luna",
                age: 3,
                weight: 24.5,
                contactPhone: "85999999999",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Pet cadastrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } },
          },
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
          200: {
            description: "Pet atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } },
          },
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
    "/api/auth/appointments/availability": {
      get: {
        tags: ["Auth"],
        summary: "Lista as vagas de um dia útil",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "date", in: "query", required: true, schema: { type: "string", format: "date" } },
        ],
        responses: {
          200: {
            description: "Vagas por horário",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/BookingSlot" } },
              },
            },
          },
          400: { description: "Data inválida" },
          401: { description: "Token inválido ou ausente" },
        },
      },
    },
    "/api/auth/appointments": {
      get: {
        tags: ["Auth"],
        summary: "Lista os agendamentos do tutor",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Agendamentos do tutor",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Appointment" } },
              },
            },
          },
          401: { description: "Token inválido ou ausente" },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Reserva uma vaga para um pet",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AppointmentRequest" } },
          },
        },
        responses: {
          201: { description: "Agendamento criado" },
          400: { description: "Dados inválidos" },
          401: { description: "Token inválido ou ausente" },
          409: { description: "Horário sem vagas" },
        },
      },
    },
    "/api/auth/appointments/{id}": {
      put: {
        tags: ["Auth"],
        summary: "Edita os serviços de um agendamento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["services"],
                properties: {
                  services: { $ref: "#/components/schemas/AppointmentRequest/properties/services" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Agendamento atualizado" },
          400: { description: "Serviços inválidos" },
          401: { description: "Token inválido ou ausente" },
          404: { description: "Agendamento não encontrado" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Exclui um agendamento",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          204: { description: "Agendamento excluído" },
          401: { description: "Token inválido ou ausente" },
          404: { description: "Agendamento não encontrado" },
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
      Product: {
        type: "object",
        required: ["id", "name", "description", "priceCents", "image"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Shampoo Premium" },
          description: { type: "string", example: "Cuidado delicado para uma pelagem macia." },
          priceCents: { type: "integer", example: 9359, description: "Valor em centavos" },
          image: { type: "string", example: "shampoo" },
        },
      },
      BookingSlot: {
        type: "object",
        properties: {
          start: { type: "string", example: "08:00" },
          capacity: { type: "integer", example: 4 },
          booked: { type: "integer", example: 1 },
          available: { type: "integer", example: 3 },
        },
      },
      AppointmentRequest: {
        type: "object",
        required: ["petId", "date", "slotStart", "services"],
        properties: {
          petId: { type: "integer", example: 1 },
          date: { type: "string", format: "date", example: "2026-09-25" },
          slotStart: { type: "string", example: "08:00" },
          services: {
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "Banho",
                "Tosa completa",
                "Tosa higiênica",
                "Limpeza de ouvidos",
                "Corte de unhas",
                "Hidratação premium",
              ],
            },
          },
        },
      },
      Appointment: {
        allOf: [
          { $ref: "#/components/schemas/AppointmentRequest" },
          {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              petName: { type: "string" },
              petBreed: { type: "string" },
            },
          },
        ],
      },
    },
  },
};

export default openapi;
