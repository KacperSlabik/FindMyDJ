import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Upload, Button } from 'antd';
import ImgCrop from 'antd-img-crop';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export const getBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

const ImagesUpload = ({ setProfileImage }) => {
	const { user } = useSelector((state) => state.user);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');
	const [fileList] = useState([]);

	const handleCancel = () => setPreviewOpen(false);

	const handleImageUpload = async (file) => {
		const formData = new FormData();
		const image = await getBase64(file);
		formData.append('file', image);
		formData.append('userId', user._id);

		toast.loading('Przesyłanie zdjęcia...');

		try {
			const endpoint = user.isDj
				? '/api/dj/upload-profile-image'
				: '/api/user/upload-profile-image';

			const response = await axiosInstance.post(endpoint, formData, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			setProfileImage(image);

			if (response.data.success) {
				toast.dismiss();
				toast.success(response.data.message);
			}
		} catch (error) {
			toast.dismiss();
			toast.error('Wystąpił błąd podczas przesyłania zdjęcia!');
			console.log(error);
		}
	};

	const handlePreview = async (file) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}
		setPreviewImage(file.url || file.preview);
		setPreviewOpen(true);
		setPreviewTitle(
			file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
		);
		handleImageUpload(fileList);
	};

	const uploadButton = (
		<div>
			<Button icon={<UploadOutlined />}>Wybierz zdjęcie</Button>
		</div>
	);

	return (
		<div className='d-flex flex-column-reverse align-items-center gap-4'>
			<ImgCrop
				showReset
				quality={1}
				aspect={1}
				minZoom={1}
				maxZoom={3}
				modalTitle={'Przytnij zdjęcie'}
				modalOk={'Przytnij'}
				modalCancel={'Anuluj'}
			>
				<Upload
					customRequest={({ file, onSuccess, onError }) => {
						handleImageUpload(file)
							.then(() => {
								onSuccess();
							})
							.catch((error) => {
								onError(error);
							});
					}}
					fileList={fileList}
					onPreview={handlePreview}
					maxCount={1}
				>
					{fileList.length >= 8 ? null : uploadButton}
				</Upload>
			</ImgCrop>
			<Modal
				visible={previewOpen}
				title={previewTitle}
				footer={null}
				onCancel={handleCancel}
			>
				<img
					alt='Zdjęcie profilowe'
					style={{
						width: '100%',
					}}
					src={previewImage}
				/>
			</Modal>
			{/* {user.profileImage && (
				<span
					className='dj-default-icon d-flex flex-column align-items-center'
					style={{ width: '300px', height: '300px' }}
				>
					<svg viewBox='0 0 24 24' fill='currentColor'>
						<path d='M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z'></path>
					</svg>
				</span>
			)} */}
		</div>
	);
};

export default ImagesUpload;
