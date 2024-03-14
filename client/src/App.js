import { Button, Result } from 'antd';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import Notifications from './pages/User/Notifications/Notifications';
import LandingPage from './pages/User/LandingPage/LandingPage';
import Login from './pages/User/Login/Login';
import Register from './pages/User/Register/Register';
import ApplyDj from './pages/User/ApplyDj/ApplyDj';
import Home from './pages/User/Home/Home';
import DjsList from './pages/Admin/DjsList/DjsList';
import UsersList from './pages/Admin//UsersList/UsersList';
import BookingsList from './pages/Admin//BookingsList/BookingsList';
import Profile from './pages/Dj//DjProfile/DjProfile';
import UserProfile from './pages/User/UserProfile/UserProfile';
import BookDj from './pages/User/BookDj/BookDj';
import Bookings from './pages/User/Bookings/Bookings';
import DjBookings from './pages/Dj/DjBookings/DjBookings';
import AdminPanel from './pages/Admin/AdminPanel/AdminPanel';
import ResetPassword from './pages/User/ResetPassword/ResetPassword';
import ResetPasswordForm from './components/ResetPasswordForm/ResetPasswordForm';
import VerifyEmail from './components/VerifyEmail/VerifyEmail';
import Contact from './pages/User/Contact/Contact';
import SearchDj from './pages/User/SearchDj/SearchDj';
import EventsTimeline from './components/EventsTimeline/EventsTimeline';
import EditDataList from './pages/Admin/EditDataList/EditDataList';
import ReviewsList from './pages/Admin/ReviewsList/ReviewsList';

function App() {
	const { loading } = useSelector((state) => state.alerts);
	return (
		<div>
			<BrowserRouter>
				{loading && (
					<div className='spinner-parent'>
						<div className='spinner-border' role='status'></div>
					</div>
				)}

				<Toaster position='top-center' reverseOrder={false} />
				<Routes>
					<Route
						path='/login'
						element={
							<PublicRoute>
								<Login />
							</PublicRoute>
						}
					/>
					<Route
						path='/register'
						element={
							<PublicRoute>
								<Register />
							</PublicRoute>
						}
					/>
					<Route
						path='/verify-email/:token'
						element={
							<PublicRoute>
								<VerifyEmail />
							</PublicRoute>
						}
					/>
					<Route
						path='/'
						element={
							<PublicRoute>
								<LandingPage />
							</PublicRoute>
						}
					/>
					<Route
						path='/contact'
						element={
							<ProtectedRoute>
								<Contact />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/reset-password'
						element={
							<PublicRoute>
								<ResetPassword />
							</PublicRoute>
						}
					/>
					<Route
						path='/reset-password/:token'
						element={
							<PublicRoute>
								<ResetPasswordForm />
							</PublicRoute>
						}
					/>
					<Route
						path='/app'
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/djs'
						element={
							<ProtectedRoute>
								<SearchDj />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/apply-dj'
						element={
							<ProtectedRoute>
								<ApplyDj />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/notifications'
						element={
							<ProtectedRoute>
								<Notifications />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/events-timeline'
						element={
							<ProtectedRoute>
								<EventsTimeline />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/app/profile/:userId'
						element={
							<ProtectedRoute>
								<UserProfile />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/book-dj/:djId'
						element={
							<ProtectedRoute>
								<BookDj />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/dj/profile/:userId'
						element={
							<ProtectedRoute>
								<Profile />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/app/admin/home'
						element={
							<ProtectedRoute>
								<AdminPanel />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/admin/userslist'
						element={
							<ProtectedRoute>
								<UsersList />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/admin/djslist'
						element={
							<ProtectedRoute>
								<DjsList />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/admin/bookingslist'
						element={
							<ProtectedRoute>
								<BookingsList />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/admin/reviewslist'
						element={
							<ProtectedRoute>
								<ReviewsList />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/admin/editdatalist'
						element={
							<ProtectedRoute>
								<EditDataList />
							</ProtectedRoute>
						}
					/>

					<Route
						path='/app/bookings'
						element={
							<ProtectedRoute>
								<Bookings />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/app/dj/bookings'
						element={
							<ProtectedRoute>
								<DjBookings />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/*'
						element={
							<Result
								status='404'
								title='404'
								subTitle='Przepraszamy, ta strona nie istnieje.'
								extra={
									<Button type='primary'>
										<Link to='/app'>Powrót do strony głównej</Link>
									</Button>
								}
							/>
						}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
