interface IDashboardStatisticCardProps {
	label: string;
	value: string | number | null | undefined;
	icon: React.ReactNode;
}

const DashboardStatisticCard: React.FC<IDashboardStatisticCardProps> = ({ label, value, icon }) => {
	return (
		<div className='space-y-2 rounded-lg bg-gradient-to-tr from-violet-600/25 to-violet-600/50 px-4 py-3 md:px-5 md:py-4'>
			<div className='flex items-center justify-between gap-2'>
				<h3 className='text-xl font-bold'>{value}</h3>
				{icon}
			</div>
			<span className='text-sm font-medium text-violet-100'>{label}</span>
		</div>
	);
};

export default DashboardStatisticCard;
