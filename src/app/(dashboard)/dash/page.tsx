import { FC } from 'react';
import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface pageProps { }

const page = async ({ }) => {
    const session = await getServerSession(authOptions)
    return <pre></pre>
}

export default page