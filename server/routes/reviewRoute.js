const Review = require('../models/reviewModel');
const router = require('express').Router();
const Dj = require('../models/djModel');
const User = require('../models/userModel');
const authMiddleware = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');

/**
 * Dodaj recenzję dla DJ-a.
 *
 * @swagger
 * /api/reviews/add-dj-review:
 *   post:
 *     summary: Dodaj recenzję dla DJ-a
 *     description: Dodaje recenzję dla DJ-a. Jeśli użytkownik już ocenił DJ-a, może edytować swoją recenzję.
 *     tags:
 *       - Reviews
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
 *                 example: 65157f54cc938694a1c5e1a6
 *               djId:
 *                 type: string
 *                 description: Identyfikator DJ-a.
 *                 example: 65ca76c94f58d3d951f63656
 *               rating:
 *                 type: number
 *                 description: Ocena.
 *                 example: 5
 *               comment:
 *                 type: string
 *                 description: Komentarz.
 *                 example: Pozytywny człowiek, jeszcze lepszy DJ! Super, jestem bardzo zadowolny z tego Pana!
 *     responses:
 *       200:
 *         description: Sukces. Recenzja została dodana lub zaktualizowana.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o powodzeniu operacji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna określająca sukces operacji.
 */

router.post('/add-dj-review', authMiddleware, async (req, res) => {
	try {
		const user = req.body.userId;
		const currentDate = new Date();
		const prevRating = await Review.find({
			djId: req.body.djId,
			userId: req.body.userId,
		});

		if (prevRating.length > 0 && !req.body.reviewId) {
			return res.status(500).json({
				message:
					'Juz oceniłeś aktualnego DJ-a. Jeśli chcesz mozesz edytować recenzje.',
				success: false,
			});
		}

		const dj = await Dj.findOne({ _id: req.body.djId });
		if (dj.userId === req.body.userId) {
			return res.status(500).json({
				message: 'Nie mozesz ocenić siebie!',
				success: false,
			});
		}

		let successMessage = '';
		if (req.body.reviewId) {
			const updatedReview = {
				rating: req.body.rating,
				comment: req.body.comment,
			};

			await Review.updateOne({ _id: req.body.reviewId }, updatedReview);
			successMessage = 'Pomyślnie zaktualizowano recenzję.';
		} else {
			const newReview = new Review({
				djId: req.body.djId,
				userId: req.body.userId,
				rating: req.body.rating,
				comment: req.body.comment,
			});

			await newReview.save();
			successMessage = 'Pomyślnie dodano recenzję.';
		}

		const djId = new mongoose.Types.ObjectId(req.body.djId);
		const averageRating = await Review.aggregate([
			{
				$match: { djId: djId },
			},
			{
				$group: {
					_id: '$djId',
					averageRating: { $avg: '$rating' },
				},
			},
		]);

		const averageRatingValue = averageRating[0]?.averageRating || 0;

		await Dj.findOneAndUpdate(
			{ _id: req.body.djId },
			{ averageRating: averageRatingValue }
		);

		const djAsUser = await User.findOne({ _id: dj.userId });
		const userById = await User.findById({ _id: user });

		djAsUser.unseenNotifications.push({
			message: `Otrzymałeś nową recenzję od uzytkownika ${userById?.firstName} ${userById?.lastName}`,
			onClickPath: `/app/book-dj/${req.body.djId}`,
			createdAt: currentDate,
		});
		await djAsUser.save();

		res.status(200).json({ message: successMessage, success: true });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}
});

/**
 * Pobierz recenzje dla danego DJ-a.
 *
 * @swagger
 * /api/reviews/get-dj-reviews:
 *   get:
 *     summary: Pobierz recenzje dla danego DJ-a
 *     description: Pobiera recenzje dla danego DJ-a na podstawie przesłanego identyfikatora DJ-a.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: djId
 *         schema:
 *           type: string
 *         required: true
 *         description: Identyfikator DJ-a, dla którego pobierane są recenzje.
 *     responses:
 *       200:
 *         description: Sukces. Zwraca listę recenzji dla danego DJ-a.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                   description: Lista recenzji dla danego DJ-a.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna określająca sukces operacji.
 */

router.get('/get-dj-reviews', authMiddleware, async (req, res) => {
	try {
		const { djId } = req.query;

		const reviews = await Review.find({ djId: djId })
			.populate({
				path: 'userId',
				select:
					'-profileImage -password -activeSessions -isAdmin -seenNotifications -unseenNotifications',
			})
			.populate('djId');

		res.status(200).json({ data: reviews, success: true });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}
});

/**
 * Pobierz wszystkie recenzje.
 *
 * @swagger
 * /api/reviews/get-all-reviews:
 *   get:
 *     summary: Pobierz wszystkie recenzje
 *     description: Pobiera wszystkie recenzje z bazy danych.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sukces. Zwraca listę wszystkich recenzji.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym pobraniu recenzji.
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                   description: Lista wszystkich recenzji.
 *       500:
 *         description: Wystąpił błąd po stronie serwera.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o błędzie serwera.
 *                 success:
 *                   type: boolean
 *                   example: false
 *                   description: Wartość logiczna określająca sukces operacji.
 */

router.get('/get-all-reviews', authMiddleware, async (req, res) => {
	try {
		const reviews = await Review.find();
		res.status(200).send({
			message: 'Pomyślnie pobrano recenzje.',
			success: true,
			data: reviews,
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			message: 'Błąd pobierania recenzji!',
			success: false,
			error,
		});
	}
});

/**
 * Usuń recenzję.
 *
 * @swagger
 * /api/reviews/delete-review/{id}:
 *   delete:
 *     summary: Usuń recenzję
 *     description: Usuwa recenzję o podanym identyfikatorze.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator recenzji do usunięcia.
 *     responses:
 *       200:
 *         description: Sukces. Recenzja została pomyślnie usunięta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym usunięciu recenzji.
 *       404:
 *         description: Nie znaleziono recenzji o podanym identyfikatorze.
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
 *                   description: Komunikat informujący o niepowodzeniu znalezienia recenzji.
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

router.delete('/delete-review/:id', authMiddleware, async (req, res) => {
	try {
		const deletedReview = await Review.findByIdAndDelete(req.params.id);
		if (!deletedReview) {
			return res
				.status(404)
				.json({ success: false, message: 'Nie znaleziono recenzji!' });
		}
		res.json({
			success: true,
			message: 'Recenzja została usunięta pomyślnie.',
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
 * Polub recenzję.
 *
 * @swagger
 * /api/reviews/like-review/{reviewId}:
 *   post:
 *     summary: Polub recenzję
 *     description: Dodaje polubienie do recenzji o podanym identyfikatorze przez aktualnie zalogowanego usera.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator recenzji, która ma zostać polubiona.
 *     responses:
 *       200:
 *         description: Sukces. Recenzja została pomyślnie polubiona.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym polubieniu recenzji.
 *       400:
 *         description: Recenzja została już oceniona pozytywnie przez użytkownika.
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
 *                   description: Komunikat informujący o już ocenionym pozytywnie recenzji.
 *       404:
 *         description: Nie znaleziono recenzji o podanym identyfikatorze.
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
 *                   description: Komunikat informujący o nieznalezieniu recenzji.
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

router.post('/like-review/:reviewId', authMiddleware, async (req, res) => {
	try {
		const userId = req.body.userId;
		const reviewId = req.params.reviewId;

		const review = await Review.findById(reviewId);

		if (!review) {
			return res
				.status(404)
				.json({ success: false, message: 'Recenzja nie została znaleziona.' });
		}
		if (review.likes.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'Recenzja została już oceniona pozytywnie',
			});
		}

		if (review.dislikes.includes(userId)) {
			await Review.findByIdAndUpdate(reviewId, {
				$pull: {
					dislikes: userId,
				},
			});
		}

		await Review.findByIdAndUpdate(reviewId, {
			$addToSet: { likes: userId },
		});
		res.json({
			success: true,
			message: 'Recenzja została oceniona pozytywnie',
		});
	} catch (error) {
		console.error('Błąd podczas dodawania polubienia:', error);
		res.status(500).json({ success: false, message: 'Wystąpił błąd serwera.' });
	}
});

/**
 * Nie lub recenzję.
 *
 * @swagger
 * /api/reviews/dislike-review/{reviewId}:
 *   post:
 *     summary: Nie lub recenzję
 *     description: Dodaje nielubienie do recenzji o podanym identyfikatorze przez aktualnie zalogowanego uzytkownika.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identyfikator recenzji, która ma zostać nie polubiona.
 *     responses:
 *       200:
 *         description: Sukces. Recenzja została pomyślnie nie polubiona.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Wartość logiczna określająca sukces operacji.
 *                 message:
 *                   type: string
 *                   description: Komunikat informujący o pomyślnym nie polubieniu recenzji.
 *       400:
 *         description: Recenzja została już oceniona negatywnie przez użytkownika.
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
 *                   description: Komunikat informujący o już ocenionym negatywnie recenzji.
 *       404:
 *         description: Nie znaleziono recenzji o podanym identyfikatorze.
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
 *                   description: Komunikat informujący o nieznalezieniu recenzji.
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

router.post('/dislike-review/:reviewId', authMiddleware, async (req, res) => {
	try {
		const userId = req.body.userId;
		const reviewId = req.params.reviewId;

		const review = await Review.findById(reviewId);

		if (!review) {
			return res
				.status(404)
				.json({ success: false, message: 'Recenzja nie została znaleziona.' });
		}
		if (review.dislikes.includes(userId)) {
			return res.status(400).json({
				success: false,
				message: 'Recenzja została już oceniona negatywnie',
			});
		}

		if (review.likes.includes(userId)) {
			await Review.findByIdAndUpdate(reviewId, {
				$pull: {
					likes: userId,
				},
			});
		}

		await Review.findByIdAndUpdate(reviewId, {
			$addToSet: { dislikes: userId },
		});
		res.json({
			success: true,
			message: 'Recenzja została oceniona negatywnie',
		});
	} catch (error) {
		console.error('Błąd podczas dodawania nielubienia:', error);
		res.status(500).json({ success: false, message: 'Wystąpił błąd serwera.' });
	}
});

module.exports = router;
