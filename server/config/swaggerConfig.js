const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Find My DJ API',
			version: '1.0.0',
			description:
				'Backend aplikacji do rezerwacji DJ-ów na imprezy okolicznościowe',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Serwer lokalny',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
			schemas: {
				Review: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Identyfikator recenzji',
						},
						rating: {
							type: 'number',
							description: 'Ocena',
						},
						comment: {
							type: 'string',
							description: 'Komentarz',
						},
						userId: {
							type: 'string',
							description: 'Identyfikator użytkownika',
						},
						djId: {
							type: 'string',
							description: 'Identyfikator DJ-a',
						},
						likes: {
							type: 'array',
							items: {
								type: 'string',
							},
							description:
								'Lista identyfikatorów użytkowników, którzy polubili tę recenzję',
						},
						dislikes: {
							type: 'array',
							items: {
								type: 'string',
							},
							description:
								'Lista identyfikatorów użytkowników, którzy nie polubili tę recenzję',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							description: 'Data utworzenia recenzji',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							description: 'Data ostatniej aktualizacji recenzji',
						},
					},
				},
				Booking: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Identyfikator rezerwacji',
						},
						userId: {
							type: 'string',
							description: 'Identyfikator użytkownika',
						},
						djId: {
							type: 'string',
							description: 'Identyfikator DJ-a',
						},
						userInfo: {
							type: 'object',
							description: 'Informacje o użytkowniku',
						},
						djInfo: {
							type: 'object',
							description: 'Informacje o DJ-u',
						},
						startDate: {
							type: 'string',
							format: 'date-time',
							description: 'Data rozpoczęcia rezerwacji',
						},
						endDate: {
							type: 'string',
							format: 'date-time',
							description: 'Data zakończenia rezerwacji',
						},
						location: {
							type: 'string',
							description: 'Lokalizacja imprezy',
						},
						address: {
							type: 'string',
							description: 'Adres imprezy',
						},
						city: {
							type: 'string',
							description: 'Miasto imprezy',
						},
						postalCode: {
							type: 'string',
							description: 'Kod pocztowy imprezy',
						},
						partyType: {
							type: 'string',
							description: 'Rodzaj imprezy',
						},
						guests: {
							type: 'string',
							description: 'Liczba gości',
						},
						ageRange: {
							type: 'string',
							description: 'Przedział wiekowy uczestników',
						},
						musicGenres: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Gatunki muzyczne preferowane przez użytkownika',
						},
						additionalServices: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Dodatkowe usługi',
						},
						status: {
							type: 'string',
							description: 'Status rezerwacji',
							default: 'Oczekuje',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							description: 'Data utworzenia rezerwacji',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							description: 'Data ostatniej aktualizacji rezerwacji',
						},
					},
				},
				Dj: {
					type: 'object',
					properties: {
						userId: {
							type: 'string',
							description: 'Identyfikator użytkownika',
						},
						firstName: {
							type: 'string',
							description: 'Imię',
						},
						lastName: {
							type: 'string',
							description: 'Nazwisko',
						},
						email: {
							type: 'string',
							description: 'Email',
						},
						phoneNumber: {
							type: 'string',
							description: 'Numer telefonu',
						},
						companyTIN: {
							type: 'string',
							description: 'NIP firmy',
						},
						city: {
							type: 'string',
							description: 'Miasto',
						},
						postalCode: {
							type: 'string',
							description: 'Kod pocztowy',
						},
						djDescription: {
							type: 'string',
							description: 'Opis DJ-a',
						},
						alias: {
							type: 'string',
							description: 'Alias DJ-a',
						},
						status: {
							type: 'string',
							description: 'Status',
							default: 'Oczekuje',
						},
						musicGenres: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Gatunki muzyczne',
						},
						offers: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Oferty DJ-a',
						},
						profileImage: {
							type: 'string',
							description: 'Zdjęcie profilowe DJ-a',
						},
						eventPhotos: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									photo: {
										type: 'string',
										description: 'Zdjęcie z imprezy',
									},
									name: {
										type: 'string',
										description: 'Nazwa zdjęcia',
									},
								},
							},
							description: 'Zdjęcia z imprez',
						},
						facebook: {
							type: 'string',
							description: 'Profil Facebook DJ-a',
						},
						youtube: {
							type: 'string',
							description: 'Kanał YouTube DJ-a',
						},
						instagram: {
							type: 'string',
							description: 'Profil Instagram DJ-a',
						},
						tiktok: {
							type: 'string',
							description: 'Profil TikTok DJ-a',
						},
						averageRating: {
							type: 'number',
							description: 'Średnia ocena',
							default: 0,
						},
						rating: {
							type: 'number',
							description: 'Ocena',
							default: 0,
						},
						experience: {
							type: 'string',
							description: 'Doświadczenie',
						},
						eventTypes: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Typy eventów obsługiwane przez DJ-a',
						},
						eventsPrice: {
							type: 'string',
							description: 'Cena eventu',
						},
						activeSessions: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									token: {
										type: 'string',
										description: 'Token',
										default: '',
									},
									lastModified: {
										type: 'string',
										format: 'date-time',
										description: 'Data ostatniej modyfikacji',
										default: Date.now,
									},
								},
							},
							description: 'Aktywne sesje',
						},
					},
				},
				User: {
					type: 'object',
					properties: {
						firstName: {
							type: 'string',
							description: 'Imię',
						},
						lastName: {
							type: 'string',
							description: 'Nazwisko',
						},
						email: {
							type: 'string',
							description: 'Adres email',
						},
						password: {
							type: 'string',
							description: 'Hasło',
						},
						phoneNumber: {
							type: 'string',
							description: 'Numer telefonu',
						},
						city: {
							type: 'string',
							description: 'Miasto',
						},
						postalCode: {
							type: 'string',
							description: 'Kod pocztowy',
						},
						facebook: {
							type: 'string',
							description: 'Profil Facebook',
						},
						instagram: {
							type: 'string',
							description: 'Profil Instagram',
						},
						isDj: {
							type: 'boolean',
							description: 'Czy użytkownik jest DJ-em',
						},
						isAdmin: {
							type: 'boolean',
							description: 'Czy użytkownik jest administratorem',
						},
						status: {
							type: 'string',
							description: 'Status użytkownika',
							default: 'Aktywny',
						},
						seenNotifications: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Powiadomienia widziane przez użytkownika',
						},
						unseenNotifications: {
							type: 'array',
							items: {
								type: 'string',
							},
							description: 'Powiadomienia niewidziane przez użytkownika',
						},
						profileImage: {
							type: 'string',
							description: 'Zdjęcie profilowe',
						},
						verified: {
							type: 'boolean',
							description: 'Czy użytkownik jest zweryfikowany',
						},
						isBlocked: {
							type: 'boolean',
							description: 'Czy użytkownik jest zablokowany',
						},
						activeSessions: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									token: {
										type: 'string',
										description: 'Token sesji',
									},
									lastModified: {
										type: 'string',
										format: 'date-time',
										description: 'Data ostatniej modyfikacji',
									},
								},
							},
							description: 'Aktywne sesje użytkownika',
						},
					},
				},
				EventType: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Identyfikator typu wydarzenia',
						},
						name: {
							type: 'string',
							description: 'Nazwa typu wydarzenia',
						},
					},
				},
				MusicGenre: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Identyfikator gatunku muzycznego',
						},
						name: {
							type: 'string',
							description: 'Nazwa gatunku muzycznego',
						},
					},
				},
				Offer: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Identyfikator oferty',
						},
						name: {
							type: 'string',
							description: 'Nazwa oferty',
						},
					},
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: [
		'./routes/*.js',
		'./routes/userRoute.js',
		'./routes/adminRoute.js',
		'./routes/djRoute.js',
		'./routes/reviewRoute.js',
	],
	responses: {
		200: {
			description: 'Sukces - żądanie zostało pomyślnie zrealizowane',
		},
		400: {
			description: 'Nieprawidłowe żądanie - błąd klienta',
		},
		401: {
			description: 'Brak autoryzacji lub nieprawidłowy token JWT',
		},
		404: {
			description: 'Żądana ścieżka nie została odnaleziona',
		},
		500: {
			description: 'Wystąpił błąd po stronie serwera',
		},
		429: {
			description: 'Przekroczono limit żądań, spróbuj ponownie później',
		},
		503: {
			description: 'Usługa chwilowo niedostępna, spróbuj ponownie później',
		},
	},
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
