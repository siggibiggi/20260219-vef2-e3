import { Hono } from "hono";
import { prisma } from "../prisma.js"
import * as z from 'zod';
import { zValidator } from "@hono/zod-validator";
import xss from 'xss';


export const app = new Hono();


const pagingSchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).max(100).optional().default(0)
})
    

app.get('/', zValidator('query', pagingSchema), async (c) => {
    const limit = c.req.valid('query').limit
    const offset = c.req.valid('query').offset

    const authors = await prisma.author.findMany({ skip: offset, take: limit, orderBy: { id: 'desc' } })
    const authorsCount = await prisma.author.count()

    const response = {
        data: authors,
        paging: {
            limit,
            offset,
            total: authorsCount
        }
    }

    return c.json(response)
})

const idSchema = z.object({
    id: z.coerce.number().int().positive()
})

app.get('/:id', zValidator('param', idSchema), async (c) => {
    const id = c.req.valid('param').id

    const author = await prisma.author.findUnique({ where: { id: id } })

    if (!author) {
        return c.json({ error: 'no found, mister'}, 404)
    }

    return c.json(author);
})

app.delete('/:id', zValidator('param', idSchema), async (c) => {
    const id = c.req.valid('param').id

    const author = await prisma.author.findUnique({ where: { id: id } })

    if (!author) {
        return c.json({ error: 'not found'}, 404)
    }

    await prisma.author.delete({ where: { id } })

    return c.json(null, 200);
})

const authorSchema = z.object({
    name: z.string().min(1, 'no empty').max(128),
    email: z.email().max(256)
})

app.post('/', zValidator('json', authorSchema), async (c) => {
    const body = c.req.valid('json')

    const safeName = xss(body.name)
    const safeEmail = xss(body.email)

    const neww = await prisma.author.create({
        data: {
            name: safeName,
            email: safeEmail
        }
    })

    return c.json(neww, 201)
})

app.put('/:id', zValidator('param', idSchema), zValidator('json', authorSchema), async (c) => {
    const id = c.req.valid('param').id
    const body = c.req.valid('json')

    const author = await prisma.author.findUnique({ where: { id: id } })

    if (!author) {
        return c.json({ error: 'not found'}, 404)
    }

    const safeName = xss(body.name)
    const safeEmail = xss(body.email)

    const updatedAuthor = await prisma.author.update({
        where: { id: id },
        data: {
            name: safeName,
            email: safeEmail
        }
    })

    return c.json(updatedAuthor, 200)
})


//npm run dev
//npx prisma db push --force-reset
//npx prisma db seed
//npx prisma studio
//npx prisma db push
//npx prisma migrate reset
