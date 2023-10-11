import { Head, Html, Main, NextScript } from 'next/document';

import { ColorSchemeScript } from '@mantine/core';

export default function Document() {
	return (
		<Html lang='en'>
			<Head>
				<link
					rel='manifest'
					href='/manifest.json'
				/>
				<link
					rel='apple-touch-icon'
					href='/icon.png'
				/>
				<meta
					name='theme-color'
					content='#fff'
				/>
				<ColorSchemeScript defaultColorScheme='dark' />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
