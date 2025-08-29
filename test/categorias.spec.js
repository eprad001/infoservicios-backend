import request from 'supertest'
import app from '../app.js'

// TESTEA RUTAS DE TIPO GET : ruta categorias
describe('API / categorias', () => {
  describe('GET /categorias', () => {
    it('Deberia retornar un estado 200', async () => {
      const response = await request(app).get('/categorias/')
      expect(response.statusCode).toBe(200)
    })
  })
})
