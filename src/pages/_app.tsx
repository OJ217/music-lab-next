import '@/styles/globals.css';
import '@/config/locale';

import Head from 'next/head';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Music Lab</title>
				<meta
					name='description'
					content='Platform for practicing and learning academic music knowledge and skills.'
				/>
			</Head>
			<Component {...pageProps} />
		</>
	);
}
