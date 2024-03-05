const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Dj = require('../models/djModel');
const Booking = require('../models/bookingModel');
const authMiddleware = require('../middlewares/authMiddleware');
const Offer = require('../models/offerModel');
const MusicGenre = require('../models/musicGenreModel');
const EventType = require('../models/eventTypesModel');

/**
 * Pobierz wszystkich DJ-ów.
 *
 * @swagger
 * /api/admin/get-all-djs:
 *   get:
 *     summary: Pobierz wszystkich DJ-ów
 *     description: Pobiera listę wszystkich DJ-ów z bazy danych.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pomyślnie pobrano DJ-ów.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym pobraniu DJ-ów.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dj'
 *       500:
 *         description: Błąd pobrania DJ-ów!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie pobierania DJ-ów.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.get('/get-all-djs', authMiddleware, async (req, res) => {
	try {
		const djs = await Dj.find({});
		res.status(200).send({
			message: 'Pomyślnie pobrano DJ-ów.',
			success: true,
			data: djs,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd pobrania DJ-ów!',
			success: false,
			error,
		});
	}
});

/**
 * Pobierz wszystkich użytkowników (bez administratorów).
 *
 * @swagger
 * /api/admin/get-all-users:
 *   get:
 *     summary: Pobierz wszystkich użytkowników (bez administratorów)
 *     description: Pobiera listę wszystkich użytkowników z bazy danych, pomijając administratorów.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pomyślnie pobrano użytkowników.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym pobraniu użytkowników.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Błąd pobrania użytkowników!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie pobierania użytkowników.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.get('/get-all-users', authMiddleware, async (req, res) => {
	try {
		const users = await User.find({ isAdmin: { $ne: true } });

		res.status(200).send({
			message: 'Pomyślnie pobrano użytkowników.',
			success: true,
			data: users,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd pobrania użytkowników!',
			success: false,
			error,
		});
	}
});

/**
 * Pobierz wszystkie rezerwacje.
 *
 * @swagger
 * /api/admin/get-all-bookings:
 *   get:
 *     summary: Pobierz wszystkie rezerwacje
 *     description: Pobiera listę wszystkich rezerwacji z bazy danych.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pomyślnie pobrano rezerwacje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym pobraniu rezerwacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Błąd pobrania rezerwacji!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie pobierania rezerwacji.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.get('/get-all-bookings', authMiddleware, async (req, res) => {
	try {
		const bookings = await Booking.find({});

		res.status(200).send({
			message: 'Pomyślnie pobrano rezerwacje.',
			success: true,
			data: bookings,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd pobrania rezerwacji!',
			success: false,
			error,
		});
	}
});

/**
 * Zmień status konta DJ-a.
 *
 * @swagger
 * /api/admin/change-dj-account-status:
 *   post:
 *     summary: Zmień status konta DJ-a
 *     description: Zmienia status konta DJ-a na podstawie podanych danych w ciele żądania.
 *     tags:
 *       - Admin
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
 *                 description: Identyfikator DJ-a, którego konto ma zostać zmienione.
 *               status:
 *                 type: string
 *                 description: Nowy status konta DJ-a ("Potwierdzony", "Odrzucony", "W oczekiwaniu").
 *             example:
 *               djId: "65bc20bd31cee0893fcd8023"
 *               status: "Potwierdzony"
 *     responses:
 *       200:
 *         description: Pomyślnie zaaktualizowano status DJ-a.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zaaktualizowaniu statusu DJ-a.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/Dj'
 *       500:
 *         description: Błąd zmiany statusu DJ-a!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie zmiany statusu DJ-a.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.post('/change-dj-account-status', authMiddleware, async (req, res) => {
	try {
		const { djId, status } = req.body;
		const dj = await Dj.findByIdAndUpdate(djId, { status });

		const user = await User.findOne({ _id: dj.userId });

		const currentDate = new Date();

		const unseenNotifications = user.unseenNotifications;
		unseenNotifications.push({
			type: 'new-dj-request-changed',
			message: `Zmieniono status dla twojego konta DJ na: ${status}`,
			onClickPath: '/app/notifications',
			createdAt: currentDate,
		});
		user.isDj = status === 'Potwierdzony' ? true : false;
		await user.save();

		res.status(200).send({
			message: 'Pomyślnie zaaktualizowano status DJ-a.',
			success: true,
			data: dj,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd zmiany statusu DJ-a!',
			success: false,
			error,
		});
	}
});

/**
 * @swagger
 * /api/revoke-dj-status:
 *   post:
 *     summary: Wycofanie statusu DJ-a
 *     description: Endpoint służący do wycofania statusu DJ-a użytkownika.
 *     tags:
 *       - Admin
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
 *                 description: ID użytkownika, któremu ma zostać wycofany status DJ-a.
 *                 example: "65ca721d7fc31232aaad0b05"
 *     responses:
 *       200:
 *         description: Status DJ-a został pomyślnie wycofany.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status DJ-a został pomyślnie wycofany.
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Wystąpił błąd podczas wycofywania statusu DJ-a.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wystąpił błąd podczas wycofywania statusu DJ-a!
 *                 success:
 *                   type: boolean
 *                   example: false
 */

router.post('/revoke-dj-status', authMiddleware, async (req, res) => {
	try {
		const { djId } = req.body;

		await User.findByIdAndUpdate(
			djId,
			{ $set: { isDj: false } },
			{ new: true }
		);

		await Dj.findOneAndDelete({ userId: djId });

		res.status(200).json({
			message: 'Status DJ-a został pomyślnie wycofany.',
			success: true,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Wystąpił błąd podczas wycofywania statusu DJ-a!',
			success: false,
		});
	}
});

/**
 * Zablokuj użytkownika.
 *
 * @swagger
 * /api/admin/block-user:
 *   post:
 *     summary: Zablokuj użytkownika
 *     description: Blokuje użytkownika na podstawie przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToBlock:
 *                 type: string
 *                 description: Identyfikator użytkownika do zablokowania.
 *             example:
 *               userIdToBlock: "65ca721d7fc31232aaad0b00"
 *     responses:
 *       200:
 *         description: Użytkownik został zablokowany pomyślnie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zablokowaniu użytkownika.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Użytkownik nie istnieje!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku istnienia użytkownika.
 *       500:
 *         description: Błąd blokowania użytkownika!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie blokowania użytkownika.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.post('/block-user', authMiddleware, async (req, res) => {
	try {
		const { userIdToBlock } = req.body;

		const updatedUser = await User.findOneAndUpdate(
			{ _id: userIdToBlock },
			{ $set: { isBlocked: true, status: 'Zablokowany' } },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: 'Użytkownik nie istnieje!',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Użytkownik został zablokowany pomyślnie.',
			data: updatedUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Błąd blokowania użytkownika!',
			error,
		});
	}
});

/**
 * Odblokuj użytkownika.
 *
 * @swagger
 * /api/admin/unblock-user:
 *   post:
 *     summary: Odblokuj użytkownika
 *     description: Odblokowuje użytkownika na podstawie przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToUnblock:
 *                 type: string
 *                 description: Identyfikator użytkownika do odblokowania.
 *             example:
 *               userIdToUnblock: "65ca721d7fc31232aaad0b00"
 *     responses:
 *       200:
 *         description: Użytkownik został odblokowany pomyślnie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym odblokowaniu użytkownika.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Użytkownik nie istnieje!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku istnienia użytkownika.
 *       500:
 *         description: Błąd odblokowania użytkownika!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie odblokowania użytkownika.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.post('/unblock-user', authMiddleware, async (req, res) => {
	try {
		const { userIdToUnblock } = req.body;

		const updatedUser = await User.findOneAndUpdate(
			{ _id: userIdToUnblock },
			{ $set: { isBlocked: false, status: 'Aktywny' } },
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: 'Użytkownik nie istnieje!',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Użytkownik został odblokowany pomyślnie.',
			data: updatedUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Błąd odblokowania użytkownika!',
			error,
		});
	}
});

/**
 * Usuń użytkownika.
 *
 * @swagger
 * /api/admin/delete-user:
 *   post:
 *     summary: Usuń użytkownika
 *     description: Usuwa użytkownika na podstawie przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIdToDelete:
 *                 type: string
 *                 description: Identyfikator użytkownika do usunięcia.
 *             example:
 *               userIdToDelete: "65ca721d7fc31232aaad0b00"
 *     responses:
 *       200:
 *         description: Pomyślnie usunięto użytkownika.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym usunięciu użytkownika.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Nie znaleziono użytkownika.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia użytkownika.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Błąd usuwania użytkownika!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie usuwania użytkownika.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.post('/delete-user', authMiddleware, async (req, res) => {
	try {
		const { userIdToDelete } = req.body;
		console.log(userIdToDelete);

		const user = await User.findByIdAndDelete(userIdToDelete);

		if (!user) {
			return res.status(404).send({
				message: 'Nie znaleziono użytkownika!',
				success: false,
			});
		}

		res.status(200).send({
			message: 'Pomyślnie usunięto użytkownika.',
			success: true,
			data: user,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd usuwania użytkownika!',
			success: false,
			error,
		});
	}
});
/**
 * Usuń rezerwację.
 *
 * @swagger
 * /api/admin/delete-booking:
 *   post:
 *     summary: Usuń rezerwację
 *     description: Usuwa rezerwację na podstawie przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingIdToDelete:
 *                 type: string
 *                 description: Identyfikator rezerwacji do usunięcia.
 *             example:
 *               bookingIdToDelete: "65ca9d6eb7ef8f4585ade46d"
 *     responses:
 *       200:
 *         description: Pomyślnie usunięto rezerwację.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym usunięciu rezerwacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Nie znaleziono rezerwacji.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia rezerwacji.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *       500:
 *         description: Błąd usuwania rezerwacji!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie usuwania rezerwacji.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 error:
 *                   type: object
 *                   description: Szczegóły błędu.
 */

router.post('/delete-booking', authMiddleware, async (req, res) => {
	try {
		const { bookingIdToDelete } = req.body;
		const booking = await Booking.findByIdAndDelete(bookingIdToDelete);

		if (!booking) {
			return res.status(404).send({
				message: 'Nie znaleziono rezerwacji!',
				success: false,
			});
		}

		res.status(200).send({
			message: 'Pomyślnie usunięto rezerwację.',
			success: true,
			data: booking,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd usuwania rezerwacji!',
			success: false,
			error,
		});
	}
});

/**
 * Pobierz informacje o usługach.
 *
 * @swagger
 * /api/admin/service-info:
 *   get:
 *     summary: Pobierz informacje o usługach
 *     description: Pobiera informacje statystyczne dotyczące użytkowników, DJ-ów i rezerwacji.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pomyślnie pobrano informacje o usługach.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registeredUsers:
 *                   type: number
 *                   description: Liczba zarejestrowanych użytkowników.
 *                 users:
 *                   type: number
 *                   description: Całkowita liczba użytkowników.
 *                 loggedUsers:
 *                   type: number
 *                   description: Liczba zalogowanych użytkowników.
 *                 verifiedUsers:
 *                   type: number
 *                   description: Liczba zweryfikowanych użytkowników.
 *                 blockedUsers:
 *                   type: number
 *                   description: Liczba zablokowanych użytkowników.
 *                 djs:
 *                   type: number
 *                   description: Całkowita liczba DJ-ów.
 *                 confirmedDjs:
 *                   type: number
 *                   description: Liczba potwierdzonych DJ-ów.
 *                 blockedDjs:
 *                   type: number
 *                   description: Liczba zablokowanych DJ-ów.
 *                 pendingConfirmationDjs:
 *                   type: number
 *                   description: Liczba DJ-ów oczekujących na potwierdzenie.
 *                 confirmedBookings:
 *                   type: number
 *                   description: Liczba potwierdzonych rezerwacji.
 *                 activeBookings:
 *                   type: number
 *                   description: Liczba trwających rezerwacji.
 *                 pendingBookings:
 *                   type: number
 *                   description: Liczba rezerwacji oczekujących.
 *                 rejectedBookings:
 *                   type: number
 *                   description: Liczba odrzuconych rezerwacji.
 *                 unconfirmedBookings:
 *                   type: number
 *                   description: Liczba niepotwierdzonych rezerwacji.
 *                 canceledBookings:
 *                   type: number
 *                   description: Liczba anulowanych rezerwacji.
 *                 endedBookings:
 *                   type: number
 *                   description: Liczba zakończonych rezerwacji.
 *                 bookings:
 *                   type: number
 *                   description: Całkowita liczba rezerwacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Komunikat informujący o błędzie.
 */

router.get('/service-info', authMiddleware, async (req, res) => {
	try {
		const usersQuery = await User.find({ isAdmin: false });
		const users = usersQuery.length;

		const loggedUsers = usersQuery.filter((user) => {
			return user.activeSessions.some((session) => session.token.trim() !== '');
		}).length;
		const verifiedUsers = usersQuery.filter((user) => user.verified).length;
		const blockedUsers = usersQuery.filter((user) => user.isBlocked).length;
		const djs = await Dj.find();
		const confirmedDjs = djs.filter(
			(dj) => dj.status === 'Potwierdzony'
		).length;
		const blockedDjs = djs.filter((dj) => dj.status === 'Zablokowany').length;
		const pendingConfirmationDjs = djs.filter(
			(dj) => dj.status === 'Oczekujący'
		).length;
		const registeredUsers = users;
		const bookings = await Booking.find();
		const confirmedBookings = bookings.filter(
			(booking) => booking.status === 'Potwierdzona'
		).length;
		const activeBookings = bookings.filter(
			(booking) => booking.status === 'Trwająca'
		).length;
		const pendingBookings = bookings.filter(
			(booking) => booking.status === 'Oczekuje'
		).length;
		const rejectedBookings = bookings.filter(
			(booking) => booking.status === 'Odrzucona'
		).length;
		const canceledBookings = bookings.filter(
			(booking) => booking.status === 'Anulowana'
		).length;
		const unconfirmedBookings = bookings.filter(
			(booking) => booking.status === 'Niepotwierdzona'
		).length;
		const endedBookings = bookings.filter(
			(booking) => booking.status === 'Zakonczona'
		).length;

		res.json({
			registeredUsers,
			users,
			loggedUsers,
			verifiedUsers,
			blockedUsers,
			djs: djs.length,
			confirmedDjs,
			blockedDjs,
			pendingConfirmationDjs,
			confirmedBookings,
			activeBookings,
			pendingBookings,
			rejectedBookings,
			unconfirmedBookings,
			canceledBookings,
			endedBookings,
			bookings: bookings.length,
		});
	} catch (error) {
		console.error('Błąd pobierania danych:', error);
		res.status(500).json({
			error: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Dodaj nową ofertę.
 *
 * @swagger
 * /api/admin/add-offer:
 *   post:
 *     summary: Dodaj nową ofertę
 *     description: Dodaje nową ofertę na podstawie przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa oferty.
 *           example:
 *             name: "Strój misia polarnego"
 *     responses:
 *       201:
 *         description: Pomyślnie dodano ofertę.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym dodaniu oferty.
 *       400:
 *         description: Nieprawidłowe żądanie - brak nazwy oferty lub oferta o podanej nazwie już istnieje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o konieczności podania unikalnej nazwy oferty.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.post('/add-offer', authMiddleware, async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({
				success: false,
				message: 'Nazwa oferty jest wymagana!',
			});
		}
		const existingOffer = await Offer.findOne({ name });

		if (existingOffer) {
			return res.status(400).json({
				success: false,
				message: 'Oferta o podanej nazwie już istnieje!',
			});
		}

		const offer = new Offer({ name });

		await offer.save();

		res.status(201).json({
			success: true,
			message: 'Pomyślnie dodano ofertę.',
		});
	} catch (error) {
		console.error('Błąd dodania oferty:', error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Edytuj ofertę.
 *
 * @swagger
 * /api/admin/edit-offer/{id}:
 *   put:
 *     summary: Edytuj ofertę
 *     description: Edytuje istniejącą ofertę na podstawie podanego identyfikatora i przesłanych danych w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator oferty do edycji.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nowa nazwa oferty.
 *             example:
 *               name: "Nowa oferta"
 *     responses:
 *       200:
 *         description: Pomyślnie edytowano ofertę.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/Offer'
 *                   description: Zaktualizowane informacje o ofercie.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zakończeniu edycji oferty.
 *       404:
 *         description: Nie znaleziono oferty o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia oferty.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.put('/edit-offer/:id', authMiddleware, async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	try {
		const offer = await Offer.findByIdAndUpdate(id, { name }, { new: true });

		if (!offer) {
			return res
				.status(404)
				.json({ success: false, message: 'Nie znaleziono oferty!' });
		}

		return res.status(200).json({
			success: true,
			data: offer,
			message: 'Pomyślnie edytowano ofertę.',
		});
	} catch (error) {
		console.error('Błąd w edycji oferty:', error);
		return res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Usuń ofertę.
 *
 * @swagger
 * /api/admin/delete-offer/{id}:
 *   delete:
 *     summary: Usuń ofertę
 *     description: Usuwa ofertę na podstawie podanego identyfikatora.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator oferty do usunięcia.
 *     responses:
 *       200:
 *         description: Pomyślnie usunięto ofertę.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym usunięciu oferty.
 *       404:
 *         description: Nie znaleziono oferty o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia oferty.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.delete('/delete-offer/:id', authMiddleware, async (req, res) => {
	try {
		const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
		if (!deletedOffer) {
			return res.status(404).json({
				success: false,
				message: 'Nie znaleziono oferty!',
			});
		}
		res.json({
			success: true,
			message: 'Pomyślnie usunięto ofertę.',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Dodaj nowy gatunek muzyczny.
 *
 * @swagger
 * /api/admin/add-music-genre:
 *   post:
 *     summary: Dodaj nowy gatunek muzyczny
 *     description: Dodaje nowy gatunek muzyczny na podstawie przesłanej nazwy w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa nowego gatunku muzycznego.
 *           example:
 *             name: "Rock"
 *     responses:
 *       201:
 *         description: Pomyślnie dodano gatunek muzyczny.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym dodaniu gatunku muzycznego.
 *       400:
 *         description: Nieprawidłowe żądanie - brak nazwy gatunku muzycznego lub taki gatunek już istnieje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku nazwy gatunku muzycznego lub istnieniu takiego gatunku.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.post('/add-music-genre', authMiddleware, async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res.status(400).json({
				success: false,
				message: 'Nazwa gatunku muzycznego jest wymagana!',
			});
		}

		const existingMusicGenre = await MusicGenre.findOne({ name });

		if (existingMusicGenre) {
			return res.status(400).json({
				success: false,
				message: 'Gatunek muzyczny o podanej nazwie już istnieje!',
			});
		}

		const musicGenre = new MusicGenre({ name });

		await musicGenre.save();

		res.status(201).json({
			success: true,
			message: 'Pomyślnie dodano gatunek muzyczny.',
		});
	} catch (error) {
		console.error('Błąd dodania gatunku muzycznego:', error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Edytuj istniejący gatunek muzyczny.
 *
 * @swagger
 * /api/admin/edit-music-genre/{id}:
 *   put:
 *     summary: Edytuj istniejący gatunek muzyczny
 *     description: Edytuje istniejący gatunek muzyczny na podstawie jego identyfikatora i nowej nazwy przesłanej w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identyfikator gatunku muzycznego do edycji.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nowa nazwa gatunku muzycznego.
 *             example:
 *               name: "Pop"
 *     responses:
 *       200:
 *         description: Pomyślnie edytowano gatunek muzyczny.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/MusicGenre'
 *                   description: Zaktualizowane informacje o gatunku muzycznym.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zakończeniu operacji.
 *       404:
 *         description: Nie znaleziono gatunku muzycznego o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o nieznalezieniu gatunku muzycznego.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.put('/edit-music-genre/:id', authMiddleware, async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	try {
		const musicGenre = await MusicGenre.findByIdAndUpdate(
			id,
			{ name },
			{ new: true }
		);

		if (!musicGenre) {
			return res.status(404).json({
				success: false,
				message: 'Nie znaleziono gatunku muzycznego!',
			});
		}

		return res.status(200).json({
			success: true,
			data: musicGenre,
			message: 'Pomyślnie edytowano gatunek muzyczny.',
		});
	} catch (error) {
		console.error('Błąd w edycji gatunku muzycznego:', error);
		return res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Usuń istniejący gatunek muzyczny.
 *
 * @swagger
 * /api/admin/delete-music-genre/{id}:
 *   delete:
 *     summary: Usuń istniejący gatunek muzyczny
 *     description: Usuwa istniejący gatunek muzyczny na podstawie jego identyfikatora.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identyfikator gatunku muzycznego do usunięcia.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pomyślnie usunięto gatunek muzyczny.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zakończeniu operacji.
 *       404:
 *         description: Nie znaleziono gatunku muzycznego o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o nieznalezieniu gatunku muzycznego.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.delete('/delete-music-genre/:id', authMiddleware, async (req, res) => {
	try {
		const deletedMusicGenre = await MusicGenre.findByIdAndDelete(req.params.id);
		if (!deletedMusicGenre) {
			return res.status(404).json({
				success: false,
				message: 'Nie znaleziono gatunku muzycznego!',
			});
		}
		res.json({
			success: true,
			message: 'Pomyślnie usunięto gatunek muzyczny.',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Dodaj nowy typ imprezy.
 *
 * @swagger
 * /api/admin/add-event-type:
 *   post:
 *     summary: Dodaj nowy typ imprezy
 *     description: Dodaje nowy typ imprezy na podstawie przesłanej nazwy w ciele żądania.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nazwa nowego typu imprezy.
 *           example:
 *             name: "Koncert"
 *     responses:
 *       201:
 *         description: Pomyślnie dodano typ imprezy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym dodaniu typu imprezy.
 *       400:
 *         description: Nieprawidłowe żądanie - brak nazwy typu imprezy lub taki typ już istnieje.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku nazwy typu imprezy lub istnieniu takiego typu.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.post('/add-event-type', authMiddleware, async (req, res) => {
	try {
		const { name } = req.body;

		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: 'Nazwa typu imprezy jest wymagana!' });
		}

		const existingEventType = await EventType.findOne({ name });
		if (existingEventType) {
			return res
				.status(400)
				.json({ success: false, message: 'Typ imprezy już istnieje!' });
		}

		const eventType = new EventType({ name });
		await eventType.save();

		res
			.status(201)
			.json({ success: true, message: 'Pomyślnie dodano typ imprezy.' });
	} catch (error) {
		console.error('Błąd dodania typu imprezy:', error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Edytuj istniejący typ imprezy.
 *
 * @swagger
 * /api/admin/edit-event-type/{id}:
 *   put:
 *     summary: Edytuj istniejący typ imprezy
 *     description: Edytuje istniejący typ imprezy na podstawie przesłanej nazwy.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator typu imprezy do edycji.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nowa nazwa typu imprezy.
 *             example:
 *               name: "Chrzciny"
 *     responses:
 *       200:
 *         description: Pomyślnie edytowano typ imprezy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 data:
 *                   $ref: '#/components/schemas/EventType'
 *                   description: Zaktualizowany obiekt typu imprezy.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zakończeniu operacji.
 *       404:
 *         description: Nie znaleziono typu imprezy o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia typu imprezy.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.put('/edit-event-type/:id', authMiddleware, async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;

	try {
		const eventType = await EventType.findByIdAndUpdate(
			id,
			{ name },
			{ new: true }
		);

		if (!eventType) {
			return res.status(404).json({
				success: false,
				message: 'Nie znaleziono typu imprezy!',
			});
		}

		return res.status(200).json({
			success: true,
			data: eventType,
			message: 'Pomyślnie edytowano typ imprezy.',
		});
	} catch (error) {
		console.error('Błąd w edycji typu imprezy:', error);
		return res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

/**
 * Usuń istniejący typ imprezy.
 *
 * @swagger
 * /api/admin/delete-event-type/{id}:
 *   delete:
 *     summary: Usuń istniejący typ imprezy
 *     description: Usuwa istniejący typ imprezy na podstawie przekazanego identyfikatora.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator typu imprezy do usunięcia.
 *     responses:
 *       200:
 *         description: Pomyślnie usunięto typ imprezy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna informująca o sukcesie operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym zakończeniu operacji.
 *       404:
 *         description: Nie znaleziono typu imprezy o podanym identyfikatorze.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna informująca o niepowodzeniu operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o braku znalezienia typu imprezy.
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
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 */

router.delete('/delete-event-type/:id', authMiddleware, async (req, res) => {
	try {
		const deletedEventType = await EventType.findByIdAndDelete(req.params.id);
		if (!deletedEventType) {
			return res
				.status(404)
				.json({ success: false, message: 'Nie znaleziono typu imprezy!' });
		}
		res.json({
			success: true,
			message: 'Pomyślnie usunięto typ imprezy.',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie później.',
		});
	}
});

module.exports = router;
