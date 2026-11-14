// A1 · Bab 2 · Unit 2 — Waktu dan Jadwal
// A1 · Bab 3 · Unit 1 — Rumah dan Kepemilikan (Premium)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const timeLesson = lesson({
  id: 'a1-time',
  title: 'Angka, Jam, dan Hari',
  summary: 'Membedakan thirteen dan thirty, menyebut jam, dan nama hari.',
  topic: 'a1.time',
  objectives: [
    'Membedakan angka belasan (thirteen) dan puluhan (thirty).',
    "Menyebut jam dengan o'clock, past, to, dan cara digital (seven thirty).",
    'Bertanya dan menjawab "What time is it?" dan "What day is it today?"',
  ],
  intro: 'Angka dan jam muncul setiap hari: jadwal kelas, janji bertemu, harga di pasar. Ada satu jebakan khusus untuk penutur bahasa Indonesia: "setengah delapan" adalah pukul 07.30, dan dalam bahasa Inggris jam itu disebut "half past seven", setengah jam SETELAH pukul tujuh.',
  teaching: [
    {
      heading: 'Belasan atau puluhan?',
      body: 'Angka 13–19 berakhiran -teen dan tekanannya di belakang: thir-TEEN. Puluhan berakhiran -ty dan tekanannya di depan: THIR-ty. Bunyinya mirip, jadi dengarkan tekanannya. Perhatikan juga ejaan "forty" (40) yang tidak memakai huruf u, walaupun "four" memakainya.',
      table: [
        ['Belasan', 'Puluhan'],
        ['13 thirteen', '30 thirty'],
        ['14 fourteen', '40 forty'],
        ['15 fifteen', '50 fifty'],
        ['16 sixteen', '60 sixty'],
        ['18 eighteen', '80 eighty'],
      ],
    },
    {
      heading: 'Menyebut jam',
      body: 'Cara paling mudah adalah cara digital: sebut jamnya, lalu menitnya. Cara tradisional memakai "past" (lewat) dan "to" (kurang). "o\'clock" hanya dipakai untuk jam tepat.',
      table: [
        ['Jam', 'Cara tradisional', 'Cara digital'],
        ['07.00', "seven o'clock", "seven o'clock"],
        ['07.15', 'a quarter past seven', 'seven fifteen'],
        ['07.30', 'half past seven', 'seven thirty'],
        ['07.45', 'a quarter to eight', 'seven forty-five'],
        ['07.50', 'ten to eight', 'seven fifty'],
      ],
    },
    {
      heading: 'Jebakan "setengah"',
      body: 'Bahasa Indonesia menghitung setengah MENUJU jam berikutnya: "setengah delapan" = 07.30. Bahasa Inggris menghitung DARI jam sebelumnya: "half past seven" = 07.30. Jadi kurangi satu: setengah delapan → half past seven.',
      examples: [
        { en: "It's half past seven.", id: 'Sekarang jam setengah delapan (07.30).' },
        { en: 'The class starts at half past eight.', id: 'Kelasnya mulai jam setengah sembilan (08.30).' },
      ],
    },
    {
      heading: 'Hari dan pertanyaan',
      body: 'Nama hari selalu diawali huruf kapital: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Untuk bertanya jam, pakai "What time is it?" dan jawab "It\'s ...". Untuk bertanya hari, pakai "What day is it today?"',
      examples: [
        { en: "What time is it? — It's nine o'clock.", id: 'Jam berapa sekarang? — Jam sembilan.' },
        { en: "What day is it today? — It's Wednesday.", id: 'Hari ini hari apa? — Hari Rabu.' },
      ],
    },
  ],
  demo: [
    ["It's half past seven. (07.30)", "It's half past eight. (07.30)", 'Untuk 07.30 ("setengah delapan"), bahasa Inggris menghitung dari jam tujuh: half past seven.'],
    ["It's a quarter to nine.", "It's a quarter for nine.", '"Kurang" pada jam memakai "to": a quarter to nine (08.45).'],
    ['The film starts at half past nine.', "The film starts at half past nine o'clock.", '"o\'clock" hanya untuk jam tepat. Untuk 09.30 cukup "half past nine".'],
  ],
  vocab: ['half', 'quarter', 'hour', 'monday'],
  guided: [
    match(1, 'Pasangkan angka dengan tulisannya.', [
      ['13', 'thirteen'],
      ['30', 'thirty'],
      ['14', 'fourteen'],
      ['40', 'forty'],
    ], 'Belasan berakhiran -teen, puluhan berakhiran -ty. Perhatikan ejaan "forty" tanpa huruf u.', { focus: 'teen-ty' }),
    mc(1, 'Jam berapa ini? Pilih cara menyebut yang benar.', '07.30', [
      ["It's half past seven.", true],
      ["It's half past eight.", 'Bahasa Inggris menghitung dari jam sebelumnya. 07.30 adalah setengah jam setelah pukul tujuh: half past seven.', 'half-past'],
      ["It's seven o'clock.", '"o\'clock" hanya untuk jam tepat, misalnya 07.00.', 'clock-past-to'],
      ["It's thirty to seven.", '"to" berarti kurang. "thirty to seven" adalah 06.30.', 'clock-past-to'],
    ], '07.30 = half past seven, atau secara digital "seven thirty".', { focus: 'half-past', hint: '"half past" dihitung dari jam yang sudah lewat, bukan dari jam berikutnya.' }),
    fill(1, "It's a quarter ___ nine. (08.45)", ['to'], '08.45 adalah 15 menit sebelum pukul sembilan, jadi "a quarter to nine".', {
      past: ['"past" berarti lewat. "a quarter past nine" adalah 09.15.', 'clock-past-to'],
      for: ['Untuk "kurang" pada jam dipakai "to".', 'clock-past-to'],
    }, { focus: 'clock-past-to', prompt: 'Lengkapi dengan kata yang tepat.', hint: 'Jam sembilan belum tiba. Pilih antara "past" dan "to".' }),
    tf(1, 'Nama hari dalam bahasa Inggris selalu diawali huruf kapital, misalnya "Friday".', true, 'Benar. Monday sampai Sunday selalu diawali huruf kapital, di mana pun letaknya dalam kalimat.', 'Nama hari termasuk nama diri, jadi selalu diawali huruf kapital.'),
  ],
  independent: [
    tr(2, 'Sekarang jam setengah sembilan.', ["It's half past eight", "It's eight thirty", "It's half past eight now", "It's eight thirty now"], 'Setengah sembilan = 08.30 = half past eight, atau "eight thirty".', {
      "it's half past nine": ['"Setengah sembilan" adalah 08.30, jadi dihitung dari jam delapan: half past eight.', 'half-past'],
      "it's half nine": ['Dalam bahasa Inggris Britania, "half nine" justru berarti 09.30. Untuk 08.30 pakai "half past eight".', 'half-past'],
      'now is half past eight': ['Kalimat tentang jam diawali "It\'s", bukan "Now is".'],
    }, { focus: 'half-past' }),
    fill(2, 'My grandmother is ___ years old. (70)', ['seventy'], '70 = seventy. Puluhan berakhiran -ty.', {
      seventeen: ['"seventeen" adalah 17. Untuk 70 pakai "seventy".', 'teen-ty'],
      sevendy: ['Ejaannya "seventy", dengan t.', 'teen-ty'],
    }, { focus: 'teen-ty', prompt: 'Tulis angka dalam kurung dengan huruf.', hint: 'Puluhan berakhiran -ty.' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: What day is it today?\nB: ___', [
      ["It's Thursday.", true],
      ["It's the Thursday.", 'Nama hari tidak didahului "the".'],
      ["Today is at Thursday.", 'Nama hari tidak didahului "at".'],
      ["It's ten o'clock.", 'Pertanyaannya tentang hari, bukan jam.'],
    ], '"What day is it today?" dijawab dengan nama hari: "It\'s Thursday."'),
    arrange(2, 'Jam berapa sekarang?', 'What time is it now', ['day', 'are'], 'Pertanyaan jam: What time is it (now)?', { focus: 'clock-past-to' }),
  ],
  homework: [
    read(2, "Dimas is a student in Bandung. On Monday his first class starts at a quarter past seven, and he finishes at half past twelve. On Friday he has only two classes, so he goes home at ten o'clock.", 'What time does Dimas go home on Friday?', [
      ["At ten o'clock", true],
      ['At half past twelve', 'Itu jam pulangnya pada hari Senin.'],
      ['At a quarter past seven', 'Itu jam kelas pertamanya pada hari Senin.'],
      ['At a quarter to ten', 'Teks menyebut "ten o\'clock", jam sepuluh tepat.'],
    ], 'Kalimat terakhir: "On Friday ... he goes home at ten o\'clock."'),
    fix(2, "The film starts at half past nine o'clock.", ['The film starts at half past nine'], '"o\'clock" hanya untuk jam tepat. Untuk 09.30 cukup "half past nine".', undefined, { focus: 'clock-past-to' }),
    tr(2, 'Hari ini hari Sabtu.', ["It's Saturday today", 'Today is Saturday', "It's Saturday", "Today it's Saturday"], 'Bisa "It\'s Saturday today" atau "Today is Saturday".', {
      "it's the saturday today": ['Nama hari tidak didahului "the".'],
      'today is at saturday': ['Nama hari tidak didahului "at".'],
    }),
  ],
  mastery: [
    mc(2, 'Pilih cara yang benar untuk menyebut pukul 18.15.', null, [
      ['a quarter past six', true],
      ['a quarter to six', '"to" berarti kurang: a quarter to six adalah 17.45.', 'clock-past-to'],
      ['a quarter past seven', '18.15 adalah jam enam lewat 15 menit, jadi dihitung dari jam enam.', 'clock-past-to'],
      ['fifteen past eighteen', 'Dalam percakapan, jam 18 disebut "six". Bila perlu tambahkan "in the evening".'],
    ], '18.15 = a quarter past six (in the evening).', { focus: 'clock-past-to' }),
    fill(3, 'The bus ticket costs ___ thousand rupiah. (15)', ['fifteen'], '15 = fifteen. Belasan berakhiran -teen.', {
      fifty: ['"fifty" adalah 50. Untuk 15 pakai "fifteen".', 'teen-ty'],
      fiveteen: ['Ejaannya "fifteen", bukan "fiveteen".', 'teen-ty'],
    }, { focus: 'teen-ty', prompt: 'Tulis angka dalam kurung dengan huruf.' }),
    tr(3, 'Kereta berangkat jam setengah tujuh.', ['The train leaves at half past six', 'The train departs at half past six', 'The train leaves at six thirty', 'The train departs at six thirty'], '"Setengah tujuh" = 06.30 = half past six.', {
      'the train leaves at half past seven': ['"Setengah tujuh" adalah 06.30, jadi dihitung dari jam enam: half past six.', 'half-past'],
      'the train leaves on half past six': ['Untuk jam dipakai "at".'],
    }, { focus: 'half-past' }),
    spot(3, "The meeting starts at ten o'clocks.", "o'clocks", "o'clock", '"o\'clock" tidak pernah diberi -s.', { focus: 'clock-past-to' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Excuse me, what time is it?\nB: ___', [
      ["It's ten to five.", true],
      ["It's ten for five.", '"Kurang" pada jam memakai "to": ten to five (04.50).', 'clock-past-to'],
      ["It's five o'clock less ten.", 'Bahasa Inggris tidak memakai "less" untuk jam. Pakai "ten to five".', 'clock-past-to'],
      ['Is ten to five.', 'Jawaban tentang jam diawali "It\'s".'],
    ], '"What time is it?" dijawab "It\'s ...". 04.50 = ten to five.', { focus: 'clock-past-to' }),
  ],
});

export const prepTimeLesson = lesson({
  id: 'a1-prep-time',
  title: 'Preposisi Waktu: in, on, at',
  summary: 'Memilih at, on, atau in sebelum keterangan waktu.',
  topic: 'a1.prep-time',
  objectives: [
    'Memakai "at" untuk jam dan titik waktu (at 7, at noon, at night).',
    'Memakai "on" untuk hari dan tanggal, serta "in" untuk bulan, tahun, dan bagian hari.',
    'Tidak memakai preposisi sebelum next, last, this, every, dan tomorrow.',
  ],
  intro: 'Bahasa Indonesia cukup memakai "pada": pada jam tujuh, pada hari Senin, pada bulan Mei. Bahasa Inggris memilih kata yang berbeda menurut "ukuran" waktunya. Bayangkan piramida: at untuk titik kecil (jam), on untuk satu hari, in untuk waktu yang lebih panjang.',
  teaching: [
    {
      heading: 'At, on, in',
      body: 'Hafalkan pola umumnya, lalu dua pengecualian yang sering muncul: "at night" (bukan "in the night") dan "on Monday morning" (ada nama hari, jadi on).',
      table: [
        ['Kata', 'Untuk', 'Contoh'],
        ['at', 'jam dan titik waktu', "at 7 o'clock, at noon, at night"],
        ['on', 'hari dan tanggal', 'on Monday, on 17 August, on my birthday, on Monday morning'],
        ['in', 'bulan, tahun, musim, bagian hari', 'in May, in 2025, in the rainy season, in the morning'],
      ],
    },
    {
      heading: 'Tanpa preposisi',
      body: 'Jangan memakai at, on, atau in sebelum next, last, this, every, tomorrow, yesterday, dan today. Kata-kata itu sudah cukup menunjukkan waktunya.',
      examples: [
        { en: 'We have a test next Monday.', id: 'Kami ada ujian Senin depan.', note: 'Bukan "on next Monday".' },
        { en: 'She visits her grandmother every Sunday.', id: 'Dia mengunjungi neneknya setiap hari Minggu.' },
        { en: 'I have a meeting this afternoon.', id: 'Saya ada rapat sore ini.' },
      ],
    },
  ],
  demo: [
    ["The class starts at eight o'clock.", "The class starts on eight o'clock.", 'Jam adalah titik waktu, jadi memakai "at".'],
    ['My birthday is in May.', 'My birthday is on May.', 'Bulan tanpa tanggal memakai "in". Dengan tanggal memakai "on": on 5 May.'],
    ['We have a test next Monday.', 'We have a test on next Monday.', 'Sebelum next, last, this, dan every tidak ada preposisi.'],
  ],
  vocab: ['weekend', 'birthday', 'month'],
  guided: [
    match(1, 'Pasangkan keterangan waktu dengan preposisinya.', [
      ["8 o'clock", 'at'],
      ['Sunday', 'on'],
      ['2025', 'in'],
      ['night', 'at'],
    ], "at + jam; on + hari; in + tahun. Ingat pengecualian: at night.", { focus: 'in-on-at' }),
    mc(1, 'Pilih preposisi yang tepat.', 'The rainy season usually starts ___ November.', [
      ['in', true],
      ['on', '"on" untuk hari atau tanggal. Bulan tanpa tanggal memakai "in".', 'in-on-at'],
      ['at', '"at" untuk jam atau titik waktu.', 'in-on-at'],
    ], 'Bulan memakai "in": in November.', { focus: 'in-on-at', hint: 'November adalah nama bulan, waktu yang cukup panjang.' }),
    fill(1, "I usually go to bed ___ ten o'clock.", ['at'], 'Jam memakai "at".', {
      on: ['"on" untuk hari dan tanggal.', 'in-on-at'],
      in: ['"in" untuk bulan, tahun, atau bagian hari.', 'in-on-at'],
    }, { focus: 'in-on-at', hint: 'Jam adalah titik waktu yang kecil.' }),
    tf(1, 'Kalimat "We have a party on next Saturday." sudah benar.', false, 'Sebelum "next" tidak ada preposisi: "We have a party next Saturday."', '"next", "last", "this", dan "every" tidak didahului at, on, atau in.', { focus: 'no-prep-time', tag: 'no-prep-time', hint: 'Perhatikan kata "next".' }),
  ],
  independent: [
    fill(2, 'Indonesia celebrates its independence ___ 17 August.', ['on'], 'Tanggal memakai "on".', {
      in: ['Ada tanggalnya (17), jadi "on". "in" hanya untuk bulan tanpa tanggal: in August.', 'in-on-at'],
      at: ['"at" untuk jam.', 'in-on-at'],
    }, { focus: 'in-on-at' }),
    tr(2, 'Saya belajar bahasa Inggris pada malam hari.', ['I study English at night', 'At night I study English', 'I study English in the evening', 'In the evening I study English', 'I learn English at night', 'I learn English in the evening'], '"Pada malam hari" = at night (pengecualian: bukan "in the night"). "in the evening" juga benar.', {
      'i study english in the night': ['Untuk malam secara umum dipakai "at night".', 'in-on-at'],
      'i study english on the night': ['Untuk malam secara umum dipakai "at night".', 'in-on-at'],
      'i study english on night': ['Untuk malam dipakai "at night".', 'in-on-at'],
    }, { focus: 'in-on-at' }),
    spot(2, 'The new school year starts on July.', 'on', 'in', 'Bulan tanpa tanggal memakai "in": in July.', { focus: 'in-on-at' }),
    arrange(2, 'Kami bermain bulu tangkis setiap hari Minggu.', 'We play badminton every Sunday', ['on', 'at'], 'Sebelum "every" tidak ada preposisi.', { focus: 'no-prep-time' }),
  ],
  homework: [
    dlg(2, 'Lengkapi percakapan berikut.', 'A: When is your English test?\nB: ___', [
      ["It's on Thursday afternoon.", true],
      ["It's in Thursday afternoon.", 'Ada nama hari, jadi "on": on Thursday afternoon.', 'in-on-at'],
      ["It's at Thursday afternoon.", 'Hari memakai "on".', 'in-on-at'],
      ["It's on next Thursday afternoon.", 'Sebelum "next" tidak ada preposisi: next Thursday afternoon.', 'no-prep-time'],
    ], 'Hari, termasuk "Thursday afternoon", memakai "on".', { focus: 'in-on-at' }),
    fix(2, "I have a dentist appointment in Tuesday at four o'clock.", ["I have a dentist appointment on Tuesday at four o'clock", 'I have a dentist appointment on Tuesday at four'], 'Hari memakai "on"; jam memakai "at".', undefined, { focus: 'in-on-at' }),
    read(2, "Hi Sari! Our school trip is on Friday, 12 September. The bus leaves at half past six in the morning, so please come at six. We come back in the evening, at about seven. Don't forget your hat!", 'What time should Sari come to school?', [
      ["At six o'clock", true],
      ['At half past six', 'Itu jam bus berangkat. Sari diminta datang lebih awal: "please come at six".'],
      ['At about seven', 'Itu perkiraan jam pulang.'],
      ['In the evening', 'Mereka pulang pada sore/malam hari, bukan berangkat.'],
    ], '"The bus leaves at half past six ..., so please come at six."'),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['We go to the market on Saturday morning.', true],
      ['We go to the market in Saturday morning.', 'Ada nama hari, jadi "on": on Saturday morning.', 'in-on-at'],
      ['We go to the market at Saturday morning.', 'Hari memakai "on".', 'in-on-at'],
    ], 'Nama hari + bagian hari (Saturday morning) tetap memakai "on".', { focus: 'in-on-at' }),
    fill(3, 'The shop closes ___ noon on Fridays.', ['at'], '"noon" (tengah hari, pukul 12) adalah titik waktu, jadi "at noon".', {
      in: ['"noon" adalah titik waktu, bukan bagian hari yang panjang.', 'in-on-at'],
      on: ['"on" untuk hari atau tanggal; "noon" adalah jam.', 'in-on-at'],
    }, { focus: 'in-on-at' }),
    tr(3, 'Ulang tahun saya pada bulan Desember.', ['My birthday is in December'], 'Bulan tanpa tanggal memakai "in".', {
      'my birthday is on december': ['Bulan tanpa tanggal memakai "in".', 'in-on-at'],
      'my birthday is at december': ['Bulan memakai "in".', 'in-on-at'],
      'my birthday in december': ['Kalimat ini butuh "is": My birthday is in December.', 'be-missing'],
    }, { focus: 'in-on-at' }),
    fix(3, 'She visits her grandparents in every weekend.', ['She visits her grandparents every weekend'], 'Sebelum "every" tidak ada preposisi.', undefined, { focus: 'no-prep-time' }),
    construct(3, 'at / on / I / Monday / have / nine / a meeting', ['I have a meeting at nine on Monday', 'I have a meeting on Monday at nine', 'On Monday I have a meeting at nine'], 'Hari memakai on, jam memakai at. Urutannya boleh "at nine on Monday" atau "on Monday at nine".', undefined, { focus: 'in-on-at' }),
  ],
});

export const thereIsLesson = lesson({
  id: 'a1-there-is',
  title: 'There is / There are',
  summary: 'Menyatakan sesuatu "ada" di suatu tempat, tanpa memakai have.',
  topic: 'a1.there-is',
  objectives: [
    'Memakai there is untuk satu benda atau benda tak terhitung, dan there are untuk benda jamak.',
    'Membuat kalimat negatif dan pertanyaan: There isn\'t ..., Are there any ...?',
    'Tidak menerjemahkan "ada" dengan have atau has.',
  ],
  intro: 'Kata "ada" dalam bahasa Indonesia sangat serbaguna. Untuk menyatakan bahwa sesuatu berada di suatu tempat, bahasa Inggris memakai "there is" atau "there are", bukan "have". "Di kamar saya ada dua jendela" menjadi "There are two windows in my room."',
  teaching: [
    {
      heading: 'Is atau are?',
      body: 'Lihat kata benda SETELAH there is/are. Satu benda atau benda tak terhitung (water, rice, milk) memakai "is". Lebih dari satu memakai "are".',
      table: [
        ['Bentuk', 'Dipakai untuk', 'Contoh'],
        ['There is', 'satu benda / benda tak terhitung', 'There is a sofa in the living room. There is some rice in the pot.'],
        ['There are', 'lebih dari satu', 'There are three bedrooms in our house.'],
      ],
    },
    {
      heading: 'Bukan "have"',
      body: '"Have/has" berarti memiliki. Untuk keberadaan, pakai "there is/are". Kalimat dengan "has" hanya benar bila maknanya memang memiliki.',
      examples: [
        { en: 'There is a mosque near my house.', id: 'Ada masjid di dekat rumah saya.', note: 'Bukan "Near my house has a mosque."' },
        { en: 'My house has a big kitchen.', id: 'Rumah saya punya dapur yang besar.', note: 'Benar, karena maknanya memiliki.' },
      ],
    },
    {
      heading: 'Negatif dan pertanyaan',
      body: 'Tambahkan "not" setelah is/are untuk menyangkal. Untuk bertanya, is/are pindah ke depan. Untuk benda jamak, negatif dan pertanyaan biasanya memakai "any".',
      table: [
        ['', 'Tunggal', 'Jamak'],
        ['Negatif', "There isn't a garage.", "There aren't any chairs."],
        ['Pertanyaan', 'Is there a bathroom upstairs?', 'Are there any shops nearby?'],
        ['Jawaban pendek', "Yes, there is. / No, there isn't.", "Yes, there are. / No, there aren't."],
      ],
    },
  ],
  demo: [
    ['There are two windows in my room.', 'There is two windows in my room.', '"two windows" jamak, jadi "There are".'],
    ['There is a big tree in front of our house.', 'In front of our house has a big tree.', 'Untuk keberadaan pakai "There is", bukan "has".'],
    ['Is there a bank near here?', 'Does there a bank near here?', 'Pertanyaan dengan there is memindahkan "is" ke depan: Is there ...? Tidak memakai "does".'],
  ],
  vocab: ['bedroom', 'kitchen', 'window', 'near'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'There ___ a cat under the table.', [
      ['is', true],
      ['are', '"a cat" satu ekor, jadi "is".', 'there-is-are'],
      ['have', 'Untuk keberadaan dipakai "there is", bukan "have".', 'there-have'],
    ], 'Satu benda (a cat) → There is.', { focus: 'there-is-are', hint: 'Lihat kata benda setelah titik-titik: satu atau banyak?' }),
    fill(1, 'There ___ five students in the classroom.', ['are'], '"five students" jamak → There are.', {
      is: ['"five students" jamak, jadi "are".', 'there-is-are'],
      have: ['Keberadaan memakai "there are", bukan "have".', 'there-have'],
    }, { focus: 'there-is-are', hint: 'Hitung jumlah muridnya.' }),
    match(1, 'Pasangkan awal kalimat dengan akhirnya.', [
      ['There is', 'a mango tree in the garden.'],
      ['There are', 'many cars on the road.'],
      ['Is there', 'a toilet on this floor?'],
      ['Are there', 'any eggs in the fridge?'],
    ], 'Satu benda: is; banyak: are. Untuk bertanya, is/are diletakkan di depan.', { focus: 'there-is-are' }),
    tf(1, 'Kalimat "In my village has a big market." sudah benar.', false, 'Untuk keberadaan pakai "there is": "There is a big market in my village."', '"has" berarti memiliki. Maksud kalimat ini adalah pasar itu berada di desa.', { focus: 'there-have', tag: 'there-have', hint: 'Kata "ada" untuk keberadaan diterjemahkan dengan dua kata.' }),
  ],
  independent: [
    tr(2, 'Ada dua kamar mandi di rumah kami.', ['There are two bathrooms in our house', 'In our house there are two bathrooms', 'Our house has two bathrooms'], 'Jamak (two bathrooms) → There are. "Our house has two bathrooms" juga benar karena bermakna memiliki.', {
      'there is two bathrooms in our house': ['"two bathrooms" jamak, jadi "There are".', 'there-is-are'],
      'in our house have two bathrooms': ['"have" tidak dipakai untuk keberadaan. Pakai "There are two bathrooms in our house."', 'there-have'],
      'in our house has two bathrooms': ['Untuk keberadaan pakai "There are".', 'there-have'],
    }, { focus: 'there-is-are' }),
    fill(2, "There ___ any milk in the fridge. We need to buy some.", ["isn't", 'is not'], '"milk" tak terhitung, jadi dianggap tunggal: There isn\'t any milk.', {
      "aren't": ['"milk" tak terhitung, jadi memakai "isn\'t".', 'there-is-are'],
      is: ['Kalimat berikutnya ("We need to buy some") menunjukkan susunya habis. Pakai bentuk negatif.'],
    }, { focus: 'there-is-are', prompt: 'Lengkapi dengan bentuk yang tepat.' }),
    arrange(2, 'Apakah ada bank di dekat sini?', 'Is there a bank near here', ['are', 'has'], 'Pertanyaan: Is there + benda tunggal + tempat?', { focus: 'there-is-are' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Are there any good restaurants near your office?\nB: ___', [
      ["Yes, there are. There's a great noodle shop.", true],
      ["Yes, there is. There's a great noodle shop.", 'Pertanyaannya "Are there", jadi jawaban pendeknya "Yes, there are."', 'there-is-are'],
      ["Yes, it has. There's a great noodle shop.", 'Jawaban pendek untuk "Are there ...?" adalah "Yes, there are." atau "No, there aren\'t."', 'there-have'],
      ['Yes, they are.', 'Jawaban pendek memakai "there": Yes, there are.'],
    ], 'Pertanyaan "Are there any ...?" dijawab "Yes, there are." atau "No, there aren\'t."', { focus: 'there-is-are' }),
  ],
  homework: [
    read(2, "Rina's new flat is small but comfortable. There is one bedroom, a living room and a small kitchen. There are two big windows in the living room, so it is bright in the morning. There isn't a washing machine, but there is a laundromat next to the building.", "What is NOT in Rina's flat?", [
      ['A washing machine', true],
      ['A kitchen', 'Teks menyebut "a small kitchen".'],
      ['Windows', 'Ada "two big windows" di ruang tamu.'],
      ['A bedroom', 'Ada "one bedroom".'],
    ], '"There isn\'t a washing machine" berarti tidak ada mesin cuci di flat itu.'),
    construct(2, 'any / are / there / chairs / in the hall', ['Are there any chairs in the hall'], 'Pertanyaan jamak: Are there any + benda jamak + tempat?', undefined, { focus: 'there-is-are' }),
    fix(2, 'There is many people at the bus stop.', ['There are many people at the bus stop'], '"many people" jamak, jadi "There are".', undefined, { focus: 'there-is-are' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['There are some apples on the table.', true],
      ['There is some apples on the table.', '"apples" jamak, jadi "There are".', 'there-is-are'],
      ['On the table has some apples.', 'Keberadaan memakai "There are".', 'there-have'],
      ['There are some apple on the table.', '"some" dengan benda terhitung memakai bentuk jamak: apples.'],
    ], 'Benda jamak → There are + some apples.', { focus: 'there-is-are' }),
    fill(2, '___ there a pharmacy near the hospital?', ['Is'], '"a pharmacy" tunggal → Is there ...?', {
      are: ['"a pharmacy" tunggal, jadi "Is".', 'there-is-are'],
      does: ['Pertanyaan dengan "there is" tidak memakai "does": Is there ...?'],
      has: ['Keberadaan memakai "Is there", bukan "has".', 'there-have'],
    }, { focus: 'there-is-are' }),
    tr(3, 'Tidak ada kursi di ruangan ini.', ["There aren't any chairs in this room", 'There are no chairs in this room', "There isn't a chair in this room", 'There is no chair in this room', "This room doesn't have any chairs"], 'Bentuk jamak lebih umum: There aren\'t any chairs. Bentuk tunggal juga benar.', {
      "there isn't any chairs in this room": ['"chairs" jamak, jadi "aren\'t".', 'there-is-are'],
      "in this room hasn't any chairs": ['Keberadaan memakai "there", bukan "has".', 'there-have'],
      "in this room doesn't have chairs": ['Keberadaan memakai "There aren\'t any chairs in this room."', 'there-have'],
    }, { focus: 'there-is-are' }),
    spot(3, 'There are a new student in our class today.', 'are', 'is', '"a new student" tunggal, jadi "There is".', { focus: 'there-is-are' }),
    construct(3, 'a lot of / there / people / are / in the park', ['There are a lot of people in the park', 'In the park there are a lot of people'], '"people" jamak, jadi "There are".', undefined, { focus: 'there-is-are' }),
  ],
});

export const possessivesLesson = lesson({
  id: 'a1-possessives',
  title: 'Possessive: my, your, his, her',
  summary: "Menyatakan kepemilikan dengan my, your, his, her dan 's.",
  topic: 'a1.possessives',
  objectives: [
    'Memakai my, your, his, her, its, our, their sebelum kata benda.',
    'Memilih his atau her menurut pemiliknya, bukan menurut bendanya.',
    "Memakai 's untuk orang: Rina's bag, my parents' house.",
  ],
  intro: 'Bahasa Indonesia meletakkan pemilik di belakang: "tas Rina", "rumahnya". Bahasa Inggris meletakkan pemilik DI DEPAN benda, dan membedakan laki-laki (his) dan perempuan (her). Kata "dia" tidak membedakan keduanya, jadi bagian ini sering tertukar.',
  teaching: [
    {
      heading: 'Kata kepemilikan',
      body: 'Kata kepemilikan selalu diletakkan sebelum benda. Perhatikan "its" (miliknya, untuk hewan atau benda) yang ditulis tanpa tanda petik. "It\'s" berarti "it is".',
      table: [
        ['Subjek', 'Kepemilikan', 'Contoh'],
        ['I', 'my', 'my phone'],
        ['you', 'your', 'your bag'],
        ['he', 'his', 'his car'],
        ['she', 'her', 'her house'],
        ['it', 'its', 'its tail'],
        ['we', 'our', 'our school'],
        ['they', 'their', 'their teacher'],
      ],
    },
    {
      heading: 'His atau her?',
      body: 'Lihat PEMILIKNYA, bukan bendanya. Pemiliknya laki-laki → his. Pemiliknya perempuan → her.',
      examples: [
        { en: 'Budi loves his mother.', id: 'Budi menyayangi ibunya.', note: 'Pemiliknya Budi (laki-laki), jadi his, walaupun ibunya perempuan.' },
        { en: 'Siti washes her motorbike every Sunday.', id: 'Siti mencuci motornya setiap hari Minggu.' },
      ],
    },
    {
      heading: "'s untuk orang",
      body: "Untuk nama atau orang, tambahkan 's pada pemilik dan letakkan di depan benda: \"tas Rina\" → \"Rina's bag\". Untuk kata jamak berakhiran -s, cukup tambahkan tanda petik: \"my parents' house\". Untuk bertanya pemilik, pakai \"Whose ...?\"",
      examples: [
        { en: "This is Rina's bag.", id: 'Ini tas Rina.' },
        { en: "My parents' house is in Klaten.", id: 'Rumah orang tua saya di Klaten.' },
        { en: "Whose phone is this? — It's Tom's.", id: 'Ini ponsel siapa? — Punya Tom.' },
      ],
    },
  ],
  demo: [
    ['Andi loves his mother.', 'Andi loves her mother.', 'Pemiliknya Andi (laki-laki), jadi "his", walaupun ibunya perempuan.'],
    ['My name is Fajar.', 'I name is Fajar.', '"I" adalah subjek. Untuk kepemilikan pakai "my".'],
    ["This is Dewi's laptop.", 'This is laptop Dewi.', "Pemilik + 's diletakkan di depan benda: Dewi's laptop."],
  ],
  vocab: ['brother', 'sister', 'parents'],
  guided: [
    match(1, 'Pasangkan subjek dengan kata kepemilikannya.', [
      ['I', 'my'],
      ['he', 'his'],
      ['she', 'her'],
      ['they', 'their'],
    ], 'I → my, he → his, she → her, they → their.', { focus: 'subject-possessive' }),
    mc(1, 'Pilih kata yang tepat.', 'Rudi washes ___ car every Saturday.', [
      ['his', true],
      ['her', 'Pemiliknya Rudi (laki-laki), jadi "his".', 'his-her'],
      ['he', '"he" adalah subjek. Sebelum benda pakai kata kepemilikan.', 'subject-possessive'],
    ], 'Pemiliknya Rudi (laki-laki) → his car.', { focus: 'his-her', hint: 'Siapa pemilik mobilnya: laki-laki atau perempuan?' }),
    fill(1, 'Mrs. Tan teaches ___ students every morning.', ['her'], 'Pemiliknya Mrs. Tan (perempuan) → her.', {
      his: ['Mrs. Tan perempuan, jadi "her".', 'his-her'],
      she: ['Sebelum benda pakai kata kepemilikan, bukan subjek.', 'subject-possessive'],
    }, { focus: 'his-her', hint: '"Mrs." dipakai untuk perempuan.' }),
    tf(1, 'Kalimat "This is book Ani." sudah benar.', false, "Pemilik + 's diletakkan di depan benda: \"This is Ani's book.\"", 'Bahasa Inggris tidak meletakkan nama pemilik di belakang benda seperti "buku Ani".', { focus: 'possessive-s', tag: 'possessive-s', hint: 'Dalam bahasa Inggris, mana yang ditulis lebih dulu: pemilik atau benda?' }),
  ],
  independent: [
    tr(2, 'Ini sepeda adik laki-laki saya.', ["This is my brother's bike", "This is my brother's bicycle", "This is my younger brother's bike", "This is my younger brother's bicycle", "This is my little brother's bike", "This is my little brother's bicycle"], "Pemilik (my brother) + 's + benda (bike).", {
      'this is bike my brother': ["Pemilik + 's diletakkan di depan benda: my brother's bike.", 'possessive-s'],
      'this is my brother bike': ["Tambahkan 's pada pemilik: my brother's bike.", 'possessive-s'],
    }, { focus: 'possessive-s' }),
    fill(2, 'We love ___ new teacher. She is very patient.', ['our'], 'Subjek "we" → our.', {
      we: ['"we" adalah subjek. Sebelum benda pakai "our".', 'subject-possessive'],
      us: ['"us" adalah objek. Untuk kepemilikan pakai "our".', 'subject-possessive'],
      their: ['"their" untuk they. Subjeknya "we".', 'subject-possessive'],
    }, { focus: 'subject-possessive' }),
    spot(2, 'My sister always forgets his keys.', 'his', 'her', 'Pemiliknya "my sister" (perempuan), jadi "her keys".', { focus: 'his-her' }),
    arrange(2, 'Nama mereka Tono dan Tini.', 'Their names are Tono and Tini', ['They', 'is'], 'They → their. Dua nama → names are.', { focus: 'subject-possessive' }),
  ],
  homework: [
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Whose bag is this?\nB: ___', [
      ["It's Maya's bag.", true],
      ["It's bag Maya.", "Pemilik + 's diletakkan di depan benda: Maya's bag.", 'possessive-s'],
      ["It's Maya bag.", "Tambahkan 's pada pemilik: Maya's bag.", 'possessive-s'],
      ["It's her Maya's bag.", "Cukup \"Maya's bag\" atau \"her bag\", tidak keduanya."],
    ], "\"Whose ...?\" menanyakan pemilik. Jawab dengan nama + 's.", { focus: 'possessive-s' }),
    read(2, "Hello, I'm Nadia. This is my family. My father is a driver, and his name is Pak Joko. My mother is a nurse. Her hospital is near our house. I have one brother, Raka. Raka's dream is to be a pilot. Our cat is called Miko. Its fur is white and grey.", 'Who works at a hospital?', [
      ["Nadia's mother", true],
      ["Nadia's father", 'Ayah Nadia adalah sopir.'],
      ['Raka', 'Raka ingin menjadi pilot.'],
      ['Pak Joko', 'Pak Joko adalah ayah Nadia, seorang sopir.'],
    ], '"My mother is a nurse. Her hospital is near our house."'),
    fix(2, 'Dimas and Rina visit they grandmother every Sunday.', ['Dimas and Rina visit their grandmother every Sunday'], '"they" adalah subjek. Kepemilikan untuk mereka: their.', undefined, { focus: 'subject-possessive' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['Lina and her husband live in Makassar.', true],
      ['Lina and his husband live in Makassar.', 'Pemiliknya Lina (perempuan), jadi "her husband".', 'his-her'],
      ['Lina and she husband live in Makassar.', '"she" adalah subjek. Sebelum benda pakai "her".', 'subject-possessive'],
      ['Lina and husband her live in Makassar.', 'Kata kepemilikan diletakkan di depan benda: her husband.'],
    ], 'Pemiliknya Lina → her husband.', { focus: 'his-her' }),
    fill(2, 'The cat is hungry. ___ bowl is empty.', ['Its'], 'Pemiliknya kucing (it) → its.', {
      "it's": ['"it\'s" berarti "it is". Untuk kepemilikan pakai "its" tanpa tanda petik.', 'subject-possessive'],
      his: ['Untuk hewan atau benda umumnya dipakai "its".', 'his-her'],
      it: ['"it" adalah subjek. Kepemilikannya "its".', 'subject-possessive'],
    }, { focus: 'subject-possessive' }),
    tr(3, 'Rumah orang tua saya dekat pasar.', ["My parents' house is near the market", "My parents' house is close to the market"], "Orang tua = parents (jamak berakhiran -s), jadi cukup tanda petik: my parents' house.", {
      "my parent's house is near the market": ["Orang tua berarti dua orang (parents). Untuk jamak berakhiran -s, tanda petik diletakkan setelah s: parents'.", 'possessive-s'],
      'my parents house is near the market': ["Tambahkan tanda kepemilikan: parents'.", 'possessive-s'],
    }, { focus: 'possessive-s' }),
    fix(3, 'Is this you phone or your sister phone?', ["Is this your phone or your sister's phone", "Is this your phone or your sister's"], "you → your; pemilik orang memakai 's: your sister's phone.", undefined, { focus: 'possessive-s' }),
    spot(3, 'Mr. Budi drives her children to school every day.', 'her', 'his', 'Pemiliknya Mr. Budi (laki-laki): his children.', { focus: 'his-her' }),
  ],
});

export const canLesson = lesson({
  id: 'a1-can',
  title: "Can dan Can't",
  summary: 'Menyatakan kemampuan, meminta tolong, dan meminta izin dengan can.',
  topic: 'a1.can',
  objectives: [
    'Memakai can dan can\'t + bentuk dasar untuk kemampuan.',
    'Bertanya dengan Can you ...? dan menjawab Yes, I can. / No, I can\'t.',
    'Meminta tolong (Can you help me?) dan meminta izin (Can I sit here?).',
  ],
  intro: '"Bisa" adalah salah satu kata yang paling sering dipakai. Kabar baiknya, "can" sangat sederhana: bentuknya sama untuk semua subjek, dan kata kerja setelahnya selalu bentuk dasar. Tidak ada -s, tidak ada "to", dan tidak perlu "do".',
  teaching: [
    {
      heading: 'Can + bentuk dasar',
      body: 'Can sama untuk semua subjek. Setelah can, kata kerja tetap bentuk dasar: "she can drive", bukan "she can drives" atau "she can to drive".',
      table: [
        ['Positif', 'Negatif', 'Pertanyaan'],
        ['I can swim.', "I can't swim.", 'Can you swim?'],
        ['She can drive.', "She can't drive.", 'Can she drive?'],
        ['They can speak Javanese.', "They can't speak Javanese.", 'Can they speak Javanese?'],
      ],
    },
    {
      heading: 'Bertanya dan meminta',
      body: 'Untuk bertanya, can pindah ke depan; tidak perlu "do". "Can you ...?" juga dipakai untuk meminta tolong, dan "Can I ...?" untuk meminta izin.',
      examples: [
        { en: 'Can you help me, please?', id: 'Bisakah kamu membantu saya?' },
        { en: 'Can I sit here?', id: 'Boleh saya duduk di sini?' },
        { en: "Yes, I can. / No, I can't.", id: 'Ya, bisa. / Tidak bisa.' },
      ],
    },
    {
      heading: "Ucapan can dan can't",
      body: 'Dalam kalimat positif, "can" diucapkan pendek dan lemah (/kən/). "Can\'t" diucapkan penuh dan diberi tekanan (/kɑːnt/ dalam bahasa Inggris Britania, /kænt/ dalam bahasa Inggris Amerika). Tekanan itulah yang membedakan keduanya saat mendengar.',
    },
  ],
  demo: [
    ['My grandfather can speak Dutch.', 'My grandfather can speaks Dutch.', 'Setelah "can", kata kerja bentuk dasar, tanpa -s.'],
    ['I can play the guitar.', 'I can to play the guitar.', 'Tidak ada "to" setelah "can".'],
    ['Can you ride a motorbike?', 'Do you can ride a motorbike?', 'Pertanyaan dengan "can" tidak memakai "do": Can you ...?'],
  ],
  vocab: ['swim', 'drive', 'help'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'My little sister can ___ very well.', [
      ['sing', true],
      ['sings', 'Setelah "can" pakai bentuk dasar, tanpa -s.', 'can-base'],
      ['to sing', 'Tidak ada "to" setelah "can".', 'can-base'],
      ['singing', 'Setelah "can" pakai bentuk dasar, bukan -ing.', 'can-base'],
    ], 'can + bentuk dasar: can sing.', { focus: 'can-base', hint: 'Kata kerja setelah "can" tidak berubah sama sekali.' }),
    fill(1, 'Sorry, I ___ come to your party. I have an exam.', ["can't", 'cannot'], 'Tidak bisa = can\'t (cannot).', {
      can: ['Ada alasan "I have an exam", jadi dia TIDAK bisa datang. Pakai bentuk negatif.'],
      "don't": ['Negatif untuk kemampuan memakai "can\'t", bukan "don\'t".', 'can-do'],
    }, { focus: 'can-base', prompt: 'Lengkapi dengan bentuk yang tepat.', hint: 'Lihat alasan "I have an exam". Apakah dia bisa datang?' }),
    arrange(1, 'Bisakah kamu berbicara bahasa Inggris?', 'Can you speak English', ['do', 'speaks'], 'Can + subjek + bentuk dasar ...?', { focus: 'can-do' }),
    tf(1, 'Kalimat "Do you can cook?" sudah benar.', false, 'Pertanyaan dengan can tidak memakai "do": "Can you cook?"', '"Can" sudah berfungsi sebagai kata bantu, jadi tidak perlu "do".', { focus: 'can-do', tag: 'can-do', hint: 'Kata bantu mana yang dipindah ke depan?' }),
  ],
  independent: [
    tr(2, 'Dia (perempuan) tidak bisa menyetir mobil.', ["She can't drive a car", 'She cannot drive a car', "She can't drive"], "She + can't + drive (bentuk dasar).", {
      "she can't drives a car": ['Setelah "can\'t", bentuk dasar: drive.', 'can-base'],
      "she doesn't can drive a car": ['Negatif "can" cukup can\'t; tidak perlu "doesn\'t".', 'can-do'],
      'she not can drive a car': ['Negatifnya "can\'t" atau "cannot".', 'can-do'],
    }, { focus: 'can-base' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Can your brother swim?\nB: ___', [
      ['Yes, he can. He swims every morning.', true],
      ['Yes, he can swims.', 'Jawaban pendek cukup "Yes, he can." Bila kata kerjanya disebut, pakai bentuk dasar: he can swim.', 'can-base'],
      ['Yes, he does.', 'Pertanyaan dengan "Can" dijawab dengan "can": Yes, he can.', 'can-do'],
      ['Yes, he is.', 'Pertanyaan dengan "Can" dijawab dengan "can".', 'can-do'],
    ], '"Can your brother swim?" → "Yes, he can." / "No, he can\'t."', { focus: 'can-do' }),
    fill(2, '___ I borrow your pen, please?', ['Can', 'Could', 'May'], 'Meminta izin: Can I ...? ("Could I" dan "May I" lebih sopan.)', {
      do: ['Untuk meminta izin pakai "Can I ...?", bukan "Do I ...?"', 'can-do'],
      am: ['Untuk meminta izin pakai "Can I ...?"', 'can-do'],
    }, { focus: 'can-do' }),
    fix(2, 'Ari can to play badminton very well.', ['Ari can play badminton very well'], 'Tidak ada "to" setelah "can".', undefined, { focus: 'can-base' }),
  ],
  homework: [
    read(2, "My name is Yoga. I can speak three languages: Indonesian, Javanese and English. I can play the guitar, but I can't sing well. My best friend, Lukas, can't play any instruments, but he can sing beautifully. Together we can make a good team for the school concert!", 'What can Lukas do?', [
      ['He can sing well.', true],
      ['He can play the guitar.', 'Yang bisa bermain gitar adalah Yoga. Lukas "can\'t play any instruments".'],
      ['He can speak three languages.', 'Itu kemampuan Yoga.'],
      ["He can't sing.", 'Teks menyebut Lukas "can sing beautifully".'],
    ], '"he can sing beautifully"'),
    construct(2, "can't / my grandmother / use / a smartphone", ["My grandmother can't use a smartphone", 'My grandmother cannot use a smartphone'], "Subjek + can't + bentuk dasar + objek.", undefined, { focus: 'can-base' }),
    tr(2, 'Boleh saya membuka jendelanya?', ['Can I open the window', 'May I open the window', 'Could I open the window'], 'Meminta izin: Can I + bentuk dasar ...?', {
      'do i can open the window': ['Pertanyaan dengan can tidak memakai "do".', 'can-do'],
      'can i to open the window': ['Tidak ada "to" setelah "can".', 'can-base'],
    }, { focus: 'can-do' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['We can meet at the library after school.', true],
      ['We can meeting at the library after school.', 'Setelah "can" pakai bentuk dasar: meet.', 'can-base'],
      ['We can to meet at the library after school.', 'Tidak ada "to" setelah "can".', 'can-base'],
      ['We cans meet at the library after school.', '"can" tidak pernah diberi -s.', 'can-base'],
    ], 'can + bentuk dasar.', { focus: 'can-base' }),
    fill(2, 'Penguins ___ fly, but they can swim very fast.', ["can't", 'cannot'], 'Penguin tidak bisa terbang: can\'t fly.', {
      "don't": ['Untuk kemampuan pakai "can\'t", bukan "don\'t".', 'can-do'],
      can: ['Ada kata "but": penguin bisa berenang TETAPI tidak bisa terbang.'],
    }, { focus: 'can-base' }),
    tr(3, 'Bisakah kamu membantu saya mengangkat kotak ini?', ['Can you help me carry this box', 'Could you help me carry this box', 'Can you help me lift this box', 'Could you help me lift this box', 'Can you help me to carry this box', 'Could you help me to carry this box', 'Can you help me to lift this box', 'Could you help me to lift this box'], 'Can you + help + me + carry ...? ("help me carry" dan "help me to carry" sama-sama benar.)', {
      'do you can help me carry this box': ['Pertanyaan dengan can tidak memakai "do".', 'can-do'],
      'can you helps me carry this box': ['Setelah "can", bentuk dasar: help.', 'can-base'],
    }, { focus: 'can-do' }),
    spot(3, 'Can she speaks Korean?', 'speaks', 'speak', 'Setelah "Can she", bentuk dasar: speak.', { focus: 'can-base' }),
    construct(3, 'you / can / tomorrow / come', ['Can you come tomorrow'], 'Untuk bertanya: Can + subjek + bentuk dasar + keterangan waktu.', {
      'you can come tomorrow': ['Untuk bertanya, "can" diletakkan di depan subjek: Can you ...?', 'can-do'],
    }, { focus: 'can-do', prompt: 'Susun pertanyaan bahasa Inggris yang benar dari kata kunci berikut.' }),
  ],
});
