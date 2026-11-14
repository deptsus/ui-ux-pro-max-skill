// Branching conversations added after the first set: B2–C2 (tahap 3) and A2–B1 (Rilis 2). Same rules as conversations.ts:
// every line and every piece of feedback is written by hand. "correct: false"
// always means a grammar error; a grammatical but tactless reply is
// "correct: true" with a low naturalness score and an explanation why.
import type { Scenario } from '@/lib/content/types';
import { scenario } from './conversations';

export const scenariosUpper: Scenario[] = [
  scenario('complaint', 'Mengajukan Keluhan Layanan', 'B2', true, 'Internet rumahmu mati sejak Senin dan kamu bekerja dari rumah. Kamu menelepon layanan pelanggan.', 'Menjelaskan masalah dengan jelas, tetap sopan tetapi tegas, lalu meminta jadwal perbaikan dan kompensasi.', 'Keluhanmu ditangani. Fakta yang jelas (sejak kapan, apa dampaknya) dan permintaan yang spesifik jauh lebih efektif daripada marah.', [
    ['n1', 'Ben', "Thank you for calling Nusanet. My name's Ben. How can I help you today?", 'Terima kasih telah menghubungi Nusanet. Saya Ben. Ada yang bisa saya bantu hari ini?', [
      ["Hi Ben. My internet has been down since Monday, and I work from home, so it's become quite a problem.", true, 3, 'Present perfect "has been down since Monday" untuk masalah yang masih berlangsung, lalu dampaknya. Jelas dan tetap tenang.', ["Hello. I've had no internet connection since Monday."], 'n2'],
      ['My internet is dead since Monday.', false, 1, 'Dengan "since" untuk keadaan yang masih berlangsung, pakai present perfect: has been down / hasn\'t worked since Monday.', ['My internet has been down since Monday.', "My internet hasn't worked since Monday."], 'n2'],
      ['Your service is terrible. Fix it now.', true, 1, 'Tata bahasanya benar, tetapi menyerang petugas membuat percakapan buntu. Jelaskan dulu masalahnya.', ["I'm afraid I've had a problem with my connection since Monday."], 'r1'],
    ]],
    ['r1', 'Ben', "I'm sorry to hear you're unhappy. Could you tell me exactly what the problem is?", 'Saya turut menyesal Anda kecewa. Bisa jelaskan apa tepatnya masalahnya?', [
      ["Sorry, I'm just frustrated. The connection has been down since Monday.", true, 3, 'Minta maaf singkat lalu kembali ke fakta. Ini memulihkan percakapan.', ["Of course. I haven't had any internet since Monday."], 'n2'],
      ["The problem is my internet doesn't work since Monday.", false, 2, '"since Monday" menuntut present perfect: my internet hasn\'t worked since Monday.', ["The problem is that my internet hasn't worked since Monday."], 'n2'],
    ]],
    ['n2', 'Ben', 'I see. Have you tried restarting the router?', 'Baik. Sudah mencoba menyalakan ulang router?', [
      ["Yes, I've restarted it several times, and the light is still red.", true, 3, 'Present perfect untuk tindakan yang sudah dilakukan tanpa waktu spesifik, ditambah fakta yang membantu petugas: lampunya merah.', ['Yes, more than once. The light keeps flashing red.'], 'n3'],
      ['Yes, I already restart it.', false, 1, '"already" untuk tindakan yang sudah selesai memakai present perfect: I\'ve already restarted it.', ["Yes, I've already restarted it."], 'n3'],
      ["Of course I have. Do you think I'm stupid?", true, 1, 'Tata bahasanya benar, tetapi defensif. Pertanyaan itu memang wajib ditanyakan petugas.', ['Yes, I have, several times.'], 'n3'],
    ]],
    ['n3', 'Ben', "Thanks. It looks like there's a fault in your area. An engineer can visit on Friday.", 'Terima kasih. Sepertinya ada gangguan di area Anda. Teknisi bisa datang hari Jumat.', [
      ['Friday is quite a long wait. Is there any chance someone could come sooner?', true, 3, 'Keberatan disampaikan halus ("quite a long wait"), lalu permintaan dengan pertanyaan tidak langsung "Is there any chance ...?".', ['Would it be possible to arrange an earlier visit?'], 'n4'],
      ['Can the engineer come more early?', false, 2, '"early" membentuk perbandingan "earlier", bukan "more early".', ['Could the engineer come any earlier?'], 'n4'],
      ["Friday? That's too late. I need it tomorrow.", true, 2, 'Tata bahasanya benar dan jelas, tetapi terdengar menuntut. Pertanyaan yang sopan lebih mungkin dikabulkan.', ['Is there any way it could be tomorrow?'], 'n4'],
    ]],
    ['n4', 'Ben', "I'll see what I can do. Is there anything else I can help with?", 'Akan saya usahakan. Ada lagi yang bisa saya bantu?', [
      ["Yes. Since I've been without internet for four days, I'd like to ask about compensation on this month's bill.", true, 3, '"Since" di sini berarti "karena". Permintaannya spesifik, dan "I\'d like to ask about ..." sopan tetapi tegas.', ["Could I get a discount on this month's bill, given the outage?"], 'end'],
      ['I want my money back for all the days.', true, 1, 'Bisa dimengerti, tetapi "I want" terdengar menuntut. Sebutkan permintaanmu dengan sopan dan spesifik.', ["I'd like a refund for the days without service, please."], 'end'],
      ['I would like to ask a compensation.', false, 2, '"meminta" sesuatu = "ask for": ask for compensation. "compensation" dalam arti ini juga tidak memakai "a".', ["I'd like to ask for compensation."], 'end'],
    ]],
  ]),
  scenario('salary', 'Negosiasi Gaji', 'C1', true, 'Kamu menerima tawaran kerja, tetapi gaji yang ditawarkan di bawah harapanmu. Bu Tan dari bagian SDM menelepon.', 'Menunjukkan antusiasme, menyebut angka beserta alasannya, lalu mencapai kompromi tanpa merusak hubungan.', 'Negosiasimu berhasil. Polanya: tunjukkan antusiasme, beri alasan berbasis data, lalu tawarkan jalan tengah.', [
    ['n1', 'Ms Tan', "We're delighted to offer you the position. The starting salary would be twelve million rupiah a month. How does that sound?", 'Kami senang menawarkan posisi ini kepada Anda. Gaji awalnya dua belas juta rupiah per bulan. Bagaimana menurut Anda?', [
      ["Thank you, I'm thrilled to receive the offer. Before I accept, I was hoping we could discuss the salary.", true, 3, 'Antusias dulu, lalu membuka negosiasi dengan "I was hoping we could ...". Past continuous di sini membuat permintaan terdengar lebih halus.', ["Thank you so much. I'm very keen on the role, though I'd like to talk about the salary."], 'n2'],
      ["It's too low. I want fifteen.", true, 1, 'Langsung dan bisa dimengerti, tetapi tanpa terima kasih dan tanpa alasan terdengar konfrontatif.', ['Thank you. Would there be any flexibility on the salary?'], 'n2'],
      ['Thank you. But I hope the salary can be more higher.', false, 1, '"more higher" salah karena "higher" sudah bentuk perbandingan. Kalimatnya juga terdengar seperti terjemahan langsung.', ["Thank you. I was wondering whether there's any room to increase the salary."], 'n2'],
    ]],
    ['n2', 'Ms Tan', 'Of course. What figure did you have in mind?', 'Tentu. Angka berapa yang Anda pikirkan?', [
      ["Based on my five years' experience and the market rate for similar roles, I was thinking of something closer to fifteen million.", true, 3, '"Based on ..." memberi dasar yang objektif. "something closer to" melunakkan angka tanpa melemahkannya.', ["Given my experience, I'd be looking for around fifteen million."], 'n3'],
      ['I think fifteen million is fair, because I have experience five years.', false, 2, 'Dalam bahasa Inggris jumlah datang sebelum kata benda: five years of experience atau five years\' experience.', ['I think fifteen million is fair, given my five years of experience.'], 'n3'],
      ['As much as possible, actually.', true, 1, 'Tata bahasanya benar, tetapi tanpa angka negosiasi tidak bisa berjalan. Sebutkan angka dan alasannya.', ['Something in the region of fifteen million.'], 'n3'],
    ]],
    ['n3', 'Ms Tan', "Fifteen is above our budget for this grade, I'm afraid. We could perhaps go to thirteen.", 'Lima belas di atas anggaran kami untuk jenjang ini. Mungkin kami bisa sampai tiga belas.', [
      ['I appreciate that. Would you be able to meet me halfway at fourteen, perhaps with a review after six months?', true, 3, '"meet me halfway" = berkompromi di tengah. Tawaran tinjauan gaji memberi jalan keluar bagi kedua pihak.', ['I understand. Could we agree on fourteen, with a salary review in six months?'], 'n4'],
      ["If you can't give fifteen, I will think again about the offer.", true, 2, 'Tata bahasanya benar, tetapi terdengar seperti ancaman. Kalau ingin menyampaikan batas, lunakkan: "I\'d need to think it over."', ["I'd need some time to think it over at thirteen."], 'n4'],
      ['Thirteen is too few for me.', false, 1, '"few" dipakai untuk benda yang bisa dihitung satu per satu. Untuk gaji atau angka, pakai "low": Thirteen is a little low for me.', ["I'm afraid thirteen is a little low for me."], 'n4'],
    ]],
    ['n4', 'Ms Tan', 'Let me check with my manager... Fourteen with a review in six months is fine.', 'Saya tanyakan ke atasan saya dulu... Empat belas dengan tinjauan dalam enam bulan, bisa.', [
      ["That's great news. Thank you for being so flexible. I'm happy to accept.", true, 3, 'Menutup dengan terima kasih atas kompromi pihak lain, lalu menerima dengan jelas.', ["Wonderful, thank you. I'm delighted to accept the offer."], 'end'],
      ['OK. Fine.', true, 1, 'Tata bahasanya benar, tetapi terdengar tidak puas setelah pihak lain mau berkompromi.', ['Thank you, that works for me.'], 'end'],
      ["Thank you, I'm agree with this.", false, 1, '"agree" adalah kata kerja, jadi tidak dipakai bersama "am": I agree.', ['Thank you, I agree.', 'Thank you, that sounds good.'], 'end'],
    ]],
  ]),
  scenario('seminar', 'Diskusi Seminar: Menyanggah dengan Sopan', 'C1', true, 'Seminar pascasarjana. Daniel, rekan seminarmu, berargumen bahwa media sosial membuat orang lebih kesepian.', 'Mengakui argumen lawan, menyanggah dengan bukti dan bahasa yang hati-hati (hedging), lalu merangkum posisimu.', 'Diskusi selesai dengan hormat. Mengakui dulu, menyanggah dengan bukti, dan memakai hedging membuat argumenmu kuat tanpa terdengar menyerang.', [
    ['n1', 'Daniel', 'So my argument is that social media has made people lonelier. The evidence is pretty clear.', 'Jadi argumen saya, media sosial membuat orang lebih kesepian. Buktinya cukup jelas.', [
      ["That's an interesting point, but I'd question whether the evidence is quite that clear. Most of the studies I've seen show a correlation rather than a cause.", true, 3, 'Mengakui dulu, lalu menyanggah dengan hedging "I\'d question whether ...". Membedakan korelasi dan sebab adalah argumen akademik yang kuat.', ["I'm not entirely convinced. Couldn't lonely people simply use social media more?"], 'n2'],
      ['You are wrong. There is no evidence.', true, 1, 'Tata bahasanya benar, tetapi menyerang orangnya dan berlebihan ("no evidence"). Di seminar, sanggah argumennya, bukan orangnya.', ["I'm not sure the evidence supports that."], 'n2'],
      ['Although there are many studies, but they are not clear.', false, 1, '"although" dan "but" tidak dipakai bersama dalam satu kalimat bahasa Inggris (berbeda dengan "meskipun ... tetapi"). Pilih salah satu.', ["Although there are many studies, they aren't conclusive."], 'n2'],
    ]],
    ['n2', 'Daniel', 'Fair enough. But surely the timing is suggestive? Loneliness rose just as smartphones spread.', 'Baiklah. Tapi bukankah waktunya mencurigakan? Rasa kesepian meningkat tepat ketika ponsel pintar menyebar.', [
      ["It's suggestive, certainly. That said, a lot of other things changed in that period too, such as working hours and housing costs.", true, 3, 'Mengakui ("certainly"), lalu "That said" untuk membatasi, diikuti contoh konkret faktor lain.', ['True, although several other factors changed at the same time.'], 'n3'],
      ['Yes, but many things also change at that time.', false, 2, 'Periode yang dibicarakan sudah lampau, jadi kata kerjanya lampau: many other things changed at that time.', ['Yes, but many other things changed at that time too.'], 'n3'],
      ["Timing doesn't prove anything.", true, 2, 'Tata bahasanya benar dan logis, tetapi terlalu mutlak. Hedging seperti "doesn\'t necessarily prove" lebih meyakinkan di forum akademik.', ["Timing alone doesn't necessarily prove causation."], 'n3'],
    ]],
    ['n3', 'Daniel', 'So what would convince you?', 'Lalu apa yang bisa meyakinkanmu?', [
      ['Ideally, a study that followed the same people over several years and controlled for those other factors.', true, 3, '"Ideally" lalu rincian desain penelitian yang spesifik. Jawaban yang konstruktif.', ['Long-term studies that track the same participants would be far more persuasive.'], 'n4'],
      ['Nothing, honestly.', true, 1, 'Jawaban ini menutup diskusi dan membuatmu terdengar tidak terbuka.', ['Stronger evidence of cause and effect would.'], 'n4'],
      ['If there is a study which follow the same people for years.', false, 1, 'Ini bukan kalimat lengkap, hanya klausa "if". Selain itu "a study which follows" butuh -s.', ['A study that followed the same people for years would.'], 'n4'],
    ]],
    ['n4', 'Moderator', 'We need to wrap up. Could you each sum up your position in one sentence?', 'Kita harus menutup diskusi. Bisakah masing-masing merangkum posisinya dalam satu kalimat?', [
      ["In short, while social media may play a part, I'd argue that the evidence for a direct causal link remains limited.", true, 3, '"In short" merangkum, "while" memberi konsesi, dan "I\'d argue ... remains limited" adalah hedging khas akademik.', ["To sum up, the link may exist, but it hasn't been proven."], 'end'],
      ["In conclusion, Daniel's idea is not correct.", true, 1, 'Tata bahasanya benar, tetapi tidak merangkum argumenmu sendiri dan terdengar meremehkan.', ["In conclusion, I don't think a causal link has been established."], 'end'],
      ['To sum up, the evidence is not enough strong.', false, 2, '"enough" diletakkan setelah kata sifat: strong enough.', ["To sum up, the evidence isn't strong enough."], 'end'],
    ]],
  ]),
  scenario('bad-news', 'Menyampaikan Kabar Buruk kepada Klien', 'C2', true, 'Kamu manajer proyek. Proyek untuk Ms Wong akan terlambat tiga minggu karena kesalahan timmu, dan kamu meminta panggilan untuk memberitahunya.', 'Mengakui kesalahan tanpa berbelit, menawarkan pilihan yang konkret, dan menjaga kepercayaan klien.', 'Kepercayaan klien terjaga. Kabar buruk yang disampaikan langsung, disertai tanggung jawab dan pilihan konkret, lebih dihargai daripada bahasa yang berputar-putar.', [
    ['n1', 'Ms Wong', "You asked for this call, so I'm guessing it isn't good news.", 'Anda yang meminta panggilan ini, jadi saya kira ini bukan kabar baik.', [
      ["I'm afraid not, and I'd rather tell you now than let you hear it later. We're going to miss the deadline by about three weeks, and that's on us.", true, 3, 'Langsung ke inti, mengakui tanggung jawab ("that\'s on us"), dan "I\'d rather ... than ..." menunjukkan kejujuran yang disengaja.', ["Unfortunately not. We're running about three weeks behind, and the fault is ours."], 'n2'],
      ['Well, there may possibly be some small challenges regarding the timeline going forward.', true, 1, 'Tata bahasanya benar, tetapi berbelit dan menyamarkan masalah. Klien akan merasa dipermainkan ketika tahu keterlambatannya tiga minggu.', ["Not entirely, I'm afraid. We're running about three weeks behind."], 'r1'],
      ['Yes. The project will late three weeks.', false, 1, '"late" adalah kata sifat, jadi perlu "be": The project will be three weeks late.', ["The project will be three weeks late, I'm afraid."], 'n2'],
    ]],
    ['r1', 'Ms Wong', "Could you be a bit more specific? What does 'challenges' mean in practice?", "Bisa lebih spesifik? Apa arti 'tantangan' itu dalam praktiknya?", [
      ["Of course, I should have been clearer. We'll be roughly three weeks late, and it's our fault.", true, 3, '"I should have been clearer" mengakui kekeliruan cara bicaramu, lalu langsung memberi fakta.', ['In practice, a three-week delay. I apologise for not saying so straight away.'], 'n2'],
      ['It means that some delays might be happened.', false, 1, '"happen" tidak bisa dipasifkan: some delays might happen. Jawaban ini juga tetap terlalu kabur.', ["It means we'll be about three weeks late."], 'n2'],
    ]],
    ['n2', 'Ms Wong', 'Three weeks? That puts our product launch at risk. How did this happen?', 'Tiga minggu? Itu membahayakan peluncuran produk kami. Bagaimana ini bisa terjadi?', [
      ['Frankly, we underestimated the integration work. I should have flagged the risk a month ago, when the first signs appeared.', true, 3, '"should have flagged" mengakui kesalahan di masa lalu dengan tepat; "Frankly" menandakan keterusterangan.', ["The integration took far longer than we'd planned, and I ought to have raised it sooner."], 'n3'],
      ['It was not only our fault. Your team was also late sending the data.', true, 1, 'Mungkin benar, tetapi menyalahkan klien saat kamu sedang mengakui keterlambatan merusak kepercayaan. Bahas faktor itu nanti, dengan data.', ['Several factors contributed, but the main one was on our side.'], 'n3'],
      ['We must have told you earlier.', false, 2, '"must have told" berarti "pasti sudah memberi tahu" (menyimpulkan). Untuk menyesali sesuatu yang tidak dilakukan, pakai "should have": We should have told you earlier.', ['We should have told you earlier.'], 'n3'],
    ]],
    ['n3', 'Ms Wong', 'So what are you proposing?', 'Lalu apa usul Anda?', [
      ['Two options. We can deliver the core features on the original date and the rest three weeks later, or we can add two developers at our own cost and close most of the gap.', true, 3, 'Pilihan yang konkret dan biaya yang ditanggung sendiri menunjukkan tanggung jawab. Struktur paralel "We can ..., or we can ..." mudah diikuti.', ['We could phase the delivery, or bring in extra developers at no cost to you.'], 'n4'],
      ['We will try our best.', true, 1, 'Tata bahasanya benar, tetapi kosong: klien butuh rencana, bukan janji umum.', ["We've prepared two concrete options."], 'n4'],
      ['We propose to give you a discount and finish later.', true, 2, 'Tata bahasanya benar, tetapi tawaran ini tidak menyelamatkan tanggal peluncuran, padahal itulah kekhawatiran utama klien.', ["We'd offer a discount, together with a phased delivery so your launch stays on track."], 'n4'],
    ]],
    ['n4', 'Ms Wong', "I'll need to discuss it with my director. I'm not thrilled, but I appreciate the honesty.", 'Saya perlu membicarakannya dengan direktur saya. Saya tidak senang, tetapi saya menghargai kejujuran Anda.', [
      ["That's entirely fair. I'll send you both options in writing this afternoon, so you have everything you need for that conversation.", true, 3, 'Menerima kekecewaan klien tanpa membela diri, lalu menawarkan tindak lanjut yang konkret.', ["Understood. I'll put both options in writing for you today."], 'end'],
      ["Don't worry, it's not a big problem.", true, 1, 'Meremehkan masalah yang baru saja kamu akui. Klien bisa merasa tidak didengar.', ["I understand, and I'm sorry for the disruption."], 'end'],
      ['Thank you for your understanding. I will send the options to you by the afternoon.', true, 2, 'Sopan, tetapi "Thank you for your understanding" terdengar seperti template ketika klien baru saja berkata tidak senang. "by the afternoon" juga kurang lazim; pakai "this afternoon".', ["I understand. I'll send you the options this afternoon."], 'end'],
    ]],
  ]),
  scenario('press', 'Menjawab Wartawan Saat Krisis', 'C2', true, 'Kamu juru bicara sebuah perusahaan aplikasi yang datanya baru saja bocor. Seorang wartawan mewawancaraimu.', 'Menjawab jujur tanpa berspekulasi, menolak dengan halus pertanyaan yang belum bisa dijawab, dan memberi langkah yang jelas kepada pengguna.', 'Wawancara selesai tanpa salah kutip. Pisahkan fakta dari dugaan, jangan membantah hal yang belum kamu periksa, dan tutup dengan langkah konkret.', [
    ['n1', 'Journalist', 'Thanks for speaking to us. Can you confirm that the personal data of two million users was stolen?', 'Terima kasih sudah bersedia bicara. Bisakah Anda memastikan bahwa data pribadi dua juta pengguna telah dicuri?', [
      ["What I can confirm is that we detected unauthorised access on Tuesday. We're still establishing how many accounts were affected, and I'd rather not give a figure until we're certain.", true, 3, 'Kalimat cleft "What I can confirm is ..." memisahkan fakta dari dugaan. "I\'d rather not ... until ..." menolak dengan halus dan beralasan.', ['We can confirm a breach on Tuesday, but it would be premature to put a number on it.'], 'n2'],
      ['No comment.', true, 1, 'Tata bahasanya benar, tetapi terdengar menyembunyikan sesuatu dan sering dikutip seolah pengakuan.', ["I can't confirm the figure yet, but I can tell you what we know so far."], 'n2'],
      ['Yes, it is possible that two millions of users were affected.', false, 1, '"million" setelah angka tidak diberi -s dan tidak diikuti "of": two million users. Menebak angka di depan wartawan juga berisiko, karena angka itu akan dikutip.', ["We're not yet in a position to confirm a number."], 'n2'],
    ]],
    ['n2', 'Journalist', "Users say they found out from social media, not from you. Why weren't they told sooner?", 'Pengguna bilang mereka tahu dari media sosial, bukan dari Anda. Mengapa mereka tidak diberi tahu lebih cepat?', [
      ["That's a fair criticism. We prioritised closing the breach, but in hindsight we should have informed users at the same time, and we're sorry that we didn't.", true, 3, 'Mengakui kritik, menjelaskan tanpa berdalih, lalu "in hindsight we should have ..." untuk penyesalan yang tepat.', ["You're right to raise that. We should have contacted users sooner, and we apologise."], 'n3'],
      ['We informed them as soon as it was possible for us to do so.', true, 2, 'Tata bahasanya benar, tetapi defensif dan bertentangan dengan pengalaman pengguna. Mengakui kekurangan lebih meyakinkan.', ['We could have informed them sooner, and we accept that.'], 'n3'],
      ["We didn't want to make them panic, so we didn't told them.", false, 1, 'Setelah "didn\'t" dipakai bentuk dasar: we didn\'t tell them. Alasan ini juga terdengar merendahkan pengguna.', ['We should have told them straight away.'], 'n3'],
    ]],
    ['n3', 'Journalist', 'Is it true that your security team warned management about this weakness months ago?', 'Benarkah tim keamanan Anda sudah memperingatkan manajemen tentang celah ini berbulan-bulan lalu?', [
      ["I'm not aware of any such warning, and I won't speculate. If it turns out that one was ignored, that will come out in the independent review we've commissioned.", true, 3, 'Tidak membantah dan tidak membenarkan hal yang tidak kamu ketahui. "If it turns out that ..." menunjukkan keterbukaan pada hasil penyelidikan.', ["I haven't seen any evidence of that, but the independent review will look into it."], 'n4'],
      ['That is absolutely not true.', true, 1, 'Membantah secara mutlak sesuatu yang belum kamu periksa sangat berisiko: bila ternyata benar, kredibilitasmu hilang.', ["I'm not aware of that, but it will be part of the review."], 'n4'],
      ["Even if it was true, I couldn't tell you.", true, 2, 'Tata bahasanya diterima (ragam formal lebih memilih "Even if it were true"), tetapi kalimat ini terdengar seperti mengakui ada yang disembunyikan.', ["I can't comment on internal discussions, but the review will examine them."], 'n4'],
    ]],
    ['n4', 'Journalist', 'Finally, what should users do right now?', 'Terakhir, apa yang sebaiknya dilakukan pengguna sekarang?', [
      ["Change their password, and be wary of any email asking for personal details, even if it appears to come from us. We'll never ask for a password by email.", true, 3, 'Langkah konkret dalam kalimat perintah yang jelas, ditambah satu fakta yang menenangkan.', ['They should reset their password and ignore any email asking for their details.'], 'end'],
      ["They don't need to do anything; everything is under control.", true, 1, 'Meremehkan risiko setelah kebocoran data justru membahayakan pengguna dan reputasimu.', ['As a precaution, they should change their password.'], 'end'],
      ['They should to change their password immediately.', false, 2, 'Setelah modal "should" tidak dipakai "to": They should change ...', ['They should change their password immediately.'], 'end'],
    ]],
  ]),
  scenario('pharmacy', 'Di Apotek', 'A2', true, 'Kamu demam dan batuk. Kamu pergi ke apotek dekat rumah.', 'Menjelaskan gejala, meminta obat, dan memahami aturan pakainya.', 'Kamu mendapat obat dan aturan pakainya. Menjelaskan gejala, lalu bertanya "How often should I take them?" membuat semuanya jelas.', [
    ['n1', 'Pharmacist', 'Good afternoon. How can I help you?', 'Selamat siang. Ada yang bisa saya bantu?', [
      ['Hi. I have a fever and a cough. Do you have any medicine for that?', true, 3, 'Gejala disebut dengan jelas, lalu "Do you have any ...?" (any untuk pertanyaan).', ['I have a cough and a fever. What do you recommend?'], 'n2'],
      ['I want medicine. I sick.', false, 1, 'Kalimat butuh to be: I am sick. "I want" juga terdengar kurang sopan.', ["I'm sick. Could I have some medicine, please?"], 'n2'],
      ['Do you have some medicines for cough?', false, 2, 'Pertanyaan biasa memakai "any", dan "medicine" di sini tak terhitung: any medicine for a cough.', ['Do you have any medicine for a cough?'], 'n2'],
    ]],
    ['n2', 'Pharmacist', 'I see. Do you have a headache too?', 'Begitu. Apakah kepala Anda juga sakit?', [
      ['Yes, a little. It started this morning.', true, 3, 'Jawaban pendek ditambah informasi yang membantu, dengan simple past (started).', ['Yes, I do. Since this morning.'], 'n3'],
      ['Yes, I am.', false, 1, 'Pertanyaannya memakai "Do you have", jadi jawabannya "Yes, I do."', ['Yes, I do.'], 'n3'],
      ['Yes, very much headache.', false, 1, '"headache" bisa dihitung: I have a bad headache.', ['Yes, I have a bad headache.'], 'n3'],
    ]],
    ['n3', 'Pharmacist', 'Take these tablets. You should drink a lot of water and get some rest.', 'Minum tablet ini. Sebaiknya Anda minum banyak air dan beristirahat.', [
      ['Thank you. How often should I take them?', true, 3, '"How often should I ...?" menanyakan aturan pakai dengan tepat.', ['How many tablets should I take a day?'], 'n4'],
      ['How much tablets I take?', false, 1, '"tablets" bisa dihitung, jadi How many. Pertanyaannya juga butuh "should" atau "do": How many tablets should I take?', ['How many tablets should I take?'], 'n4'],
      ['OK. I must to drink water?', false, 2, 'Setelah "must" tanpa "to". Untuk bertanya: Should I drink a lot of water?', ['Should I drink a lot of water?'], 'n4'],
    ]],
    ['n4', 'Pharmacist', "Two tablets three times a day, after meals. You mustn't take more than six a day.", 'Dua tablet tiga kali sehari, setelah makan. Anda tidak boleh minum lebih dari enam tablet sehari.', [
      ['Two tablets three times a day after meals, and not more than six. Thank you!', true, 3, 'Mengulang aturan pakai memastikan kamu tidak salah paham.', ['Got it. Thank you for your help.'], 'end'],
      ["OK, so I don't have to take more than six.", true, 1, 'Tata bahasanya benar, tetapi maknanya keliru: "don\'t have to" berarti tidak perlu, padahal apoteker berkata "mustn\'t" (tidak boleh). Salah mengulang aturan obat bisa berbahaya.', ["OK, so I mustn't take more than six."], 'end'],
      ['Thank you. I will taking after eat.', false, 1, 'Setelah "will", bentuk dasar: I will take them after meals.', ['Thank you. I will take them after meals.'], 'end'],
    ]],
  ]),
  scenario('neighbour', 'Tetangga yang Berisik', 'B1', true, 'Pukul sebelas malam. Musik dari rumah tetangga barumu sangat keras, padahal besok kamu ujian.', 'Meminta tetangga mengecilkan musik dengan sopan, tetap ramah, dan mencapai kesepakatan.', 'Masalah selesai tanpa bertengkar. "Do you mind ...-ing?" dan question tag yang ramah membuat permintaan terdengar sopan.', [
    ['n1', 'Mr Hadi', "Oh, hello! You live next door, don't you?", 'Oh, halo! Kamu tinggal di sebelah, kan?', [
      ['Yes, I do. Sorry to bother you so late. Do you mind turning the music down a little?', true, 3, 'Menjawab tag dengan "Yes, I do", minta maaf, lalu "Do you mind + -ing?" yang sopan.', ['Hi, yes. Would you mind turning the music down, please?'], 'n2'],
      ["Yes, isn't it. Your music is too loud.", false, 1, 'Jawaban untuk "..., don\'t you?" adalah "Yes, I do." Langsung mengeluh juga terdengar kasar.', ["Yes, I do. I'm afraid the music is a bit loud."], 'r1'],
      ['Yes. Do you mind to turn down the music?', false, 2, '"mind" diikuti -ing: Do you mind turning down the music?', ['Do you mind turning down the music?'], 'n2'],
    ]],
    ['r1', 'Mr Hadi', "Too loud? It's not that loud, is it?", 'Terlalu keras? Tidak sekeras itu, kan?', [
      ["I'm sorry, I didn't mean to be rude. It's just that I have an exam tomorrow.", true, 3, 'Minta maaf atas nada sebelumnya, lalu memberi alasan yang jujur.', ["Sorry, that sounded rude. I have an exam tomorrow, that's all."], 'n2'],
      ["Yes, it is. It's very too loud.", false, 1, '"very" dan "too" tidak dipakai bersama. Pakai "too loud" atau "far too loud".', ["Yes, I'm afraid it's too loud."], 'n2'],
    ]],
    ['n2', 'Mr Hadi', "Oh, sorry! I didn't realise it was so late. We're having a small party.", 'Oh, maaf! Saya tidak sadar sudah selarut ini. Kami sedang mengadakan pesta kecil.', [
      ["No problem. I've got an exam tomorrow, so I need to get enough sleep.", true, 3, '"need to + bentuk dasar" dan "enough + kata benda" dipakai dengan tepat. Alasan yang jelas membuat permintaan masuk akal.', ["That's OK. I just need to sleep early tonight because of an exam."], 'n3'],
      ["It's fine. I need sleeping enough.", false, 1, '"need" diikuti to + bentuk dasar, dan "enough" sebelum kata benda: I need to get enough sleep.', ['I need to get enough sleep.'], 'n3'],
      ['Parties are not allowed after ten, you know.', true, 2, 'Tata bahasanya benar, tetapi terdengar seperti ancaman kepada tetangga baru. Mulailah dengan alasanmu sendiri.', ["I understand. It's just that I have an exam tomorrow."], 'n3'],
    ]],
    ['n3', 'Mr Hadi', "Of course. We'll turn it down now. You aren't angry, are you?", 'Tentu. Kami kecilkan sekarang. Kamu tidak marah, kan?', [
      ["No, I'm not. Thanks for understanding. Enjoy your party!", true, 3, 'Menjawab tag sesuai kenyataan ("No, I\'m not"), lalu menutup dengan ramah.', ['Not at all. Thank you, and have a nice evening!'], 'end'],
      ["Yes, I'm not.", false, 1, '"Yes" dan "not" bertentangan. Kalau tidak marah: No, I\'m not.', ["No, I'm not."], 'end'],
      ["No, I don't. Thank you.", false, 2, 'Pertanyaannya memakai "are", jadi jawabannya "No, I\'m not."', ["No, I'm not. Thank you."], 'end'],
    ]],
  ]),
];
