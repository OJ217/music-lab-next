import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				'euclid-circular-a': ['Euclid Circular A', 'sans-serif'],
				inherit: 'inherit'
			}
		}
	},
	plugins: []
};
export default config;
