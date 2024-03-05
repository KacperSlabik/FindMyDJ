import { Button, Form, Input, Select, Slider, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axiosInstance from '../../services/axiosInstance';
import { useEffect, useState } from 'react';
import ImagesUpload from '../ImagesUpload/ImagesUpload';
import ProfileImageUpload from '../ProfileImageUpload/ProfileImageUpload';
import '../DjForm/djFormStyles.css';

export default function DjForm({
	onFinish,
	initialValues,
	photos,
	isApply = false,
}) {
	const [musicGenres, setMusicGenres] = useState([]);
	const [offers, setOffers] = useState([]);
	const [eventTypes, setEventTypes] = useState([]);
	const [profileImage, setProfileImage] = useState(initialValues?.profileImage);
	const [selectedMusicGenres, setSelectedMusicGenres] = useState(
		initialValues?.musicGenres ? initialValues?.musicGenres : []
	);
	const [selectedOffers, setSelectedOffers] = useState(
		initialValues?.offers ? initialValues?.offers : []
	);
	const [experience, setExperience] = useState(initialValues?.experience);
	const [selectedEventTypes, setSelectedEventTypes] = useState(
		initialValues?.eventTypes ? initialValues?.eventTypes : []
	);

	const [eventsPrice, setEventsPrice] = useState({
		min: initialValues?.eventsPrice ? initialValues.eventsPrice.min : 0,
		max: initialValues?.eventsPrice ? initialValues.eventsPrice.max : 10000,
	});

	const [disabled, setDisabled] = useState(true);
	const onChange = (checked) => {
		setDisabled(checked);
	};

	const handleFormSubmit = async (values) => {
		onFinish({
			...values,
			musicGenres: selectedMusicGenres,
			offers: selectedOffers,
			experience,
			eventTypes: selectedEventTypes,
			eventsPrice: `${eventsPrice.min} - ${eventsPrice.max}`,
		});
	};

	const handleSliderChange = (value) => {
		setEventsPrice({
			min: value[0],
			max: value[1],
		});
	};

	const getMusicGenres = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-music-genres', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setMusicGenres(response.data.data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getOffers = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-offers', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setOffers(response.data.data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getEventTypes = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-event-types', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setEventTypes(response.data.data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getMusicGenres();
		getOffers();
		getEventTypes();

		if (initialValues?.eventsPrice) {
			try {
				const [min, max] = initialValues.eventsPrice.split(' - ').map(Number);
				setEventsPrice({ min, max });
			} catch (error) {
				console.error('Błąd parsowania cen imprez:', error);
			}
		}
	}, [initialValues]);

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
						{initialValues?.profileImage && <img src={profileImage} alt='' />}

						<aside>
							<Form.Item
								rules={[
									{
										required: true,
										message: 'Proszę dodaj zdjęcie profilowe',
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
							rules={[
								{ required: true, message: 'Proszę podać numer telefonu.' },
							]}
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

						<Form.Item
							label='NIP'
							name='companyTIN'
							rules={[{ required: true, message: 'Proszę podać NIP.' }]}
						>
							<Input placeholder='NIP'></Input>
						</Form.Item>
					</aside>
				</section>
			</section>

			<hr />

			<section>
				<h3>Informacje dodatkowe</h3>
				<section className='dj-profile-form-two-columns'>
					<aside>
						<Form.Item
							label='Alias'
							name='alias'
							rules={[{ required: true, message: 'Proszę podać alias DJ-a.' }]}
						>
							<Input placeholder='Alias'></Input>
						</Form.Item>

						<Form.Item
							label='Opis'
							name='djDescription'
							rules={[{ required: true, message: 'Proszę podać opis.' }]}
						>
							<Input placeholder='Opis'></Input>
						</Form.Item>

						<Form.Item
							label='Facebook'
							name='facebook'
							rules={[
								{ required: true, message: 'Proszę podać link do Facebooka.' },
							]}
						>
							<Input type='url' placeholder='Facebook'></Input>
						</Form.Item>

						<Form.Item
							label='YouTube'
							name='youtube'
							rules={[{ required: false }]}
						>
							<Input type='url' placeholder='YouTube'></Input>
						</Form.Item>

						<Form.Item
							label='Instagram'
							name='instagram'
							rules={[{ required: false }]}
						>
							<Input type='url' placeholder='Instagram'></Input>
						</Form.Item>

						<Form.Item
							label='TikTok'
							name='tiktok'
							rules={[{ required: false }]}
						>
							<Input type='url' placeholder='TikTok'></Input>
						</Form.Item>
					</aside>

					<aside>
						<Form.Item
							label='Gatunki muzyczne'
							name='musicGenres'
							rules={[
								{
									required: true,
									message: 'Proszę podać gatunki muzyczne.',
								},
							]}
						>
							<Select
								mode='multiple'
								style={{ width: '100%' }}
								onChange={(value) => setSelectedMusicGenres(value)}
								placeholder='Wybierz gatunki muzyczne'
								defaultValue={initialValues?.musicGenres}
								optionLabelProp='label'
							>
								{musicGenres.map((musicGenre) => (
									<Select.Option
										value={musicGenre._id}
										key={musicGenre._id}
										label={musicGenre.name}
									>
										{musicGenre.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item label='Oferta'>
							<Select
								mode='multiple'
								style={{ width: '100%' }}
								onChange={(value) => setSelectedOffers(value)}
								placeholder='Wybierz twoją ofertę'
								defaultValue={initialValues?.offers}
								optionLabelProp='label'
							>
								{offers.map((offer) => (
									<Select.Option
										value={offer._id}
										key={offer._id}
										label={offer.name}
									>
										{offer.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							label='Doświadczenie'
							name='experience'
							rules={[
								{ required: true, message: 'Proszę podać doświadczenie.' },
							]}
						>
							<Select
								style={{ width: '100%' }}
								placeholder='Lata doświadczenia'
								onChange={(value) => setExperience(value)}
								defaultValue={experience}
								optionLabelProp='label'
							>
								<Select.Option
									value='mniej niż rok '
									key='mniej niż rok'
									label='Mniej niż rok'
								>
									Mniej niż rok
								</Select.Option>
								<Select.Option value='1-3 lata' key='1-3 lata' label='1-3 lata'>
									1-3 lata
								</Select.Option>
								<Select.Option value='3-5 lat' key='3-5 lat' label='3-5 lat'>
									3-5 lat
								</Select.Option>
								<Select.Option value='5-7 lat' key='5-7 lat' label='5-7 lat'>
									5-7 lat
								</Select.Option>
								<Select.Option value='7-9 lat' key='7-9 lat' label='7-9 lat'>
									7-9 lat
								</Select.Option>
								<Select.Option
									value='10-15 lat'
									key='10-15 lat'
									label='10-15 lat'
								>
									10-15 lat
								</Select.Option>
								<Select.Option
									value='16-20 lat'
									key='16-20 lat'
									label='16-20 lat'
								>
									16-20 lat
								</Select.Option>
								<Select.Option
									value='ponad 20 lat'
									key='ponad 20 lat'
									label='ponad 20 lat'
								>
									ponad 20 lat
								</Select.Option>
							</Select>
						</Form.Item>

						<Form.Item
							label='Specjalizacja'
							name='specialization'
							rules={[
								{ required: true, message: 'Proszę podać specjalizacje.' },
							]}
							initialValue={initialValues?.eventTypes}
						>
							<Select
								mode='multiple'
								style={{ width: '100%' }}
								onChange={(value) => setSelectedEventTypes(value)}
								placeholder='Wybierz twoją specjalizację'
								defaultValue={initialValues?.eventTypes}
								optionLabelProp='label'
							>
								{eventTypes.map((event) => (
									<Select.Option
										value={event._id}
										key={event._id}
										label={event.name}
									>
										{event.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item label='Przedział cenowy imprez' name='eventsPrice'>
							<Slider
								disabled={disabled}
								range
								value={[eventsPrice.min, eventsPrice.max]}
								min={500}
								max={10000}
								step={500}
								onChange={handleSliderChange}
								tooltip={{
									formatter: (value) => `${value} zł`,
								}}
							/>
							Edycja zablokowana:{' '}
							<Switch
								size='small'
								checkedChildren={<CheckOutlined />}
								unCheckedChildren={<CloseOutlined />}
								defaultChecked
								checked={disabled}
								onChange={onChange}
							/>
						</Form.Item>
					</aside>
				</section>
			</section>
			<footer>
				<div className='d-flex justify-content-end'>
					<Button className='primary-button' htmlType='submit'>
						Zatwierdź
					</Button>
				</div>
			</footer>

			{!isApply && (
				<>
					<hr />
					<section>
						<h3>Zdjęcia</h3>

						<section>
							<aside>
								<Form.Item
									label='Zdjęcia z Twoich imprez + prezentacja stanowiska DJ '
									rules={[
										{
											required: true,
											message:
												'Proszę dodaj zdjęcia z Twoich imprez imprez i stanowiska DJ',
										},
									]}
								>
									<ImagesUpload files={photos}></ImagesUpload>
								</Form.Item>
							</aside>
						</section>
					</section>
				</>
			)}
		</Form>
	);
}
