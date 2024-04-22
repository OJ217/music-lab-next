import axios from 'axios';

import { notify } from '@/utils/notification.util';
import { Button } from '@mantine/core';

const Token = () => {
	const handleRequestToken = async () => {
		try {
			const {
				data: { message }
			} = await axios.post<{ message: string }>('/request-token');
			notify({ title: message, type: 'log' });
		} catch (error) {
			console.error(error);
			notify({ title: 'Error requesting token', type: 'fail' });
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
		</div>
	);
};

export default Token;
