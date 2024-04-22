import { t } from 'i18next';
import { FC } from 'react';

import { Button, Modal } from '@mantine/core';

interface IPracticeResultModalProps {
	// ** Practice session meta
	sessionEnded: boolean;
	practiceResultModalOpened: boolean;
	savePracticeSessionPending: boolean;

	// ** Practice result data
	practiceScorePercentage: number;
	totalCorrectAnswers: number;
	totalQuestions: number;

	// ** Methods
	closePracticeResultModal: () => void;
	openPracticeDetailDrawer: () => void;
	handleSaveEarTrainingPracticeSession: () => Promise<void>;
	resetSession: (options?: { startSession?: boolean }) => void;
}

const PracticeResultModal: FC<IPracticeResultModalProps> = ({
	sessionEnded,
	practiceResultModalOpened,
	savePracticeSessionPending,

	practiceScorePercentage,
	totalCorrectAnswers,
	totalQuestions,

	closePracticeResultModal,
	openPracticeDetailDrawer,
	handleSaveEarTrainingPracticeSession,
	resetSession
}) => {
	return (
		<Modal
			centered
			withinPortal
			padding={24}
			opened={practiceResultModalOpened && sessionEnded}
			onClose={() => {
				if (sessionEnded && savePracticeSessionPending) {
					return;
				}

				closePracticeResultModal();
			}}
			closeOnEscape={false}
			closeOnClickOutside={false}
			withCloseButton={false}
			classNames={{
				header: 'font-semibold text-sm'
			}}
		>
			<div className='flex flex-col items-center space-y-8 py-4 text-center'>
				<div className='space-y-2'>
					<h3 className='text-3xl font-semibold text-violet-500'>{practiceScorePercentage}%</h3>
					<p className='mx-auto max-w-[240px] text-sm font-medium'>{t('result.practiceResultMessage', { correct: totalCorrectAnswers, incorrect: totalQuestions - totalCorrectAnswers })}</p>
				</div>

				<div className='w-full max-w-[200px] space-y-2'>
					<Button
						p={0}
						h={'auto'}
						w={'auto'}
						color='violet.5'
						size='compact-sm'
						variant='transparent'
						onClick={openPracticeDetailDrawer}
					>
						{t('result.practiceResultDetails')}
					</Button>

					<div className='mx-auto flex w-full items-center gap-4'>
						<Button
							fullWidth
							variant='light'
							disabled={savePracticeSessionPending}
							onClick={async () => {
								await handleSaveEarTrainingPracticeSession();
								closePracticeResultModal();
								resetSession();
							}}
						>
							{t('practice')}
						</Button>
						<Button
							fullWidth
							loading={savePracticeSessionPending}
							onClick={async () => {
								await handleSaveEarTrainingPracticeSession();
								closePracticeResultModal();
								resetSession({ startSession: false });
							}}
						>
							{t('done')}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default PracticeResultModal;
