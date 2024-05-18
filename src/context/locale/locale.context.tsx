import { createContext, useContext, useState } from 'react';

import { Locale } from '@/types';

interface LocaleContextType {
	locale: string;
	setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface ILocaleProviderProps {
	children: React.ReactNode;
}

export const LocaleProvider: React.FC<ILocaleProviderProps> = ({ children }) => {
	const [locale, setLocale] = useState<string>(Locale.MONGOLIAN);

	return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error('useLocale must be used within a LocaleProvider');
	}
	return context;
};
