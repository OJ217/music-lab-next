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

export interface SelectItem<T = string> {
	label: string;
	value: T;
}

export type SelectData<T = string> = SelectItem<T>[];
