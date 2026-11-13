// A1 · Bab 1 · Unit 2 — Benda di Sekitar Kita (a/an, this/that/these/those)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr, vocab } from './dsl';

export const articles = lesson({
  id: 'a1-articles',
  title: 'Artikel A dan An',
  summary: 'Memakai a atau an di depan benda tunggal berdasarkan bunyi awalnya.',
  topic: 'a1.articles',
  objectives: [
    'Memakai "a" atau "an" di depan kata benda tunggal yang bisa dihitung.',
    'Memilih a/an berdasarkan BUNYI awal kata, bukan hurufnya.',
    'Menyebutkan pekerjaan dan benda dengan artikel yang tepat.',
  ],
  intro: 'Bahasa Indonesia berkata "Saya guru". Bahasa Inggris harus berkata "I am a teacher", dengan kata kecil "a". Kata kecil itu disebut artikel. Pelajaran ini mengajarkan kapan memakai "a", kapan "an", dan kapan tidak memakainya.',
  teaching: [
    {
      heading: 'Kapan memakai a / an',
      body: 'Pakai a/an di depan SATU benda yang bisa dihitung, termasuk nama pekerjaan. Artinya kurang lebih "sebuah / seorang / seekor". Jangan pakai a/an untuk benda jamak.',
      examples: [
        { en: 'I am a student.', id: 'Saya (seorang) pelajar.' },
        { en: 'It is a book.', id: 'Itu (sebuah) buku.' },
        { en: 'They are students.', id: 'Mereka pelajar.', note: 'Jamak: tanpa a/an.' },
      ],
    },
    {
      heading: 'A atau an? Dengarkan bunyinya',
      body: 'Pakai "an" jika kata berikutnya diawali BUNYI vokal (a, i, u, e, o). Pakai "a" jika diawali bunyi konsonan. Yang menentukan adalah bunyi, bukan huruf: "hour" dibaca /aʊər/ (h tidak dibunyikan) sehingga "an hour"; "university" dibaca /juː.../ (bunyi "yu") sehingga "a university".',
      table: [
        ['a + bunyi konsonan', 'an + bunyi vokal'],
        ['a book, a teacher, a car', 'an apple, an egg, an umbrella'],
        ['a university (bunyi "yu")', 'an hour (h tidak dibunyikan)'],
        ['a uniform (bunyi "yu")', 'an engineer, an orange'],
      ],
    },
  ],
  demo: [
    ['She is an engineer.', 'She is a engineer.', '"engineer" diawali bunyi vokal /e/, jadi artikelnya "an".'],
    ['He is a doctor.', 'He is doctor.', 'Nama pekerjaan tunggal wajib diberi a/an.'],
    ['It is a university.', 'It is an university.', '"university" diawali bunyi "yu" (konsonan), jadi "a".'],
  ],
  vocab: ['apple', 'book', 'umbrella', 'engineer', 'hour'],
  guided: [
    mc(1, 'Pilih artikel yang tepat.', 'I have ___ apple.', [
      ['an', true],
      ['a', '"apple" diawali bunyi vokal /æ/, jadi memakai "an".', 'a-an'],
      ['(tanpa artikel)', 'Satu benda yang bisa dihitung perlu a/an.', 'a-an'],
    ], '"apple" diawali bunyi vokal, jadi "an apple".', { focus: 'a-an', hint: 'Ucapkan kata "apple". Bunyi pertamanya vokal atau konsonan?' }),
    match(1, 'Pasangkan artikel dengan kata bendanya.', [
      ['a', 'teacher'],
      ['an', 'umbrella'],
    ], '"teacher" diawali bunyi konsonan (a teacher); "umbrella" diawali bunyi vokal (an umbrella).', { focus: 'a-an' }),
    fill(1, 'My father is ___ engineer.', ['an'], '"engineer" diawali bunyi vokal /e/, jadi "an engineer".', {
      a: ['"engineer" diawali bunyi vokal, jadi "an", bukan "a".', 'a-an'],
    }, { focus: 'a-an', hint: 'Bunyi pertama "engineer" adalah /e/.' }),
    tf(1, '"A hour" adalah bentuk yang benar karena "hour" diawali huruf h.', false, 'Huruf h pada "hour" tidak dibunyikan. Kata itu diawali bunyi vokal, jadi yang benar "an hour".', 'Yang menentukan a/an adalah bunyi, bukan huruf.', { focus: 'a-an', tag: 'a-an', hint: 'Bagaimana "hour" diucapkan? Apakah h-nya terdengar?' }),
  ],
  independent: [
    fill(2, 'She studies at ___ university in Yogyakarta.', ['a'], '"university" diawali bunyi "yu" (konsonan), jadi "a university".', {
      an: ['Huruf pertamanya memang u, tetapi bunyinya "yu" (konsonan). Pakai "a".', 'a-an'],
    }, { focus: 'a-an' }),
    tr(2, 'Dia (laki-laki) adalah seorang dokter.', ['He is a doctor', "He's a doctor"], 'Pekerjaan tunggal memakai artikel: a doctor.', {
      'he is doctor': ['Nama pekerjaan tunggal wajib diberi artikel: a doctor.', 'a-an'],
      'he is an doctor': ['"doctor" diawali bunyi konsonan, jadi "a doctor".', 'a-an'],
    }, { focus: 'a-an' }),
    spot(2, 'This is a orange from my garden.', 'a', 'an', '"orange" diawali bunyi vokal /ɒ/, jadi "an orange".', { focus: 'a-an' }),
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['They are nurses.', true],
      ['They are a nurses.', 'a/an tidak dipakai untuk benda jamak (nurses).', 'a-an'],
      ['They are an nurses.', 'a/an tidak dipakai untuk benda jamak (nurses).', 'a-an'],
      ['They are nurse.', 'Subjek "they" jamak, jadi kata bendanya juga jamak: nurses.'],
    ], 'Kata benda jamak tidak memakai a/an: They are nurses.', { focus: 'a-an' }),
  ],
  homework: [
    fix(2, 'I am student.', ['I am a student', "I'm a student"], 'Kata benda tunggal yang bisa dihitung perlu artikel: a student.', undefined, { focus: 'a-an' }),
    construct(2, 'is / umbrella / it / an', ['It is an umbrella', "It's an umbrella"], 'It + is + an + umbrella.', undefined, { focus: 'a-an' }),
    fill(2, 'We wait for ___ hour.', ['an'], 'Huruf h pada "hour" tidak dibunyikan, jadi "an hour".', { a: ['"hour" dibaca tanpa bunyi h, jadi diawali bunyi vokal: an hour.', 'a-an'] }, { focus: 'a-an' }),
  ],
  mastery: [
    fill(2, 'Rina is ___ artist.', ['an'], '"artist" diawali bunyi vokal /ɑː/, jadi "an artist".', { a: ['"artist" diawali bunyi vokal, jadi "an".', 'a-an'] }, { focus: 'a-an' }),
    mc(2, 'Pilih artikel yang tepat.', 'He wears ___ uniform to school.', [
      ['a', true],
      ['an', '"uniform" diawali bunyi "yu" (konsonan), jadi "a uniform".', 'a-an'],
      ['(tanpa artikel)', 'Satu benda yang bisa dihitung perlu artikel.', 'a-an'],
    ], '"uniform" dibaca /ˈjuːnɪfɔːm/. Bunyi awalnya "yu", jadi "a uniform".', { focus: 'a-an' }),
    tr(3, 'Itu adalah sebuah telur.', ['It is an egg', "It's an egg", 'That is an egg', "That's an egg"], '"egg" diawali bunyi vokal, jadi "an egg".', {
      'it is a egg': ['"egg" diawali bunyi vokal /e/, jadi "an egg".', 'a-an'],
      'it is egg': ['Benda tunggal perlu artikel: an egg.', 'a-an'],
    }, { focus: 'a-an' }),
    fix(3, 'My sisters are a teachers.', ['My sisters are teachers'], 'a/an hanya untuk benda tunggal. "teachers" jamak, jadi tanpa artikel.', undefined, { focus: 'a-an' }),
    arrange(3, 'Ayah saya adalah seorang insinyur.', 'My father is an engineer', ['a', 'are'], 'My father (he) + is + an engineer. "engineer" diawali bunyi vokal.', { focus: 'a-an' }),
  ],
});

export const demonstratives = lesson({
  id: 'a1-demonstratives',
  title: 'This, That, These, Those',
  summary: 'Menunjuk benda dekat/jauh, tunggal/jamak, dan membentuk kata benda jamak.',
  topic: 'a1.demonstratives',
  objectives: [
    'Memakai this/these untuk benda dekat dan that/those untuk benda jauh.',
    'Membedakan tunggal (this, that + is) dan jamak (these, those + are).',
    'Membentuk kata benda jamak dengan -s atau -es.',
  ],
  intro: 'Bahasa Indonesia hanya punya "ini" dan "itu". Bahasa Inggris punya empat: this, that, these, those. Pilihannya bergantung pada dua hal: dekat atau jauh, dan satu atau banyak.',
  teaching: [
    {
      heading: 'Empat kata penunjuk',
      body: 'Tanyakan dua hal: (1) dekat atau jauh? (2) satu atau lebih dari satu? Kata penunjuk tunggal berpasangan dengan "is", yang jamak dengan "are".',
      table: [
        ['', 'Dekat (ini)', 'Jauh (itu)'],
        ['Tunggal + is', 'This is a pen.', 'That is a bird.'],
        ['Jamak + are', 'These are pens.', 'Those are birds.'],
      ],
    },
    {
      heading: 'Kata benda jamak',
      body: 'Bahasa Indonesia mengulang kata (buku-buku). Bahasa Inggris menambahkan -s. Kata yang berakhiran -s, -x, -ch, -sh ditambah -es. Beberapa kata tidak beraturan dan harus dihafal.',
      table: [
        ['Aturan', 'Contoh'],
        ['+ s', 'book → books, chair → chairs'],
        ['+ es (akhiran s, x, ch, sh)', 'box → boxes, watch → watches, bus → buses'],
        ['Tidak beraturan', 'man → men, woman → women, child → children'],
      ],
    },
  ],
  demo: [
    ['These are my books.', 'This are my books.', '"books" jamak, jadi penunjuknya "these", bukan "this".'],
    ['That is my house.', 'Those is my house.', '"house" tunggal, jadi penunjuknya "that".'],
    ['Those are boxes.', 'Those are boxs.', 'Kata berakhiran -x mendapat tambahan -es: boxes.'],
  ],
  vocab: ['pen', 'chair', 'box', 'child', 'house'],
  guided: [
    mc(1, 'Kamu memegang SATU pensil. Pilih kata penunjuk yang tepat.', '___ is my pencil.', [
      ['This', true],
      ['These', '"These" untuk benda jamak. Pensilnya hanya satu.', 'this-these'],
      ['That', 'Pensilnya sedang kamu pegang (dekat), jadi bukan "that".', 'this-these'],
      ['Those', '"Those" untuk benda jamak yang jauh.', 'this-these'],
    ], 'Satu benda dan dekat: "this".', { focus: 'this-these', hint: 'Bendanya satu dan sedang kamu pegang.' }),
    match(1, 'Pasangkan bentuk tunggal dengan bentuk jamaknya.', [
      ['book', 'books'],
      ['box', 'boxes'],
      ['child', 'children'],
      ['watch', 'watches'],
    ], 'book+s, box+es, watch+es, dan child berubah tidak beraturan menjadi children.', { focus: 'plural' }),
    fill(1, '___ are my shoes. (sepatu ada di kakimu)', ['These'], '"shoes" jamak dan dekat, jadi "These".', {
      this: ['"shoes" jamak. "This" hanya untuk satu benda.', 'this-these'],
      those: ['Sepatunya ada di kakimu (dekat), jadi "these", bukan "those".', 'this-these'],
    }, { focus: 'this-these', hint: 'Jamak dan dekat.' }),
    tf(1, 'Kalimat "That are my friends over there." sudah benar.', false, '"friends" jamak dan jauh, jadi yang benar "Those are my friends over there."', '"That" hanya untuk satu benda/orang. Di sini ada "are" dan "friends" (jamak).', { focus: 'this-these', tag: 'this-these', hint: 'Lihat to be dan kata bendanya: tunggal atau jamak?' }),
  ],
  independent: [
    fill(2, 'Look at the sky! ___ is a plane.', ['That'], 'Satu pesawat dan jauh di langit: "That".', {
      this: ['Pesawatnya jauh di langit, jadi "that".', 'this-these'],
      those: ['Pesawatnya hanya satu ("is a plane"), jadi "that".', 'this-these'],
    }, { focus: 'this-these' }),
    tr(2, 'Ini adalah buku-buku saya.', ['These are my books'], 'Jamak dan dekat: These + are + my books.', {
      'this is my books': ['"books" jamak, jadi "These are", bukan "This is".', 'this-these'],
      'this are my books': ['Untuk jamak, kata penunjuknya "These".', 'this-these'],
      'these are my book': ['Karena lebih dari satu, kata bendanya jamak: books.', 'plural'],
    }, { focus: 'this-these' }),
    fill(2, 'There are three ___ on the table. (box)', ['boxes'], 'Kata berakhiran -x ditambah -es: boxes.', { boxs: ['Kata berakhiran -x mendapat -es, bukan -s.', 'plural'], box: ['Ada tiga, jadi harus jamak: boxes.', 'plural'] }, { focus: 'plural', prompt: 'Tulis bentuk jamak kata dalam kurung.' }),
    spot(2, 'Those is my grandparents in the photo.', 'is', 'are', '"Those" dan "grandparents" jamak, jadi to be-nya "are".', { focus: 'this-these' }),
  ],
  homework: [
    construct(2, 'are / chairs / those / old', ['Those are old chairs', 'Those chairs are old'], 'Jamak dan jauh: Those + are + old chairs.', undefined, { focus: 'this-these' }),
    fill(2, 'The two ___ are playing in the park. (child)', ['children'], '"child" tidak beraturan: jamaknya "children", bukan "childs".', { childs: ['"child" tidak beraturan. Jamaknya "children".', 'plural'] }, { focus: 'plural', prompt: 'Tulis bentuk jamak kata dalam kurung.' }),
    fix(2, 'This are my keys.', ['These are my keys'], '"keys" jamak, jadi penunjuknya "These".', undefined, { focus: 'this-these' }),
  ],
  mastery: [
    mc(2, 'Temanmu menunjuk beberapa burung jauh di atas pohon. Kalimat mana yang tepat?', null, [
      ['Those are birds.', true],
      ['These are birds.', 'Burungnya jauh, jadi "those", bukan "these".', 'this-these'],
      ['That is birds.', '"birds" jamak, jadi "Those are".', 'this-these'],
      ['This is birds.', 'Burungnya jamak dan jauh.', 'this-these'],
    ], 'Jamak dan jauh: "Those are birds."', { focus: 'this-these' }),
    fill(2, '___ is my mother. (ibumu berdiri di sebelahmu)', ['This'], 'Satu orang dan dekat: "This is my mother." Ini juga cara memperkenalkan seseorang.', { that: ['Ibumu berdiri di sebelahmu (dekat), jadi "this".', 'this-these'], these: ['Hanya satu orang, jadi "this".', 'this-these'] }, { focus: 'this-these' }),
    fill(3, 'I have two ___. (watch)', ['watches'], 'Kata berakhiran -ch ditambah -es: watches.', { watchs: ['Kata berakhiran -ch mendapat -es.', 'plural'], watch: ['Ada dua, jadi harus jamak.', 'plural'] }, { focus: 'plural', prompt: 'Tulis bentuk jamak kata dalam kurung.' }),
    tr(3, 'Itu adalah rumah saya.', ['That is my house', "That's my house"], 'Satu rumah dan jauh: That + is + my house.', {
      'those is my house': ['"house" tunggal, jadi "That is".', 'this-these'],
      'that are my house': ['"That" tunggal berpasangan dengan "is".', 'am-is-are'],
    }, { focus: 'this-these' }),
    fix(3, 'These womans are doctors.', ['These women are doctors'], '"woman" tidak beraturan: jamaknya "women".', undefined, { focus: 'plural' }),
  ],
});

/** Chapter-level homework for Bab 1: vocabulary, reading and a short writing task. */
export const chapter1Homework = {
  vocabulary: [
    match(1, 'Pasangkan kata dengan artinya.', [
      ['teacher', 'guru'],
      ['friend', 'teman'],
      ['hungry', 'lapar'],
      ['umbrella', 'payung'],
      ['house', 'rumah'],
    ], 'Kelima kata ini muncul di pelajaran Bab 1.', { topic: 'a1.greetings' }),
    vocab(2, 'Pilih kata yang paling cocok dengan konteks.', 'It is raining. Take an ___.', [
      ['umbrella', true],
      ['apple', '"apple" berarti apel, tidak berhubungan dengan hujan.'],
      ['hour', '"hour" berarti jam (lamanya waktu).'],
      ['engineer', '"engineer" berarti insinyur.'],
    ], 'Saat hujan (raining) kita membawa payung: umbrella.', { topic: 'a1.articles' }),
    vocab(2, 'Pilih kata yang paling cocok dengan konteks.', 'I want to eat. I am ___.', [
      ['hungry', true],
      ['tired', '"tired" berarti lelah. Orang yang ingin makan itu lapar.'],
      ['busy', '"busy" berarti sibuk.'],
      ['ready', '"ready" berarti siap.'],
    ], 'Ingin makan = lapar = hungry.', { topic: 'a1.to-be' }),
  ],
  reading: [
    read(2, 'Hello! My name is Sari. I am from Semarang. I am a student. This is my friend, Tom. He is from London. He is an engineer. We are happy today.', 'Where is Tom from?', [
      ['London', true],
      ['Semarang', 'Yang berasal dari Semarang adalah Sari ("I am from Semarang").'],
      ['Indonesia', 'Teks menyebut Tom berasal dari London.'],
      ['Teks tidak menyebutkannya', 'Ada kalimat "He is from London."'],
    ], 'Kalimat "He is from London" menjelaskan asal Tom.', { topic: 'a1.to-be' }),
    read(2, 'Hello! My name is Sari. I am from Semarang. I am a student. This is my friend, Tom. He is from London. He is an engineer. We are happy today.', 'What is Tom\'s job?', [
      ['He is an engineer.', true],
      ['He is a student.', 'Yang pelajar adalah Sari ("I am a student").'],
      ['He is a teacher.', 'Kata "teacher" tidak ada di dalam teks.'],
      ['He is a friend.', '"friend" bukan pekerjaan. Teks menyebut "He is an engineer."'],
    ], 'Teks menyebut "He is an engineer."', { topic: 'a1.articles' }),
    tf(2, 'Menurut teks: Sari and Tom are happy today.', true, 'Kalimat terakhir teks: "We are happy today." "We" = Sari dan Tom.', '"We" pada kalimat terakhir merujuk pada Sari dan Tom.', { topic: 'a1.to-be' }),
  ],
};

export const unit2Extras = [
  dlg(2, 'Lengkapi percakapan berikut.', 'A: Is this your umbrella?\nB: ___', [
    ['No, it isn\'t. That is my umbrella.', true],
    ['No, they aren\'t.', 'Pertanyaannya tentang satu benda (this), jadi jawabannya memakai "it".', 'this-these'],
    ['Yes, I am.', '"I am" menjawab pertanyaan "Are you ...?", bukan "Is this ...?".'],
    ['No, it aren\'t.', '"It" berpasangan dengan "isn\'t".', 'am-is-are'],
  ], 'Pertanyaan "Is this ...?" dijawab dengan "it": Yes, it is. / No, it isn\'t.', { topic: 'a1.demonstratives', focus: 'this-these' }),
];
