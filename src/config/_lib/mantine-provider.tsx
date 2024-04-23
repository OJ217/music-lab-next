import { createTheme, MantineProvider as DefaultMantineProvider, MultiSelect, Overlay, TextInput } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

interface IMantineProviderProps {
	children: React.ReactNode;
}

const theme = createTheme({
	colors: {
		violet: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C3B5FD', '#A78BFA', '#8A5CF6', '#7C3AED', '#6C28D9', '#5B21B6', '#4D1D95'],
		dark: ['#c9c9c9', '#b8b8b8', '#828282', '#696969', '#424242', '#3b3b3b', '#2e2e2e', '#1f1f1f', '#141414', '#101010']
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
		TextInput: TextInput.extend({
			defaultProps: {
				classNames: {
					input: 'focus:bg-violet-600/25 focus:border-violet-600 transition-all ease-in-out duration-500'
				}
			}
		}),
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
		MultiSelect: {
			defaultProps: {
				classNames: {
					input: 'focus-within:bg-violet-600/25 transition-all ease-in-out duration-500'
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
		},
		Overlay: Overlay.extend({
			defaultProps: {
				color: '#030712',
				backgroundOpacity: 0.65,
				blur: 1
			}
		})
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
					root: 'top-[calc(2rem_+_env(safe-area-inset-top))]'
				}}
			/>
			<ModalsProvider>{children}</ModalsProvider>
		</DefaultMantineProvider>
	);
};

export default MantineProvider;
