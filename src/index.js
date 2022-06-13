require('dotenv').config()

const express = require('express')
const app = express()
const redis = require('./redis')

const cors = require('cors')

const PORT = process.env.PORT ?? 3000

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger-output.json')

if (process.env.NODE_ENV === 'development') {
  swaggerFile.host = "localhost:" + process.env.PORT
}
else {
  swaggerFile.host = "sem6-postgres-master.herokuapp.com"
}

const main = async () => {
  await redis.connect()
}

main()

const bodyParser = require('body-parser')

const routes = require('./routes');

app.use(cors({
  origin: '*'
}));

app.use(bodyParser())
app.use('/api/v1', routes)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})