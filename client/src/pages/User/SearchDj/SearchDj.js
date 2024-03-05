import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import Layout from '../../../components/Layout/Layout';
import Dj from '../../../components/DjCard/DjCard';
import { Typography, Skeleton } from 'antd';
import DjFilter from '../../../components/DjFilter/DjFilter';
import '../SearchDj/searchDjStyles.css';

const { Text } = Typography;

function SearchDj() {
	const [djs, setDjs] = useState([]);
	const [filteredDjs, setFilteredDjs] = useState([]);
	const [djCount, setDjCount] = useState(0);
	const [filtersActive, setFiltersActive] = useState(false);

	const getData = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-all-djs', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});

			if (response.data.success) {
				setDjs(response.data.data);
				setFilteredDjs(response.data.data);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const getDjCount = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-dj-count', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});

			if (response.data.success) {
				setDjCount(response.data.count);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const filterDjs = (
		term,
		field,
		city,
		djsFilteredByLocalization,
		selectedMusicGenre = [],
		selectedOffer = [],
		selectedSpecialization = [],
		eventsPriceRange = [],
		ratingRange = []
	) => {
		let arrayToSearch = djsFilteredByLocalization;
		if (city === '') arrayToSearch = djs;

		const filteredData = arrayToSearch.filter((dj) => {
			const djPriceRange = dj?.eventsPrice?.split(' - ').map(Number) || [0, 0];
			const isPriceInRange =
				eventsPriceRange.length === 0 ||
				(djPriceRange[0] <= eventsPriceRange[1] &&
					djPriceRange[1] >= eventsPriceRange[0]);

			const value = dj[field];
			const isTermMatched =
				value && value.toString().toLowerCase().includes(term.toLowerCase());

			const hasSelectedMusicGenre =
				selectedMusicGenre.length === 0 ||
				(dj?.musicGenres &&
					selectedMusicGenre.every((genre) => dj.musicGenres.includes(genre)));

			const hasSelectedOffer =
				selectedOffer.length === 0 ||
				(dj?.offers &&
					selectedOffer.every((offer) => dj.offers.includes(offer)));

			const hasSelectedSpecialization =
				selectedSpecialization.length === 0 ||
				(dj?.eventTypes &&
					selectedSpecialization.every((specialization) =>
						dj.eventTypes.includes(specialization)
					));

			const djRating = parseFloat(dj?.averageRating || 0);
			const minRating = parseFloat(ratingRange[0]);
			const maxRating = parseFloat(ratingRange[1]);

			const isRatingInRange =
				ratingRange.length === 0 ||
				(djRating >= minRating && djRating <= maxRating);

			return (
				isPriceInRange &&
				isTermMatched &&
				hasSelectedMusicGenre &&
				hasSelectedOffer &&
				hasSelectedSpecialization &&
				isRatingInRange
			);
		});

		setFilteredDjs(filteredData);

		const isFilterActive =
			term !== '' ||
			city !== '' ||
			selectedMusicGenre.length > 0 ||
			selectedOffer.length > 0 ||
			selectedSpecialization.length > 0 ||
			eventsPriceRange.length > 0 ||
			ratingRange.length > 0;

		setFiltersActive(isFilterActive);
	};

	useEffect(() => {
		getData();
		getDjCount();
	}, []);
	return (
		<Layout>
			<h1 className='page-title'>DJ-e</h1>
			<hr />

			<div className='search-dj'>
				<header>
					<h2 className='mb-2'>Wybór należy do Ciebie 🎧</h2>
				</header>

				<section>
					{djs.length ? (
						<DjFilter onSearch={filterDjs} djs={djs}></DjFilter>
					) : (
						<Skeleton active />
					)}
				</section>

				<section className='render-djs'>
					<div className='mt-3 result'>
						<Text
							strong
							style={{
								fontSize: '1rem',
								textAlign: 'center',
								marginTop: '10px',
							}}
						>
							{filtersActive ? (
								<>Wyniki filtrowania: {filteredDjs.length}</>
							) : (
								<>Znaleziono: {djCount}</>
							)}
						</Text>
					</div>

					{!djs.length
						? Array.from({ length: djCount }).map((_, index) => (
								<div className='render-djs' key={index}>
									<Skeleton active />
								</div>
						  ))
						: filteredDjs.map((dj) => (
								<div className='dj-container' key={dj._id}>
									<Dj dj={dj} />
								</div>
						  ))}
				</section>
			</div>
		</Layout>
	);
}

export default SearchDj;
