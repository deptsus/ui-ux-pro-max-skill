// Jalur Khusus (Rilis 11) · Jalur Anak (sekitar 7–12 tahun, A1): kalimat
// pendek, banyak gambar kata, dan penjelasan yang bisa dibacakan orang tua.
// The first lesson is free; the rest are Premium.
import { arrange, construct, fill, fix, lesson, match, mc, spot, tf, tr } from './dsl';

export const kidsColors = lesson({
  id: 'kids-colors-animals',
  title: 'Warna dan Hewan',
  summary: 'Menyebut hewan dan warnanya: It is a red bird. It is an elephant.',
  topic: 'kids.colors-animals',
  objectives: [
    'Menyebut nama hewan dan warna dalam bahasa Inggris.',
    'Meletakkan warna sebelum nama hewan: a red bird, bukan a bird red.',
    'Memakai a dan an: a cat, an elephant.',
  ],
  intro: 'Halo! Hari ini kita belajar nama hewan dan warna. Dalam bahasa Indonesia kita bilang "burung merah". Dalam bahasa Inggris urutannya dibalik: warna dulu, baru hewannya: "a red bird". Ayo coba!',
  teaching: [
    {
      heading: 'Warna',
      body: 'Ini beberapa warna yang sering dipakai. Coba sebutkan sambil menunjuk benda di sekitarmu.',
      table: [
        ['Inggris', 'Indonesia'],
        ['red', 'merah'],
        ['blue', 'biru'],
        ['green', 'hijau'],
        ['yellow', 'kuning'],
        ['black', 'hitam'],
        ['white', 'putih'],
      ],
    },
    {
      heading: 'Warna sebelum hewan',
      body: 'Dalam bahasa Inggris, warna diletakkan SEBELUM nama hewan.',
      examples: [
        { en: 'a black cat', id: 'kucing hitam' },
        { en: 'a yellow duck', id: 'bebek kuning' },
        { en: 'It is a green frog.', id: 'Itu katak hijau.' },
      ],
    },
    {
      heading: 'A atau an?',
      body: 'Pakai "an" kalau kata berikutnya berbunyi a, i, u, e, o di depan. Selain itu pakai "a".',
      examples: [
        { en: 'an elephant', id: 'seekor gajah' },
        { en: 'an owl', id: 'seekor burung hantu' },
        { en: 'a dog', id: 'seekor anjing' },
        { en: 'an orange fish', id: 'seekor ikan oranye', note: '"orange" berbunyi o di depan, jadi "an".' },
      ],
    },
  ],
  demo: [
    ['It is a red bird.', 'It is a bird red.', 'Warna di depan hewan: a red bird.'],
    ['It is an elephant.', 'It is a elephant.', '"elephant" berbunyi e di depan, jadi pakai an.'],
    ['I see a white rabbit.', 'I see a rabbit white.', 'Warna di depan hewan: a white rabbit.'],
  ],
  guided: [
    match(1, 'Pasangkan warna dengan artinya.', [
      ['red', 'merah'],
      ['blue', 'biru'],
      ['green', 'hijau'],
      ['yellow', 'kuning'],
    ], 'Hafalkan sambil menunjuk benda yang warnanya sama.'),
    mc(1, 'Mana yang benar?', null, [
      ['a black cat', true],
      ['a cat black', 'Warna di depan hewan: a black cat.'],
      ['black a cat', '"a" ada di paling depan: a black cat.'],
    ], 'Urutannya: a + warna + hewan.'),
    mc(1, 'Pilih a atau an.', '___ elephant', [
      ['an', true],
      ['a', '"elephant" berbunyi e di depan, jadi an.'],
    ], 'an + bunyi a, i, u, e, o.'),
    match(1, 'Pasangkan hewan dengan artinya.', [
      ['cat', 'kucing'],
      ['dog', 'anjing'],
      ['bird', 'burung'],
      ['fish', 'ikan'],
    ], 'Nama hewan yang paling sering dipakai.'),
  ],
  independent: [
    fill(1, 'It is ___ owl.', ['an'], '"owl" berbunyi o di depan: an owl.', { a: ['owl berbunyi o di depan, jadi an.'] }),
    arrange(1, 'Itu bebek kuning.', 'It is a yellow duck', ['an'], 'a + warna + hewan.'),
    tr(1, 'kucing putih', ['a white cat', 'white cat'], 'Warna di depan hewan: a white cat.', { 'a cat white': ['Warna di depan hewan.'] }),
    fix(1, 'It is a dog brown.', ['It is a brown dog.'], 'Warna di depan hewan: a brown dog.', { 'It is a dog brown.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    tf(1, '"a green frog" artinya katak hijau.', true, 'green = hijau, frog = katak.', 'Pernyataan ini benar.'),
    construct(1, 'it / is / a / blue / bird', ['It is a blue bird.', "It's a blue bird."], 'It is + a + warna + hewan.'),
    spot(1, 'I see a orange fish.', 'a', 'an', '"orange" berbunyi o di depan: an orange fish.'),
  ],
  mastery: [
    tr(2, 'Itu gajah.', ['It is an elephant.', "It's an elephant.", 'That is an elephant.'], 'an + elephant.', { 'It is a elephant.': ['elephant berbunyi e di depan, jadi an.'] }),
    arrange(2, 'Saya melihat kucing hitam.', 'I see a black cat', ['an', 'white'], 'a + warna + hewan.'),
    mc(2, 'Kalimat mana yang benar?', null, [
      ['It is a red apple.', true],
      ['It is a apple red.', 'Dua kesalahan: an apple, dan warna di depan.'],
      ['It is an red apple.', '"red" berbunyi r di depan, jadi a: a red apple.'],
    ], 'a/an mengikuti bunyi kata TEPAT sesudahnya: a red apple, tetapi an apple.'),
  ],
});

export const kidsFamily = lesson({
  id: 'kids-family',
  title: 'Keluargaku',
  summary: 'Memperkenalkan keluarga: This is my mother. She is kind.',
  topic: 'kids.family',
  objectives: [
    'Menyebut anggota keluarga dalam bahasa Inggris.',
    'Memperkenalkan dengan "This is my ...".',
    'Memakai he untuk laki-laki dan she untuk perempuan.',
  ],
  intro: 'Dalam bahasa Indonesia, "dia" bisa untuk laki-laki atau perempuan. Dalam bahasa Inggris ada dua kata: "he" untuk laki-laki dan "she" untuk perempuan. Ayo kenalkan keluargamu!',
  teaching: [
    {
      heading: 'Anggota keluarga',
      body: 'Ini nama anggota keluarga dalam bahasa Inggris.',
      table: [
        ['Inggris', 'Indonesia'],
        ['mother / mom', 'ibu'],
        ['father / dad', 'ayah'],
        ['sister', 'kakak/adik perempuan'],
        ['brother', 'kakak/adik laki-laki'],
        ['grandmother / grandma', 'nenek'],
        ['grandfather / grandpa', 'kakek'],
      ],
    },
    {
      heading: 'This is my ...',
      body: 'Untuk memperkenalkan seseorang, pakai "This is my ...".',
      examples: [
        { en: 'This is my mother.', id: 'Ini ibuku.' },
        { en: 'This is my little brother.', id: 'Ini adik laki-lakiku.' },
      ],
    },
    {
      heading: 'He atau she?',
      body: '"He" untuk laki-laki (ayah, kakek, saudara laki-laki). "She" untuk perempuan (ibu, nenek, saudara perempuan).',
      examples: [
        { en: 'This is my father. He is a doctor.', id: 'Ini ayahku. Dia seorang dokter.' },
        { en: 'This is my grandma. She is kind.', id: 'Ini nenekku. Dia baik hati.' },
      ],
    },
  ],
  demo: [
    ['This is my sister. She is nine.', 'This is my sister. He is nine.', 'Saudara perempuan memakai she.'],
    ['This is my grandfather.', 'This my grandfather.', 'Jangan lupa "is": This is my ...'],
    ['My father is tall.', 'My father he is tall.', 'Cukup satu subjek: My father is tall.'],
  ],
  guided: [
    match(1, 'Pasangkan dengan artinya.', [
      ['mother', 'ibu'],
      ['father', 'ayah'],
      ['grandmother', 'nenek'],
      ['brother', 'saudara laki-laki'],
    ], 'Nama anggota keluarga.'),
    mc(1, 'Pilih he atau she.', 'This is my mother. ___ is a teacher.', [
      ['She', true],
      ['He', 'Ibu adalah perempuan, jadi she.'],
    ], 'Perempuan memakai she.'),
    mc(1, 'Pilih he atau she.', 'This is my grandpa. ___ likes fishing.', [
      ['He', true],
      ['She', 'Kakek adalah laki-laki, jadi he.'],
    ], 'Laki-laki memakai he.'),
    tf(1, '"sister" artinya saudara laki-laki.', false, '"sister" adalah saudara perempuan; saudara laki-laki adalah "brother".', 'Pernyataan ini salah.'),
  ],
  independent: [
    fill(1, 'This ___ my father.', ['is'], 'This is my ...', { are: ['Untuk satu orang, pakai is.'] }),
    arrange(1, 'Ini nenekku.', 'This is my grandmother', ['he'], 'This is my + anggota keluarga.', { alt: ['This is my grandma'] }),
    tr(1, 'Ini kakak laki-lakiku.', ['This is my brother.', 'This is my big brother.', 'This is my older brother.'], 'This is my + brother.'),
    fix(1, 'This is my sister. He is ten.', ['This is my sister. She is ten.'], 'Saudara perempuan memakai she.', { 'This is my sister. He is ten.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    construct(1, 'this / is / my / dad', ['This is my dad.'], 'This is my + anggota keluarga.'),
    spot(1, 'This is my brother. She likes football.', 'She', 'He', 'Saudara laki-laki memakai he.'),
    mc(1, 'Apa arti "This is my grandma"?', null, [
      ['Ini nenekku.', true],
      ['Ini kakekku.', 'Kakek adalah grandpa/grandfather.'],
      ['Ini ibuku.', 'Ibu adalah mother/mom.'],
    ], 'grandma = nenek.'),
  ],
  mastery: [
    tr(2, 'Ini ayahku. Dia tinggi.', ['This is my father. He is tall.', 'This is my dad. He is tall.', "This is my father. He's tall.", "This is my dad. He's tall."], 'This is my father. He is ...', { 'This is my father. She is tall.': ['Ayah memakai he.'] }),
    arrange(2, 'Ibuku baik hati.', 'My mother is kind', ['he', 'are'], 'My mother + is + kind.', { alt: ['My mom is kind'] }),
    fix(2, 'My grandmother she is kind.', ['My grandmother is kind.'], 'Cukup satu subjek: My grandmother is kind.', { 'My grandmother she is kind.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const kidsNumbers = lesson({
  id: 'kids-numbers-toys',
  title: 'Angka dan Mainan',
  summary: 'Menghitung mainan: I have two balls. How many cars?',
  topic: 'kids.numbers-toys',
  objectives: [
    'Menyebut angka 1 sampai 10 dalam bahasa Inggris.',
    'Menambah -s untuk benda lebih dari satu: one car, two cars.',
    'Bertanya dan menjawab "How many ...?".',
  ],
  intro: 'Dalam bahasa Indonesia kita bilang "dua mobil", tanpa mengubah kata "mobil". Dalam bahasa Inggris, kalau bendanya lebih dari satu, kata bendanya diberi -s: "two cars". Yuk hitung mainanmu!',
  teaching: [
    {
      heading: 'Angka 1–10',
      body: 'Ucapkan sambil menghitung jari.',
      table: [
        ['1 one', '2 two', '3 three', '4 four', '5 five'],
        ['6 six', '7 seven', '8 eight', '9 nine', '10 ten'],
      ],
    },
    {
      heading: 'Lebih dari satu: tambah -s',
      body: 'Satu benda: "a car" atau "one car". Lebih dari satu: tambah -s di akhir.',
      examples: [
        { en: 'one ball, three balls', id: 'satu bola, tiga bola' },
        { en: 'I have two dolls.', id: 'Aku punya dua boneka.' },
        { en: 'She has five books.', id: 'Dia punya lima buku.' },
      ],
    },
    {
      heading: 'How many ...?',
      body: 'Untuk bertanya jumlah, pakai "How many + benda dengan -s?".',
      examples: [
        { en: 'How many cars do you have?', id: 'Berapa banyak mobil yang kamu punya?' },
        { en: 'I have four cars.', id: 'Aku punya empat mobil.' },
      ],
    },
  ],
  demo: [
    ['I have two cars.', 'I have two car.', 'Lebih dari satu: cars.'],
    ['How many balls do you have?', 'How many ball do you have?', 'Setelah How many, benda diberi -s.'],
    ['I have one teddy bear.', 'I have one teddy bears.', 'Satu benda tidak diberi -s.'],
  ],
  guided: [
    match(1, 'Pasangkan angka dengan katanya.', [
      ['3', 'three'],
      ['5', 'five'],
      ['8', 'eight'],
      ['10', 'ten'],
    ], 'Angka dalam bahasa Inggris.'),
    mc(1, 'Mana yang benar?', null, [
      ['two balls', true],
      ['two ball', 'Lebih dari satu: balls.'],
      ['twos ball', '-s ditambahkan pada bendanya, bukan angkanya.'],
    ], 'Angka lebih dari satu + benda dengan -s.'),
    mc(1, 'Pilih jawaban yang tepat.', 'How many dolls do you have?', [
      ['I have three dolls.', true],
      ['I have three doll.', 'Lebih dari satu: dolls.'],
      ['Yes, I have.', 'Pertanyaan "How many" dijawab dengan jumlah.'],
    ], 'Jawab dengan jumlah: I have three dolls.'),
    tf(1, '"seven" artinya tujuh.', true, 'seven = 7.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'I have four ___ (car).', ['cars'], 'Lebih dari satu: cars.', { car: ['Empat mobil: tambah -s.'] }),
    arrange(1, 'Aku punya enam buku.', 'I have six books', ['book'], 'I have + angka + benda dengan -s.'),
    tr(1, 'Berapa banyak bola yang kamu punya?', ['How many balls do you have?'], 'How many + balls + do you have?', { 'How many ball do you have?': ['Setelah How many, pakai balls.'] }),
    fix(1, 'I have nine kite.', ['I have nine kites.'], 'Lebih dari satu: kites.', { 'I have nine kite.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    construct(1, 'I / have / two / robot', ['I have two robots.'], 'Dua robot: robots.', { 'I have two robot.': ['Lebih dari satu: robots.'] }),
    spot(1, 'She has five ball.', 'ball', 'balls', 'Lebih dari satu: balls.'),
    mc(1, 'Apa angka "ten"?', null, [
      ['10', true],
      ['2', 'Dua adalah "two".'],
      ['9', 'Sembilan adalah "nine".'],
    ], 'ten = 10.'),
  ],
  mastery: [
    tr(2, 'Aku punya satu boneka dan tiga mobil.', ['I have one doll and three cars.', 'I have a doll and three cars.'], 'Satu: doll (tanpa -s). Tiga: cars.', { 'I have one dolls and three cars.': ['Satu boneka tanpa -s.'], 'I have one doll and three car.': ['Tiga mobil: cars.'] }),
    arrange(2, 'Berapa banyak mobil yang kamu punya?', 'How many cars do you have', ['car', 'much'], 'How many + benda dengan -s.'),
    fix(2, 'How many book do you have?', ['How many books do you have?'], 'Setelah How many, benda diberi -s.', { 'How many book do you have?': ['Kalimatnya belum diubah.'] }),
  ],
});

export const kidsFood = lesson({
  id: 'kids-food',
  title: 'Makanan Kesukaanku',
  summary: 'Menyebut makanan dan minuman: I like rice. I don\'t like onions.',
  topic: 'kids.food',
  objectives: [
    'Menyebut makanan dan minuman sehari-hari dalam bahasa Inggris.',
    'Mengatakan suka dan tidak suka: I like ... / I don\'t like ...',
    'Bertanya: Do you like ...? dan menjawab Yes, I do. / No, I don\'t.',
  ],
  intro: 'Makanan apa yang paling kamu suka? Nasi goreng? Pisang? Hari ini kita belajar bilang "aku suka" dan "aku tidak suka" dalam bahasa Inggris.',
  teaching: [
    {
      heading: 'Makanan dan minuman',
      body: 'Ini makanan dan minuman yang sering kita temui.',
      table: [
        ['Inggris', 'Indonesia'],
        ['rice', 'nasi'],
        ['bread', 'roti'],
        ['egg', 'telur'],
        ['banana', 'pisang'],
        ['milk', 'susu'],
        ['water', 'air'],
      ],
    },
    {
      heading: 'Suka dan tidak suka',
      body: '"I like ..." untuk yang kamu suka. "I don\'t like ..." untuk yang tidak kamu suka.',
      examples: [
        { en: 'I like bananas.', id: 'Aku suka pisang.' },
        { en: "I don't like onions.", id: 'Aku tidak suka bawang.' },
      ],
    },
    {
      heading: 'Bertanya',
      body: 'Untuk bertanya, mulai dengan "Do you like ...?". Jawab dengan "Yes, I do." atau "No, I don\'t."',
      examples: [
        { en: 'Do you like milk? Yes, I do.', id: 'Kamu suka susu? Ya, suka.' },
        { en: "Do you like fish? No, I don't.", id: 'Kamu suka ikan? Tidak.' },
      ],
    },
  ],
  demo: [
    ["I don't like onions.", 'I not like onions.', 'Untuk "tidak suka", pakai don\'t: I don\'t like.'],
    ['Do you like milk?', 'You like milk?', 'Pertanyaan dimulai dengan Do.'],
    ['Yes, I do.', 'Yes, I like.', 'Jawaban pendek: Yes, I do.'],
  ],
  guided: [
    match(1, 'Pasangkan dengan artinya.', [
      ['rice', 'nasi'],
      ['bread', 'roti'],
      ['milk', 'susu'],
      ['egg', 'telur'],
    ], 'Nama makanan dan minuman.'),
    mc(1, 'Bagaimana bilang "Aku tidak suka bawang"?', null, [
      ["I don't like onions.", true],
      ['I not like onions.', 'Pakai don\'t: I don\'t like.'],
      ["I doesn't like onions.", 'Untuk I, pakai don\'t, bukan doesn\'t.'],
    ], "I don't like + makanan."),
    mc(1, 'Jawaban pendek untuk "Do you like bananas?" kalau kamu suka:', null, [
      ['Yes, I do.', true],
      ['Yes, I like.', 'Jawaban pendeknya "Yes, I do."'],
      ['Yes, I am.', '"I am" untuk pertanyaan dengan "Are you ...?"'],
    ], 'Do you ...? → Yes, I do. / No, I don\'t.'),
    tf(1, '"water" artinya air.', true, 'water = air.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'I ___ like fish.', ["don't", 'do not'], 'Tidak suka: don\'t like.', { not: ['Pakai don\'t sebelum like.'] }),
    arrange(1, 'Aku suka roti.', 'I like bread', ['likes'], 'I like + makanan.'),
    tr(1, 'Kamu suka susu?', ['Do you like milk?'], 'Do you like + ...?', { 'You like milk?': ['Pertanyaan dimulai dengan Do.'] }),
    fix(1, 'I not like eggs.', ["I don't like eggs.", 'I do not like eggs.'], 'Pakai don\'t: I don\'t like eggs.', { 'I not like eggs.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    construct(1, 'I / like / bananas', ['I like bananas.'], 'I like + makanan.'),
    spot(1, 'Do you likes rice?', 'likes', 'like', 'Setelah "Do you", pakai like tanpa -s.'),
    mc(1, 'Apa arti "I like water"?', null, [
      ['Aku suka air.', true],
      ['Aku tidak suka air.', 'Tidak ada "don\'t", jadi artinya suka.'],
      ['Aku suka susu.', 'water = air, milk = susu.'],
    ], 'water = air.'),
  ],
  mastery: [
    tr(2, 'Aku suka nasi, tapi aku tidak suka ikan.', ["I like rice, but I don't like fish.", 'I like rice, but I do not like fish.', "I like rice but I don't like fish."], "I like ..., but I don't like ...", { 'I like rice, but I not like fish.': ['Pakai don\'t sebelum like.'] }),
    arrange(2, 'Kamu suka telur?', 'Do you like eggs', ['likes', 'Are'], 'Do you like + ...?'),
    fix(2, 'Do you like milk? Yes, I like.', ['Do you like milk? Yes, I do.'], 'Jawaban pendek: Yes, I do.', { 'Do you like milk? Yes, I like.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const kidsSchool = lesson({
  id: 'kids-school',
  title: 'Di Sekolah',
  summary: 'Benda di tas sekolah dan kalimat di kelas: This is my pencil. Can I borrow your eraser?',
  topic: 'kids.school',
  objectives: [
    'Menyebut benda sekolah dalam bahasa Inggris.',
    'Memakai this/these: This is my pencil. These are my books.',
    'Meminta dengan sopan: Can I borrow your ...? Thank you!',
  ],
  intro: 'Apa saja isi tas sekolahmu? Ada pensil, buku, dan penghapus? Hari ini kita belajar menyebut benda-benda itu dan cara meminjam dengan sopan dalam bahasa Inggris.',
  teaching: [
    {
      heading: 'Benda sekolah',
      body: 'Coba tunjuk benda-benda ini di tasmu.',
      table: [
        ['Inggris', 'Indonesia'],
        ['pencil', 'pensil'],
        ['pen', 'pulpen'],
        ['book', 'buku'],
        ['eraser', 'penghapus'],
        ['ruler', 'penggaris'],
        ['bag', 'tas'],
      ],
    },
    {
      heading: 'This dan these',
      body: '"This is" untuk satu benda. "These are" untuk lebih dari satu benda (ingat -s!).',
      examples: [
        { en: 'This is my pencil.', id: 'Ini pensilku.' },
        { en: 'These are my books.', id: 'Ini buku-bukuku.' },
      ],
    },
    {
      heading: 'Meminjam dengan sopan',
      body: 'Untuk meminjam, pakai "Can I borrow your ...?" lalu jangan lupa "Thank you!".',
      examples: [
        { en: 'Can I borrow your eraser, please?', id: 'Boleh aku pinjam penghapusmu?' },
        { en: 'Sure. Here you are.', id: 'Boleh. Ini.' },
      ],
    },
  ],
  demo: [
    ['These are my books.', 'This are my books.', 'Untuk banyak benda: These are.'],
    ['This is my bag.', 'This my bag.', 'Jangan lupa "is": This is ...'],
    ['Can I borrow your ruler, please?', 'Give me your ruler.', 'Meminjam dengan sopan: Can I borrow ..., please?'],
  ],
  guided: [
    match(1, 'Pasangkan dengan artinya.', [
      ['pencil', 'pensil'],
      ['eraser', 'penghapus'],
      ['ruler', 'penggaris'],
      ['bag', 'tas'],
    ], 'Benda di sekolah.'),
    mc(1, 'Pilih yang benar.', '___ my books.', [
      ['These are', true],
      ['This is', '"books" lebih dari satu, jadi These are.'],
      ['This are', '"This" untuk satu benda dan memakai "is".'],
    ], 'Banyak benda: These are.'),
    mc(1, 'Cara meminjam yang sopan:', null, [
      ['Can I borrow your pen, please?', true],
      ['Give me your pen!', 'Terdengar seperti perintah, kurang sopan.'],
      ['Your pen, borrow.', 'Urutan katanya tidak benar.'],
    ], 'Can I borrow your ..., please?'),
    tf(1, '"book" artinya buku.', true, 'book = buku.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, '___ is my eraser.', ['This'], 'Satu benda: This is.', { These: ['Satu benda: This.'] }),
    arrange(1, 'Ini tasku.', 'This is my bag', ['are'], 'This is my + benda.'),
    tr(1, 'Boleh aku pinjam pensilmu?', ['Can I borrow your pencil?', 'Can I borrow your pencil, please?', 'May I borrow your pencil?', 'May I borrow your pencil, please?'], 'Can I borrow your + benda?'),
    fix(1, 'This are my pencils.', ['These are my pencils.'], 'Banyak benda: These are.', { 'This are my pencils.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    construct(1, 'these / are / my / rulers', ['These are my rulers.'], 'These are + benda dengan -s.'),
    spot(1, 'Can I borrow you pen, please?', 'you', 'your', 'Milik kamu: your pen.'),
    mc(1, 'Temanmu meminjamkan penghapus. Apa yang kamu katakan?', null, [
      ['Thank you!', true],
      ['Here you are.', 'Itu diucapkan orang yang memberi.'],
      ['Sorry.', 'Tidak ada yang perlu dimaafkan; ucapkan terima kasih.'],
    ], 'Setelah dipinjami, ucapkan Thank you!'),
  ],
  mastery: [
    tr(2, 'Ini buku-bukuku.', ['These are my books.'], 'These are + benda dengan -s.', { 'This is my books.': ['Banyak benda: These are.'] }),
    arrange(2, 'Boleh aku pinjam penggarismu?', 'Can I borrow your ruler', ['you', 'give'], 'Can I borrow your + benda?'),
    fix(2, 'This my pen.', ['This is my pen.'], 'Jangan lupa is: This is my pen.', { 'This my pen.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const kidsRoutine = lesson({
  id: 'kids-routine',
  title: 'Kegiatanku Setiap Hari',
  summary: 'Menceritakan kegiatan pagi sampai malam: I wake up at six. I brush my teeth.',
  topic: 'kids.routine',
  objectives: [
    'Menyebut kegiatan sehari-hari dalam bahasa Inggris.',
    'Menyebut jam dengan "at": I wake up at six.',
    'Menceritakan urutan kegiatan dengan first, then.',
  ],
  intro: 'Setiap hari kita bangun, mandi, sarapan, lalu berangkat sekolah. Hari ini kita belajar menceritakan kegiatan itu dalam bahasa Inggris, lengkap dengan jamnya.',
  teaching: [
    {
      heading: 'Kegiatan sehari-hari',
      body: 'Ini kegiatan yang kita lakukan hampir setiap hari.',
      table: [
        ['Inggris', 'Indonesia'],
        ['wake up', 'bangun tidur'],
        ['take a bath', 'mandi'],
        ['brush my teeth', 'menggosok gigi'],
        ['eat breakfast', 'sarapan'],
        ['go to school', 'berangkat sekolah'],
        ['go to bed', 'pergi tidur'],
      ],
    },
    {
      heading: 'Jam: pakai "at"',
      body: 'Untuk jam, pakai "at": at six (pukul enam), at seven (pukul tujuh).',
      examples: [
        { en: 'I wake up at six.', id: 'Aku bangun pukul enam.' },
        { en: 'I go to school at seven.', id: 'Aku berangkat sekolah pukul tujuh.' },
      ],
    },
    {
      heading: 'Urutan: first, then',
      body: '"First" untuk yang pertama, "then" untuk berikutnya.',
      examples: [
        { en: 'First, I take a bath. Then, I eat breakfast.', id: 'Pertama, aku mandi. Lalu, aku sarapan.' },
      ],
    },
  ],
  demo: [
    ['I wake up at six.', 'I wake up in six.', 'Untuk jam, pakai at.'],
    ['I brush my teeth.', 'I brush my tooth.', 'Gigi kita banyak: teeth.'],
    ['I go to bed at nine.', 'I go to the bed at nine.', 'Ungkapan tetapnya "go to bed" tanpa the.'],
  ],
  guided: [
    match(1, 'Pasangkan kegiatan dengan artinya.', [
      ['wake up', 'bangun tidur'],
      ['take a bath', 'mandi'],
      ['eat breakfast', 'sarapan'],
      ['go to bed', 'pergi tidur'],
    ], 'Kegiatan sehari-hari.'),
    mc(1, 'Pilih yang benar.', 'I go to school ___ seven.', [
      ['at', true],
      ['in', 'Untuk jam, pakai at.'],
      ['on', '"on" untuk hari (on Monday), bukan jam.'],
    ], 'Jam: at.'),
    mc(1, 'Mana yang benar?', null, [
      ['I brush my teeth.', true],
      ['I brush my tooth.', 'Kita menggosok banyak gigi: teeth.'],
      ['I brushing my teeth.', 'Pakai brush, bukan brushing.'],
    ], 'brush my teeth.'),
    tf(1, '"go to bed" artinya pergi tidur.', true, 'go to bed = pergi tidur.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(1, 'I wake up ___ six.', ['at'], 'Untuk jam, pakai at.', { in: ['Untuk jam, pakai at.'], on: ['Untuk jam, pakai at.'] }),
    arrange(1, 'Aku sarapan pukul enam tiga puluh.', 'I eat breakfast at six thirty', ['in', 'on'], 'Kegiatan + at + jam.'),
    tr(1, 'Aku menggosok gigi.', ['I brush my teeth.'], 'brush my teeth.', { 'I brush my tooth.': ['Gigi banyak: teeth.'] }),
    fix(1, 'I go to the bed at nine.', ['I go to bed at nine.'], '"go to bed" tanpa the.', { 'I go to the bed at nine.': ['Kalimatnya belum diubah.'] }),
  ],
  homework: [
    construct(1, 'first / I / take a bath', ['First, I take a bath.', 'First I take a bath.'], 'First, + kegiatan.'),
    spot(1, 'Then, I goes to school.', 'goes', 'go', 'Untuk I, pakai go.'),
    mc(1, 'Apa arti "I go to school at seven"?', null, [
      ['Aku berangkat sekolah pukul tujuh.', true],
      ['Aku pulang sekolah pukul tujuh.', '"go to school" = berangkat ke sekolah.'],
      ['Aku tidur pukul tujuh.', 'Tidur adalah "go to bed".'],
    ], 'go to school = berangkat ke sekolah.'),
  ],
  mastery: [
    tr(2, 'Pertama, aku mandi. Lalu, aku sarapan.', ['First, I take a bath. Then, I eat breakfast.', 'First, I take a bath. Then I eat breakfast.', 'First, I take a shower. Then, I eat breakfast.', 'First I take a bath. Then I eat breakfast.', 'First, I take a bath. Then, I have breakfast.'], 'First, ... Then, ...'),
    arrange(2, 'Aku pergi tidur pukul sembilan.', 'I go to bed at nine', ['the', 'in'], 'go to bed + at + jam.'),
    fix(2, 'I wake up in six and brush my tooth.', ['I wake up at six and brush my teeth.'], 'Dua perbaikan: at six, dan teeth.', { 'I wake up in six and brush my tooth.': ['Kalimatnya belum diubah.'], 'I wake up at six and brush my tooth.': ['Gigi banyak: teeth.'], 'I wake up in six and brush my teeth.': ['Untuk jam, pakai at.'] }),
  ],
});
