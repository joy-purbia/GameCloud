const http = require('http');
const path = require('path');
const fs = require('fs');

const backendModules = path.resolve(__dirname, 'backend/node_modules');
const mysql = require(path.join(backendModules, 'mysql2/promise'));
const bcrypt = require(path.join(backendModules, 'bcryptjs'));

const PORT = 5055;

function makeRequest(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(dataString && { 'Content-Length': Buffer.byteLength(dataString) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('       GameCloud Full Platform Verification         ');
  console.log('====================================================');

  // Start backend server in-process for testing
  const { app, server } = require('./backend/server');

  // Allow server boot
  await new Promise(r => setTimeout(r, 1200));

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  try {
    // 1. Health API Test
    const health = await makeRequest('GET', '/api/health');
    assert(health.status === 200 && health.body.database.status === 'connected', 'Health Check API returns connected DB');

    // 2. Games Catalogue Test
    const games = await makeRequest('GET', '/api/games');
    assert(games.status === 200 && games.body.count >= 6, `Catalogue returns games (found ${games.body.count})`);

    const neonRacer = games.body.data.find(g => g.slug === 'neon-racer');
    const puzzle2048 = games.body.data.find(g => g.slug === '2048');
    assert(neonRacer && neonRacer.status === 'playable', 'Neon Racer is seeded and marked playable');
    assert(puzzle2048 && puzzle2048.status === 'playable', '2048 Cyber Grid is seeded and marked playable');

    // 3. Authentication Test: Admin Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      identifier: 'admin',
      password: 'Joy@2006'
    });
    assert(loginRes.status === 200 && loginRes.body.data.token, 'Admin login succeeded and issued JWT');
    const adminToken = loginRes.body.data.token;

    // 4. Me API Test
    const meRes = await makeRequest('GET', '/api/auth/me', null, adminToken);
    assert(meRes.status === 200 && meRes.body.data.user.role === 'admin', 'GET /api/auth/me verified admin role');

    // 5. User Registration Test
    const testUsername = `pilot_${Date.now().toString().slice(-5)}`;
    const regRes = await makeRequest('POST', '/api/auth/register', {
      username: testUsername,
      email: `${testUsername}@gamecloud.local`,
      password: 'Password@123'
    });
    assert(regRes.status === 201 && regRes.body.data.token, `Registration created new user '${testUsername}'`);
    const userToken = regRes.body.data.token;

    // 6. Game Session Creation Test
    const sessionRes = await makeRequest('POST', '/api/sessions', {
      gameId: neonRacer.id,
      executionType: 'browser'
    }, userToken);
    assert(sessionRes.status === 201 && sessionRes.body.data.sessionId, 'Game session initialized successfully');
    const sessionId = sessionRes.body.data.sessionId;

    // 7. Game Session Stop Test (recording play duration)
    const stopRes = await makeRequest('PATCH', `/api/sessions/${sessionId}/stop`, {
      durationSeconds: 150
    });
    assert(stopRes.status === 200 && stopRes.body.data.durationSeconds === 150, 'Session stopped with 150s duration recorded');

    // 8. Play History Verification
    const histRes = await makeRequest('GET', '/api/users/history', null, userToken);
    assert(histRes.status === 200 && histRes.body.data.length > 0, 'Play history updated for authenticated user');

    // 9. Favourites Toggle Test
    const favAdd = await makeRequest('POST', '/api/users/favourites', { gameId: puzzle2048.id }, userToken);
    assert(favAdd.status === 201, 'Added 2048 to user favourites');

    const favList = await makeRequest('GET', '/api/users/favourites', null, userToken);
    assert(favList.status === 200 && favList.body.data.some(f => f.id === puzzle2048.id), 'Favourites list contains 2048');

    const favDel = await makeRequest('DELETE', `/api/users/favourites/${puzzle2048.id}`, null, userToken);
    assert(favDel.status === 200, 'Removed 2048 from user favourites');

    // 10. Frontend Files Verification
    const neonPath = path.resolve(__dirname, 'frontend/public/games/neon-racer/index.html');
    const threePath = path.resolve(__dirname, 'frontend/public/games/neon-racer/three.module.js');
    const puzzlePath = path.resolve(__dirname, 'frontend/public/games/2048/index.html');
    const buildPath = path.resolve(__dirname, 'frontend/dist/index.html');

    assert(fs.existsSync(neonPath) && fs.existsSync(threePath), 'Neon Racer 3D files & Three.js module exist');
    assert(fs.existsSync(puzzlePath), '2048 HTML5 files exist');
    assert(fs.existsSync(buildPath), 'Vite production build exists');

    console.log('----------------------------------------------------');
    console.log(`Tests Passed: ${passedTests} / ${totalTests}`);
    if (passedTests === totalTests) {
      console.log('🎉 ALL INTEGRATION & COMPONENT TESTS PASSED!');
    }
    console.log('====================================================');

    server.close(() => process.exit(passedTests === totalTests ? 0 : 1));
  } catch (err) {
    console.error('Test execution error:', err);
    server.close(() => process.exit(1));
  }
}

runVerification();
