const assert = require('assert');
const app = require('../server');
const db = require('../src/db/database');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting automated API test suite (Global Evangelical Church Platform)...');

    server = app.listen(PORT);

    try {
        // Test 1: Health Check
        console.log('▶ Testing GET /api/health');
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = await healthRes.json();
        assert.strictEqual(healthRes.status, 200);
        assert.strictEqual(healthData.status, 'ok');
        console.log('  ✅ Health check passed: ' + healthData.church);

        // Test 2: Members List & Bulk Import
        console.log('▶ Testing POST /api/members/bulk-import');
        const bulkRes = await fetch(`${BASE_URL}/members/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                members: [
                    { first_name: 'Test', last_name: 'Kasoa_1', phone: '0244111222', gender: 'M', youth_group_id: 2 },
                    { first_name: 'Test', last_name: 'Kasoa_2', phone: '0555333444', gender: 'F', youth_group_id: 2 }
                ]
            })
        });
        const bulkData = await bulkRes.json();
        assert.strictEqual(bulkRes.status, 201);
        assert.strictEqual(bulkData.imported_count, 2);
        console.log('  ✅ Bulk roster import passed: 2 members enrolled');

        // Test 3: Sunday Service & Communion Schedule
        console.log('▶ Testing GET & PUT /api/services');
        const servRes = await fetch(`${BASE_URL}/services`);
        const servData = await servRes.json();
        assert.strictEqual(servRes.status, 200);
        assert(servData.service.first_service_time, 'Should return service times');
        console.log(`  ✅ Sunday service schedule verified: ${servData.service.first_service_time} & ${servData.service.second_service_time}`);

        // Test 4: MoMo Digital Payment (Hubtel Simulator)
        console.log('▶ Testing POST /api/payments/momo');
        const payRes = await fetch(`${BASE_URL}/payments/momo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payer_name: 'Kofi Mensah',
                payer_phone: '0244987654',
                network: 'MTN',
                category: 'dues',
                campaign_title: 'Monthly Youth Dues',
                amount: 50.00,
                currency: 'GHS'
            })
        });
        const payData = await payRes.json();
        assert.strictEqual(payRes.status, 201);
        assert.strictEqual(payData.receipt.status, 'PAID & VERIFIED');
        console.log(`  ✅ MoMo payment processed: Ref ${payData.receipt.transaction_id} (GHS ${payData.receipt.amount})`);

        // Test 5: Automated Notifications & Reminders
        console.log('▶ Testing GET /api/notifications');
        const notifRes = await fetch(`${BASE_URL}/notifications`);
        const notifData = await notifRes.json();
        assert.strictEqual(notifRes.status, 200);
        assert(notifData.notifications.length > 0, 'Should return active reminders');
        console.log(`  ✅ Automated notification alerts verified: ${notifData.count} active reminders`);

        // Test 6: Sessions List
        console.log('▶ Testing GET /api/sessions');
        const sessionsRes = await fetch(`${BASE_URL}/sessions`);
        const sessionsData = await sessionsRes.json();
        assert.strictEqual(sessionsRes.status, 200);
        assert(sessionsData.sessions.length > 0, 'Should return sessions');
        console.log(`  ✅ Sessions fetched: ${sessionsData.count} events found`);

        // Test 7: Attendance Check-In
        console.log('▶ Testing POST /api/attendance');
        const attRes = await fetch(`${BASE_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                member_id: 1,
                session_id: 1,
                status: 'present',
                notes: 'Present at Kasoa service'
            })
        });
        const attData = await attRes.json();
        assert.strictEqual(attRes.status, 200);
        assert.strictEqual(attData.success, true);
        console.log('  ✅ Attendance recorded successfully');

        // Test 8: Live Database Diagnostics
        console.log('▶ Testing GET /api/admin/db-overview');
        const dbRes = await fetch(`${BASE_URL}/admin/db-overview`);
        const dbData = await dbRes.json();
        assert.strictEqual(dbRes.status, 200);
        assert(dbData.database.tables.length >= 7, 'Should inspect all tables');
        console.log(`  ✅ Database Diagnostics verified: ${dbData.database.driver} (${dbData.database.file_size})`);

        console.log('\n🎉 ALL 8 AUTOMATED TESTS (CHURCH PLATFORM + MOMO + REMINDERS) PASSED SUCCESSFULLY!\n');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
}

runTests();
