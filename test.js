import test from 'ava';
import request from 'supertest';
import {stripLocation} from './tools';

import {server} from './server';

test.skip('endpoints:records', async t => {
    t.plan(1);
    const res = await request(server)
        .get('/records')
    t.is(res.status,200)
    // t.is(JSON.parse(res.text))
})
test('oauth:password', async t => {
    t.plan(2);
    let buffer =  new Buffer('user:password').toString('base64')
    const res = await request(server)
        .post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer '+buffer)
        .send({
            // username: 'user',
            // password: 'password',
            client_id: 'client',
            client_secret: 'secret',
            grant_type: 'password',
            scope: 'pets:write',
        });

    t.is(res.status, 200);
    t.log(res.text)
    t.is(JSON.parse(res.text).client.clientId, 'client');
});

test('oauth:clientCredentials', async t => {
    t.plan(2);

    const res = await request(server)
        .post('/oauth/token')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            client_id: 'client',
            client_secret: 'secret',
            grant_type: 'client_credentials',
            scope: 'pets:write',
        });
    t.log(res.text)
    t.is(res.status, 200);
    t.is(JSON.parse(res.text).user.username, 'user');
});

test('oauth:authorizationCode', async t => {
    t.plan(2);
    let buffer =  new Buffer('user:password').toString('base64')
    const res = await request(server)
        .post('/oauth/code')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', 'Bearer '+buffer)
        .send({
            client_id: 'client',
            client_secret: 'secret',
            grant_type: 'authorization_code',
            response_type: 'code',
            scope: 'pets:write',
        });
    t.log(res.text)
    t.is(res.status, 200);
    t.is(JSON.parse(res.text).scope, 'pets:write');
});


test.skip('tools:stripLocation', async t => {
    t.plan(1)
    let x = stripLocation('/oauth/token')
    t.is('token', x)
})

