-- Example INSERT Statements for Supabase Tables

-- ⚠️ MUHIM: Profiles foreign key masalasi
-- Profiles jadval auth.users ga bog'langan, shuning uchun:
-- 1. Supabase Dashboard → Authentication → Users
-- 2. Test user yarating (Email, password)
-- 3. User ID ni ko'ching (UUID ko'rinishida)
-- 4. Pastdagi UUID larni real user ID lari bilan almashtiring

-- MISOLDA ishlatilgan UUID lar (ALMASHTIRING):
-- User 1 ID: bu yerga real UUID ni qo'ying (Dashboard dan ko'ching)
-- User 2 ID: bu yerga real UUID ni qo'ying (Dashboard dan ko'ching)

-- Real users ID larni ko'rish uchun:
SELECT id, email FROM auth.users;

-- ============================================
-- KEYIN QUYDAGI SQL ni ishga tushiring:
-- ============================================

-- 1. INSERT Test Users/Profiles (REAL UUID lardan foydalaning!)
-- Avval auth.users da user yarating, keyin user_id ni ko'ching

-- PROFILE automatik yaratiladi auth trigger orqali,
-- Lekin agar manual yangilash kerak bo'lsa:

UPDATE public.profiles 
SET full_name = 'Alisher Karim', phone = '+998901234567' 
WHERE id = 'REAL_USER_UUID_1_NING_O\'RNI';

UPDATE public.profiles 
SET full_name = 'Madina Qo''riboyeva', phone = '+998905678901' 
WHERE id = 'REAL_USER_UUID_2_NING_O\'RNI';


-- 2. INSERT Listings (Houses/Ads)
-- REAL user ID larni qo'ying:

INSERT INTO public.listings (user_id, title, price, location, type, area, rooms, image_url, description, status)
VALUES
  -- Qarshida villa
  ('REAL_USER_UUID_1', 
   'Qarshi shahrida premium villa', 
   330, 
   'Qarshi', 
   'Sotuv', 
   450, 
   8, 
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
   'Hashamatli villa, barcha zamonaviy ta''mirlangan',
   'active'),

  -- Kitobda hovli
  ('REAL_USER_UUID_1', 
   'Kitob markazida hashamatli 5 xonali hovli', 
   120, 
   'Kitob', 
   'Sotuv', 
   200, 
   5, 
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
   'Sakin hududda juda qulay hovli',
   'active'),

  -- Shahrisabzda koshona
  ('REAL_USER_UUID_2', 
   'Shahrisabzda yangi qurilgan koshona', 
   100, 
   'Shahrisabz', 
   'Sotuv', 
   150, 
   4, 
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
   'Yangi qurilgan, evro ta''mirlangan',
   'active'),

  -- Ijara uchun
  ('REAL_USER_UUID_2', 
   'Qarshida ijaraga beraman 3 xonali kvartira', 
   15, 
   'Qarshi', 
   'Ijara', 
   120, 
   3, 
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800',
   'Pulatli markaziga yaqin, barcha qulayliklar mavjud',
   'active');


-- 3. INSERT Messages (Chat)
-- REAL user ID larni qo'ying:

INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
VALUES
  -- User1 to User2
  ('REAL_USER_UUID_1', 
   'REAL_USER_UUID_2', 
   'Uyni narxini ozroq tushirib berasizmi?', 
   false),

  -- User2 to User1
  ('REAL_USER_UUID_2', 
   'REAL_USER_UUID_1', 
   'Ertaga soat 10 da ko\'rishamizmi?', 
   false),

  -- User1 to User2
  ('REAL_USER_UUID_1', 
   'REAL_USER_UUID_2', 
   'Ha, juda yaxshi. Men uyga borib kelaman', 
   false),

  -- User2 to User1
  ('REAL_USER_UUID_2', 
   'REAL_USER_UUID_1', 
   'OK, ertaga ko\'rish soz', 
   true);


-- 4. Mavjud ma'lumotlarni ko'rish

SELECT * FROM public.profiles;
SELECT * FROM public.listings;
SELECT * FROM public.messages;

-- 5. Filter qilib ko'rish

-- Faqat active listings
SELECT * FROM public.listings WHERE status = 'active' ORDER BY created_at DESC;

-- Faqat ijara
SELECT * FROM public.listings WHERE type = 'Ijara';

-- Faqat Qarshidagi uylar
SELECT * FROM public.listings WHERE location = 'Qarshi';

-- Specific user ning listings (REAL_USER_UUID_1 ni o'rniga qo'ying)
SELECT * FROM public.listings WHERE user_id = 'REAL_USER_UUID_1';

-- Ikkita user orasidagi suhbatlar (REAL UUID larni qo'ying)
SELECT * FROM public.messages 
WHERE (sender_id = 'REAL_USER_UUID_1' AND receiver_id = 'REAL_USER_UUID_2')
   OR (sender_id = 'REAL_USER_UUID_2' AND receiver_id = 'REAL_USER_UUID_1')
ORDER BY created_at ASC;

-- 6. UPDATE Examples

-- Listing ni draft ga o'tkazish (real listing ID ni qo'ying)
UPDATE public.listings 
SET status = 'draft' 
WHERE id = 'REAL_LISTING_ID';

-- User profil yangilash (REAL_USER_UUID ni qo'ying)
UPDATE public.profiles 
SET full_name = 'Yangi Ism', phone = '+998909876543' 
WHERE id = 'REAL_USER_UUID_1';

-- Message ni o'qilgan deb belgilash (real message ID ni qo'ying)
UPDATE public.messages 
SET is_read = true 
WHERE id = 'REAL_MESSAGE_ID';

-- 7. DELETE Examples

-- Listing o'chirish (real listing ID ni qo'ying)
DELETE FROM public.listings WHERE id = 'REAL_LISTING_ID';

-- Message o'chirish (real message ID ni qo'ying)
DELETE FROM public.messages WHERE id = 'REAL_MESSAGE_ID';
