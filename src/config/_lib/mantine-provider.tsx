import { createTheme, MantineProvider as DefaultMantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

interface IMantineProviderProps {
	children: React.ReactNode;
}

const theme = createTheme({
	colors: {
		violet: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C3B5FD', '#A78BFA', '#8A5CF6', '#7C3AED', '#6C28D9', '#5B21B6', '#4D1D95']
	},
	fontFamily: 'GIP',
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
		NumberInput: {
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
		Select: {
			defaultProps: {
				classNames: {
					input: 'focus-within:bg-violet-600/25',
					section: 'hidden'
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
		},
		ScrollArea: {
			defaultProps: {
				scrollbarSize: 4
			}
		},
		Drawer: {
			classNames: {
				content: 'pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)]'
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
				autoClose={100000}
				zIndex={10000}
				classNames={{
					root: 'top-[calc(1rem_+_env(safe-area-inset-top))]'
				}}
			/>
			<ModalsProvider>{children}</ModalsProvider>
		</DefaultMantineProvider>
	);
};

export default MantineProvider;
