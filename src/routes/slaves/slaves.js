const express = require('express');
router = express.Router();

const prisma = require('../../prismaClient')

const { slaveVerificator } = require('../../middlewares/validators');
const { isAtLeastDatabaseAdminValidator } = require('../../middlewares/authorization');

router.get('/', async (_, res) => {
    // #swagger.summary = 'Used for getting all data about available parkings'
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
    // #swagger.summary = 'Used for getting data about an specific available parking'

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the parking to get',
    } */
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

router.delete('/:id', isAtLeastDatabaseAdminValidator, async (req, res) => {
    // #swagger.summary = 'Only database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'params',
                description: 'Id of the parking to delete',
    } */
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

router.patch('/:id', slaveVerificator, isAtLeastDatabaseAdminValidator, async (req, res) => {
    // #swagger.summary = 'Only database admin can access this route'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */

    /*  #swagger.parameters['id'] = {
                in: 'path',
                description: 'Id of the parking to update',
    } */
    const id = parseInt(req.params.id)
    try {
        const updated = await prisma.slaves.update({
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

router.post('/', slaveVerificator, isAtLeastDatabaseAdminValidator, async (req, res) => {
    // #swagger.summary = 'Only database admin can access this route, used for creating a new parking'

    /*  #swagger.parameters['authorization'] = {
                in: 'header',
                description: 'Access token',
    } */
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