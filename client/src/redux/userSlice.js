import { createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../services/axiosInstance';

export const userSlice = createSlice({
	name: 'user',
	initialState: {
		user: null,
		profileImage: null,
	},
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
			state.profileImage = action.payload.profileImage;
		},
		setProfileImage: (state, action) => {
			state.profileImage = action.payload;
		},
		resetUser: (state) => {
			state.user = null;
			state.profileImage = null;
		},
	},
});

export const { setUser, setProfileImage, resetUser } = userSlice.actions;

export const getUserProfileImage = (userId, isDj) => async (dispatch) => {
	try {
		const token = localStorage.getItem('token');
		const response = await axiosInstance.get(`/api/user/get-profile-image`, {
			params: { userId, isDj },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.data.success) {
			dispatch(setProfileImage(response.data.profileImage));
		}
	} catch (error) {
		console.error('Błąd pobrania obrazu profilowego użytkownika', error);
	}
};

export default userSlice.reducer;
