module.exports = ((req, res, next) => {
    const errors = []
    if (!req.body.name || req.body.name.length > 32) {
        errors.push("name")
    }
    if (!req.body.surname || req.body.surname.length > 32) {
        errors.push("surname")
    }
    if (!req.body.login || req.body.login.length < 5 || req.body.login.length > 32) {
        errors.push("login")
    }
    if (!req.body.password || req.body.password.length < 5 || req.body.password.length > 32) {
        errors.push("password")
    }
    if (!req.body.email) {
        errors.push("email")
    }
    if (!req.body.phone_number || req.body.phone_number != 9 || req.body.phone_number.split('').some((c) => (c < '0' && c > '9'))) {
        errors.push("phone_number")
    }

    if (errors.length > 0) {
        return res.send({ errors }).status(400)
    }

    next()
})