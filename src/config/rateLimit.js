import rateLimit from 'express-rate-limit'

export const securityMiddleware = (app) => {
    app.set('trust proxy', 1)

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    }))

    app.use('/graphql', rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        skip: (req) => {
            const query = req.body?.query || ''
            return query.includes('register') || query.includes('login')
        }
    }))
}
