import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";
import { hashPassword, verifyPassword } from "../auth/password-hashing";
import { request } from "node:http";
import { createSessionToken } from "../auth/session-generation";
import { Temporal } from "@js-temporal/polyfill";
import { authenticate } from "../auth/hooks/authenticate";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/users",
    {
      preHandler: authenticate,
    },
    async () => {
      const users = await db.orm.public.User.all();
      return users.map(({ passwordHash, ...user }) => user);
    },
  );

  app.post(
    "/users",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 1 },
            email: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 1 },
          },
          additionalProperties: true,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        email: string;
        password: string;
      };

      if (!body.name || !body.email || !body.password) {
        return reply.code(400).send({
          error: "Missing required fields",
          required: ["name", "email", "password"],
        });
      }

      const hashedPassword = await hashPassword(body.password);

      const user = await db.orm.public.User.create({
        name: body.name,
        email: body.email,
        passwordHash: hashedPassword,
      });

      const { passwordHash, ...safeUser } = user;

      return reply.code(201).send({
        user: safeUser,
      }); 
    },
  );

  app.post("/user/login", async (request, reply) => {
    const body = request.body as {
      email: string;
      password: string;
    };

    const searchUser = await db.orm.public.User.where({
      email: body.email,
    }).first();

    if (!searchUser) {
      return reply.code(404).send({
        error: "not found",
      });
    }

    const isSamePassword = await verifyPassword(
      body.password,
      searchUser.passwordHash,
    );

    if (!isSamePassword) {
      return reply.code(401).send({
        error: "wrong password",
      });
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const sessionId = crypto.randomUUID();

    const { token, tokenHash } = createSessionToken(sessionId, expiresAt);

    await db.orm.public.Session.create({
      id: sessionId,
      ownerId: searchUser.id,
      tokenHash,
      expiresAt: Temporal.Instant.from(expiresAt.toISOString()),
    });

    return reply.code(200).send({
      token,
      expiresAt,
    });
  });
}
