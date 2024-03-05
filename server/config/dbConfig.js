const { error } = require('console');
const mongoose = require('mongoose');

const connect = mongoose.connect(process.env.MONGO_URI);

const connection = mongoose.connection;

connection.on('connected', () => {
	console.log('Połączono z MongoDB');
});

connection.on('error', () => {
	console.log('Błąd połączenia z MongoDB: ', error);
});

module.exports = mongoose;
