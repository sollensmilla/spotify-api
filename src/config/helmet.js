import helmet from 'helmet'

export const helmetMiddleware = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  )
}
