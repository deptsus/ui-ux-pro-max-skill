// Jalur Sekolah (Rilis 16) · Jalur SMA/SMK (kelas 10–12, Fase E–F, A2–B1).
// Jenis teks SMA dan latihan Literasi Bahasa Inggris bergaya SNBT. Semua bacaan
// ditulis sendiri untuk Lentera; berita di sini adalah berita latihan (fiktif).
import { arrange, construct, dlg, fill, fix, lesson, match, mc, para, read, spot, tf, tr } from './dsl';

const RAIN = 'How does rain form? It starts when the sun heats the water in seas, rivers, and lakes. The water turns into vapour and rises into the air. High in the sky, the air is cooler, so the vapour is cooled and changes into tiny drops of water. These drops join together and form clouds. When the drops become too heavy, they fall to the ground as rain. The water then flows back into rivers and seas, and the cycle starts again.';
const KOMODO = 'The Komodo dragon is the largest lizard in the world. It lives only on a few islands in East Nusa Tenggara, such as Komodo and Rinca. An adult Komodo dragon can grow up to three metres long and weigh more than 70 kilograms. It has a long tail, strong legs, and sharp claws. Komodo dragons are carnivores; they eat deer, pigs, and even buffalo. They usually hunt by waiting quietly and then attacking quickly. Today, Komodo dragons are protected because their number is small.';
const BOTTLE = 'Students should bring their own water bottles to school. Firstly, plastic bottles create a lot of waste. Most of them are used only once and end up in rivers and the sea. Secondly, refilling a bottle saves money. A student who buys bottled water every day spends a lot in one year. Furthermore, a reusable bottle reminds us to drink enough water. Therefore, every student should bring a reusable bottle and say no to single-use plastic.';
const PHONES = 'Should students be allowed to use mobile phones at school? Some people think phones are useful. Students can search for information, use dictionaries, and contact their parents in an emergency. However, others believe phones cause problems. Students may play games or chat during lessons, and some students feel pressure from social media. In conclusion, phones can help learning if schools make clear rules, for example, phones may be used only when the teacher allows it.';
const MANGROVE = 'SURABAYA STUDENTS PLANT 1,000 MANGROVE TREES\nTwo hundred students of SMA Harapan Surabaya planted 1,000 mangrove trees along the coast on Saturday. The activity was part of the school\'s "Green Coast" program. According to the headmaster, Mrs. Ratna Dewi, mangroves protect the coast from big waves and give homes to fish and birds. The students worked from 7 a.m. to noon with help from local fishermen. Mrs. Dewi said that the school would plant 1,000 more trees next year. (Berita latihan, bukan berita sungguhan.)';
const LETTER = 'Dear Sir or Madam,\nI am writing to apply for the internship position at Sinar Media, which I saw on your website. I am a student of SMK Nusantara, majoring in Multimedia. I have experience in editing videos for my school\'s events, and I can use several design programs. I am hardworking, and I enjoy working in a team. I am available for an interview at any time. I look forward to hearing from you.\nYours faithfully,\nDimas Pratama';
const SNBT_1 = 'Many cities in Indonesia face traffic jams every day. One reason is that most people prefer private vehicles to public transport. To change this, some cities have built better bus systems. In Jakarta, for example, TransJakarta buses have their own lanes, so they are faster than cars during rush hour. The government hopes that when public transport is fast, cheap, and comfortable, more people will leave their cars at home. However, this plan only works if buses are reliable and stations are easy to reach.';
const SNBT_2 = 'Coral reefs cover less than one percent of the ocean floor, but they are home to about a quarter of all sea creatures. Indonesia has some of the richest reefs in the world. Unfortunately, reefs are in danger. When sea water becomes too warm, corals lose their colours and may die, a process called bleaching. Pollution and fishing with bombs also damage them. Protecting reefs is not only important for nature; millions of people depend on them for food and income from tourism.';

export const smaOpinions = lesson({
  id: 'sma-opinions',
  title: 'Saran dan Pendapat',
  summary: 'Meminta dan memberi pendapat dan saran: In my opinion, ... You should ... How about going ...?',
  topic: 'sma.opinions',
  objectives: [
    'Meminta pendapat: What do you think about ...?',
    'Memberi pendapat dan menyatakan setuju atau tidak: In my opinion ..., I agree, I\'m afraid I disagree.',
    'Memberi saran: You should ..., Why don\'t you ...?, How about + -ing?',
  ],
  intro: 'Dalam diskusi kelas, presentasi, dan wawancara, kamu perlu menyampaikan pendapat dan saran dengan sopan. Ini ungkapan yang paling sering dipakai.',
  teaching: [
    {
      heading: 'Meminta dan memberi pendapat',
      body: 'Pendapat bisa diawali I think, In my opinion, atau I believe.',
      examples: [
        { en: 'What do you think about online learning?', id: 'Bagaimana pendapatmu tentang belajar daring?' },
        { en: 'In my opinion, it is very flexible.', id: 'Menurut saya, itu sangat fleksibel.' },
        { en: "I agree with you. / I'm afraid I disagree.", id: 'Saya setuju. / Maaf, saya tidak setuju.' },
      ],
    },
    {
      heading: 'Memberi saran',
      body: 'Perhatikan bentuk kata kerja setelah setiap ungkapan.',
      table: [
        ['Ungkapan', 'Diikuti', 'Contoh'],
        ['You should', 'kata kerja dasar', 'You should see a doctor.'],
        ["Why don't you", 'kata kerja dasar', "Why don't you join the club?"],
        ['How about', 'kata kerja -ing', 'How about going to the library?'],
        ['I suggest (that) you', 'kata kerja dasar', 'I suggest you study every day.'],
      ],
    },
  ],
  demo: [
    ['You should see a doctor.', 'You should to see a doctor.', 'Setelah should langsung kata kerja dasar.'],
    ['How about going to the library?', 'How about go to the library?', 'How about + -ing.'],
    ['I agree with you.', 'I am agree with you.', 'agree adalah kata kerja; tidak perlu am.'],
  ],
  guided: [
    match(1, 'Pasangkan ungkapan dengan fungsinya.', [
      ['What do you think about ...?', 'meminta pendapat'],
      ['In my opinion, ...', 'memberi pendapat'],
      ['You should ...', 'memberi saran'],
      ["I'm afraid I disagree.", 'menyatakan tidak setuju'],
    ], 'Ungkapan untuk diskusi.'),
    mc(1, 'Pilih kata yang tepat.', 'How about ___ a study group?', [
      ['making', true],
      ['make', 'How about + -ing.'],
      ['to make', 'How about + -ing, bukan to.'],
    ], 'How about + kata kerja -ing.'),
    dlg(1, 'Pilih tanggapan yang paling tepat.', 'Raka: I think we should start the project this week.', [
      ["I agree. Let's divide the tasks today.", true],
      ['I am agree with you.', 'agree adalah kata kerja: I agree.'],
      ['Congratulations on your project!', 'Itu ucapan selamat, bukan tanggapan pendapat.'],
    ], 'Setuju: I agree.'),
    mc(1, 'Temanmu sering mengantuk di kelas. Saran mana yang tepat?', null, [
      ['You should go to bed earlier.', true],
      ['You should to go to bed earlier.', 'Setelah should tidak ada to.'],
      ['You should going to bed earlier.', 'Setelah should pakai kata kerja dasar.'],
    ], 'should + kata kerja dasar.'),
  ],
  independent: [
    fill(1, 'You ___ see a doctor. (sebaiknya)', ['should'], 'sebaiknya = should.', { must: ['"must" berarti harus, lebih keras dari saran.'] }),
    construct(1, "why / don't / you / join / the / club", ["Why don't you join the club?", 'Why do not you join the club?'], "Why don't you + kata kerja dasar?"),
    tr(1, 'Saya setuju denganmu.', ['I agree with you.'], 'I agree with you.', { 'I am agree with you.': ['agree adalah kata kerja; tidak perlu am.'] }),
    arrange(1, 'Menurut saya, perpustakaan ini terlalu kecil.', 'In my opinion this library is too small', ['to', 'think'], 'In my opinion + kalimat.'),
  ],
  homework: [
    tf(1, '"How about go to the museum?" adalah kalimat yang benar.', false, 'How about + -ing: How about going to the museum?', 'Pernyataan ini salah.'),
    construct(1, 'you / should / study / every / day', ['You should study every day.'], 'You should + kata kerja dasar.'),
    spot(1, 'How about go to the library?', 'go', 'going', 'How about + -ing.'),
  ],
  mastery: [
    fix(2, 'You should to study harder.', ['You should study harder.'], 'Setelah should langsung kata kerja dasar.', { 'You should to study harder.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Bagaimana pendapatmu tentang seragam sekolah?', ['What do you think about school uniforms?', 'What do you think of school uniforms?', 'What is your opinion about school uniforms?', 'What is your opinion of school uniforms?'], 'What do you think about + ...?', { 'How do you think about school uniforms?': ['Untuk pendapat pakai "What do you think".'] }),
    mc(2, 'Pilih saran yang paling sopan untuk guru.', null, [
      ['I suggest we use more videos in class, Ma\'am.', true],
      ['You must use videos!', '"must" terdengar memerintah.'],
      ['Use videos!', 'Kalimat perintah terdengar kurang sopan untuk guru.'],
    ], 'I suggest ... terdengar sopan.'),
  ],
});

export const smaExplanation = lesson({
  id: 'sma-explanation',
  title: 'Teks Explanation',
  summary: 'Menjelaskan proses alam atau sosial: How does rain form? Water is heated by the sun ...',
  topic: 'sma.explanation',
  objectives: [
    'Mengenali susunan explanation: general statement, sequence of explanation, closing.',
    'Memakai passive voice untuk proses: Water is heated by the sun.',
    'Memakai kata sebab-akibat dan urutan: because, so, when, then, as a result.',
  ],
  intro: 'Bagaimana hujan terjadi? Mengapa gempa bumi terjadi? Teks explanation menjelaskan proses langkah demi langkah, sering dengan kalimat pasif.',
  teaching: [
    {
      heading: 'Susunan teks explanation',
      body: 'General statement (fenomena apa), sequence of explanation (urutan proses dan sebab-akibat), closing (penutup).',
      examples: [
        { en: 'How does rain form?', id: 'Bagaimana hujan terbentuk? (general statement)' },
        { en: 'When the drops become too heavy, they fall as rain.', id: 'Ketika tetesan terlalu berat, tetesan itu jatuh sebagai hujan. (sequence)' },
      ],
    },
    {
      heading: 'Passive voice: is/are + V3',
      body: 'Dalam proses, yang penting adalah apa yang terjadi pada benda, bukan siapa pelakunya.',
      examples: [
        { en: 'The water is heated by the sun.', id: 'Air dipanaskan oleh matahari.' },
        { en: 'The vapour is cooled.', id: 'Uap didinginkan.' },
        { en: 'Clouds are formed.', id: 'Awan terbentuk.', note: 'Jamak: are formed.' },
      ],
    },
    {
      heading: 'Kata sebab-akibat',
      body: 'because (karena), so (sehingga), when (ketika), as a result (akibatnya).',
      examples: [
        { en: 'The air is cooler, so the vapour changes into drops.', id: 'Udaranya lebih dingin, sehingga uap berubah menjadi tetesan.' },
      ],
    },
  ],
  demo: [
    ['Water is heated by the sun.', 'Water is heat by the sun.', 'Pasif memakai V3: heated.'],
    ['Clouds are formed in the sky.', 'Clouds is formed in the sky.', 'Jamak: are.'],
    ['The air is cool, so the vapour changes.', 'The air is cool, because the vapour changes.', 'Sebabnya udara dingin, akibatnya uap berubah: so.'],
  ],
  guided: [
    read(1, RAIN, 'What happens first in the process?', [
      ['The sun heats the water.', true],
      ['Clouds are formed.', 'Ini terjadi setelah uap mendingin.'],
      ['Rain falls to the ground.', 'Ini hampir di akhir proses.'],
    ], 'It starts when the sun heats the water.'),
    mc(1, 'Pilih bentuk yang tepat.', 'The vapour ___ in the sky.', [
      ['is cooled', true],
      ['is cool', 'Pasif memakai V3: cooled.'],
      ['cooling', 'Butuh is + V3.'],
    ], 'Pasif: is + V3.'),
    para(1, 'Urutkan proses terjadinya hujan.', [
      'The sun heats the water in the sea.',
      'The water turns into vapour and rises.',
      'The vapour is cooled and forms clouds.',
      'The heavy drops fall as rain.',
    ], 'Panas, uap, awan, hujan.'),
    tf(1, 'Teks explanation sering memakai passive voice.', true, 'Proses lebih fokus pada apa yang terjadi, bukan pelakunya.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'The water is ___ by the sun. (heat)', ['heated'], 'Pasif: is + V3 (heated).', { heat: ['Pasif memakai V3: heated.'], heating: ['Pasif memakai V3: heated.'] }),
    tr(1, 'Awan terbentuk di langit.', ['Clouds are formed in the sky.', 'Clouds form in the sky.'], 'Clouds are formed ...', { 'Clouds is formed in the sky.': ['Jamak: are.'] }),
    construct(1, 'the / drops / fall / because / they / are / heavy', ['The drops fall because they are heavy.'], 'Akibat + because + sebab.'),
    read(1, RAIN, 'Why does the vapour change into drops of water?', [
      ['because the air high in the sky is cooler', true],
      ['because the sun is very hot', 'Panas matahari membuat air menguap, bukan membentuk tetesan.'],
      ['because the drops are too heavy', 'Itu alasan hujan jatuh.'],
    ], 'The air is cooler, so the vapour is cooled ...'),
  ],
  homework: [
    read(1, RAIN, 'Apa fungsi kalimat terakhir teks?', [
      ['menutup penjelasan: siklus dimulai lagi', true],
      ['memperkenalkan topik', 'Itu kalimat pertama.'],
      ['memberi saran kepada pembaca', 'Teks ini tidak memberi saran.'],
    ], 'Closing: the cycle starts again.'),
    construct(1, 'the / vapour / is / cooled / in / the / sky', ['The vapour is cooled in the sky.'], 'Pasif: is + V3.'),
    spot(1, 'Clouds is formed when vapour cools.', 'is', 'are', 'Jamak: are.'),
  ],
  mastery: [
    fix(2, 'The water vapour are cooled high in the sky.', ['The water vapour is cooled high in the sky.'], '"vapour" tunggal: is.', { 'The water vapour are cooled high in the sky.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Air dipanaskan oleh matahari.', ['Water is heated by the sun.', 'The water is heated by the sun.'], 'Pasif: is heated by.', { 'Water heated by the sun.': ['Pasif butuh is: is heated.'] }),
    read(2, RAIN, 'Kata "it" pada kalimat kedua merujuk pada ...', [
      ['the process of rain forming', true],
      ['the sun', 'Matahari disebut setelahnya.'],
      ['the river', 'Sungai hanya salah satu sumber air.'],
    ], '"It starts when ..." = proses terjadinya hujan.'),
  ],
});

export const smaReport = lesson({
  id: 'sma-report',
  title: 'Teks Report',
  summary: 'Informasi ilmiah tentang satu jenis benda atau hewan: The Komodo dragon is the largest lizard in the world.',
  topic: 'sma.report',
  objectives: [
    'Mengenali susunan report: general classification dan description.',
    'Membedakan report (umum, satu jenis) dari deskriptif (satu benda/orang tertentu).',
    'Memakai simple present dan istilah ilmiah: carnivore, habitat, protected.',
  ],
  intro: 'Teks report memberi fakta tentang satu jenis hal secara umum, misalnya komodo, gunung api, atau terumbu karang. Bahasanya objektif, tanpa pendapat pribadi.',
  teaching: [
    {
      heading: 'Susunan teks report',
      body: 'General classification: hal ini termasuk jenis apa. Description: ciri, habitat, makanan, perilaku.',
      examples: [
        { en: 'The Komodo dragon is the largest lizard in the world.', id: 'Komodo adalah kadal terbesar di dunia. (general classification)' },
        { en: 'It has a long tail and sharp claws.', id: 'Ia punya ekor panjang dan cakar tajam. (description)' },
      ],
    },
    {
      heading: 'Report atau deskriptif?',
      body: 'Report: tentang satu jenis secara umum (komodo). Deskriptif: tentang satu yang tertentu (komodo bernama Ora di kebun binatang kita).',
      examples: [
        { en: 'Komodo dragons eat deer and pigs.', id: 'Komodo makan rusa dan babi. (report)' },
        { en: 'My cat, Mimi, has white fur.', id: 'Kucingku, Mimi, berbulu putih. (deskriptif)' },
      ],
    },
    {
      heading: 'Kosakata ilmiah',
      body: 'Kata yang sering muncul dalam report.',
      table: [
        ['Inggris', 'Indonesia'],
        ['carnivore', 'pemakan daging'],
        ['habitat', 'habitat/tempat hidup'],
        ['protected', 'dilindungi'],
        ['species', 'spesies'],
      ],
    },
  ],
  demo: [
    ['Komodo dragons live on Komodo Island.', 'Komodo dragons lives on Komodo Island.', 'Jamak: live, tanpa -s.'],
    ['A Komodo dragon has a long tail.', 'A Komodo dragon have a long tail.', 'Tunggal: has.'],
    ['They are protected.', 'They protected.', 'Pasif: are protected.'],
  ],
  guided: [
    read(1, KOMODO, 'Where do Komodo dragons live?', [
      ['on a few islands in East Nusa Tenggara', true],
      ['in every forest in Indonesia', 'Teks menyebut hanya di beberapa pulau.'],
      ['in Bali and Java', 'Tidak disebut dalam teks.'],
    ], 'It lives only on a few islands in East Nusa Tenggara.'),
    match(1, 'Pasangkan kata dengan artinya.', [
      ['carnivore', 'pemakan daging'],
      ['protected', 'dilindungi'],
      ['claw', 'cakar'],
      ['habitat', 'tempat hidup'],
    ], 'Kosakata teks report.'),
    mc(1, 'Kalimat mana yang termasuk general classification?', null, [
      ['The Komodo dragon is the largest lizard in the world.', true],
      ['It has a long tail, strong legs, and sharp claws.', 'Itu deskripsi ciri fisik.'],
      ['They usually hunt by waiting quietly.', 'Itu deskripsi perilaku.'],
    ], 'Klasifikasi umum: termasuk jenis apa.'),
    tf(1, 'Teks report berisi pendapat pribadi penulis.', false, 'Report bersifat objektif, berisi fakta.', 'Pernyataan ini salah.'),
  ],
  independent: [
    fill(1, 'A Komodo dragon ___ a long tail.', ['has'], 'Tunggal: has.', { have: ['Subjek tunggal: has.'] }),
    tr(1, 'Komodo adalah kadal terbesar di dunia.', ['The Komodo dragon is the largest lizard in the world.', 'Komodo dragons are the largest lizards in the world.', 'The Komodo dragon is the biggest lizard in the world.', 'Komodo is the largest lizard in the world.'], 'is the largest + ... + in the world.', { 'The Komodo dragon is the most large lizard in the world.': ['Superlatif dari large: largest.'] }),
    read(1, KOMODO, 'What do Komodo dragons eat?', [
      ['deer, pigs, and buffalo', true],
      ['fruit and leaves', 'Komodo adalah carnivore (pemakan daging).'],
      ['only fish', 'Tidak disebut dalam teks.'],
    ], 'They eat deer, pigs, and even buffalo.'),
    construct(1, 'komodo / dragons / are / protected', ['Komodo dragons are protected.'], 'Pasif: are protected.'),
  ],
  homework: [
    read(1, KOMODO, 'Why are Komodo dragons protected?', [
      ['because their number is small', true],
      ['because they are dangerous', 'Bukan alasan yang disebut teks.'],
      ['because they eat buffalo', 'Bukan alasan yang disebut teks.'],
    ], '... protected because their number is small.'),
    construct(1, 'they / hunt / by / waiting / quietly', ['They hunt by waiting quietly.'], 'by + -ing = dengan cara ...'),
    spot(1, 'A Komodo dragon have sharp claws.', 'have', 'has', 'Tunggal: has.'),
  ],
  mastery: [
    fix(2, 'Komodo dragons lives on Komodo Island.', ['Komodo dragons live on Komodo Island.'], 'Jamak: live.', { 'Komodo dragons lives on Komodo Island.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Komodo dilindungi.', ['Komodo dragons are protected.', 'The Komodo dragon is protected.', 'Komodos are protected.'], 'Pasif: are protected.', { 'Komodo dragons protected.': ['Pasif butuh are: are protected.'] }),
    mc(2, 'Teks mana yang termasuk report?', null, [
      ['Coral reefs are underwater structures made by tiny animals called polyps.', true],
      ['Last week, I swam near a coral reef in Bunaken.', 'Itu pengalaman pribadi (recount).'],
      ['My uncle\'s boat is small and blue.', 'Itu deskripsi benda tertentu.'],
    ], 'Report: fakta umum tentang satu jenis hal.'),
  ],
});

export const smaExposition = lesson({
  id: 'sma-exposition',
  title: 'Analytical Exposition',
  summary: 'Meyakinkan pembaca dengan argumen: Students should bring their own water bottles. Firstly, ... Therefore, ...',
  topic: 'sma.exposition',
  objectives: [
    'Mengenali susunan analytical exposition: thesis, arguments, reiteration.',
    'Menyusun argumen dengan Firstly, Secondly, Furthermore.',
    'Menutup dengan reiteration: Therefore, In conclusion.',
  ],
  intro: 'Analytical exposition berusaha meyakinkan pembaca bahwa satu pendapat benar, dengan argumen dan alasan. Kamu akan menulis teks seperti ini di SMA dan dalam tugas esai.',
  teaching: [
    {
      heading: 'Susunan analytical exposition',
      body: 'Thesis: pendapat utama. Arguments: alasan pendukung dengan bukti. Reiteration: menegaskan kembali pendapat.',
      examples: [
        { en: 'Students should bring their own water bottles to school.', id: 'Siswa sebaiknya membawa botol minum sendiri ke sekolah. (thesis)' },
        { en: 'Therefore, every student should bring a reusable bottle.', id: 'Karena itu, setiap siswa sebaiknya membawa botol isi ulang. (reiteration)' },
      ],
    },
    {
      heading: 'Kata penghubung argumen',
      body: 'Untuk mengurutkan dan menambah argumen.',
      table: [
        ['Inggris', 'Fungsi'],
        ['Firstly / First of all', 'argumen pertama'],
        ['Secondly', 'argumen kedua'],
        ['Furthermore / Moreover', 'menambah argumen'],
        ['Therefore / In conclusion', 'menutup'],
      ],
    },
  ],
  demo: [
    ['Secondly, it saves money.', 'Secondly, it save money.', 'It + saves.'],
    ['Students should bring their own bottles.', 'Students should brings their own bottles.', 'should + kata kerja dasar.'],
    ['In conclusion, we should reduce plastic.', 'In conclude, we should reduce plastic.', 'Ungkapan tetap: In conclusion.'],
  ],
  guided: [
    read(1, BOTTLE, 'Apa thesis (pendapat utama) teks ini?', [
      ['Students should bring their own water bottles to school.', true],
      ['Plastic bottles create a lot of waste.', 'Itu argumen pertama.'],
      ['Refilling a bottle saves money.', 'Itu argumen kedua.'],
    ], 'Thesis ada di kalimat pertama.'),
    mc(1, 'Pilih kata penghubung yang tepat untuk menambah argumen.', '___, a reusable bottle reminds us to drink water.', [
      ['Furthermore', true],
      ['However', '"However" untuk pertentangan.'],
      ['Once upon a time', 'Itu pembuka cerita.'],
    ], 'Menambah argumen: Furthermore.'),
    para(1, 'Urutkan bagian teks exposition ini.', [
      'Schools should have more trees.',
      'Firstly, trees make the air cleaner.',
      'Secondly, students feel calmer in a green school.',
      'Therefore, every school should plant more trees.',
    ], 'Thesis, argumen, reiteration.'),
    tf(1, 'Reiteration adalah bagian yang menegaskan kembali pendapat penulis.', true, 'Biasanya diawali Therefore atau In conclusion.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'In ___, students should bring their own bottles. (kesimpulan)', ['conclusion'], 'In conclusion = kesimpulannya.', { conclude: ['Ungkapan tetap: In conclusion.'] }),
    tr(1, 'Pertama, botol plastik mencemari laut.', ['Firstly, plastic bottles pollute the sea.', 'First, plastic bottles pollute the sea.', 'Firstly, plastic bottles pollute the ocean.', 'First, plastic bottles pollute the ocean.', 'First of all, plastic bottles pollute the sea.'], 'Firstly + argumen.', { 'Firstly, plastic bottles pollutes the sea.': ['Jamak: pollute.'] }),
    read(1, BOTTLE, 'Mengapa mengisi ulang botol disebut menguntungkan?', [
      ['It saves money.', true],
      ['It makes water colder.', 'Tidak disebut dalam teks.'],
      ['It is required by law.', 'Tidak disebut dalam teks.'],
    ], 'Secondly, refilling a bottle saves money.'),
    construct(1, 'secondly / it / saves / money', ['Secondly, it saves money.', 'Secondly it saves money.'], 'Secondly + argumen.'),
  ],
  homework: [
    read(1, BOTTLE, 'Kata "Therefore" mengawali bagian ...', [
      ['reiteration', true],
      ['thesis', 'Thesis ada di awal teks.'],
      ['argumen pertama', 'Argumen pertama diawali Firstly.'],
    ], 'Therefore mengawali penegasan kembali.'),
    construct(1, 'we / should / reduce / single-use / plastic', ['We should reduce single-use plastic.'], 'should + kata kerja dasar.'),
    spot(1, 'Secondly, it save money.', 'save', 'saves', 'It + saves.'),
  ],
  mastery: [
    fix(2, 'Students should brings their own bottles.', ['Students should bring their own bottles.'], 'should + kata kerja dasar.', { 'Students should brings their own bottles.': ['Kalimatnya belum diubah.'] }),
    arrange(2, 'Karena itu, setiap siswa sebaiknya membawa botol.', 'Therefore every student should bring a bottle', ['brings', 'However'], 'Therefore + kalimat.'),
    mc(2, 'Argumen mana yang paling mendukung thesis "Students should walk or cycle to school"?', null, [
      ['It keeps students healthy and reduces pollution.', true],
      ['Many students like to sleep late.', 'Tidak mendukung thesis.'],
      ['Some students have motorbikes.', 'Tidak mendukung thesis.'],
    ], 'Argumen harus mendukung thesis.'),
  ],
});

export const smaDiscussion = lesson({
  id: 'sma-discussion',
  title: 'Discussion Text',
  summary: 'Membahas dua sisi masalah: Some people think ... However, others believe ... In conclusion, ...',
  topic: 'sma.discussion',
  objectives: [
    'Mengenali susunan discussion: issue, arguments for, arguments against, conclusion.',
    'Memakai kata pertentangan: However, On the other hand, Although.',
    'Menyimpulkan dua sisi dengan seimbang.',
  ],
  intro: 'Berbeda dari exposition yang hanya membela satu sisi, discussion text membahas dua sisi masalah, lalu memberi kesimpulan atau saran.',
  teaching: [
    {
      heading: 'Susunan discussion text',
      body: 'Issue: masalahnya. Arguments for: pendukung. Arguments against: penentang. Conclusion: kesimpulan atau saran.',
      examples: [
        { en: 'Should students be allowed to use mobile phones at school?', id: 'Bolehkah siswa memakai ponsel di sekolah? (issue)' },
        { en: 'Some people think phones are useful.', id: 'Sebagian orang berpendapat ponsel berguna. (for)' },
        { en: 'However, others believe phones cause problems.', id: 'Namun, yang lain berpendapat ponsel menimbulkan masalah. (against)' },
      ],
    },
    {
      heading: 'Kata pertentangan',
      body: 'However dan On the other hand di awal kalimat (diikuti koma). Although menggabungkan dua klausa, tanpa "but".',
      examples: [
        { en: 'On the other hand, phones can be distracting.', id: 'Di sisi lain, ponsel bisa mengganggu.' },
        { en: 'Although phones are useful, they can be distracting.', id: 'Meskipun ponsel berguna, ponsel bisa mengganggu.', note: 'Jangan pakai although dan but bersamaan.' },
      ],
    },
  ],
  demo: [
    ['Although phones are useful, they can be distracting.', 'Although phones are useful, but they can be distracting.', 'Although tidak dipakai bersama but.'],
    ['However, others disagree.', 'However others disagree.', 'However di awal kalimat diikuti koma.'],
    ['On the other hand, it is expensive.', 'In the other hand, it is expensive.', 'Ungkapan tetap: On the other hand.'],
  ],
  guided: [
    read(1, PHONES, 'Apa issue (masalah) yang dibahas?', [
      ['whether students should use mobile phones at school', true],
      ['how to buy a cheap phone', 'Tidak dibahas.'],
      ['why social media is fun', 'Hanya disebut sebagai salah satu masalah.'],
    ], 'Issue ada di kalimat pertama.'),
    mc(1, 'Pilih kata yang tepat.', 'Phones help students. ___, they can be distracting.', [
      ['However', true],
      ['Furthermore', '"Furthermore" menambah argumen yang searah.'],
      ['Firstly', '"Firstly" untuk argumen pertama.'],
    ], 'Pertentangan: However.'),
    read(1, PHONES, 'Mana yang termasuk argument against?', [
      ['Students may play games during lessons.', true],
      ['Students can use dictionaries.', 'Itu argumen pendukung.'],
      ['Students can contact their parents.', 'Itu argumen pendukung.'],
    ], 'Argumen penentang muncul setelah "However".'),
    tf(1, 'Discussion text hanya membahas satu sisi masalah.', false, 'Discussion membahas dua sisi; exposition membela satu sisi.', 'Pernyataan ini salah.'),
  ],
  independent: [
    fill(1, 'On the other ___, phones can be distracting.', ['hand'], 'On the other hand = di sisi lain.', { side: ['Ungkapan tetap: On the other hand.'] }),
    fix(1, 'Although phones are useful, but they can be distracting.', ['Although phones are useful, they can be distracting.', 'Phones are useful, but they can be distracting.'], 'Although tanpa but, atau but tanpa although.', { 'Although phones are useful, but they can be distracting.': ['Kalimatnya belum diubah.'] }),
    read(1, PHONES, 'Apa kesimpulan penulis?', [
      ['Phones can help learning if there are clear rules.', true],
      ['Phones must be banned at all schools.', 'Penulis tidak melarang sepenuhnya.'],
      ['Students can use phones whenever they want.', 'Penulis menyarankan aturan yang jelas.'],
    ], 'In conclusion, phones can help learning if schools make clear rules.'),
    construct(1, 'however / others / believe / phones / cause / problems', ['However, others believe phones cause problems.', 'However others believe phones cause problems.'], 'However + kalimat yang berlawanan.'),
  ],
  homework: [
    mc(1, 'Bagian mana yang muncul paling akhir dalam discussion text?', null, [
      ['conclusion atau recommendation', true],
      ['issue', 'Issue ada di awal.'],
      ['arguments for', 'Ada di tengah.'],
    ], 'Diakhiri dengan kesimpulan atau saran.'),
    construct(1, 'some / people / think / phones / are / useful', ['Some people think phones are useful.', 'Some people think that phones are useful.'], 'Some people think + kalimat.'),
    spot(1, 'However, other believe phones cause problems.', 'other', 'others', '"others" = orang lain (jamak).'),
  ],
  mastery: [
    tr(2, 'Di sisi lain, ponsel bisa mengganggu.', ['On the other hand, phones can be distracting.', 'On the other hand, mobile phones can be distracting.', 'On the other hand, phones can be a distraction.'], 'On the other hand, ...', { 'In the other hand, phones can be distracting.': ['Ungkapan tetap: On the other hand.'] }),
    arrange(2, 'Meskipun mahal, laptop berguna untuk siswa.', 'Although laptops are expensive they are useful for students', ['but', 'however'], 'Although + klausa, + klausa (tanpa but).'),
    mc(2, 'Apa perbedaan utama discussion dan analytical exposition?', null, [
      ['Discussion membahas dua sisi; exposition membela satu sisi.', true],
      ['Discussion selalu memakai simple past.', 'Keduanya umumnya memakai simple present.'],
      ['Exposition tidak punya argumen.', 'Exposition justru berisi argumen.'],
    ], 'Dua sisi lawan satu sisi.'),
  ],
});

export const smaNews = lesson({
  id: 'sma-news',
  title: 'News Item',
  summary: 'Memahami berita: headline, peristiwa utama, latar, dan sumber. According to the headmaster, ...',
  topic: 'sma.news',
  objectives: [
    'Mengenali susunan news item: headline, newsworthy event, background events, sources.',
    'Memakai simple past untuk peristiwa dan "said that" untuk kutipan tidak langsung.',
    'Memakai "according to" untuk menyebut sumber.',
  ],
  intro: 'Berita dalam bahasa Inggris punya susunan yang khas: judul singkat, ringkasan peristiwa, detail, dan sumber. Kita baca berita latihan tentang siswa yang menanam bakau.',
  teaching: [
    {
      heading: 'Susunan news item',
      body: 'Headline: judul. Newsworthy event: ringkasan peristiwa (siapa, apa, di mana, kapan). Background events: detail dan latar. Sources: pendapat narasumber.',
      examples: [
        { en: 'SURABAYA STUDENTS PLANT 1,000 MANGROVE TREES', id: 'SISWA SURABAYA TANAM 1.000 POHON BAKAU (headline)' },
        { en: 'According to the headmaster, mangroves protect the coast.', id: 'Menurut kepala sekolah, bakau melindungi pantai. (source)' },
      ],
    },
    {
      heading: 'Bahasa berita',
      body: 'Headline memakai simple present yang singkat. Isi berita memakai simple past. Kutipan tidak langsung: said that + kalimat yang mundur waktunya (will → would).',
      examples: [
        { en: 'The students planted 1,000 trees on Saturday.', id: 'Para siswa menanam 1.000 pohon pada hari Sabtu.' },
        { en: 'She said that the school would plant more trees.', id: 'Ia mengatakan sekolah akan menanam lebih banyak pohon.' },
      ],
    },
  ],
  demo: [
    ['Yesterday, 200 students planted trees.', 'Yesterday, 200 students plant trees.', 'Peristiwa lampau: planted.'],
    ['According to the police, no one was hurt.', 'According the police, no one was hurt.', 'Ungkapan tetap: according to.'],
    ['She said that the school would continue.', 'She said that the school will continue.', 'Kutipan tidak langsung: will menjadi would.'],
  ],
  guided: [
    read(1, MANGROVE, 'Apa fungsi kalimat pertama berita ini (setelah judul)?', [
      ['meringkas peristiwa utama: siapa, apa, di mana, kapan', true],
      ['menyebut pendapat narasumber', 'Itu bagian sources.'],
      ['menutup berita', 'Berita tidak punya bagian penutup khusus.'],
    ], 'Newsworthy event meringkas peristiwa.'),
    mc(1, 'Pilih kata yang tepat.', '___ to the headmaster, mangroves protect the coast.', [
      ['According', true],
      ['Accordance', 'Ungkapan tetap: According to.'],
      ['Agree', 'Ungkapan tetap: According to.'],
    ], 'According to = menurut.'),
    read(1, MANGROVE, 'Who helped the students?', [
      ['local fishermen', true],
      ['the police', 'Tidak disebut dalam berita.'],
      ['tourists', 'Tidak disebut dalam berita.'],
    ], '... with help from local fishermen.'),
    tf(1, 'Isi berita (bukan judul) umumnya memakai simple past.', true, 'Peristiwanya sudah terjadi.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'The headmaster ___ that the program would continue. (say)', ['said'], 'say → said.', { says: ['Berita memakai bentuk lampau: said.'], sayed: ['say tidak beraturan: said.'] }),
    construct(1, 'according / to / the / police / no / one / was / hurt', ['According to the police, no one was hurt.', 'According to the police no one was hurt.'], 'According to + sumber, + kalimat.'),
    read(1, MANGROVE, 'Why are mangroves important, according to Mrs. Dewi?', [
      ['They protect the coast and give homes to fish and birds.', true],
      ['They make the beach more crowded.', 'Tidak disebut dalam berita.'],
      ['They grow very fast.', 'Tidak disebut dalam berita.'],
    ], 'Mangroves protect the coast from big waves and give homes to fish and birds.'),
    tr(1, 'Para siswa menanam pohon pada hari Sabtu.', ['The students planted trees on Saturday.', 'Students planted trees on Saturday.', 'On Saturday, the students planted trees.', 'On Saturday the students planted trees.'], 'Peristiwa lampau: planted.', { 'The students plant trees on Saturday.': ['Berita memakai bentuk lampau: planted.'] }),
  ],
  homework: [
    read(1, MANGROVE, 'What will the school do next year?', [
      ['plant 1,000 more trees', true],
      ['build a new beach', 'Tidak disebut dalam berita.'],
      ['stop the program', 'Program akan dilanjutkan.'],
    ], 'The school would plant 1,000 more trees next year.'),
    construct(1, 'the / activity / was / part / of / the / program', ['The activity was part of the program.'], 'Subjek + was + ...'),
    spot(1, 'Yesterday, 200 students plant trees.', 'plant', 'planted', 'Peristiwa lampau: planted.'),
  ],
  mastery: [
    fix(2, 'She said that the school will plant more trees.', ['She said that the school would plant more trees.', 'She said the school would plant more trees.'], 'Kutipan tidak langsung: will menjadi would.', { 'She said that the school will plant more trees.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Menurut polisi, tidak ada yang terluka.', ['According to the police, no one was hurt.', 'According to the police, nobody was hurt.', 'According to the police, no one was injured.', 'According to the police, nobody was injured.'], 'According to + sumber.', { 'According the police, no one was hurt.': ['Ungkapan tetap: according to.'] }),
    mc(2, 'Headline yang paling tepat untuk berita tentang banjir di Semarang adalah ...', null, [
      ['FLOODS HIT SEMARANG AFTER HEAVY RAIN', true],
      ['Once upon a time, there was a flood in Semarang', 'Itu pembuka cerita rakyat.'],
      ['I think floods are bad', 'Headline tidak berisi pendapat pribadi.'],
    ], 'Headline: singkat, simple present, tanpa pendapat.'),
  ],
});

export const smaLetter = lesson({
  id: 'sma-application-letter',
  title: 'Surat Lamaran (Magang dan Kerja)',
  summary: 'Menulis surat lamaran formal: I am writing to apply for ... I look forward to hearing from you.',
  topic: 'sma.application-letter',
  objectives: [
    'Mengenali bagian surat lamaran: salam, tujuan, kualifikasi, penutup.',
    'Memakai ungkapan formal: I am writing to apply for ..., I am available for an interview.',
    'Menghindari kesalahan umum: interested in, look forward to + -ing.',
  ],
  intro: 'Siswa SMK melamar magang (PKL), siswa SMA melamar beasiswa atau kerja paruh waktu. Surat lamaran berbahasa Inggris harus formal, singkat, dan jelas.',
  teaching: [
    {
      heading: 'Bagian surat lamaran',
      body: 'Salam pembuka, tujuan (posisi dan sumber info), kualifikasi, ketersediaan wawancara, salam penutup.',
      examples: [
        { en: 'Dear Sir or Madam,', id: 'Dengan hormat, (bila nama penerima tidak diketahui)' },
        { en: 'I am writing to apply for the internship position.', id: 'Saya menulis untuk melamar posisi magang.' },
        { en: 'I look forward to hearing from you.', id: 'Saya menantikan kabar dari Anda.' },
        { en: 'Yours faithfully,', id: 'Hormat saya, (pasangan dari Dear Sir or Madam)' },
      ],
    },
    {
      heading: 'Kesalahan yang sering terjadi',
      body: 'interested (tertarik) bukan interesting (menarik). look forward to + -ing.',
      examples: [
        { en: 'I am interested in this position.', id: 'Saya tertarik dengan posisi ini.' },
        { en: 'I look forward to hearing from you.', id: 'Saya menantikan kabar dari Anda.', note: 'Bukan "to hear".' },
      ],
    },
  ],
  demo: [
    ['I am interested in the position.', 'I am interesting in the position.', 'interested = tertarik.'],
    ['I look forward to hearing from you.', 'I look forward to hear from you.', 'look forward to + -ing.'],
    ['I am writing to apply for the position.', 'I am writing for apply the position.', 'to apply for + posisi.'],
  ],
  guided: [
    match(1, 'Pasangkan bagian surat dengan contohnya.', [
      ['salam pembuka', 'Dear Sir or Madam,'],
      ['tujuan', 'I am writing to apply for ...'],
      ['penutup isi', 'I look forward to hearing from you.'],
      ['salam penutup', 'Yours faithfully,'],
    ], 'Bagian surat lamaran formal.'),
    read(1, LETTER, 'What position does Dimas apply for?', [
      ['an internship at Sinar Media', true],
      ['a full-time teacher', 'Tidak disebut dalam surat.'],
      ['a scholarship', 'Dimas melamar magang.'],
    ], 'I am writing to apply for the internship position at Sinar Media.'),
    mc(1, 'Pilih kata yang tepat.', 'I am ___ in this position.', [
      ['interested', true],
      ['interesting', '"interesting" = menarik (sifat benda), bukan perasaan kita.'],
      ['interest', 'Butuh kata sifat: interested.'],
    ], 'Perasaan tertarik: interested.'),
    tf(1, '"Dear Sir or Madam" dipakai bila kita tidak tahu nama penerima surat.', true, 'Pasangannya: Yours faithfully.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'I am writing to ___ for the internship position.', ['apply'], 'to apply for = melamar.', { applying: ['Setelah to pakai kata kerja dasar: apply.'] }),
    tr(1, 'Saya menantikan kabar dari Anda.', ['I look forward to hearing from you.'], 'look forward to + -ing.', { 'I look forward to hear from you.': ['look forward to + -ing: hearing.'] }),
    read(1, LETTER, 'What experience does Dimas have?', [
      ["editing videos for his school's events", true],
      ['working at a newspaper', 'Tidak disebut dalam surat.'],
      ['teaching multimedia', 'Ia siswa jurusan Multimedia.'],
    ], "I have experience in editing videos for my school's events."),
    construct(1, 'I / am / available / for / an / interview', ['I am available for an interview.', "I'm available for an interview."], 'available for + an interview.'),
  ],
  homework: [
    read(1, LETTER, 'Where did Dimas see the information about the position?', [
      ['on the company website', true],
      ['in a newspaper', 'Ia melihatnya di website.'],
      ['from his teacher', 'Tidak disebut dalam surat.'],
    ], '... which I saw on your website.'),
    construct(1, 'I / enjoy / working / in / a / team', ['I enjoy working in a team.'], 'enjoy + -ing.'),
    spot(1, 'I am interesting in the position.', 'interesting', 'interested', 'Perasaan tertarik: interested.'),
  ],
  mastery: [
    fix(2, 'I look forward to hear from you.', ['I look forward to hearing from you.'], 'look forward to + -ing.', { 'I look forward to hear from you.': ['Kalimatnya belum diubah.'] }),
    arrange(2, 'Saya menulis untuk melamar posisi desainer.', 'I am writing to apply for the designer position', ['applying', 'at'], 'I am writing to apply for + posisi.'),
    mc(2, 'Salam penutup yang paling tepat untuk surat yang diawali "Dear Sir or Madam" adalah ...', null, [
      ['Yours faithfully,', true],
      ['Love,', 'Terlalu akrab untuk surat formal.'],
      ['See you!', 'Terlalu santai untuk surat formal.'],
    ], 'Dear Sir or Madam → Yours faithfully.'),
  ],
});

export const smaSnbt = lesson({
  id: 'sma-snbt',
  title: 'Literasi Bahasa Inggris Gaya SNBT',
  summary: 'Strategi membaca: gagasan utama, detail, kesimpulan, makna kata dari konteks, dan tujuan penulis.',
  topic: 'sma.snbt',
  objectives: [
    'Menemukan gagasan utama dan detail pendukung.',
    'Menarik kesimpulan (inference) dari informasi yang tersirat.',
    'Menebak makna kata dari konteks dan mengenali tujuan penulis.',
  ],
  intro: 'Tes Literasi dalam Bahasa Inggris menguji cara membaca, bukan hafalan. Kunci utamanya: baca pertanyaan dulu, cari kata kunci di teks, dan jangan memilih jawaban yang hanya "terdengar benar" tetapi tidak didukung teks. Latihan ini dibuat sendiri oleh Lentera, bukan soal resmi.',
  teaching: [
    {
      heading: 'Lima jenis pertanyaan yang sering muncul',
      body: 'Kenali jenis pertanyaannya, lalu pakai strateginya.',
      table: [
        ['Jenis', 'Contoh pertanyaan', 'Strategi'],
        ['Gagasan utama', 'What is the text mainly about?', 'Cari topik yang dibahas di seluruh teks, bukan satu kalimat saja.'],
        ['Detail', 'According to the text, ...?', 'Cari kata kunci, baca kalimat di sekitarnya.'],
        ['Inference', 'What can be inferred ...?', 'Jawaban tidak tertulis langsung, tetapi pasti benar menurut teks.'],
        ['Makna kata', 'The word "..." is closest in meaning to ...', 'Ganti kata itu dengan pilihan jawaban, cek apakah maknanya tetap.'],
        ['Tujuan penulis', 'The author\'s purpose is ...', 'Menjelaskan? Meyakinkan? Menceritakan?'],
      ],
    },
    {
      heading: 'Jebakan yang sering muncul',
      body: 'Pilihan yang benar secara umum tetapi tidak dibahas teks; pilihan yang terlalu luas atau terlalu sempit; pilihan yang memakai kata dari teks tetapi maknanya dibalik.',
      examples: [
        { en: 'The plan only works if buses are reliable.', id: 'Rencana itu hanya berhasil bila bus dapat diandalkan.', note: 'Kata "only ... if" adalah syarat; perhatikan kata pembatas seperti ini.' },
      ],
    },
  ],
  demo: [
    ['The text is mainly about how cities try to reduce traffic jams.', 'The text is mainly about TransJakarta buses.', 'TransJakarta hanya contoh; gagasan utamanya lebih luas.'],
    ['"Reliable" means "dependable".', '"Reliable" means "expensive".', 'Dari konteks: bus harus bisa diandalkan agar orang mau naik.'],
    ['The author wants to explain a problem and a possible solution.', 'The author wants to sell bus tickets.', 'Tujuan penulis dilihat dari isi seluruh teks.'],
  ],
  guided: [
    read(2, SNBT_1, 'What is the text mainly about?', [
      ['how cities try to reduce traffic by improving public transport', true],
      ['the history of TransJakarta', 'TransJakarta hanya contoh.'],
      ['why people like private cars', 'Hanya disebut sebagai satu penyebab.'],
    ], 'Gagasan utama mencakup seluruh teks: masalah macet dan solusinya.'),
    read(2, SNBT_1, 'The word "reliable" in the last sentence is closest in meaning to ...', [
      ['dependable', true],
      ['expensive', 'Bus mahal tidak membuat orang mau naik.'],
      ['crowded', 'Bukan makna kata itu.'],
    ], 'Bus harus bisa diandalkan (dependable).'),
    read(2, SNBT_1, 'Why are TransJakarta buses faster than cars during rush hour?', [
      ['They have their own lanes.', true],
      ['They drive faster than the speed limit.', 'Tidak disebut dalam teks.'],
      ['There are fewer passengers.', 'Tidak disebut dalam teks.'],
    ], 'TransJakarta buses have their own lanes.'),
    match(1, 'Pasangkan jenis pertanyaan dengan contohnya.', [
      ['gagasan utama', 'What is the text mainly about?'],
      ['makna kata', 'The word "..." is closest in meaning to ...'],
      ['inference', 'What can be inferred from the text?'],
      ['tujuan penulis', "What is the author's purpose?"],
    ], 'Kenali jenis pertanyaannya dulu.'),
  ],
  independent: [
    read(2, SNBT_2, 'What can be inferred from the text?', [
      ['Damaged reefs can hurt people\'s income.', true],
      ['Indonesia has no coral bleaching.', 'Teks menyebut terumbu dalam bahaya.'],
      ['Most sea creatures live outside reefs.', 'Teks: seperempat makhluk laut hidup di terumbu, tetapi kesimpulan ini tidak didukung.'],
    ], 'Jutaan orang bergantung pada terumbu untuk makanan dan pariwisata.'),
    read(2, SNBT_2, 'What is "bleaching"?', [
      ['corals losing their colours when the water is too warm', true],
      ['cleaning the sea with chemicals', 'Bukan makna dalam teks.'],
      ['fishing with bombs', 'Itu penyebab kerusakan lain.'],
    ], 'Corals lose their colours ... a process called bleaching.'),
    fill(2, 'The main idea of a text is what the ___ text is about. (seluruh)', ['whole', 'entire'], 'Gagasan utama mencakup seluruh teks.', { all: ['Pakai "whole" atau "entire" sebelum text.'] }),
    tr(2, 'Terumbu karang sedang dalam bahaya.', ['Coral reefs are in danger.', 'The coral reefs are in danger.', 'Coral reefs are endangered.'], 'are in danger.', { 'Coral reefs is in danger.': ['Jamak: are.'] }),
  ],
  homework: [
    read(2, SNBT_2, "What is the author's main purpose?", [
      ['to explain why coral reefs are important and in danger', true],
      ['to tell a story about a diver', 'Teks tidak bercerita.'],
      ['to advertise a tourist resort', 'Teks tidak mengiklankan.'],
    ], 'Teks menjelaskan pentingnya terumbu dan ancamannya.'),
    read(2, SNBT_1, 'According to the text, the plan only works if ...', [
      ['buses are reliable and stations are easy to reach', true],
      ['everybody buys a new car', 'Bertentangan dengan teks.'],
      ['the roads are wider', 'Tidak disebut dalam teks.'],
    ], 'Kata "only ... if" menunjukkan syarat.'),
    construct(2, 'the / text / is / mainly / about / coral / reefs', ['The text is mainly about coral reefs.'], 'The text is mainly about + topik.'),
  ],
  mastery: [
    read(3, SNBT_1, 'Which statement is NOT mentioned in the text?', [
      ['Bus tickets in Jakarta are free.', true],
      ['Many people prefer private vehicles.', 'Ini disebut dalam teks.'],
      ['Some cities have built better bus systems.', 'Ini disebut dalam teks.'],
    ], 'Teks menyebut cheap, bukan free.'),
    fix(2, 'Coral reefs is home to many sea creatures.', ['Coral reefs are home to many sea creatures.'], 'Jamak: are.', { 'Coral reefs is home to many sea creatures.': ['Kalimatnya belum diubah.'] }),
    read(3, SNBT_2, 'The word "damage" in the text is closest in meaning to ...', [
      ['harm', true],
      ['protect', 'Berlawanan makna.'],
      ['count', 'Bukan makna kata itu.'],
    ], 'Pollution and bombs damage (harm) the reefs.'),
  ],
});
