import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function giftsRoutes(app: FastifyInstance) {
  app.post("/gifts", async (request, reply) => {
    const body = request.body as {
      name: string;
      description?: string;
      price?: number;
      weddingId: number;
    };

    const gift = await db.orm.public.Gift.create({
      name: body.name,
      description: body.description,
      price: body.price,
      weddingId: body.weddingId,
    });

    return reply.code(201).send({ gift });
  });
}
