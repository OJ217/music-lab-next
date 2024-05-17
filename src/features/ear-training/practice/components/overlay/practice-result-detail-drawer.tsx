import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { capitalize } from '@/utils/format.util';
import { Accordion, Badge, Card, Center, Drawer, List, Progress, RingProgress, ScrollArea, ThemeIcon } from '@mantine/core';
import { IconCheck, IconSettings, IconX } from '@tabler/icons-react';

import { EarTrainingExerciseType } from '../../types/practice-session.type';
import { resolvePracticeResultColor, resolvePracticeResultMessage } from '../../utils/practice-session.util';

interface IPracticeResultDetailDrawerProps {
	// ** Drawer meta
	sessionEnded: boolean;
	practiceDetailDrawerOpened: boolean;
	closePracticeDetailDrawer: () => void;

	// ** Practice session score
	totalQuestions: number;
	totalCorrectAnswers: number;
	practiceScorePercentage: number;

	// ** Practice session meta
	practiceSessionSettings?: {
		numberOfQuestions: number;
		playingMode: string;
		typeGroup: string;
		fixedRoot: {
			enabled: boolean;
			rootNote: string;
		};
	};
	practiceSessionQuestionGroups: Array<{
		score: number;
		correct: number;
		incorrect: number;
		questionType: string;
	}>;

	// ** Translation
	exerciseType: EarTrainingExerciseType;
}

const PracticeResultDetailDrawer: FC<IPracticeResultDetailDrawerProps> = ({
	sessionEnded,
	practiceDetailDrawerOpened,
	closePracticeDetailDrawer,
	totalQuestions,
	totalCorrectAnswers,
	practiceScorePercentage,
	practiceSessionSettings: practiceSettings,
	practiceSessionQuestionGroups,
	exerciseType
}) => {
	const { t } = useTranslation();
	const practiceResultColor = resolvePracticeResultColor(totalCorrectAnswers, totalQuestions);
	const practiceResultMessage = resolvePracticeResultMessage(totalCorrectAnswers, totalQuestions);

	return (
		<Drawer
			position='left'
			title='Practice Overview'
			opened={practiceDetailDrawerOpened && sessionEnded}
			onClose={closePracticeDetailDrawer}
			closeButtonProps={{ size: 'sm' }}
			classNames={{ title: 'font-semibold text-sm' }}
			scrollAreaComponent={ScrollArea.Autosize}
			withinPortal
		>
			<div className='mt-6 space-y-6'>
				<div className='grid grid-cols-[11fr_9fr] gap-3'>
					<Card radius='md'>
						<div className='flex h-full items-center gap-4 align-baseline'>
							<RingProgress
								size={80}
								roundCaps
								thickness={4}
								label={
									<Center>
										<ThemeIcon
											size='xl'
											radius='xl'
											variant='light'
											color={practiceResultColor}
										>
											<IconCheck />
										</ThemeIcon>
									</Center>
								}
								sections={[
									{
										value: practiceScorePercentage,
										color: practiceResultColor
									}
								]}
							/>
							<div>
								<h1 className='text-3xl font-medium text-white'>{practiceScorePercentage}%</h1>
								<p className='text-gray-400'>
									{totalCorrectAnswers}/{totalQuestions}
								</p>
							</div>
						</div>
					</Card>
					<Card radius='md'>
						<div className='flex h-full flex-col space-y-1 align-baseline'>
							<p className='text-xs text-gray-400'>Message:</p>
							<p className='flex flex-grow items-center justify-center text-sm text-white'>{practiceResultMessage}</p>
						</div>
					</Card>
				</div>

				{practiceSettings && (
					<Accordion variant='separated'>
						<Accordion.Item value={'practice_settings'}>
							<Accordion.Control
								classNames={{ label: 'text-sm' }}
								icon={
									<ThemeIcon
										p={4}
										radius='sm'
										variant='light'
									>
										<IconSettings />
									</ThemeIcon>
								}
							>
								Practice Settings
							</Accordion.Control>
							<Accordion.Panel>
								<List
									className='space-y-2 text-xs'
									listStyleType='initial'
								>
									<List.Item>{practiceSettings.numberOfQuestions} questions</List.Item>
									<List.Item>{capitalize(practiceSettings.playingMode)} playing mode</List.Item>
									<List.Item>
										{capitalize(practiceSettings.typeGroup)} {exerciseType}s
									</List.Item>
									{practiceSettings.fixedRoot.enabled && <List.Item>{practiceSettings.fixedRoot.rootNote} fixed root note</List.Item>}
								</List>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				)}

				<div className='space-y-3'>
					{practiceSessionQuestionGroups.map(({ score, correct, incorrect, questionType }) => {
						const exerciseResultColor = resolvePracticeResultColor(correct, incorrect + correct);

						return (
							<Card
								radius={'md'}
								key={questionType}
								className='space-y-2 p-3'
							>
								<div className='flex items-center justify-between gap-4 text-sm text-white'>
									<p className='font-medium'>{t(`${exerciseType}.${questionType}`)}</p>
									<Badge
										variant='light'
										color={exerciseResultColor}
									>
										{score}%
									</Badge>
								</div>
								<Progress
									value={score}
									color={exerciseResultColor}
									className='w-full'
									size={'sm'}
								/>
								<div className='flex items-center justify-end gap-4 text-xs'>
									<div className='flex items-center gap-2'>
										<div className='rounded-full border border-green-500 bg-green-500 bg-opacity-25'>
											<IconCheck
												size={14}
												stroke={1.2}
											/>
										</div>
										<p>{correct}</p>
									</div>
									<div className='flex items-center gap-2'>
										<IconX
											size={14}
											stroke={1.2}
											className='rounded-full border border-red-500 bg-red-500 bg-opacity-25'
										/>
										<p>{incorrect}</p>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</Drawer>
	);
};

export default PracticeResultDetailDrawer;
