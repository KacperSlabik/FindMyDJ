import { Carousel } from 'antd';
import React from 'react';

function ImageCarousel({ photos }) {
	return (
		<Carousel className='dj-slider' autoplay fade>
			{photos.map((photo) => (
				<div className='dj-slider-slajd'>
					<img
						src={photo.photo}
						alt={'Galeria zdjęc DJ-a.'}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</div>
			))}
		</Carousel>
	);
}

export default ImageCarousel;
