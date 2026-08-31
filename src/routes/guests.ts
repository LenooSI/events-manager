import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function guestsRoutes(app: FastifyInstance) {
  app.post("/guests", async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
    };

    const guest = await db.orm.public.Guest.create({
      name: body.name,
      email: body.email,
    });

    return reply.code(201).send({ guest });
  });
}
