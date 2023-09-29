import NavigationAffix from '../components/overlay/NavigationAffix';

interface IEarTrainingLayoutProps {
	children: React.ReactNode;
}

const EarTrainingLayout: React.FC<IEarTrainingLayoutProps> = ({ children }) => {
	return (
		<>
			<main className='grid min-h-screen place-content-center p-6 text-white md:p-12'>{children}</main>
			<NavigationAffix />
		</>
	);
};

export default EarTrainingLayout;
