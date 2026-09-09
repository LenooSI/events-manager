import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    appSession: {
      ownerId: number;
    } | null;
  }
}
