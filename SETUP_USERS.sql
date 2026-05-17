-- ========================================
-- SUPABASE DA USER YARATISH VA TEST QILISH
-- ========================================

-- QADAM 1: USER YARATISH (Supabase Dashboard)
-- ============================================
-- 1. Supabase Dashboard ochang → https://app.supabase.com
-- 2. Lotin in qiling va projectingizni tanlang
-- 3. Authentication → Users
-- 4. "Create user" bosing
-- 5. Email va password kiriting:
--    Email: user1@test.com
--    Password: Test@12345
-- 6. "Create user" bosing
-- 7. USER ID (UUID) ni ko'ching va COPY qiling
--
-- NATIJA: Bitta UUID ko'rasiz, masalan: 
-- a1b2c3d4-e5f6-7890-abcd-ef1234567890
--
-- ESLI: Agar "auth trigger" ishlasa, profile avtomatik yaratiladi!

-- ============================================
-- QADAM 2: SQL EDITOR GA BORING
-- ============================================
-- 1. Supabase Dashboard → SQL Editor
-- 2. "New query" bosing
-- 3. Pastdagi SQL ni nusxalab soling
-- 4. "RUN" bosing

-- ============================================
-- TEST SQL (HOZIR ISHGA TUSHISHI KERAK)
-- ============================================

-- 1. Barcha users va profiles ni ko'ring
SELECT id, email FROM auth.users;
SELECT id, email, full_name FROM public.profiles;

-- 2. Agar profile yo'q bo'lsa, create qiling:
-- (auth.users da ID ni ko'rganingizdan keyin)
UPDATE public.profiles 
SET full_name = 'Test User 1', phone = '+998901234567'
WHERE email = 'user1@test.com';

-- 3. Ikkinchi user yarating (Dashboard → Authentication):
--    Email: user2@test.com
--    Password: Test@12345

-- 4. Keyin ikkinchisini update qiling:
UPDATE public.profiles 
SET full_name = 'Test User 2', phone = '+998905678901'
WHERE email = 'user2@test.com';

-- ============================================
-- QADAM 3: USER ID LARNI KO'RING VA COPY QILING
-- ============================================

-- Quyidagi query ishga tushing va UUID larni ko'ching:
SELECT id, email, full_name FROM public.profiles;

-- Output ko'rinishi:
-- id                                    | email           | full_name
-- a1b2c3d4-e5f6-7890-abcd-ef123456789  | user1@test.com  | Test User 1
-- b2c3d4e5-f6a7-8901-bcde-f12345678901 | user2@test.com  | Test User 2

-- ============================================
-- QADAM 4: REAL UUID BILAN LISTINGS QOSHISH
-- ============================================

-- 🔴 MUAMMO: type NULL ekan, shuning uchun CHECK constraint error
-- ✅ YECHIM: To'g'ri column order bilan INSERT

-- TOLIQ COLUMN BILAN (ISHGA TUSHMASI KERAK):
INSERT INTO public.listings 
  (user_id, title, price, location, type, area, rooms, image_url, description, status) 
VALUES 
  ('2b06922b-4508-4ce4-bd44-df5b221798dc', 'Qarshi shahrida premium villa', 330, 'Qarshi', 'Sotuv', 450, 8, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800', 'Hashamatli villa', 'active');

-- YANA LISTINGS QOSHISH:
INSERT INTO public.listings 
  (user_id, title, price, location, type, area, rooms, image_url, description, status) 
VALUES 
  ('2b06922b-4508-4ce4-bd44-df5b221798dc', 'Kitob markazida hovli', 120, 'Kitob', 'Sotuv', 200, 5, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800', 'Sakin hududda qulay hovli', 'active');

-- IJARA LISTING QOSHISH:
INSERT INTO public.listings 
  (user_id, title, price, location, type, area, rooms, image_url, description, status) 
VALUES 
  ('2b06922b-4508-4ce4-bd44-df5b221798dc', 'Qarshida ijaraga kvartira', 15, 'Qarshi', 'Ijara', 120, 3, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800', 'Pulatli markaziga yaqin', 'active');

-- ============================================
-- QADAM 5: VERIFY KI MA'LUMOTLAR QO'SHILDI
-- ============================================

-- Barcha listings ko'ring
SELECT id, title, price, location, type, status FROM public.listings;

-- User1 ning listings
SELECT id, title, price, location, type FROM public.listings WHERE user_id = '2b06922b-4508-4ce4-bd44-df5b221798dc';

-- ============================================
-- QADAM 6: UPDATE VA DELETE TEST
-- ============================================

-- Listing ni UPDATE qiling (real listing ID ni qo'ying):
UPDATE public.listings 
SET price = 350, status = 'draft'
WHERE id = 'REAL_LISTING_ID_FROM_SELECT';

-- Message ni o'qilgan deb belgilang:
UPDATE public.messages 
SET is_read = true 
WHERE is_read = false;

-- Listing o'chirish (OPTIONAL):
-- DELETE FROM public.listings WHERE id = 'REAL_LISTING_ID';

-- ============================================
-- QADAM 7: BACKEND BILAN TEST
-- ============================================
-- App.tsx da quyidagi function lar ishlaydi:
-- - listingHelpers.getActive()
-- - listingHelpers.create(listing)
-- - messageHelpers.send(senderId, receiverId, content)
-- - messageHelpers.getConversation(userId1, userId2)

-- ============================================
-- MUHIM ESLATMALAR
-- ============================================
-- ✅ Profiles avtomatik yaratiladi when auth trigger ishlaydi
-- ✅ Foreign key: profiles(id) → auth.users(id)
-- ✅ Foreign key: listings(user_id) → profiles(id)
-- ✅ Foreign key: messages(sender_id, receiver_id) → profiles(id)
-- ✅ RLS policies: Foydalanuvchilar faqat o'z ma'lumotlariga kiradi
