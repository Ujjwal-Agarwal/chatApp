import { FC } from 'react'
import ConnectButton from '@/components/ConnectButton'

interface pageProps {

}

const page: FC = () => {
    return <section className='pt-8 ml-5'>
        <h1 className='font-extrabold text-7xl mb-8'>Connect with User</h1>
        <ConnectButton />
    </section>
}

export default page