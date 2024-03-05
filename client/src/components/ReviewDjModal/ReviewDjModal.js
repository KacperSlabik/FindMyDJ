import { Modal, Rate, message } from 'antd';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import axiosInstance from '../../services/axiosInstance';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function ReviewDjModal({
	dj,
	reloadData,
	showReviewModal,
	setShowReviewModal,
	initialData,
	setInitialData,
}) {
	const params = useParams();
	const dispatch = useDispatch();
	const [rating, setRating] = useState(
		initialData?.rating ? initialData?.rating : 0
	);
	const [comment, setComment] = useState(
		initialData?.comment ? initialData?.comment : ''
	);

	const addReview = async () => {
		if (rating < 1) {
			message.error('Minimalna ocena to 1!');
			return;
		}

		if (!comment.trim()) {
			message.error('Komentarz nie może być pusty!');
			return;
		}

		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/reviews/add-dj-review',
				{
					userId: params.userId,
					djId: params.djId,
					rating,
					comment,
					reviewId: initialData._id,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			toast.success(response.data.message);
			reloadData();
			setShowReviewModal(false);
			setInitialData({});
			dispatch(hideLoading());
		} catch (error) {
			dispatch(hideLoading());
			setInitialData({});
			setShowReviewModal(false);
			toast.error(error.response.data.message);
		}
	};

	return (
		<Modal
			open={showReviewModal}
			onCancel={() => setShowReviewModal(false)}
			title='Oceń DJ-a i wystaw komentarz'
			cancelText='Anuluj'
			okText='Potwierdź'
			onOk={addReview}
		>
			<div className='d-flex flex-column gap-3'>
				<div className='d-flex flex-column'>
					<span>
						Prosimy o szczerość w wyrażaniu opinii oraz o zachowanie
						odpowiedniego tonu i kultury słowa w wypowiedziach.
					</span>
				</div>
				<div className='mt-2 gap-2'>
					<h4>
						{dj.firstName} {dj.lastName} ({dj.alias})
					</h4>
					<div className='d-flex flex-row align-items-center gap-2'>
						Ocena:
						<Rate
							value={rating}
							onChange={(value) => setRating(value)}
							allowHalf
							style={{ color: 'orange' }}
						/>
					</div>
				</div>

				<textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					placeholder='Napisz komentarz...'
					cols='30'
					rows='10'
				></textarea>
			</div>
		</Modal>
	);
}

export default ReviewDjModal;
