import ConnectionRequests from '@/components/ConnectionRequests'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { log } from 'console'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'

const page= async () => {
    // await does not work without an async function
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    // ids of people who sent connection requests
    const incomingSenderIDs = (await fetchRedis('smembers', `user:${session.user.id}:incoming_connect_requests`)) as string[]

    // Promise.all ensures that all requests will be fetched all at one time instead of one after another
    const incomingConnectRequests = await Promise.all(
        incomingSenderIDs.map( async (senderId)=>{
            const senderString = await fetchRedis('get',`user:${senderId}`) as string;
            const sender = JSON.parse(senderString) as User
            return {
                senderId,
                senderEmail: sender.email,
                senderImage: sender.image,
                senderName: sender.name,
            }
        })
    )

    // console.log('HAHAHAHAH',incomingConnectRequests);


    return <main className='pt-8 ml-5'>
        <h1 className='font-extrabold text-7xl mb-8'>Connect with User</h1>
        <div className='flex flex-col gap-4'>
            <ConnectionRequests incomingConnectRequest={incomingConnectRequests} sessionID={session.user.id} />
        </div>
    </main>
}

export default page