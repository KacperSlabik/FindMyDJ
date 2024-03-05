import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import Statistic from 'antd/es/statistic/Statistic';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function VerifyEmail() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [verificationResult, setVerificationResult] = useState('');
	const [countdown] = useState(5);
	const dispatch = useDispatch();

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				dispatch(showLoading());
				const response = await axiosInstance.get(
					`/api/user/verify-email/${token}`
				);
				setVerificationResult(
					'✅ ' + response.data.message + ' Przekierowuję do strony logowania.'
				);
				toast.success(response.data.message);
				setTimeout(() => {
					navigate('/login');
					toast.success('Teraz zaloguj się!');
				}, 5000); 
				dispatch(hideLoading());
			} catch (error) {
				dispatch(hideLoading());
				setVerificationResult(
					'❌ Błąd weryfikacji e-maila. Przekierowuję do strony logowania...'
				);
				toast.error(
					'Link aktywacyjny wyagsł! Spróbuj zarejestrować się ponownie.'
				);
				setTimeout(() => {
					navigate('/login');
				}, 5000);
			}
		};

		verifyEmail();
	}, [token, navigate]);

	return (
		<div className='authentication'>
			<div className='authentication-form card p-2 text-center gap-4'>
				<h1 className='card-title'>Status weryfikacji</h1>
				<p>{verificationResult}</p>
				<Spin
					indicator={
						<LoadingOutlined
							style={{
								color: 'gray',
								fontSize: 48,
							}}
							spin
						/>
					}
				/>
				<Statistic.Countdown value={Date.now() + countdown * 1000} format='s' />

				<p>Proszę czekać...</p>
			</div>
		</div>
	);
}

export default VerifyEmail;
