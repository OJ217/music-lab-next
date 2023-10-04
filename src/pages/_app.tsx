import '@/styles/globals.css';
import '@/config/locale';

import Head from 'next/head';

import { MantineProvider } from '@mantine/core';

import type { AppProps } from 'next/app';
export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider
			theme={{ fontFamily: 'Euclid Circular A, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}
		>
			<Head>
				<title>Music Lab</title>
				<meta
					name='description'
					content='Platform for practicing and learning academic music knowledge and skills.'
				/>
			</Head>
			<Component {...pageProps} />
		</MantineProvider>
	);
}
