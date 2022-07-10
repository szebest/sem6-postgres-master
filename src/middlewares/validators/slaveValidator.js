module.exports = ((req, res, next) => {
    const errors = []
    if (!req.body.server_url) {
        errors.push("server_url")
    }
    if (!req.body.parking_address) {
        errors.push("parking_address")
    }
    if (typeof req.body.parking_spaces !== 'number') {
        errors.push("parking_spaces")
    }
    if (typeof req.body.price_per_hour !== 'number') {
        errors.push("price_per_hour")
    }
    if (typeof req.body.price_per_overtime_hour !== 'number') {
        errors.push("price_per_overtime_hour")
    }
    if (typeof req.body.latitude !== 'number') {
        errors.push("latidute")
    }
    if (typeof req.body.longitude !== 'number') {
        errors.push("longitude")
    }

    if (errors.length > 0) {
        return res.send({ errors }).status(400)
    }

    next()
})