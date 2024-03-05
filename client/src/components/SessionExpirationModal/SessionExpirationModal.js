import React, { useState, useEffect } from 'react';
import { Modal, Button, Statistic } from 'antd';

const SessionExpirationModal = ({
	visible,
	onExtendSession,
	onLogout,
	expiresAt,
}) => {
	const [countdown, setCountdown] = useState(expiresAt);

	useEffect(() => {
		setCountdown(expiresAt);
	}, [expiresAt]);

	useEffect(() => {
		let timer;
		if (visible) {
			timer = setInterval(() => {
				setCountdown((prevCountdown) => prevCountdown - 1);
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [visible]);

	useEffect(() => {
		if (countdown === 0) {
			onLogout();
		}
	}, [countdown, onLogout]);

	return (
		<Modal
			title='Twoja sesja wkrótce wygaśnie!'
			visible={visible}
			footer={[
				<Button type='primary' key='extend' onClick={onExtendSession}>
					Przedłuz sesję
				</Button>,
				<Button type='primary' key='logout' onClick={onLogout} danger>
					Wyloguj się
				</Button>,
			]}
		>
			<p className='text-align-center'>Podejmij decyzję w ciągu:</p>
			<Statistic.Countdown
				value={Math.floor(Date.now() + countdown * 1000)}
				format='mm:ss'
			/>
		</Modal>
	);
};

export default SessionExpirationModal;
