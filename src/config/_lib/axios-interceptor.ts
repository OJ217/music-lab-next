import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

import { IResponse } from '@/types';

import { API_URL } from '../constants/api.constant';
import { queryClient } from './react-query-provider';

declare module 'axios' {
	interface AxiosRequestConfig {
		isPrivate?: boolean;
		removeEmptyValues?: boolean;
	}
}

// TODO: Refactor interceptors to comply with current auth method (header, cookie)
axios.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
	// @ts-ignore
	config.headers = {
		'Content-Type': 'application/json',
		'Accept-Language': 'mn',
		...(config.headers as RawAxiosRequestHeaders)
	};

	if (config.isPrivate) {
		const authStore = JSON.parse(window.localStorage.getItem('music_lab.auth_store')!);
		const accessToken = authStore?.accessToken;
		const refreshToken = authStore?.refreshToken;

		if (accessToken) {
			config.headers['Music-Lab-X-Access-Token'] = accessToken;
		}

		if (refreshToken) {
			config.headers['Music-Lab-X-Refresh-Token'] = refreshToken;
		}
	}

	if (config.url && !config.url.startsWith('http')) {
		config.url = config.isPrivate ? `${API_URL.private}${config.url}` : `${API_URL.public}${config.url}`;
	}

	return config;
});

axios.interceptors.response.use(
	(res: AxiosResponse<IResponse<any>>) => {
		return res;
	},
	(error: AxiosError<any>) => {
		console.error(error);

		if (error?.response?.status === 401) {
			queryClient.cancelQueries();
			queryClient.removeQueries();
			window.localStorage.removeItem('music_lab.auth_store');
			if (window.location.pathname !== '/auth/sign-in') {
				window.location.pathname = '/auth/sign-in';
			}
			return Promise.reject(error?.response);
		}

		return Promise.reject(error?.response);
	}
);
