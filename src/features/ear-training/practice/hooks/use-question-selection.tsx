import { useCallback, useMemo } from 'react';

import { filterObjectByKeys, lastNItems, randomNumberFromRange, randomWeightedSelection } from '@/utils/helper.util';

interface UseEarTrainingQuestionSelectionParams {
	errors: Record<string, Array<string>> | undefined;
	questions: Array<{ label: string; value: string }>;
}

export const useEarTrainingQuestionSelection = ({ errors, questions }: UseEarTrainingQuestionSelectionParams) => {
	const { QUESTIONS_SELECTION, LAST_N_THRESHOLD_RANGE } = useMemo(() => {
		// ** Filters only the errors from the selected type group
		const QUESTION_VALUES = questions.map(q => q.value);
		const FILTERED_ERRORS = errors ? filterObjectByKeys(errors, QUESTION_VALUES) : undefined;

		// ** Error weight
		const MAX_ERROR_WEIGHT_DIFF = randomNumberFromRange(3, 5) / 10;
		const ERROR_WEIGHT = FILTERED_ERRORS ? MAX_ERROR_WEIGHT_DIFF / Math.max(...Object.values(FILTERED_ERRORS).map(e => e.length)) : undefined;

		// ** Selection array
		const QUESTIONS_SELECTION = questions.map(({ value: interval }) => {
			let weight = 1;

			if (errors !== undefined && ERROR_WEIGHT !== undefined && interval in errors) {
				weight = weight + ERROR_WEIGHT * errors[interval].length;
			}

			return {
				value: interval,
				weight
			};
		});

		let LAST_N_THRESHOLD_RANGE: [number, number];
		switch (questions.length) {
			case 3:
				LAST_N_THRESHOLD_RANGE = [0, 1];
				break;
			case 4:
				LAST_N_THRESHOLD_RANGE = [0, 1];
				break;
			case 5:
				LAST_N_THRESHOLD_RANGE = [1, 2];
				break;
			case 6:
				LAST_N_THRESHOLD_RANGE = [2, 3];
				break;
			default:
				LAST_N_THRESHOLD_RANGE = [2, 4];
				break;
		}

		return {
			QUESTIONS_SELECTION,
			LAST_N_THRESHOLD_RANGE
		};
	}, [questions, errors]);

	const selectNextQuestion = useCallback(
		/**
		 * Selects next question (interval, chord, mode) based on previous questions and errors
		 */
		(sessionQuestions: Array<string>) => {
			const lastNThreshold = randomNumberFromRange(LAST_N_THRESHOLD_RANGE[0], LAST_N_THRESHOLD_RANGE[1]);
			const lastNQuestions = sessionQuestions.length >= lastNThreshold ? (lastNThreshold !== 0 ? lastNItems(sessionQuestions, lastNThreshold) : []) : sessionQuestions;
			const intervalOptions = QUESTIONS_SELECTION.filter(item => !lastNQuestions.includes(item.value));
			const intervalName = randomWeightedSelection(intervalOptions);

			return intervalName;
		},
		[QUESTIONS_SELECTION, LAST_N_THRESHOLD_RANGE]
	);

	return { selectNextQuestion };
};
