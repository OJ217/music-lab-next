import { createTheme, MantineProvider as DefaultMantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

interface IMantineProviderProps {
	children: React.ReactNode;
}

const theme = createTheme({
	fontFamily: 'Euclid Circular A',
	primaryColor: 'violet',
	components: {
		Button: {
			defaultProps: {
				classNames: {
					root: 'transition-all ease-in-out duration-500'
				}
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
			<ModalsProvider>
				{children}
			</ModalsProvider>
		</DefaultMantineProvider>
	);
};

export default MantineProvider;
