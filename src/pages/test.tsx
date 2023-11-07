import axios from 'axios';

import { notify } from '@/utils/notification.util';
import { Button } from '@mantine/core';

const Test = () => {
	const fecthArticles = async () => {
		const articles = await axios.get('/articles');
		notify({
			type: 'success',
			title: 'Articles data',
			message: JSON.stringify(articles.data?.docs[0]).substring(0, 320) + '...'
		});
	};

	const fecthUsers = async () => {
		const users = await axios.get('/users', { isPrivate: true });
		notify({
			type: 'success',
			title: 'Users data',
			message: JSON.stringify(users.data?.docs[0])
		});
	};

	const fecthMe = async () => {
		const users = await axios.get('/users/me', { isPrivate: true });
		notify({ type: 'success', title: 'Users data', message: JSON.stringify(users.data?.user) });
	};

	return (
		<main className='grid min-h-screen place-content-center p-8'>
			<div className='flex flex-wrap items-center justify-center gap-8'>
				<Button
					variant='light'
					onClick={fecthArticles}
				>
					Articles API
				</Button>

				<Button
					variant='default'
					onClick={fecthUsers}
				>
					Users API
				</Button>

				<Button
					variant='filled'
					onClick={fecthMe}
				>
					Me API
				</Button>
			</div>
		</main>
	);
};

export default Test;
