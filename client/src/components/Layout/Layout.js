import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import '../Layout/layoutStyles.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Popover, notification, Statistic } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { resetUser } from '../../redux/userSlice';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../../services/axiosInstance';
import AvatarImage from '../AvatarImage/AvatarImage';
import SessionExpirationModal from '../SessionExpirationModal/SessionExpirationModal';

function Layout({ children }) {
	const [collapsed, setCollapsed] = useState(
		localStorage.getItem('collapsed') === 'false' ? false : true
	);
	const { user } = useSelector((state) => state.user);
	const [showSessionExpirationModal, setShowSessionExpirationModal] =
		useState(false);

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const sideBarRef = useRef(null);
	const [openSideBar, setOpenSideBar] = useState(false);
	const openMenuRef = useRef(null);

	const [bookings, setBookings] = useState([]);

	const userMenu = [
		{
			name: 'Strona główna',
			path: '/app',
			icon: 'ri-home-line',
		},
		{ name: 'DJ-e', path: '/app/djs', icon: 'ri-user-search-line' },
		{
			name: 'Moje rezerwacje',
			path: '/app/bookings',
			icon: 'ri-file-list-line',
		},
		{
			name: 'Zostań DJ-em',
			path: '/app/apply-dj',
			icon: 'ri-headphone-line',
		},
		{
			name: 'Mój Profil',
			path: `/app/profile/${user?._id}`,
			icon: 'ri-user-line',
		},
		{
			name: 'Kontakt',
			path: '/contact',
			icon: 'ri-customer-service-2-line',
		},
	];

	const djMenu = [
		{
			name: 'Strona główna',
			path: '/app',
			icon: 'ri-home-line',
		},
		{ name: 'DJ-e', path: '/app/djs', icon: 'ri-user-search-line' },
		{
			name: 'Moje rezerwacje',
			path: '/app/bookings',
			icon: 'ri-file-list-line',
		},
		{
			name: 'Moje zlecenia',
			path: '/app/dj/bookings',
			icon: 'ri-play-list-line',
		},
		{
			name: 'Mój Profil',
			path: `/app/dj/profile/${user?._id}`,
			icon: 'ri-user-line',
		},
		{
			name: 'Kontakt',
			path: '/contact',
			icon: 'ri-customer-service-2-line',
		},
	];

	const adminMenuHeader = [];

	const userMenuHeader = [
		{
			name: 'Powiadomienia',
			path: '/app/notifications',
			icon: 'ri-notification-line',
		},
	];

	const djMenuHeader = [
		{
			name: 'Nadchodzące imprezy',
			path: '/app/events-timeline',
			icon: 'ri-time-line',
		},
		{
			name: 'Powiadomienia',
			path: '/app/notifications',
			icon: 'ri-notification-line',
		},
	];

	const adminMenu = [
		{
			name: 'Panel Admina',
			path: '/app/admin/home',
			icon: 'ri-home-line',
		},
		{
			name: 'Użytkownicy',
			path: '/app/admin/userslist',
			icon: 'ri-user-line',
		},
		{
			name: 'DJ-e',
			path: '/app/admin/djslist',
			icon: 'ri-user-star-line',
		},
		{
			name: 'Rezerwacje',
			path: '/app/admin/bookingslist',
			icon: 'ri-file-list-line',
		},
		{
			name: 'Recenzje',
			path: '/app/admin/reviewslist',
			icon: 'ri-feedback-line',
		},
		{
			name: 'Edytuj dane',
			path: '/app/admin/editdatalist',
			icon: 'ri-database-2-line',
		},
	];

	const roleSpecificProfilePath = user?.isDj
		? `/app/dj/profile/${user?._id}`
		: `/app/profile/${user?._id}`;

	const headerMenuToBeRendered = user?.isAdmin
		? adminMenuHeader
		: user?.isDj
		? djMenuHeader
		: userMenuHeader;

	const menuToBeRendered = user?.isAdmin
		? adminMenu
		: user?.isDj
		? djMenu
		: userMenu;

	const role = user?.isAdmin
		? 'Administrator'
		: user?.isDj
		? 'DJ'
		: 'Użytkownik';

	const handleLogout = async () => {
		try {
			const token = localStorage.getItem('token');
			const promise = toast.promise(
				axiosInstance.post(
					'/api/user/logout',
					{
						userId: user._id,
						token: token,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				),
				{
					loading: 'Wylogowywanie...',
					success: 'Pomyślnie wylogowano.',
					error: 'Wystąpił błąd podczas wylogowywania.',
				}
			);

			const response = await promise;

			if (response.data.success) {
				localStorage.clear();
				dispatch(resetUser());
				navigate('/login');
			}
		} catch (error) {
			console.error('Wystąpił błąd:', error);
		}
	};

	const getTokenInfo = () => {
		const token = localStorage.getItem('token');
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const createdAt = new Date(decodedToken.iat * 1000);
				return {
					createdAt,
					expiresAt: new Date(Math.floor(decodedToken.exp) * 1000),
				};
			} catch (error) {
				console.error('Błąd dekodowania tokenu:', error);
			}
		}
		return null;
	};

	const [tokenInfo, setTokenInfo] = useState(getTokenInfo());
	const [expiresAt, setExpiresAt] = useState(
		tokenInfo ? Math.floor((tokenInfo.expiresAt - Date.now()) / 1000) : 0
	);

	const refreshTokenInfo = () => {
		const newTokenInfo = getTokenInfo();
		if (newTokenInfo) {
			setTokenInfo(newTokenInfo);

			const remainingInSeconds = Math.floor(
				(newTokenInfo.expiresAt - Date.now()) / 1000
			);
			setExpiresAt(remainingInSeconds + 1);

			if (remainingInSeconds <= 30 && remainingInSeconds > 0) {
				setShowSessionExpirationModal(true);
			}
		}
	};

	useEffect(() => {
		refreshTokenInfo();

		const intervalId = setInterval(refreshTokenInfo, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const handleExtendSession = async () => {
		try {
			const response = await axiosInstance.post(
				'/api/user/refresh-access-token',
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);

			const newAccessToken = response.data.accessToken;
			localStorage.setItem('token', newAccessToken);
			setShowSessionExpirationModal(false);

			if (response.data.success) {
				toast.success(response.data.message);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.error('Błąd podczas odświeżania tokena:', error);
		}
	};

	useEffect(() => {
		localStorage.setItem('collapsed', collapsed);
	}, [collapsed]);

	useEffect(() => {
		if (user?.unseenNotifications.length > 0) {
			const isNotificationsPage = location.pathname === '/app/notifications';

			if (!isNotificationsPage) {
				notification.info({
					message: 'Find My DJ',
					description: (
						<div style={{ cursor: 'pointer' }}>
							Masz nowe powiadomienie!
							<br />
							Kliknij tutaj, aby je odczytać
						</div>
					),
					duration: 3,
					onClick: () => {
						navigate('/app/notifications');
						notification.destroy();
					},
				});
			}
		}
	}, [user?.unseenNotifications.length, location.pathname]);

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	function handleClickOutside(event) {
		if (window.innerWidth > 700) return;
		if (
			sideBarRef.current &&
			!sideBarRef.current.contains(event.target) &&
			openMenuRef.current &&
			!openMenuRef.current.contains(event.target)
		) {
			setOpenSideBar(false);
			setCollapsed(true);
		}
	}

	const toggleMenu = () => {
		if (collapsed) {
			setCollapsed(false);
			setOpenSideBar(true);
		} else {
			setCollapsed(true);
			setOpenSideBar(false);
		}
	};

	// useEffect(() => {
	// 	if (user?.isDj) {
	// 		const getBookingsData = async () => {
	// 			try {
	// 				const response = await axiosInstance.get(
	// 					'/api/dj/get-bookings-by-dj-id',
	// 					{
	// 						headers: {
	// 							Authorization: `Bearer ${localStorage.getItem('token')}`,
	// 						},
	// 					}
	// 				);
	// 				if (response.data.success) {
	// 					const confirmedBookings = response.data.data.filter(
	// 						(booking) => booking.status === 'Potwierdzona'
	// 					);

	// 					setBookings(confirmedBookings);
	// 				}
	// 			} catch (error) {
	// 				console.error('Błąd pobrania rezerwacji', error);
	// 			}
	// 		};

	// 		getBookingsData();
	// 	}
	// }, [user?.isDj]);

	return (
		<div className='container'>
			<aside
				className={`sidebar custom-scrollbar orange ${
					collapsed && 'collapsed'
				} ${openSideBar && 'show'}`}
				ref={sideBarRef}
			>
				<div className='sidebar-header'>
					<h1 className={`logo ${collapsed && 'collapsed-logo'}`}>FMD</h1>

					<aside>
						<p className={`text-white ${collapsed && 'collapsed-text'}`}>
							{role}
						</p>
					</aside>

					<aside className='session-countdown'>
						{tokenInfo && (
							<Statistic.Countdown
								title='Koniec sesji:'
								value={tokenInfo.expiresAt}
								format='mm:ss'
							/>
						)}
					</aside>
				</div>

				<div className={`menu ${collapsed && 'fit-content'}`}>
					{menuToBeRendered.map((menu) => {
						const isActive = location.pathname === menu.path;

						return (
							<div
								className={`d-flex menu-item ${isActive && 'active-menu-item'}`}
								key={menu.name}
							>
								<Popover content={collapsed ? menu.name : null} trigger='hover'>
									<Link to={menu.path}>
										<i
											className={`${menu.icon} ${
												isActive && 'active-menu-icon'
											}`}
										></i>
										<span className={`${collapsed ? 'hide' : ''}`}>
											{menu.name}
										</span>
									</Link>
								</Popover>
							</div>
						);
					})}

					<div
						className={'d-flex menu-item logout-button'}
						onClick={handleLogout}
					>
						<Popover content={collapsed ? 'Wyloguj' : null} trigger='hover'>
							<Link to='/login' className='logout-button'>
								<i className='ri-logout-circle-line'></i>
								{!collapsed && 'Wyloguj'}
							</Link>
						</Popover>
					</div>
				</div>
			</aside>

			<div className='layout-header'>
				<div ref={openMenuRef}>
					{collapsed ? (
						<i
							className='ri-menu-line header-action-icon'
							onClick={toggleMenu}
						></i>
					) : (
						<i
							className='ri-close-line header-action-icon'
							onClick={toggleMenu}
						></i>
					)}
				</div>

				<div className='header-items d-flex align-items-center px-2 '>
					{headerMenuToBeRendered.map((menu) => {
						const isActive = location.pathname === menu.path;

						return (
							<div
								className={`d-flex header-menu-item ${
									isActive && 'active-header-menu-item'
								}`}
								key={menu.name}
							>
								{menu.name !== 'Powiadomienia' ? (
									<Popover content={menu.name} trigger='hover'>
										<Link to={menu.path}>
											<i
												className={`${menu.icon} ${
													isActive && 'active-header-menu-icon'
												}`}
											></i>
										</Link>
									</Popover>
								) : (
									<Badge
										offset={[10, 10]}
										count={user?.unseenNotifications.length}
										className='notifications'
									>
										<Popover content={menu.name} trigger='hover'>
											<Link to={menu.path}>
												<i
													className={`${menu.icon} ${
														isActive && 'active-header-menu-icon'
													}`}
												></i>
											</Link>
										</Popover>
									</Badge>
								)}
							</div>
						);
					})}

					<AvatarImage
						shape='square'
						size='large'
						icon={<UserOutlined />}
						userId={user?._id}
						isDj={user?.isDj}
						isAdmin={user?.isAdmin}
					/>
					<Popover content={'Mój profil'}>
						<Link className='anchor mx-2' to={roleSpecificProfilePath}>
							{user?.firstName} {user?.lastName}
						</Link>
					</Popover>
				</div>
			</div>

			<main className='main-content custom-scrollbar white'>{children}</main>

			<SessionExpirationModal
				visible={showSessionExpirationModal}
				onExtendSession={handleExtendSession}
				onLogout={handleLogout}
				expiresAt={expiresAt}
			/>
		</div>
	);
}

export default Layout;
