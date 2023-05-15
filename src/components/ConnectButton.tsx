'use client'
// Client side interactions

import { FC, useState } from "react";
import Button from "./ui/Button";
import { emailValidator } from "@/lib/validations/connect";
import axios, { AxiosError } from 'axios'
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'

interface ConnectButtonProps { }

type FormData = z.infer<typeof emailValidator>

const ConnectButton: FC<ConnectButtonProps> = ({ }) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(emailValidator)
  })

  const connect = async (email: string) => {
    try {
      const validatedEmail = emailValidator.parse({ email })

      // Simple axios post
      await axios.post('/api/connections/add', {
        email: validatedEmail,
      })
      setShowSuccessState(true)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('email', { message: error.message })
        return
      }
      if (error instanceof AxiosError) {
        setError('email', { message: error.response?.data })
        return
      }

      setError('email', { message: 'Something went wrong' })
    }
  }

  const onSubmit = (data: FormData) => {
    connect(data.email)
  }

  return <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
    <label htmlFor="email" className="block text-sm font-medium text-gray-200">Connect using E-mail</label>
    <div className="mt-2 flex gap-2">
      <input
        {...register('email')}
        type="text" className="block border rounded-full p-1 text-gray-900 focus:border-violet-50 text-xs px-2" placeholder="abc@example.com" />
      <Button>Connect</Button>
    </div>
    <p className="mt-1 text-sm text-red-500">{errors.email?.message}</p>
    {showSuccessState ? (
      <p className="mt-1 text-sm text-green-400">Connection Request Sent</p>
    ): null}
  </form>
};

export default ConnectButton;
