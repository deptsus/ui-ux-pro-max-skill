// B2 · Bab 3 (Rilis 5) — harapan dan penyesalan, masa depan yang lebih presisi,
// participle clauses, dan kata kerja yang berubah makna. Premium.
import { construct, dlg, fill, fix, lesson, match, mc, read, tf, tr } from './dsl';

export const wishLesson = lesson({
  id: 'b2-wish',
  title: 'Wish dan If only',
  summary: 'Menyatakan keinginan dan penyesalan tentang sekarang dan masa lalu.',
  topic: 'b2.wish',
  objectives: [
    'Memakai wish/if only + past simple untuk keadaan sekarang yang ingin diubah.',
    'Memakai wish/if only + past perfect untuk penyesalan tentang masa lalu.',
    'Memakai wish + would untuk kebiasaan orang lain yang mengganggu.',
  ],
  intro: 'Bahasa Indonesia memakai "seandainya" atau "coba saja" tanpa mengubah kata kerja: "Seandainya saya punya mobil." Bahasa Inggris mundur satu langkah ke masa lalu untuk menunjukkan bahwa keinginan itu tidak nyata: "I wish I had a car" (sekarang saya tidak punya). Untuk penyesalan tentang masa lalu, mundurnya dua langkah: "I wish I had studied."',
  teaching: [
    {
      heading: 'Keadaan sekarang: wish + past simple',
      body: 'Untuk sesuatu yang sekarang tidak benar dan ingin diubah, pakai wish atau if only + past simple. Kata kerja "be" boleh "were" untuk semua subjek (lebih formal) atau "was". "can" menjadi "could".',
      examples: [
        { en: 'I wish I had more free time.', id: 'Seandainya saya punya lebih banyak waktu luang. (Sekarang tidak punya.)' },
        { en: 'If only I could speak Japanese.', id: 'Coba saja saya bisa berbahasa Jepang.' },
        { en: 'I wish it were the weekend.', id: 'Seandainya sekarang akhir pekan.' },
      ],
    },
    {
      heading: 'Penyesalan masa lalu: wish + past perfect',
      body: 'Untuk sesuatu yang sudah terjadi (atau tidak terjadi) dan kita sesali, pakai wish atau if only + had + bentuk ketiga.',
      examples: [
        { en: 'I wish I had studied harder last year.', id: 'Seandainya tahun lalu saya belajar lebih giat.' },
        { en: "If only we hadn't missed the train.", id: 'Coba saja kami tidak ketinggalan kereta.' },
      ],
    },
    {
      heading: 'Kebiasaan orang lain: wish + would',
      body: '"wish + would" dipakai saat kita ingin orang lain (atau keadaan) berubah, sering karena kesal. Tidak dipakai untuk diri sendiri: bukan "I wish I would", melainkan "I wish I could".',
      table: [
        ['Maksud', 'Pola', 'Contoh'],
        ['Keadaan sekarang', 'wish + past simple', 'I wish I lived near the sea.'],
        ['Penyesalan masa lalu', 'wish + had + V3', 'I wish I had listened.'],
        ['Orang lain/keadaan berubah', 'wish + would + V1', 'I wish you would stop shouting.'],
      ],
    },
  ],
  demo: [
    ['I wish I had a car.', 'I wish I have a car.', 'Keadaan sekarang yang tidak nyata: wish + past simple (had).'],
    ['I wish I had listened to you.', 'I wish I listened to you yesterday.', 'Penyesalan tentang masa lalu: wish + had + bentuk ketiga.'],
    ['I wish you would stop interrupting me.', 'I wish I would stop eating sweets.', '"wish + would" untuk orang lain. Untuk diri sendiri: I wish I could stop ...'],
  ],
  vocab: ['regret', 'reliable'],
  guided: [
    mc(2, 'Saya sangat sibuk sekarang. Pilih kalimat yang tepat.', 'I wish I ___ more free time.', [
      ['had', true],
      ['have', 'Setelah wish, keadaan sekarang mundur ke past simple: had.', 'wish-tense'],
      ['will have', 'wish tidak diikuti will. Pakai past simple: had.', 'wish-tense'],
    ], 'wish + past simple untuk keadaan sekarang yang tidak nyata.', { focus: 'wish-tense' }),
    mc(2, 'Ujian minggu lalu buruk. Pilih bentuk yang tepat.', 'I wish I ___ harder for the exam.', [
      ['had studied', true],
      ['studied', 'Penyesalan tentang masa lalu butuh past perfect: had studied.', 'wish-tense'],
      ['would study', '"would" untuk orang lain yang ingin kita ubah, bukan penyesalan.', 'wish-would'],
      ['have studied', 'Present perfect tidak dipakai setelah wish. Pakai had studied.', 'wish-tense'],
    ], 'wish + had + bentuk ketiga untuk penyesalan.', { focus: 'wish-tense' }),
    tf(2, '"If only it would stop raining!" menyatakan keinginan agar keadaan berubah.', true, 'wish/if only + would dipakai untuk keadaan atau orang lain yang ingin kita ubah, misalnya hujan yang tidak berhenti.', 'Kalimat ini benar: if only + would untuk keadaan yang ingin diubah.', { focus: 'wish-would', tag: 'wish-would' }),
    fill(2, 'I wish you ___ making so much noise. (stop)', ['would stop'], 'Ingin orang lain mengubah kebiasaannya: wish + would + bentuk dasar.', {
      stop: ['Setelah "I wish you", pakai would + bentuk dasar: would stop.', 'wish-would'],
      'will stop': ['wish tidak diikuti will. Pakai would stop.', 'wish-would'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'wish-would' }),
  ],
  independent: [
    tr(3, 'Seandainya saya bisa berbicara bahasa Jepang.', ['I wish I could speak Japanese', 'If only I could speak Japanese', 'I wish I spoke Japanese', 'If only I spoke Japanese'], 'Keadaan sekarang: wish + could / past simple.', {
      'i wish i can speak japanese': ['Setelah wish, can mundur menjadi could.', 'wish-tense'],
      'i wish i would speak japanese': ['Untuk diri sendiri bukan "would", melainkan could.', 'wish-would'],
    }, { focus: 'wish-tense' }),
    construct(3, 'I / wish / had not / say / that', ['I wish I had not said that'], 'Penyesalan masa lalu: wish + had (not) + bentuk ketiga.', {
      'i wish i did not say that': ['Penyesalan masa lalu: had not said.', 'wish-tense'],
      'i wish i had not say that': ['Setelah had not, bentuk ketiga: said.', 'wish-tense'],
    }, { focus: 'wish-tense' }),
    mc(3, 'Kamu menyesal tidak datang ke pesta kemarin. Pilih kalimat yang tepat.', null, [
      ['I wish I had gone to the party.', true],
      ['I wish I went to the party yesterday.', 'Penyesalan masa lalu butuh past perfect: had gone.', 'wish-tense'],
      ['I wish I would go to the party.', '"would" tidak dipakai untuk diri sendiri dan tidak untuk penyesalan.', 'wish-would'],
      ['I wish I have gone to the party.', 'Bukan present perfect. Pakai had gone.', 'wish-tense'],
    ], 'wish + had + bentuk ketiga.', { focus: 'wish-tense' }),
    fix(3, 'I wish I would be taller.', ['I wish I were taller', 'I wish I was taller', 'If only I were taller', 'If only I was taller'], 'Keadaan sekarang tentang diri sendiri: wish + were/was, bukan would be.', undefined, { focus: 'wish-would' }),
  ],
  homework: [
    read(3, "Rudi is not happy with his job. He works long hours, and his boss keeps changing the deadlines. 'I wish my boss would plan things better,' he says. 'And I wish I had more time for my family.' Rudi also regrets one decision: three years ago he was offered a place at a university in Australia, but he said no. 'If only I had accepted that offer,' he often thinks.", 'Which sentence is about something Rudi regrets in the past?', [
      ['If only I had accepted that offer.', true],
      ['I wish my boss would plan things better.', 'Itu keinginan agar bosnya berubah (wish + would).'],
      ['I wish I had more time for my family.', 'Itu keadaan sekarang (wish + past simple).'],
    ], 'Penyesalan masa lalu memakai wish/if only + had + bentuk ketiga: "had accepted".'),
    tr(3, 'Seandainya kemarin saya tidak terlambat.', ['I wish I had not been late yesterday', 'If only I had not been late yesterday'], 'Penyesalan masa lalu: wish + had (not) been.', {
      'i wish i was not late yesterday': ['Penyesalan tentang kemarin: had not been late.', 'wish-tense'],
      'i wish i am not late yesterday': ['Setelah wish, mundur ke past perfect: had not been.', 'wish-tense'],
    }, { focus: 'wish-tense' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Your brother keeps using your laptop without asking.\nB: ___', [
      ['I know. I wish he would ask first.', true],
      ['I know. I wish he asks first.', 'Setelah wish tidak dipakai present simple. Untuk kebiasaan orang lain: would ask.', 'wish-tense'],
      ['I know. I wish he will ask first.', 'wish tidak diikuti will. Pakai would.', 'wish-would'],
    ], 'Kebiasaan orang lain yang mengganggu: wish + would.', { focus: 'wish-would' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', "If only we ___ the tickets earlier. Now they're sold out.", [
      ['had bought', true],
      ['bought', 'Penyesalan masa lalu: had bought.', 'wish-tense'],
      ['would buy', '"would" tidak dipakai untuk penyesalan masa lalu.', 'wish-would'],
      ['have bought', 'Bukan present perfect. Pakai had bought.', 'wish-tense'],
    ], 'if only + had + bentuk ketiga.', { focus: 'wish-tense' }),
    fill(3, 'I wish it ___ the weekend already. (be)', ['were', 'was'], 'Keadaan sekarang yang tidak nyata: were (formal) atau was.', {
      is: ['Setelah wish, mundur ke past simple: were/was.', 'wish-tense'],
      'will be': ['wish tidak diikuti will. Pakai were/was.', 'wish-tense'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'wish-tense' }),
    tr(3, 'Saya berharap kamu mau mendengarkan saya.', ['I wish you would listen to me', 'If only you would listen to me'], 'Ingin orang lain berubah: wish + would + bentuk dasar.', {
      'i wish you will listen to me': ['wish + would, bukan will.', 'wish-would'],
      'i wish you listen to me': ['Setelah wish, pakai would listen.', 'wish-would'],
    }, { focus: 'wish-would' }),
    construct(3, 'if only / I / know / the answer', ['If only I knew the answer'], 'Keadaan sekarang yang tidak nyata: past simple (knew).', {
      'if only i know the answer': ['Setelah if only, keadaan sekarang mundur ke past simple: knew.', 'wish-tense'],
    }, { focus: 'wish-tense' }),
    fix(3, "I wish I didn't eat so much last night.", ['I wish I had not eaten so much last night', 'If only I had not eaten so much last night'], 'Penyesalan tentang semalam: had not eaten.', undefined, { focus: 'wish-tense' }),
  ],
});

export const futurePerfectLesson = lesson({
  id: 'b2-future-perfect',
  title: 'Future Continuous dan Future Perfect',
  summary: 'Membicarakan kegiatan yang sedang berlangsung atau sudah selesai pada titik waktu tertentu di masa depan.',
  topic: 'b2.future-perfect',
  objectives: [
    'Memakai will be + -ing untuk kegiatan yang sedang berlangsung pada waktu tertentu di masa depan.',
    'Memakai will have + bentuk ketiga untuk sesuatu yang sudah selesai sebelum titik waktu di masa depan.',
    'Mengenali penanda waktu: at this time tomorrow, by Friday, by the time ...',
  ],
  intro: 'Bahasa Indonesia cukup memakai "sedang" dan "sudah": "Besok jam 8 saya sedang di jalan", "Hari Jumat laporannya sudah selesai". Bahasa Inggris punya bentuk khusus untuk keduanya: future continuous (will be + -ing) dan future perfect (will have + bentuk ketiga).',
  teaching: [
    {
      heading: 'Future continuous: will be + -ing',
      body: 'Untuk kegiatan yang sedang berlangsung pada titik waktu tertentu di masa depan. Penanda: at 8 tonight, this time tomorrow, this time next week.',
      examples: [
        { en: "This time tomorrow, I'll be flying to Bali.", id: 'Besok jam segini saya sedang terbang ke Bali.' },
        { en: "Don't call at 9. We'll be having dinner.", id: 'Jangan menelepon jam 9. Kami sedang makan malam.' },
      ],
    },
    {
      heading: 'Future perfect: will have + bentuk ketiga',
      body: 'Untuk sesuatu yang sudah selesai sebelum titik waktu di masa depan. Penanda: by Friday, by 2030, by the time + present simple.',
      examples: [
        { en: 'By Friday, I will have finished the report.', id: 'Hari Jumat (paling lambat), laporannya sudah saya selesaikan.' },
        { en: 'By the time you arrive, the film will have started.', id: 'Saat kamu tiba, filmnya sudah dimulai.' },
      ],
    },
    {
      heading: 'Memilih yang tepat',
      body: '"by" berarti paling lambat, jadi biasanya memakai future perfect. "at/this time" menunjuk satu titik, jadi biasanya future continuous. Setelah "by the time" dan "when", kata kerjanya simple present, bukan will.',
      table: [
        ['Penanda', 'Bentuk', 'Contoh'],
        ['at 8 tonight', 'will be + -ing', "I'll be studying at 8 tonight."],
        ['by 8 tonight', 'will have + V3', "I'll have finished by 8 tonight."],
        ['by the time + present', 'will have + V3', 'By the time she calls, I will have left.'],
      ],
    },
  ],
  demo: [
    ['By Friday, I will have finished the report.', 'By Friday, I will finished the report.', '"By Friday" = selesai sebelum Jumat: will have + bentuk ketiga.'],
    ["At 9 tonight, we'll be watching the match.", 'At 9 tonight, we will watching the match.', 'Future continuous butuh "be": will be watching.'],
    ['She will have left by the time you arrive.', 'She will have left by the time you will arrive.', 'Setelah "by the time", pakai present simple: you arrive.'],
  ],
  vocab: ['deadline', 'schedule'],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', 'By the end of this year, I ___ 100 English lessons.', [
      ['will have completed', true],
      ['will complete', '"By the end of this year" menekankan selesai sebelum titik itu: will have completed.', 'future-time-choice'],
      ['will be completing', 'Bentuk -ing untuk kegiatan yang sedang berlangsung, bukan yang sudah selesai.', 'future-time-choice'],
      ['completed', 'Ini tentang masa depan, bukan masa lalu.'],
    ], 'by + waktu → will have + bentuk ketiga.', { focus: 'future-time-choice' }),
    mc(2, 'Pilih bentuk yang tepat.', "Don't call me at 8. I ___ dinner then.", [
      ['will be having', true],
      ['will have had', 'Pada jam 8 makan malamnya sedang berlangsung, bukan sudah selesai.', 'future-time-choice'],
      ['have', 'Kegiatan yang sedang berlangsung pada waktu tertentu di masa depan: will be having.', 'future-time-choice'],
    ], 'at + waktu → will be + -ing.', { focus: 'future-time-choice' }),
    fill(2, 'By the time you get home, I ___ dinner. (cook)', ['will have cooked'], 'Selesai sebelum kamu pulang: will have cooked.', {
      'will cook': ['"By the time" = sudah selesai sebelumnya: will have cooked.', 'future-time-choice'],
      'will have cook': ['Setelah will have, bentuk ketiga: cooked.', 'future-perfect-form'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'future-perfect-form' }),
    tf(2, '"This time next week I will be lying on a beach" menggambarkan kegiatan yang sedang berlangsung pada waktu tertentu di masa depan.', true, '"This time next week" menunjuk satu titik waktu, dan "will be lying" adalah future continuous.', 'Kalimat ini benar.', { focus: 'future-time-choice', tag: 'future-time-choice' }),
  ],
  independent: [
    construct(3, 'by next June / we / will have / move / to Surabaya', ['By next June we will have moved to Surabaya', 'We will have moved to Surabaya by next June'], 'will have + bentuk ketiga: moved.', {
      'by next june we will have move to surabaya': ['Setelah will have, bentuk ketiga: moved.', 'future-perfect-form'],
      'by next june we will move to surabaya': ['"By next June" = sudah pindah sebelumnya: will have moved.', 'future-time-choice'],
    }, { focus: 'future-perfect-form' }),
    fix(3, 'By tomorrow I will have finish the essay.', ['By tomorrow I will have finished the essay', 'I will have finished the essay by tomorrow'], 'Setelah will have, bentuk ketiga: finished.', undefined, { focus: 'future-perfect-form' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Can I call you at 7 this evening?\nB: ___', [
      ["Better not. I'll be driving home then.", true],
      ["Better not. I'll have driven home then.", 'Pada jam 7 kamu sedang menyetir, jadi future continuous: will be driving.', 'future-time-choice'],
      ['Better not. I drive home then.', 'Kegiatan yang sedang berlangsung pada jam itu: will be driving.', 'future-time-choice'],
    ], 'at + waktu → will be + -ing.', { focus: 'future-time-choice' }),
    tr(3, 'Pada tahun 2030 saya sudah lulus kuliah.', ['By 2030 I will have graduated from university', 'By 2030 I will have graduated', 'By 2030 I will have finished university', 'I will have graduated from university by 2030', 'I will have graduated by 2030', 'I will have finished university by 2030', 'By 2030 I will have graduated from college', 'I will have graduated from college by 2030'], '"sudah ... pada (paling lambat) tahun 2030": by 2030 + will have + bentuk ketiga.', {
      'by 2030 i will graduate from university': ['"sudah lulus" sebelum 2030: will have graduated.', 'future-time-choice'],
      'in 2030 i will graduate from university': ['"Pada tahun 2030 sudah" = by 2030 + will have graduated.', 'future-time-choice'],
    }, { focus: 'future-time-choice' }),
  ],
  homework: [
    read(3, "Maya is planning a busy week. On Monday at nine she will be presenting her project to the board. By Wednesday she will have finished the budget, and on Thursday she will be travelling to Medan for a conference. 'By the time I get back on Saturday,' she says, 'I will have spent almost twenty hours on planes and in meetings.'", 'What will Maya be doing on Thursday?', [
      ['Travelling to Medan', true],
      ['Presenting her project', 'Itu hari Senin pukul sembilan.'],
      ['Finishing the budget', 'Anggaran sudah selesai paling lambat hari Rabu.'],
    ], '"on Thursday she will be travelling to Medan".'),
    tr(3, 'Saat kamu tiba, filmnya sudah dimulai.', ['When you arrive the film will have started', 'By the time you arrive the film will have started', 'When you arrive the movie will have started', 'By the time you arrive the movie will have started'], 'Sudah dimulai sebelum kamu tiba: will have started. Setelah when/by the time: present simple.', {
      'when you arrive the film will start': ['Filmnya sudah dimulai sebelum kamu tiba: will have started.', 'future-time-choice'],
      'when you will arrive the film will have started': ['Setelah when, pakai present simple: when you arrive.'],
    }, { focus: 'future-time-choice' }),
    fill(3, 'This time next month, they ___ around Japan. (travel)', ['will be travelling', 'will be traveling'], 'Sedang berlangsung pada titik waktu itu: will be travelling.', {
      'will have travelled': ['"This time next month" = sedang berlangsung, bukan sudah selesai.', 'future-time-choice'],
      'will travel': ['Untuk kegiatan yang sedang berlangsung pada saat itu: will be travelling.', 'future-time-choice'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'future-time-choice' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', 'By the time the guests arrive, we ___ the house.', [
      ['will have cleaned', true],
      ['will be cleaning', 'Rumahnya sudah bersih sebelum tamu datang: will have cleaned.', 'future-time-choice'],
      ['will clean', '"By the time" = sudah selesai lebih dulu: will have cleaned.', 'future-time-choice'],
      ['have cleaned', 'Ini tentang masa depan: will have cleaned.'],
    ], 'by the time + present simple, will have + bentuk ketiga.', { focus: 'future-time-choice' }),
    fill(3, "Please don't phone after 10. I ___. (sleep)", ['will be sleeping'], 'Sedang berlangsung setelah jam 10: will be sleeping.', {
      'will have slept': ['Pada jam itu kamu sedang tidur, bukan sudah selesai tidur.', 'future-time-choice'],
      'will sleep': ['Untuk keadaan yang sedang berlangsung pada saat itu: will be sleeping.', 'future-time-choice'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'future-time-choice' }),
    construct(3, 'by Friday / the builders / will have / finish / the roof', ['By Friday the builders will have finished the roof', 'The builders will have finished the roof by Friday'], 'will have + bentuk ketiga: finished.', {
      'by friday the builders will have finish the roof': ['Setelah will have, bentuk ketiga: finished.', 'future-perfect-form'],
    }, { focus: 'future-perfect-form' }),
    fix(3, 'This time tomorrow I will be fly to Bali.', ['This time tomorrow I will be flying to Bali', 'I will be flying to Bali this time tomorrow'], 'Future continuous: will be + -ing.', undefined, { focus: 'future-perfect-form' }),
    tr(3, 'Besok jam 10 saya sedang rapat.', ['At 10 tomorrow I will be in a meeting', 'At 10 tomorrow I will be having a meeting', 'Tomorrow at 10 I will be in a meeting', 'Tomorrow at 10 I will be having a meeting', 'I will be in a meeting at 10 tomorrow', 'I will be having a meeting at 10 tomorrow', "At ten tomorrow I will be in a meeting", "I will be in a meeting at ten tomorrow"], 'Sedang berlangsung pada waktu tertentu di masa depan: will be + -ing / will be in.', {
      'at 10 tomorrow i will have a meeting': ['"sedang rapat" pada jam itu: will be having a meeting / will be in a meeting.', 'future-time-choice'],
      'at 10 tomorrow i will have had a meeting': ['Rapatnya sedang berlangsung, bukan sudah selesai.', 'future-time-choice'],
    }, { focus: 'future-time-choice' }),
  ],
});

export const participleLesson = lesson({
  id: 'b2-participle',
  title: 'Participle Clauses',
  summary: 'Meringkas kalimat dengan -ing, bentuk ketiga, dan having + bentuk ketiga.',
  topic: 'b2.participle',
  objectives: [
    'Memakai klausa -ing untuk makna aktif (Feeling tired, she ...).',
    'Memakai klausa bentuk ketiga untuk makna pasif (Built in 1890, the bridge ...).',
    'Memastikan subjek kalimat utama adalah pelaku klausa participle.',
  ],
  intro: 'Tulisan formal dan berita sering meringkas dua kalimat menjadi satu: "Because she felt tired, she went to bed" menjadi "Feeling tired, she went to bed". Yang perlu dijaga ada dua: bentuknya (aktif -ing atau pasif -ed) dan subjeknya. Kalimat "Walking home, the rain started" terdengar seolah hujan yang berjalan pulang.',
  teaching: [
    {
      heading: 'Aktif: -ing',
      body: 'Klausa -ing menggantikan klausa aktif (karena, saat, sambil). Subjeknya sama dengan subjek kalimat utama.',
      examples: [
        { en: 'Feeling tired, Rina went to bed early.', id: 'Karena merasa lelah, Rina tidur lebih awal.' },
        { en: 'The man standing at the door is my uncle.', id: 'Pria yang berdiri di pintu itu paman saya.' },
      ],
    },
    {
      heading: 'Pasif: bentuk ketiga, dan having + bentuk ketiga',
      body: 'Klausa bentuk ketiga (built, written, invited) bermakna pasif. "Having + bentuk ketiga" menunjukkan kejadian yang selesai lebih dulu.',
      examples: [
        { en: 'Built in 1890, the bridge is still in use.', id: 'Dibangun pada 1890, jembatan itu masih dipakai.' },
        { en: 'Having finished her homework, Sari went out.', id: 'Setelah menyelesaikan PR-nya, Sari keluar.' },
      ],
    },
    {
      heading: 'Subjek harus cocok',
      body: 'Pelaku klausa participle adalah subjek kalimat utama. Kalau tidak cocok, kalimatnya keliru (dangling participle). Untuk negatif, letakkan "not" di depan: Not knowing the way, we ...',
      table: [
        ['Benar', 'Salah', 'Kenapa'],
        ['Walking home, I saw an accident.', 'Walking home, an accident happened.', 'Kecelakaan tidak berjalan pulang.'],
        ['Not knowing the way, we used a map.', "Don't knowing the way, we used a map.", 'Negatif: not + -ing.'],
      ],
    },
  ],
  demo: [
    ['Feeling tired, Rina went to bed early.', 'Felt tired, Rina went to bed early.', 'Rina merasa lelah (aktif): -ing.'],
    ['Built in 1890, the bridge is still in use.', 'Building in 1890, the bridge is still in use.', 'Jembatan dibangun (pasif): bentuk ketiga.'],
    ['Walking home, I saw an accident.', 'Walking home, an accident happened.', 'Subjek kalimat utama harus yang berjalan pulang.'],
  ],
  vocab: ['founded', 'concise'],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', '___ in 1995, the school now has 2,000 students.', [
      ['Founded', true],
      ['Founding', 'Sekolah didirikan (pasif), jadi bentuk ketiga: Founded.', 'participle-active-passive'],
      ['Having founded', 'Bentuk aktif: seolah sekolah yang mendirikan sesuatu.', 'participle-active-passive'],
    ], 'Makna pasif → bentuk ketiga.', { focus: 'participle-active-passive' }),
    mc(2, 'Pilih kalimat yang subjeknya tepat.', null, [
      ['Looking out of the window, I noticed the rain had stopped.', true],
      ['Looking out of the window, the rain had stopped.', 'Hujan tidak melihat ke luar jendela. Subjek harus "I".', 'participle-subject'],
      ['Looked out of the window, I noticed the rain had stopped.', 'Makna aktif: Looking.', 'participle-active-passive'],
    ], 'Pelaku klausa participle = subjek kalimat utama.', { focus: 'participle-subject' }),
    fill(2, '___ finished her homework, Sari went out to play. (have)', ['Having'], 'Selesai lebih dulu: Having + bentuk ketiga.', {
      had: ['Klausa participle tidak memakai bentuk lampau: Having finished.', 'participle-active-passive'],
      have: ['Bentuk -ing: Having finished.', 'participle-active-passive'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'participle-active-passive' }),
    match(2, 'Pasangkan klausa dengan artinya.', [
      ['Feeling hungry, ...', 'Karena merasa lapar, ...'],
      ['Written in 1925, ...', 'Yang ditulis pada 1925, ...'],
      ['Having eaten, ...', 'Setelah makan, ...'],
      ['Not knowing the way, ...', 'Karena tidak tahu jalan, ...'],
    ], '-ing aktif, bentuk ketiga pasif, having + bentuk ketiga untuk yang lebih dulu.', { focus: 'participle-active-passive' }),
  ],
  independent: [
    construct(3, 'feel / nervous / she / call / her mother', ['Feeling nervous she called her mother'], 'Klausa aktif: Feeling nervous, lalu kalimat utama lampau.', {
      'felt nervous she called her mother': ['Klausa participle aktif memakai -ing: Feeling.', 'participle-active-passive'],
      'feeling nervous she call her mother': ['Kata kerja utama tetap lampau: called.'],
    }, { focus: 'participle-active-passive' }),
    tr(3, 'Karena tidak punya uang, Budi tinggal di rumah. (pakai participle clause)', ['Not having any money, Budi stayed at home', 'Not having money, Budi stayed at home', 'Having no money, Budi stayed at home', 'Not having any money, Budi stayed home', 'Not having money, Budi stayed home', 'Having no money, Budi stayed home'], 'Negatif: Not having ..., atau Having no ...', {
      'not have any money budi stayed at home': ['Participle clause memakai -ing: Not having.', 'participle-active-passive'],
      'because budi did not have any money he stayed at home': ['Kalimatnya benar, tetapi soal meminta participle clause: Not having any money, Budi ...'],
    }, { focus: 'participle-active-passive' }),
    mc(3, 'Kenapa kalimat "Written in English, I could not read the letter." salah?', null, [
      ['Subjek "I" bukan yang ditulis dalam bahasa Inggris.', true],
      ['Seharusnya "Writing in English".', 'Suratnya ditulis (pasif), jadi "Written" sudah benar. Masalahnya subjek.', 'participle-active-passive'],
      ['Klausa participle tidak boleh di awal kalimat.', 'Klausa participle justru sering di awal kalimat.'],
    ], 'Perbaikan: Written in English, the letter was hard for me to read.', { focus: 'participle-subject' }),
    fill(3, 'The man ___ next to the door is my uncle. (stand)', ['standing'], 'Pria yang berdiri (aktif): standing.', {
      stood: ['Makna aktif: standing.', 'participle-active-passive'],
      'who standing': ['Pakai "who is standing" atau cukup "standing".', 'participle-active-passive'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'participle-active-passive' }),
  ],
  homework: [
    read(3, 'Opened in 1928, the Braga cinema was once the most famous in Bandung. Having closed in the 1990s, it stood empty for years. Now, restored by a local foundation, it shows old Indonesian films every weekend. Visitors arriving early can join a short tour, learning how films were shown before the digital age.', 'What does "restored by a local foundation" tell us?', [
      ['The foundation repaired the cinema.', true],
      ['The cinema repaired the foundation.', 'Bentuk ketiga "restored" pasif: bioskopnya yang diperbaiki.'],
      ['The foundation is going to repair it.', 'Bentuk ketiga di sini menyatakan sesuatu yang sudah dilakukan, bukan rencana.'],
    ], '"restored by a local foundation" = which was restored by a local foundation.'),
    fill(3, 'Most of the people ___ to the party were students. (invite)', ['invited'], 'Orang-orang diundang (pasif): invited.', {
      inviting: ['Mereka yang diundang, bukan yang mengundang: invited.', 'participle-active-passive'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'participle-active-passive' }),
    construct(3, 'having / lose / his keys / Andi / call / a locksmith', ['Having lost his keys Andi called a locksmith'], 'Having + bentuk ketiga untuk kejadian yang lebih dulu.', {
      'having lose his keys andi called a locksmith': ['Having + bentuk ketiga: lost.', 'participle-active-passive'],
    }, { focus: 'participle-active-passive' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', '___ by the noise, the baby started to cry.', [
      ['Woken', true],
      ['Waking', 'Bayi dibangunkan oleh suara (pasif): Woken.', 'participle-active-passive'],
      ['Woke', 'Bentuk lampau biasa tidak dipakai untuk memulai klausa ini.', 'participle-active-passive'],
    ], 'Makna pasif → bentuk ketiga.', { focus: 'participle-active-passive' }),
    mc(3, 'Pilih kalimat yang benar.', null, [
      ['Arriving late, we missed the start of the film.', true],
      ['Arriving late, the film had already started.', 'Film tidak datang terlambat. Subjek harus "we".', 'participle-subject'],
      ['Arrived late, we missed the start of the film.', 'Makna aktif: Arriving.', 'participle-active-passive'],
    ], 'Pelaku klausa participle = subjek kalimat utama.', { focus: 'participle-subject' }),
    fill(3, '___ to wake anyone, I closed the door quietly. (not / want)', ['Not wanting'], 'Negatif: Not + -ing.', {
      'not wanted': ['Makna aktif: Not wanting.', 'participle-active-passive'],
      "don't wanting": ['Negatif participle cukup "not": Not wanting.', 'participle-active-passive'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'participle-active-passive' }),
    construct(3, 'the books / leave / on the table / belong / to Mrs Rina', ['The books left on the table belong to Mrs Rina'], 'Buku yang ditinggalkan (pasif): left.', {
      'the books leaving on the table belong to mrs rina': ['Buku ditinggalkan (pasif): left.', 'participle-active-passive'],
    }, { focus: 'participle-active-passive' }),
    tr(3, 'Setelah menyelesaikan laporan, Dina pulang. (pakai Having)', ['Having finished the report, Dina went home', 'Having completed the report, Dina went home', 'Having finished the report, Dina went back home', 'Having completed the report, Dina went back home'], 'Having + bentuk ketiga, lalu kalimat utama lampau.', {
      'having finish the report dina went home': ['Having + bentuk ketiga: finished.', 'participle-active-passive'],
      'having finished the report dina go home': ['Kata kerja utama tetap lampau: went.'],
    }, { focus: 'participle-active-passive' }),
  ],
});

export const verbPatternsLesson = lesson({
  id: 'b2-verb-patterns',
  title: 'Stop, Remember, Try: -ing atau to?',
  summary: 'Kata kerja yang berubah makna tergantung diikuti -ing atau to + bentuk dasar.',
  topic: 'b2.verb-patterns',
  objectives: [
    'Membedakan stop doing (berhenti) dan stop to do (berhenti sejenak untuk).',
    'Membedakan remember/forget doing (kenangan) dan remember/forget to do (tugas).',
    'Membedakan try doing (mencoba sebagai percobaan) dan try to do (berusaha).',
  ],
  intro: 'Di B1 kamu belajar bahwa sebagian kata kerja diikuti -ing dan sebagian diikuti to. Beberapa kata kerja bisa diikuti keduanya, tetapi maknanya berubah. "I stopped smoking" berarti berhenti merokok, sedangkan "I stopped to smoke" berarti berhenti (dari kegiatan lain) supaya bisa merokok.',
  teaching: [
    {
      heading: 'stop',
      body: 'stop + -ing = berhenti melakukan sesuatu. stop + to + bentuk dasar = berhenti sejenak dari kegiatan lain untuk melakukan sesuatu.',
      examples: [
        { en: 'I stopped drinking coffee last year.', id: 'Saya berhenti minum kopi tahun lalu.' },
        { en: 'On the way home, we stopped to buy some fruit.', id: 'Dalam perjalanan pulang, kami berhenti untuk membeli buah.' },
      ],
    },
    {
      heading: 'remember dan forget',
      body: '+ -ing = mengingat (atau melupakan) sesuatu yang sudah terjadi. + to = ingat (atau lupa) melakukan tugas.',
      examples: [
        { en: 'I remember meeting her at a wedding.', id: 'Saya ingat pernah bertemu dia di sebuah pernikahan.' },
        { en: 'Remember to lock the door.', id: 'Ingat untuk mengunci pintu.' },
        { en: "I'll never forget seeing the sea for the first time.", id: 'Saya tidak akan lupa saat pertama kali melihat laut.' },
      ],
    },
    {
      heading: 'try',
      body: 'try + to = berusaha melakukan sesuatu yang sulit. try + -ing = mencoba sesuatu sebagai percobaan untuk melihat apakah berhasil.',
      table: [
        ['Pola', 'Makna', 'Contoh'],
        ['try to + V1', 'berusaha (sulit)', 'I tried to lift the box, but it was too heavy.'],
        ['try + -ing', 'mencoba sebagai cara', "The room was hot, so I tried opening the window."],
      ],
    },
  ],
  demo: [
    ['I stopped smoking two years ago.', 'I stopped to smoke two years ago.', '"stopped to smoke" berarti berhenti dari kegiatan lain supaya bisa merokok.'],
    ['Remember to lock the door when you leave.', 'Remember locking the door when you leave.', 'Tugas yang harus dilakukan nanti: remember + to.'],
    ['I remember meeting her at a wedding.', 'I remember to meet her at a wedding.', 'Kenangan tentang kejadian lampau: remember + -ing.'],
  ],
  vocab: ['regret', 'habit'],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', "Don't forget ___ the lights when you go out.", [
      ['to turn off', true],
      ['turning off', '"forget + -ing" berarti lupa pernah melakukan. Untuk tugas: forget to turn off.', 'remember-forget-pattern'],
      ['turn off', 'Setelah forget, pakai to + bentuk dasar untuk tugas.', 'remember-forget-pattern'],
    ], 'Tugas: forget/remember + to.', { focus: 'remember-forget-pattern' }),
    mc(2, 'Pilih bentuk yang tepat.', 'We were tired, so we stopped ___ a coffee.', [
      ['to have', true],
      ['having', '"stopped having a coffee" berarti berhenti minum kopi. Di sini mereka berhenti sejenak untuk minum.', 'stop-try-pattern'],
      ['have', 'Setelah stop, pakai to + bentuk dasar untuk tujuan.', 'stop-try-pattern'],
    ], 'Berhenti sejenak untuk: stop + to.', { focus: 'stop-try-pattern' }),
    match(2, 'Pasangkan ungkapan dengan artinya.', [
      ['stop smoking', 'berhenti merokok'],
      ['stop to smoke', 'berhenti sejenak untuk merokok'],
      ['remember to call', 'ingat untuk menelepon'],
      ['remember calling', 'ingat pernah menelepon'],
    ], '-ing dan to mengubah makna stop dan remember.', { focus: 'stop-try-pattern' }),
    tf(2, '"I tried opening the window" berarti saya mencoba membuka jendela sebagai cara untuk mengatasi masalah, misalnya ruangan yang panas.', true, 'try + -ing = mencoba sebuah cara untuk melihat apakah berhasil.', 'Kalimat ini benar.', { focus: 'stop-try-pattern', tag: 'stop-try-pattern' }),
  ],
  independent: [
    fill(3, "I'll never forget ___ the sea for the first time. (see)", ['seeing'], 'Kenangan: forget + -ing.', {
      'to see': ['"forget to see" berarti lupa untuk melihat. Untuk kenangan: forget seeing.', 'remember-forget-pattern'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'remember-forget-pattern' }),
    mc(3, 'Pilih bentuk yang tepat.', 'The room was really hot, so I tried ___ the window. It helped a little.', [
      ['opening', true],
      ['to open', '"tried to open" berarti berusaha keras (mungkin gagal). Di sini jendela dibuka sebagai cara mengatasi panas.', 'stop-try-pattern'],
      ['open', 'Setelah try pakai -ing atau to.', 'stop-try-pattern'],
    ], 'Mencoba sebuah cara: try + -ing.', { focus: 'stop-try-pattern' }),
    construct(3, 'please / remember / to / send / the email', ['Please remember to send the email'], 'Tugas: remember + to.', {
      'please remember sending the email': ['Untuk tugas yang harus dilakukan: remember to send.', 'remember-forget-pattern'],
    }, { focus: 'remember-forget-pattern' }),
    tr(3, 'Saya ingat pernah bertemu dia di Bali.', ['I remember meeting him in Bali', 'I remember meeting her in Bali', 'I remember having met him in Bali', 'I remember having met her in Bali'], 'Kenangan: remember + -ing.', {
      'i remember to meet him in bali': ['"remember to meet" berarti ingat untuk bertemu (tugas). Untuk kenangan: remember meeting.', 'remember-forget-pattern'],
      'i remember to meet her in bali': ['"remember to meet" berarti ingat untuk bertemu (tugas). Untuk kenangan: remember meeting.', 'remember-forget-pattern'],
    }, { focus: 'remember-forget-pattern' }),
  ],
  homework: [
    read(3, "Last month Andi decided to stop eating fast food. The first week was hard. Every evening on the way home he stopped to look at the burger shop, and he tried to think about something else. Then he tried cooking simple meals himself, and it worked. 'I still remember buying my first frying pan,' he laughs. 'Now I just need to remember to buy vegetables.'", 'What did Andi stop doing?', [
      ['Eating fast food', true],
      ['Looking at the burger shop', 'Ia berhenti sejenak "to look" (untuk melihat) toko burger, bukan berhenti melakukannya.'],
      ['Cooking simple meals', 'Memasak sendiri justru cara yang ia coba dan berhasil.'],
    ], '"decided to stop eating fast food" = berhenti makan makanan cepat saji.'),
    mc(3, 'Pilih bentuk yang tepat.', 'My phone kept ringing during the lesson, so the teacher asked me to stop ___ it.', [
      ['using', true],
      ['to use', '"stop to use" berarti berhenti sejenak untuk memakainya. Guru ingin kamu berhenti memakainya.', 'stop-try-pattern'],
      ['use', 'Setelah stop pakai -ing untuk berhenti melakukan.', 'stop-try-pattern'],
    ], 'Berhenti melakukan: stop + -ing.', { focus: 'stop-try-pattern' }),
    fix(3, 'Please stop to talk and listen.', ['Please stop talking and listen'], 'Berhenti melakukan sesuatu: stop + -ing.', undefined, { focus: 'stop-try-pattern' }),
  ],
  mastery: [
    mc(3, 'Pilih bentuk yang tepat.', 'I clearly remember ___ the gas off, so the kitchen is safe.', [
      ['turning', true],
      ['to turn', '"remember to turn" untuk tugas yang belum dilakukan. Di sini kamu ingat sudah melakukannya.', 'remember-forget-pattern'],
      ['turn', 'Setelah remember pakai -ing atau to.', 'remember-forget-pattern'],
    ], 'Ingat sudah melakukan: remember + -ing.', { focus: 'remember-forget-pattern' }),
    fill(3, 'On the way to Bandung, we stopped ___ some snacks. (buy)', ['to buy'], 'Berhenti sejenak untuk membeli: stopped to buy.', {
      buying: ['"stopped buying" berarti berhenti membeli. Di sini mereka berhenti untuk membeli.', 'stop-try-pattern'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'stop-try-pattern' }),
    mc(3, 'Pilih bentuk yang tepat.', 'She tried ___ the jar, but the lid was stuck.', [
      ['to open', true],
      ['opening', '"tried opening" = mencoba sebagai cara. Di sini ia berusaha keras tetapi gagal: tried to open.', 'stop-try-pattern'],
      ['open', 'Setelah try pakai to atau -ing.', 'stop-try-pattern'],
    ], 'Berusaha melakukan yang sulit: try + to.', { focus: 'stop-try-pattern' }),
    tr(3, 'Jangan lupa membawa paspor.', ["Don't forget to bring your passport", "Don't forget to take your passport", 'Remember to bring your passport', 'Remember to take your passport', "Don't forget your passport"], 'Tugas: forget/remember + to.', {
      "don't forget bringing your passport": ['Untuk tugas yang harus dilakukan: forget to bring.', 'remember-forget-pattern'],
    }, { focus: 'remember-forget-pattern' }),
    construct(3, 'you / should / stop / eat / so much sugar', ['You should stop eating so much sugar'], 'Berhenti melakukan: stop + -ing.', {
      'you should stop to eat so much sugar': ['"stop to eat" = berhenti untuk makan. Maksudnya berhenti makan: stop eating.', 'stop-try-pattern'],
    }, { focus: 'stop-try-pattern' }),
  ],
});
