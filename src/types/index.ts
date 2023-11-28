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
