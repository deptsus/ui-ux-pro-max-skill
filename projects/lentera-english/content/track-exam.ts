// Jalur Khusus (Rilis 11) · Persiapan TOEFL ITP dan IELTS — strategi dan tata
// bahasa yang paling sering diuji. Lentera tidak berafiliasi dengan ETS,
// British Council, IDP, atau Cambridge; soal di sini latihan bergaya ujian,
// bukan soal resmi. The first lesson is free; the rest are Premium.
import { arrange, construct, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const toeflStructure = lesson({
  id: 'exam-toefl-structure',
  title: 'TOEFL ITP Structure: Kalimat yang Lengkap',
  summary: 'Setiap klausa butuh subjek dan kata kerja: cara cepat menjawab soal Structure.',
  topic: 'exam.toefl-structure',
  objectives: [
    'Memeriksa apakah setiap klausa sudah punya subjek dan kata kerja utama.',
    'Mengenali kata penghubung (because, although, which) yang menambah klausa baru.',
    'Menghindari jebakan: kata kerja -ing atau to + kata kerja bukan kata kerja utama.',
  ],
  intro: 'Bagian Structure pada TOEFL ITP berisi kalimat rumpang dengan empat pilihan. Banyak soal bisa dijawab dengan satu pertanyaan sederhana: apakah kalimatnya sudah punya subjek dan kata kerja utama? Strategi ini lebih cepat dan lebih andal daripada menebak dari bunyi kalimat.',
  teaching: [
    {
      heading: 'Satu klausa, satu subjek dan satu kata kerja utama',
      body: 'Kata kerja utama berubah sesuai waktu (is, was, grows, developed). Bentuk -ing atau to + kata kerja tanpa kata bantu bukan kata kerja utama. Jika kalimat belum punya kata kerja utama, jawabannya hampir pasti pilihan yang memberikannya.',
      examples: [
        { en: 'The Amazon River carries more water than any other river.', id: 'Sungai Amazon mengalirkan air lebih banyak daripada sungai lain mana pun.', note: 'Subjek: The Amazon River. Kata kerja: carries.' },
        { en: 'Coffee, grown in many tropical countries, is one of the most traded goods.', id: 'Kopi, yang ditanam di banyak negara tropis, adalah salah satu barang yang paling banyak diperdagangkan.', note: '"grown ..." hanya keterangan; kata kerja utamanya "is".' },
      ],
    },
    {
      heading: 'Kata penghubung menambah klausa',
      body: 'Setiap kata penghubung (because, although, when, which, that) membuka klausa baru yang juga butuh subjek dan kata kerjanya sendiri. Hitung: jumlah kata kerja utama = jumlah penghubung + 1.',
      table: [
        ['Kalimat', 'Penghubung', 'Kata kerja utama'],
        ['Bees are important because they pollinate crops.', 'because (1)', 'are, pollinate (2)'],
        ['Although it was cold, the team continued the survey.', 'although (1)', 'was, continued (2)'],
      ],
    },
    {
      heading: 'Jebakan yang sering muncul',
      body: 'Pilihan yang menambah kata kerja kedua tanpa penghubung, atau yang hanya memberi -ing/to + kata kerja, biasanya salah.',
      examples: [
        { en: 'The museum, which opened in 1990, attracts many visitors.', id: 'Museum itu, yang dibuka pada 1990, menarik banyak pengunjung.', note: '"which opened" punya penghubung; "attracts" adalah kata kerja utama.' },
        { en: 'Penguins cannot fly, but they are excellent swimmers.', id: 'Penguin tidak bisa terbang, tetapi mereka perenang yang hebat.', note: 'Dua klausa digabung dengan "but".' },
      ],
    },
  ],
  demo: [
    ['The first satellite was launched in 1957.', 'The first satellite launching in 1957.', 'Bentuk -ing saja bukan kata kerja utama; kalimat butuh "was launched".'],
    ['Because the road was closed, we took the train.', 'Because the road closed, took the train.', 'Klausa kedua kehilangan subjek "we".'],
    ['Volcanoes that are active can erupt at any time.', 'Volcanoes that are active erupting at any time.', 'Klausa utama butuh kata kerja yang berubah sesuai waktu: "can erupt".'],
  ],
  guided: [
    mc(1, 'Pilih jawaban yang melengkapi kalimat.', 'The Great Barrier Reef ___ the largest coral reef system in the world.', [
      ['is', true],
      ['being', 'being bukan kata kerja utama; kalimat belum punya kata kerja.'],
      ['which is', '"which" membuka klausa baru, sehingga klausa utama tetap tanpa kata kerja.'],
      ['to be', 'to be bukan kata kerja utama.'],
    ], 'Subjek "The Great Barrier Reef" butuh kata kerja utama: is.'),
    mc(2, 'Pilih jawaban yang melengkapi kalimat.', '___ the population grew quickly, the city built new schools.', [
      ['Because', true],
      ['Because of', '"because of" diikuti kata benda, bukan klausa (subjek + kata kerja).'],
      ['It was', 'Menambah kata kerja tanpa penghubung: dua klausa jadi tidak tersambung.'],
      ['The', 'Tidak menghubungkan dua klausa.'],
    ], 'Ada dua klausa (grew, built), jadi butuh satu penghubung: Because.'),
    tf(1, 'Kalimat "The scientists studying the volcano for ten years." sudah lengkap.', false, '"studying" bukan kata kerja utama. Kalimat lengkapnya: "The scientists have studied the volcano for ten years."', 'Pernyataan ini salah: kalimatnya belum punya kata kerja utama.'),
    match(1, 'Pasangkan kalimat dengan kata kerja utamanya.', [
      ['Rice, grown in Asia, feeds billions of people.', 'feeds'],
      ['The bridge that connects the islands opened in 2009.', 'opened'],
      ['Honey never spoils.', 'spoils'],
    ], 'Abaikan keterangan (grown ..., that connects ...), lalu cari kata kerja klausa utama.'),
  ],
  independent: [
    fix(2, 'The library built in 1920 and renovated in 2015.', ['The library was built in 1920 and renovated in 2015.'], 'Bentuk pasif butuh "was": The library was built ...', { 'The library built in 1920 and renovated in 2015.': ['Kalimatnya belum diubah.'] }),
    fill(2, 'Although the test was difficult, most students ___ it.', ['passed'], 'Klausa kedua butuh kata kerja utama bentuk lampau: passed.', { passing: ['passing bukan kata kerja utama.'], 'to pass': ['to pass bukan kata kerja utama.'] }),
    spot(2, 'Many animals that live in the desert sleeping during the day.', 'sleeping', 'sleep', 'Klausa utama "Many animals ... sleep during the day" butuh kata kerja utama, bukan -ing.'),
    construct(2, 'the company / which / was founded in 1998 / employs / 500 people', ['The company, which was founded in 1998, employs 500 people.', 'The company which was founded in 1998 employs 500 people.'], 'Klausa relatif "which was founded in 1998" diletakkan setelah subjek; kata kerja utama: employs.'),
  ],
  homework: [
    mc(2, 'Pilih jawaban yang melengkapi kalimat.', 'Mount Everest, ___ on the border of Nepal and China, is the highest mountain on Earth.', [
      ['located', true],
      ['is located', 'Menambah kata kerja utama kedua tanpa penghubung.'],
      ['it is located', 'Menambah klausa tanpa penghubung.'],
      ['locates', 'Bentuk aktif tidak tepat dan menambah kata kerja kedua.'],
    ], '"located on ..." adalah keterangan (klausa yang dipendekkan); kata kerja utama sudah ada: is.'),
    arrange(2, 'Ketika hujan turun, jalanan menjadi licin.', 'When it rains the roads become slippery', ['raining', 'becoming'], 'Dua klausa: When it rains (penghubung + subjek + kata kerja), the roads become slippery.'),
    tf(2, 'Dalam kalimat dengan satu kata penghubung, biasanya ada dua kata kerja utama.', true, 'Aturan hitung: kata kerja utama = penghubung + 1.', 'Pernyataan ini benar.'),
  ],
  mastery: [
    tr(3, 'Meskipun minyak sawit murah, produksinya memengaruhi hutan.', ['Although palm oil is cheap, its production affects forests.', 'Although palm oil is cheap, its production affects the forests.', 'Even though palm oil is cheap, its production affects forests.'], 'Dua klausa, satu penghubung (Although), dua kata kerja utama (is, affects).', { 'Although palm oil cheap, its production affects forests.': ['Klausa pertama kehilangan kata kerja "is".'] }),
    fix(3, 'Penicillin, discovered in 1928, saving millions of lives.', ['Penicillin, discovered in 1928, has saved millions of lives.', 'Penicillin, discovered in 1928, saved millions of lives.'], '"discovered in 1928" hanya keterangan; klausa utama butuh kata kerja: has saved / saved.', { 'Penicillin, discovered in 1928, saving millions of lives.': ['Kalimatnya belum diubah.'] }),
    mc(3, 'Pilih jawaban yang melengkapi kalimat.', 'The first person ___ the South Pole was Roald Amundsen.', [
      ['to reach', true],
      ['reached', 'Menambah kata kerja utama kedua; kalimat sudah punya "was".'],
      ['he reached', 'Menambah klausa tanpa penghubung.'],
      ['who reaching', '"who" butuh kata kerja utama, bukan -ing.'],
    ], 'Setelah "the first", bentuk to + kata kerja menerangkan kata benda: the first person to reach.'),
  ],
});

export const toeflWritten = lesson({
  id: 'exam-toefl-written',
  title: 'TOEFL ITP Written Expression: Mencari Kesalahan',
  summary: 'Tiga kesalahan yang paling sering diuji: kesesuaian subjek-kata kerja, struktur sejajar, dan bentuk kata.',
  topic: 'exam.toefl-written',
  objectives: [
    'Menemukan subjek sebenarnya walau terhalang frasa (of the students, along with ...).',
    'Memeriksa struktur sejajar dalam daftar (and, or, both ... and).',
    'Membedakan bentuk kata: kata sifat untuk kata benda, kata keterangan untuk kata kerja.',
  ],
  intro: 'Pada Written Expression, empat bagian kalimat digarisbawahi dan kamu memilih satu yang salah. Kesalahannya hampir selalu termasuk beberapa pola yang sama. Pelajaran ini melatih tiga pola paling umum dengan cara memeriksa yang sistematis.',
  teaching: [
    {
      heading: 'Cari subjek yang sebenarnya',
      body: 'Frasa dengan of, along with, together with, atau as well as tidak mengubah subjek. "The number of" tunggal; "a number of" jamak.',
      table: [
        ['Kalimat', 'Subjek', 'Kata kerja'],
        ['The list of names is on the desk.', 'The list', 'is'],
        ['The manager, along with his assistants, was at the meeting.', 'The manager', 'was'],
        ['The number of tourists has increased.', 'The number', 'has'],
        ['A number of tourists have complained.', 'tourists', 'have'],
      ],
    },
    {
      heading: 'Struktur sejajar',
      body: 'Unsur yang dihubungkan dengan and, or, atau both ... and harus berbentuk sama: semua kata benda, semua -ing, atau semua kata kerja dasar.',
      examples: [
        { en: 'She likes reading, swimming, and cooking.', id: 'Dia suka membaca, berenang, dan memasak.', note: 'Bukan "reading, swimming, and to cook".' },
        { en: 'The job requires patience and accuracy.', id: 'Pekerjaan itu membutuhkan kesabaran dan ketelitian.', note: 'Dua kata benda; bukan "patience and accurate".' },
      ],
    },
    {
      heading: 'Bentuk kata',
      body: 'Kata sifat menerangkan kata benda; kata keterangan (biasanya -ly) menerangkan kata kerja atau kata sifat.',
      examples: [
        { en: 'The river flows quickly.', id: 'Sungainya mengalir dengan cepat.', note: 'quickly menerangkan flows.' },
        { en: 'It was a careful decision.', id: 'Itu keputusan yang hati-hati.', note: 'careful menerangkan decision.' },
      ],
    },
  ],
  demo: [
    ['The quality of the products is excellent.', 'The quality of the products are excellent.', 'Subjeknya "The quality" (tunggal), bukan "the products".'],
    ['The course teaches speaking, listening, and writing.', 'The course teaches speaking, listening, and to write.', 'Daftar harus sejajar: semua bentuk -ing.'],
    ['The data was analyzed carefully.', 'The data was analyzed careful.', 'Menerangkan kata kerja "analyzed" butuh kata keterangan.'],
  ],
  guided: [
    spot(1, 'The results of the experiment was surprising.', 'was', 'were', 'Subjeknya "The results" (jamak), jadi kata kerjanya were.'),
    mc(2, 'Bagian mana yang salah?', 'The teacher, along with her students, are visiting the museum.', [
      ['are', true],
      ['along with', 'Frasa ini benar; hanya tidak mengubah subjek.'],
      ['her students', 'Benar sebagai bagian frasa "along with ...".'],
      ['visiting', 'Bentuk -ing benar setelah is/are.'],
    ], 'Subjeknya "The teacher" (tunggal): is visiting.'),
    spot(1, 'She enjoys singing, dancing, and cook.', 'cook', 'cooking', 'Daftar harus sejajar: singing, dancing, and cooking.'),
    match(1, 'Pasangkan kesalahan dengan jenisnya.', [
      ['The list of items are long.', 'Kesesuaian subjek-kata kerja'],
      ['He is smart, kind, and works hard.', 'Struktur sejajar'],
      ['She speaks English fluent.', 'Bentuk kata'],
    ], 'Tiga pola kesalahan yang paling sering diuji.'),
  ],
  independent: [
    fix(2, 'The number of students in the class are increasing.', ['The number of students in the class is increasing.'], '"The number of" tunggal: is increasing.', { 'The number of students in the class are increasing.': ['Kalimatnya belum diubah.'] }),
    fix(2, 'The new software works efficient.', ['The new software works efficiently.'], 'works diterangkan kata keterangan: efficiently.', { 'The new software works efficient.': ['Kalimatnya belum diubah.'] }),
    fill(2, 'The program is both useful and ___ (afford).', ['affordable'], 'both ... and menghubungkan dua kata sifat: useful and affordable.', { afford: ['Butuh kata sifat agar sejajar dengan useful.'], affordably: ['Butuh kata sifat, bukan kata keterangan.'] }),
    construct(2, 'each of the participants / receive / a certificate (present simple)', ['Each of the participants receives a certificate.'], '"Each of ..." selalu tunggal: receives.', { 'Each of the participants receive a certificate.': ['Each tunggal; kata kerjanya receives.'] }),
  ],
  homework: [
    spot(2, 'A number of researchers has studied this disease.', 'has', 'have', '"A number of" berarti "banyak", jadi jamak: have studied.'),
    arrange(2, 'Dia menulis laporan itu dengan cepat dan akurat.', 'She wrote the report quickly and accurately', ['quick', 'accurate'], 'Dua kata keterangan sejajar menerangkan wrote.'),
    tf(2, '"The students, as well as their teacher, was late." adalah kalimat yang benar.', false, 'Frasa "as well as their teacher" tidak mengubah subjek. Subjeknya "The students" (jamak): were late.', 'Pernyataan ini salah.'),
  ],
  mastery: [
    fix(3, 'The museum offers guided tours, workshops, and to watch films.', ['The museum offers guided tours, workshops, and film screenings.', 'The museum offers guided tours, workshops, and films.'], 'Daftar harus sejajar: semua kata benda.', { 'The museum offers guided tours, workshops, and to watch films.': ['Kalimatnya belum diubah.'] }),
    tr(3, 'Kualitas udara di kota-kota besar menurun dengan cepat.', ['The air quality in big cities is decreasing rapidly.', 'The quality of the air in big cities is decreasing rapidly.', 'Air quality in big cities is decreasing quickly.', 'The air quality in big cities is decreasing quickly.', 'Air quality in big cities is decreasing rapidly.', 'Air quality in large cities is declining rapidly.'], 'Subjek tunggal (quality) + is + -ing + kata keterangan.', { 'The air quality in big cities are decreasing rapidly.': ['Subjeknya quality (tunggal): is.'] }),
    read(3, 'Researchers have found that the number of bird species in the region has fallen by 20 percent since 1990. Habitat loss, along with climate change, is the main cause. Protecting wetlands, planting native trees, and reducing pesticide use could help the birds recover.', 'Menurut teks, apa penyebab utama berkurangnya jenis burung?', [
      ['Hilangnya habitat dan perubahan iklim.', true],
      ['Penanaman pohon asli.', 'Itu justru salah satu cara membantu burung pulih.'],
      ['Jumlah peneliti yang berkurang.', 'Teks tidak menyebut hal ini.'],
    ], 'Lihat kalimat "Habitat loss, along with climate change, is the main cause." Perhatikan juga "is": subjeknya habitat loss.'),
  ],
});

export const ieltsWriting = lesson({
  id: 'exam-ielts-writing',
  title: 'IELTS Writing Task 2: Esai Opini',
  summary: 'Pendahuluan dengan sikap yang jelas, paragraf isi dengan kalimat topik, dan kata penghubung.',
  topic: 'exam.ielts-writing',
  objectives: [
    'Menulis kalimat sikap (thesis) yang menjawab pertanyaan secara langsung.',
    'Menyusun paragraf isi: kalimat topik, alasan, contoh.',
    'Memakai kata penghubung dengan tanda baca yang benar: However, Moreover, For example.',
  ],
  intro: 'IELTS Writing Task 2 meminta esai minimal 250 kata dalam sekitar 40 menit. Penilai memeriksa apakah kamu menjawab pertanyaan, menyusun gagasan dengan jelas, memakai kosakata yang tepat, dan tata bahasa yang akurat. Struktur yang rapi adalah cara tercepat untuk mendapat nilai yang lebih baik.',
  teaching: [
    {
      heading: 'Struktur empat paragraf',
      body: 'Pendahuluan (parafrase soal + sikapmu), dua paragraf isi (masing-masing satu gagasan utama), dan kesimpulan (ulangi sikap dengan kata lain).',
      table: [
        ['Paragraf', 'Isi'],
        ['Pendahuluan', 'Parafrase topik + "I strongly agree that ..."'],
        ['Isi 1', 'Kalimat topik + alasan + contoh'],
        ['Isi 2', 'Kalimat topik + alasan + contoh'],
        ['Kesimpulan', '"In conclusion, ..." + sikap yang sama'],
      ],
    },
    {
      heading: 'Kata penghubung dan tanda bacanya',
      body: 'However, Moreover, Therefore, dan For example di awal kalimat diikuti koma. "Although" dan "because" menghubungkan dua klausa dalam satu kalimat; jangan dipakai sendirian sebagai kalimat.',
      examples: [
        { en: 'Online learning is flexible. However, it requires strong self-discipline.', id: 'Belajar daring itu fleksibel. Namun, belajar daring menuntut disiplin diri yang kuat.' },
        { en: 'Moreover, public transport reduces traffic jams.', id: 'Selain itu, transportasi umum mengurangi kemacetan.' },
        { en: 'Although cars are convenient, they cause pollution.', id: 'Meskipun mobil praktis, mobil menyebabkan polusi.' },
      ],
    },
    {
      heading: 'Gaya akademik',
      body: 'Hindari bahasa percakapan dan singkatan. Pilih kata yang lebih tepat dan netral.',
      table: [
        ['Hindari', 'Pakai'],
        ["don't, can't", 'do not, cannot'],
        ['a lot of', 'many / a large number of'],
        ['kids', 'children'],
        ['get better', 'improve'],
      ],
    },
  ],
  demo: [
    ['I strongly agree that schools should teach financial skills.', 'I think maybe schools can teach about money, it depends.', 'Sikap harus jelas sejak pendahuluan.'],
    ['However, this approach has some disadvantages.', 'But this approach has some disadvantages.', 'Di awal kalimat esai akademik, "However," lebih tepat daripada "But".'],
    ['Many children spend too much time online.', "A lot of kids spend too much time online.", 'Esai akademik memakai kata yang lebih formal.'],
  ],
  guided: [
    mc(1, 'Pilih kalimat sikap (thesis) yang paling jelas.', 'Soal: Some people think that university education should be free. To what extent do you agree or disagree?', [
      ['I strongly agree that university education should be free for all students.', true],
      ['University is a place where students study many subjects.', 'Tidak menjawab pertanyaan agree/disagree.'],
      ['Maybe it is good, maybe it is bad.', 'Tidak menunjukkan sikap yang jelas.'],
    ], 'Pendahuluan harus menyatakan sikapmu secara langsung.'),
    mc(2, 'Pilih kata penghubung yang tepat.', 'Working from home saves travel time. ___, it can make employees feel isolated.', [
      ['However', true],
      ['Moreover', 'Moreover menambah gagasan yang searah, bukan yang bertentangan.'],
      ['For example', 'Kalimat kedua bukan contoh dari kalimat pertama.'],
    ], 'Kalimat kedua bertentangan dengan yang pertama: However.'),
    match(1, 'Pasangkan kata informal dengan padanan akademiknya.', [
      ['kids', 'children'],
      ['a lot of', 'a large number of'],
      ['get better', 'improve'],
      ["can't", 'cannot'],
    ], 'Gaya akademik memakai kata yang lebih formal dan tanpa singkatan.'),
    tf(1, '"Although the city is crowded." adalah kalimat lengkap yang benar.', false, '"Although" butuh klausa kedua: "Although the city is crowded, it offers many jobs."', 'Pernyataan ini salah.'),
  ],
  independent: [
    fix(2, "A lot of kids don't get enough exercise.", ['Many children do not get enough exercise.', 'A large number of children do not get enough exercise.', 'Many children do not do enough exercise.'], 'Ganti kata informal: many/a large number of, children, do not.', { "A lot of kids don't get enough exercise.": ['Kalimatnya belum diubah.'] }),
    tr(2, 'Selain itu, transportasi umum mengurangi polusi udara.', ['Moreover, public transport reduces air pollution.', 'Furthermore, public transport reduces air pollution.', 'In addition, public transport reduces air pollution.', 'Moreover, public transportation reduces air pollution.'], 'Moreover/Furthermore/In addition + koma + kalimat.', { 'Moreover public transport reduce air pollution.': ['Subjek tunggal: reduces; dan beri koma setelah Moreover.'] }),
    construct(2, 'although / technology / be useful / it / can be distracting', ['Although technology is useful, it can be distracting.'], 'Although + klausa 1, klausa 2.'),
    spot(2, 'In conclusion, I strongly agree that governments should invests in public parks.', 'invests', 'invest', 'Setelah should, pakai kata kerja dasar: should invest.'),
  ],
  homework: [
    arrange(2, 'Misalnya, banyak siswa bekerja paruh waktu.', 'For example many students work part-time', ['works', 'Example'], 'For example + koma + kalimat.'),
    read(2, 'Some people believe that children should start learning a foreign language at primary school. I strongly agree with this view. Firstly, young children learn pronunciation more easily than adults. For example, many children who grow up in bilingual families speak both languages without an accent. Secondly, early learning gives students more years to practise.', 'Apa fungsi kalimat "For example, many children ..."?', [
      ['Memberi contoh untuk mendukung alasan pertama.', true],
      ['Menyatakan sikap penulis.', 'Sikap penulis ada di "I strongly agree with this view."'],
      ['Menyimpulkan esai.', 'Ini bagian isi, bukan kesimpulan.'],
    ], 'Pola paragraf isi: alasan (Firstly ...) lalu contoh (For example ...).'),
    fill(2, 'Many people prefer cars. ___, public transport is cheaper and greener.', ['However'], 'Kalimat kedua bertentangan: However.', { Moreover: ['Moreover untuk gagasan yang searah.'], But: ['Di esai akademik, "However," lebih tepat di awal kalimat.'] }),
  ],
  mastery: [
    tr(3, 'Kesimpulannya, saya sangat setuju bahwa sekolah sebaiknya mengajarkan keterampilan keuangan.', ['In conclusion, I strongly agree that schools should teach financial skills.', 'In conclusion, I strongly agree that schools should teach financial literacy.', 'To conclude, I strongly agree that schools should teach financial skills.'], 'In conclusion, + sikap yang sama dengan pendahuluan.', { 'In conclusion, I am strongly agree that schools should teach financial skills.': ['agree tanpa am.'] }),
    fix(3, "A lot of kids can't focus in class.", ['Many children cannot focus in class.', 'Many children cannot concentrate in class.', 'A large number of children cannot focus in class.', 'A large number of children cannot concentrate in class.'], 'Gaya akademik: many/a large number of, children, cannot.', { "A lot of kids can't focus in class.": ['Kalimatnya belum diubah.'], "Many kids can't focus in class.": ['Masih ada "kids" dan singkatan "can\'t".'] }),
    mc(3, 'Kalimat topik mana yang paling cocok untuk paragraf tentang manfaat olahraga di sekolah?', null, [
      ['The main benefit of school sports is that they improve students\' physical health.', true],
      ['I play football every Saturday with my friends.', 'Pengalaman pribadi santai, bukan kalimat topik akademik.'],
      ['Sports are a lot of fun and kids love them.', 'Terlalu informal dan tidak menyatakan gagasan utama yang jelas.'],
    ], 'Kalimat topik menyatakan satu gagasan utama paragraf dengan bahasa akademik.'),
  ],
});
