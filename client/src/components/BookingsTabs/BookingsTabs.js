import React from 'react';
import { Table, Tabs } from 'antd';

const { TabPane } = Tabs;

const BookingsTabs = ({ bookings, handleModalOpen, columns }) => {
	const renderTable = (status) => {
		const filteredBookings = bookings.filter(
			(booking) => booking.status === status
		);
		return (
			<Table columns={columns} dataSource={filteredBookings} rowKey='_id' />
		);
	};

	return (
		<Tabs defaultActiveKey='1'>
			<TabPane tab='Oczekujące' key='1'>
				{renderTable('Oczekujące')}
			</TabPane>
			<TabPane tab='Potwierdzone' key='2'>
				{renderTable('Potwierdzona')}
			</TabPane>
			<TabPane tab='Niepotwierdzone' key='3'>
				{renderTable('Niepotwierdzona')}
			</TabPane>
			<TabPane tab='Odrzucone' key='4'>
				{renderTable('Odrzucona')}
			</TabPane>
		</Tabs>
	);
};

export default BookingsTabs;
