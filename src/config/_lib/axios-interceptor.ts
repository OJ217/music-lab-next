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
		let errorNotification: { title?: string; message?: string } = {};
		const errorObj = error?.response?.data?.error;

		if (errorObj?.isReadableMessage) {
			errorNotification = {
				title: errorObj?.title,
				message: errorObj?.message
			};
		} else if (error?.response?.status === 401) {
			errorNotification.title = 'Please sign in to continue.';
		}

		notify({
			type: 'fail',
			title: errorNotification.title ?? 'Error occured',
			...(errorNotification.message && { message: errorNotification.message })
		});

		return Promise.reject(error?.response);
	}
);

export const apiClient = axios.create({
	baseURL: API_URL.public,
	withCredentials: true
});
