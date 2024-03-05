import React, { useEffect } from 'react';
import Layout from '../../../components/Layout/Layout';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import axiosInstance from '../../../services/axiosInstance';
import { Button, Popconfirm, Table, Tag, Empty, Input, Tooltip } from 'antd';
import moment from 'moment';
import toast from 'react-hot-toast';
import ApplyDjDetailsModal from '../../../components/ApplyDjDetailsModal/ApplyDjDetailsModal';
import DjDetailsModal from '../../../components/DjDetailsModal/DjDetailsModal';

const { Search } = Input;

function DjsList() {
	const [djs, setDjs] = useState([]);
	const [selectedDj, setSelectedDj] = useState({});
	const [modalOpen, setModalOpen] = useState(false);
	const [applyDjDetailsModalOpen, setApplyDjDetailsModalOpen] = useState(false);
	const [djModalOpen, setDjModalOpen] = useState(false);
	const [searchText, setSearchText] = useState('');
	const dispatch = useDispatch();

	const handleApplyDjDetailsModalOpen = (dj) => {
		setApplyDjDetailsModalOpen(true);
		setSelectedDj(dj);
	};

	const handleCancel = () => {
		setApplyDjDetailsModalOpen(false);
		setDjModalOpen(false);
		setModalOpen(false);
	};

	const handleDjModalOpen = (dj) => {
		setDjModalOpen(true);
		setSelectedDj(dj);
	};

	const getDjsData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.get('/api/admin/get-all-djs', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			dispatch(hideLoading());
			if (response.data.success) {
				setDjs(response.data.data);
				toast.success(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	const changeDjStatus = async (record, status) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/admin/change-dj-account-status',
				{ djId: record._id, userId: record.userId, status: status },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				getDjsData();
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	const revokeDjStatus = async (record) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/admin/revoke-dj-status',
				{ djId: record.userId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				getDjsData();
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	useEffect(() => {
		getDjsData();
	}, []);

	const columns = [
		{
			title: 'DJ',
			render: (text, record) => (
				<Button onClick={() => handleDjModalOpen(record)}>Szczegóły</Button>
			),
		},
		{
			title: 'Wniosek DJ-a',
			render: (text, record) => (
				<Button onClick={() => handleApplyDjDetailsModalOpen(record)}>
					Szczegóły
				</Button>
			),
		},
		{
			title: 'Utworzony',
			dataIndex: 'createdAt',
			render: (text, record) => (
				<span>
					{moment(record.createdAt).format('DD-MM-YYYY HH:mm')}
					<br />
					<span style={{ color: '#999' }}>
						({moment(record.createdAt).fromNow()})
					</span>
				</span>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (text, record) => {
				let tagType = '';

				switch (text) {
					case 'Potwierdzony':
						tagType = 'success';
						break;
					case 'Oczekuje':
						tagType = 'warning';
						break;
					case 'Zablokowany':
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
			title: 'Akcje',
			dataIndex: 'actions',
			render: (text, record) => (
				<div className='d-flex' style={{ gap: '10px' }}>
					{record.status === 'Oczekuje' && (
						<>
							<Popconfirm
								title='Potwierdź DJ-a'
								description={`Czy na pewno chcesz potwierdzić DJ-a: ${record.firstName} ${record.lastName}`}
								onConfirm={() => changeDjStatus(record, 'Potwierdzony')}
								okText='Tak'
								cancelText='Nie'
							>
								<Button type='primary'>Potwierdź</Button>
							</Popconfirm>

							<Popconfirm
								title='Odrzuć DJ-a'
								description={`Czy na pewno chcesz odrzucić DJ-a: ${record.firstName} ${record.lastName}`}
								onConfirm={() => changeDjStatus(record, 'Zablokowany')}
								okText='Tak'
								cancelText='Nie'
							>
								<Button danger>Odrzuć</Button>
							</Popconfirm>
						</>
					)}
					{record.status === 'Potwierdzony' && (
						<Popconfirm
							title='Zablokuj DJ-a'
							description={`Czy na pewno chcesz zablokować DJ-a: ${record.firstName} ${record.lastName}`}
							onConfirm={() => changeDjStatus(record, 'Zablokowany')}
							okText='Tak'
							cancelText='Nie'
						>
							<Button danger>Zablokuj</Button>
						</Popconfirm>
					)}
					{record.status === 'Zablokowany' && (
						<Popconfirm
							title='Odblokuj DJ-a'
							description={`Czy na pewno chcesz odblokować DJ-a: ${record.firstName} ${record.lastName}`}
							onConfirm={() => changeDjStatus(record, 'Potwierdzony')}
							okText='Tak'
							cancelText='Nie'
						>
							<Button type='primary'>Odblokuj</Button>
						</Popconfirm>
					)}
					<div>
						<Popconfirm
							title='Odbierz status DJ-a'
							description={`Czy na pewno chcesz odbierać status DJ-a: ${record.firstName} ${record.lastName}`}
							onConfirm={() => revokeDjStatus(record)}
							okText='Tak'
							cancelText='Nie'
						>
							<Button danger>Odbierz status DJ-a</Button>
						</Popconfirm>
					</div>
				</div>
			),
		},
	];

	const filteredData = djs.filter(
		(item) =>
			(item.firstName &&
				item.firstName.toLowerCase().includes(searchText.toLowerCase())) ||
			(item.lastName &&
				item.lastName.toLowerCase().includes(searchText.toLowerCase())) ||
			(item.email &&
				item.email.toLowerCase().includes(searchText.toLowerCase())) ||
			(item._id && item._id.toLowerCase().includes(searchText.toLowerCase())) ||
			(item.alias &&
				item.alias.toLowerCase().includes(searchText.toLowerCase()))
	);

	return (
		<Layout>
			<h1 className='page-title'>DJ-e</h1>
			<div className='d-flex flex-column mb-2'>
				<p className='d-flex align-items-center'>
					Wyszukaj:
					<Tooltip title='DJa można wyszukać po: ID, imię, nazwisko, email, alias'>
						<span>
							<i className='ri-question-fill fs-5 text-secondary'></i>
						</span>
					</Tooltip>
				</p>

				<input
					type='text'
					placeholder='Szukaj...'
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					style={{ width: '300px' }}
				/>
			</div>
			<Table
				columns={columns}
				dataSource={filteredData}
				style={{ overflowX: 'auto' }}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_DEFAULT}
							description='Brak danych.'
						/>
					),
				}}
			/>

			<ApplyDjDetailsModal
				modalOpen={applyDjDetailsModalOpen}
				handleCancel={handleCancel}
				dj={selectedDj}
			/>

			<DjDetailsModal
				modalOpen={djModalOpen}
				handleCancel={handleCancel}
				dj={selectedDj}
			/>
		</Layout>
	);
}

export default DjsList;
