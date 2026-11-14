// B2 · Bab 1 · Unit 1 — Passive Voice (lanjutan): causative
// B2 · Bab 2 · Unit 1 — Reported Speech dan Conditionals
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const causative = lesson({
  id: 'b2-causative',
  title: 'Causative: have/get something done',
  summary: 'Menyatakan pekerjaan yang dikerjakan orang lain untuk kita.',
  topic: 'b2.causative',
  objectives: [
    'Memakai have/get + objek + bentuk ketiga untuk jasa orang lain.',
    'Memakai have + orang + bentuk dasar dan get + orang + to + bentuk dasar.',
    'Membedakan "I had my hair cut" (dipotong orang lain) dari "I had cut my hair" (past perfect).',
  ],
  intro: 'Dalam bahasa Indonesia kita biasa berkata "Saya potong rambut kemarin", padahal tukang cukur yang memotongnya. Dalam bahasa Inggris, "I cut my hair" berarti memotong sendiri. Untuk pekerjaan yang dilakukan orang lain, pakai struktur causative: "I had my hair cut."',
  teaching: [
    {
      heading: 'Have / get + objek + bentuk ketiga',
      body: 'Urutannya penting: objek dulu, baru bentuk ketiga. "get" sedikit lebih santai daripada "have". Struktur yang sama juga dipakai untuk kejadian yang tidak diinginkan: "He had his phone stolen."',
      table: [
        ['Struktur', 'Contoh', 'Arti'],
        ['have + objek + bentuk ketiga', 'I had my hair cut yesterday.', 'Rambut saya dipotong (oleh tukang cukur).'],
        ['get + objek + bentuk ketiga', 'We need to get the AC repaired.', 'AC kami perlu diperbaiki (oleh teknisi).'],
        ['sedang: am/is/are having + objek + bentuk ketiga', 'She is having her house painted.', 'Rumahnya sedang dicat (oleh tukang).'],
      ],
    },
    {
      heading: 'Menyebut siapa yang mengerjakan',
      body: 'have + orang + bentuk dasar; get + orang + TO + bentuk dasar. Keduanya berarti meminta atau menyuruh seseorang melakukan sesuatu.',
      examples: [
        { en: 'I had the mechanic check the brakes.', id: 'Saya minta montir memeriksa remnya.' },
        { en: 'She got her brother to fix her laptop.', id: 'Dia minta adiknya memperbaiki laptopnya.' },
      ],
    },
  ],
  demo: [
    ['I had my hair cut.', 'I had cut my hair.', 'Urutannya: had + objek (my hair) + bentuk ketiga (cut). "I had cut my hair" adalah past perfect: saya sendiri yang memotongnya.'],
    ['We got the roof repaired.', 'We got the roof repair.', 'Setelah objek, pakai bentuk ketiga: repaired.'],
    ['I had the mechanic check the brakes.', 'I had the mechanic to check the brakes.', 'have + orang + bentuk dasar (tanpa "to"). Dengan get: got the mechanic to check.'],
  ],
  vocab: ['repair', 'tailor', 'deliver'],
  guided: [
    mc(2, 'Pilih kalimat yang tepat.', 'Situasi: Seorang penjahit membuatkan kebaya untuk Rina.', [
      ['Rina had a kebaya made.', true],
      ['Rina made a kebaya.', 'Kalimat ini berarti Rina menjahit sendiri.', 'causative-order'],
      ['Rina had made a kebaya.', '"had made" (past perfect) berarti Rina sendiri yang membuatnya.', 'causative-order'],
      ['Rina had a kebaya make.', 'Setelah objek, pakai bentuk ketiga: made.', 'causative-participle'],
    ], 'Jasa orang lain → have + objek + bentuk ketiga.', { focus: 'causative-order', hint: 'Siapa yang menjahit: Rina atau penjahit?' }),
    fill(2, 'I need to get my motorbike ___ before the trip. (service)', ['serviced'], 'get + objek + bentuk ketiga: serviced.', {
      service: ['Setelah objek, pakai bentuk ketiga: serviced.', 'causative-participle'],
      servicing: ['Setelah objek, pakai bentuk ketiga, bukan -ing.', 'causative-participle'],
    }, { focus: 'causative-participle', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    match(2, 'Pasangkan situasi dengan kalimat yang tepat.', [
      ['Tukang cukur memotong rambutku.', 'I had my hair cut.'],
      ['Montir memeriksa remku.', 'I had my brakes checked.'],
      ['Ponselku dicuri.', 'I had my phone stolen.'],
      ['Aku meminta adikku mencuci mobil.', 'I got my brother to wash the car.'],
    ], 'have/get + objek + bentuk ketiga; get + orang + to + bentuk dasar.', { focus: 'causative-order' }),
    tf(2, 'Kalimat "We had our house painted last month." berarti kami mengecat rumah sendiri.', false, 'Kalimat itu berarti orang lain (tukang) yang mengecat rumah kami.', '"have + objek + bentuk ketiga" berarti orang lain yang mengerjakannya.', { focus: 'causative-order', tag: 'causative-order' }),
  ],
  independent: [
    tr(3, 'Dia (perempuan) mencetak foto-fotonya di studio.', ['She had her photos printed at the studio', 'She got her photos printed at the studio', 'She had her photos printed at a studio', 'She got her photos printed at a studio', 'She had her pictures printed at the studio', 'She got her pictures printed at the studio'], 'Studio yang mencetak → had/got + her photos + printed.', {
      'she printed her photos at the studio': ['Kalimat ini berarti dia mencetak sendiri. Yang mencetak adalah studio: She had her photos printed.', 'causative-order'],
      'she had printed her photos at the studio': ['Urutannya: had + objek + bentuk ketiga: had her photos printed.', 'causative-order'],
    }, { focus: 'causative-order' }),
    fill(3, 'My shoes were too tight, so I had them ___ at the shoe shop. (stretch)', ['stretched'], 'have + objek (them) + bentuk ketiga: stretched.', {
      stretch: ['Setelah objek, pakai bentuk ketiga: stretched.', 'causative-participle'],
      stretching: ['Setelah objek, pakai bentuk ketiga, bukan -ing.', 'causative-participle'],
    }, { focus: 'causative-participle', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    fix(3, 'I got the technician fix the washing machine.', ['I got the technician to fix the washing machine'], 'get + orang + to + bentuk dasar.', undefined, { focus: 'causative-get' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Your car looks brand new!\nB: ___', [
      ["Thanks! I've just had it washed and polished.", true],
      ["Thanks! I've just had it wash and polish.", 'Setelah objek, pakai bentuk ketiga: washed and polished.', 'causative-participle'],
      ["Thanks! I've just had washed it.", 'Urutannya: had + objek (it) + bentuk ketiga.', 'causative-order'],
      ["Thanks! I've just got it to wash.", 'Untuk benda: get + objek + bentuk ketiga (got it washed).', 'causative-get'],
    ], 'have + objek + bentuk ketiga.', { focus: 'causative-order' }),
  ],
  homework: [
    read(3, "Pak Darto is busy preparing for his daughter's wedding. He has had the house painted, and next week he is having new curtains made by a tailor in Pasar Baru. He wanted to cook the food himself, but his wife got him to order it from a caterer instead. The only job he is doing himself is cleaning the garden.", 'What is Pak Darto doing himself?', [
      ['Cleaning the garden', true],
      ['Painting the house', 'Rumahnya dicat orang lain: "has had the house painted".'],
      ['Making the curtains', 'Gordennya dibuat oleh penjahit.'],
      ['Cooking the food', 'Istrinya memintanya memesan makanan dari katering.'],
    ], '"The only job he is doing himself is cleaning the garden."'),
    construct(3, 'had / my / I / eyes / tested / yesterday', ['I had my eyes tested yesterday', 'Yesterday I had my eyes tested'], 'had + objek + bentuk ketiga.', undefined, { focus: 'causative-order' }),
    fix(3, 'She had the dentist to check her teeth.', ['She had the dentist check her teeth', 'She got the dentist to check her teeth'], 'have + orang + bentuk dasar (tanpa to), atau get + orang + to + bentuk dasar.', undefined, { focus: 'causative-get' }),
  ],
  mastery: [
    mc(3, 'Pilih kalimat yang benar.', null, [
      ['We are having our kitchen renovated next month.', true],
      ['We are having renovated our kitchen next month.', 'Objek dulu, lalu bentuk ketiga.', 'causative-order'],
      ['We are having our kitchen renovate next month.', 'Setelah objek, pakai bentuk ketiga: renovated.', 'causative-participle'],
      ['We are renovating our kitchen by a builder next month.', 'Kalau orang lain yang mengerjakan, pakai have + objek + bentuk ketiga.', 'causative-order'],
    ], 'have + objek + bentuk ketiga.', { focus: 'causative-order' }),
    fill(4, 'Dimas had his wallet ___ on the crowded bus. (steal)', ['stolen'], 'Kejadian yang tidak diinginkan: have + objek + bentuk ketiga (stolen).', {
      stole: ['Bentuk ketiga "steal" adalah "stolen".', 'causative-participle'],
      steal: ['Setelah objek, pakai bentuk ketiga.', 'causative-participle'],
      stealed: ['"steal" tidak beraturan: stolen.', 'causative-participle'],
    }, { focus: 'causative-participle', prompt: 'Tulis bentuk kata kerja yang tepat dari kata dalam kurung.' }),
    tr(4, 'Saya akan meminta montir mengganti oli besok.', ['I will have the mechanic change the oil tomorrow', 'I will get the mechanic to change the oil tomorrow', 'I am going to have the mechanic change the oil tomorrow', 'I am going to get the mechanic to change the oil tomorrow'], 'have + orang + bentuk dasar, atau get + orang + to + bentuk dasar.', {
      'i will have the mechanic to change the oil tomorrow': ['have + orang + bentuk dasar, tanpa to.', 'causative-get'],
      'i will get the mechanic change the oil tomorrow': ['get + orang + TO + bentuk dasar.', 'causative-get'],
    }, { focus: 'causative-get' }),
    spot(4, 'Have you had your passport renew yet?', 'renew', 'renewed', 'have + objek + bentuk ketiga: renewed.', { focus: 'causative-participle' }),
    construct(4, 'get / the windows / cleaned / we / must', ['We must get the windows cleaned'], 'Subjek + must + get + objek + bentuk ketiga.', undefined, { focus: 'causative-order' }),
  ],
});

export const reportedSpeech = lesson({
  id: 'b2-reported',
  title: 'Reported Speech',
  summary: 'Menceritakan ulang ucapan dan pertanyaan orang lain.',
  topic: 'b2.reported',
  objectives: [
    'Memundurkan tense satu langkah dan menyesuaikan kata ganti serta keterangan waktu.',
    'Memakai say dan tell dengan benar, termasuk tell + orang + to untuk perintah.',
    'Melaporkan pertanyaan dengan urutan kalimat biasa dan if/whether.',
  ],
  intro: 'Saat menceritakan ulang ("Dia bilang dia capek"), bahasa Inggris biasanya memundurkan tense satu langkah dan mengubah kata ganti. Untuk pertanyaan, urutan katanya kembali seperti kalimat biasa, tanpa do atau did, dan tanpa tanda tanya.',
  teaching: [
    {
      heading: 'Mundur satu langkah',
      body: 'Kalau kata pelapornya lampau (said, told, asked), tense di dalamnya biasanya mundur satu langkah. Bila isinya masih benar sekarang, tense boleh tetap ("He said he lives in Solo"). Keterangan waktu juga menyesuaikan: today → that day, tomorrow → the next day, yesterday → the day before.',
      table: [
        ['Ucapan langsung', 'Kalimat tidak langsung'],
        ['"I am tired."', 'She said (that) she was tired.'],
        ['"I live in Solo."', 'He said he lived in Solo.'],
        ['"I have finished."', 'She said she had finished.'],
        ['"I will call you."', 'He said he would call me.'],
        ['"I can help."', 'She said she could help.'],
      ],
    },
    {
      heading: 'Say atau tell?',
      body: '"tell" selalu diikuti orang (told me, told us). "say" tidak langsung diikuti orang; bila perlu, pakai "say to me". Perintah dan saran dilaporkan dengan tell + orang + to + bentuk dasar.',
      examples: [
        { en: 'She told me (that) she was busy.', id: 'Dia bilang kepada saya bahwa dia sibuk.' },
        { en: 'She said (that) she was busy.', id: 'Dia bilang bahwa dia sibuk.', note: 'Bukan "She said me".' },
        { en: 'The doctor told me to rest.', id: 'Dokter menyuruh saya beristirahat.' },
      ],
    },
    {
      heading: 'Pertanyaan tidak langsung',
      body: 'Urutannya seperti kalimat biasa (subjek + kata kerja), tanpa do/does/did dan tanpa tanda tanya. Pertanyaan ya/tidak memakai if atau whether.',
      table: [
        ['Langsung', 'Tidak langsung'],
        ['"Where do you live?"', 'He asked me where I lived.'],
        ['"Are you ready?"', 'She asked if I was ready.'],
        ['"Did you see it?"', 'They asked whether I had seen it.'],
      ],
    },
  ],
  demo: [
    ['She told me she was tired.', 'She said me she was tired.', '"say" tidak langsung diikuti orang. Pakai "told me" atau "said".'],
    ['He asked where I lived.', 'He asked where did I live.', 'Dalam pertanyaan tidak langsung, urutannya seperti kalimat biasa dan tanpa did.'],
    ['They asked if I was ready.', 'They asked me am I ready.', 'Pertanyaan ya/tidak dilaporkan dengan if/whether + urutan biasa.'],
  ],
  vocab: ['admit', 'deny', 'complain'],
  guided: [
    mc(3, 'Pilih kalimat tidak langsung yang tepat.', '"I am hungry," said Rafi.', [
      ['Rafi said he was hungry.', true],
      ['Rafi said me he was hungry.', '"say" tidak langsung diikuti orang.', 'say-tell'],
      ['Rafi told he was hungry.', '"tell" harus diikuti orang: told me / told us.', 'say-tell'],
      ['Rafi said I was hungry.', 'Kata ganti menyesuaikan: "I" (Rafi) menjadi "he".', 'backshift'],
    ], 'Tense mundur (am → was) dan kata ganti berubah (I → he).', { focus: 'backshift' }),
    fill(3, 'My boss ___ me that the meeting was cancelled.', ['told'], 'tell + orang: told me.', {
      said: ['"said" tidak langsung diikuti orang. Pakai "told me".', 'say-tell'],
      says: ['Laporannya lampau, dan "say" tidak diikuti orang.', 'say-tell'],
    }, { focus: 'say-tell', hint: 'Setelah titik-titik ada "me".' }),
    match(3, 'Pasangkan ucapan langsung dengan bentuk tidak langsungnya.', [
      ['"I will come."', 'She said she would come.'],
      ['"I can swim."', 'She said she could swim.'],
      ['"I have eaten."', 'She said she had eaten.'],
      ['"I am leaving."', 'She said she was leaving.'],
    ], 'will → would, can → could, have eaten → had eaten, am → was.', { focus: 'backshift' }),
    tf(3, 'Kalimat "She asked me where did I work." sudah benar.', false, 'Pertanyaan tidak langsung memakai urutan biasa tanpa did: "She asked me where I worked."', 'Dalam pertanyaan tidak langsung, subjek datang sebelum kata kerja dan do/did dihilangkan.', { focus: 'reported-question', tag: 'reported-question' }),
  ],
  independent: [
    construct(3, 'asked / she / if / I / was / ready', ['She asked if I was ready'], 'asked + if + subjek + kata kerja (urutan biasa).', {
      'she asked if was i ready': ['Dalam pertanyaan tidak langsung, subjek sebelum kata kerja: if I was ready.', 'reported-question'],
    }, { focus: 'reported-question' }),
    fill(3, '"Do you like spicy food?" → He asked me ___ I liked spicy food.', ['if', 'whether'], 'Pertanyaan ya/tidak → if atau whether.', {
      that: ['Pertanyaan ya/tidak dilaporkan dengan if atau whether.', 'reported-question'],
      do: ['"do" dihilangkan dalam pertanyaan tidak langsung.', 'reported-question'],
    }, { focus: 'reported-question' }),
    fix(3, 'She asked me what time does the bus leave.', ['She asked me what time the bus left', 'She asked me what time the bus leaves'], 'Urutan biasa tanpa does. Tense boleh mundur (left) atau tetap (leaves) bila jadwalnya masih berlaku.', undefined, { focus: 'reported-question' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: What did the doctor say?\nB: ___', [
      ['She told me to rest for three days.', true],
      ['She said me to rest for three days.', '"say" tidak langsung diikuti orang.', 'say-tell'],
      ['She told to me rest for three days.', 'tell + orang (tanpa "to") + to + bentuk dasar: told me to rest.', 'say-tell'],
      ['She told me rest for three days.', 'Perintah dilaporkan dengan told + orang + TO + bentuk dasar.', 'say-tell'],
    ], 'Perintah atau saran: tell + orang + to + bentuk dasar.', { focus: 'say-tell' }),
  ],
  homework: [
    read(4, 'Yesterday a customer called our café to complain. She said that her order had arrived cold and that the driver had been rude. When I asked her whether she had kept the receipt, she said she had thrown it away. In the end, my manager told me to give her a voucher, and she said she would try us again.', 'What did the manager tell the writer to do?', [
      ['Give the customer a voucher', true],
      ['Ask for the receipt', 'Penulis yang menanyakan struk, bukan atas perintah manajer.'],
      ['Call the driver', 'Teks tidak menyebut ini.'],
      ['Make a new order', 'Teks tidak menyebut ini.'],
    ], '"my manager told me to give her a voucher"'),
    construct(3, 'told / he / us / that / was / he / leaving', ['He told us that he was leaving', 'He told us he was leaving'], 'told + orang + (that) + klausa dengan tense mundur.', undefined, { focus: 'say-tell' }),
    fix(3, 'They asked me where was the station.', ['They asked me where the station was'], 'Urutan biasa: subjek (the station) + kata kerja (was).', undefined, { focus: 'reported-question' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat tidak langsung yang benar.', '"Have you finished the report?" my manager asked.', [
      ['My manager asked whether I had finished the report.', true],
      ['My manager asked had I finished the report.', 'Urutan biasa dengan if/whether: whether I had finished.', 'reported-question'],
      ['My manager asked me that I had finished the report.', 'Pertanyaan ya/tidak memakai if/whether, bukan that.', 'reported-question'],
      ['My manager said whether I had finished the report.', 'Untuk melaporkan pertanyaan, pakai "asked".', 'say-tell'],
    ], 'Pertanyaan ya/tidak → asked + whether/if + urutan biasa + tense mundur.', { focus: 'reported-question' }),
    fill(4, '"I will send it tomorrow," she said. → She said she ___ send it the next day.', ['would'], 'will → would.', {
      will: ['Tense dimundurkan: will menjadi would.', 'backshift'],
      'will to': ['will → would, tanpa to.', 'backshift'],
    }, { focus: 'backshift' }),
    tr(4, 'Dia (perempuan) bertanya kepada saya di mana saya tinggal.', ['She asked me where I lived', 'She asked me where I live', 'She asked where I lived', 'She asked where I live', 'She asked me where I was living', 'She asked where I was living'], 'asked + where + subjek + kata kerja (tanpa do/did).', {
      'she asked me where do i live': ['Pertanyaan tidak langsung: tanpa "do" dan urutan biasa.', 'reported-question'],
      'she asked me where did i live': ['Tanpa "did" dan urutan biasa.', 'reported-question'],
      'she asked me where was i living': ['Urutan biasa: where I was living.', 'reported-question'],
    }, { focus: 'reported-question' }),
    spot(4, 'He said us that the shop was closed.', 'said', 'told', '"say" tidak langsung diikuti orang: told us.', { focus: 'say-tell' }),
    fix(4, 'He asked me do I want some coffee.', ['He asked me if I wanted some coffee', 'He asked me whether I wanted some coffee', 'He asked me if I want some coffee', 'He asked me whether I want some coffee'], 'Pertanyaan ya/tidak → if/whether + urutan biasa, tanpa do.', undefined, { focus: 'reported-question' }),
  ],
});

export const thirdConditional = lesson({
  id: 'b2-third-conditional',
  title: 'Third Conditional',
  summary: 'Membayangkan masa lalu yang berbeda, dan menyatakan penyesalan.',
  topic: 'b2.third-conditional',
  objectives: [
    'Membentuk third conditional: If + had + bentuk ketiga, would have + bentuk ketiga.',
    'Menyatakan penyesalan dengan "I wish I had ...".',
    'Memilih second atau third conditional menurut waktunya.',
  ],
  intro: '"Seandainya saya tahu, saya pasti datang" membicarakan masa lalu yang sudah tidak bisa diubah. Bahasa Inggris memakai third conditional untuk itu. Kesalahan paling umum adalah memakai "would" di bagian "if": "If I would have known" seharusnya "If I had known".',
  teaching: [
    {
      heading: 'Bentuk',
      body: 'Bagian "if" tidak pernah memakai would. "would have" sering disingkat: would\'ve, I\'d have. Bisa juga memakai could have atau might have di bagian hasil.',
      table: [
        ['Bagian if', 'Bagian hasil'],
        ['If + had + bentuk ketiga', 'would have + bentuk ketiga'],
        ['If I had known,', 'I would have come.'],
        ["If she hadn't missed the bus,", "she wouldn't have been late."],
      ],
    },
    {
      heading: 'Makna: masa lalu yang tidak terjadi',
      body: 'Kedua bagian membicarakan hal yang TIDAK terjadi.',
      examples: [
        { en: 'If we had left earlier, we would have caught the train.', id: 'Seandainya kami berangkat lebih awal, kami pasti tidak ketinggalan kereta.', note: 'Faktanya: kami berangkat terlambat dan ketinggalan kereta.' },
        { en: 'I wish I had studied harder.', id: 'Saya menyesal tidak belajar lebih giat.', note: 'Penyesalan masa lalu: wish + had + bentuk ketiga.' },
      ],
    },
    {
      heading: 'Second atau third?',
      table: [
        ['Waktu', 'Conditional', 'Contoh'],
        ['Sekarang / umum, tidak nyata', 'second', 'If I had a car, I would drive to work.'],
        ['Masa lalu, tidak terjadi', 'third', 'If I had had a car, I would have driven to work yesterday.'],
      ],
      body: 'Perhatikan penanda waktu: yesterday, last year, when I was young → third conditional.',
    },
  ],
  demo: [
    ['If I had known, I would have helped.', 'If I would have known, I would have helped.', 'Bagian "if" memakai had + bentuk ketiga, bukan would have.'],
    ['We would have won if he had scored.', 'We would have win if he had scored.', 'Setelah would have, bentuk ketiga: won.'],
    ["If she had left earlier, she wouldn't have missed the flight.", "If she had left earlier, she wouldn't miss the flight yesterday.", 'Kejadiannya masa lalu (yesterday), jadi bagian hasil: wouldn\'t have missed.'],
  ],
  vocab: ['regret', 'warn', 'opportunity'],
  guided: [
    mc(3, 'Pilih bentuk yang tepat.', 'If I ___ about the traffic jam, I would have taken the train.', [
      ['had known', true],
      ['would have known', '"would have" tidak dipakai di bagian if.', 'third-form'],
      ['knew', 'Kejadiannya masa lalu dan bagian hasil "would have taken", jadi If I had known.', 'conditional-type'],
      ['have known', 'Bentuknya had + bentuk ketiga.', 'third-form'],
    ], 'Third conditional: If + had + bentuk ketiga.', { focus: 'third-form', hint: 'Bagian hasil memakai "would have taken".' }),
    fill(3, 'If you had asked me, I ___ have helped you.', ['would', 'could'], 'Bagian hasil: would/could have + bentuk ketiga.', {
      will: ['Third conditional memakai would have, bukan will have.', 'would-have-pp'],
      had: ['Bagian hasil memakai would have, bukan had.', 'third-form'],
    }, { focus: 'would-have-pp' }),
    match(3, 'Pasangkan bagian if dengan hasilnya.', [
      ["If she hadn't overslept,", "she wouldn't have missed the bus."],
      ['If it had rained,', 'the match would have been cancelled.'],
      ['If I had saved more,', 'I could have bought a car.'],
      ['If they had warned us,', 'we would have stayed at home.'],
    ], 'If + had + bentuk ketiga, would/could have + bentuk ketiga.', { focus: 'third-form' }),
    tf(3, 'Kalimat "If I had seen you, I would have say hello." sudah benar.', false, 'Setelah would have, bentuk ketiga: "I would have said hello."', '"would have" selalu diikuti bentuk ketiga (past participle).', { focus: 'would-have-pp', tag: 'would-have-pp' }),
  ],
  independent: [
    tr(4, 'Seandainya saya belajar lebih giat, saya pasti lulus ujian itu. (Ujiannya sudah lewat.)', ['If I had studied harder, I would have passed the exam', "If I had studied harder, I'd have passed the exam", "If I'd studied harder, I would have passed the exam", "If I'd studied harder, I'd have passed the exam", 'If I had studied harder, I would have passed that exam', "If I'd studied harder, I would have passed that exam", 'I would have passed the exam if I had studied harder', "I'd have passed the exam if I'd studied harder"], 'Masa lalu yang tidak terjadi → If + had studied, would have passed.', {
      'if i would have studied harder i would have passed the exam': ['Bagian if: had + bentuk ketiga.', 'third-form'],
      'if i studied harder i would pass the exam': ['Ujiannya sudah lewat: third conditional.', 'conditional-type'],
    }, { focus: 'third-form' }),
    fill(4, 'We ___ the flight if the taxi had come on time. (not miss)', ["wouldn't have missed"], 'Bagian hasil: would not have + bentuk ketiga.', {
      "wouldn't miss": ['Kejadiannya masa lalu: wouldn\'t have missed.', 'conditional-type'],
      "wouldn't have miss": ['Setelah have, bentuk ketiga: missed.', 'would-have-pp'],
      "didn't miss": ['Bagian hasil memakai would not have + bentuk ketiga.', 'third-form'],
    }, { focus: 'would-have-pp', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    spot(4, 'If he had checked the map, he would have went the right way.', 'went', 'gone', 'would have + bentuk ketiga: gone.', { focus: 'would-have-pp' }),
    dlg(3, 'Lengkapi percakapan berikut.', "A: Why didn't you come to the reunion?\nB: Nobody told me about it. ___", [
      ['If I had known, I would have come.', true],
      ['If I knew, I would come.', 'Reuninya sudah lewat: third conditional.', 'conditional-type'],
      ['If I would have known, I would have come.', 'Bagian if: had known.', 'third-form'],
      ['If I had known, I would come.', 'Bagian hasil untuk masa lalu: would have come.', 'would-have-pp'],
    ], 'Masa lalu yang tidak terjadi → If I had known, I would have come.', { focus: 'third-form' }),
  ],
  homework: [
    read(4, 'Last year Hana had the opportunity to study in Australia, but she was afraid of being far from home, so she said no. Now she regrets it. "If I had accepted the scholarship, I would have improved my English much faster," she says. "But if I had gone, I wouldn\'t have met my husband here in Malang."', 'What does Hana regret?', [
      ['Refusing the scholarship', true],
      ['Meeting her husband', 'Dia justru senang bertemu suaminya; itu sebabnya penyesalannya tidak sepenuhnya.'],
      ['Studying in Australia', 'Dia tidak pergi ke Australia.'],
      ['Living in Malang', 'Teks tidak menyebut dia menyesal tinggal di Malang.'],
    ], '"Now she regrets it" merujuk pada keputusannya menolak beasiswa.'),
    construct(4, 'had / if / she / the alarm / heard / have / would / she / woken up', ['If she had heard the alarm, she would have woken up', 'She would have woken up if she had heard the alarm'], 'If + had + bentuk ketiga, would have + bentuk ketiga.', undefined, { focus: 'third-form' }),
    fix(4, 'I wish I would have listened to your advice.', ['I wish I had listened to your advice'], 'Penyesalan masa lalu: wish + had + bentuk ketiga.', undefined, { focus: 'third-form' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang paling tepat untuk situasi ini: Tim kalah kemarin karena kipernya cedera.', null, [
      ["If the goalkeeper hadn't been injured, we would have won.", true],
      ["If the goalkeeper wasn't injured, we would win.", 'Pertandingannya kemarin: third conditional.', 'conditional-type'],
      ["If the goalkeeper hadn't been injured, we would win yesterday.", 'Bagian hasil untuk masa lalu: would have won.', 'would-have-pp'],
      ["If the goalkeeper wouldn't have been injured, we would have won.", 'Bagian if tidak memakai would.', 'third-form'],
    ], 'Masa lalu yang tidak terjadi → third conditional.', { focus: 'conditional-type' }),
    fill(4, 'If you ___ me, I would have picked you up from the airport. (call)', ['had called'], 'Bagian if: had + bentuk ketiga.', {
      called: ['Kejadiannya masa lalu: had called.', 'conditional-type'],
      'would have called': ['Bagian if tidak memakai would have.', 'third-form'],
      'have called': ['Bagian if: had + bentuk ketiga.', 'third-form'],
    }, { focus: 'third-form', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    tr(4, 'Saya tidak akan terlambat kemarin kalau alarm saya berbunyi.', ["I wouldn't have been late yesterday if my alarm had gone off", "I wouldn't have been late yesterday if my alarm had rung", "If my alarm had gone off, I wouldn't have been late yesterday", "If my alarm had rung, I wouldn't have been late yesterday", "I wouldn't have been late yesterday if my alarm had worked", "If my alarm had worked, I wouldn't have been late yesterday"], 'Masa lalu: wouldn\'t have been late + if + had gone off/rung.', {
      "i wouldn't be late yesterday if my alarm rang": ['Kemarin sudah lewat: wouldn\'t have been ... had rung.', 'conditional-type'],
      "i wouldn't have been late yesterday if my alarm would have rung": ['Bagian if tidak memakai would have.', 'third-form'],
    }, { focus: 'third-form' }),
    spot(4, 'If they had left earlier, they would have catch the train.', 'catch', 'caught', 'would have + bentuk ketiga: caught.', { focus: 'would-have-pp' }),
    fix(4, 'If I would have saved money, I could have travelled.', ['If I had saved money, I could have travelled', 'If I had saved money, I could have traveled', 'If I had saved some money, I could have travelled', 'If I had saved some money, I could have traveled'], 'Bagian if: had + bentuk ketiga.', undefined, { focus: 'third-form' }),
  ],
});

export const mixedConditionals = lesson({
  id: 'b2-mixed-conditionals',
  title: 'Mixed Conditionals',
  summary: 'Pengandaian ketika penyebab dan akibat terjadi di waktu yang berbeda.',
  topic: 'b2.mixed-conditionals',
  objectives: [
    'Menghubungkan penyebab masa lalu dengan akibat sekarang: If + had + bentuk ketiga, would + bentuk dasar.',
    'Menghubungkan keadaan sekarang dengan akibat masa lalu: If + past, would have + bentuk ketiga.',
    'Menentukan waktu setiap bagian kalimat dari penanda waktunya.',
  ],
  intro: 'Kadang penyebab dan akibat berada di waktu yang berbeda. "Seandainya dulu saya kuliah kedokteran, sekarang saya sudah jadi dokter." Penyebabnya masa lalu, akibatnya sekarang. Bahasa Inggris mencampur bentuk second dan third conditional untuk itu.',
  teaching: [
    {
      heading: 'Masa lalu → sekarang',
      body: 'Bagian "if" seperti third conditional, bagian hasil seperti second conditional.',
      table: [
        ['Bagian if (masa lalu)', 'Bagian hasil (sekarang)'],
        ['If + had + bentuk ketiga', 'would + bentuk dasar'],
        ['If I had taken that job,', 'I would be rich now.'],
        ["If she hadn't moved to Bali,", "she wouldn't know how to surf."],
      ],
    },
    {
      heading: 'Sekarang → masa lalu',
      body: 'Keadaan yang (masih) berlaku sekarang menjelaskan sesuatu yang tidak terjadi di masa lalu.',
      examples: [
        { en: "If I weren't afraid of heights, I would have climbed Rinjani last year.", id: 'Kalau saya tidak takut ketinggian, saya pasti sudah mendaki Rinjani tahun lalu.', note: 'Saya MASIH takut ketinggian.' },
        { en: 'If she spoke English, she would have got the job.', id: 'Kalau dia bisa berbahasa Inggris, dia pasti sudah dapat pekerjaan itu.' },
      ],
    },
    {
      heading: 'Cara memilih',
      body: 'Tentukan waktu setiap bagian secara terpisah. Penanda sekarang (now, today, by now) → would + bentuk dasar. Penanda lampau (yesterday, last year) → would have + bentuk ketiga.',
    },
  ],
  demo: [
    ['If I had studied medicine, I would be a doctor now.', 'If I had studied medicine, I would have been a doctor now.', '"now" menunjukkan hasil sekarang: would be.'],
    ["If I weren't so shy, I would have spoken to her yesterday.", "If I weren't so shy, I would speak to her yesterday.", '"yesterday" menunjukkan hasil di masa lalu: would have spoken.'],
    ["If you had charged your phone, it wouldn't be dead now.", "If you had charged your phone, it won't be dead now.", 'Hasil sekarang yang dibayangkan memakai would, bukan will.'],
  ],
  vocab: ['career', 'qualified', 'graduate'],
  guided: [
    mc(3, 'Pilih bentuk yang tepat.', 'If I had gone to bed earlier, I ___ so tired now.', [
      ["wouldn't be", true],
      ["wouldn't have been", '"now" menunjukkan keadaan sekarang: wouldn\'t be.', 'mixed-time'],
      ["won't be", 'Bayangan memakai would, bukan will.', 'conditional-type'],
      ["hadn't been", 'Bagian hasil memakai would.', 'third-form'],
    ], 'Penyebab masa lalu → akibat sekarang: would + bentuk dasar.', { focus: 'mixed-time', hint: 'Lihat kata "now".' }),
    fill(3, 'If I spoke Mandarin, I ___ that job in Shanghai last year. (get)', ['would have got', 'would have gotten'], 'Keadaan sekarang (tidak bisa Mandarin) → akibat masa lalu (tahun lalu): would have got.', {
      'would get': ['Pekerjaannya tahun lalu: would have got.', 'mixed-time'],
      'would have get': ['Setelah have, bentuk ketiga: got.', 'would-have-pp'],
    }, { focus: 'mixed-time', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    match(3, 'Pasangkan penyebab dengan akibat yang waktunya tepat.', [
      ['If I had saved money last year,', 'I could buy a laptop now.'],
      ["If I weren't afraid of flying,", 'I would have visited you last summer.'],
      ['If she had taken the medicine,', 'she would feel better now.'],
      ['If we lived closer,', 'we would have come to your party.'],
    ], 'Lihat waktu setiap bagian: now → would/could + bentuk dasar; last summer → would have + bentuk ketiga.', { focus: 'mixed-time' }),
    tf(3, 'Kalimat "If he had accepted the job, he would live in Jakarta now." sudah benar.', true, 'Benar. Penyebab di masa lalu (had accepted), akibat sekarang (would live ... now).', 'Ini mixed conditional masa lalu → sekarang, dan bentuknya sudah tepat.', { focus: 'mixed-time' }),
  ],
  independent: [
    tr(4, 'Seandainya dulu saya mengambil jurusan teknik, sekarang saya sudah menjadi insinyur.', ['If I had studied engineering, I would be an engineer now', "If I had studied engineering, I'd be an engineer now", "If I'd studied engineering, I would be an engineer now", "If I'd studied engineering, I'd be an engineer now", 'If I had taken engineering, I would be an engineer now', "If I had taken engineering, I'd be an engineer now", 'If I had majored in engineering, I would be an engineer now', "If I had majored in engineering, I'd be an engineer now"], 'Penyebab masa lalu (had studied) → akibat sekarang (would be ... now).', {
      'if i had studied engineering i would have been an engineer now': ['"sekarang" → would be.', 'mixed-time'],
      'if i studied engineering i would be an engineer now': ['Penyebabnya masa lalu ("dulu"): had studied.', 'mixed-time'],
    }, { focus: 'mixed-time' }),
    fill(4, "If Rina weren't so busy, she ___ to the wedding last week. (come)", ['would have come'], 'Keadaan sekarang (sibuk) → akibat masa lalu (minggu lalu): would have come.', {
      'would come': ['Pernikahannya minggu lalu: would have come.', 'mixed-time'],
      'would have came': ['Bentuk ketiga "come" adalah "come".', 'would-have-pp'],
    }, { focus: 'mixed-time', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    spot(4, "If they had booked a table, they won't be waiting outside now.", "won't", "wouldn't", 'Hasil sekarang yang dibayangkan memakai would: they wouldn\'t be waiting.', { focus: 'conditional-type' }),
    dlg(4, 'Lengkapi percakapan berikut.', 'A: Why are you still at the office?\nB: ___', [
      ["If I had finished the report this morning, I'd be at home now.", true],
      ["If I finished the report this morning, I'd be at home now.", 'Pagi tadi sudah lewat: had finished.', 'mixed-time'],
      ["If I had finished the report this morning, I'd have been at home now.", '"now" → would be.', 'mixed-time'],
      ["If I would have finished the report this morning, I'd be at home now.", 'Bagian if tidak memakai would.', 'third-form'],
    ], 'Penyebab masa lalu (this morning) → akibat sekarang (now).', { focus: 'mixed-time' }),
  ],
  homework: [
    read(4, 'Fajar is 35 and works as a bank clerk. When he was 18, he got a place at an art school in Bandung, but his parents wanted him to study economics. "If I had gone to art school, I would probably be a designer now," he says. "But if I hadn\'t studied economics, I wouldn\'t have met Lia, and we wouldn\'t have our two wonderful kids."', 'Why is Fajar not a designer now?', [
      ['He studied economics instead of art.', true],
      ['He failed the art school entrance test.', 'Dia justru diterima di sekolah seni.'],
      ["His wife didn't want him to be a designer.", 'Teks tidak menyebut ini.'],
      ["He doesn't like art.", 'Teks menunjukkan dia sebenarnya ingin sekolah seni.'],
    ], '"If I had gone to art school, I would probably be a designer now" berarti dia tidak masuk sekolah seni.'),
    construct(4, 'would / if / had / I / eaten / be / I / hungry / not / now / breakfast', ['If I had eaten breakfast, I would not be hungry now', 'I would not be hungry now if I had eaten breakfast'], 'If + had + bentuk ketiga (masa lalu), would + bentuk dasar + now.', undefined, { focus: 'mixed-time' }),
    fix(4, 'If he had invested in that company, he would have been rich now.', ['If he had invested in that company, he would be rich now'], '"now" → would be.', undefined, { focus: 'mixed-time' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang paling tepat.', 'Situasi: Kamu tidak bisa berenang, jadi kemarin kamu tidak ikut snorkeling.', [
      ['If I could swim, I would have gone snorkelling yesterday.', true],
      ['If I could swim, I would go snorkelling yesterday.', 'Snorkelingnya kemarin: would have gone.', 'mixed-time'],
      ['If I had been able to swim, I would go snorkelling yesterday.', '"yesterday" menuntut would have gone.', 'mixed-time'],
      ['If I can swim, I will go snorkelling yesterday.', 'Situasinya tidak nyata dan sudah lewat.', 'conditional-type'],
    ], 'Keadaan sekarang (tidak bisa berenang) → akibat masa lalu (kemarin).', { focus: 'mixed-time' }),
    fill(4, 'If we had left on time, we ___ at the hotel by now. (be)', ['would be'], '"by now" → keadaan sekarang: would be.', {
      'would have been': ['"by now" menunjukkan keadaan sekarang: would be.', 'mixed-time'],
      'will be': ['Bayangan memakai would.', 'conditional-type'],
    }, { focus: 'mixed-time', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    tr(4, 'Kalau saya tidak takut ketinggian, saya pasti sudah mendaki Rinjani tahun lalu.', ["If I weren't afraid of heights, I would have climbed Rinjani last year", "If I wasn't afraid of heights, I would have climbed Rinjani last year", "If I weren't afraid of heights, I'd have climbed Rinjani last year", "If I wasn't afraid of heights, I'd have climbed Rinjani last year", "If I weren't afraid of heights, I would have climbed Mount Rinjani last year", "If I wasn't afraid of heights, I would have climbed Mount Rinjani last year", "If I hadn't been afraid of heights, I would have climbed Rinjani last year", "If I hadn't been afraid of heights, I would have climbed Mount Rinjani last year"], 'Takut ketinggian masih berlaku sekarang (weren\'t), akibatnya tahun lalu (would have climbed). Bentuk third conditional (hadn\'t been) juga diterima.', {
      "if i weren't afraid of heights i would climb rinjani last year": ['"tahun lalu" → would have climbed.', 'mixed-time'],
      "if i wouldn't be afraid of heights i would have climbed rinjani last year": ['Bagian if tidak memakai would.', 'third-form'],
    }, { focus: 'mixed-time' }),
    spot(4, 'If she had taken the job in Bali, she would lived there now.', 'lived', 'live', 'would + bentuk dasar: would live.', { focus: 'mixed-time' }),
    fix(4, "If I didn't miss the bus this morning, I wouldn't be late now.", ["If I hadn't missed the bus this morning, I wouldn't be late now"], 'Penyebabnya tadi pagi (masa lalu): hadn\'t missed.', undefined, { focus: 'mixed-time' }),
  ],
});
