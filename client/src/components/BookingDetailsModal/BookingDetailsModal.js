import React from 'react';
import { Modal, Button } from 'antd';
import moment from 'moment';
import '../BookingDetailsModal/bookingDetailsModalStyles.css';

const BookingDetailsModal = ({ modalOpen, handleCancel, booking }) => {
	const handleNavigateClick = () => {
		const addressToNavigate = `${booking.location} ${booking.address} ${booking.city} ${booking.postalCode}`;
		const formattedAddress = encodeURIComponent(addressToNavigate);

		window.open(
			`https://www.google.com/maps/search/?api=1&query=${formattedAddress}`
		);
	};

	return (
		<Modal
			title='Szczegóły rezerwacji'
			visible={modalOpen}
			onCancel={handleCancel}
			footer={null}
		>
			{booking ? (
				<div className='booking-modal'>
					<h6>Data i czas imprezy:</h6>

					<div>
						<strong>Rozpoczęcie: </strong>
						{moment(booking.startDate).format('DD-MM-YYYY HH:mm')}
					</div>
					<div>
						<strong>Zakończenie:</strong>{' '}
						{moment(booking.endDate).format('DD-MM-YYYY HH:mm')}
					</div>
					<hr />

					<h6>Lokalizacja:</h6>
					<div>
						<strong>Adres:</strong>
						{booking.location} (ul.
						{booking.address}, {booking.postalCode} {booking.city})
						<Button onClick={handleNavigateClick}>
							<span className='d-flex flex-row justify-content-center gap-2'>
								<svg viewBox='0 0 24 24' width='18' height='18'>
									<path
										d='M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z'
										fill='currentColor'
									></path>
								</svg>
								Jak dojechać?
							</span>
						</Button>
					</div>
					<hr />

					<h6>Informacje o imprezie:</h6>
					<div>
						<strong>Typ: </strong>
						{booking.partyType}
					</div>
					<div>
						<strong>Liczba gości:</strong> {booking.guests}
					</div>
					<div>
						<strong>Przedział wiekowy:</strong> {booking.ageRange}
					</div>
					<div>
						<strong>Rodzaj muzyki: </strong>
						{booking.musicGenres?.join(', ')}
					</div>
					<div>
						<strong>Dodatkowe usługi: </strong>
						<span>
							{' '}
							{booking.additionalServices?.join(', ')
								? booking.additionalServices?.join(', ')
								: '-'}
						</span>
					</div>
				</div>
			) : (
				<p>Brak danych do wyświetlenia.</p>
			)}
		</Modal>
	);
};

export default BookingDetailsModal;
