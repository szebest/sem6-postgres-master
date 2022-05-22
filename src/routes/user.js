const express = require('express');
router = express.Router();

const prisma = require('../prismaClient')

router.get('/', async (req, res) => {
    try {
        const allUsers = await prisma.users.findMany({
            include: {
                servers: true
            }
        })

        return res.json(allUsers).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;