'use client'

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface ConnectReqSidebarProps {
  sessionID: string,
  initialUnseenRequestCount:number
}

const ConnectReqSidebar: FC<ConnectReqSidebarProps> = ({sessionID,initialUnseenRequestCount}) => {
  const [unseenRequest,setUnseenRequests] = useState<number>(
    initialUnseenRequestCount
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionID}:incoming_connect_requests`)
    )

    const connectionRequestHandler = () => {
      setUnseenRequests((prev)=>prev+1)
    }

    pusherClient.bind('incoming_connect_requests', connectionRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionID}:incoming_connect_requests`)
      )
      pusherClient.unbind('incoming_connect_requests', connectionRequestHandler)
    }
  }, [])



  return <Link href='/dash/requests' className='mx-2 text-slate-700 hover:text-green-600 bg-gray-50 group flex items-center gap-x-3 rounded-full p-2 text-sm leading-6 font-semibold'>
    <div className='text-gray-400 border-gray-200 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.625rem] font-medium'>
        <User className='h-4 w-4' />
    </div>
    <p className='truncate'>Connection Requests</p>
    {unseenRequest>0 ?(
      <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-slate-900 hover:bg-green-600'>
        {unseenRequest}
      </div>
    ):null}
  </Link>
}

export default ConnectReqSidebar