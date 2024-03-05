import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { Table, Button, Modal, Form, Input, Popconfirm } from 'antd';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import toast from 'react-hot-toast';

function OffersList() {
	const [offersData, setOffersData] = useState([]);
	const [editingOffer, setEditingOffer] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const dispatch = useDispatch();

	const getOffersData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get('/api/user/get-offers', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				dispatch(hideLoading());
				setOffersData(response.data.data);
				toast.success(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd pobrania ofert:', error);
		}
	};

	useEffect(() => {
		getOffersData();
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
						title='Czy na pewno chcesz usunąć tą ofertę?'
						onConfirm={() => handleDeleteOffer(record._id)}
						okText='Tak'
						cancelText='Nie'
					>
						<Button danger>Usuń</Button>
					</Popconfirm>
				</span>
			),
		},
	];

	const handleEdit = (offer) => {
		setEditingOffer(offer);
		setIsAdding(false);
		setIsModalVisible(true);
	};

	const handleSave = async () => {
		try {
			dispatch(showLoading());
			if (isAdding) {
				const response = await axiosInstance.post(
					'/api/admin/add-offer',
					{ name: editingOffer.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingOffer(null);
					getOffersData();
					toast.success(response.data.message);
				}
			} else {
				const response = await axiosInstance.put(
					`/api/admin/edit-offer/${editingOffer._id}`,
					{ name: editingOffer.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingOffer(null);
					getOffersData();
					toast.success(response.data.message);
				}
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd edycji/dodawania oferty:', error);
			toast.error(error.message);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setEditingOffer(null);
		setIsAdding(false);
	};

	const handleAdd = () => {
		setIsAdding(true);
		setEditingOffer({ name: '' });
		setIsModalVisible(true);
	};

	const handleDeleteOffer = async (offerId) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.delete(
				`/api/admin/delete-offer/${offerId}`,
				{
					headers: {
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					},
				}
			);
			if (response.data.success) {
				dispatch(hideLoading());
				toast.success(response.data.message);
				setOffersData((prevData) =>
					prevData.filter((offer) => offer._id !== offerId)
				);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd usuwania oferty:', error);
		}
	};

	return (
		<div>
			<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
				Dodaj
			</Button>
			<Table
				dataSource={offersData}
				columns={columns}
				style={{ overflowX: 'auto' }}
			/>
			<Modal
				title={isAdding ? 'Dodaj ofertę' : 'Edytuj ofertę'}
				visible={isModalVisible}
				onOk={handleSave}
				onCancel={handleCancel}
				cancelText='Anuluj'
				okText='Potwierdź'
			>
				<Form>
					<Form.Item label='Nazwa'>
						<Input
							value={editingOffer?.name}
							onChange={(e) =>
								setEditingOffer((prev) => ({ ...prev, name: e.target.value }))
							}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

export default OffersList;
