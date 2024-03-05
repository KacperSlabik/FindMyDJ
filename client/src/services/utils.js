import moment from 'moment';
require('moment/locale/pl');

export const formatDateTime = (date, time) => {
	const month = date.$M + 1;
	const day = date.$D;

	const hour = time.$H;
	const minute = time.$m;

	return `${date.$y}-${formatDatePart(month)}-${formatDatePart(
		day
	)}T${formatDatePart(hour)}:${formatDatePart(minute)}:00`;
};

const formatDatePart = (part) => (part >= 10 ? part : '0' + part);
export const getRemainingTime = (startDate, days) => {
	const createdAt = moment(startDate);
	const now = moment();
	const duration = moment.duration(createdAt.add(days, 'days').diff(now));

	let countdownText = '';
	let isEnded = false;

	if (duration.asMilliseconds() >= 0) {
		const days = duration.days();
		const hours = duration.hours();
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		if (days > 0) {
			countdownText += `${days}d`;
		}

		if (hours > 0 || days > 0) {
			if (days > 0) {
				countdownText += ' ';
			}
			countdownText += `${hours}h`;
		}

		if (minutes > 0 || hours > 0 || days > 0) {
			if (days > 0 || hours > 0) {
				countdownText += ' ';
			}
			countdownText += `${minutes}m`;
		}

		if (seconds >= 0 || minutes > 0 || hours > 0 || days > 0) {
			if (days > 0 || hours > 0 || minutes > 0) {
				countdownText += ' ';
			}
			countdownText += `${seconds}s`;
		}
	} else {
		countdownText = '0s';
		countdownText = 'Przekroczono limit czasu';
		isEnded = true;
	}

	return [countdownText, isEnded, duration];
};
