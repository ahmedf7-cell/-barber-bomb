Barber Bomb V6 — قاعدة البيانات

تم تحويل طبقة البيانات من localStorage إلى SQLite على السيرفر.

Endpoints:
GET  /api/health
GET  /api/bookings
POST /api/bookings
PATCH /api/bookings/:code/status
POST /api/bookings/:code/visit
GET  /api/customers?q=

قاعدة البيانات تُنشأ تلقائيًا باسم barber-bomb.sqlite.
للتشغيل:
cd server
npm install
npm start

قبل النشر العام:
- استخدم HTTPS.
- ضع قاعدة البيانات على تخزين دائم.
- أضف تسجيل دخول وصلاحيات للوحة الإدارة.
- انقل SQLite إلى PostgreSQL إذا كان المشروع سيعمل على أكثر من خادم/حجم كبير.
