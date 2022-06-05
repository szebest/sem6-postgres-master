module.exports = ((req, res, next) => {
    const errors = []
    if (!req.body.login) {
        errors.push("login")
    }
    if (!req.body.password) {
        errors.push("password")
    }

    if (errors.length > 0) {
        return res.send({ errors }).status(400)
    }

    next()
})