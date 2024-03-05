import { Button, Form, Input } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';

function ResetPassword() {
	const [email, setEmail] = useState('');
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const onFinish = async () => {
		try {
			dispatch(showLoading());

			const response = await axiosInstance.post('/api/user/reset-password', {
				email,
			});

			dispatch(hideLoading());

			if (response.data.success) {
				toast.success(response.data.message);
				navigate(`/reset-password`);
			} else {
				toast.error(response.data.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error('Użytkownik o podanym adresie email nie istnieje!');
		}
	};

	return (
		<div className='authentication'>
			<div className='authentication-form card p-2'>
				<h1 className='card-title'>Zapomiałeś hasła? 😂</h1>
				<Form layout='vertical' onFinish={onFinish}>
					<Form.Item
						label='Email'
						name='email'
						rules={[
							{ required: true, message: 'Proszę podać adres email' },
							{ type: 'email', message: 'Proszę podać poprawny adres e-mail.' },
						]}
					>
						<Input
							placeholder='Email'
							onChange={(e) => setEmail(e.target.value)}
						/>
					</Form.Item>
					<Button
						className='primary-button my-2 full-width-button'
						htmlType='submit'
					>
						Zresetuj hasło
					</Button>
					<Link to='/login' className='anchor d-block text-center mt-2'>
						Powrót do logowania
					</Link>
				</Form>
			</div>
		</div>
	);
}

export default ResetPassword;
