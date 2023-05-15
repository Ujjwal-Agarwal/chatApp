'use client'
import { Check, UserPlus, X } from 'lucide-react'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

interface ConnectionRequestsProps {
  incomingConnectRequest: IncomingConnectRequest[],
  sessionID: string
}

const ConnectionRequests: FC<ConnectionRequestsProps> = ({ incomingConnectRequest, sessionID }) => {
  const router = useRouter(); // use next/navigation
  const [connReqs, setConnReqs] = useState<IncomingConnectRequest[]>(
    incomingConnectRequest
  )
  // { console.log("HELLO", connReqs) }

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionID}:incoming_connect_requests`)
    )

    const connectionRequestHandler = ({ senderId, senderEmail, senderImage,senderName }: IncomingConnectRequest) => {
      setConnReqs((prev) => [...prev, { senderId, senderEmail, senderImage,senderName }])
    }

    pusherClient.bind('incoming_connect_requests', connectionRequestHandler)

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionID}:incoming_connect_requests`)
      )
      pusherClient.unbind('incoming_connect_requests', connectionRequestHandler)
    }
  }, [])

  // async since we will make an API call inside this function
  const acceptConnection = async (senderId: string) => {
    await axios.post('/api/connections/accept', { id: senderId })
    setConnReqs((prev) => prev.filter((req) => (req.senderId != senderId)))

    router.refresh()

  }
  const denyConnection = async (senderId: string) => {
    await axios.post('/api/connections/deny', { id: senderId })
    setConnReqs((prev) => prev.filter((req) => (req.senderId != senderId)))

    router.refresh()

  }


  return <div className='grid grid-cols-2 gap-2'>
    {connReqs.length === 0 ? (
      <p className='text-sm text-gray-200'>Nothing to Render</p>
    ) : (
      connReqs.map((req) => (
        <div key={req.senderId} className='flex gap-4 items-center text-gray-200 border rounded-lg p-5 w-15'>

          <div className='w-10 h-10 relative'>
            <Image src={req.senderImage} fill alt='Image for User Req' className='rounded-full' /></div>
          <div className='grid'>
            <p className='font-bold text-md'>{req.senderName}</p>
            <p className='font-medium text-xs'>{req.senderEmail}</p>
          </div>
          <button onClick={() => acceptConnection(req.senderId)} className='w-8 h-8 bg-white hover:bg-green-400 flex items-center justify-center rounded-full '>
            <Check className='font-semibold text-black w-3/4 h-3/4' />
          </button>
          <button onClick={() => { denyConnection(req.senderId) }} className='w-8 h-8 bg-white hover:bg-red-500 flex items-center justify-center rounded-full '>
            <X className='font-semibold text-black w-3/4 h-3/4' />
          </button>
        </div>
      ))
    )}
  </div>
}

export default ConnectionRequests