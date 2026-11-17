// Ujian Akhir Jalur Sekolah (Rilis 16): exam-only banks for the SD, SMP and SMA
// tracks. Like the CEFR level exams (exam-bank.ts) they are drawn and graded on
// the server and never reach a device with their keys; passing gives a
// certificate. Per track: grammar & vocabulary (12, 8 drawn), reading (2
// passages of 4, 1 drawn), listening (2 recordings of 4, 1 drawn), writing
// (2 tasks, 1 drawn). Keys avoid answers that are arguably right another way.
import type { SchoolLevel } from '@/lib/content/tracks';
import { fill, fix, listen, mc, read } from './dsl';
import type { LevelBank } from './exam-bank';

const R = { topic: 'skill.reading' } as const;
const L = { topic: 'skill.listening' } as const;
const t = (topic: string) => ({ topic });

// ═════════════════════════════════════════════════════════════════ SD
const SD_OYEN = "Hi! I'm Bima. I am nine years old. I have a cat. Its name is Oyen. Oyen is orange and white, and he likes fish. Every morning, I give him food before I go to school. On Sunday, I play with Oyen in the garden.";
const SD_HOUSE = 'This is my house. There are three bedrooms, a kitchen, and a small living room. My bedroom is next to the bathroom. There is a big window in my bedroom, and I can see a mango tree from it. My father and I water the plants every afternoon.';
const SD_CLASS = "Good morning, children! Today is Monday. It's sunny and hot, so please drink your water. At nine o'clock, we have a drawing class. At ten o'clock, we go to the library. Don't forget your library cards!";
const SD_NADIA = "Hello, I'm Nadia. There are four people in my family: my father, my mother, my little brother, and me. My father is a farmer, and my mother is a nurse. My brother is five years old. He likes playing football. I like reading and singing.";

const SD: LevelBank = {
  grammar: [
    mc(1, 'Pilih kata yang tepat.', 'My name ___ Dewi.', [['is', true], ['are', '"My name" satu benda: is.'], ['am', '"am" hanya untuk I.']], 'My name is ...', t('sd.greetings')),
    mc(1, 'Pilih kata yang tepat.', 'I have two ___.', [['feet', true], ['foot', 'Dua: bentuk jamak.'], ['foots', 'Jamak dari foot adalah feet.']], 'one foot, two feet.', t('sd.body')),
    mc(1, 'Pilih kata yang tepat.', 'There ___ two chairs in the kitchen.', [['are', true], ['is', 'Dua kursi: are.'], ['am', '"am" hanya untuk I.']], 'There are + benda jamak.', t('sd.house')),
    mc(1, "Apa arti \"It's half past six\"?", null, [['jam 06.30', true], ['jam 05.30', 'half past six = lewat setengah dari jam enam = 06.30.'], ['jam 06.00', "06.00 = six o'clock."]], 'half past six = 06.30.', t('sd.time')),
    mc(1, 'Pilih kata yang tepat.', 'I go swimming ___ Sunday.', [['on', true], ['in', 'Sebelum nama hari: on.'], ['at', '"at" untuk jam.']], 'on + nama hari.', t('sd.time')),
    mc(1, 'Pilih kata yang tepat.', "It's ___ today. Take an umbrella!", [['rainy', true], ['sunny', 'Payung dibawa saat hujan.'], ['rain', 'Untuk cuaca pakai kata sifat: rainy.']], 'Hujan: rainy.', t('sd.weather')),
    mc(1, 'Pilih kata yang tepat.', 'My sister ___ drawing.', [['likes', true], ['like', 'He/She + likes.'], ['liking', 'Butuh kata kerja: likes.']], 'She + likes.', t('sd.hobbies')),
    mc(1, 'Pilih kata yang tepat.', 'A ___ flies a plane.', [['pilot', true], ['chef', 'Koki memasak.'], ['farmer', 'Petani menanam padi.']], 'Pilot menerbangkan pesawat.', t('sd.jobs')),
    mc(1, 'Pilih kata yang tepat.', 'It is ___ elephant.', [['an', true], ['a', '"elephant" berbunyi e di depan: an.']], 'an + bunyi vokal.', t('kids.colors-animals')),
    mc(1, 'Pilih kata yang tepat.', 'This is my mother. ___ is a teacher.', [['She', true], ['He', 'Ibu: perempuan, jadi She.'], ['It', '"It" untuk benda atau hewan.']], 'Perempuan: she.', t('kids.family')),
    fill(1, 'I want to ___ a doctor.', ['be'], 'want to be = ingin menjadi.', { is: ['Setelah want to pakai bentuk dasar: be.'] }, t('sd.jobs')),
    mc(1, 'Pilih kata yang tepat.', 'I have three ___.', [['cats', true], ['cat', 'Tiga: tambahkan -s.'], ['cates', 'Cukup tambahkan -s: cats.']], 'Lebih dari satu: -s.', t('kids.numbers-toys')),
  ],
  reading: [
    [
      read(1, SD_OYEN, 'How old is Bima?', [['nine', true], ['five', 'Tidak disebut dalam teks.'], ['ten', 'Teks menyebut nine.']], '"I am nine years old."', R),
      read(1, SD_OYEN, 'What colour is Oyen?', [['orange and white', true], ['black and white', 'Teks menyebut orange and white.'], ['brown', 'Teks menyebut orange and white.']], '"Oyen is orange and white."', R),
      read(1, SD_OYEN, 'What does Oyen like?', [['fish', true], ['milk', 'Tidak disebut dalam teks.'], ['the garden', 'Mereka bermain di kebun, tetapi Oyen suka ikan.']], '"he likes fish."', R),
      read(1, SD_OYEN, 'When does Bima play with Oyen?', [['on Sunday', true], ['every morning', 'Setiap pagi Bima memberi makan.'], ['after school', 'Tidak disebut dalam teks.']], '"On Sunday, I play with Oyen."', R),
    ],
    [
      read(1, SD_HOUSE, 'How many bedrooms are there?', [['three', true], ['two', 'Teks menyebut three bedrooms.'], ['one', 'Teks menyebut three bedrooms.']], '"There are three bedrooms."', R),
      read(1, SD_HOUSE, 'Where is the bedroom?', [['next to the bathroom', true], ['next to the kitchen', 'Teks menyebut bathroom.'], ['under the mango tree', 'Pohon mangga terlihat dari jendela.']], '"My bedroom is next to the bathroom."', R),
      read(1, SD_HOUSE, 'What can the writer see from the window?', [['a mango tree', true], ['the kitchen', 'Tidak disebut dalam teks.'], ['a garden of flowers', 'Teks menyebut a mango tree.']], '"I can see a mango tree from it."', R),
      read(1, SD_HOUSE, 'When do they water the plants?', [['every afternoon', true], ['every morning', 'Teks menyebut every afternoon.'], ['on Sunday', 'Tidak disebut dalam teks.']], '"... water the plants every afternoon."', R),
    ],
  ],
  listening: [
    [
      listen(1, SD_CLASS, 'What day is it?', [['Monday', true], ['Sunday', 'Guru menyebut Monday.'], ['Friday', 'Guru menyebut Monday.']], '"Today is Monday."', L),
      listen(1, SD_CLASS, 'What is the weather like?', [['sunny and hot', true], ['rainy', 'Guru menyebut sunny and hot.'], ['cloudy', 'Guru menyebut sunny and hot.']], '"It\'s sunny and hot."', L),
      listen(1, SD_CLASS, 'What time is the drawing class?', [["at nine o'clock", true], ["at ten o'clock", 'Jam sepuluh mereka ke perpustakaan.'], ["at eight o'clock", 'Tidak disebut.']], '"At nine o\'clock, we have a drawing class."', L),
      listen(1, SD_CLASS, 'What should the children bring to the library?', [['their library cards', true], ['their water bottles', 'Air untuk diminum karena panas.'], ['their drawing books', 'Tidak disebut.']], '"Don\'t forget your library cards!"', L),
    ],
    [
      listen(1, SD_NADIA, 'How many people are there in Nadia\'s family?', [['four', true], ['three', 'Ayah, ibu, adik, dan Nadia: empat.'], ['five', 'Lima adalah umur adiknya.']], '"There are four people in my family."', L),
      listen(1, SD_NADIA, "What is Nadia's father's job?", [['a farmer', true], ['a nurse', 'Ibunya perawat.'], ['a teacher', 'Tidak disebut.']], '"My father is a farmer."', L),
      listen(1, SD_NADIA, "How old is Nadia's brother?", [['five', true], ['four', 'Empat adalah jumlah anggota keluarga.'], ['nine', 'Tidak disebut.']], '"My brother is five years old."', L),
      listen(1, SD_NADIA, 'What does Nadia like?', [['reading and singing', true], ['playing football', 'Itu kesukaan adiknya.'], ['drawing', 'Tidak disebut.']], '"I like reading and singing."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis 3–5 kalimat tentang dirimu: nama, umur, dan hobimu.',
      minWords: 15,
      mustInclude: ["Menyebut nama (My name is ... / I am ...)::my name|i am|i'm", 'Menyebut umur (... years old)::years old', 'Menyebut hobi (I like ...)::like'],
      model: 'Hello! My name is Dewi. I am nine years old. I like drawing and singing. My favourite colour is blue.',
    },
    {
      prompt: 'Tulis 3–5 kalimat tentang kamarmu: benda apa saja yang ada dan di mana letaknya.',
      minWords: 15,
      mustInclude: ["Memakai There is/There are::there is|there are|there's", 'Menyebut letak (in, on, under, next to)::under|next to| on | in '],
      model: 'This is my bedroom. There is a bed next to the window. There are two pillows on the bed. My bag is under the table.',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ SMP
const SMP_BOGOR = 'Last Saturday, my class went to Kebun Raya Bogor for a science trip. We left school at six in the morning by bus. When we arrived, our guide showed us many kinds of trees and flowers. The most interesting one was the giant corpse flower, but it was not blooming. After lunch, we wrote notes about the plants. We got home at five in the afternoon. It was a tiring but fun day.';
const SMP_NOTICE = "NOTICE\nThe school library will be closed from Monday, 10 March, to Wednesday, 12 March, because we are painting the walls. Students who need to return books can put them in the box next to the teachers' room. The library will open again on Thursday at 7 a.m. Thank you for your understanding.\nMrs. Wulan, Librarian";
const SMP_SALAD = "Here's how to make a fruit salad. First, wash an apple, a banana, and some grapes. Next, cut the apple and the banana into small pieces. Then, put all the fruit in a bowl. After that, add two spoons of yoghurt and a little honey. Finally, mix everything and keep it in the fridge for ten minutes.";
const SMP_UNCLE = 'Let me tell you about my uncle, Pak Hendra. He is a fisherman in Makassar. He is short, but he is very strong. He has dark skin and short grey hair. He is friendly, and he loves telling jokes. Every Sunday, he takes me to the harbour to see the boats.';

const SMP: LevelBank = {
  grammar: [
    mc(2, 'Pilih kata yang tepat.', 'She ___ long curly hair.', [['has', true], ['is', 'Rambut adalah sesuatu yang dimiliki: has.'], ['have', 'She + has.']], 'She + has + ciri fisik.', t('smp.describe-people')),
    mc(2, 'Pilih kata yang tepat.', 'Bali is famous ___ its beaches.', [['for', true], ['of', 'famous for, bukan famous of.'], ['with', 'famous for, bukan famous with.']], 'famous for = terkenal karena.', t('smp.describe-places')),
    mc(2, 'Pilih kata yang tepat.', 'Please ___ your library card tomorrow.', [['bring', true], ['brings', 'Setelah please pakai kata kerja dasar.'], ['brought', 'Setelah please pakai kata kerja dasar.']], 'Please + kata kerja dasar.', t('smp.messages')),
    mc(2, 'Pilih kata yang tepat.', 'Congratulations ___ your graduation!', [['on', true], ['for', 'Congratulations on, bukan for.'], ['at', 'Congratulations on, bukan at.']], 'Congratulations on + ...', t('smp.greeting-cards')),
    mc(2, 'Pilih kata yang tepat untuk langkah terakhir.', '___, pour the milk into the glass.', [['Finally', true], ['First', 'First untuk langkah pertama.'], ['Before', '"Before" bukan penanda langkah terakhir.']], 'Langkah terakhir: Finally.', t('smp.procedure')),
    mc(2, 'Pilih kata yang tepat.', 'Last Sunday, we ___ to the zoo.', [['went', true], ['go', 'Sudah lewat (last Sunday): went.'], ['goes', 'Sudah lewat: went.']], 'go → went.', t('smp.recount')),
    mc(2, 'Pilih kata yang tepat.', 'The children ___ very tired after the trip.', [['were', true], ['was', 'Jamak: were.'], ['is', 'Sudah lewat dan jamak: were.']], 'Jamak lampau: were.', t('smp.recount')),
    mc(2, 'Pilih kata yang tepat.', 'Once upon a time, a king ___ in a big palace.', [['lived', true], ['lives', 'Cerita lampau: lived.'], ['living', 'Butuh kata kerja lampau: lived.']], 'Cerita rakyat: simple past.', t('smp.narrative')),
    fill(2, "Don't forget ___ bring your hat.", ['to'], "Don't forget to + kata kerja dasar.", { for: ["Don't forget to, bukan for."] }, t('smp.messages')),
    fix(2, 'He have a big nose.', ['He has a big nose.'], 'He + has.', { 'He have a big nose.': ['Kalimatnya belum diubah.'] }, t('smp.describe-people')),
    mc(2, 'Kalimat mana yang termasuk langkah dalam teks prosedur?', null, [['Cut the carrots into small pieces.', true], ['I like carrots very much.', 'Itu pendapat, bukan langkah.'], ['Carrots were cheap yesterday.', 'Itu cerita lampau, bukan langkah.']], 'Langkah prosedur: kalimat perintah.', t('smp.procedure')),
    mc(2, 'Pilih kata yang tepat.', 'Borobudur is located ___ Magelang.', [['in', true], ['on', '"on" untuk jalan.'], ['at', 'Untuk kota pakai in.']], 'located in + kota.', t('smp.describe-places')),
  ],
  reading: [
    [
      read(2, SMP_BOGOR, 'Where did the class go?', [['Kebun Raya Bogor', true], ['a museum in Jakarta', 'Tidak disebut dalam teks.'], ['a beach', 'Tidak disebut dalam teks.']], '"... went to Kebun Raya Bogor."', R),
      read(2, SMP_BOGOR, 'How did they travel?', [['by bus', true], ['by train', 'Teks menyebut by bus.'], ['on foot', 'Teks menyebut by bus.']], '"We left school ... by bus."', R),
      read(2, SMP_BOGOR, 'Was the corpse flower blooming?', [['No, it was not.', true], ['Yes, it was.', 'Teks: "it was not blooming."'], ['The text does not say.', 'Teks menyebutnya.']], '"... but it was not blooming."', R),
      read(2, SMP_BOGOR, 'What did they do after lunch?', [['They wrote notes about the plants.', true], ['They went home.', 'Mereka pulang jam lima.'], ['They planted trees.', 'Tidak disebut dalam teks.']], '"After lunch, we wrote notes about the plants."', R),
    ],
    [
      read(2, SMP_NOTICE, 'Why will the library be closed?', [['The walls are being painted.', true], ['The librarian is sick.', 'Tidak disebut.'], ['It is a school holiday.', 'Tidak disebut.']], '"... because we are painting the walls."', R),
      read(2, SMP_NOTICE, 'For how many days will the library be closed?', [['three days', true], ['two days', 'Senin, Selasa, Rabu: tiga hari.'], ['one week', 'Tidak sampai seminggu.']], 'Monday to Wednesday = tiga hari.', R),
      read(2, SMP_NOTICE, 'Where can students return books?', [["in the box next to the teachers' room", true], ['at the library desk', 'Perpustakaan tutup.'], ['to Mrs. Wulan at home', 'Tidak disebut.']], "\"... put them in the box next to the teachers' room.\"", R),
      read(2, SMP_NOTICE, 'When will the library open again?', [['on Thursday at 7 a.m.', true], ['on Wednesday at 7 a.m.', 'Rabu masih tutup.'], ['on Monday at 7 a.m.', 'Senin mulai tutup.']], '"... open again on Thursday at 7 a.m."', R),
    ],
  ],
  listening: [
    [
      listen(2, SMP_SALAD, 'What is the speaker making?', [['a fruit salad', true], ['a cake', 'Tidak disebut.'], ['fruit juice', 'Buahnya dipotong, bukan dijus.']], '"Here\'s how to make a fruit salad."', L),
      listen(2, SMP_SALAD, 'What do you do with the apple and the banana?', [['cut them into small pieces', true], ['put them in the fridge first', 'Kulkas di langkah terakhir.'], ['boil them', 'Tidak disebut.']], '"Next, cut the apple and the banana into small pieces."', L),
      listen(2, SMP_SALAD, 'How much yoghurt do you add?', [['two spoons', true], ['one cup', 'Tidak disebut.'], ['ten spoons', 'Sepuluh adalah menit di kulkas.']], '"... add two spoons of yoghurt ..."', L),
      listen(2, SMP_SALAD, 'How long do you keep it in the fridge?', [['ten minutes', true], ['two minutes', 'Dua adalah sendok yoghurt.'], ['one hour', 'Tidak disebut.']], '"... keep it in the fridge for ten minutes."', L),
    ],
    [
      listen(2, SMP_UNCLE, "What is Pak Hendra's job?", [['a fisherman', true], ['a teacher', 'Tidak disebut.'], ['a farmer', 'Ia nelayan (fisherman).']], '"He is a fisherman in Makassar."', L),
      listen(2, SMP_UNCLE, 'What does his hair look like?', [['short and grey', true], ['long and black', 'Tidak sesuai.'], ['curly and brown', 'Tidak sesuai.']], '"... short grey hair."', L),
      listen(2, SMP_UNCLE, 'What does he love doing?', [['telling jokes', true], ['cooking', 'Tidak disebut.'], ['reading', 'Tidak disebut.']], '"... he loves telling jokes."', L),
      listen(2, SMP_UNCLE, 'Where do they go every Sunday?', [['to the harbour', true], ['to the market', 'Tidak disebut.'], ['to the mountains', 'Tidak disebut.']], '"... takes me to the harbour to see the boats."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis recount 5–7 kalimat tentang liburan atau acara sekolahmu: kapan, di mana, apa yang terjadi, dan perasaanmu.',
      minWords: 35,
      mustInclude: ['Memakai keterangan waktu lampau (last ..., yesterday, ... ago)::last |yesterday| ago', 'Memakai kata kerja lampau (went, visited, ate, ...)::went|visited|ate|saw|played|bought|was |were ', 'Menyebut perasaan (happy, tired, excited, ...)::happy|tired|excited|fun|sad|glad'],
      model: 'Last holiday, my family and I went to Malang. On the first day, we visited an apple farm. We picked apples and ate them there. The next day, we went to a waterfall. The water was very cold. I was tired, but I was very happy.',
    },
    {
      prompt: 'Tulis teks deskriptif 5–7 kalimat tentang teman atau anggota keluargamu: penampilan dan sifatnya.',
      minWords: 35,
      mustInclude: ['Memakai has/have untuk ciri fisik::has |have ', 'Memakai is/are untuk sifat::is |are ', 'Menyebut sifat (kind, friendly, smart, ...)::kind|friendly|smart|funny|patient|helpful|diligent'],
      model: 'My best friend is Laras. She is in my class. She is tall, and she has long black hair. She has round glasses and a big smile. Laras is very kind and patient. She always helps me when I have problems with Maths.',
    },
  ],
};

// ═════════════════════════════════════════════════════════════════ SMA
const SMA_FOOD = 'Indonesia throws away millions of tonnes of food every year. Much of this waste comes from households, restaurants, and markets. When food waste ends up in landfills, it produces methane, a gas that makes global warming worse. Some communities have started to fight the problem. In Bandung, for instance, volunteers collect unsold vegetables from markets and give them to families in need. Experts say that small habits, such as buying only what we need and storing food properly, can also make a big difference.';
const SMA_SLEEP = "Teenagers need eight to ten hours of sleep every night, but many get much less. Late-night phone use is one of the main reasons. The blue light from screens tells the brain that it is still daytime, so it becomes harder to fall asleep. Lack of sleep can affect memory, mood, and concentration at school. Doctors recommend putting phones away at least an hour before bed. Some schools have even started classes later in the morning, and their students' test scores have improved.";
const SMA_FLOOD = 'Good evening. Here is the news. Heavy rain caused flooding in several parts of Semarang this afternoon. According to the local disaster agency, more than three hundred houses were affected, but no one was injured. Volunteers helped families move to a mosque and a school nearby. The agency said that the water would go down by tomorrow morning if the rain stopped.';
const SMA_JOBS = "Interviewer: Should students do part-time jobs? Rina, what do you think? Rina: I think it's a good idea for older students. Working teaches you to manage money and time. Interviewer: But isn't it tiring? Rina: It can be. That's why students should work only at weekends, and not more than ten hours a week. School must still come first.";

const SMA: LevelBank = {
  grammar: [
    mc(3, 'Pilih kata yang tepat.', 'How about ___ to the library after school?', [['going', true], ['go', 'How about + -ing.'], ['to go', 'How about + -ing.']], 'How about + -ing.', t('sma.opinions')),
    mc(3, 'Pilih kata yang tepat.', 'You should ___ more water every day.', [['drink', true], ['to drink', 'Setelah should langsung kata kerja dasar.'], ['drinking', 'Setelah should pakai kata kerja dasar.']], 'should + kata kerja dasar.', t('sma.opinions')),
    mc(3, 'Pilih bentuk yang tepat.', 'In this process, the water ___ by the sun.', [['is heated', true], ['heats', 'Air tidak memanaskan; air dipanaskan: is heated.'], ['is heat', 'Pasif memakai V3: heated.']], 'Pasif: is + V3.', t('sma.explanation')),
    mc(3, 'Pilih kata yang tepat.', 'Komodo dragons ___ only on a few islands in Indonesia.', [['live', true], ['lives', 'Jamak: live.'], ['living', 'Butuh kata kerja: live.']], 'Jamak: live.', t('sma.report')),
    mc(3, 'Pilih kata yang tepat untuk argumen pertama.', '___, plastic waste pollutes the ocean.', [['Firstly', true], ['Finally', 'Finally untuk akhir.'], ['However', 'However untuk pertentangan.']], 'Argumen pertama: Firstly.', t('sma.exposition')),
    mc(3, 'Pilih kata yang tepat.', 'Phones are useful for learning. ___, they can be distracting.', [['However', true], ['Therefore', '"Therefore" menyatakan akibat, bukan pertentangan.'], ['Furthermore', '"Furthermore" menambah gagasan yang searah.']], 'Pertentangan: However.', t('sma.discussion')),
    mc(3, 'Pilih kata yang tepat.', '___ he was tired, he finished his homework.', [['Although', true], ['But', '"But" tidak dipakai di awal klausa ini.'], ['However', '"However" tidak menggabungkan dua klausa seperti ini.']], 'Although + klausa, + klausa.', t('sma.discussion')),
    mc(3, 'Pilih kata yang tepat.', '___ to the police, nobody was hurt.', [['According', true], ['Accordance', 'Ungkapan tetap: According to.'], ['Agree', 'Ungkapan tetap: According to.']], 'According to = menurut.', t('sma.news')),
    mc(3, 'Pilih kata yang tepat.', 'I am ___ in the marketing internship.', [['interested', true], ['interesting', 'interesting = menarik (sifat benda).'], ['interest', 'Butuh kata sifat: interested.']], 'Perasaan tertarik: interested.', t('sma.application-letter')),
    mc(3, 'Pilih kata yang tepat.', 'I look forward to ___ from you.', [['hearing', true], ['hear', 'look forward to + -ing.'], ['heard', 'look forward to + -ing.']], 'look forward to + -ing.', t('sma.application-letter')),
    fill(3, 'Clouds are ___ when water vapour cools. (form)', ['formed'], 'Pasif: are + V3 (formed).', { form: ['Pasif memakai V3: formed.'], forming: ['Pasif memakai V3: formed.'] }, t('sma.explanation')),
    fix(3, 'Yesterday, the students plant 500 trees.', ['Yesterday, the students planted 500 trees.', 'Yesterday the students planted 500 trees.'], 'Peristiwa lampau: planted.', { 'Yesterday, the students plant 500 trees.': ['Kalimatnya belum diubah.'] }, t('sma.news')),
  ],
  reading: [
    [
      read(3, SMA_FOOD, 'What is the text mainly about?', [['the problem of food waste and ways to reduce it', true], ['how to cook vegetables', 'Tidak dibahas.'], ['the history of Bandung markets', 'Bandung hanya contoh.']], 'Gagasan utama mencakup masalah dan solusinya.', R),
      read(3, SMA_FOOD, 'Why is food waste in landfills harmful?', [['It produces methane, which worsens global warming.', true], ['It makes markets crowded.', 'Tidak disebut.'], ['It is too expensive to collect.', 'Tidak disebut.']], '"... it produces methane, a gas that makes global warming worse."', R),
      read(3, SMA_FOOD, 'The word "unsold" is closest in meaning to ...', [['not bought by anyone', true], ['very expensive', 'Bukan makna kata itu.'], ['already cooked', 'Bukan makna kata itu.']], 'un- + sold = tidak terjual.', R),
      read(3, SMA_FOOD, 'What can be inferred from the last sentence?', [['People can help reduce food waste at home.', true], ['Only experts can solve the problem.', 'Teks menyebut kebiasaan kecil kita.'], ['Storing food properly is very expensive.', 'Tidak didukung teks.']], 'Kebiasaan kecil di rumah bisa membantu.', R),
    ],
    [
      read(3, SMA_SLEEP, 'How much sleep do teenagers need?', [['eight to ten hours a night', true], ['six hours a night', 'Teks menyebut eight to ten.'], ['twelve hours a night', 'Teks menyebut eight to ten.']], '"Teenagers need eight to ten hours of sleep every night."', R),
      read(3, SMA_SLEEP, 'Why does blue light make it harder to fall asleep?', [['It makes the brain think it is still daytime.', true], ['It hurts the eyes.', 'Tidak disebut.'], ['It makes phones too hot.', 'Tidak disebut.']], '"... tells the brain that it is still daytime."', R),
      read(3, SMA_SLEEP, 'What do doctors recommend?', [['putting phones away an hour before bed', true], ['using phones only in bed', 'Bertentangan dengan teks.'], ['sleeping during lessons', 'Tidak disebut.']], '"Doctors recommend putting phones away at least an hour before bed."', R),
      read(3, SMA_SLEEP, 'What can be inferred about schools that start later?', [['Their students may be more rested and learn better.', true], ['Their students sleep less.', 'Bertentangan dengan teks.'], ['They do not allow phones.', 'Tidak disebut.']], 'Nilai ujian membaik, kemungkinan karena lebih cukup tidur.', R),
    ],
  ],
  listening: [
    [
      listen(3, SMA_FLOOD, 'What caused the flooding?', [['heavy rain', true], ['a broken dam', 'Tidak disebut.'], ['high waves', 'Tidak disebut.']], '"Heavy rain caused flooding ..."', L),
      listen(3, SMA_FLOOD, 'How many houses were affected?', [['more than three hundred', true], ['about thirty', 'Disebut more than three hundred.'], ['three thousand', 'Disebut more than three hundred.']], '"... more than three hundred houses were affected."', L),
      listen(3, SMA_FLOOD, 'Where did families move?', [['to a mosque and a school', true], ['to a hotel', 'Tidak disebut.'], ["to their relatives' houses", 'Tidak disebut.']], '"... move to a mosque and a school nearby."', L),
      listen(3, SMA_FLOOD, 'When will the water go down, according to the agency?', [['by tomorrow morning, if the rain stops', true], ['tonight, even if it keeps raining', 'Ada syaratnya: hujan berhenti.'], ['next week', 'Disebut tomorrow morning.']], '"... would go down by tomorrow morning if the rain stopped."', L),
    ],
    [
      listen(3, SMA_JOBS, "What is Rina's opinion about part-time jobs?", [['They are a good idea for older students.', true], ['They are bad for all students.', 'Rina mendukung dengan syarat.'], ['Only university students should work.', 'Tidak disebut.']], '"I think it\'s a good idea for older students."', L),
      listen(3, SMA_JOBS, 'What benefit does Rina mention?', [['learning to manage money and time', true], ['making new friends', 'Tidak disebut.'], ['getting better grades', 'Tidak disebut.']], '"Working teaches you to manage money and time."', L),
      listen(3, SMA_JOBS, 'When should students work, according to Rina?', [['only at weekends, up to ten hours a week', true], ['every evening after school', 'Rina menyebut weekends.'], ['during exams', 'Tidak disebut.']], '"... only at weekends, and not more than ten hours a week."', L),
      listen(3, SMA_JOBS, 'What does Rina say must come first?', [['school', true], ['money', 'Rina: "School must still come first."'], ['family', 'Tidak disebut.']], '"School must still come first."', L),
    ],
  ],
  writing: [
    {
      prompt: 'Tulis analytical exposition 6–8 kalimat dengan thesis "Students should learn to cook." Sertakan thesis, dua argumen, dan reiteration.',
      minWords: 60,
      mustInclude: ['Menyatakan thesis dengan should::should', 'Memakai penanda argumen (Firstly, Secondly, Furthermore, ...)::firstly|first of all|secondly|furthermore|moreover', 'Menutup dengan Therefore atau In conclusion::therefore|in conclusion'],
      model: 'Students should learn to cook. Firstly, cooking is an important life skill. When students live alone for university or work, they can make healthy meals and do not depend on fast food. Secondly, cooking at home saves money, because buying food every day is expensive. Furthermore, cooking with family is a good way to spend time together. Therefore, schools and parents should encourage students to learn to cook.',
    },
    {
      prompt: 'Tulis isi surat lamaran magang (6–8 kalimat) untuk posisi yang kamu pilih. Mulai dengan salam formal, sebutkan posisi, sumber informasi, dan kemampuanmu, lalu akhiri dengan "I look forward to hearing from you." (salam penutup dan nama tidak perlu ditulis).',
      minWords: 60,
      mustInclude: ['Salam pembuka formal (Dear Sir or Madam / Dear Mr ... / Dear Ms ...)::dear sir or madam|dear mr|dear mrs|dear ms', 'Menyebut tujuan (I am writing to apply for ...)::writing to apply|apply for', 'Penutup (I look forward to hearing from you)::look forward to hearing'],
      model: 'Dear Sir or Madam,\nI am writing to apply for the internship position at your hotel, which I saw on your website. I am a student of SMK Bina Karya, majoring in Hospitality. I have experience in serving guests at my school restaurant, and I can speak English well. I am friendly, hardworking, and I enjoy working in a team. I am available for an interview at any time. I look forward to hearing from you.',
    },
  ],
};

export const SCHOOL_BANK: Record<SchoolLevel, LevelBank> = { sd: SD, smp: SMP, sma: SMA };
/** Minutes per final exam. */
export const SCHOOL_MINUTES: Record<SchoolLevel, number> = { sd: 25, smp: 30, sma: 35 };
