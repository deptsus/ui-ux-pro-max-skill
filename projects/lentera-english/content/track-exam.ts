// Jalur Khusus (Rilis 11) · Persiapan TOEFL ITP dan IELTS — strategi dan tata
// bahasa yang paling sering diuji. Lentera tidak berafiliasi dengan ETS,
// British Council, IDP, atau Cambridge; soal di sini latihan bergaya ujian,
// bukan soal resmi. The first lesson is free; the rest are Premium.
import { arrange, construct, dictation, fill, fix, lesson, listen, match, mc, read, spot, tf, tr } from './dsl';

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

export const toeflListening = lesson({
  id: 'exam-toefl-listening',
  title: 'TOEFL ITP Listening: Percakapan Pendek',
  summary: 'Menangkap jawaban orang kedua, idiom, dan saran yang tersirat di Part A.',
  topic: 'exam.toefl-listening',
  objectives: [
    'Fokus pada kalimat orang kedua, tempat jawaban biasanya berada.',
    'Mengenali jawaban tersirat: saran, penolakan halus, dan kejutan.',
    'Menghindari jebakan pilihan yang mengulang bunyi kata dari audio.',
  ],
  intro: 'Listening Part A TOEFL ITP berisi percakapan dua orang yang sangat pendek, lalu satu pertanyaan. Jawabannya hampir selalu ada di kalimat orang kedua, dan sering tidak diucapkan langsung. Pilihan yang memakai kata yang persis sama dengan audio justru sering jebakan.',
  teaching: [
    {
      heading: 'Dengarkan orang kedua',
      body: 'Orang pertama memberi situasi; orang kedua memberi tanggapan yang ditanyakan. Bacalah pilihan jawaban lebih dulu (bila sempat) agar tahu apa yang dicari.',
      examples: [
        { en: 'Woman: I can\'t find my notes. Man: Did you check your backpack?', id: 'Perempuan: Catatanku tidak ketemu. Laki-laki: Sudah cek ranselmu?', note: 'Makna: laki-laki menyarankan ia mencari di ransel.' },
      ],
    },
    {
      heading: 'Makna tersirat',
      body: 'Pertanyaan balik sering berarti saran; "I wish ..." berarti kenyataannya sebaliknya; "Not again!" berarti hal itu sudah sering terjadi.',
      table: [
        ['Ucapan', 'Makna'],
        ['Why don\'t you ask the professor?', 'Saran: tanyakan ke dosen'],
        ['I wish I had more time.', 'Dia tidak punya cukup waktu'],
        ['I\'d rather stay home.', 'Dia memilih tidak pergi'],
      ],
    },
    {
      heading: 'Jebakan bunyi mirip',
      body: 'Pilihan yang memakai kata dengan bunyi mirip (walk/work, sixteen/sixty) atau mengulang kata dari audio sering salah. Pilih makna, bukan bunyi.',
      examples: [
        { en: 'Man: Is the library open late? Woman: Only during exam week.', id: 'Laki-laki: Perpustakaan buka sampai malam? Perempuan: Hanya saat minggu ujian.', note: 'Makna: biasanya tidak buka sampai malam.' },
      ],
    },
  ],
  demo: [
    ['She suggests checking the backpack.', 'She has a backpack.', 'Pertanyaan "Did you check your backpack?" adalah saran, bukan informasi kepemilikan.'],
    ['He did not have enough time.', 'He had a lot of time.', '"I wish I had more time" berarti waktunya kurang.'],
    ['The library is usually not open late.', 'The library is always open late.', '"Only during exam week" berarti tidak biasanya.'],
  ],
  guided: [
    listen(1, 'Woman: I missed the bus again. Man: Why don\'t you leave home ten minutes earlier?', 'Apa yang disarankan laki-laki?', [
      ['Berangkat sepuluh menit lebih awal.', true],
      ['Naik bus yang lain.', 'Tidak ada bus lain disebut.'],
      ['Tinggal di rumah.', '"leave home" berarti berangkat dari rumah, bukan tinggal di rumah.'],
    ], '"Why don\'t you ...?" adalah saran.'),
    listen(1, 'Man: Are you coming to the party tonight? Woman: I\'d rather stay home and rest.', 'Apa maksud perempuan itu?', [
      ['Dia tidak akan datang ke pesta.', true],
      ['Dia akan datang setelah beristirahat.', '"I\'d rather stay home" berarti memilih tidak pergi.'],
      ['Pestanya diadakan di rumahnya.', 'Jebakan kata "home"; maknanya ia memilih di rumah.'],
    ], '"I\'d rather ..." = lebih memilih.'),
    match(1, 'Pasangkan ucapan dengan maknanya.', [
      ['Why don\'t you ...?', 'Memberi saran'],
      ['I wish I had ...', 'Kenyataannya tidak punya'],
      ['Not again!', 'Sudah sering terjadi'],
    ], 'Makna tersirat yang sering diuji.'),
    tf(1, 'Pilihan jawaban yang memakai kata persis sama dengan audio selalu benar.', false, 'Justru sering jebakan; pilih berdasarkan makna.', 'Pernyataan ini salah.'),
  ],
  independent: [
    dictation(2, 'I wish I had studied harder for the test.', 'I wish I had ___ harder for the test.', ['studied'], 'Setelah "I wish I had" pakai bentuk ketiga: studied.', { study: ['Setelah had, pakai bentuk ketiga: studied.'] }),
    listen(2, 'Woman: Is the cafeteria open on Sunday? Man: Only in the morning.', 'Apa yang bisa disimpulkan?', [
      ['Kafetaria tutup pada Minggu sore.', true],
      ['Kafetaria tutup sepanjang hari Minggu.', 'Kafetaria buka pagi hari.'],
      ['Kafetaria buka setiap pagi.', 'Laki-laki hanya menjawab tentang hari Minggu.'],
    ], '"Only in the morning" berarti sore dan malam tutup.'),
    tr(2, 'Dia menyarankan agar saya bertanya kepada dosen.', ['He suggested that I ask the professor.', 'He suggested asking the professor.', 'She suggested that I ask the professor.', 'She suggested asking the professor.', 'He suggested I ask the professor.', 'She suggested I ask the professor.'], 'suggest + that + subjek + kata kerja dasar, atau suggest + -ing.', { 'He suggested me to ask the professor.': ['"suggest" tidak memakai pola "someone to do".'] }),
    fill(2, "Man: I'd rather ___ (take) the train.", ['take'], "I'd rather + kata kerja dasar.", { taking: ["Setelah I'd rather, pakai kata kerja dasar."], 'to take': ["Setelah I'd rather, tanpa to."] }),
  ],
  homework: [
    listen(2, 'Man: Did you finish the report? Woman: I\'m still waiting for the sales figures.', 'Apa yang bisa disimpulkan tentang laporan itu?', [
      ['Laporannya belum selesai.', true],
      ['Laporannya sudah dikirim.', 'Ia masih menunggu data, jadi belum selesai.'],
      ['Penjualan sedang menurun.', 'Tidak ada informasi tentang naik turunnya penjualan.'],
    ], 'Masih menunggu data berarti laporan belum selesai.'),
    construct(2, 'why / you / not / call / the office (saran)', ["Why don't you call the office?", 'Why do not you call the office?'], "Why don't you + kata kerja dasar?"),
    mc(2, 'Pria berkata: "Not again! The printer is broken." Apa artinya?', null, [
      ['Printer itu sudah sering rusak.', true],
      ['Printer itu baru pertama kali rusak.', '"Not again" menunjukkan kejadian berulang.'],
      ['Dia tidak mau memakai printer lagi.', 'Bukan penolakan, melainkan keluhan.'],
    ], '"Not again!" = sudah berulang kali.'),
  ],
  mastery: [
    tr(3, 'Saya berharap saya punya lebih banyak waktu.', ['I wish I had more time.'], 'I wish + bentuk lampau untuk keadaan sekarang yang berbeda.', { 'I wish I have more time.': ['Setelah I wish, pakai bentuk lampau: had.'] }),
    listen(3, 'Woman: Professor Lim\'s class is so hard. Man: You can say that again.', 'Apa maksud laki-laki itu?', [
      ['Dia setuju kelasnya sulit.', true],
      ['Dia ingin perempuan itu mengulang ucapannya.', '"You can say that again" adalah idiom untuk setuju sepenuhnya.'],
      ['Dia belum pernah ikut kelas itu.', 'Tidak ada petunjuk tentang hal itu.'],
    ], 'Idiom "You can say that again" = sangat setuju.'),
    fix(3, 'He suggested me to take the earlier bus.', ['He suggested that I take the earlier bus.', 'He suggested taking the earlier bus.', 'He suggested I take the earlier bus.'], 'suggest that + subjek + kata kerja dasar, atau suggest + -ing.', { 'He suggested me to take the earlier bus.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const ieltsReading = lesson({
  id: 'exam-ielts-reading',
  title: 'IELTS Reading: True, False, Not Given',
  summary: 'Membedakan pernyataan yang dibantah teks (False) dan yang tidak dibahas (Not Given).',
  topic: 'exam.ielts-reading',
  objectives: [
    'Menjawab True hanya bila teks menyatakan hal yang sama, walau dengan kata lain.',
    'Menjawab False bila teks menyatakan kebalikannya.',
    'Menjawab Not Given bila teks tidak memberi informasi itu, tanpa menebak dari pengetahuan umum.',
  ],
  intro: 'Soal True/False/Not Given adalah salah satu yang paling banyak membuat peserta kehilangan nilai di IELTS Reading. Kesalahan utamanya: memakai pengetahuan sendiri atau menganggap "tidak disebut" sama dengan "salah". Kuncinya adalah hanya percaya pada teks.',
  teaching: [
    {
      heading: 'Tiga kemungkinan',
      body: 'Bandingkan pernyataan dengan bagian teks yang sesuai. Teks biasanya memakai sinonim (parafrase), bukan kata yang sama.',
      table: [
        ['Jawaban', 'Artinya'],
        ['True', 'Teks menyatakan hal yang sama (sering dengan kata lain).'],
        ['False', 'Teks menyatakan kebalikannya.'],
        ['Not Given', 'Teks tidak membahasnya; tidak bisa dipastikan.'],
      ],
    },
    {
      heading: 'Kata pembatas',
      body: 'Perhatikan kata seperti all, some, only, always, usually, most. Satu kata pembatas bisa mengubah jawaban.',
      examples: [
        { en: 'Text: Most visitors arrive by train. Statement: All visitors arrive by train.', id: 'Teks: Kebanyakan pengunjung datang naik kereta. Pernyataan: Semua pengunjung datang naik kereta.', note: 'Jawaban: False (most ≠ all).' },
        { en: 'Text: The museum opened in 1990. Statement: The museum was popular in 1990.', id: 'Teks: Museum dibuka pada 1990. Pernyataan: Museum itu populer pada 1990.', note: 'Jawaban: Not Given (popularitas tidak dibahas).' },
      ],
    },
    {
      heading: 'Jangan menebak dari pengetahuan umum',
      body: 'Walau kamu tahu sesuatu benar di dunia nyata, jawab Not Given jika teks tidak menyatakannya.',
      examples: [
        { en: 'Text: Coffee was first grown in Ethiopia. Statement: Coffee contains caffeine.', id: 'Teks: Kopi pertama kali ditanam di Etiopia. Pernyataan: Kopi mengandung kafein.', note: 'Jawaban: Not Given, walau faktanya benar.' },
      ],
    },
  ],
  demo: [
    ['Not Given (the text says nothing about price).', 'False (because I think it is expensive).', 'Jangan menilai dari pendapat atau pengetahuan sendiri.'],
    ['False (most is not all).', 'True (both mention visitors and trains).', 'Kata pembatas "most" dan "all" berbeda.'],
    ['True (rose = increased).', 'Not Given (the word "increased" is not in the text).', 'Teks sering memakai sinonim; maknanya sama.'],
  ],
  guided: [
    read(1, 'The town library was built in 1975. It has more than 20,000 books and is open every day except Monday.', 'Pernyataan: "The library is closed on Mondays."', [
      ['True', true],
      ['False', 'Teks menyatakan buka setiap hari kecuali Senin, jadi Senin tutup.'],
      ['Not Given', 'Informasinya ada: "except Monday".'],
    ], '"open every day except Monday" = tutup hari Senin.'),
    read(1, 'The town library was built in 1975. It has more than 20,000 books and is open every day except Monday.', 'Pernyataan: "The library is the largest in the province."', [
      ['Not Given', true],
      ['True', 'Teks tidak membandingkan dengan perpustakaan lain.'],
      ['False', 'Teks tidak membantahnya; hanya tidak membahas.'],
    ], 'Perbandingan ukuran tidak disebut sama sekali.'),
    read(2, 'Most students in the survey said they study better in the morning.', 'Pernyataan: "All students prefer studying in the morning."', [
      ['False', true],
      ['True', '"Most" tidak sama dengan "all".'],
      ['Not Given', 'Teks memberi informasi yang bertentangan: hanya sebagian besar, bukan semua.'],
    ], 'Kata pembatas: most ≠ all.'),
    match(1, 'Pasangkan sinonim yang sering muncul dalam parafrase.', [
      ['rose', 'increased'],
      ['purchase', 'buy'],
      ['approximately', 'about'],
      ['annual', 'every year'],
    ], 'Teks dan pernyataan sering memakai sinonim.'),
  ],
  independent: [
    fill(2, 'If the text says nothing about it, the answer is Not ___.', ['Given'], 'Pilihan ketiga: Not Given.', { True: ['Jawaban lengkapnya "Not Given".'] }),
    tr(2, 'Teks tidak membahas harganya.', ['The text does not mention the price.', "The text doesn't mention the price.", 'The text does not discuss the price.', "The text doesn't say anything about the price."], 'mention/discuss + objek tanpa about (kecuali "say anything about").'),
    read(2, 'Sales of electric scooters rose sharply in 2023, mainly in large cities.', 'Pernyataan: "Electric scooter sales increased in 2023."', [
      ['True', true],
      ['False', '"rose sharply" berarti naik tajam.'],
      ['Not Given', 'Informasinya ada dengan sinonim: rose = increased.'],
    ], 'Parafrase: rose = increased.'),
    construct(2, 'the text / not / say / anything / about the cost', ["The text doesn't say anything about the cost.", 'The text does not say anything about the cost.'], 'does not / doesn\'t + say anything about.'),
  ],
  homework: [
    read(2, 'The bridge was completed in 2009. It connects the two islands and has reduced travel time from three hours to forty minutes.', 'Pernyataan: "Before 2009, the trip between the islands took less time."', [
      ['False', true],
      ['True', 'Sebelumnya tiga jam, sekarang empat puluh menit; jadi dulu lebih lama.'],
      ['Not Given', 'Teks menyebut waktu tempuh sebelum dan sesudah jembatan.'],
    ], 'Teks bertentangan dengan pernyataan.'),
    read(2, 'The bridge was completed in 2009. It connects the two islands and has reduced travel time from three hours to forty minutes.', 'Pernyataan: "The bridge was built by a foreign company."', [
      ['Not Given', true],
      ['True', 'Pembangunnya tidak disebut.'],
      ['False', 'Teks tidak membantahnya.'],
    ], 'Siapa pembangunnya tidak dibahas.'),
    arrange(2, 'Jawabannya False karena teks mengatakan sebaliknya.', 'The answer is False because the text says the opposite', ['Given', 'same'], 'False = teks menyatakan kebalikannya.'),
  ],
  mastery: [
    read(3, 'Researchers found that people who walked for 30 minutes a day slept better than those who did not exercise. However, the study did not look at diet.', 'Pernyataan: "Eating vegetables helps people sleep better."', [
      ['Not Given', true],
      ['True', 'Pola makan tidak diteliti dalam studi ini.'],
      ['False', 'Teks tidak membantahnya; hanya tidak membahas.'],
    ], 'Teks bahkan menyebut studi tidak meneliti pola makan.'),
    tr(3, 'Kebanyakan pengunjung datang pada akhir pekan.', ['Most visitors come at the weekend.', 'Most visitors come on weekends.', 'Most visitors arrive at the weekend.', 'Most visitors come on the weekend.', 'Most visitors arrive on weekends.'], 'Most + kata benda jamak tanpa "of the".', { 'Most of visitors come at the weekend.': ['Tanpa "the", pakai "Most visitors" (bukan "most of visitors").'] }),
    fix(3, 'The answer is False because the text does not mention it.', ['The answer is Not Given because the text does not mention it.', "The answer is Not Given because the text doesn't mention it."], 'Tidak disebut = Not Given, bukan False.', { 'The answer is False because the text does not mention it.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const ieltsSpeaking = lesson({
  id: 'exam-ielts-speaking',
  title: 'IELTS Speaking: Jawaban yang Berkembang',
  summary: 'Part 1 dengan alasan dan contoh, Part 2 (cue card) dengan struktur, dan ungkapan mengulur waktu.',
  topic: 'exam.ielts-speaking',
  objectives: [
    'Mengembangkan jawaban Part 1: jawab, beri alasan, beri contoh.',
    'Menyusun Part 2 (cue card) dua menit mengikuti poin di kartu.',
    'Memakai ungkapan mengulur waktu yang wajar alih-alih diam.',
  ],
  intro: 'Di IELTS Speaking, jawaban "Yes, I do." terlalu pendek untuk menunjukkan kemampuanmu. Penguji menilai kelancaran, kosakata, tata bahasa, dan pelafalan; semuanya butuh jawaban yang berkembang. Pola sederhana "jawab, alasan, contoh" membantu kamu berbicara lebih panjang dengan rapi.',
  teaching: [
    {
      heading: 'Part 1: jawab, alasan, contoh',
      body: 'Dua sampai tiga kalimat cukup. Jangan menghafal jawaban; penguji bisa mengenalinya.',
      examples: [
        { en: 'Q: Do you like cooking? A: Yes, I do, because it helps me relax after work. For example, I often make fried rice for my family on Sundays.', id: 'T: Kamu suka memasak? J: Ya, karena membantu saya santai setelah bekerja. Misalnya, saya sering membuat nasi goreng untuk keluarga setiap Minggu.' },
      ],
    },
    {
      heading: 'Part 2: cue card',
      body: 'Kamu punya satu menit untuk menyiapkan dan bicara sampai dua menit. Ikuti urutan poin di kartu dan pakai kata penanda.',
      table: [
        ['Poin di kartu', 'Pembuka kalimat'],
        ['what it is', "I'd like to talk about ..."],
        ['when/where', 'It happened when ... / It was in ...'],
        ['what happened', 'First, ... Then, ...'],
        ['why it was important', 'It was important to me because ...'],
      ],
    },
    {
      heading: 'Mengulur waktu dengan wajar',
      body: 'Diam lama mengurangi nilai kelancaran. Pakai ungkapan pendek ini, tetapi jangan berlebihan.',
      examples: [
        { en: "That's an interesting question.", id: 'Itu pertanyaan yang menarik.' },
        { en: "Let me think for a second.", id: 'Biar saya pikirkan sebentar.' },
        { en: "I haven't really thought about it before, but I guess ...", id: 'Saya belum pernah benar-benar memikirkannya, tapi menurut saya ...' },
      ],
    },
  ],
  demo: [
    ['Yes, I do, because it helps me relax. For example, I cook every Sunday.', 'Yes.', 'Jawaban satu kata tidak menunjukkan kemampuan.'],
    ["Let me think for a second. I'd say my favourite place is the beach.", '... (diam sepuluh detik)', 'Diam lama mengurangi nilai kelancaran.'],
    ["I'd like to talk about a trip to Lombok.", 'I will tell about trip Lombok.', 'Pembuka cue card yang rapi dan tata bahasanya lengkap.'],
  ],
  guided: [
    mc(1, 'Q: "Do you like reading?" Mana jawaban Part 1 terbaik?', null, [
      ['Yes, I do, because it helps me learn new things. For example, I read a novel every month.', true],
      ['Yes.', 'Terlalu pendek.'],
      ['Reading is an activity when people look at words in books, magazines, newspapers and websites to get information or for fun.', 'Mendefinisikan, bukan menjawab tentang dirimu; terdengar seperti hafalan.'],
    ], 'Jawab, beri alasan, beri contoh.'),
    match(1, 'Pasangkan bagian jawaban dengan contohnya.', [
      ['Jawab', 'Yes, I do.'],
      ['Alasan', 'because it keeps me fit.'],
      ['Contoh', 'For example, I swim twice a week.'],
    ], 'Pola Part 1.'),
    fill(1, "I'd like to talk ___ a teacher who inspired me.", ['about'], "Pembuka cue card: I'd like to talk about ...", { of: ['talk about, bukan talk of.'] }),
    tf(1, 'Dalam IELTS Speaking, sebaiknya diam saja sampai benar-benar menemukan jawaban yang sempurna.', false, 'Diam lama mengurangi nilai kelancaran; pakai ungkapan mengulur waktu yang wajar.', 'Pernyataan ini salah.'),
  ],
  independent: [
    tr(2, 'Biar saya pikirkan sebentar.', ['Let me think for a second.', 'Let me think for a moment.', 'Let me think about it for a second.', 'Let me think for a minute.'], 'Let me think + for a second/moment.'),
    construct(2, 'it / important / to me / because / it / change / my career (lampau)', ['It was important to me because it changed my career.'], 'Bagian terakhir cue card: why it was important.'),
    fix(2, 'I will tell about my trip to Bali.', ["I'd like to talk about my trip to Bali.", 'I would like to talk about my trip to Bali.', "I'm going to talk about my trip to Bali.", 'I will talk about my trip to Bali.', "I'll tell you about my trip to Bali."], 'tell + orang + about, atau talk about.', { 'I will tell about my trip to Bali.': ['Kalimatnya belum diubah.'] }),
    spot(2, 'It was important to me because it teached me patience.', 'teached', 'taught', 'Bentuk lampau "teach" adalah "taught".'),
  ],
  homework: [
    arrange(2, 'Itu terjadi ketika saya berumur lima belas tahun.', 'It happened when I was fifteen', ['happen', 'were'], 'It happened when I was + umur.'),
    read(2, 'Describe a place you like to visit. You should say: where it is, how often you go there, what you do there, and explain why you like it.', 'Poin mana yang sebaiknya dibahas terakhir?', [
      ['Mengapa kamu menyukai tempat itu.', true],
      ['Di mana tempat itu.', 'Itu poin pertama.'],
      ['Seberapa sering kamu ke sana.', 'Itu poin kedua.'],
    ], 'Ikuti urutan poin di kartu; "explain why" biasanya terakhir.'),
    mc(2, 'Ungkapan mengulur waktu mana yang paling wajar?', null, [
      ["That's an interesting question. I'd say ...", true],
      ['Ehm... ehm... ehm...', 'Terlalu banyak bunyi ragu mengurangi kelancaran.'],
      ['I don\'t know.', 'Mengakhiri jawaban terlalu cepat.'],
    ], 'Ungkapan pendek lalu langsung menjawab.'),
  ],
  mastery: [
    tr(3, 'Ya, saya suka, karena membuat saya tetap sehat. Misalnya, saya bersepeda setiap pagi.', ['Yes, I do, because it keeps me healthy. For example, I cycle every morning.', 'Yes, I do, because it keeps me fit. For example, I cycle every morning.', 'Yes, I do, because it keeps me healthy. For example, I ride my bike every morning.', 'Yes, I do because it keeps me healthy. For example, I go cycling every morning.'], 'Pola Part 1: jawab, alasan (because), contoh (For example).'),
    fix(3, 'Yes. Because healthy.', ['Yes, I do, because it keeps me healthy.', 'Yes, because it keeps me healthy.', 'Yes, I do, because it is healthy.'], 'Kalimat lengkap: subjek + kata kerja setelah because.', { 'Yes. Because healthy.': ['Kalimatnya belum diubah.'] }),
    construct(3, "I / haven't / really / think about it / before / but / I guess / it / be / useful", ["I haven't really thought about it before, but I guess it is useful.", "I haven't really thought about it before, but I guess it's useful."], "haven't thought (present perfect) + but I guess ..."),
  ],
});
