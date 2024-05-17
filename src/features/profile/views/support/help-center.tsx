import EarTrainingLayout from '@/features/ear-training/practice/layouts/ear-training-layout';
import { Accordion } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

const HelpCenterView = () => {
	return (
		<EarTrainingLayout
			centered={false}
			showAffix={false}
		>
			<div className='mx-auto w-full max-w-md space-y-6'>
				<h3 className='text-xl font-semibold'>Help center</h3>
				<Accordion
					variant='separated'
					defaultValue={'question_1'}
					classNames={{ content: 'pt-0', chevron: 'w-6 h-6', root: 'space-y-3' }}
					chevron={<IconChevronDown className='stroke-white' />}
				>
					{[
						{
							question: 'What is streak',
							explanation:
								'A streak in our app represents the number of consecutive days you have completed a lesson or practiced a skill. It’s a fun way to stay motivated and keep track of your daily progress!'
						},
						{
							question: 'What is daily goal?',
							explanation:
								'The daily goal is a personalized target set to help you practice ear training consistently. Completing your daily goal ensures steady progress and helps you build a strong habit of regular practice.'
						},
						{
							question: 'What is XP?',
							explanation:
								'XP, or Experience Points, are earned through completing exercises and achieving milestones within the app. Accumulating XP helps track your progress and motivates you to keep improving your ear training skills.'
						},
						{
							question: 'What is monthly summary?',
							explanation:
								'The monthly summary provides an overview of your ear training activities and progress over the past month. It includes statistics on exercises completed, XP earned, and improvements made, giving you insight into your overall development.'
						},
						{
							question: 'What is activity in dashboard?',
							explanation:
								'The activity section in the dashboard displays your recent ear training sessions, including exercises completed and XP earned. It helps you track your daily and weekly engagement with the app.'
						},
						{
							question: 'What is progress in dashboard?',
							explanation:
								'The progress section in the dashboard shows your overall improvement and milestones achieved. It includes visual indicators such as charts or graphs to illustrate your growth in ear training over time.'
						},
						{
							question: 'What are common errors?',
							explanation:
								'Common errors refer to frequent mistakes users make during ear training exercises. This section highlights these errors and provides tips or resources to help you correct them and improve your skills.'
						},
						{
							question: 'What is library?',
							explanation:
								'The library is a collection of all the ear training exercises, lessons, and resources available in the app. It allows you to browse and select specific exercises to practice based on your skill level and learning goals.'
						}
					].map(({ question, explanation }, index) => (
						<Accordion.Item
							key={index}
							value={`question_${index + 1}`}
							className='rounded-lg border border-transparent bg-transparent bg-gradient-to-tr from-violet-600/25 to-violet-600/50 transition-all duration-300 ease-in-out data-[active=true]:border-violet-600 data-[active=true]:from-violet-600/20 data-[active=true]:to-violet-600/40'
						>
							<Accordion.Control>
								<h3 className='font-semibold text-white'>{question}</h3>
							</Accordion.Control>
							<Accordion.Panel>
								<p className='text-sm leading-relaxed'>{explanation}</p>
							</Accordion.Panel>
						</Accordion.Item>
					))}
				</Accordion>
			</div>
		</EarTrainingLayout>
	);
};

export default HelpCenterView;
