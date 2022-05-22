const express = require('express');
router = express.Router();

const prisma = require('../prismaClient')

const validators = require('../middlewares/validators/');
const passwordHash = require('../middlewares/util/passwordHash');

router.get('/', async (_, res) => {
    try {
        const allUsers = (await prisma.users.findMany({
            include: {
                servers: true
            }
        })).map((value) => {
            delete value.hashed_password

            return value
        })

        return res.json(allUsers).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const user = await prisma.users.findFirst({
            where: {
                id
            },
            include: {
                servers: true
            }
        })

        delete user.hashed_password

        return res.json(user).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const deleted = await prisma.users.delete({
            where: {
                id
            }
        })

        delete deleted.hashed_password

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
        if (req.body.servers) {
            for (const server of req.body.servers){
                const serverId = parseInt(server)
                await prisma.slaves.update({
                    where: {
                        id: serverId
                    },
                    data: {
                        ownerId: id
                    }
                })
            }
        }

        const updated = await prisma.users.update({
            where: {
                id
            },
            data: {
                name: req.body.name,
                surname: req.body.surname,
                login: req.body.login,
                hashed_password: req.body.password,
                email: req.body.email,
                phone_number: req.body.phone_number
            },
            include: {
                servers: true
            }
        })

        return res.json(updated).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/register', validators.userVerificator, passwordHash, async (req, res) => {
    try {
        const created = await prisma.users.create({
            data: {
                name: req.body.name,
                surname: req.body.surname,
                login: req.body.login,
                hashed_password: req.body.password,
                email: req.body.email,
                phone_number: req.body.phone_number
            },
            include: {
                servers: true
            }
        })

        delete created.hashed_password

        return res.json(created).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;