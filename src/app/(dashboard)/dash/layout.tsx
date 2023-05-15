import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { Icon, Icons } from '@/components/Icons'
import { BsFillChatLeftFill } from 'react-icons/bs'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'
import ConnectReqSidebar from '@/components/ConnectReqSidebar'
import { fetchRedis } from '@/helpers/redis'
import { getConnectionsbyId } from '@/helpers/getConnectionsbyId'
import SidebarChatList from '@/components/SidebarChatList'

interface LayoutProps {
    children: ReactNode
}

interface SideBarOption {
    id: number,
    name: string,
    href: string,
    Icon: Icon,
}
const sideBarOptions: SideBarOption[] = [
    {
        id: 1,
        name: 'Connect To User',
        href: '/dash/add',
        Icon: 'UserPlus'
    },
]

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions) // Get session details
    if (!session) notFound()

    const connections = await getConnectionsbyId(session.user.id)
    // console.log(connections)


    const unseenReqCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_connect_requests`) as User).length

    return <div className='bg-slate-900 text-white w-full flex h-screen'>
        <div className='pt-5 px-5 flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white-px-6'>
            <Link href="/dash">
                {/* <BsFillChatLeftFill /> */}
                <div className='flex gap-2 items-center justify-center'><Icons.Logo /> <p className='inline-block align-middle text-3xl font-extrabold'>chatApp</p></div>
            </Link>
            <hr></hr>
            {/* Link in Nextjs does not cause the entire page to be reloaded unlike a <a> tag. Hence it's faster and is best practice unless there is a specific reason to use <a> */}
            {connections.length > 0 ? (
                <div className='text-sm font-semibold leading-6 text-gray-300'>
                    Direct Messages
                </div>
            ) : null}
            <nav className='flex flex-1 flex-col'>
                <ul role='list' className='flex flex-1 flex-col gap-y-7' >
                    <li>
                        {/* // User Chats */}
                        <SidebarChatList connections={connections} sessionId={session.user.id} />

                    </li>
                    <li>
                        <div className='text-sm font-semibold leading-6 text-gray-300'>Overview</div>
                        <ul role='list' className='mx-2 mt-2 space-y-1'>
                            {sideBarOptions.map((option) => {
                                const Icon = Icons[option.Icon]
                                return (
                                    <li key={option.id}>
                                        <Link href={option.href} className='text-gray-700 hover:text-green-600 bg-gray-50 group flex gap-3 rounded-full p-2 text-sm leading-6 font-semibold'>
                                            <span className='text-gray-400 border-gray-200 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.625rem] font-medium'>
                                                <Icon className='h-4 w-4' />
                                            </span>
                                            <span className='truncate'>{option.name}</span>

                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>


                    <li>
                        <ConnectReqSidebar sessionID={session.user.id} initialUnseenRequestCount={unseenReqCount} />
                    </li>

                    <li className='-mx-6 mt-auto flex items-center'>
                        <div className='flex flex-1 items-center gap-x-2 px-6 py-3 text-xs font-semibold leading-6'>
                            {/* //NextJS <Image /> is absolute and will hence conform to the nearest relative tag */}
                            <div className='relative h-10 w-10'>
                                <Image fill referrerPolicy='no-referrer' className='rounded-full' src={session.user.image || ''} alt='Profile picture' />
                            </div>
                            <div className='flex flex-col'>
                                <span>{session.user.name}</span>
                                <span className='text-xs text-zinc-400'>{session.user.email}</span>
                            </div>
                        </div>
                        <SignOutButton className='h-full' />
                    </li>
                </ul>
            </nav>
        </div>
        {children}
        </div>
}

export default Layout