export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const roundNumber = (num: number, decimalPlaces = 1): number => {
	const multiplier = Math.pow(10, decimalPlaces);
	return Math.round(num * multiplier) / multiplier;
};

export const calculatePercentage = (part: number, total: number): number => {
	if (total === 0) {
		return 0;
	}

	return roundNumber((part / total) * 100);
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
