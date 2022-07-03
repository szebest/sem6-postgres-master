const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const authToken = authHeader && authHeader.split(' ')[1]

    if (authToken === null) return res.sendStatus(401)
    else {
        jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, slave) => {
            if (err) return res.sendStatus(403)

            if (slave.secret !== process.env.SLAVE_SECRET) return res.sendStatus(403)

            next()
        })
    }
}