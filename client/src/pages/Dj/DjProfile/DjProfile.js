import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import DjForm from '../../../components/DjForm/DjForm';
import Layout from '../../../components/Layout/Layout';
import { useEffect, useState } from 'react';

export default function Profile() {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);
	const params = useParams();
	const [dj, setDj] = useState(null);
	const [initialPhotos, setInitialPhotos] = useState([]);
	const [initialProfileImage, setInitialProfileImage] = useState([]);

	const getDjData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/dj/get-dj-info-by-user-id',
				{ userId: params.userId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			dispatch(hideLoading());
			if (response.data.success) {
				setDj(response.data.data);

				const photo = response.data.data.profileImage;
				const photos = response.data.data.eventPhotos;
				setInitialPhotos(photos);
				setInitialProfileImage(photo);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	useEffect(() => {
		getDjData();
	}, []);

	const onFinish = async (values) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/dj/update-dj',
				{
					...values,
					userId: user._id,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());

			if (response.data.success) {
				toast.success(response.data.message);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			console.log(error);
		}
	};

	return (
		<Layout>
			<h1 className='page-title'>Profil DJ-a</h1>
			<hr />
			{dj && (
				<DjForm
					onFinish={onFinish}
					initialValues={dj}
					photos={initialPhotos}
					photo={initialProfileImage}
				/>
			)}
		</Layout>
	);
}
