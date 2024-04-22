import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { notify } from '@/utils/notification.util';
import { Button, TextInput, Tooltip } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';

import AuthLayout from '../layouts/auth-layout';

const ForgotPassword = () => {
	const { t: authT } = useTranslation('auth');

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
		<AuthLayout>
			<section className='space-y-1.5 text-center text-violet-100'>
				<h1 className='text-2xl font-semibold'>{authT('forgotPassword')}</h1>
				<p className='max-w-xs text-sm'>{authT('forgotPasswordDesc')}</p>
			</section>

			<div className='w-full max-w-sm rounded-lg border border-violet-800/25 bg-transparent bg-gradient-to-tr from-violet-700/15 to-violet-700/25 p-5'>
				<form
					className='w-full space-y-5'
					onSubmit={forgotPasswordForm.onSubmit(handleForgotPasswordRequest)}
				>
					<Tooltip label={'This feature is not implemented at the moment'}>
						<TextInput
							disabled
							placeholder={authT('emailInputPlaceholder')}
							{...forgotPasswordForm.getInputProps('email')}
							classNames={{
								description: 'text-white',
								input: 'placeholder:text-white/75 border border-violet-800 focus:border-violet-600 bg-violet-800/50 transition-all duration-300 ease-in-out'
							}}
						/>
					</Tooltip>

					<div className='text-center'>
						<Link
							href={'/auth/sign-in'}
							className='inline-flex items-center gap-1 text-xs text-violet-100 transition-all duration-300 ease-in-out hover:gap-2'
						>
							<IconArrowLeft size={16} />
							<p>{authT('signIn')}</p>
						</Link>
					</div>

					<Button
						type='submit'
						fullWidth
						className='pointer-events-none cursor-not-allowed font-normal opacity-25 hover:shadow-lg hover:shadow-violet-600/30'
					>
						{authT('send')}
					</Button>
				</form>
			</div>
		</AuthLayout>
	);
};

export default ForgotPassword;
