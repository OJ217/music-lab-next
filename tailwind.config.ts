import type { Config } from 'tailwindcss';

const config: Config = {
	content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				gip: ['GIP', 'Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
				'euclid-circular-a': ['Euclid Circular A', 'Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
				inherit: 'inherit'
			},
			animation: {
				'fade-in': 'fade-in 0.3s ease-in-out'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				}
			}
		}
	},
	darkMode: 'class',
	plugins: [require('tailwind-scrollbar')]
};
export default config;
