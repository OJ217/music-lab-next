import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

import { deleteEarTrainingErrorLocal } from '@/features/ear-training/practice/stores/ear-training-errors.store';
import { IResponse } from '@/types';

import { API_URL } from '../constants/api.constant';
import { AUTH_HEADER_KEYS, AUTH_STORE_KEY } from '../constants/auth.constant';
import { queryClient } from './react-query-provider';

declare module 'axios' {
	interface AxiosRequestConfig {
		isPrivate?: boolean;
		removeEmptyValues?: boolean;
	}
}

axios.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
	// @ts-ignore
	config.headers = {
		'Content-Type': 'application/json',
		'Accept-Language': 'mn',
		...(config.headers as RawAxiosRequestHeaders)
	};

	if (config.isPrivate) {
		const authStore = JSON.parse(window.localStorage.getItem(AUTH_STORE_KEY)!);
		const accessToken = authStore?.accessToken;
		const refreshToken = authStore?.refreshToken;

		if (accessToken) {
			config.headers[AUTH_HEADER_KEYS.ACCESS_TOKEN] = accessToken;
		}

		if (refreshToken) {
			config.headers[AUTH_HEADER_KEYS.REFRESH_TOKEN] = refreshToken;
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
			void deleteEarTrainingErrorLocal();
			window.localStorage.removeItem(AUTH_STORE_KEY);
			if (window.location.pathname !== '/auth/sign-in') {
				window.location.pathname = '/auth/sign-in';
			}
			return Promise.reject(error?.response);
		}

		return Promise.reject(error?.response);
	}
);
