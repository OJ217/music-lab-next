import { QueryClient, QueryClientProvider as DefaultQueryClientProvider } from '@tanstack/react-query';

interface IQueryClientProviderProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			networkMode: 'always',
			retry: false
		}
	}
});

const QueryClientProvider: React.FC<IQueryClientProviderProps> = ({ children }) => {
	return <DefaultQueryClientProvider client={queryClient}>{children}</DefaultQueryClientProvider>;
};

export default QueryClientProvider;
