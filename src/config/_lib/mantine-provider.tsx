import { createTheme, MantineProvider as DefaultMantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

interface IMantineProviderProps {
	children: React.ReactNode;
}

const theme = createTheme({
	colors: {
		violet: [
			'#F5F3FF',
			'#EDE9FE',
			'#DDD6FE',
			'#C3B5FD',
			'#A78BFA',
			'#8A5CF6',
			'#7C3AED',
			'#6C28D9',
			'#5B21B6',
			'#4D1D95'
		]
	},
	fontFamily: 'Euclid Circular A',
	primaryColor: 'violet',
	components: {
		Button: {
			defaultProps: {
				classNames: {
					root: 'transition-all ease-in-out duration-500'
				},
				color: 'violet.6'
			}
		},
		TextInput: {
			defaultProps: {
				classNames: {
					input: 'focus:bg-violet-600/25 transition-all ease-in-out duration-500'
				}
			}
		},
		PasswordInput: {
			defaultProps: {
				classNames: {
					innerInput: 'focus:bg-violet-600/25 transition-all ease-in-out duration-500'
				}
			}
		},
		Combobox: {
			defaultProps: {
				transitionProps: { transition: 'pop', duration: 200, timingFunction: 'ease' }
			}
		},
		Menu: {
			defaultProps: {
				transitionProps: { transition: 'pop', duration: 200, timingFunction: 'ease' }
			}
		},
		Progress: {
			defaultProps: {
				color: 'violet.6'
			}
		}
	}
});

const MantineProvider: React.FC<IMantineProviderProps> = ({ children }) => {
	return (
		<DefaultMantineProvider
			defaultColorScheme='dark'
			theme={theme}
		>
			<Notifications
				position='top-center'
				containerWidth={400}
				autoClose={8000}
				zIndex={10000}
			/>
			<ModalsProvider>{children}</ModalsProvider>
		</DefaultMantineProvider>
	);
};

export default MantineProvider;
