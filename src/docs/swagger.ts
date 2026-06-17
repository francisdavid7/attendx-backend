import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "AttendX API",
      version: "1.0.0",
      description: "API documentation for AttendX",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development server",
      },

      {
        url: "https://attendx-backend-aq8g.onrender.com/api/v1/",
        description: "Production server",
      },
    ],
  },

  apis: ["./src/routes/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
