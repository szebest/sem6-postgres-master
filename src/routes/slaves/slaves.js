const express = require('express');
router = express.Router();

const prisma = require('../../prismaClient')

const { slaveVerificator } = require('../../middlewares/validators');

router.get('/', async (_, res) => {
    try {
        const allSlaves = (await prisma.slaves.findMany())

        return res.json(allSlaves).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const slave = await prisma.slaves.findUnique({
            where: {
                id
            }
        })

        return res.json(slave).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const deleted = await prisma.slaves.delete({
            where: {
                id
            }
        })

        return res.json(deleted).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.patch('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const updated = await prisma.users.update({
            where: {
                id
            },
            data: {
                server_URL: req.body.server_url
            }
        })

        return res.json(updated).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/', slaveVerificator, async (req, res) => {
    try {
        const created = await prisma.users.create({
            data: {
                server_URL: req.body.server_url
            },
            include: {
                servers: true
            }
        })

        return res.json(created).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;