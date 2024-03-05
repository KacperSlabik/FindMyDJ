import { useNavigate } from 'react-router-dom';
import {
	FacebookButton,
	YouTubeButton,
	InstagramButton,
	TikTokButton,
} from '../Button/Button';
import { useRef, useEffect, useState } from 'react';
import { Rate } from 'antd';
import StatusIndicator from '../StatusIndicator/StatusIndicator';
import axiosInstance from '../../services/axiosInstance';

export default function Dj({ dj }) {
	const navigate = useNavigate();
	const facebookButton = useRef();
	const youtubeButton = useRef();
	const instagramButton = useRef();
	const tiktokButton = useRef();

	const [user, setUser] = useState(null);

	const handleCardClick = (e) => {
		const path = e.nativeEvent.composedPath();

		if (!path.includes(facebookButton.current))
			navigate(`/app/book-dj/${dj._id}`);
	};

	let profilePicture = (
		<span className='dj-default-icon rounded'>
			<svg viewBox='0 0 24 24'>
				<path
					d='M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13Z'
					fill='currentColor'
				></path>
			</svg>
		</span>
	);

	if (dj?.profileImage) {
		profilePicture = (
			<img src={dj.profileImage} className='rounded' alt={dj.alias} />
		);
	}

	let description = dj?.djDescription.split(' ');

	if (description.length > 20) {
		description = description.slice(0, 20).join(' ') + '...';
	} else {
		description = description.slice(0, 20).join(' ');
	}

	const getUserDataById = async (userId) => {
		try {
			const response = await axiosInstance.get(`/api/user/${userId}`, {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('token'),
				},
			});

			if (response.data.success) {
				setUser(response.data.data);
			} else {
				throw new Error('Nie udało się pobrać danych użytkownika');
			}
		} catch (error) {
			console.error('Błąd podczas pobierania danych użytkownika:', error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const user = await getUserDataById(dj.userId);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, [dj._id]);

	const isOnline = user?.isActive;
	const lastActiveSession = user?.activeSessions?.[0]?.lastModified;

	return (
		<div className={`card p-2 mb-4 dj-card`} onClick={handleCardClick}>
			<header>
				{profilePicture}
				<div>
					<h1 className='card-title'>
						{dj.alias}
						<p className='normal-text'>
							{dj.firstName} {dj.lastName}
						</p>
					</h1>

					<StatusIndicator
						isOnline={isOnline}
						lastActiveSession={lastActiveSession}
					/>

					<strong className='d-flex align-items-center gap-2'>
						<Rate
							disabled
							count={1}
							defaultValue={1}
							style={{ color: 'orange', fontSize: '15px' }}
						/>
						<p>{dj.averageRating.toFixed(2)}</p>
					</strong>
					<p className='text-with-icon'>
						<span>
							<svg viewBox='0 0 24 24' width='18' height='18'>
								<path
									d='M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z'
									fill='currentColor'
								></path>
							</svg>
						</span>
						{dj.city}
					</p>
				</div>
			</header>

			<hr />
			<p>{description}</p>

			<div className='d-flex flex-row gap-2 '>
				{dj?.facebook && (
					<FacebookButton link={dj?.facebook} ref={facebookButton} />
				)}

				{dj?.youtube && (
					<YouTubeButton link={dj?.youtube} ref={youtubeButton} />
				)}

				{dj?.instagram && (
					<InstagramButton link={dj?.instagram} ref={instagramButton} />
				)}

				{dj?.tiktok && <TikTokButton link={dj?.tiktok} ref={tiktokButton} />}
			</div>
		</div>
	);
}
