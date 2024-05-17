export enum InstitutionType {
	UNIVERSITY = 'university',
	COLLEGE = 'college',
	HIGH_SCHOOL = 'high_school',
	OTHER = 'other'
}

export interface AuthResponse {
	auth: {
		accessToken: string;
		refreshToken: string;
		user: {
			_id: string;
			email: string;
			username: string;
			picture: string | undefined;
			createdAt: Date;
		};
	};
	meta: {
		profile: {
			firstName?: string;
			lastName?: string;
			institution?: {
				name: string;
				type: InstitutionType;
			};
			picture?: string;
			createdAt: Date;
		};
		earTrainingProfile: {
			xp: number;
			currentStreak: {
				count: number;
				startDate: Date;
				lastLogDate: Date;
			};
			goals: {
				exerciseType: EarTrainingPracticeType;
				target: number;
			}[];
			stats: {
				totalSessions: number;
				totalDuration: number;
			};
			bestStreak?: {
				count: number;
				startDate: Date;
				endDate: Date;
			};
		};
	};
}

import axios from 'axios';

import { EarTrainingPracticeType } from '@/features/ear-training/practice/services/practice-session.service';
import { IResponse } from '@/types';
import { CodeResponse } from '@react-oauth/google';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSignInMutation = () => {
	const signIn = async (signInCredentials: { email: string; password: string }) => {
		return (await axios.post<IResponse<AuthResponse>>('/auth/sign-in', signInCredentials)).data?.data;
	};

	const client = useQueryClient();

	const {
		isPending: signInPending,
		isSuccess: signInSuccess,
		isError: signInError,
		mutateAsync: mutateSignIn
	} = useMutation({
		mutationFn: signIn,
		onSuccess: () => {
			client.removeQueries();
		}
	});

	return {
		signInPending,
		signInSuccess,
		signInError,
		mutateSignIn
	};
};

export const useSignUpMutation = () => {
	const signUp = async (signUpCredentials: { username: string; email: string; password: string; passwordConfirmation: string }) => {
		return (await axios.post<IResponse<AuthResponse>>('/auth/sign-up', signUpCredentials)).data?.data;
	};

	const client = useQueryClient();

	const {
		isPending: signUpPending,
		isSuccess: signUpSuccess,
		isError: signUpError,
		mutateAsync: mutateSignUp
	} = useMutation({
		mutationFn: signUp,
		onSuccess: () => {
			client.removeQueries();
		}
	});

	return {
		signUpPending,
		signUpSuccess,
		signUpError,
		mutateSignUp
	};
};

export const useGoogleOAuthMutation = () => {
	const handleGoogleOAuth = async (googleOAuthCredentials: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => {
		return (await axios.post<IResponse<AuthResponse>>('/auth/google', googleOAuthCredentials)).data?.data;
	};

	const client = useQueryClient();

	const {
		isPending: googleOAuthPending,
		isSuccess: googleOAuthSuccess,
		isError: googleOAuthError,
		mutateAsync: mutateGoogleOAuth
	} = useMutation({
		mutationFn: handleGoogleOAuth,
		onSuccess: () => {
			client.removeQueries();
		}
	});

	return {
		googleOAuthPending,
		googleOAuthSuccess,
		googleOAuthError,
		mutateGoogleOAuth
	};
};
