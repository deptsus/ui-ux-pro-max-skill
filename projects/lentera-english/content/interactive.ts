// Rilis 15 "Pelajaran Interaktif": picture, scene, timeline and spelling items
// added to existing lessons (appended after each stage's items). Free lessons
// get them too, so every learner meets the new kinds of practice.
import type { Stage } from '@/lib/content/types';
import { picture, scene, spell, timeline, type Draft } from './dsl';

const notThis = (en: string, id: string) => `Itu "${en}" (${id}).`;

export const INTERACTIVE: Record<string, Partial<Record<Stage, Draft[]>>> = {
  // ───────────── Jalur Anak ─────────────
  'kids-colors-animals': {
    guided: [
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'cat', [['cat', 'kucing', true], ['dog', 'anjing', notThis('dog', 'anjing')], ['bird', 'burung', notThis('bird', 'burung')], ['fish', 'ikan', notThis('fish', 'ikan')]], '"Cat" artinya kucing.'),
      picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['elephant', 'gajah', true], ['rabbit', 'kelinci', notThis('rabbit', 'kelinci')], ['cow', 'sapi', notThis('cow', 'sapi')], ['chicken', 'ayam', notThis('chicken', 'ayam')]], '"Elephant" artinya gajah.', { audioText: 'elephant' }),
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'duck', [['duck', 'bebek', true], ['chicken', 'ayam', notThis('chicken', 'ayam')], ['bird', 'burung', notThis('bird', 'burung')], ['frog', 'katak', notThis('frog', 'katak')]], '"Duck" artinya bebek.'),
      picture(1, 'Ketuk warna yang disebutkan.', 'blue', [['blue', 'biru', true], ['red', 'merah', notThis('red', 'merah')], ['green', 'hijau', notThis('green', 'hijau')], ['yellow', 'kuning', notThis('yellow', 'kuning')]], '"Blue" artinya biru.'),
    ],
    independent: [
      spell(1, 'cat', '"Cat" dieja c-a-t.', { pic: 'cat' }),
      spell(1, 'red', '"Red" dieja r-e-d.', { pic: 'red' }),
    ],
    mastery: [
      spell(1, 'dog', '"Dog" dieja d-o-g.', { pic: 'dog' }),
      scene(1, 'The cat is on the bed. Letakkan kucingnya.', 'bed', 'cat', [['on', 'di atas tempat tidur', true], ['under', 'di bawah tempat tidur', '"Under" berarti di bawah. "On" berarti di atas.'], ['next', 'di samping tempat tidur', '"Next to" berarti di samping.']], '"On the bed" artinya di atas tempat tidur.'),
      picture(1, 'Ketuk warna yang disebutkan.', 'green', [['green', 'hijau', true], ['purple', 'ungu', notThis('purple', 'ungu')], ['brown', 'cokelat', notThis('brown', 'cokelat')], ['pink', 'merah muda', notThis('pink', 'merah muda')]], '"Green" artinya hijau.'),
    ],
  },
  'kids-food': {
    guided: [
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'banana', [['banana', 'pisang', true], ['mango', 'mangga', notThis('mango', 'mangga')], ['apple', 'apel', notThis('apple', 'apel')], ['orange', 'jeruk', notThis('orange', 'jeruk')]], '"Banana" artinya pisang.'),
      picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['rice', 'nasi', true], ['bread', 'roti', notThis('bread', 'roti')], ['noodles', 'mi', notThis('noodles', 'mi')], ['cake', 'kue', notThis('cake', 'kue')]], '"Rice" artinya nasi.', { audioText: 'rice' }),
    ],
    independent: [
      spell(1, 'egg', '"Egg" dieja e-g-g.', { pic: 'egg' }),
      spell(1, 'milk', '"Milk" dieja m-i-l-k.', { pic: 'milk' }),
      spell(1, 'tea', '"Tea" dieja t-e-a.', { pic: 'tea' }),
    ],
    mastery: [
      picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['strawberry', 'stroberi', true], ['grape', 'anggur', notThis('grape', 'anggur')], ['pineapple', 'nanas', notThis('pineapple', 'nanas')], ['apple', 'apel', notThis('apple', 'apel')]], '"Strawberry" artinya stroberi.', { audioText: 'strawberry' }),
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'water', [['water', 'air', true], ['milk', 'susu', notThis('milk', 'susu')], ['watermelon', 'semangka', notThis('watermelon', 'semangka')], ['egg', 'telur', notThis('egg', 'telur')]], '"Water" artinya air.'),
    ],
  },
  'kids-school': {
    guided: [
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'pencil', [['pencil', 'pensil', true], ['pen', 'pena', '"Pen" itu pena. Pensil adalah "pencil".'], ['ruler', 'penggaris', notThis('ruler', 'penggaris')], ['eraser', 'penghapus', notThis('eraser', 'penghapus')]], '"Pencil" artinya pensil.'),
      picture(1, 'Dengarkan kata ini, lalu ketuk gambarnya.', null, [['bag', 'tas', true], ['book', 'buku', notThis('book', 'buku')], ['clock', 'jam dinding', notThis('clock', 'jam dinding')], ['chair', 'kursi', notThis('chair', 'kursi')]], '"Bag" artinya tas.', { audioText: 'bag' }),
    ],
    independent: [
      scene(1, 'The book is on the table. Letakkan bukunya.', 'table', 'book', [['on', 'di atas meja', true], ['under', 'di bawah meja', '"Under" berarti di bawah. "On" berarti di atas.'], ['next', 'di samping meja', '"Next to" berarti di samping.']], '"On the table" artinya di atas meja.'),
      spell(1, 'pen', '"Pen" dieja p-e-n.', { pic: 'pen' }),
    ],
    mastery: [
      scene(1, 'The ball is under the chair. Letakkan bolanya.', 'chair', 'ball', [['under', 'di bawah kursi', true], ['on', 'di atas kursi', '"On" berarti di atas. "Under" berarti di bawah.'], ['behind', 'di belakang kursi', '"Behind" berarti di belakang.']], '"Under the chair" artinya di bawah kursi.'),
    ],
  },
  'kids-numbers-toys': {
    guided: [
      picture(1, 'Dengarkan angkanya, lalu ketuk gambarnya.', null, [['five', 'lima', true], ['four', 'empat', notThis('four', 'empat')], ['nine', 'sembilan', notThis('nine', 'sembilan')], ['two', 'dua', notThis('two', 'dua')]], '"Five" artinya lima.', { audioText: 'five' }),
      picture(1, 'Ketuk gambar yang sesuai dengan kata ini.', 'ball', [['ball', 'bola', true], ['box', 'kotak', notThis('box', 'kotak')], ['hat', 'topi', notThis('hat', 'topi')], ['shoes', 'sepatu', notThis('shoes', 'sepatu')]], '"Ball" artinya bola.'),
    ],
    independent: [
      spell(1, 'box', '"Box" dieja b-o-x.', { pic: 'box' }),
      spell(1, 'ten', '"Ten" dieja t-e-n.', { pic: 'ten' }),
    ],
    mastery: [
      scene(1, 'The ball is in the box. Letakkan bolanya.', 'box', 'ball', [['in', 'di dalam kotak', true], ['on', 'di atas kotak', '"On" berarti di atas. "In" berarti di dalam.'], ['next', 'di samping kotak', '"Next to" berarti di samping.']], '"In the box" artinya di dalam kotak.'),
    ],
  },
  'kids-family': {
    independent: [
      spell(1, 'mom', '"Mom" dieja m-o-m. Ini panggilan akrab untuk ibu.', { meaning: 'ibu (panggilan akrab)' }),
    ],
  },
  'kids-routine': {
    guided: [
      timeline(1, 'I brush my teeth every morning.', [['always', 'kebiasaan, setiap hari', true], ['now', 'sedang sekarang', '"Every morning" menunjukkan kebiasaan, bukan yang sedang terjadi sekarang.'], ['future', 'nanti', 'Tidak ada tanda waktu nanti seperti "tomorrow".']], '"Every morning" berarti setiap pagi: sebuah kebiasaan.'),
    ],
    mastery: [
      timeline(1, 'I am eating breakfast now.', [['now', 'sedang sekarang', true], ['always', 'kebiasaan, setiap hari', '"Am eating ... now" artinya sedang terjadi saat ini, bukan kebiasaan.'], ['past', 'sudah lewat', 'Tidak ada tanda waktu lampau seperti "yesterday".']], '"Am eating" dan "now" berarti sedang terjadi saat ini.'),
    ],
  },

  // ───────────── A1 (gratis) ─────────────
  'a1-articles': {
    guided: [
      picture(1, 'Ketuk gambar yang sesuai.', 'an orange', [['orange', 'jeruk', true], ['banana', 'pisang', 'Pisang adalah "a banana".'], ['book', 'buku', 'Buku adalah "a book".'], ['ball', 'bola', 'Bola adalah "a ball".']], '"An" dipakai sebelum bunyi vokal: an orange.'),
    ],
    mastery: [
      picture(1, 'Ketuk gambar yang sesuai.', 'an umbrella', [['umbrella', 'payung', true], ['bag', 'tas', 'Tas adalah "a bag".'], ['hat', 'topi', 'Topi adalah "a hat".'], ['phone', 'ponsel', 'Ponsel adalah "a phone".']], '"Umbrella" diawali bunyi vokal, jadi "an umbrella".'),
    ],
  },
  'a1-demonstratives': {
    guided: [
      picture(1, 'Ketuk gambar yang sesuai.', 'This is a clock.', [['clock', 'jam dinding', true], ['lamp', 'lampu', notThis('lamp', 'lampu')], ['window', 'jendela', notThis('window', 'jendela')], ['door', 'pintu', notThis('door', 'pintu')]], '"This is a clock" artinya ini sebuah jam dinding.'),
    ],
  },
  'a1-simple-present': {
    guided: [
      timeline(1, 'She drinks milk every day.', [['always', 'kebiasaan, setiap hari', true], ['now', 'sedang sekarang', '"Every day" menunjukkan kebiasaan. Yang sedang terjadi memakai "is drinking".'], ['past', 'sudah lewat', 'Kalimat lampau memakai "drank".']], 'Simple present ("drinks") + "every day" = kebiasaan.'),
    ],
    independent: [
      timeline(2, 'We play football on Sundays.', [['always', 'kebiasaan, setiap Minggu', true], ['future', 'nanti, sekali saja', '"On Sundays" (jamak) berarti setiap hari Minggu, sebuah kebiasaan.'], ['now', 'sedang sekarang', 'Tidak ada "now" dan kata kerjanya bukan bentuk -ing.']], '"On Sundays" berarti setiap hari Minggu: kebiasaan.'),
    ],
  },

  // ───────────── A1–A2 (Premium) ─────────────
  'a1-there-is': {
    guided: [
      scene(1, 'There is a cat under the table. Letakkan kucingnya.', 'table', 'cat', [['under', 'di bawah meja', true], ['on', 'di atas meja', '"On" berarti di atas. "Under" berarti di bawah.'], ['next', 'di samping meja', '"Next to" berarti di samping.']], '"Under the table" artinya di bawah meja.'),
    ],
    independent: [
      scene(1, 'There is a book on the chair. Letakkan bukunya.', 'chair', 'book', [['on', 'di atas kursi', true], ['under', 'di bawah kursi', '"Under" berarti di bawah.'], ['next', 'di samping kursi', '"Next to" berarti di samping.']], '"On the chair" artinya di atas kursi.'),
    ],
    mastery: [
      scene(2, 'There is a bag behind the box. Letakkan tasnya.', 'box', 'bag', [['behind', 'di belakang kotak', true], ['in', 'di dalam kotak', '"In" berarti di dalam.'], ['front', 'di depan kotak', '"In front of" berarti di depan. "Behind" kebalikannya.']], '"Behind the box" artinya di belakang kotak.'),
    ],
  },
  'a2-past-be': {
    guided: [
      timeline(1, 'I was at home yesterday.', [['past', 'sudah lewat', true], ['now', 'sedang sekarang', '"Was" dan "yesterday" menunjukkan waktu lampau.'], ['future', 'nanti', 'Rencana nanti memakai "will" atau "going to".']], '"Was" + "yesterday" = waktu lampau.'),
    ],
  },
  'a2-past-regular': {
    independent: [
      timeline(1, 'We visited Bali last year.', [['past', 'sudah lewat', true], ['always', 'kebiasaan', '"Visited" (-ed) dan "last year" menunjukkan kejadian lampau, bukan kebiasaan.'], ['future', 'nanti', '"Last year" berarti tahun lalu.']], '"Visited" + "last year" = waktu lampau.'),
    ],
  },
  'a2-present-continuous': {
    guided: [
      timeline(1, 'She is reading a book now.', [['now', 'sedang sekarang', true], ['always', 'kebiasaan', '"Is reading ... now" berarti sedang terjadi, bukan kebiasaan.'], ['past', 'sudah lewat', 'Kalimat lampau memakai "was reading" atau "read".']], 'Present continuous ("is reading") + "now" = sedang terjadi.'),
    ],
  },
  'a2-future': {
    guided: [
      timeline(1, 'I will call you tomorrow.', [['future', 'nanti', true], ['past', 'sudah lewat', '"Will" dan "tomorrow" menunjukkan waktu yang akan datang.'], ['now', 'sedang sekarang', 'Yang sedang terjadi memakai "am calling".']], '"Will" + "tomorrow" = waktu yang akan datang.'),
    ],
  },
  'a2-past-continuous': {
    independent: [
      timeline(2, 'I was watching TV at eight last night.', [['past', 'sudah lewat', true], ['now', 'sedang sekarang', '"Was watching" menunjukkan sedang terjadi di masa lalu, bukan sekarang.'], ['always', 'kebiasaan', '"Last night" menunjuk satu waktu tertentu yang sudah lewat.']], 'Past continuous ("was watching") = sedang terjadi pada satu saat di masa lalu.'),
    ],
  },
  'a2-frequency': {
    guided: [
      timeline(1, 'He always walks to school.', [['always', 'kebiasaan', true], ['now', 'sedang sekarang', '"Always" menunjukkan kebiasaan, bukan yang sedang terjadi.'], ['future', 'nanti', 'Tidak ada tanda waktu nanti.']], '"Always" + simple present = kebiasaan.'),
    ],
  },
};
