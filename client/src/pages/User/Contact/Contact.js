import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../../components/Layout/Layout';
import { Button, Form, Input, Select, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axiosInstance from '../../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import '../Contact/contactStyles.css';
import StatusIndicator from '../../../components/StatusIndicator/StatusIndicator';

const Contact = () => {
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [isOnline, setIsOnline] = useState(false);
	const [lastActiveSession, setLastActiveSession] = useState(null);
	const [topic, setTopic] = useState('');
	useEffect(() => {
		const fetchAdminUser = async () => {
			try {
				dispatch(showLoading());

				const token = localStorage.getItem('token');

				const response = await axiosInstance.get('/api/user/admin', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				dispatch(hideLoading());

				if (response.data.success) {
					const adminUser = response.data.data;

					const lastActiveSession =
						adminUser?.activeSessions?.[0]?.lastModified;
					const isOnline = adminUser.isActive;

					if (lastActiveSession) {
						setIsOnline(isOnline);
						setLastActiveSession(lastActiveSession);
					}
				} else {
					toast.error(response.data.message);
				}
			} catch (error) {
				dispatch(hideLoading());
				console.error('Błąd podczas pobierania danych użytkownika:', error);

				message.error(
					'Wystąpił błąd podczas pobierania danych użytkownika. Spróbuj ponownie.'
				);
			}
		};

		fetchAdminUser();
	}, [dispatch]);

	const onFinish = async (values) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/send-message-to-support',
				{
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					topic: topic,
					subject: values.subject,
					message: values.message,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			dispatch(hideLoading());

			if (response.data.success) {
				toast.success(response.data.message);
				navigate('/app');
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd podczas wysyłania wiadomości:', error);

			message.error(
				'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.'
			);
		}
	};

	return (
		<Layout>
			<h2 className='page-title'>Skontaktuj się z nami!</h2>
			<hr />
			<Form layout='vertical' className='contact' onFinish={onFinish}>
				<header>
					<div className='d-flex flex-column align-items-center justify-content-between mt-5'>
						<h2 style={{ color: 'black' }}>Jakiś problem? 🤔</h2>
						<h4
							style={{
								textAlign: 'center',
								color: 'black',
								fontStyle: 'italic',
							}}
						>
							Skontaktuj się z Nami! Wysłuchamy i pomożemy jak tylko możemy 🙂!
						</h4>
						<span className='mt-3'>
							Odpowiadamy najszybciej, kiedy jesteśmy aktywni.
						</span>

						<div className='mt-2'>
							<StatusIndicator
								isOnline={isOnline}
								lastActiveSession={lastActiveSession}
							/>
						</div>
					</div>
				</header>

				<section className='contact-form'>
					<Form.Item
						label='Czego dotyczy twoja wiadomość?'
						name='topic'
						rules={[{ required: true, message: 'To pole jest wymagane' }]}
					>
						<Select size='large' value={topic} onChange={setTopic}>
							<Select.Option value='Użytkownicy'>Użytkownicy</Select.Option>
							<Select.Option value='DJ-e'>DJ-e</Select.Option>
							<Select.Option value='Rezerwacje'>Rezerwacje</Select.Option>
							<Select.Option value='Recenzje'>Recenzje</Select.Option>
							<Select.Option value='Propozycje ulepszeń'>
								Propozycje ulepszeń
							</Select.Option>
							<Select.Option value='Problem'>Problem</Select.Option>
							<Select.Option value='Błąd'>Błąd</Select.Option>
							<Select.Option value='Inny'>Inny</Select.Option>
						</Select>
					</Form.Item>

					<Form.Item
						label='Temat'
						name='subject'
						rules={[{ required: true, message: 'To pole jest wymagane' }]}
					>
						<Input placeholder='Temat wiadomości' />
					</Form.Item>

					<Form.Item
						label='Treść wiadomości'
						name='message'
						rules={[{ required: true, message: 'To pole jest wymagane' }]}
						labelCol={{ span: 24 }}
						wrapperCol={{ span: 24 }}
					>
						<TextArea
							placeholder='Treść wiadomości'
							style={{
								minHeight: '100px',
								resizeX: 'none',
								overflowY: 'auto',
							}}
						/>
					</Form.Item>

					<div className='d-flex justify-content-center'>
						<Button
							className='primary-button icon'
							htmlType='submit'
							style={{
								width: '100%',
							}}
						>
							<i className='ri-send-plane-fill'></i>
							Wyślij
						</Button>
					</div>
				</section>
			</Form>
		</Layout>
	);
};

export default Contact;
