Barber Bomb V7 — حماية لوحة الإدارة

تمت إضافة JWT + bcrypt.
الإعدادات:
ADMIN_USER=admin
ADMIN_PASSWORD_HASH=<bcrypt hash>
JWT_SECRET=<random secret>

لإنشاء hash لكلمة مرور قوية:
node -e "import('bcryptjs').then(async b=>console.log(await b.hash('ضع-كلمة-المرور-هنا',12)))"

لا تستخدم كلمة المرور الافتراضية في الإنتاج.
ضع الأسرار في server/.env ولا ترفعها إلى Git.
