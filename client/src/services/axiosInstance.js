import axios from 'axios';
import { toast } from 'react-hot-toast';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			const status = error.response.status;
			switch (status) {
				case 400:
					break;
				case 401:
					break;
				case 404:
					break;
				case 409:
					break;
				case 500:
					if (error?.response?.data?.message) {
						break;
					}
					toast.error(
						'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.'
					);
					break;
				default:
					toast.error(`Wystąpił nieoczekiwany błąd: ${status}`);
					break;
			}
		} else {
			toast.error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
