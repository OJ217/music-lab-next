import Link from 'next/link';
import { z } from 'zod';

import { GOOGLE_OAUTH } from '@/config/constants/api.constant';
import { notify } from '@/utils/notification.util';
import { Button, Divider, Paper, PasswordInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import { useGoogleOAuthMutation, useSignUpMutation } from '../services/auth.mutation';

const SignUpPage = () => {
	const { mutateGoogleOAuth, googleOAuthPending } = useGoogleOAuthMutation();

	const handleGoogleOAuth = useGoogleLogin({
		onSuccess: async credentialResponse => {
			try {
				const googleOAuthResponse = await mutateGoogleOAuth(credentialResponse);

				console.log({ googleOAuthResponse });

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

	const signUpRequestSchema = z
		.object({
			email: z.string().email(),
			username: z.string().min(4).max(20),
			password: z.string().min(8).max(20),
			passwordConfirmation: z.string()
		})
		.refine(
			({ password, passwordConfirmation }) => {
				return password === passwordConfirmation;
			},
			{ message: 'Passwords must match', path: ['passwordConfirmation'] }
		);

	type SignUpRequestData = z.infer<typeof signUpRequestSchema>;

	const signUpForm = useForm<SignUpRequestData>({
		initialValues: {
			email: '',
			username: '',
			password: '',
			passwordConfirmation: ''
		},
		validate: zodResolver(signUpRequestSchema)
	});

	const { mutateSignUp, signUpPending } = useSignUpMutation();

	const handleSignUp = async (data: SignUpRequestData) => {
		try {
			const signUpResponse = await mutateSignUp(data);

			console.log({ signUpResponse });

			notify({
				type: 'success',
				title: 'Signed up successfully'
			});
		} catch (error) {
			console.log(error);

			notify({
				type: 'fail',
				title: 'Could not sign up'
			});
		}
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center space-y-12 p-6'>
			<section className='space-y-2 text-center'>
				<h1 className='text-3xl font-semibold'>Sign Up to Music Lab</h1>
				<p className='text-sm text-slate-400'>
					Already have an account?{' '}
					<Link
						href={'/auth/sign-in'}
						className='text-violet-400 underline'
					>
						Sign In
					</Link>
				</p>
			</section>

			<Paper
				withBorder
				shadow='md'
				radius='md'
				className='w-full max-w-sm p-5 transition-all duration-300 ease-in-out'
			>
				<form
					className='w-full space-y-10'
					onSubmit={signUpForm.onSubmit(handleSignUp)}
				>
					<div className='space-y-5'>
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
							variant='light'
							className='font-normal'
							onClick={handleGoogleOAuth}
							loading={googleOAuthPending}
						>
							Continue with Google
						</Button>

						<Divider
							label='Or sign up with email'
							labelPosition='center'
							className='my-5'
						/>

						<TextInput
							description='Email'
							placeholder='Enter your email'
							disabled={signUpPending}
							{...signUpForm.getInputProps('email')}
						/>

						<TextInput
							description='Username'
							placeholder='Enter your username'
							disabled={signUpPending}
							{...signUpForm.getInputProps('username')}
						/>

						<PasswordInput
							description='Password'
							placeholder='Enter your password'
							disabled={signUpPending}
							{...signUpForm.getInputProps('password')}
						/>

						<PasswordInput
							description='Confirm Password'
							placeholder='Re-enter your password'
							disabled={signUpPending}
							{...signUpForm.getInputProps('passwordConfirmation')}
						/>
					</div>

					<Button
						fullWidth
						type='submit'
						loading={signUpPending}
						className='font-normal hover:shadow-lg hover:shadow-violet-600/30'
					>
						Sign Up
					</Button>
				</form>
			</Paper>
		</main>
	);
};

const SignUp = () => {
	return (
		<GoogleOAuthProvider clientId={GOOGLE_OAUTH.client_id ?? ''}>
			<SignUpPage />
		</GoogleOAuthProvider>
	);
};

export default SignUp;