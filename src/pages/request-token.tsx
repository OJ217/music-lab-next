import axios from 'axios';

import { IResponse } from '@/types';
import { notify } from '@/utils/notification.util';
import { Button } from '@mantine/core';

const Token = () => {
	const handleRequestToken = async () => {
		try {
			const {
				data: {
					data: { message }
				}
			} = await axios.post<IResponse<{ message: string }>>('/request-token');
			notify({ title: message, type: 'log' });
		} catch (error) {
			console.error(error);
			notify({ title: 'Error requesting token', type: 'fail' });
		}
	};

	const handleSignOut = async () => {
		try {
			await axios.post('http://localhost:3000/api/sign-out');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className='grid min-h-screen place-content-center'>
			<Button
				onClick={() => {
					void handleRequestToken();
				}}
			>
				Request token
			</Button>
			<Button
				onClick={() => {
					void handleSignOut();
				}}
			>
				Sign out
			</Button>
		</div>
	);
};

export default Token;
