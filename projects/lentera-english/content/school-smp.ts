// Jalur Sekolah (Rilis 16) · Jalur SMP (kelas 7–9, Fase D, A1–A2). Jenis teks
// yang dipelajari di SMP, dengan contoh dan bacaan bernuansa Indonesia.
import { arrange, construct, fill, fix, lesson, match, mc, para, read, spot, tf, timeline, tr } from './dsl';

const NADIA = 'My best friend is Nadia. She is in class 8B at my school. Nadia is tall and slim. She wears a white hijab, and she has bright brown eyes. Nadia is very kind and smart. She always helps me with Maths. She is also funny, so everybody likes her.';
const TOBA = 'Lake Toba is located in North Sumatra. It is the biggest lake in Indonesia. In the middle of the lake, there is an island called Samosir. The air around the lake is cool, and the view is beautiful. Many tourists visit Lake Toba every year, especially during school holidays.';
const MSG = 'To: Bima\nFrom: Raka\nBima, I can\'t come to football practice this afternoon because I have to take my grandmother to the doctor. Please tell Coach Anton. Don\'t forget to bring my ball back tomorrow. Thanks!';
const ANNOUNCE = 'Attention, please. All students of class 7 must gather in the school hall on Friday at 8 a.m. We will have a talk about healthy food. Please bring a notebook and a pen. Thank you.';
const CARD = 'Dear Sari,\nCongratulations on winning the drawing competition! Your picture of the rice field was amazing. We are very proud of you. Keep drawing!\nLove,\nNadia and Bima';
const TEA = 'How to Make Iced Sweet Tea\nMaterials: a tea bag, hot water, two spoons of sugar, ice cubes, a glass.\nSteps: First, put the tea bag in a glass. Next, pour the hot water into the glass. Then, wait for three minutes and take out the tea bag. After that, add the sugar and stir. Finally, put in the ice cubes. Your iced sweet tea is ready!';
const HOLIDAY = 'Last school holiday, my family and I went to Yogyakarta. On the first day, we visited Prambanan Temple. It was very big and beautiful. The next day, we walked along Malioboro Street and bought some batik. In the evening, we ate gudeg. On the last day, we went home by train. I was tired, but I was very happy.';
const KANCIL = 'Once upon a time, a mouse deer named Kancil lived in a forest. One day, he wanted to eat the fruit across the river, but there were many hungry crocodiles in the water. Kancil had an idea. He said, "The King wants to count all the crocodiles. Please line up!" The crocodiles lined up across the river. Kancil jumped on their backs and counted, "One, two, three ..." When he reached the other side, he laughed and ran away. The crocodiles were very angry, but Kancil was safe.';

export const smpPeople = lesson({
  id: 'smp-describe-people',
  title: 'Mendeskripsikan Orang',
  summary: 'Teks deskriptif tentang orang: She is tall and kind. She has brown eyes.',
  topic: 'smp.describe-people',
  objectives: [
    'Mengenali susunan teks deskriptif: identifikasi lalu deskripsi.',
    'Menggambarkan penampilan dengan is dan has: He is tall. He has short hair.',
    'Menggambarkan sifat: kind, friendly, smart, funny, patient.',
  ],
  intro: 'Bagaimana kamu menggambarkan sahabatmu dalam bahasa Inggris? Teks deskriptif memperkenalkan seseorang (identifikasi), lalu menggambarkan penampilan dan sifatnya (deskripsi).',
  teaching: [
    {
      heading: 'Susunan teks deskriptif',
      body: 'Identifikasi: siapa orangnya. Deskripsi: penampilan, sifat, kebiasaan. Teks ini memakai simple present.',
      examples: [
        { en: 'My best friend is Nadia.', id: 'Sahabat saya Nadia. (identifikasi)' },
        { en: 'She is tall and slim. She is very kind.', id: 'Dia tinggi dan ramping. Dia sangat baik hati. (deskripsi)' },
      ],
    },
    {
      heading: 'is atau has?',
      body: 'is + kata sifat (tinggi, baik). has + benda yang dimiliki (rambut, mata). Untuk I/you/we/they pakai are/have.',
      examples: [
        { en: 'He is tall.', id: 'Dia tinggi.' },
        { en: 'He has short curly hair.', id: 'Rambutnya pendek keriting.' },
        { en: 'They have brown eyes.', id: 'Mata mereka cokelat.' },
      ],
    },
    {
      heading: 'Kata sifat yang sering dipakai',
      body: 'Penampilan dan sifat.',
      table: [
        ['Penampilan', 'Arti', 'Sifat', 'Arti'],
        ['tall', 'tinggi', 'kind', 'baik hati'],
        ['short', 'pendek', 'friendly', 'ramah'],
        ['slim', 'ramping', 'smart', 'pintar'],
        ['curly', 'keriting', 'funny', 'lucu'],
        ['straight', 'lurus', 'patient', 'sabar'],
      ],
    },
  ],
  demo: [
    ['She has long hair.', 'She is long hair.', 'Untuk benda yang dimiliki pakai has.'],
    ['He is very friendly.', 'He has very friendly.', 'Untuk sifat pakai is.'],
    ['She has short black hair.', 'She have short black hair.', 'He/She + has.'],
  ],
  guided: [
    match(1, 'Pasangkan kata sifat dengan artinya.', [
      ['tall', 'tinggi'],
      ['curly', 'keriting'],
      ['kind', 'baik hati'],
      ['funny', 'lucu'],
    ], 'Kata sifat untuk penampilan dan sifat.'),
    mc(1, 'Pilih kata yang tepat.', 'Bima ___ short curly hair.', [
      ['has', true],
      ['is', 'Rambut adalah sesuatu yang dimiliki: has.'],
      ['have', '"Bima" = he, jadi has.'],
    ], 'He/She + has + benda yang dimiliki.'),
    read(1, NADIA, 'Bagaimana sifat Nadia?', [
      ['kind, smart, and funny', true],
      ['tall and slim', 'Itu penampilannya, bukan sifatnya.'],
      ['shy and quiet', 'Tidak disebut dalam teks.'],
    ], 'Teks menyebut: Nadia is very kind and smart ... She is also funny.'),
    tf(1, 'Kalimat pertama teks deskriptif biasanya memperkenalkan siapa yang dideskripsikan.', true, 'Itu bagian identifikasi.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'My brother ___ brown eyes.', ['has'], 'He + has + benda yang dimiliki.', { is: ['Mata adalah sesuatu yang dimiliki: has.'], have: ['"My brother" = he, jadi has.'] }),
    tr(1, 'Guru saya sabar dan ramah.', ['My teacher is patient and friendly.'], 'is + sifat.', { 'My teacher has patient and friendly.': ['Untuk sifat pakai is.'] }),
    arrange(1, 'Dia punya rambut hitam panjang.', 'She has long black hair', ['is', 'have'], 'has + panjang + warna + hair.'),
    read(1, NADIA, 'What does Nadia wear?', [
      ['a white hijab', true],
      ['a black hat', 'Tidak disebut dalam teks.'],
      ['glasses', 'Tidak disebut dalam teks.'],
    ], 'She wears a white hijab.'),
  ],
  homework: [
    read(1, NADIA, 'Kalimat mana yang termasuk bagian identifikasi?', [
      ['My best friend is Nadia.', true],
      ['Nadia is tall and slim.', 'Itu deskripsi penampilan.'],
      ['She always helps me with Maths.', 'Itu deskripsi kebiasaan.'],
    ], 'Identifikasi memperkenalkan siapa orangnya.'),
    construct(1, 'my / teacher / is / kind / and / smart', ['My teacher is kind and smart.'], 'Subjek + is + sifat.'),
    spot(1, 'She have short hair.', 'have', 'has', 'He/She + has.'),
  ],
  mastery: [
    tr(2, 'Rambutnya pendek dan keriting.', ['Her hair is short and curly.', 'His hair is short and curly.', 'She has short curly hair.', 'He has short curly hair.'], 'Her/His hair is ... atau She/He has ... hair.', { 'She is short curly hair.': ['Untuk rambut pakai has, atau "Her hair is ...".'] }),
    fix(2, 'He is has brown eyes.', ['He has brown eyes.'], 'Pakai has saja, tanpa is.', { 'He is has brown eyes.': ['Kalimatnya belum diubah.'] }),
    mc(2, 'Kalimat mana yang paling tepat untuk bagian deskripsi?', null, [
      ['She is friendly and always smiles.', true],
      ['This is my cousin, Laras.', 'Itu identifikasi.'],
      ['Goodbye, Laras!', 'Itu salam, bukan deskripsi.'],
    ], 'Deskripsi menggambarkan sifat atau penampilan.'),
  ],
});

export const smpPlaces = lesson({
  id: 'smp-describe-places',
  title: 'Mendeskripsikan Tempat',
  summary: 'Teks deskriptif tentang tempat: Lake Toba is located in North Sumatra. It is famous for its view.',
  topic: 'smp.describe-places',
  objectives: [
    'Menyebut letak tempat: is located in ...',
    'Menyebut keistimewaan: is famous for ...',
    'Menggambarkan tempat dengan There is/are dan kata sifat: crowded, quiet, beautiful.',
  ],
  intro: 'Indonesia penuh tempat indah: Danau Toba, Borobudur, Raja Ampat. Hari ini kita belajar menggambarkan tempat seperti pemandu wisata.',
  teaching: [
    {
      heading: 'Letak dan keistimewaan',
      body: 'is located in + kota/provinsi. is famous for + hal yang terkenal.',
      examples: [
        { en: 'Borobudur Temple is located in Magelang, Central Java.', id: 'Candi Borobudur terletak di Magelang, Jawa Tengah.' },
        { en: 'Bali is famous for its beaches.', id: 'Bali terkenal karena pantainya.' },
      ],
    },
    {
      heading: 'There is / There are',
      body: 'Untuk menyebut apa saja yang ada di tempat itu.',
      examples: [
        { en: 'There is an island in the middle of the lake.', id: 'Ada sebuah pulau di tengah danau.' },
        { en: 'There are many food stalls near the beach.', id: 'Ada banyak warung makan dekat pantai.' },
      ],
    },
    {
      heading: 'Kata sifat untuk tempat',
      body: 'Kata sifat yang sering dipakai.',
      table: [
        ['Inggris', 'Indonesia'],
        ['crowded', 'ramai'],
        ['quiet', 'sepi'],
        ['beautiful', 'indah'],
        ['famous', 'terkenal'],
        ['cool', 'sejuk'],
      ],
    },
  ],
  demo: [
    ['Bali is famous for its beaches.', 'Bali is famous of its beaches.', 'famous for, bukan famous of.'],
    ['It is located in Central Java.', 'It located in Central Java.', 'Jangan lupa is: is located.'],
    ['There are many tourists.', 'There is many tourists.', 'Banyak turis: There are.'],
  ],
  guided: [
    match(1, 'Pasangkan kata dengan artinya.', [
      ['crowded', 'ramai'],
      ['quiet', 'sepi'],
      ['famous', 'terkenal'],
      ['cool', 'sejuk'],
    ], 'Kata sifat untuk menggambarkan tempat.'),
    mc(1, 'Pilih kata yang tepat.', 'Borobudur is located ___ Magelang.', [
      ['in', true],
      ['at', 'Untuk kota dan provinsi pakai in.'],
      ['on', '"on" untuk jalan atau permukaan.'],
    ], 'located in + kota.'),
    read(1, TOBA, 'Where is Lake Toba?', [
      ['in North Sumatra', true],
      ['in Bali', 'Teks menyebut North Sumatra.'],
      ['on Samosir Island', 'Samosir ada di tengah danau.'],
    ], 'Lake Toba is located in North Sumatra.'),
    tf(1, '"Famous for" artinya terkenal karena.', true, 'Bali is famous for its beaches.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'Bali is famous ___ its beaches.', ['for'], 'famous for = terkenal karena.', { of: ['Bukan "of", tetapi "for".'] }),
    tr(1, 'Sekolah saya terletak di Jalan Merdeka.', ['My school is located on Merdeka Street.', 'My school is on Merdeka Street.', 'My school is located in Merdeka Street.', 'My school is located on Jalan Merdeka.'], 'is located on + nama jalan.', { 'My school located on Merdeka Street.': ['Jangan lupa is: is located.'] }),
    arrange(1, 'Ada perpustakaan besar di sekolah saya.', 'There is a big library in my school', ['are', 'on'], 'Satu perpustakaan: There is.'),
    read(1, TOBA, 'What is in the middle of the lake?', [
      ['an island called Samosir', true],
      ['a big temple', 'Tidak disebut dalam teks.'],
      ['a beach', 'Tidak disebut dalam teks.'],
    ], 'In the middle of the lake, there is an island called Samosir.'),
  ],
  homework: [
    read(1, TOBA, 'When do many tourists visit Lake Toba?', [
      ['during school holidays', true],
      ['only in the rainy season', 'Tidak disebut dalam teks.'],
      ['at night', 'Tidak disebut dalam teks.'],
    ], 'Many tourists visit ... especially during school holidays.'),
    construct(1, 'the / market / is / very / crowded', ['The market is very crowded.'], 'Subjek + is + very + sifat.'),
    spot(1, 'There are a big park near my house.', 'are', 'is', 'Satu taman: There is.'),
  ],
  mastery: [
    tr(2, 'Danau Toba terkenal karena pemandangannya.', ['Lake Toba is famous for its view.', 'Lake Toba is famous for its views.', 'Lake Toba is famous for its scenery.'], 'is famous for + its + ...', { 'Lake Toba is famous of its view.': ['famous for, bukan famous of.'] }),
    fix(2, 'Borobudur is located at Magelang.', ['Borobudur is located in Magelang.'], 'Untuk kota pakai in.', { 'Borobudur is located at Magelang.': ['Kalimatnya belum diubah.'] }),
    mc(2, 'Pilih kalimat yang paling tepat untuk teks deskripsi tempat.', null, [
      ['The beach is quiet in the morning, and the water is clear.', true],
      ['I went to the beach yesterday.', 'Itu cerita pengalaman (recount), memakai simple past.'],
      ['Please go to the beach.', 'Itu permintaan, bukan deskripsi.'],
    ], 'Deskripsi tempat memakai simple present dan kata sifat.'),
  ],
});

export const smpMessages = lesson({
  id: 'smp-messages',
  title: 'Pesan Singkat dan Pengumuman',
  summary: "Membaca dan menulis pesan singkat dan pengumuman: Please tell Coach Anton. Don't forget to bring a pen.",
  topic: 'smp.messages',
  objectives: [
    'Memahami isi dan tujuan pesan singkat dan pengumuman.',
    "Menulis permintaan dengan Please ... dan Don't forget to ...",
    'Menemukan informasi penting: siapa, kapan, di mana, membawa apa.',
  ],
  intro: 'Setiap hari kita membaca pesan dari teman dan pengumuman dari sekolah. Dalam bahasa Inggris, pesan singkat dan pengumuman memakai kalimat perintah yang sopan.',
  teaching: [
    {
      heading: 'Pesan singkat (short message)',
      body: 'Ada pengirim (From), penerima (To), dan isi pesan. Isinya singkat dan jelas.',
      examples: [
        { en: "I can't come to practice this afternoon.", id: 'Saya tidak bisa datang latihan sore ini.' },
        { en: 'Please tell Coach Anton.', id: 'Tolong beri tahu Pelatih Anton.' },
        { en: "Don't forget to bring my ball back.", id: 'Jangan lupa kembalikan bolaku.' },
      ],
    },
    {
      heading: 'Pengumuman (announcement)',
      body: 'Dibuka dengan "Attention, please." Lalu siapa, apa, kapan, di mana, dan apa yang harus dibawa.',
      examples: [
        { en: 'All students must gather in the school hall.', id: 'Semua siswa harus berkumpul di aula sekolah.' },
        { en: 'Please bring a notebook and a pen.', id: 'Harap membawa buku catatan dan pena.' },
      ],
    },
    {
      heading: 'Kalimat perintah yang sopan',
      body: "Please + kata kerja dasar. Don't forget to + kata kerja dasar.",
      examples: [
        { en: 'Please bring your dictionary.', id: 'Tolong bawa kamusmu.' },
        { en: "Don't forget to call me.", id: 'Jangan lupa telepon saya.' },
      ],
    },
  ],
  demo: [
    ['Please bring your dictionary.', 'Please brings your dictionary.', 'Setelah please pakai kata kerja dasar.'],
    ["Don't forget to call me.", "Don't forgot to call me.", "Don't + kata kerja dasar: forget."],
    ['Attention, please.', 'Please attention.', 'Pembuka pengumuman: Attention, please.'],
  ],
  guided: [
    read(1, MSG, 'Why can\'t Raka come to football practice?', [
      ['He has to take his grandmother to the doctor.', true],
      ['He is sick.', 'Tidak disebut dalam pesan.'],
      ['He lost his ball.', 'Bolanya ada pada Bima.'],
    ], 'I have to take my grandmother to the doctor.'),
    read(1, ANNOUNCE, 'Who must gather in the school hall?', [
      ['all students of class 7', true],
      ['all teachers', 'Pengumuman ditujukan untuk siswa kelas 7.'],
      ['the parents', 'Tidak disebut dalam pengumuman.'],
    ], 'All students of class 7 must gather in the school hall.'),
    mc(1, 'Pilih kata yang tepat.', 'Please ___ your homework on Monday.', [
      ['bring', true],
      ['brings', 'Setelah please pakai kata kerja dasar.'],
      ['brought', 'Setelah please pakai kata kerja dasar.'],
    ], 'Please + kata kerja dasar.'),
    tf(1, 'Pengumuman dalam bahasa Inggris sering dibuka dengan "Attention, please."', true, 'Pembuka yang umum untuk pengumuman.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, "Don't ___ to bring your book.", ['forget'], "Don't forget to = jangan lupa.", { forgot: ["Setelah don't pakai kata kerja dasar: forget."] }),
    tr(1, 'Tolong kembalikan bukuku besok.', ['Please return my book tomorrow.', 'Please give my book back tomorrow.', 'Please give back my book tomorrow.', 'Please bring my book back tomorrow.'], 'Please + return/give back + ...', { 'Please returns my book tomorrow.': ['Setelah please pakai kata kerja dasar.'] }),
    arrange(1, 'Jangan lupa membawa payung.', "Don't forget to bring an umbrella", ['a', 'brings'], "Don't forget to + kata kerja dasar."),
    read(1, ANNOUNCE, 'What should the students bring?', [
      ['a notebook and a pen', true],
      ['healthy food', 'Itu topik acaranya.'],
      ['a dictionary', 'Tidak disebut dalam pengumuman.'],
    ], 'Please bring a notebook and a pen.'),
  ],
  homework: [
    read(1, MSG, 'What should Bima do tomorrow?', [
      ["bring Raka's ball back", true],
      ['go to the doctor', 'Raka yang mengantar neneknya.'],
      ['buy a new ball', 'Tidak disebut dalam pesan.'],
    ], "Don't forget to bring my ball back tomorrow."),
    construct(1, 'please / tell / your / teacher', ['Please tell your teacher.'], 'Please + kata kerja dasar.'),
    spot(1, 'Please brings your dictionary.', 'brings', 'bring', 'Setelah please pakai kata kerja dasar.'),
  ],
  mastery: [
    tr(2, 'Harap datang jam tujuh pagi.', ['Please come at seven a.m.', 'Please come at 7 a.m.', 'Please come at seven in the morning.', "Please come at seven o'clock in the morning."], 'Please + come + at + jam.', { 'Please coming at seven a.m.': ['Setelah please pakai kata kerja dasar.'] }),
    fix(2, "Don't forgot to call me.", ["Don't forget to call me."], "Don't + kata kerja dasar.", { "Don't forgot to call me.": ['Kalimatnya belum diubah.'] }),
    read(2, ANNOUNCE, 'When is the meeting?', [
      ['on Friday at 8 a.m.', true],
      ['on Monday at 8 a.m.', 'Teks menyebut Friday.'],
      ['on Friday at 8 p.m.', 'p.m. berarti malam; teks menyebut 8 a.m.'],
    ], 'on Friday at 8 a.m.'),
  ],
});

export const smpCards = lesson({
  id: 'smp-greeting-cards',
  title: 'Kartu Ucapan',
  summary: 'Menulis ucapan selamat dan doa: Congratulations on winning! Get well soon! Happy Eid al-Fitr!',
  topic: 'smp.greeting-cards',
  objectives: [
    'Memilih ucapan yang tepat untuk berbagai acara.',
    'Memakai Congratulations on + kata benda / -ing.',
    'Menulis kartu ucapan singkat: sapaan, ucapan, harapan, nama pengirim.',
  ],
  intro: 'Temanmu juara lomba? Nenekmu sakit? Saat Lebaran? Kartu ucapan dalam bahasa Inggris membuat orang lain senang. Ayo belajar menulisnya.',
  teaching: [
    {
      heading: 'Ucapan untuk berbagai acara',
      body: 'Pilih ucapan sesuai acaranya.',
      table: [
        ['Acara', 'Ucapan'],
        ['ulang tahun', 'Happy birthday!'],
        ['menang lomba / lulus', 'Congratulations on ...!'],
        ['sakit', 'Get well soon!'],
        ['Idulfitri', 'Happy Eid al-Fitr!'],
        ['Natal', 'Merry Christmas!'],
        ['Tahun Baru', 'Happy New Year!'],
      ],
    },
    {
      heading: 'Congratulations on ...',
      body: 'Congratulations selalu berakhiran -s, lalu on + kata benda atau kata kerja -ing.',
      examples: [
        { en: 'Congratulations on your graduation!', id: 'Selamat atas kelulusanmu!' },
        { en: 'Congratulations on winning the competition!', id: 'Selamat atas kemenanganmu dalam lomba!' },
      ],
    },
    {
      heading: 'Susunan kartu ucapan',
      body: 'Dear + nama, ucapan, harapan atau pujian, lalu nama pengirim.',
      examples: [
        { en: 'Dear Sari, Congratulations on winning! We are proud of you. Love, Nadia', id: 'Sari tersayang, selamat atas kemenanganmu! Kami bangga padamu. Salam sayang, Nadia' },
      ],
    },
  ],
  demo: [
    ['Congratulations on your success!', 'Congratulation on your success!', 'Selalu Congratulations, dengan -s.'],
    ['Congratulations on winning!', 'Congratulations for winning!', 'Congratulations on, bukan for.'],
    ['Get well soon!', 'Get good soon!', 'Ungkapan tetap: Get well soon.'],
  ],
  guided: [
    match(1, 'Pasangkan acara dengan ucapannya.', [
      ['ulang tahun', 'Happy birthday!'],
      ['sakit', 'Get well soon!'],
      ['Idulfitri', 'Happy Eid al-Fitr!'],
      ['Tahun Baru', 'Happy New Year!'],
    ], 'Ucapan yang paling sering dipakai.'),
    mc(1, 'Teman sekelasmu sedang dirawat di rumah sakit. Apa yang kamu tulis?', null, [
      ['Get well soon!', true],
      ['Congratulations!', 'Untuk keberhasilan, bukan saat sakit.'],
      ['Happy birthday!', 'Untuk ulang tahun.'],
    ], 'Untuk orang sakit: Get well soon!'),
    read(1, CARD, 'Why do Nadia and Bima send the card?', [
      ['Sari won a drawing competition.', true],
      ['It is Sari\'s birthday.', 'Tidak disebut dalam kartu.'],
      ['Sari is sick.', 'Tidak disebut dalam kartu.'],
    ], 'Congratulations on winning the drawing competition!'),
    tf(1, '"Congratulations" ditulis dengan huruf -s di akhir.', true, 'Congratulations, bukan Congratulation.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'Congratulations ___ your graduation!', ['on'], 'Congratulations on + ...', { for: ['Congratulations on, bukan for.'] }),
    tr(1, 'Semoga lekas sembuh!', ['Get well soon!', 'Get well soon'], 'Get well soon!', { 'Get good soon!': ['Ungkapan tetap: Get well soon.'] }),
    arrange(1, 'Selamat atas kemenanganmu!', 'Congratulations on your victory', ['for', 'Congratulation'], 'Congratulations on + your + ...'),
    read(1, CARD, 'What did Sari draw?', [
      ['a rice field', true],
      ['a beach', 'Teks menyebut rice field (sawah).'],
      ['her family', 'Tidak disebut dalam kartu.'],
    ], 'Your picture of the rice field was amazing.'),
  ],
  homework: [
    mc(1, 'Kakakmu lulus kuliah. Ucapan mana yang tepat?', null, [
      ['Congratulations on your graduation!', true],
      ['Get well soon!', 'Untuk orang sakit.'],
      ['Merry Christmas!', 'Untuk hari Natal.'],
    ], 'Untuk kelulusan: Congratulations on your graduation!'),
    construct(1, 'congratulations / on / your / success', ['Congratulations on your success!', 'Congratulations on your success.'], 'Congratulations on + your + ...'),
    spot(1, 'Congratulation on your success!', 'Congratulation', 'Congratulations', 'Selalu Congratulations.'),
  ],
  mastery: [
    tr(2, 'Selamat ulang tahun, Nadia!', ['Happy birthday, Nadia!', 'Happy birthday Nadia!'], 'Happy birthday + nama.', { 'Happy birth day, Nadia!': ['Ditulis birthday, satu kata.'] }),
    fix(2, 'Congratulations for winning the match!', ['Congratulations on winning the match!'], 'Congratulations on, bukan for.', { 'Congratulations for winning the match!': ['Kalimatnya belum diubah.'] }),
    mc(2, 'Bagian mana yang biasanya ada di akhir kartu ucapan?', null, [
      ['nama pengirim, misalnya "Love, Nadia"', true],
      ['"Attention, please."', 'Itu pembuka pengumuman.'],
      ['daftar bahan', 'Itu bagian teks prosedur.'],
    ], 'Kartu ditutup dengan nama pengirim.'),
  ],
});

export const smpProcedure = lesson({
  id: 'smp-procedure',
  title: 'Teks Prosedur',
  summary: 'Langkah membuat sesuatu: First, put the tea bag in a glass. Next, pour the hot water. Finally, add ice.',
  topic: 'smp.procedure',
  objectives: [
    'Mengenali susunan teks prosedur: tujuan, bahan, langkah-langkah.',
    'Memakai kalimat perintah: Boil, Cut, Pour, Add, Stir.',
    'Mengurutkan langkah dengan First, Next, Then, After that, Finally.',
  ],
  intro: 'Pernah membaca resep atau cara memakai alat? Itu teks prosedur. Kalimatnya dimulai dengan kata kerja, dan langkahnya diurutkan dengan kata penghubung.',
  teaching: [
    {
      heading: 'Susunan teks prosedur',
      body: 'Goal (tujuan, biasanya judul "How to ..."), Materials (bahan dan alat), Steps (langkah).',
      examples: [
        { en: 'How to Make Iced Sweet Tea', id: 'Cara Membuat Es Teh Manis' },
        { en: 'Materials: a tea bag, hot water, sugar, ice cubes.', id: 'Bahan: kantong teh, air panas, gula, es batu.' },
      ],
    },
    {
      heading: 'Kalimat perintah',
      body: 'Setiap langkah dimulai dengan kata kerja dasar, tanpa subjek.',
      table: [
        ['Inggris', 'Indonesia'],
        ['boil', 'rebus/didihkan'],
        ['cut', 'potong'],
        ['pour', 'tuang'],
        ['add', 'tambahkan'],
        ['stir', 'aduk'],
        ['mix', 'campur'],
      ],
    },
    {
      heading: 'Kata penanda urutan',
      body: 'First → Next → Then → After that → Finally.',
      examples: [
        { en: 'First, boil the water.', id: 'Pertama, didihkan air.' },
        { en: 'Finally, serve the noodles.', id: 'Terakhir, sajikan mi.' },
      ],
    },
  ],
  demo: [
    ['First, boil the water.', 'First, you boiling the water.', 'Langkah memakai kata kerja dasar: boil.'],
    ['Then, add some salt.', 'Then, adds some salt.', 'Kalimat perintah tidak memakai -s.'],
    ['Finally, serve it warm.', 'Finally, served it warm.', 'Kalimat perintah memakai bentuk dasar.'],
  ],
  guided: [
    match(1, 'Pasangkan kata kerja dengan artinya.', [
      ['cut', 'potong'],
      ['pour', 'tuang'],
      ['stir', 'aduk'],
      ['add', 'tambahkan'],
    ], 'Kata kerja yang sering ada di resep.'),
    read(1, TEA, 'What do you do after you pour the hot water?', [
      ['Wait for three minutes and take out the tea bag.', true],
      ['Put in the ice cubes.', 'Itu langkah terakhir.'],
      ['Put the tea bag in a glass.', 'Itu langkah pertama.'],
    ], 'Then, wait for three minutes and take out the tea bag.'),
    mc(1, 'Pilih kata yang tepat untuk memulai langkah terakhir.', '___, put in the ice cubes.', [
      ['Finally', true],
      ['First', 'First untuk langkah pertama.'],
      ['Next', 'Next untuk langkah di tengah.'],
    ], 'Langkah terakhir: Finally.'),
    para(1, 'Urutkan langkah membuat mi instan.', [
      'First, boil two glasses of water.',
      'Next, put the noodles into the boiling water.',
      'Then, cook them for three minutes.',
      'Finally, add the seasoning and stir.',
    ], 'Urutan: First, Next, Then, Finally.'),
  ],
  independent: [
    fill(1, '___, pour the tea into a cup. (Terakhir)', ['Finally'], 'Terakhir = Finally.', { First: ['First = pertama.'] }),
    tr(1, 'Potong bawangnya.', ['Cut the onion.', 'Cut the onions.', 'Slice the onion.', 'Slice the onions.'], 'Kalimat perintah: Cut + the + ...', { 'You cut the onion.': ['Kalimat perintah tanpa subjek.'] }),
    arrange(1, 'Pertama, didihkan airnya.', 'First boil the water', ['boils', 'you'], 'First + kata kerja dasar + ...'),
    read(1, TEA, 'How many spoons of sugar do you need?', [
      ['two', true],
      ['three', 'Tiga adalah lama menunggu (menit).'],
      ['one', 'Teks menyebut two spoons of sugar.'],
    ], 'Materials: ... two spoons of sugar ...'),
  ],
  homework: [
    para(1, 'Urutkan langkah membuat teh manis.', [
      'First, put a tea bag in a glass.',
      'Next, pour hot water into the glass.',
      'After that, add some sugar.',
      'Finally, stir the tea.',
    ], 'Urutan: First, Next, After that, Finally.'),
    construct(1, 'then / add / some / salt', ['Then, add some salt.', 'Then add some salt.'], 'Then + kata kerja dasar + ...'),
    spot(1, 'Then, adds some sugar.', 'adds', 'add', 'Kalimat perintah memakai kata kerja dasar.'),
  ],
  mastery: [
    tr(2, 'Selanjutnya, tambahkan sedikit garam.', ['Next, add some salt.', 'Next, add a little salt.', 'Next add some salt.'], 'Next + add + ...', { 'Next, adds some salt.': ['Kalimat perintah memakai kata kerja dasar.'] }),
    fix(2, 'First, you boiling the water.', ['First, boil the water.'], 'Langkah memakai kata kerja dasar tanpa subjek.', { 'First, you boiling the water.': ['Kalimatnya belum diubah.'] }),
    mc(2, 'Bagian "Materials" dalam teks prosedur berisi ...', null, [
      ['bahan dan alat yang dibutuhkan', true],
      ['langkah-langkah', 'Itu bagian Steps.'],
      ['pendapat penulis', 'Teks prosedur tidak berisi pendapat.'],
    ], 'Materials = bahan dan alat.'),
  ],
});

export const smpRecount = lesson({
  id: 'smp-recount',
  title: 'Teks Recount',
  summary: 'Menceritakan pengalaman: Last holiday, we went to Yogyakarta. We visited Prambanan. I was very happy.',
  topic: 'smp.recount',
  objectives: [
    'Mengenali susunan recount: orientation, events, reorientation.',
    'Memakai simple past: went, visited, ate, was/were.',
    'Memakai keterangan waktu lampau: last Sunday, yesterday, the next day.',
  ],
  intro: 'Recount menceritakan pengalaman yang sudah terjadi, misalnya liburan atau acara sekolah. Karena sudah lewat, kata kerjanya memakai bentuk lampau.',
  teaching: [
    {
      heading: 'Susunan recount',
      body: 'Orientation: siapa, kapan, di mana. Events: kejadian berurutan. Reorientation: perasaan atau kesan di akhir.',
      examples: [
        { en: 'Last school holiday, my family and I went to Yogyakarta.', id: 'Liburan sekolah lalu, saya dan keluarga pergi ke Yogyakarta. (orientation)' },
        { en: 'I was tired, but I was very happy.', id: 'Saya lelah, tetapi sangat senang. (reorientation)' },
      ],
    },
    {
      heading: 'Kata kerja lampau',
      body: 'Kata kerja beraturan + -ed. Kata kerja tidak beraturan punya bentuk sendiri.',
      table: [
        ['Sekarang', 'Lampau', 'Arti'],
        ['visit', 'visited', 'mengunjungi'],
        ['walk', 'walked', 'berjalan'],
        ['go', 'went', 'pergi'],
        ['eat', 'ate', 'makan'],
        ['buy', 'bought', 'membeli'],
        ['is/am', 'was', 'adalah'],
        ['are', 'were', 'adalah (jamak)'],
      ],
    },
    {
      heading: 'Keterangan waktu lampau',
      body: 'Kata-kata ini menandai bahwa ceritanya sudah lewat.',
      examples: [
        { en: 'last Sunday', id: 'Minggu lalu' },
        { en: 'yesterday', id: 'kemarin' },
        { en: 'the next day', id: 'keesokan harinya' },
      ],
    },
  ],
  demo: [
    ['Last holiday, I went to Bali.', 'Last holiday, I go to Bali.', 'Pengalaman lampau: went.'],
    ['We were very happy.', 'We was very happy.', 'We + were.'],
    ['We bought some batik.', 'We buyed some batik.', 'buy → bought (tidak beraturan).'],
  ],
  guided: [
    match(1, 'Pasangkan kata kerja dengan bentuk lampaunya.', [
      ['go', 'went'],
      ['eat', 'ate'],
      ['buy', 'bought'],
      ['visit', 'visited'],
    ], 'Hafalkan bentuk lampau yang tidak beraturan.'),
    read(1, HOLIDAY, 'Where did the writer go on the first day?', [
      ['Prambanan Temple', true],
      ['Malioboro Street', 'Itu hari berikutnya.'],
      ['the beach', 'Tidak disebut dalam teks.'],
    ], 'On the first day, we visited Prambanan Temple.'),
    timeline(1, 'We visited Prambanan Temple last holiday.', [['past', 'sudah lewat', true], ['now', 'sedang sekarang', '"visited" dan "last holiday" menunjukkan waktu lampau.'], ['future', 'nanti', 'Rencana nanti memakai will atau going to.']], 'Recount menceritakan kejadian lampau.'),
    mc(1, 'Kalimat mana yang termasuk reorientation?', null, [
      ['I was tired, but I was very happy.', true],
      ['On the first day, we visited Prambanan Temple.', 'Itu bagian events.'],
      ['Last school holiday, my family and I went to Yogyakarta.', 'Itu orientation.'],
    ], 'Reorientation: perasaan atau kesan di akhir.'),
  ],
  independent: [
    fill(1, 'Last Sunday, we ___ to the beach. (go)', ['went'], 'go → went.', { go: ['Sudah lewat (last Sunday): went.'], goed: ['go tidak beraturan: went.'] }),
    tr(1, 'Kami makan bakso kemarin.', ['We ate meatballs yesterday.', 'We ate bakso yesterday.', 'Yesterday we ate bakso.', 'Yesterday, we ate meatballs.', 'Yesterday we ate meatballs.', 'Yesterday, we ate bakso.'], 'eat → ate.', { 'We eat bakso yesterday.': ['Kemarin sudah lewat: ate.'] }),
    arrange(1, 'Kami sangat senang.', 'We were very happy', ['was', 'are'], 'We + were.'),
    read(1, HOLIDAY, 'How did they go home?', [
      ['by train', true],
      ['by plane', 'Teks menyebut by train.'],
      ['by bus', 'Teks menyebut by train.'],
    ], 'On the last day, we went home by train.'),
  ],
  homework: [
    read(1, HOLIDAY, 'What did they buy on Malioboro Street?', [
      ['some batik', true],
      ['some gudeg', 'Gudeg mereka makan di malam hari.'],
      ['train tickets', 'Tidak disebut dalam teks.'],
    ], 'We walked along Malioboro Street and bought some batik.'),
    construct(1, 'we / visited / the / museum / yesterday', ['We visited the museum yesterday.', 'Yesterday we visited the museum.', 'Yesterday, we visited the museum.'], 'Subjek + kata kerja lampau + ...'),
    spot(1, 'We was very happy.', 'was', 'were', 'We + were.'),
  ],
  mastery: [
    tr(2, 'Liburan lalu saya mengunjungi nenek.', ['Last holiday, I visited my grandmother.', 'Last holiday I visited my grandmother.', 'I visited my grandmother last holiday.', 'Last holiday, I visited my grandma.', 'I visited my grandma last holiday.'], 'visit → visited.', { 'Last holiday, I visit my grandmother.': ['Sudah lewat: visited.'] }),
    fix(2, 'Last holiday I go to Bali.', ['Last holiday I went to Bali.', 'Last holiday, I went to Bali.'], 'Sudah lewat: went.', { 'Last holiday I go to Bali.': ['Kalimatnya belum diubah.'] }),
    timeline(2, 'My class went to the zoo last month.', [['past', 'sudah lewat', true], ['always', 'kebiasaan', '"last month" menunjuk satu kejadian yang sudah lewat.'], ['future', 'nanti', '"went" adalah bentuk lampau.']], 'went + last month = lampau.'),
  ],
});

export const smpNarrative = lesson({
  id: 'smp-narrative',
  title: 'Teks Narrative: Cerita Rakyat',
  summary: 'Cerita rakyat dalam bahasa Inggris: Once upon a time, a mouse deer named Kancil lived in a forest.',
  topic: 'smp.narrative',
  objectives: [
    'Mengenali susunan narrative: orientation, complication, resolution.',
    'Memahami jalan cerita dan pesan moral cerita rakyat.',
    'Memakai simple past dan pembuka cerita: Once upon a time, Long ago.',
  ],
  intro: 'Kenal Si Kancil? Cerita rakyat seperti ini disebut narrative. Ada tokoh, masalah, dan penyelesaian. Kita baca kisah Kancil dan para buaya dalam bahasa Inggris.',
  teaching: [
    {
      heading: 'Susunan narrative',
      body: 'Orientation: tokoh, tempat, waktu. Complication: masalah muncul. Resolution: masalah selesai. Sering ada pesan moral.',
      examples: [
        { en: 'Once upon a time, a mouse deer named Kancil lived in a forest.', id: 'Dahulu kala, seekor kancil hidup di hutan. (orientation)' },
        { en: 'There were many hungry crocodiles in the water.', id: 'Ada banyak buaya lapar di air. (complication)' },
        { en: 'Kancil jumped on their backs and reached the other side.', id: 'Kancil melompat di punggung mereka dan sampai di seberang. (resolution)' },
      ],
    },
    {
      heading: 'Pembuka cerita',
      body: 'Pembuka yang biasa dipakai.',
      examples: [
        { en: 'Once upon a time, ...', id: 'Pada suatu hari / Dahulu kala, ...' },
        { en: 'Long ago, ...', id: 'Dahulu kala, ...' },
      ],
    },
    {
      heading: 'Simple past dalam cerita',
      body: 'Cerita rakyat memakai bentuk lampau.',
      table: [
        ['Sekarang', 'Lampau'],
        ['live', 'lived'],
        ['want', 'wanted'],
        ['jump', 'jumped'],
        ['say', 'said'],
        ['run', 'ran'],
        ['have', 'had'],
      ],
    },
  ],
  demo: [
    ['Kancil jumped on the crocodiles.', 'Kancil jump on the crocodiles.', 'Cerita lampau: jumped.'],
    ['The crocodiles were angry.', 'The crocodiles was angry.', 'Jamak: were.'],
    ['Once upon a time, ...', 'Once a upon time, ...', 'Urutannya tetap: Once upon a time.'],
  ],
  guided: [
    read(1, KANCIL, 'What was the problem?', [
      ['There were hungry crocodiles in the river.', true],
      ['Kancil could not find any fruit.', 'Buahnya ada di seberang sungai.'],
      ['The King was angry with Kancil.', 'Raja hanya alasan Kancil.'],
    ], 'Complication: there were many hungry crocodiles in the water.'),
    match(1, 'Pasangkan kata kerja dengan bentuk lampaunya.', [
      ['jump', 'jumped'],
      ['say', 'said'],
      ['run', 'ran'],
      ['have', 'had'],
    ], 'Bentuk lampau dalam cerita.'),
    timeline(1, 'Long ago, a mouse deer lived in the forest.', [['past', 'sudah lewat', true], ['now', 'sedang sekarang', '"Long ago" dan "lived" menunjukkan masa lalu.'], ['always', 'kebiasaan', 'Ini cerita masa lalu, bukan kebiasaan sekarang.']], 'Cerita rakyat terjadi di masa lalu.'),
    tf(1, 'Bagian resolution adalah bagian ketika masalah diselesaikan.', true, 'Resolution = penyelesaian.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'Once ___ a time, there lived a mouse deer.', ['upon'], 'Once upon a time.', { apon: ['Ejaannya upon.'] }),
    tr(1, 'Dahulu kala, ada seorang anak bernama Malin.', ['Once upon a time, there was a boy named Malin.', 'Long ago, there was a boy named Malin.', 'Once upon a time there was a boy named Malin.', 'Long ago there was a boy named Malin.'], 'Once upon a time / Long ago, there was ...', { 'Once upon a time, there is a boy named Malin.': ['Cerita lampau: there was.'] }),
    read(1, KANCIL, 'What did Kancil tell the crocodiles?', [
      ['The King wanted to count them.', true],
      ['He wanted to be their friend.', 'Tidak disebut dalam cerita.'],
      ['He had food for them.', 'Tidak disebut dalam cerita.'],
    ], '"The King wants to count all the crocodiles."'),
    arrange(1, 'Para buaya sangat marah.', 'The crocodiles were very angry', ['was', 'is'], 'Jamak + were.'),
  ],
  homework: [
    read(1, KANCIL, 'Pesan moral apa yang paling cocok?', [
      ['Use your brain to solve problems.', true],
      ['Always eat fruit every day.', 'Bukan inti cerita.'],
      ['Crocodiles are good swimmers.', 'Bukan pesan moral.'],
    ], 'Kancil selamat karena berpikir cerdik.'),
    construct(1, 'Kancil / ran / into / the / forest', ['Kancil ran into the forest.'], 'Subjek + kata kerja lampau + ...'),
    spot(1, 'Kancil jump on the crocodiles.', 'jump', 'jumped', 'Cerita lampau: jumped.'),
  ],
  mastery: [
    fix(2, 'The crocodiles was very angry.', ['The crocodiles were very angry.'], 'Jamak: were.', { 'The crocodiles was very angry.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Kancil tertawa lalu lari.', ['Kancil laughed and ran away.', 'Kancil laughed and then ran away.', 'Kancil laughed, then ran away.', 'Kancil laughed and ran.'], 'laugh → laughed, run → ran.', { 'Kancil laugh and run away.': ['Cerita lampau: laughed, ran.'] }),
    read(2, KANCIL, 'Bagian mana yang termasuk orientation?', [
      ['A mouse deer named Kancil lived in a forest.', true],
      ['The crocodiles were very angry.', 'Itu bagian akhir cerita.'],
      ['Kancil jumped on their backs.', 'Itu bagian resolution.'],
    ], 'Orientation memperkenalkan tokoh dan tempat.'),
  ],
});
