import { PrismaClient } from '@prisma/client'
import express from 'express'
const app = express()
const port = process.env.PORT ?? 3000

const prisma = new PrismaClient()

app.get('/', async (req, res) => {
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

app.get('/login', async (req, res) => {

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})