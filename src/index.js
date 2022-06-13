require('dotenv').config()

const express = require('express')
const app = express()
const redis = require('./redis')

const PORT = process.env.PORT ?? 3000

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger-output.json')

const main = async () => {
  await redis.connect()
}

main()

const bodyParser = require('body-parser')

const routes = require('./routes');


app.use(bodyParser())
app.use('/api/v1', routes)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})