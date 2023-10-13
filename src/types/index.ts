export interface SelectItem<T = string> {
	label: string;
	value: T;
}

export type SelectData<T = string> = SelectItem<T>[];
