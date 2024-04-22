/**
 * Gets the last element of array
 */
export const last = <T>(array: Array<T>): T | undefined => {
	return array.length > 0 ? array[array.length - 1] : undefined;
};

/**
 * Gets an array containing last n elements of the original array
 * @param arr Original array
 * @param n Number less than the array length
 */
export const lastNItems = <T>(arr: Array<T>, n: number): Array<T> => {
	return arr.slice(-1 * n);
};

export const isEmptyObject = <T extends {}>(object: T) => {
	return Object.keys(object).length === 0 && object.constructor === Object;
};

/**
 * Selects a random number from the given range
 * @param min Minimum number for the range
 * @param max Maximum number for the range
 */
export const randomNumberFromRange = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Selects random item from array
 */
export const randomItem = <T>(arr: Array<T>): T => {
	return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Selects random value from enum
 */
export const randomEnumValue = <T extends {}>(anEnum: T): T[keyof T] => {
	const enumValues = Object.values(anEnum);
	const randomIndex = Math.floor(Math.random() * enumValues.length);
	return enumValues[randomIndex] as T[keyof T];
};

/**
 * Performs random selection from an array of items with weighted probabilities.
 */
export const randomWeightedSelection = (selectionArray: Array<{ value: string; weight: number }>): string => {
	const weightSum = selectionArray.map(item => item.weight).reduce((prevWeight, currentSum) => prevWeight + currentSum, 0);
	const random = Math.random() * weightSum;

	let cursor = 0;
	for (let i = 0; i < selectionArray.length; i++) {
		cursor += selectionArray[i].weight;
		if (cursor >= random) {
			return selectionArray[i].value;
		}
	}

	const selectionValues = selectionArray.map(item => item.value);
	return randomItem(selectionValues);
};

/**
 * Filters object keys based on given array
 * @param obj Object to filter
 * @param keys Array of keys
 * @returns
 */
export const filterObjectByKeys = <T>(obj: Record<string, T>, keys: string[]): Record<string, T> => {
	const filteredKeys = Object.keys(obj).filter(key => keys.includes(key));
	return Object.fromEntries(filteredKeys.map(key => [key, obj[key]]));
};
