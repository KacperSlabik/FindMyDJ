import { Link } from 'react-router-dom';
import { Button } from 'antd';

export default function LandingPage() {
	return (
		<div className='landing'>
			<div>
				<div className='d-flex flex-column align-items-center'>
					<h2
						style={{ color: 'black', fontSize: '130px', textAlign: 'center' }}
					>
						Find My DJ
					</h2>
					<h1 style={{ color: 'black', fontStyle: 'italic' }}>
						<q>Jedno miejsce, wielu artystów</q>
					</h1>
					<Link to='/app'>
						<Button className='primary-button mt-5'>Zaczynajmy!</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
