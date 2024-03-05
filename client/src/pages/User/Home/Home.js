import React from 'react';
import Layout from '../../../components/Layout/Layout';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import '../Home/homeStyles.css';

function Home() {
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();

	const userMenu = [
		{ name: 'Strona główna', path: '/app', icon: 'ri-home-line' },
		{ name: 'DJ-e', path: '/app/djs', icon: 'ri-user-search-line' },
		{
			name: 'Moje rezerwacje',
			path: '/app/bookings',
			icon: 'ri-file-list-line',
		},
		{
			name: 'Zlecenia',
			path: '/app/dj/bookings',
			icon: 'ri-play-list-line',
			visible: user?.isDj,
		},
		{
			name: 'Zostań DJ-em',
			path: '/app/apply-dj',
			icon: 'ri-headphone-line',
			visible: !user?.isDj,
		},
		{ name: 'Profil', path: `/app/profile/${user?._id}`, icon: 'ri-user-line' },
		{ name: 'Kontakt', path: '/contact', icon: 'ri-customer-service-2-line' },
	];

	const sections = [
		{
			title: 'DJ-e',
			description: 'Odszukaj idealnego DJ-a dla swojej imprezy w sekcji DJ-e.',
		},
		{
			title: 'Moje Rezerwacje',
			description: 'Śledź postęp swoich rezerwacji w sekcji Moje rezerwacje.',
		},
		{
			title: 'Moje zlecenia',
			description:
				'Przeglądaj swoje zlecenia od osób, które Cię wybrały na swoją imprezę w sekcji Moje zlecenia.',
		},
		{
			title: 'Zostań DJ-em',
			description:
				'Przyjmuj zlecenia jako DJ, jeśli profesjonalnie zajmujesz się prowadzeniem imprez. Sprawdź opcję Zostań DJ-em.',
		},
		{
			title: 'Profil',
			description:
				'Utrzymuj swoje dane użytkownika lub DJ-a na bieżąco w sekcji Mój Profil.',
		},
		{
			title: 'Kontakt',
			description:
				'Masz pytania lub problemy do rozwiązania? Skontaktuj się z nami w sekcji Kontakt.',
		},
	];

	return (
		<Layout>
			<h1 className='page-title'>Strona główna</h1>
			<hr />
			<div className='home'>
				<header>
					<div className='d-flex flex-column align-items-center justify-content-between mt-5'>
						<h1 style={{ color: 'black' }}>Witaj {user?.firstName}! 👋😊</h1>
						<h4 style={{ textAlign: 'center', color: 'black' }}>
							Szukasz DJ-a prawda? Jesteś w dobrym miejscu 😉!
						</h4>
					</div>
				</header>

				<section>
					<div className='d-flex flex-column justify-content-center align-items-center mt-5'>
						<h3
							style={{ color: 'black', display: 'flex', alignItems: 'center' }}
						>
							O Mojej Aplikacji{' '}
							<i
								className='ri-terminal-window-fill'
								style={{ marginLeft: '5px' }}
							></i>
						</h3>

						<p className='mt-3' style={{ textAlign: 'center', color: 'black' }}>
							Odkryj nowy sposób na tworzenie niezapomnianych imprez z moją apką
							do rezerwacji DJ-ów! Prosta, szybka i dostępna o każdej porze.
							Znajdź idealnego DJ-a na swoje wyjątkowe wydarzenie lub dołącz
							jako DJ, i miej zapełniomy terminarz. Dzięki temu innowacyjnemu
							rozwiązaniu rezerwacja DJ-a nigdy nie była tak łatwa i
							ekscytująca!
						</p>
					</div>
				</section>

				<section className='instructions'>
					<h3
						className='mt-5 mb-4'
						style={{ textAlign: 'center', color: 'black', marginTop: '30px' }}
					>
						Ale jak to działa? Pewnie się zastanawiasz 🤔
					</h3>

					<div>
						{sections.map(
							(section, index) =>
								userMenu[index + 1].visible !== false && (
									<blockquote
										style={{
											margin: 0,
											padding: '0 0 0 20px',
											borderLeft: '5px solid #eee',
										}}
									>
										<p
											style={{
												display: 'flex',
												alignItems: 'center',
												cursor: 'pointer',
											}}
											onClick={() => navigate(userMenu[index].path)}
										>
											<i
												className={userMenu[index + 1].icon}
												style={{
													marginRight: '10px',
													fontSize: '32px',
												}}
											></i>
											<span>
												<Link to={userMenu[index].path}></Link>
												{section.description}
											</span>
										</p>
									</blockquote>
								)
						)}
					</div>
				</section>
			</div>
		</Layout>
	);
}

export default Home;
