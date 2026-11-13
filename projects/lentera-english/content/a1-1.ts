// A1 · Bab 1 · Unit 1 — Kenalan Pertama (sapaan, to be)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, spot, tf, tr } from './dsl';

export const greetings = lesson({
  id: 'a1-greetings',
  title: 'Sapaan dan Perkenalan',
  summary: 'Menyapa sesuai waktu, memperkenalkan diri, dan menanyakan kabar.',
  topic: 'a1.greetings',
  objectives: [
    'Memilih sapaan yang tepat untuk pagi, siang, dan malam.',
    'Memperkenalkan nama dan kota asal dengan "My name is ..." dan "I\'m from ...".',
    'Menanyakan kabar dan menjawabnya dengan sopan.',
  ],
  intro: 'Setiap percakapan bahasa Inggris dimulai dengan sapaan. Di pelajaran ini kamu belajar menyapa, menyebutkan nama dan asal, serta menanyakan kabar. Setelah selesai, kamu bisa membuka percakapan singkat dengan orang yang baru kamu temui.',
  teaching: [
    {
      heading: 'Sapaan menurut waktu',
      body: 'Bahasa Inggris membedakan sapaan berdasarkan waktu. Perhatikan: "Good night" BUKAN sapaan saat bertemu. "Good night" hanya diucapkan ketika berpisah di malam hari atau hendak tidur.',
      table: [
        ['Sapaan', 'Kapan dipakai', 'Arti'],
        ['Good morning', 'Pagi sampai sekitar pukul 12.00', 'Selamat pagi'],
        ['Good afternoon', 'Pukul 12.00 sampai sekitar 18.00', 'Selamat siang/sore'],
        ['Good evening', 'Setelah sekitar pukul 18.00, saat bertemu', 'Selamat malam'],
        ['Good night', 'Saat berpisah di malam hari / mau tidur', 'Selamat malam / selamat tidur'],
        ['Hello / Hi', 'Kapan saja (Hi lebih santai)', 'Halo / Hai'],
      ],
    },
    {
      heading: 'Memperkenalkan diri',
      body: 'Untuk menyebut nama, pakai "My name is ..." atau "I\'m ..." (singkatan dari "I am"). Untuk asal, pakai "I\'m from ...". Kata "is" dan "am" wajib ada. Dalam bahasa Indonesia kita bilang "Nama saya Budi" tanpa kata kerja, tetapi bahasa Inggris selalu butuh kata kerja.',
      examples: [
        { en: 'My name is Budi.', id: 'Nama saya Budi.' },
        { en: "I'm from Bandung.", id: 'Saya dari Bandung.' },
        { en: 'Nice to meet you.', id: 'Senang bertemu denganmu.', note: 'Diucapkan saat pertama kali berkenalan.' },
        { en: 'Nice to meet you, too.', id: 'Senang bertemu denganmu juga.' },
      ],
    },
    {
      heading: 'Menanyakan kabar',
      body: '"How are you?" berarti "Apa kabar?". Jawaban yang sopan: "I\'m fine, thank you. And you?". Bagian "And you?" dipakai untuk bertanya balik.',
      examples: [
        { en: 'How are you?', id: 'Apa kabar?' },
        { en: "I'm fine, thank you. And you?", id: 'Saya baik, terima kasih. Kalau kamu?' },
      ],
    },
  ],
  demo: [
    ['Good evening, Mrs. Sari. (bertemu pukul 19.00)', 'Good night, Mrs. Sari. (bertemu pukul 19.00)', '"Good night" hanya untuk berpisah atau sebelum tidur. Saat bertemu di malam hari, pakai "Good evening".'],
    ['My name is Budi.', 'My name Budi.', 'Kalimat bahasa Inggris harus punya kata kerja. Di sini kata kerjanya "is".'],
    ["I'm from Medan.", 'I from Medan.', 'Setelah "I" harus ada "am": I am from Medan / I\'m from Medan.'],
  ],
  vocab: ['hello', 'morning', 'afternoon', 'evening', 'name', 'thank-you'],
  guided: [
    mc(1, 'Pukul 08.00 kamu bertemu gurumu di sekolah. Sapaan mana yang tepat?', null, [
      ['Good morning', true],
      ['Good night', '"Good night" diucapkan saat berpisah di malam hari, bukan untuk menyapa di pagi hari.', 'greeting-time'],
      ['Good evening', '"Good evening" dipakai saat bertemu setelah sekitar pukul 18.00.', 'greeting-time'],
      ['Good afternoon', '"Good afternoon" dipakai mulai pukul 12.00, bukan pukul 08.00.', 'greeting-time'],
    ], 'Pukul 08.00 masih pagi, jadi sapaannya "Good morning".', { focus: 'greeting-time', hint: 'Pukul 08.00 itu pagi. Kata "pagi" dalam bahasa Inggris adalah "morning".' }),
    match(1, 'Pasangkan ungkapan bahasa Inggris dengan artinya.', [
      ['Good morning', 'Selamat pagi'],
      ['Thank you', 'Terima kasih'],
      ['Nice to meet you', 'Senang bertemu denganmu'],
      ['How are you?', 'Apa kabar?'],
    ], 'Keempat ungkapan ini adalah modal dasar untuk membuka percakapan.'),
    fill(1, 'My name ___ Sinta.', ['is'], '"My name" adalah satu benda (tunggal), jadi pasangannya "is": My name is Sinta.', {
      am: ['"am" hanya dipakai setelah "I". Subjek kalimat ini "My name", bukan "I".', 'am-is-are'],
      are: ['"are" dipakai untuk you/we/they atau benda jamak. "My name" tunggal, jadi pakai "is".', 'am-is-are'],
    }, { hint: 'Subjeknya "My name" (satu benda). Pilih antara am / is / are.' }),
    dlg(1, 'Lengkapi percakapan berikut.', 'Rina: Hello, I\'m Rina. Nice to meet you.\nKamu: ___', [
      ['Nice to meet you, too.', true],
      ["I'm fine, thank you.", 'Ini jawaban untuk "How are you?", padahal Rina berkata "Nice to meet you".'],
      ['Good night.', '"Good night" diucapkan ketika berpisah di malam hari, bukan untuk membalas perkenalan.', 'greeting-time'],
      ['My name is Rina.', 'Rina adalah nama lawan bicaramu. Kamu perlu membalas ucapannya, bukan mengulang namanya.'],
    ], '"Nice to meet you" dibalas dengan "Nice to meet you, too." Kata "too" berarti "juga".', { hint: 'Balas dengan ungkapan yang sama, lalu tambahkan kata yang berarti "juga".' }),
  ],
  independent: [
    arrange(2, 'Saya dari Surabaya.', 'I am from Surabaya', ['is', 'in'], 'Pola: I + am + from + kota. "is" tidak cocok dengan "I", dan "in" berarti "di", bukan "dari".'),
    tr(2, 'Senang bertemu denganmu.', ['Nice to meet you', 'Pleased to meet you', 'It is nice to meet you', "It's nice to meet you"], 'Ungkapan baku saat pertama berkenalan adalah "Nice to meet you."', {
      'nice to see you': ['"Nice to see you" dipakai untuk orang yang sudah kamu kenal. Untuk perkenalan pertama, pakai "meet".'],
    }),
    mc(2, 'Temanmu bertanya: "How are you?" Jawaban mana yang tepat?', null, [
      ["I'm fine, thank you.", true],
      ["I'm Budi.", 'Ini menyebutkan nama. "How are you?" menanyakan kabar, bukan nama.'],
      ['Nice to meet you.', 'Ini ungkapan saat berkenalan, bukan jawaban untuk pertanyaan kabar.'],
      ['Good morning.', 'Ini sapaan, bukan jawaban untuk "How are you?".'],
    ], '"How are you?" = "Apa kabar?". Jawabannya menyatakan kabar: "I\'m fine, thank you."'),
    tf(2, '"Good night" tepat dipakai untuk menyapa orang yang baru kamu temui pukul 19.00.', false, 'Saat BERTEMU di malam hari, sapaannya "Good evening". "Good night" hanya untuk berpisah atau sebelum tidur.', 'Walaupun sama-sama berarti "selamat malam", "Good night" bukan sapaan pembuka.', { focus: 'greeting-time', tag: 'greeting-time' }),
  ],
  homework: [
    construct(2, 'name / my / Andi / is', ['My name is Andi'], 'Urutan kalimat: subjek (My name) + kata kerja (is) + keterangan (Andi).'),
    fix(2, 'I from Jakarta.', ['I am from Jakarta', "I'm from Jakarta"], 'Setelah "I" harus ada "am". Tanpa "am", kalimat tidak punya kata kerja.', {
      'i is from jakarta': ['"is" tidak dipakai dengan "I". Pasangan "I" selalu "am".', 'am-is-are'],
    }),
    dlg(2, 'Lengkapi percakapan berikut.', 'Pak Hadi: Good afternoon. How are you?\nKamu: ___', [
      ["Good afternoon, sir. I'm fine, thank you. And you?", true],
      ['Good night, sir. My name is fine.', '"Good night" bukan sapaan balasan, dan "My name is fine" tidak bermakna.', 'greeting-time'],
      ['Nice to meet you, too.', 'Pak Hadi tidak berkata "Nice to meet you". Beliau menyapa dan menanyakan kabar.'],
      ["I'm from Jakarta.", 'Pak Hadi menanyakan kabar, bukan asalmu.'],
    ], 'Balas sapaan yang sama (Good afternoon), jawab kabarmu, lalu tanya balik dengan "And you?".'),
  ],
  mastery: [
    mc(2, 'Pukul 15.00 kamu masuk ke kantor dan bertemu resepsionis. Sapaan mana yang tepat?', null, [
      ['Good afternoon', true],
      ['Good morning', 'Pukul 15.00 sudah lewat tengah hari, jadi bukan "morning".', 'greeting-time'],
      ['Good evening', '"Good evening" baru dipakai setelah sekitar pukul 18.00.', 'greeting-time'],
      ['Good night', '"Good night" bukan sapaan saat bertemu.', 'greeting-time'],
    ], 'Pukul 12.00–18.00 memakai "Good afternoon".', { focus: 'greeting-time' }),
    fill(2, 'Nice to ___ you.', ['meet'], 'Ungkapan perkenalan yang baku adalah "Nice to meet you."', {
      see: ['"Nice to see you" dipakai untuk orang yang sudah dikenal. Saat berkenalan pertama kali, pakai "meet".'],
      meeting: ['Setelah "to" dipakai kata kerja bentuk dasar: "to meet", bukan "to meeting".'],
    }),
    tr(2, 'Nama saya Putri.', ['My name is Putri', "My name's Putri", 'I am Putri', "I'm Putri"], 'Pola: My name + is + nama. Jangan lupa "is".', {
      'my name putri': ['Kalimat ini belum punya kata kerja. Tambahkan "is": My name is Putri.', 'be-missing'],
    }),
    dlg(3, 'Lengkapi percakapan berikut.', 'Dian: How are you?\nKamu: ___\nDian: I\'m fine, too.', [
      ["I'm fine, thank you. And you?", true],
      ["I'm fine, thank you.", 'Dian menjawab "I\'m fine, too", artinya kamu sempat bertanya balik. Tambahkan "And you?".'],
      ['Nice to meet you. And you?', '"Nice to meet you" bukan jawaban untuk pertanyaan kabar.'],
      ['My name is fine.', 'Yang ditanya adalah kabarmu, jadi subjeknya "I", bukan "My name".'],
    ], 'Jawaban Dian "I\'m fine, too" menunjukkan bahwa kamu bertanya balik dengan "And you?".'),
    spot(3, 'Good morning, my name are Tono.', 'are', 'is', '"My name" tunggal, jadi kata kerjanya "is": my name is Tono.', { focus: 'am-is-are', topic: 'a1.to-be' }),
  ],
});

export const toBe = lesson({
  id: 'a1-to-be',
  title: 'Kata Ganti dan To Be (am, is, are)',
  summary: 'Memasangkan I, you, he, she, it, we, they dengan am, is, are.',
  topic: 'a1.to-be',
  objectives: [
    'Mengenali tujuh kata ganti subjek: I, you, he, she, it, we, they.',
    'Memilih am, is, atau are sesuai subjek.',
    'Membuat kalimat sederhana tentang identitas, pekerjaan, dan sifat.',
  ],
  intro: 'Dalam bahasa Indonesia kita bisa berkata "Dia guru" tanpa kata kerja. Bahasa Inggris tidak bisa: harus ada "to be" (am, is, are) di antara subjek dan keterangannya. Pelajaran ini melatih kamu memilih to be yang tepat secara otomatis.',
  teaching: [
    {
      heading: 'Kata ganti subjek',
      body: 'Kata ganti menggantikan nama orang atau benda. "He" untuk laki-laki, "she" untuk perempuan, "it" untuk benda atau hewan. Bahasa Indonesia hanya punya "dia", jadi perhatikan perbedaannya.',
      table: [
        ['Inggris', 'Indonesia'],
        ['I', 'saya / aku'],
        ['you', 'kamu / Anda / kalian'],
        ['he', 'dia (laki-laki)'],
        ['she', 'dia (perempuan)'],
        ['it', 'itu / ia (benda, hewan)'],
        ['we', 'kami / kita'],
        ['they', 'mereka'],
      ],
    },
    {
      heading: 'Pasangan subjek dan to be',
      body: 'Hafalkan tiga pasangan ini: I selalu dengan am. He, she, it (dan satu orang/benda) dengan is. You, we, they (dan lebih dari satu orang/benda) dengan are.',
      table: [
        ['Subjek', 'To be', 'Singkatan', 'Contoh'],
        ['I', 'am', "I'm", "I'm a student."],
        ['he / she / it', 'is', "he's / she's / it's", 'She is a doctor.'],
        ['you / we / they', 'are', "you're / we're / they're", 'They are friends.'],
      ],
      examples: [
        { en: 'Rudi is my brother.', id: 'Rudi adalah kakak saya.', note: 'Rudi = he, jadi pakai "is".' },
        { en: 'Rudi and Tini are teachers.', id: 'Rudi dan Tini adalah guru.', note: 'Dua orang = they, jadi pakai "are".' },
      ],
    },
  ],
  demo: [
    ['She is a teacher.', 'She a teacher.', 'Tanpa "is", kalimat ini tidak punya kata kerja. Bahasa Inggris selalu butuh to be di sini.'],
    ['They are happy.', 'They is happy.', '"They" berarti lebih dari satu, jadi pasangannya "are", bukan "is".'],
    ['I am a student.', 'I is a student.', '"I" hanya berpasangan dengan "am".'],
  ],
  vocab: ['student', 'teacher', 'friend', 'happy', 'doctor'],
  guided: [
    mc(1, 'Pilih to be yang tepat.', 'She ___ a nurse.', [
      ['is', true],
      ['am', '"am" hanya untuk subjek "I".', 'am-is-are'],
      ['are', '"are" untuk you, we, they. "She" berpasangan dengan "is".', 'am-is-are'],
    ], '"She" adalah orang ketiga tunggal, jadi to be-nya "is".', { focus: 'am-is-are', hint: 'He, she, it selalu memakai to be yang sama.' }),
    match(1, 'Pasangkan subjek dengan to be yang tepat.', [
      ['I', 'am'],
      ['He', 'is'],
      ['They', 'are'],
    ], 'I–am, he/she/it–is, you/we/they–are.', { focus: 'am-is-are' }),
    fill(1, 'We ___ from Indonesia.', ['are'], '"We" (kami/kita) berarti lebih dari satu orang, jadi memakai "are".', {
      is: ['"is" hanya untuk he, she, it. "We" memakai "are".', 'am-is-are'],
      am: ['"am" hanya untuk "I". "We" memakai "are".', 'am-is-are'],
    }, { focus: 'am-is-are', hint: 'We = kami/kita, lebih dari satu orang.' }),
    tf(1, 'Kalimat "My mother are a doctor." sudah benar.', false, '"My mother" adalah satu orang (= she), jadi yang benar "My mother is a doctor."', 'Coba ganti "My mother" dengan kata ganti: she. She berpasangan dengan "is".', { focus: 'am-is-are', tag: 'am-is-are', hint: 'Ganti "My mother" dengan kata ganti yang sesuai dulu.' }),
  ],
  independent: [
    fill(2, 'Dina and I ___ classmates.', ['are'], '"Dina and I" = we (dua orang), jadi memakai "are".', {
      am: ['Walaupun ada kata "I", subjeknya "Dina and I" (dua orang = we). Pakai "are".', 'am-is-are'],
      is: ['Subjeknya dua orang (Dina and I = we), jadi bukan "is".', 'am-is-are'],
    }, { focus: 'am-is-are' }),
    arrange(2, 'Dia (laki-laki) adalah seorang dokter.', 'He is a doctor', ['are', 'she'], 'He + is + a doctor. "She" untuk perempuan, dan "are" tidak cocok dengan "he".', { focus: 'am-is-are' }),
    tr(2, 'Mereka adalah teman saya.', ['They are my friends', "They're my friends"], '"Mereka" = they, to be-nya "are". Karena lebih dari satu, "friend" menjadi "friends".', {
      'they is my friends': ['"They" berpasangan dengan "are", bukan "is".', 'am-is-are'],
      'they my friends': ['Kalimat ini belum punya to be. Tambahkan "are".', 'be-missing'],
    }, { focus: 'am-is-are' }),
    spot(2, 'The cat are under the table.', 'are', 'is', '"The cat" satu ekor (= it), jadi memakai "is".', { focus: 'am-is-are' }),
  ],
  homework: [
    construct(2, 'happy / we / are', ['We are happy', "We're happy"], 'Subjek (We) + to be (are) + kata sifat (happy).', undefined, { focus: 'am-is-are' }),
    fix(2, 'My father a teacher.', ['My father is a teacher', "My father's a teacher"], '"My father" = he, jadi perlu "is" sebelum "a teacher".', {
      'my father are a teacher': ['"My father" satu orang, jadi "is", bukan "are".', 'am-is-are'],
    }, { focus: 'be-missing' }),
    fill(2, 'It ___ a big house.', ['is'], '"It" selalu berpasangan dengan "is".', { are: ['"It" tunggal, jadi "is".', 'am-is-are'], am: ['"am" hanya untuk "I".', 'am-is-are'] }, { focus: 'am-is-are' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['You are my best friend.', true],
      ['You is my best friend.', '"You" selalu memakai "are", walaupun hanya satu orang.', 'am-is-are'],
      ['You am my best friend.', '"am" hanya untuk "I".', 'am-is-are'],
      ['You my best friend.', 'Kalimat ini tidak punya to be.', 'be-missing'],
    ], '"You" selalu berpasangan dengan "are", baik untuk satu orang maupun banyak orang.', { focus: 'am-is-are' }),
    fill(2, 'I ___ twenty years old.', ['am'], 'Subjek "I" selalu memakai "am". Umur dalam bahasa Inggris memakai to be: I am twenty years old.', {
      is: ['"is" tidak dipakai dengan "I".', 'am-is-are'],
      have: ['Bahasa Inggris tidak memakai "have" untuk umur. Pakai to be: I am twenty years old.'],
    }, { focus: 'am-is-are' }),
    fill(3, 'The students ___ in the classroom.', ['are'], '"The students" jamak (ada akhiran -s) = they, jadi memakai "are".', {
      is: ['"Students" berakhiran -s, artinya lebih dari satu. Pakai "are".', 'am-is-are'],
    }, { focus: 'am-is-are' }),
    tr(3, 'Ibu saya adalah seorang perawat.', ['My mother is a nurse', "My mother's a nurse", 'My mom is a nurse'], '"Ibu saya" = my mother (she) + is + a nurse.', {
      'my mother a nurse': ['Kalimat ini belum punya to be. Tambahkan "is".', 'be-missing'],
      'my mother are a nurse': ['"My mother" satu orang, jadi "is".', 'am-is-are'],
    }, { focus: 'am-is-are' }),
    fix(3, 'Budi and Ani is at school.', ['Budi and Ani are at school'], '"Budi and Ani" dua orang (= they), jadi to be-nya "are".', undefined, { focus: 'am-is-are' }),
  ],
});

export const toBeNegQ = lesson({
  id: 'a1-to-be-neg-q',
  title: 'To Be: Kalimat Negatif dan Pertanyaan',
  summary: 'Menyangkal dengan "not" dan bertanya dengan membalik urutan.',
  topic: 'a1.to-be-neg-q',
  objectives: [
    'Membuat kalimat negatif dengan am not, is not (isn\'t), are not (aren\'t).',
    'Membuat pertanyaan ya/tidak dengan memindahkan to be ke depan.',
    'Menjawab singkat: Yes, I am. / No, she isn\'t.',
  ],
  intro: 'Kamu sudah bisa berkata "She is a teacher." Sekarang kamu belajar menyangkalnya ("She is not a teacher.") dan menanyakannya ("Is she a teacher?"). Kuncinya hanya dua: tambahkan "not" setelah to be, atau pindahkan to be ke depan.',
  teaching: [
    {
      heading: 'Kalimat negatif: to be + not',
      body: 'Letakkan "not" tepat setelah am/is/are. Bentuk singkatnya: isn\'t dan aren\'t. Perhatikan: "am not" tidak punya singkatan "amn\'t". Yang disingkat adalah "I\'m not".',
      examples: [
        { en: "I am not tired. / I'm not tired.", id: 'Saya tidak lelah.' },
        { en: "He is not a doctor. / He isn't a doctor.", id: 'Dia bukan dokter.' },
        { en: "They are not at home. / They aren't at home.", id: 'Mereka tidak di rumah.' },
      ],
    },
    {
      heading: 'Pertanyaan: to be pindah ke depan',
      body: 'Untuk bertanya, tukar posisi subjek dan to be. Jangan menambahkan "do" atau "does". To be sudah cukup.',
      table: [
        ['Pernyataan', 'Pertanyaan', 'Jawaban singkat'],
        ['You are a student.', 'Are you a student?', "Yes, I am. / No, I'm not."],
        ['She is busy.', 'Is she busy?', "Yes, she is. / No, she isn't."],
        ['They are ready.', 'Are they ready?', "Yes, they are. / No, they aren't."],
      ],
    },
  ],
  demo: [
    ['Is he your brother?', 'He is your brother?', 'Dalam pertanyaan, to be harus di depan subjek: Is he ...?'],
    ["She isn't hungry.", 'She not is hungry.', '"not" diletakkan SETELAH to be: is not, bukan not is.'],
    ['Are you ready?', 'Do you are ready?', 'Kalimat dengan to be tidak memakai "do" untuk bertanya.'],
  ],
  vocab: ['tired', 'hungry', 'busy', 'ready'],
  guided: [
    mc(1, 'Pilih bentuk negatif yang benar.', 'He ___ a pilot.', [
      ["isn't", true],
      ["aren't", '"aren\'t" untuk you/we/they. "He" memakai "isn\'t".', 'am-is-are'],
      ['not is', '"not" harus setelah to be: "is not".', 'be-order'],
      ["amn't", 'Bentuk "amn\'t" tidak ada dalam bahasa Inggris baku.'],
    ], '"He" berpasangan dengan "is"; negatifnya "is not" atau "isn\'t".', { focus: 'be-order', hint: 'Mulai dari to be untuk "he", lalu tambahkan "not" setelahnya.' }),
    arrange(1, 'Apakah kamu seorang pelajar?', 'Are you a student', ['is', 'do'], 'Pertanyaan: to be (Are) + subjek (you) + keterangan. Tidak perlu "do".', { focus: 'be-order', hint: 'Mulai dengan to be yang cocok untuk "you".' }),
    fill(1, 'A: Is she your sister?  B: No, she ___.', ["isn't", 'is not'], 'Jawaban singkat negatif untuk "she": No, she isn\'t.', {
      "aren't": ['"aren\'t" untuk you/we/they. Subjeknya "she".', 'am-is-are'],
      not: ['Jawaban singkat tetap butuh to be: "she isn\'t" atau "she is not".', 'be-order'],
    }, { focus: 'be-order', hint: 'Pakai to be yang sama dengan pertanyaannya, lalu tambahkan "not".' }),
    tf(1, 'Kalimat "Do you are hungry?" adalah pertanyaan yang benar.', false, 'Pertanyaan dengan to be tidak memakai "do". Yang benar: "Are you hungry?"', '"Do" dipakai untuk kata kerja biasa (like, work), bukan untuk to be.', { focus: 'be-order', tag: 'be-order', hint: 'Apakah kalimat ini sudah punya to be?' }),
  ],
  independent: [
    construct(2, 'not / they / are / late', ['They are not late', "They aren't late", "They're not late"], 'Subjek + to be + not + keterangan.', undefined, { focus: 'be-order' }),
    tr(2, 'Apakah dia (perempuan) sibuk?', ['Is she busy'], 'To be (Is) di depan subjek (she).', {
      'she is busy': ['Itu pernyataan. Untuk bertanya, pindahkan "is" ke depan: Is she busy?', 'be-order'],
      'does she busy': ['"busy" adalah kata sifat, jadi pertanyaannya memakai to be: Is she busy?', 'be-order'],
      'are she busy': ['"She" berpasangan dengan "is".', 'am-is-are'],
    }, { focus: 'be-order' }),
    fix(2, 'I amn\'t tired.', ["I'm not tired", 'I am not tired'], '"am not" tidak punya singkatan "amn\'t". Pakai "I\'m not" atau "I am not".', undefined, { focus: 'be-order' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Are you and Tono brothers?\nB: ___', [
      ['Yes, we are.', true],
      ['Yes, we is.', '"We" berpasangan dengan "are".', 'am-is-are'],
      ['Yes, I am.', 'Pertanyaannya tentang dua orang (you and Tono), jadi jawabannya "we".'],
      ['Yes, they are.', '"They" untuk orang lain. Kamu termasuk yang ditanya, jadi pakai "we".'],
    ], '"You and Tono" dijawab dengan "we": Yes, we are.', { focus: 'be-order' }),
  ],
  homework: [
    tr(2, 'Saya tidak lapar.', ["I'm not hungry", 'I am not hungry'], 'I + am + not + hungry.', {
      'i not hungry': ['Kalimat ini belum punya to be. Tambahkan "am".', 'be-missing'],
      "i don't hungry": ['"hungry" kata sifat, jadi negatifnya memakai to be: I am not hungry.', 'be-order'],
    }, { focus: 'be-order' }),
    construct(2, 'your / is / teacher / he / ?', ['Is he your teacher'], 'To be (Is) + subjek (he) + keterangan (your teacher).', undefined, { focus: 'be-order' }),
    spot(2, 'Are your mother at home today?', 'Are', 'Is', '"Your mother" satu orang (= she), jadi pertanyaannya "Is your mother at home today?"', { focus: 'am-is-are', topic: 'a1.to-be' }),
  ],
  mastery: [
    arrange(2, 'Mereka tidak di rumah.', 'They are not at home', ['is', 'no'], 'They + are + not + at home. Negatif memakai "not", bukan "no".', { focus: 'be-order', alt: ["They aren't at home"] }),
    fill(2, '___ it cold today?  — Yes, it is.', ['Is'], 'Pertanyaan untuk "it" diawali "Is".', {
      are: ['"It" berpasangan dengan "is".', 'am-is-are'],
      does: ['"cold" kata sifat, jadi pakai to be, bukan "does".', 'be-order'],
      do: ['"cold" kata sifat, jadi pakai to be, bukan "do".', 'be-order'],
    }, { focus: 'be-order' }),
    mc(3, 'Pilih jawaban singkat yang tepat.', 'Are they your friends?', [
      ["No, they aren't.", true],
      ["No, they isn't.", '"They" berpasangan dengan "are".', 'am-is-are'],
      ["No, they don't.", 'Pertanyaannya memakai "Are", jadi jawabannya juga memakai to be.', 'be-order'],
      ["No, we aren't.", 'Yang ditanya "they", jadi jawab dengan "they".'],
    ], 'Jawaban singkat mengulang subjek dan to be dari pertanyaan: No, they aren\'t.', { focus: 'be-order' }),
    fix(3, 'She not is my teacher.', ["She is not my teacher", "She isn't my teacher", "She's not my teacher"], '"not" selalu diletakkan setelah to be.', undefined, { focus: 'be-order' }),
    tr(3, 'Apakah kalian siap?', ['Are you ready'], '"Kalian" = you; pertanyaan dimulai dengan "Are".', {
      'you are ready': ['Itu pernyataan. Pindahkan "are" ke depan untuk bertanya.', 'be-order'],
      'do you ready': ['"ready" kata sifat, jadi pakai to be: Are you ready?', 'be-order'],
    }, { focus: 'be-order' }),
  ],
});
