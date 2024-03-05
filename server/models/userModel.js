const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
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
		password: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			default: '',
		},
		city: {
			type: String,
			default: '',
		},
		postalCode: {
			type: String,
			default: '',
		},
		facebook: {
			type: String,
			default: '',
		},
		instagram: {
			type: String,
			default: '',
		},
		isDj: {
			type: Boolean,
			default: false,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			default: 'Aktywny',
		},
		seenNotifications: {
			type: Array,
			default: [],
		},
		unseenNotifications: {
			type: Array,
			default: [],
		},
		profileImage: {
			type: String,
			default: '',
		},
		verified: {
			type: Boolean,
			default: false,
		},
		isBlocked: {
			type: Boolean,
			default: false,
		},
		activeSessions: [
			{
				token: {
					type: String,
					default: '',
				},
				lastModified: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
