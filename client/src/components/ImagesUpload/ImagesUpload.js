import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import axiosInstance from '../../services/axiosInstance';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImgCrop from 'antd-img-crop';

const getBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

const ImagesUpload = ({ files = [] }) => {
	const params = useParams();
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');
	const [fileList, setFileList] = useState([]);

	useEffect(() => {
		setFileList(
			files.map((photo) => ({
				uid: photo._id,
				name: photo.name,
				status: 'done',
				url: photo.photo,
			}))
		);
	}, [files]);

	const handleCancel = () => setPreviewOpen(false);

	const handlePreview = async (file) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}

		setPreviewImage(file.url || file.preview);
		setPreviewOpen(true);
		setPreviewTitle(file.name || '');
	};

	const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

	const uploadButton = (
		<div>
			<PlusOutlined />
			<div style={{ marginTop: 8 }}>Wybierz zdjęcie</div>
		</div>
	);

	const uploadFiles = async (file) => {
		const formData = new FormData();
		formData.append('file', await getBase64(file));
		formData.append('name', file.name);
		formData.append('userID', params.userId);

		toast.loading('Przesyłanie zdjęcia...');

		try {
			const response = await axiosInstance.post(
				'/api/dj/upload-events-photos',
				formData,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			const photo = response.data.result;
			const newPhoto = {
				uid: photo._id,
				name: file.name,
				status: 'done',
				url: photo.photo,
			};

			setFileList((prevFileList) => [...prevFileList, newPhoto]);
			toast.dismiss();
			toast.success('Plik został pomyślnie przesłany.');
		} catch (error) {
			toast.dismiss();
			console.error('Błąd podczas przesyłania pliku:', error);
			toast.error('Wystąpił błąd podczas przesyłania pliku!');
		}
	};

	const handleDelete = async (photo) => {
		toast.loading('Usuwanie zdjęcia...');
		try {
			await axiosInstance.delete(`/api/dj/delete-event-photo/${photo.uid}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			setFileList((prevFileList) =>
				prevFileList.filter((file) => file.uid !== photo.uid)
			);
			toast.dismiss();
			toast.success('Plik został pomyślnie usunięty.');
		} catch (error) {
			toast.dismiss();
			console.error('Błąd podczas usuwania pliku:', error);
			toast.error('Wystąpił błąd podczas usuwania pliku!');
		}
	};

	return (
		<>
			<ImgCrop
				showReset
				quality={0.5}
				aspect={16 / 9}
				minZoom={1}
				maxZoom={3}
				modalTitle={'Przytnij zdjęcie'}
				modalOk={'Przytnij'}
				modalCancel={'Anuluj'}
			>
				<Upload
					customRequest={({ file, onSuccess, onError }) => {
						uploadFiles(file)
							.then(() => {
								onSuccess();
							})
							.catch((error) => {
								onError(error);
							});
					}}
					listType='picture-card'
					fileList={fileList}
					onPreview={handlePreview}
					onRemove={handleDelete}
					onChange={handleChange}
					maxCount={10}
					multiple
				>
					{fileList.length >= 10 ? null : uploadButton}
				</Upload>
			</ImgCrop>

			<Modal
				visible={previewOpen}
				title={previewTitle}
				footer={null}
				onCancel={handleCancel}
			>
				<img
					alt='example'
					style={{
						width: '100%',
					}}
					src={previewImage}
				/>
			</Modal>
		</>
	);
};

export default ImagesUpload;
