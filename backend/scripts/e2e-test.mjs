// End-to-end API test for TemuBarang backend. Run: node scripts/e2e-test.mjs
const BASE = 'http://localhost:3000/api';
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

async function call(method, path, { body, token, form, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
  if (raw) return res;
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

const phone = '0857' + Math.floor(10000000 + Math.random() * 89999999);
const phone2 = '0858' + Math.floor(10000000 + Math.random() * 89999999);
const email = `tester${Date.now()}@example.com`;
const email2 = `tester2_${Date.now()}@example.com`;

console.log('\n[Health]');
let r = await call('GET', '/health');
ok('health ok + database ok', r.status === 200 && r.data.database === 'ok', JSON.stringify(r.data));

console.log('\n[Auth - Email & Kata Sandi]');
r = await call('POST', '/auth/register', { body: { name: 'Tester', email, password: 'rahasia123', phone: '123' } });
ok('register rejects invalid phone', r.status === 400, JSON.stringify(r.data));
r = await call('POST', '/auth/register', { body: { name: 'Tester', email: 'bukan-email', password: 'rahasia123', phone } });
ok('register rejects invalid email', r.status === 400, JSON.stringify(r.data));
r = await call('POST', '/auth/register', { body: { name: 'Tester', email, password: '123', phone } });
ok('register rejects short password (<8)', r.status === 400, JSON.stringify(r.data));

r = await call('POST', '/auth/register', { body: { name: 'Tester E2E', email, password: 'rahasia123', phone } });
ok('register success 201', r.status === 201 && r.data.token, JSON.stringify(r.data));
ok('phone normalized to 62...', r.data.user?.phone?.startsWith('62'));
ok('no password hash leaked', r.data.user && !('password' in r.data.user));
const token = r.data.token;
const normPhone = r.data.user?.phone;

r = await call('POST', '/auth/register', { body: { name: 'Dup Email', email, password: 'rahasia123', phone: phone2 } });
ok('duplicate email rejected 409', r.status === 409);
r = await call('POST', '/auth/register', { body: { name: 'Dup Phone', email: email2, password: 'rahasia123', phone } });
ok('duplicate phone rejected 409', r.status === 409);

r = await call('POST', '/auth/login', { body: { email, password: 'salah' } });
ok('wrong password 401', r.status === 401);
r = await call('POST', '/auth/login', { body: { email, password: 'rahasia123' } });
ok('email login success', r.status === 200 && r.data.token);
r = await call('POST', '/auth/otp/request', { body: { phone } });
ok('OTP endpoint removed (404)', r.status === 404);

r = await call('GET', '/auth/me');
ok('me without token 401', r.status === 401);
r = await call('GET', '/auth/me', { token });
ok('me with token', r.status === 200 && r.data.user.email === email);
r = await call('PATCH', '/auth/me', { token, body: { name: 'Tester Baru <b>x</b>' } });
ok('update name without password (sanitized)', r.status === 200 && r.data.user.name === 'Tester Baru x', JSON.stringify(r.data));
r = await call('PATCH', '/auth/me', { token, body: { phone: phone2 } });
ok('change phone requires current password', r.status === 400);
r = await call('PATCH', '/auth/me', { token, body: { phone: phone2, currentPassword: 'salah' } });
ok('change phone rejects wrong password', r.status === 401);
r = await call('PATCH', '/auth/me', { token, body: { phone: phone2, currentPassword: 'rahasia123' } });
ok('change phone with password success', r.status === 200 && r.data.user.phone.startsWith('62'));
const updatedPhone = r.data.user.phone;

r = await call('PATCH', '/auth/me', { token, body: { newPassword: 'baru12345', currentPassword: 'salah' } });
ok('change password needs correct current password', r.status === 401);
r = await call('PATCH', '/auth/me', { token, body: { newPassword: 'baru12345', currentPassword: 'rahasia123' } });
ok('change password success', r.status === 200);

console.log('\n[Items & DB Photo Storage]');
r = await call('POST', '/items', { token, body: { itemName: '' } });
ok('create item validation 400', r.status === 400);
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
const form = new FormData();
form.append('itemName', 'Kunci Motor Honda');
form.append('ownerName', 'Tester');
form.append('description', 'Kunci motor dengan gantungan boneka panda kecil.');
form.append('ownerMessage', 'Mohon dikembalikan <script>alert(1)</script>');
form.append('allowWhatsapp', 'true');
form.append('photo', new Blob([png], { type: 'image/png' }), 'foto.png');
r = await call('POST', '/items', { token, form });
ok('create item with photo 201', r.status === 201, JSON.stringify(r.data));
const item = r.data;
ok('publicCode 10 chars', item.publicCode?.length === 10);
ok('photo stored in DB (/api/photos/:id)', /^\/api\/photos\/[a-z0-9]+$/i.test(item.photoUrl || ''), item.photoUrl);
ok('XSS stripped from ownerMessage', !item.ownerMessage?.includes('<script>'));
const img = await fetch('http://localhost:3000' + item.photoUrl);
ok('DB photo served as image/webp', img.status === 200 && img.headers.get('content-type') === 'image/webp');

const bad = new FormData();
bad.append('itemName', 'X barang');
bad.append('ownerName', 'Tester');
bad.append('description', 'deskripsi panjang');
bad.append('photo', new Blob(['hello'], { type: 'text/plain' }), 'a.txt');
r = await call('POST', '/items', { token, form: bad });
ok('reject non-image upload 400', r.status === 400, JSON.stringify(r.data));

r = await call('GET', '/items', { token });
ok('list items', r.status === 200 && r.data.length === 1 && 'totalScans' in r.data[0]);
r = await call('GET', '/items/summary', { token });
ok('summary endpoint', r.status === 200 && r.data.totalItems === 1);
r = await call('GET', `/items/${item.id}`, { token });
ok('item detail has publicUrl', r.status === 200 && r.data.publicUrl?.endsWith(`/s/${item.publicCode}`));
r = await call('PATCH', `/items/${item.id}/status`, { token });
ok('toggle status -> LOST', r.data.status === 'LOST');
r = await call('PATCH', `/items/${item.id}/status`, { token, body: { status: 'LOST' } });
ok('explicit status LOST', r.data.status === 'LOST');
const upd = new FormData();
upd.append('description', 'Kunci motor Honda Beat, gantungan panda.');
r = await call('PATCH', `/items/${item.id}`, { token, form: upd });
ok('update item', r.status === 200 && r.data.description.includes('Beat'));
let res = await call('GET', `/items/${item.id}/qr?format=png`, { token, raw: true });
ok('QR PNG', res.status === 200 && res.headers.get('content-type') === 'image/png');
res = await call('GET', `/items/${item.id}/qr?format=svg&download=1`, { token, raw: true });
ok('QR SVG download', res.status === 200 && res.headers.get('content-disposition')?.includes('attachment'));

// Ownership isolation: demo user cannot see tester's item
r = await call('POST', '/auth/login', { body: { email: 'budi.santoso@example.com', password: 'password123' } });
const budi = r.data.token;
r = await call('GET', `/items/${item.id}`, { token: budi });
ok('other user cannot read item 404', r.status === 404);
r = await call('GET', `/items/${item.id}/comments`, { token: budi });
ok('other user cannot read comments 404', r.status === 404);

console.log('\n[Public]');
r = await call('GET', `/public/items/${item.publicCode}`);
ok('public item', r.status === 200 && r.data.status === 'LOST');
ok(
  'no phone/owner/id leaked',
  !JSON.stringify(r.data).includes(updatedPhone) &&
    !JSON.stringify(r.data).includes(normPhone) &&
    !('id' in r.data) &&
    !('ownerId' in r.data)
);
await call('GET', `/public/items/${item.publicCode}`);
r = await call('GET', `/items/${item.id}/scans`, { token });
ok('scan recorded + deduped', r.data.length === 1, `got ${r.data.length}`);
r = await call('POST', `/public/items/${item.publicCode}/location`, { body: { latitude: -6.2088, longitude: 106.8456 } });
ok('share location', r.status === 200);
r = await call('GET', `/items/${item.id}/scans`, { token });
ok('scan has location', r.data[0]?.latitude === -6.2088);
r = await call('GET', '/public/items/tidakada123');
ok('unknown code 404', r.status === 404);
r = await call('POST', `/public/items/${item.publicCode}/comments`, { body: { message: 'abc' } });
ok('short comment 400', r.status === 400);
r = await call('POST', `/public/items/${item.publicCode}/comments`, {
  body: {
    finderName: 'Andi',
    message: 'Saya temukan kunci di parkiran <img src=x onerror=alert(1)>',
    location: 'Parkiran Mall',
  },
});
ok('submit comment 201', r.status === 201, JSON.stringify(r.data));
ok('comment sanitized', !r.data.comment?.message.includes('<img'));
res = await call('GET', `/public/items/${item.publicCode}/whatsapp`, { raw: true });
ok(
  'whatsapp redirect to updated phone',
  res.status === 302 && res.headers.get('location')?.startsWith(`https://wa.me/${updatedPhone}`)
);

r = await call('GET', `/items/${item.id}`, { token });
ok('unread comment count 1', r.data.unreadComments === 1);
const commentId = r.data.comments[0].id;
r = await call('PATCH', `/items/comments/${commentId}/read`, { token: budi });
ok('other user cannot mark comment 404', r.status === 404);
r = await call('PATCH', `/items/comments/${commentId}/read`, { token });
ok('mark comment read', r.status === 200 && r.data.isRead === true);
r = await call('PATCH', `/items/${item.id}/comments/read-all`, { token });
ok('mark all read', r.status === 200);

const off = new FormData();
off.append('allowComments', 'false');
off.append('allowWhatsapp', 'false');
await call('PATCH', `/items/${item.id}`, { token, form: off });
r = await call('POST', `/public/items/${item.publicCode}/comments`, { body: { message: 'Pesan setelah dimatikan' } });
ok('comments disabled 403', r.status === 403);
res = await call('GET', `/public/items/${item.publicCode}/whatsapp`, { raw: true });
ok(
  'whatsapp disabled blocked',
  res.status === 403 || (res.status === 302 && !res.headers.get('location')?.includes('wa.me'))
);

r = await call('POST', `/items/${item.id}/regenerate-code`, { token });
ok('regenerate code', r.status === 200 && r.data.publicCode !== item.publicCode);
r = await call('GET', `/public/items/${item.publicCode}`);
ok('old code no longer works', r.status === 404);

console.log('\n[Delete]');
r = await call('DELETE', `/items/${item.id}`, { token });
ok('delete item', r.status === 200);
const deletedImg = await fetch('http://localhost:3000' + item.photoUrl);
ok('DB photo removed on item delete (404)', deletedImg.status === 404);

r = await call('DELETE', '/auth/me', { token, body: { password: 'salah' } });
ok('delete account rejects wrong password 401', r.status === 401);
r = await call('DELETE', '/auth/me', { token, body: { password: 'baru12345' } });
ok('delete account with password success', r.status === 200);
r = await call('GET', '/auth/me', { token });
ok('deleted account cannot access 401', r.status === 401);

console.log(`\nHasil: ${pass} lulus, ${fail} gagal\n`);
process.exit(fail ? 1 : 0);
