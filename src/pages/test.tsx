import { useEffect, useMemo, useRef, useState } from 'react';

import { lastNItems, randomNumberFromRange, randomWeightedSelection } from '@/utils/helper.util';
import { Button } from '@mantine/core';

const lastNThresholdDictionary = {
	4: [0, 1],
	5: [1, 2],
	6: [2, 3]
};

const Test = () => {
	const errors: Record<string, Array<string>> = useMemo(() => {
		return {
			P4: ['P5', 'P5', 'M2', 'm6', 'P5', 'P5'],
			P5: ['P4', 'P4', 'P4', 'd5', 'P4', 'M2', 'P4', 'P4']
		};
	}, []);

	const errorWeight = useMemo(() => {
		console.log('errorWeight');
		return 0.5 / Math.max(...Object.values(errors).map(e => e.length));
	}, [errors]);

	const intervalRef = useRef<Array<string>>(['m2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8']);
	// const intervalRef = useRef<Array<string>>(['M2', 'M3', 'P4', 'P5', 'M6', 'M7']);

	const lastNThresholdRange: [number, number] = useMemo(() => {
		console.log('lastNThresholdRange');
		if (intervalRef.current.length.toString() in lastNThresholdDictionary) {
			// @ts-ignore
			return lastNThresholdDictionary[intervalRef.current.length];
		} else {
			return [2, 4];
		}
	}, [intervalRef]);

	const intervalSelectionRef = useRef<Array<{ value: string; weight: number }>>(
		intervalRef.current.map(interval => {
			let weight = 1;

			if (interval in errors) {
				weight = weight + errorWeight * errors[interval].length;
			}

			return {
				value: interval,
				weight
			};
		})
	);

	const [questions, setQuestions] = useState<Array<string>>([]);

	useEffect(() => {
		console.log('Questions', questions);
	}, [questions]);

	const playNextInterval = () => {
		const lastNThreshold = randomNumberFromRange(lastNThresholdRange[0], lastNThresholdRange[1]);
		const lastNIntervals = questions.length >= lastNThreshold ? lastNItems(questions, lastNThreshold) : questions;
		const intervalOptions = intervalSelectionRef.current.filter(item => !lastNIntervals.includes(item.value));
		const interval = randomWeightedSelection(intervalOptions);

		setQuestions(q => [...q, interval]);
	};

	return (
		<main className='grid min-h-screen place-content-center'>
			<Button onClick={playNextInterval}>Next Interval</Button>
		</main>
	);
};

export default Test;
