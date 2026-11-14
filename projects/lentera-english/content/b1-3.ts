// B1 · Bab 3 (Rilis 2) — kebiasaan lama, pola kata kerja, question tags, too dan enough. Premium.
import { construct, dlg, fill, fix, lesson, match, mc, read, tf, tr } from './dsl';

export const usedToLesson = lesson({
  id: 'b1-used-to',
  title: 'Used to: Kebiasaan di Masa Lalu',
  summary: 'Menceritakan kebiasaan dan keadaan masa lalu yang sekarang sudah tidak berlaku.',
  topic: 'b1.used-to',
  objectives: [
    'Memakai used to + bentuk dasar untuk kebiasaan atau keadaan masa lalu yang sudah berubah.',
    "Membentuk negatif dan pertanyaan: didn't use to, Did you use to ...?",
    'Membedakan used to (dulu) dengan usually (kebiasaan sekarang).',
  ],
  intro: 'Bahasa Indonesia memakai kata "dulu": "Dulu saya tinggal di desa." Bahasa Inggris punya bentuk khusus untuk ini, yaitu "used to". Bentuk ini sekaligus memberi tahu bahwa hal itu sudah tidak terjadi lagi sekarang. Ada satu jebakan ejaan: di kalimat negatif dan pertanyaan, "used" kembali menjadi "use".',
  teaching: [
    {
      heading: 'Used to + bentuk dasar',
      body: 'Pola: subjek + used to + bentuk dasar, sama untuk semua subjek. Dipakai untuk kebiasaan (I used to play football) dan keadaan (There used to be a cinema here) di masa lalu yang sekarang sudah berubah.',
      examples: [
        { en: 'I used to live in a village.', id: 'Dulu saya tinggal di desa.' },
        { en: 'There used to be a cinema on this street.', id: 'Dulu ada bioskop di jalan ini.' },
      ],
    },
    {
      heading: 'Negatif dan pertanyaan: use to',
      body: 'Setelah did atau didn\'t, kata kerja kembali ke bentuk dasar, jadi "used" menjadi "use".',
      table: [
        ['Bentuk', 'Pola', 'Contoh'],
        ['Positif', 'used to', 'She used to smoke.'],
        ['Negatif', "didn't use to", "She didn't use to smoke."],
        ['Pertanyaan', 'Did ... use to ...?', 'Did she use to smoke?'],
      ],
    },
    {
      heading: 'Dulu atau sekarang?',
      body: '"used to" hanya untuk masa lalu. Untuk kebiasaan sekarang pakai simple present, sering dengan usually: "I usually walk to work", bukan "I use to walk to work". Untuk kejadian yang hanya terjadi sekali, pakai simple past.',
      examples: [
        { en: 'I used to drink a lot of coffee, but now I usually drink tea.', id: 'Dulu saya banyak minum kopi, tetapi sekarang saya biasanya minum teh.' },
      ],
    },
  ],
  demo: [
    ['I used to play the piano.', 'I used to playing the piano.', 'Setelah "used to", bentuk dasar: play.'],
    ["We didn't use to have a car.", "We didn't used to have a car.", 'Setelah "didn\'t", pakai "use to" (tanpa -d).'],
    ['I usually get up at six.', 'I use to get up at six.', 'Kebiasaan sekarang memakai simple present (usually), bukan "use to".'],
  ],
  vocab: ['childhood', 'nowadays', 'village'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ['My grandfather used to work on a farm.', true],
      ['My grandfather used to working on a farm.', 'Setelah used to, bentuk dasar: work.', 'used-to-form'],
      ['My grandfather use to work on a farm.', 'Kalimat positif memakai "used to" (dengan -d).', 'used-to-form'],
      ['My grandfather was used to work on a farm.', '"was used to" artinya lain (terbiasa). Untuk "dulu" pakai "used to".', 'used-to-form'],
    ], 'used to + bentuk dasar.', { focus: 'used-to-form' }),
    match(1, 'Pasangkan ungkapan dengan artinya.', [
      ['used to', 'dulu (sekarang tidak lagi)'],
      ['usually', 'biasanya (sekarang)'],
      ["didn't use to", 'dulu tidak'],
      ['nowadays', 'zaman sekarang'],
    ], 'used to untuk dulu; usually dan nowadays untuk sekarang.', { focus: 'used-to-now' }),
    fill(1, "I didn't ___ like vegetables, but now I love them. (use to / used to)", ['use to'], "Setelah didn't, pakai use to.", {
      'used to': ['Setelah "didn\'t", tanpa -d: use to.', 'used-to-form'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'used-to-form' }),
    tf(1, 'Kalimat "I use to walk to work every day." menyatakan kebiasaan sekarang dengan benar.', false, 'Kebiasaan sekarang: I usually walk to work every day. "used to" hanya untuk masa lalu.', '"use to" bukan cara menyatakan kebiasaan sekarang.', { focus: 'used-to-now', tag: 'used-to-now' }),
  ],
  independent: [
    tr(2, 'Dulu saya tinggal di Medan.', ['I used to live in Medan', 'I lived in Medan'], '"Dulu" untuk hal yang sudah berubah: used to + bentuk dasar.', {
      'i use to live in medan': ['Kalimat positif: used to.', 'used-to-form'],
      'i used to living in medan': ['Bentuk dasar setelah used to: live.', 'used-to-form'],
      'i was live in medan': ['"was" tidak dipakai dengan bentuk dasar. Pakai "used to live" atau "lived".'],
    }, { focus: 'used-to-form' }),
    fill(2, '___ you use to play games when you were a child? (Did / Do)', ['Did'], 'Pertanyaan tentang masa lalu: Did ... use to ...?', {
      do: ['Ini tentang masa kecil (lampau), jadi "Did".'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'used-to-form' }),
    construct(2, "didn't / she / use to / eat / spicy food", ["She didn't use to eat spicy food"], "Negatif: didn't use to + bentuk dasar.", {
      "she didn't used to eat spicy food": ['Setelah "didn\'t", tanpa -d: use to.', 'used-to-form'],
    }, { focus: 'used-to-form' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Did you use to have long hair?\nB: ___', [
      ['Yes, I did. It used to reach my waist.', true],
      ['Yes, I used.', 'Jawaban pendek untuk "Did you ...?" adalah "Yes, I did."'],
      ['Yes, I use to have.', '"Did you use to ...?" dijawab "Yes, I did."', 'used-to-form'],
      ['Yes, I was used to.', '"was used to" berarti terbiasa. Jawaban pendeknya "Yes, I did."', 'used-to-form'],
    ], 'Did you ...? → Yes, I did.', { focus: 'used-to-form' }),
  ],
  homework: [
    read(3, "My grandmother often tells me about her childhood. She used to live in a small village near a river. There didn't use to be electricity there, so the family used to go to bed early. Every morning she used to walk five kilometres to school. Nowadays she lives with us in the city, and she usually watches the news on TV in the evening.", 'Which of these is still true today?', [
      ['She watches the news in the evening.', true],
      ['She walks five kilometres to school.', 'Itu kebiasaan masa kecilnya ("used to walk").'],
      ['She lives near a river.', 'Sekarang ia tinggal di kota bersama kami.'],
      ['She goes to bed early because there is no electricity.', 'Itu keadaan dulu di desa ("didn\'t use to be electricity").'],
    ], '"Nowadays ... she usually watches the news on TV in the evening."'),
    fix(2, "We didn't used to have a television.", ["We didn't use to have a television", "We didn't use to have a TV", 'We did not use to have a television', "We didn't have a television"], "Setelah didn't: use to.", undefined, { focus: 'used-to-form' }),
    tr(2, 'Sekarang saya biasanya naik bus ke kantor.', ['Now I usually take the bus to the office', 'Now I usually take the bus to work', 'I usually take the bus to work now', 'I usually take the bus to the office now', 'Nowadays I usually take the bus to work', 'Nowadays I usually take the bus to the office', 'Now I usually go to the office by bus', 'Now I usually go to work by bus', 'I usually go to work by bus now', 'I usually go to the office by bus now'], 'Kebiasaan sekarang: simple present dengan usually.', {
      'now i use to take the bus to work': ['"use to" bukan untuk kebiasaan sekarang. Pakai "I usually take ...".', 'used-to-now'],
      'now i used to take the bus to work': ['"used to" berarti dulu. Untuk sekarang pakai "usually".', 'used-to-now'],
    }, { focus: 'used-to-now' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['There used to be a big tree in front of our house.', true],
      ['There use to be a big tree in front of our house.', 'Positif: used to.', 'used-to-form'],
      ['There used to being a big tree in front of our house.', 'Bentuk dasar setelah used to: be.', 'used-to-form'],
      ['There was used to be a big tree in front of our house.', '"was" tidak dipakai di sini: There used to be ...', 'used-to-form'],
    ], 'There used to be ... = dulu ada ...', { focus: 'used-to-form' }),
    fill(3, "When I was young, I ___ hate maths, but now it's my favourite subject. (use to / used to)", ['used to'], 'Positif tentang masa lalu: used to.', {
      'use to': ['Kalimat positif: used to (dengan -d).', 'used-to-form'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'used-to-form' }),
    tr(3, 'Apakah kamu dulu takut gelap?', ['Did you use to be afraid of the dark', 'Were you afraid of the dark', 'Did you use to be scared of the dark', 'Were you scared of the dark'], 'Pertanyaan: Did + subjek + use to + bentuk dasar?', {
      'did you used to be afraid of the dark': ['Setelah "Did", tanpa -d: use to.', 'used-to-form'],
      'you used to be afraid of the dark': ['Untuk bertanya, mulai dengan "Did": Did you use to ...?'],
    }, { focus: 'used-to-form' }),
    construct(3, 'used to / my father / smoke / but / he / stopped', ['My father used to smoke but he stopped'], 'used to + bentuk dasar, lalu "but" untuk perubahannya.', {
      'my father use to smoke but he stopped': ['Kalimat positif: used to.', 'used-to-form'],
    }, { focus: 'used-to-form' }),
    fix(3, 'I use to drink coffee every morning.', ['I usually drink coffee every morning', 'I drink coffee every morning', 'I used to drink coffee every morning'], 'Untuk kebiasaan sekarang: I usually drink ... Untuk kebiasaan dulu: I used to drink ...', undefined, { focus: 'used-to-now' }),
  ],
});

export const gerundLesson = lesson({
  id: 'b1-gerund-infinitive',
  title: 'Gerund atau To-Infinitive?',
  summary: 'Memilih -ing atau to + bentuk dasar setelah kata kerja seperti enjoy, want, decide, dan avoid.',
  topic: 'b1.gerund-infinitive',
  objectives: [
    'Memakai -ing setelah enjoy, avoid, finish, mind, suggest, dan setelah kata depan.',
    'Memakai to + bentuk dasar setelah want, decide, plan, hope, need, dan would like.',
    'Memakai -ing sebagai subjek kalimat: Swimming is good exercise.',
  ],
  intro: 'Dalam bahasa Indonesia, "Saya suka berenang" dan "Saya ingin berenang" memakai kata kerja yang sama. Dalam bahasa Inggris, kata kerja pertama menentukan bentuk kata kerja kedua: "I enjoy swimming" tetapi "I want to swim". Tidak ada satu aturan untuk semuanya, jadi kelompok kata kerja yang paling sering dipakai perlu dihafal.',
  teaching: [
    {
      heading: 'Kata kerja + -ing',
      body: 'Setelah kata kerja berikut, pakai bentuk -ing (gerund).',
      table: [
        ['Kata kerja', 'Contoh'],
        ['enjoy', 'I enjoy cooking.'],
        ['avoid', 'Avoid eating late at night.'],
        ['finish', 'Have you finished writing?'],
        ['mind', 'Do you mind waiting?'],
        ['suggest', 'She suggested taking a taxi.'],
      ],
      examples: [
        { en: "I don't mind helping you.", id: 'Saya tidak keberatan membantumu.' },
      ],
    },
    {
      heading: 'Kata kerja + to + bentuk dasar',
      body: 'Setelah kata kerja berikut, pakai to + bentuk dasar (to-infinitive).',
      table: [
        ['Kata kerja', 'Contoh'],
        ['want', 'I want to learn Japanese.'],
        ['decide', 'We decided to stay home.'],
        ['hope', 'I hope to see you soon.'],
        ['plan', 'They plan to travel next year.'],
        ['would like', "I'd like to order now."],
      ],
      examples: [
        { en: 'He needs to rest.', id: 'Dia perlu istirahat.' },
      ],
    },
    {
      heading: 'Setelah kata depan dan sebagai subjek',
      body: 'Setelah kata depan (in, at, of, about, before, after, without), kata kerja selalu -ing: interested in learning, good at drawing. Kata kerja sebagai subjek kalimat juga memakai -ing: Reading is fun. Beberapa kata kerja (like, love, start, begin) boleh diikuti keduanya tanpa banyak beda arti.',
      examples: [
        { en: 'She is good at drawing.', id: 'Dia pandai menggambar.' },
        { en: 'Learning a language takes time.', id: 'Belajar bahasa butuh waktu.' },
      ],
    },
  ],
  demo: [
    ['I enjoy reading novels.', 'I enjoy to read novels.', '"enjoy" diikuti -ing.'],
    ['We decided to leave early.', 'We decided leaving early.', '"decide" diikuti to + bentuk dasar.'],
    ["I'm interested in learning Korean.", "I'm interested in learn Korean.", 'Setelah kata depan "in", kata kerja memakai -ing.'],
  ],
  vocab: ['enjoy', 'avoid', 'decide'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'I want ___ a new phone.', [
      ['to buy', true],
      ['buying', '"want" diikuti to + bentuk dasar.', 'verb-ing-to'],
      ['buy', '"want" diikuti "to": want to buy.', 'verb-ing-to'],
      ['to buying', 'Setelah "to", bentuk dasar: to buy.', 'verb-ing-to'],
    ], 'want + to + bentuk dasar.', { focus: 'verb-ing-to' }),
    match(1, 'Pasangkan kata kerja dengan pola yang benar.', [
      ['enjoy', '+ -ing'],
      ['want', '+ to + bentuk dasar'],
      ['avoid', '+ -ing'],
      ['decide', '+ to + bentuk dasar'],
    ], 'enjoy dan avoid + -ing; want dan decide + to + bentuk dasar.', { focus: 'verb-ing-to' }),
    fill(1, 'Have you finished ___ your essay? (write)', ['writing'], '"finish" diikuti -ing.', {
      'to write': ['"finish" diikuti -ing: finished writing.', 'verb-ing-to'],
      writeing: ['Buang e sebelum -ing: writing.'],
    }, { prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.', focus: 'verb-ing-to' }),
    tf(1, "Kalimat \"I'm good at to cook.\" sudah benar.", false, 'Setelah kata depan "at": good at cooking.', 'Setelah kata depan, kata kerja memakai -ing.', { focus: 'prep-ing', tag: 'prep-ing' }),
  ],
  independent: [
    tr(2, 'Saya suka mendengarkan musik.', ['I like listening to music', 'I like to listen to music', 'I enjoy listening to music', 'I love listening to music', 'I love to listen to music'], '"like" dan "love" boleh diikuti -ing atau to; "enjoy" hanya -ing.', {
      'i enjoy to listen to music': ['"enjoy" hanya diikuti -ing.', 'verb-ing-to'],
      'i like listening music': ['"listen" butuh "to": listening to music.'],
      'i like listen to music': ['Setelah "like", pakai -ing atau to: like listening atau like to listen.', 'verb-ing-to'],
    }, { focus: 'verb-ing-to' }),
    fill(2, 'She decided ___ the job. (accept)', ['to accept'], '"decide" + to + bentuk dasar.', {
      accepting: ['"decide" diikuti to + bentuk dasar.', 'verb-ing-to'],
      accept: ['Tambahkan "to": decided to accept.', 'verb-ing-to'],
    }, { prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.', focus: 'verb-ing-to' }),
    construct(2, 'avoid / you / should / eating / late at night', ['You should avoid eating late at night'], 'should + avoid + -ing.', {
      'you should avoid to eat late at night': ['"avoid" diikuti -ing.', 'verb-ing-to'],
    }, { focus: 'verb-ing-to' }),
    dlg(2, 'Lengkapi percakapan berikut.', "A: Do you mind ___ the window? It's cold.\nB: Not at all.", [
      ['closing', true],
      ['to close', '"mind" diikuti -ing.', 'verb-ing-to'],
      ['close', '"mind" diikuti -ing: closing.', 'verb-ing-to'],
      ['closed', 'Bentuk -ing setelah "mind": closing.', 'verb-ing-to'],
    ], 'Do you mind + -ing?', { focus: 'verb-ing-to' }),
  ],
  homework: [
    read(3, "Maya has always enjoyed drawing. When she was at school, she spent hours drawing cartoons instead of doing her homework. Her parents wanted her to study medicine, but Maya decided to follow her dream. She is now interested in designing characters for video games. 'I can't imagine doing anything else,' she says. 'I hope to start my own studio one day.'", 'What does Maya hope to do in the future?', [
      ['Start her own studio', true],
      ['Study medicine', 'Itu keinginan orang tuanya.'],
      ['Draw cartoons at school', 'Itu yang ia lakukan dulu di sekolah.'],
      ['Stop drawing', 'Ia berkata tidak bisa membayangkan melakukan hal lain.'],
    ], '"I hope to start my own studio one day."'),
    fix(2, 'He suggested to take a taxi.', ['He suggested taking a taxi', 'He suggested that we take a taxi', 'He suggested that we should take a taxi', 'He suggested we take a taxi'], '"suggest" diikuti -ing atau that + kalimat, bukan to + bentuk dasar.', undefined, { focus: 'verb-ing-to' }),
    tr(2, 'Berenang adalah olahraga yang bagus.', ['Swimming is a good sport', 'Swimming is good exercise', 'Swimming is a good exercise', 'Swimming is a great sport'], 'Kata kerja sebagai subjek: -ing.', {
      'swim is a good sport': ['Kata kerja sebagai subjek memakai -ing: Swimming.', 'verb-ing-to'],
    }, { focus: 'verb-ing-to' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ["I'm looking forward to meeting you.", true],
      ["I'm looking forward to meet you.", '"look forward to": di sini "to" adalah kata depan, jadi -ing: meeting.', 'prep-ing'],
      ["I'm looking forward meeting you.", 'Butuh "to": look forward to meeting.', 'prep-ing'],
      ["I'm looking forward for meeting you.", 'Kata depannya "to": look forward to.', 'prep-ing'],
    ], 'look forward to + -ing.', { focus: 'prep-ing' }),
    fill(3, 'They plan ___ to Japan next spring. (travel)', ['to travel'], 'plan + to + bentuk dasar.', {
      travelling: ['"plan" diikuti to + bentuk dasar.', 'verb-ing-to'],
      traveling: ['"plan" diikuti to + bentuk dasar.', 'verb-ing-to'],
    }, { prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.', focus: 'verb-ing-to' }),
    tr(3, 'Dia tertarik belajar fotografi.', ['She is interested in learning photography', 'He is interested in learning photography', 'She is interested in studying photography', 'He is interested in studying photography'], 'Setelah kata depan "in": -ing.', {
      'she is interested in learn photography': ['Setelah kata depan "in": learning.', 'prep-ing'],
      'she is interested to learn photography': ['Setelah "interested" dipakai "in" + -ing.', 'prep-ing'],
    }, { focus: 'prep-ing' }),
    construct(3, 'without / she / left / saying goodbye', ['She left without saying goodbye', 'Without saying goodbye she left'], 'Setelah kata depan "without": -ing.', undefined, { focus: 'prep-ing' }),
    fix(3, 'I hope seeing you again soon.', ['I hope to see you again soon', 'I hope to see you soon'], '"hope" + to + bentuk dasar.', undefined, { focus: 'verb-ing-to' }),
  ],
});

export const questionTagsLesson = lesson({
  id: 'b1-question-tags',
  title: 'Question Tags: ..., kan?',
  summary: "Memastikan atau meminta persetujuan dengan isn't it?, don't you?, did she?, dan sejenisnya.",
  topic: 'b1.question-tags',
  objectives: [
    'Membentuk question tag dari kata kerja bantu kalimat utama.',
    'Memakai tag negatif setelah kalimat positif, dan tag positif setelah kalimat negatif.',
    "Menjawab question tag sesuai kenyataan: Yes, it is. / No, I didn't.",
  ],
  intro: 'Bahasa Indonesia cukup menambahkan "kan?" di akhir kalimat apa pun: "Kamu suka kopi, kan?", "Dia sudah datang, kan?". Bahasa Inggris tidak punya satu kata seperti itu. Tag-nya dibentuk ulang setiap kali dari kata kerja bantu dan subjek kalimatnya: "You like coffee, don\'t you?", "She has arrived, hasn\'t she?". Karena itu "isn\'t it?" tidak bisa dipakai untuk semua kalimat.',
  teaching: [
    {
      heading: 'Rumus: kata kerja bantu + kata ganti',
      body: 'Ambil kata kerja bantu kalimat utama (is, are, was, have, can, will ...). Kalau tidak ada, pakai do/does/did. Subjeknya diganti kata ganti (he, she, it, they).',
      table: [
        ['Kalimat', 'Tag'],
        ["It's hot today,", "isn't it?"],
        ['You can swim,', "can't you?"],
        ['She works here,', "doesn't she?"],
        ['They went home,', "didn't they?"],
      ],
    },
    {
      heading: 'Positif → negatif, negatif → positif',
      body: 'Kalimat positif diberi tag negatif, kalimat negatif diberi tag positif. Kalimat dengan never, nobody, atau nothing dianggap negatif.',
      examples: [
        { en: "You aren't tired, are you?", id: 'Kamu tidak capek, kan?' },
        { en: 'He never calls, does he?', id: 'Dia tidak pernah menelepon, kan?' },
      ],
    },
    {
      heading: 'Kasus khusus dan cara menjawab',
      body: '"I am" memakai tag "aren\'t I?". "Let\'s" memakai "shall we?". Jawablah sesuai kenyataan, bukan mengikuti tag-nya: kalau memang tidak capek, jawab "No, I\'m not."',
      examples: [
        { en: "I'm late, aren't I?", id: 'Saya terlambat, kan?' },
        { en: "Let's go, shall we?", id: 'Ayo berangkat, ya?' },
      ],
    },
  ],
  demo: [
    ["You like durian, don't you?", "You like durian, isn't it?", 'Kata kerjanya "like" (kata kerja biasa), jadi tag-nya memakai do: don\'t you?'],
    ["She was at home, wasn't she?", "She was at home, didn't she?", 'Kata kerja bantunya "was", jadi tag-nya "wasn\'t she?".'],
    ["They haven't finished, have they?", "They haven't finished, haven't they?", 'Kalimat negatif diberi tag positif: have they?'],
  ],
  vocab: ['agree', 'remind', 'confirm'],
  guided: [
    mc(1, 'Pilih question tag yang tepat.', 'You are from Bali, ___?', [
      ["aren't you", true],
      ["isn't it", '"isn\'t it" hanya untuk kalimat dengan "it is". Di sini subjeknya "you are": aren\'t you?', 'tag-isnt-it'],
      ["don't you", 'Kalimatnya memakai "are", jadi tag-nya "aren\'t you".', 'tag-auxiliary'],
      ['are you', 'Kalimat positif diberi tag negatif.', 'tag-polarity'],
    ], "You are ... → aren't you?", { focus: 'tag-isnt-it' }),
    match(1, 'Pasangkan kalimat dengan tag-nya.', [
      ["It's raining,", "isn't it?"],
      ['You can drive,', "can't you?"],
      ['He likes tea,', "doesn't he?"],
      ["They didn't come,", 'did they?'],
    ], 'Tag dibentuk dari kata kerja bantu kalimatnya, dengan arah positif-negatif yang berlawanan.', { focus: 'tag-auxiliary' }),
    fill(1, "She doesn't eat meat, ___ she? (does / doesn't)", ['does'], 'Kalimat negatif → tag positif: does she?', {
      "doesn't": ['Kalimat negatif diberi tag positif: does she?', 'tag-polarity'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'tag-polarity' }),
    tf(1, 'Kalimat "You went to the party, isn\'t it?" sudah benar.', false, "Kata kerjanya simple past (went), jadi: You went to the party, didn't you?", '"isn\'t it" tidak cocok untuk semua kalimat.', { focus: 'tag-isnt-it', tag: 'tag-isnt-it' }),
  ],
  independent: [
    fill(2, 'Your brother works in Jakarta, ___ he? (do)', ["doesn't"], "Kata kerja biasa, simple present, subjek he: doesn't he?", {
      "don't": ['"Your brother" = he, jadi doesn\'t.', 'tag-auxiliary'],
      does: ['Kalimat positif diberi tag negatif.', 'tag-polarity'],
      "isn't": ['"works" kata kerja biasa, jadi tag-nya memakai do/does.', 'tag-isnt-it'],
    }, { prompt: 'Tulis bentuk "do" yang tepat untuk tag-nya.', focus: 'tag-auxiliary' }),
    tr(2, 'Kamu sudah makan, kan?', ["You have eaten, haven't you", "You've eaten, haven't you", "You ate, didn't you", "You've already eaten, haven't you", "You already ate, didn't you"], "Kalimat dengan have + bentuk ketiga → tag haven't you?", {
      "you have eaten isn't it": ['"isn\'t it" tidak cocok. Kata kerja bantunya "have": haven\'t you?', 'tag-isnt-it'],
      "you have eaten didn't you": ['Kata kerja bantunya "have", jadi tag-nya "haven\'t you?".', 'tag-auxiliary'],
    }, { focus: 'tag-isnt-it' }),
    construct(2, "isn't / it / the weather / is / lovely", ["The weather is lovely, isn't it"], "Kalimat positif dengan is → tag isn't it?", {
      'the weather is lovely is it': ['Kalimat positif diberi tag negatif: isn\'t it?', 'tag-polarity'],
    }, { focus: 'tag-polarity' }),
    dlg(2, 'Lengkapi percakapan berikut.', "A: You aren't coming to the meeting, are you?\nB: ___", [
      ["No, I'm not. I have a dentist appointment.", true],
      ["Yes, I'm not.", 'Jawaban "Yes" dan "not" bertentangan. Kalau tidak datang: No, I\'m not.'],
      ["No, I don't.", 'Pertanyaannya memakai "are", jadi jawabannya "No, I\'m not."', 'tag-auxiliary'],
      ["No, isn't it.", 'Jawaban memakai subjek "I": No, I\'m not.', 'tag-isnt-it'],
    ], 'Jawab sesuai kenyataan dengan kata kerja bantu yang sama: No, I\'m not.', { focus: 'tag-auxiliary' }),
  ],
  homework: [
    read(3, "Tia: This is your first time in Yogyakarta, isn't it? Ken: Yes, it is. I arrived yesterday. Tia: You haven't tried gudeg yet, have you? Ken: No, I haven't. Is it spicy? Tia: Not really. It's sweet. You like sweet food, don't you? Ken: I love it! Let's go now, shall we?", 'What do we know about Ken?', [
      ['He arrived in Yogyakarta yesterday.', true],
      ['He has eaten gudeg before.', 'Ken menjawab "No, I haven\'t" saat ditanya apakah sudah mencoba gudeg.'],
      ["He doesn't like sweet food.", 'Ken berkata "I love it!"'],
      ['He lives in Yogyakarta.', 'Ini kunjungan pertamanya.'],
    ], 'Ken: "Yes, it is. I arrived yesterday."'),
    fix(2, "He can't swim, can't he?", ["He can't swim, can he"], 'Kalimat negatif diberi tag positif: can he?', undefined, { focus: 'tag-polarity' }),
    tr(2, 'Mereka tidak datang kemarin, kan?', ["They didn't come yesterday, did they", 'They did not come yesterday, did they'], 'Kalimat negatif lampau → tag positif: did they?', {
      "they didn't come yesterday didn't they": ['Kalimat negatif diberi tag positif: did they?', 'tag-polarity'],
      "they didn't come yesterday isn't it": ['Tag dibentuk dari "did" dan "they": did they?', 'tag-isnt-it'],
    }, { focus: 'tag-polarity' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ["You've seen this film, haven't you?", true],
      ["You've seen this film, isn't it?", 'Kata kerja bantunya "have": haven\'t you?', 'tag-isnt-it'],
      ["You've seen this film, didn't you?", 'Kata kerja bantunya "have", bukan "did".', 'tag-auxiliary'],
      ["You've seen this film, have you?", 'Kalimat positif diberi tag negatif.', 'tag-polarity'],
    ], "You've (have) ... → haven't you?", { focus: 'tag-auxiliary' }),
    fill(3, "I'm right, ___ I? (am not / aren't)", ["aren't"], 'Untuk "I am", tag negatifnya "aren\'t I?".', {
      'am not': ['Tag untuk "I am" adalah "aren\'t I?", bukan "am not I?".', 'tag-auxiliary'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'tag-auxiliary' }),
    tr(3, 'Dia bisa berbahasa Arab, kan?', ["She can speak Arabic, can't she", "He can speak Arabic, can't he", "She speaks Arabic, doesn't she", "He speaks Arabic, doesn't he"], "can → tag can't + kata ganti.", {
      "she can speak arabic isn't it": ['Tag dibentuk dari "can" dan "she": can\'t she?', 'tag-isnt-it'],
      'she can speak arabic can she': ['Kalimat positif diberi tag negatif: can\'t she?', 'tag-polarity'],
    }, { focus: 'tag-isnt-it' }),
    construct(3, "shall / let's / we / start", ["Let's start, shall we"], '"Let\'s" memakai tag "shall we?".', {
      "let's start will we": ['Tag untuk "Let\'s" adalah "shall we?".', 'tag-auxiliary'],
    }, { focus: 'tag-auxiliary' }),
    fix(3, "Nobody called, didn't they?", ['Nobody called, did they'], '"Nobody" bermakna negatif, jadi tag-nya positif: did they?', undefined, { focus: 'tag-polarity' }),
  ],
});

export const tooEnoughLesson = lesson({
  id: 'b1-too-enough',
  title: 'Too dan Enough',
  summary: 'Mengatakan sesuatu berlebihan atau sudah cukup: too hot, big enough, enough time.',
  topic: 'b1.too-enough',
  objectives: [
    'Memakai too + kata sifat untuk "terlalu", biasanya dengan akibat yang tidak diinginkan.',
    'Memakai kata sifat + enough dan enough + kata benda.',
    'Membedakan too dan very.',
  ],
  intro: '"Terlalu" dan "cukup" terdengar sederhana, tetapi letaknya dalam bahasa Inggris sering keliru. "enough" berada sesudah kata sifat (old enough), tetapi sebelum kata benda (enough money). Ada satu jebakan lagi: "too" bukan pengganti "very". "This soup is too delicious" justru terdengar seperti keluhan.',
  teaching: [
    {
      heading: 'Too + kata sifat',
      body: '"too" berarti lebih dari yang seharusnya, biasanya dengan akibat yang tidak diinginkan. Akibatnya bisa ditambahkan dengan "to + bentuk dasar", atau orangnya dengan "for".',
      examples: [
        { en: 'This bag is too heavy to carry.', id: 'Tas ini terlalu berat untuk dibawa.' },
        { en: 'The film was too long for the children.', id: 'Filmnya terlalu panjang untuk anak-anak.' },
      ],
    },
    {
      heading: 'Enough: sesudah kata sifat, sebelum kata benda',
      body: '"enough" berarti cukup. Letaknya bergantung pada kata yang diterangkannya.',
      table: [
        ['Pola', 'Contoh'],
        ['kata sifat + enough', "He isn't old enough to drive."],
        ['enough + kata benda', "We don't have enough chairs."],
        ['enough + kata benda + to', 'Do you have enough money to buy it?'],
      ],
    },
    {
      heading: 'Too atau very?',
      body: '"very" hanya menguatkan (sangat), tanpa masalah. "too" berarti berlebihan, ada masalahnya. Untuk memuji, pakai very atau really. Hati-hati juga: "too" di akhir kalimat berarti "juga" (I like it too).',
      table: [
        ['Kalimat', 'Arti'],
        ['The coffee is very hot.', 'Kopinya sangat panas (hati-hati, tetapi bisa diminum).'],
        ['The coffee is too hot to drink.', 'Kopinya terlalu panas, belum bisa diminum.'],
        ['This cake is very delicious.', 'Kuenya sangat enak (pujian).'],
      ],
    },
  ],
  demo: [
    ["She isn't tall enough to reach the shelf.", "She isn't enough tall to reach the shelf.", '"enough" sesudah kata sifat: tall enough.'],
    ["We don't have enough time.", "We don't have time enough.", '"enough" sebelum kata benda: enough time.'],
    ['This food is really delicious!', 'This food is too delicious!', 'Untuk memuji, pakai "really" atau "very". "too" berarti berlebihan.'],
  ],
  vocab: ['spicy', 'heavy', 'enough'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ["He isn't strong enough to lift the box.", true],
      ["He isn't enough strong to lift the box.", '"enough" sesudah kata sifat: strong enough.', 'enough-order'],
      ["He isn't strong to enough lift the box.", 'Urutannya: strong enough to lift.', 'enough-order'],
      ["He isn't too strong enough to lift the box.", '"too" dan "enough" tidak dipakai bersama di sini.', 'too-very'],
    ], 'kata sifat + enough + to + bentuk dasar.', { focus: 'enough-order' }),
    match(1, 'Pasangkan ungkapan dengan artinya.', [
      ['too hot', 'terlalu panas'],
      ['hot enough', 'cukup panas'],
      ['very hot', 'sangat panas'],
      ['enough water', 'air yang cukup'],
    ], 'too = terlalu; enough = cukup; very = sangat.', { focus: 'too-very' }),
    fill(1, "I can't buy it. It's ___ expensive. (too / very)", ['too'], 'Ada masalahnya (tidak bisa membeli) → too.', {
      very: ['"very" tidak menunjukkan masalah. Karena tidak bisa membeli, pakai "too".', 'too-very'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'too-very' }),
    tf(1, 'Kalimat "Do we have chairs enough?" sudah benar.', false, '"enough" sebelum kata benda: Do we have enough chairs?', '"enough" diletakkan sebelum kata benda.', { focus: 'enough-order', tag: 'enough-order' }),
  ],
  independent: [
    tr(2, 'Teh ini terlalu manis.', ['This tea is too sweet'], '"Terlalu" = too + kata sifat.', {
      'this tea is very sweet': ['"very" = sangat. "Terlalu" = too.', 'too-very'],
      'this tea is sweet too': ['"too" di akhir kalimat berarti "juga". Untuk "terlalu": too sweet.', 'too-very'],
    }, { focus: 'too-very' }),
    fill(2, "We can't go camping. We don't have ___ tents. (enough / too)", ['enough'], 'Kurang tenda → not enough + kata benda.', {
      too: ['"too" tidak dipakai langsung sebelum kata benda seperti ini. "Cukup" = enough tents.', 'too-very'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'enough-order' }),
    construct(2, 'old / enough / not / he / is / to drive', ['He is not old enough to drive', "He isn't old enough to drive"], 'kata sifat + enough + to + bentuk dasar.', {
      'he is not enough old to drive': ['"enough" sesudah kata sifat: old enough.', 'enough-order'],
    }, { focus: 'enough-order' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: How was the soup?\nB: ___', [
      ['It was really good, but a bit too spicy for me.', true],
      ['It was too delicious!', '"too" berarti berlebihan. Untuk memuji: It was really delicious!', 'too-very'],
      ['It was spicy too much.', 'Urutan yang benar: too spicy.', 'too-very'],
      ['It was enough spicy.', '"enough" sesudah kata sifat: spicy enough.', 'enough-order'],
    ], 'Pujian: really good. Masalah: too spicy.', { focus: 'too-very' }),
  ],
  homework: [
    read(3, "Rani wanted to buy a laptop for university. The first one she saw was beautiful, but it was too expensive. The second one was cheap enough, but it was too heavy to carry every day. Finally, she found a light laptop with a big enough screen. She didn't have enough money to pay for it all at once, so she paid in three months.", "Why didn't Rani buy the second laptop?", [
      ['It was too heavy.', true],
      ['It was too expensive.', 'Itu alasan untuk laptop pertama.'],
      ["Its screen wasn't big enough.", 'Layar disebut pada laptop terakhir yang ia beli.'],
      ["She didn't like the colour.", 'Warna tidak disebut dalam teks.'],
    ], '"The second one was cheap enough, but it was too heavy to carry every day."'),
    fix(2, 'The water is enough warm for swimming.', ['The water is warm enough for swimming', 'The water is warm enough to swim in', 'The water is warm enough to swim'], '"enough" sesudah kata sifat: warm enough.', undefined, { focus: 'enough-order' }),
    tr(2, 'Kami tidak punya cukup waktu.', ["We don't have enough time", 'We do not have enough time', "We haven't got enough time"], '"enough" sebelum kata benda: enough time.', {
      "we don't have time enough": ['"enough" sebelum kata benda.', 'enough-order'],
      "we don't have too much time": ['Artinya berbeda: "tidak punya terlalu banyak waktu". "Cukup" = enough.', 'too-very'],
    }, { focus: 'enough-order' }),
  ],
  mastery: [
    mc(2, 'Pilih jawaban yang paling tepat.', 'The box is ___ heavy for me to carry. Can you help me?', [
      ['too', true],
      ['very', 'Ada masalahnya (perlu bantuan), jadi "too".', 'too-very'],
      ['enough', '"enough" sesudah kata sifat dan berarti cukup.', 'enough-order'],
      ['so much', '"so much" tidak dipakai langsung sebelum kata sifat.', 'too-very'],
    ], 'too heavy for me = terlalu berat bagi saya.', { focus: 'too-very' }),
    fill(3, 'My little sister is not ___ to watch that horror film. (old enough / enough old)', ['old enough'], 'kata sifat + enough.', {
      'enough old': ['"enough" sesudah kata sifat: old enough.', 'enough-order'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'enough-order' }),
    tr(3, 'Kopi ini terlalu panas untuk diminum.', ['This coffee is too hot to drink', 'The coffee is too hot to drink'], 'too + kata sifat + to + bentuk dasar.', {
      'this coffee is very hot to drink': ['"Terlalu" = too.', 'too-very'],
      'this coffee is too hot for drink': ['Untuk akibatnya: too hot to drink.'],
    }, { focus: 'too-very' }),
    construct(3, 'enough / do / have / you / money', ['Do you have enough money'], '"enough" sebelum kata benda.', {
      'do you have money enough': ['"enough" sebelum kata benda: enough money.', 'enough-order'],
    }, { prompt: 'Susun pertanyaan dari kata kunci berikut.', focus: 'enough-order' }),
    fix(3, 'This shirt is too much small for me.', ['This shirt is too small for me'], '"too" langsung sebelum kata sifat: too small.', undefined, { focus: 'too-very' }),
  ],
});
