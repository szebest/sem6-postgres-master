require('dotenv').config()

const express = require('express')
const app = express()
const redis = require('./redis')

const cors = require('cors')

const useragent = require('express-useragent');
const http = require("http");

const PORT = process.env.PORT ?? 3000

const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger-output.json')

if (process.env.NODE_ENV === 'development') {
  swaggerFile.host = "localhost:" + PORT
}
else {
  swaggerFile.host = "sem6-postgres-master.herokuapp.com"
  swaggerFile.schemes = [
    'https',
    'http'
  ]
}

const main = async () => {
  await redis.connect()
}

main()

const bodyParser = require('body-parser')

const routes = require('./routes');

app.use(useragent.express());

app.use(cors({
  origin: '*'
}));

app.use(bodyParser())

app.use(async (req, res, next) => {
  const url = 'http://scontent-waw1-1.xx.fbcdn.net/v/t1.18169-9/22491444_1226655814100694_655975440617869070_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=e3f864&_nc_ohc=_p7_hwNH3WoAX8Lx-K1&_nc_ht=scontent-waw1-1.xx&oh=00_AT-aZbrdfSYANhJrDp81W2lcrH7ln7VPRztBPYCut3DUCw&oe=62E2F35C'
  if (req._parsedUrl.pathname === '/docs') {
    res.set('Content-disposition', 'attachment; filename=docs.png');
    res.set('Content-Type', 'text/plain')
    await http.get(url, function(file) {
      console.log("Someone got a nice image")
      file.pipe(res);
      return res.status(200)
    });
  }
  else if (req.useragent.isOpera) {
    console.log("Someone got Operad")
    return res.json("OPERA XD").status(200)
  }
  else {
    next();
  }
})

app.use('/api/v1', routes)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})