const userRoutes = require('../routes/user')
var express = require('express');
router = express.Router();

router.use('/users', userRoutes)

module.exports = router;