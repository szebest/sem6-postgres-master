const express = require('express');
router = express.Router();

const prisma = require('../../prismaClient')

const { userVerificator } = require('../../middlewares/validators');
const passwordHash = require('../../middlewares/util/passwordHash');

const SERVER_SELECT = {
    server_URL: true,
    id: true,
    ownerId: false
}

const USER_SELECT = {
    id: true,
    created_at: true,
    name: true,
    surname: true,
    login: true,
    email: true,
    phone_number: true,
    hashed_password: false,
    user_type: false
}

router.get('/', async (_, res) => {
    try {
        const allUsers = (await prisma.users.findMany({
            select: {
                ...USER_SELECT,
                servers: {
                    select: SERVER_SELECT
                }
            }
        }))

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
            select: {
                ...USER_SELECT,
                servers: {
                    select: SERVER_SELECT
                }
            },
            where: {
                id
            },
        })

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
            select: {
                ...USER_SELECT
            },
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
            select: {
                ...USER_SELECT,
                servers: {
                    select: SERVER_SELECT
                }
            },
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
            }
        })

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
                select: {
                    ...USER_SELECT,
                    servers: {
                        select: SERVER_SELECT
                    }
                },
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
            select: {
                ...USER_SELECT,
                servers: {
                    select: SERVER_SELECT
                }
            },
            data: {
                name: req.body.name,
                surname: req.body.surname,
                login: req.body.login,
                hashed_password: req.body.password,
                email: req.body.email,
                phone_number: req.body.phone_number
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