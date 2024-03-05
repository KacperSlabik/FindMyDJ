import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm } from 'antd';
import axiosInstance from '../../../services/axiosInstance';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import toast from 'react-hot-toast';

function EventTypesList() {
	const [eventTypesData, setEventTypesData] = useState([]);
	const [editingEventType, setEditingEventType] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const dispatch = useDispatch();

	const getEventTypesData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get('/api/user/get-event-types', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				dispatch(hideLoading());
				setEventTypesData(response.data.data);
				toast.success(response.data.message);
			}
		} catch (error) {
			console.error('Błąd pobrania typów imprez:', error);
		}
	};

	useEffect(() => {
		getEventTypesData();
	}, []);

	const columns = [
		{
			title: 'ID',
			dataIndex: '_id',
			key: '_id',
		},
		{
			title: 'Nazwa',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Akcje',
			key: 'actions',
			render: (_, record) => (
				<span className='d-flex gap-2'>
					<Button onClick={() => handleEdit(record)}>Edytuj</Button>
					<Popconfirm
						title='Czy na pewno chcesz usunąć ten typ imprezy?'
						onConfirm={() => handleDeleteEventType(record._id)}
						okText='Tak'
						cancelText='Nie'
					>
						<Button danger>Usuń</Button>
					</Popconfirm>
				</span>
			),
		},
	];

	const handleEdit = (eventType) => {
		setEditingEventType(eventType);
		setIsAdding(false);
		setIsModalVisible(true);
	};

	const handleSave = async () => {
		try {
			dispatch(showLoading());
			if (isAdding) {
				const response = await axiosInstance.post(
					'/api/admin/add-event-type',
					{ name: editingEventType.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingEventType(null);
					getEventTypesData();
					toast.success(response.data.message);
				}
			} else {
				const response = await axiosInstance.put(
					`/api/admin/edit-event-type/${editingEventType._id}`,
					{ name: editingEventType.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingEventType(null);
					getEventTypesData();
					toast.success(response.data.message);
				}
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd edycji/dodawania typu imprezy:', error);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setEditingEventType(null);
		setIsAdding(false);
	};

	const handleAdd = () => {
		setIsAdding(true);
		setEditingEventType({ name: '' });
		setIsModalVisible(true);
	};

	const handleDeleteEventType = async (eventTypeId) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.delete(
				`/api/admin/delete-event-type/${eventTypeId}`,
				{
					headers: {
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					},
				}
			);
			if (response.data.success) {
				dispatch(hideLoading());
				toast.success(response.data.message);
				setEventTypesData((prevData) =>
					prevData.filter((eventType) => eventType._id !== eventTypeId)
				);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd usuwania typu imprezy:', error);
		}
	};

	return (
		<div>
			<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
				Dodaj
			</Button>
			<Table
				dataSource={eventTypesData}
				columns={columns}
				style={{ overflowX: 'auto' }}
			/>
			<Modal
				title={isAdding ? 'Dodaj typ imprezy' : 'Edytuj typ imprezy'}
				visible={isModalVisible}
				onOk={handleSave}
				onCancel={handleCancel}
				cancelText='Anuluj'
				okText='Potwierdź'
			>
				<Form>
					<Form.Item label='Nazwa'>
						<Input
							value={editingEventType?.name}
							onChange={(e) =>
								setEditingEventType((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

export default EventTypesList;
