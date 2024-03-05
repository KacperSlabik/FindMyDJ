import React, { useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../services/axiosInstance';
import { setUser } from '../redux/userSlice';
import { showLoading, hideLoading } from '../redux/alertsSlice';
import toast from 'react-hot-toast';

function ProtectedRoute(props) {
	const { user } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const checkToken = useCallback(() => {
		const token = localStorage.getItem('token');

		if (!token) {
			console.error('Brak tokena.');
			return;
		}

		const decodedToken = JSON.parse(atob(token.split('.')[1]));

		if (decodedToken.exp * 1000 < new Date().getTime()) {
			toast.error(
				'Sesja wygasła. \nZa chwilę nastąpi przekierowanie na stronę logowania.'
			);
			dispatch(showLoading());
			setTimeout(() => {
				localStorage.clear('token');
				dispatch(hideLoading());
				navigate('/login');
			}, 3000);
		}
	}, [navigate, dispatch]);

	const getUser = async () => {
		try {
			dispatch(showLoading());
			const authToken = localStorage.getItem('token');

			if (!authToken) {
				localStorage.clear();
				dispatch(hideLoading());
				navigate('/login');
				return;
			}

			const response = await axiosInstance.post(
				'/api/user/get-user-info-by-id',
				{ token: authToken },
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				}
			);

			dispatch(hideLoading());

			if (response.data.success) {
				dispatch(setUser(response.data.data));
			} else {
				localStorage.clear();
				navigate('/login');
			}
		} catch (error) {
			dispatch(hideLoading());
			localStorage.clear();
			navigate('/login');
		}
	};

	useEffect(() => {
		if (!user) {
			getUser();
		}
	}, [user]);

	useEffect(() => {
		checkToken();

		const intervalId = setInterval(() => {
			checkToken();
		}, 5000);

		return () => {
			clearInterval(intervalId);
		};
	}, [checkToken]);

	if (localStorage.getItem('token')) {
		return props.children;
	} else {
		return <Navigate to='/login' />;
	}
}

export default ProtectedRoute;
