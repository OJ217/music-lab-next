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
				'fade-in': 'fade-in 0.3s ease-in-out',
				'light-pulse': 'light-pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'light-pulse': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': { opacity: '0.75' }
				}
			},
			screens: {
				xs: '400px'
			},
			boxShadow: {
				'round-sm': '2px 2px 72px 4px rgba(0, 0, 0, 0.3)',
				'round-md': '2px 4px 72px 8px rgba(0, 0, 0, 0.3)',
				'round-lg': '2px 6px 96px 12px rgba(0, 0, 0, 0.3)',
				'round-xl': '2px 6px 96px 16px rgba(0, 0, 0, 0.3)',
				'round-2xl': '2px 16px 96px 32px rgba(0, 0, 0, 0.3)'
			}
		}
	},
	darkMode: 'class',
	plugins: [require('tailwind-scrollbar')]
};
export default config;
