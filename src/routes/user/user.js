const express = require('express');
router = express.Router();

const { redis } = require('../../redis')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = require('../../prismaClient')

const { passwordHash } = require('../../middlewares/util');

const { userVerificator, userLoginValidator } = require('../../middlewares/validators');
const { isAtLeastDatabaseAdminValidator,
    isSpecificUserValidator,
    isRefreshTokenValid } = require('../../middlewares/authorization');
        
const SERVER_SELECT = {
    server_URL: true,
    id: true,
    ownerId: false,
    parking_address: true
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

router.get('/', isAtLeastDatabaseAdminValidator, async (_, res) => {
    // #swagger.summary = 'Only database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */
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

router.get('/:id', isSpecificUserValidator, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to get',
    } */
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

router.delete('/:id', isSpecificUserValidator, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to delete',
    } */
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

router.patch('/admin/:id', isAtLeastDatabaseAdminValidator, async (req, res) => {
    // #swagger.summary = 'Only database admin can access this route, used for making an regular user a parking owner'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to patch',
    } */
    const id = parseInt(req.params.id)
    try {
        const updated = await prisma.$transaction(async (prisma) => {
            const dataObj = {
                select: {
                    ...USER_SELECT,
                    user_type: true,
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
            }
            
            const userTypeParsed = parseInt(req.body.user_type)

            if (!isNaN(userTypeParsed)) {
                dataObj.data['user_type'] = userTypeParsed
            }
    
            if (req.body.servers && req.body.servers.length > 0 && !isNaN(userTypeParsed) && userTypeParsed >= 2) {
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

router.patch('/:id', isSpecificUserValidator, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to patch',
    } */
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

router.post('/register', userVerificator, passwordHash, async (req, res) => {
    // #swagger.summary = 'Used for registering a new user'
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

router.post('/login', userLoginValidator, async (req, res) => {
    // #swagger.summary = 'Used for logging in'
    const { login, password } = req.body

    try {
        const user = (await prisma.users.findUnique({
            where: {
                login
            },
            select: {
                id: true,
                login: true,
                hashed_password: true,
                user_type: true
            }
        }))

        if (!user) {
            return res.sendStatus(404)
        }

        const samePasswords = await bcrypt.compare(password, user.hashed_password)

        if (samePasswords) {
            const accessToken = jwt.sign({ id: user.id, login: user.login, userType: user.user_type }, 
                process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.EXPIRES_IN })

            const value = await redis.get(user.id.toString());
            
            const refreshToken = value ?? jwt.sign({ id: user.id, login: user.login, userType: user.user_type }, 
                process.env.REFRESH_TOKEN_SECRET)

            await redis.setEx(user.id.toString(), 60, refreshToken) // TODO change this value later

            return res.send({ accessToken, refreshToken, user_type: user.user_type }).status(200)
        }
        else {
            return res.sendStatus(401)
        }
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

router.post('/refresh', isRefreshTokenValid, async (req, res) => {
    // #swagger.summary = 'Used for refreshing an access token with an provided refresh token'
    const { userLogin, userId, userType } = req

    try {
        const value = await redis.get(userId.toString());

        if (!value) {
            return res.sendStatus(401)
        }

        const accessToken = jwt.sign({ id: userId, login: userLogin, userType: userType }, 
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.EXPIRES_IN })
        
        return res.send({ accessToken }).status(200)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = router;