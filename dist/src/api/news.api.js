import { Hono } from "hono";
import { prisma } from "../prisma.js";
import * as z from 'zod';
import { zValidator } from "@hono/zod-validator";
import xss from 'xss';
export const app = new Hono();
const pagingSchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).max(100).optional().default(0)
});
const newsSchema = z.object({
    title: z.string().min(1, 'no empty').max(128),
    slug: z.string().min(1, 'no empty').max(128),
    excerpt: z.string().min(1, 'no empty').max(256),
    content: z.string().min(1, 'no empty'),
    published: z.boolean().default(false),
    authorId: z.coerce.number().int().positive()
});
app.post('/', zValidator('json', newsSchema), async (c) => {
    const body = c.req.valid('json');
    const safeTitle = xss(body.title);
    const safeSlug = xss(body.slug);
    const safeExcerpt = xss(body.excerpt);
    const safeContent = xss(body.content);
    try {
        const newNews = await prisma.news.create({
            data: {
                title: safeTitle,
                slug: safeSlug,
                excerpt: safeExcerpt,
                content: safeContent,
                published: body.published,
                authorId: body.authorId
            }
        });
        return c.json(newNews, 201);
    }
    catch {
        return c.json({ error: 'sorry bud' }, 400);
    }
});
app.get('/', zValidator('query', pagingSchema), async (c) => {
    const limit = c.req.valid('query').limit;
    const offset = c.req.valid('query').offset;
    const newsItems = await prisma.news.findMany({ skip: offset, take: limit, orderBy: { id: 'desc' } });
    const newsCount = await prisma.news.count();
    const response = {
        data: newsItems,
        paging: {
            limit,
            offset,
            total: newsCount
        }
    };
    return c.json(response);
});
const slugSchema = z.object({
    slug: z.string().min(1).max(128)
});
app.get('/:slug', zValidator('param', slugSchema), async (c) => {
    const slug = c.req.valid('param').slug;
    const newsItem = await prisma.news.findUnique({ where: { slug: slug } });
    if (!newsItem) {
        return c.json({ error: 'not found' }, 404);
    }
    return c.json(newsItem);
});
app.delete('/:slug', zValidator('param', slugSchema), async (c) => {
    const slug = c.req.valid('param').slug;
    const newsItem = await prisma.news.findUnique({ where: { slug: slug } });
    if (!newsItem) {
        return c.json({ error: 'not found' }, 404);
    }
    await prisma.news.delete({ where: { slug: slug } });
    return c.body(null, 204);
});
app.put('/:slug', zValidator('param', slugSchema), zValidator('json', newsSchema), async (c) => {
    const slug = c.req.valid('param').slug;
    const body = c.req.valid('json');
    const newsItem = await prisma.news.findUnique({ where: { slug: slug } });
    if (!newsItem) {
        return c.json({ error: 'not found' }, 404);
    }
    const safeTitle = xss(body.title);
    const safeSlug = xss(body.slug);
    const safeExcerpt = xss(body.excerpt);
    const safeContent = xss(body.content);
    const updatedNews = await prisma.news.update({
        where: { slug: slug },
        data: {
            title: safeTitle,
            slug: safeSlug,
            excerpt: safeExcerpt,
            content: safeContent,
            published: body.published,
            authorId: body.authorId
        }
    });
    return c.json(updatedNews, 200);
});
