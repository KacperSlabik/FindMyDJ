import { Tabs, Empty } from 'antd';
import axiosInstance from '../../../services/axiosInstance';
import React from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import { setUser } from '../../../redux/userSlice';
import '../Notifications/notificationsStyles.css';
import moment from 'moment';

function Notifications() {
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const markNotificationAsSeen = async (createdAt) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/mark-notification-as-seen',
				{ userId: user._id, createdAt },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				dispatch(setUser(response.data.data));
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error('Coś poszło nie tak');
		}
	};

	const markAllAsSeen = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/mark-all-notifications-as-seen',
				{ userId: user._id },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				dispatch(setUser(response.data.data));
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	const deleteAll = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/delete-all-notifications',
				{ userId: user._id },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				dispatch(setUser(response.data.data));
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	return (
		<Layout>
			<h1 className='page-title'>Powiadomienia</h1>

			<section className='notifications'>
				<Tabs>
					<Tabs.TabPane tab='Nowe' key={1}>
						<div className='d-flex justify-content-end'>
							<h1 className='anchor' onClick={() => markAllAsSeen()}>
								Odczytaj wszystkie
							</h1>
						</div>

						{user?.unseenNotifications.length > 0 ? (
							user?.unseenNotifications.map((notification) => (
								<div
									className='card p-2 mt-2'
									onClick={() =>
										markNotificationAsSeen(
											notification.createdAt,
											navigate(notification.onClickPath)
										)
									}
								>
									<div className='card-text d-flex flex-row justify-content-between'>
										<span>{notification.message}</span>
										<span>
											<strong>
												({moment(notification.createdAt).fromNow()})
											</strong>
										</span>
									</div>
								</div>
							))
						) : (
							<Empty description='Brak nowych powiadomień.' />
						)}
					</Tabs.TabPane>
					<Tabs.TabPane tab='Przeczytane' key={2}>
						<div className='d-flex justify-content-end'>
							<h1 className='anchor' onClick={() => deleteAll()}>
								Usuń przeczytane
							</h1>
						</div>
						{user?.seenNotifications.length > 0 ? (
							user?.seenNotifications.map((notification) => (
								<div
									className='card p-2 mt-2'
									onClick={() => navigate(notification.onClickPath)}
								>
									<div className='card-text d-flex flex-row justify-content-between'>
										<span>{notification.message}</span>
										<span>
											<strong>
												({moment(notification.createdAt).fromNow()})
											</strong>
										</span>
									</div>
								</div>
							))
						) : (
							<Empty description='Brak przeczytanych powiadomień.' />
						)}
					</Tabs.TabPane>
				</Tabs>
			</section>
		</Layout>
	);
}

export default Notifications;
