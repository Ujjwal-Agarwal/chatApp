import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate if the string is of correct type
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    // Checks for validation of requests

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response("Unauthorized Req", { status: 401 });
    }

    // Verify that users are not already connected
    const isConnected = await fetchRedis(
      "sismember",
      `user:${session.user.id}:connections`,
      idToAdd
    );
    if (isConnected) {
      return new Response("Already Connected", { status: 400 }); // 400- Bad request
    }

    // See if the connection request has actually come to the user
    const requestHasCome = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_connect_requests`,
      idToAdd
    );

    if(!requestHasCome){
        return new Response('No Request Found',{status:400}) // 400- Bad Request
    }

    // Now modify the Database,

    //sadd - Add to a set
    await db.sadd(`user:${session.user.id}:connections`,idToAdd)
    await db.sadd(`user:${idToAdd}:connections`,session.user.id);
    // Both people add each other as a connection

    // Now to delete the `friend request` after it is accepted

    //srem- Remove from set
    await db.srem(`user:${idToAdd}:incoming_connect_requests`,session.user.id)
    await db.srem(`user:${session.user.id}:incoming_connect_requests`,idToAdd)
    // Using two commands incase both users have a mutual friend request

    
    return new Response('OK')

  } catch (error) {
    if(error instanceof(z.ZodError)){
        return new Response('Invalid request payload',{status:422}) // id sent is not compliant with format
    }

    return new Response('Invalid Request',{status:400}) // Generic response
  }
}
