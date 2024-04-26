import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/**
 * Capitalized given string
 */
export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Rounds given number to specific decimial place
 */
export const roundNumber = (num: number, decimalPlaces = 1): number => {
	const multiplier = Math.pow(10, decimalPlaces);
	return Math.round(num * multiplier) / multiplier;
};

/**
 * Calculates percentage based on given part and total values
 * @param part Part of the total value
 * @param total Total value
 * @returns
 */
export const calculatePercentage = (part: number, total: number): number => {
	if (total === 0) {
		return 0;
	}

	return roundNumber((part / total) * 100);
};
