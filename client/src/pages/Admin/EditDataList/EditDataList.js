import React from 'react';
import { Tabs } from 'antd';
import Layout from '../../../components/Layout/Layout';
import EventTypesList from '../EventTypesList/EventTypesList';
import MusicGenresList from '../MusicGenresList/MusicGenresList';
import OffersList from '../OffersList/OffersList';

const { TabPane } = Tabs;

function EditDataList() {
	return (
		<Layout>
			<h1 className='page-title'>Edytuj dane</h1>
			<Tabs defaultActiveKey='musicGenres' tabBarGutter={16}>
				<TabPane tab='Gatunki muzyczne' key='musicGenres'>
					<MusicGenresList />
				</TabPane>
				<TabPane tab='Oferty dodatkowe' key='offers'>
					<OffersList />
				</TabPane>
				<TabPane tab='Typy imprez' key='eventTypes'>
					<EventTypesList />
				</TabPane>
			</Tabs>
		</Layout>
	);
}

export default EditDataList;
