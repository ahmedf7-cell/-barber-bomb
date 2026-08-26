# Barber Bomb — Render production deployment

هذه النسخة تستخدم Node + Express + SQLite، لذلك يجب أن تكون قاعدة SQLite على تخزين دائم في الإنتاج.

## Render
- Service type: Web Service
- Plan: Starter أو أي خطة مدفوعة تدعم Persistent Disk
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Persistent Disk: `/var/data`
- DB_PATH: `/var/data/barber-bomb.sqlite`
- عدد النسخ: 1 لأن SQLite مع Persistent Disk يعمل على نسخة واحدة.

> لا تستخدم Free Web Service كإنتاج للحجوزات؛ نظام الملفات فيه مؤقت، وبيانات SQLite قد تضيع عند إعادة التشغيل أو إعادة النشر. Render توصي بقاعدة Postgres للبيانات طويلة الأمد، أو Persistent Disk للخدمات المدفوعة. 

## Environment Variables
ضع في Render:
- `NODE_ENV=production`
- `ADMIN_USER` = اسم مستخدم الإدارة
- `ADMIN_PASSWORD_HASH` = bcrypt hash لكلمة مرور الإدارة
- `JWT_SECRET` = سر عشوائي طويل
- `DB_PATH=/var/data/barber-bomb.sqlite`

لا ترفع `.env` الحقيقي إلى GitHub.

## بعد النشر
اختبر بالترتيب:
1. `/api/health`
2. `/login.html`
3. تسجيل الدخول
4. إنشاء حجز من `/index.html`
5. ظهور الحجز في لوحة الإدارة
6. تأكيد الحجز
7. تأكيد الزيارة
8. التأكد من عداد الولاء
9. اختبار فتح رابط WhatsApp

### WhatsApp
النسخة الحالية تستخدم روابط WhatsApp مباشرة (`wa.me`) لفتح الرسالة على هاتف المستخدم. لا توجد بيانات Meta حقيقية داخل المشروع، ولا ينبغي إضافة رموز الوصول إلى GitHub. أتمتة WhatsApp عبر Meta Business API/webhook تحتاج إعداد حساب Meta ودومين HTTPS وبيانات اعتماد حقيقية خارج هذه الحزمة.
