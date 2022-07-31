const jwt = require('jsonwebtoken');

module.exports = async (req, res, next, fallbackLevel = 3) => {
    const authHeader = req.headers['authorization']
    const authToken = authHeader && authHeader.split(' ')[1]

    const id = parseInt(req.params.id)

    if (authToken === null) return res.sendStatus(401)
    else {
        jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)

            if (id !== user.id && user.userType < fallbackLevel) {
                return res.sendStatus(403)
            }

            req.userLogin = user.login
            req.userId = user.id
            req.userType = user.userType
            next()
        })
    }
}