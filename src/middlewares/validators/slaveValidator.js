module.exports = ((req, res, next) => {
    const errors = []
    if (!req.body.server_url) {
        errors.push("server_url")
    }
    if (!req.body.parking_address) {
        errors.push("parking_address")
    }

    if (errors.length > 0) {
        return res.send({ errors }).status(400)
    }

    next()
})