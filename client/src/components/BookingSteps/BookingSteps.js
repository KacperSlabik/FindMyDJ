import React from 'react';
import { Steps } from 'antd';

function BookingSteps({ currentStep }) {
	const steps = [
		{
			title: 'Sprawdź termin',
		},
		{
			title: 'Podaj szczegóły',
		},
		{
			title: 'Złóż rezerwację',
		},
	];

	return (
		<div>
			<Steps size='small' current={currentStep - 1} items={steps} />
		</div>
	);
}

export default BookingSteps;
