import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { GOOGLE_OAUTH } from '@/config/constants/api.constant';
import { useAuth } from '@/context/auth/auth.context';
import { notify } from '@/utils/notification.util';
import { Button, Divider, PasswordInput, TextInput, Tooltip } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

import AuthLayout from '../layouts/auth-layout';
import { useGoogleOAuthMutation, useSignUpMutation } from '../services/auth.service';

const SignUpPage = () => {
	const router = useRouter();
	const { t: authT } = useTranslation('auth');
	const { setAuthStore } = useAuth();

	const { mutateGoogleOAuth, googleOAuthPending } = useGoogleOAuthMutation();

	const handleGoogleOAuth = useGoogleLogin({
		onSuccess: async credentialResponse => {
			try {
				const googleOAuthResponse = await mutateGoogleOAuth(credentialResponse);

				setAuthStore(googleOAuthResponse.auth);
				router.push('/ear-training/practice');

				notify({
					type: 'success',
					title: 'Амжилттай нэвтэрлээ'
				});
			} catch (error) {
				console.error(error);

				notify({
					type: 'fail',
					title: 'Google account - аар нэвтрэхэд алдаа гарлаа'
				});
			}
		},
		onError: error => {
			console.error(error);

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

			setAuthStore(signUpResponse.auth);
			router.push('/ear-training/practice');

			notify({
				type: 'success',
				title: 'Signed up successfully'
			});
		} catch (error) {
			console.error(error);

			notify({
				type: 'fail',
				title: 'Could not sign up'
			});
		}
	};

	return (
		<AuthLayout>
			<section className='space-y-2 text-center text-violet-100'>
				<h1 className='text-2xl font-semibold'>{authT('signUp')}</h1>
				{/* <p className='text-sm'>
					{authT('alreadySignedUp')}{' '}
					<Link
						href={'/auth/sign-in'}
						className='text-violet-400'
					>
						{authT('signIn')}
					</Link>
				</p> */}
			</section>

			<div className='w-full max-w-sm rounded-lg border border-violet-800/25 bg-transparent bg-gradient-to-tr from-violet-700/20 to-violet-700/40 p-5'>
				<form
					className='w-full space-y-10'
					// onSubmit={signUpForm.onSubmit(handleSignUp)}
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
							variant='gradient'
							gradient={{
								from: 'violet.9',
								to: 'violet.6'
							}}
							className='font-normal'
							onClick={handleGoogleOAuth}
							loading={googleOAuthPending}
						>
							{authT('signInWithGoogle')}
						</Button>

						<Divider
							label={authT('or')}
							labelPosition='center'
							className='my-5'
							color='violet.1'
						/>

						<TextInput
							description={authT('email')}
							placeholder={authT('emailInputPlaceholder')}
							disabled={true ?? signUpPending}
							{...signUpForm.getInputProps('email')}
							classNames={{
								description: 'text-white',
								input: 'text-white placeholder:text-white/75 border border-violet-800 focus:border-violet-600 bg-violet-800/50 transition-all duration-300 ease-in-out'
							}}
						/>

						<TextInput
							description={authT('username')}
							placeholder={authT('usernameInputPlaceholder')}
							disabled={true ?? signUpPending}
							{...signUpForm.getInputProps('username')}
							classNames={{
								description: 'text-white',
								input: 'text-white placeholder:text-white/75 border border-violet-800 focus:border-violet-600 bg-violet-800/50 transition-all duration-300 ease-in-out'
							}}
						/>

						<PasswordInput
							description={authT('password')}
							placeholder={authT('passwordInputPlaceholder')}
							disabled={true ?? signUpPending}
							{...signUpForm.getInputProps('password')}
							classNames={{
								description: 'text-white',
								input: 'border-violet-800 bg-violet-800/50 transition-all duration-300 ease-in-out focus-within:border-violet-600',
								innerInput: 'text-white placeholder:text-white/75'
							}}
						/>

						<PasswordInput
							description={authT('passwordConfirmation')}
							placeholder={authT('passwordConfirmationInputPlaceholder')}
							disabled={true ?? signUpPending}
							{...signUpForm.getInputProps('passwordConfirmation')}
							classNames={{
								description: 'text-white',
								input: 'border-violet-800 bg-violet-800/50 transition-all duration-300 ease-in-out focus-within:border-violet-600',
								innerInput: 'text-white placeholder:text-white/75'
							}}
						/>
					</div>

					<Tooltip label={'This feature is not implemented at the moment'}>
						<Button
							fullWidth
							// type='submit'
							loading={signUpPending}
							className='cursor-not-allowed font-normal opacity-25'
						>
							{authT('signUp')}
						</Button>
					</Tooltip>
				</form>
			</div>
		</AuthLayout>
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
