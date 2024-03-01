import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

import { IResponse } from '@/types';
import { notify } from '@/utils/notification.util';

import { API_URL } from '../constants/api.constant';

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
		'Accept-Language': 'en',
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

	config.withCredentials = true;

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

		let errorNotification: { title?: string; message?: string } = {};
		const errorObj = error?.response?.data?.error;

		if (errorObj?.isReadableMessage) {
			errorNotification = {
				title: errorObj?.title,
				message: errorObj?.message
			};
		} else if (error?.response?.status === 401) {
			window.localStorage.removeItem('music_lab.auth_store');
			if (window.location.pathname !== '/auth/sign-in') {
				window.location.pathname = '/auth/sign-in';
			}
			notify({ type: 'warning', title: 'Please sign in to continue.' });
			return Promise.reject(error?.response);
		}

		notify({
			type: 'fail',
			title: errorNotification.title ?? 'Error occured',
			...(errorNotification.message && { message: errorNotification.message })
		});

		return Promise.reject(error?.response);
	}
);
