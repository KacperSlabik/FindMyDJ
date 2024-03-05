const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		djId: {
			type: String,
			required: true,
		},
		userInfo: {
			type: Object,
			required: true,
		},
		djInfo: {
			type: Object,
			required: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		postalCode: {
			type: String,
			required: true,
		},
		partyType: {
			type: String,
			required: true,
		},
		guests: {
			type: String,
			required: true,
		},
		ageRange: {
			type: String,
			required: true,
		},
		musicGenres: {
			type: [String],
			required: true,
		},
		additionalServices: {
			type: [String],
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: 'Oczekuje',
		},
	},
	{
		timestamps: true,
	}
);

const bookingModel = mongoose.model('bookings', bookingSchema);
module.exports = bookingModel;
