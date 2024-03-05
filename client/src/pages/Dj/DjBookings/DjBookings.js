import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../components/Layout/Layout.js';
import { showLoading, hideLoading } from '../../../redux/alertsSlice.js';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../services/axiosInstance.js';
import { Button, Modal, Table, Tag, Tabs, Empty } from 'antd';
import moment from 'moment';
import { getRemainingTime } from '../../../services/utils.js';
import BookingDetailsModal from '../../../components/BookingDetailsModal/BookingDetailsModal.js';
import CancelBookingModal from '../../../components/CancelBookingModal/CancelBookingModal.js';
import { useNavigate } from 'react-router-dom';
import UserDetailsModal from '../../../components/UserDetailsModal/UserDetailsModal.js';

const { TabPane } = Tabs;

const URL = 'ws://localhost:5000';

const DjBookings = () => {
	const [bookings, setBookings] = useState([]);
	const [selectedBooking, setSelectedBooking] = useState({});

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [bookingDetailsModalOpen, setBookingDetailsModalOpen] = useState(false);
	const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
	const [cancelModalOpen, setCancelModalOpen] = useState(false);

	const { user } = useSelector((state) => state.user);
	const [toReload, setToReload] = useState(false);

	const handleCancelBooking = (booking) => {
		setSelectedBooking(booking);
		setCancelModalOpen(true);
	};

	useEffect(() => {
		const websocket = new WebSocket(URL);

		if (user) {
			websocket.onopen = () => {
				const data = { msg_type: 'INIT', user_id: user._id };
				websocket.send(JSON.stringify(data));
			};

			websocket.onmessage = (event) => {
				const message = JSON.parse(event.data);
				if (message.msg === 'reload') {
					setToReload(true);
				}
			};
		}
	}, [user]);

	const handleBookingModalOpen = (booking) => {
		setBookingDetailsModalOpen(true);
		setSelectedBooking(booking);
	};

	const handleUserModalOpen = (booking) => {
		setUserDetailsModalOpen(true);
		setSelectedBooking(booking);
	};

	const handleBookingModalCancel = () => {
		setBookingDetailsModalOpen(false);
	};

	const handleUserModalCancel = () => {
		setUserDetailsModalOpen(false);
	};

	const getBookingsData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get(
				'/api/dj/get-bookings-by-dj-id',
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());

			if (response.data.success) {
				toast.success(response.data.message);
				const bookingsData = response.data.data;

				for (const record of bookingsData) {
					const [timeText, isEnded] = getRemainingTime(record.createdAt, 2);
					if (isEnded && record.status === 'Oczekuje') {
						await changeBookingStatus(record, 'Niepotwierdzona');
					}
				}

				setBookings(bookingsData);
			}
		} catch (error) {
			dispatch(hideLoading());

			if (error.response && error.response.status === 401) {
				console.log('Błąd:', error.response);

				navigate('/login');
			} else {
			}
		}
	};

	const changeBookingStatus = async (record, status) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/dj/change-booking-status',
				{ bookingId: record._id, status: status },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			if (response.data.success) {
				dispatch(hideLoading());
				await getBookingsData();
				toast.success(response.data.message);
			}
		} catch (error) {
			toast.error('Błąd zmiany statusu konta DJa');
			dispatch(hideLoading());
		}
	};

	useEffect(() => {
		const intervalId = setInterval(() => {
			setBookings((prevBookings) => {
				const updatedBookings = prevBookings.map((booking) => {
					const [timeText, isEnded] = getRemainingTime(booking.createdAt, 2);

					if (!booking.isUpdated && isEnded && booking.status === 'Oczekuje') {
						changeBookingStatus(booking, 'Niepotwierdzona');
						return { ...booking, isUpdated: true };
					}

					if (
						!booking.isUpdated &&
						booking.status === 'Trwająca' &&
						moment(booking.endDate).isBefore(moment())
					) {
						changeBookingStatus(booking, 'Zakończona');
						return { ...booking, isUpdated: true };
					}

					if (
						!booking.isUpdated &&
						booking.status === 'Potwierdzona' &&
						moment(booking.startDate).isBefore(moment())
					) {
						changeBookingStatus(booking, 'Trwająca');
						return { ...booking, isUpdated: true };
					}

					return {
						...booking,
						timeText,
						isEnded,
					};
				});

				return updatedBookings;
			});
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const renderTable = (status = '') => {
		let filteredBookings;
		if (status === '') filteredBookings = bookings;
		else
			filteredBookings = bookings.filter(
				(booking) => booking.status === status
			);

		const columnsWithWidth = columns.map((column) => ({
			...column,
			width: column.width || 150,
		}));

		return (
			<Table
				columns={columnsWithWidth}
				dataSource={filteredBookings}
				rowKey='_id'
				scroll={{ x: true }}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_DEFAULT}
							description='Brak danych.'
						/>
					),
				}}
			/>
		);
	};

	useEffect(() => {
		const handleBookingStatusChange = async () => {
			try {
				dispatch(showLoading());
				const response = await axiosInstance.get(
					'/api/dj/get-bookings-by-dj-id',
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				);
				dispatch(hideLoading());
				if (response.data.success) {
					toast.success(response.data.message);
					const bookingsData = response.data.data;

					for (const record of bookingsData) {
						const [timeText, isEnded] = getRemainingTime(record.createdAt, 2);
						if (isEnded && record.status === 'Oczekuje') {
							await changeBookingStatus(record, 'Niepotwierdzona');
						}
					}

					setBookings(bookingsData);
				}
			} catch (error) {
				console.log(error);
				dispatch(hideLoading());
			}
		};

		handleBookingStatusChange();
	}, []);

	const columns = [
		{
			title: 'ID',
			dataIndex: '_id',
		},
		{
			title: 'Uzytkownik',
			dataIndex: 'name',
			render: (text, record) => (
				<div className='d-flex align-items-center' style={{ gap: '10px' }}>
					<Button onClick={() => handleUserModalOpen(record)}>Szczegóły</Button>
				</div>
			),
			sorter: {
				compare: (a, b) => a.userInfo?.firstName > b.userInfo?.firstName,
			},
		},

		{
			title: 'Data dodania',
			render: (text, record) => (
				<span>
					{moment(record.createdAt).format('DD-MM-YYYY HH:mm')}{' '}
					<span style={{ color: '#999' }}>
						<br />({moment(record.createdAt).fromNow()})
					</span>
				</span>
			),
			sorter: {
				compare: (a, b) => new Date(a.createdAt) > new Date(b.createdAt),
			},
		},
		{
			title: 'Akcje',
			render: (text, record) => {
				const [timeText] = getRemainingTime(record.createdAt, 2);

				return (
					<div className='d-flex' style={{ gap: '10px' }}>
						<>
							<Button onClick={() => handleBookingModalOpen(record)}>
								Szczegóły
							</Button>

							{record.status === 'Oczekuje' && (
								<>
									<div className='d-flex' style={{ gap: '10px' }}>
										<Button
											type='primary'
											onClick={() =>
												changeBookingStatus(record, 'Potwierdzona')
											}
										>
											Potwierdź
										</Button>

										<Button
											danger
											type='primary'
											onClick={() => changeBookingStatus(record, 'Odrzucona')}
										>
											Odrzuć
										</Button>
									</div>
								</>
							)}

							{record.status === 'Potwierdzona' && (
								<Button
									danger
									type='primary'
									onClick={() => handleCancelBooking(record)}
									disabled={
										record.status === 'Potwierdzona' &&
										getRemainingTime(record.startDate, -14)[1]
									}
									title={
										record.status === 'Potwierdzona' &&
										getRemainingTime(record.startDate, -14)[1]
											? 'Nie możesz anulować rezerwacji, ponieważ zostało mniej niż 14 dni do jej rozpoczęcia.'
											: ''
									}
								>
									Anuluj
								</Button>
							)}
						</>
					</div>
				);
			},
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (text, record) => {
				let tagType = '';
				switch (text) {
					case 'Potwierdzona':
						tagType = 'success';
						break;
					case 'Trwająca':
						tagType = 'processing';
						break;
					case 'Oczekuje':
						tagType = 'warning';
						break;
					case 'Odrzucona':
						tagType = 'error';
						break;
					case 'Niepotwierdzona':
						tagType = 'error';
						break;
					default:
						tagType = 'default';
						break;
				}
				return (
					<Tag
						color={tagType}
						style={{
							height: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{text}
					</Tag>
				);
			},
		},

		{
			title: 'Czas do potwierdzenia',
			render: (text, record) => {
				const [timeText, isEnded] = getRemainingTime(record.createdAt, 2);
				return (
					<span>
						{record.status === 'Oczekuje' && !isEnded
							? timeText
							: record.status === 'Niepotwierdzona' && isEnded
							? 'Czas upłynął'
							: '-'}
					</span>
				);
			},

			sorter: {
				compare: (a, b) => {
					const [aDuration] = getRemainingTime(a.createdAt, 2);
					const [bDuration] = getRemainingTime(b.createdAt, 2);
					return aDuration > bDuration;
				},
			},
		},
		{
			title: 'Czas do anulowania',
			render: (text, record) => {
				const [timeText, isEnded] = getRemainingTime(record.startDate, -14);

				return (
					<span>
						{record.status === 'Potwierdzona' && !isEnded
							? timeText
							: record.status === 'Potwierdzona' && isEnded
							? 'Czas upłynął'
							: '-'}
					</span>
				);
			},

			sorter: {
				compare: (a, b) => {
					const [aDuration] = getRemainingTime(a.startDate, -14);
					const [bDuration] = getRemainingTime(b.startDate, -14);
					return aDuration > bDuration;
				},
			},
		},
	];

	return (
		<Layout>
			<h1 className='page-title'>Zlecenia</h1>
			<hr />

			<Tabs defaultActiveKey='2'>
				<TabPane tab='Wszystkie' key='1'>
					{renderTable()}
				</TabPane>
				<TabPane tab='Oczekujące' key='2'>
					{renderTable('Oczekuje')}
				</TabPane>
				<TabPane tab='Potwierdzone' key='3'>
					{renderTable('Potwierdzona')}
				</TabPane>
				<TabPane tab='W trakcie' key='4'>
					{renderTable('Trwająca')}
				</TabPane>
				<TabPane tab='Niepotwierdzone' key='5'>
					{renderTable('Niepotwierdzona')}
				</TabPane>
				<TabPane tab='Zakończone' key='6'>
					{renderTable('Zakończona')}
				</TabPane>
				<TabPane tab='Odrzucone' key='7'>
					{renderTable('Odrzucona')}
				</TabPane>
				<TabPane tab='Anulowane' key='8'>
					{renderTable('Anulowana')}
				</TabPane>
			</Tabs>

			<CancelBookingModal
				booking={selectedBooking}
				reloadData={getBookingsData}
				showCancelModal={cancelModalOpen}
				setShowCancelModal={setCancelModalOpen}
			/>

			<BookingDetailsModal
				modalOpen={bookingDetailsModalOpen}
				handleCancel={handleBookingModalCancel}
				booking={selectedBooking}
			/>

			<UserDetailsModal
				modalOpen={userDetailsModalOpen}
				handleCancel={handleUserModalCancel}
				booking={selectedBooking}
			/>

			<Modal
				title='Nowa zawartość strony'
				open={toReload}
				onOk={() => window.location.reload()}
				cancelButtonProps={{ style: { display: 'none' } }}
				okText='Przeładuj stronę'
			>
				Nowa zawartość dostępna! Aby ją zobaczyć, prosimy przeładuj stronę.
			</Modal>
		</Layout>
	);
};

export default DjBookings;
