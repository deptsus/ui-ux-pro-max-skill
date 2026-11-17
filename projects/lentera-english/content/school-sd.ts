// Jalur Sekolah (Rilis 16) · Jalur SD (kelas 1–6, Fase A–C, A1). Bersama enam
// pelajaran Jalur Anak (Rilis 11–12) membentuk Jalur SD. Kalimat pendek,
// banyak gambar, penjelasan yang bisa dibacakan orang tua atau guru.
import { arrange, construct, dlg, fill, fix, lesson, match, mc, picture, scene, spell, spot, tf, tr } from './dsl';

const no = (en: string, id: string) => `Itu "${en}" (${id}).`;

export const sdGreetings = lesson({
  id: 'sd-greetings',
  title: 'Halo! Salam dan Perkenalan',
  summary: 'Menyapa dan berkenalan: Good morning! My name is Sari. Nice to meet you.',
  topic: 'sd.greetings',
  objectives: [
    'Menyapa sesuai waktu: Good morning, Good afternoon, Good evening.',
    'Menyebut nama dan menanyakan nama teman: My name is ... / What is your name?',
    'Menanyakan kabar dan menjawabnya dengan sopan: How are you? I am fine, thank you.',
  ],
  intro: 'Halo! Hari ini kita belajar menyapa dan berkenalan dalam bahasa Inggris. Bayangkan kamu bertemu teman baru di sekolah. Apa yang kamu ucapkan? Ayo kita pelajari!',
  teaching: [
    {
      heading: 'Salam sesuai waktu',
      body: 'Pagi sampai jam 12 siang: Good morning. Siang sampai sore: Good afternoon. Malam: Good evening. "Good night" diucapkan saat berpisah di malam hari atau mau tidur, bukan saat bertemu.',
      table: [
        ['Inggris', 'Indonesia', 'Kapan'],
        ['Good morning', 'Selamat pagi', 'pagi'],
        ['Good afternoon', 'Selamat siang/sore', 'siang sampai sore'],
        ['Good evening', 'Selamat malam', 'saat bertemu di malam hari'],
        ['Good night', 'Selamat tidur', 'saat berpisah di malam hari'],
      ],
    },
    {
      heading: 'Berkenalan',
      body: 'Sebut namamu dengan "My name is ..." atau "I am ...". Tanyakan nama teman dengan "What is your name?".',
      examples: [
        { en: 'Hello! My name is Sari.', id: 'Halo! Nama saya Sari.' },
        { en: 'What is your name?', id: 'Siapa namamu?' },
        { en: 'Nice to meet you.', id: 'Senang bertemu denganmu.' },
      ],
    },
    {
      heading: 'Menanyakan kabar',
      body: 'Jawab "How are you?" dengan "I am fine, thank you." lalu tanyakan balik: "And you?".',
      examples: [
        { en: 'How are you?', id: 'Apa kabar?' },
        { en: "I'm fine, thank you. And you?", id: 'Saya baik, terima kasih. Kamu?' },
        { en: 'Goodbye! See you tomorrow.', id: 'Sampai jumpa! Sampai besok.' },
      ],
    },
  ],
  demo: [
    ['My name is Sari.', 'My name are Sari.', '"My name" satu benda, jadi pakai "is".'],
    ["I'm fine, thank you.", 'I fine, thank you.', 'Butuh "am": I am fine, atau disingkat I\'m fine.'],
    ['Good evening, Mom!', 'Good night, Mom!', 'Saat baru bertemu di malam hari, pakai Good evening. Good night untuk berpisah atau tidur.'],
  ],
  guided: [
    match(1, 'Pasangkan salam dengan artinya.', [
      ['Good morning', 'Selamat pagi'],
      ['Good afternoon', 'Selamat siang'],
      ['Goodbye', 'Sampai jumpa'],
      ['Thank you', 'Terima kasih'],
    ], 'Salam yang paling sering dipakai di sekolah.'),
    mc(1, 'Jam 7 pagi kamu bertemu Bu Lina di gerbang sekolah. Apa yang kamu ucapkan?', null, [
      ['Good morning, Ms. Lina!', true],
      ['Good night, Ms. Lina!', 'Good night diucapkan saat berpisah di malam hari.'],
      ['Good evening, Ms. Lina!', 'Good evening untuk malam hari.'],
    ], 'Pagi hari: Good morning.'),
    dlg(1, 'Pilih jawaban yang tepat.', 'Bima: Hello! What is your name?', [
      ['My name is Sari.', true],
      ['I am fine.', '"I am fine" menjawab "How are you?", bukan menanyakan nama.'],
      ['Goodbye!', '"Goodbye" diucapkan saat berpisah.'],
    ], 'Pertanyaan nama dijawab dengan "My name is ...".'),
    mc(1, 'Pilih kata yang tepat.', 'My name ___ Bima.', [
      ['is', true],
      ['are', '"My name" satu benda, jadi pakai "is".'],
      ['am', '"am" hanya untuk "I".'],
    ], 'My name is ...'),
  ],
  independent: [
    fill(1, 'Hello! My ___ is Nadia.', ['name'], 'My name is ... = Nama saya ...', { names: ['"names" jamak. Nama kita satu: name.'] }),
    arrange(1, 'Senang bertemu denganmu.', 'Nice to meet you', ['your', 'are'], 'Ungkapan tetap saat berkenalan: Nice to meet you.'),
    tr(1, 'Selamat pagi!', ['Good morning!', 'Good morning'], 'Selamat pagi = Good morning.', { 'Good night': ['Good night untuk berpisah di malam hari.'] }),
    dlg(1, 'Pilih jawaban yang tepat.', 'Bu Lina: How are you today?', [
      ["I'm fine, thank you.", true],
      ['My name is Raka.', 'Bu Lina menanyakan kabar, bukan nama.'],
      ['Nice to meet you.', 'Ini diucapkan saat pertama berkenalan.'],
    ], 'How are you? → I am fine, thank you.'),
  ],
  homework: [
    tf(1, '"Good night" diucapkan saat baru bertemu teman di malam hari.', false, 'Saat bertemu di malam hari: Good evening. Good night untuk berpisah atau tidur.', 'Pernyataan ini salah.'),
    construct(1, 'nice / to / meet / you', ['Nice to meet you.', 'Nice to meet you!'], 'Ungkapan saat berkenalan.'),
    spot(1, 'My name are Sari.', 'are', 'is', '"My name" satu benda: My name is Sari.'),
  ],
  mastery: [
    tr(2, 'Siapa namamu?', ['What is your name?', "What's your name?"], 'Menanyakan nama: What is your name?', { 'Who is your name?': ['Untuk nama, bahasa Inggris memakai "What", bukan "Who".'] }),
    fix(2, 'I fine, thank you.', ["I'm fine, thank you.", 'I am fine, thank you.'], 'Butuh "am": I am fine.', { 'I fine, thank you.': ['Kalimatnya belum diubah.'] }),
    mc(2, 'Jam 7 malam kamu datang ke rumah nenek. Apa salam yang tepat?', null, [
      ['Good evening, Grandma!', true],
      ['Good night, Grandma!', 'Good night untuk berpisah atau mau tidur.'],
      ['Good morning, Grandma!', 'Good morning untuk pagi hari.'],
    ], 'Bertemu di malam hari: Good evening.'),
  ],
});

export const sdBody = lesson({
  id: 'sd-body',
  title: 'Tubuhku',
  summary: 'Menyebut anggota tubuh: I have two eyes. This is my nose.',
  topic: 'sd.body',
  objectives: [
    'Menyebut anggota tubuh: head, eye, ear, nose, mouth, hand, foot, tooth.',
    'Memakai bentuk jamak: two eyes, two hands; dan yang istimewa: feet, teeth.',
    'Menunjuk dan menyebut: This is my nose. I have two ears.',
  ],
  intro: 'Coba sentuh hidungmu! Dalam bahasa Inggris, hidung adalah "nose". Hari ini kita belajar nama-nama anggota tubuh sambil menunjuknya satu per satu.',
  teaching: [
    {
      heading: 'Anggota tubuh',
      body: 'Sebutkan sambil menunjuk bagian tubuhmu.',
      table: [
        ['Inggris', 'Indonesia'],
        ['head', 'kepala'],
        ['eye', 'mata'],
        ['ear', 'telinga'],
        ['nose', 'hidung'],
        ['mouth', 'mulut'],
        ['hand', 'tangan'],
        ['foot', 'kaki (telapak)'],
        ['tooth', 'gigi'],
      ],
    },
    {
      heading: 'Satu dan banyak',
      body: 'Kalau lebih dari satu, biasanya tambahkan -s: one eye, two eyes. Tapi ada yang berubah bentuk: foot jadi feet, tooth jadi teeth.',
      examples: [
        { en: 'I have two eyes.', id: 'Saya punya dua mata.' },
        { en: 'I have two feet.', id: 'Saya punya dua kaki.', note: 'Bukan "foots".' },
        { en: 'I brush my teeth.', id: 'Saya menggosok gigi.', note: 'Bukan "tooths".' },
      ],
    },
    {
      heading: 'This is my ...',
      body: 'Untuk menunjuk satu bagian tubuh: This is my ... Untuk yang jamak: These are my ...',
      examples: [
        { en: 'This is my nose.', id: 'Ini hidung saya.' },
        { en: 'These are my hands.', id: 'Ini tangan-tangan saya.' },
      ],
    },
  ],
  demo: [
    ['I have two feet.', 'I have two foots.', 'Jamak dari foot adalah feet.'],
    ['I have two ears.', 'I have two ear.', 'Lebih dari satu: tambahkan -s.'],
    ['This is my mouth.', 'This my mouth.', 'Jangan lupa "is": This is my mouth.'],
  ],
  guided: [
    picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'eye', [['eye', 'mata', true], ['ear', 'telinga', no('ear', 'telinga')], ['nose', 'hidung', no('nose', 'hidung')], ['mouth', 'mulut', no('mouth', 'mulut')]], '"Eye" artinya mata.'),
    match(1, 'Pasangkan anggota tubuh dengan artinya.', [
      ['head', 'kepala'],
      ['hand', 'tangan'],
      ['mouth', 'mulut'],
      ['ear', 'telinga'],
    ], 'Tunjuk bagian tubuhmu sambil menyebutnya.'),
    picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['hand', 'tangan', true], ['tooth', 'gigi', no('tooth', 'gigi')], ['eye', 'mata', no('eye', 'mata')], ['nose', 'hidung', no('nose', 'hidung')]], '"Hand" artinya tangan.', { audioText: 'hand' }),
    mc(1, 'Pilih kata yang tepat.', 'I have two ___.', [
      ['eyes', true],
      ['eye', 'Lebih dari satu: tambahkan -s.'],
      ['nose', 'Hidung kita hanya satu.'],
    ], 'Dua mata: two eyes.'),
  ],
  independent: [
    spell(1, 'nose', '"Nose" dieja n-o-s-e.', { pic: 'nose' }),
    fill(1, 'I have two ___. (kaki)', ['feet'], 'Jamak dari foot adalah feet.', { foots: ['Jamak dari foot bukan foots, tetapi feet.'], foot: ['Dua kaki, jadi jamak: feet.'] }),
    arrange(1, 'Ini hidung saya.', 'This is my nose', ['are', 'these'], 'This is my + satu benda.'),
    tr(1, 'dua telinga', ['two ears'], 'Jamak dari ear: ears.', { 'two ear': ['Lebih dari satu: tambahkan -s.'] }),
  ],
  homework: [
    tf(1, '"Teeth" adalah bentuk jamak dari "tooth".', true, 'one tooth, two teeth.', 'Pernyataan ini benar.'),
    spell(1, 'hand', '"Hand" dieja h-a-n-d.', { pic: 'hand' }),
    spot(1, 'I have two ear.', 'ear', 'ears', 'Dua telinga: two ears.'),
  ],
  mastery: [
    picture(2, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['mouth', 'mulut', true], ['ear', 'telinga', no('ear', 'telinga')], ['tooth', 'gigi', no('tooth', 'gigi')], ['hand', 'tangan', no('hand', 'tangan')]], '"Mouth" artinya mulut.', { audioText: 'mouth' }),
    tr(2, 'Saya punya dua mata.', ['I have two eyes.'], 'I have + two + eyes.', { 'I have two eye.': ['Dua mata: eyes.'] }),
    fix(2, 'I have two foots.', ['I have two feet.'], 'Jamak dari foot adalah feet.', { 'I have two foots.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const sdHouse = lesson({
  id: 'sd-house',
  title: 'Rumahku',
  summary: 'Ruangan dan benda di rumah, dan letaknya: There is a bed in my bedroom. The cat is under the table.',
  topic: 'sd.house',
  objectives: [
    'Menyebut ruangan: living room, bedroom, kitchen, bathroom.',
    'Memakai There is / There are untuk benda di rumah.',
    'Menyebut letak benda: in, on, under, next to.',
  ],
  intro: 'Rumahmu punya ruangan apa saja? Hari ini kita belajar nama ruangan dan benda di rumah, juga cara menyebut di mana letak suatu benda.',
  teaching: [
    {
      heading: 'Ruangan di rumah',
      body: 'Nama-nama ruangan di rumah.',
      table: [
        ['Inggris', 'Indonesia'],
        ['living room', 'ruang tamu/ruang keluarga'],
        ['bedroom', 'kamar tidur'],
        ['kitchen', 'dapur'],
        ['bathroom', 'kamar mandi'],
      ],
    },
    {
      heading: 'There is / There are',
      body: 'There is untuk satu benda, There are untuk banyak benda.',
      examples: [
        { en: 'There is a bed in my bedroom.', id: 'Ada tempat tidur di kamarku.' },
        { en: 'There are two chairs in the kitchen.', id: 'Ada dua kursi di dapur.' },
      ],
    },
    {
      heading: 'Di mana letaknya?',
      body: 'in = di dalam, on = di atas, under = di bawah, next to = di samping.',
      examples: [
        { en: 'The book is on the table.', id: 'Buku itu di atas meja.' },
        { en: 'The cat is under the bed.', id: 'Kucing itu di bawah tempat tidur.' },
        { en: 'The lamp is next to the bed.', id: 'Lampu itu di samping tempat tidur.' },
      ],
    },
  ],
  demo: [
    ['There is a lamp in my room.', 'There are a lamp in my room.', 'Satu lampu: There is.'],
    ['There are two chairs in the kitchen.', 'There is two chairs in the kitchen.', 'Dua kursi: There are.'],
    ['The cat is under the table.', 'The cat is under table.', 'Jangan lupa "the": under the table.'],
  ],
  guided: [
    match(1, 'Pasangkan ruangan dengan artinya.', [
      ['bedroom', 'kamar tidur'],
      ['kitchen', 'dapur'],
      ['bathroom', 'kamar mandi'],
      ['living room', 'ruang tamu'],
    ], 'Nama ruangan di rumah.'),
    picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'bed', [['bed', 'tempat tidur', true], ['door', 'pintu', no('door', 'pintu')], ['window', 'jendela', no('window', 'jendela')], ['chair', 'kursi', no('chair', 'kursi')]], '"Bed" artinya tempat tidur.'),
    scene(1, 'The lamp is on the table. Letakkan lampunya.', 'table', 'lamp', [['on', 'di atas meja', true], ['under', 'di bawah meja', '"Under" berarti di bawah.'], ['next', 'di samping meja', '"Next to" berarti di samping.']], '"On the table" artinya di atas meja.'),
    mc(1, 'Pilih kata yang tepat.', 'We cook in the ___.', [
      ['kitchen', true],
      ['bedroom', 'Kamar tidur untuk tidur.'],
      ['bathroom', 'Kamar mandi untuk mandi.'],
    ], 'Memasak di dapur: kitchen.'),
  ],
  independent: [
    fill(1, 'I sleep in my ___.', ['bedroom'], 'Tidur di kamar tidur: bedroom.', { kitchen: ['Dapur untuk memasak.'] }),
    scene(1, 'The bag is behind the chair. Letakkan tasnya.', 'chair', 'bag', [['behind', 'di belakang kursi', true], ['on', 'di atas kursi', '"On" berarti di atas.'], ['under', 'di bawah kursi', '"Under" berarti di bawah.']], '"Behind the chair" artinya di belakang kursi.'),
    arrange(1, 'Ada meja di dapur.', 'There is a table in the kitchen', ['are', 'on'], 'Satu meja: There is.'),
    spell(1, 'door', '"Door" dieja d-o-o-r.', { pic: 'door' }),
  ],
  homework: [
    tf(1, '"There are a bed in my room" adalah kalimat yang benar.', false, 'Satu tempat tidur: There is a bed in my room.', 'Pernyataan ini salah.'),
    construct(1, 'there / is / a / lamp / in / my / room', ['There is a lamp in my room.'], 'There is + satu benda + tempat.'),
    spot(1, 'There are a sofa in the living room.', 'are', 'is', 'Satu sofa: There is.'),
  ],
  mastery: [
    scene(2, 'The cat is next to the bed. Letakkan kucingnya.', 'bed', 'cat', [['next', 'di samping tempat tidur', true], ['on', 'di atas tempat tidur', '"On" berarti di atas.'], ['under', 'di bawah tempat tidur', '"Under" berarti di bawah.']], '"Next to the bed" artinya di samping tempat tidur.'),
    tr(2, 'Kucing itu di bawah meja.', ['The cat is under the table.'], 'The cat is + under + the table.', { 'The cat is on the table.': ['"on" berarti di atas. Di bawah: under.'] }),
    fix(2, 'There is two chairs in the kitchen.', ['There are two chairs in the kitchen.'], 'Dua kursi: There are.', { 'There is two chairs in the kitchen.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const sdTime = lesson({
  id: 'sd-time',
  title: 'Jam dan Hari',
  summary: "Menyebut jam dan hari: It's seven o'clock. On Monday, I go to school.",
  topic: 'sd.time',
  objectives: [
    "Menanyakan dan menyebut jam: What time is it? It's seven o'clock.",
    'Menyebut setengah jam: half past seven.',
    'Menyebut nama hari, dan memakai "on" sebelum hari: on Monday.',
  ],
  intro: 'Jam berapa kamu berangkat sekolah? Hari apa kamu les? Hari ini kita belajar menyebut jam dan nama hari dalam bahasa Inggris.',
  teaching: [
    {
      heading: 'Jam tepat dan setengah',
      body: "Jam tepat: It's ... o'clock. Setengah jam lewat: It's half past ...",
      examples: [
        { en: "It's seven o'clock.", id: 'Sekarang jam tujuh.' },
        { en: "It's half past seven.", id: 'Sekarang jam setengah delapan.', note: 'Bahasa Inggris menyebut "lewat setengah dari jam tujuh", bukan "setengah delapan".' },
        { en: 'What time is it?', id: 'Jam berapa sekarang?' },
      ],
    },
    {
      heading: 'Nama hari',
      body: 'Nama hari selalu diawali huruf besar.',
      table: [
        ['Inggris', 'Indonesia'],
        ['Monday', 'Senin'],
        ['Tuesday', 'Selasa'],
        ['Wednesday', 'Rabu'],
        ['Thursday', 'Kamis'],
        ['Friday', 'Jumat'],
        ['Saturday', 'Sabtu'],
        ['Sunday', 'Minggu'],
      ],
    },
    {
      heading: 'On + hari, at + jam',
      body: 'Sebelum nama hari pakai "on". Sebelum jam pakai "at".',
      examples: [
        { en: 'I go to school on Monday.', id: 'Saya pergi ke sekolah hari Senin.' },
        { en: 'I wake up at six o\'clock.', id: 'Saya bangun jam enam.' },
      ],
    },
  ],
  demo: [
    ["It's seven o'clock.", "It's seven o'clocks.", "o'clock tidak pernah memakai -s."],
    ['I go swimming on Sunday.', 'I go swimming in Sunday.', 'Sebelum nama hari: on.'],
    ["It's half past eight.", "It's half eight past.", 'Urutannya: half past + jam.'],
  ],
  guided: [
    match(1, 'Pasangkan hari dengan artinya.', [
      ['Monday', 'Senin'],
      ['Wednesday', 'Rabu'],
      ['Friday', 'Jumat'],
      ['Sunday', 'Minggu'],
    ], 'Nama hari dalam bahasa Inggris.'),
    mc(1, 'Jam menunjukkan 07.00. Pilih kalimat yang tepat.', null, [
      ["It's seven o'clock.", true],
      ["It's half past seven.", 'Half past seven = 07.30.'],
      ["It's seven o'clocks.", "o'clock tidak memakai -s."],
    ], "Jam tepat: It's ... o'clock."),
    mc(1, 'Jam menunjukkan 09.30. Pilih kalimat yang tepat.', null, [
      ["It's half past nine.", true],
      ["It's half past ten.", 'Half past ten = 10.30.'],
      ["It's nine o'clock.", "Nine o'clock = 09.00."],
    ], "09.30: It's half past nine."),
    tf(1, '"Saturday" artinya hari Sabtu.', true, 'Saturday = Sabtu.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'Today is ___. (Jumat)', ['Friday'], 'Jumat = Friday. Nama hari diawali huruf besar.', { Saturday: ['Saturday = Sabtu.'] }),
    tr(1, 'Jam berapa sekarang?', ['What time is it?', "What's the time?", 'What is the time?'], 'Menanyakan jam: What time is it?', { 'What time it is?': ['Pertanyaan: What time is it?'] }),
    arrange(1, 'Sekarang jam delapan.', "It is eight o'clock", ['at', 'on'], "It is + angka + o'clock."),
    mc(1, 'Pilih kata yang tepat.', 'I play football ___ Saturday.', [
      ['on', true],
      ['in', 'Sebelum nama hari: on.'],
      ['at', '"at" untuk jam: at six o\'clock.'],
    ], 'on + nama hari.'),
  ],
  homework: [
    tf(1, '"Half past seven" artinya jam setengah tujuh.', false, 'Half past seven = 07.30 = setengah delapan.', 'Pernyataan ini salah.'),
    construct(1, 'it / is / half / past / nine', ['It is half past nine.', "It's half past nine."], 'It is + half past + jam.'),
    spot(1, 'I go to school in Monday.', 'in', 'on', 'Sebelum nama hari: on Monday.'),
  ],
  mastery: [
    tr(2, 'Hari Senin saya pergi ke sekolah.', ['On Monday, I go to school.', 'On Monday I go to school.', 'I go to school on Monday.'], 'on + Monday.', { 'In Monday, I go to school.': ['Sebelum nama hari: on.'] }),
    fix(2, "It's seven o'clocks.", ["It's seven o'clock.", "It is seven o'clock."], "o'clock tidak memakai -s.", { "It's seven o'clocks.": ['Kalimatnya belum diubah.'] }),
    mc(2, 'Pilih jawaban yang tepat.', 'The day after Tuesday is ___.', [
      ['Wednesday', true],
      ['Monday', 'Monday sebelum Tuesday.'],
      ['Thursday', 'Thursday dua hari setelah Tuesday.'],
    ], 'Senin, Selasa, Rabu: Monday, Tuesday, Wednesday.'),
  ],
});

export const sdWeather = lesson({
  id: 'sd-weather',
  title: 'Cuaca',
  summary: "Menyebut cuaca: It's sunny today. It's rainy, take an umbrella!",
  topic: 'sd.weather',
  objectives: [
    'Menyebut cuaca: sunny, rainy, cloudy, windy, stormy.',
    "Membuat kalimat cuaca: It's sunny today.",
    'Mengenal dua musim di Indonesia: rainy season dan dry season.',
  ],
  intro: 'Lihat ke luar jendela. Cerah atau hujan? Hari ini kita belajar menyebut cuaca dalam bahasa Inggris.',
  teaching: [
    {
      heading: 'Kata cuaca',
      body: 'Untuk cuaca kita memakai kata sifat yang berakhiran -y.',
      table: [
        ['Benda', 'Cuaca', 'Indonesia'],
        ['sun', 'sunny', 'cerah'],
        ['rain', 'rainy', 'hujan'],
        ['cloud', 'cloudy', 'berawan'],
        ['wind', 'windy', 'berangin'],
        ['storm', 'stormy', 'badai'],
      ],
    },
    {
      heading: "It's ... today",
      body: 'Cuaca selalu dimulai dengan "It is" atau "It\'s".',
      examples: [
        { en: "It's sunny today.", id: 'Hari ini cerah.' },
        { en: "It's rainy. Take an umbrella!", id: 'Hujan. Bawa payung!' },
        { en: "It's hot.", id: 'Panas.' },
      ],
    },
    {
      heading: 'Musim di Indonesia',
      body: 'Indonesia punya dua musim.',
      examples: [
        { en: 'the rainy season', id: 'musim hujan' },
        { en: 'the dry season', id: 'musim kemarau' },
      ],
    },
  ],
  demo: [
    ["It's sunny today.", "It's sun today.", 'Untuk cuaca pakai kata sifat: sunny.'],
    ['It is rainy.', 'Is rainy.', 'Kalimat cuaca dimulai dengan It is.'],
    ["It's windy today.", "It's wind today.", 'wind (angin) jadi windy (berangin).'],
  ],
  guided: [
    picture(1, 'Ketuk gambar yang sesuai dengan cuaca ini.', "It's rainy.", [['rain', 'hujan', true], ['sun', 'cerah', 'Itu "sunny" (cerah).'], ['cloud', 'berawan', 'Itu "cloudy" (berawan).'], ['storm', 'badai', 'Itu "stormy" (badai).']], '"Rainy" artinya hujan.'),
    match(1, 'Pasangkan cuaca dengan artinya.', [
      ['sunny', 'cerah'],
      ['cloudy', 'berawan'],
      ['windy', 'berangin'],
      ['rainy', 'hujan'],
    ], 'Kata cuaca berakhiran -y.'),
    mc(1, 'Hari ini hujan. Apa yang kamu bawa?', null, [
      ['an umbrella', true],
      ['a hat', 'Topi untuk hari cerah.'],
      ['a ball', 'Bola untuk bermain.'],
    ], 'Hujan: bawa payung (umbrella).'),
    picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['wind', 'berangin', true], ['snow', 'salju', 'Itu "snowy" (bersalju).'], ['sun', 'cerah', 'Itu "sunny" (cerah).'], ['rainbow', 'pelangi', 'Itu "rainbow" (pelangi).']], '"Windy" artinya berangin.', { audioText: 'windy' }),
  ],
  independent: [
    fill(1, "It's ___ today. Take an umbrella!", ['rainy'], 'Bawa payung karena hujan: rainy.', { rain: ['Untuk cuaca pakai kata sifat: rainy.'], sunny: ['Payung untuk hujan.'] }),
    spell(1, 'rain', '"Rain" dieja r-a-i-n.', { pic: 'rain' }),
    tr(1, 'Hari ini panas.', ["It's hot today.", 'It is hot today.', 'Today is hot.'], "It's hot today.", { 'Is hot today.': ['Mulai dengan It is.'] }),
  ],
  homework: [
    tf(1, '"Dry season" artinya musim kemarau.', true, 'dry season = musim kemarau.', 'Pernyataan ini benar.'),
    construct(1, 'it / is / windy / today', ['It is windy today.', "It's windy today."], 'It is + cuaca + today.'),
    spot(1, 'It is rain today.', 'rain', 'rainy', 'Untuk cuaca: rainy.'),
  ],
  mastery: [
    tr(2, 'Hari ini berawan.', ["It's cloudy today.", 'It is cloudy today.', 'Today is cloudy.'], 'berawan = cloudy.', { "It's cloud today.": ['Untuk cuaca: cloudy.'] }),
    fix(2, 'It is sun today.', ['It is sunny today.', "It's sunny today."], 'Untuk cuaca: sunny.', { 'It is sun today.': ['Kalimatnya belum diubah.'] }),
    picture(2, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['storm', 'badai', true], ['rain', 'hujan', 'Itu "rainy" (hujan).'], ['cloud', 'berawan', 'Itu "cloudy" (berawan).'], ['wind', 'berangin', 'Itu "windy" (berangin).']], '"Stormy" artinya badai.', { audioText: 'stormy' }),
  ],
});

export const sdHobbies = lesson({
  id: 'sd-hobbies',
  title: 'Hobiku',
  summary: "Menceritakan hobi: I like drawing. Do you like swimming? Yes, I do.",
  topic: 'sd.hobbies',
  objectives: [
    'Menyebut hobi: swimming, reading, drawing, singing, cycling, playing football.',
    'Memakai I like + kata kerja -ing: I like reading.',
    "Bertanya dan menjawab: Do you like ...? Yes, I do. / No, I don't.",
  ],
  intro: 'Apa hobimu? Menggambar, berenang, atau bermain bola? Hari ini kita belajar menceritakan hobi dan menanyakan hobi teman.',
  teaching: [
    {
      heading: 'Nama hobi',
      body: 'Banyak hobi memakai kata kerja + -ing.',
      table: [
        ['Inggris', 'Indonesia'],
        ['swimming', 'berenang'],
        ['reading', 'membaca'],
        ['drawing', 'menggambar'],
        ['singing', 'bernyanyi'],
        ['cycling', 'bersepeda'],
        ['playing football', 'bermain sepak bola'],
      ],
    },
    {
      heading: 'I like ...',
      body: 'Setelah like, pakai bentuk -ing.',
      examples: [
        { en: 'I like drawing.', id: 'Saya suka menggambar.' },
        { en: 'My hobby is reading.', id: 'Hobi saya membaca.' },
        { en: 'She likes singing.', id: 'Dia (perempuan) suka bernyanyi.', note: 'He/She + likes.' },
      ],
    },
    {
      heading: 'Do you like ...?',
      body: "Jawab dengan Yes, I do atau No, I don't.",
      examples: [
        { en: 'Do you like swimming?', id: 'Apakah kamu suka berenang?' },
        { en: "Yes, I do. / No, I don't.", id: 'Ya, suka. / Tidak.' },
      ],
    },
  ],
  demo: [
    ['I like swimming.', 'I like swim.', 'Setelah like pakai -ing: swimming.'],
    ['She likes drawing.', 'She like drawing.', 'He/She + likes.'],
    ["No, I don't.", 'No, I not.', "Jawaban pendek: No, I don't."],
  ],
  guided: [
    match(1, 'Pasangkan hobi dengan artinya.', [
      ['swimming', 'berenang'],
      ['reading', 'membaca'],
      ['drawing', 'menggambar'],
      ['cycling', 'bersepeda'],
    ], 'Hobi memakai bentuk -ing.'),
    picture(1, 'Ketuk gambar yang sesuai dengan hobi ini.', 'reading', [['book', 'membaca', true], ['ball', 'bermain bola', 'Bola untuk "playing football".'], ['bicycle', 'bersepeda', 'Sepeda untuk "cycling".'], ['flower', 'berkebun', 'Bunga untuk "gardening".']], '"Reading" artinya membaca.'),
    mc(1, 'Pilih kata yang tepat.', 'I like ___.', [
      ['swimming', true],
      ['swim', 'Setelah like pakai -ing: swimming.'],
      ['swims', '"swims" bukan bentuk yang dipakai setelah like.'],
    ], 'like + -ing.'),
    dlg(1, 'Pilih jawaban yang tepat.', 'Raka: Do you like singing?', [
      ['Yes, I do.', true],
      ['Yes, I like.', "Jawaban pendek: Yes, I do."],
      ['Yes, I am.', '"am" menjawab pertanyaan dengan "Are you ...?".'],
    ], "Do you ...? → Yes, I do. / No, I don't."),
  ],
  independent: [
    fill(1, 'I like ___. (berenang)', ['swimming'], 'Berenang: swimming (m ditulis dua kali).', { swiming: ['Ejaannya swimming, dengan dua m.'], swim: ['Setelah like pakai -ing.'] }),
    tr(1, 'Hobi saya menggambar.', ['My hobby is drawing.'], 'My hobby is + -ing.', { 'My hobby is draw.': ['Pakai -ing: drawing.'] }),
    arrange(1, 'Apakah kamu suka bernyanyi?', 'Do you like singing', ['Does', 'sing'], 'Do you like + -ing?'),
    spell(1, 'sing', '"Sing" dieja s-i-n-g.', { meaning: 'bernyanyi' }),
  ],
  homework: [
    tf(1, '"She like drawing" adalah kalimat yang benar.', false, 'He/She + likes: She likes drawing.', 'Pernyataan ini salah.'),
    construct(1, "I / don't / like / cycling", ["I don't like cycling.", 'I do not like cycling.'], "I don't like + -ing."),
    spot(1, 'She like drawing.', 'like', 'likes', 'He/She + likes.'),
  ],
  mastery: [
    tr(2, 'Saya suka bermain sepak bola.', ['I like playing football.', 'I like to play football.', 'I like playing soccer.'], 'I like + playing football.', { 'I like play football.': ['Pakai -ing: playing.'] }),
    fix(2, 'Do you like swim?', ['Do you like swimming?'], 'like + -ing: swimming.', { 'Do you like swim?': ['Kalimatnya belum diubah.'] }),
    picture(2, 'Dengarkan hobi ini, lalu ketuk gambarnya.', null, [['bicycle', 'bersepeda', true], ['book', 'membaca', 'Buku untuk "reading".'], ['ball', 'bermain bola', 'Bola untuk "playing football".'], ['flower', 'berkebun', 'Bunga untuk "gardening".']], '"Cycling" artinya bersepeda.', { audioText: 'cycling' }),
  ],
});

export const sdJobs = lesson({
  id: 'sd-jobs',
  title: 'Cita-citaku',
  summary: 'Pekerjaan dan cita-cita: I want to be a doctor. My father is a farmer.',
  topic: 'sd.jobs',
  objectives: [
    'Menyebut pekerjaan: teacher, doctor, nurse, police officer, farmer, chef, pilot.',
    'Memakai "a" sebelum pekerjaan: She is a teacher.',
    'Menyebut cita-cita: I want to be a pilot.',
  ],
  intro: 'Kalau sudah besar, kamu ingin jadi apa? Dokter, guru, atau pilot? Hari ini kita belajar nama pekerjaan dan cara menyebut cita-cita.',
  teaching: [
    {
      heading: 'Nama pekerjaan',
      body: 'Pekerjaan dan apa yang mereka lakukan.',
      table: [
        ['Inggris', 'Indonesia', 'Kegiatannya'],
        ['teacher', 'guru', 'teaches students'],
        ['doctor', 'dokter', 'helps sick people'],
        ['nurse', 'perawat', 'helps doctors and patients'],
        ['police officer', 'polisi', 'keeps us safe'],
        ['farmer', 'petani', 'grows rice and vegetables'],
        ['chef', 'koki', 'cooks food'],
        ['pilot', 'pilot', 'flies a plane'],
      ],
    },
    {
      heading: 'Jangan lupa "a"',
      body: 'Sebelum nama pekerjaan (satu orang) pakai "a".',
      examples: [
        { en: 'She is a teacher.', id: 'Dia seorang guru.' },
        { en: 'My father is a farmer.', id: 'Ayah saya seorang petani.' },
      ],
    },
    {
      heading: 'Cita-cita',
      body: 'I want to be a ... = Saya ingin menjadi ...',
      examples: [
        { en: 'I want to be a doctor.', id: 'Saya ingin menjadi dokter.' },
        { en: 'He wants to be a pilot.', id: 'Dia ingin menjadi pilot.', note: 'He/She + wants.' },
      ],
    },
  ],
  demo: [
    ['She is a nurse.', 'She is nurse.', 'Sebelum pekerjaan pakai "a".'],
    ['I want to be a chef.', 'I want be a chef.', 'want to be: jangan lupa "to".'],
    ['He wants to be a pilot.', 'He want to be a pilot.', 'He/She + wants.'],
  ],
  guided: [
    picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'doctor', [['doctor', 'dokter', true], ['teacher', 'guru', no('teacher', 'guru')], ['chef', 'koki', no('chef', 'koki')], ['farmer', 'petani', no('farmer', 'petani')]], '"Doctor" artinya dokter.'),
    match(1, 'Pasangkan pekerjaan dengan artinya.', [
      ['teacher', 'guru'],
      ['farmer', 'petani'],
      ['nurse', 'perawat'],
      ['chef', 'koki'],
    ], 'Nama-nama pekerjaan.'),
    picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['pilot', 'pilot', true], ['police', 'polisi', no('police officer', 'polisi')], ['nurse', 'perawat', no('nurse', 'perawat')], ['teacher', 'guru', no('teacher', 'guru')]], '"Pilot" mengemudikan pesawat.', { audioText: 'pilot' }),
    mc(1, 'Pilih kata yang tepat.', 'A ___ cooks food.', [
      ['chef', true],
      ['pilot', 'Pilot menerbangkan pesawat.'],
      ['farmer', 'Petani menanam padi dan sayur.'],
    ], 'Koki memasak: chef.'),
  ],
  independent: [
    fill(1, 'I want to ___ a teacher.', ['be'], 'want to be = ingin menjadi.', { is: ['Setelah want to pakai bentuk dasar: be.'] }),
    tr(1, 'Ayah saya seorang petani.', ['My father is a farmer.'], 'My father is + a + farmer.', { 'My father is farmer.': ['Sebelum pekerjaan pakai "a".'] }),
    spell(1, 'chef', '"Chef" dieja c-h-e-f.', { pic: 'chef' }),
    picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'nurse', [['nurse', 'perawat', true], ['doctor', 'dokter', no('doctor', 'dokter')], ['chef', 'koki', no('chef', 'koki')], ['pilot', 'pilot', no('pilot', 'pilot')]], '"Nurse" artinya perawat.'),
  ],
  homework: [
    tf(1, '"A pilot flies a plane." artinya pilot menerbangkan pesawat.', true, 'pilot = pilot, flies = menerbangkan.', 'Pernyataan ini benar.'),
    construct(1, 'I / want / to / be / a / doctor', ['I want to be a doctor.'], 'I want to be + a + pekerjaan.'),
    spot(1, 'He want to be a pilot.', 'want', 'wants', 'He/She + wants.'),
  ],
  mastery: [
    tr(2, 'Saya ingin menjadi pilot.', ['I want to be a pilot.'], 'I want to be a pilot.', { 'I want be a pilot.': ['Jangan lupa "to": want to be.'] }),
    fix(2, 'She is teacher.', ['She is a teacher.'], 'Sebelum pekerjaan pakai "a".', { 'She is teacher.': ['Kalimatnya belum diubah.'] }),
    picture(2, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['police', 'polisi', true], ['pilot', 'pilot', no('pilot', 'pilot')], ['farmer', 'petani', no('farmer', 'petani')], ['doctor', 'dokter', no('doctor', 'dokter')]], '"Police officer" artinya polisi.', { audioText: 'police officer' }),
  ],
});
