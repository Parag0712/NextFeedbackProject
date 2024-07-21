"use client"
import { singUpScheama } from '@/Schemas/singUpSchema';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const page = () => {
    const [username, setUsername] = useState('');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedUsername = useDebounceCallback(setUsername, 300);
    
    const router = useRouter();
    const { toast } = useToast()

    // check useForm data valida or not
    const form = useForm<z.infer<typeof singUpScheama>>(
            {
            resolver: zodResolver(singUpScheama),
            defaultValues: {
                username: '',
                email: '',
                password: '',
            }
        }
    )

    useEffect(() => {
        const checkUsernameUnique = async () => {

            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage(''); // Reset message
                try {
                    const response = await axios.get<ApiResponse>(
                        `/api/check-username?username=${username}`
                    );
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? 'Error checking username'
                    );
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        };
        checkUsernameUnique();
    }, [username]); 


    // onSubmit
    const onSubmit = async (data: z.infer<typeof singUpScheama>) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data);
            toast({
                title: 'Success',
                description: response.data.message,
            });
            
            router.replace(`/verify/${username}`);
            setIsSubmitting(false);
        } catch (error) {
            console.error('Error during sign-up:', error);
            const axiosError = error as AxiosError<ApiResponse>;
            // Default error message
            let errorMessage = axiosError.response?.data.message;
            ('There was a problem with your sign-up. Please try again.');

            toast({
                title: 'Sign Up Failed',
                description: errorMessage,
                variant: 'destructive',
            });
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                {/* HEADER */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join True Feedback
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>


                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name='username'
                            control={form.control}
                            render={(data) => {
                                console.log(data);
                                return <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...data.field}
                                        onChange={(e) => {
                                            data.field.onChange(e);
                                            debouncedUsername(e.target.value);
                                        }}
                                    />
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p
                                            className={`text-sm ${usernameMessage === 'Username is unique'
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                                }`}
                                        >
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            }}
                        />

                        {/* email field */}
                        <FormField
                            name='email'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name="email" />
                                    <p className='text-muted text-gray-400 text-sm'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* password field */}
                        <FormField
                            name='password'
                            control={form.control}
                            render={({ field }) => {
                                console.log(field);
                                return <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input {...field} type='password' name='password'></Input>
                                    <FormMessage />
                                </FormItem>
                            }}
                        />

                        {/* submit button */}
                        <Button type="submit" className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>

                    </form>
                </Form>

                {/* FOOTER */}
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    )
}

export default page;