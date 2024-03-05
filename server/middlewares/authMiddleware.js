const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
	try {
		const authorizationHeader = req.headers['authorization'];
		if (!authorizationHeader) {
			return res.status(403).send({
				message: 'Dostęp zabroniony.',
				success: false,
			});
		}
		const token = authorizationHeader.split(' ')[1];
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				if (err.name === 'TokenExpiredError') {
					return res.status(401).send({
						message: 'Sesja wygasła. Zaloguj się ponownie.',
						success: false,
					});
				} else {
					return res.status(401).send({
						message: 'Błąd autoryzacji.',
						success: false,
					});
				}
			} else {
				req.body.userId = decoded.id;
				next();
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(401).send({
			message: 'Błąd autoryzacji.',
			success: false,
		});
	}
};
