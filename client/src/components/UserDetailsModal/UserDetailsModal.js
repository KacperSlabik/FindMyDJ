import React, { useEffect, useState } from 'react';
import { Modal, Image, Skeleton } from 'antd';
import '../BookingDetailsModal/bookingDetailsModalStyles.css';
import StatusIndicator from '../StatusIndicator/StatusIndicator';
import axiosInstance from '../../services/axiosInstance';

const UserDetailsModal = ({ modalOpen, handleCancel, booking, user }) => {
	const [userData, setUserData] = useState(null);
	const [djData, setDjData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			if (user && user._id) {
				setUserData(user);
			} else if (booking && booking.userInfo) {
				const userId = booking.userInfo._id;
				try {
					const response = await axiosInstance.get(`/api/user/${userId}`, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});
					if (response.data.success) {
						setUserData(response.data.data);
					}
				} catch (error) {
					console.error(error);
				}
			}

			if (booking && booking.djInfo) {
				const djId = booking.djInfo._id;
				try {
					const response = await axiosInstance.get(`/api/dj/${djId}`, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					});
					if (response.data.success) {
						setDjData(response.data.data);
					}
				} catch (error) {
					console.error(error);
				}
			}
			setLoading(false);
		};

		fetchData();
	}, [booking, user, modalOpen]);

	if (loading) {
		return (
			<Modal
				title='Szczegóły uzytkownika'
				visible={modalOpen}
				onCancel={handleCancel}
				footer={null}
			>
				<Skeleton active />
			</Modal>
		);
	}

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

	let id = '';
	let firstName = '';
	let lastName = '';
	let profileImage = '';
	let email = '';
	let phoneNumber = '';
	let city = '';
	let postalCode = '';
	let facebook = '';
	let instagram = '';
	let activeSession = '';

	if (userData) {
		id = userData._id;
		firstName = userData.firstName;
		lastName = userData.lastName;
		profileImage = userData.profileImage;
		email = userData.email;
		phoneNumber = userData.phoneNumber;
		city = userData.city;
		postalCode = userData.postalCode;
		facebook = userData.facebook;
		instagram = userData.instagram;
		activeSession = userData.activeSession;
	}

	profilePicture = (
		<Image
			src={profileImage}
			className='rounded'
			alt={'Zdjęcie użytkownika'}
			style={{ height: '200px' }}
			mask='Podgląd'
		/>
	);

	const isOnline = userData && userData.activeSessions?.[0]?.token;
	const lastActiveSession =
		userData && userData.activeSessions?.[0]?.lastModified;

	return (
		<Modal
			title='Szczegóły uzytkownika'
			visible={modalOpen}
			onCancel={() => {
				setUserData({});
				handleCancel();
			}}
			footer={null}
		>
			{userData ? (
				<div className='booking-modal'>
					<h6>Dane:</h6>

					<div className='d-flex flex-column align-items-center mb-4'>
						<strong>Zdjęcie profilowe: </strong>
						{profilePicture}
					</div>

					<div>
						<strong>Status:</strong>
						<StatusIndicator
							isOnline={isOnline}
							lastActiveSession={lastActiveSession}
						/>
					</div>

					<div>
						<strong>ID:</strong>
						{id}
					</div>

					<div>
						<strong>Imię i nazwisko: </strong>
						{firstName} {lastName}
					</div>

					<div>
						<strong>E-mail: </strong>
						{email}
					</div>

					<div>
						<strong>Numer telefonu: </strong>
						{phoneNumber}
					</div>

					<div>
						<strong>Miejscowość: </strong>
						{city}
					</div>

					<div>
						<strong>Kod pocztowy: </strong>
						{postalCode}
					</div>

					<div>
						<strong>Facebook: </strong>
						{facebook && (
							<a href={facebook} target='_blank' rel='noopener noreferrer'>
								{facebook}
							</a>
						)}
					</div>

					<div>
						<strong>Instagram: </strong>
						{instagram ? (
							<a href={instagram} target='_blank' rel='noopener noreferrer'>
								{instagram}
							</a>
						) : (
							'-'
						)}
					</div>
				</div>
			) : (
				<p>Brak danych do wyświetlenia.</p>
			)}
		</Modal>
	);
};

export default UserDetailsModal;
