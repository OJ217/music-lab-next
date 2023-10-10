import '@/styles/globals.css';
import '@/config/locale';

import Head from 'next/head';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import type { AppProps } from 'next/app';
export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider
			theme={{
				fontFamily: 'Euclid Circular A',
				primaryColor: 'violet',
				colorScheme: 'dark',
				components: {
					Select: {
						defaultProps: {
							transitionProps: { transition: 'pop', duration: 200, timingFunction: 'ease' }
						}
					}
				}
			}}
		>
			<Head>
				<title>Music Lab</title>
				<meta
					name='description'
					content='Platform for practicing and learning academic music knowledge and skills.'
				/>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, maximum-scale=1'
				/>
			</Head>
			<Notifications
				autoClose={8000}
				containerWidth={400}
				position='top-right'
				zIndex={10000}
			/>
			<Component {...pageProps} />
		</MantineProvider>
	);
}
