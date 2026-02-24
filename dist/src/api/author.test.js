import { describe, it } from 'node:test';
import assert from 'node:assert';
import { app } from './authors.api.js';
describe('Hono App', () => {
    it('exports app', () => {
        assert.notStrictEqual(app, undefined);
    });
    it('404', async () => {
        const res = await app.request('/testing/testing');
        assert.strictEqual(res.status, 404);
    });
    it('200', async () => {
        const res = await app.request('/');
        assert.strictEqual(res.status, 200);
    });
});
