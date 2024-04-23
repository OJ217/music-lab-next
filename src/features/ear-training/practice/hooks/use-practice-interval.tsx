import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Note } from 'tonal';

import { INTERVAL_TYPE_GROUPS, IntervalPracticeSettings } from '../types/practice-session-settings.type';
import { EarTrainingPracticeQuestionBase, Notes, useEarTrainingPracticeSession } from './use-practice-session';

interface IntervalQuestion extends EarTrainingPracticeQuestionBase {
	intervalName: string;
}

interface UsePracticeIntervalParams {
	practiceSessionSettings: IntervalPracticeSettings;
}

export const usePracticeInterval = ({ practiceSessionSettings }: UsePracticeIntervalParams) => {
	const { t } = useTranslation();

	const intervalPracticeSettingsMeta = useMemo(() => {
		const INTERVALS = INTERVAL_TYPE_GROUPS[practiceSessionSettings.typeGroup].map(intervalName => ({
			label: t(`interval.${intervalName}`),
			value: intervalName
		}));
		const TOTAL_QUESTIONS = practiceSessionSettings.numberOfQuestions;
		const ROOT_NOTE = practiceSessionSettings.fixedRoot.enabled ? practiceSessionSettings.fixedRoot.rootNote : null;
		return {
			INTERVALS,
			TOTAL_QUESTIONS,
			ROOT_NOTE
		};
	}, [practiceSessionSettings, t]);

	const playRandomInterval = () => {
		const rootNote = intervalPracticeSettingsMeta.ROOT_NOTE ?? Note.fromMidi(Math.floor(Math.random() * 25) + 48);
		const intervalName = intervalPracticeSettingsMeta.INTERVALS[Math.floor(Math.random() * intervalPracticeSettingsMeta.INTERVALS.length)].value;
		const upperNote = Note.transpose(rootNote, intervalName);
		const intervalNotesBase = [rootNote, upperNote];

		let intervalNotes: Notes;

		switch (practiceSessionSettings.playingMode) {
			case 'harmonic':
				intervalNotes = [intervalNotesBase];
				break;
			case 'ascending':
				intervalNotes = intervalNotesBase;
				break;
			case 'descending':
				intervalNotes = intervalNotesBase.reverse();
				break;
			default:
				intervalNotes = [intervalNotesBase];
				break;
		}

		intervalPracticeSession.practiceSessionMethods.stop();
		intervalPracticeSession.practiceSessionMethods.play(intervalNotes);

		intervalPracticeSession.setPracticeSessionQuestions(prevQuestions => [...prevQuestions, { intervalName, notes: intervalNotes, answered: false }]);
	};

	const intervalPracticeSession = useEarTrainingPracticeSession<IntervalQuestion>({
		practiceSessionSettings,
		playRandom: playRandomInterval
	});

	return {
		...intervalPracticeSession,
		intervalPracticeSettingsMeta
	};
};
