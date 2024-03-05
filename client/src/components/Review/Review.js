import { Button, Rate, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const { Text } = Typography;

export default function Review({ review, onFinish }) {
  const { user } = useSelector((state) => state.user);

  const handleLike = async (reviewId, userId) => {
    try {
      const data = await axiosInstance.post(
        `/api/reviews/like-review/${reviewId}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success(data.data.message);
      onFinish();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleDislike = async (reviewId, userId) => {
    try {
      const data = await axiosInstance.post(
        `/api/reviews/dislike-review/${reviewId}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success(data.data.message);
      onFinish();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div key={review?._id} className="d-flex comment book-dj-two-columns">
      <aside className="comment-left-col">
        <h5>
          {review?.userId?.firstName} {review?.userId?.lastName}
        </h5>
        <div className="comment-rate d-flex flex-row align-items-center">
          Ocena:
          <Rate allowHalf disabled value={review.rating} style={{ color: 'orange', fontSize: '16px' }} />({review.rating})
        </div>
        <Text>{review?.comment}</Text>
      </aside>
      <aside className="comment-right-col">
        <span>{moment(review.createdAt).format('DD-MM-YYYY HH:mm')}</span>

        <span className="like-dislike-section">
          <div className="like-button">
            <Button className="primary-button like-dislike-button" onClick={() => handleLike(review._id, user._id)}>
              <i className="ri-thumb-up-fill"></i>
              <span>{review.likes.length}</span>
            </Button>
          </div>

          <div className="dislike-button">
            <Button className="primary-button like-dislike-button" onClick={() => handleDislike(review._id, user._id)}>
              <i className="ri-thumb-down-fill"></i>
              <span>{review.dislikes.length}</span>
            </Button>
          </div>
        </span>
      </aside>
    </div>
  );
}
