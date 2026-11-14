// A2 · Bab 3 dan 4 (Rilis 2) — kebiasaan, jumlah, latar cerita, aturan, saran, dan arah. Premium.
import { construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const frequencyLesson = lesson({
  id: 'a2-frequency',
  title: 'Seberapa Sering?',
  summary: 'Menyatakan seberapa sering sesuatu terjadi: always, usually, often, sometimes, rarely, never.',
  topic: 'a2.frequency',
  objectives: [
    'Memakai always, usually, often, sometimes, rarely, dan never sesuai tingkat seringnya.',
    'Menaruh kata keterangan frekuensi di tempat yang benar: sebelum kata kerja biasa, sesudah to be.',
    'Bertanya dan menjawab dengan "How often ...?".',
  ],
  intro: 'Dalam bahasa Indonesia, kata seperti "selalu" atau "kadang-kadang" bisa diletakkan cukup bebas. Bahasa Inggris lebih ketat: always, usually, often, dan never punya tempat tetap di kalimat, dan tempatnya bergantung pada kata kerjanya, apakah kata kerja biasa atau to be.',
  teaching: [
    {
      heading: 'Dari selalu sampai tidak pernah',
      body: 'Urutkan dari yang paling sering. Persentase hanya perkiraan untuk membantu mengingat.',
      table: [
        ['Kata', 'Arti', 'Kira-kira'],
        ['always', 'selalu', '100%'],
        ['usually', 'biasanya', '80%'],
        ['often', 'sering', '60%'],
        ['sometimes', 'kadang-kadang', '40%'],
        ['rarely', 'jarang', '10%'],
        ['never', 'tidak pernah', '0%'],
      ],
      examples: [
        { en: 'I always brush my teeth before bed.', id: 'Saya selalu menggosok gigi sebelum tidur.' },
        { en: 'We rarely eat at restaurants.', id: 'Kami jarang makan di restoran.' },
      ],
    },
    {
      heading: 'Posisi: sebelum kata kerja biasa, sesudah to be',
      body: 'Dengan kata kerja biasa, kata keterangan frekuensi berada di antara subjek dan kata kerja. Dengan to be (am/is/are/was/were), letaknya sesudah to be. "sometimes" dan "usually" juga boleh di awal kalimat (Sometimes I cook), tetapi always, never, dan rarely tidak.',
      table: [
        ['Jenis kalimat', 'Pola', 'Contoh'],
        ['Kata kerja biasa', 'subjek + always + kata kerja', 'She always walks to school.'],
        ['To be', 'subjek + am/is/are + always', 'She is always late.'],
        ['Negatif', "subjek + don't/doesn't + often + kata kerja", "He doesn't often cook."],
      ],
      examples: [
        { en: 'My brother is never hungry in the morning.', id: 'Kakak saya tidak pernah lapar di pagi hari.' },
        { en: 'They usually play football on Sundays.', id: 'Mereka biasanya bermain sepak bola hari Minggu.' },
      ],
    },
    {
      heading: 'How often ...? dan ungkapan waktu',
      body: '"How often ...?" menanyakan seberapa sering. Jawabannya bisa dengan kata keterangan frekuensi, atau dengan ungkapan seperti every day, once a week (sekali seminggu), dan twice a month (dua kali sebulan). Ungkapan ini biasanya di akhir kalimat. "never" sudah bermakna negatif, jadi jangan ditambah "don\'t".',
      examples: [
        { en: 'How often do you go to the gym? — Twice a week.', id: 'Seberapa sering kamu ke pusat kebugaran? — Dua kali seminggu.' },
        { en: 'I never drink coffee.', id: 'Saya tidak pernah minum kopi.' },
      ],
    },
  ],
  demo: [
    ['I always get up at six.', 'I get up always at six.', 'Dengan kata kerja biasa, "always" berada sebelum kata kerja: always get up.'],
    ['She is often tired after work.', 'She often is tired after work.', 'Dengan to be, kata keterangan frekuensi berada sesudahnya: is often tired.'],
    ['I never eat meat.', "I don't never eat meat.", '"never" sudah berarti tidak pernah. Jangan digabung dengan "don\'t".'],
  ],
  vocab: ['usually', 'often', 'rarely'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ['We usually have dinner at seven.', true],
      ['We have usually dinner at seven.', 'Kata keterangan frekuensi berada sebelum kata kerja utama: usually have.', 'freq-position'],
      ['We usual have dinner at seven.', '"usual" adalah kata sifat (biasa). Kata keterangannya "usually".'],
      ['We have dinner usually at seven.', 'Letakkan "usually" sebelum kata kerja: usually have.', 'freq-position'],
    ], 'Subjek + usually + kata kerja.', { focus: 'freq-position', hint: 'Cari kata kerjanya, lalu letakkan kata keterangan sebelumnya.' }),
    match(1, 'Pasangkan kata keterangan dengan artinya.', [
      ['always', 'selalu'],
      ['often', 'sering'],
      ['rarely', 'jarang'],
      ['never', 'tidak pernah'],
    ], 'always 100%, often sering, rarely jarang, never 0%.'),
    fill(1, 'Rina goes to the gym on Monday, Wednesday, and Friday. She ___ goes on Sunday. (0%)', ['never'], '0% berarti tidak pernah: never.', {
      rarely: ['"rarely" berarti jarang (sekitar 10%). 0% berarti tidak pernah: never.'],
      sometimes: ['"sometimes" berarti kadang-kadang. 0% berarti tidak pernah: never.'],
    }, { prompt: 'Tulis kata keterangan frekuensi yang sesuai dengan persentase dalam kurung.' }),
    tf(1, 'Kalimat "He is always busy." sudah benar.', true, 'Dengan to be, "always" berada sesudahnya: is always busy.', 'Kalimat ini benar: to be + always.', { focus: 'freq-position', tag: 'freq-position' }),
  ],
  independent: [
    construct(2, 'always / she / breakfast / has', ['She always has breakfast'], 'Subjek + always + kata kerja: She always has breakfast.', {
      'she has always breakfast': ['"always" sebelum kata kerja utama: always has.', 'freq-position'],
      'she always have breakfast': ['Subjek "she" butuh kata kerja ber-s: has.', 'third-person-s'],
    }, { focus: 'freq-position' }),
    tr(2, 'Ayah saya jarang menonton TV.', ['My father rarely watches TV', 'My dad rarely watches TV', 'My father rarely watches television', 'My dad rarely watches television'], 'Subjek + rarely + kata kerja ber-s.', {
      'my father watches rarely tv': ['"rarely" sebelum kata kerja: rarely watches.', 'freq-position'],
      'my father rarely watch tv': ['"My father" = he, jadi "watches".', 'third-person-s'],
    }, { focus: 'freq-position' }),
    fix(2, "I don't never eat breakfast.", ['I never eat breakfast', "I don't ever eat breakfast"], '"never" sudah negatif. Pakai "I never eat ..." atau "I don\'t ever eat ...".', undefined, { focus: 'freq-never' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: How often do you visit your grandparents?\nB: ___', [
      ['About twice a month.', true],
      ['Yes, I often.', '"How often" bukan pertanyaan ya/tidak. Jawab dengan seberapa sering: twice a month, every week, dan seterusnya.', 'freq-how-often'],
      ['I am often visit them.', 'Tidak memakai "am" dengan kata kerja biasa: I often visit them.', 'freq-position'],
      ['Two times a month ago.', '"ago" dipakai untuk waktu lampau. Untuk frekuensi: twice a month.', 'freq-how-often'],
    ], '"How often ...?" dijawab dengan ungkapan frekuensi seperti twice a month.', { focus: 'freq-how-often' }),
  ],
  homework: [
    read(2, 'Budi is a nurse. He usually works from Monday to Friday, but he sometimes works on Saturdays too. He always takes the train to the hospital because the roads are often busy. He is rarely late. On Sundays he never sets an alarm. He sleeps until nine and then plays badminton with his friends.', 'What does Budi do on Sundays?', [
      ['He sleeps late and plays badminton.', true],
      ['He works at the hospital.', 'Budi bekerja Senin sampai Jumat, kadang Sabtu. Hari Minggu tidak disebut.'],
      ['He takes the train to work.', 'Itu yang ia lakukan pada hari kerja.'],
      ['He sets an alarm at six.', 'Teks menyebut "On Sundays he never sets an alarm".'],
    ], '"On Sundays he never sets an alarm. He sleeps until nine and then plays badminton."'),
    construct(2, 'is / never / my sister / late', ['My sister is never late'], 'Dengan to be: is + never.', {
      'my sister never is late': ['Dengan to be, "never" berada sesudahnya: is never late.', 'freq-position'],
    }, { focus: 'freq-position' }),
    tr(2, 'Seberapa sering kamu berolahraga?', ['How often do you exercise', 'How often do you do exercise', 'How often do you work out', 'How often do you do sport', 'How often do you do sports'], 'How often + do + subjek + kata kerja?', {
      'how often you exercise': ['Pertanyaan dengan kata kerja biasa butuh "do": How often do you exercise?', 'freq-how-often'],
    }, { focus: 'freq-how-often' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['Our teacher is always patient.', true],
      ['Our teacher always is patient.', 'Dengan to be, "always" berada sesudahnya.', 'freq-position'],
      ['Our teacher is patient always.', '"always" tidak diletakkan di akhir kalimat.', 'freq-position'],
      ['Always our teacher patient.', 'Kalimat butuh to be: Our teacher is always patient.'],
    ], 'to be + always + kata sifat.', { focus: 'freq-position' }),
    fill(2, 'Siti ___ drinks coffee. She drinks it once a month. (rarely / often)', ['rarely'], 'Sebulan sekali itu jarang: rarely.', {
      often: ['"often" berarti sering. Sebulan sekali itu jarang: rarely.'],
    }, { prompt: 'Pilih kata yang tepat dari kurung dan tulis di bagian kosong.' }),
    tr(3, 'Kami tidak pernah makan daging babi.', ['We never eat pork'], 'We + never + eat + pork.', {
      "we don't never eat pork": ['"never" sudah negatif, jadi tanpa "don\'t".', 'freq-never'],
      'we never eats pork': ['Setelah "we", kata kerja tanpa -s: eat.'],
    }, { focus: 'freq-never' }),
    construct(3, 'often / they / are / busy / on Mondays', ['They are often busy on Mondays'], 'to be + often: are often busy.', {
      'they often are busy on mondays': ['Dengan to be, "often" sesudahnya: are often busy.', 'freq-position'],
    }, { focus: 'freq-position' }),
    fix(3, 'He goes sometimes to the library.', ['He sometimes goes to the library', 'Sometimes he goes to the library', 'He goes to the library sometimes'], '"sometimes" sebelum kata kerja, di awal kalimat, atau di akhir kalimat. Tidak di antara kata kerja dan tempat tujuannya.', undefined, { focus: 'freq-position' }),
  ],
});

export const countableLesson = lesson({
  id: 'a2-countable',
  title: 'Much, Many, Some, Any',
  summary: 'Membedakan benda yang bisa dan tidak bisa dihitung, lalu memilih much, many, some, any, dan a lot of.',
  topic: 'a2.countable',
  objectives: [
    'Mengenali kata benda yang bisa dihitung (apple, chair) dan yang tidak (water, money, information).',
    'Memakai many untuk benda terhitung dan much untuk benda tak terhitung, terutama di kalimat negatif dan pertanyaan.',
    'Memakai some di kalimat positif dan tawaran, any di kalimat negatif dan pertanyaan.',
  ],
  intro: 'Bahasa Indonesia memakai "banyak" untuk apa saja: banyak uang, banyak apel. Bahasa Inggris membedakan benda yang bisa dihitung satu per satu (two apples) dan yang tidak (water, rice, money, information). Pilihan many atau much, dan ada tidaknya bentuk jamak, bergantung pada perbedaan ini.',
  teaching: [
    {
      heading: 'Bisa dihitung atau tidak?',
      body: 'Benda terhitung punya bentuk jamak dan bisa diberi a/an. Benda tak terhitung tidak punya bentuk jamak dan tidak memakai a/an. Beberapa kata yang terasa bisa dihitung dalam bahasa Indonesia justru tak terhitung dalam bahasa Inggris: information, advice, furniture, luggage, homework, news.',
      table: [
        ['Terhitung', 'Tak terhitung'],
        ['an apple, two apples', 'water, milk, rice'],
        ['a chair, three chairs', 'furniture'],
        ['a suggestion, some suggestions', 'advice'],
        ['a fact, many facts', 'information'],
      ],
      examples: [
        { en: 'Can you give me some information?', id: 'Bisakah kamu memberi saya informasi?' },
        { en: 'She gave me a good piece of advice.', id: 'Dia memberi saya satu nasihat yang bagus.' },
      ],
    },
    {
      heading: 'Many, much, a lot of',
      body: '"many" untuk benda terhitung jamak, "much" untuk benda tak terhitung. "much" terutama dipakai di kalimat negatif dan pertanyaan; di kalimat positif biasanya dipakai "a lot of", yang cocok untuk keduanya. Untuk bertanya jumlah: How many + jamak? How much + tak terhitung? "How much" juga dipakai untuk harga.',
      table: [
        ['', 'Terhitung', 'Tak terhitung'],
        ['Pertanyaan', 'How many books?', 'How much money?'],
        ['Negatif', 'not many books', 'not much money'],
        ['Positif', 'a lot of books', 'a lot of money'],
      ],
      examples: [
        { en: "We don't have much time.", id: 'Kita tidak punya banyak waktu.' },
        { en: 'How many brothers do you have?', id: 'Kamu punya berapa saudara laki-laki?' },
      ],
    },
    {
      heading: 'Some dan any',
      body: '"some" untuk kalimat positif dan untuk menawarkan atau meminta (Would you like some tea?). "any" untuk kalimat negatif dan pertanyaan biasa. Keduanya bisa dipakai dengan benda terhitung jamak maupun tak terhitung.',
      examples: [
        { en: 'There is some milk in the fridge.', id: 'Ada sedikit susu di kulkas.' },
        { en: "I don't have any questions.", id: 'Saya tidak punya pertanyaan.' },
        { en: 'Are there any eggs?', id: 'Apakah ada telur?' },
      ],
    },
  ],
  demo: [
    ['I need some information.', 'I need some informations.', '"information" tak terhitung, jadi tidak diberi -s.'],
    ['How much money do you have?', 'How many money do you have?', '"money" tak terhitung, jadi How much.'],
    ["We don't have any bread.", "We don't have some bread.", 'Kalimat negatif biasanya memakai "any".'],
  ],
  vocab: ['information', 'advice', 'furniture'],
  guided: [
    mc(1, 'Pilih kata yang tepat.', 'How ___ students are in your class?', [
      ['many', true],
      ['much', '"students" bisa dihitung (jamak), jadi How many.', 'much-many'],
      ['lot', '"a lot of" tidak dipakai setelah "How".'],
      ['any', '"any" tidak dipakai setelah "How".'],
    ], 'How many + benda terhitung jamak.', { focus: 'much-many' }),
    match(1, 'Pasangkan kata benda dengan kelompoknya.', [
      ['chair', 'terhitung'],
      ['water', 'tak terhitung'],
      ['egg', 'terhitung'],
      ['advice', 'tak terhitung'],
    ], 'chair dan egg bisa dihitung; water dan advice tidak.'),
    fill(1, "There isn't ___ sugar in my tea. (some / any)", ['any'], 'Kalimat negatif → any.', {
      some: ['Kalimat negatif biasanya memakai "any".', 'some-any'],
    }, { focus: 'some-any', prompt: 'Pilih kata yang tepat dari kurung.' }),
    tf(1, 'Kalimat "She gave me many advices." sudah benar.', false, '"advice" tak terhitung: She gave me a lot of advice / some advice.', '"advice" tidak punya bentuk jamak dan tidak dipakai dengan "many".', { focus: 'uncountable-plural', tag: 'uncountable-plural' }),
  ],
  independent: [
    tr(2, 'Berapa harga tas ini?', ['How much is this bag', 'How much does this bag cost'], 'Untuk harga dipakai "How much".', {
      'how many is this bag': ['Untuk harga dipakai "How much".', 'much-many'],
      'how much this bag': ['Tambahkan "is": How much is this bag?'],
    }, { focus: 'much-many' }),
    fill(2, 'We need ___ furniture for the new office. (a / some)', ['some'], '"furniture" tak terhitung, jadi tidak memakai "a": some furniture.', {
      a: ['"furniture" tak terhitung, jadi tidak memakai a/an.', 'uncountable-plural'],
    }, { focus: 'uncountable-plural', prompt: 'Pilih kata yang tepat dari kurung.' }),
    fix(2, 'I have many homeworks tonight.', ['I have a lot of homework tonight', 'I have lots of homework tonight', "I've got a lot of homework tonight", 'I have much homework tonight'], '"homework" tak terhitung: a lot of homework, tanpa -s.', {
      'i have many homework tonight': ['"many" untuk benda terhitung. Pakai "a lot of".', 'much-many'],
      'i have a lot of homeworks tonight': ['"homework" tidak diberi -s.', 'uncountable-plural'],
    }, { focus: 'uncountable-plural' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Would you like ___ tea?\nB: Yes, please. With a little sugar.', [
      ['some', true],
      ['any', 'Untuk menawarkan dipakai "some": Would you like some tea?', 'some-any'],
      ['many', '"tea" tak terhitung, jadi tidak memakai "many".', 'much-many'],
      ['a few', '"a few" untuk benda terhitung jamak.', 'much-many'],
    ], 'Tawaran memakai "some": Would you like some tea?', { focus: 'some-any' }),
  ],
  homework: [
    read(2, "Mum is making a cake for Dani's birthday. She has some flour and a lot of eggs, but there isn't any butter in the fridge, and there isn't much sugar. She asks Dani to go to the shop. 'How much money do you need?' Dani asks. 'Not much,' Mum says. 'Butter and sugar are cheap.'", 'What does Dani need to buy?', [
      ['Butter and sugar', true],
      ['Eggs and flour', 'Ibu sudah punya tepung dan banyak telur.'],
      ['A birthday present', 'Teks tidak menyebut hadiah.'],
      ['A lot of eggs', 'Ibu sudah punya "a lot of eggs".'],
    ], '"there isn\'t any butter ... and there isn\'t much sugar."'),
    construct(2, 'there / any / milk / is', ['Is there any milk'], 'Pertanyaan: Is there + any + benda tak terhitung?', {
      'is there some milk': ['Pertanyaan biasa memakai "any".', 'some-any'],
      'there is any milk': ['Untuk bertanya, "is" pindah ke depan: Is there any milk?'],
    }, { prompt: 'Susun pertanyaan dari kata kunci berikut.', focus: 'some-any' }),
    tr(2, 'Saya tidak punya banyak waktu.', ["I don't have much time", "I haven't got much time", "I don't have a lot of time", 'I do not have much time'], 'Negatif + benda tak terhitung: not much time.', {
      "i don't have many time": ['"time" (waktu) tak terhitung: much time.', 'much-many'],
      "i don't have much times": ['"time" dalam arti waktu tidak diberi -s.', 'uncountable-plural'],
    }, { focus: 'much-many' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['How much luggage do you have?', true],
      ['How many luggage do you have?', '"luggage" tak terhitung: How much.', 'much-many'],
      ['How much luggages do you have?', '"luggage" tidak diberi -s.', 'uncountable-plural'],
      ['How many luggages do you have?', '"luggage" tak terhitung dan tidak diberi -s.', 'uncountable-plural'],
    ], 'How much + benda tak terhitung.', { focus: 'much-many' }),
    fill(2, 'There are ___ cars on the road today. It is very busy. (much / a lot of)', ['a lot of'], 'Kalimat positif + benda terhitung jamak → a lot of.', {
      much: ['"cars" terhitung jamak, jadi bukan "much".', 'much-many'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'much-many' }),
    tr(3, 'Apakah kamu punya pertanyaan?', ['Do you have any questions', 'Have you got any questions', 'Do you have any question'], 'Pertanyaan → any: any questions.', {
      'do you have some questions': ['Pertanyaan biasa memakai "any".', 'some-any'],
      'you have any questions': ['Tambahkan "Do" di depan: Do you have any questions?'],
    }, { focus: 'some-any' }),
    fix(3, 'Can you give me an advice?', ['Can you give me some advice', 'Can you give me a piece of advice', 'Can you give me advice', 'Could you give me some advice', 'Could you give me a piece of advice'], '"advice" tak terhitung: some advice atau a piece of advice.', undefined, { focus: 'uncountable-plural' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Is there any juice left?\nB: ___', [
      ['Yes, but not much.', true],
      ['Yes, but not many.', '"juice" tak terhitung: not much.', 'much-many'],
      ['Yes, there are some juices.', '"juice" di sini tak terhitung dan tidak diberi -s.', 'uncountable-plural'],
      ['No, there is some.', '"No" bertentangan dengan "there is some".'],
    ], '"juice" tak terhitung, jadi "not much".', { focus: 'much-many' }),
  ],
});

export const pastContinuousLesson = lesson({
  id: 'a2-past-continuous',
  title: 'Past Continuous',
  summary: 'Menceritakan apa yang sedang terjadi di masa lalu, dan kejadian yang menyelanya.',
  topic: 'a2.past-continuous',
  objectives: [
    'Membentuk past continuous: was/were + kata kerja -ing.',
    'Memakai past continuous untuk latar cerita dan simple past untuk kejadian yang menyela.',
    'Memakai while dan when dengan tepat.',
  ],
  intro: '"Saya sedang makan ketika telepon berbunyi." Dalam bahasa Indonesia, kata "sedang" dan "ketika" sudah cukup. Dalam bahasa Inggris, kegiatan yang sedang berlangsung di masa lalu memakai was/were + -ing (I was eating), sedangkan kejadian singkat yang menyelanya memakai simple past (the phone rang).',
  teaching: [
    {
      heading: 'Rumus: was / were + -ing',
      body: 'was untuk I, he, she, it; were untuk you, we, they. Negatif: wasn\'t/weren\'t + -ing. Pertanyaan: Was/Were + subjek + -ing?',
      table: [
        ['Subjek', 'to be lampau', '-ing'],
        ['I / he / she / it', 'was', 'sleeping'],
        ['you / we / they', 'were', 'working'],
      ],
      examples: [
        { en: 'At eight o\'clock last night, I was watching a film.', id: 'Pukul delapan tadi malam, saya sedang menonton film.' },
        { en: 'Were you sleeping when I called?', id: 'Apakah kamu sedang tidur ketika saya menelepon?' },
      ],
    },
    {
      heading: 'Latar cerita dan kejadian yang menyela',
      body: 'Past continuous menggambarkan kegiatan panjang yang sedang berlangsung (latar). Simple past menceritakan kejadian singkat yang terjadi di tengahnya.',
      examples: [
        { en: 'I was walking home when it started to rain.', id: 'Saya sedang berjalan pulang ketika hujan mulai turun.' },
        { en: 'While she was cooking, the lights went out.', id: 'Saat dia sedang memasak, lampunya padam.' },
      ],
    },
    {
      heading: 'While atau when?',
      body: '"while" biasanya diikuti past continuous (kegiatan panjang). "when" biasanya diikuti simple past (kejadian singkat). Kalau anak kalimatnya di depan, beri koma.',
      table: [
        ['Kata', 'Biasanya diikuti', 'Contoh'],
        ['while', 'past continuous', 'while I was waiting'],
        ['when', 'simple past', 'when the bus arrived'],
      ],
    },
  ],
  demo: [
    ["They were playing football at four o'clock.", "They were play football at four o'clock.", 'Setelah "were", kata kerja diberi -ing: were playing.'],
    ['I was reading when you called.', 'I read when you were calling.', 'Kegiatan panjang (membaca) memakai past continuous; kejadian singkat (menelepon) memakai simple past.'],
    ['While we were having lunch, it started to rain.', 'While we have lunch, it started to rain.', 'Kegiatan lampau yang sedang berlangsung: were having, bukan "have".'],
  ],
  vocab: ['suddenly', 'storm', 'while'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'At nine yesterday evening, we ___ dinner.', [
      ['were having', true],
      ['was having', '"we" memakai "were".', 'was-were'],
      ['were have', 'Setelah "were", kata kerja diberi -ing: were having.', 'was-ing-missing'],
      ['are having', '"yesterday" menandakan masa lalu, jadi "were".'],
    ], 'we + were + having.', { focus: 'was-ing-missing' }),
    match(1, 'Pasangkan subjek dengan bentuk yang benar.', [
      ['I', 'was working'],
      ['they', 'were working'],
      ['she', 'was working'],
      ['we', 'were working'],
    ], 'I/he/she/it → was; you/we/they → were.', { focus: 'was-were' }),
    fill(1, 'She ___ a book when I arrived. (read)', ['was reading'], 'Kegiatan yang sedang berlangsung saat itu: was reading.', {
      reading: ['Tambahkan "was": was reading.', 'was-ing-missing'],
      'were reading': ['"She" memakai "was".', 'was-were'],
      read: ['Soal ini meminta kegiatan yang sedang berlangsung: was reading.', 'was-ing-missing'],
    }, { prompt: 'Tulis bentuk past continuous dari kata dalam kurung.', focus: 'was-ing-missing' }),
    tf(1, 'Kalimat "While I was walking to school, I saw an accident." sudah benar.', true, 'while + past continuous (latar), lalu simple past (kejadian).', 'Kalimat ini benar: while + was walking, lalu saw.', { focus: 'when-while', tag: 'when-while' }),
  ],
  independent: [
    tr(2, 'Saya sedang mandi ketika telepon berbunyi.', ['I was taking a shower when the phone rang', 'I was having a shower when the phone rang', 'I was showering when the phone rang', 'I was taking a bath when the phone rang', 'I was having a bath when the phone rang'], 'Kegiatan panjang: was taking a shower; kejadian singkat: rang.', {
      'i was take a shower when the phone rang': ['Setelah "was", kata kerja diberi -ing.', 'was-ing-missing'],
      'i took a shower when the phone was ringing': ['Kegiatan panjang (mandi) memakai past continuous; kejadian singkat (telepon berbunyi) simple past.', 'when-while'],
      'i was taking a shower when the phone ring': ['Kejadian singkatnya juga lampau: rang.'],
    }, { focus: 'was-ing-missing' }),
    fill(2, '___ I was waiting for the bus, I met an old friend. (When / While)', ['While'], 'Kegiatan panjang yang sedang berlangsung → While.', {
      when: ['"when" biasanya diikuti simple past (kejadian singkat). Untuk "was waiting", pakai "While".', 'when-while'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'when-while' }),
    construct(2, 'they / not / were / sleeping', ['They were not sleeping', "They weren't sleeping"], 'Negatif: were + not + -ing.', {
      'they not were sleeping': ['"not" sesudah "were": were not sleeping.'],
      'they were not sleep': ['Setelah "were not", kata kerja -ing.', 'was-ing-missing'],
    }, { focus: 'was-ing-missing' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: What were you doing at ten last night?\nB: ___', [
      ['I was studying for my exam.', true],
      ['I studied for my exam.', 'Pertanyaannya "What were you doing" (sedang apa), jadi jawab dengan past continuous.', 'was-ing-missing'],
      ['I was study for my exam.', 'Setelah "was", kata kerja diberi -ing.', 'was-ing-missing'],
      ['I am studying for my exam.', 'Ini tentang tadi malam, jadi "was", bukan "am".'],
    ], '"What were you doing ...?" dijawab dengan was/were + -ing.', { focus: 'was-ing-missing' }),
  ],
  homework: [
    read(3, 'Last Saturday was a strange day. In the morning, Lina was cleaning her room while her brother was playing the guitar. Suddenly, there was a loud noise outside. A big tree fell onto the road because of the storm. Nobody was hurt, but the electricity went off. While they were waiting for the electricity to come back, the family played cards by candlelight.', 'What was Lina doing when the tree fell?', [
      ['She was cleaning her room.', true],
      ['She was playing the guitar.', 'Yang bermain gitar adalah saudara laki-lakinya.'],
      ['She was playing cards.', 'Mereka bermain kartu setelah listrik padam.'],
      ['She was sleeping.', 'Teks tidak menyebut Lina tidur.'],
    ], '"Lina was cleaning her room while her brother was playing the guitar. Suddenly ..."'),
    construct(2, 'was / it / raining / when / we / left', ['It was raining when we left'], 'Latar (was raining) + when + kejadian (left).', {
      'it was rain when we left': ['Setelah "was", -ing: was raining.', 'was-ing-missing'],
    }, { focus: 'was-ing-missing' }),
    fix(2, 'When I was cook dinner, my friend called me.', ['When I was cooking dinner, my friend called me', 'While I was cooking dinner, my friend called me', 'My friend called me when I was cooking dinner', 'My friend called me while I was cooking dinner'], 'Setelah "was", kata kerja diberi -ing: was cooking.', undefined, { focus: 'was-ing-missing' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['I was sleeping when the earthquake started.', true],
      ['I slept when the earthquake was starting.', 'Kegiatan panjang (tidur) → past continuous; kejadian singkat (gempa mulai) → simple past.', 'when-while'],
      ['I was sleep when the earthquake started.', 'Setelah "was", kata kerja diberi -ing.', 'was-ing-missing'],
      ['I were sleeping when the earthquake started.', '"I" memakai "was".', 'was-were'],
    ], 'Latar: was sleeping. Kejadian: started.', { focus: 'when-while' }),
    fill(3, 'What ___ you doing when the lights went out? (be)', ['were'], '"you" → were. What were you doing ...?', {
      was: ['"you" memakai "were".', 'was-were'],
      are: ['Kejadiannya lampau ("went out"), jadi "were".'],
    }, { prompt: 'Tulis bentuk lampau "be" yang tepat.', focus: 'was-were' }),
    tr(3, 'Ketika saya sedang berjalan di taman, saya melihat seekor ular.', ['While I was walking in the park, I saw a snake', 'When I was walking in the park, I saw a snake', 'I saw a snake while I was walking in the park', 'I saw a snake when I was walking in the park'], 'Latar: was walking; kejadian: saw.', {
      'while i walked in the park i saw a snake': ['Kegiatan yang sedang berlangsung memakai past continuous: was walking.', 'was-ing-missing'],
      'while i was walk in the park i saw a snake': ['Setelah "was", kata kerja diberi -ing.', 'was-ing-missing'],
      'while i was walking in the park i see a snake': ['Kejadiannya lampau: saw.'],
    }, { focus: 'was-ing-missing' }),
    spot(3, 'They was playing cards when the storm started.', 'was', 'were', '"They" memakai "were".', { focus: 'was-were' }),
    construct(3, 'while / she / was / driving / her phone / rang', ['Her phone rang while she was driving', 'While she was driving her phone rang'], 'Kejadian (rang) + while + latar (was driving).', {
      'her phone was ringing while she drove': ['Yang sedang berlangsung adalah menyetir: while she was driving. Teleponnya berbunyi sekali: rang.', 'when-while'],
    }, { focus: 'when-while' }),
  ],
});

export const mustLesson = lesson({
  id: 'a2-must',
  title: 'Must dan Have to',
  summary: 'Menyatakan kewajiban, larangan, dan hal yang tidak perlu.',
  topic: 'a2.must',
  objectives: [
    'Memakai must dan have to + bentuk dasar untuk kewajiban.',
    "Membedakan mustn't (dilarang) dan don't have to (tidak perlu).",
    'Memakai has to untuk he/she/it dan had to untuk masa lalu.',
  ],
  intro: '"Harus" dalam bahasa Indonesia bisa diterjemahkan must atau have to. Di kalimat positif bedanya kecil, tetapi di kalimat negatif bedanya besar sekali: "You mustn\'t smoke here" berarti dilarang merokok, sedangkan "You don\'t have to come" berarti kamu tidak perlu datang (boleh saja kalau mau).',
  teaching: [
    {
      heading: 'Must dan have to: harus',
      body: '"must" + bentuk dasar, sama untuk semua subjek, sering dipakai untuk aturan tertulis atau kewajiban yang dirasakan pembicara sendiri. "have to" + bentuk dasar mengikuti subjeknya (has to untuk he/she/it), sering untuk kewajiban dari luar. Setelah must tidak ada "to".',
      table: [
        ['Subjek', 'must', 'have to'],
        ['I / you / we / they', 'must go', 'have to go'],
        ['he / she / it', 'must go', 'has to go'],
      ],
      examples: [
        { en: 'You must wear a helmet on a motorbike.', id: 'Kamu harus memakai helm saat naik motor.' },
        { en: 'My mother has to work on Saturdays.', id: 'Ibu saya harus bekerja hari Sabtu.' },
      ],
    },
    {
      heading: "Mustn't atau don't have to?",
      body: 'Ini perbedaan terpenting di pelajaran ini. "mustn\'t" berarti dilarang. "don\'t have to" atau "doesn\'t have to" berarti tidak wajib, tidak perlu.',
      table: [
        ['Ungkapan', 'Arti', 'Contoh'],
        ["mustn't", 'dilarang', "You mustn't use your phone in the exam."],
        ["don't have to", 'tidak perlu', "You don't have to bring food. Lunch is free."],
      ],
      examples: [
        { en: "Students mustn't run in the corridor.", id: 'Siswa dilarang berlari di lorong.' },
        { en: "It's Sunday. I don't have to get up early.", id: 'Hari Minggu. Saya tidak perlu bangun pagi.' },
      ],
    },
    {
      heading: 'Masa lalu dan pertanyaan',
      body: '"must" tidak punya bentuk lampau. Untuk kewajiban di masa lalu pakai "had to". Pertanyaan biasanya memakai do/does: Do you have to ...? Does she have to ...?',
      examples: [
        { en: 'I had to wait for two hours yesterday.', id: 'Kemarin saya harus menunggu dua jam.' },
        { en: 'Do we have to wear a uniform?', id: 'Apakah kita harus memakai seragam?' },
      ],
    },
  ],
  demo: [
    ['You must wear a helmet.', 'You must to wear a helmet.', 'Setelah "must" tidak ada "to".'],
    ['She has to finish her report.', 'She have to finish her report.', '"She" memakai "has to".'],
    ["You don't have to pay. It's free.", "You mustn't pay. It's free.", 'Gratis berarti tidak perlu membayar (don\'t have to), bukan dilarang membayar (mustn\'t).'],
  ],
  vocab: ['rule', 'uniform', 'allowed'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ['We must leave now.', true],
      ['We must to leave now.', 'Setelah "must" langsung bentuk dasar, tanpa "to".', 'modal-to'],
      ['We must leaving now.', 'Setelah "must" dipakai bentuk dasar: leave.', 'modal-to'],
      ['We musts leave now.', '"must" tidak pernah diberi -s.'],
    ], 'must + bentuk dasar.', { focus: 'modal-to' }),
    match(1, 'Pasangkan ungkapan dengan artinya.', [
      ["mustn't", 'dilarang'],
      ["don't have to", 'tidak perlu'],
      ['have to', 'harus'],
      ['had to', 'harus (dulu)'],
    ], "mustn't = dilarang; don't have to = tidak perlu; had to = harus di masa lalu.", { focus: 'mustnt-dont-have' }),
    fill(1, 'My brother ___ get up at five every day. (have to)', ['has to'], '"My brother" = he → has to.', {
      'have to': ['"My brother" = he, jadi "has to".', 'has-to'],
      has: ['Tambahkan "to": has to.', 'has-to'],
    }, { prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.', focus: 'has-to' }),
    tf(1, '"You don\'t have to come" berarti kamu dilarang datang.', false, '"don\'t have to" = tidak perlu. Dilarang = mustn\'t.', '"don\'t have to" berarti tidak perlu, bukan dilarang.', { focus: 'mustnt-dont-have', tag: 'mustnt-dont-have' }),
  ],
  independent: [
    fill(2, "You ___ smoke in the hospital. It's dangerous. (mustn't / don't have to)", ["mustn't"], "Dilarang → mustn't.", {
      "don't have to": ['"don\'t have to" berarti tidak perlu. Di rumah sakit merokok dilarang: mustn\'t.', 'mustnt-dont-have'],
    }, { prompt: 'Pilih ungkapan yang tepat dari kurung.', focus: 'mustnt-dont-have' }),
    tr(2, 'Kamu tidak perlu membawa makanan.', ["You don't have to bring food", "You don't need to bring food", "You needn't bring food", 'You do not have to bring food', "You don't have to bring any food", "You don't need to bring any food"], "Tidak perlu = don't have to.", {
      "you mustn't bring food": ['"mustn\'t" berarti dilarang. "Tidak perlu" = don\'t have to.', 'mustnt-dont-have'],
      "you don't must bring food": ['"must" tidak memakai "don\'t". Pakai "don\'t have to".', 'mustnt-dont-have'],
    }, { focus: 'mustnt-dont-have' }),
    construct(2, 'had to / we / yesterday / wait', ['We had to wait yesterday', 'Yesterday we had to wait'], 'Masa lalu: had to + bentuk dasar.', {
      'we had to waited yesterday': ['Setelah "had to", bentuk dasar: wait.', 'modal-to'],
    }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Do I have to wear a uniform on Friday?\nB: ___', [
      ["No, you don't. Friday is a free-dress day.", true],
      ["No, you mustn't.", '"mustn\'t" berarti dilarang. Jawaban pendek untuk "Do I have to ...?" adalah "No, you don\'t."', 'mustnt-dont-have'],
      ["No, you haven't.", 'Pertanyaannya memakai "Do", jadi jawabannya "No, you don\'t."'],
      ['Yes, you must to.', 'Setelah "must" tidak ada "to".', 'modal-to'],
    ], 'Do I have to ...? → No, you don\'t.', { focus: 'mustnt-dont-have' }),
  ],
  homework: [
    read(2, "School rules at SMP Harapan: All students must wear their uniform from Monday to Thursday. On Fridays, students don't have to wear the uniform; they can wear batik. Students mustn't use their phones during lessons. They have to give their phones to the teacher before an exam. Students don't have to bring lunch because the canteen is open every day.", 'What can students wear on Fridays?', [
      ['Batik', true],
      ['Their uniform only', 'Hari Jumat seragam tidak wajib: "don\'t have to wear the uniform".'],
      ['Anything except batik', 'Teks berkata "they can wear batik".'],
      ['Sports clothes', 'Teks tidak menyebut pakaian olahraga.'],
    ], '"On Fridays, students don\'t have to wear the uniform; they can wear batik."'),
    fix(2, 'She have to study tonight.', ['She has to study tonight'], '"She" → has to.', undefined, { focus: 'has-to' }),
    tr(2, 'Siswa dilarang berlari di dalam kelas.', ["Students mustn't run in the classroom", 'Students must not run in the classroom', 'Students are not allowed to run in the classroom', "Students aren't allowed to run in the classroom", "Students mustn't run in class", 'Students must not run in class'], "Dilarang = mustn't (atau are not allowed to).", {
      "students don't have to run in the classroom": ['"don\'t have to" berarti tidak perlu, bukan dilarang.', 'mustnt-dont-have'],
      'students must not to run in the classroom': ['Setelah "must not" tanpa "to".', 'modal-to'],
    }, { focus: 'mustnt-dont-have' }),
  ],
  mastery: [
    mc(2, 'Pilih jawaban yang paling tepat.', 'The museum is free. You ___ buy a ticket.', [
      ["don't have to", true],
      ["mustn't", 'Gratis berarti tidak perlu membeli tiket, bukan dilarang membeli.', 'mustnt-dont-have'],
      ['must', 'Museumnya gratis, jadi membeli tiket tidak wajib.'],
      ['has to', '"You" tidak memakai "has to", dan tiketnya tidak perlu dibeli.', 'has-to'],
    ], "Gratis → tidak perlu: don't have to.", { focus: 'mustnt-dont-have' }),
    fill(3, 'Yesterday I ___ go to the dentist because I had a toothache. (must)', ['had to'], '"must" tidak punya bentuk lampau: had to.', {
      must: ['"Yesterday" berarti masa lalu, dan "must" tidak punya bentuk lampau: had to.'],
      musted: ['"must" tidak punya bentuk lampau: had to.'],
    }, { prompt: 'Tulis bentuk lampau yang tepat untuk kata dalam kurung.' }),
    tr(3, 'Apakah dia harus bekerja besok?', ['Does she have to work tomorrow', 'Does he have to work tomorrow', 'Will she have to work tomorrow', 'Will he have to work tomorrow'], 'Pertanyaan: Does + he/she + have to + bentuk dasar?', {
      'does she has to work tomorrow': ['Setelah "does", kembali ke "have to".', 'has-to'],
      'must she to work tomorrow': ['Setelah "must" tanpa "to".', 'modal-to'],
    }, { focus: 'has-to' }),
    fix(3, 'You must to show your ticket at the gate.', ['You must show your ticket at the gate', 'You have to show your ticket at the gate'], 'Setelah "must" langsung bentuk dasar.', undefined, { focus: 'modal-to' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Can I take photos in the museum?\nB: ___', [
      ["Yes, but you mustn't use a flash.", true],
      ["Yes, but you don't have to use a flash.", 'Maksudnya melarang lampu kilat, jadi "mustn\'t".', 'mustnt-dont-have'],
      ['Yes, but you must not to use a flash.', 'Setelah "must not" tanpa "to".', 'modal-to'],
      ["Yes, but you haven't use a flash.", '"haven\'t" bukan cara melarang. Pakai "mustn\'t".'],
    ], "Larangan → mustn't.", { focus: 'mustnt-dont-have' }),
  ],
});

export const shouldLesson = lesson({
  id: 'a2-should',
  title: 'Should: Memberi Saran',
  summary: "Memberi dan meminta saran dengan should, shouldn't, dan Why don't you ...?",
  topic: 'a2.should',
  objectives: [
    "Memakai should/shouldn't + bentuk dasar untuk memberi saran.",
    'Meminta saran: What should I do? dan Should I ...?',
    'Membedakan saran (should) dengan kewajiban (must/have to).',
  ],
  intro: '"Sebaiknya" dalam bahasa Indonesia paling dekat dengan "should". Saran tidak sekuat kewajiban: "You should rest" (sebaiknya kamu istirahat) terdengar lebih ramah daripada "You must rest" (kamu harus istirahat). Seperti must, setelah should langsung bentuk dasar, tanpa "to".',
  teaching: [
    {
      heading: 'Should + bentuk dasar',
      body: "should dan shouldn't sama untuk semua subjek: tanpa -s, tanpa \"to\", tanpa \"don't\".",
      table: [
        ['Positif', 'Negatif', 'Pertanyaan'],
        ['You should rest.', "You shouldn't stay up late.", 'Should I call the doctor?'],
      ],
      examples: [
        { en: 'You should drink more water.', id: 'Sebaiknya kamu minum lebih banyak air.' },
        { en: "He shouldn't eat so much sugar.", id: 'Sebaiknya dia tidak makan terlalu banyak gula.' },
      ],
    },
    {
      heading: 'Meminta saran',
      body: "Untuk meminta saran: What should I do? atau Should I + bentuk dasar ...? Jawaban pendek: Yes, you should. / No, you shouldn't.",
      examples: [
        { en: 'What should I bring to the party?', id: 'Sebaiknya saya membawa apa ke pesta?' },
        { en: 'Should I take an umbrella? — Yes, you should. It looks like rain.', id: 'Sebaiknya saya bawa payung? — Ya. Sepertinya akan hujan.' },
      ],
    },
    {
      heading: 'Saran atau kewajiban?',
      body: '"should" untuk saran atau pendapat. "must/have to" untuk aturan dan kewajiban. "Why don\'t you ...?" adalah cara bersahabat untuk menyarankan sesuatu.',
      table: [
        ['Ungkapan', 'Kekuatan', 'Contoh'],
        ['must / have to', 'wajib', 'You must show your passport.'],
        ['should', 'saran', 'You should visit Bali.'],
        ["Why don't you ...?", 'saran ramah', "Why don't you ask your teacher?"],
      ],
    },
  ],
  demo: [
    ['You should see a doctor.', 'You should to see a doctor.', 'Setelah "should" tanpa "to".'],
    ['She should go to bed early.', 'She shoulds go to bed early.', '"should" tidak pernah diberi -s.'],
    ["You shouldn't drink cold water when you have a cough.", "You don't should drink cold water when you have a cough.", "Negatif: shouldn't, tanpa \"don't\"."],
  ],
  vocab: ['rest', 'medicine', 'dentist'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ['You should try this soup.', true],
      ['You should to try this soup.', 'Setelah "should" tanpa "to".', 'modal-to'],
      ['You should trying this soup.', 'Setelah "should", bentuk dasar: try.', 'should-base'],
      ['You shoulds try this soup.', '"should" tidak diberi -s.', 'should-base'],
    ], 'should + bentuk dasar.', { focus: 'should-base' }),
    match(1, 'Pasangkan masalah dengan saran yang cocok.', [
      ["I'm tired.", 'You should go to bed.'],
      ['I have a toothache.', 'You should see a dentist.'],
      ["I'm hungry.", 'You should eat something.'],
      ["I'm cold.", 'You should wear a jacket.'],
    ], 'Setiap saran memakai should + bentuk dasar.'),
    fill(1, 'It is late. You ___ go home now. (should / should to)', ['should'], 'Setelah "should" langsung bentuk dasar.', {
      'should to': ['"should" tidak diikuti "to".', 'modal-to'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'modal-to' }),
    tf(1, '"You should rest" terdengar lebih lembut daripada "You must rest".', true, 'should = saran (sebaiknya); must = kewajiban (harus).', 'should memang lebih lembut: saran, bukan kewajiban.'),
  ],
  independent: [
    tr(2, 'Sebaiknya kamu minum obat ini.', ['You should take this medicine', 'You should drink this medicine', 'You should have this medicine'], '"Sebaiknya" = should + bentuk dasar. Minum obat lazimnya "take medicine".', {
      'you should to take this medicine': ['Tanpa "to" setelah should.', 'modal-to'],
      'you should taking this medicine': ['Setelah should, bentuk dasar.', 'should-base'],
    }, { focus: 'should-base' }),
    fill(2, "You ___ eat so much chocolate. It's bad for your teeth. (should / shouldn't)", ["shouldn't"], "Saran untuk tidak melakukan sesuatu: shouldn't.", {
      should: ['Coklat buruk untuk gigi, jadi saran yang tepat adalah "shouldn\'t".'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.' }),
    construct(2, 'should / what / I / do', ['What should I do'], 'Meminta saran: What should I do?', {
      'what i should do': ['Dalam pertanyaan, "should" pindah ke depan subjek: What should I do?'],
      'what should i to do': ['Tanpa "to" setelah should.', 'modal-to'],
    }, { prompt: 'Susun pertanyaan dari kata kunci berikut.' }),
    dlg(2, 'Lengkapi percakapan berikut.', "A: I have an English test tomorrow, and I'm really nervous.\nB: ___", [
      ['You should review your notes and get some sleep.', true],
      ['You should reviewing your notes.', 'Setelah should, bentuk dasar: review.', 'should-base'],
      ['You must to sleep now.', 'Setelah must tanpa "to", dan untuk teman lebih cocok saran dengan "should".', 'modal-to'],
      ["You don't should worry.", "Negatif: shouldn't, bukan \"don't should\".", 'should-base'],
    ], 'Saran untuk teman: You should + bentuk dasar.', { focus: 'should-base' }),
  ],
  homework: [
    read(2, "Dear Pijar, I am a new student in Surabaya. I don't have many friends, and I often feel lonely after school. What should I do? — Rudi. Dear Rudi, you should join a club at school. Many students make friends in the football club or the music club. You shouldn't stay in your room every evening. Why don't you invite a classmate to study with you? — Pijar", 'What does Pijar NOT suggest?', [
      ['Staying in his room every evening', true],
      ['Joining a club', 'Pijar menyarankan "you should join a club".'],
      ['Inviting a classmate to study', 'Pijar menyarankan "Why don\'t you invite a classmate ...".'],
      ['Making friends in the music club', 'Pijar menyebut klub musik sebagai tempat berteman.'],
    ], 'Pijar berkata "You shouldn\'t stay in your room every evening": itu justru yang tidak disarankan.'),
    fix(2, 'He should goes to bed earlier.', ['He should go to bed earlier'], 'Setelah should, bentuk dasar tanpa -s: go.', undefined, { focus: 'should-base' }),
    tr(2, 'Sebaiknya saya membawa payung?', ['Should I take an umbrella', 'Should I bring an umbrella', 'Should I take my umbrella', 'Should I bring my umbrella'], 'Pertanyaan saran: Should + I + bentuk dasar?', {
      'i should take an umbrella': ['Untuk bertanya, "should" pindah ke depan: Should I ...?'],
    }),
  ],
  mastery: [
    mc(2, 'Pilih saran yang paling tepat.', 'My friend: "I have a terrible headache."', [
      ['You should take some medicine and rest.', true],
      ['You should to take some medicine.', 'Setelah should tanpa "to".', 'modal-to'],
      ['You should takes some medicine.', 'Setelah should, bentuk dasar tanpa -s.', 'should-base'],
      ["You don't should go to school.", "Negatif: shouldn't.", 'should-base'],
    ], 'should + bentuk dasar.', { focus: 'should-base' }),
    fill(3, '___ we bring anything to the party? (Should / Do should)', ['Should'], 'Pertanyaan dengan should tanpa "do": Should we ...?', {
      'do should': ['Pertanyaan dengan should tanpa "do": Should we ...?', 'should-base'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'should-base' }),
    tr(3, 'Sebaiknya kamu tidak minum kopi pada malam hari.', ["You shouldn't drink coffee at night", 'You should not drink coffee at night', "You shouldn't drink coffee in the evening", 'You should not drink coffee in the evening'], "Saran negatif: shouldn't + bentuk dasar.", {
      "you don't should drink coffee at night": ["Negatif: shouldn't.", 'should-base'],
      'you should not to drink coffee at night': ['Tanpa "to".', 'modal-to'],
    }, { focus: 'should-base' }),
    construct(3, "don't / why / you / ask / your teacher", ["Why don't you ask your teacher"], "Saran ramah: Why don't you + bentuk dasar?", {
      "why you don't ask your teacher": ["Dalam pertanyaan, \"don't\" berada sebelum \"you\": Why don't you ...?"],
    }, { prompt: 'Susun saran dari kata kunci berikut.' }),
    fix(3, 'Should I to call him now?', ['Should I call him now'], 'Tanpa "to" setelah should.', undefined, { focus: 'modal-to' }),
  ],
});

export const imperativesLesson = lesson({
  id: 'a2-imperatives',
  title: 'Imperatif dan Petunjuk Arah',
  summary: 'Memberi perintah, larangan, ajakan, dan petunjuk arah.',
  topic: 'a2.imperatives',
  objectives: [
    'Membuat kalimat perintah dengan bentuk dasar kata kerja: Open the door. Turn left.',
    "Membuat larangan dengan Don't + bentuk dasar, dan ajakan dengan Let's + bentuk dasar.",
    'Memberi dan memahami petunjuk arah: go straight on, turn left/right, on the corner, opposite, next to.',
  ],
  intro: 'Kalimat perintah dalam bahasa Inggris dimulai langsung dengan kata kerja bentuk dasar, tanpa subjek: "Sit down." Larangan memakai "Don\'t" di depan, bukan "No" atau "Not". Ajakan "ayo" adalah "Let\'s". Pola sederhana ini dipakai setiap hari, dari resep masakan sampai petunjuk arah.',
  teaching: [
    {
      heading: 'Perintah, larangan, dan ajakan',
      body: 'Perintah: bentuk dasar di awal kalimat. Larangan: Don\'t + bentuk dasar. Ajakan: Let\'s + bentuk dasar. Tambahkan please agar lebih sopan.',
      table: [
        ['Fungsi', 'Pola', 'Contoh'],
        ['Perintah', 'bentuk dasar ...', 'Close the window, please.'],
        ['Larangan', "Don't + bentuk dasar", "Don't touch the oven."],
        ['Ajakan', "Let's + bentuk dasar", "Let's go!"],
      ],
      examples: [
        { en: 'Please sit down.', id: 'Silakan duduk.' },
        { en: "Don't be late!", id: 'Jangan terlambat!' },
      ],
    },
    {
      heading: 'Petunjuk arah',
      body: 'Petunjuk arah memakai kalimat perintah yang berurutan, ditambah kata penanda tempat.',
      table: [
        ['Ungkapan', 'Arti'],
        ['go straight on', 'jalan lurus'],
        ['turn left / right', 'belok kiri / kanan'],
        ['take the second left', 'ambil belokan kiri kedua'],
        ['on the corner', 'di sudut jalan'],
        ['opposite', 'di seberang'],
        ['next to', 'di sebelah'],
        ['at the traffic lights', 'di lampu lalu lintas'],
      ],
      examples: [
        { en: 'Go straight on, then turn right at the traffic lights. The bank is opposite the post office.', id: 'Jalan lurus, lalu belok kanan di lampu lalu lintas. Bank ada di seberang kantor pos.' },
      ],
    },
    {
      heading: 'Kesalahan yang sering terjadi',
      body: 'Tidak ada "to" setelah Don\'t atau Let\'s, dan kata kerjanya tidak diberi -ing. Untuk kata sifat, pakai "be": Don\'t be shy. Papan larangan resmi memang sering berbunyi "No smoking" atau "No parking", tetapi dalam percakapan pakai "Don\'t smoke here." Arah ditulis "turn left", tanpa "to" atau "on the".',
      examples: [
        { en: "Let's take a taxi.", id: 'Ayo naik taksi.' },
        { en: "Don't be afraid.", id: 'Jangan takut.' },
      ],
    },
  ],
  demo: [
    ["Don't open the window.", "Don't to open the window.", 'Setelah "Don\'t" langsung bentuk dasar, tanpa "to".'],
    ["Let's go to the beach.", "Let's going to the beach.", 'Setelah "Let\'s", bentuk dasar: go.'],
    ["Don't be noisy.", "Don't noisy.", '"noisy" kata sifat, jadi butuh "be": Don\'t be noisy.'],
  ],
  vocab: ['turn', 'corner', 'opposite'],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ["Don't touch the paint. It's wet.", true],
      ["Don't to touch the paint. It's wet.", 'Setelah "Don\'t" tanpa "to".', 'imperative-form'],
      ["Not touch the paint. It's wet.", 'Larangan dimulai dengan "Don\'t", bukan "Not".', 'imperative-form'],
      ["Don't touching the paint. It's wet.", 'Setelah "Don\'t", bentuk dasar: touch.', 'imperative-form'],
    ], "Larangan: Don't + bentuk dasar.", { focus: 'imperative-form' }),
    match(1, 'Pasangkan petunjuk arah dengan artinya.', [
      ['turn left', 'belok kiri'],
      ['go straight on', 'jalan lurus'],
      ['opposite', 'di seberang'],
      ['on the corner', 'di sudut jalan'],
    ], 'Ungkapan arah yang paling sering dipakai.', { focus: 'direction-words' }),
    fill(1, "It's a beautiful day. ___ go for a walk! (Let's / Let's to)", ["Let's"], "Ajakan: Let's + bentuk dasar.", {
      "let's to": ['Setelah "Let\'s" tanpa "to".', 'imperative-form'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'imperative-form' }),
    tf(1, 'Kalimat "Don\'t be late tomorrow!" sudah benar.', true, '"late" kata sifat, jadi larangannya: Don\'t be late.', "Kalimat ini benar: Don't + be + kata sifat.", { focus: 'dont-be', tag: 'dont-be' }),
  ],
  independent: [
    tr(2, 'Jangan buka pintu itu.', ["Don't open that door", 'Do not open that door', "Don't open the door", 'Do not open the door'], "Larangan: Don't + bentuk dasar.", {
      'not open that door': ['Larangan dimulai dengan "Don\'t".', 'imperative-form'],
      "don't to open that door": ['Tanpa "to".', 'imperative-form'],
      "don't opening that door": ["Bentuk dasar setelah Don't: open.", 'imperative-form'],
    }, { focus: 'imperative-form' }),
    fill(2, "___ be shy. Ask me if you have a question. (Not / Don't)", ["Don't"], "Larangan dengan kata sifat: Don't be + kata sifat.", {
      not: ['Larangan dimulai dengan "Don\'t", bukan "Not".', 'dont-be'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'dont-be' }),
    construct(2, 'left / turn / at / the traffic lights', ['Turn left at the traffic lights', 'At the traffic lights turn left'], 'Petunjuk arah: kata kerja di awal: Turn left at ...', {
      'left turn at the traffic lights': ['Kata kerja "turn" di awal, lalu arahnya: Turn left.', 'direction-words'],
    }, { focus: 'direction-words' }),
    read(2, "Excuse me, where's the pharmacy? — Go straight on and take the second right. Walk past the school. The pharmacy is on the corner, opposite the park.", 'Where is the pharmacy?', [
      ['On the corner, opposite the park', true],
      ['Next to the school', '"Walk past the school" berarti berjalan melewati sekolah.', 'direction-words'],
      ['On the first right', '"take the second right" berarti belokan kanan kedua.', 'direction-words'],
      ['Inside the park', '"opposite the park" berarti di seberang taman.', 'direction-words'],
    ], '"The pharmacy is on the corner, opposite the park."', { focus: 'direction-words' }),
  ],
  homework: [
    read(2, "How to make iced tea: First, boil some water. Put two tea bags in a jug and pour the hot water over them. Wait for five minutes. Don't leave the tea bags in too long, or the tea will be bitter. Take out the tea bags and add some sugar. Let the tea cool down, then put it in the fridge. Serve it with ice.", 'What happens if you leave the tea bags in too long?', [
      ['The tea will be bitter.', true],
      ['The tea will be cold.', 'Teh menjadi dingin karena dimasukkan ke kulkas, bukan karena kantong teh.'],
      ['The water will boil.', 'Air direbus di langkah pertama.'],
      ['The tea will be too sweet.', 'Rasa manis berasal dari gula, bukan dari kantong teh.'],
    ], '"Don\'t leave the tea bags in too long, or the tea will be bitter."'),
    tr(2, 'Ayo makan siang bersama.', ["Let's have lunch together", "Let's eat lunch together", 'Let us have lunch together'], "Ajakan: Let's + bentuk dasar.", {
      "let's to have lunch together": ['Tanpa "to".', 'imperative-form'],
      "let's having lunch together": ['Bentuk dasar: have.', 'imperative-form'],
    }, { focus: 'imperative-form' }),
    fix(2, "Don't noisy, please. The baby is sleeping.", ["Don't be noisy, please. The baby is sleeping", "Please don't be noisy. The baby is sleeping"], '"noisy" kata sifat, jadi butuh "be".', undefined, { focus: 'dont-be' }),
  ],
  mastery: [
    mc(2, 'Pilih petunjuk yang benar.', null, [
      ['Go straight on and turn right at the bank.', true],
      ['Going straight on and turning right at the bank.', 'Petunjuk arah memakai bentuk dasar di awal: Go ... turn ...', 'imperative-form'],
      ['You go to straight and turn on right at the bank.', '"go straight" tanpa "to", dan "turn right" tanpa "on".', 'direction-words'],
      ['Go straight on and right turn at the bank.', 'Urutannya "turn right", bukan "right turn".', 'direction-words'],
    ], 'Petunjuk arah: bentuk dasar di awal, lalu arahnya.', { focus: 'direction-words' }),
    fill(3, 'Please ___ your phone during the film. (turn off / to turn off)', ['turn off'], 'Perintah sopan: Please + bentuk dasar.', {
      'to turn off': ['Perintah tidak memakai "to".', 'imperative-form'],
      'turning off': ['Bentuk dasar: turn off.', 'imperative-form'],
    }, { prompt: 'Pilih bentuk yang tepat dari kurung.', focus: 'imperative-form' }),
    tr(3, 'Belok kiri, lalu jalan lurus.', ['Turn left, then go straight', 'Turn left and then go straight', 'Turn left and go straight', 'Turn left, then go straight on', 'Turn left and then go straight on', 'Turn left and go straight on', 'Turn left, then go straight ahead', 'Turn left and then go straight ahead', 'Turn left and go straight ahead'], 'Petunjuk berurutan: Turn left, then go straight.', {
      'turn to left then go straight': ['"turn left" tanpa "to".', 'direction-words'],
      'left turn then go straight': ['Kata kerja di awal: Turn left.', 'direction-words'],
      'turning left then going straight': ['Petunjuk memakai bentuk dasar: Turn ... go ...', 'imperative-form'],
    }, { focus: 'direction-words' }),
    construct(3, "be / don't / afraid / of the dog", ["Don't be afraid of the dog"], "Don't + be + kata sifat.", {
      "don't afraid of the dog": ['"afraid" kata sifat, jadi butuh "be".', 'dont-be'],
    }, { focus: 'dont-be' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Excuse me, is there a bank near here?\nB: ___', [
      ["Yes. Go straight on, and it's on the left, next to the post office.", true],
      ['Yes. Going straight, it is on left.', 'Petunjuk dimulai dengan bentuk dasar (Go), dan "on the left" memakai "the".', 'imperative-form'],
      ['Yes. You must to go straight.', 'Setelah must tanpa "to"; untuk petunjuk cukup "Go straight on".', 'modal-to'],
      ["Yes. Don't go straight, turn on the left.", 'Untuk arah dipakai "turn left", tanpa "on the".', 'direction-words'],
    ], 'Petunjuk arah: Go straight on ... on the left, next to ...', { focus: 'direction-words' }),
  ],
});
