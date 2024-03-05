import { Modal } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import toast from 'react-hot-toast';
import TextArea from 'antd/es/input/TextArea';
import axiosInstance from '../../services/axiosInstance';
import moment from 'moment';

function CancelBookingModal({
	booking,
	reloadData,
	showCancelModal,
	setShowCancelModal,
}) {
	const dispatch = useDispatch();
	const [cancellationReason, setCancellationReason] = useState('');
	const { user } = useSelector((state) => state.user);

	const cancelBooking = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/cancel-booking',
				{
					bookingId: booking._id,
					reason: cancellationReason,
					userId: user._id,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			toast.success(response.data.message);
			reloadData();
			setShowCancelModal(false);
			setCancellationReason('');
			dispatch(hideLoading());
		} catch (error) {
			console.log(error);
			dispatch(hideLoading());
			setShowCancelModal(false);
			toast.error(error.response?.data.message || 'Błąd anulowania rezerwacji');
		}
	};

	return (
		<Modal
			open={showCancelModal}
			onCancel={() => setShowCancelModal(false)}
			title='Anuluj Rezerwację'
			onOk={cancelBooking}
			okText='Anuluj rezerwacje'
			cancelText='Przerwij'
		>
			<div className='d-flex flex-column gap-3'>
				<p className='m-0'>
					Czy na pewno chcesz anulować rezerwacje w dniu:{' '}
					{moment(booking.startDate).format('DD-MM-YYYY')}? <br />{' '}
					<strong>
						Pamiętaj, aby również poinformować DJ-a osobiście o podjętej
						decyzji!
					</strong>
				</p>
				<TextArea
					value={cancellationReason}
					onChange={(e) => setCancellationReason(e.target.value)}
					placeholder='Podaj powód anulowania rezerwacji...'
					cols='30'
					rows='10'
				></TextArea>
			</div>
		</Modal>
	);
}

export default CancelBookingModal;
