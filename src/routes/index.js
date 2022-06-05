const express = require('express');

const userRoutes = require('./user/user')
const slaveRoutes = require('./slaves/slaves')



router = express.Router();

router.use('/users', userRoutes)
router.use('/slaves', slaveRoutes)

module.exports = router;