// Illustrated story exercises (Rilis 1). Each story is a few animated scenes
// with a recurring cast, every line read aloud with an Indonesian translation,
// then questions on what happened. Stories reuse only grammar the learner has
// met at that level, so they practise understanding rather than teach new rules.
// Story questions never set `focus`: they only make sense right after the story,
// so they stay out of remedial drills. Wrong options may still carry a tag, so a
// mistake here still points the learner to the right drill.
import type { Cefr, StoryActor, StoryCharacter, StoryLine, StoryPose, StoryScene } from '@/lib/content/types';
import { match, mc, para, tf, type Draft } from './dsl';

export interface StoryDraft {
  id: string;
  level: Cefr;
  title: string;
  summary: string;
  premium: boolean;
  characters: StoryCharacter[];
  scenes: StoryScene[];
  questions: Draft[];
}

// ---------------------------------------------------------------- cast
const C = {
  pijar: { id: 'pijar', name: 'Pijar', look: 'pijar', shirt: '#4b3fd6' },
  dimas: { id: 'dimas', name: 'Dimas', look: 'boy', shirt: '#0ea5e9', hair: '#1c1917', skin: '#f2c8a4' },
  sari: { id: 'sari', name: 'Sari', look: 'girl', shirt: '#ec4899', hair: '#1c1917', skin: '#f6d3b8' },
  emma: { id: 'emma', name: 'Ms Emma', look: 'woman', shirt: '#10b981', hair: '#b45309', skin: '#fde3d0' },
  ibu: { id: 'ibu', name: 'Ibu', look: 'woman', shirt: '#f59e0b', hair: '#1c1917', skin: '#f4d0b2', hijab: '#0f766e' },
  ayah: { id: 'ayah', name: 'Ayah', look: 'man', shirt: '#475569', hair: '#1c1917', skin: '#efc39f' },
  nenek: { id: 'nenek', name: 'Nenek', look: 'grandma', shirt: '#a855f7', hair: '#d4d4d8', skin: '#f3d2ba', hijab: '#e9d5ff' },
  joko: { id: 'joko', name: 'Pak Joko', look: 'man', shirt: '#ea580c', hair: '#1c1917', skin: '#ecbf99' },
  tom: { id: 'tom', name: 'Tom', look: 'man', shirt: '#2563eb', hair: '#a16207', skin: '#fde3d0' },
} satisfies Record<string, StoryCharacter>;

// ---------------------------------------------------------------- helpers
const say = (who: string, en: string, tr: string, pose?: StoryPose): StoryLine => ({ who, en, tr, ...(pose ? { pose } : {}) });
const tell = (en: string, tr: string): StoryLine => ({ who: 'narrator', en, tr });
const at = (who: string, where: StoryActor['at'], pose?: StoryPose, enter?: StoryActor['enter']): StoryActor => ({ who, at: where, ...(pose ? { pose } : {}), ...(enter ? { enter } : {}) });
const Q = 'Jawab pertanyaan tentang cerita.';
const S = { topic: 'skill.story' } as const;

export const stories: StoryDraft[] = [
  {
    id: 'story-first-day', level: 'A1', title: 'Hari Pertama Dimas', premium: false,
    summary: 'Dimas masuk sekolah baru, berkenalan dengan gurunya dan Sari, lalu bertemu Pijar.',
    characters: [C.dimas, C.emma, C.sari, C.pijar],
    scenes: [
      { backdrop: 'school', actors: [at('dimas', 'left', 'stand', 'left'), at('emma', 'right')], lines: [
        tell('It is Monday morning. Dimas is at a new school.', 'Hari Senin pagi. Dimas berada di sekolah baru.'),
        say('emma', "Good morning! I'm Ms Emma. I'm your English teacher.", 'Selamat pagi! Saya Bu Emma. Saya guru bahasa Inggrismu.', 'wave'),
        say('dimas', 'Good morning, Ms Emma. My name is Dimas.', 'Selamat pagi, Bu Emma. Nama saya Dimas.', 'happy'),
        say('emma', 'Nice to meet you, Dimas. Where are you from?', 'Senang bertemu denganmu, Dimas. Kamu dari mana?'),
        say('dimas', "I'm from Bandung.", 'Saya dari Bandung.'),
      ] },
      { backdrop: 'school', actors: [at('dimas', 'left'), at('sari', 'right', 'stand', 'right')], lines: [
        tell('Dimas sits next to a girl.', 'Dimas duduk di sebelah seorang anak perempuan.'),
        say('sari', "Hi! I'm Sari. Are you a new student?", 'Hai! Aku Sari. Kamu murid baru?', 'wave'),
        say('dimas', 'Yes, I am. This is my first day.', 'Ya. Ini hari pertamaku.'),
        say('sari', 'Welcome! Our class is fun.', 'Selamat datang! Kelas kita seru.', 'happy'),
      ] },
      { backdrop: 'school', actors: [at('dimas', 'left'), at('sari', 'center'), at('pijar', 'right', 'stand', 'fade')], lines: [
        tell('Suddenly, a small light flies into the classroom.', 'Tiba-tiba, sebuah cahaya kecil terbang masuk ke kelas.'),
        say('dimas', 'What is that?', 'Apa itu?', 'surprised'),
        say('pijar', "Hello! I'm Pijar. I'm a firefly, and I love English!", 'Halo! Aku Pijar. Aku kunang-kunang, dan aku suka bahasa Inggris!', 'wave'),
        say('sari', 'Pijar is our class friend.', 'Pijar adalah teman kelas kami.', 'happy'),
      ] },
      { backdrop: 'street', time: 'evening', actors: [at('dimas', 'left', 'stand', 'left'), at('sari', 'right', 'stand', 'left')], lines: [
        tell('After school, Dimas and Sari walk home.', 'Sepulang sekolah, Dimas dan Sari berjalan pulang.'),
        say('sari', 'See you tomorrow, Dimas!', 'Sampai jumpa besok, Dimas!', 'wave'),
        say('dimas', 'See you tomorrow, Sari. Thank you!', 'Sampai jumpa besok, Sari. Terima kasih!', 'wave'),
      ] },
    ],
    questions: [
      mc(1, Q, 'Who is Ms Emma?', [
        ['The English teacher', true],
        ['A new student', 'Murid barunya adalah Dimas. Emma berkata "I\'m your English teacher".'],
        ["Sari's mother", 'Cerita tidak menyebut itu. Emma memperkenalkan diri sebagai guru bahasa Inggris.'],
      ], 'Emma: "I\'m Ms Emma. I\'m your English teacher."', S),
      mc(1, Q, 'Where is Dimas from?', [
        ['Bandung', true],
        ['Jakarta', 'Dimas berkata "I\'m from Bandung".'],
        ['England', 'Dimas berkata "I\'m from Bandung".'],
      ], '"I\'m from Bandung." Pola untuk menyebut asal: I\'m from + nama tempat.', S),
      mc(1, 'Lengkapi kalimat Sari dalam cerita.', '___ you a new student?', [
        ['Are', true],
        ['Is', '"Is" untuk he/she/it. Untuk "you" pakai "Are".', 'am-is-are'],
        ['Do', '"new student" bukan kata kerja. Pertanyaan dengan to be: Are you ...?'],
      ], 'Pertanyaan dengan to be: Are + you + ...? Jawabannya "Yes, I am."', S),
      tf(1, 'Pijar is a new student.', false, 'Pijar berkata "I\'m a firefly", dan Sari menyebutnya "our class friend". Murid barunya adalah Dimas.', 'Pijar adalah kunang-kunang, teman kelas mereka, bukan murid baru.', S),
      para(2, 'Urutkan kejadian dalam cerita.', [
        'Dimas meets Ms Emma.',
        'Dimas sits next to Sari.',
        'Pijar flies into the classroom.',
        'Dimas and Sari walk home.',
      ], 'Urutan cerita: berkenalan dengan guru, duduk di sebelah Sari, Pijar datang, lalu pulang bersama.', S),
    ],
  },
  {
    id: 'story-new-room', level: 'A1', title: 'Kamar Baru Sari', premium: true,
    summary: 'Sari menata kamar barunya bersama Ibu dan Pijar: ada apa saja, dan di mana letaknya.',
    characters: [C.sari, C.ibu, C.pijar],
    scenes: [
      { backdrop: 'bedroom', actors: [at('sari', 'center', 'stand', 'left'), at('ibu', 'right')], lines: [
        tell("Sari's family has a new house. This is Sari's new room.", 'Keluarga Sari punya rumah baru. Ini kamar baru Sari.'),
        say('sari', 'Wow! My room is big!', 'Wah! Kamarku besar!', 'happy'),
        say('ibu', 'Yes. There is a bed, and there are two windows.', 'Ya. Ada sebuah tempat tidur, dan ada dua jendela.', 'point'),
        say('sari', 'Is there a desk?', 'Apakah ada meja belajar?', 'think'),
        say('ibu', 'Not yet. Your desk is in the car.', 'Belum. Meja belajarmu ada di mobil.'),
      ] },
      { backdrop: 'bedroom', actors: [at('sari', 'left'), at('pijar', 'right', 'stand', 'right')], lines: [
        say('pijar', 'Hi, Sari! Can I help?', 'Hai, Sari! Boleh aku bantu?', 'wave'),
        say('sari', 'Yes, please. Where are my books?', 'Ya, tolong. Di mana buku-bukuku?', 'think'),
        say('pijar', 'Your books are under the bed!', 'Buku-bukumu ada di bawah tempat tidur!', 'point'),
        say('sari', 'Under the bed? Oh no!', 'Di bawah tempat tidur? Aduh!', 'surprised'),
      ] },
      { backdrop: 'bedroom', time: 'evening', actors: [at('sari', 'left'), at('pijar', 'center'), at('ibu', 'right', 'stand', 'right')], lines: [
        tell('In the evening, the room is ready.', 'Pada malam hari, kamarnya sudah siap.'),
        say('ibu', 'Your desk is next to the window now.', 'Meja belajarmu sekarang ada di sebelah jendela.', 'point'),
        say('sari', 'And my books are on the shelf. Thank you, Mum!', 'Dan buku-bukuku ada di rak. Terima kasih, Bu!', 'happy'),
        say('pijar', 'Good night, Sari. I love your new room!', 'Selamat malam, Sari. Aku suka kamar barumu!', 'happy'),
      ] },
    ],
    questions: [
      mc(1, Q, "How many windows are there in Sari's room?", [
        ['Two', true],
        ['One', 'Ibu berkata "there are two windows". "are" dan "windows" (jamak) menandakan lebih dari satu.'],
        ['Three', 'Ibu berkata "there are two windows".'],
      ], '"There are two windows." There are + kata benda jamak.', S),
      mc(2, Q, "Where are Sari's books at first?", [
        ['Under the bed', true],
        ['On the shelf', 'Buku-buku itu ada di rak pada malam hari, setelah kamar rapi. Awalnya "under the bed".'],
        ['In the car', 'Yang ada di mobil adalah meja belajar: "Your desk is in the car."'],
      ], 'Pijar: "Your books are under the bed!" Malam harinya buku-buku itu sudah "on the shelf".', S),
      mc(1, 'Lengkapi kalimat Ibu dalam cerita.', 'There ___ two windows.', [
        ['are', true],
        ['is', '"two windows" jamak, jadi "there are".', 'there-is-are'],
        ['have', 'Untuk menyatakan "ada" pakai there is/there are, bukan "have".', 'there-have'],
      ], 'there is + satu benda; there are + benda jamak.', S),
      tf(1, "At the end, Sari's desk is next to the window.", true, 'Ibu berkata "Your desk is next to the window now."', 'Ibu berkata "Your desk is next to the window now." Jadi pernyataan ini benar.', S),
      match(1, 'Pasangkan kata depan dari cerita dengan artinya.', [
        ['under', 'di bawah'],
        ['on', 'di atas (menempel)'],
        ['next to', 'di sebelah'],
        ['in', 'di dalam'],
      ], 'Kata depan tempat: in (di dalam), on (di atas, menempel), under (di bawah), next to (di sebelah).', S),
    ],
  },
  {
    id: 'story-busy-morning', level: 'A1', title: 'Pagi yang Terburu-buru', premium: true,
    summary: 'Dimas bangun terlambat. Apakah ia sempat sarapan dan mengejar bus?',
    characters: [C.dimas, C.pijar, C.ayah, C.sari],
    scenes: [
      { backdrop: 'bedroom', actors: [at('dimas', 'center'), at('pijar', 'right', 'stand', 'right')], lines: [
        tell("Dimas usually gets up at six o'clock.", 'Dimas biasanya bangun pukul enam.'),
        say('pijar', "Dimas! Wake up! It's seven o'clock!", 'Dimas! Bangun! Sudah pukul tujuh!', 'surprised'),
        say('dimas', "Seven o'clock? Oh no! I'm late!", 'Pukul tujuh? Aduh! Aku terlambat!', 'surprised'),
      ] },
      { backdrop: 'home', actors: [at('dimas', 'left', 'stand', 'left'), at('ayah', 'right')], lines: [
        say('ayah', 'Good morning, Dimas. Do you want breakfast?', 'Selamat pagi, Dimas. Kamu mau sarapan?', 'wave'),
        say('dimas', "No, thanks. I don't have time.", 'Tidak, terima kasih. Aku tidak punya waktu.'),
        say('ayah', 'But you always have breakfast.', 'Tapi kamu selalu sarapan.', 'think'),
        say('dimas', 'Not today! The bus leaves at seven fifteen.', 'Tidak hari ini! Busnya berangkat pukul tujuh lima belas.', 'point'),
      ] },
      { backdrop: 'street', actors: [at('dimas', 'left', 'stand', 'left'), at('pijar', 'center')], lines: [
        tell('Dimas runs to the bus stop.', 'Dimas berlari ke halte bus.'),
        say('pijar', 'Look! The bus is still here!', 'Lihat! Busnya masih di sini!', 'point'),
        say('dimas', 'Phew! Just in time.', 'Fiuh! Tepat waktu.', 'happy'),
      ] },
      { backdrop: 'school', actors: [at('dimas', 'left'), at('sari', 'right')], lines: [
        say('sari', 'Good morning, Dimas! You look tired.', 'Selamat pagi, Dimas! Kamu kelihatan capek.', 'wave'),
        say('dimas', "I'm very hungry!", 'Aku lapar sekali!', 'sad'),
        say('sari', 'Here, have a banana.', 'Ini, makan pisang.', 'happy'),
        say('dimas', "Thank you, Sari. You're a good friend.", 'Terima kasih, Sari. Kamu teman yang baik.', 'happy'),
      ] },
    ],
    questions: [
      mc(1, Q, 'What time does Dimas usually get up?', [
        ["At six o'clock", true],
        ["At seven o'clock", 'Pukul tujuh adalah jam ia bangun hari ini karena terlambat. Kebiasaannya: "usually gets up at six".'],
        ['At seven fifteen', 'Pukul 7.15 adalah jam bus berangkat.'],
      ], '"Dimas usually gets up at six o\'clock." usually = biasanya.', S),
      mc(2, Q, 'When does the bus leave?', [
        ['At 7.15', true],
        ['At 7.50', '"fifteen" bertekanan di akhir (fif-TEEN) dan berarti 15. "fifty" (50) bertekanan di depan.', 'teen-ty'],
        ['At 6.15', 'Jamnya "seven", bukan "six".'],
      ], '"The bus leaves at seven fifteen." = 7.15.', S),
      mc(1, 'Lengkapi kalimat dari cerita.', "Dimas usually ___ up at six o'clock.", [
        ['gets', true],
        ['get', 'Subjek "Dimas" = he, jadi kata kerjanya memakai -s: gets.', 'third-person-s'],
        ['getting', 'Untuk kebiasaan dipakai simple present, bukan bentuk -ing.'],
      ], 'Kebiasaan + subjek he/she/it: kata kerja + s.', S),
      tf(1, 'In the story, Dimas has breakfast with his father.', false, 'Dimas berkata "No, thanks. I don\'t have time." Ia baru makan pisang dari Sari di sekolah.', 'Dimas menolak sarapan karena tidak punya waktu.', S),
      para(2, 'Urutkan kejadian dalam cerita.', [
        'Pijar wakes Dimas up.',
        'Dimas says no to breakfast.',
        'Dimas runs to the bus stop.',
        'Sari gives Dimas a banana.',
      ], 'Bangun terlambat, menolak sarapan, berlari ke halte, lalu mendapat pisang dari Sari di sekolah.', S),
    ],
  },
  {
    id: 'story-yogyakarta', level: 'A2', title: 'Liburan ke Yogyakarta', premium: true,
    summary: 'Sari menceritakan liburannya: naik kereta, mengunjungi Prambanan, dan oleh-oleh untuk Dimas.',
    characters: [C.sari, C.emma, C.ibu, C.dimas],
    scenes: [
      { backdrop: 'school', actors: [at('sari', 'left', 'stand', 'left'), at('emma', 'right')], lines: [
        say('emma', 'Welcome back, Sari! How was your holiday?', 'Selamat datang kembali, Sari! Bagaimana liburanmu?', 'wave'),
        say('sari', 'It was great! I went to Yogyakarta with my family.', 'Seru sekali! Aku pergi ke Yogyakarta bersama keluargaku.', 'happy'),
        say('emma', 'How did you get there?', 'Kamu ke sana naik apa?', 'think'),
        say('sari', 'We took the train. It was a long trip.', 'Kami naik kereta. Perjalanannya panjang.'),
      ] },
      { backdrop: 'station', actors: [at('sari', 'left'), at('ibu', 'right')], lines: [
        tell('At the station, the train was thirty minutes late, so they waited on the platform.', 'Di stasiun, keretanya terlambat tiga puluh menit, jadi mereka menunggu di peron.'),
        say('sari', 'Thirty minutes? That is so long!', 'Tiga puluh menit? Lama sekali!', 'sad'),
        say('ibu', "Be patient. Let's read a book while we wait.", 'Sabar. Ayo baca buku sambil menunggu.', 'happy'),
      ] },
      { backdrop: 'temple', actors: [at('sari', 'center', 'stand', 'left')], lines: [
        tell('The next day, they visited Prambanan Temple.', 'Keesokan harinya, mereka mengunjungi Candi Prambanan.'),
        say('sari', "Wow! It's huge!", 'Wah! Besar sekali!', 'surprised'),
        tell('Sari took a lot of photos and bought a small statue.', 'Sari mengambil banyak foto dan membeli sebuah patung kecil.'),
      ] },
      { backdrop: 'school', actors: [at('sari', 'left'), at('dimas', 'center', 'stand', 'right'), at('emma', 'right')], lines: [
        say('emma', 'Did you eat gudeg?', 'Apakah kamu makan gudeg?', 'think'),
        say('sari', 'Yes, I did! It was sweet and delicious.', 'Ya! Rasanya manis dan enak.', 'happy'),
        say('dimas', "I didn't go anywhere. I stayed at home.", 'Aku tidak pergi ke mana-mana. Aku di rumah saja.', 'sad'),
        say('sari', "Don't worry, Dimas. I bought a present for you!", 'Tenang, Dimas. Aku membelikanmu oleh-oleh!', 'happy'),
      ] },
    ],
    questions: [
      mc(2, Q, 'How did Sari travel to Yogyakarta?', [
        ['By train', true],
        ['By plane', 'Sari berkata "We took the train."'],
        ['By bus', 'Sari berkata "We took the train."'],
      ], '"We took the train." took adalah bentuk lampau "take".', S),
      mc(2, Q, 'How late was the train?', [
        ['Thirty minutes', true],
        ['Thirteen minutes', '"thirty" bertekanan di depan (THIR-ty) = 30. "thirteen" (13) bertekanan di akhir.', 'teen-ty'],
        ['Three hours', 'Narator berkata "thirty minutes late".'],
      ], '"the train was thirty minutes late" = terlambat 30 menit.', S),
      mc(2, 'Lengkapi kalimat Sari dalam cerita.', 'I ___ to Yogyakarta with my family.', [
        ['went', true],
        ['go', 'Liburannya sudah lewat, jadi pakai simple past: went.', 'past-marker'],
        ['goed', '"go" adalah kata kerja tak beraturan: go → went.', 'irregular-form'],
      ], 'Simple past untuk liburan yang sudah lewat. go → went.', S),
      tf(2, 'Dimas went to Yogyakarta too.', false, 'Dimas berkata "I didn\'t go anywhere. I stayed at home."', 'Dimas tidak pergi ke mana-mana; ia tinggal di rumah.', S),
      match(2, 'Pasangkan bentuk lampau dari cerita dengan bentuk dasarnya.', [
        ['went', 'go'],
        ['took', 'take'],
        ['bought', 'buy'],
        ['was', 'be'],
      ], 'Kata kerja tak beraturan dari cerita: go → went, take → took, buy → bought, be → was/were.', S),
    ],
  },
  {
    id: 'story-weekend-plans', level: 'A2', title: 'Rencana Akhir Pekan', premium: true,
    summary: 'Sari mengajak Dimas piknik. Dimas punya rencana yang tidak terduga untuk bekal.',
    characters: [C.dimas, C.sari, C.pijar],
    scenes: [
      { backdrop: 'school', time: 'evening', actors: [at('dimas', 'left'), at('sari', 'right')], lines: [
        tell("It's Friday afternoon. The weekend is coming.", 'Hari Jumat sore. Akhir pekan sudah dekat.'),
        say('sari', 'What are you going to do this weekend, Dimas?', 'Apa yang akan kamu lakukan akhir pekan ini, Dimas?', 'think'),
        say('dimas', "I'm not sure. Maybe I'm going to play football.", 'Belum tahu. Mungkin aku akan main sepak bola.', 'think'),
        say('sari', "I'm having a picnic at the park on Sunday. Would you like to come?", 'Aku mengadakan piknik di taman hari Minggu. Mau ikut?', 'happy'),
        say('dimas', "I'd love to! What time?", 'Mau sekali! Jam berapa?', 'happy'),
        say('sari', "At ten o'clock. Bring some snacks!", 'Pukul sepuluh. Bawa camilan, ya!', 'point'),
      ] },
      { backdrop: 'home', time: 'night', actors: [at('dimas', 'center'), at('pijar', 'right', 'stand', 'fade')], lines: [
        say('pijar', 'Are you going to buy snacks?', 'Kamu akan membeli camilan?', 'think'),
        say('dimas', "No. I'm going to make banana pancakes!", 'Tidak. Aku akan membuat panekuk pisang!', 'happy'),
        say('pijar', 'Can you cook?', 'Kamu bisa memasak?', 'surprised'),
        say('dimas', "Not really. But I'm going to try!", 'Sebenarnya tidak. Tapi aku akan mencoba!', 'happy'),
      ] },
      { backdrop: 'park', actors: [at('sari', 'left'), at('pijar', 'center'), at('dimas', 'right', 'stand', 'right')], lines: [
        tell("On Sunday, it's sunny. Dimas arrives with a box.", 'Hari Minggu cerah. Dimas datang membawa sebuah kotak.'),
        say('sari', "What's in the box?", 'Apa isi kotak itu?', 'think'),
        say('dimas', 'Banana pancakes. I made them this morning!', 'Panekuk pisang. Aku membuatnya tadi pagi!', 'happy'),
        say('sari', "Mmm, they're delicious! Are you going to make them again?", 'Mmm, enak! Kamu akan membuatnya lagi?', 'happy'),
        say('dimas', 'Yes, next weekend!', 'Ya, akhir pekan depan!', 'wave'),
      ] },
    ],
    questions: [
      mc(2, Q, 'What is Sari doing on Sunday?', [
        ['Having a picnic at the park', true],
        ['Playing football', 'Dimas yang mungkin main sepak bola: "Maybe I\'m going to play football."'],
        ['Making pancakes', 'Yang membuat panekuk adalah Dimas.'],
      ], 'Sari: "I\'m having a picnic at the park on Sunday." Present continuous untuk rencana yang sudah diatur.', S),
      mc(1, Q, 'What time does the picnic start?', [
        ["At ten o'clock", true],
        ["At two o'clock", 'Sari berkata "At ten o\'clock."'],
        ["At twelve o'clock", 'Sari berkata "At ten o\'clock."'],
      ], 'Sari: "At ten o\'clock. Bring some snacks!"', S),
      mc(2, 'Lengkapi kalimat Dimas dalam cerita.', "I ___ going to make banana pancakes!", [
        ['am', true],
        ['is', '"I" berpasangan dengan "am": I am going to ...', 'am-is-are'],
        ['will', '"will" dan "going to" tidak dipakai bersama. Pilih salah satu: I am going to make ... atau I will make ...', 'going-to-be'],
      ], 'be going to + kata kerja dasar untuk rencana: I am going to make ...', S),
      tf(2, 'Dimas bought the pancakes at a shop.', false, 'Dimas berkata "I made them this morning!"', 'Dimas membuat panekuknya sendiri pagi itu.', S),
      para(2, 'Urutkan kejadian dalam cerita.', [
        'Sari invites Dimas to a picnic.',
        'Dimas decides to make pancakes.',
        'Dimas arrives at the park with a box.',
        'Sari tries the pancakes.',
      ], 'Ajakan piknik, rencana membuat panekuk, datang ke taman, lalu Sari mencicipi panekuknya.', S),
    ],
  },
  {
    id: 'story-gift', level: 'A2', title: 'Hadiah untuk Nenek', premium: true,
    summary: 'Sari dan Dimas memilih hadiah ulang tahun untuk Nenek di pasar: mana yang lebih besar, lebih murah, dan paling disukai.',
    characters: [C.sari, C.dimas, C.joko, C.nenek],
    scenes: [
      { backdrop: 'home', actors: [at('sari', 'left'), at('dimas', 'right')], lines: [
        say('sari', "It's Grandma's birthday tomorrow. Let's buy her a present.", 'Besok ulang tahun Nenek. Ayo belikan dia hadiah.'),
        say('dimas', 'Good idea. What does she like?', 'Ide bagus. Dia suka apa?', 'think'),
        say('sari', 'She loves flowers and tea.', 'Dia suka bunga dan teh.', 'happy'),
      ] },
      { backdrop: 'market', actors: [at('sari', 'left', 'stand', 'left'), at('dimas', 'center', 'stand', 'left'), at('joko', 'right')], lines: [
        say('joko', 'Good morning! Can I help you?', 'Selamat pagi! Ada yang bisa saya bantu?', 'wave'),
        say('sari', 'How much is this cup?', 'Berapa harga cangkir ini?', 'point'),
        say('joko', 'Twenty thousand rupiah. The big one is thirty thousand.', 'Dua puluh ribu rupiah. Yang besar tiga puluh ribu.'),
        say('dimas', "The big cup is more expensive, but it's more beautiful.", 'Cangkir yang besar lebih mahal, tapi lebih cantik.', 'think'),
        say('sari', "And it's bigger, so Grandma can drink more tea! We'll take the big one, please.", 'Dan lebih besar, jadi Nenek bisa minum teh lebih banyak! Kami ambil yang besar.', 'happy'),
      ] },
      { backdrop: 'market', actors: [at('sari', 'left'), at('dimas', 'right')], lines: [
        tell('Next, they look at the flowers. The roses are the most expensive.', 'Selanjutnya, mereka melihat bunga. Mawar adalah yang paling mahal.'),
        say('dimas', 'Sunflowers are cheaper than roses.', 'Bunga matahari lebih murah daripada mawar.', 'point'),
        say('sari', "Sunflowers are Grandma's favourite! They're the best.", 'Bunga matahari bunga kesukaan Nenek! Itu yang terbaik.', 'happy'),
      ] },
      { backdrop: 'home', time: 'evening', actors: [at('sari', 'left'), at('nenek', 'center', 'stand', 'fade'), at('dimas', 'right')], lines: [
        say('sari', 'Happy birthday, Grandma!', 'Selamat ulang tahun, Nek!', 'wave'),
        say('nenek', 'A big cup and sunflowers? This is the best birthday!', 'Cangkir besar dan bunga matahari? Ini ulang tahun terbaik!', 'happy'),
      ] },
    ],
    questions: [
      mc(2, Q, 'How much is the big cup?', [
        ['30,000 rupiah', true],
        ['20,000 rupiah', 'Dua puluh ribu adalah harga cangkir kecil.'],
        ['13,000 rupiah', 'Pak Joko berkata "thirty thousand" untuk cangkir besar.', 'teen-ty'],
      ], 'Pak Joko: "The big one is thirty thousand."', S),
      mc(2, Q, 'Why does Sari choose the big cup?', [
        ["It's bigger and more beautiful.", true],
        ["It's cheaper.", 'Cangkir besar justru "more expensive".'],
        ["Grandma doesn't like tea.", 'Sari berkata Nenek "loves flowers and tea".'],
      ], 'Dimas: "it\'s more beautiful"; Sari: "it\'s bigger, so Grandma can drink more tea".', S),
      mc(2, 'Lengkapi kalimat Dimas dalam cerita.', 'Sunflowers are ___ than roses.', [
        ['cheaper', true],
        ['more cheap', 'Kata sifat satu suku kata cukup ditambah -er: cheaper.', 'more-er'],
        ['cheapest', '"cheapest" untuk superlatif (paling) dan dipakai dengan "the". Di sini ada "than", jadi perbandingan: cheaper.', 'superlative-the'],
      ], 'Perbandingan dua benda: kata sifat pendek + -er + than.', S),
      tf(2, "Grandma's favourite flowers are roses.", false, 'Sari berkata "Sunflowers are Grandma\'s favourite!"', 'Bunga kesukaan Nenek adalah bunga matahari, bukan mawar.', S),
      match(2, 'Pasangkan ungkapan dari cerita dengan artinya.', [
        ['bigger', 'lebih besar'],
        ['more expensive', 'lebih mahal'],
        ['cheaper', 'lebih murah'],
        ['the best', 'yang terbaik'],
      ], 'Kata sifat pendek: -er (bigger, cheaper). Kata sifat panjang: more (more expensive). Superlatif: the + -est atau bentuk khusus (the best).', S),
    ],
  },
  // ---------------------------------------------------------------- Rilis 2
  {
    id: 'story-lost-tourist', level: 'A2', title: 'Turis yang Tersesat', premium: true,
    summary: 'Dimas menolong Tom, turis dari Inggris, mencari pasar batik: petunjuk arah, saran, dan ajakan.',
    characters: [C.dimas, C.tom, C.pijar, C.joko],
    scenes: [
      { backdrop: 'street', actors: [at('dimas', 'left'), at('tom', 'right', 'stand', 'right')], lines: [
        tell('On Saturday morning, Dimas meets a tourist with a big map.', 'Sabtu pagi, Dimas bertemu seorang turis yang membawa peta besar.'),
        say('tom', "Excuse me. I'm lost. How do I get to the batik market?", 'Permisi. Saya tersesat. Bagaimana cara ke pasar batik?', 'think'),
        say('dimas', 'Go straight on and turn left at the traffic lights.', 'Jalan lurus, lalu belok kiri di lampu lalu lintas.', 'point'),
        say('tom', 'Turn left at the traffic lights. Is it far?', 'Belok kiri di lampu lalu lintas. Apakah jauh?'),
        say('dimas', "Not really. It's about ten minutes on foot.", 'Tidak terlalu. Sekitar sepuluh menit jalan kaki.'),
      ] },
      { backdrop: 'street', actors: [at('dimas', 'left'), at('pijar', 'center', 'stand', 'fade'), at('tom', 'right')], lines: [
        say('pijar', 'Dimas, the market is very crowded today.', 'Dimas, pasarnya sangat ramai hari ini.', 'think'),
        say('dimas', "You're right. Tom, you should keep your bag in front of you.", 'Kamu benar. Tom, sebaiknya Anda menaruh tas di depan badan.', 'think'),
        say('tom', 'Thanks for the advice! Should I take a taxi?', 'Terima kasih atas sarannya! Sebaiknya saya naik taksi?'),
        say('dimas', "You don't have to. Let's walk together. I'm going there too.", 'Tidak perlu. Ayo jalan bersama. Saya juga mau ke sana.', 'happy'),
      ] },
      { backdrop: 'market', actors: [at('tom', 'left', 'stand', 'left'), at('dimas', 'center', 'stand', 'left'), at('joko', 'right')], lines: [
        tell('Ten minutes later, they arrive at the market.', 'Sepuluh menit kemudian, mereka tiba di pasar.'),
        say('joko', 'Welcome! Please come in and look around.', 'Selamat datang! Silakan masuk dan lihat-lihat.', 'wave'),
        say('tom', "Wow, these shirts are beautiful! Don't let me spend all my money!", 'Wah, kemeja-kemeja ini indah! Jangan biarkan saya menghabiskan semua uang saya!', 'happy'),
        say('dimas', "Don't worry. I'll help you choose.", 'Jangan khawatir. Saya akan membantu Anda memilih.', 'happy'),
      ] },
    ],
    questions: [
      mc(2, Q, 'Where does Tom want to go?', [
        ['To the batik market', true],
        ['To the traffic lights', 'Lampu lalu lintas hanya tempat berbelok.'],
        ['To the taxi stand', 'Tom bertanya apakah sebaiknya naik taksi, tetapi tujuannya pasar batik.'],
      ], 'Tom: "How do I get to the batik market?"', S),
      mc(2, Q, 'Where should Tom turn left?', [
        ['At the traffic lights', true],
        ['At the market', 'Pasar adalah tujuan akhirnya.'],
        ['At the bus stop', 'Dimas tidak menyebut halte bus.'],
      ], 'Dimas: "Go straight on and turn left at the traffic lights."', S),
      mc(2, 'Lengkapi kalimat Dimas dalam cerita.', 'Tom, you ___ keep your bag in front of you.', [
        ['should', true],
        ['should to', 'Setelah "should" tanpa "to".', 'modal-to'],
        ['shoulds', '"should" tidak pernah diberi -s.', 'should-base'],
      ], 'Saran: should + bentuk dasar.', S),
      tf(2, 'Dimas tells Tom to take a taxi.', false, 'Dimas berkata "You don\'t have to. Let\'s walk together."', 'Dimas justru mengajak Tom berjalan kaki bersama.', S),
      para(2, 'Urutkan kejadian dalam cerita.', [
        'Tom asks Dimas for directions.',
        'Pijar says the market is crowded.',
        'Dimas offers to walk with Tom.',
        'Pak Joko welcomes them to the market.',
      ], 'Bertanya arah, peringatan Pijar, ajakan berjalan bersama, lalu tiba di pasar.', S),
    ],
  },
  {
    id: 'story-stormy-night', level: 'A2', title: 'Malam Badai', premium: true,
    summary: 'Sari bercerita kepada Bu Emma tentang malam ketika badai datang dan listrik padam.',
    characters: [C.sari, C.emma, C.ibu, C.pijar],
    scenes: [
      { backdrop: 'school', actors: [at('sari', 'left', 'stand', 'left'), at('emma', 'right')], lines: [
        say('emma', 'Sari, you look sleepy. What happened?', 'Sari, kamu kelihatan mengantuk. Ada apa?', 'think'),
        say('sari', "There was a big storm last night. I didn't sleep much.", 'Ada badai besar tadi malam. Saya tidak banyak tidur.', 'sad'),
      ] },
      { backdrop: 'home', time: 'night', actors: [at('sari', 'left'), at('ibu', 'right')], lines: [
        tell("At nine o'clock, Sari was reading a book and her mother was watching TV.", 'Pukul sembilan, Sari sedang membaca buku dan ibunya sedang menonton TV.'),
        tell('Suddenly, there was a loud noise and the lights went out.', 'Tiba-tiba, terdengar suara keras dan lampu padam.'),
        say('sari', "Mum! I can't see anything!", 'Bu! Aku tidak bisa melihat apa-apa!', 'surprised'),
      ] },
      { backdrop: 'home', time: 'night', actors: [at('sari', 'left'), at('pijar', 'center', 'stand', 'fade'), at('ibu', 'right')], lines: [
        say('pijar', "Don't worry. I can help. I'm a firefly!", 'Jangan khawatir. Aku bisa bantu. Aku kunang-kunang!', 'happy'),
        tell('While Pijar was glowing, Mum was looking for candles.', 'Selagi Pijar bersinar, Ibu sedang mencari lilin.'),
        say('ibu', 'Thank you, Pijar. Now we can see!', 'Terima kasih, Pijar. Sekarang kita bisa melihat!', 'happy'),
        say('sari', 'What were you doing when the storm started, Pijar?', 'Kamu sedang apa waktu badainya mulai, Pijar?', 'think'),
        say('pijar', 'I was sleeping in a tree. The wind woke me up!', 'Aku sedang tidur di pohon. Anginnya membangunkanku!', 'sad'),
      ] },
      { backdrop: 'school', actors: [at('sari', 'left'), at('emma', 'right')], lines: [
        say('emma', 'So you were awake for a long time?', 'Jadi kamu lama terjaga?', 'think'),
        say('sari', 'Yes, but it was fun. We were telling stories until midnight!', 'Ya, tapi seru. Kami bercerita sampai tengah malam!', 'happy'),
      ] },
    ],
    questions: [
      mc(2, Q, 'What was Sari doing when the lights went out?', [
        ['Reading a book', true],
        ['Watching TV', 'Yang menonton TV adalah ibunya.'],
        ['Sleeping', 'Sari belum tidur; ia sedang membaca.'],
      ], '"Sari was reading a book and her mother was watching TV. Suddenly ... the lights went out."', S),
      mc(2, Q, 'What was Mum doing while Pijar was glowing?', [
        ['Looking for candles', true],
        ['Telling stories', 'Mereka bercerita setelahnya, sampai tengah malam.'],
        ['Cooking dinner', 'Cerita tidak menyebut memasak.'],
      ], '"While Pijar was glowing, Mum was looking for candles."', S),
      mc(2, 'Lengkapi kalimat dari cerita.', "At nine o'clock, Sari ___ reading a book.", [
        ['was', true],
        ['were', '"Sari" = she, jadi "was".', 'was-were'],
        ['is', 'Ceritanya tentang tadi malam, jadi "was".', 'was-ing-missing'],
      ], 'Kegiatan yang sedang berlangsung di masa lalu: was + -ing.', S),
      tf(2, 'Pijar was sleeping in a tree when the storm started.', true, 'Pijar: "I was sleeping in a tree. The wind woke me up!"', 'Pijar memang sedang tidur di pohon. Pernyataan ini benar.', S),
      para(2, 'Urutkan kejadian dalam cerita.', [
        'The lights went out.',
        'Pijar offered to help.',
        'Mum thanked Pijar.',
        'They told stories until midnight.',
      ], 'Listrik padam, Pijar menawarkan bantuan, Ibu berterima kasih, lalu mereka bercerita sampai tengah malam.', S),
    ],
  },
  {
    id: 'story-old-photos', level: 'B1', title: 'Foto-foto Lama Nenek', premium: true,
    summary: 'Nenek menunjukkan album foto lamanya kepada Sari dan Dimas, dan bercerita tentang hidupnya dulu di desa.',
    characters: [C.sari, C.nenek, C.dimas],
    scenes: [
      { backdrop: 'home', actors: [at('sari', 'left'), at('nenek', 'center'), at('dimas', 'right')], lines: [
        tell('On Sunday, Grandma shows Sari and Dimas an old photo album.', 'Hari Minggu, Nenek menunjukkan album foto lama kepada Sari dan Dimas.'),
        say('sari', 'Is that you, Grandma? You look so young!', 'Itu Nenek? Nenek kelihatan muda sekali!', 'point'),
        say('nenek', 'Yes. I used to live in a village near Klaten.', 'Ya. Dulu Nenek tinggal di sebuah desa dekat Klaten.', 'happy'),
        say('dimas', "There wasn't a lot of traffic there, was there?", 'Di sana tidak banyak kendaraan, kan?', 'think'),
        say('nenek', "No, there wasn't. We used to walk everywhere.", 'Tidak. Dulu kami berjalan kaki ke mana-mana.'),
      ] },
      { backdrop: 'home', actors: [at('sari', 'left'), at('nenek', 'center'), at('dimas', 'right')], lines: [
        say('sari', 'Did you use to go to school by bike?', 'Dulu Nenek pergi ke sekolah naik sepeda?', 'think'),
        say('nenek', "No, I didn't. I didn't use to have a bike. I walked five kilometres!", 'Tidak. Dulu Nenek tidak punya sepeda. Nenek berjalan lima kilometer!'),
        say('dimas', "Five kilometres? That's too far for me!", 'Lima kilometer? Itu terlalu jauh untukku!', 'surprised'),
        say('nenek', "You're young and strong enough, aren't you?", 'Kamu masih muda dan cukup kuat, kan?', 'happy'),
      ] },
      { backdrop: 'home', time: 'evening', actors: [at('sari', 'left'), at('nenek', 'center'), at('dimas', 'right')], lines: [
        say('sari', "You used to sing too, didn't you? Mum told me.", 'Dulu Nenek juga suka menyanyi, kan? Ibu yang cerita.', 'happy'),
        say('nenek', 'Yes, I did. I enjoyed singing at weddings.', 'Ya. Nenek senang menyanyi di acara pernikahan.', 'happy'),
        say('dimas', 'Will you sing for us now, Grandma?', 'Maukah Nenek menyanyi untuk kami sekarang?', 'happy'),
        say('nenek', 'Only if you sing with me!', 'Hanya kalau kalian ikut menyanyi bersama Nenek!', 'wave'),
      ] },
    ],
    questions: [
      mc(3, Q, 'Where did Grandma use to live?', [
        ['In a village near Klaten', true],
        ['In a big city', 'Nenek berkata "I used to live in a village near Klaten."'],
        ['Next to her school', 'Sekolahnya justru lima kilometer jauhnya.'],
      ], '"I used to live in a village near Klaten."', S),
      mc(3, Q, 'How did Grandma use to go to school?', [
        ['She walked.', true],
        ['By bike', 'Nenek berkata "I didn\'t use to have a bike."'],
        ['By car', 'Nenek berkata "We used to walk everywhere."'],
      ], '"I didn\'t use to have a bike. I walked five kilometres!"', S),
      mc(3, 'Lengkapi pertanyaan Sari dalam cerita.', 'Did you ___ go to school by bike?', [
        ['use to', true],
        ['used to', 'Setelah "Did", tanpa -d: use to.', 'used-to-form'],
        ['using to', 'Setelah "Did": use to + bentuk dasar.', 'used-to-form'],
      ], 'Pertanyaan tentang kebiasaan dulu: Did + subjek + use to + bentuk dasar?', S),
      mc(3, 'Lengkapi kalimat Sari dalam cerita.', 'You used to sing too, ___?', [
        ["didn't you", true],
        ["isn't it", 'Tag dibentuk dari kata kerja bantu dan subjeknya. Kalimat lampau dengan used to → didn\'t you?', 'tag-isnt-it'],
        ['did you', 'Kalimat positif diberi tag negatif.', 'tag-polarity'],
      ], 'Kalimat positif lampau → tag negatif: didn\'t you?', S),
      tf(3, 'Grandma still lives in the village.', false, '"I used to live in a village" berarti dulu; sekarang tidak lagi.', '"used to" menunjukkan keadaan yang sudah berubah.', S),
    ],
  },
  {
    id: 'story-cooking-contest', level: 'B1', title: 'Lomba Memasak', premium: true,
    summary: 'Dimas ragu ikut lomba memasak, berlatih membuat soto, lalu tampil di depan juri.',
    characters: [C.dimas, C.sari, C.pijar, C.emma],
    scenes: [
      { backdrop: 'school', actors: [at('dimas', 'left'), at('sari', 'right')], lines: [
        say('sari', 'Dimas, do you want to join the cooking contest on Friday?', 'Dimas, kamu mau ikut lomba memasak hari Jumat?', 'happy'),
        say('dimas', "I enjoy cooking, but I'm not good enough.", 'Aku senang memasak, tapi aku belum cukup jago.', 'think'),
        say('sari', "Don't worry. Practising is the best way to improve!", 'Tenang. Berlatih adalah cara terbaik untuk berkembang!', 'happy'),
        say('dimas', "OK. I've decided to try!", 'Oke. Aku sudah memutuskan untuk mencoba!', 'happy'),
      ] },
      { backdrop: 'home', time: 'evening', actors: [at('dimas', 'center'), at('pijar', 'right', 'stand', 'fade')], lines: [
        tell('That evening, Dimas practises making soto ayam.', 'Malam itu, Dimas berlatih membuat soto ayam.'),
        say('pijar', "Mmm... it's a bit too salty.", 'Mmm... agak terlalu asin.', 'think'),
        say('dimas', 'Too salty? I should avoid adding so much salt.', 'Terlalu asin? Sebaiknya aku tidak menambahkan garam sebanyak itu.', 'sad'),
        say('pijar', 'Try again. You have enough time before Friday.', 'Coba lagi. Masih ada cukup waktu sebelum Jumat.', 'happy'),
      ] },
      { backdrop: 'school', actors: [at('dimas', 'left'), at('emma', 'center'), at('sari', 'right')], lines: [
        tell('On Friday, Ms Emma is one of the judges.', 'Hari Jumat, Bu Emma menjadi salah satu juri.'),
        say('emma', "This soto is delicious. It isn't too salty, and it's hot enough.", 'Soto ini enak. Tidak terlalu asin, dan cukup panas.', 'happy'),
        say('sari', 'You won second place, Dimas!', 'Kamu juara kedua, Dimas!', 'happy'),
        say('dimas', "I'm looking forward to cooking for everyone again!", 'Aku tak sabar memasak untuk semua orang lagi!', 'happy'),
      ] },
    ],
    questions: [
      mc(3, Q, "Why doesn't Dimas want to join the contest at first?", [
        ["He thinks he isn't good enough.", true],
        ["He doesn't enjoy cooking.", 'Dimas berkata "I enjoy cooking".'],
        ['He is busy on Friday.', 'Cerita tidak menyebut itu.'],
      ], 'Dimas: "I enjoy cooking, but I\'m not good enough."', S),
      mc(3, Q, "What was wrong with Dimas's first soto?", [
        ['It was too salty.', true],
        ["It wasn't hot enough.", 'Bu Emma justru memuji sotonya "hot enough" pada hari lomba.'],
        ['It was too spicy.', 'Pijar berkata "too salty", bukan pedas.'],
      ], 'Pijar: "it\'s a bit too salty."', S),
      mc(3, 'Lengkapi kalimat Dimas dalam cerita.', 'I should avoid ___ so much salt.', [
        ['adding', true],
        ['to add', '"avoid" diikuti -ing.', 'verb-ing-to'],
        ['add', '"avoid" diikuti -ing: adding.', 'verb-ing-to'],
      ], 'avoid + -ing.', S),
      mc(3, 'Lengkapi kalimat Bu Emma dalam cerita.', "It isn't too salty, and it's hot ___.", [
        ['enough', true],
        ['too', '"too" berarti terlalu. Pujiannya "hot enough" (cukup panas).', 'too-very'],
        ['very', '"very" diletakkan sebelum kata sifat, bukan sesudahnya.', 'too-very'],
      ], 'kata sifat + enough: hot enough.', S),
      tf(3, 'Dimas won first place.', false, 'Sari berkata "You won second place, Dimas!"', 'Dimas juara kedua, bukan pertama.', S),
    ],
  },
];
