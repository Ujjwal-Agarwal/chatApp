'use client'
import { chatHrefConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'

interface SidebarChatListProps {
    connections: User[]
    sessionId: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ connections, sessionId }) => {
    // const route = useRouter();
    const pathname = usePathname()
    const [unseenMsg, setUnseenMsg] = useState<Message[]>([]);

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMsg((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId)) // If the user has seen the message, remove it from unseen
            })
        }
    })

    return <ul role='list' className='mex-h-[25rem] overflow-y-auto space-y-1'>
        {connections.sort().map((conn) => {
            const unseenMsgCount = unseenMsg.filter((unseen) => {
                return unseen.senderId === conn.id
            }).length

        
            return <li key={conn.id}>
                {/* a tag forces hard refresh */}
                <a href={`/dash/chat/${chatHrefConstructor(sessionId, conn.id)}`}>
                    <div className='h-15 p-2 flex gap-2 border rounded-lg'>
                        <div className='relative h-10 w-10'>
                            <Image src={conn.image} fill alt="Connection Image" className='rounded-full'  />
                        </div>
                        <div className='w-4/5'>
                            <div className='flex gap-2 items-center '><p className='inline-block text-md text-gray-100'>{conn.name}</p>{unseenMsgCount>0 ? (<div className='text-sm h-5 w-5 rounded-lg items-center justify-center flex bg-green-400'>{unseenMsgCount}</div>) : null}</div>
                            <p className='text-xs text-gray-400 overflow-auto'>{conn.email}</p>
                        </div>
                    </div>
                </a>
            </li>
        })}
    </ul>
}

export default SidebarChatList