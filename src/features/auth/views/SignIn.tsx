import Link from 'next/link';
import { useRouter } from 'next/router';
import { z } from 'zod';

import { GOOGLE_OAUTH } from '@/config/constants/api.constant';
import { useAuth } from '@/context/auth/auth.context';
import { notify } from '@/utils/notification.util';
import { Button, Divider, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import { useGoogleOAuthMutation, useSignInMutation } from '../services/auth.service';

const SignInPage = () => {
	const router = useRouter();
	const { setAuthStore } = useAuth();

	const { mutateGoogleOAuth, googleOAuthPending } = useGoogleOAuthMutation();

	const handleGoogleOAuth = useGoogleLogin({
		onSuccess: async credentialResponse => {
			try {
				const googleOAuthResponse = await mutateGoogleOAuth(credentialResponse);

				setAuthStore(googleOAuthResponse);
				router.push('/ear-training/practice');

				notify({
					type: 'success',
					title: 'Амжилттай нэвтэрлээ'
				});
			} catch (error) {
				console.log(error);

				notify({
					type: 'fail',
					title: 'Google account - аар нэвтрэхэд алдаа гарлаа'
				});
			}
		},
		onError: error => {
			console.log(error);

			notify({
				type: 'fail',
				title: 'Google account - аар нэвтрэхэд алдаа гарлаа'
			});
		},
		flow: 'auth-code'
	});

	const signInRequestSchema = z.object({
		email: z.string().email(),
		password: z.string().min(8).max(20)
	});

	type SignInRequestData = z.infer<typeof signInRequestSchema>;

	const signInForm = useForm<SignInRequestData>({
		initialValues: {
			email: '',
			password: ''
		},
		validate: zodResolver(signInRequestSchema)
	});

	const { mutateSignIn, signInPending } = useSignInMutation();

	const handleSignIn = async (values: SignInRequestData) => {
		try {
			const signInResponse = await mutateSignIn(values);

			setAuthStore(signInResponse.data);
			router.push('/ear-training/practice');

			notify({
				type: 'success',
				title: 'Signed in successfully'
			});
		} catch (error) {
			console.log(error);

			notify({
				type: 'fail',
				title: 'Could not sign in'
			});
		}
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center space-y-12 p-6'>
			<section className='space-y-2 text-center'>
				<h1 className='text-3xl font-semibold'>Sign In to Music Lab</h1>
				<p className='text-sm text-violet-100'>
					Do not have an account yet?{' '}
					<Link
						href={'/auth/sign-up'}
						className='text-violet-500'
					>
						Sign Up
					</Link>
				</p>
			</section>

			<div className='w-full max-w-sm rounded-lg border border-violet-800/25 bg-transparent bg-gradient-to-tr from-violet-700/15 to-violet-700/25 p-5'>
				<form
					className='w-full space-y-5'
					onSubmit={signInForm.onSubmit(handleSignIn)}
				>
					<Button
						leftSection={
							<svg
								xmlns='http://www.w3.org/2000/svg'
								preserveAspectRatio='xMidYMid'
								viewBox='0 0 256 262'
								style={{ width: '0.9rem', height: '0.9rem' }}
							>
								<path
									fill='#4285F4'
									d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
								/>
								<path
									fill='#34A853'
									d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
								/>
								<path
									fill='#FBBC05'
									d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782'
								/>
								<path
									fill='#EB4335'
									d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
								/>
							</svg>
						}
						fullWidth
						variant='gradient'
						gradient={{
							from: 'violet.9',
							to: 'violet.6'
						}}
						className='font-normal'
						onClick={() => {
							signInForm.clearErrors();
							handleGoogleOAuth();
						}}
						loading={googleOAuthPending}
					>
						Continue with Google
					</Button>

					<Divider
						label='Or sign in with email'
						labelPosition='center'
						className='my-5'
						color='violet.1'
					/>

					<TextInput
						description='Email'
						placeholder='Enter your email'
						disabled={signInPending}
						{...signInForm.getInputProps('email')}
						classNames={{
							description: 'text-white',
							input: 'text-white placeholder:text-white/75 border border-violet-800 focus:border-violet-600 bg-violet-800/50 transition-all duration-300 ease-in-out'
						}}
					/>

					<PasswordInput
						description='Password'
						placeholder='Enter your password'
						disabled={signInPending}
						{...signInForm.getInputProps('password')}
						classNames={{
							description: 'text-white',
							input: 'border-violet-800 bg-violet-800/50 transition-all duration-300 ease-in-out focus-within:border-violet-600',
							innerInput: 'text-white placeholder:text-white/75'
						}}
					/>

					<div className='text-center'>
						<Link
							href={'/auth/forgot-password'}
							className='inline-block text-xs text-violet-100'
						>
							Forgot Password?
						</Link>
					</div>

					<Button
						fullWidth
						type='submit'
						loading={signInPending}
						className='font-normal hover:shadow-lg hover:shadow-violet-600/30'
					>
						Sign In
					</Button>
				</form>
			</div>
		</main>
	);
};

const SignIn = () => {
	return (
		<GoogleOAuthProvider clientId={GOOGLE_OAUTH.client_id ?? ''}>
			<SignInPage />
		</GoogleOAuthProvider>
	);
};

export default SignIn;
