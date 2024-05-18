import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';
import '@/config/locales';
import '@/config/_lib/axios-interceptor';

import Head from 'next/head';

import MantineProvider from '@/config/_lib/mantine-provider';
import QueryClientProvider from '@/config/_lib/react-query-provider';
import { AuthProvider } from '@/context/auth/auth.context';

import type { AppProps } from 'next/app';
export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider>
			<QueryClientProvider>
				<AuthProvider>
					<Head>
						<title>Music Lab</title>
						<meta
							name='description'
							content='Platform for practicing and learning academic music knowledge and skills.'
						/>
						<meta
							name='viewport'
							content='width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, width=device-width'
						/>
						<meta
							name='apple-mobile-web-app-capable'
							content='yes'
						/>
						<meta
							name='apple-mobile-web-app-status-bar-style'
							content='black-translucent'
						/>
					</Head>
					<Component {...pageProps} />
				</AuthProvider>
			</QueryClientProvider>
		</MantineProvider>
	);
}
