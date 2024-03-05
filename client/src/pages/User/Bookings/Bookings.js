import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../components/Layout/Layout';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../../services/axiosInstance';
import { Table, Tag, Tabs, Button, Modal, Empty } from 'antd';
import { getRemainingTime } from '../../../services/utils';
import BookingDetailsModal from '../../../components/BookingDetailsModal/BookingDetailsModal';
import moment from 'moment';
import CancelBookingModal from '../../../components/CancelBookingModal/CancelBookingModal';
import DjDetailsModal from '../../../components/DjDetailsModal/DjDetailsModal';

const { TabPane } = Tabs;

const URL = 'ws://localhost:5000';

function Bookings() {
	const [bookings, setBookings] = useState([]);
	const [selectedBooking, setSelectedBooking] = useState({});
	const [bookingDetailsModalOpen, setBookingDetailsModalOpen] = useState(false);
	const [djDetailsModalOpen, setDjDetailsModalOpen] = useState(false);
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);
	const [toReload, setToReload] = useState(false);

	const handleCancelBooking = (booking) => {
		setSelectedBooking(booking);
		setCancelModalOpen(true);
	};

	const handleBookingModalOpen = (booking) => {
		setBookingDetailsModalOpen(true);
		setSelectedBooking(booking);
	};

	const handleDjModalOpen = (booking) => {
		setDjDetailsModalOpen(true);
		setSelectedBooking(booking);
	};

	const handleBookingModalCancel = () => {
		setBookingDetailsModalOpen(false);
	};

	const handleDjModalCancel = () => {
		setDjDetailsModalOpen(false);
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

	const getBookingsData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get(
				'/api/user/get-bookings-by-user-id',
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				setBookings(response.data.data);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
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
			toast.error('Błąd zmiany statusu konta DJ-a');
			dispatch(hideLoading());
		}
	};

	useEffect(() => {
		const intervalId = setInterval(() => {
			refreshTime();
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

	const refreshTime = () => {
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

				return {
					...booking,
					timeText,
					isEnded,
				};
			});

			return updatedBookings;
		});
	};

	useEffect(() => {
		const intervalId = setInterval(() => {
			refreshTime();
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		getBookingsData();
	}, []);

	const columns = [
		{
			title: 'ID',
			dataIndex: '_id',
		},
		{
			title: 'DJ',
			dataIndex: 'name',
			render: (text, record) => (
				<span>
					<div className='d-flex align-items-center' style={{ gap: '10px' }}>
						<Button onClick={() => handleDjModalOpen(record)}>Szczegóły</Button>
					</div>
				</span>
			),
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
			render: (text, record) => (
				<div className='d-flex' style={{ gap: '10px' }}>
					<>
						<Button onClick={() => handleBookingModalOpen(record)}>
							Szczegóły
						</Button>
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
										? 'Nie możesz anulować rezerwacji, ponieważ zostało mniej niż  dni do jej rozpoczęcia.'
										: ''
								}
							>
								Anuluj
							</Button>
						)}
					</>
				</div>
			),
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
					case 'Niepotwierdzona':
						tagType = 'error';
						break;
					case 'Odrzucona':
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
			<h1 className='page-title'>Rezerwacje</h1>
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

			<DjDetailsModal
				modalOpen={djDetailsModalOpen}
				handleCancel={handleDjModalCancel}
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
}

export default Bookings;
