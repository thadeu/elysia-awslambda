import { Elysia, Context } from 'elysia'
import { handle } from 'elysia-awslambda'

export const app = new Elysia()

app.get('/', async (c: Context) => {
  return c.status(200, { message: 'Hello, world!' })
})

app.get('/:token', async (c: Context) => {
  if (!c.params.token) {
    return c.status(400, { message: 'Token is required' })
  }

  return c.status(200, { message: 'Token found', token: c.params.token })
})

app.onError(({ error, code }) => {
  return {
    message: 'Something went wrong!',
    error,
  }
})

export default handle(app)
