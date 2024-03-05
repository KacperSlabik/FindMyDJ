const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const User = require('../models/userModel');
const Dj = require('../models/djModel');
const Booking = require('../models/bookingModel');
const geolib = require('geolib');

/**
 * Pobierz informacje o DJ-u na podstawie identyfikatora użytkownika.
 *
 * @swagger
 * /api/dj/get-dj-info-by-user-id:
 *   post:
 *     summary: Pobierz informacje o DJ-u
 *     description: Pobiera informacje o DJ-u na podstawie identyfikatora użytkownika.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Identyfikator użytkownika.
 *             required:
 *               - userId
 *             example:
 *                 userId: "65157f54cc938694a1c5e1a6"
 *     responses:
 *       200:
 *         description: DJ istnieje w bazie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o wyniku operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: object
 *                   description: Informacje o DJ-u.
 *       404:
 *         description: DJ nie istnieje w bazie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku DJ-a w bazie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Obiekt zawierający szczegóły błędu.
 */

router.post('/get-dj-info-by-user-id', authMiddleware, async (req, res) => {
	try {
		const dj = await Dj.findOne({ userId: req.body.userId })
			.select('-createdAt -updatedAt -activeSessions')
			.lean();

		if (!dj) {
			return res.status(404).send({
				message: 'DJ nie istnieje w bazie.',
				success: false,
			});
		}

		return res
			.status(200)
			.send({ message: 'DJ istnieje w bazie.', success: true, data: dj });
	} catch (error) {
		return res.status(500).send({
			message: 'Błąd pobrania informacji DJ-a!',
			success: false,
			error,
		});
	}
});

/**
 * Pobierz informacje o DJ-u na podstawie identyfikatora DJ-a.
 *
 * @swagger
 * /api/dj/get-dj-info-by-id:
 *   post:
 *     summary: Pobierz informacje o DJ-u
 *     description: Pobiera informacje o DJ-u na podstawie identyfikatora DJ-a.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               djId:
 *                 type: string
 *                 description: Identyfikator DJ-a.
 *             required:
 *               - djId
 *             example:
 *                 djId: "65bc20bd31cee0893fcd8023"
 *     responses:
 *       200:
 *         description: DJ istnieje w bazie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o wyniku operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: object
 *                   description: Informacje o DJ-u.
 *       404:
 *         description: DJ nie istnieje w bazie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku DJ-a w bazie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Obiekt zawierający szczegóły błędu.
 */

router.post('/get-dj-info-by-id', authMiddleware, async (req, res) => {
	try {
		const dj = await Dj.findOne({ _id: req.body.djId }).select(
			'-email -phoneNumber -companyTIN -status -eventsPrice -createdAt -updatedAt -activeSessions'
		);

		if (!dj) {
			return res.status(404).send({
				message: 'DJ nie istnieje w bazie.',
				success: false,
			});
		}

		return res
			.status(200)
			.send({ message: 'DJ istnieje w bazie.', success: true, data: dj });
	} catch (error) {
		return res.status(500).send({
			message: 'Błąd pobrania informacji DJ-a!',
			success: false,
			error,
		});
	}
});

/**
 * Aktualizuj informacje o DJ-u na podstawie identyfikatora użytkownika.
 *
 * @swagger
 * /api/dj/update-dj:
 *   post:
 *     summary: Aktualizuj informacje o DJ-u
 *     description: Aktualizuje informacje o DJ-u na podstawie identyfikatora użytkownika.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dj'
 *     responses:
 *       200:
 *         description: Dane DJ-a zostały zaktualizowane.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o wyniku operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/Dj'
 *       404:
 *         description: DJ nie istnieje w bazie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku DJ-a w bazie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Obiekt zawierający szczegóły błędu.
 */

router.post('/update-dj', authMiddleware, async (req, res) => {
	try {
		const dj = await Dj.findOneAndUpdate({ userId: req.body.userId }, req.body);

		if (!dj) {
			return res.status(404).send({
				message: 'DJ nie istnieje w bazie.',
				success: false,
			});
		}

		return res.status(200).send({
			message: 'Dane DJ-a zostały zaktualizowane.',
			success: true,
			data: dj,
		});
	} catch (error) {
		return res.status(500).send({
			message: 'Błąd aktualizowania informacji DJ-a!',
			success: false,
			error,
		});
	}
});

/**
 * Pobierz wszystkie zlecenia dla DJ-a na podstawie jego identyfikatora użytkownika.
 *
 * @swagger
 * /api/dj/get-bookings-by-dj-id:
 *   get:
 *     summary: Pobierz zlecenia dla DJ-a
 *     description: Pobiera wszystkie zlecenia dla aktualnie zalogowanego DJ-a na podstawie jego identyfikatora użytkownika.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pomyślnie pobrano wszystkie zlecenia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o wyniku operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       404:
 *         description: DJ nie istnieje w bazie danych.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku DJ-a w bazie danych.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Obiekt zawierający szczegóły błędu.
 */

router.get('/get-bookings-by-dj-id', authMiddleware, async (req, res) => {
	try {
		const dj = await Dj.findOne({ userId: req.body.userId });

		if (!dj) {
			return res.status(404).send({
				message: 'DJ nie istnieje w bazie danych.',
				success: false,
			});
		}
		const bookings = await Booking.find({ djId: dj._id }).select(
			'-userInfo.isDj -userInfo.isAdmin -userInfo.status -userInfo.seenNotifications -userInfo.unseenNotifications -userInfo.isBlocked -userInfo.createdAt -userInfo.updatedAt -djInfo.companyTIN -djInfo.averageRating -djInfo.status -djInfo.musicGenres -djInfo.offers -djInfo.eventTypes -djInfo.eventsPrice -djInfo.eventPhotos -djInfo.createdAt -djInfo.updatedAt'
		);

		return res.status(200).send({
			message: 'Pomyślnie pobrano wszystkie zlecenia.',
			success: true,
			data: bookings,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Błąd pobierania zleceń!',
			success: false,
			error,
		});
	}
});

/**
 * Zmień status rezerwacji.
 *
 * @swagger
 * /api/dj/change-booking-status:
 *   post:
 *     summary: Zmień status rezerwacji
 *     description: Zmienia status rezerwacji na podstawie przekazanych danych.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: Identyfikator rezerwacji.
 *                 example: "65ca9d6eb7ef8f4585ade46d"
 *               status:
 *                 type: string
 *                 description: Nowy status rezerwacji.
 *                 example: "Potwierdzona"

 *     responses:
 *       200:
 *         description: Pomyślnie zaaktualizowano status rezerwacji.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o wyniku operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *       404:
 *         description: Nie znaleziono rezerwacji o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Obiekt zawierający szczegóły błędu.
 */

router.post('/change-booking-status', authMiddleware, async (req, res) => {
	try {
		const { bookingId, status } = req.body;

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).send({
				message: 'Rezerwacja nie istnieje w bazie danych.',
				success: false,
			});
		}

		await Booking.findByIdAndUpdate(bookingId, { status });

		const user = await User.findOne({ _id: booking.userId });
		const currentDate = new Date();
		const unseenNotifications = user.unseenNotifications;

		if (status === 'Niepotwierdzona') {
			unseenNotifications.push({
				type: 'booking-not-confirmed',
				message: `DJ nie potwierdził rezerwacji w ciągu 48 godzin. Rezerwacja zostanie anulowana i usunięta.`,
				onClickPath: '/app/bookings',
				createdAt: currentDate,
			});
		} else if (status === 'Potwierdzona') {
			unseenNotifications.push({
				type: 'booking-confirmed',
				message: `DJ potwierdził Twoją rezerwację. Skontaktujcie się w celu ustalenia dalszych informacji. Życzymy udanej imprezy!`,
				onClickPath: '/app/bookings',
				createdAt: currentDate,
			});
		} else if (status === 'Odrzucona') {
			unseenNotifications.push({
				type: 'booking-rejected',
				message: `DJ odrzucił Twoją rezerwację. Przykro nam z tego powodu.`,
				onClickPath: '/app/bookings',
				createdAt: currentDate,
			});
		} else if (status === 'Zakończona') {
			unseenNotifications.push({
				type: 'booking-rejected',
				message: `Twoja rezerwacja ${bookingId} dobiegła końca. Nie zapomnij ocenić wybranego DJ-a!`,
				onClickPath: `/app/book-dj/${booking.djId}`,
				createdAt: currentDate,
			});
		} else {
			unseenNotifications.push({
				type: 'booking-status-change',
				message: `Status rezerwacji został zaaktualizowany na: ${status}`,
				onClickPath: '/app/bookings',
				createdAt: currentDate,
			});
		}

		await user.save();

		res.status(200).send({
			message: 'Pomyślnie zaaktualizowano status rezerwacji',
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd zmiany statusu rezerwacji!',
			success: false,
			error,
		});
	}
});

/**
 * Wyszukaj DJ-ów według lokalizacji.
 *
 * @swagger
 * /api/dj/search-djs-by-location:
 *   post:
 *     summary: Wyszukaj DJ-ów według lokalizacji
 *     description: Wyszukuje DJ-ów w pobliżu określonej lokalizacji.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userLocation:
 *                 type: string
 *                 description: Lokalizacja użytkownika, np. nazwa miasta.
 *               searchRadius:
 *                 type: number
 *                 description: Promień wyszukiwania w kilometrach.
 *     responses:
 *       200:
 *         description: Pomyślnie znaleziono DJ-ów w pobliżu.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 result:
 *                   type: array
 *                   description: Tablica zawierająca znalezionych DJ-ów w pobliżu.
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Identyfikator DJ-a.
 *                       userId:
 *                         type: string
 *                         description: Identyfikator użytkownika DJ-a.
 *                       firstName:
 *                         type: string
 *                         description: Imię DJ-a.
 *                       lastName:
 *                         type: string
 *                         description: Nazwisko DJ-a.
 *                       email:
 *                         type: string
 *                         description: Email DJ-a.
 *                       phoneNumber:
 *                         type: string
 *                         description: Numer telefonu DJ-a.
 *                       companyTIN:
 *                         type: string
 *                         description: NIP firmy DJ-a.
 *                       city:
 *                         type: string
 *                         description: Miasto DJ-a.
 *                       postalCode:
 *                         type: string
 *                         description: Kod pocztowy DJ-a.
 *                       djDescription:
 *                         type: string
 *                         description: Opis DJ-a.
 *                       alias:
 *                         type: string
 *                         description: Alias DJ-a.
 *                       status:
 *                         type: string
 *                         description: Status DJ-a.
 *                       musicGenres:
 *                         type: array
 *                         description: Gatunki muzyczne DJ-a.
 *                         items:
 *                           type: string
 *                       offers:
 *                         type: array
 *                         description: Oferty DJ-a.
 *                         items:
 *                           type: string
 *                       profileImage:
 *                         type: string
 *                         description: Zdjęcie profilowe DJ-a.
 *                       eventPhotos:
 *                         type: array
 *                         description: Zdjęcia z imprez DJ-a.
 *                         items:
 *                           type: object
 *                           properties:
 *                             photo:
 *                               type: string
 *                               description: Zdjęcie z imprezy.
 *                             name:
 *                               type: string
 *                               description: Nazwa zdjęcia.
 *                       facebook:
 *                         type: string
 *                         description: Profil Facebook DJ-a.
 *                       youtube:
 *                         type: string
 *                         description: Kanał YouTube DJ-a.
 *                       instagram:
 *                         type: string
 *                         description: Profil Instagram DJ-a.
 *                       tiktok:
 *                         type: string
 *                         description: Profil TikTok DJ-a.
 *                       averageRating:
 *                         type: number
 *                         description: Średnia ocena DJ-a.
 *                       rating:
 *                         type: number
 *                         description: Ocena DJ-a.
 *                       experience:
 *                         type: string
 *                         description: Doświadczenie DJ-a.
 *                       eventTypes:
 *                         type: array
 *                         description: Typy eventów obsługiwane przez DJ-a.
 *                         items:
 *                           type: string
 *                       eventsPrice:
 *                         type: string
 *                         description: Cena eventu DJ-a.
 *                       activeSessions:
 *                         type: array
 *                         description: Aktywne sesje DJ-a.
 *                         items:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                               description: Token sesji.
 *                             lastModified:
 *                               type: string
 *                               format: date-time
 *                               description: Data ostatniej modyfikacji.
 *                       distance:
 *                         type: number
 *                         description: Odległość w kilometrach od lokalizacji użytkownika.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: string
 *                   description: Szczegóły błędu.
 */

router.post('/search-djs-by-location', authMiddleware, async (req, res) => {
	try {
		const userLocation = req.body.userLocation;
		const searchRadius = req.body.searchRadius;

		const userCoordinates = await geocodeCity(userLocation);

		const allDJs = await Dj.find({ status: 'Potwierdzony' }).select(
			'-email -phoneNumber -companyTIN -eventPhotos -createdAt -updatedAt -activeSessions'
		);

		const djCoordinatesPromises = allDJs.map(async (dj) => {
			const djCity = dj.city;
			return await geocodeCity(djCity, dj?.postalCode);
		});

		const djCoordinates = await Promise.all(djCoordinatesPromises);

		const nearbyDJs = allDJs
			.map((dj, index) => {
				if (djCoordinates[index] && userCoordinates) {
					const distanceInMeters = geolib.getDistance(
						userCoordinates,
						djCoordinates[index]
					);
					const distanceInKilometers = distanceInMeters / 1000;

					if (distanceInKilometers <= searchRadius) {
						return { ...dj._doc, distance: distanceInKilometers };
					}
				}
				return null;
			})
			.filter(Boolean);

		res.status(200).json({ success: true, result: nearbyDJs });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

/**
 * Prześlij zdjęcie profilowe DJ-a.
 *
 * @swagger
 * /api/dj/upload-profile-image:
 *   post:
 *     summary: Prześlij zdjęcie profilowe DJ-a
 *     description: Aktualizuje zdjęcie profilowe aktualnie zalogowanego DJ-a na podstawie przesłanego pliku.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Zdjęcie profilowe w formacie base64.
 *                 example: "data:image/jpeg;base64,/9j/4QAC/+EAAv/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8IAEQgHKwrAAwEiAAIRAQMRAf/EADEAAQADAQEBAQEBAQEAAAAAAAAHCgsIBQkGBAIBAwEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAApt86SBzcSii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sj7MK+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm65nERUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUp9q156B//xABpEAAABQEBBg8KBg0ICAUDBQABAgMEBQYABwgREhVVExchNDZAYHN2laWytdPUFCIxMjdBdYCxtBg1UFZylBAWIzBCUVdhcHSz1dYgJDNSYnGBkSVDRFOSlqHFVGNkgoOTo8JFZYTExv/aAAgBAQABPwKsJqYLVtUlLLSRSlqKbKUpXzoClKEk5AAAAVwAABqAAeC2XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg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JzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVBc3ote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AEb39IH5Q/nVWOQq/wDjxSbE1EElDCYDAUUcr31WA2RxkWrLXXLn/pTwVtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFf6Eu0bLpEzAfp044444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444479OnHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHdYcccccccccccccccccccccccccccdmsFDhwVQDAjsiY1/8QAFBEBAAAAAAAAAAAAAAAAAAAA4P/aAAgBAgEBPwAaif/EABQRAQAAAAAAAAAAAAAAAAAAAOD/2gAIAQMBAT8AGon/2Q=="
 *     responses:
 *       200:
 *         description: Zdjęcie profilowe DJ-a zostało zaktualizowane.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o sukcesie operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *       404:
 *         description: Nie znaleziono DJ-a o podanym identyfikatorze użytkownika.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o niepowodzeniu operacji.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                    type: string
 *                    example: false
 *                    description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.post('/upload-profile-image', authMiddleware, async (req, res) => {
	try {
		const { userId, file } = req.body;

		const dj = await Dj.findOne({ userId });

		console.log(dj);

		if (!dj) {
			return res
				.status(404)
				.json({ message: 'Nie znaleziono DJ-a!', success: false });
		}

		dj.profileImage = file;
		await dj.save();

		return res.status(200).json({
			message: 'Zdjęcie profilowe DJ-a zostało zaktualizowane.',
			success: true,
		});
	} catch (error) {
		console.error('Błąd podczas aktualizacji zdjęcia profilowego DJ-a:', error);
		return res.status(500).json({ message: 'Wystąpił błąd serwera!' });
	}
});

/**
 * Prześlij zdjęcia z imprez dla DJ-a.
 *
 * @swagger
 * /api/dj/upload-events-photos:
 *   post:
 *     summary: Prześlij zdjęcia z imprez dla DJ-a
 *     description: Dodaje nowe zdjęcie z imprezy do kolekcji zdjęć DJ-a.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: Zdjęcie z imprezy w formacie base64.
 *                 example: "data:image/jpeg;base64,/9j/4QAC/+EAAv/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8IAEQgHKwrAAwEiAAIRAQMRAf/EADEAAQADAQEBAQEBAQEAAAAAAAAHCgsIBQkGBAIBAwEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAApt86SBzcSii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sii4Sj7MK+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9IP7NmUo+9rXExT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChT1XChTx8C5aKP/POgMMzf5/65Aw9+E9/TmMwo2sXXXKTjuzhMAAAAAAAAAAAAAAAAAAAAAAAAATBMP8A6nHIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoX3yaituoAAAAAAAAAAAAAAAAAAAAAAAA/k+A1gQZU1Xbfi+XxikLPtYIAAAAAAAAAAAAAAAAAAAAAAH20PoDVKsX10AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAAAAAAAAAAAAAAAAAAAFZKzaMMDkbc1ynT4WAAAAAAAAAAAAAAAAAAAAA/q09K8s7lK7+UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqMW4Kj9uAAAAAAAAAAAAAAAAAAAAAAAAAAAAR9IIye6xe+Zk8lbkAAAAAAAAAAAAAAAAAACXYi0IC0ZjcaC+cGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhqZRixfKTapxmyOgAAAAAAAAAAAAAAAAAfQTairayAZwfzfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFDa+T+IMD59A/n4AAAAAAAAAAAAAAAALAHwX2aD665HekJipn8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqMW4Kj9uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAprZmG9thxHMwAAAAAAAAAAAAAAB0EWt9L/ln9WZ6lK2YYeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqMW4Kj9uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZtekp8DjH4AAAAAAAAAAAAAAA0daZO0gfqaPV3TExPnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAABSmLJUB4yf/DZtYyQ2bWMkNm1jJDZtYyQ2bWMkNm1jJDZtYyQ2bf6cYkbYHX+EB/0392HFYVNQh8HvvCAAAAAAAAAPz/6AYPUGWP64AAAAAAAAAAAAAALKRdfsjhWbya7FFdcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlVaquU8VaAAAAAAAAAAAf9t9VBBvl/rc07SxAAAAAAAAAM+KhJqW5aQAAAAAAAAAAAAB+s2laZmjUPlp9S81Ape/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAP7dpfFbvbmiCAAAAAAAAD4g44u4Ph8AAAAAAAAAAAADqzlPTJLWc+Bz/hybp/FZiTttgYk7bH+fhkdrGVc0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlPasOU8VaAAAAAAAAAAAAPuB8P8AoQ3dAAAAAAAAAQ9g0b9mAuf+YAAAAAAAAAAB/s+v2zD8HvvuAAAAfnMXraozpCjEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAGU9qw5TxVoAAAAAAAAAAAA/1/kb5v6uF5oAAAAAAAAGBJvt4FJ+dAAAAAAAAAAAtTVn9rQ7+AAAAAoG38qBpn8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlPasOU8VaAAAAAAAAAAAAAbxc2wlNoAAAAAAAAwKd9bApPzoAAAAAAAAAB24XBdBeJpZAAAAAFA2/lQNM/kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1GLcFR+3AAAAAAAAAMp7VhynirQAAAAAAAAAAAADeLm2EptAAAAAAAAGBTvrYFJ+dAAAAAAAAAA1HKVOxUf0AAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAAD+z+O3yXUvtaAAAAAACgbfyoGmfyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAGU9qw5TxVoAAAAAAAAAAAABvFzbCU2gAAAAAAADAp31sCk/OgAAAAAAAAmXbJqC3xAAAAAAABQNv5UDTP5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9rxfaJ35u6R5uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANRi3BUftwAAAAAAAADKe1Ycp4q0AAAAAAAAAAAAA3i5thKbQAAAAAAABgU762BSfnQAAAAAAAPoj87tW8sm/vAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAFgTXzzrNFQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAAYFO+tgUn50AAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAyntWHKeKtAAAAAAAAAAAAAN4ubYSm0AAAAAAAH5gryZJP1D+XgAAAAAAABek0VM6vRUAAAAAAAAFA2/lQNM/kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1GLcFR+3AAAAAAAAAMp7VhynirQAAAAAAAAAAAADeLm2EptAAAAAAAFIK21iXHPYAAAAAAAAL0mipnV6KgAAAAAAAAoG38qBpn8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlPasOU8VaAAAAAAAAAAAAAbxc2wlNoAAAAAAPkYUuaYHs+MAAAAAAAAAXpNFTOr0VAAAAAAAABQNv5UDTP5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9rxfaJ35u6R5uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANRi3BUftwAAAAAAAADKe1Ycp4q0AAAAAAAAAAAAA3i5thKbQAAAAAD/ADkH3XMp0AAAAAAAAAAvSaKmdXoqAAAAAAAACgbfyoGmfyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAGU9qw5TxVoAAAAAAAAAAAABvFzbCU2gAAAACP5AoXFOD57gAAAAAAAAABek0VM6vRUAAAAAAAAFA2/lQNM/kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1GLcFR+3AAAAAAAAAMp7VhynirQAAAAAAAAAAAADeLm2HphAAAAAOLcTi0ZUUAAAAAAAAAAAL0mipnV6KgAAAAAAAAoG38qBpn8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlPasOU8VaAAAAAAAAAAAAP7P4+vTci9kAAAAHxG+1+OWfFD+QAAAAAAAAAAAL0mipnV6KgAAAAAAAAoG38qBpn8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAABlPasOU8VaAAAAAAAAAAAALD1eHRHL2IAAABEBV0y8e0+LAAAAAAAAAAAAC9JoqZ1eioAAAAAAAAKBt/KgaZ/IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqMW4Kj9uAAAAAAAAAZT2rDlPFWgAAAAAAAAAAAEo7dNWK62AAAAM9q49inkfAAAAAAAAAAAAAvSaKmdXoqAAAAAAAACgbfyoGmfyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAGWNqc1vTJJdcQEfhH7sfhH7sfhH7sfhH7sfhH7sfhH7sfhH7sfhH7v+kjt0f1+fLFahsLGdvop2ruiAAAAAV+ylHVn/1/kAAAAAAAAAAAAAvSaKmdXoqAAAAAAAACgbfyoGmfyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCo/bgAAAAAAAAAAAAAAAAAAAAAAAAAPHxk7o+aIAAAAAAAAAAAAAAXpNFTOr0VAAAAAAAABQNv5UDTP5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9rxfaJ35u6R5uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANRi3BUftwAAAAAAAAAAAAAAAAAAAAAAAADnzoPOGKknLYPU8u5IfJ74eXRqXIAAAAAAAAAAABek0VM6vRUAAAAAAAAFA2/lQNM/kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1GLcFR+3AAAAAAAAAAAAAAAAAAAAAAAAAfL3FxsOVuwCeNs6ozeYM02lzdGpcgAAAAAAAAAAAF6TRUzq9FQAAAAAAAAUDb+VA0z+QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADUYtwVH7cAAAAAAAAAAAAAAAAAAAAAAAArU2KcWk+ZQH0w+Z+s4WLf14ZptLm6NS5AAAAAAAAAAAAL0mipnV6KgAAAAAAAAoG38qBpn8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGoxbgqP24AAAAAAAAAAAAAAAAAAAAAAAcolRzOYnuBAfpiwvrd/Lj6jgGabS5ujUuQAAAAAAAAAAAC9JoqZ1eioAAAAAAAAKBt/KgaZ/IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqMW4Kj9uAAAAAAAAAAAAAAAAAAAAAAAZmd0nGfPKAu81J9tE6GABmm0ubo1LkAAAAAAAAAAAAvSaKmdXoqAAAAAAAACgbfyoGmfyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAajFuCoHb8AAAAAAAAAAAAAAAAAAAAAH/n/AOlVYpSfAsB9cC6LdD8X2gADNkpRXy6GgAAAAAAAAAAABe60PqFd9QAAAAAAAAUDb+Wf8UCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC9zof4S+xCfUcAAAAAAAAAAAAAAAAAAAAEcYpNxjPsAP9a9lKPVmAAAKXuaTshY3oAAAAAAAAAAABqDW8vkV9dQAAAAAAABnhaHuaiUtQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+3/ECyN2rTkFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbFyRTbGhNfSo5XjRxB2/lulYCKAfv/wABfOLj/wBCwAAA8fDk3M6KJnagAAAAAAAAAAdycN6KZeZ/sAAAAAAAABlT6rGOAfEYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS7EV0o0L5/fxHxAx2/tB8VwDtDbHq427wAAAB+Z/TDIlrw74FAIoeJWikAAAAAAAAJDuinxu11vAkoAAAAAAAAA/5hM7RGHMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+jamzetc8VALTGJqccAfbb4p7GJ9sv6wAAAAAAgyuRaqGdjwLqkDJD8jXTGRY10xkWNdMZFjXTGRY10xkizjqkjOp+zFr4c8dDgAAAAAAAAABVmyoLqNK4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+jJo92ZPO+fRTaohfuvwoJdLRWojxV2qAAAAAAAAAAAAAAAAAAAAAAAAAAP5/wCj4PGWzwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaOefbuOk9ZRN13IhP+AaEVOPaxJBAAAAAAAAAAAAAAAAAAAAAAAAAAAy5tB7EsPyoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP6S6VpEfNmveUvvk2AsBF120z/n/QAAAAAAAAAAAAAAAAAAAAAAAAAAPgqU4qh39f8AIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPa8X2id+bukebgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYyrm6zp9zcS62jSVAH2w+J43zP1maLpcn/QAAAAAAAAAAAAAAAAAAAAAAAADyCH8ZD6n1ngAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7Xi+0Tvzd0jzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfSDV2ry1sivl+dAABoEZ+43+Gd7obn9YAAAAAAAAAAAAAAAAAAAAAAB+QP0WZf+JqNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATLDVyg+9+XR9JvmyAAAALOtYobtXR2G1pGlph/n/AEAAAAAAAAAAAAAAAAAAAAH8FPMsd5YXys53AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHteL7RO/N3SPNwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/VcM+NXzvIOAAAAAAB95L9eRgN/P/1xVbfheufOr6KgAAAAAAAAAAAAAAAB8zKqhfPrJ5zfzmPsP8eAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHYvHX+/8AAAAAAAAAD6V/NQXFfs9mmDYI+iuHEN972sBroI3Y2IH+2NsZiija6Yoo2umKKNrpiija6Yoo2umKKNrpiija6Yov8AGbYzEIhw3Q+P8PXyDYL+UmaeLhfwM+c4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm7pHm4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe14vtE783dI83AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2vF9onfm65nERUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUpW1hUp9q156B//xABpEAAABQEBBg8KBg0ICAUDBQABAgMEBQYABwgREhVVExchNDZAYHN2laWytdPUFCIxMjdBdYCxtBg1UFZylBAWIzBCUVdhcHSz1dYgJDNSYnGBkSVDRFOSlqHFVGNkgoOTo8JFZYTExv/aAAgBAQABPwKsJqYLVtUlLLSRSlqKbKUpXzoClKEk5AAAAVwAABqAAeC2XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg7622XJrO8pxg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JzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVlsvqrhJOdJuvVXba4Q35Lnhastl9VcJJzpN16q7bXCG/Jc8LVBc3ote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AEb39IH5Q/nVWOQq/wDjxSbE1EElDCYDAUUcr31WA2RxkWrLXXLn/pTwVtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFbRW0VtFf6Eu0bLpEzAfp044444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444479OnHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHdYcccccccccccccccccccccccccccdmsFDhwVQDAjsiY1/8QAFBEBAAAAAAAAAAAAAAAAAAAA4P/aAAgBAgEBPwAaif/EABQRAQAAAAAAAAAAAAAAAAAAAOD/2gAIAQMBAT8AGon/2Q=="
 *               name:
 *                 type: string
 *                 description: Nazwa zdjęcia.
 *                 example: "party.jpg"

 *     responses:
 *       200:
 *         description: Zdjęcia z imprez zostały pomyślnie dodane.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 result:
 *                   type: object
 *                   properties:
 *                     lastPhotoId:
 *                       type: string
 *                       description: Identyfikator ostatnio dodanego zdjęcia.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: string
 *                   description: Komunikat błędu.
 */

router.post('/upload-events-photos', authMiddleware, async (req, res) => {
	try {
		const dj = await Dj.findOne({ userId: req.body.userID });

		if (dj) {
			const newPhoto = {
				photo: req.body.file,
				name: req.body.name,
			};

			const result = await Dj.updateOne(
				{ _id: dj._id },
				{
					$push: { eventPhotos: newPhoto },
				}
			);

			const updatedDj = await Dj.aggregate([
				{ $match: { _id: dj._id } },
				{
					$project: { lastPhotoId: { $arrayElemAt: ['$eventPhotos._id', -1] } },
				},
			]);

			const lastPhotoId = updatedDj[0].lastPhotoId;

			res.json({ success: true, result: { lastPhotoId } });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, error: 'Błąd dodawania zdjęć!' });
	}
});

/**
 * Usuń zdjęcie z imprezy DJ-a.
 *
 * @swagger
 * /api/dj/delete-event-photo/{uid}:
 *   delete:
 *     summary: Usuń zdjęcie z imprezy DJ-a
 *     description: Usuwa określone zdjęcie z kolekcji zdjęć z imprez DJ-a na podstawie jego identyfikatora.
 *     tags:
 *       - DJs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: Identyfikator zdjęcia z imprezy.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zdjęcie z imprezy zostało pomyślnie usunięte.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat potwierdzający usunięcie zdjęcia.
 *       404:
 *         description: Nie znaleziono DJ-a zawierającego to zdjęcie lub nie znaleziono zdjęcia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Komunikat błędu.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Komunikat błędu.
 */

router.delete('/delete-event-photo/:uid', authMiddleware, async (req, res) => {
	const uid = req.params.uid;

	try {
		const dj = await Dj.findOne({ 'eventPhotos._id': uid });

		if (!dj) {
			return res
				.status(404)
				.json({ error: 'Nie znaleziono DJ-a zawierającego to zdjęcie!' });
		}
		const eventPhotoIndex = dj.eventPhotos.findIndex(
			(photo) => photo._id.toString() === uid
		);

		if (eventPhotoIndex === -1) {
			return res.status(404).json({ error: 'Nie znaleziono zdjęcia!' });
		}
		dj.eventPhotos.splice(eventPhotoIndex, 1);

		await dj.save();

		res.status(200).json({ message: 'Zdjęcie zostało pomyślnie usunięte.' });
	} catch (error) {
		console.error('Błąd podczas usuwania zdjęcia:', error);
		res.status(500).json({ error: 'Wystąpił błąd podczas usuwania zdjęcia!' });
	}
});

async function geocodeCity(city, postalcode) {
	let postal = '';
	if (postalcode) postal = `&postalcode=${postalcode}`;
	const response = await fetch(
		`https://nominatim.openstreetmap.org/search?format=json&city=${city}${postal}`
	);
	const data = await response.json();

	if (data.length === 0) {
		throw new Error(`Nie udało się znaleźć koordynatów dla miasta: ${city}`);
	}

	return {
		latitude: parseFloat(data[0].lat),
		longitude: parseFloat(data[0].lon),
	};
}

/**
 * Pobierz informacje o DJ-u na podstawie jego identyfikatora.
 *
 * @swagger
 * /api/dj/{djId}:
 *   get:
 *     summary: Pobierz informacje o DJ-u
 *     description: Pobiera informacje o DJ-u na podstawie jego identyfikatora.
 *     tags:
 *       - DJs
 *     parameters:
 *       - in: path
 *         name: djId
 *         required: true
 *         description: Identyfikator DJ-a.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sukces. Informacje o DJ-u zostały pobrane.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 data:
 *                   $ref: '#/components/schemas/Dj'
 *                   description: Informacje o DJ-u.
 *       404:
 *         description: Nie znaleziono DJ-a o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o niepowodzeniu.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.get('/:djId', authMiddleware, async (req, res) => {
	const { djId } = req.params;

	try {
		const dj = await Dj.findById(djId)
			.select(
				'-companyTIN -musicGenres -offers -status -eventTypes -eventsPrice -eventPhotos -createdAt -updatedAt -activeSessions'
			)
			.lean();

		if (!dj) {
			return res
				.status(404)
				.json({ success: false, message: 'Nie znaleziono DJ-a!' });
		}

		res.status(200).json({ success: true, data: dj });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Wystąpił błąd serwera' });
	}
});

module.exports = router;
