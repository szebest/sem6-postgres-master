const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authRefreshHeader = req.headers['authorization']
    const authRefreshToken = authRefreshHeader && authRefreshHeader.split(' ')[1]

    if (authRefreshToken === null) return res.sendStatus(401)
    else {
        jwt.verify(authRefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)

            req.userLogin = user.login
            req.userId = user.id
            req.userType = user.userType
            next()
        })
    }
}