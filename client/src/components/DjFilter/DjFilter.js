import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Slider } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../services/axiosInstance';
import '../DjFilter/djFilterStyles.css';

const { Option } = Select;

function DjFilter({ onSearch, djs }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchField, setSearchField] = useState('firstName');
	const [djsByLocation, setDjsByLocation] = useState(djs);
	const [location, setLocation] = useState('');
	const [locationFetched, setLocationFetched] = useState(false);
	const [searchRadius, setSearchRadius] = useState(5);
	const [locationFetchTrigger, setLocationFetchTrigger] = useState(false);
	const [locationReceived, setLocationReceived] = useState(false);
	const [locatedText, setLocatedText] = useState('Zlokalizuj mnie');
	const [musicGenres, setMusicGenres] = useState([]);
	const [offers, setOffers] = useState([]);
	const [eventTypes, setEventTypes] = useState([]);
	const [selectedMusicGenre, setSelectedMusicGenre] = useState([]);
	const [selectedOffer, setSelectedOffer] = useState([]);
	const [selectedSpecialization, setSelectedSpecialization] = useState([]);
	const [rangeChanged, setRangeChanged] = useState(false);

	const [eventsPriceRange, setEventsPriceRange] = useState([500, 10000]);

	const [ratingRange, setRatingRange] = useState([1, 5]);

	const dispatch = useDispatch();

	const [resetFilter, setResetFilter] = useState(false);

	useEffect(() => {
		const savedFilters = localStorage.getItem('djFilters');
		if (savedFilters) {
			const parsedFilters = JSON.parse(savedFilters);
			setSearchTerm(parsedFilters.searchTerm);
			setSearchField(parsedFilters.searchField);
			setLocation(parsedFilters.location);
			setSearchRadius(parsedFilters.searchRadius);
			setSelectedMusicGenre(parsedFilters.selectedMusicGenre);
			setSelectedOffer(parsedFilters.selectedOffer);
			setSelectedSpecialization(parsedFilters.selectedSpecialization);
			setEventsPriceRange(parsedFilters.eventsPriceRange);
			setRatingRange(parsedFilters.ratingRange);
			setLocationFetchTrigger(parsedFilters.locationFetchTrigger);

			onSearch(
				parsedFilters.searchTerm,
				parsedFilters.searchField,
				parsedFilters.location,
				djsByLocation,
				parsedFilters.selectedMusicGenre,
				parsedFilters.selectedOffer,
				parsedFilters.selectedSpecialization,
				parsedFilters.eventsPriceRange,
				parsedFilters.ratingRange
			);
		}
	}, []);

	useEffect(() => {
		const filtersToSave = JSON.stringify({
			searchTerm,
			searchField,
			location,
			searchRadius,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization,
			eventsPriceRange,
			ratingRange,
			locationFetchTrigger,
		});
		localStorage.setItem('djFilters', filtersToSave);
	}, [
		searchTerm,
		searchField,
		location,
		searchRadius,
		selectedMusicGenre,
		selectedOffer,
		selectedSpecialization,
		eventsPriceRange,
		ratingRange,
		locationFetchTrigger,
	]);

	const handleResetFilter = () => {
		setSearchTerm('');
		setSearchField('firstName');
		setDjsByLocation(djs);
		setLocation('');
		setLocationFetched(false);
		setSearchRadius(5);
		setLocatedText('Zlokalizuj mnie');
		setResetFilter(false);
		onSearch('', 'firstName', '', djs);
		setLocationFetchTrigger(false);
		setSelectedMusicGenre([]);
		setSelectedOffer([]);
		setEventsPriceRange([500, 10000]);
		setRatingRange([1, 5]);
	};

	const handleInputChange = (e) => {
		setSearchTerm(e.target.value);
		onSearch(
			e.target.value,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization
		);
	};

	const handleSelectChange = (value) => {
		setSearchField(value);
		onSearch(
			searchTerm,
			value,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization,
			eventsPriceRange,
			ratingRange
		);
		if (value === 'city') {
			setLocationFetched(false);
			setLocationFetchTrigger(false);
		}
	};

	const handleLocateMe = async () => {
		try {
			const promiseLoadingToast = toast.promise(
				new Promise((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(
						async (position) => {
							const latitude = position.coords.latitude;
							const longitude = position.coords.longitude;

							try {
								const response = await axiosInstance.get(
									`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
								);

								if (!response.data) {
									throw new Error(
										'Nie udało się pobrać danych geograficznych.'
									);
								}

								const data = response.data;
								const city =
									data.address.city ||
									data.address.town ||
									data.address.village ||
									data.address.county;

								setLocation(city);
								setLocationFetched(true);
								setLocatedText(city);

								const serverResponse = await axiosInstance.post(
									'/api/dj/search-djs-by-location',
									{
										userLocation: city,
										searchRadius: searchRadius,
									},
									{
										headers: {
											Authorization: `Bearer ${localStorage.getItem('token')}`,
										},
									}
								);

								if (!serverResponse.data.success) {
									throw new Error(
										'Błąd podczas wyszukiwania DJ-ów na podstawie lokalizacji!'
									);
								}

								const serverData = serverResponse.data;
								onSearch('', searchField, city, serverData.result);
								setDjsByLocation(serverData.result);
								console.log(
									'Wyniki wyszukiwania DJ-ów na podstawie lokalizacji:',
									serverData.result
								);

								setLocationReceived(true);

								setTimeout(() => {
									toast.dismiss();
								}, 3000);

								resolve();
							} catch (error) {
								console.error('Błąd podczas pobierania lokalizacji:', error);
								reject(error);
							}
						},
						(error) => {
							console.error('Błąd podczas pobierania lokalizacji:', error);
							reject(error);
						}
					);
				}),
				{
					loading: rangeChanged
						? 'Zwiększanie obszaru wyszukiwania...'
						: 'Pobieranie lokalizacji użytkownika...',
					success: rangeChanged
						? 'Pomyślnie zwiększono obszar wyszukiwania.'
						: 'Pomyślnie pobrano lokalizację.',
					error: rangeChanged
						? 'Błąd zwiększania obszaru wyszukiwania!'
						: 'Błąd pobrania lokalizacji!',
				}
			);
		} catch (error) {
			console.error('Błąd podczas pobierania lokalizacji:', error);
		}

		setRangeChanged(false);
	};

	const handleRadiusChange = (value) => {
		setSearchRadius(value);
		setRangeChanged(true);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization,
			eventsPriceRange,
			ratingRange
		);
		setLocationFetchTrigger(true);
	};

	const handleMusicGenreChange = (musicGenres) => {
		setSelectedMusicGenre(musicGenres);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			musicGenres,
			selectedOffer,
			selectedSpecialization,
			eventsPriceRange,
			ratingRange
		);
	};

	const handleOfferChange = (offer) => {
		setSelectedOffer(offer);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			offer,
			selectedSpecialization,
			eventsPriceRange,
			ratingRange
		);
	};

	const handleSpecializationChange = (specialization) => {
		setSelectedSpecialization(specialization);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			specialization,
			eventsPriceRange,
			ratingRange
		);
	};

	const handleRatingChange = (value) => {
		setRatingRange(value);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization,
			eventsPriceRange,
			value
		);
	};

	const handleSliderChange = (value) => {
		setEventsPriceRange(value);
		onSearch(
			searchTerm,
			searchField,
			location,
			djsByLocation,
			selectedMusicGenre,
			selectedOffer,
			selectedSpecialization,
			value,
			ratingRange
		);
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
		if (locationFetchTrigger) {
			handleLocateMe();
		}

		getMusicGenres();
		getOffers();
		getEventTypes();
	}, [searchRadius, locationFetchTrigger]);

	return (
		<div className='dj-filters-container'>
			<section className='dj-filter'>
				<aside className='dj-filter-input'>
					<Input
						size='small'
						className='search-input'
						placeholder='Wyszukaj DJ-a'
						onChange={handleInputChange}
						allowClear
						value={searchTerm}
						prefix={<SearchOutlined style={{ marginRight: 8 }} />}
						addonAfter={
							<Select
								size='large'
								value={searchField}
								onChange={handleSelectChange}
							>
								<Select.Option value='firstName'>Imię</Select.Option>
								<Select.Option value='lastName'>Nazwisko</Select.Option>
								<Select.Option value='alias'>Alias</Select.Option>
								<Select.Option value='city'>Miasto</Select.Option>
							</Select>
						}
					/>
				</aside>
				<div className='d-flex flex-column align-items-center'>
					<strong>Ocena</strong>
					<Slider
						range
						value={ratingRange}
						min={1}
						max={5}
						step={0.5}
						onChange={handleRatingChange}
						style={{ width: '150px' }}
					/>
				</div>

				{locationFetched && (
					<aside>
						<div>
							<Select
								align='top'
								size='large'
								value={searchRadius}
								onChange={handleRadiusChange}
							>
								<Select.Option value={5}>+5 km</Select.Option>
								<Select.Option value={10}>+10 km</Select.Option>
								<Select.Option value={15}>+15 km</Select.Option>
								<Select.Option value={30}>+30 km</Select.Option>
								<Select.Option value={50}>+50 km</Select.Option>
								<Select.Option value={75}>+75 km</Select.Option>
								<Select.Option value={100}>+100 km</Select.Option>
								<Select.Option value={150}>+150 km</Select.Option>
								<Select.Option value={200}>+200 km</Select.Option>
							</Select>
						</div>
					</aside>
				)}

				<aside>
					<Button
						className='primary-button'
						size='large'
						type='primary'
						icon={<EnvironmentOutlined />}
						onClick={() => setLocationFetchTrigger(true)}
					>
						{locatedText}
					</Button>
				</aside>

				<aside>
					<Button
						className='primary-button'
						size='large'
						type='primary'
						onClick={handleResetFilter}
					>
						Resetuj filtry
					</Button>
				</aside>
			</section>

			<section className='dj-filter'>
				<Select
					size='large'
					placeholder='Muzyka'
					value={selectedMusicGenre}
					onChange={handleMusicGenreChange}
					mode='multiple'
					maxTagCount={1}
					maxTagTextLength={10}
				>
					{musicGenres.map((genre) => (
						<Option key={genre._id} value={genre._id}>
							{genre.name}
						</Option>
					))}
				</Select>

				<Select
					size='large'
					placeholder='Oferta +'
					value={selectedOffer}
					onChange={handleOfferChange}
					mode='multiple'
					maxTagCount={1}
				>
					{offers.map((offer) => (
						<Option key={offer._id} value={offer._id}>
							{offer.name}
						</Option>
					))}
				</Select>

				<Select
					size='large'
					placeholder='Specjalizacja'
					value={selectedSpecialization}
					onChange={handleSpecializationChange}
					mode='multiple'
					maxTagCount={1}
					maxTagTextLength={10}
				>
					{eventTypes.map((eventType) => (
						<Option key={eventType._id} value={eventType._id}>
							{eventType.name}
						</Option>
					))}
				</Select>

				<div className='d-flex flex-column align-items-center'>
					<strong>Przedział cenowy</strong>
					<Slider
						range
						value={eventsPriceRange}
						min={500}
						max={10000}
						step={500}
						onChange={handleSliderChange}
						tooltip={{
							formatter: (value) => `${value} zł`,
						}}
						style={{ width: '300px' }}
					/>
				</div>
			</section>
		</div>
	);
}

export default DjFilter;
