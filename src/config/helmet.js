import helmet from 'helmet'

export const helmetMiddleware = (app) => {
  const isDev = process.env.NODE_ENV !== 'production'

  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
      crossOriginEmbedderPolicy: !isDev
    })
  )
}
