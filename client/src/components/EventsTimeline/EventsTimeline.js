import React, { useState, useEffect } from 'react';
import { Timeline, Progress, Button, Tabs, Skeleton, Empty } from 'antd';
import axiosInstance from '../../services/axiosInstance';
import moment from 'moment';
import 'moment-timezone';
import BookingDetailsModal from '../BookingDetailsModal/BookingDetailsModal';
import Layout from '../Layout/Layout';
import '../EventsTimeline/eventsTimelineStyles.css';
import { getRemainingTime } from '../../../src/services/utils';

const { TabPane } = Tabs;

const EventsTimeline = React.memo(() => {
	const [bookings, setBookings] = useState([]);
	const [progress, setProgress] = useState(0);
	const [nextEvent, setNextEvent] = useState(null);
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);
	const [activeTab, setActiveTab] = useState('orders');
	const [loading, setLoading] = useState(true);
	const [remainingTime, setRemainingTime] = useState(null);

	const calculateProgress = (nextEvent) => {
		const currentTime = moment();
		if (nextEvent) {
			const createdDateTime = moment(nextEvent.createdAt);
			const startDateTime = moment(nextEvent.startDate);
			const totalDiff = startDateTime.diff(createdDateTime);
			const elapsedDiff = currentTime.diff(createdDateTime);

			const calculatedProgress = ((elapsedDiff / totalDiff) * 100).toFixed(2);
			const clampedProgress = Math.max(
				0,
				Math.min(100, parseFloat(calculatedProgress))
			);
			setProgress(clampedProgress);
		}
	};

	useEffect(() => {
		const getBookingsData = async () => {
			try {
				setLoading(true);
				const response = await axiosInstance.get(
					'/api/dj/get-bookings-by-dj-id',
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				);
				if (response.data.success) {
					const sortedBookings = response.data.data
						.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
						.filter((booking) => booking?.status === 'Potwierdzona');
					setBookings(sortedBookings);
				}
			} catch (error) {
				console.error('Błąd pobrania rezerwacji: ', error);
			} finally {
				setLoading(false);
			}
		};

		getBookingsData();

		const bookingsIntervalId = setInterval(() => {
			getBookingsData();
		}, 300000);

		return () => clearInterval(bookingsIntervalId);
	}, []);

	useEffect(() => {
		const progressIntervalId = setInterval(() => {
			if (nextEvent) {
				calculateProgress(nextEvent);
			}
		}, 1000);

		return () => clearInterval(progressIntervalId);
	}, [nextEvent]);

	useEffect(() => {
		if (bookings.length > 0) {
			const nextEvent = bookings.find(
				(booking) => booking.status === 'Potwierdzona'
			);

			setNextEvent(nextEvent);

			if (nextEvent) {
				const [countdownText, isEnded, duration] = getRemainingTime(
					nextEvent.startDate
				);

				setRemainingTime(countdownText);

				const remainingTimeIntervalId = setInterval(() => {
					const [countdownText, isEnded, duration] = getRemainingTime(
						nextEvent.startDate
					);
					setRemainingTime(countdownText);
				}, 1000);

				return () => clearInterval(remainingTimeIntervalId);
			}
		}
	}, [bookings, nextEvent]);

	const handleDetailsModalOpen = () => {
		setDetailsModalVisible(true);
	};

	const handleDetailsModalClose = () => {
		setDetailsModalVisible(false);
	};

	const handleTabChange = (key) => {
		setActiveTab(key);
	};

	return (
		<Layout>
			<h1 className='page-title'>Nadchodzące imprezy</h1>

			<section className='events-timeline'>
				<Tabs activeKey={activeTab} onChange={handleTabChange}>
					<TabPane tab='Zlecenia' key='orders'>
						<div className='timeline'>
							{loading ? (
								<Skeleton active />
							) : bookings.length > 0 ? (
								<>
									<Timeline mode='left' className='timeline-progress-container'>
										{bookings.map((booking) => (
											<Timeline.Item
												key={booking._id}
												label={`${moment(booking?.startDate).format(
													'DD-MM-YYYY HH:mm'
												)} - ${moment(booking?.endDate).format('HH:mm')}`}
											>
												<div>
													<p>
														{booking.userInfo.firstName}{' '}
														{booking.userInfo.lastName} ({booking.partyType})
													</p>
												</div>
											</Timeline.Item>
										))}
									</Timeline>

									<section className='timeline-details'>
										<Progress percent={progress} />
										{remainingTime && (
											<div className='remaining-time'>
												<p>Czas do rozpoczęcia kolejnej imprezy:</p>
												<h5>{remainingTime}</h5>
											</div>
										)}
										{progress < 100 && (
											<div className='statistic-countdown d-flex flex-column align-items-center mt-5 gap-4'>
												<Button onClick={handleDetailsModalOpen}>
													Szczegóły
												</Button>
											</div>
										)}
										<BookingDetailsModal
											modalOpen={detailsModalVisible}
											handleCancel={handleDetailsModalClose}
											booking={nextEvent}
										/>
									</section>
								</>
							) : (
								<Empty description='Brak nadchodzących imprez.' />
							)}
						</div>
					</TabPane>
				</Tabs>
			</section>
		</Layout>
	);
});

export default EventsTimeline;
