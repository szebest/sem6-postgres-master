const prismapkg = require('@prisma/client')

const prisma = new prismapkg.PrismaClient();

console.log('a')

module.exports = prisma;
