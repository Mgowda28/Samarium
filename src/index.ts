import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
const app = new Hono()

const prisma = new PrismaClient()

await prisma.country.createMany({
  data: [
    { name: 'Germany', countryCode: 'DE' },
    { name: 'France', countryCode: 'FR' },
    { name: 'Spain', countryCode: 'ES' },
  ]
})

// Retrieve countries from the database
const countries = await prisma.country.findMany()




// const countries: { name: string; countryCode: string }[] = []
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
 
app.get('/countries', (c) => {
  return c.json(countries)
})
 
app.post('/countries', async (c) => {
  const body = await c.req.json()
  countries.push(body)
  return c.json(body, 201)
})
 
app.patch('/countries/:countryCode', async (c) => {
  const countryCode = c.req.param('countryCode')
  const body = await c.req.json()
  const country = countries.find(c => c.countryCode === countryCode)
  if (country) {
    country.name = body.name
    return c.json(country)
  } else {
    return c.text('Country not found', 404)
  }
})
app.delete('/countries/:countryCode', (c) => {
  const countryCode = c.req.param('countryCode')
  const index = countries.findIndex(c => c.countryCode === countryCode)
  if (index !== -1) {
    countries.splice(index, 1)
    return c.text('Country deleted')
  } else {
    return c.text('Country not found', 404)
  }
})
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
