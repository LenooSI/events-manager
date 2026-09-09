import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";
import { verifySessionToken } from "../auth/session-generation";
import { authenticate } from "../auth/hooks/authenticate";

export async function giftsRoutes(app: FastifyInstance) {
  app.post(
    "/gifts",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "weddingId"],
          properties: {
            name: { type: "string", minLength: 1 },
            description: { type: "string" },
            price: { type: "number" },
            weddingId: { type: "integer", minimum: 1 },
          },
          additionalProperties: true,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        name?: string;
        description?: string;
        price?: number | string;
        weddingId?: number | string;
      };

      if (!body.name || !body.weddingId) {
        return reply.code(400).send({
          error: "Missing required fields",
          required: ["name", "weddingId"],
        });
      }

      const price =
        body.price === undefined || body.price === null
          ? undefined
          : Number(body.price);

      if (
        body.price !== undefined &&
        body.price !== null &&
        Number.isNaN(price)
      ) {
        return reply.code(400).send({
          error: "Invalid price",
          message: "price must be a number",
        });
      }

      const gift = await db.orm.public.Gift.create({
        name: body.name,
        description: body.description,
        price,
        weddingId: Number(body.weddingId),
      });

      return reply.code(201).send({ gift });
    },
  );
  //@todo route to list gifts

  app.get(
    "/gifts/:weddingId",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const weddingId = (request.params as { weddingId: string }).weddingId;
      const wedding = await db.orm.public.Wedding.where({
        id: Number(weddingId),
      }).first();

      if (!wedding) {
        return reply.code(404).send({
          error: "Not found",
        });
      }

      if (wedding.ownerId !== request.appSession?.ownerId) {
        return reply.code(401).send({
          error: "Without permission",
        });
      }

      const gifts = await db.orm.public.Gift.where({
        weddingId: Number(weddingId),
      }).all();
      return gifts;
    },
  );
}
