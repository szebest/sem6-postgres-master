const redis = require('redis')

const redis_client = redis.createClient({
    url: process.env.REDIS_URL
})

const connect = async () => {
    await redis_client.connect()
}

redis_client.on('connect', () => {
    console.log('Redis client connected')
})

module.exports = {
    redis: redis_client,
    connect
};