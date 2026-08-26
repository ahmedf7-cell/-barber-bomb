# Barber Bomb — النشر

1) استخدم Render Web Service أو خادم Node يدعم تخزينًا دائمًا.
2) في Render، أضف Persistent Disk على `/var/data` (الخطة المجانية لا تدعم الأقراص الدائمة).
3) اجعل `DB_PATH=/var/data/barber-bomb.sqlite`.
4) ضع `ADMIN_PASSWORD_HASH` و`JWT_SECRET` الحقيقيين كـ Environment Variables.
5) شغّل `npm install` ثم `npm start`.
6) اختبر `/api/health` و`/login.html` و`/index.html`.
7) اختبر إنشاء حجز، ثم تأكيده، ثم تسجيل الزيارة.
8) لا ترفع `.env` أو ملفات SQLite إلى Git.
9) WhatsApp في هذه النسخة يدوي عبر رابط `wa.me`. أتمتة Meta API/webhook تحتاج إعدادًا خارجيًا منفصلًا.

مهم: SQLite مناسب لهذا المشروع طالما يعمل على خادم واحد مع تخزين دائم. إذا احتجت عدة نسخ/توسّعًا أكبر، انقل قاعدة البيانات إلى PostgreSQL.
