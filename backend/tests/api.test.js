import http from 'http';

// ── Test bootstrap ──────────────────────────────────────────────────────────
// Must be set BEFORE server.js is imported so the app neither listens on the
// production port nor touches a real database while testing.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
delete process.env.PORT;

const { default: app } = await import('../server.js');

let server;
let baseUrl;
let userToken = '';
let adminToken = '';
let therapistToken = '';
let passed = 0;
let failed = 0;

function runTest(name, fn) {
  return async () => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  };
}

async function request(path, options = {}, token = userToken) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get('content-type') || '';
  let body = null;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  return { status: res.status, ok: res.ok, body };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function loginAs(email, password, role) {
  const res = await request(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password, role }) },
    ''
  );
  assert(res.status === 200, `Login for ${email} failed: ${res.status}`);
  assert(res.body.token, `No token for ${email}`);
  return res.body.token;
}

async function startTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting SMHC Backend API & Security Verification Suite');
  console.log('======================================================\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`Server started for test runner at ${baseUrl}\n`);
      resolve();
    });
  });

  const tests = [
    // 1. Health
    runTest('GET /health - System health check', async () => {
      const res = await request('/health', {}, '');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.status === 'ok', 'Expected status: ok');
    }),

    // 2. Demo role logins (needed by every security test below)
    runTest('POST /auth/login - Demo role logins (user, therapist, admin)', async () => {
      userToken = await loginAs('user@mindmate.com', 'demo1234', 'user');
      therapistToken = await loginAs('therapist@mindmate.com', 'demo1234', 'therapist');
      adminToken = await loginAs('admin@mindmate.com', 'demo1234', 'admin');
      assert(userToken && therapistToken && adminToken, 'All three roles must obtain tokens');
    }),

    // 3. Security: authentication is enforced
    runTest('Security: protected endpoints reject anonymous requests (401)', async () => {
      const endpoints = [
        ['/moods', 'GET'],
        ['/bookings', 'GET'],
        ['/notifications', 'GET'],
        ['/reports', 'GET'],
        ['/users', 'GET'],
        ['/admin/stats', 'GET'],
        ['/therapist/patients', 'GET'],
      ];
      for (const [path, method] of endpoints) {
        const res = await request(path, { method }, '');
        assert(res.status === 401, `${method} ${path} without token → expected 401, got ${res.status}`);
      }
    }),

    // 3. Security: role enforcement
    runTest('Security: admin endpoints reject non-admin roles (403)', async () => {
      const res = await request('/admin/stats', {}, userToken);
      assert(res.status === 403, `User token on /admin/stats → expected 403, got ${res.status}`);

      const portal = await request('/therapist/patients', {}, userToken);
      assert(portal.status === 403, `User token on /therapist/patients → expected 403, got ${portal.status}`);
    }),

    // 4. Security: invalid/expired tokens rejected
    runTest('Security: forged/expired tokens are rejected (401)', async () => {
      const res = await request('/moods', {}, 'mock-jwt-admin');
      assert(res.status === 401, `mock token → expected 401, got ${res.status}`);

      const garbage = await request('/moods', {}, 'not-a-jwt-at-all');
      assert(garbage.status === 401, `garbage token → expected 401, got ${garbage.status}`);
    }),

    // 5. Auth Register — role escalation blocked
    runTest('POST /auth/register - Register new user (role escalation blocked)', async () => {
      const email = `testuser_${Date.now()}@example.com`;
      const res = await request(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test Registration User',
            email,
            password: 'SecurePass123!',
            phone: '9876543210',
            dob: '2000-01-15',
            role: 'admin', // must be ignored
          }),
        },
        ''
      );
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.body.token, 'Expected token in response');
      assert(res.body.user.email === email, 'Expected matching email');
      assert(res.body.user.role === 'user', `role must be forced to "user", got "${res.body.user.role}"`);
    }),

    // 7. Security: backdoors removed
    runTest('Security: unknown emails and master passwords are rejected', async () => {
      const unknown = await request(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email: 'nobody@mindmate.com', password: 'demo1234' }) },
        ''
      );
      assert(unknown.status === 401, `Unknown email → expected 401, got ${unknown.status}`);

      const wrongPw = await request(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email: 'admin@mindmate.com', password: 'wrong-password-999' }) },
        ''
      );
      assert(wrongPw.status === 401, `Wrong password → expected 401, got ${wrongPw.status}`);
    }),

    // 8. Auth Forgot & Reset Password
    runTest('POST /auth/forgot-password & /auth/reset-password', async () => {
      const forgotRes = await request(
        '/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email: 'user@mindmate.com' }) },
        ''
      );
      assert(forgotRes.status === 200, 'Expected 200 for forgot password');
      const token = forgotRes.body.resetToken;
      assert(token, 'Expected a demo resetToken in non-production mode');

      const badToken = await request(
        '/auth/reset-password',
        { method: 'POST', body: JSON.stringify({ token: 'invalid-token', password: 'NewPass123!' }) },
        ''
      );
      assert(badToken.status === 400, `Invalid reset token → expected 400, got ${badToken.status}`);

      const resetRes = await request(
        '/auth/reset-password',
        { method: 'POST', body: JSON.stringify({ token, password: 'demo1234' }) },
        ''
      );
      assert(resetRes.status === 200, 'Expected 200 for reset password');

      const reused = await request(
        '/auth/reset-password',
        { method: 'POST', body: JSON.stringify({ token, password: 'AnotherPass1!' }) },
        ''
      );
      assert(reused.status === 400, `Reused reset token → expected 400, got ${reused.status}`);
    }),

    // 9. Users List & Profile (scoped to the token subject)
    runTest('GET /users & PUT /users/:id/profile', async () => {
      const listRes = await request('/users?role=user');
      assert(listRes.status === 200 && Array.isArray(listRes.body), 'Expected users array');

      const forbidden = await request('/users/other/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Hacked Name' }),
      }, userToken);
      assert(forbidden.status === 403, `Foreign profile update → expected 403, got ${forbidden.status}`);

      const updateRes = await request('/users/u1/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Aarav Sharma Updated', phone: '9876543219' }),
      });
      assert(updateRes.status === 200, 'Expected 200 for profile update');
      assert(updateRes.body.name === 'Aarav Sharma Updated', 'Expected updated name');
      assert(updateRes.body.role === 'user', 'role must not be changeable via profile update');
    }),

    // 10. Therapists & Availability (therapist-managed)
    runTest('Therapists endpoints (List, Filter, Detail, Availability)', async () => {
      const listRes = await request('/therapists');
      assert(listRes.status === 200 && listRes.body.length > 0, 'Expected therapists');

      const filterRes = await request('/therapists?specialization=Anxiety');
      assert(filterRes.status === 200, 'Expected 200 for specialization filter');

      const detailRes = await request('/therapists/t1');
      assert(detailRes.status === 200 && detailRes.body.therapistId === 't1', 'Expected therapist t1');
      assert(Array.isArray(detailRes.body.availability), 'Expected availability array');

      const availRes = await request('/therapists/t1/availability');
      assert(availRes.status === 200, 'Expected 200 for availability');

      // Availability management requires the therapist role
      const denied = await request('/therapists/availability', {
        method: 'POST',
        body: JSON.stringify({ therapistId: 't1', date: '2026-10-15', startTime: '10:00', endTime: '11:00' }),
      }, userToken);
      assert(denied.status === 403, `User adding slots → expected 403, got ${denied.status}`);

      const addSlotRes = await request('/therapists/availability', {
        method: 'POST',
        body: JSON.stringify({ therapistId: 't1', date: '2026-10-15', startTime: '10:00', endTime: '11:00' }),
      }, therapistToken);
      assert(addSlotRes.status === 201, `Expected 201 for addSlot, got ${addSlotRes.status}`);
      const slotId = addSlotRes.body.slotId;

      const delSlotRes = await request(`/therapists/availability/${slotId}`, { method: 'DELETE' }, therapistToken);
      assert(delSlotRes.status === 200, 'Expected 200 for delete slot');

      const missingSlot = await request('/therapists/availability/s_does_not_exist', { method: 'DELETE' }, therapistToken);
      assert(missingSlot.status === 404, `Unknown slot → expected 404, got ${missingSlot.status}`);
    }),

    // 11. Therapist self profile update
    runTest('PUT /therapists/:id/profile - Therapist self update', async () => {
      const denied = await request('/therapists/t1/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio: 'Trying to edit someone else' }),
      }, userToken);
      assert(denied.status === 403, `User editing therapist profile → expected 403, got ${denied.status}`);

      const res = await request('/therapists/t1/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio: 'Licensed therapist with 8 years of experience.', specialization: 'Anxiety' }),
      }, therapistToken);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.bio.includes('8 years'), 'Expected updated bio');
    }),

    // 12. Moods (Get, Log, Trend, Latest)
    runTest('Moods endpoints (History, Log, Trend, Latest)', async () => {
      const historyRes = await request('/moods?userId=u1&days=30');
      assert(historyRes.status === 200 && Array.isArray(historyRes.body), 'Expected moods array');

      const logRes = await request('/moods', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', moodType: 'Happy', moodLevel: 8, note: 'Feeling great!' }),
      });
      assert(logRes.status === 201, 'Expected 201 for log mood');
      assert(logRes.body.userId === 'u1', 'Mood must be stored against the token subject');

      const trendRes = await request('/moods/trend?userId=u1&period=7d');
      assert(trendRes.status === 200 && Array.isArray(trendRes.body), 'Expected trend array');

      const latestRes = await request('/moods/latest?userId=u1');
      assert(latestRes.status === 200, 'Expected 200 for latest mood');
    }),

    // 13. Bookings (Get, Create, Cancel)
    runTest('Bookings endpoints (List, Create, Cancel)', async () => {
      const listRes = await request('/bookings?userId=u1');
      assert(listRes.status === 200 && Array.isArray(listRes.body), 'Expected bookings array');

      const createRes = await request('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'u1',
          therapistId: 't1',
          date: '2026-10-20',
          time: '14:00',
          notes: 'Test booking notes',
        }),
      });
      assert(createRes.status === 201, `Expected 201 for create booking, got ${createRes.status}`);
      assert(createRes.body.therapist !== null, 'Expected enriched therapist');
      assert(createRes.body.userId === 'u1', 'Booking must belong to the token subject');

      const cancelRes = await request(`/bookings/${createRes.body.bookingId}/cancel`, { method: 'POST' });
      assert(cancelRes.status === 200, 'Expected 200 for cancel booking');
      assert(cancelRes.body.status === 'Cancelled', 'Expected status Cancelled');

      const missing = await request('/bookings/b_does_not_exist/cancel', { method: 'POST' });
      assert(missing.status === 404, `Unknown booking → expected 404, got ${missing.status}`);
    }),

    // 14. Chat (Message, History, Clear)
    runTest('Chat endpoints (AI Message, History, Clear)', async () => {
      const msgRes = await request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', message: "I've been feeling anxious lately." }),
      });
      assert(msgRes.status === 200, 'Expected 200 for chat message');
      assert(msgRes.body.reply, 'Expected AI reply');
      assert(msgRes.body.emotion === 'anxious', `Expected emotion anxious, got ${msgRes.body.emotion}`);

      const histRes = await request('/chat/history?userId=u1');
      assert(histRes.status === 200 && histRes.body.length > 0, 'Expected chat history');

      const clearRes = await request('/chat/history?userId=u1', { method: 'DELETE' });
      assert(clearRes.status === 200, 'Expected 200 for clear chat history');
    }),

    // 15. SOS Alerts (send/list as user, status changes as admin)
    runTest('SOS Alerts endpoints (Send, List, Update status)', async () => {
      const sendRes = await request('/sos', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', message: 'Need immediate help', location: 'Bengaluru' }),
      });
      assert(sendRes.status === 201, `Expected 201 for SOS, got ${sendRes.status}`);
      assert(sendRes.body.status === 'Active', `Expected status Active, got ${sendRes.body.status}`);
      assert(sendRes.body.location && typeof sendRes.body.location === 'object', 'Expected location object');
      assert(sendRes.body.viewToken, 'Expected a shareable viewToken');

      const listRes = await request('/sos?userId=u1');
      assert(listRes.status === 200 && listRes.body.length > 0, 'Expected SOS alerts');

      const denied = await request(`/sos/${sendRes.body.sosId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Acknowledged' }),
      }, userToken);
      assert(denied.status === 403, `User updating SOS status → expected 403, got ${denied.status}`);

      const statusRes = await request(`/sos/${sendRes.body.sosId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Acknowledged' }),
      }, adminToken);
      assert(statusRes.status === 200, `Expected 200 for status update, got ${statusRes.status}`);
      assert(statusRes.body.status === 'Acknowledged', 'Expected status Acknowledged');

      const badStatus = await request(`/sos/${sendRes.body.sosId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'NotAStatus' }),
      }, adminToken);
      assert(badStatus.status === 400, `Invalid status → expected 400, got ${badStatus.status}`);

      const missing = await request('/sos/sos_missing/status', {
        method: 'PUT',
        body: JSON.stringify({ status: 'Resolved' }),
      }, adminToken);
      assert(missing.status === 404, `Unknown SOS → expected 404, got ${missing.status}`);
    }),

    // 16. Emergency Contacts & Public Emergency View
    runTest('Emergency Contacts & Public View', async () => {
      const listRes = await request('/emergency-contacts?userId=u1');
      assert(listRes.status === 200, 'Expected 200 for emergency contacts');

      const addRes = await request('/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', name: 'Mom', phone: '9876543210', relation: 'Mother' }),
      });
      assert(addRes.status === 201, `Expected 201 for add contact, got ${addRes.status}`);

      const updateRes = await request(`/emergency-contacts/${addRes.body.contactId}`, {
        method: 'PUT',
        body: JSON.stringify({ phone: '9876543299' }),
      });
      assert(updateRes.status === 200, 'Expected 200 for update contact');
      assert(updateRes.body.phone === '9876543299', 'Expected updated phone');

      const delRes = await request(`/emergency-contacts/${addRes.body.contactId}`, { method: 'DELETE' });
      assert(delRes.status === 200, 'Expected 200 for delete contact');

      const missing = await request('/emergency-contacts/ec_missing', { method: 'DELETE' });
      assert(missing.status === 404, `Unknown contact → expected 404, got ${missing.status}`);

      // Public view requires the per-alert view token
      const badView = await request('/emergency/view?token=not-a-real-token', {}, '');
      assert(badView.status === 404, `Invalid view token → expected 404, got ${badView.status}`);

      const viewRes = await request('/emergency/view?token=demo-view-token-sos1', {}, '');
      assert(viewRes.status === 200 && viewRes.body.userName, 'Expected emergency view for a valid token');
    }),

    // 17. Notifications
    runTest('Notifications endpoints (Get, Unread count, Mark Read, Read All)', async () => {
      const listRes = await request('/notifications?userId=u1');
      assert(listRes.status === 200, 'Expected 200 for notifications');

      const unreadRes = await request('/notifications/unread-count?userId=u1');
      assert(unreadRes.status === 200, 'Expected 200 for unread count');

      const markOneRes = await request('/notifications/n1/read', { method: 'PUT' });
      assert(markOneRes.status === 200, 'Expected 200 for mark read');

      const missing = await request('/notifications/n_missing/read', { method: 'PUT' });
      assert(missing.status === 404, `Unknown notification → expected 404, got ${missing.status}`);

      const markAllRes = await request('/notifications/read-all?userId=u1', { method: 'PUT' });
      assert(markAllRes.status === 200, 'Expected 200 for mark all read');
    }),

    // 18. Reports
    runTest('Reports endpoints (List, Detail, Generate, Therapist view)', async () => {
      const listRes = await request('/reports?userId=u1');
      assert(listRes.status === 200, 'Expected 200 for reports');

      const detailRes = await request('/reports/rep1');
      assert(detailRes.status === 200 && detailRes.body.reportId === 'rep1', 'Expected report rep1');

      const missing = await request('/reports/rep_missing');
      assert(missing.status === 404, `Unknown report → expected 404, got ${missing.status}`);

      const genRes = await request('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', period: '30d' }),
      });
      assert(genRes.status === 201, `Expected 201 for generate report, got ${genRes.status}`);
      assert(genRes.body.data && Array.isArray(genRes.body.data.trend), 'Generated report must include data.trend');
      assert(genRes.body.data.insights && genRes.body.data.insights.length > 0, 'Generated report must include insights');

      const thRepRes = await request('/therapist/reports/u1', {}, therapistToken);
      assert(thRepRes.status === 200, 'Expected 200 for therapist reports view');

      const denied = await request('/therapist/reports/u1', {}, userToken);
      assert(denied.status === 403, `User on therapist reports → expected 403, got ${denied.status}`);
    }),

    // 19. Recommendations & Meditation
    runTest('Recommendations & Meditation endpoints', async () => {
      const recRes = await request('/recommendations?userId=u1');
      assert(recRes.status === 200 && Array.isArray(recRes.body), 'Expected recommendations');

      const dailyRes = await request('/recommendations/daily-motivation');
      assert(dailyRes.status === 200 && dailyRes.body.message, 'Expected daily motivation');

      const medRes = await request('/meditation');
      assert(medRes.status === 200 && medRes.body.length > 0, 'Expected meditation sessions');

      const medDetailRes = await request('/meditation/med1');
      assert(medDetailRes.status === 200, 'Expected meditation detail');

      const missingMed = await request('/meditation/med_missing');
      assert(missingMed.status === 404, `Unknown meditation → expected 404, got ${missingMed.status}`);

      const compRes = await request('/meditation/med1/complete', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', durationMinutes: 10 }),
      });
      assert(compRes.status === 200, 'Expected 200 for complete meditation');
    }),

    // 20. Admin Management (admin token)
    runTest('Admin endpoints (Stats, Users, Therapists, Broadcast)', async () => {
      const statsRes = await request('/admin/stats', {}, adminToken);
      assert(statsRes.status === 200 && statsRes.body.totalUsers > 0, 'Expected admin stats');

      const moodsRes = await request('/admin/moods', {}, adminToken);
      assert(moodsRes.status === 200 && Array.isArray(moodsRes.body), 'Expected admin moods array');
      assert(moodsRes.body.length > 0, 'Expected seeded mood logs');

      const moodsDenied = await request('/admin/moods', {}, userToken);
      assert(moodsDenied.status === 403, `User on /admin/moods → expected 403, got ${moodsDenied.status}`);

      const usersRes = await request('/admin/users', {}, adminToken);
      assert(usersRes.status === 200 && Array.isArray(usersRes.body), 'Expected admin users');

      const userDetRes = await request('/admin/users/u1', {}, adminToken);
      assert(userDetRes.status === 200 && userDetRes.body.user, 'Expected admin user detail');

      const deactRes = await request('/admin/users/u1/deactivate', { method: 'POST' }, adminToken);
      assert(deactRes.status === 200, 'Expected 200 for deactivate');

      const reactRes = await request('/admin/users/u1/reactivate', { method: 'POST' }, adminToken);
      assert(reactRes.status === 200, 'Expected 200 for reactivate');

      const missingUser = await request('/admin/users/u_missing/deactivate', { method: 'POST' }, adminToken);
      assert(missingUser.status === 404, `Unknown user → expected 404, got ${missingUser.status}`);

      const thListRes = await request('/admin/therapists', {}, adminToken);
      assert(thListRes.status === 200, 'Expected admin therapists list');

      const thDetRes = await request('/admin/therapists/t1', {}, adminToken);
      assert(thDetRes.status === 200 && thDetRes.body.therapist, 'Expected admin therapist detail');

      const notifRes = await request('/admin/notifications', {}, adminToken);
      assert(notifRes.status === 200, 'Expected admin notifications');

      const broadcastRes = await request('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: 'System Maintenance',
          message: 'Server upgrade at midnight',
          targetRole: 'all',
        }),
      }, adminToken);
      assert(broadcastRes.status === 200, 'Expected 200 for broadcast');
    }),

    // 21. Therapist Portal (therapist token)
    runTest('Therapist Portal endpoints (Patients, Messages)', async () => {
      const patientsRes = await request('/therapist/patients?therapistId=t1', {}, therapistToken);
      assert(patientsRes.status === 200 && Array.isArray(patientsRes.body), 'Expected patients list');
      assert(patientsRes.body.length > 0, 'Expected at least one assigned patient for t1');

      const sendMsgRes = await request('/therapist/messages', {
        method: 'POST',
        body: JSON.stringify({ userId: 'u1', text: 'How are you feeling today?', fromTherapist: true }),
      }, therapistToken);
      assert(sendMsgRes.status === 201, `Expected 201 for therapist message, got ${sendMsgRes.status}`);

      const getMsgRes = await request('/therapist/messages/u1', {}, therapistToken);
      assert(getMsgRes.status === 200 && getMsgRes.body.length > 0, 'Expected messages list');
    }),
  ];

  for (const test of tests) {
    await test();
  }

  console.log('\n======================================================');
  console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('======================================================\n');

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

startTests().catch((err) => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});
