const express = require('express');

const userRoutes = require('./user/user')



router = express.Router();

router.use('/users', userRoutes)

module.exports = router;