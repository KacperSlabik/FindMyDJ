const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const UserModel = require('./models/userModel');
const DjModel = require('./models/djModel');
const express = require('express');
const swaggerConfig = require('./config/swaggerConfig');
const app = express();
const ws = require('express-ws')(app);
const BookingModel = require('./models/bookingModel');
const User = require('./models/userModel');
const Dj = require('./models/djModel');
var bodyParser = require('body-parser');
const formData = require('express-form-data');
const mongoose = require('mongoose');
require('dotenv').config();
const dbConfig = require('./config/dbConfig');

async function checkTokenValidity() {
	try {
		const users = await UserModel.find();

		for (const user of users) {
			for (const session of user.activeSessions) {
				try {
					jwt.verify(session.token, process.env.JWT_SECRET);
				} catch (error) {
					session.token = '';
				}
			}
			await user.save();
		}

		console.log('Ważność tokenów została sprawdzona i zaktualizowana.');
	} catch (error) {
		console.error('Błąd podczas sprawdzania ważności tokenów:', error);
	}
}

cron.schedule('*/15 * * * *', () => {
	checkTokenValidity();
});

app.use(express.json({ limit: '50mb' }));
app.use(
	bodyParser.urlencoded({
		limit: '50mb',
		extended: true,
		parameterLimit: 50000,
	})
);

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const djRoute = require('./routes/djRoute');
const reviewRoute = require('./routes/reviewRoute');
const cors = require('cors');

app.use(cors());
app.use(formData.parse());
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/dj', djRoute);
app.use('/api/reviews', reviewRoute);

const server = app.listen(process.env.PORT || 5000, () =>
	console.log(`Serwer Node wystartował na porcie: ${server.address().port}`)
);

swaggerConfig(app);

const websocketConnections = new Map();

app.ws('/', (ws, req) => {
	console.log('Nowe połączenie WS zostało utworzone!');
	let userId;
	ws.on('message', (msg) => {
		const message = JSON.parse(msg);
		if (message.msg_type === 'INIT') {
			userId = message.user_id;
			websocketConnections.set(userId, ws);
			console.log(userId);
		}
	});
	ws.on('close', () => {
		websocketConnections.delete(userId);
		console.log('Połączenie zamknięte: ', userId);
	});
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
	console.log('Połączono z kolekcją bookings w MongoDB');
	const bookingChangeStream = db.collection('bookings').watch();
	bookingChangeStream.on('change', async (change) => {
		console.log('Wykryto zmianę w kolekcji bookings:', change);
		if (
			change.operationType === 'update' &&
			change.updateDescription &&
			change.updateDescription.updatedFields &&
			'status' in change.updateDescription.updatedFields
		) {
			const updatedBooking = await BookingModel.findById(
				change.documentKey._id
			);
			const userId = updatedBooking.userId;
			const dj = await Dj.findById(updatedBooking.djId);
			const djAsUser = await User.findById(dj.userId);
			const djId = djAsUser._id.toString();
			console.log(userId, websocketConnections.has(userId));
			console.log(djId, websocketConnections.has(djId));
			if (websocketConnections.has(userId)) {
				const userWs = websocketConnections.get(userId);
				userWs.send(JSON.stringify({ msg: 'reload' }));
				console.log('Wiadomość odświeżenia została wysłana do:', userId);
			}
			if (websocketConnections.has(djId)) {
				const djWs = websocketConnections.get(djId);
				djWs.send(JSON.stringify({ msg: 'reload' }));
				console.log('Wiadomość odświeżenia została wysłana do:', djId);
			}
		}
	});
});

module.exports = { app, server, db };
