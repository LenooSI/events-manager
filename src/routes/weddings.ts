import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function weddingsRoutes(app: FastifyInstance) {
  app.post("/weddings", async (request, reply) => {
    const body = request.body as {
      coupleName: string;
      slug: string;
      weddingDate: string;
      ownerId: number;
    };

    const wedding = await db.orm.public.Wedding.create({
      coupleName: body.coupleName,
      slug: body.slug,
      weddingDate: new Date(body.weddingDate),
      ownerId: body.ownerId,
    });

    return reply.code(201).send({ wedding });
  });
}
