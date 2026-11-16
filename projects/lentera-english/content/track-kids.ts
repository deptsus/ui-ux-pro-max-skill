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
