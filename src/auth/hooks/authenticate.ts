import { FastifyReply, FastifyRequest } from "fastify";
import { verifySessionToken } from "../session-generation";
import { db } from "../../prisma/db";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const bearer = request.headers.authorization;

  if (!bearer) {
    return reply.code(401).send({
      error: "Authenticated route",
    });
  }

  const [_, token] = bearer.split(" ");
  const sessionData = verifySessionToken(token);

  if (!sessionData) {
    return reply.code(401).send({
      error: "Invalid session",
    });
  }

  const session = await db.orm.public.Session.where({
    id: sessionData.sessionId,
  }).first();

  if (!session) {
    return reply.code(401).send({
      error: "Session not found",
    });
  }

  request.appSession = session
}
