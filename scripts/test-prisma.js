process.env.PRISMA_CLIENT_ENGINE = process.env.PRISMA_CLIENT_ENGINE ?? 'binary';
const { PrismaClient } = require('@prisma/client');
console.log('imported');
new PrismaClient().then(()=>console.log('constructed')).catch(err=>{console.error('error constructing PrismaClient');console.error(err)});
