import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				'euclid-circular-a': [
					'Euclid Circular A',
					'Inter',
					'system-ui',
					'Avenir',
					'Helvetica',
					'Arial',
					'sans-serif'
				],
				inherit: 'inherit'
			}
		}
	},
	darkMode: 'class',
	plugins: [require('tailwind-scrollbar')]
};
export default config;
