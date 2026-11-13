// Listening items, placement test and the pronunciation guide.
import type { Phoneme } from '@/lib/content/types';
import { listen, mc, type Draft } from './dsl';

export interface ListeningDraft {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  title: string;
  kind: 'sentence' | 'word' | 'passage';
  transcript: string;
  translation: string;
  premium: boolean;
  questions: Draft[];
}

const P1 = 'Hello. My name is Anna, and I am from Canada. I am a teacher. I live in Jakarta with my family.';
const P2 = 'Yesterday was a busy day. I got up at six and took the bus to work. In the afternoon I had a meeting, and in the evening I cooked dinner for my friends. We ate together and watched a film.';
const P3 = 'Attention, please. The 10:15 train to Yogyakarta has been delayed by thirty minutes because of heavy rain. It will now leave from platform four, not platform two. We apologise for the inconvenience.';

export const listening: ListeningDraft[] = [
  {
    id: 'listen-ship-sheep', level: 'A1', title: 'Bunyi pendek dan panjang: ship / sheep', kind: 'word', transcript: 'sheep', translation: 'domba', premium: false,
    questions: [
      listen(1, 'sheep', 'Kata mana yang kamu dengar?', [
        ['sheep', true],
        ['ship', '"ship" /ʃɪp/ memakai bunyi i pendek. Yang diucapkan memakai bunyi panjang /iː/: sheep.', 'short-long-i'],
      ], '"sheep" /ʃiːp/ memakai vokal panjang /iː/, sedangkan "ship" /ʃɪp/ memakai vokal pendek /ɪ/.', { topic: 'skill.listening', focus: 'short-long-i' }),
      listen(1, 'ship', 'Kata mana yang kamu dengar?', [
        ['ship', true],
        ['sheep', '"sheep" memakai vokal panjang /iː/. Yang diucapkan pendek: ship.', 'short-long-i'],
      ], '"ship" /ʃɪp/ memakai vokal pendek /ɪ/.', { topic: 'skill.listening', focus: 'short-long-i' }),
    ],
  },
  {
    id: 'listen-thirteen-thirty', level: 'A1', title: 'Angka yang mirip: thirteen / thirty', kind: 'word', transcript: 'thirty', translation: 'tiga puluh', premium: false,
    questions: [
      listen(1, 'thirty', 'Angka mana yang kamu dengar?', [
        ['30', true],
        ['13', '"thirteen" bertekanan di suku kata akhir (thir-TEEN). Yang diucapkan bertekanan di depan: THIR-ty.'],
      ], '"thirty" bertekanan di suku kata pertama dan berakhir dengan bunyi /i/ pendek.', { topic: 'skill.listening' }),
      listen(2, 'The bus leaves at four fifteen.', 'Pukul berapa bus berangkat?', [
        ['4.15', true],
        ['4.50', '"fifty" bertekanan di depan (FIF-ty). Yang diucapkan "fifteen" (fif-TEEN).'],
        ['5.15', 'Jamnya "four", bukan "five".'],
      ], '"four fifteen" = 4.15.', { topic: 'skill.listening' }),
    ],
  },
  {
    id: 'listen-anna', level: 'A1', title: 'Perkenalan Anna', kind: 'passage', transcript: P1, translation: 'Halo. Nama saya Anna, dan saya dari Kanada. Saya seorang guru. Saya tinggal di Jakarta bersama keluarga saya.', premium: false,
    questions: [
      listen(1, P1, 'Where is Anna from?', [
        ['Canada', true],
        ['Jakarta', 'Jakarta adalah tempat tinggalnya sekarang ("I live in Jakarta"), bukan asalnya.'],
        ['England', 'Anna berkata "I am from Canada".'],
      ], 'Anna berkata: "I am from Canada."', { topic: 'skill.listening' }),
      listen(1, P1, 'What is Anna\'s job?', [
        ['She is a teacher.', true],
        ['She is a student.', 'Anna berkata "I am a teacher".'],
        ['She is a doctor.', 'Anna berkata "I am a teacher".'],
      ], 'Anna berkata: "I am a teacher."', { topic: 'skill.listening' }),
    ],
  },
  {
    id: 'listen-works', level: 'A1', title: 'Menangkap akhiran -s', kind: 'sentence', transcript: 'She works in a hospital.', translation: 'Dia bekerja di sebuah rumah sakit.', premium: false,
    questions: [
      listen(2, 'She works in a hospital.', 'Kalimat mana yang kamu dengar?', [
        ['She works in a hospital.', true],
        ['She work in a hospital.', 'Dengarkan bunyi /s/ di akhir "works". Subjek "she" selalu diikuti kata kerja ber-s.', 'third-person-s'],
        ['She walks in a hospital.', '"walks" /wɔːks/ dan "works" /wɜːks/ berbeda bunyi vokalnya.'],
      ], 'Bunyi /s/ di akhir "works" pendek tetapi penting: itulah penanda subjek he/she/it.', { topic: 'skill.listening' }),
    ],
  },
  {
    id: 'listen-yesterday', level: 'A2', title: 'Cerita tentang kemarin', kind: 'passage', transcript: P2, translation: 'Kemarin hari yang sibuk. Saya bangun pukul enam dan naik bus ke tempat kerja. Siangnya saya rapat, dan malamnya saya memasak makan malam untuk teman-teman. Kami makan bersama dan menonton film.', premium: true,
    questions: [
      listen(2, P2, 'How did the speaker go to work?', [
        ['By bus', true],
        ['By train', 'Pembicara berkata "took the bus to work".'],
        ['On foot', 'Pembicara berkata "took the bus to work".'],
      ], '"took the bus" = naik bus.', { topic: 'skill.listening' }),
      listen(3, P2, 'What did the speaker do in the evening?', [
        ['Cooked dinner for friends', true],
        ['Had a meeting', 'Rapatnya "in the afternoon", bukan malam hari.'],
        ['Went to the cinema', 'Mereka menonton film, tetapi teks tidak menyebut bioskop: mereka makan bersama lalu menonton.'],
      ], '"in the evening I cooked dinner for my friends".', { topic: 'skill.listening' }),
    ],
  },
  {
    id: 'listen-announcement', level: 'B1', title: 'Pengumuman di stasiun', kind: 'passage', transcript: P3, translation: 'Mohon perhatian. Kereta pukul 10.15 tujuan Yogyakarta tertunda tiga puluh menit karena hujan deras. Kereta kini berangkat dari peron empat, bukan peron dua. Kami mohon maaf atas ketidaknyamanan ini.', premium: true,
    questions: [
      listen(3, P3, 'Why has the train been delayed?', [
        ['Because of heavy rain', true],
        ['Because of a technical problem', 'Pengumuman menyebut "because of heavy rain".'],
        ['Because the platform changed', 'Peron berubah, tetapi itu bukan penyebab keterlambatan.'],
      ], '"delayed ... because of heavy rain".', { topic: 'skill.listening' }),
      listen(3, P3, 'Which platform will the train leave from?', [
        ['Platform four', true],
        ['Platform two', 'Peron dua adalah peron semula: "platform four, not platform two".'],
        ['Platform ten', 'Angka "ten" hanya muncul pada jam keberangkatan (10:15).'],
      ], '"It will now leave from platform four, not platform two."', { topic: 'skill.listening' }),
    ],
  },
];

export const phonemes: Phoneme[] = [
  { id: 'th-voiceless', ipa: '/θ/', label: 'th tak bersuara', examples: [{ word: 'think', ipa: '/θɪŋk/' }, { word: 'three', ipa: '/θriː/' }, { word: 'bath', ipa: '/bɑːθ/' }], howTo: 'Letakkan ujung lidah di antara gigi atas dan gigi bawah, lalu embuskan udara tanpa menggetarkan pita suara.', commonError: 'Sering diganti /t/ ("tink") atau /s/ ("sink"). Pastikan ujung lidah benar-benar terlihat di antara gigi.', mouth: { lips: 'neutral', tongue: 'dental', voiced: false } },
  { id: 'th-voiced', ipa: '/ð/', label: 'th bersuara', examples: [{ word: 'this', ipa: '/ðɪs/' }, { word: 'mother', ipa: '/ˈmʌðə/' }, { word: 'they', ipa: '/ðeɪ/' }], howTo: 'Posisi lidah sama dengan /θ/, tetapi getarkan pita suara. Letakkan jari di leher: harus terasa getaran.', commonError: 'Sering diganti /d/ ("dis"). Lidah harus menyentuh gigi, bukan gusi.', mouth: { lips: 'neutral', tongue: 'dental', voiced: true } },
  { id: 'v', ipa: '/v/', label: 'v bersuara', examples: [{ word: 'very', ipa: '/ˈveri/' }, { word: 'live', ipa: '/lɪv/' }, { word: 'seven', ipa: '/ˈsevn/' }], howTo: 'Sentuhkan gigi atas ke bibir bawah, lalu embuskan udara sambil menggetarkan pita suara.', commonError: 'Sering diucapkan seperti /f/ ("fery") karena huruf v dalam bahasa Indonesia dibaca /f/.', mouth: { lips: 'teeth-lip', tongue: 'alveolar', voiced: true } },
  { id: 'z', ipa: '/z/', label: 'z bersuara', examples: [{ word: 'zoo', ipa: '/zuː/' }, { word: 'busy', ipa: '/ˈbɪzi/' }, { word: 'is', ipa: '/ɪz/' }], howTo: 'Posisi lidah sama dengan /s/ (dekat gusi atas), tetapi getarkan pita suara seperti dengung lebah.', commonError: 'Sering diganti /s/ ("iss") atau /dʒ/ ("joo"). Huruf s di akhir "is", "was", "does" dibaca /z/.', mouth: { lips: 'spread', tongue: 'alveolar', voiced: true } },
  { id: 'sh', ipa: '/ʃ/', label: 'sh', examples: [{ word: 'she', ipa: '/ʃiː/' }, { word: 'shop', ipa: '/ʃɒp/' }, { word: 'wash', ipa: '/wɒʃ/' }], howTo: 'Tarik lidah sedikit ke belakang gusi, bulatkan bibir, lalu embuskan udara seperti menyuruh diam: "sssh".', commonError: 'Sering diganti /s/ sehingga "she" terdengar seperti "see".', mouth: { lips: 'round', tongue: 'post-alveolar', voiced: false } },
  { id: 'ae', ipa: '/æ/', label: 'a seperti pada "cat"', examples: [{ word: 'cat', ipa: '/kæt/' }, { word: 'bad', ipa: '/bæd/' }, { word: 'apple', ipa: '/ˈæpl/' }], howTo: 'Buka mulut lebar, tarik sudut bibir ke samping, dan letakkan lidah rendah di depan. Bunyinya di antara "a" dan "e".', commonError: 'Sering diganti /e/ sehingga "bad" terdengar seperti "bed".', mouth: { lips: 'spread', tongue: 'low-front', voiced: true } },
  { id: 'ii', ipa: '/iː/ vs /ɪ/', label: 'i panjang dan i pendek', examples: [{ word: 'sheep', ipa: '/ʃiːp/' }, { word: 'ship', ipa: '/ʃɪp/' }, { word: 'leave', ipa: '/liːv/' }, { word: 'live', ipa: '/lɪv/' }], howTo: 'Untuk /iː/ tarik bibir seperti tersenyum dan tahan bunyinya. Untuk /ɪ/ kendurkan bibir dan ucapkan singkat.', commonError: 'Bahasa Indonesia tidak membedakan panjang vokal, sehingga "ship" dan "sheep" sering terdengar sama.', mouth: { lips: 'spread', tongue: 'high-front', voiced: true } },
  { id: 'r', ipa: '/r/', label: 'r bahasa Inggris', examples: [{ word: 'red', ipa: '/red/' }, { word: 'right', ipa: '/raɪt/' }, { word: 'very', ipa: '/ˈveri/' }], howTo: 'Lengkungkan ujung lidah ke belakang tanpa menyentuh langit-langit, dan bulatkan bibir sedikit. Lidah tidak bergetar.', commonError: 'R bahasa Indonesia digetarkan. R bahasa Inggris tidak digetarkan sama sekali.', mouth: { lips: 'round', tongue: 'retroflex', voiced: true } },
];

const lv = (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1', topic: string) => ({ level, topic });
export const placement: Draft[] = [
  mc(1, 'Pilih jawaban yang tepat.', 'She ___ a doctor.', [['is', true], ['am', '"am" hanya untuk "I".'], ['are', '"are" untuk you/we/they.'], ['be', 'Bentuk dasar "be" tidak dipakai setelah subjek.']], '"She" berpasangan dengan "is".', lv('A1', 'a1.to-be')),
  mc(1, 'Pilih jawaban yang tepat.', 'I have ___ umbrella.', [['an', true], ['a', '"umbrella" diawali bunyi vokal.'], ['the a', 'Dua artikel tidak dipakai bersamaan.'], ['some', '"some" untuk jamak atau benda tak terhitung.']], '"umbrella" diawali bunyi vokal: an.', lv('A1', 'a1.articles')),
  mc(1, 'Pilih jawaban yang tepat.', 'My brother ___ football every Sunday.', [['plays', true], ['play', '"My brother" = he, perlu -s.'], ['playing', 'Bentuk -ing tidak berdiri sendiri.'], ['is play', 'Simple present tidak memakai "is" + kata kerja dasar.']], 'Subjek tunggal orang ketiga: plays.', lv('A1', 'a1.simple-present')),
  mc(1, 'Pilih jawaban yang tepat.', '___ you like coffee?', [['Do', true], ['Does', '"Does" untuk he/she/it.'], ['Are', '"like" kata kerja biasa.'], ['Is', '"like" kata kerja biasa.']], '"You" memakai "Do".', lv('A1', 'a1.do-does')),
  mc(2, 'Pilih jawaban yang tepat.', 'We ___ at home last night.', [['were', true], ['was', '"We" memakai "were".'], ['are', '"last night" menandakan lampau.'], ['did', 'Keadaan memakai was/were.']], '"We" + were.', lv('A2', 'a2.past-be')),
  mc(2, 'Pilih jawaban yang tepat.', 'She ___ to Bali two years ago.', [['went', true], ['goes', '"two years ago" menandakan lampau.'], ['has gone', '"ago" mewajibkan simple past.'], ['gone', '"gone" butuh have/has.']], 'Simple past "went".', lv('A2', 'a2.past-irregular')),
  mc(2, 'Pilih jawaban yang tepat.', "I didn't ___ the film.", [['see', true], ['saw', 'Setelah "didn\'t": bentuk dasar.'], ['seen', 'Setelah "didn\'t": bentuk dasar.'], ['seeing', 'Setelah "didn\'t": bentuk dasar.']], "didn't + bentuk dasar.", lv('A2', 'a2.past-irregular')),
  mc(2, 'Pilih jawaban yang tepat.', 'This book is ___ than that one.', [['more interesting', true], ['interestinger', 'Kata sifat panjang memakai "more".'], ['most interesting', '"most" untuk superlatif.'], ['more interested', '"interested" = tertarik (perasaan orang).']], 'Perbandingan kata sifat panjang: more + kata sifat + than.', lv('A2', 'a2.past-regular')),
  mc(3, 'Pilih jawaban yang tepat.', 'I ___ here since 2019.', [['have lived', true], ['live', '"since" menuntut present perfect.'], ['lived', 'Masih berlangsung sampai sekarang.'], ['am living', '"since" menuntut present perfect.']], '"since" + present perfect.', lv('B1', 'b1.present-perfect')),
  mc(3, 'Pilih jawaban yang tepat.', 'If it rains tomorrow, we ___ at home.', [['will stay', true], ['stay', 'Akibat di masa depan memakai "will".'], ['would stay', '"would" untuk pengandaian tidak nyata.'], ['stayed', 'Bentuk lampau tidak cocok.']], 'First conditional: if + present, will + bentuk dasar.', lv('B1', 'b1.present-perfect')),
  mc(3, 'Pilih jawaban yang tepat.', "The man ___ lives next door is a pilot.", [['who', true], ['which', '"which" untuk benda.'], ['whose', '"whose" menyatakan kepemilikan.'], ['whom', '"whom" untuk objek.']], 'Relative pronoun untuk orang sebagai subjek: who.', lv('B1', 'b1.present-perfect')),
  mc(3, 'Pilih jawaban yang tepat.', 'She has worked here ___ five years.', [['for', true], ['since', '"since" + titik awal.'], ['during', '"during" + peristiwa, bukan lamanya waktu.'], ['from', '"from" butuh "to/until".']], '"for" + lamanya waktu.', lv('B1', 'b1.present-perfect')),
  mc(4, 'Pilih jawaban yang tepat.', 'The bridge ___ in 1998.', [['was built', true], ['built', 'Pasif butuh to be.'], ['has been built', 'Tahun spesifik mewajibkan simple past.'], ['was build', 'Perlu bentuk ketiga.']], 'Simple past pasif.', lv('B2', 'b2.passive')),
  mc(4, 'Pilih jawaban yang tepat.', 'If I ___ about the meeting, I would have come.', [['had known', true], ['knew', 'Pengandaian lampau memakai past perfect.'], ['would know', '"would" tidak dipakai di klausa if.'], ['have known', 'Perlu past perfect.']], 'Third conditional: if + past perfect.', lv('B2', 'b2.passive')),
  mc(4, 'Pilih jawaban yang tepat.', 'She said that she ___ tired.', [['was', true], ['is', 'Dalam kalimat tidak langsung lampau, tense mundur.'], ['were', '"she" + was.'], ['be', 'Bentuk dasar tidak cocok.']], 'Reported speech: is → was.', lv('B2', 'b2.passive')),
  mc(4, 'Pilih jawaban yang tepat.', "I'm having my car ___ tomorrow.", [['repaired', true], ['repair', 'Causative: have + objek + bentuk ketiga.'], ['repairing', 'Causative: have + objek + bentuk ketiga.'], ['to repair', 'Causative: have + objek + bentuk ketiga.']], 'Causative: have something done.', lv('B2', 'b2.passive')),
  mc(5, 'Pilih jawaban yang tepat.', 'Hardly ___ the house when it began to rain.', [['had we left', true], ['we had left', 'Setelah "Hardly" terjadi inversi.'], ['did we left', 'Setelah "did": bentuk dasar; di sini perlu past perfect.'], ['we left', 'Setelah "Hardly" terjadi inversi.']], 'Hardly + had + subjek + bentuk ketiga.', lv('C1', 'c1.inversion')),
  mc(5, 'Pilih jawaban yang tepat.', 'It is essential that he ___ present at the hearing.', [['be', true], ['is', 'Mandative subjunctive memakai bentuk dasar.'], ['will be', 'Mandative subjunctive memakai bentuk dasar.'], ['was', 'Mandative subjunctive memakai bentuk dasar.']], 'Subjunctive: bentuk dasar "be".', lv('C1', 'c1.inversion')),
  mc(5, 'Pilih kata yang paling tepat.', 'The results were, ___ limited in scope, highly promising.', [['albeit', true], ['despite', '"despite" diikuti kata benda, bukan kata sifat.'], ['however', '"however" tidak menyambung frasa sifat seperti ini.'], ['whereas', '"whereas" membandingkan dua klausa.']], '"albeit" + kata sifat = "walaupun".', lv('C1', 'c1.inversion')),
  mc(5, 'Pilih jawaban yang tepat.', 'Not only ___ the deadline, but they also exceeded the target.', [['did they meet', true], ['they met', '"Not only" di awal kalimat memicu inversi.'], ['did they met', 'Setelah "did": bentuk dasar.'], ['they did meet', '"Not only" di awal kalimat memicu inversi.']], 'Not only + did + subjek + bentuk dasar.', lv('C1', 'c1.inversion')),
];
