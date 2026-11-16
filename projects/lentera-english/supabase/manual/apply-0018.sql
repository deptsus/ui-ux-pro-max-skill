-- Lentera English: migration 0018 (harga baru Premium Tahunan)
-- for the Supabase SQL Editor. Same content as supabase/migrations/0018_yearly_price.sql,
-- run in one transaction (all or nothing) and recorded in Database > Migrations.
-- Needs 0017 first. Changes only the yearly plan row; no learner data is changed.
begin;

do $$
begin
  if not (content_features() ? 'exam_timing') then
    raise exception 'Jalankan supabase/manual/apply-0017.sql lebih dulu, lalu ulangi berkas ini.';
  end if;
end $$;

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

insert into supabase_migrations.schema_migrations (version, name)
values ('20271001101800', '0018_yearly_price')
on conflict do nothing;

commit;

-- Hasil yang diharapkan: premium_yearly | 561600 | 702000 | true
select id, price_idr, list_price_idr, qris_payload like '%5406561600%6304610A' as qris_baru
  from subscription_plans where id = 'premium_yearly';
