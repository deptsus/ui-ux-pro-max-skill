// Rilis 5: C1–C2 conversations and listening, built on the grammar of the new
// chapters (persuasion, register, reporting verbs, concession, inversion, work
// idioms). Same rules as before: "correct: false" always means a grammar error;
// a grammatical but tactless reply is correct with low naturalness.
import type { Scenario } from '@/lib/content/types';
import { scenario } from './conversations';
import { dictation, listen } from './dsl';
import type { ListeningDraft } from './listening';

export const scenariosR5: Scenario[] = [
  scenario('pitch', 'Mengusulkan Ide kepada Direktur', 'C1', true, 'Kamu punya lima menit untuk mengusulkan program mentoring bagi karyawan baru kepada Pak Harris, direktur perusahaan.', 'Membuka dengan inti dan angka, menunjukkan bukti, menanggapi keberatan biaya, lalu meminta keputusan yang spesifik.', 'Usulan yang meyakinkan: inti dan angka di awal, bukti dari uji coba, pengakuan atas keberatan dengan "I do understand", lalu permintaan yang jelas.', [
    ['n1', 'Mr Harris', "You wanted five minutes. What's the idea?", 'Kamu minta lima menit. Apa idenya?', [
      ["Thanks for your time. In short, I'd like to propose a mentoring scheme that could cut staff turnover by a third.", true, 3, 'Langsung ke inti dengan angka dan modal "could" yang kredibel.', ["Thank you. I'd like to propose a mentoring programme for new staff that could reduce turnover significantly."], 'n2'],
      ['I suggest you to start a mentoring scheme.', false, 1, 'Tidak ada pola "suggest someone to". Pakai "I suggest starting" atau "I suggest that we start".', ['I suggest that we start a mentoring scheme.'], 'n2'],
      ["It's a brilliant idea and everyone will love it.", true, 1, 'Tata bahasanya benar, tetapi klaim mutlak tanpa isi membuat direktur skeptis.', ['I think it could make a real difference to how long new staff stay.'], 'r1'],
    ]],
    ['r1', 'Mr Harris', "Everyone? That's quite a claim. What's it actually about?", 'Semua orang? Klaim yang cukup besar. Sebenarnya tentang apa?', [
      ["Fair point. It's a mentoring scheme for new staff, and the pilot results are encouraging.", true, 3, 'Mengakui kritik ("Fair point") lalu kembali ke isi dan bukti.', ["You're right, I got carried away. It's a mentoring scheme for new employees."], 'n2'],
      ['Is about mentoring for new staff.', false, 1, 'Kalimat bahasa Inggris butuh subjek: It is about ...', ["It's about mentoring for new staff."], 'n2'],
    ]],
    ['n2', 'Mr Harris', 'And what evidence do you have that it would work?', 'Dan bukti apa yang kamu punya bahwa ini akan berhasil?', [
      ["In last year's pilot, nine out of ten new hires with a mentor stayed beyond their first year, compared with six out of ten without one.", true, 3, 'Bukti konkret dengan perbandingan. Inilah yang meyakinkan pengambil keputusan.', ['Our pilot showed that ninety per cent of mentored staff stayed for more than a year.'], 'n3'],
      ['It is said to work in many companies, so it will definitely work here too.', true, 1, 'Pasif impersonalnya benar, tetapi "konon berhasil" lalu "pasti berhasil" adalah lompatan logika.', ['Other companies report good results, and our own pilot supports that.'], 'n3'],
      ['The pilot has showed great results.', false, 2, 'Bentuk ketiga "show" adalah "shown": has shown.', ['The pilot has shown great results.'], 'n3'],
    ]],
    ['n3', 'Mr Harris', "It sounds expensive. We're already over budget this year.", 'Kedengarannya mahal. Anggaran tahun ini sudah terlampaui.', [
      ['I do understand the concern. The scheme would cost far less than replacing the staff we currently lose.', true, 3, '"I do understand" mengakui keberatan dengan tulus, lalu membalik soal biaya menjadi penghematan.', ['I appreciate that. But losing and replacing staff costs us far more than mentoring would.'], 'n4'],
      ["Money isn't the point. You have to think bigger.", true, 1, 'Tata bahasanya benar, tetapi menepis kekhawatiran atasan terdengar meremehkan.', ['I understand. Could I show you how it would actually save money?'], 'n4'],
      ["I do understood the concern, but it's cheap.", false, 1, 'Setelah do penekanan, bentuk dasar: I do understand.', ['I do understand the concern.'], 'n4'],
    ]],
    ['n4', 'Mr Harris', 'All right. What exactly do you need from me?', 'Baiklah. Apa tepatnya yang kamu butuhkan dari saya?', [
      ["Approval to run a six-month trial in two departments. I'd be happy to report back in June.", true, 3, 'Permintaan spesifik (apa, berapa lama, di mana) dan janji melapor membuat keputusan mudah diambil.', ["Your approval for a six-month trial, please. I'll report back with the results in June."], 'end'],
      ['Just say yes, please.', true, 1, 'Lucu, tetapi tidak memberi direktur sesuatu yang konkret untuk disetujui.', ['Your approval for a trial in two departments.'], 'end'],
      ['I would be grateful if you can approve a trial.', false, 2, 'Pola "I would be grateful if you" diikuti could.', ['I would be grateful if you could approve a trial.'], 'end'],
    ]],
  ]),
  scenario('extension', 'Meminta Perpanjangan Tenggat kepada Dosen', 'C1', true, 'Kamu sakit minggu lalu dan belum selesai menulis esai. Kamu menemui Dr Lim di ruangannya untuk meminta perpanjangan tenggat.', 'Memakai register yang sopan, menjelaskan alasan dengan jelas, dan menerima syarat dengan baik.', 'Permintaan formal yang berhasil: pembuka yang sopan ("I was wondering whether ..."), alasan yang jelas dengan tense yang tepat, dan kesediaan memenuhi syarat.', [
    ['n1', 'Dr Lim', 'Come in. What can I do for you?', 'Masuk. Ada yang bisa saya bantu?', [
      ['Thank you for seeing me, Dr Lim. I was wondering whether I could ask for a short extension on the essay.', true, 3, 'Ucapan terima kasih dan permintaan tidak langsung "I was wondering whether ..." sangat sopan.', ['Thanks for seeing me. Would it be possible to have a short extension on the essay?'], 'n2'],
      ['Hey, can I get more time for the essay?', true, 1, 'Tata bahasanya benar, tetapi terlalu santai untuk dosen.', ['Could I possibly have a little more time for the essay?'], 'r1'],
      ['I want to ask an extension for the essay.', false, 2, '"meminta sesuatu" = ask for: ask for an extension.', ['I would like to ask for an extension on the essay.'], 'n2'],
    ]],
    ['r1', 'Dr Lim', 'Well, that depends. Could you explain the situation?', 'Hmm, tergantung. Bisa kamu jelaskan situasinya?', [
      ["Of course, and sorry, that was rather abrupt. I was ill last week and missed several days.", true, 3, 'Meminta maaf atas nada sebelumnya lalu menjelaskan dengan past simple.', ['Certainly. I was unwell last week and fell behind.'], 'n2'],
      ['I was sick, so I need it.', true, 2, 'Benar dan jelas, tetapi masih terdengar menuntut.', ['I was ill last week, so I was hoping for a few more days.'], 'n2'],
    ]],
    ['n2', 'Dr Lim', 'I see. What happened, and how much time do you need?', 'Begitu. Apa yang terjadi, dan berapa lama waktu yang kamu perlukan?', [
      ['I was in hospital for three days last week. Would it be possible to submit it next Monday instead of Friday?', true, 3, 'Past simple untuk kejadian minggu lalu, lalu permintaan konkret dan sopan.', ['I was in hospital last week. Could I hand it in on Monday rather than Friday?'], 'n3'],
      ['I have been in hospital for three days last week.', false, 2, 'Dengan "last week" (waktu lampau yang selesai), pakai past simple: I was in hospital.', ['I was in hospital for three days last week.'], 'n3'],
      ['Just a few days. My doctor suggested me to rest.', false, 1, 'Tidak ada pola "suggest someone to". Pakai "suggested that I rest" atau "told me to rest".', ['My doctor told me to rest.'], 'n3'],
    ]],
    ['n3', 'Dr Lim', "That's fine, but I'll need a medical certificate. The department insists on it.", 'Boleh, tetapi saya perlu surat keterangan dokter. Jurusan mewajibkannya.', [
      ["Of course. I'll bring it to your office tomorrow morning.", true, 3, 'Menerima syarat dengan sigap dan memberi waktu yang jelas.', ["Certainly. I'll drop it off tomorrow morning."], 'n4'],
      ["Is that really necessary? I'm telling the truth.", true, 1, 'Tata bahasanya benar, tetapi defensif. Syarat itu aturan jurusan, bukan tuduhan.', ["Of course. I'll bring it in tomorrow."], 'n4'],
      ['Sure, I will bring it you tomorrow.', false, 2, '"bring it to you": setelah "it", orangnya memakai "to".', ['Sure, I will bring it to you tomorrow.'], 'n4'],
    ]],
    ['n4', 'Dr Lim', 'Good. Anything else?', 'Baik. Ada lagi?', [
      ["No, that's everything. Thank you very much for your understanding.", true, 3, 'Penutup formal yang hangat.', ['No, thank you. I really appreciate it.'], 'end'],
      ['No. Bye.', true, 1, 'Terlalu singkat setelah dosen membantumu.', ['No, that\'s all. Thank you so much.'], 'end'],
      ['No, thank you for understand.', false, 1, 'Setelah "for" pakai kata benda/-ing: thank you for understanding / for your understanding.', ['No, thank you for your understanding.'], 'end'],
    ]],
  ]),
  scenario('retro', 'Rapat Evaluasi Setelah Peluncuran Gagal', 'C2', true, 'Kamu memimpin rapat evaluasi setelah peluncuran aplikasi yang bermasalah. Ken, salah satu pengembang, langsung bersikap defensif.', 'Menjaga rapat tetap pada proses, bukan menyalahkan orang; mengakui sisi lain dengan konsesi; dan menutup dengan langkah berikutnya.', 'Rapat evaluasi yang sehat: fokus pada proses, konsesi untuk mengakui sudut pandang orang lain (Much as ...), inversi untuk syarat penting (Only after ...), dan idiom kerja yang tepat.', [
    ['n1', 'Ken', "Before we start, I just want to say the launch wasn't my fault.", 'Sebelum mulai, saya cuma mau bilang peluncuran itu bukan salah saya.', [
      ["Nobody's looking for someone to blame, Ken. The aim is to make sure we're all on the same page about what went wrong.", true, 3, 'Meredakan suasana dan mengarahkan ke proses. Idiom "on the same page" wajar di rapat.', ["This isn't about blame, Ken. Let's just understand what happened."], 'n2'],
      ["Well, it was partly your fault, wasn't it?", true, 1, 'Tata bahasanya benar, tetapi langsung menyalahkan membuat rapat buntu.', ["Let's focus on the process rather than on individuals."], 'r1'],
      ['Nobody blames you of anything.', false, 2, 'blame memakai "for": blame someone for something. Pola "of" milik accuse.', ['Nobody is blaming you for anything.'], 'n2'],
    ]],
    ['r1', 'Ken', 'So you are blaming me.', 'Jadi kamu menyalahkan saya.', [
      ["No, I'm not, and I'm sorry it came across that way. Let's look at the process, not at individuals.", true, 3, 'Meminta maaf atas kesan yang timbul lalu mengembalikan fokus.', ["I didn't mean it like that. Let's focus on what we can fix."], 'n2'],
      ["Fine, forget it. Let's move on.", true, 2, 'Benar, tetapi menepis perasaan Ken tanpa memperbaikinya.', ["Sorry, that came out wrong. Let's look at the process."], 'n2'],
    ]],
    ['n2', 'Ken', 'Well, if you ask me, the deadline was unrealistic from the start.', 'Menurut saya, tenggatnya memang tidak realistis sejak awal.', [
      ['Much as I agree the deadline was tight, I think we also cut corners on testing.', true, 3, 'Konsesi "Much as ..." mengakui poin Ken sebelum menambahkan penyebab lain. Idiom "cut corners" tepat.', ['I agree the deadline was tight, but we also skipped some testing.'], 'n3'],
      ['Much as I agree, but the deadline was tight.', false, 2, '"Much as" sudah bermakna "walaupun", jadi tidak diikuti "but". Pakai: Much as I agree that the deadline was tight, ...', ['Much as I agree that the deadline was tight, we also rushed the testing.'], 'n3'],
      ['Deadlines are deadlines. Everyone else managed.', true, 1, 'Tata bahasanya benar, tetapi menolak keluhan tanpa menimbangnya.', ['That may be true. Let\'s look at what else went wrong.'], 'n3'],
    ]],
    ['n3', 'Ken', 'So what do you suggest? Start again from scratch?', 'Jadi apa saranmu? Mulai lagi dari nol?', [
      ["Not quite back to square one. Only after we've fixed the payment bug should we relaunch, albeit a few weeks later.", true, 3, 'Idiom, inversi setelah "Only after", dan "albeit" + frasa, semuanya tepat dan jelas.', ["We're not back to square one. We should relaunch once the payment bug is fixed."], 'n4'],
      ['Only after we fixed the bug we should relaunch.', false, 2, 'Setelah "Only after ..." di awal, klausa utama dibalik: should we relaunch.', ["Only after we've fixed the bug should we relaunch."], 'n4'],
      ["Yes, we're back to square zero.", false, 1, 'Idiomnya tetap: back to square one.', ["Not quite back to square one."], 'n4'],
    ]],
    ['n4', 'Ken', "Fair enough. Who's going to tell the client?", 'Oke. Siapa yang akan memberi tahu klien?', [
      ["I'll touch base with them this afternoon and let you all know how it goes.", true, 3, 'Mengambil tanggung jawab dan berjanji memberi kabar. Idiom "touch base" wajar.', ["I'll call them this afternoon and update everyone."], 'end'],
      ['You should, since it was your module.', true, 1, 'Tata bahasanya benar, tetapi kembali menyalahkan dan merusak suasana yang sudah tenang.', ["I'll do it. It's my responsibility as project lead."], 'end'],
      ['I will touch the base with them.', false, 2, 'Bentuk idiom tetap: touch base (tanpa "the").', ["I'll touch base with them."], 'end'],
    ]],
  ]),
  scenario('workload', 'Menolak Tambahan Proyek dengan Halus', 'C2', true, 'Bu Ortega, direkturmu, memintamu memimpin proyek klien baru, padahal beban kerjamu sudah penuh.', 'Menolak sebagian tanpa merusak hubungan: understatement yang sopan, usulan solusi dengan subjunctive, dan rencana evaluasi.', 'Penolakan yang profesional: hargai kepercayaannya, sampaikan masalah dengan understatement, tawarkan solusi (I\'d suggest that someone else take ...), dan sepakati evaluasi.', [
    ['n1', 'Ms Ortega', "I'd like you to lead the new client project as well. You're the best person for it.", 'Saya ingin kamu juga memimpin proyek klien baru. Kamu orang yang paling tepat.', [
      ["That's very kind of you. I'd be glad to help, although my current workload is, to put it mildly, rather full.", true, 3, 'Menghargai kepercayaan, lalu understatement "to put it mildly, rather full" menyampaikan masalah tanpa mengeluh.', ["Thank you, I'm flattered. I should mention, though, that my plate is fairly full at the moment."], 'n2'],
      ["No way. I'm too busy.", true, 1, 'Tata bahasanya benar, tetapi menolak atasan seperti ini terdengar kasar.', ["I'd love to, but I'm a little worried about my current workload."], 'r1'],
      ["I'm honoured, but my workload is very fulled.", false, 1, '"full" adalah kata sifat, tidak punya bentuk "fulled".', ["I'm honoured, but my workload is very full."], 'n2'],
    ]],
    ['r1', 'Ms Ortega', "That's a rather blunt answer.", 'Itu jawaban yang cukup ketus.', [
      ["You're right, I'm sorry. What I meant is that I'm worried about doing both projects badly.", true, 3, 'Meminta maaf, lalu cleft "What I meant is ..." memperjelas kekhawatiran yang sebenarnya.', ['Sorry, I put that badly. I just want to do the work properly.'], 'n2'],
      ["Well, it's true.", true, 1, 'Mungkin benar, tetapi tidak memperbaiki kesan yang buruk.', ["I'm sorry, I didn't mean to sound rude."], 'n2'],
    ]],
    ['n2', 'Ms Ortega', 'I understand. But this client is important. What would make it possible?', 'Saya mengerti. Tetapi klien ini penting. Apa yang bisa membuatnya mungkin?', [
      ["I'd suggest that someone else take over the training programme, so I can give the client my full attention.", true, 3, 'Subjunctive formal "suggest that someone else take" dan alasan yang berpihak pada klien.', ["Perhaps someone else could take over the training programme, so I can focus on the client."], 'n3'],
      ["I'd suggest someone else to take over the training programme.", false, 2, 'Tidak ada pola "suggest someone to". Pakai: suggest that someone else take over.', ["I'd suggest that someone else take over the training programme."], 'n3'],
      ['Give the training to someone else.', true, 1, 'Tata bahasanya benar, tetapi kalimat perintah kepada direktur terdengar tidak sopan.', ['Could someone else take on the training programme?'], 'n3'],
    ]],
    ['n3', 'Ms Ortega', "Hmm. The training programme isn't exactly a small task either.", 'Hmm. Program pelatihan juga bukan tugas kecil.', [
      ["True, it isn't. Were Dina to lead it, though, I could still support her for an hour a week.", true, 3, 'Inversi kondisional formal "Were Dina to lead it" untuk menawarkan jalan tengah.', ['That\'s true. If Dina led it, I could still help her for an hour a week.'], 'n4'],
      ['If Dina would lead it, I could support her.', false, 2, 'Bagian if tidak memakai would. Pakai "If Dina led it" atau "Were Dina to lead it".', ['If Dina led it, I could support her.'], 'n4'],
      ["That's not my problem.", true, 1, 'Tata bahasanya benar, tetapi menutup diskusi secara kasar.', ['I understand. Perhaps Dina could lead it with my support.'], 'n4'],
    ]],
    ['n4', 'Ms Ortega', "All right. I'll speak to Dina. Anything else?", 'Baiklah. Saya akan bicara dengan Dina. Ada lagi?', [
      ["Only that I'd recommend we review the plan in a month, in case the workload proves heavier than expected.", true, 3, 'Usulan evaluasi yang bijak, dengan "recommend (that) we review" yang tepat.', ["Just one thing: could we review this in a month to see how it's going?"], 'end'],
      ["No, that's all. Thanks for being flexible.", true, 2, 'Sopan dan wajar, tetapi melewatkan kesempatan menyepakati evaluasi.', ["Could we review how it's going in a month?"], 'end'],
      ['Only that I recommend to review the plan in a month.', false, 2, 'recommend tidak langsung diikuti to. Pakai "recommend reviewing" atau "recommend that we review".', ['Only that I recommend reviewing the plan in a month.'], 'end'],
    ]],
  ]),
];

// ---------------------------------------------------------------- listening
const L = { topic: 'skill.listening' } as const;
const C1_PITCH = "Imagine walking into the library during exam week and finding an empty seat. Sounds impossible, doesn't it? Right now, around four hundred students compete for just a hundred and twenty desks. Our proposal is simple: open the old seminar rooms on the second floor as quiet study spaces in the evenings. They already have tables, lights and Wi-Fi, and they sit empty after five o'clock. We're not asking for new furniture or extra staff, just a key and a timetable. We do believe this would make a real difference, and we'd be happy to run a four-week trial and report back.";
const C1_SHIP = "Divers off the coast of Belitung have discovered what is believed to be a fourteenth-century trading ship. The vessel is thought to have sunk during a storm, and it is estimated that it was carrying more than ten thousand pieces of Chinese pottery. Some of the cargo is said to be in remarkably good condition, although much of the wooden hull has disappeared. The site is expected to be protected by law next month, and the first objects will be displayed at the provincial museum later this year.";
const C2_BRIEFING = "Right, quick update before you all head off. The client came back this morning, and I'm afraid they've rejected the whole concept, so we're more or less back to square one. I know a new proposal by Friday is a tall order, but please don't be tempted to cut corners. The bottom line is that this account matters more than any other this year. I'll touch base with each of you tomorrow morning, so we're all on the same page before we start sketching. And thank you. I know you've all gone the extra mile on this already.";
const C2_LECTURE = "Rivers have shaped almost every great city, yet seldom have they been treated with much respect. For centuries they served as sewers, highways and dumping grounds, albeit essential ones. Only in the last few decades have planners begun to see them as assets rather than problems. Seoul, for instance, removed an elevated motorway to restore a buried stream, and so popular did the new park become that traffic fears were largely forgotten. Much as such projects are celebrated, however, they are not cheap, and critics point out that the benefits tend to go to nearby property owners first.";

export const listeningR5: ListeningDraft[] = [
  {
    id: 'listen-c1-pitch', level: 'C1', title: 'Usulan singkat: ruang belajar malam', kind: 'passage', premium: true,
    transcript: C1_PITCH,
    translation: 'Bayangkan masuk ke perpustakaan pada minggu ujian dan menemukan kursi kosong. Kedengarannya mustahil, bukan? Saat ini sekitar empat ratus mahasiswa berebut seratus dua puluh meja. Usulan kami sederhana: buka ruang seminar lama di lantai dua sebagai ruang belajar tenang pada malam hari. Ruangan itu sudah punya meja, lampu, dan Wi-Fi, dan kosong setelah pukul lima. Kami tidak meminta perabot baru atau staf tambahan, hanya kunci dan jadwal. Kami sungguh yakin ini akan membuat perbedaan nyata, dan kami siap menjalankan uji coba empat minggu lalu melaporkan hasilnya.',
    questions: [
      listen(4, C1_PITCH, 'What is the speaker proposing?', [
        ['Opening the seminar rooms for evening study', true],
        ['Buying new desks for the library', '"We\'re not asking for new furniture".'],
        ['Hiring extra library staff', '"We\'re not asking for ... extra staff".'],
      ], 'Inti usulannya: "open the old seminar rooms on the second floor as quiet study spaces in the evenings".', L),
      listen(4, C1_PITCH, 'How many desks are there for about 400 students?', [
        ['120', true],
        ['400', '400 adalah jumlah mahasiswa yang berebut meja.'],
        ['40', 'Tidak ada angka 40 dalam rekaman.'],
      ], '"around four hundred students compete for just a hundred and twenty desks".', L),
      listen(4, C1_PITCH, 'Why does the speaker begin with "Sounds impossible, doesn\'t it?"', [
        ['To make listeners agree that there is a problem', true],
        ['To ask the audience for information', 'Ini pertanyaan retoris; pembicara tidak menunggu jawaban.'],
        ['To show that the proposal is impossible', 'Justru sebaliknya: pertanyaan itu menyoroti masalah yang ingin dipecahkan.'],
      ], 'Pertanyaan retoris mengajak pendengar setuju bahwa masalahnya nyata.', L),
      dictation(4, C1_PITCH, "We do ___ this would make a real difference.", ['believe'], 'Penekanan dengan do: "We do believe".', {
        believed: ['Setelah "do" penekanan, bentuk dasar: believe.'],
      }, L),
    ],
  },
  {
    id: 'listen-c1-ship', level: 'C1', title: 'Berita: kapal kuno di Belitung', kind: 'passage', premium: true,
    transcript: C1_SHIP,
    translation: 'Penyelam di lepas pantai Belitung menemukan apa yang diyakini sebagai kapal dagang abad keempat belas. Kapal itu diperkirakan tenggelam saat badai, dan diperkirakan membawa lebih dari sepuluh ribu keramik Tiongkok. Sebagian muatannya konon masih dalam kondisi sangat baik, walaupun sebagian besar lambung kayunya sudah hilang. Lokasi itu diperkirakan akan dilindungi undang-undang bulan depan, dan benda-benda pertama akan dipamerkan di museum provinsi akhir tahun ini.',
    questions: [
      listen(4, C1_SHIP, 'How certain is it that the ship is from the fourteenth century?', [
        ['It is believed to be, but not confirmed.', true],
        ['It is certain.', '"what is believed to be" menunjukkan dugaan, bukan kepastian.'],
        ['It is definitely not.', 'Tidak ada yang membantah dugaan itu.'],
      ], 'Pasif impersonal "is believed to be" melaporkan dugaan tanpa menyebut siapa yang menduga.', L),
      listen(4, C1_SHIP, 'What is thought to have happened to the ship?', [
        ['It sank in a storm.', true],
        ['It was attacked by pirates.', 'Tidak disebut.'],
        ['It was taken to the museum.', 'Yang akan dipamerkan adalah benda-benda muatannya.'],
      ], '"The vessel is thought to have sunk during a storm".', L),
      listen(4, C1_SHIP, 'What has mostly disappeared?', [
        ['The wooden hull', true],
        ['The pottery', 'Sebagian keramik justru "in remarkably good condition".'],
        ['The divers\' equipment', 'Tidak disebut.'],
      ], '"much of the wooden hull has disappeared".', L),
      listen(4, C1_SHIP, 'What is expected to happen next month?', [
        ['The site will be protected by law.', true],
        ['The objects will be displayed.', 'Pameran baru "later this year".'],
        ['More divers will search the area.', 'Tidak disebut.'],
      ], '"The site is expected to be protected by law next month".', L),
    ],
  },
  {
    id: 'listen-c2-briefing', level: 'C2', title: 'Briefing tim: proposal ditolak', kind: 'passage', premium: true,
    transcript: C2_BRIEFING,
    translation: 'Oke, kabar singkat sebelum kalian pulang. Klien menghubungi pagi ini, dan sayangnya mereka menolak seluruh konsepnya, jadi kita kurang lebih kembali ke awal. Saya tahu proposal baru paling lambat Jumat itu permintaan yang berat, tetapi jangan tergoda mengambil jalan pintas. Intinya, akun ini lebih penting daripada akun lain mana pun tahun ini. Saya akan menghubungi kalian masing-masing besok pagi supaya kita semua sepaham sebelum mulai membuat sketsa. Dan terima kasih. Saya tahu kalian sudah berusaha ekstra untuk proyek ini.',
    questions: [
      listen(5, C2_BRIEFING, 'What has happened to the team\'s work?', [
        ['The client rejected it, so they are starting again.', true],
        ['The client approved it.', '"they\'ve rejected the whole concept".'],
        ['The deadline has been moved to next month.', 'Tenggatnya justru Jumat ini.'],
      ], '"back to square one" = kembali ke awal.', L),
      listen(5, C2_BRIEFING, 'What is the manager worried the team might do?', [
        ['Work quickly but carelessly', true],
        ['Refuse to work on Friday', 'Tidak disebut.'],
        ['Contact the client directly', 'Tidak disebut.'],
      ], '"don\'t be tempted to cut corners" = jangan mengambil jalan pintas yang mengorbankan mutu.', L),
      listen(5, C2_BRIEFING, 'Why will the manager contact everyone tomorrow?', [
        ['So that everyone agrees on the plan before starting', true],
        ['To cancel the project', 'Proyek tetap berjalan dengan proposal baru.'],
        ['To criticise their earlier work', 'Ia justru berterima kasih atas usaha mereka.'],
      ], '"so we\'re all on the same page before we start sketching".', L),
      dictation(5, C2_BRIEFING, "I know a new proposal by Friday is a tall ___.", ['order'], 'Idiom: a tall order = permintaan yang sangat sulit.', {
        orders: ['Bentuk tetap tunggal: a tall order.'],
      }, L),
    ],
  },
  {
    id: 'listen-c2-rivers', level: 'C2', title: 'Kuliah: kota dan sungainya', kind: 'passage', premium: true,
    transcript: C2_LECTURE,
    translation: 'Sungai telah membentuk hampir setiap kota besar, tetapi jarang sekali diperlakukan dengan hormat. Selama berabad-abad sungai menjadi saluran limbah, jalan raya, dan tempat pembuangan, walaupun yang penting. Baru dalam beberapa dekade terakhir para perencana mulai melihatnya sebagai aset, bukan masalah. Seoul, misalnya, membongkar jalan layang untuk memulihkan sungai yang terkubur, dan begitu populernya taman baru itu sehingga kekhawatiran soal lalu lintas sebagian besar terlupakan. Namun, walaupun proyek semacam itu banyak dipuji, biayanya tidak murah, dan para pengkritik menunjukkan bahwa manfaatnya cenderung lebih dulu dinikmati pemilik properti di sekitarnya.',
    questions: [
      listen(5, C2_LECTURE, 'According to the speaker, how have rivers usually been treated?', [
        ['Without much respect', true],
        ['As protected nature areas', 'Kebalikannya: sungai dipakai sebagai saluran limbah dan tempat pembuangan.'],
        ['As tourist attractions', 'Tidak disebut untuk masa lalu.'],
      ], '"seldom have they been treated with much respect".', L),
      listen(5, C2_LECTURE, 'When did planners start to see rivers as assets?', [
        ['Only in the last few decades', true],
        ['Centuries ago', 'Berabad-abad sungai justru dipakai sebagai saluran limbah.'],
        ['After the Seoul project', 'Seoul hanya contoh, bukan awal perubahannya.'],
      ], '"Only in the last few decades have planners begun to see them as assets".', L),
      listen(5, C2_LECTURE, 'What happened after the park in Seoul opened?', [
        ['It was so popular that traffic worries were mostly forgotten.', true],
        ['Traffic became much worse.', 'Kekhawatiran lalu lintas justru "largely forgotten".'],
        ['The motorway was rebuilt.', 'Jalan layangnya dibongkar.'],
      ], '"so popular did the new park become that traffic fears were largely forgotten".', L),
      listen(5, C2_LECTURE, 'What do critics say about such projects?', [
        ['Nearby property owners tend to benefit first.', true],
        ['They never improve cities.', 'Pengkritik tidak berkata begitu; mereka mempersoalkan biaya dan siapa yang diuntungkan.'],
        ['They are cheap and easy.', '"they are not cheap".'],
      ], '"the benefits tend to go to nearby property owners first".', L),
    ],
  },
];
