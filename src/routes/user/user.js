const express = require('express');
router = express.Router();

const prisma = require('../../prismaClient')

const { userVerificator } = require('../../middlewares/validators');
const passwordHash = require('../../middlewares/util/passwordHash');

router.get('/', async (_, res) => {
    try {
        const allUsers = (await prisma.users.findMany({
            include: {
                servers: true
            }
        })).map((value) => {
            delete value.hashed_password
            delete value.user_type

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
        const user = await prisma.users.findUnique({
            where: {
                id
            },
            include: {
                servers: true
            }
        })

        delete user.hashed_password
        delete value.user_type

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
        delete deleted.user_type

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

        delete updated.hashed_password
        delete updated.user_type

        return res.json(updated).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.patch('/admin/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const updated = await prisma.$transaction(async (prisma) => {
            const dataObj = {
                where: {
                    id
                },
                data: {
                    name: req.body.name,
                    surname: req.body.surname,
                    login: req.body.login,
                    hashed_password: req.body.password,
                    email: req.body.email,
                    phone_number: req.body.phone_number,
                    userType: parseInt(req.body.user_type)
                },
                include: {
                    servers: true
                }
            }
            
            const userTypeParsed = parseInt(req.body.user_type)

            if (!isNan(userTypeParsed)) {
                dataObj.data['userType'] = userTypeParsed
            }
    
            if (req.body.servers && !isNaN(userTypeParsed) && userTypeParsed >= 2) {
                dataObj.data['servers'] = {
                    connect: req.body.servers.map((value) => {
                        return {
                            id: value
                        }
                    })
                }
            }

            return prisma.users.update(dataObj)
        }).catch(err => {
            throw new Error(err)
        })

        delete updated.hashed_password
        delete updated.user_type

        return res.json(updated).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/register', userVerificator, passwordHash, async (req, res) => {
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
        delete created.user_type

        return res.json(created).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;