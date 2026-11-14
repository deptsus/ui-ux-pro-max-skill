// B1 · Bab 1 · Unit 1 — Present Perfect (lanjutan)
// B1 · Bab 2 · Unit 1 — Conditionals dan Modals
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const ppContinuous = lesson({
  id: 'b1-pp-continuous',
  title: 'Present Perfect Continuous',
  summary: 'Menekankan lamanya kegiatan yang dimulai di masa lalu dan masih berlangsung.',
  topic: 'b1.pp-continuous',
  objectives: [
    'Membentuk present perfect continuous: have/has been + -ing.',
    'Memakai for dan since untuk kegiatan yang masih berlangsung, bukan present continuous.',
    'Memilih present perfect (hasil, jumlah) atau present perfect continuous (lamanya kegiatan).',
  ],
  intro: 'Dalam bahasa Indonesia kita berkata "Saya sudah menunggu sejak jam tujuh." Banyak pelajar lalu menulis "I am waiting since seven o\'clock". Itu salah: kegiatan yang dimulai di masa lalu dan masih berlangsung sampai sekarang memakai present perfect continuous: "I have been waiting since seven o\'clock."',
  teaching: [
    {
      heading: 'Bentuk',
      body: 'have/has + been + kata kerja -ing. "been" tidak pernah hilang dan tidak berubah.',
      table: [
        ['Positif', 'Negatif', 'Pertanyaan'],
        ["I've been studying since 8.", "She hasn't been sleeping well.", 'How long have you been waiting?'],
        ["It's been raining all day.", "They haven't been working here long.", 'Has he been running?'],
      ],
    },
    {
      heading: 'Masih berlangsung, bukan present continuous',
      body: 'Begitu ada "for" (lamanya) atau "since" (titik awal) untuk kegiatan yang masih berlangsung, bahasa Inggris tidak memakai present continuous. "How long ...?" juga memakai present perfect continuous.',
      examples: [
        { en: "We've been living in Depok for six years.", id: 'Kami sudah tinggal di Depok selama enam tahun.', note: 'Bukan "We are living in Depok for six years."' },
        { en: "How long have you been learning English?", id: 'Sudah berapa lama kamu belajar bahasa Inggris?' },
      ],
    },
    {
      heading: 'Lamanya kegiatan atau hasilnya?',
      body: 'Present perfect continuous menekankan LAMANYA kegiatan (sering juga sebagai alasan keadaan sekarang: "I\'m tired because I\'ve been running"). Present perfect biasa menekankan HASIL atau JUMLAH yang sudah selesai. Kata kerja keadaan (know, like, believe, own) tidak memakai bentuk continuous.',
      table: [
        ['Lamanya kegiatan', 'Hasil atau jumlah'],
        ["I've been reading this book all week.", "I've read three chapters."],
        ["She's been painting the house since Monday.", "She's painted two rooms."],
        ['—', "I've known her for ten years. (keadaan)"],
      ],
    },
  ],
  demo: [
    ["I've been waiting since seven o'clock.", "I'm waiting since seven o'clock.", 'Kegiatan yang dimulai dulu dan masih berlangsung + since memakai present perfect continuous.'],
    ["I've read four books this month.", "I've been reading four books this month.", 'Ada jumlah yang sudah selesai (four books), jadi present perfect biasa.'],
    ["We've known each other since school.", "We've been knowing each other since school.", '"know" adalah kata kerja keadaan, jadi tidak memakai -ing.'],
  ],
  vocab: ['lately', 'exhausted', 'renovate'],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', 'Andi is tired because he ___ football all afternoon.', [
      ['has been playing', true],
      ['is playing', 'Kegiatannya sudah berlangsung sepanjang sore dan menjelaskan keadaan sekarang (lelah): has been playing.', 'ppc-form'],
      ['has been play', 'Setelah "been", kata kerja memakai -ing: playing.', 'ppc-form'],
      ['have been playing', '"Andi" = he, jadi "has".'],
    ], 'Lamanya kegiatan (all afternoon) yang menjelaskan keadaan sekarang → has been playing.', { focus: 'ppc-form', hint: 'Bentuknya punya tiga bagian: have/has, been, dan kata kerja -ing.' }),
    fill(2, 'How long ___ you been working at this company?', ['have'], 'Pertanyaan "How long" + present perfect continuous: How long have you been ...?', {
      are: ['"How long" untuk kegiatan yang masih berlangsung memakai have been + -ing.', 'ppc-form'],
      did: ['Kegiatannya masih berlangsung, jadi bukan simple past.', 'ppc-form'],
      has: ['Subjeknya "you", jadi "have".'],
    }, { focus: 'ppc-form', hint: 'Lihat kata "been" setelah titik-titik.' }),
    match(2, 'Pasangkan awal kalimat dengan akhir yang paling tepat.', [
      ["She's been cooking", 'all morning.'],
      ["She's cooked", 'three dishes.'],
      ["I've been learning Korean", 'since January.'],
      ["I've known Rani", 'since primary school.'],
    ], 'Continuous untuk lamanya kegiatan; present perfect biasa untuk jumlah selesai dan kata kerja keadaan (know).', { focus: 'ppc-vs-pp' }),
    tf(2, 'Kalimat "I am living in Medan since 2020." sudah benar.', false, 'Kegiatan yang masih berlangsung + since memakai present perfect (continuous): "I have been living in Medan since 2020" atau "I have lived in Medan since 2020."', 'Present continuous tidak dipakai bersama "since" untuk menyatakan sudah berapa lama.', { focus: 'ppc-form', tag: 'ppc-form', hint: 'Kalimat "sejak ..." untuk keadaan yang masih berlangsung.' }),
  ],
  independent: [
    tr(3, 'Saya sudah menunggu bus selama dua puluh menit.', ["I've been waiting for the bus for twenty minutes", "I've been waiting for the bus for 20 minutes"], 'have been waiting + for + lamanya.', {
      "i'm waiting for the bus for twenty minutes": ['Untuk "sudah ... selama", pakai have been waiting.', 'ppc-form'],
      "i've been waiting for the bus since twenty minutes": ['"twenty minutes" adalah lamanya waktu, jadi "for".', 'since-for'],
      "i've waited for the bus since twenty minutes": ['"twenty minutes" adalah lamanya waktu, jadi "for".', 'since-for'],
    }, { focus: 'ppc-form' }),
    fill(3, "My hands are dirty because I ___ the motorbike. (fix)", ["'ve been fixing", 'have been fixing'], 'Keadaan sekarang (tangan kotor) karena kegiatan yang baru saja berlangsung: have been fixing.', {
      'am fixing': ['Kegiatannya baru saja berlangsung dan menjelaskan keadaan sekarang: have been fixing.', 'ppc-form'],
      'have fixed': ['Fokusnya pada kegiatan yang membuat tangan kotor, bukan hasilnya: have been fixing.', 'ppc-vs-pp'],
      'have been fix': ['Setelah "been", pakai -ing: fixing.', 'ppc-form'],
    }, { focus: 'ppc-vs-pp', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    spot(3, "We've been knowing our neighbours for many years.", 'knowing', 'known', '"know" adalah kata kerja keadaan: "We\'ve known our neighbours for many years."', { focus: 'stative-ppc' }),
    dlg(3, 'Lengkapi percakapan berikut.', "A: You look exhausted!\nB: ___", [
      ["I've been working on my thesis all night.", true],
      ["I've worked on my thesis all night.", 'Untuk menjelaskan keadaan sekarang dengan lamanya kegiatan (all night), lebih tepat bentuk continuous.', 'ppc-vs-pp'],
      ["I'm working on my thesis since last night.", 'Dengan "since", kegiatan yang masih berlangsung memakai have been + -ing.', 'ppc-form'],
      ['I was working on my thesis since all night.', '"since" diikuti titik awal, bukan "all night".', 'since-for'],
    ], 'Menjelaskan keadaan sekarang (lelah) dengan kegiatan yang berlangsung lama → present perfect continuous.', { focus: 'ppc-vs-pp' }),
  ],
  homework: [
    read(3, "Hi Tika, sorry I haven't replied to your messages. I've been preparing for my driving test, so I've been practising every evening with my uncle. I've taken two practice tests so far and passed both of them. The real test is on Friday. Wish me luck! — Bayu", 'How many practice tests has Bayu passed?', [
      ['Two', true],
      ['One', 'Teks menyebut "I\'ve taken two practice tests so far and passed both of them."'],
      ['None yet', 'Dia sudah lulus dua tes latihan.'],
      ['We do not know', 'Teks menyebut jumlahnya dengan jelas: dua.'],
    ], 'Jumlah yang sudah selesai disebut dengan present perfect: "I\'ve taken two practice tests ... and passed both."'),
    construct(3, 'since / it / raining / has / been / this morning', ['It has been raining since this morning', "It's been raining since this morning"], 'Subjek + has been + -ing + since + titik awal.', undefined, { focus: 'ppc-form' }),
    fix(3, "She's been writing five emails this morning.", ["She's written five emails this morning", 'She has written five emails this morning'], 'Jumlah yang selesai (five emails) memakai present perfect biasa.', undefined, { focus: 'ppc-vs-pp' }),
  ],
  mastery: [
    mc(3, 'Pilih kalimat yang benar.', null, [
      ["Dewi has been learning the piano for two years.", true],
      ['Dewi is learning the piano for two years.', 'Untuk "sudah ... selama", pakai have/has been + -ing.', 'ppc-form'],
      ['Dewi has been learning the piano since two years.', '"two years" adalah lamanya, jadi "for".', 'since-for'],
      ['Dewi has learning the piano for two years.', 'Bentuknya has been learning.', 'ppc-form'],
    ], 'has been learning + for + lamanya.', { focus: 'ppc-form' }),
    fill(3, 'I ___ this film three times, and I still love it. (see)', ["'ve seen", 'have seen'], 'Jumlah kali (three times) → present perfect biasa: have seen.', {
      'have been seeing': ['Ada jumlah kali (three times), jadi present perfect biasa.', 'ppc-vs-pp'],
      'am seeing': ['Pengalaman dengan jumlah kali memakai present perfect.', 'ppc-vs-pp'],
      saw: ['Tidak ada waktu selesai yang disebut, dan pengalamannya terhubung ke sekarang: have seen.', 'perfect-vs-past'],
    }, { focus: 'ppc-vs-pp', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    tr(4, 'Sudah berapa lama mereka merenovasi rumah itu?', ['How long have they been renovating that house', 'How long have they been renovating the house'], 'How long + have + they + been + -ing?', {
      'how long are they renovating that house': ['Untuk "sudah berapa lama", pakai have been + -ing.', 'ppc-form'],
      'how long they have been renovating that house': ['Dalam pertanyaan, "have" diletakkan sebelum subjek.', 'ppc-form'],
    }, { focus: 'ppc-form' }),
    spot(4, 'They have been live in Bogor for ten years.', 'live', 'living', 'Setelah "have been", kata kerja memakai -ing: have been living.', { focus: 'ppc-form' }),
    fix(4, 'He has been owning that shop since 2018.', ['He has owned that shop since 2018', "He's owned that shop since 2018"], '"own" adalah kata kerja keadaan: has owned.', undefined, { focus: 'stative-ppc' }),
  ],
});

export const conditionals = lesson({
  id: 'b1-conditionals',
  title: 'First dan Second Conditional',
  summary: 'Pengandaian yang mungkin terjadi dan yang hanya dibayangkan.',
  topic: 'b1.conditionals',
  objectives: [
    'Membentuk first conditional: If + present, will + bentuk dasar.',
    'Membentuk second conditional: If + past, would + bentuk dasar.',
    'Memilih first atau second conditional menurut seberapa nyata situasinya.',
  ],
  intro: '"Kalau hujan, saya tidak akan datang" dan "Kalau saya kaya, saya akan keliling dunia" sama-sama memakai "kalau" dalam bahasa Indonesia. Bahasa Inggris membedakannya: yang pertama mungkin terjadi (first conditional), yang kedua hanya bayangan (second conditional). Jebakan terbesar: tidak ada "will" di bagian "if".',
  teaching: [
    {
      heading: 'First conditional: mungkin terjadi',
      body: 'If + simple present, will + bentuk dasar. Meskipun maknanya masa depan, bagian "if" tetap memakai present.',
      examples: [
        { en: "If it rains, we'll stay at home.", id: 'Kalau hujan, kami akan tinggal di rumah.', note: 'Bukan "If it will rain".' },
        { en: "If you don't hurry, you'll miss the train.", id: 'Kalau kamu tidak bergegas, kamu akan ketinggalan kereta.' },
      ],
    },
    {
      heading: 'Second conditional: hanya dibayangkan',
      body: 'If + simple past, would + bentuk dasar. Bentuk lampau di sini TIDAK berarti masa lalu; ia menandakan situasi yang tidak nyata atau kecil kemungkinannya. Untuk to be, bentuk baku memakai "were" untuk semua subjek ("If I were you"); "was" juga umum dalam percakapan.',
      examples: [
        { en: 'If I had more time, I would learn to cook.', id: 'Seandainya saya punya lebih banyak waktu, saya akan belajar memasak.', note: 'Kenyataannya: saya tidak punya waktu.' },
        { en: "If I were you, I'd apologise.", id: 'Kalau saya jadi kamu, saya akan minta maaf.' },
      ],
    },
    {
      heading: 'Nyata atau bayangan?',
      body: 'Tanyakan: apakah situasinya realistis? Ujian besok, hujan sore ini → first. Menang lotre, jadi presiden, punya sayap → second.',
      table: [
        ['Situasi', 'Conditional', 'Contoh'],
        ['Mungkin terjadi', 'first', "If I pass the exam, I'll celebrate."],
        ['Tidak nyata sekarang', 'second', "If I lived near the sea, I'd swim every day."],
        ['Tidak mungkin', 'second', 'If I were a bird, I would fly home.'],
      ],
    },
  ],
  demo: [
    ["If it rains tomorrow, we'll cancel the trip.", 'If it will rain tomorrow, we will cancel the trip.', 'Bagian "if" pada first conditional memakai present, bukan will.'],
    ['If I won the lottery, I would buy a house.', 'If I win the lottery, I would buy a house.', 'Situasi bayangan memakai past di bagian "if": If I won ..., I would ...'],
    ['If she studied harder, she would pass.', 'If she would study harder, she would pass.', '"would" tidak dipakai di bagian "if".'],
  ],
  vocab: ['lottery', 'abroad', 'afford'],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', 'If you ___ the bus, call me.', [
      ['miss', true],
      ['will miss', 'Bagian "if" pada first conditional memakai present: If you miss ...', 'if-will'],
      ['missed', 'Situasinya realistis (mungkin terjadi), jadi first conditional: present.', 'real-unreal'],
      ['would miss', '"would" tidak dipakai di bagian "if".', 'if-will'],
    ], 'First conditional: If + present.', { focus: 'if-will', hint: 'Ketinggalan bus itu mungkin terjadi. Bagian "if" tidak memakai will.' }),
    fill(2, 'If I ___ enough money, I would travel abroad every year. (have)', ['had'], 'Bayangan (sekarang tidak punya uang) → second conditional: If + past.', {
      have: ['Bagian lainnya memakai "would", jadi ini second conditional: If I had ...', 'second-past'],
      'would have': ['"would" tidak dipakai di bagian "if".', 'second-past'],
      'will have': ['"will" tidak dipakai di bagian "if".', 'if-will'],
    }, { focus: 'second-past', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.', hint: 'Lihat kata "would" di bagian kedua kalimat.' }),
    match(2, 'Pasangkan awal kalimat dengan akhirnya.', [
      ['If you heat ice,', 'it melts.'],
      ["If it's sunny tomorrow,", "we'll go to the beach."],
      ['If I spoke Japanese,', 'I would work in Tokyo.'],
      ['If I were you,', "I'd take the job."],
    ], 'Fakta: present + present. Mungkin terjadi: present + will. Bayangan: past + would.', { focus: 'real-unreal' }),
    tf(2, 'Kalimat "If I will see her, I will tell her." sudah benar.', false, 'Bagian "if" memakai present: "If I see her, I will tell her."', '"will" tidak dipakai di bagian "if", walaupun maknanya masa depan.', { focus: 'if-will', tag: 'if-will', hint: 'Periksa bagian "if".' }),
  ],
  independent: [
    tr(3, 'Kalau kamu belajar dengan rajin, kamu akan lulus ujian.', ['If you study hard, you will pass the exam', "If you study hard, you'll pass the exam", 'You will pass the exam if you study hard', "You'll pass the exam if you study hard"], 'Mungkin terjadi → If + present, will + bentuk dasar.', {
      'if you will study hard you will pass the exam': ['Bagian "if" memakai present: If you study ...', 'if-will'],
      'if you study hard you pass the exam': ['Bagian hasil memakai will: you will pass.'],
    }, { focus: 'if-will' }),
    fill(3, 'If my phone ___ better, I would take more photos. (be)', ['were', 'was'], 'Bayangan → If + past. "were" untuk semua subjek dalam bahasa baku; "was" juga umum dipakai.', {
      is: ['Bagian lainnya memakai "would", jadi If + past: were/was.', 'second-past'],
      'would be': ['"would" tidak dipakai di bagian "if".', 'second-past'],
    }, { focus: 'second-past', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    spot(3, "If we would leave now, we'd arrive on time.", 'would', 'left', 'Second conditional: If + past (If we left now ...), bukan "would".', { focus: 'second-past' }),
    dlg(3, 'Lengkapi percakapan berikut.', "A: I can't decide whether to take the job in Batam.\nB: ___", [
      ["If I were you, I'd take it.", true],
      ["If I am you, I'll take it.", 'Kamu tidak mungkin menjadi orang lain, jadi second conditional: If I were you, I\'d ...', 'real-unreal'],
      ["If I were you, I'll take it.", 'Second conditional memakai would di bagian hasil: I\'d (I would).', 'second-past'],
      ["If I would be you, I'd take it.", '"would" tidak dipakai di bagian "if".', 'second-past'],
    ], 'Memberi saran: "If I were you, I\'d ..."', { focus: 'real-unreal' }),
  ],
  homework: [
    read(3, "Nadia has two offers. The first is a job in her hometown, near her family, but the salary is low. The second is in Jakarta: the salary is much higher, but she would have to rent a room. She says, \"If I take the Jakarta job, I'll save more money, but I'll miss my family. If the job in my hometown paid more, I would accept it immediately.\"", 'Why does Nadia not accept the hometown job immediately?', [
      ['The salary is too low.', true],
      ['It is far from her family.', 'Pekerjaan itu justru dekat dengan keluarganya.'],
      ['She wants to rent a room.', 'Menyewa kamar adalah konsekuensi pekerjaan di Jakarta.'],
      ['She has already accepted the Jakarta job.', 'Teks tidak menyebut dia sudah menerima.'],
    ], '"If the job in my hometown paid more, I would accept it immediately" berarti gajinya sekarang tidak cukup.'),
    construct(3, "would / afford / I / a car / if / I / buy / could", ['If I could afford a car, I would buy one', 'If I could afford a car, I would buy it', 'I would buy a car if I could afford one', 'I would buy a car if I could afford it'], 'Second conditional dengan could: If I could afford ..., I would buy ...', undefined, { focus: 'second-past', prompt: 'Susun kalimat second conditional dari kata kunci berikut. Boleh menambah "one" atau "it".' }),
    fix(3, 'If you will need help, just call me.', ['If you need help, just call me'], 'Bagian "if" memakai present: If you need ...', undefined, { focus: 'if-will' }),
  ],
  mastery: [
    mc(3, 'Pilih kalimat yang paling tepat untuk situasi ini: kamu tidak punya mobil, tetapi membayangkannya.', null, [
      ['If I had a car, I would drive to work.', true],
      ["If I have a car, I'll drive to work.", 'Situasinya bayangan (kamu tidak punya mobil), jadi second conditional.', 'real-unreal'],
      ['If I would have a car, I would drive to work.', '"would" tidak dipakai di bagian "if".', 'second-past'],
      ['If I had a car, I will drive to work.', 'Second conditional memakai would: I would drive.', 'second-past'],
    ], 'Bayangan → If + past, would + bentuk dasar.', { focus: 'real-unreal' }),
    fill(3, "Don't worry. If the shop ___ closed, we'll go to another one. (be)", ['is'], 'Mungkin terjadi + will di bagian hasil → If + present: is.', {
      'will be': ['Bagian "if" memakai present: is.', 'if-will'],
      were: ['Situasinya realistis dan bagian hasil memakai will, jadi first conditional: is.', 'real-unreal'],
    }, { focus: 'if-will', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    tr(4, 'Seandainya saya tinggal dekat kantor, saya akan berjalan kaki setiap hari.', ['If I lived near the office, I would walk every day', "If I lived near the office, I'd walk every day", 'If I lived near my office, I would walk every day', "If I lived near my office, I'd walk every day", 'If I lived close to the office, I would walk every day', "If I lived close to the office, I'd walk every day"], 'Bayangan → If + past (lived), would + walk.', {
      'if i live near the office i will walk every day': ['"Seandainya" menandakan bayangan: If I lived ..., I would ...', 'real-unreal'],
      'if i would live near the office i would walk every day': ['"would" tidak dipakai di bagian "if".', 'second-past'],
    }, { focus: 'second-past' }),
    spot(4, "If it will be sunny on Sunday, we'll have a barbecue.", 'will', 'is', 'Bagian "if" memakai present: If it is sunny ...', { focus: 'if-will' }),
    arrange(3, 'Apa yang akan kamu lakukan kalau kamu menang lotre?', 'What would you do if you won the lottery', ['will', 'win'], 'Bayangan → would + if + past.', { focus: 'second-past' }),
  ],
});

export const deduction = lesson({
  id: 'b1-deduction',
  title: 'Modals of Deduction',
  summary: 'Menyimpulkan dengan must, might, could, dan can\'t berdasarkan bukti.',
  topic: 'b1.deduction',
  objectives: [
    'Memakai must untuk kesimpulan yang hampir pasti benar.',
    'Memakai might, may, could untuk kemungkinan, dan can\'t untuk kesimpulan yang hampir pasti salah.',
    'Memakai modal + bentuk dasar (must be, might know).',
  ],
  intro: 'Bahasa Indonesia memakai "pasti", "mungkin", dan "tidak mungkin" untuk menebak berdasarkan bukti. Bahasa Inggris memakai modal: must (pasti), might/may/could (mungkin), can\'t (tidak mungkin). Jebakannya: lawan dari "must" dalam menebak adalah "can\'t", bukan "mustn\'t".',
  teaching: [
    {
      heading: 'Skala kepastian',
      body: 'Pilih modal menurut seberapa kuat buktinya. Setelah modal, kata kerja selalu bentuk dasar.',
      table: [
        ['Keyakinan', 'Modal', 'Contoh'],
        ['hampir pasti benar', 'must', "The lights are on. They must be at home."],
        ['mungkin', 'might / may / could', "She isn't answering. She might be in a meeting."],
        ['hampir pasti salah', "can't", "He can't be hungry. He's just eaten."],
      ],
    },
    {
      heading: "Can't, bukan mustn't",
      body: '"mustn\'t" berarti larangan ("You mustn\'t smoke here"). Untuk kesimpulan negatif yang kuat, pakai "can\'t".',
      examples: [
        { en: "That can't be Rudi. Rudi is in Bali this week.", id: 'Itu tidak mungkin Rudi. Rudi sedang di Bali minggu ini.' },
        { en: 'You must be tired after the long flight.', id: 'Kamu pasti capek setelah penerbangan panjang.' },
      ],
    },
  ],
  demo: [
    ["He can't be the manager. He looks about sixteen.", "He mustn't be the manager. He looks about sixteen.", 'Kesimpulan negatif yang kuat memakai "can\'t". "mustn\'t" berarti larangan.'],
    ['She must be at work.', 'She must is at work.', 'Setelah modal, kata kerja bentuk dasar: must be.'],
    ['It might rain later.', 'It might to rain later.', 'Tidak ada "to" setelah might.'],
  ],
  vocab: ['certain', 'probably', 'obviously'],
  guided: [
    mc(2, 'Pilih modal yang tepat.', "Mum is expecting a call from Grandma, and the phone is ringing. It ___ be Grandma.", [
      ['must', true],
      ["can't", '"can\'t" berarti tidak mungkin. Buktinya justru menunjukkan kemungkinan besar Nenek.', 'deduction-certainty'],
      ["mustn't", '"mustn\'t" berarti larangan, bukan kesimpulan.', 'must-cant'],
    ], 'Bukti kuat (Ibu sedang menunggu telepon) → must.', { focus: 'deduction-certainty', hint: 'Seberapa kuat buktinya?' }),
    fill(2, "Sari ___ be at school today. I saw her at the hospital ten minutes ago.", ["can't", 'cannot'], 'Bukti menunjukkan hampir pasti salah → can\'t.', {
      "mustn't": ['"mustn\'t" berarti larangan. Untuk "tidak mungkin", pakai can\'t.', 'must-cant'],
      must: ['Buktinya menunjukkan sebaliknya: dia di rumah sakit.', 'deduction-certainty'],
      might: ['Buktinya kuat, jadi bukan sekadar "mungkin".', 'deduction-certainty'],
    }, { focus: 'must-cant', hint: 'Dia terlihat di tempat lain sepuluh menit lalu.' }),
    match(2, 'Pasangkan bukti dengan kesimpulannya.', [
      ['His car is outside.', 'He must be home.'],
      ["I'm not sure where she is.", 'She might be at the library.'],
      ['He has just eaten a big meal.', "He can't be hungry."],
      ['They are wearing wet clothes.', 'It must be raining outside.'],
    ], 'Bukti kuat → must; tidak yakin → might; mustahil → can\'t.', { focus: 'deduction-certainty' }),
    tf(2, 'Kalimat "She must knows the answer." sudah benar.', false, 'Setelah modal, bentuk dasar: "She must know the answer."', 'Modal tidak diikuti kata kerja ber-s atau "to".', { focus: 'modal-base', tag: 'modal-base', hint: 'Apa bentuk kata kerja setelah must?' }),
  ],
  independent: [
    tr(3, 'Kamu pasti lelah setelah perjalanan panjang itu.', ['You must be tired after that long journey', 'You must be tired after the long journey', 'You must be tired after that long trip', 'You must be tired after the long trip'], '"Pasti" sebagai kesimpulan = must + be.', {
      'you must tired after that long journey': ['Perlu "be" sebelum kata sifat: must be tired.', 'modal-base'],
      'you are must tired after that long journey': ['Modal langsung diikuti bentuk dasar: You must be tired.', 'modal-base'],
    }, { focus: 'modal-base' }),
    fill(3, "I'm not sure, but the keys ___ be in the car. Let's check.", ['might', 'may', 'could'], 'Tidak yakin → might / may / could.', {
      must: ['Pembicara tidak yakin ("I\'m not sure"), jadi bukan must.', 'deduction-certainty'],
      "can't": ['Pembicara mengajak memeriksa mobil, jadi kuncinya mungkin ada di sana.', 'deduction-certainty'],
    }, { focus: 'deduction-certainty' }),
    spot(3, "That mustn't be the right address. The house is empty.", "mustn't", "can't", 'Kesimpulan negatif yang kuat memakai "can\'t".', { focus: 'must-cant' }),
    dlg(3, 'Lengkapi percakapan berikut.', "A: Whose bag is this? It has a Persija keychain.\nB: ___", [
      ["It must be Dimas's. He's a big Persija fan.", true],
      ["It can't be Dimas's. He's a big Persija fan.", 'Gantungan Persija justru bukti bahwa tas itu milik penggemar Persija.', 'deduction-certainty'],
      ["It must is Dimas's. He's a big Persija fan.", 'Setelah must, bentuk dasar: must be.', 'modal-base'],
      ["It mustn't be Dimas's. He's a big Persija fan.", '"mustn\'t" berarti larangan.', 'must-cant'],
    ], 'Bukti kuat → must be.', { focus: 'deduction-certainty' }),
  ],
  homework: [
    read(3, "Someone has eaten the last piece of cake in the office fridge. Wulan is on a diet and never eats sweets. Pak Hendra was in meetings all afternoon. The new intern, Gilang, stayed late, and there are cake crumbs on his desk. Rini isn't sure; she thinks it could also be the cleaner.", 'Who most probably ate the cake?', [
      ['Gilang', true],
      ['Wulan', 'Wulan tidak pernah makan makanan manis, jadi hampir pasti bukan dia.'],
      ['Pak Hendra', 'Dia rapat sepanjang sore.'],
      ['The cleaner', 'Rini hanya menyebutnya sebagai kemungkinan (could). Bukti terkuat ada di meja Gilang.'],
    ], 'Remah kue di meja Gilang adalah bukti terkuat: "Gilang must be the one who ate it."'),
    construct(3, "be / can't / they / serious", ["They can't be serious", 'They cannot be serious'], "Subjek + can't + be + kata sifat.", undefined, { focus: 'must-cant' }),
    fix(3, 'He might to know the answer.', ['He might know the answer'], 'Tidak ada "to" setelah might.', undefined, { focus: 'modal-base' }),
  ],
  mastery: [
    mc(3, 'Pilih kesimpulan yang paling tepat.', 'Situasi: Rudi batuk sepanjang hari dan suhu badannya tinggi.', [
      ['He must be ill.', true],
      ["He can't be ill.", 'Batuk dan demam adalah bukti kuat bahwa dia sakit.', 'deduction-certainty'],
      ["He mustn't be ill.", '"mustn\'t" berarti larangan, bukan kesimpulan.', 'must-cant'],
      ['He must is ill.', 'Setelah must, bentuk dasar: must be.', 'modal-base'],
    ], 'Bukti kuat → must be.', { focus: 'deduction-certainty' }),
    fill(3, "Don't call him now. It's 3 a.m. in London, so he ___ be asleep.", ['must'], 'Bukti kuat (jam 3 pagi) → must.', {
      might: ['Buktinya kuat (jam 3 pagi), jadi lebih tepat must.', 'deduction-certainty'],
      "can't": ['Jam 3 pagi justru bukti kuat bahwa dia tidur.', 'deduction-certainty'],
    }, { focus: 'deduction-certainty' }),
    tr(4, 'Itu tidak mungkin benar.', ["That can't be true", 'That cannot be true', "That can't be right", 'That cannot be right', "It can't be true", 'It cannot be true'], '"Tidak mungkin" sebagai kesimpulan = can\'t be.', {
      "that mustn't be true": ['"mustn\'t" berarti larangan. Pakai can\'t.', 'must-cant'],
      "that can't true": ['Perlu "be" sebelum kata sifat: can\'t be true.', 'modal-base'],
    }, { focus: 'must-cant' }),
    spot(4, 'The restaurant is always full, so the food musts be good.', 'musts', 'must', 'Modal tidak pernah diberi -s.', { focus: 'modal-base' }),
    construct(4, 'be / might / traffic / there / on the toll road', ['There might be traffic on the toll road'], 'There + might + be + kata benda + tempat.', undefined, { focus: 'modal-base' }),
  ],
});

export const relativeClauses = lesson({
  id: 'b1-relative',
  title: 'Relative Clauses',
  summary: 'Menjelaskan orang, benda, dan tempat dengan who, which, that, where, dan whose.',
  topic: 'b1.relative',
  objectives: [
    'Memakai who untuk orang, which untuk benda, dan that untuk keduanya.',
    'Memakai where untuk tempat dan whose untuk kepemilikan.',
    'Tidak mengulang kata ganti di dalam klausa relatif ("the book that I bought it").',
  ],
  intro: 'Bahasa Indonesia punya satu kata serbaguna: "yang". Bahasa Inggris memilih kata menurut apa yang dijelaskan: orang (who), benda (which), tempat (where), atau pemilik (whose). Ada satu kebiasaan lagi yang perlu dihindari: menambahkan "it" atau "him" di akhir, karena kata relatif sudah menggantikannya.',
  teaching: [
    {
      heading: 'Who, which, that, where, whose',
      table: [
        ['Kata', 'Untuk', 'Contoh'],
        ['who', 'orang', 'The woman who lives next door is a nurse.'],
        ['which', 'benda atau hewan', 'The laptop which I bought last week is very fast.'],
        ['that', 'orang atau benda (klausa pembatas)', 'The film that we watched was boring.'],
        ['where', 'tempat', 'This is the café where we first met.'],
        ['whose', 'kepemilikan', 'I have a friend whose father is a pilot.'],
      ],
      body: '"that" boleh menggantikan who atau which dalam klausa yang membatasi makna (tanpa koma).',
    },
    {
      heading: 'Jangan mengulang kata ganti',
      body: 'Kata relatif sudah menggantikan benda atau orangnya. Jadi jangan tambahkan it, him, her, atau them lagi di dalam klausa.',
      examples: [
        { en: 'The book that I bought is about history.', id: 'Buku yang saya beli itu tentang sejarah.', note: 'Bukan "The book that I bought it".' },
        { en: 'The man who we met at the station was very helpful.', id: 'Pria yang kami temui di stasiun sangat membantu.' },
      ],
    },
    {
      heading: 'Kapan kata relatif boleh dihilangkan?',
      body: 'Jika kata relatif menjadi OBJEK klausa (diikuti subjek lain), ia boleh dihilangkan: "The book (that) I bought". Jika menjadi SUBJEK, wajib ada: "The woman who lives next door", bukan "The woman lives next door ..." sebagai satu klausa.',
    },
  ],
  demo: [
    ['The teacher who helped me is retiring.', 'The teacher which helped me is retiring.', 'Untuk orang pakai "who" (atau "that").'],
    ['This is the phone that I lost.', 'This is the phone that I lost it.', '"that" sudah menggantikan "the phone". Jangan tambahkan "it".'],
    ['I met a girl whose brother plays for Persib.', 'I met a girl who her brother plays for Persib.', 'Kepemilikan dalam klausa relatif memakai "whose".'],
  ],
  vocab: ['neighbourhood', 'landlord', 'recommend'],
  guided: [
    mc(2, 'Pilih kata yang tepat.', 'The doctor ___ treated my father was very patient.', [
      ['who', true],
      ['which', '"which" untuk benda. Doctor adalah orang.', 'who-which'],
      ['where', '"where" untuk tempat.', 'whose-where'],
      ['whose', '"whose" untuk kepemilikan.', 'whose-where'],
    ], 'Orang → who (atau that).', { focus: 'who-which', hint: 'Yang dijelaskan adalah orang.' }),
    fill(2, 'Malioboro is the street ___ we bought our souvenirs.', ['where'], 'Tempat + klausa lengkap → where.', {
      which: ['Setelah titik-titik ada klausa lengkap (we bought our souvenirs). Untuk tempat, pakai "where".', 'whose-where'],
      who: ['"who" untuk orang.', 'who-which'],
    }, { focus: 'whose-where', hint: 'Malioboro adalah sebuah tempat.' }),
    match(2, 'Pasangkan awal kalimat dengan akhirnya.', [
      ['A pilot is a person', 'who flies planes.'],
      ['A fridge is a machine', 'which keeps food cold.'],
      ['A library is a place', 'where you can borrow books.'],
      ['An orphan is a child', 'whose parents have died.'],
    ], 'who: orang; which: benda; where: tempat; whose: kepemilikan.', { focus: 'who-which' }),
    tf(2, 'Kalimat "The car that my father bought it is red." sudah benar.', false, '"that" sudah menggantikan "the car": "The car that my father bought is red."', 'Jangan mengulang kata ganti (it) di dalam klausa relatif.', { focus: 'relative-extra-pronoun', tag: 'relative-extra-pronoun', hint: 'Hitung berapa kata yang merujuk ke mobil itu.' }),
  ],
  independent: [
    tr(3, 'Pria yang tinggal di sebelah rumah saya adalah seorang polisi.', ['The man who lives next to my house is a police officer', 'The man who lives next to my house is a policeman', 'The man that lives next to my house is a police officer', 'The man that lives next to my house is a policeman', 'The man who lives next door is a police officer', 'The man who lives next door is a policeman', 'The man that lives next door is a police officer', 'The man that lives next door is a policeman'], 'Orang → who/that; klausa relatif di antara subjek dan kata kerja utama.', {
      'the man which lives next to my house is a police officer': ['Untuk orang, pakai who atau that.', 'who-which'],
      'the man who he lives next to my house is a police officer': ['Jangan menambahkan "he"; "who" sudah menjadi subjek.', 'relative-extra-pronoun'],
    }, { focus: 'who-which' }),
    fill(3, 'I have a friend ___ mother owns a batik shop in Pekalongan.', ['whose'], 'Kepemilikan (ibunya teman saya) → whose.', {
      who: ['Untuk "yang ibunya", pakai whose.', 'whose-where'],
      'who her': ['Kepemilikan dalam klausa relatif memakai satu kata: whose.', 'whose-where'],
      which: ['Yang dijelaskan adalah orang, dan maknanya kepemilikan: whose.', 'whose-where'],
    }, { focus: 'whose-where' }),
    fix(3, 'The restaurant which you recommended it was excellent.', ['The restaurant which you recommended was excellent', 'The restaurant that you recommended was excellent', 'The restaurant you recommended was excellent'], '"which" sudah menggantikan "the restaurant". Hapus "it".', undefined, { focus: 'relative-extra-pronoun' }),
    arrange(3, 'Ini rumah tempat saya dilahirkan.', 'This is the house where I was born', ['which', 'it'], 'Tempat + klausa lengkap → where.', { focus: 'whose-where' }),
  ],
  homework: [
    read(3, "Looking for a room? Pak Harun is a landlord who rents rooms to students near Universitas Diponegoro. The house, which has six bedrooms, is in a quiet neighbourhood where there are many cheap food stalls. Students whose classes start early like it because the campus is a five-minute walk away.", 'Why do some students especially like the house?', [
      ['It is a five-minute walk from campus.', true],
      ['It has six bathrooms.', 'Teks menyebut six bedrooms, bukan bathrooms.'],
      ['Pak Harun cooks for them.', 'Teks hanya menyebut banyak warung makan murah di sekitarnya.'],
      ['It is in a busy area.', 'Lingkungannya digambarkan "quiet".'],
    ], '"Students whose classes start early like it because the campus is a five-minute walk away."'),
    construct(3, 'who / the girl / won / is / the competition / my cousin', ['The girl who won the competition is my cousin', 'The girl that won the competition is my cousin'], 'Subjek + who + klausa + kata kerja utama.', undefined, { focus: 'who-which' }),
    fix(3, 'I visited the village which my grandparents grew up.', ['I visited the village where my grandparents grew up', 'I visited the village that my grandparents grew up in', 'I visited the village which my grandparents grew up in'], 'Tempat + klausa lengkap → where (atau which ... in).', undefined, { focus: 'whose-where' }),
  ],
  mastery: [
    mc(3, 'Pilih kalimat yang benar.', null, [
      ["The students whose projects won will get a certificate.", true],
      ['The students who their projects won will get a certificate.', 'Kepemilikan → whose.', 'whose-where'],
      ['The students which projects won will get a certificate.', 'Untuk "yang proyeknya", pakai whose.', 'whose-where'],
      ['The students whose projects won them will get a certificate.', 'Jangan menambah kata ganti ("them").', 'relative-extra-pronoun'],
    ], 'Kepemilikan dalam klausa relatif → whose + kata benda.', { focus: 'whose-where' }),
    fill(3, 'Is this the charger ___ you were looking for?', ['that', 'which'], 'Benda → that/which. (Bisa juga dihilangkan: "the charger you were looking for".)', {
      who: ['Charger adalah benda: that atau which.', 'who-which'],
      where: ['"where" untuk tempat.', 'whose-where'],
    }, { focus: 'who-which' }),
    tr(4, 'Film yang kami tonton tadi malam sangat menegangkan.', ['The film that we watched last night was very exciting', 'The film which we watched last night was very exciting', 'The film we watched last night was very exciting', 'The movie that we watched last night was very exciting', 'The movie which we watched last night was very exciting', 'The movie we watched last night was very exciting', 'The film that we watched last night was very tense', 'The film we watched last night was very tense', 'The film that we watched last night was really exciting', 'The film we watched last night was really exciting'], 'Benda → that/which, atau dihilangkan karena menjadi objek.', {
      'the film that we watched it last night was very exciting': ['Jangan mengulang "it".', 'relative-extra-pronoun'],
      'the film who we watched last night was very exciting': ['Untuk benda, pakai that atau which.', 'who-which'],
    }, { focus: 'relative-extra-pronoun' }),
    spot(4, 'The woman which sold me this ring said it was real gold.', 'which', 'who', 'Untuk orang pakai "who" (atau "that").', { focus: 'who-which' }),
    fix(4, 'He is the student who his laptop was stolen.', ['He is the student whose laptop was stolen'], 'Kepemilikan → whose laptop.', undefined, { focus: 'whose-where' }),
  ],
});
