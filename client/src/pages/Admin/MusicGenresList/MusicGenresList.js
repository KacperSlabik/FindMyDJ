import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm } from 'antd';
import axiosInstance from '../../../services/axiosInstance';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../../redux/alertsSlice';
import toast from 'react-hot-toast';

function MusicGenresList() {
	const [musicGenresData, setMusicGenresData] = useState([]);
	const [editingMusicGenre, setEditingMusicGenre] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const dispatch = useDispatch();

	const getMusicGenresData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get('/api/user/get-music-genres', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});
			if (response.data.success) {
				dispatch(hideLoading());
				setMusicGenresData(response.data.data);
				toast.success(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd pobrania gatunków muzycznych:', error);
		}
	};

	useEffect(() => {
		getMusicGenresData();
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
						title='Czy na pewno chcesz usunąć ten gatunek muzyczny?'
						onConfirm={() => handleDeleteMusicGenre(record._id)}
						okText='Tak'
						cancelText='Nie'
					>
						<Button danger>Usuń</Button>
					</Popconfirm>
				</span>
			),
		},
	];

	const handleEdit = (musicGenre) => {
		setEditingMusicGenre(musicGenre);
		setIsModalVisible(true);
	};

	const handleSave = async () => {
		try {
			dispatch(showLoading());
			if (isAdding) {
				const response = await axiosInstance.post(
					'/api/admin/add-music-genre',
					{ name: editingMusicGenre.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingMusicGenre(null);
					getMusicGenresData();
					toast.success(response.data.message);
				}
			} else {
				const response = await axiosInstance.put(
					`/api/admin/edit-music-genre/${editingMusicGenre._id}`,
					{ name: editingMusicGenre.name },
					{
						headers: {
							Authorization: 'Bearer ' + localStorage.getItem('token'),
						},
					}
				);

				if (response.data.success) {
					dispatch(hideLoading());
					setIsModalVisible(false);
					setEditingMusicGenre(null);
					getMusicGenresData();
					toast.success(response.data.message);
				}
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd edycji/dodawania gatunku muzycznego:', error);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setEditingMusicGenre(null);
		setIsAdding(false);
	};

	const handleAdd = () => {
		setIsAdding(true);
		setEditingMusicGenre({ name: '' });
		setIsModalVisible(true);
	};

	const handleDeleteMusicGenre = async (musicGenreId) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.delete(
				`/api/admin/delete-music-genre/${musicGenreId}`,
				{
					headers: {
						Authorization: 'Bearer ' + localStorage.getItem('token'),
					},
				}
			);
			if (response.data.success) {
				dispatch(hideLoading());
				toast.success(response.data.message);
				setMusicGenresData((prevData) =>
					prevData.filter((musicGenre) => musicGenre._id !== musicGenreId)
				);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.error('Błąd usuwania gatunku muzycznego:', error);
		}
	};

	return (
		<div>
			<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
				Dodaj
			</Button>
			<Table
				dataSource={musicGenresData}
				columns={columns}
				style={{ overflowX: 'auto' }}
			/>
			<Modal
				title={isAdding ? 'Dodaj gatunek muzyczny' : 'Edytuj gatunek muzyczny'}
				visible={isModalVisible}
				onOk={handleSave}
				onCancel={handleCancel}
				cancelText='Anuluj'
				okText='Potwierdź'
			>
				<Form>
					<Form.Item label='Nazwa'>
						<Input
							value={editingMusicGenre?.name}
							onChange={(e) =>
								setEditingMusicGenre((prev) => ({
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

export default MusicGenresList;
