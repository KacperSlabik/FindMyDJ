import Layout from '../../../components/Layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading } from '../../../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import DjForm from '../../../components/DjForm/DjForm';
import '../ApplyDj/applyDjStyles.css';

function ApplyDj() {
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();

	const initialValues = {
		firstName: user?.firstName,
		lastName: user?.lastName,
		email: user?.email,
		phoneNumber: user?.phoneNumber,
		city: user?.city,
		postalCode: user?.postalCode,
		facebook: user?.facebook,
	};

	const onFinish = async (values) => {
		try {
			dispatch(showLoading());
			const response = await axiosInstance.post(
				'/api/user/apply-dj-account',
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
				navigate('/app');
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error(error?.response?.data?.message);
		}
	};

	return (
		<Layout>
			<h1 className='page-title'>Zostań DJ-em</h1>
			<hr />

			<header className='apply-dj-header d-flex flex-row justify-content-center text-align-center'>
				<h1>Wypełnij formularz i dołącz do grona profesjonalistów! 🎶🎙🎧</h1>
			</header>

			<section className='apply-dj-form'>
				<DjForm
					onFinish={onFinish}
					initialValues={initialValues}
					isApply={true}
				/>
			</section>
		</Layout>
	);
}

export default ApplyDj;
