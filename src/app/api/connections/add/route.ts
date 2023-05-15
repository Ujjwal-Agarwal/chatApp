// route.ts is a mandatory name for Nextjs apis

import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { emailValidator } from "@/lib/validations/connect";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = emailValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response(`This account does not exist`);
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(`Unauthorized`, { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response(`Cannot add your own account`, {
        status: 400,
      });
    }

    //check if user is already sent a connection request
    const isAlreadyAdded = (await fetchRedis(
      `sismember`,
      `user:${idToAdd}:incoming_connect_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response(`Already sent connection request`, { status: 400 });
    }

    // check if user is already connected
    const isAlreadyConnected = (await fetchRedis(
      `sismember`,
      `user:${session.user.id}:connections`, // is idToAdd present in the connections list
      idToAdd
    )) as 0 | 1;

    if (isAlreadyConnected) {
      return new Response(`Already connected to this user`, { status: 400 });
    }

    //All checks are passed
    //Now send a notification to pusher for the realtime thing
    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_connect_requests`),
      `incoming_connect_requests`,
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
        senderImage: session.user.image,
        senderName: session.user.name,
      }
    );

    db.sadd(`user:${idToAdd}:incoming_connect_requests`, session.user.id);

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(`Invalid request payload`, { status: 422 });
    }
    return new Response(`Invalid request`, { status: 400 });
  }
}
