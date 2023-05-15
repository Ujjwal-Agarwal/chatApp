import ChatInput from '@/components/ChatInput'
import Messages from '@/components/Messages'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArraySchema } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface PageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages(chatId: string) {
  try {
    const result: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1) // zrange is a sorted array

    const dbMsgs = result.map((message) => JSON.parse(message) as Message)

    const reversedDbMsgs = dbMsgs.reverse() // reverse since it's a sorted array and we want the reverse order

    const messages = messageArraySchema.parse(reversedDbMsgs)

    return messages

  } catch (error) {
    notFound()
  }
}

const page = async ({ params }: PageProps) => {

  const { chatId } = params // Destructure chatId
  const session = await getServerSession(authOptions)
  if (!session) notFound()
  const { user } = session // Destructure user


  const [userId1, userId2] = chatId.split('_')

  if (user.id != userId1 && user.id != userId2) {
    notFound() // If you are not part of the chat, user can not view the chat
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User

  // console.log("cp1",chatPartner)

  // To get messages
  const initMsgs = await getChatMessages(chatId)


  return <div className='flex-1 justify-between flex flex-col h-full'>
    <div className='flex justify-between py-3 border-b-2 border-gray-200'>
      <div className='relative flex items-center space-x-4 mx-5'>
        <div className='relative'>
          <div className='relative w-10 h-10 '>
            <Image fill src={chatPartner.image} referrerPolicy='no-referrer' alt={`${chatPartner.name} profile pic`} className='rounded-full' />
          </div>
        </div>

        <div className='flex flex-col leading-tight'>
          <div className='text-xl flex items-center'>
            <span className='text-white mr-3 font-semibold'>{chatPartner.name}</span>
          </div>

          <span className='text-sm text-slate-400'>{chatPartner.email}</span>
        </div>
      </div>
    </div>
    
    <Messages initialMsgs={initMsgs} sessionId={session.user.id} chatPartner={chatPartner} sessionImg={session.user.image} chatId={chatId} />

    <ChatInput chatPartner={chatPartner} chatId={chatId} />

  </div>
}

export default page