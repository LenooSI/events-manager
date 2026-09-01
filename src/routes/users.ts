import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function userRoutes(app: FastifyInstance) {
  app.get("/users", async () => {
    const users = await db.orm.public.User.all();
    return users;
  });

  app.post(
    "/users",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "passwordHash"],
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", minLength: 1 },
            passwordHash: { type: "string", minLength: 1 },
          },
          additionalProperties: true,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        email: string;
        passwordHash: string;
      };

      if (!body.name || !body.email || !body.passwordHash) {
        return reply.code(400).send({
          error: "Missing required fields",
          required: ["name", "email", "passwordHash"],
        });
      }

      const user = await db.orm.public.User.create({
        name: body.name,
        email: body.email,
        passwordHash: body.passwordHash,
      });

      return reply.code(201).send({ user });
    }
  );
}
