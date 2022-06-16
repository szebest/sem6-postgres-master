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
    isRefreshTokenValid, 
    hasUserValues} = require('../../middlewares/authorization');
        
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

router.get('/', isAtLeastDatabaseAdminValidator, hasUserValues, async (_, res) => {
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

router.get('/:id', isSpecificUserValidator, hasUserValues, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to get',
                "type": "integer"
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

router.delete('/:id', isSpecificUserValidator, hasUserValues, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to delete',
                "type": "integer"
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

router.patch('/admin/:id', isAtLeastDatabaseAdminValidator, hasUserValues, passwordHash, async (req, res) => {
    // #swagger.summary = 'Only database admin can access this route, used for making an regular user a parking owner'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to patch',
                "type": "integer"
    } */

    /*  #swagger.parameters['body'] = {
            "name": "body",
            "in": "body",
            "@schema": {
                "type": "object",
                "properties": {
                    "name": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "surname": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "login": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "password": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "email": {
                        "example": "string",
                        "type": "string"
                    },
                    "phone_number": {
                        "example": "string",
                        "type": "string",
                        "description": "Precise 9 numbers"
                    },
                    "user_type": {
                        "example": "3",
                        "type": "integer",
                        "description": "Number from 1 to 3. 1 is regular user, 2 is parking owner, 3 is administrator"
                    },
                    "servers": {
                        "example": "[1]",
                        "type": "array",
                        "description": "Array of ids of servers to connect to the user. Is set only when the user_type is provided and the value is >= 2",
                        "items": {
                            "id": {
                                "type": "integer"
                            }
                        }
                    }
                }
            }
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

router.patch('/:id', isSpecificUserValidator, hasUserValues, passwordHash, async (req, res) => {
    // #swagger.summary = 'The specific user with this id in params or database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the user to patch',
                "type": "integer"
    } */

    /*  #swagger.parameters['body'] = {
            "name": "body",
            "in": "body",
            "@schema": {
                "type": "object",
                "properties": {
                    "name": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "surname": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "login": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "password": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "email": {
                        "example": "string",
                        "type": "string"
                    },
                    "phone_number": {
                        "example": "string",
                        "type": "string",
                        "description": "Precise 9 numbers"
                    }
                }
            }
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

    /*  #swagger.parameters['body'] = {
            "name": "body",
            "in": "body",
            "@schema": {
                "type": "object",
                "required": ['name', 'surname', 'login', 'password', 'email', 'phone_number'],
                "properties": {
                    "name": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "surname": {
                        "example": "string",
                        "type": "string",
                        "description": "Max 32 characters"
                    },
                    "login": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "password": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "email": {
                        "example": "string",
                        "type": "string"
                    },
                    "phone_number": {
                        "example": "string",
                        "type": "string",
                        "description": "Precise 9 numbers"
                    }
                }
            }
    } */
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

    /*  #swagger.parameters['body'] = {
            "name": "body",
            "in": "body",
            "@schema": {
                "type": "object",
                "required": ['login', 'password'],
                "properties": {
                    "login": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    },
                    "password": {
                        "example": "string",
                        "type": "string",
                        "description": "Min 5 characters and max 32 characters"
                    }
                }
            }
    } */
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

            await redis.setEx(user.id.toString(), 60 * 60 * 24 * 14, refreshToken) // set expiration date to 14 days

            return res.send({ accessToken, refreshToken, user_type: user.user_type, user_id: user.id }).status(200)
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

router.post('/refresh', isRefreshTokenValid, hasUserValues, async (req, res) => {
    // #swagger.summary = 'Used for refreshing an access token with an provided refresh token. Use the body to pass the refresh token idk why the authorization header shows up'

    /*  #swagger.parameters['body'] = {
            "name": "body",
            "in": "body",
            "@schema": {
                "type": "object",
                "required": ['refresh_token'],
                "properties": {
                    "refresh_token": {
                        "example": "string",
                        "type": "string",
                        "description": "Refresh token"
                    }
                }
            }
    } */
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