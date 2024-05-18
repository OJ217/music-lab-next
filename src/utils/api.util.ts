/**
 * Waits for specified duration to simulate API throttling
 * @param ms Duration to wait in ms
 */
export const wait = (ms: number): Promise<void> => {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
};
