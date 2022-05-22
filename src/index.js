const express = require('express')
const app = express()
const PORT = process.env.PORT ?? 3000

var bodyParser = require('body-parser')

const routes = require('./routes');

app.use(bodyParser())
app.use('/api/v1', routes)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})