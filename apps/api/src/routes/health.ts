import { Hono } from 'hono'

export const healthRoute = new Hono()

healthRoute.get('/', (c) => {
  return c.json({
    status: 'ok',
    version: process.env.npm_package_version ?? '0.1.0',
    ts: new Date().toISOString(),
  })
})
