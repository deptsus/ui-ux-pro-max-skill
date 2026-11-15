// C1 · Bab 3 (Rilis 5) — register formal dan informal, pasif impersonal,
// kata kerja pelapor, dan bahasa persuasi. Premium.
import { construct, dlg, fill, fix, lesson, match, mc, read, tf, tr } from './dsl';

export const registerLesson = lesson({
  id: 'c1-register',
  title: 'Register Formal dan Informal',
  summary: 'Memilih kata dan susunan yang cocok untuk email resmi, pengumuman, dan obrolan santai.',
  topic: 'c1.register',
  objectives: [
    'Mengenali ciri bahasa formal: tanpa kontraksi, kata kerja formal, dan permintaan tidak langsung.',
    'Mengganti kata dan phrasal verb informal dengan padanan formalnya.',
    'Menghindari bahasa yang terlalu kaku dalam percakapan santai.',
  ],
  intro: 'Bahasa Indonesia membedakan "kamu" dan "Anda", "minta" dan "mohon". Bahasa Inggris tidak punya kata ganti formal, jadi register terlihat dari pilihan kata dan susunan kalimat: "Can you send it?" untuk teman, "I would be grateful if you could send it" untuk surat resmi. Salah register bukan salah tata bahasa, tetapi membuat tulisan terdengar tidak sopan atau justru kaku.',
  teaching: [
    {
      heading: 'Ciri bahasa formal',
      body: 'Tanpa kontraksi (I am, bukan I\'m), kata kerja tunggal yang formal (obtain, require, assist) alih-alih phrasal verb, kalimat pasif atau impersonal, dan permintaan tidak langsung.',
      examples: [
        { en: 'I am writing to request further information.', id: 'Saya menulis untuk meminta informasi lebih lanjut.' },
        { en: 'I would be grateful if you could reply by Friday.', id: 'Saya akan sangat berterima kasih jika Anda dapat membalas paling lambat Jumat.' },
      ],
    },
    {
      heading: 'Pasangan informal dan formal',
      body: 'Phrasal verb dan kata sehari-hari punya padanan formal. Keduanya benar; pilih sesuai pembaca.',
      table: [
        ['Informal', 'Formal'],
        ['get', 'obtain / receive'],
        ['buy', 'purchase'],
        ['help', 'assist'],
        ['need', 'require'],
        ['put off', 'postpone'],
        ['find out', 'discover / establish'],
      ],
    },
    {
      heading: 'Jangan terlalu kaku',
      body: 'Dalam pesan kepada teman, bahasa yang terlalu formal terdengar dingin atau bercanda. "Thanks!", "See you!", dan phrasal verb justru wajar di sini.',
      examples: [
        { en: 'Hi Dina, can you send me the photos? Thanks!', id: 'Hai Dina, bisa kirimi aku fotonya? Makasih!' },
      ],
    },
  ],
  demo: [
    ['I am writing to request further information.', "I'm writing to ask for more info.", 'Untuk email resmi: tanpa kontraksi, "request further information", dan tanpa singkatan "info".'],
    ['The meeting has been postponed until Friday.', 'The meeting has been put off till Friday.', 'Untuk pengumuman resmi: postponed dan until lebih tepat daripada put off dan till.'],
    ['Hi Dina, can you send me the photos?', 'Dear Dina, I would be most grateful if you could kindly send me the photographs.', 'Pesan santai kepada teman tidak perlu sekaku surat resmi.'],
  ],
  vocab: ['obtain', 'postpone'],
  guided: [
    mc(3, 'Kata mana yang paling formal untuk surat resmi?', 'Applicants ___ a valid passport.', [
      ['require', true],
      ['gotta have', 'Sangat informal (bahasa lisan).', 'register-too-informal'],
      ['wanna get', 'Sangat informal, dan maknanya juga bergeser menjadi "ingin".', 'register-too-informal'],
    ], 'need → require dalam tulisan formal.', { focus: 'register-too-informal' }),
    mc(3, 'Pilih kalimat pembuka yang tepat untuk email lamaran kerja.', null, [
      ['Dear Sir or Madam, I am writing to apply for the position of marketing assistant.', true],
      ['Hey there! I wanna apply for the marketing job.', 'Terlalu santai untuk lamaran kerja.', 'register-too-informal'],
      ["Hi, I'm applying for the job, OK?", 'Terlalu santai dan terdengar tidak sopan untuk lamaran.', 'register-too-informal'],
    ], 'Lamaran kerja: salam formal dan tujuan yang jelas.', { focus: 'register-too-informal' }),
    match(3, 'Pasangkan kata informal dengan padanan formalnya.', [
      ['get', 'obtain'],
      ['buy', 'purchase'],
      ['help', 'assist'],
      ['put off', 'postpone'],
    ], 'Padanan formal biasanya satu kata kerja, bukan phrasal verb.', { focus: 'register-too-informal' }),
    tf(3, '"Thanks a lot, see ya!" adalah penutup yang tepat untuk email kepada dosen.', false, 'Untuk dosen pakai penutup formal, misalnya "Kind regards" atau "Yours sincerely".', '"see ya" terlalu santai untuk dosen.', { focus: 'register-too-informal', tag: 'register-too-informal' }),
  ],
  independent: [
    mc(3, 'Ubah ke gaya formal: "We need to put off the meeting."', null, [
      ['The meeting will need to be postponed.', true],
      ['We gotta push back the meeting.', 'Lebih santai lagi, bukan formal.', 'register-too-informal'],
      ['We need to put the meeting off, OK?', 'Masih memakai phrasal verb dan "OK?".', 'register-too-informal'],
    ], 'put off → postpone, dan kalimat pasif terdengar lebih resmi.', { focus: 'register-too-informal' }),
    tr(3, 'Saya ingin meminta informasi lebih lanjut. (formal)', ['I would like to request further information', 'I would like to request more information', 'I would like to request additional information', 'I would like to ask for further information', 'I wish to request further information'], 'Formal: I would like to request further information.', {
      'i want more info': ['Terlalu santai untuk surat resmi.', 'register-too-informal'],
      'i wanna ask for more info': ['Terlalu santai untuk surat resmi.', 'register-too-informal'],
    }, { focus: 'register-too-informal' }),
    fill(3, 'I would be grateful if you ___ send me the application form. (can)', ['could'], 'Permintaan formal: I would be grateful if you could ...', {
      can: ['Pola "I would be grateful if you" diikuti could.', 'register-too-informal'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'register-too-informal' }),
    dlg(3, 'Lengkapi pesan antarteman berikut.', 'A: Fancy a coffee after class?\nB: ___', [
      ['Sure! See you at the canteen at four.', true],
      ['I would be delighted to accept your kind invitation.', 'Tata bahasanya benar, tetapi terlalu kaku untuk teman.', 'register-too-formal'],
      ['I hereby confirm my attendance.', 'Bahasa dokumen resmi, terdengar aneh dalam obrolan.', 'register-too-formal'],
    ], 'Obrolan santai: jawaban pendek dan ramah.', { focus: 'register-too-formal' }),
  ],
  homework: [
    read(3, "Message 1: 'Dear Ms Halim, I am writing to enquire whether the library will be open during the semester break. I would be grateful if you could let me know the opening hours. Kind regards, Andi Pratama.' Message 2: 'Hey Bayu! Is the library open over the break? Can you check for me? Cheers!'", 'Why is Message 1 more formal than Message 2?', [
      ['It uses full forms, an indirect request and a formal greeting.', true],
      ['It asks a different question.', 'Keduanya menanyakan hal yang sama.'],
      ['It is shorter.', 'Pesan 1 justru lebih panjang.'],
    ], 'Pesan 1: "Dear Ms Halim", "I am writing to enquire", "I would be grateful if you could".'),
    mc(3, 'Pilih kalimat yang paling tepat untuk pengumuman resmi kampus.', null, [
      ['Students are required to submit their assignments by Friday.', true],
      ['You guys gotta hand in your stuff by Friday.', 'Terlalu santai untuk pengumuman resmi.', 'register-too-informal'],
      ['Hand in your stuff by Friday, OK?', 'Terlalu santai dan kurang jelas ("stuff").', 'register-too-informal'],
    ], 'Pengumuman resmi: pasif (are required) dan kata yang jelas.', { focus: 'register-too-informal' }),
    tr(3, 'Mohon maaf atas ketidaknyamanan ini. (formal)', ['We apologise for the inconvenience', 'We apologize for the inconvenience', 'We apologise for any inconvenience', 'We apologize for any inconvenience', 'We apologise for this inconvenience', 'We apologize for this inconvenience', 'We are sorry for the inconvenience', 'We are sorry for any inconvenience', 'I apologise for the inconvenience', 'I apologize for the inconvenience'], 'Formal: We apologise for the inconvenience.', {
      'sorry for the trouble': ['Terlalu santai untuk pengumuman resmi.', 'register-too-informal'],
    }, { focus: 'register-too-informal' }),
  ],
  mastery: [
    mc(3, 'Kata mana yang paling formal?', 'Tickets can be ___ online.', [
      ['purchased', true],
      ['grabbed', 'Sangat informal.', 'register-too-informal'],
      ['picked up', 'Phrasal verb yang santai.', 'register-too-informal'],
    ], 'buy → purchase.', { focus: 'register-too-informal' }),
    mc(3, 'Teman dekatmu mengirim pesan "You coming tonight?". Pilih balasan yang paling wajar.', null, [
      ["Yeah, I'll be there around eight!", true],
      ['I would like to confirm that I shall attend this evening.', 'Terlalu kaku untuk teman dekat.', 'register-too-formal'],
      ['Please be informed that I will attend.', 'Gaya surat resmi, terdengar dingin.', 'register-too-formal'],
    ], 'Obrolan santai: jawaban santai.', { focus: 'register-too-formal' }),
    fill(3, 'The event has been ___ until next month. (pilih yang formal: postpone / put off)', ['postponed'], 'Pengumuman resmi: postponed.', {
      'put off': ['Phrasal verb terlalu santai untuk pengumuman resmi.', 'register-too-informal'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari pilihan dalam kurung.', focus: 'register-too-informal' }),
    tr(3, 'Bisakah Anda membantu saya? (formal)', ['Could you assist me', 'Could you please assist me', 'Would you be able to assist me', 'Could you help me', 'Could you please help me', 'Would you be able to help me', 'Would you mind helping me', 'I would be grateful if you could help me', 'I would be grateful if you could assist me'], 'Formal: Could you assist me? / Would you be able to help me?', {
      'can you help me': ['Kurang formal. Pakai "Could you ...?" atau "Would you be able to ...?"', 'register-too-informal'],
    }, { focus: 'register-too-informal' }),
    construct(3, 'I / would be grateful / if / you / could / reply / by Friday', ['I would be grateful if you could reply by Friday'], 'Permintaan formal yang sopan.', {
      'i would be grateful if you can reply by friday': ['Dalam pola ini pakai could.', 'register-too-informal'],
    }, { focus: 'register-too-informal' }),
  ],
});

export const impersonalLesson = lesson({
  id: 'c1-impersonal',
  title: 'Pasif Impersonal: It is said that ...',
  summary: 'Melaporkan pendapat umum atau kabar tanpa menyebut sumbernya, seperti dalam berita dan tulisan akademik.',
  topic: 'c1.impersonal',
  objectives: [
    'Memakai It + is said/believed/reported + that + klausa.',
    'Memakai subjek + is said/believed + to + bentuk dasar.',
    'Memakai to have + bentuk ketiga untuk kejadian yang sudah lewat.',
  ],
  intro: 'Bahasa Indonesia memakai "konon", "kabarnya", atau "diyakini". Bahasa Inggris formal memakai pasif impersonal: "It is said that ..." atau "The castle is said to be ...". Bentuk ini sering muncul di berita, laporan, dan tulisan akademik karena tidak perlu menyebut siapa yang berkata.',
  teaching: [
    {
      heading: 'It + pasif + that',
      body: 'Pola: It + is/was + said/believed/thought/reported/expected + that + klausa lengkap.',
      examples: [
        { en: 'It is said that the castle is haunted.', id: 'Konon kastil itu berhantu.' },
        { en: 'It has been reported that two people were injured.', id: 'Dilaporkan bahwa dua orang terluka.' },
      ],
    },
    {
      heading: 'Subjek + pasif + to-infinitive',
      body: 'Subjek kalimat "that" dipindah ke depan, lalu kata kerjanya menjadi to + bentuk dasar.',
      examples: [
        { en: 'The castle is said to be haunted.', id: 'Kastil itu konon berhantu.' },
        { en: 'The company is expected to announce its results today.', id: 'Perusahaan itu diperkirakan mengumumkan hasilnya hari ini.' },
      ],
    },
    {
      heading: 'Kejadian lampau: to have + bentuk ketiga',
      body: 'Kalau yang dilaporkan terjadi lebih dulu daripada saat melapor, pakai to have + bentuk ketiga.',
      table: [
        ['Makna', 'Pola', 'Contoh'],
        ['Sekarang / umum', 'is said to be', 'He is said to be rich.'],
        ['Lampau', 'is said to have + V3', 'He is said to have been rich once.'],
        ['Pasif lampau', 'is thought to have been + V3', 'The painting is thought to have been stolen.'],
      ],
    },
  ],
  demo: [
    ['It is said that the castle is haunted.', 'It is said the castle to be haunted.', 'Pola "It is said" diikuti that + klausa lengkap.'],
    ['The castle is said to be haunted.', 'The castle is said that it is haunted.', 'Pola subjek: is said + to be.'],
    ['He is believed to have left the country last year.', 'He is believed to leave the country last year.', 'Kejadian tahun lalu: to have + bentuk ketiga.'],
  ],
  vocab: ['allege', 'unprecedented'],
  guided: [
    mc(3, 'Pilih bentuk yang tepat.', 'The new bridge ___ to be the longest in Asia.', [
      ['is said', true],
      ['says', 'Jembatan tidak berkata apa-apa. Pakai pasif: is said.', 'impersonal-form'],
      ['is saying', 'Pakai pasif: is said.', 'impersonal-form'],
    ], 'Subjek + is said + to + bentuk dasar.', { focus: 'impersonal-form' }),
    mc(3, 'Pilih bentuk yang tepat.', 'It ___ that the minister will resign.', [
      ['is rumoured', true],
      ['rumours', '"It" tidak menyebarkan kabar. Pakai pasif: is rumoured.', 'impersonal-form'],
      ['is rumoured to', 'Setelah "It is rumoured" pakai that + klausa, bukan to.', 'impersonal-form'],
    ], 'It + is rumoured + that + klausa.', { focus: 'impersonal-form' }),
    fill(3, 'The thieves are thought ___ the country yesterday. (leave)', ['to have left'], 'Kejadian kemarin: to have + bentuk ketiga.', {
      'to leave': ['Kejadiannya kemarin (lampau): to have left.', 'impersonal-past'],
      left: ['Setelah are thought, pakai to-infinitive: to have left.', 'impersonal-form'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'impersonal-past' }),
    tf(3, '"It is said that she is very rich" sama artinya dengan "She is said to be very rich".', true, 'Kedua pola menyampaikan kabar yang sama; yang kedua memindahkan subjek ke depan.', 'Kalimat ini benar.', { focus: 'impersonal-form', tag: 'impersonal-form' }),
  ],
  independent: [
    construct(3, 'the painting / is thought / to have / be / stolen / in 1990', ['The painting is thought to have been stolen in 1990'], 'Pasif lampau: to have been + bentuk ketiga.', {
      'the painting is thought to have be stolen in 1990': ['Setelah to have, bentuk ketiga: been.', 'impersonal-past'],
    }, { focus: 'impersonal-past' }),
    tr(3, 'Konon desa itu berusia 500 tahun. (mulai dengan "The village")', ['The village is said to be 500 years old', 'The village is believed to be 500 years old', 'The village is thought to be 500 years old', 'The village is said to be five hundred years old', 'The village is believed to be five hundred years old', 'The village is thought to be five hundred years old'], 'Subjek + is said + to be.', {
      'the village is said that it is 500 years old': ['Pola subjek: is said + to be.', 'impersonal-form'],
      'the village says to be 500 years old': ['Pakai pasif: is said.', 'impersonal-form'],
    }, { focus: 'impersonal-form' }),
    mc(3, 'Ubah kalimat: "People believe that the minister knew about the plan."', null, [
      ['The minister is believed to have known about the plan.', true],
      ['The minister is believed to know about the plan.', '"knew" lebih dulu daripada saat orang meyakini: to have known.', 'impersonal-past'],
      ['The minister believes to have known about the plan.', 'Yang meyakini orang lain, jadi pasif: is believed.', 'impersonal-form'],
    ], 'Kejadian lampau: to have + bentuk ketiga.', { focus: 'impersonal-past' }),
    fix(3, 'It is reported the factory to close next year.', ['It is reported that the factory will close next year', 'The factory is reported to be closing next year', 'The factory is reported to close next year'], 'It is reported + that + klausa, atau subjek + is reported + to.', undefined, { focus: 'impersonal-form' }),
  ],
  homework: [
    read(3, 'A rare orangutan is believed to have been born in the Tanjung Puting reserve last month. It is thought that fewer than 100,000 Bornean orangutans remain in the wild, and the species is said to be critically endangered. Rangers are expected to release photos of the baby next week.', 'What has probably already happened?', [
      ['A baby orangutan was born.', true],
      ['The rangers released photos.', 'Foto baru diperkirakan dirilis minggu depan ("are expected to release").'],
      ['The species stopped being endangered.', 'Spesies itu masih "critically endangered".'],
    ], '"is believed to have been born ... last month" = kejadian yang sudah terjadi.'),
    fill(3, 'It ___ that over 3,000 people attended the concert. (estimate)', ['is estimated', 'has been estimated', 'was estimated'], 'Pasif impersonal: It is estimated that ...', {
      estimates: ['"It" tidak memperkirakan. Pakai pasif: is estimated.', 'impersonal-form'],
      estimated: ['Butuh to be: is estimated.', 'impersonal-form'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'impersonal-form' }),
    tr(3, 'Diperkirakan harga akan naik. (mulai dengan "It")', ['It is expected that prices will rise', 'It is estimated that prices will rise', 'It is thought that prices will rise', 'It is believed that prices will rise', 'It is predicted that prices will rise', 'It is expected that prices will go up', 'It is thought that prices will go up', 'It is predicted that prices will go up', 'It is believed that prices will go up', 'It is estimated that prices will go up', 'It is expected that prices will increase', 'It is predicted that prices will increase', 'It is thought that prices will increase', 'It is believed that prices will increase', 'It is estimated that prices will increase'], 'It + is expected/thought + that + klausa.', {
      'it expects that prices will rise': ['Pakai pasif: It is expected that ...', 'impersonal-form'],
    }, { focus: 'impersonal-form' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', 'The suspect ___ the money before he was arrested.', [
      ['is thought to have hidden', true],
      ['is thought to hide', 'Ia menyembunyikannya sebelum ditangkap (lampau): to have hidden.', 'impersonal-past'],
      ['thinks to have hidden', 'Yang berpikir orang lain, jadi pasif: is thought.', 'impersonal-form'],
      ['is thought that he hid', 'Setelah subjek + is thought, pakai to-infinitive.', 'impersonal-form'],
    ], 'Kejadian lampau: is thought to have + bentuk ketiga.', { focus: 'impersonal-past' }),
    fill(3, 'She is said ___ a talented painter when she was young. (be)', ['to have been'], 'Masa mudanya (lampau): to have been.', {
      'to be': ['"when she was young" = lampau: to have been.', 'impersonal-past'],
      being: ['Setelah is said, pakai to-infinitive.', 'impersonal-form'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'impersonal-past' }),
    construct(3, 'it / is / widely / believed / that / the plan / will fail', ['It is widely believed that the plan will fail'], 'It + is (widely) believed + that + klausa.', {
      'it widely believes that the plan will fail': ['Pakai pasif: It is widely believed.', 'impersonal-form'],
    }, { focus: 'impersonal-form' }),
    tr(3, 'Pencuri itu diyakini masih berada di kota. (mulai dengan "The thief")', ['The thief is believed to be still in the city', 'The thief is believed to still be in the city', 'The thief is believed to be in the city still', 'The thief is believed to be still in town', 'The thief is believed to still be in town'], 'Subjek + is believed + to be.', {
      'the thief is believed that he is still in the city': ['Pola subjek: is believed + to be.', 'impersonal-form'],
      'the thief believes to be still in the city': ['Pakai pasif: is believed.', 'impersonal-form'],
    }, { focus: 'impersonal-form' }),
    mc(3, 'Kalimat mana yang paling cocok untuk laporan berita?', null, [
      ['The fire is reported to have started in the kitchen.', true],
      ['People say that maybe the fire started in the kitchen, I think.', 'Terlalu santai dan ragu untuk berita.'],
      ['The fire reports to have started in the kitchen.', 'Api tidak melapor. Pakai pasif: is reported.', 'impersonal-form'],
    ], 'Berita memakai pasif impersonal untuk kabar yang belum pasti sumbernya.', { focus: 'impersonal-form' }),
  ],
});

export const reportingVerbsLesson = lesson({
  id: 'c1-reporting-verbs',
  title: 'Kata Kerja Pelapor dan Polanya',
  summary: 'accuse, deny, insist, warn, suggest: setiap kata kerja pelapor punya pola tetap.',
  topic: 'c1.reporting-verbs',
  objectives: [
    'Memakai kata kerja pelapor dengan -ing atau kata depan + -ing (deny, admit, accuse of, insist on).',
    'Memakai kata kerja pelapor dengan objek + to-infinitive (warn, remind, advise, urge).',
    'Memakai suggest dan recommend dengan benar.',
  ],
  intro: 'Di B2 kamu melaporkan ucapan dengan said dan told. Penulis yang mahir memilih kata kerja yang juga menyampaikan sikap: denied (menyangkal), insisted (bersikeras), accused (menuduh). Masalahnya, setiap kata kerja punya pola sendiri yang harus dihafal, dan pola "suggest someone to" adalah kesalahan yang sangat sering.',
  teaching: [
    {
      heading: 'Kata kerja + -ing, atau kata depan + -ing',
      body: 'deny, admit, regret + -ing. accuse someone of, apologise for, insist on, blame someone for + -ing.',
      examples: [
        { en: 'He denied taking the money.', id: 'Ia menyangkal mengambil uang itu.' },
        { en: 'She accused him of lying.', id: 'Ia menuduh pria itu berbohong.' },
        { en: 'They insisted on paying.', id: 'Mereka bersikeras membayar.' },
      ],
    },
    {
      heading: 'Kata kerja + orang + to-infinitive',
      body: 'warn, remind, advise, urge, persuade, encourage + orang + to + bentuk dasar. Negatif: not to.',
      examples: [
        { en: 'The guide warned us not to swim there.', id: 'Pemandu memperingatkan kami agar tidak berenang di sana.' },
        { en: 'She reminded me to call my mother.', id: 'Ia mengingatkan saya untuk menelepon ibu.' },
      ],
    },
    {
      heading: 'suggest dan recommend',
      body: 'suggest + -ing, atau suggest that + subjek + (should) + bentuk dasar. Tidak ada pola "suggest someone to". recommend mengikuti pola yang sama.',
      table: [
        ['Benar', 'Salah'],
        ['She suggested taking a taxi.', 'She suggested me to take a taxi.'],
        ['She suggested that I take a taxi.', 'She suggested to take a taxi.'],
      ],
    },
  ],
  demo: [
    ['She accused him of lying.', 'She accused him to lie.', 'accuse + orang + of + -ing.'],
    ['He denied taking the money.', 'He denied to take the money.', 'deny + -ing.'],
    ['I suggest that you see a doctor.', 'I suggest you to see a doctor.', 'suggest tidak diikuti orang + to. Pakai suggest that you (should) see, atau suggest seeing.'],
  ],
  vocab: ['deny', 'insist'],
  guided: [
    mc(3, '"I didn\'t break the vase," said Tom. Pilih laporan yang tepat.', 'Tom denied ___ the vase.', [
      ['breaking', true],
      ['to break', 'deny + -ing.', 'reporting-pattern'],
      ['that he break', 'Kalau memakai that, kata kerjanya harus lengkap: that he had broken.', 'reporting-pattern'],
    ], 'deny + -ing.', { focus: 'reporting-pattern' }),
    mc(3, '"You stole my phone!" she said to him. Pilih laporan yang tepat.', 'She accused him ___ her phone.', [
      ['of stealing', true],
      ['to steal', 'accuse + orang + of + -ing.', 'reporting-pattern'],
      ['for stealing', '"for" dipakai dengan blame. accuse memakai of.', 'reporting-pattern'],
    ], 'accuse someone of + -ing.', { focus: 'reporting-pattern' }),
    mc(3, 'Pilih bentuk yang tepat.', 'My doctor suggested ___ less sugar.', [
      ['eating', true],
      ['me to eat', 'Tidak ada pola "suggest someone to". Pakai suggested eating / suggested that I eat.', 'suggest-pattern'],
      ['to eat', 'suggest tidak diikuti to-infinitive.', 'suggest-pattern'],
    ], 'suggest + -ing.', { focus: 'suggest-pattern' }),
    match(3, 'Pasangkan kata kerja dengan polanya.', [
      ['apologise', 'for + -ing'],
      ['insist', 'on + -ing'],
      ['warn', 'orang + not to + bentuk dasar'],
      ['deny', '+ -ing'],
    ], 'Setiap kata kerja pelapor punya pola tetap.', { focus: 'reporting-pattern' }),
  ],
  independent: [
    fill(3, '"Don\'t touch the wires!" The engineer warned us ___ the wires. (not / touch)', ['not to touch'], 'warn + orang + not to + bentuk dasar.', {
      'not touching': ['warn + orang + not to + bentuk dasar.', 'reporting-pattern'],
      "don't touch": ['Dalam kalimat laporan: warned us not to touch.', 'reporting-pattern'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'reporting-pattern' }),
    tr(3, 'Dia bersikeras membayar makan malam. (insist)', ['He insisted on paying for dinner', 'She insisted on paying for dinner', 'He insisted on paying for the dinner', 'She insisted on paying for the dinner'], 'insist + on + -ing.', {
      'he insisted to pay for dinner': ['insist + on + -ing.', 'reporting-pattern'],
      'she insisted to pay for dinner': ['insist + on + -ing.', 'reporting-pattern'],
    }, { focus: 'reporting-pattern' }),
    construct(3, 'the manager / apologised / for / keep / us / waiting', ['The manager apologised for keeping us waiting', 'The manager apologized for keeping us waiting'], 'apologise for + -ing.', {
      'the manager apologised for keep us waiting': ['Setelah for, -ing: keeping.', 'reporting-pattern'],
    }, { focus: 'reporting-pattern' }),
    fix(3, 'She suggested me to take a taxi.', ['She suggested that I take a taxi', 'She suggested that I should take a taxi', 'She suggested I take a taxi', 'She suggested I should take a taxi', 'She suggested taking a taxi'], 'suggest that I (should) take / suggest taking.', undefined, { focus: 'suggest-pattern' }),
  ],
  homework: [
    read(3, "After the match, the coach blamed the referee for the defeat. The referee denied making any mistakes and accused the coach of setting a bad example for young fans. Later, the coach admitted losing his temper and apologised for his comments. The league has urged both men to meet and settle their differences.", 'What did the coach finally admit?', [
      ['That he had lost his temper', true],
      ['That the referee made mistakes', 'Itu yang ia salahkan sebelumnya, bukan yang ia akui.'],
      ['That he set a good example', 'Wasit justru menuduhnya memberi contoh buruk.'],
    ], '"the coach admitted losing his temper".'),
    mc(3, '"I\'ll definitely help you," he said. Pilih laporan yang tepat.', 'He ___ to help me.', [
      ['promised', true],
      ['suggested', 'suggest tidak diikuti to, dan maknanya berbeda.', 'suggest-pattern'],
      ['insisted', 'insist memakai on + -ing, dan maknanya bersikeras.', 'reporting-pattern'],
      ['denied', 'deny berarti menyangkal, berlawanan maknanya.', 'reporting-pattern'],
    ], 'promise + to + bentuk dasar.', { focus: 'reporting-pattern' }),
    tr(3, 'Mereka menyalahkan cuaca atas keterlambatan itu.', ['They blamed the weather for the delay'], 'blame + penyebab + for + akibat.', {
      'they blamed the delay for the weather': ['blame + penyebab + for + akibat: blamed the weather for the delay.', 'reporting-pattern'],
      'they blamed the weather of the delay': ['blame ... for ...', 'reporting-pattern'],
    }, { focus: 'reporting-pattern' }),
  ],
  mastery: [
    mc(3, '"You should really try the soup," the waiter said. Pilih laporan yang tepat.', 'The waiter ___.', [
      ['recommended trying the soup', true],
      ['recommended to try the soup', 'recommend tidak langsung diikuti to. Pakai recommended trying.', 'suggest-pattern'],
      ['recommended for trying the soup', 'recommend tidak memakai for di sini.', 'suggest-pattern'],
    ], 'recommend + -ing.', { focus: 'suggest-pattern' }),
    mc(3, '"It was me. I took the last cake," said Rudi. Pilih laporan yang tepat.', 'Rudi admitted ___ the last cake.', [
      ['taking', true],
      ['to take', 'admit + -ing.', 'reporting-pattern'],
      ['that he take', 'Kalau memakai that, kata kerjanya harus lengkap: that he had taken.', 'reporting-pattern'],
    ], 'admit + -ing.', { focus: 'reporting-pattern' }),
    fill(3, 'The teacher reminded us ___ our dictionaries. (bring)', ['to bring'], 'remind + orang + to + bentuk dasar.', {
      bringing: ['remind + orang + to + bentuk dasar.', 'reporting-pattern'],
      'of bringing': ['"remind of" untuk kenangan. Untuk tugas: reminded us to bring.', 'reporting-pattern'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'reporting-pattern' }),
    tr(3, 'Saya menyarankan agar kita berangkat lebih awal.', ['I suggest that we leave earlier', 'I suggest that we should leave earlier', 'I suggest we leave earlier', 'I suggest leaving earlier', 'I suggest that we leave early', 'I suggest that we should leave early', 'I suggest we leave early', 'I suggest leaving early', 'I suggested that we leave earlier', 'I suggested that we should leave earlier', 'I suggested we leave earlier', 'I suggested leaving earlier', 'I suggested that we leave early', 'I suggested leaving early'], 'suggest that we (should) leave / suggest leaving.', {
      'i suggest us to leave earlier': ['Tidak ada pola "suggest someone to".', 'suggest-pattern'],
      'i suggest to leave earlier': ['suggest tidak diikuti to-infinitive.', 'suggest-pattern'],
    }, { focus: 'suggest-pattern' }),
    construct(3, 'they / accused / the company / of / hide / the truth', ['They accused the company of hiding the truth'], 'accuse + orang + of + -ing.', {
      'they accused the company of hide the truth': ['Setelah of, -ing: hiding.', 'reporting-pattern'],
    }, { focus: 'reporting-pattern' }),
  ],
});

export const persuasionLesson = lesson({
  id: 'c1-persuasion',
  title: 'Bahasa Persuasi',
  summary: 'Meyakinkan pembaca dengan penekanan, pertanyaan retoris, pola tiga, dan klaim yang tetap kredibel.',
  topic: 'c1.persuasion',
  objectives: [
    'Memakai do/does/did untuk penekanan (We do need your support).',
    'Memakai pertanyaan retoris dan pola tiga (tricolon).',
    'Membedakan klaim yang meyakinkan dari klaim berlebihan.',
  ],
  intro: 'Pidato, proposal, dan surat pembaca bertujuan meyakinkan. Bahasa Inggris punya alat khusus: penekanan dengan do/does/did, pertanyaan yang jawabannya sudah jelas, dan daftar tiga hal yang berirama. Tetapi persuasi yang berlebihan ("100% pasti, semua orang setuju") justru membuat pembaca curiga.',
  teaching: [
    {
      heading: 'Penekanan dengan do, does, did',
      body: 'Dalam kalimat positif, tambahkan do/does/did + bentuk dasar untuk menekankan, terutama ketika membantah anggapan orang lain.',
      examples: [
        { en: 'We do need your support.', id: 'Kami sungguh membutuhkan dukunganmu.' },
        { en: 'She did warn us about the risks.', id: 'Dia memang sudah memperingatkan kami tentang risikonya.' },
      ],
    },
    {
      heading: 'Pertanyaan retoris dan pola tiga',
      body: 'Pertanyaan retoris tidak menunggu jawaban; ia mengajak pembaca setuju. Pola tiga (tricolon) membuat kalimat mudah diingat.',
      examples: [
        { en: "Isn't it time we took action?", id: 'Bukankah sudah saatnya kita bertindak?' },
        { en: 'Together we can make our school cleaner, safer and greener.', id: 'Bersama, kita bisa membuat sekolah lebih bersih, lebih aman, dan lebih hijau.' },
      ],
    },
    {
      heading: 'Meyakinkan tetapi kredibel',
      body: 'Angka, contoh, dan modal (could, would) lebih meyakinkan daripada klaim mutlak atau serangan pada pihak lain. "Imagine if ..." dan "we" mengajak pembaca ikut membayangkan.',
      table: [
        ['Meyakinkan', 'Berlebihan'],
        ['This plan could cut costs by 20 per cent.', 'This plan will fix everything, guaranteed.'],
        ['Many parents have already signed up.', 'Everyone agrees with me.'],
      ],
    },
  ],
  demo: [
    ['We do need your support.', 'We do needed your support.', 'Setelah do/does/did penekanan, bentuk dasar.'],
    ['She did warn us about the risks.', 'She did warned us about the risks.', 'did + bentuk dasar: did warn.'],
    ['This plan could cut costs by 20 per cent.', 'This plan will cut all costs forever, guaranteed.', 'Klaim berlebihan membuat pembaca curiga; angka dan modal lebih meyakinkan.'],
  ],
  vocab: ['persuade', 'compelling'],
  guided: [
    mc(3, 'Pilih bentuk yang tepat.', 'I ___ understand your concerns, but the decision has been made.', [
      ['do', true],
      ['am', '"understand" kata kerja biasa. Penekanannya: do understand.', 'emphatic-do'],
      ['does', 'Subjek "I": do.', 'emphatic-do'],
    ], 'Penekanan: do + bentuk dasar.', { focus: 'emphatic-do' }),
    mc(3, 'Kalimat mana yang paling meyakinkan untuk proposal kepada kepala sekolah?', null, [
      ['A recycling programme could save the school around Rp5 million a year.', true],
      ['Recycling will obviously fix every problem we have.', 'Klaim mutlak tanpa bukti membuat pembaca curiga.', 'persuasion-tone'],
      ['Anyone who disagrees with recycling is stupid.', 'Menyerang pihak lain membuat proposal kehilangan dukungan.', 'persuasion-tone'],
    ], 'Angka dan modal (could) terdengar kredibel.', { focus: 'persuasion-tone' }),
    tf(3, '"Isn\'t it time we took action?" adalah pertanyaan retoris yang mengajak pembaca setuju.', true, 'Pertanyaan retoris tidak menunggu jawaban; jawabannya dianggap sudah jelas.', 'Kalimat ini memang pertanyaan retoris.', { focus: 'persuasion-tone', tag: 'persuasion-tone' }),
    fill(3, 'He ___ apologise, but nobody listened. (do)', ['did'], 'Kejadian lampau: did + bentuk dasar.', {
      does: ['Kejadian lampau (nobody listened): did.', 'emphatic-do'],
      do: ['Kejadian lampau: did.', 'emphatic-do'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'emphatic-do' }),
  ],
  independent: [
    construct(3, 'we / do / need / to act / now', ['We do need to act now'], 'Penekanan: do + bentuk dasar.', {
      'we do needs to act now': ['Setelah do, bentuk dasar: need.', 'emphatic-do'],
    }, { focus: 'emphatic-do' }),
    fix(3, "She does works hard, even if you don't see it.", ["She does work hard, even if you don't see it"], 'Setelah does, bentuk dasar: work.', undefined, { focus: 'emphatic-do' }),
    mc(3, 'Pilih kalimat penutup pidato yang memakai pola tiga (tricolon).', null, [
      ['Together we can make our school cleaner, safer and greener.', true],
      ['We can make our school cleaner.', 'Hanya satu gagasan, bukan pola tiga.', 'persuasion-tone'],
      ['Our school is clean, I think.', 'Ragu-ragu dan tanpa pola tiga.', 'persuasion-tone'],
    ], 'Tiga gagasan sejajar: cleaner, safer and greener.', { focus: 'persuasion-tone' }),
    tr(3, 'Bayangkan jika setiap siswa menanam satu pohon.', ['Imagine if every student planted a tree', 'Imagine if every student planted one tree', 'Imagine if each student planted a tree', 'Imagine if each student planted one tree', 'Imagine every student planting a tree', 'Imagine each student planting a tree', 'Imagine if every student plants a tree', 'Imagine if each student plants a tree'], 'Imagine if + past simple (pengandaian).', {
      'imagine if every student plant a tree': ['Subjek tunggal: planted (pengandaian) atau plants.'],
    }, { focus: 'persuasion-tone' }),
  ],
  homework: [
    read(3, "Dear Editor, Our city spends millions every year repairing roads damaged by trucks. Isn't it time we asked the companies that use them to pay their share? A small road fee could raise Rp20 billion a year: money for safer crossings, better lighting and more buses. We do want businesses to grow, but not at the expense of our children's safety.", 'Which technique does the writer use in "safer crossings, better lighting and more buses"?', [
      ['A list of three (tricolon)', true],
      ['A rhetorical question', 'Pertanyaan retorisnya ada di kalimat "Isn\'t it time ...?"'],
      ['Emphatic do', '"do want" ada di kalimat terakhir.'],
    ], 'Tiga hal sejajar membentuk tricolon.'),
    mc(3, 'Pilih bentuk yang tepat.', 'You may not believe it, but I ___ finish the report on time yesterday.', [
      ['did', true],
      ['do', 'Kejadian kemarin: did.', 'emphatic-do'],
      ['was', '"finish" kata kerja biasa: did finish.', 'emphatic-do'],
    ], 'Membantah anggapan tentang masa lalu: did + bentuk dasar.', { focus: 'emphatic-do' }),
    fill(3, 'I know the results were disappointing, but the team ___ work very hard. (do)', ['did'], 'Lampau: did + bentuk dasar.', {
      does: ['Hasil sudah keluar (lampau): did work.', 'emphatic-do'],
      do: ['Lampau: did work.', 'emphatic-do'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'emphatic-do' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', 'The new policy ___ make a difference: complaints have fallen by half.', [
      ['does', true],
      ['do', 'Subjek tunggal "The new policy": does.', 'emphatic-do'],
      ['is', '"make" kata kerja biasa: does make.', 'emphatic-do'],
    ], 'Penekanan untuk subjek tunggal: does + bentuk dasar.', { focus: 'emphatic-do' }),
    mc(3, 'Kalimat mana yang paling kredibel dalam surat permohonan dana?', null, [
      ['Last year, the programme helped 120 students improve their reading.', true],
      ['Our programme is the best in the whole world, without question.', 'Klaim mutlak tanpa bukti.', 'persuasion-tone'],
      ['Only a fool would refuse to fund us.', 'Merendahkan pembaca justru membuatnya menolak.', 'persuasion-tone'],
    ], 'Angka dan hasil nyata lebih meyakinkan.', { focus: 'persuasion-tone' }),
    fill(3, 'You ___ look tired. Why don\'t you go home early? (do)', ['do'], 'Subjek "you", sekarang: do.', {
      does: ['Subjek "you": do.', 'emphatic-do'],
      did: ['Sekarang terlihat lelah: do.', 'emphatic-do'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'emphatic-do' }),
    tr(3, 'Kami benar-benar menghargai bantuan Anda. (pakai do penekanan)', ['We do appreciate your help', 'We really do appreciate your help', 'We do really appreciate your help', 'We do appreciate your assistance'], 'Penekanan: do + bentuk dasar.', {
      'we do appreciated your help': ['Setelah do, bentuk dasar: appreciate.', 'emphatic-do'],
      'we are appreciate your help': ['"appreciate" kata kerja: We do appreciate.', 'emphatic-do'],
    }, { focus: 'emphatic-do' }),
    construct(3, "isn't it / time / we / start / recycling", ["Isn't it time we started recycling"], 'Setelah "it\'s time + subjek", kata kerja lampau: started.', {
      "isn't it time we start recycling": ['Setelah "time + subjek", pakai bentuk lampau: started.'],
    }, { focus: 'persuasion-tone' }),
  ],
});
