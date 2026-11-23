const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');

process.env.MONGOMS_DOWNLOAD_DIR = path.resolve(__dirname, '../.mongo-binaries');

const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

jest.setTimeout(90000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication & Authorization Suite', () => {
  const sampleUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    phone: '555-0123'
  };

  test('POST /api/auth/register - Successfully registers user', async () => {
    const res = await request(app).post('/api/auth/register').send(sampleUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(sampleUser.email);
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('POST /api/auth/register - Fails with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);
    const res = await request(app).post('/api/auth/register').send(sampleUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/register - Rejects password shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@example.com',
      password: '123'
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: sampleUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(sampleUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('POST /api/auth/login - Fails with invalid password', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: 'WrongPassword'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Rejects disabled user', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const userId = regRes.body.user._id;

    await User.findByIdAndUpdate(userId, { isActive: false });

    const res = await request(app).post('/api/auth/login').send({
      email: sampleUser.email,
      password: sampleUser.password
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/disabled/i);
  });

  test('GET /api/auth/me - Retrieves profile with valid token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(sampleUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('GET /api/auth/me - Returns 401 when no token provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
