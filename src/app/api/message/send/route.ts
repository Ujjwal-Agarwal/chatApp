import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Message, messageSchema } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import {nanoid} from "nanoid"
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { text, chatId } : {text:string, chatId:string} = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 }); // 401-Unauthorized
    }
    const [userid1, userid2] = chatId.split("_");

    if (session.user.id != userid1 && session.user.id != userid2) {
      return new Response("Unauthorised", { status: 401 });
    }

    const connectionId = session.user.id===userid1 ? userid2 : userid1;

    const connectionList = await fetchRedis('smembers',`user:${session.user.id}:connections`) as string[]
    const isConnected = connectionList.includes(connectionId)

    if(!isConnected){
        return new Response('Unauthorized',{status:401})
    }

    // const rawSender = await fetchRedis('get',`user:${session.user.id}`) as string
    // const sender = JSON.parse(rawSender) as User

    // Every check is passed so now send the message
    const timestamp = Date.now()
    const messageData: Message={
        // For id generation,use nanoid
        id:nanoid(),
        senderId: session.user.id,
        text,
        timestamp,
    }

    const message = messageSchema.parse(messageData)

    // Notify client before sending to db
    pusherServer.trigger(toPusherKey(`chat:${chatId}`),`incoming-message`,message)

    await db.zadd(`chat:${chatId}:messages`,{
        // Sorted by timestamp
        score: timestamp,
        member: JSON.stringify(message)
    })

    return new Response('OK')

  } catch (error) {
    if(error instanceof Error){
        return new Response(error.message,{status:500})
    }
    return new Response('Internal Server Error',{status:500})
  }
}
