import express from "express";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
dotenv.config();

const app=express();
app.use(express.json());
app.use(express.static("."));

const PORT=process.env.PORT||3000;
const JWT_SECRET=process.env.JWT_SECRET||'CHANGE_THIS_IN_PRODUCTION';
if(process.env.NODE_ENV==='production' && (JWT_SECRET==='CHANGE_THIS_IN_PRODUCTION' || !process.env.ADMIN_PASSWORD_HASH)){
  throw new Error('Production secrets are not configured. Set JWT_SECRET and ADMIN_PASSWORD_HASH.');
}
const ADMIN_USER=process.env.ADMIN_USER||'admin';
const ADMIN_PASSWORD_HASH=process.env.ADMIN_PASSWORD_HASH||bcrypt.hashSync('ChangeMe123!',10);
const db=new Database(process.env.DB_PATH||"barber-bomb.sqlite");
db.pragma("journal_mode=WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS customers(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 phone TEXT NOT NULL UNIQUE,
 visits INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 booking_code TEXT NOT NULL UNIQUE,
 customer_id INTEGER NOT NULL,
 service TEXT NOT NULL,
 barber TEXT NOT NULL,
 date TEXT NOT NULL,
 time TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 visit_counted INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 FOREIGN KEY(customer_id) REFERENCES customers(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_slot
ON bookings(barber,date,time) WHERE status IN ('pending','confirmed','completed');
`);

const normalizePhone=p=>String(p||"").replace(/\D/g,"");
const auth=(req,res,next)=>{try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return res.status(401).json({error:'غير مصرح'});req.user=jwt.verify(h.slice(7),JWT_SECRET);next()}catch(e){return res.status(401).json({error:'جلسة الدخول غير صالحة'})}};
const now=()=>new Date().toISOString();

app.post("/api/auth/login",(req,res)=>{
 const {username,password}=req.body||{};
 if(username!==ADMIN_USER || !bcrypt.compareSync(String(password||''),ADMIN_PASSWORD_HASH))
   return res.status(401).json({error:"اسم المستخدم أو كلمة المرور غير صحيحة"});
 const token=jwt.sign({sub:username,role:"admin"},JWT_SECRET,{expiresIn:"8h"});
 res.json({ok:true,token,expiresIn:"8h"});
});

app.get("/api/auth/me",auth,(req,res)=>res.json({ok:true,user:req.user}));

app.get("/api/health",(req,res)=>res.json({ok:true,service:"barber-bomb",database:"sqlite",env:process.env.NODE_ENV||"development"}));
app.get("/api/ready",(req,res)=>{
  try { db.prepare("SELECT 1 AS ok").get(); res.json({ok:true,ready:true}); }
  catch(e){ res.status(503).json({ok:false,ready:false}); }
});

app.get("/api/bookings/public",(req,res)=>{
  const {date,barber}=req.query;
  if(!date||!barber) return res.status(400).json({error:"التاريخ والحلاق مطلوبان"});
  const rows=db.prepare(
    "SELECT time FROM bookings WHERE barber=? AND date=? AND status IN ('pending','confirmed','completed') ORDER BY time"
  ).all(barber,date);
  res.json(rows);
});

app.get("/api/bookings", auth,(req,res)=>{
 const rows=db.prepare(`
  SELECT b.*,c.name,c.phone FROM bookings b JOIN customers c ON c.id=b.customer_id
  ORDER BY b.date,b.time
 `).all();
 res.json(rows);
});

app.post("/api/bookings",(req,res)=>{
 try{
  const {name,phone,service,barber,date,time}=req.body;
  const p=normalizePhone(phone);
  if(!name||p.length<7||!service||!barber||!date||!time) return res.status(400).json({error:"بيانات الحجز غير مكتملة"});
  const existing=db.prepare("SELECT id FROM bookings WHERE barber=? AND date=? AND time=? AND status IN ('pending','confirmed','completed')").get(barber,date,time);
  if(existing) return res.status(409).json({error:"هذا الموعد محجوز"});
  let customer=db.prepare("SELECT * FROM customers WHERE phone=?").get(p);
  if(!customer){
   const info=db.prepare("INSERT INTO customers(name,phone,created_at) VALUES(?,?,?)").run(name,p,now());
   customer={id:Number(info.lastInsertRowid),name,phone:p,visits:0};
  }else{
   db.prepare("UPDATE customers SET name=? WHERE id=?").run(name,customer.id);
  }
  const code="BB-"+Date.now().toString(36).toUpperCase();
  db.prepare("INSERT INTO bookings(booking_code,customer_id,service,barber,date,time,created_at) VALUES(?,?,?,?,?,?,?)")
    .run(code,customer.id,service,barber,date,time,now());
  res.status(201).json({ok:true,booking_code:code});
 }catch(e){res.status(500).json({error:e.message})}
});

app.patch("/api/bookings/:code/status", auth,(req,res)=>{
 const {status}=req.body;
 if(!["pending","confirmed","cancelled","completed"].includes(status)) return res.status(400).json({error:"حالة غير صحيحة"});
 const b=db.prepare("SELECT * FROM bookings WHERE booking_code=?").get(req.params.code);
 if(!b) return res.status(404).json({error:"الحجز غير موجود"});
 db.prepare("UPDATE bookings SET status=? WHERE booking_code=?").run(status,req.params.code);
 res.json({ok:true});
});

app.post("/api/bookings/:code/visit", auth,(req,res)=>{
 const b=db.prepare("SELECT * FROM bookings WHERE booking_code=?").get(req.params.code);
 if(!b) return res.status(404).json({error:"الحجز غير موجود"});
 if(b.visit_counted) return res.json({ok:true,already_counted:true});
 const tx=db.transaction(()=>{
  db.prepare("UPDATE bookings SET status='completed',visit_counted=1 WHERE id=?").run(b.id);
  db.prepare("UPDATE customers SET visits=visits+1 WHERE id=?").run(b.customer_id);
 });
 tx();
 const c=db.prepare("SELECT * FROM customers WHERE id=?").get(b.customer_id);
 res.json({ok:true,visits:c.visits,remaining:Math.max(0,7-c.visits),free_visit:c.visits>=7});
});

app.get("/api/customers", auth,(req,res)=>{
 const q=String(req.query.q||"");
 const rows=db.prepare("SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name").all("%"+q+"%","%"+q+"%");
 res.json(rows);
});

app.listen(PORT,"0.0.0.0",()=>console.log(`Barber Bomb server running on :${PORT}`));