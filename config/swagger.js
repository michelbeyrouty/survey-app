const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Survey App API",
      version: "1.0.0",
      description: "A RESTful API for creating and managing surveys",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        userId: {
          type: "apiKey",
          in: "header",
          name: "x-user-id",
          description: "User ID for authentication",
        },
        userRole: {
          type: "apiKey",
          in: "header",
          name: "x-user-role",
          description: "User role (ADMIN or ANSWERER)",
        },
      },
      schemas: {
        Survey: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            creator_id: { type: "integer" },
            creator_name: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            questions: {
              type: "array",
              items: { $ref: "#/components/schemas/Question" },
            },
            access_users: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "integer" },
                  user_name: { type: "string" },
                },
              },
            },
          },
        },
        Question: {
          type: "object",
          required: ["text", "type"],
          properties: {
            id: { type: "integer" },
            survey_id: { type: "integer" },
            text: { type: "string" },
            type: {
              type: "string",
              enum: ["TEXT", "RATING", "BOOLEAN"],
            },
            rating_min: { type: "integer", nullable: true },
            rating_max: { type: "integer", nullable: true },
          },
        },
        QuestionInput: {
          type: "object",
          required: ["text", "type"],
          properties: {
            text: { type: "string", description: "The question text" },
            type: {
              type: "string",
              enum: ["TEXT", "RATING", "BOOLEAN"],
              description: "The type of question",
            },
            rating_min: {
              type: "integer",
              description: "Minimum rating value (required for RATING type)",
            },
            rating_max: {
              type: "integer",
              description: "Maximum rating value (required for RATING type)",
            },
          },
        },
        Answer: {
          type: "object",
          properties: {
            answer_id: { type: "integer" },
            question_id: { type: "integer" },
            text: { type: "string" },
            type: { type: "string" },
            value: { type: "string" },
          },
        },
        AnswerInput: {
          type: "object",
          required: ["question_id", "value"],
          properties: {
            question_id: { type: "integer" },
            value: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        userId: [],
        userRole: [],
      },
    ],
  },
  apis: ["./docs/swagger/*.js"],
};

module.exports = swaggerJsdoc(options);
