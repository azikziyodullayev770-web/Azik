# Supabase Setup Guide - TOLIQ

## 🚀 QADAM-QADAM SETUP

### QADAM 1: Supabase Dashboard da User Yarating

```
1. Browser: https://app.supabase.com
2. Login qiling
3. Loyihangizni tanlang
4. Chap menu → "Authentication"
5. "Users" tab bosing
6. Blue "Create user" button bosing
```

**Form:**
- Email: `user1@test.com`
- Password: `Test@12345` (Strong password!)
- Auto confirm: `ON` (yaxshi)
- Click: "Create user"

**NATIJA:** Yangi user qo'shiladi. User ID ko'rasiz (UUID):
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```
👉 **Bu ID ni COPY qiling va save qiling!**

---

### QADAM 2: Ikkinchi User Yarating

Yuqoridagidek:
- Email: `user2@test.com`
- Password: `Test@12345`
- Create user

Ikkinchi UUID ni COPY qiling:
```
b2c3d4e5-f6a7-8901-bcde-f12345678901
```

---

### QADAM 3: SQL Editor da Test Qiling

```
1. Dashboard → "SQL Editor"
2. "New query" bosing
3. Quydagi SQL nusxalab soling:
```

**SQL:**
```sql
-- Barcha users ni ko'ring
SELECT id, email FROM auth.users;

-- Barcha profiles ni ko'ring
SELECT id, email, full_name FROM public.profiles;
```

👉 **"RUN" bosing** → UUID larni ko'rasiz

---

### QADAM 4: Listings va Messages Qo'shish

```
1. SQL Editor → "New query"
2. Quydagi SQL ni soling
3. UUID larni almashtiring:
   - COPY user1_id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   - COPY user2_id: b2c3d4e5-f6a7-8901-bcde-f12345678901
```

**SQL (UUID larni almashtiring):**
```sql
-- Listings qo'shish
INSERT INTO public.listings (user_id, title, price, location, type, area, rooms, image_url, description, status)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- User1 ID
   'Qarshi Villa', 
   330, 
   'Qarshi', 
   'Sotuv', 
   450, 
   8, 
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
   'Premium villa',
   'active'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',  -- User2 ID
   'Shahrisabz Koshona', 
   100, 
   'Shahrisabz', 
   'Sotuv', 
   150, 
   4, 
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
   'Yangi qurilgan',
   'active');

-- Messages qo'shish
INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Uyni narxini ozroq tushirib berasizmi?',
   false),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Ertaga soat 10 da ko\'rishamizmi?',
   false);
```

👉 **"RUN" bosing**

---

### QADAM 5: Verify Data

```sql
-- Listings ko'ring
SELECT * FROM public.listings;

-- Messages ko'ring
SELECT * FROM public.messages;
```

✅ Ma'lumotlar ko'rasiz?

---

## 📱 WebApp da Test Qilish

### Terminal da run qiling:

```bash
cd c:\Users\USER\Downloads\my-uy-bozori
npm run dev
```

✅ Open: `http://localhost:3001`

### Test Users:
- Email: `user1@test.com` | Password: `Test@12345`
- Email: `user2@test.com` | Password: `Test@12345`

---

## 🛠️ Agar Error bo'lsa?

### Error: "Foreign key constraint"
**Sabab:** User ID noto'g'ri yoki mavjud emas
**Yechim:** 
1. Supabase → Authentication → Users
2. User ID larni ko'ching
3. SQL da UUID larni almashtiring

### Error: "23514: violates check constraint"
**Sabab:** Status, type noto'g'ri
**Yechim:** Faqat bu qiymatlarni ishlatang:
- `status`: `active`, `draft`, `sold`
- `type`: `Sotuv`, `Ijara`

### Error: "Column does not exist"
**Sabab:** SQL da typo
**Yechim:** Jadval structuresini check qiling:

```sql
-- Listings structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'listings';

-- Profiles structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles';
```

---

## 📊 Database Structure

### profiles
```
id (UUID) ← auth.users(id)
email (TEXT)
full_name (TEXT)
phone (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### listings
```
id (UUID, auto)
user_id (UUID) ← profiles(id)
title (TEXT)
price (DECIMAL)
location (TEXT)
type (TEXT: 'Sotuv' | 'Ijara')
area (INTEGER)
rooms (INTEGER)
image_url (TEXT)
description (TEXT)
status (TEXT: 'active' | 'draft' | 'sold')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### messages
```
id (UUID, auto)
sender_id (UUID) ← profiles(id)
receiver_id (UUID) ← profiles(id)
content (TEXT)
is_read (BOOLEAN)
created_at (TIMESTAMP)
```

---

## ✅ CHECKLIST

- [ ] Supabase Dashboard login qildim
- [ ] User 1 yaratdim (user1@test.com)
- [ ] User 1 ID ni COPY qildim
- [ ] User 2 yaratdim (user2@test.com)
- [ ] User 2 ID ni COPY qildim
- [ ] SQL Editor → Listings INSERT qildim
- [ ] SQL Editor → Messages INSERT qildim
- [ ] SELECT query da ma'lumotlar ko'rdim
- [ ] npm run dev ishga tushdi
- [ ] WebApp da test qildim

---

## 🎯 KEY POINTS

✅ Profile avtomatik yaratiladi auth trigger orqali  
✅ Foreign keys muhim - UUID larni to'g'ri qo'ying  
✅ RLS policies: Har bir user faqat o'z ma'lumotini ko'radi  
✅ Test data: 2 user, 2-3 listing, 2-3 message  
✅ Backend app.tsx faylida already qo'llanmoqda  

---

## 🚨 XOTIRA

Bu setup after shundan keyin:
1. Supabase database ready ✅
2. TypeScript types ready ✅
3. Helper functions ready ✅
4. RLS policies ready ✅
5. WebApp faqat run qilish kerak ✅

**Hozir test data qo'shish va app ishga tushirish qoldi!** 🚀
