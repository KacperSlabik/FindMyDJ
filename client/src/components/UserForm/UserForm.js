import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import ProfileImageUpload from '../ProfileImageUpload/ProfileImageUpload';
import '../DjForm/djFormStyles.css';

export default function DjForm({ onFinish, initialValues, isApply = false }) {
	const [profileImage, setProfileImage] = useState(initialValues?.profileImage);

	const handleFormSubmit = async (values) => {
		onFinish({
			...values,
		});
	};

	return (
		<Form
			layout='vertical'
			onFinish={handleFormSubmit}
			initialValues={initialValues}
			className='dj-profile-form'
		>
			{profileImage && (
				<>
					<h3>Zdjęcie profilowe</h3>
					<header>
						{initialValues?.profileImage && (
							<img src={profileImage} alt='Zdjęcie profilowe' />
						)}

						<aside className='dj-profile-image-container'>
							<Form.Item
								rules={[
									{
										required: true,
										message: 'Proszę wybrać zdjęcie profilowe.',
									},
								]}
							>
								<ProfileImageUpload setProfileImage={setProfileImage} />
							</Form.Item>
						</aside>
					</header>
					<hr />
				</>
			)}

			<section>
				<h3>Informacje podstawowe</h3>
				<section className='dj-profile-form-two-columns'>
					<aside>
						<Form.Item
							label='Imię'
							name='firstName'
							initialValue={initialValues?.firstName}
							rules={[{ required: true, message: 'Proszę podać imię.' }]}
						>
							<Input placeholder='Imię'></Input>
						</Form.Item>

						<Form.Item
							label='Nazwisko'
							name='lastName'
							rules={[{ required: true, message: 'Proszę podać nazwisko.' }]}
						>
							<Input placeholder='Nazwisko'></Input>
						</Form.Item>

						<Form.Item
							label='E-mail'
							name='email'
							initialValue={initialValues?.email}
							rules={[
								{ required: true, message: 'Proszę podać adres email' },
								{
									type: 'email',
									message: 'Proszę podać poprawny adres e-mail.',
								},
							]}
						>
							<Input placeholder='Email' disabled></Input>
						</Form.Item>
					</aside>

					<aside>
						<Form.Item
							label='Numer Telefonu'
							name='phoneNumber'
							rules={[{ required: true }]}
						>
							<Input placeholder='Numer Telefonu'></Input>
						</Form.Item>

						<div className='dj-profile-two-inputs'>
							<Form.Item
								label='Miejscowość'
								name='city'
								rules={[
									{ required: true, message: 'Proszę podać miejscowość.' },
								]}
							>
								<Input placeholder='Miejscowość'></Input>
							</Form.Item>

							<Form.Item
								label='Kod pocztowy'
								name='postalCode'
								rules={[
									{ required: true, message: 'Proszę podać kod pocztowy.' },
								]}
							>
								<Input placeholder='00-000'></Input>
							</Form.Item>
						</div>
					</aside>
				</section>
			</section>

			<hr />

			<Form.Item
				label='Facebook'
				name='facebook'
				rules={[{ required: true, message: 'Proszę podać link do Facebooka.' }]}
			>
				<Input type='url' placeholder='Facebook'></Input>
			</Form.Item>

			<Form.Item
				label='Instagram'
				name='instagram'
				rules={[{ required: false }]}
			>
				<Input type='url' placeholder='Instagram'></Input>
			</Form.Item>

			<footer>
				<div className='d-flex justify-content-end'>
					<Button className='primary-button' htmlType='submit'>
						Zatwierdź
					</Button>
				</div>
			</footer>
		</Form>
	);
}
