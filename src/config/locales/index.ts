import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import mn from './mn';

type Locale = 'mn' | 'en';
export const DEFAULT_LOCALE: Locale = 'en';
export const RESOURCES = { mn, en } as const;
export const NAMESPACES = ['ear_training'] as const;
export const DEFAULT_NS = 'ear_training';

i18next.use(initReactI18next).init({
	lng: DEFAULT_LOCALE,
	fallbackLng: DEFAULT_LOCALE,
	interpolation: { escapeValue: false },
	ns: NAMESPACES,
	defaultNS: DEFAULT_NS,
	resources: RESOURCES,
	returnNull: false
});

export default i18next;
