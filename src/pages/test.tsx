import axios from 'axios';

import { notify } from '@/utils/notification.util';
import { Button } from '@mantine/core';

const Test = () => {
	const fecthArticles = async () => {
		const articles = await axios.get('https://h7vw9lleqa.execute-api.ap-southeast-1.amazonaws.com/articles');
		notify({ type: 'success', title: 'Articles data', message: JSON.stringify(articles.data) });
	};

	return (
		<main className='grid min-h-screen place-content-center'>
			<Button
				variant='light'
				onClick={fecthArticles}
			>
				Call API
			</Button>
		</main>
	);
};

export default Test;
