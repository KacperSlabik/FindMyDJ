import React from 'react';
import { Button } from 'antd';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const login = useGoogleLogin({
		onSuccess: async (codeResponse) => {
			console.log('Google Login Success:', codeResponse);

			try {
				const userInfoResponse = await axiosInstance.get(
					`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${codeResponse.access_token}`,
					{
						headers: {
							Authorization: `Bearer ${codeResponse.access_token}`,
							Accept: 'application/json',
						},
					}
				);

				const userInfo = userInfoResponse.data;
				sendUserDataToServer(userInfo);
			} catch (error) {}
		},
		onError: (error) => console.log('Błąd logowania z Google:', error),
	});

	const sendUserDataToServer = async (user) => {
		try {
			dispatch(showLoading());
			toast.loading('Logowanie...');
			const response = await axiosInstance.post('/api/user/auth/login', user);

			if (response.data.success) {
				dispatch(hideLoading());
				toast.dismiss();
				toast.success(response.data.message);
				localStorage.setItem('token', response.data.data);
				navigate('/app');
			} else {
				dispatch(hideLoading());
				if (
					response.data.message ===
					'Użytkownik nie istnieje. Aby zalogować się najpierw zarejestruj się.'
				) {
					toast.error(response.data.message);

					navigate('/register', {
						state: {
							name: user.given_name,
							lastName: user.family_name,
							email: user.email,
						},
					});
				} else {
					toast.dismiss();
					toast.error(response.data.message);
				}
			}
		} catch (error) {
			console.error('Błąd podczas wysyłania danych do serwera:', error);
		}
	};

	return (
		<Button
			type='button'
			className='google-button d-flex justify-content-center align-items-center full-width-button shadow-sm'
			onClick={() => login()}
		>
			<FcGoogle className='google-icon' />
			Zaloguj się z Google
		</Button>
	);
};

export default Login;
