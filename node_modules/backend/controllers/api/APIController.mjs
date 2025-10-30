import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import * as ApiValidator from "express-openapi-validator";
import { APIUserController } from "./APIUserController.mjs";
import { APIBlogController } from "./APIBlogController.mjs";
import { APIBookingController } from "./APIBookingController.mjs";
import { APISessionController } from "./APISessionController.mjs";
import { APIAuthenticationController } from "./APIAuthenticationController.mjs";
const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "ML Fitness API",
      description: "JSON REST API for interacting with ML Strength Backend",
    },
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-auth-key",
        },
      },
    },
  },
  apis: ["./controllers/**/*.{js,mjs,yaml}", "./components.yaml"],
};
const specification = swaggerJSDoc(options);

export class APIController {
  static routes = express.Router();

  static {
    /**
     * @openapi
     *  /api/docs:
     *      get:
     *          summary: "View automatically generated documentation pages"
     *          tags: [Documentation]
     *          responses:
     *            200:
     *               description: "The documentation page"
     */
    this.routes.use("/docs", swaggerUI.serve, swaggerUI.setup(specification));
    this.routes.use(
      ApiValidator.middleware({
        apiSpec: specification,
        validateRequests: true,
        validateResponses: true,
      })
    );
    this.routes.use((error, req, res, next) => {
      res
        .status(error.status || 500)
        .json({ message: error.message, errors: error.errors });
    });
    this.routes.use(APIAuthenticationController.middleware);
    this.routes.use(APIAuthenticationController.routes);

    this.routes.use("/user", APIUserController.routes);
    this.routes.use("/blog", APIBlogController.routes);
    this.routes.use("/booking", APIBookingController.routes);
    this.routes.use("/session", APISessionController.routes);
  }
}
