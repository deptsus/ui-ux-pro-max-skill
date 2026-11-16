-- 0018 (owner decision, 16 Nov 2026): new Premium Tahunan price.
-- Rp702.000 shown struck through, 20% off, Rp561.600 charged, with the owner's
-- new DANA QRIS for that amount (merchant "Lentera english, Service", NMID
-- ID1026639132426; tag 54 = 561600, CRC 610A, checked by src/lib/qris.ts).
-- Only the yearly plan changes. Payments already opened keep their own amount
-- and QR (each transaction stores both), so nothing in flight is altered.
update subscription_plans
   set price_idr = 561600,
       list_price_idr = 702000,
       qris_payload = '00020101021226570011ID.DANA.WWW011893600915003698143502090369814350303UMI51440014ID.CO.QRIS.WWW0215ID10266391324260303UMI52048999530336054065616005802ID5924Lentera english, Service6006Lingga610529871621960150011ID.DANA.WWW6304610A'
 where id = 'premium_yearly';
