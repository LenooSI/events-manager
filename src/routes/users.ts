import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function userRoutes(app: FastifyInstance) {
  app.get("/users", async () => {
    const users = await db.orm.public.User.all();
    return users;
  });

  app.post("/users", async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
      passwordHash: string;
    };

    const user = await db.orm.public.User.create({
      name: body.name,
      email: body.email,
      passwordHash: body.passwordHash,
    });

    return reply.code(201).send({ user });
  });
}
