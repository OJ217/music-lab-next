import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';
import '@/config/locale';

import Head from 'next/head';

import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import type { AppProps } from 'next/app';

const theme = createTheme({
	fontFamily: 'Euclid Circular A',
	primaryColor: 'violet',
	components: {
		Combobox: {
			defaultProps: {
				transitionProps: { transition: 'pop', duration: 200, timingFunction: 'ease' }
			}
		}
	}
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider
			defaultColorScheme='dark'
			theme={theme}
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
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='black-translucent'
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
