// A2 · Bab 1 · Unit 1 — Bercerita tentang Masa Lalu (simple past)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, para, read, spot, tf, tr } from './dsl';

export const pastBe = lesson({
  id: 'a2-past-be',
  title: 'Simple Past: Was dan Were',
  summary: 'Bentuk lampau dari am/is/are untuk menceritakan keadaan di masa lalu.',
  topic: 'a2.past-be',
  objectives: [
    'Memakai was untuk I, he, she, it dan were untuk you, we, they.',
    'Membuat kalimat negatif (wasn\'t, weren\'t) dan pertanyaan (Was ...? Were ...?).',
    'Mengenali penanda waktu lampau: yesterday, last night, two days ago.',
  ],
  intro: 'Bahasa Indonesia cukup menambahkan "kemarin" untuk bercerita tentang masa lalu. Bahasa Inggris mengubah kata kerjanya. Kita mulai dari yang paling dasar: am/is berubah menjadi "was", dan are berubah menjadi "were".',
  teaching: [
    {
      heading: 'Was atau were?',
      body: 'Aturannya mengikuti pasangan to be yang sudah kamu kuasai: yang dulu memakai am/is sekarang memakai was; yang dulu memakai are sekarang memakai were. Perhatikan "I": bentuk lampaunya "was", bukan "were".',
      table: [
        ['Sekarang', 'Lampau', 'Contoh'],
        ['I am', 'I was', 'I was tired yesterday.'],
        ['he / she / it is', 'he / she / it was', 'She was at home last night.'],
        ['you / we / they are', 'you / we / they were', 'They were late this morning.'],
      ],
    },
    {
      heading: 'Negatif dan pertanyaan',
      body: 'Sama seperti to be biasa: tambahkan "not" untuk menyangkal, pindahkan was/were ke depan untuk bertanya. Tidak perlu "did".',
      examples: [
        { en: "He wasn't at school yesterday.", id: 'Dia tidak di sekolah kemarin.' },
        { en: 'Were you busy last week?', id: 'Apakah kamu sibuk minggu lalu?' },
        { en: "Yes, I was. / No, I wasn't.", id: 'Ya. / Tidak.', note: 'Ditanya "you", dijawab "I", jadi berubah dari were ke was.' },
      ],
    },
    {
      heading: 'Penanda waktu lampau',
      body: 'Kata-kata ini memberi tanda bahwa kalimat harus memakai bentuk lampau: yesterday (kemarin), last night / last week (tadi malam / minggu lalu), two days ago (dua hari lalu), in 2020.',
    },
  ],
  demo: [
    ['I was sick yesterday.', 'I were sick yesterday.', '"I" berpasangan dengan "was". "Were" hanya untuk you, we, they.'],
    ['We were at the beach last Sunday.', 'We was at the beach last Sunday.', '"We" jamak, jadi "were".'],
    ['Were they at the party?', 'Did they were at the party?', 'Pertanyaan dengan was/were tidak memakai "did".'],
  ],
  vocab: ['yesterday', 'last-night', 'ago', 'sick', 'late'],
  guided: [
    mc(1, 'Pilih bentuk lampau yang tepat.', 'She ___ at home yesterday.', [
      ['was', true],
      ['were', '"were" untuk you, we, they. "She" memakai "was".', 'was-were'],
      ['is', '"is" bentuk sekarang. Ada kata "yesterday", jadi harus bentuk lampau.', 'past-marker'],
    ], '"She" (dulu "is") menjadi "was" di masa lampau.', { focus: 'was-were', hint: 'Dulu "she is". Bentuk lampau dari "is" adalah ...' }),
    match(1, 'Pasangkan subjek dengan bentuk lampau to be.', [
      ['I', 'was'],
      ['They', 'were'],
      ['It', 'was'],
      ['We', 'were'],
    ], 'I/he/she/it → was; you/we/they → were.', { focus: 'was-were' }),
    fill(1, 'We ___ very happy last night.', ['were'], '"We" (dulu "are") menjadi "were".', {
      was: ['"was" untuk I, he, she, it. "We" memakai "were".', 'was-were'],
      are: ['Ada "last night", jadi harus bentuk lampau: were.', 'past-marker'],
    }, { focus: 'was-were', hint: 'Dulu "we are". Bentuk lampau dari "are" adalah ...' }),
    tf(1, 'Kalimat "I were late this morning." sudah benar.', false, '"I" selalu berpasangan dengan "was": "I was late this morning."', 'Walaupun "I" memakai "am" (bukan "is"), bentuk lampaunya tetap "was".', { focus: 'was-were', tag: 'was-were', hint: 'Bentuk lampau dari "I am" adalah "I ...".' }),
  ],
  independent: [
    fill(2, 'My parents ___ in Surabaya two days ago.', ['were'], '"My parents" = they, jadi "were".', {
      was: ['"My parents" jamak (= they), jadi "were".', 'was-were'],
      are: ['"two days ago" menandakan masa lampau, jadi "were".', 'past-marker'],
    }, { focus: 'was-were' }),
    tr(2, 'Saya sakit kemarin.', ['I was sick yesterday', 'I was ill yesterday', 'Yesterday I was sick', 'Yesterday I was ill'], 'I + was + sick + yesterday.', {
      'i were sick yesterday': ['"I" berpasangan dengan "was".', 'was-were'],
      'i am sick yesterday': ['Karena "kemarin", pakai bentuk lampau: was.', 'past-marker'],
      'i sick yesterday': ['Kalimat ini belum punya to be. Tambahkan "was".', 'be-missing'],
    }, { focus: 'was-were' }),
    arrange(2, 'Apakah kamu di kantor tadi malam?', 'Were you at the office last night', ['was', 'did'], 'Were + you + keterangan. Tidak perlu "did".', { focus: 'was-were' }),
    spot(2, 'The children was very noisy in the library.', 'was', 'were', '"The children" jamak, jadi "were".', { focus: 'was-were' }),
  ],
  homework: [
    construct(2, 'not / the weather / was / good', ['The weather was not good', "The weather wasn't good"], 'Subjek + was + not + keterangan.', undefined, { focus: 'was-were' }),
    fix(2, 'You was right about the answer.', ['You were right about the answer'], '"You" selalu berpasangan dengan "were".', undefined, { focus: 'was-were' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Were you at school yesterday?\nB: ___', [
      ['No, I wasn\'t. I was sick.', true],
      ['No, I weren\'t. I was sick.', 'Jawaban memakai "I", dan "I" berpasangan dengan "wasn\'t".', 'was-were'],
      ['No, I didn\'t. I was sick.', 'Pertanyaannya memakai "Were", jadi jawabannya juga memakai was/were.'],
      ['No, you weren\'t.', 'Yang ditanya adalah kamu, jadi jawab dengan "I".'],
    ], 'Pertanyaan "Were you ...?" dijawab "Yes, I was." atau "No, I wasn\'t."', { focus: 'was-were' }),
  ],
  mastery: [
    fill(2, 'It ___ cold last night.', ['was'], '"It" memakai "was".', { were: ['"It" tunggal, jadi "was".', 'was-were'], is: ['"last night" menandakan lampau.', 'past-marker'] }, { focus: 'was-were' }),
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['Dani and I were classmates in 2020.', true],
      ['Dani and I was classmates in 2020.', '"Dani and I" = we, jadi "were".', 'was-were'],
      ['Dani and I are classmates in 2020.', '"in 2020" sudah lewat, jadi bentuk lampau.', 'past-marker'],
      ['Dani and I did classmates in 2020.', 'Kalimat tentang keadaan memakai was/were, bukan "did".'],
    ], '"Dani and I" dua orang (= we), jadi "were".', { focus: 'was-were' }),
    fill(3, '___ your sister at the party last Saturday?', ['Was'], '"Your sister" = she, jadi "Was".', { were: ['"Your sister" satu orang, jadi "Was".', 'was-were'], did: ['Pertanyaan tentang keberadaan memakai was/were.'], is: ['"last Saturday" menandakan lampau.', 'past-marker'] }, { focus: 'was-were' }),
    tr(3, 'Mereka tidak di rumah tadi malam.', ["They weren't at home last night", 'They were not at home last night', "They weren't home last night", 'They were not home last night'], 'They + were + not + at home + last night.', {
      "they wasn't at home last night": ['"They" memakai "weren\'t".', 'was-were'],
      "they didn't at home last night": ['Tanpa kata kerja lain, negatifnya memakai "weren\'t".'],
    }, { focus: 'was-were' }),
    fix(3, 'The book were on the table an hour ago.', ['The book was on the table an hour ago'], '"The book" satu benda (= it), jadi "was".', undefined, { focus: 'was-were' }),
  ],
});

/** Extra bank for the was/were remediation drill, difficulty 1 to 4. */
export const wasWereDrills = [
  mc(1, 'Pilih bentuk yang tepat.', 'I ___ at the market this morning.', [
    ['was', true],
    ['were', '"I" selalu berpasangan dengan "was".', 'was-were'],
  ], '"I" + was.', { focus: 'was-were' }),
  mc(1, 'Pilih bentuk yang tepat.', 'You ___ very kind to me yesterday.', [
    ['were', true],
    ['was', '"You" selalu berpasangan dengan "were", untuk satu orang sekalipun.', 'was-were'],
  ], '"You" + were.', { focus: 'was-were' }),
  fill(2, 'The shoes ___ too small for me.', ['were'], '"The shoes" jamak, jadi "were".', { was: ['"shoes" berakhiran -s (jamak), jadi "were".', 'was-were'] }, { focus: 'was-were' }),
  fill(2, 'My grandmother ___ a teacher many years ago.', ['was'], '"My grandmother" = she, jadi "was".', { were: ['Satu orang (= she), jadi "was".', 'was-were'] }, { focus: 'was-were' }),
  spot(3, 'Rudi and his brother was at the stadium last night.', 'was', 'were', 'Dua orang (= they), jadi "were".', { focus: 'was-were' }),
  fix(3, 'There was many people at the concert.', ['There were many people at the concert'], '"many people" jamak, jadi "There were".', undefined, { focus: 'was-were' }),
  tr(3, 'Apakah mereka senang kemarin?', ['Were they happy yesterday'], 'Were + they + happy + yesterday?', { 'was they happy yesterday': ['"They" memakai "were".', 'was-were'], 'did they happy yesterday': ['"happy" kata sifat, jadi pertanyaannya memakai "Were".'] }, { focus: 'was-were' }),
  fill(4, 'Neither of the answers ___ correct, so the teacher explained again.', ['was'], '"Neither of ..." dianggap tunggal dalam bahasa baku, jadi "was".', { were: ['Dalam bahasa baku, "neither of + jamak" mengambil kata kerja tunggal: was.', 'was-were'] }, { focus: 'was-were' }),
  fix(4, 'The news about the floods were on TV last night.', ['The news about the floods was on TV last night'], '"news" berakhiran -s tetapi tunggal dan tidak bisa dihitung, jadi "was".', undefined, { focus: 'was-were' }),
];

export const pastRegular = lesson({
  id: 'a2-past-regular',
  title: 'Simple Past: Kata Kerja Beraturan (-ed)',
  summary: 'Menceritakan kegiatan yang sudah selesai dengan akhiran -ed.',
  topic: 'a2.past-regular',
  objectives: [
    'Membentuk kata kerja lampau beraturan dengan -ed.',
    'Menerapkan aturan ejaan: -d, -ied, dan konsonan ganda.',
    'Menceritakan kegiatan kemarin dalam beberapa kalimat.',
  ],
  intro: 'Sekarang kita bercerita tentang kegiatan, bukan hanya keadaan. Kabar baiknya: bentuk lampau sama untuk semua subjek. "I worked", "she worked", "they worked". Tidak ada lagi urusan akhiran -s.',
  teaching: [
    {
      heading: 'Kata kerja + ed',
      body: 'Untuk kegiatan yang sudah selesai di masa lalu, tambahkan -ed pada kata kerja beraturan. Bentuknya sama untuk semua subjek.',
      examples: [
        { en: 'I watched a film last night.', id: 'Saya menonton film tadi malam.' },
        { en: 'She cooked dinner yesterday.', id: 'Dia memasak makan malam kemarin.' },
      ],
    },
    {
      heading: 'Aturan ejaan',
      body: 'Ada empat pola ejaan yang perlu diperhatikan.',
      table: [
        ['Pola', 'Aturan', 'Contoh'],
        ['Umumnya', '+ ed', 'work → worked, play → played'],
        ['Berakhiran e', '+ d', 'live → lived, dance → danced'],
        ['Konsonan + y', 'y → ied', 'study → studied, cry → cried'],
        ['Satu suku kata: konsonan-vokal-konsonan', 'gandakan konsonan + ed', 'stop → stopped, plan → planned'],
      ],
    },
  ],
  demo: [
    ['She studied English last night.', 'She studyed English last night.', 'Konsonan + y berubah menjadi -ied: studied.'],
    ['They stopped at the station.', 'They stoped at the station.', '"stop" berpola konsonan-vokal-konsonan, jadi p digandakan: stopped.'],
    ['He worked yesterday.', 'He works yesterday.', '"yesterday" menandakan masa lampau, jadi "worked", bukan "works".'],
  ],
  vocab: ['watch', 'cook', 'visit', 'yesterday'],
  guided: [
    mc(1, 'Pilih bentuk lampau yang benar.', 'We ___ football yesterday.', [
      ['played', true],
      ['play', 'Ada "yesterday", jadi kata kerja harus bentuk lampau.', 'past-marker'],
      ['plaied', 'y setelah huruf vokal (a) tidak berubah: played.', 'ed-spelling'],
      ['plays', '"plays" bentuk sekarang untuk he/she/it.', 'past-marker'],
    ], '"play" + ed = played. Huruf y setelah vokal tidak berubah.', { focus: 'ed-spelling', hint: 'Tambahkan -ed. Perhatikan huruf sebelum y.' }),
    match(1, 'Pasangkan kata kerja dengan bentuk lampaunya.', [
      ['live', 'lived'],
      ['study', 'studied'],
      ['stop', 'stopped'],
      ['watch', 'watched'],
    ], 'live+d, study→studied, stop→stopped (p ganda), watch+ed.', { focus: 'ed-spelling' }),
    fill(1, 'I ___ my grandmother last week. (visit)', ['visited'], '"visit" + ed = visited.', { visit: ['"last week" menandakan lampau. Tambahkan -ed.', 'past-marker'], visitted: ['"visit" bersuku kata dua dengan tekanan di depan, jadi t tidak digandakan.', 'ed-spelling'] }, { focus: 'ed-spelling', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.', hint: 'Cukup tambahkan -ed.' }),
    tf(1, 'Bentuk lampau "worked" berubah menjadi "workeds" untuk subjek "she".', false, 'Bentuk lampau sama untuk semua subjek: she worked.', 'Akhiran -s hanya ada di simple present.', { hint: 'Apakah bentuk lampau berubah menurut subjek?' }),
  ],
  independent: [
    fill(2, 'The baby ___ all night. (cry)', ['cried'], 'Konsonan + y menjadi -ied: cried.', { cryed: ['Konsonan + y berubah menjadi -ied: cried.', 'ed-spelling'], cry: ['"all night" (semalaman) di sini merujuk masa lalu. Pakai bentuk lampau.', 'past-marker'] }, { focus: 'ed-spelling', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    tr(2, 'Saya menonton TV tadi malam.', ['I watched TV last night', 'Last night I watched TV', 'I watched television last night'], 'I + watched + TV + last night.', { 'i watch tv last night': ['"last night" menandakan lampau: watched.', 'past-marker'], 'i was watch tv last night': ['Simple past tidak memakai "was" di depan kata kerja biasa.'] }, { focus: 'past-marker' }),
    spot(2, 'We planed our holiday two weeks ago.', 'planed', 'planned', '"plan" berpola konsonan-vokal-konsonan, jadi n digandakan: planned.', { focus: 'ed-spelling' }),
    arrange(2, 'Dia (perempuan) memasak makan malam kemarin.', 'She cooked dinner yesterday', ['cooks', 'was'], 'She + cooked + dinner + yesterday. "cooks" bentuk sekarang.', { focus: 'past-marker' }),
  ],
  homework: [
    fix(2, 'They dance at the party last Saturday.', ['They danced at the party last Saturday'], '"last Saturday" menandakan lampau: danced (dance + d).', undefined, { focus: 'past-marker' }),
    construct(2, 'ago / we / moved / three years / here', ['We moved here three years ago'], 'Subjek + kata kerja lampau + tempat + keterangan waktu.', undefined, { focus: 'past-marker' }),
    para(2, 'Susun kalimat-kalimat ini menjadi cerita yang runtut.', [
      'Last Sunday, Andi visited his grandparents in Bogor.',
      'In the morning, he helped his grandfather in the garden.',
      'After lunch, they watched an old film together.',
      'In the evening, Andi returned home, tired but happy.',
    ], 'Kalimat pembuka menyebut waktu dan tempat. Selanjutnya ikuti urutan waktu: morning, after lunch, evening.'),
  ],
  mastery: [
    fill(2, 'She ___ in Medan for five years. (live)', ['lived'], 'Kata berakhiran -e cukup ditambah -d: lived.', { liveed: ['Kata berakhiran -e hanya ditambah -d.', 'ed-spelling'], lives: ['Kalimat ini bercerita tentang masa lalu.', 'past-marker'] }, { focus: 'ed-spelling', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    mc(2, 'Pilih bentuk lampau yang benar dari "stop".', null, [
      ['stopped', true],
      ['stoped', 'Pola konsonan-vokal-konsonan: konsonan terakhir digandakan.', 'ed-spelling'],
      ['stopt', 'Bentuk lampau beraturan memakai -ed.', 'ed-spelling'],
    ], 'stop → stopped.', { focus: 'ed-spelling' }),
    fill(3, 'He ___ to carry the heavy box. (try)', ['tried'], 'Konsonan + y menjadi -ied: tried.', { tryed: ['Konsonan + y berubah menjadi -ied.', 'ed-spelling'] }, { focus: 'ed-spelling', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    tr(3, 'Kami bermain bola kemarin.', ['We played football yesterday', 'We played soccer yesterday', 'Yesterday we played football', 'We played ball yesterday'], 'We + played + football + yesterday.', { 'we play football yesterday': ['"yesterday" menandakan lampau: played.', 'past-marker'] }, { focus: 'past-marker' }),
    fix(3, 'My mother cookked rice this morning.', ['My mother cooked rice this morning'], '"cook" memiliki dua huruf vokal (oo), jadi k tidak digandakan: cooked.', undefined, { focus: 'ed-spelling' }),
  ],
});

export const pastIrregular = lesson({
  id: 'a2-past-irregular',
  title: 'Simple Past: Kata Kerja Tak Beraturan dan Did',
  summary: 'Bentuk lampau yang harus dihafal, serta negatif dan pertanyaan dengan did.',
  topic: 'a2.past-irregular',
  objectives: [
    'Menghafal bentuk lampau 12 kata kerja tak beraturan yang paling sering dipakai.',
    'Membuat kalimat negatif dengan didn\'t + kata kerja dasar.',
    'Membuat pertanyaan dengan Did + subjek + kata kerja dasar.',
  ],
  intro: 'Banyak kata kerja paling umum justru tidak memakai -ed: go menjadi went, eat menjadi ate. Bentuk ini harus dihafal. Lalu ada aturan emas yang mirip dengan "does": setelah did atau didn\'t, kata kerja kembali ke bentuk dasar.',
  teaching: [
    {
      heading: 'Dua belas kata kerja wajib hafal',
      body: 'Tidak ada rumus untuk kata kerja tak beraturan. Hafalkan berpasangan dan gunakan fitur ulangan terjadwal agar tidak lupa.',
      table: [
        ['Dasar', 'Lampau', 'Dasar', 'Lampau'],
        ['go', 'went', 'see', 'saw'],
        ['eat', 'ate', 'buy', 'bought'],
        ['have', 'had', 'take', 'took'],
        ['come', 'came', 'make', 'made'],
        ['get', 'got', 'give', 'gave'],
        ['do', 'did', 'write', 'wrote'],
      ],
    },
    {
      heading: 'Negatif dan pertanyaan dengan did',
      body: 'Did adalah bentuk lampau dari do/does dan dipakai untuk SEMUA subjek. Karena "did" sudah membawa tanda lampau, kata kerja utamanya kembali ke bentuk dasar. "I didn\'t went" memuat dua tanda lampau dan itu salah.',
      table: [
        ['Positif', 'Negatif', 'Pertanyaan'],
        ['She went to Bali.', "She didn't go to Bali.", 'Did she go to Bali?'],
        ['They bought a car.', "They didn't buy a car.", 'Did they buy a car?'],
      ],
    },
  ],
  demo: [
    ['I went to the market yesterday.', 'I goed to the market yesterday.', '"go" tidak beraturan: bentuk lampaunya "went".'],
    ["She didn't eat breakfast.", "She didn't ate breakfast.", 'Setelah "didn\'t", kata kerja kembali ke bentuk dasar: eat.'],
    ['Did you see the film?', 'Did you saw the film?', 'Setelah "Did", kata kerja bentuk dasar: see.'],
  ],
  vocab: ['go', 'eat', 'buy', 'see', 'take'],
  guided: [
    match(1, 'Pasangkan kata kerja dengan bentuk lampaunya.', [
      ['go', 'went'],
      ['eat', 'ate'],
      ['buy', 'bought'],
      ['see', 'saw'],
    ], 'Keempatnya tidak beraturan dan harus dihafal.', { focus: 'irregular-form' }),
    mc(1, 'Pilih bentuk lampau yang benar.', 'We ___ to the beach last Sunday.', [
      ['went', true],
      ['goed', '"go" tidak beraturan, jadi tidak memakai -ed.', 'irregular-form'],
      ['go', '"last Sunday" menandakan masa lampau.', 'past-marker'],
      ['gone', '"gone" adalah bentuk ketiga, dipakai bersama have/has.', 'irregular-form'],
    ], 'Bentuk lampau "go" adalah "went".', { focus: 'irregular-form', hint: 'Lihat tabel: go → ...' }),
    fill(1, "I didn't ___ the email. (see)", ['see'], 'Setelah "didn\'t", kata kerja bentuk dasar: see.', { saw: ['"didn\'t" sudah menandai lampau. Kata kerjanya kembali ke bentuk dasar.', 'did-base'], seen: ['Setelah "didn\'t" dipakai bentuk dasar, bukan bentuk ketiga.', 'did-base'] }, { focus: 'did-base', prompt: 'Tulis bentuk kata kerja yang tepat.', hint: 'Tanda lampau sudah ada pada "didn\'t".' }),
    tf(1, 'Kalimat "Did she bought a new bag?" sudah benar.', false, 'Setelah "Did", kata kerja bentuk dasar: "Did she buy a new bag?"', '"Did" sudah menandai lampau, jadi "bought" harus kembali menjadi "buy".', { focus: 'did-base', tag: 'did-base', hint: 'Berapa tanda lampau dalam kalimat itu?' }),
  ],
  independent: [
    fill(2, 'She ___ a letter to her friend yesterday. (write)', ['wrote'], 'Bentuk lampau "write" adalah "wrote".', { writed: ['"write" tidak beraturan: wrote.', 'irregular-form'], written: ['"written" bentuk ketiga, dipakai bersama have/has.', 'irregular-form'], writes: ['"yesterday" menandakan lampau.', 'past-marker'] }, { focus: 'irregular-form', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    tr(2, 'Saya tidak pergi ke sekolah kemarin.', ["I didn't go to school yesterday", 'I did not go to school yesterday', "Yesterday I didn't go to school"], "I + didn't + go (bentuk dasar) + to school + yesterday.", {
      "i didn't went to school yesterday": ['Setelah "didn\'t", kata kerja kembali ke bentuk dasar: go.', 'did-base'],
      "i don't go to school yesterday": ['"yesterday" menandakan lampau: didn\'t.', 'past-marker'],
      'i not go to school yesterday': ['Kalimat negatif lampau perlu "didn\'t".', 'did-base'],
    }, { focus: 'did-base' }),
    fix(2, 'Did they came to the meeting?', ['Did they come to the meeting'], 'Setelah "Did", kata kerja bentuk dasar: come.', undefined, { focus: 'did-base' }),
    arrange(2, 'Apakah kamu membeli buku itu?', 'Did you buy the book', ['bought', 'do'], 'Did + you + buy (bentuk dasar) + the book?', { focus: 'did-base' }),
  ],
  homework: [
    construct(2, 'took / he / to school / the bus', ['He took the bus to school'], 'Subjek + kata kerja lampau (took) + objek + tujuan.', undefined, { focus: 'irregular-form' }),
    fill(2, 'They ___ dinner at seven last night. (have)', ['had'], 'Bentuk lampau "have" adalah "had".', { haved: ['"have" tidak beraturan: had.', 'irregular-form'], have: ['"last night" menandakan lampau.', 'past-marker'] }, { focus: 'irregular-form', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    read(3, 'Last Saturday, Maya went to Yogyakarta with her family. They took a train from Jakarta. In the afternoon they saw Prambanan Temple, and in the evening they ate gudeg near Malioboro. Maya bought a batik shirt for her friend. She didn\'t buy anything for herself.', 'What did Maya buy?', [
      ['A batik shirt for her friend', true],
      ['A batik shirt for herself', 'Kalimat terakhir: "She didn\'t buy anything for herself."'],
      ['Gudeg for her family', 'Mereka makan gudeg ("ate"), tetapi teks tidak menyebut Maya membelinya untuk keluarga.'],
      ['A train ticket for her friend', 'Teks hanya menyebut mereka naik kereta.'],
    ], 'Teks menyebut "Maya bought a batik shirt for her friend."'),
  ],
  mastery: [
    fill(2, 'He ___ me a present on my birthday. (give)', ['gave'], 'Bentuk lampau "give" adalah "gave".', { gived: ['"give" tidak beraturan: gave.', 'irregular-form'], given: ['"given" bentuk ketiga.', 'irregular-form'] }, { focus: 'irregular-form', prompt: 'Tulis bentuk lampau kata kerja dalam kurung.' }),
    mc(2, 'Pilih kalimat negatif yang benar.', null, [
      ["We didn't take any photos.", true],
      ["We didn't took any photos.", 'Setelah "didn\'t", kata kerja bentuk dasar: take.', 'did-base'],
      ["We don't took any photos.", 'Negatif lampau memakai "didn\'t" + bentuk dasar.', 'did-base'],
      ["We weren't take any photos.", '"take" kata kerja biasa, jadi negatifnya "didn\'t".'],
    ], "didn't + kata kerja dasar.", { focus: 'did-base' }),
    fix(3, "She didn't made the cake herself.", ["She didn't make the cake herself", 'She did not make the cake herself'], 'Setelah "didn\'t": make.', undefined, { focus: 'did-base' }),
    tr(3, 'Apakah dia (laki-laki) makan nasi goreng tadi malam?', ['Did he eat fried rice last night', 'Did he eat nasi goreng last night'], 'Did + he + eat (bentuk dasar) + ...?', {
      'did he ate fried rice last night': ['Setelah "Did", kata kerja bentuk dasar: eat.', 'did-base'],
      'does he eat fried rice last night': ['"last night" menandakan lampau: Did.', 'past-marker'],
    }, { focus: 'did-base' }),
    spot(3, 'Yesterday we comed home very late.', 'comed', 'came', '"come" tidak beraturan: came.', { focus: 'irregular-form' }),
  ],
});
