const mongoose = require('mongoose');
const eventTypesSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
});

const eventTypesModel = mongoose.model('event-types', eventTypesSchema);
module.exports = eventTypesModel;
