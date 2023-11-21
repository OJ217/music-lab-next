export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

type GroupByKey<T> = keyof T & string;

export const groupBy = <T, K extends GroupByKey<T>>(arr: T[], field: K): Record<string, T[]> => {
	return arr.reduce((groups: Record<string, T[]>, item: T) => {
		const key = String(item[field]);

		if (!groups[key]) {
			groups[key] = [];
		}

		groups[key].push(item);

		return groups;
	}, {});
};
