// ** Common
export enum EarTrainingType {
	IntervalIdentification = 'interval-identification',
	ChordIdentification = 'chord-identification',
	ModeIdentification = 'mode-identification'
}

export enum FeedbackType {
	BUG = 'bug',
	FEATURE_REQUEST = 'feature_request',
	GENERAL = 'general'
}

export enum InstitutionType {
	UNIVERSITY = 'university',
	COLLEGE = 'college',
	HIGH_SCHOOL = 'high_school',
	OTHER = 'other'
}

export interface UserAuth {
	accessToken: string;
	refreshToken: string;
	user: {
		_id: string;
		email: string;
		username: string;
		picture: string | undefined;
		createdAt: Date;
	};
}

export interface UserMetaData {
	profile: {
		firstName?: string;
		lastName?: string;
		institution?: {
			name: string;
			type: InstitutionType;
		};
		picture?: string;
		createdAt: string;
	};
	earTrainingProfile: {
		xp: number;
		currentStreak: {
			count: number;
			startDate: string;
			lastLogDate: string;
		};
		goals: {
			exerciseType: EarTrainingType;
			target: number;
		}[];
		stats: {
			totalSessions: number;
			totalDuration: number;
		};
		bestStreak?: {
			count: number;
			startDate: string;
			endDate: string;
		};
	};
}

// ** API Response
export interface IResponse<DataType> {
	success: boolean;
	data: DataType;
}

export type IApiResponse<DataType> = {
	success: true;
	data: DataType;
} & {
	success: false;
	error: {
		code: number;
		isReadable: boolean;
		message: string;
	};
};

export interface IPaginatedDocuments<DocumentType> {
	docs: Array<DocumentType>;
	totalDocs: number;
	offset: number;
	limit: number;
	totalPages: number;
	page: number;
	pagingCounter: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	prevPage: number | null;
	nextPage: number | null;
}

// ** API Service (Query and Mutation)
export interface IUseQueryBase {
	enabled?: boolean;
}

export interface SelectItem<T = string> {
	label: string;
	value: T;
}

export type SelectData<T = string> = SelectItem<T>[];

// ** Locale
export enum Locale {
	MONGOLIAN = 'mn',
	ENGLISH = 'en'
}
