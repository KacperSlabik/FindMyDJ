const mongoose = require('mongoose');

const eventPhoto = new mongoose.Schema({
	photo: String,
	name: String,
});

const djSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		companyTIN: {
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
		djDescription: {
			type: String,
			required: true,
		},
		alias: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			default: 'Oczekuje',
		},
		musicGenres: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'music-genres',
			},
		],
		offers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'offers',
			},
		],
		profileImage: {
			type: String,
		},
		eventPhotos: {
			type: [eventPhoto],
		},
		facebook: {
			type: String,
		},
		youtube: {
			type: String,
		},
		instagram: {
			type: String,
		},
		tiktok: {
			type: String,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		experience: {
			type: String,
		},
		eventTypes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'event-types',
			},
		],
		eventsPrice: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const djModel = mongoose.model('djs', djSchema);
module.exports = djModel;
