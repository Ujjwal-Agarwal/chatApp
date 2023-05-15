'use client'
import { cn, toPusherKey } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import { timeStamp } from 'console'
import { FC, useEffect, useRef, useState } from 'react'
import { format } from "date-fns"
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'

interface MessagesProps {
    initialMsgs: Message[]
    sessionId: string
    sessionImg: string | null | undefined
    chatPartner: User
    chatId: string
}

const Messages: FC<MessagesProps> = ({ initialMsgs, sessionId, chatPartner, sessionImg, chatId }) => {
    const [msgs, setMsgs] = useState<Message[]>(initialMsgs)

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`chat:${chatId}`)
        )

        const messageHandler = (message: Message) => {
            setMsgs((prev) => [message, ...prev])
        }

        pusherClient.bind('incoming-message', messageHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`chat:${chatId}`)
            )
            pusherClient.unbind('incoming-message', messageHandler)
        }
    }, [])



    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp = (timestamp: number) => {
        return format(timestamp, 'HH:mm')
    }

    // console.log("cp",chatPartner)

    return <div id='messages' className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
        <div ref={scrollDownRef} />

        {msgs.map((message, index) => {
            const isCurrentUser = message.senderId === sessionId
            const hasNextMsgFromSameUser = msgs[index - 1]?.senderId === msgs[index].senderId


            return <div className='chat-message' key={`${message.id}-${message.timestamp}`}>
                <div className={cn(`flex items-end`, {
                    'justify-end': isCurrentUser,
                })}>
                    <div className={cn('flex text-base max-w-xs mx-2', {
                        'order-1 items-end': isCurrentUser,
                        'order-2 items-start': !isCurrentUser,
                    })}>
                        <div className={cn('px-4 rounded-lg flex gap-2', {
                            'bg-gray-300 text-black': isCurrentUser,
                            'bg-gray-400 text-black': !isCurrentUser,
                        })}>
                            <p className='py-2'>{message.text}{' '}</p>
                            <div className='text-[0.5rem] text-gray-700'>{formatTimestamp(message.timestamp)}</div>
                        </div>
                    </div>
                    <div className={cn('relative w-6 h-6', {
                        'order-2': isCurrentUser,
                        'order-1': !isCurrentUser,
                        'invisible': hasNextMsgFromSameUser
                    })}>
                        <Image fill src={isCurrentUser ? (sessionImg as string) : chatPartner.image} alt="Profile Picture" referrerPolicy='no-referrer' className='rounded-full' />
                    </div>
                </div>
            </div>

        })}
    </div >
}

export default Messages