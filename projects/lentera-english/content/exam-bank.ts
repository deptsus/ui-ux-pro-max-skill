// Exam-only question bank for the CEFR-style level exams (Rilis 3).
// None of these questions appears in a lesson, drill, homework or story, and
// the server never sends their keys to a device: the exam is drawn and graded
// on the server (src/lib/engine/levelExam.ts, /api/exams/level).
//
// Per level: grammar & vocabulary (12, 8 drawn per attempt), reading (2
// passages of 4 questions, 1 drawn), listening (2 recordings of 4 questions,
// 1 drawn) and writing (2 tasks, 1 drawn, checked against a checklist).
// Items avoid answers that are arguably correct in another variety of English
// (e.g. "has" after "It is essential that"), so the key is never disputable.
import type { Cefr } from '@/lib/content/types';
import { fill, fix, listen, mc, read, type Draft } from './dsl';

export interface ExamWriting { prompt: string; minWords: number; mustInclude: string[]; model: string }
export interface LevelBank { grammar: Draft[]; reading: Draft[][]; listening: Draft[][]; writing: ExamWriting[] }

const R = { topic: 'skill.reading' } as const;
const L = { topic: 'skill.listening' } as const;
const t = (topic: string) => ({ topic });

// ═════════════════════════════════════════════════════════════════ A1
const A1_SARI = "Hi! My name is Sari. I am twelve years old and I live in Bandung with my parents and my little brother, Dimas. Every morning I get up at six o'clock. I walk to school with my friend Lina. School starts at seven. My favourite subject is English. After school, I play badminton in the park. Dimas can't play badminton, but he can ride a bike.";
const A1_CAFE = 'SUNNY CAFÉ. Open Monday to Saturday, 7 a.m. to 9 p.m. Closed on Sunday. Breakfast: fried rice, eggs, toast. Drinks: tea Rp8.000, coffee Rp10.000, orange juice Rp12.000. There is free Wi-Fi. Children under five eat for free!';
const A1_MEET = "Hello, I'm Tom. I'm from London, and I'm a teacher at Harapan School. I teach English and music. I live in a small flat near the school. I don't have a car, so I ride my bike to work. On Sundays I go to the market with my friend Maya. She is a student. She studies art at the university.";
const A1_BUS = 'Good morning, everyone. The bus to Yogyakarta leaves at ten fifteen from gate three. Please be at the gate at ten o\'clock. The trip takes about four hours. There is a stop for lunch at twelve thirty. Thank you.';

const A1: LevelBank = {
  grammar: [
    mc(1, 'Pilih kata yang tepat.', 'My sister ___ a nurse.', [['is', true], ['am', '"am" hanya untuk I.'], ['are', '"are" untuk you, we, they, atau subjek jamak. "My sister" tunggal.']],
      '"My sister" = she, jadi memakai "is": My sister is a nurse.', t('a1.to-be')),
    mc(1, 'Pilih kata yang tepat untuk pertanyaan ini.', '___ they at home now?', [['Are', true], ['Is', '"Is" untuk he, she, it. "They" memakai "are".'], ['Do', 'Kalimat ini tidak punya kata kerja lain; "at home" butuh to be, bukan do.']],
      'Pertanyaan dengan to be: to be pindah ke depan. They are → Are they at home now?', t('a1.to-be-neg-q')),
    mc(1, 'Pilih artikel yang tepat.', 'She is ___ honest girl.', [['an', true], ['a', '"honest" dibaca /ˈɒnɪst/, huruf h tidak berbunyi, jadi bunyi awalnya vokal.']],
      'Pilihan a/an ditentukan oleh bunyi, bukan huruf. "honest" diawali bunyi vokal, jadi "an honest girl".', t('a1.articles')),
    mc(1, 'Pilih kata yang tepat.', 'Look at ___ birds in the sky!', [['those', true], ['that', '"that" untuk satu benda. "birds" jamak.'], ['this', '"this" untuk satu benda yang dekat. Burung di langit jauh dan jumlahnya banyak.']],
      'Benda jamak yang jauh memakai "those": those birds.', t('a1.demonstratives')),
    mc(1, 'Pilih bentuk kata kerja yang tepat.', 'He ___ to school by bus every day.', [['goes', true], ['go', 'Subjek "he" dalam simple present butuh -s/-es: goes.'], ['going', '"going" butuh am/is/are di depannya, dan kebiasaan harian memakai simple present.']],
      'Kebiasaan (every day) memakai simple present. He/she/it + kata kerja + -s/-es: he goes.', t('a1.simple-present')),
    mc(1, 'Pilih kata yang tepat untuk pertanyaan ini.', '___ your brother like football?', [['Does', true], ['Do', '"your brother" = he, jadi memakai "does".'], ['Is', '"like" adalah kata kerja biasa, jadi pertanyaannya memakai do/does, bukan to be.']],
      'Pertanyaan simple present dengan he/she/it: Does + subjek + bentuk dasar. Does your brother like football?', t('a1.do-does')),
    fill(1, "The shop opens ___ 8 o'clock.", ['at'], 'Jam memakai "at": at 8 o\'clock, at half past seven.',
      { in: ['"in" untuk bulan, tahun, dan bagian hari (in May, in the morning), bukan jam.'], on: ['"on" untuk hari dan tanggal (on Monday), bukan jam.'] }, t('a1.prep-time')),
    mc(1, 'Pilih kata yang tepat.', 'There ___ two cats under the table.', [['are', true], ['is', '"There is" untuk satu benda. "two cats" jamak.'], ['have', 'Untuk "ada" dalam bahasa Inggris memakai there is/there are, bukan "have".']],
      'There are + benda jamak: There are two cats.', t('a1.there-is')),
    mc(1, 'Pilih kata yang tepat.', 'This is Budi. ___ bike is red.', [['His', true], ['Her', '"her" untuk perempuan. Budi laki-laki.'], ['He', '"he" adalah subjek. Untuk menunjukkan milik dipakai "his".']],
      'Milik laki-laki memakai "his": His bike is red.', t('a1.possessives')),
    mc(1, 'Pilih jawaban pendek yang tepat.', '"Can you swim?" "Yes, I ___."', [['can', true], ['do', 'Pertanyaan memakai "can", jadi jawaban pendeknya juga "can".'], ['am', 'Pertanyaan tidak memakai to be. Jawaban pendek mengulang kata bantu pertanyaannya: can.']],
      'Jawaban pendek mengulang kata bantu: Can you ...? → Yes, I can. / No, I can\'t.', t('a1.can')),
    mc(1, 'Jam menunjukkan 7:30. Bagaimana mengatakannya?', "It's ___.", [['half past seven', true], ['half past six', 'Itu 6:30. Jangan terjemahkan "setengah delapan" kata demi kata.'], ['seven past half', 'Urutannya terbalik: half past seven.']],
      '7:30 = half past seven (setengah jam lewat dari jam tujuh). Dalam bahasa Indonesia disebut "setengah delapan".', t('a1.time')),
    fill(1, "She ___ eat meat. She is a vegetarian.", ["doesn't", 'does not'], 'Negatif simple present untuk she: does not (doesn\'t) + bentuk dasar: She doesn\'t eat meat.',
      { "don't": ['"don\'t" untuk I, you, we, they. "She" memakai "doesn\'t".'], "isn't": ['"eat" adalah kata kerja biasa, jadi negatifnya memakai doesn\'t, bukan isn\'t.'], not: ['Bahasa Inggris butuh kata bantu: She doesn\'t eat ..., bukan "She not eat".'] },
      { topic: 'a1.do-does', prompt: 'Lengkapi dengan bentuk negatif yang tepat.' }),
  ],
  reading: [
    [
      read(1, A1_SARI, 'How old is Sari?', [['Twelve', true], ['Six', 'Six adalah jam ia bangun (six o\'clock).'], ['Seven', 'Seven adalah jam sekolah mulai.']], 'Teks: "I am twelve years old."', R),
      read(1, A1_SARI, 'How does Sari go to school?', [['She walks.', true], ['By bus.', 'Teks tidak menyebut bus.'], ['Her father drives her.', 'Teks tidak menyebut ayahnya mengantar.']], 'Teks: "I walk to school with my friend Lina."', R),
      read(1, A1_SARI, 'What time does school start?', [["At seven o'clock.", true], ["At six o'clock.", 'Jam enam Sari bangun, bukan sekolah mulai.'], ["At twelve o'clock.", 'Twelve adalah umur Sari.']], 'Teks: "School starts at seven."', R),
      read(1, A1_SARI, 'Which sentence is true?', [['Dimas can ride a bike.', true], ['Dimas can play badminton.', 'Teks: "Dimas can\'t play badminton."'], ['Sari lives alone.', 'Sari tinggal bersama orang tua dan adiknya.']], 'Teks: "he can ride a bike."', R),
    ],
    [
      read(1, A1_CAFE, 'When is the café closed?', [['On Sunday.', true], ['On Monday.', 'Kafe buka Monday to Saturday.'], ['On Saturday.', 'Saturday termasuk hari buka.']], 'Teks: "Closed on Sunday."', R),
      read(1, A1_CAFE, 'How much is a coffee?', [['Rp10.000', true], ['Rp8.000', 'Rp8.000 adalah harga teh.'], ['Rp12.000', 'Rp12.000 adalah harga jus jeruk.']], 'Teks: "coffee Rp10.000".', R),
      read(1, A1_CAFE, 'What time does the café close?', [['At 9 p.m.', true], ['At 7 a.m.', 'Jam 7 pagi kafe buka.'], ['At 7 p.m.', 'Teks menyebut 9 p.m., bukan 7 p.m.']], 'Teks: "7 a.m. to 9 p.m." Kafe tutup pukul 9 malam.', R),
      read(1, A1_CAFE, 'Who eats for free?', [['Children under five.', true], ['Everybody on Saturday.', 'Teks tidak menyebut makan gratis di hari Sabtu.'], ['People who buy coffee.', 'Teks tidak menyebut itu.']], 'Teks: "Children under five eat for free!"', R),
    ],
  ],
  listening: [
    [
      listen(1, A1_MEET, 'Where is Tom from?', [['London', true], ['Harapan', 'Harapan adalah nama sekolah tempat ia mengajar.'], ['Jakarta', 'Jakarta tidak disebut.']], 'Tom: "I\'m from London."', L),
      listen(1, A1_MEET, 'What does Tom teach?', [['English and music', true], ['Art', 'Art adalah yang dipelajari Maya.'], ['Only English', 'Tom juga mengajar musik: "I teach English and music."']], 'Tom: "I teach English and music."', L),
      listen(1, A1_MEET, 'How does Tom go to work?', [['By bike', true], ['By car', 'Tom: "I don\'t have a car."'], ['On foot', 'Tom tidak berjalan kaki; ia naik sepeda.']], 'Tom: "I ride my bike to work."', L),
      listen(1, A1_MEET, 'Who is Maya?', [['A student', true], ['A teacher', 'Yang guru adalah Tom.'], ["Tom's sister", 'Maya adalah teman Tom: "my friend Maya".']], 'Tom: "She is a student. She studies art at the university."', L),
    ],
    [
      listen(1, A1_BUS, 'What time does the bus leave?', [['10:15', true], ['10:00', 'Jam 10 adalah waktu harus sudah di gerbang.'], ['12:30', '12:30 adalah waktu berhenti makan siang.']], '"The bus ... leaves at ten fifteen."', L),
      listen(1, A1_BUS, 'Which gate does the bus leave from?', [['Gate 3', true], ['Gate 4', 'Empat adalah lama perjalanan (four hours).'], ['Gate 10', 'Ten adalah jam (ten fifteen).']], '"... from gate three."', L),
      listen(1, A1_BUS, 'How long is the trip?', [['About four hours', true], ['About three hours', 'Three adalah nomor gerbang.'], ['About ten hours', 'Ten adalah jam keberangkatan.']], '"The trip takes about four hours."', L),
      listen(1, A1_BUS, 'When is the lunch stop?', [['12:30', true], ['12:00', 'Pengumuman menyebut twelve thirty.'], ['10:30', 'Tidak ada yang terjadi pukul 10:30.']], '"There is a stop for lunch at twelve thirty."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis 4–6 kalimat untuk memperkenalkan dirimu: nama, umur, tempat tinggal, dan satu hal yang kamu suka.',
      minWords: 25,
      mustInclude: ["Memakai am, is, atau are:: am | is | are |'m ", "Menyebut nama (My name is ... / I am ...)::my name|i am|i'm", 'Menyebut kesukaan (like / love)::like|love'],
      model: 'Hello! My name is Rudi. I am fourteen years old. I live in Medan with my family. I like football and I love fried rice. My best friend is Andi.',
    },
    {
      prompt: 'Tulis 4–6 kalimat tentang hari biasamu: jam berapa kamu bangun, kapan berangkat sekolah atau kerja, dan apa yang kamu lakukan sore hari.',
      minWords: 25,
      mustInclude: ["Menyebut jam (at six, at 7 o'clock, ...):: at ", 'Memakai kata kerja simple present (get up, go, have, ...)::get up|go |goes|eat|have |study|play|watch', 'Menyebut waktu (every day, in the morning, ...)::every|in the morning|in the afternoon|in the evening'],
      model: "I get up at five o'clock every day. I have breakfast with my mother. I go to school at six thirty. In the afternoon, I play football with my friends. In the evening, I study and watch TV.",
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ A2
const A2_EMAIL = "Hi Nadia, I'm writing from Yogyakarta! We arrived on Tuesday evening after a long train journey. The hotel is small but very clean, and it's near Malioboro Street. Yesterday we visited Borobudur. We got up at four o'clock to see the sunrise. It was beautiful, but very crowded. Tomorrow we're going to take a cooking class, and on Saturday we're flying back to Jakarta because it's faster than the train. See you next week! Fitri";
const A2_LIBRARY = "RIVERSIDE LIBRARY: NEW RULES FROM 1 MARCH. You must show your library card when you borrow books. You can borrow up to five books for two weeks. You don't have to pay for books that are one or two days late, but after that it costs Rp1.000 a day. Please don't eat in the reading room. You can drink water. Children under ten must come with an adult.";
const A2_VOICEMAIL = "Hi Rudi, it's Dewi. I'm calling about Saturday. The film starts at seven, not eight, so let's meet at half past six in front of the cinema. I'm going to buy the tickets online tonight, so you don't have to bring money for them. But please bring some snacks, because the ones at the cinema are really expensive! Call me back if you can't come. Bye!";
const A2_WEATHER = "Good morning! Here's the weather for today. In Jakarta, it's going to be hot and sunny this morning, about thirty-three degrees. But in the afternoon there will be heavy rain, so don't forget your umbrella. In Bandung it's cooler, around twenty-four degrees, with some clouds. Tomorrow will be sunny everywhere, so it's a great day for the beach.";

const A2: LevelBank = {
  grammar: [
    mc(2, 'Pilih kata yang tepat.', 'I ___ at home yesterday evening.', [['was', true], ['were', '"were" untuk you, we, they. "I" memakai "was".'], ['am', '"yesterday" menunjukkan masa lampau, jadi bukan "am".']],
      'Masa lampau to be: I/he/she/it was; you/we/they were.', t('a2.past-be')),
    fill(2, 'They ___ a film at home last night. (watch)', ['watched'], 'Kejadian selesai di masa lampau (last night): watch + -ed = watched.',
      { watch: ['"last night" butuh bentuk lampau: watched.'], watching: ['"watching" butuh was/were di depannya. Kejadian selesai memakai simple past: watched.'], watches: ['"watches" adalah simple present. "last night" butuh simple past.'] },
      { topic: 'a2.past-regular', prompt: 'Lengkapi dengan bentuk lampau kata kerja dalam kurung.' }),
    mc(2, 'Pilih bentuk yang tepat.', 'We ___ to Bali last year.', [['went', true], ['goed', '"go" tak beraturan; bentuk lampaunya "went", bukan ditambah -ed.'], ['go', '"last year" butuh bentuk lampau.']],
      '"go" adalah kata kerja tak beraturan: go → went → gone.', t('a2.past-irregular')),
    mc(2, 'Pilih kata yang tepat untuk pertanyaan ini.', '___ you see the match on Saturday?', [['Did', true], ['Were', '"see" adalah kata kerja biasa. Pertanyaan lampau dengan kata kerja biasa memakai "did".'], ['Do', '"on Saturday" di sini sudah lewat, jadi memakai bentuk lampau "did".']],
      'Pertanyaan simple past: Did + subjek + bentuk dasar. Did you see ...?', t('a2.past-irregular')),
    mc(2, 'Pilih bentuk yang tepat.', 'Shh! The baby ___.', [['is sleeping', true], ['sleeps', 'Simple present untuk kebiasaan. "Shh!" menunjukkan sesuatu yang sedang terjadi sekarang.'], ['sleep', 'Subjek tunggal butuh to be + -ing untuk kejadian yang sedang berlangsung.']],
      'Kejadian yang sedang berlangsung sekarang memakai present continuous: is sleeping.', t('a2.present-continuous')),
    mc(2, 'Pilih bentuk yang tepat.', 'Look at those dark clouds! It ___ rain.', [['is going to', true], ['going to', 'Butuh to be sebelum "going to": It is going to rain.'], ['is go to', 'Bentuknya "is going to", bukan "is go to".']],
      'Prediksi berdasarkan bukti yang terlihat sekarang (awan gelap) memakai be going to.', t('a2.future')),
    mc(2, 'Pilih bentuk yang tepat.', 'This bag is ___ than that one.', [['cheaper', true], ['more cheap', '"cheap" kata satu suku; perbandingannya cukup ditambah -er.'], ['cheapest', '"cheapest" adalah superlative (paling), dan tidak dipakai dengan "than".']],
      'Kata sifat satu suku kata: tambah -er + than. cheap → cheaper than.', t('a2.comparatives')),
    mc(2, 'Pilih kata yang tepat.', 'How ___ water do you drink every day?', [['much', true], ['many', '"many" untuk benda yang bisa dihitung. "water" tidak bisa dihitung.'], ['a lot', '"How a lot" tidak dipakai dalam pertanyaan.']],
      'Benda tak terhitung (water, rice, money) memakai "How much".', t('a2.countable')),
    mc(2, 'Pilih bentuk yang tepat.', 'I was cooking dinner when the phone ___.', [['rang', true], ['was ringing', 'Kejadian singkat yang memotong kegiatan panjang memakai simple past.'], ['rings', 'Kalimat ini tentang masa lampau, jadi bukan simple present.']],
      'Past continuous (was cooking) untuk kegiatan yang sedang berlangsung; simple past (rang) untuk kejadian singkat yang memotongnya.', t('a2.past-continuous')),
    mc(2, 'Pilih kata yang tepat.', "You ___ wear a helmet on a motorbike. It's the law.", [['must', true], ["mustn't", '"mustn\'t" berarti dilarang. Hukum justru mewajibkan helm.'], ["don't have to", '"don\'t have to" berarti tidak wajib. Padahal ini aturan hukum.']],
      'Kewajiban (aturan/hukum) memakai must atau have to.', t('a2.must')),
    mc(2, 'Pilih kata yang tepat.', 'I have a headache. "You ___ take a break."', [['should', true], ["shouldn't", 'Maknanya terbalik: saran yang tepat untuk sakit kepala adalah istirahat.'], ['should to', '"should" langsung diikuti bentuk dasar, tanpa "to".']],
      'Saran: should + bentuk dasar. You should take a break.', t('a2.should')),
    mc(2, 'Pilih kalimat yang benar.', null, [['She is always late for class.', true], ['She always is late for class.', 'Dengan to be, kata frekuensi diletakkan SETELAH to be: is always.'], ['Always she is late for class.', 'Kata frekuensi tidak diletakkan di awal kalimat seperti ini.']],
      'Kata frekuensi diletakkan setelah to be (She is always late) tetapi sebelum kata kerja biasa (She always arrives late).', t('a2.frequency')),
  ],
  reading: [
    [
      read(2, A2_EMAIL, 'How did Fitri travel to Yogyakarta?', [['By train', true], ['By plane', 'Pesawat untuk pulang ke Jakarta pada hari Sabtu.'], ['By bus', 'Bus tidak disebut.']], 'Teks: "We arrived on Tuesday evening after a long train journey."', R),
      read(2, A2_EMAIL, 'Why did they get up at four o\'clock?', [['To see the sunrise', true], ['To catch a train', 'Mereka sudah tiba hari Selasa.'], ['To go to a cooking class', 'Kelas memasak adalah rencana besok.']], 'Teks: "We got up at four o\'clock to see the sunrise."', R),
      read(2, A2_EMAIL, 'What is Fitri going to do tomorrow?', [['Take a cooking class', true], ['Visit Borobudur', 'Borobudur sudah dikunjungi kemarin (Yesterday).'], ['Fly to Jakarta', 'Mereka terbang pada hari Sabtu.']], 'Teks: "Tomorrow we\'re going to take a cooking class."', R),
      read(2, A2_EMAIL, 'Why are they flying back to Jakarta?', [["It's faster than the train.", true], ["It's cheaper than the train.", 'Teks tidak membandingkan harga.'], ['The hotel is near the airport.', 'Hotel dekat Malioboro, bukan bandara.']], 'Teks: "because it\'s faster than the train."', R),
    ],
    [
      read(2, A2_LIBRARY, 'How many books can you borrow?', [['Up to five', true], ['Up to two', 'Two adalah lama peminjaman (two weeks).'], ['Up to ten', 'Ten adalah batas umur anak yang harus didampingi.']], 'Teks: "You can borrow up to five books for two weeks."', R),
      read(2, A2_LIBRARY, 'Your book is one day late. What do you pay?', [['Nothing', true], ['Rp1.000', 'Denda baru berlaku setelah terlambat lebih dari dua hari.'], ['Rp2.000', 'Satu atau dua hari terlambat tidak didenda.']], 'Teks: "You don\'t have to pay for books that are one or two days late."', R),
      read(2, A2_LIBRARY, 'What is allowed in the reading room?', [['Drinking water', true], ['Eating lunch', 'Teks: "Please don\'t eat in the reading room."'], ['Nothing at all', 'Minum air diperbolehkan: "You can drink water."']], 'Teks: "You can drink water."', R),
      read(2, A2_LIBRARY, 'Who must come with an adult?', [['Children under ten', true], ['All children', 'Hanya anak di bawah sepuluh tahun.'], ['New members', 'Teks tidak menyebut anggota baru.']], 'Teks: "Children under ten must come with an adult."', R),
    ],
  ],
  listening: [
    [
      listen(2, A2_VOICEMAIL, 'What time does the film start?', [['At seven', true], ['At eight', 'Dewi: "seven, not eight".'], ['At half past six', 'Setengah tujuh adalah waktu bertemu.']], 'Dewi: "The film starts at seven, not eight."', L),
      listen(2, A2_VOICEMAIL, 'Where are they going to meet?', [['In front of the cinema', true], ["At Dewi's house", 'Rumah Dewi tidak disebut.'], ['At the station', 'Stasiun tidak disebut.']], 'Dewi: "let\'s meet at half past six in front of the cinema."', L),
      listen(2, A2_VOICEMAIL, 'Who is going to buy the tickets?', [['Dewi', true], ['Rudi', 'Dewi yang membeli: "I\'m going to buy the tickets online tonight."'], ['They will buy them at the cinema.', 'Tiket dibeli online malam ini.']], 'Dewi: "I\'m going to buy the tickets online tonight."', L),
      listen(2, A2_VOICEMAIL, 'What should Rudi bring?', [['Some snacks', true], ['Money for the tickets', 'Dewi: "you don\'t have to bring money for them."'], ['The tickets', 'Dewi yang membeli tiketnya.']], 'Dewi: "please bring some snacks".', L),
    ],
    [
      listen(2, A2_WEATHER, 'What will the weather be like in Jakarta this afternoon?', [['Heavy rain', true], ['Hot and sunny', 'Itu cuaca pagi ini.'], ['Cool and cloudy', 'Itu cuaca di Bandung.']], '"in the afternoon there will be heavy rain".', L),
      listen(2, A2_WEATHER, 'What is the temperature in Bandung?', [['About 24 degrees', true], ['About 33 degrees', '33 derajat adalah suhu Jakarta.'], ['About 23 degrees', 'Penyiar menyebut twenty-four.']], '"In Bandung it\'s cooler, around twenty-four degrees".', L),
      listen(2, A2_WEATHER, 'What does the speaker tell people in Jakarta to do?', [['Take an umbrella', true], ['Go to the beach today', 'Pantai disarankan untuk besok.'], ['Stay at home in the morning', 'Tidak ada saran seperti itu.']], '"don\'t forget your umbrella".', L),
      listen(2, A2_WEATHER, 'What will the weather be like tomorrow?', [['Sunny everywhere', true], ['Rainy in Jakarta', 'Hujan hanya untuk sore ini.'], ['Cloudy in Bandung', 'Berawan adalah cuaca Bandung hari ini.']], '"Tomorrow will be sunny everywhere".', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis 5–7 kalimat tentang liburan atau perjalanan terakhirmu: ke mana, dengan siapa, apa yang kamu lakukan, dan bagaimana rasanya.',
      minWords: 40,
      mustInclude: ['Memakai was atau were:: was | were ', 'Memakai kata kerja lampau (went, visited, ate, ...)::went|visited|ate |saw |bought|took|stayed|played|had ', 'Menyebut waktu lampau (last ..., ... ago, yesterday)::last |ago|yesterday'],
      model: "Last December, I went to Malang with my family. We stayed at my uncle's house for five days. The weather was cool and the city was very beautiful. We visited a big apple farm and ate fresh apples. On the last day, we bought some souvenirs for our friends. It was a wonderful holiday, and I want to go back next year.",
    },
    {
      prompt: 'Tulis 5–7 kalimat untuk seorang teman tentang rencanamu akhir pekan depan, lalu beri satu saran untuknya.',
      minWords: 40,
      mustInclude: ["Memakai going to atau will::going to| will |'ll ", 'Memberi saran dengan should::should', 'Menyebut waktu mendatang (next ..., tomorrow, on Saturday, ...)::next |tomorrow|on saturday|on sunday|this weekend'],
      model: "Hi Andi! Next weekend I'm going to visit my grandparents in Bogor. On Saturday we're going to cook a big lunch together. I think it will rain in the afternoon, so we will probably stay at home and play cards. On Sunday I'm going to come back by train. You should come with me next time, because my grandmother's food is amazing!",
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ B1
const B1_BAKER = "When Rina Wijaya lost her office job in 2020, she didn't know what to do. She had always loved baking, so she started selling cakes to her neighbours from her kitchen. At first she only sold ten cakes a week, but people who tried them told their friends, and soon she was getting orders from all over the city. Two years later, she opened a small café. Rina says the hardest part wasn't the baking but learning how to manage money. \"If I had known how difficult it would be, I might not have started,\" she laughs. \"But I'm really glad I did.\" Today the café employs six people, and Rina has just published a recipe book.";
const B1_BRAIN = "Many people believe that we use only ten per cent of our brains. It's a popular idea, and it often appears in films and advertisements. However, scientists say it's simply not true. Brain scans show that we use almost every part of the brain, even when we're sleeping. Different areas are more active during different tasks: when you read, for example, parts of the left side of the brain are especially busy. So where does the myth come from? Nobody is completely sure, but it may have started with writers in the early twentieth century who misunderstood what researchers had said.";
const B1_FLIGHT = "Hello, this is a message for Mr Hartono. It's Sinta from Green Travel. I'm afraid your flight to Medan on Friday has been cancelled because of the bad weather. We've booked you on the next flight, which leaves on Saturday morning at eight fifteen. We've also moved your hotel booking to Saturday night, so you won't lose any money. If the new time isn't convenient, please call me before five o'clock today and I'll find another option.";
const B1_TOWN = "When I was a child, my town used to be very quiet. There used to be only one shop, and everyone knew each other. We didn't use to have a cinema, so on Saturday nights we watched films at my uncle's house. Now the town has grown a lot. There's a big shopping centre, and the roads are always busy. I'm happy that young people have more jobs here now, but I miss the quiet evenings and the feeling that everybody was your neighbour.";

const B1: LevelBank = {
  grammar: [
    mc(3, 'Pilih bentuk yang tepat.', '___ to Lombok?', [['Have you ever been', true], ['Did you ever been', '"Did" diikuti bentuk dasar, bukan "been".'], ['Have you ever went', 'Setelah "have" dipakai bentuk ketiga: been/gone, bukan "went".']],
      'Pengalaman sepanjang hidup memakai present perfect: Have you ever been to ...?', t('b1.present-perfect')),
    mc(3, 'Pilih bentuk yang tepat.', 'She ___ here since 2019.', [['has worked', true], ['works', '"since 2019" menunjukkan keadaan dari masa lalu sampai sekarang, jadi memakai present perfect.'], ['is working', 'Present continuous tidak dipakai dengan "since + titik waktu".']],
      'Since + titik waktu (since 2019) memakai present perfect: She has worked here since 2019.', t('b1.present-perfect')),
    mc(3, 'Pilih bentuk yang tepat.', "I ___ for you for an hour! Where were you?", [['have been waiting', true], ['am waiting', '"for an hour" mengukur lamanya sampai sekarang, jadi butuh present perfect (continuous).'], ['waited', 'Penantiannya baru saja berakhir dan masih terasa sekarang; simple past memutus hubungan itu.']],
      'Kegiatan yang berlangsung dari masa lalu sampai sekarang, dengan penekanan pada lamanya: have been + -ing.', t('b1.pp-continuous')),
    mc(3, 'Pilih bentuk yang tepat.', 'If it rains tomorrow, we ___ the picnic.', [['will cancel', true], ['would cancel', '"would" untuk pengandaian yang tidak nyata (second conditional). Hujan besok adalah kemungkinan nyata.'], ['cancelled', 'Akibat di masa depan tidak memakai bentuk lampau.']],
      'First conditional untuk kemungkinan nyata: If + present, will + bentuk dasar.', t('b1.conditionals')),
    mc(3, 'Pilih bentuk yang tepat.', 'If I ___ more free time, I would learn Japanese.', [['had', true], ['have', 'Bagian akibat memakai "would", jadi bagian if memakai bentuk lampau (second conditional).'], ['would have', '"would" tidak dipakai di bagian if.']],
      'Second conditional (pengandaian yang tidak nyata sekarang): If + past, would + bentuk dasar.', t('b1.conditionals')),
    mc(3, 'Pilih kata yang tepat.', "She ___ be at home. I've just seen her at the market.", [["can't", true], ['must', 'Buktinya (baru melihatnya di pasar) justru menunjukkan ia TIDAK di rumah.'], ['should', '"should" untuk saran atau harapan, bukan kesimpulan dari bukti.']],
      'Kesimpulan yakin bahwa sesuatu tidak mungkin: can\'t + bentuk dasar.', t('b1.deduction')),
    mc(3, 'Pilih kata yang tepat.', 'The woman ___ lives next door is a doctor.', [['who', true], ['which', '"which" untuk benda atau hewan, bukan orang.'], ['whose', '"whose" menunjukkan kepemilikan (whose car ...).']],
      'Relative clause untuk orang memakai "who" (atau "that").', t('b1.relative')),
    mc(3, 'Pilih bentuk yang tepat.', 'I ___ play football every weekend when I was a child.', [['used to', true], ['use to', 'Dalam kalimat positif bentuknya "used to".'], ['was used to', '"be used to" berarti terbiasa dengan sesuatu, dan diikuti -ing atau kata benda.']],
      'Kebiasaan di masa lalu yang sekarang tidak lagi: used to + bentuk dasar.', t('b1.used-to')),
    mc(3, 'Pilih bentuk yang tepat.', "I'm really interested in ___ photography.", [['learning', true], ['learn', 'Setelah preposisi (in) dipakai bentuk -ing.'], ['to learn', 'Setelah preposisi tidak dipakai to-infinitive.']],
      'Preposisi (in, at, of, about) selalu diikuti gerund (-ing): interested in learning.', t('b1.gerund-infinitive')),
    mc(3, 'Pilih question tag yang tepat.', "You're coming to the party, ___?", [["aren't you", true], ["don't you", 'Kalimatnya memakai "are" (You\'re), jadi tag-nya memakai "are", bukan "do".'], ['are you', 'Kalimat positif butuh tag negatif.']],
      'Kalimat positif dengan "are" → tag negatif "aren\'t you?".', t('b1.question-tags')),
    mc(3, 'Pilih kata yang tepat.', 'This coffee is ___ to drink. Let it cool down.', [['too hot', true], ['hot enough', '"hot enough to drink" berarti sudah cukup panas dan bisa diminum, bertentangan dengan "Let it cool down".'], ['very hot', '"very" tidak bisa diikuti "to + kata kerja" untuk menyatakan akibat. Pakai "too".']],
      '"too + kata sifat + to ..." berarti terlalu ... sehingga tidak bisa.', t('b1.too-enough')),
    fill(3, 'I decided ___ abroad next year. (study)', ['to study'], '"decide" diikuti to-infinitive: decided to study.',
      { studying: ['"decide" diikuti to + bentuk dasar, bukan -ing.'], study: ['Setelah "decided" butuh "to": decided to study.'], 'to studying': ['Setelah "to" pada pola ini dipakai bentuk dasar: to study.'] },
      { topic: 'b1.gerund-infinitive', prompt: 'Lengkapi dengan bentuk kata kerja yang tepat dari kata dalam kurung.' }),
  ],
  reading: [
    [
      read(3, B1_BAKER, 'Why did Rina start selling cakes?', [['She had lost her job and loved baking.', true], ['Her neighbours asked her to open a café.', 'Tetangga adalah pembeli pertamanya, bukan yang memintanya membuka kafe.'], ['She wanted to write a recipe book.', 'Buku resep baru saja terbit, jauh setelah usahanya dimulai.']], 'Teks: "When Rina ... lost her office job ... She had always loved baking, so she started selling cakes".', R),
      read(3, B1_BAKER, 'How did her business grow?', [['Customers recommended her cakes to their friends.', true], ['She advertised on television.', 'Iklan tidak disebut.'], ['She opened a café first.', 'Kafe dibuka dua tahun kemudian.']], 'Teks: "people who tried them told their friends, and soon she was getting orders from all over the city."', R),
      read(3, B1_BAKER, 'According to Rina, what was the hardest part?', [['Learning to manage money', true], ['Baking the cakes', 'Teks: "the hardest part wasn\'t the baking".'], ['Finding staff', 'Karyawan disebut, tetapi bukan sebagai bagian tersulit.']], 'Teks: "the hardest part wasn\'t the baking but learning how to manage money."', R),
      read(3, B1_BAKER, 'How does Rina feel about her decision now?', [['She is glad she started.', true], ['She regrets starting the business.', 'Ia memang berkata mungkin tidak akan mulai, tetapi lalu menambahkan "But I\'m really glad I did."'], ['She wants to go back to an office job.', 'Teks tidak menyebut itu.']], 'Teks: "But I\'m really glad I did."', R),
    ],
    [
      read(3, B1_BRAIN, 'What is the main purpose of the text?', [['To show that a popular belief is false', true], ['To explain how to improve your memory', 'Teks tidak memberi tips mengingat.'], ['To advertise a new film', 'Film disebut hanya sebagai tempat mitos itu muncul.']], 'Teks menjelaskan bahwa anggapan "kita hanya memakai 10% otak" tidak benar.', R),
      read(3, B1_BRAIN, 'What do brain scans show?', [['We use almost every part of the brain.', true], ['We use only ten per cent of the brain.', 'Itu mitosnya, dan menurut ilmuwan tidak benar.'], ['The brain stops working when we sleep.', 'Teks: "even when we\'re sleeping" kita memakai hampir seluruh otak.']], 'Teks: "Brain scans show that we use almost every part of the brain".', R),
      read(3, B1_BRAIN, 'In the text, the word "busy" means ...', [['active', true], ['tired', 'Bagian otak itu bekerja, bukan lelah.'], ['damaged', 'Tidak ada yang rusak; bagian itu sedang bekerja.']], '"especially busy" = sangat aktif ketika kita membaca.', R),
      read(3, B1_BRAIN, 'Where may the myth have come from?', [['Writers who misunderstood researchers', true], ['Modern brain scans', 'Hasil pemindaian otak justru membantah mitos itu.'], ['A famous advertisement', 'Iklan menyebarkan mitosnya, tetapi bukan asal-usulnya.']], 'Teks: "it may have started with writers ... who misunderstood what researchers had said."', R),
    ],
  ],
  listening: [
    [
      listen(3, B1_FLIGHT, 'Why was the flight cancelled?', [['Because of the bad weather', true], ['Because the plane was full', 'Tidak disebut.'], ['Because Mr Hartono asked to change it', 'Ia justru baru diberi tahu lewat pesan ini.']], '"your flight ... has been cancelled because of the bad weather."', L),
      listen(3, B1_FLIGHT, 'When is the new flight?', [['Saturday at 8:15 a.m.', true], ['Friday at 8:15 a.m.', 'Penerbangan hari Jumat dibatalkan.'], ['Saturday at 5 p.m.', 'Jam lima adalah batas waktu menelepon kembali hari ini.']], '"the next flight, which leaves on Saturday morning at eight fifteen."', L),
      listen(3, B1_FLIGHT, 'What has happened to the hotel booking?', [['It has been moved to Saturday night.', true], ['It has been cancelled.', 'Pemesanan dipindahkan, bukan dibatalkan.'], ["It hasn't changed.", 'Sinta berkata: "We\'ve also moved your hotel booking".']], '"We\'ve also moved your hotel booking to Saturday night".', L),
      listen(3, B1_FLIGHT, 'What should Mr Hartono do if the new time is a problem?', [['Call Sinta before five o\'clock today', true], ['Go to the airport on Friday', 'Penerbangan hari Jumat sudah dibatalkan.'], ['Email the hotel', 'Tidak disebut.']], '"please call me before five o\'clock today".', L),
    ],
    [
      listen(3, B1_TOWN, 'How many shops were there in the town in the past?', [['Only one', true], ['None', '"There used to be only one shop".'], ['Many', 'Kota itu dulu sangat sepi dengan satu toko saja.']], '"There used to be only one shop".', L),
      listen(3, B1_TOWN, 'Where did they watch films on Saturday nights?', [["At the speaker's uncle's house", true], ['At the cinema', '"We didn\'t use to have a cinema".'], ['At the shopping centre', 'Pusat belanja baru ada sekarang.']], '"on Saturday nights we watched films at my uncle\'s house."', L),
      listen(3, B1_TOWN, 'What is good about the changes, according to the speaker?', [['Young people have more jobs.', true], ['The roads are quieter.', 'Jalan sekarang justru selalu ramai.'], ['Everybody knows each other.', 'Itu yang ia rindukan dari masa lalu.']], '"I\'m happy that young people have more jobs here now".', L),
      listen(3, B1_TOWN, 'How does the speaker feel about the town today?', [['Mixed: happy about some changes but missing the past', true], ['Completely happy', 'Ia berkata "but I miss the quiet evenings".'], ['Angry about all the changes', 'Ia senang anak muda punya lebih banyak pekerjaan.']], 'Ada "I\'m happy that ..." lalu "but I miss ...": perasaannya campur.', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis email 6–8 kalimat kepada teman tentang hal yang sudah kamu lakukan akhir-akhir ini, dan apa yang akan kamu lakukan jika punya waktu luang.',
      minWords: 60,
      mustInclude: ["Memakai present perfect (have/has + bentuk ketiga):: have | has |'ve ", 'Memakai kalimat if (conditional)::if ', 'Memakai since, for, already, atau just:: since | for |already| just '],
      model: 'Hi Maya, how are you? I have been very busy lately. I have just finished my final exams, and I have already started a part-time job at a bookshop near my house. I have worked there for two weeks, and I really enjoy it. If I have some free time next month, I will visit you in Semarang. If I had more money, I would travel to Japan with you! Write back soon!',
    },
    {
      prompt: 'Tulis 6–8 kalimat tentang bagaimana hidupmu atau kotamu berubah: apa yang dulu biasa terjadi, apa yang berbeda sekarang, dan pendapatmu.',
      minWords: 60,
      mustInclude: ["Memakai used to atau didn't use to::used to|use to", 'Membandingkan dengan sekarang (now, today, these days, ...):: now |today|these days|nowadays', 'Memberi pendapat (I think, In my opinion, I feel, ...)::i think|in my opinion|i feel|i believe'],
      model: "When I was in primary school, I used to walk to school with my friends every morning. We didn't use to have smartphones, so we played outside after school until it got dark. My town used to be quiet, with lots of rice fields. Now there are new houses and shops everywhere, and the roads are much busier. These days I take a motorbike taxi to school because it is too far to walk. In my opinion, some changes are good, but I miss the quiet afternoons.",
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ B2
const B2_FASHION = "Every year, the fashion industry produces more than a hundred billion items of clothing, and a large share of them is thrown away within a year. Cheap clothes have made fashion accessible to people who could never have afforded it before, and many shoppers argue that this is a good thing. Critics, however, point out that the low prices hide real costs. Garment workers are often paid very little, and the production of synthetic fabrics releases large amounts of carbon dioxide. Some brands have responded by launching 'sustainable' collections, but environmental groups say these are often little more than marketing. The most effective solution, they argue, is also the simplest: buy fewer clothes and wear them for longer.";
const B2_LANGUAGES = "For a long time, researchers believed that children were the only truly successful language learners and that adults had missed their chance. More recent studies paint a more complicated picture. Children do have an advantage when it comes to pronunciation: those who start young are far more likely to sound like native speakers. But adults often make faster progress in the early stages, because they can use learning strategies, understand grammar explanations and draw on what they already know. What seems to matter most at any age is not talent but the amount of meaningful contact with the language. An adult who reads, listens and speaks every day will usually overtake a child who has two short lessons a week.";
const B2_MUSEUM = "Good afternoon, and welcome to the Museum of Science. Before you start, a few pieces of information. The museum closes at half past five today, but the café on the ground floor closes earlier, at four thirty. Photography is allowed in most galleries, but please don't use flash in the space gallery, as it can damage the older exhibits. Our free guided tour starts at two o'clock from the main entrance and lasts about forty-five minutes. If you've bought a ticket for the planetarium show, please arrive ten minutes before it begins, because late arrivals can't be admitted.";
const B2_FARMER = "People often ask me whether I regret leaving my job at the bank to become a farmer. Honestly, I don't. If I'd stayed, I'd probably be earning more money now, but I wouldn't be nearly as healthy or as calm. That said, farming isn't the peaceful dream some people imagine. Last year we lost half our crop to floods, and there were months when I wasn't sure we'd survive. What got us through was the local community: neighbours lent us equipment, and customers paid in advance for the next harvest. So my advice to anyone thinking of doing the same is this: don't romanticise it, and build your network before you leave the city.";

const B2: LevelBank = {
  grammar: [
    mc(3, 'Pilih bentuk yang tepat.', 'The new bridge ___ next year.', [['will be built', true], ['will build', 'Jembatan tidak membangun dirinya sendiri; subjeknya dikenai tindakan, jadi pasif.'], ['is building', 'Bentuk aktif, padahal jembatanlah yang dibangun.']],
      'Pasif masa depan: will be + bentuk ketiga.', t('b2.passive')),
    mc(3, 'Pilih bentuk yang tepat.', 'This song ___ millions of times since it came out.', [['has been streamed', true], ['has streamed', 'Lagu tidak memutar dirinya sendiri; butuh bentuk pasif.'], ['was streaming', 'Past continuous aktif tidak cocok dengan "since" dan makna pasif.']],
      'Present perfect pasif: has/have been + bentuk ketiga. "since" menuntut present perfect.', t('b2.passive')),
    mc(4, 'Pilih bentuk yang tepat.', 'The documents ___ when the fire started.', [['were being checked', true], ['were checking', 'Dokumen tidak bisa memeriksa; ia yang diperiksa.'], ['had checked', 'Bentuk aktif, padahal dokumen dikenai tindakan.']],
      'Pasif past continuous (sedang diperiksa saat kejadian lain terjadi): was/were being + bentuk ketiga.', t('b2.passive')),
    mc(3, 'Pilih kata yang tepat.', 'I need to ___ my laptop repaired before Monday.', [['get', true], ['make', '"make + objek" diikuti bentuk dasar (make someone do), bukan bentuk ketiga.'], ['let', '"let" berarti mengizinkan dan diikuti bentuk dasar.']],
      'Causative: get/have + objek + bentuk ketiga = meminta orang lain melakukannya untuk kita.', t('b2.causative')),
    mc(3, 'Pilih bentuk yang tepat.', 'We had our house ___ last month.', [['painted', true], ['paint', 'Pola have + objek + bentuk ketiga untuk jasa orang lain.'], ['to paint', 'Pola causative ini tidak memakai to-infinitive.']],
      'have + objek + bentuk ketiga: We had our house painted (oleh tukang cat).', t('b2.causative')),
    mc(4, 'Pilih bentuk yang tepat.', 'Last week Dina said, "I\'m leaving tomorrow." → Last week Dina said that she ___ the next day.', [['was leaving', true], ['is leaving', 'Kejadiannya sudah lewat ("Last week" ... "the next day"), jadi tense dimundurkan.'], ['will leave', '"will" dimundurkan menjadi "would", dan kalimat aslinya pun tidak memakai will.']],
      'Reported speech: present continuous mundur menjadi past continuous; "tomorrow" menjadi "the next day".', t('b2.reported')),
    mc(4, 'Pilih bentuk yang tepat.', 'He asked me where ___.', [['I lived', true], ['did I live', 'Pertanyaan tidak langsung memakai susunan kalimat biasa, tanpa did.'], ['do I live', 'Pertanyaan tidak langsung memakai susunan biasa dan tense dimundurkan.']],
      'Pertanyaan tidak langsung: kata tanya + subjek + kata kerja (where I lived).', t('b2.reported')),
    mc(3, 'Pilih kata yang tepat.', 'She told ___ to wait outside.', [['us', true], ['to us', '"tell" langsung diikuti orangnya, tanpa "to".'], ['for us', '"tell" tidak memakai "for" sebelum orangnya.']],
      '"tell + orang + to + bentuk dasar": She told us to wait.', t('b2.reported')),
    mc(4, 'Pilih bentuk yang tepat.', 'If we had left earlier, we ___ the train.', [['would have caught', true], ['would catch', 'Kalimat tentang masa lalu yang tidak terjadi butuh would have + bentuk ketiga.'], ['had caught', '"had" dipakai di bagian if, bukan di bagian akibat.']],
      'Third conditional: If + had + bentuk ketiga, would have + bentuk ketiga.', t('b2.third-conditional')),
    mc(4, 'Pilih bentuk yang tepat.', 'If I ___ about the meeting, I would have come.', [['had known', true], ['knew', 'Bagian akibat "would have come" menuntut "had + bentuk ketiga" di bagian if.'], ['would know', '"would" tidak dipakai di bagian if.']],
      'Third conditional untuk penyesalan di masa lalu: If I had known ..., I would have ...', t('b2.third-conditional')),
    mc(4, 'Pilih bentuk yang tepat.', 'If I had studied medicine, I ___ a doctor now.', [['would be', true], ['would have been', '"now" menunjukkan akibat di masa sekarang, jadi bukan would have been.'], ['will be', 'Ini pengandaian yang tidak nyata, jadi bukan "will".']],
      'Mixed conditional: penyebab di masa lalu (had studied), akibat sekarang (would be ... now).', t('b2.mixed-conditionals')),
    fix(4, 'The letter was wrote by my grandfather.', ['The letter was written by my grandfather.'], 'Pasif memakai bentuk ketiga: write → wrote → written.',
      { 'The letter was writing by my grandfather.': ['"writing" membuatnya aktif continuous. Pasif butuh bentuk ketiga: written.'], 'The letter wrote by my grandfather.': ['Pasif butuh to be: was written.'] }, t('b2.passive')),
  ],
  reading: [
    [
      read(4, B2_FASHION, 'According to the text, what is one benefit of cheap clothing?', [['More people can afford fashionable clothes.', true], ['Garment workers earn more.', 'Teks: pekerja garmen "are often paid very little".'], ['The clothes last longer.', 'Teks justru menyebut banyak pakaian dibuang dalam setahun.']], 'Teks: "Cheap clothes have made fashion accessible to people who could never have afforded it before".', R),
      read(4, B2_FASHION, 'What do critics mean by the "real costs" hidden by low prices?', [['Harm to workers and to the environment', true], ['Extra taxes paid by shoppers', 'Pajak tidak disebut.'], ['High delivery charges', 'Ongkos kirim tidak disebut.']], 'Kalimat berikutnya menjelaskannya: upah pekerja rendah dan emisi karbon dioksida.', R),
      read(4, B2_FASHION, "How do environmental groups view 'sustainable' collections?", [['With suspicion, as mostly marketing', true], ['As the best possible solution', 'Mereka menyebut solusi lain sebagai yang paling efektif.'], ['As too expensive for most shoppers', 'Harga koleksi itu tidak dibahas.']], 'Teks: "these are often little more than marketing".', R),
      read(4, B2_FASHION, 'What do environmental groups recommend?', [['Buying fewer clothes and wearing them longer', true], ['Buying only from sustainable collections', 'Koleksi itu justru diragukan.'], ['Recycling all old clothes', 'Daur ulang tidak disebut.']], 'Teks: "buy fewer clothes and wear them for longer."', R),
    ],
    [
      read(4, B2_LANGUAGES, 'What did researchers use to believe?', [['Only children could really succeed at learning languages.', true], ['Adults learn languages faster than children.', 'Itu temuan baru tentang tahap awal, bukan anggapan lama.'], ['Age makes no difference at all.', 'Anggapan lama justru menekankan usia.']], 'Teks: "researchers believed that children were the only truly successful language learners".', R),
      read(4, B2_LANGUAGES, 'In which area do children have a clear advantage?', [['Pronunciation', true], ['Understanding grammar explanations', 'Itu keunggulan orang dewasa.'], ['Progress in the early stages', 'Orang dewasa sering lebih cepat di tahap awal.']], 'Teks: "Children do have an advantage when it comes to pronunciation".', R),
      read(4, B2_LANGUAGES, 'Why do adults often progress faster at first?', [['They can use strategies and what they already know.', true], ['They have more free time than children.', 'Waktu luang tidak disebut.'], ['They have better pronunciation.', 'Pelafalan justru keunggulan anak-anak.']], 'Teks: "because they can use learning strategies, understand grammar explanations and draw on what they already know."', R),
      read(4, B2_LANGUAGES, "What is the writer's main point?", [['Regular, meaningful contact with a language matters more than age.', true], ['Children are always better language learners.', 'Teks membantah anggapan itu.'], ['Grammar lessons are the key to success.', 'Penjelasan tata bahasa hanya satu keunggulan, bukan inti argumennya.']], 'Teks: "What seems to matter most at any age is not talent but the amount of meaningful contact with the language."', R),
    ],
  ],
  listening: [
    [
      listen(3, B2_MUSEUM, 'When does the café close?', [['At 4:30', true], ['At 5:30', 'Pukul 5:30 museumnya yang tutup.'], ['At 2:00', 'Pukul 2 tur dimulai.']], '"the café ... closes earlier, at four thirty."', L),
      listen(4, B2_MUSEUM, "Why can't visitors use flash in the space gallery?", [['It can damage the older exhibits.', true], ['It disturbs other visitors.', 'Alasan itu tidak disebut.'], ['Photography is not allowed anywhere.', 'Foto boleh di sebagian besar galeri.']], '"don\'t use flash in the space gallery, as it can damage the older exhibits."', L),
      listen(3, B2_MUSEUM, 'How long is the guided tour?', [['About 45 minutes', true], ['About two hours', '"two o\'clock" adalah jam mulai, bukan lamanya.'], ['About ten minutes', 'Sepuluh menit terkait datang lebih awal ke planetarium.']], '"lasts about forty-five minutes."', L),
      listen(4, B2_MUSEUM, 'What happens if you arrive late for the planetarium show?', [["You can't go in.", true], ['You can join the next show for free.', 'Tidak disebut.'], ['You have to buy a new ticket.', 'Tidak disebut; yang disebut hanya tidak boleh masuk.']], '"late arrivals can\'t be admitted."', L),
    ],
    [
      listen(4, B2_FARMER, 'Does the speaker regret becoming a farmer?', [['No', true], ['Yes, because he earns less money', 'Ia mengakui penghasilannya mungkin lebih kecil, tetapi tetap tidak menyesal.'], ['Yes, because of the floods', 'Banjir membuat tahun lalu berat, tetapi ia tidak menyesal.']], '"Honestly, I don\'t."', L),
      listen(4, B2_FARMER, 'What does the speaker say about money?', [["He'd probably earn more if he had stayed at the bank.", true], ['He earns more now than before.', 'Kebalikannya: "I\'d probably be earning more money now" seandainya tetap di bank.'], ['Money was why he left the bank.', 'Ia tidak menyebut alasan itu.']], '"If I\'d stayed, I\'d probably be earning more money now".', L),
      listen(4, B2_FARMER, 'What helped them through the difficult year?', [['Support from the local community', true], ['A loan from the bank', 'Pinjaman bank tidak disebut.'], ['Help from the government', 'Pemerintah tidak disebut.']], '"What got us through was the local community".', L),
      listen(4, B2_FARMER, "What is the speaker's advice?", [['Be realistic and build contacts before leaving the city.', true], ['Never leave a job in the city.', 'Ia sendiri tidak menyesal pindah.'], ['Buy your own equipment first.', 'Peralatan dipinjamkan tetangga; ia tidak menyarankan membeli.']], '"don\'t romanticise it, and build your network before you leave the city."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis esai pendek 8–10 kalimat: Apakah sekolah sebaiknya melarang ponsel di kelas? Berikan dua alasan, satu pandangan yang berlawanan, dan kesimpulan.',
      minWords: 90,
      mustInclude: ['Memakai penghubung kontras (however, although, on the other hand, ...)::however|although|on the other hand|whereas', 'Memakai penghubung alasan atau akibat (because, therefore, as a result, ...)::because|therefore|as a result|this means', 'Menutup dengan kesimpulan (In conclusion, Overall, To sum up, ...)::in conclusion|overall|to sum up|all in all'],
      model: 'Many schools are now discussing whether mobile phones should be banned in class. In my opinion, a ban is a good idea, for two main reasons. First, phones are a constant distraction: students who receive notifications during lessons find it harder to concentrate, and as a result their marks often fall. Second, a phone-free classroom encourages students to talk to each other and to the teacher. On the other hand, some people argue that phones are useful learning tools, because students can look up information quickly. However, schools can provide tablets for this purpose when they are actually needed. In conclusion, I believe phones should stay in bags during lessons.',
    },
    {
      prompt: 'Tulis email formal 8–10 kalimat kepada pengelola gedung tentang masalah fasilitas (misalnya lift rusak atau air mati): jelaskan masalahnya, akibatnya, dan apa yang kamu minta.',
      minWords: 90,
      mustInclude: ['Membuka secara formal (Dear ...)::dear ', 'Memakai kalimat pasif (has been repaired, was reported, ...)::been repaired|been fixed|been reported|was reported|were told|was told|is being|been checked|was broken', 'Meminta dengan sopan (I would be grateful, Could you, I would appreciate, ...)::would be grateful|could you|would appreciate|i would like to request'],
      model: 'Dear Building Manager, I am writing to complain about the lift in Block C, which has been out of order for over a week. The problem was reported to the reception on Monday, but it has still not been repaired. As a result, elderly residents and parents with small children have to climb six floors several times a day. Yesterday, one of my neighbours fell on the stairs while she was carrying her shopping. I would be grateful if you could arrange for the lift to be repaired as soon as possible. Could you also let residents know when the work will be completed? I look forward to hearing from you.',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ C1
const C1_CHOICE = "It seems obvious that more choice is better. If a supermarket offers fifty kinds of jam rather than five, surely customers are more likely to find one they like. Yet a well-known experiment suggested otherwise. Shoppers who were shown twenty-four varieties were more likely to stop and look, but considerably less likely to buy anything than those who were shown only six. The psychologist Barry Schwartz has argued that an abundance of options can lead to anxiety, paralysis and, once a decision is finally made, regret, since we can always imagine that an alternative would have been better. That said, later attempts to replicate the jam study have produced mixed results, and it now seems that the effect depends heavily on context: when people already know what they want, a wide selection rarely does any harm.";
const C1_TREES = "City planners have long valued trees for their appearance, but a growing body of research indicates that their benefits are far more than cosmetic. Streets lined with mature trees can be several degrees cooler in summer, reducing the demand for air conditioning and, with it, energy bills. Trees also absorb rainwater, which lessens the risk of flash floods, a significant advantage in cities such as Jakarta. Perhaps less obviously, several studies have linked access to green space with lower levels of stress and even faster recovery from illness. Critics point out that trees are costly to maintain and that their roots can damage pavements and pipes. Nonetheless, most economists who have attempted to quantify the matter conclude that, over their lifetime, urban trees return considerably more than they cost.";
const C1_MULTITASK = "In today's session I want to challenge a common assumption about multitasking. Many of us believe we can do two things at once, answering emails while listening in a meeting, for instance. But what the brain is actually doing, in most cases, is switching rapidly between tasks, and each switch carries a small cost. Individually these costs are tiny, perhaps a fraction of a second, but they add up. In one study, people who were frequently interrupted took about a quarter longer to complete a task and made noticeably more errors. Interestingly, the people who rated themselves as the best multitaskers tended to perform worst. The practical lesson isn't that we should never multitask, but that for demanding work we'd be better off blocking out uninterrupted time.";
const C1_TOURISM = "I take the point that tourism brings money into the region, and I'm certainly not suggesting we close the island to visitors. But we have to be honest about the costs. The water supply simply wasn't designed for three times the population, and in the dry season some villages are now without running water for days at a time. What I'd propose is a modest tourist tax, say a couple of dollars a night, ring-fenced for infrastructure. Visitors I've spoken to are, on the whole, perfectly happy to pay, provided they can see where the money goes. The real resistance, frankly, has come from a handful of large hotel chains.";

const C1: LevelBank = {
  grammar: [
    mc(4, 'Pilih bentuk yang tepat.', 'Not only ___ late, but he also forgot the tickets.', [['did he arrive', true], ['he arrived', 'Setelah "Not only" di awal kalimat, subjek dan kata bantu dibalik.'], ['he did arrive', 'Urutannya harus kata bantu lalu subjek: did he arrive.']],
      'Inversi setelah ungkapan negatif di awal kalimat: Not only + kata bantu + subjek.', t('c1.inversion')),
    mc(4, 'Pilih bentuk yang tepat.', 'Never ___ such a beautiful sunset.', [['have I seen', true], ['I have seen', '"Never" di awal kalimat menuntut inversi: have I seen.'], ['I saw', 'Butuh inversi, dan pengalaman sepanjang hidup memakai present perfect.']],
      'Never di awal kalimat + inversi: Never have I seen ...', t('c1.inversion')),
    mc(5, 'Pilih kata yang tepat.', '___ had I sat down than the phone rang.', [['No sooner', true], ['Hardly', '"Hardly" berpasangan dengan "when", bukan "than".'], ['As soon as', '"As soon as" tidak memicu inversi dan tidak dipakai dengan "than".']],
      '"No sooner ... than" dengan inversi: No sooner had I sat down than ...', t('c1.inversion')),
    mc(4, 'Pilih kata yang tepat.', 'It was my sister ___ found the keys, not me.', [['who', true], ['what', '"what" tidak dipakai dalam pola It was + orang + ...'], ['which', '"which" untuk benda, bukan orang.']],
      'Cleft sentence: It was + orang + who/that + ... untuk menekankan pelakunya.', t('c1.cleft')),
    mc(4, 'Pilih kata yang tepat.', '___ I need is a long holiday.', [['What', true], ['That', '"That I need" tidak bisa menjadi subjek seperti ini. Pakai "What".'], ['It', '"It I need" tidak gramatikal.']],
      'Cleft dengan What: What I need is ... (Yang saya butuhkan adalah ...).', t('c1.cleft')),
    mc(4, 'Kalimat mana yang paling tepat (berhati-hati) untuk laporan ilmiah?', null, [['The results suggest that the treatment may reduce stress.', true], ['The results prove that the treatment reduces stress.', '"prove" terlalu mutlak untuk satu penelitian.'], ['The treatment definitely reduces stress.', '"definitely" terlalu yakin untuk tulisan akademis.']],
      'Hedging memakai suggest, may, appear, tend to agar klaim sesuai dengan bukti.', t('c1.hedging')),
    mc(4, 'Pilih bentuk yang tepat.', 'These findings ___ to support the original theory.', [['appear', true], ['are appearing', '"appear" bermakna "tampaknya" tidak dipakai dalam bentuk continuous.'], ['seem like', '"seem like" informal dan tidak diikuti to-infinitive.']],
      'appear/seem + to-infinitive adalah cara hedging yang umum: The findings appear to support ...', t('c1.hedging')),
    mc(4, 'Pilih kata yang tepat.', "The government decided to raise taxes, which surprised many people. → The government's ___ to raise taxes surprised many people.", [['decision', true], ['deciding', '"deciding" tidak bisa dipakai setelah bentuk kepemilikan seperti ini dengan to-infinitive.'], ['decide', '"decide" kata kerja; setelah "The government\'s" butuh kata benda.']],
      'Nominalisation: decide → decision. Kata benda membuat kalimat lebih padat dan formal.', t('c1.nominalisation')),
    mc(4, 'Pilih kata yang tepat.', 'There has been a sharp ___ the number of online shoppers.', [['increase in', true], ['increase on', '"increase" diikuti "in" untuk hal yang bertambah.'], ['increasing of', 'Bentuk kata bendanya "increase", dan preposisinya "in".']],
      'increase in + hal yang bertambah (an increase in the number of ...).', t('c1.nominalisation')),
    mc(4, 'Pilih kata yang tepat.', '___ the heavy rain, the match went ahead.', [['Despite', true], ['Although', '"Although" diikuti klausa lengkap (although it rained heavily).'], ['However', '"However" menghubungkan dua kalimat, bukan diikuti frasa kata benda.']],
      'Despite + kata benda/-ing; although + subjek + kata kerja.', t('c1.discourse')),
    mc(4, 'Pilih kata yang tepat.', 'The project was very expensive. ___, it was finished on time.', [['Nevertheless', true], ['Despite', '"Despite" harus diikuti kata benda, bukan koma.'], ['Although', '"Although" memulai anak kalimat, bukan kalimat baru setelah titik.']],
      'Nevertheless (= however) menghubungkan dua kalimat yang berlawanan.', t('c1.discourse')),
    fix(4, 'Despite of the delay, we arrived on time.', ['Despite the delay, we arrived on time.', 'In spite of the delay, we arrived on time.'], '"Despite" tidak memakai "of". Bandingkan: in spite of.',
      { 'Although the delay, we arrived on time.': ['"Although" butuh klausa lengkap: Although there was a delay, ...'] }, t('c1.discourse')),
  ],
  reading: [
    [
      read(5, C1_CHOICE, 'What did the jam experiment appear to show?', [['A wider choice attracted attention but led to fewer purchases.', true], ['A wider choice led to more sales.', 'Kebalikannya: lebih kecil kemungkinan membeli.'], ['Shoppers preferred to look at six varieties.', 'Pilihan 24 justru lebih menarik perhatian.']], 'Teks: lebih mungkin "stop and look, but considerably less likely to buy anything".', R),
      read(5, C1_CHOICE, 'According to Schwartz, why might people feel regret?', [['They can always imagine a better alternative.', true], ['The products are too expensive.', 'Harga tidak dibahas.'], ['They had too few options.', 'Argumennya justru tentang pilihan yang terlalu banyak.']], 'Teks: "since we can always imagine that an alternative would have been better."', R),
      read(5, C1_CHOICE, 'What does "That said" introduce?', [['A qualification of the argument so far', true], ['An example supporting Schwartz', 'Kalimat setelahnya justru membatasi argumen sebelumnya.'], ['A summary repeating the main point', 'Kalimat itu memberi informasi baru yang membatasi.']], '"That said" = meskipun begitu; kalimat itu membatasi klaim sebelumnya dengan hasil replikasi yang bercampur.', R),
      read(5, C1_CHOICE, "What is the writer's final position?", [['Too much choice is a problem only in some situations.', true], ['More choice is always harmful.', 'Penulis menyebut efeknya "depends heavily on context".'], ['The jam study was dishonest.', 'Hasil replikasi bercampur, tetapi tidak ada tuduhan ketidakjujuran.']], 'Teks: "the effect depends heavily on context".', R),
    ],
    [
      read(5, C1_TREES, 'The phrase "far more than cosmetic" suggests that trees ...', [['have practical benefits as well as looking good', true], ['are mainly decorative', 'Ungkapan itu justru menolak anggapan bahwa pohon hanya hiasan.'], ['are too expensive to plant', 'Biaya baru dibahas belakangan.']], '"cosmetic" = hanya untuk penampilan; "far more than cosmetic" = manfaatnya jauh lebih dari itu.', R),
      read(5, C1_TREES, 'How can trees reduce energy bills?', [['They cool streets, so less air conditioning is needed.', true], ['They produce electricity.', 'Tidak disebut.'], ['They protect houses from wind.', 'Tidak disebut.']], 'Teks: "cooler in summer, reducing the demand for air conditioning and, with it, energy bills."', R),
      read(5, C1_TREES, 'Which disadvantage of trees is mentioned?', [['They are costly to maintain and their roots can cause damage.', true], ['They increase the risk of flooding.', 'Pohon justru mengurangi risiko banjir.'], ['They make streets hotter.', 'Pohon membuat jalan lebih sejuk.']], 'Teks: "trees are costly to maintain and ... their roots can damage pavements and pipes."', R),
      read(5, C1_TREES, 'What do most economists conclude?', [['Over time, the benefits of urban trees outweigh the costs.', true], ['The costs are greater than the benefits.', 'Kebalikan dari kesimpulan mereka.'], ['The value of trees cannot be measured.', 'Mereka justru mencoba mengukurnya dan sampai pada kesimpulan.']], 'Teks: "urban trees return considerably more than they cost."', R),
    ],
  ],
  listening: [
    [
      listen(4, C1_MULTITASK, 'According to the speaker, what does the brain usually do when we "multitask"?', [['It switches rapidly between tasks.', true], ['It does both tasks at the same time.', 'Itu anggapan umum yang dibantah pembicara.'], ['It ignores one of the tasks.', 'Tidak disebut.']], '"what the brain is actually doing ... is switching rapidly between tasks".', L),
      listen(5, C1_MULTITASK, 'What was found about people who were frequently interrupted?', [['They took about 25% longer and made more errors.', true], ['They finished faster but made more errors.', 'Mereka justru lebih lama.'], ['They made fewer errors.', '"made noticeably more errors".']], '"took about a quarter longer ... and made noticeably more errors."', L),
      listen(5, C1_MULTITASK, 'What was surprising about people who rated themselves as the best multitaskers?', [['They tended to perform worst.', true], ['They performed best.', 'Kebalikannya.'], ['They were never interrupted.', 'Tidak disebut.']], '"the people who rated themselves as the best multitaskers tended to perform worst."', L),
      listen(5, C1_MULTITASK, 'What does the speaker recommend?', [['Keeping uninterrupted time for demanding work', true], ['Never multitasking at all', '"The practical lesson isn\'t that we should never multitask".'], ['Practising multitasking to improve', 'Tidak disebut.']], '"for demanding work we\'d be better off blocking out uninterrupted time."', L),
    ],
    [
      listen(5, C1_TOURISM, "What is the speaker's attitude to tourism?", [['She accepts its benefits but wants its costs addressed.', true], ['She wants to stop tourism on the island.', '"I\'m certainly not suggesting we close the island to visitors."'], ['She thinks it brings no money.', '"I take the point that tourism brings money into the region".']], 'Ia mengakui manfaatnya ("I take the point ...") lalu menyoroti biayanya ("But we have to be honest about the costs").', L),
      listen(5, C1_TOURISM, 'What problem does the speaker mention?', [['Water shortages in the dry season', true], ['Traffic jams on the island', 'Tidak disebut.'], ['A lack of hotels', 'Hotel disebut hanya sebagai pihak yang menolak.']], '"some villages are now without running water for days at a time."', L),
      listen(5, C1_TOURISM, 'What does "ring-fenced" suggest about the tax?', [['The money would be reserved for one purpose.', true], ['The tax would be very high.', 'Ia menyebutnya "modest".'], ['The tax would be temporary.', 'Tidak disebut.']], '"ring-fenced for infrastructure" = dananya dikhususkan untuk infrastruktur.', L),
      listen(5, C1_TOURISM, 'Who has opposed the idea most?', [['A few large hotel chains', true], ['Tourists', 'Wisatawan "perfectly happy to pay".'], ['The villagers', 'Tidak disebut menolak.']], '"The real resistance, frankly, has come from a handful of large hotel chains."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis esai 120–180 kata: "Universitas sebaiknya gratis untuk semua." Sajikan argumen kedua sisi dan pendapatmu dengan bahasa yang berhati-hati (hedging).',
      minWords: 120,
      mustInclude: ['Memakai hedging (may, might, tend to, likely, appear, suggest)::may |might|tend to|likely|appear|suggest', 'Memakai penghubung kontras (however, although, whereas, nevertheless)::however|although|whereas|nevertheless|nonetheless', 'Menutup dengan kesimpulan (In conclusion, On balance, Overall, ...)::in conclusion|on balance|overall|to conclude'],
      model: 'Whether university education should be free for everyone is a question that divides opinion. Supporters argue that free tuition would widen access, since talented students from poorer families might otherwise be discouraged by the prospect of large debts. A more educated population is also likely to benefit the economy as a whole. However, critics point out that free tuition is far from free: the cost is simply transferred to taxpayers, many of whom never attend university themselves. There is also some evidence that, where tuition is free, places tend to be limited, which may in fact disadvantage the very students the policy is meant to help. On balance, I would argue that generous grants for students from low-income families are likely to be fairer than making university free for all, as they direct public money to where it is most needed.',
    },
    {
      prompt: 'Tulis laporan singkat 120–180 kata untuk kepala sekolah atau atasan tentang hasil survei kepuasan (angkanya boleh kamu buat sendiri): temuan utama, satu masalah, dan rekomendasi.',
      minWords: 120,
      mustInclude: ['Menyebut angka atau proporsi (per cent, majority, half, ...)::%|per cent|percent|majority|half|third|quarter', 'Memakai nominalisation (improvement, satisfaction, increase, ...)::improvement|decision|increase|decrease|satisfaction|reduction|introduction|development', 'Memberi rekomendasi (recommend, should, propose, ...)::recommend|should|suggest that|propose'],
      model: 'This report summarises the results of a survey on student satisfaction with the school library, which was completed by 240 students in May. Overall, satisfaction was high: around 78 per cent of respondents described the service as good or excellent, and the majority praised the helpfulness of the staff. However, there was considerable dissatisfaction with the opening hours. Almost half of the students said that the library closes too early for them to use it after extra classes, and several suggested that this has led to a reduction in the time they spend reading. In addition, a quarter of respondents reported difficulty finding a quiet place to study during exam periods. It is therefore recommended that the library extend its opening hours until six o\'clock on weekdays. The introduction of a bookable silent study room should also be considered.',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ C2
const C2_BOREDOM = "Boredom has had a bad press. We are encouraged to fill every idle moment, and the smartphone has made it easier than ever to do so: a queue, a train journey, even a pause in conversation can be filled with a scroll. Yet a modest but growing literature suggests that boredom is not merely an unpleasant state to be eliminated. Participants in one study who were first given a deliberately tedious task, copying numbers from a telephone directory, subsequently produced more original ideas in a creativity test than those who had not. The researchers speculate that boredom prompts the mind to wander in search of stimulation, and that this wandering is fertile ground for new connections. None of this amounts to a case for tedium as such; chronic boredom is associated with poorer mental health. The point, rather, is that the reflex to banish every empty minute may come at a cost we have barely begun to count.";
const C2_TRANSLATION = "It is often said that something is always lost in translation, and the claim is true as far as it goes. Puns rarely survive the journey from one language to another, and the connotations that cling to a word in its native setting are frequently stripped away. What the cliché neglects is that translation can also add. A skilled translator, forced to find equivalents for idioms that have none, may produce phrasing as vivid as the original, and readers in the target language sometimes notice resonances that the author never intended. Some writers have even remarked, only half in jest, that they prefer their work in translation. To treat translation solely as a process of loss, then, is to misunderstand it: it is better seen as a negotiation, in which something is surrendered and something else, occasionally, is gained.";
const C2_AI = "Let me say at the outset that I'm not opposed to artificial intelligence in schools. It would be rather odd if I were, given that I've spent the last decade building educational software. My concern is narrower. When a tool can produce a passable essay in seconds, the essay ceases to be a reliable window into a student's thinking, and we've barely begun to grapple with what that means for assessment. Some colleagues have responded by banning the tools outright, which strikes me as both unenforceable and something of a missed opportunity. I'd rather we shifted the weight of assessment towards things a machine can't do on a student's behalf: explaining their reasoning aloud, revising in response to feedback, defending a position in discussion.";
const C2_HALL = "I've been asked whether the restoration was worth the expense, and I suppose the honest answer is that it depends on what you think a building is for. Judged purely in financial terms, the figures aren't encouraging: we spent roughly twice the original estimate, and visitor numbers, while up, won't cover that for decades, if ever. But that's rather like asking whether a library pays for itself. The hall is where the town council first met, where people sheltered during the floods of 1952, where half the town got married. Lose that, and you lose something that doesn't appear on a balance sheet. Mind you, I'd be the first to admit that we could have managed the budget a great deal better.";

const C2: LevelBank = {
  grammar: [
    mc(5, 'Pilih bentuk yang tepat.', 'The committee insisted that he ___ immediately.', [['resign', true], ['resigns', 'Setelah "insist that" dalam gaya formal dipakai subjunctive: bentuk dasar tanpa -s.'], ['resigned', 'Subjunctive tidak memakai bentuk lampau meskipun kalimat utamanya lampau.']],
      'Subjunctive setelah insist/demand/recommend that: bentuk dasar untuk semua subjek (that he resign).', t('c2.subjunctive')),
    mc(5, 'Pilih kata yang tepat.', '___ I known about the problem, I would have acted sooner.', [['Had', true], ['If', '"If I known" tidak gramatikal; butuh "If I had known".'], ['Were', '"Were I known" berarti pasif dan tidak bermakna di sini.']],
      'Inversi conditional formal: Had I known ... = If I had known ...', t('c2.subjunctive')),
    mc(5, 'Pilih bentuk yang tepat.', 'It is essential that every applicant ___ a valid passport.', [['have', true], ['having', 'Setelah "that" butuh kata kerja finit; subjunctive memakai bentuk dasar.'], ['to have', '"that" + subjek tidak diikuti to-infinitive.']],
      'Subjunctive setelah It is essential/vital that: bentuk dasar (that every applicant have).', t('c2.subjunctive')),
    mc(5, 'Pilih kata yang tepat.', 'She can speak four languages, and so ___ her brother.', [['can', true], ['does', 'Kalimat pertama memakai "can", jadi "so" mengulang "can".'], ['is', 'Kata bantu yang diulang harus sama dengan kalimat pertama: can.']],
      'Ellipsis dengan so + kata bantu + subjek, kata bantunya mengikuti kalimat pertama.', t('c2.ellipsis')),
    mc(5, 'Pilih jawaban yang tepat.', '"Will it rain tomorrow?" "I hope ___."', [['not', true], ['no', '"I hope no" tidak gramatikal.'], ["don't", '"I hope don\'t" tidak gramatikal.']],
      'Substitusi klausa negatif: I hope not (= I hope it won\'t rain). Bandingkan: I hope so.', t('c2.ellipsis')),
    mc(5, 'Pilih kata yang tepat.', 'These shoes are too small. Do you have any bigger ___?', [['ones', true], ['one', '"shoes" jamak, jadi penggantinya "ones".'], ['it', '"it" merujuk pada benda tertentu yang sudah disebut, bukan jenis yang lain.']],
      'Substitusi: one/ones menggantikan kata benda yang sudah disebut (bigger ones = bigger shoes).', t('c2.ellipsis')),
    mc(5, 'Pilih kata yang tepat.', 'Please ___ close attention to the safety instructions.', [['pay', true], ['do', '"do attention" bukan kolokasi bahasa Inggris.'], ['make', '"make attention" bukan kolokasi bahasa Inggris.']],
      'Kolokasi: pay attention (to something).', t('c2.collocations')),
    mc(5, 'Pilih kata yang tepat.', 'The storm caused ___ damage to the coastal villages.', [['extensive', true], ['strong', '"strong damage" bukan kolokasi alami.'], ['big', '"big damage" tidak alami; damage tak terhitung dan berpasangan dengan extensive/severe/serious.']],
      'Kolokasi: extensive/serious/severe damage.', t('c2.collocations')),
    mc(5, 'Pilih kata yang tepat.', 'It was ___ coincidence that we met in Tokyo.', [['sheer', true], ['strong', '"strong coincidence" tidak alami.'], ['deep', '"deep coincidence" tidak alami.']],
      'Kolokasi: sheer/pure coincidence (benar-benar kebetulan).', t('c2.collocations')),
    mc(5, 'Lina gagal ujian itu dua kali, lalu berkata: "The exam was a bit of a challenge." Apa maksudnya?', null, [['It was very difficult.', true], ['It was only slightly difficult.', 'Gagal dua kali menunjukkan "a bit of" dipakai merendah (understatement).'], ['It was easy.', 'Ia gagal dua kali; jelas tidak mudah.']],
      'Understatement: "a bit of a challenge" sengaja melunakkan sesuatu yang sebenarnya sangat sulit.', t('c2.understatement')),
    mc(5, '"His presentation wasn\'t exactly inspiring." Menurut pembicara, presentasinya ...', null, [['rather dull', true], ['very inspiring', '"not exactly" di sini menyindir: maknanya kebalikan dari inspiring.'], ['exactly on time', '"exactly" di sini bukan soal waktu.']],
      '"not exactly + kata sifat positif" adalah understatement yang berarti cukup buruk.', t('c2.understatement')),
    mc(5, 'Pilih kata yang tepat.', "You ___ have brought food. There's plenty here, but thank you!", [["needn't", true], ["mustn't", '"mustn\'t have" bukan bentuk modal perfect yang dipakai untuk masa lalu.'], ["can't", '"can\'t have brought" berarti "tidak mungkin membawa", padahal ia jelas membawanya.']],
      "needn't have + bentuk ketiga: sudah dilakukan, tetapi ternyata tidak perlu.", t('c2.modality')),
  ],
  reading: [
    [
      read(5, C2_BOREDOM, 'What does "Boredom has had a bad press" mean?', [['Boredom has generally been seen negatively.', true], ['Journalists have ignored boredom.', '"a bad press" adalah idiom tentang citra buruk, bukan soal liputan media saja.'], ['Boredom has recently become fashionable.', 'Kebalikannya.']], '"have a bad press" = dipandang buruk secara umum.', R),
      read(5, C2_BOREDOM, 'What did participants who copied numbers do afterwards?', [['They produced more original ideas.', true], ['They performed worse in a creativity test.', 'Mereka justru lebih kreatif.'], ['They refused to continue the study.', 'Tidak disebut.']], 'Teks: "subsequently produced more original ideas in a creativity test".', R),
      read(5, C2_BOREDOM, 'How do the researchers explain the result?', [['A wandering mind may form new connections.', true], ['They proved that boredom improves memory.', 'Mereka hanya "speculate", dan ingatan tidak dibahas.'], ['They blamed smartphones.', 'Ponsel disebut di awal, bukan sebagai penjelasan hasil penelitian.']], 'Teks: "boredom prompts the mind to wander ... fertile ground for new connections."', R),
      read(5, C2_BOREDOM, "Which statement best reflects the writer's conclusion?", [['Constantly avoiding boredom may have hidden costs.', true], ['People should be bored as often as possible.', 'Penulis: "None of this amounts to a case for tedium as such".'], ['Chronic boredom is good for mental health.', 'Teks menyebut kebosanan kronis terkait kesehatan mental yang lebih buruk.']], 'Teks: "the reflex to banish every empty minute may come at a cost".', R),
    ],
    [
      read(5, C2_TRANSLATION, 'How does the writer regard the claim that "something is always lost in translation"?', [['Partly true but incomplete', true], ['Completely false', 'Penulis: "the claim is true as far as it goes".'], ['The main argument of the text', 'Penulis justru melengkapinya dengan sisi lain.']], '"true as far as it goes" = benar sampai batas tertentu, tetapi belum lengkap.', R),
      read(5, C2_TRANSLATION, 'According to the text, what can translation add?', [['Vivid phrasing and new resonances', true], ['Extra chapters', 'Tidak disebut.'], ['Explanations of puns', 'Permainan kata justru jarang bertahan.']], 'Teks: "phrasing as vivid as the original ... resonances that the author never intended."', R),
      read(5, C2_TRANSLATION, '"only half in jest" suggests that these writers were ...', [['partly serious', true], ['joking completely', '"half in jest" = setengah bercanda, jadi setengah serius.'], ['angry with their translators', 'Mereka justru menyukai terjemahannya.']], '"only half in jest" = setengah bercanda, setengah serius.', R),
      read(5, C2_TRANSLATION, 'Which image does the writer prefer for translation?', [['A negotiation', true], ['A process of loss', 'Penulis menyebut pandangan itu "misunderstand".'], ['A word-for-word copy', 'Tidak disebut.']], 'Teks: "it is better seen as a negotiation".', R),
    ],
  ],
  listening: [
    [
      listen(5, C2_AI, 'Why does the speaker say it "would be rather odd" to oppose AI in schools?', [['Because of their own work on educational software', true], ['Because everyone already supports it', 'Tidak disebut.'], ['Because they are a student', 'Mereka membuat perangkat lunak pendidikan, bukan pelajar.']], '"given that I\'ve spent the last decade building educational software."', L),
      listen(5, C2_AI, "What is the speaker's main concern?", [["Essays may no longer show what a student really thinks.", true], ['AI is too expensive for schools.', 'Tidak disebut.'], ['Teachers will lose their jobs.', 'Tidak disebut.']], '"the essay ceases to be a reliable window into a student\'s thinking".', L),
      listen(5, C2_AI, 'How does the speaker view banning the tools?', [['Impossible to enforce and a lost opportunity', true], ['The best available solution', 'Kebalikannya.'], ['Necessary for a short time', 'Tidak disebut.']], '"both unenforceable and something of a missed opportunity."', L),
      listen(5, C2_AI, 'What does the speaker propose?', [['Assessing what students must do themselves, such as explaining their reasoning', true], ['Returning to handwritten essays only', 'Tidak disebut.'], ['Letting AI grade the essays', 'Tidak disebut.']], '"explaining their reasoning aloud, revising in response to feedback, defending a position in discussion."', L),
    ],
    [
      listen(5, C2_HALL, 'How did the restoration perform financially?', [['It cost about twice the estimate and may never pay for itself.', true], ['It stayed within the original budget.', '"we spent roughly twice the original estimate".'], ['It has already made a profit.', 'Pengunjung "won\'t cover that for decades, if ever".']], 'Biaya hampir dua kali perkiraan, dan pendapatan pengunjung tidak akan menutupinya dalam waktu dekat.', L),
      listen(5, C2_HALL, 'Why does the speaker mention a library?', [['To argue that some value is not financial', true], ['Because the hall will become a library', 'Tidak disebut.'], ['Because libraries cost even more', 'Bukan itu maksud perbandingannya.']], 'Perbandingan dengan perpustakaan menunjukkan bahwa nilai sebuah bangunan tidak selalu bisa diukur dengan uang.', L),
      listen(5, C2_HALL, 'What happened at the hall in 1952?', [['People took shelter there during floods.', true], ['The town council met there for the first time.', 'Itu disebut, tetapi tanpa tahun 1952.'], ['It was restored.', 'Restorasi adalah proyek sekarang.']], '"where people sheltered during the floods of 1952".', L),
      listen(5, C2_HALL, 'What does the speaker admit at the end?', [['The budget could have been managed much better.', true], ['The restoration was a mistake.', 'Ia tetap membela nilai restorasinya.'], ['Visitor numbers are falling.', 'Jumlah pengunjung justru naik ("while up").']], '"we could have managed the budget a great deal better."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis esai 150–220 kata: "Teknologi membuat kita lebih terhubung, tetapi lebih kesepian." Sejauh mana kamu setuju? Pakai gaya formal dan setidaknya satu inversi atau kalimat cleft.',
      minWords: 150,
      mustInclude: ['Memakai inversi atau cleft (Not only ..., Rarely ..., What is ..., It is precisely ...)::not only|rarely have|seldom|never before|no sooner|only when|only by|little do|what matters|what is less clear|what is striking|it is precisely', 'Memakai bahasa berhati-hati (arguably, to some extent, tend to, may, ...)::arguably|to some extent|tend to|it could be argued| may |might', 'Menutup dengan kesimpulan yang menimbang (On balance, Ultimately, ...)::on balance|ultimately|in the final analysis|all things considered|in conclusion'],
      model: 'It has become something of a commonplace that technology connects us more than ever while leaving us lonelier than before. There is, I think, some truth in this, though the claim is too sweeping as it stands. Not only can we now speak to relatives on the other side of the world at almost no cost, but people with rare illnesses or unusual interests can find communities that simply did not exist a generation ago. For them, the internet has arguably reduced isolation rather than deepened it. What is less clear is whether online contact can substitute for physical presence. Studies tend to suggest that heavy users of social media report greater loneliness, although it is difficult to establish which comes first: the loneliness or the scrolling. Ultimately, technology seems to amplify existing tendencies. Those who use it to arrange meetings are likely to benefit, whereas those who use it in place of them may well find the opposite. On balance, then, I agree only to a limited extent.',
    },
    {
      prompt: 'Tulis ulasan 150–220 kata tentang buku, film, atau tempat yang menurutmu dinilai terlalu tinggi atau terlalu rendah. Pakai setidaknya satu understatement atau ironi dan kolokasi yang tepat.',
      minWords: 150,
      mustInclude: ['Memakai understatement atau ironi (not exactly, hardly, a bit of a, not entirely, ...)::not exactly|hardly|a bit of a|not the most|not without|not entirely', 'Memakai kolokasi penilaian (widely praised, deeply moving, thoroughly convincing, ...)::highly|widely|deeply|bitterly|utterly|thoroughly', "Memberi rekomendasi akhir (I would recommend, worth, I wouldn't, ...)::recommend|worth|would not|wouldn't"],
      model: "Few films have been as widely praised in recent years as The Long Harbour, and I went to see it with high expectations. It is, admittedly, beautifully shot: the opening sequence over the misty coastline is genuinely striking, and the soundtrack is deeply atmospheric. The problem is that very little happens. The plot, such as it is, could be summarised in a sentence, and the dialogue is not exactly sparkling. At nearly three hours, the film is also a bit of a test of the audience's patience; several people near me were checking their phones well before the halfway point. To be fair, the lead actor gives a thoroughly convincing performance as a fisherman coming to terms with his father's death, and there are moments of real tenderness. But moments are not enough to sustain a feature film. If you have a strong interest in cinematography, it may be worth seeing on a large screen. Otherwise, I would recommend waiting until it appears on a streaming service, where you can at least pause it.",
    },
  ],
};

export const EXAM_BANK: Record<Cefr, LevelBank> = { A1, A2, B1, B2, C1, C2 };

/** Minutes per level exam: longer texts and writing tasks at higher levels. */
export const EXAM_MINUTES: Record<Cefr, number> = { A1: 30, A2: 30, B1: 35, B2: 40, C1: 40, C2: 45 };
