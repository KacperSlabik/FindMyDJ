import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import '../BookingDetailsModal/bookingDetailsModalStyles.css';
import axiosInstance from '../../services/axiosInstance';

const ApplyDjDetailsModal = ({ modalOpen, handleCancel, dj }) => {
	const [setDjMusicGenres] = useState([]);
	const [setDjOffers] = useState([]);
	const [djEventTypes, setDjEventTypes] = useState([]);

	const getMusicGenres = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-music-genres', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setDjMusicGenres(response.data.data);
			}
		} catch (error) {}
	};

	const getOffers = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-offers', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setDjOffers(response.data.data);
			}
		} catch (error) {}
	};

	const getEventTypes = async () => {
		try {
			const response = await axiosInstance.get('/api/user/get-event-types', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				setDjEventTypes(response.data.data);
			}
		} catch (error) {}
	};

	const findNamesByIds = (ids, data) => {
		if (!data) {
			return [];
		}

		return ids.map((id) => {
			const item = data.find((item) => item._id === id);
			return item ? item.name : '';
		});
	};

	useEffect(() => {
		getMusicGenres();
		getOffers();
		getEventTypes();
	}, []);

	return (
		<Modal
			title='Szczegóły aplikacji DJ-a'
			visible={modalOpen}
			onCancel={handleCancel}
			footer={null}
		>
			{dj ? (
				<div className='booking-modal'>
					<h6>Dane:</h6>

					<div>
						<strong>Alias: </strong>
						{dj.alias}
					</div>

					<div>
						<strong>Miasto: </strong>
						{dj.city}
					</div>

					<div>
						<strong>NIP: </strong>
						{dj.companyTIN}
					</div>

					<div>
						<strong>Doświadczenie: </strong>
						{dj.experience}
					</div>

					<div>
						<strong>Specjalizacja: </strong>
						{dj.eventTypes ? (
							<div>
								{findNamesByIds(dj.eventTypes, djEventTypes).join(', ')}
							</div>
						) : (
							<div>No specjalizacja available</div>
						)}
					</div>

					<div>
						<strong>Opis DJ-a: </strong>
						{dj.djDescription}
					</div>

					<div>
						<strong>Facebook: </strong>
						<a href={dj.facebook} target='_blank'>
							{dj.facebook}
						</a>
					</div>

					<div>
						<strong>Instagram: </strong>
						<a href={dj.instagram} target='_blank'>
							{dj.instagram ? dj.youtube : '-'}
						</a>
					</div>

					<div>
						<strong>YouTube: </strong>
						<a href={dj.youtube} target='_blank'>
							{dj.youtube ? dj.youtube : '-'}
						</a>
					</div>

					<div>
						<strong>TikTok: </strong>
						<a href={dj.tiktok} target='_blank'>
							{dj.tiktok ? dj.tiktok : '-'}
						</a>
					</div>
				</div>
			) : (
				<p>Brak danych do wyświetlenia.</p>
			)}
		</Modal>
	);
};

export default ApplyDjDetailsModal;
