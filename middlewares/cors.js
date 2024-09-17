const ACCEPTED_ORIGINS = [
	'http://localhost:4200',
];

export const corsMiddleware = (req, res, next) => {
    const origin = req.header('origin');

	if (ACCEPTED_ORIGINS.includes(origin)){
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}

    next();
}