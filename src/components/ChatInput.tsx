'use client'
import { FC, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Send } from 'lucide-react'

interface ChatInputProps {
    chatPartner: User
    chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [input, setInput] = useState<string>('')

    const sendMessage = async () => {
        if(!input) return
        setIsLoading(true);
        try {
            // await new Promise((resolve) => setTimeout(resolve, 1000))
            await axios.post('/api/message/send', { text: input, chatId })
            setInput('')
            textareaRef.current?.focus()
        } catch (error) {
            toast.error('Please try again')
        } finally {
            setIsLoading(false)
        }
    }

    return <div className='border-t border-gray-200 px-4 pt-4 mb-2'>
        <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-200'>
            <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                }
            }} rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Text ${chatPartner.name} `}
                className='block w-full resize-none border-0 bg-transparent text-gray-400 placeholder:text-gray-400 focus:ring-0'
            />

            <div onClick={() => textareaRef.current?.focus()} className='py-2'>
                <div className='py-px'>
                    <div className='h-9' />
                </div>
            </div>
            <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                <div className='flex-shrink-0'>
                    <Button isLoading={isLoading} onClick={sendMessage} type='submit'>
                        <Send />
                    </Button>
                </div>
            </div>


        </div>

    </div>
}

export default ChatInput