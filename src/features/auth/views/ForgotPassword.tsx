import Link from 'next/link';
import { z } from 'zod';

import { notify } from '@/utils/notification.util';
import { Button, Paper, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import PublicOnlyRoute from '@/context/auth/hoc/PublicRoute';

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
		console.log(data);

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
				<p className='text-sm text-slate-400'>Enter your email to get a reset link</p>
			</section>

			<Paper
				withBorder
				shadow='md'
				radius='md'
				className='w-full max-w-sm p-5 transition-all duration-300 ease-in-out'
			>
				<form
					className='w-full space-y-5'
					onSubmit={forgotPasswordForm.onSubmit(handleForgotPasswordRequest)}
				>
					<TextInput
						description='Email'
						placeholder='Enter your email'
						{...forgotPasswordForm.getInputProps('email')}
					/>

					<div className='text-center'>
						<Link
							href={'/auth/sign-in'}
							className='inline-flex items-center gap-1 text-xs text-violet-400 transition-all duration-300 ease-in-out hover:gap-2'
						>
							<IconArrowLeft size={16} />
							<p>Back to Sign In</p>
						</Link>
					</div>

					<Button
						type='submit'
						fullWidth
						className='font-normal hover:shadow-lg hover:shadow-violet-600/30'
					>
						Send
					</Button>
				</form>
			</Paper>
		</main>
	);
};

export default ForgotPassword;
