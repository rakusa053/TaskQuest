import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import tasksRoute from './routes/tasks.js';
import subjectsRoute from './routes/subjects.js';
import sessionsRoute from './routes/sessions.js';
import profileRoute from './routes/profile.js';
import gachaRoute from './routes/gacha.js';
import bossRoute from './routes/boss.js';
import partyRoute from './routes/party.js';
import shopRoute from './routes/shop.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/', (c) => c.json({ status: 'ok', message: 'gamingtask API v1' }));

app.route('/api/tasks', tasksRoute);
app.route('/api/subjects', subjectsRoute);
app.route('/api/sessions', sessionsRoute);
app.route('/api/stats', sessionsRoute);
app.route('/api/profile', profileRoute);
app.route('/api/gacha', gachaRoute);
app.route('/api/boss', bossRoute);
app.route('/api/party', partyRoute);
app.route('/api/shop', shopRoute);

const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server running on port ${port}`);

serve({ fetch: app.fetch, port });
