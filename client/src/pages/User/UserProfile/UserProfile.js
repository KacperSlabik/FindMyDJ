import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import UserForm from '../../../components/UserForm/UserForm';
import Layout from '../../../components/Layout/Layout';
import { useEffect, useState } from 'react';

export default function Profile() {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);
	const params = useParams();
	const [initialProfileImage, setInitialProfileImage] = useState([]);

	const getUserData = async () => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/get-user-info-by-id',
				{ userId: params.userId },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				const photo = response.data.data.profileImage;
				setInitialProfileImage(photo);
			}
		} catch (error) {
			dispatch(hideLoading());
		}
	};

	useEffect(() => {
		getUserData();
	}, []);

	const onFinish = async (values) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/update-user',
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
			toast.error('Coś poszło nie tak');
		}
	};

	return (
		<Layout>
			<h1 className='page-title'>Profi uzytkownika</h1>
			<hr />

			{user && (
				<UserForm
					onFinish={onFinish}
					initialValues={user}
					photo={initialProfileImage}
				/>
			)}
		</Layout>
	);
}
