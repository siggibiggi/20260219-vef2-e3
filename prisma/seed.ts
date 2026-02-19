import { prisma } from '../src/prisma.js'

async function main() {
    await prisma.author.create({
        data: {
            email: 'author1@example.org',
            name: 'author one'
        },
    })
        await prisma.author.create({
        data: {
            email: 'author2@example.org',
            name: 'author two'
        },
    })
        await prisma.author.create({
        data: {
            email: 'author3@example.org',
            name: 'author three'
        },
    })
        await prisma.author.create({
        data: {
            email: 'author4@example.org',
            name: 'author four'
        },
    })
        await prisma.author.create({
        data: {
            email: 'author5@example.org',
            name: 'author five'
        },
    })
}

main ()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect;
        process.exit(1);
    });