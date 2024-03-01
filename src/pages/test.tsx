const Test = () => {
	return (
		<div className='grid min-h-screen place-content-center'>
			<div className='rounded-lg border border-violet-600/10 bg-transparent bg-gradient-to-tr from-violet-600/5 to-violet-600/20 p-5 backdrop-blur-3xl'>
				<input
					type='text'
					className=' rounded-lg border border-violet-800 bg-violet-800/50 px-4 py-2 outline-none transition-all duration-300 ease-in-out focus:border-violet-600'
				/>
			</div>
		</div>
	);
};

export default Test;
