import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import Layout from '../../../components/Layout/Layout';
import { useEffect, useState } from 'react';
import {
	Button,
	DatePicker,
	Form,
	Input,
	TimePicker,
	Rate,
	Typography,
	Select,
	Slider,
	Skeleton,
	Empty,
	Popover,
} from 'antd';
import { formatDateTime } from '../../../services/utils';
import Modal from 'antd/es/modal/Modal';
import { isAfter } from 'date-fns';
import ReviewDjModal from '../../../components/ReviewDjModal/ReviewDjModal';
import moment from 'moment';
import ImageCarousel from '../../../components/ImageCarousel/ImageCarousel';
import {
	FacebookButton,
	YouTubeButton,
	InstagramButton,
	TikTokButton,
} from '../../../components/Button/Button';
import '../BookDj/bookDjStyles.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import BookingSteps from '../../../components/BookingSteps/BookingSteps';
import StatusIndicator from '../../../components/StatusIndicator/StatusIndicator';
import { setUser } from '../../../redux/userSlice';
import Review from '../../../components/Review/Review';

const { Text } = Typography;

export default function BookDj() {
	const params = useParams();
	const [dj, setDj] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector((state) => state.user);

	const [userData, setUserData] = useState(null);

	const [startDate, setStartDate] = useState();
	const [startTime, setStartTime] = useState();

	const [endDate, setEndDate] = useState();
	const [endTime, setEndTime] = useState();

	const [isAvailable, setIsAvailable] = useState(false);

	const [musicGenres, setMusicGenres] = useState([]);
	const [offer, setOffer] = useState([]);
	const [eventTypes, setEventTypes] = useState([]);

	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [formData, setFormData] = useState({});

	const [showReviewModal, setShowReviewModal] = useState(false);

	const [reviews, setReviews] = useState([]);

	const [selectedReview, setSelectedReview] = useState({});

	const [loading, setLoading] = useState(false);

	const [currentStep, setCurrentStep] = useState(1);

	const [filter, setFilter] = useState('newest');

	const isOnline = userData?.isActive;
	const lastActiveSession = userData?.activeSessions?.[0]?.lastModified;

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleFilterChange = (value) => {
		setFilter(value);
	};

	const sortReviews = (reviews, filter) => {
		switch (filter) {
			case 'oldest':
				return reviews.toSorted(
					(a, b) => new Date(a.createdAt) - new Date(b.createdAt)
				);
			case 'newest':
				return reviews.toSorted(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
			case 'lowestRating':
				return reviews.toSorted((a, b) => a.rating - b.rating);
			case 'highestRating':
				return reviews.toSorted((a, b) => b.rating - a.rating);
			case 'likes':
				return reviews.toSorted((a, b) => {
					console.log({ a: a.likes.length, b: b.likes.length });
					return b.likes.length - a.likes.length;
				});
			case 'dislikes':
				return reviews.toSorted(
					(a, b) => b.dislikes.length - a.dislikes.length
				);
			default:
				return reviews;
		}
	};

	const sortedReviews = sortReviews(reviews, filter);

	const checkForUserReview = () => {
		let result = reviews.filter((review) => review.userId._id === user._id);
		if (result.length > 0) return result[0];
		return null;
	};

	const showReviewEditModal = (review) => {
		setSelectedReview(review);

		setShowReviewModal(true);
	};

	const showModal = (values) => {
		setConfirmModalOpen(true);
		setFormData(values);
	};

	const handleOk = async () => {
		setConfirmLoading(true);

		await bookNow(formData);
		setConfirmModalOpen(false);
		setConfirmLoading(false);
	};

	const handleCancel = () => {
		setConfirmModalOpen(false);
	};

	const getDjData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/dj/get-dj-info-by-id',
				{ djId: params.djId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				setDj(response.data.data);
				getMusicGenres(response.data.data);
				getOffer(response.data.data);
				getEventTypes(response.data.data);
				getDJReviews(response.data.data);
				getUserDataById(response.data.data.userId);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	const getUserDataById = async (userId) => {
		try {
			const response = await axiosInstance.get(`/api/user/${userId}`, {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});

			if (response.data.success) {
				setUserData(response.data.data);
			} else {
				throw new Error('Nie udało się pobrać danych użytkownika');
			}
		} catch (error) {
			console.error('Błąd podczas pobierania danych użytkownika:', error);
			throw error;
		}
	};

	const getDJReviews = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get(`/api/reviews/get-dj-reviews`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				params: {
					djId: params.djId,
				},
			});

			if (response.data.success) {
				setReviews(response.data.data);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.error('Wystąpił błąd podczas pobierania recenzji:', error);
		} finally {
			setLoading(false);
		}
	};

	const getMusicGenres = async (djData) => {
		const djMusicGenresId = djData?.musicGenres;
		setMusicGenres([]);
		if (!djMusicGenresId) return;

		djMusicGenresId.forEach(async (id) => {
			const response = await axiosInstance.get(
				'/api/user/get-music-genre',

				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					params: { genreId: id },
				}
			);
			if (response.data.success) {
				setMusicGenres((prevState) => [...prevState, response.data.data?.name]);
			}
			try {
			} catch (error) {
				console.log(error);
			}
		});
	};

	const getEventTypes = async (djData) => {
		const djEventTypesId = djData?.eventTypes;
		setEventTypes([]);
		if (!djEventTypesId) return;

		djEventTypesId.forEach(async (id) => {
			const response = await axiosInstance.get(
				'/api/user/get-event-type',

				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					params: { eventTypeId: id },
				}
			);

			if (response.data.success) {
				setEventTypes((prevState) => [...prevState, response.data.data?.name]);
			}
			try {
			} catch (error) {
				console.log(error);
			}
		});
	};

	const getOffer = async (djData) => {
		const offersId = djData?.offers;
		setOffer([]);

		if (!offersId) return;

		offersId.forEach(async (id) => {
			const response = await axiosInstance.get(
				'/api/user/get-offer',

				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					params: { offerId: id },
				}
			);
			if (response.data.success) {
				setOffer((prevState) => [...prevState, response.data.data?.name]);
			}
			try {
			} catch (error) {
				console.log(error);
			}
		});
	};

	const checkAvailability = async () => {
		if (!startDate || !startTime || !endDate || !endTime) {
			toast.error(
				'Aby sprawdzić dostępność DJ, uzupełnij czas rozpoczęcia i zakończenia imprezy!'
			);
			return;
		}

		const formattedStartDate = formatDateTime(startDate, startTime);
		const formattedEndDate = formatDateTime(endDate, endTime);

		if (isAfter(new Date(formattedEndDate), new Date(formattedStartDate))) {
			try {
				dispatch(showLoading());
				const response = await axiosInstance.post(
					'/api/user/check-booking-avilability',
					{
						djId: params.djId,
						startDate: formattedStartDate,
						endDate: formattedEndDate,
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
					setIsAvailable(true);
					setCurrentStep(2);
				} else {
					toast.error(response.data.message);
				}
			} catch (error) {
				toast.error('Wystąpił błąd rezerwacji!');
				dispatch(hideLoading());
			}
		} else {
			toast.error(
				'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia!'
			);
		}
	};

	const bookNow = async (values) => {
		setIsAvailable(false);
		const formattedStartDate = formatDateTime(startDate, startTime);
		const formattedEndDate = formatDateTime(endDate, endTime);

		const payload = {
			...values,
			djId: params.djId,
			userId: user._id,
			djInfo: dj,
			userInfo: user,
			startDate: formattedStartDate,
			endDate: formattedEndDate,
			guests: values.guests.join(' - '),
			ageRange: values.ageRange.join(' - '),
		};

		try {
			dispatch(showLoading());
			const response = await axiosInstance.post('/api/user/book-dj', payload, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				navigate('/app/bookings');
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error(error.response.data.message);
		}
	};

	useEffect(() => {
		getDjData();
	}, []);

	let profilePicture = (
		<span className='dj-default-icon rounded w-25'>
			<svg viewBox='0 0 24 24'>
				<path
					d='M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z'
					fill='currentColor'
				></path>
			</svg>
		</span>
	);

	if (dj?.profileImage) {
		profilePicture = (
			<img src={dj.profileImage} className='rounded ' alt={dj.alias} />
		);
	}

	const userReview = checkForUserReview();

	return (
		<Layout>
			<div className='d-flex flex-row gap-3 m-0'>
				<Popover content='Powrót do DJ-ów'>
					<Button
						className='primary-button menu-item d-flex align-items-center'
						onClick={handleGoBack}
					>
						<i
							className='ri-arrow-go-back-line'
							style={{ fontSize: '25px' }}
						></i>
					</Button>
				</Popover>

				<h1 className='page-title mt-1'>Zarezerwuj DJ-a</h1>
			</div>
			<hr />
			{dj && (
				<Form
					layout='vertical'
					onFinish={(values) => {
						showModal(values);
						setCurrentStep(3);
					}}
					className='book-dj'
				>
					<header>
						{profilePicture}
						<aside>
							<h2>
								{dj.firstName} {dj.lastName} ({dj.alias})
							</h2>

							<div>
								<StatusIndicator
									isOnline={isOnline}
									lastActiveSession={lastActiveSession}
								/>
							</div>

							<div className='d-flex gap-2'>
								<Rate
									allowHalf
									disabled
									value={dj.averageRating}
									style={{ color: 'orange' }}
								/>
								<strong>
									{dj.averageRating > 0 && dj.averageRating.toFixed(2)}
								</strong>
							</div>

							<div className='d-flex gap-2'>
								<span>
									<svg viewBox='0 0 24 24' width='18' height='18'>
										<path
											d='M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z'
											fill='currentColor'
										></path>
									</svg>
								</span>
								{dj.city}
							</div>

							<div className='d-flex gap-2'>
								{dj?.facebook && <FacebookButton link={dj?.facebook} />}

								{dj?.youtube && <YouTubeButton link={dj?.youtube} />}

								{dj?.instagram && <InstagramButton link={dj?.instagram} />}

								{dj?.tiktok && <TikTokButton link={dj?.tiktok} />}
							</div>
						</aside>
					</header>
					<hr />

					<section className='dj-details'>
						<h3>Coś więcej na mój temat</h3>
						{dj?.djDescription}

						{dj?.experience && (
							<div>
								<strong>Doświadczenie: </strong> {dj?.experience}
							</div>
						)}

						{dj?.eventTypes?.length > 0 && (
							<section className='book-dj-two-columns'>
								<aside>
									<strong>Specjalizuje się w: </strong>
									<div className='badge-list'>
										{eventTypes.map((eventType) => (
											<span key={eventType}>{eventType}</span>
										))}
									</div>
								</aside>
							</section>
						)}

						<section className='book-dj-two-columns'>
							<aside>
								<strong>Grane gatunki muzyczne: </strong>
								<div className='badge-list'>
									{musicGenres.map((genre) => (
										<span key={genre}>{genre}</span>
									))}
								</div>
							</aside>
							<aside>
								<strong>Oferta dodatkowa: </strong>
								<div className='badge-list'>
									{offer.map((o) => (
										<span key={o}>{o}</span>
									))}
								</div>
							</aside>
						</section>
					</section>

					<hr />

					<section className='book-dj-slider'>
						<h3>Zdjęcia z imprez</h3>
						{dj?.eventPhotos && <ImageCarousel photos={dj?.eventPhotos} />}
					</section>

					<hr />

					<div>
						<section>
							{isAvailable ? (
								<>
									<div className='mt-4 mb-4'>
										<BookingSteps currentStep={currentStep} />
									</div>
									{/* <h2 className='d-flex flex-row justify-content-start mb-5'>
										Zdradź szczegóły Twojej imprezy
									</h2> */}

									<section className='book-dj-two-columns booking-details'>
										<aside>
											<h3 className=''>Lokalizacja</h3>
											<div className='form-section'>
												<Form.Item
													label='Nazwa obiektu'
													name='location'
													rules={[{ required: true }]}
												>
													<Input placeholder='Nazwa obiektu' />
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Miejscowość'
													name='city'
													rules={[{ required: true }]}
												>
													<Input placeholder='Miejscowość' />
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Kod pocztowy'
													name='postalCode'
													rules={[{ required: true }]}
												>
													<Input placeholder='00-000' />
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Adres'
													name='address'
													rules={[{ required: true }]}
												>
													<Input placeholder='Adres' />
												</Form.Item>
											</div>
										</aside>

										<aside>
											<h3 className=''>Dodatkowe informacje</h3>
											<div className='form-section'>
												<Form.Item
													label='Przewidywana liczba gości'
													name='guests'
													rules={[{ required: true }]}
												>
													<Slider
														range
														defaultValue={[20, 40]}
														min={20}
														max={500}
														style={{ height: 40 }}
													/>
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Przedział wiekowy gości'
													name='ageRange'
													rules={[{ required: true }]}
												>
													<Slider
														range
														defaultValue={[20, 40]}
														min={0}
														max={100}
														style={{}}
													/>
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Typ imprezy'
													name='partyType'
													rules={[{ required: true }]}
												>
													<Input placeholder='Typ imprezy' />
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Preferowany rodzaj muzyki'
													name='musicType'
													rules={[{ required: true }]}
												>
													<Select
														mode='multiple'
														style={{ width: '100%' }}
														placeholder='Wybierz gatunki muzyczne'
													>
														{musicGenres.map((musicGenre) => (
															<Select.Option
																value={musicGenre}
																key={musicGenre}
															>
																{musicGenre}
															</Select.Option>
														))}
													</Select>
												</Form.Item>
											</div>

											<div className='form-section'>
												<Form.Item
													label='Dodatkowe usługi'
													name='additionalServices'
													rules={[{ required: false }]}
												>
													<Select
														mode='multiple'
														style={{ width: '100%' }}
														placeholder='Wybierz dodatkowe usługi'
													>
														{offer.map((offer) => (
															<Select.Option value={offer} key={offer}>
																{offer}
															</Select.Option>
														))}
													</Select>
												</Form.Item>
											</div>
										</aside>
									</section>
									<div className='d-flex gap-2 mt-4'>
										<strong>Wybrany termin imprezy:</strong>
										<span>
											{new Date(
												formatDateTime(startDate, startTime)
											).toLocaleString()}{' '}
											-{' '}
											{new Date(
												formatDateTime(endDate, endTime)
											).toLocaleString()}
										</span>
									</div>

									<div className='book-button-container'>
										{isAvailable && (
											<>
												<Button
													className='secondary-button mt-5'
													htmlType='button'
													onClick={() => {
														setIsAvailable();
														setCurrentStep(1);
													}}
												>
													Powrót do wyboru dat
												</Button>

												<Button
													className='primary-button mt-5'
													htmlType='submit'
												>
													Zarezerwuj teraz
												</Button>
											</>
										)}
									</div>
								</>
							) : (
								<div>
									<div className='mt-4 mb-4'>
										<BookingSteps currentStep={currentStep} />
									</div>

									<div className='d-flex flex-column justify-content-center align-items-center mt-5'>
										<div className='start-date-time-input d-flex flex-row align-items-center gap-3'>
											<span style={{ fontSize: '16px' }}>
												Rozpoczęcie imprezy:
											</span>
											<div className='d-flex flex-row gap-2'>
												<DatePicker
													placeholder='Data'
													onChange={(value) => setStartDate(value)}
												/>
												<TimePicker
													placeholder='Godzina'
													format='HH:mm'
													onChange={(value) => setStartTime(value)}
												/>
											</div>
										</div>

										<div className='end-date-time-input d-flex flex-row align-items-center gap-3 mt-3'>
											<span style={{ fontSize: '16px' }}>
												Zakończenie imprezy:
											</span>
											<div className='d-flex flex-row gap-2'>
												<DatePicker
													placeholder='Data'
													onChange={(value) => setEndDate(value)}
												/>
												<TimePicker
													placeholder='Godzina'
													format='HH:mm'
													onChange={(value) => setEndTime(value)}
												/>
											</div>
										</div>

										{!isAvailable && (
											<Button
												className='primary-button mt-5'
												onClick={checkAvailability}
											>
												Sprawdź teraz
											</Button>
										)}
									</div>
								</div>
							)}
						</section>
					</div>

					<hr />

					<footer>
						<section className='book-dj-two-columns reviews-header'>
							<aside>
								<h3>Recenzje ({reviews.length})</h3>
							</aside>
							<aside>
								<div className='d-flex align-items-center ms-auto sort-container'>
									<div className='d-flex align-items-center'>
										<label htmlFor='reviewSort'>Sortuj:</label>
										<select
											id='reviewSort'
											className='form-select mx-2'
											value={filter}
											onChange={(e) => handleFilterChange(e.target.value)}
											style={{ width: '200px' }}
										>
											<option value='newest'>Od najnowszych</option>{' '}
											<option value='oldest'>Od najstarszych</option>
											<option value='lowestRating'>Od ocen rosnąco</option>{' '}
											<option value='highestRating'>Od ocen malejąco</option>
											<option value='likes'>
												Od najbardziej pozytywnych
											</option>{' '}
											<option value='dislikes'>
												Od najbardziej negatywnych
											</option>
										</select>
									</div>

									<div className='d-flex add-review-button'>
										{!userReview ? (
											<Button
												className='primary-button default'
												onClick={() => setShowReviewModal(true)}
											>
												Dodaj recenzję
											</Button>
										) : (
											<Button
												className='primary-button default'
												onClick={() => showReviewEditModal(userReview)}
											>
												Edytuj recenzję
											</Button>
										)}
									</div>
								</div>
							</aside>
						</section>

						<section>
							<div className='d-flex flex-row justify-content-between align-items-center w-100'>
								{showReviewModal && (
									<ReviewDjModal
										dj={dj}
										reloadData={getDjData}
										showReviewModal={showReviewModal}
										setShowReviewModal={setShowReviewModal}
										initialData={selectedReview}
										setInitialData={setSelectedReview}
									/>
								)}
							</div>
						</section>

						<section>
							{loading ? (
								<Skeleton active paragraph={{ rows: 3 }} />
							) : (
								<div className='user-comments'>
									{sortedReviews.length > 0 ? (
										sortedReviews.map((review) => (
											<Review review={review} onFinish={getDJReviews} />
										))
									) : (
										<Empty description='Brak recenzji.' />
									)}
								</div>
							)}
						</section>
					</footer>

					<Modal
						title='Potwierdzenie rezerwacji'
						open={confirmModalOpen}
						reloadData={getDjData}
						cancelText='Anuluj'
						okText='Potwierdź'
						confirmLoading={confirmLoading}
						onOk={handleOk}
						onCancel={handleCancel}
					>
						<p>Czy na pewno chcesz dokonać rezerwacji?</p>
					</Modal>
				</Form>
			)}
		</Layout>
	);
}
