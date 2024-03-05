import React, { useState } from 'react';
import { Button, Form, Input, Upload, Image } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import { UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import '../Register/registerStyles.css';

function Register() {
	const [isVerificationSent, setVerificationSent] = useState(false);
	const [profileImage, setProfileImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const { state } = location;
	const initialEmail = state ? state.email : '';
	const initialName = state ? state.name : '';
	const initialLastName = state ? state.lastName : '';

	const onFinish = async (values) => {
		if (!profileImage) {
			toast.error('Proszę wybrać zdjęcie profilowe');
			return;
		}

		try {
			dispatch(showLoading());
			const response = await axiosInstance.post('/api/user/register', {
				...values,
				profileImage,
			});

			if (response.data.success) {
				dispatch(hideLoading());
				toast.success(response.message.success);
				setVerificationSent(true);
				toast('Przekierowanie do strony logowania');
				navigate('/login');
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error('Uzytkownik juz istnieje!');
		}
	};

	const beforeUpload = (file) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setProfileImage(reader.result);
			setPreviewImage(reader.result);
		};
		return false;
	};

	return (
		<div className='authentication'>
			<div className='authentication-form card p-2'>
				<h1 className='card-title'>Witaj imprezowiczu! 🎉</h1>
				<Form layout='vertical' onFinish={onFinish}>
					<Form.Item
						label='Zdjęcie profilowe'
						name='profilePicture'
						rules={[
							{ required: true, message: 'Proszę wybrać zdjęcie profilowe.' },
						]}
					>
						<aside className='form-add-profile-image'>
							<ImgCrop
								showReset
								quality={1}
								aspect={1}
								minZoom={1}
								maxZoom={3}
								modalTitle={'Przytnij zdjęcie'}
								modalOk={'Przytnij'}
								modalCancel={'Anuluj'}
							>
								<Upload
									beforeUpload={beforeUpload}
									fileList={
										profileImage
											? [
													{
														uid: '-1',
														name: 'image.png',
														status: 'done',
														url: profileImage,
													},
											  ]
											: []
									}
									showUploadList={false}
									accept='image/*'
								>
									<Button icon={<UploadOutlined />}>Wybierz zdjęcie</Button>
								</Upload>
							</ImgCrop>
							{previewImage && (
								<Image
									src={previewImage}
									alt='Podgląd zdjęcia'
									style={{ height: '200px' }}
								/>
							)}
						</aside>
					</Form.Item>

					<Form.Item
						label='Imię'
						name='firstName'
						initialValue={initialName}
						rules={[{ required: true, message: 'Proszę podać imię.' }]}
					>
						<Input placeholder='Imię' disabled={initialName !== ''} />
					</Form.Item>
					<Form.Item
						label='Nazwisko'
						name='lastName'
						initialValue={initialLastName}
						rules={[{ required: true, message: 'Proszę podać nazwisko.' }]}
					>
						<Input placeholder='Nazwisko' disabled={initialLastName !== ''} />
					</Form.Item>
					<Form.Item
						label='Email'
						name='email'
						initialValue={initialEmail}
						rules={[
							{ required: true, message: 'Proszę podać adres e-mail.' },
							{ type: 'email', message: 'Proszę podać poprawny adres e-mail.' },
						]}
					>
						<Input placeholder='Email' disabled={initialEmail !== ''} />
					</Form.Item>
					<Form.Item
						label='Hasło'
						name='password'
						rules={[
							{ required: true, message: 'Proszę podać hasło.' },
							{ min: 8, message: 'Hasło musi mieć co najmniej 8 znaków.' },
							{
								pattern:
									/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:<,>.?/\\[\]'"`|~]).*$/,
								message:
									'Hasło musi zawierać małą literę, dużą literę, cyfrę oraz znak specjalny.',
							},
						]}
					>
						<Input.Password className='password-input' placeholder='Hasło' />
					</Form.Item>
					<Form.Item
						label='Potwierdź hasło'
						name='confirmPassword'
						dependencies={['password']}
						hasFeedback
						rules={[
							{ required: true, message: 'Proszę potwierdzić hasło.' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve();
									}
									return Promise.reject('Hasła nie są identyczne!');
								},
							}),
						]}
					>
						<Input.Password
							className='password-input'
							placeholder='Powtórz hasło'
						/>
					</Form.Item>

					{isVerificationSent && (
						<p className='verification-message'>
							Wysłaliśmy e-mail z linkiem weryfikacyjnym. Sprawdź swoją skrzynkę
							pocztową.
						</p>
					)}

					<Button
						className='primary-button my-2 full-width-button'
						htmlType='submit'
					>
						Zarejestruj się
					</Button>
					<Link to='/login' className='anchor d-block text-center mt-2'>
						Powrót do logowania
					</Link>
				</Form>
			</div>
		</div>
	);
}

export default Register;
