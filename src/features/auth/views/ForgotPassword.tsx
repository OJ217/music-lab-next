import Link from 'next/link';
import { z } from 'zod';

import { notify } from '@/utils/notification.util';
import { Button, Paper, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';

const ForgotPassword = () => {
	const forgotPasswordRequestSchema = z.object({ email: z.string().email() });

	type ForgotPasswordRequestData = z.infer<typeof forgotPasswordRequestSchema>;

	const forgotPasswordForm = useForm<ForgotPasswordRequestData>({
		initialValues: {
			email: ''
		},
		validate: zodResolver(forgotPasswordRequestSchema)
	});

	const handleForgotPasswordRequest = (data: ForgotPasswordRequestData) => {
		notify({
			type: 'success',
			title: (
				<p>
					Password reset link sent to <span className='font-semibold'>{data.email}</span>
				</p>
			)
		});
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center space-y-12 p-6'>
			<section className='space-y-2 text-center'>
				<h1 className='text-3xl font-semibold'>Forgot your Password?</h1>
				<p className='text-sm text-violet-100'>Enter your email to get a reset link</p>
			</section>

			<Paper
				withBorder
				shadow='md'
				radius='md'
				className='w-full max-w-sm rounded-lg border border-violet-700/10 bg-transparent bg-gradient-to-tr from-violet-700/5 to-violet-700/20 p-5'
			>
				<form
					className='w-full space-y-5'
					onSubmit={forgotPasswordForm.onSubmit(handleForgotPasswordRequest)}
				>
					<TextInput
						description='Email'
						placeholder='Enter your email'
						{...forgotPasswordForm.getInputProps('email')}
						classNames={{
							description: 'text-white',
							input: 'placeholder:text-white/75 border border-violet-800 focus:border-violet-600 bg-violet-800/50 transition-all duration-300 ease-in-out'
						}}
					/>

					<div className='text-center'>
						<Link
							href={'/auth/sign-in'}
							className='inline-flex items-center gap-1 text-xs text-violet-100 transition-all duration-300 ease-in-out hover:gap-2'
						>
							<IconArrowLeft size={16} />
							<p>Back to Sign In</p>
						</Link>
					</div>

					<Button
						type='submit'
						fullWidth
						className='pointer-events-none cursor-not-allowed font-normal opacity-25 hover:shadow-lg hover:shadow-violet-600/30'
					>
						Send
					</Button>
				</form>
			</Paper>
		</main>
	);
};

export default ForgotPassword;
