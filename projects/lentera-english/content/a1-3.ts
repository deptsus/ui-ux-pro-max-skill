// A1 · Bab 2 · Unit 1 — Kegiatan Sehari-hari (simple present)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, para, spot, tf, tr } from './dsl';

export const simplePresent = lesson({
  id: 'a1-simple-present',
  title: 'Simple Present: Kebiasaan Sehari-hari',
  summary: 'Menceritakan rutinitas dan fakta, termasuk akhiran -s untuk he, she, it.',
  topic: 'a1.simple-present',
  objectives: [
    'Memakai simple present untuk kebiasaan dan fakta.',
    'Menambahkan -s / -es pada kata kerja untuk subjek he, she, it.',
    'Memakai kata keterangan frekuensi: always, usually, sometimes, never.',
  ],
  intro: 'Bagaimana menceritakan kegiatan yang kamu lakukan setiap hari? Bahasa Inggris memakai simple present. Aturannya sederhana, tetapi ada satu jebakan yang paling sering menjatuhkan pelajar Indonesia: akhiran -s untuk he, she, it.',
  teaching: [
    {
      heading: 'Bentuk dasar',
      body: 'Untuk I, you, we, they: pakai kata kerja bentuk dasar. Untuk he, she, it (atau satu orang/benda): tambahkan -s pada kata kerja. Bahasa Indonesia tidak mengubah kata kerja ("saya makan", "dia makan"), jadi akhiran -s ini harus dilatih sampai otomatis.',
      table: [
        ['Subjek', 'Kata kerja', 'Contoh'],
        ['I / you / we / they', 'bentuk dasar', 'I work in a bank.'],
        ['he / she / it', 'bentuk dasar + s', 'She works in a bank.'],
      ],
    },
    {
      heading: 'Ejaan akhiran -s',
      body: 'Sebagian besar kata kerja cukup ditambah -s. Ada tiga pengecualian ejaan.',
      table: [
        ['Aturan', 'Contoh'],
        ['Umumnya + s', 'work → works, play → plays, read → reads'],
        ['Akhiran s, sh, ch, x, o + es', 'watch → watches, go → goes, wash → washes'],
        ['Konsonan + y → ies', 'study → studies, cry → cries'],
        ['Tidak beraturan', 'have → has'],
      ],
    },
    {
      heading: 'Kata keterangan frekuensi',
      body: 'Always (selalu), usually (biasanya), sometimes (kadang-kadang), never (tidak pernah) diletakkan SEBELUM kata kerja utama.',
      examples: [
        { en: 'I always get up at five.', id: 'Saya selalu bangun pukul lima.' },
        { en: 'He never eats breakfast.', id: 'Dia tidak pernah sarapan.', note: 'Subjek "he", jadi "eats".' },
      ],
    },
  ],
  demo: [
    ['My sister works in a hospital.', 'My sister work in a hospital.', '"My sister" = she, jadi kata kerjanya mendapat -s: works.'],
    ['They play football on Sundays.', 'They plays football on Sundays.', '"They" jamak, jadi kata kerja TIDAK diberi -s.'],
    ['He has two brothers.', 'He haves two brothers.', '"have" berubah tidak beraturan menjadi "has" untuk he, she, it.'],
  ],
  vocab: ['work', 'study', 'breakfast', 'always', 'never', 'watch'],
  guided: [
    mc(1, 'Pilih bentuk kata kerja yang tepat.', 'She ___ coffee every morning.', [
      ['drinks', true],
      ['drink', 'Subjek "she" membutuhkan akhiran -s pada kata kerja.', 'third-person-s'],
      ['drinking', 'Bentuk -ing tidak bisa berdiri sendiri sebagai kata kerja kalimat.'],
      ['is drink', 'Simple present tidak memakai "is" di depan kata kerja biasa.'],
    ], 'Untuk he, she, it kata kerja mendapat -s: She drinks.', { focus: 'third-person-s', hint: 'Subjeknya "she". Apa yang terjadi pada kata kerja untuk he, she, it?' }),
    match(1, 'Pasangkan kata kerja dengan bentuknya untuk he / she / it.', [
      ['go', 'goes'],
      ['study', 'studies'],
      ['have', 'has'],
      ['play', 'plays'],
    ], 'go+es, study→studies (y menjadi ies), have→has (tidak beraturan), play+s (y setelah vokal tetap).', { focus: 'third-person-s' }),
    fill(1, 'We ___ in Jakarta. (live)', ['live'], 'Subjek "we" memakai bentuk dasar tanpa -s.', {
      lives: ['Akhiran -s hanya untuk he, she, it. Subjeknya "we".', 'third-person-s'],
    }, { focus: 'third-person-s', prompt: 'Tulis bentuk kata kerja yang tepat.', hint: '"We" termasuk kelompok I/you/we/they.' }),
    tf(1, 'Kalimat "My father watch TV every night." sudah benar.', false, '"My father" = he, jadi kata kerjanya "watches" (akhiran -ch + es).', 'Ganti "My father" dengan "he". Kata kerja untuk "he" harus diberi -s/-es.', { focus: 'third-person-s', tag: 'third-person-s', hint: 'Ganti subjeknya dengan kata ganti.' }),
  ],
  independent: [
    fill(2, 'Budi ___ English every evening. (study)', ['studies'], 'Budi = he. "study" berakhiran konsonan + y, jadi y diganti ies: studies.', {
      study: ['Budi = he, jadi kata kerja perlu akhiran: studies.', 'third-person-s'],
      studys: ['Konsonan + y berubah menjadi -ies: studies.', 'third-person-s'],
    }, { focus: 'third-person-s', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
    arrange(2, 'Saya selalu bangun pukul lima.', 'I always get up at five', ['gets', 'am'], 'Kata keterangan frekuensi (always) sebelum kata kerja (get up). Subjek "I" tidak memakai -s.', { focus: 'third-person-s' }),
    tr(2, 'Ibu saya bekerja di sebuah rumah sakit.', ['My mother works in a hospital', 'My mother works at a hospital', 'My mom works in a hospital', 'My mom works at a hospital'], '"My mother" = she, jadi "works".', {
      'my mother work in a hospital': ['"My mother" = she, jadi kata kerjanya "works".', 'third-person-s'],
      'my mother is work in a hospital': ['Simple present tidak memakai "is" sebelum kata kerja biasa.'],
    }, { focus: 'third-person-s' }),
    spot(2, 'Rina and Tono goes to school by bus.', 'goes', 'go', '"Rina and Tono" dua orang (= they), jadi kata kerja tanpa -es: go.', { focus: 'third-person-s' }),
  ],
  homework: [
    construct(2, 'never / he / breakfast / eats', ['He never eats breakfast'], 'Subjek + never + kata kerja (+s karena "he") + objek.', undefined, { focus: 'third-person-s' }),
    fix(2, 'She have a new phone.', ['She has a new phone'], '"have" menjadi "has" untuk he, she, it.', { 'she haves a new phone': ['"have" tidak beraturan: bentuknya "has", bukan "haves".', 'third-person-s'] }, { focus: 'third-person-s' }),
    para(2, 'Susun kalimat-kalimat ini menjadi paragraf tentang pagi hari Dewi.', [
      'Dewi gets up at five every morning.',
      'First, she takes a shower.',
      'Then, she eats breakfast with her family.',
      'After that, she goes to school by bus.',
    ], 'Kalimat pembuka memperkenalkan Dewi. Kata penghubung First, Then, After that menunjukkan urutan kegiatan.'),
  ],
  mastery: [
    fill(2, 'My brother ___ football every Sunday. (play)', ['plays'], '"My brother" = he, jadi "plays". Huruf y setelah vokal (a) tidak berubah.', {
      play: ['"My brother" = he, jadi perlu -s: plays.', 'third-person-s'],
      plaies: ['y setelah huruf vokal tidak berubah: plays.', 'third-person-s'],
    }, { focus: 'third-person-s', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['The shop opens at nine.', true],
      ['The shop open at nine.', '"The shop" = it, jadi kata kerjanya "opens".', 'third-person-s'],
      ['The shop is open at nine o\'clock every opens.', 'Susunan kalimat ini tidak bermakna.'],
      ['The shops opens at nine.', '"The shops" jamak, jadi kata kerjanya "open" tanpa -s.', 'third-person-s'],
    ], 'Satu toko (= it) membutuhkan "opens".', { focus: 'third-person-s' }),
    fill(3, 'My parents ___ in Bandung. (live)', ['live'], '"My parents" jamak (= they), jadi bentuk dasar tanpa -s.', { lives: ['"My parents" = they. Akhiran -s hanya untuk he, she, it.', 'third-person-s'] }, { focus: 'third-person-s', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
    tr(3, 'Dia (laki-laki) pergi ke kantor setiap hari.', ['He goes to the office every day', 'He goes to work every day', 'He goes to office every day'], '"He" + goes (go + es).', {
      'he go to the office every day': ['Subjek "he" membutuhkan "goes".', 'third-person-s'],
      'he gos to the office every day': ['Kata berakhiran -o mendapat -es: goes.', 'third-person-s'],
    }, { focus: 'third-person-s' }),
    fix(3, 'My teacher always give homework.', ['My teacher always gives homework'], '"My teacher" = he/she, jadi "gives".', undefined, { focus: 'third-person-s' }),
  ],
});

export const doDoes = lesson({
  id: 'a1-do-does',
  title: 'Simple Present: Do dan Does',
  summary: 'Membuat kalimat negatif dan pertanyaan dengan do/does.',
  topic: 'a1.do-does',
  objectives: [
    'Membuat kalimat negatif dengan don\'t dan doesn\'t.',
    'Membuat pertanyaan dengan Do ...? dan Does ...?',
    'Mengembalikan kata kerja ke bentuk dasar setelah does / doesn\'t.',
  ],
  intro: 'Untuk menyangkal atau bertanya tentang kebiasaan, bahasa Inggris memakai kata bantu "do" dan "does". Ada satu aturan emas di pelajaran ini: setelah does atau doesn\'t, kata kerja kembali ke bentuk dasar. Akhiran -s "pindah" ke kata does.',
  teaching: [
    {
      heading: 'Kalimat negatif',
      body: 'I/you/we/they memakai don\'t (do not). He/she/it memakai doesn\'t (does not). Setelah keduanya, kata kerja selalu bentuk dasar.',
      table: [
        ['Subjek', 'Negatif', 'Contoh'],
        ['I / you / we / they', "don't + kata kerja dasar", "I don't like coffee."],
        ['he / she / it', "doesn't + kata kerja dasar", "She doesn't like coffee."],
      ],
    },
    {
      heading: 'Pertanyaan',
      body: 'Letakkan Do atau Does di depan subjek. Kata kerjanya tetap bentuk dasar. Jawab singkat dengan do/does, bukan dengan mengulang kata kerja.',
      table: [
        ['Pertanyaan', 'Jawaban singkat'],
        ['Do you speak English?', "Yes, I do. / No, I don't."],
        ['Does he work here?', "Yes, he does. / No, he doesn't."],
      ],
    },
    {
      heading: 'Aturan emas: -s hanya muncul sekali',
      body: 'Dalam "She works", -s ada di kata kerja. Dalam "She doesn\'t work" dan "Does she work?", -s sudah ada di "does", jadi kata kerjanya kembali polos. "She doesn\'t works" memuat dua -s dan itu salah.',
    },
  ],
  demo: [
    ["He doesn't like tea.", "He doesn't likes tea.", 'Setelah "doesn\'t", kata kerja kembali ke bentuk dasar: like.'],
    ['Does she live here?', 'Do she live here?', 'Subjek "she" memakai "Does".'],
    ["They don't work on Sundays.", "They doesn't work on Sundays.", '"They" memakai "don\'t".'],
  ],
  vocab: ['like', 'speak', 'live', 'sometimes'],
  guided: [
    mc(1, 'Pilih kata bantu yang tepat.', 'She ___ like spicy food.', [
      ["doesn't", true],
      ["don't", '"don\'t" untuk I/you/we/they. "She" memakai "doesn\'t".', 'do-does'],
      ["isn't", '"like" adalah kata kerja biasa, jadi negatifnya memakai do/does, bukan to be.'],
      ['not', '"not" tidak bisa berdiri sendiri. Perlu kata bantu: doesn\'t.'],
    ], '"She" memakai "doesn\'t" + kata kerja dasar.', { focus: 'do-does', hint: 'Untuk he, she, it kata bantunya berakhiran -es.' }),
    fill(1, '___ you speak English?', ['Do'], 'Subjek "you" memakai "Do".', {
      does: ['"Does" untuk he, she, it. Subjeknya "you".', 'do-does'],
      are: ['"speak" kata kerja biasa. Pertanyaannya memakai "Do", bukan to be.'],
    }, { focus: 'do-does', hint: 'Subjeknya "you". Pilih antara Do dan Does.' }),
    tf(1, 'Kalimat "He doesn\'t works here." sudah benar.', false, 'Setelah "doesn\'t", kata kerja kembali ke bentuk dasar: "He doesn\'t work here."', 'Akhiran -s sudah ada pada "does". Kata kerja utamanya tidak boleh diberi -s lagi.', { focus: 'does-base', tag: 'does-base', hint: 'Hitung berapa kali -s muncul.' }),
    arrange(1, 'Apakah dia (laki-laki) tinggal di Bali?', 'Does he live in Bali', ['lives', 'do'], 'Does + he + live (bentuk dasar) + in Bali.', { focus: 'does-base', hint: 'Mulai dengan kata bantu untuk "he".' }),
  ],
  independent: [
    fill(2, 'My parents ___ eat meat.', ["don't", 'do not'], '"My parents" = they, jadi "don\'t".', {
      "doesn't": ['"My parents" jamak (= they), jadi "don\'t".', 'do-does'],
      "aren't": ['"eat" kata kerja biasa, jadi negatifnya memakai "don\'t".'],
    }, { focus: 'do-does', prompt: 'Lengkapi dengan bentuk negatif yang tepat.' }),
    tr(2, 'Dia (perempuan) tidak suka kopi.', ["She doesn't like coffee", 'She does not like coffee'], 'She + doesn\'t + like (bentuk dasar).', {
      "she doesn't likes coffee": ['Setelah "doesn\'t", kata kerja kembali ke bentuk dasar: like.', 'does-base'],
      "she don't like coffee": ['"She" memakai "doesn\'t".', 'do-does'],
      'she not like coffee': ['Kalimat negatif perlu kata bantu: doesn\'t.', 'do-does'],
    }, { focus: 'does-base' }),
    fix(2, 'Does your sister works in a bank?', ['Does your sister work in a bank'], 'Dalam pertanyaan dengan "Does", kata kerja memakai bentuk dasar: work.', undefined, { focus: 'does-base' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Do you play badminton?\nB: ___', [
      ['Yes, I do.', true],
      ['Yes, I play.', 'Jawaban singkat memakai kata bantu: "Yes, I do."'],
      ['Yes, I am.', 'Pertanyaannya memakai "Do", jadi jawabannya "do", bukan "am".'],
      ['Yes, I does.', '"I" berpasangan dengan "do".', 'do-does'],
    ], 'Jawaban singkat mengulang kata bantu dari pertanyaan: Yes, I do.', { focus: 'do-does' }),
  ],
  homework: [
    construct(2, 'not / we / watch / do / TV', ["We do not watch TV", "We don't watch TV"], 'We + do not + watch + TV.', undefined, { focus: 'do-does' }),
    spot(2, 'Does they live near the school?', 'Does', 'Do', '"They" memakai "Do".', { focus: 'do-does' }),
    tr(2, 'Apakah kamu suka musik?', ['Do you like music'], 'Do + you + like + music?', { 'are you like music': ['"like" kata kerja biasa. Pertanyaannya memakai "Do".'], 'does you like music': ['"You" memakai "Do".', 'do-does'] }, { focus: 'do-does' }),
  ],
  mastery: [
    fill(2, 'Tina ___ drink milk.', ["doesn't", 'does not'], 'Tina = she, jadi "doesn\'t".', { "don't": ['Tina = she, jadi "doesn\'t".', 'do-does'] }, { focus: 'do-does', prompt: 'Lengkapi dengan bentuk negatif yang tepat.' }),
    mc(2, 'Pilih pertanyaan yang benar.', null, [
      ['Does your father drive a car?', true],
      ['Do your father drive a car?', '"Your father" = he, jadi "Does".', 'do-does'],
      ['Does your father drives a car?', 'Setelah "Does", kata kerja bentuk dasar: drive.', 'does-base'],
      ['Is your father drive a car?', '"drive" kata kerja biasa, jadi memakai "Does".'],
    ], 'Does + subjek tunggal + kata kerja dasar.', { focus: 'does-base' }),
    fix(3, "My brother don't eats vegetables.", ["My brother doesn't eat vegetables", 'My brother does not eat vegetables'], '"My brother" = he: doesn\'t + eat (bentuk dasar).', {
      "my brother doesn't eats vegetables": ['Kata bantunya sudah benar, tetapi kata kerja harus bentuk dasar: eat.', 'does-base'],
      "my brother don't eat vegetables": ['Kata kerjanya sudah benar, tetapi "my brother" memakai "doesn\'t".', 'do-does'],
    }, { focus: 'does-base' }),
    tr(3, 'Apakah dia (perempuan) berbicara bahasa Inggris?', ['Does she speak English'], 'Does + she + speak (bentuk dasar) + English?', {
      'does she speaks english': ['Setelah "Does", kata kerja bentuk dasar: speak.', 'does-base'],
      'do she speak english': ['"She" memakai "Does".', 'do-does'],
      'is she speak english': ['"speak" kata kerja biasa, jadi memakai "Does".'],
    }, { focus: 'does-base' }),
    fill(3, 'A: Does it rain a lot here?  B: No, it ___.', ["doesn't", 'does not'], 'Jawaban singkat negatif untuk "it": No, it doesn\'t.', { "isn't": ['Pertanyaannya memakai "Does", jadi jawabannya "doesn\'t".'], "don't": ['"It" memakai "doesn\'t".', 'do-does'] }, { focus: 'do-does' }),
  ],
});

export const thirdPersonDrills = [
  mc(1, 'Pilih bentuk yang tepat.', 'He ___ to work by motorcycle.', [
    ['goes', true],
    ['go', 'Subjek "he" membutuhkan -es: goes.', 'third-person-s'],
    ['going', 'Bentuk -ing tidak bisa menjadi kata kerja utama sendirian.'],
  ], '"He" + goes.', { focus: 'third-person-s' }),
  fill(2, 'The baby ___ every night. (cry)', ['cries'], 'Konsonan + y menjadi -ies: cries.', { cry: ['"The baby" = it/he/she, jadi perlu akhiran.', 'third-person-s'], crys: ['Konsonan + y berubah menjadi -ies.', 'third-person-s'] }, { focus: 'third-person-s', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
  spot(2, 'My friends likes Indonesian food.', 'likes', 'like', '"My friends" jamak, jadi "like" tanpa -s.', { focus: 'third-person-s' }),
  fix(3, 'Every student in my class speak English.', ['Every student in my class speaks English'], '"Every student" dianggap tunggal, jadi "speaks".', undefined, { focus: 'third-person-s' }),
  tr(3, 'Kucing itu tidur di kursi.', ['The cat sleeps on the chair', 'That cat sleeps on the chair'], '"The cat" = it, jadi "sleeps".', { 'the cat sleep on the chair': ['"The cat" = it, jadi "sleeps".', 'third-person-s'] }, { focus: 'third-person-s' }),
];
