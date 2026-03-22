import fp from "fastify-plugin";
import type { FastifyPluginAsync, FastifyError } from "fastify";
import { AppError } from "../errors/app-error.js";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, _req, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        code: "VALIDATION_ERROR",
        message: error.message,
      });
    }

    // Pass through errors that already have a status code (e.g. rate-limit 429)
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        success: false,
        code: "REQUEST_ERROR",
        message: error.message,
      });
    }

    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    });
  });
};

export default fp(errorHandlerPlugin, { name: "error-handler" });
