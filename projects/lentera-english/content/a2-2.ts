// A2 · Bab 2 · Unit 1 — Sekarang, Rencana, dan Perbandingan (Premium)
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const presentContinuous = lesson({
  id: 'a2-present-continuous',
  title: 'Present Continuous',
  summary: 'Menceritakan apa yang sedang terjadi dengan am/is/are + -ing.',
  topic: 'a2.present-continuous',
  objectives: [
    'Membentuk present continuous: am/is/are + kata kerja -ing.',
    'Menerapkan aturan ejaan -ing: making, swimming, lying.',
    'Membedakan kegiatan yang sedang terjadi dengan kebiasaan (simple present).',
  ],
  intro: 'Bahasa Indonesia memakai kata "sedang": "Saya sedang makan." Bahasa Inggris tidak punya satu kata untuk "sedang"; maknanya dibawa oleh dua bagian sekaligus: to be (am/is/are) dan kata kerja berakhiran -ing. Kalau salah satunya hilang, kalimatnya salah.',
  teaching: [
    {
      heading: 'Rumus: am / is / are + -ing',
      body: 'To be mengikuti subjek seperti biasa. Untuk menyangkal, tambahkan "not" setelah to be; untuk bertanya, to be pindah ke depan.',
      table: [
        ['Subjek', 'to be', 'kata kerja -ing'],
        ['I', 'am', 'reading'],
        ['he / she / it', 'is', 'cooking'],
        ['you / we / they', 'are', 'playing'],
      ],
      examples: [
        { en: 'Look! The baby is sleeping.', id: 'Lihat! Bayinya sedang tidur.' },
        { en: "We aren't watching TV. We're doing our homework.", id: 'Kami tidak sedang menonton TV. Kami sedang mengerjakan PR.' },
        { en: 'Is it raining?', id: 'Apakah sedang hujan?' },
      ],
    },
    {
      heading: 'Ejaan -ing',
      body: 'Sebagian besar kata kerja cukup ditambah -ing, tetapi ada tiga pola khusus.',
      table: [
        ['Pola', 'Aturan', 'Contoh'],
        ['Umumnya', '+ ing', 'read → reading, play → playing'],
        ['Berakhiran e', 'buang e, + ing', 'make → making, write → writing'],
        ['Satu suku kata: konsonan-vokal-konsonan', 'gandakan konsonan + ing', 'swim → swimming, run → running, sit → sitting'],
        ['Berakhiran ie', 'ie → y + ing', 'lie → lying, die → dying'],
      ],
    },
    {
      heading: 'Sedang atau biasanya?',
      body: 'Simple present untuk kebiasaan dan fakta (every day, usually, always). Present continuous untuk yang sedang terjadi sekarang (now, right now, at the moment, Look!, Listen!) atau yang hanya sementara (this week). Kata kerja keadaan seperti like, know, want, need, dan understand biasanya tidak memakai -ing: "I know the answer", bukan "I am knowing".',
      examples: [
        { en: "I usually walk to school, but today I'm taking the bus.", id: 'Saya biasanya jalan kaki ke sekolah, tetapi hari ini saya naik bus.' },
      ],
    },
  ],
  demo: [
    ['She is cooking dinner now.', 'She cooking dinner now.', '"Sedang" = to be + -ing. Jangan lupa "is".'],
    ['They are swimming in the pool.', 'They are swiming in the pool.', '"swim" berpola konsonan-vokal-konsonan, jadi m digandakan: swimming.'],
    ['I understand the question.', 'I am understanding the question.', '"understand" adalah kata kerja keadaan, jadi biasanya tidak memakai -ing.'],
  ],
  vocab: ['rain', 'wait', 'listen'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'Shh! The baby ___.', [
      ['is sleeping', true],
      ['sleeping', 'Kalimat "sedang" butuh to be: is sleeping.', 'be-ing-missing'],
      ['sleeps', '"sleeps" untuk kebiasaan. "Shh!" menandakan sedang terjadi sekarang.', 'continuous-vs-simple'],
      ['are sleeping', '"The baby" tunggal (= it), jadi "is".', 'am-is-are'],
    ], 'Sedang terjadi + subjek tunggal → is sleeping.', { focus: 'be-ing-missing', hint: 'Ada dua bagian: to be dan kata kerja -ing.' }),
    match(1, 'Pasangkan kata kerja dengan bentuk -ing-nya.', [
      ['make', 'making'],
      ['run', 'running'],
      ['play', 'playing'],
      ['lie', 'lying'],
    ], 'make: buang e; run: n ganda; play: cukup + ing; lie: ie menjadi y.', { focus: 'ing-spelling' }),
    fill(1, 'Listen! Someone ___ at the door. (knock)', ['is knocking'], '"Listen!" menandakan sedang terjadi: is knocking.', {
      knocking: ['Tambahkan to be: is knocking.', 'be-ing-missing'],
      knocks: ['"Listen!" menunjukkan kejadian sekarang, bukan kebiasaan.', 'continuous-vs-simple'],
      'are knocking': ['"Someone" dianggap satu orang, jadi "is".', 'am-is-are'],
    }, { focus: 'be-ing-missing', prompt: 'Tulis bentuk present continuous dari kata dalam kurung.', hint: '"Someone" dianggap satu orang.' }),
    tf(1, 'Kalimat "I am wanting a cup of tea." sudah benar.', false, '"want" adalah kata kerja keadaan, jadi "I want a cup of tea."', 'Kata kerja keadaan seperti want, like, know, dan need biasanya tidak memakai -ing.', { focus: 'continuous-vs-simple', tag: 'continuous-vs-simple', hint: 'Apakah "ingin" itu kegiatan atau keadaan?' }),
  ],
  independent: [
    tr(2, 'Ayah saya sedang mencuci mobil.', ['My father is washing the car', 'My dad is washing the car', 'My father is washing his car', 'My dad is washing his car', "My father's washing the car", "My dad's washing the car"], 'My father + is + washing + the car.', {
      'my father washing the car': ['Kalimat "sedang" butuh to be: is washing.', 'be-ing-missing'],
      'my father is wash the car': ['Setelah to be, kata kerja diberi -ing: washing.', 'be-ing-missing'],
      'my father washes the car': ['"Sedang" berarti kejadian sekarang, jadi present continuous.', 'continuous-vs-simple'],
    }, { focus: 'be-ing-missing' }),
    fill(2, 'The children ___ in the river right now. (swim)', ['are swimming'], 'Jamak + "right now" → are swimming (m ganda).', {
      'are swiming': ['"swim" berpola konsonan-vokal-konsonan: swimming.', 'ing-spelling'],
      'is swimming': ['"The children" jamak, jadi "are".', 'am-is-are'],
      swim: ['"right now" → present continuous: are swimming.', 'continuous-vs-simple'],
    }, { focus: 'ing-spelling', prompt: 'Tulis bentuk present continuous dari kata dalam kurung.' }),
    spot(2, 'My sister is writeing an email to her teacher.', 'writeing', 'writing', 'Kata berakhiran -e: buang e, lalu + ing.', { focus: 'ing-spelling' }),
    dlg(2, 'Lengkapi percakapan berikut.', 'A: Hi Sinta! What are you doing?\nB: ___', [
      ["I'm waiting for the bus.", true],
      ['I wait for the bus.', 'Pertanyaannya tentang saat ini ("What are you doing?"), jadi jawab dengan present continuous.', 'continuous-vs-simple'],
      ['I waiting for the bus.', 'Tambahkan to be: I\'m waiting.', 'be-ing-missing'],
      ["I'm wait for the bus.", 'Setelah "I\'m", kata kerja -ing: waiting.', 'be-ing-missing'],
    ], '"What are you doing?" dijawab dengan present continuous: I\'m + -ing.', { focus: 'continuous-vs-simple' }),
  ],
  homework: [
    read(3, "It's Saturday afternoon at the Wijaya house. Grandma is sitting in the garden and reading a newspaper. Mr Wijaya usually plays tennis on Saturdays, but today he is fixing the roof because it is raining a lot this week. The twins are not helping him. They are playing a video game in their room.", "Why isn't Mr Wijaya playing tennis today?", [
      ['He is fixing the roof.', true],
      ['He is reading a newspaper.', 'Yang membaca koran adalah Nenek.'],
      ['He is playing a video game.', 'Yang bermain video game adalah si kembar.'],
      ['He never plays tennis.', 'Teks menyebut dia "usually plays tennis on Saturdays".'],
    ], '"today he is fixing the roof because it is raining a lot this week."'),
    construct(2, 'not / we / TV / are / watching', ['We are not watching TV', "We aren't watching TV"], 'Subjek + are + not + kata kerja -ing.', undefined, { focus: 'be-ing-missing' }),
    fix(2, 'Look! The bus come.', ['Look! The bus is coming'], '"Look!" menandakan sedang terjadi: is coming (buang e, + ing).', {
      'look the bus is comeing': ['"come" berakhiran e, jadi e dibuang: coming.', 'ing-spelling'],
    }, { focus: 'continuous-vs-simple' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['Dina is studying for her exam at the moment.', true],
      ['Dina studying for her exam at the moment.', 'Tambahkan to be: is studying.', 'be-ing-missing'],
      ['Dina is studing for her exam at the moment.', '"study" + ing = studying (y tetap).', 'ing-spelling'],
      ['Dina studies for her exam at the moment.', '"at the moment" menandakan sedang terjadi.', 'continuous-vs-simple'],
    ], 'is + studying.', { focus: 'be-ing-missing' }),
    fill(3, "I usually ___ coffee, but today I'm drinking tea. (drink)", ['drink'], '"usually" menandakan kebiasaan → simple present: drink.', {
      'am drinking': ['"usually" menandakan kebiasaan, jadi simple present.', 'continuous-vs-simple'],
      drinking: ['Untuk kebiasaan, setelah "I" pakai bentuk dasar: drink.', 'continuous-vs-simple'],
    }, { focus: 'continuous-vs-simple', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
    tr(3, 'Mereka tidak sedang belajar. Mereka sedang tidur.', ['They are not studying. They are sleeping', 'They are not learning. They are sleeping'], "They + aren't + studying. They + are + sleeping.", {
      'they not studying they sleeping': ['Present continuous butuh to be: they are (not) ...', 'be-ing-missing'],
      "they don't study they sleep": ['"Sedang" berarti present continuous: they aren\'t studying.', 'continuous-vs-simple'],
    }, { focus: 'be-ing-missing' }),
    spot(3, 'Why are you siting on the floor?', 'siting', 'sitting', '"sit" berpola konsonan-vokal-konsonan: sitting.', { focus: 'ing-spelling' }),
    fix(3, 'Ahmad is liking his new job very much.', ['Ahmad likes his new job very much'], '"like" adalah kata kerja keadaan: Ahmad likes ...', undefined, { focus: 'continuous-vs-simple' }),
  ],
});

export const futureLesson = lesson({
  id: 'a2-future',
  title: 'Going to dan Will',
  summary: 'Membicarakan rencana, keputusan, janji, dan perkiraan.',
  topic: 'a2.future',
  objectives: [
    'Memakai be going to + bentuk dasar untuk rencana dan perkiraan berdasarkan bukti.',
    'Memakai will + bentuk dasar untuk keputusan saat itu juga, janji, dan tawaran.',
    'Membuat kalimat negatif dan pertanyaan dengan going to dan will.',
  ],
  intro: 'Bahasa Indonesia memakai "akan" untuk hampir semua hal tentang masa depan. Bahasa Inggris punya dua pilihan utama: "be going to" untuk rencana yang sudah dipikirkan, dan "will" untuk keputusan yang diambil saat itu juga, janji, atau tawaran. Keduanya diikuti kata kerja bentuk dasar.',
  teaching: [
    {
      heading: 'Be going to: rencana dan bukti',
      body: 'Dipakai untuk rencana yang sudah diputuskan sebelumnya, dan untuk perkiraan berdasarkan bukti yang terlihat sekarang. Jangan lupa to be (am/is/are).',
      table: [
        ['Subjek', 'to be', 'going to + bentuk dasar'],
        ['I', 'am', 'going to visit Bali.'],
        ['she', 'is', 'going to study medicine.'],
        ['they', 'are', 'going to move house.'],
      ],
      examples: [
        { en: "Look at those clouds. It's going to rain.", id: 'Lihat awan itu. Sebentar lagi hujan.', note: 'Ada bukti sekarang.' },
      ],
    },
    {
      heading: 'Will: keputusan spontan, janji, tawaran',
      body: 'Will sama untuk semua subjek dan diikuti bentuk dasar: "she will go", bukan "she will goes" atau "she will to go". Negatifnya will not (won\'t). Untuk bertanya, will pindah ke depan; tidak perlu "do".',
      examples: [
        { en: "The phone is ringing. — I'll answer it.", id: 'Teleponnya berdering. — Biar saya yang angkat.', note: 'Keputusan diambil saat itu juga.' },
        { en: "I'll call you tonight. I promise.", id: 'Saya akan meneleponmu nanti malam. Saya janji.' },
        { en: 'I think our team will win.', id: 'Menurut saya tim kita akan menang.', note: 'Perkiraan berdasarkan pendapat.' },
      ],
    },
    {
      heading: 'Mana yang dipakai?',
      body: 'Tanyakan pada dirimu: apakah keputusannya sudah dibuat sebelumnya, atau baru saja dibuat?',
      table: [
        ['Situasi', 'Pakai', 'Contoh'],
        ['Rencana yang sudah dibuat', 'be going to', "We're going to have a party on Saturday."],
        ['Memutuskan saat bicara', 'will', "It's cold. I'll close the window."],
        ['Ada bukti sekarang', 'be going to', "Be careful! You're going to fall!"],
        ['Janji atau tawaran', 'will', "I'll help you with your homework."],
      ],
    },
  ],
  demo: [
    ["I'm going to visit my aunt next week.", 'I going to visit my aunt next week.', "Jangan lupa to be: I am (I'm) going to."],
    ['She will call you later.', 'She will calls you later.', 'Setelah "will", kata kerja bentuk dasar, tanpa -s.'],
    ['Will you help me?', 'Do you will help me?', 'Pertanyaan dengan will tidak memakai "do": Will you ...?'],
  ],
  vocab: ['plan', 'promise', 'tonight'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'Look at those dark clouds! It ___ rain.', [
      ['is going to', true],
      ['going to', 'Jangan lupa to be: is going to.', 'going-to-be'],
      ['will to', 'Setelah "will" tidak ada "to".', 'will-base'],
      ['is go to', 'Bentuknya "is going to".', 'going-to-be'],
    ], 'Ada bukti sekarang (awan gelap) → is going to.', { focus: 'going-to-be', hint: 'Ada bukti yang terlihat sekarang. Bentuk lengkapnya punya tiga bagian.' }),
    fill(1, 'I promise I ___ tell anyone your secret.', ["won't", 'will not'], 'Janji → will; negatifnya won\'t.', {
      "don't": ['Untuk janji tentang masa depan pakai "won\'t".', 'will-vs-going-to'],
      'not will': ['Urutannya "will not" (won\'t).', 'will-base'],
    }, { focus: 'will-vs-going-to', prompt: 'Lengkapi dengan bentuk negatif yang tepat.', hint: 'Kalimat ini adalah janji.' }),
    match(1, 'Pasangkan situasi dengan kalimat yang tepat.', [
      ['Rencana liburan yang sudah dipesan', "We're going to fly to Lombok in July."],
      ['Keputusan saat itu juga', "That bag looks heavy. I'll carry it."],
      ['Janji', "I'll be on time tomorrow."],
      ['Ada bukti sekarang', 'Watch out! The glass is going to fall.'],
    ], 'Rencana dan bukti: going to. Keputusan spontan dan janji: will.', { focus: 'will-vs-going-to' }),
    tf(1, 'Kalimat "He will goes to Jakarta tomorrow." sudah benar.', false, 'Setelah "will", bentuk dasar: "He will go to Jakarta tomorrow."', '"will" sudah membawa makna masa depan. Kata kerjanya tidak berubah dan tidak diberi -s.', { focus: 'will-base', tag: 'will-base', hint: 'Apa bentuk kata kerja setelah "will"?' }),
  ],
  independent: [
    tr(2, 'Kami akan pindah rumah bulan depan. (Rencananya sudah pasti.)', ['We are going to move house next month', 'We are going to move next month', 'We are moving house next month', 'We are moving next month'], 'Rencana yang sudah dibuat → be going to. Present continuous juga dipakai untuk rencana yang sudah diatur.', {
      'we going to move house next month': ['Jangan lupa to be: we are going to.', 'going-to-be'],
      'we will to move house next month': ['Setelah "will" tidak ada "to". Untuk rencana yang sudah pasti, pakai "be going to".', 'will-base'],
      'we will move house next month': ['Kalimat ini benar secara tata bahasa, tetapi untuk rencana yang sudah diputuskan lebih tepat "We are going to move house".', 'will-vs-going-to'],
    }, { focus: 'going-to-be' }),
    fill(2, "A: There's no sugar left. B: Don't worry. I ___ go to the shop and get some.", ['will'], 'B memutuskan saat itu juga → will (I\'ll).', {
      'am going to': ['B baru memutuskan sekarang, jadi lebih tepat "will".', 'will-vs-going-to'],
      'going to': ['B memutuskan saat itu juga: I\'ll (I will).', 'will-vs-going-to'],
    }, { focus: 'will-vs-going-to' }),
    arrange(2, 'Apakah kamu akan datang ke pesta Rina?', "Are you going to come to Rina's party", ['will', 'do'], 'Are + you + going to + bentuk dasar ...?', { focus: 'going-to-be' }),
    fix(2, 'My parents are going to buying a new car.', ['My parents are going to buy a new car'], 'Setelah "going to", bentuk dasar: buy.', undefined, { focus: 'going-to-be' }),
  ],
  homework: [
    dlg(2, 'Lengkapi percakapan berikut.', "A: I can't open this jar. It's too tight.\nB: ___", [
      ["Give it to me. I'll try.", true],
      ["Give it to me. I'm going to try.", 'B baru memutuskan untuk membantu saat itu juga, jadi "I\'ll try" lebih tepat.', 'will-vs-going-to'],
      ['Give it to me. I will tries.', 'Setelah "will", bentuk dasar: try.', 'will-base'],
      ['Give it to me. I try tomorrow.', 'B menawarkan bantuan sekarang: "I\'ll try."'],
    ], 'Tawaran dan keputusan spontan → will.', { focus: 'will-vs-going-to' }),
    read(3, "Hi Maya, thanks for your message! Yes, I'm going to be in Yogyakarta next week. My cousin is getting married on Saturday, so my family and I are going to drive there on Thursday. I don't have any plans for Friday yet. Maybe we can meet? I'll send you a message when I arrive. See you soon! — Dita", 'Why is Dita going to Yogyakarta?', [
      ['Her cousin is getting married.', true],
      ['She wants to meet Maya.', 'Dita mungkin bertemu Maya, tetapi alasan utamanya pernikahan sepupunya.'],
      ['She is moving there.', 'Teks tidak menyebut pindah.'],
      ['She has a job interview.', 'Teks tidak menyebut wawancara kerja.'],
    ], '"My cousin is getting married on Saturday."'),
    construct(2, 'will / I / you / tomorrow / call', ['I will call you tomorrow', 'Tomorrow I will call you'], 'Subjek + will + bentuk dasar + objek + waktu.', undefined, { focus: 'will-base' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ['Ani is going to study in Japan next year.', true],
      ['Ani going to study in Japan next year.', 'Jangan lupa to be: is going to.', 'going-to-be'],
      ['Ani is going to studies in Japan next year.', 'Setelah "going to", bentuk dasar: study.', 'going-to-be'],
      ['Ani will to study in Japan next year.', 'Setelah "will" tidak ada "to".', 'will-base'],
    ], 'is going to + bentuk dasar.', { focus: 'going-to-be' }),
    fill(3, "It's very hot in here. I think I ___ open the window.", ['will'], 'Keputusan diambil saat bicara ("I think I\'ll ...") → will.', {
      'am going to': ['Keputusannya baru diambil saat bicara, jadi "will".', 'will-vs-going-to'],
      'will to': ['Setelah "will" tidak ada "to".', 'will-base'],
    }, { focus: 'will-vs-going-to' }),
    tr(3, 'Saya tidak akan terlambat lagi. Saya janji.', ["I won't be late again. I promise"], 'Janji → will not (won\'t) + be late.', {
      "i don't late again i promise": ['Kalimat ini butuh "will" dan "be": I won\'t be late.', 'will-base'],
      "i won't late again i promise": ['"late" adalah kata sifat, jadi perlu "be": won\'t be late.', 'will-base'],
    }, { focus: 'will-base' }),
    spot(3, 'They is going to visit the museum on Sunday.', 'is', 'are', '"They" memakai "are": They are going to ...', { focus: 'going-to-be' }),
    fix(3, 'Do you will come to my graduation?', ['Will you come to my graduation', 'Are you going to come to my graduation'], 'Pertanyaan dengan will tidak memakai "do": Will you ...?', undefined, { focus: 'will-base' }),
  ],
});

export const comparativesLesson = lesson({
  id: 'a2-comparatives',
  title: 'Comparative dan Superlative',
  summary: 'Membandingkan dua hal (lebih ... daripada) dan menyebut yang paling.',
  topic: 'a2.comparatives',
  objectives: [
    'Membentuk comparative dengan -er atau more, diikuti than.',
    'Membentuk superlative dengan the -est atau the most.',
    'Memakai bentuk tak beraturan: good–better–best, bad–worse–worst.',
  ],
  intro: '"Lebih ... daripada" dan "paling ..." dipakai setiap hari untuk membandingkan harga, jarak, atau kualitas. Ada dua jebakan utama bagi penutur bahasa Indonesia: "dari/daripada" diterjemahkan "than", bukan "from"; dan makna "lebih" tidak boleh ditulis dua kali, seperti "more bigger".',
  teaching: [
    {
      heading: 'Comparative: lebih ... daripada',
      body: 'Kata sifat pendek diberi -er; kata sifat panjang memakai "more". Pilih salah satu, jangan keduanya. "Than" berarti "daripada" atau "dari" dalam perbandingan.',
      table: [
        ['Kata sifat', 'Aturan', 'Comparative'],
        ['pendek (satu suku kata)', '+ er', 'cheap → cheaper, tall → taller'],
        ['berakhiran e', '+ r', 'large → larger, nice → nicer'],
        ['konsonan-vokal-konsonan', 'konsonan ganda + er', 'big → bigger, hot → hotter'],
        ['berakhiran y', 'y → ier', 'easy → easier, busy → busier'],
        ['panjang (dua suku kata atau lebih)', 'more + kata sifat', 'expensive → more expensive'],
      ],
      examples: [
        { en: 'Surabaya is bigger than Malang.', id: 'Surabaya lebih besar daripada Malang.' },
      ],
    },
    {
      heading: 'Superlative: paling',
      body: 'Superlative hampir selalu memakai "the".',
      table: [
        ['Kata sifat', 'Superlative'],
        ['cheap', 'the cheapest'],
        ['big', 'the biggest'],
        ['easy', 'the easiest'],
        ['expensive', 'the most expensive'],
      ],
      examples: [
        { en: 'Mount Everest is the highest mountain in the world.', id: 'Gunung Everest adalah gunung tertinggi di dunia.' },
      ],
    },
    {
      heading: 'Bentuk tak beraturan',
      body: 'Tiga kata ini harus dihafal. Jangan "gooder", "more good", atau "badder".',
      table: [
        ['Dasar', 'Comparative', 'Superlative'],
        ['good', 'better', 'the best'],
        ['bad', 'worse', 'the worst'],
        ['far', 'farther / further', 'the farthest / the furthest'],
      ],
    },
  ],
  demo: [
    ['This bag is cheaper than that one.', 'This bag is cheaper from that one.', '"Daripada" dalam perbandingan = than.'],
    ['Jakarta is bigger than Bandung.', 'Jakarta is more bigger than Bandung.', '"bigger" sudah berarti lebih besar. Jangan tambahkan "more".'],
    ['This is the best nasi goreng in town.', 'This is the most good nasi goreng in town.', '"good" tak beraturan: better, the best.'],
  ],
  vocab: ['cheap', 'expensive', 'crowded', 'far'],
  guided: [
    mc(1, 'Pilih bentuk yang tepat.', 'A motorbike is ___ than a car.', [
      ['cheaper', true],
      ['more cheap', '"cheap" pendek (satu suku kata), jadi cheaper.', 'more-er'],
      ['more cheaper', '"cheaper" sudah berarti lebih murah. Jangan tambahkan "more".', 'more-er'],
      ['cheapest', '"cheapest" berarti paling murah. Ada "than", jadi comparative.', 'superlative-the'],
    ], 'Kata sifat pendek + er + than.', { focus: 'more-er', hint: '"cheap" hanya satu suku kata.' }),
    match(1, 'Pasangkan kata sifat dengan bentuk comparative-nya.', [
      ['big', 'bigger'],
      ['easy', 'easier'],
      ['good', 'better'],
      ['beautiful', 'more beautiful'],
    ], 'big: g ganda; easy: y menjadi ier; good: tak beraturan; beautiful: panjang, jadi more.', { focus: 'more-er' }),
    fill(1, "My house is smaller ___ my uncle's house.", ['than'], 'Perbandingan memakai "than".', {
      from: ['"Dari/daripada" dalam perbandingan = than, bukan from.', 'than-from'],
      then: ['"then" berarti lalu atau kemudian. Perbandingan memakai "than".', 'than-from'],
    }, { focus: 'than-from', hint: 'Kata yang berarti "daripada" dalam perbandingan.' }),
    tf(1, 'Kalimat "Mount Bromo is the most beautiful place I know." sudah benar.', true, 'Benar. "beautiful" adalah kata sifat panjang, jadi superlatifnya "the most beautiful".', 'Kata sifat panjang membentuk superlatif dengan "the most", dan itulah yang dipakai di kalimat ini.', { focus: 'superlative-the' }),
  ],
  independent: [
    tr(2, 'Kereta lebih cepat daripada bus.', ['The train is faster than the bus', 'Trains are faster than buses', 'A train is faster than a bus', 'The train is quicker than the bus', 'Trains are quicker than buses', 'A train is quicker than a bus'], 'fast → faster + than.', {
      'the train is more faster than the bus': ['Jangan pakai "more" bersama -er.', 'more-er'],
      'the train is faster from the bus': ['"Daripada" = than.', 'than-from'],
      'the train is more fast than the bus': ['"fast" pendek: faster.', 'more-er'],
    }, { focus: 'than-from' }),
    fill(2, 'Lebaran is ___ time of the year for train stations. (busy)', ['the busiest'], 'Paling sibuk: the + busiest (y menjadi iest).', {
      busiest: ['Superlatif memakai "the": the busiest.', 'superlative-the'],
      'the busyest': ['Huruf y setelah konsonan berubah menjadi i: busiest.', 'more-er'],
      'the most busy': ['"busy" berakhiran y: the busiest.', 'more-er'],
    }, { focus: 'superlative-the', prompt: 'Tulis bentuk superlative dari kata dalam kurung.' }),
    spot(2, 'This exam is easyer than the last one.', 'easyer', 'easier', 'Kata berakhiran y setelah konsonan: y menjadi ier. easy → easier.', { focus: 'more-er' }),
    arrange(2, 'Ini restoran terbaik di kota ini.', 'This is the best restaurant in this city', ['most', 'good', 'better'], 'good → the best.', { focus: 'superlative-the' }),
  ],
  homework: [
    read(3, "Three friends compare their phones. Dani's phone is the cheapest; it costs only one million rupiah, but its battery is the worst. Maya's phone is more expensive than Dani's, and its camera is better. Eko's phone is the most expensive of the three. It has the best camera and the biggest screen.", 'Whose phone has the best camera?', [
      ["Eko's", true],
      ["Maya's", 'Kamera Maya lebih baik daripada milik Dani, tetapi yang terbaik milik Eko.'],
      ["Dani's", 'Ponsel Dani paling murah, dan teks tidak menyebut kameranya bagus.'],
      ['All three are the same.', 'Teks membandingkan ketiganya; yang terbaik milik Eko.'],
    ], '"It has the best camera and the biggest screen." merujuk ponsel Eko.'),
    construct(2, 'a plane / than / faster / is / a train', ['A plane is faster than a train'], 'Subjek + is + faster + than + pembanding.', undefined, { focus: 'than-from' }),
    fix(2, 'My brother is more taller than my father.', ['My brother is taller than my father'], '"taller" sudah berarti lebih tinggi. Hapus "more".', undefined, { focus: 'more-er' }),
  ],
  mastery: [
    mc(2, 'Pilih kalimat yang benar.', null, [
      ["Today's test was worse than last week's.", true],
      ["Today's test was badder than last week's.", '"bad" tak beraturan: worse.', 'more-er'],
      ["Today's test was more bad than last week's.", '"bad" tak beraturan: worse.', 'more-er'],
      ["Today's test was worse from last week's.", 'Perbandingan memakai "than".', 'than-from'],
    ], 'bad → worse (tak beraturan).', { focus: 'more-er' }),
    fill(3, 'Rizki has ___ journey to school of all the students in my class. (long)', ['the longest'], 'Paling panjang: the longest.', {
      longest: ['Superlatif di depan kata benda memakai "the": the longest journey.', 'superlative-the'],
      'the most long': ['"long" pendek (satu suku kata): the longest.', 'more-er'],
      'the longer': ['"of all the students" menandakan superlatif (paling): the longest.', 'superlative-the'],
    }, { focus: 'superlative-the', prompt: 'Tulis bentuk superlative dari kata dalam kurung.' }),
    tr(3, 'Jakarta adalah kota terbesar di Indonesia.', ['Jakarta is the biggest city in Indonesia', 'Jakarta is the largest city in Indonesia'], 'big → the biggest (g ganda), atau large → the largest.', {
      'jakarta is the bigest city in indonesia': ['"big" berpola konsonan-vokal-konsonan, jadi g digandakan: the biggest.', 'more-er'],
      'jakarta is biggest city in indonesia': ['Superlatif memakai "the".', 'superlative-the'],
      'jakarta is the most big city in indonesia': ['"big" pendek: the biggest.', 'more-er'],
    }, { focus: 'superlative-the' }),
    spot(3, 'My new laptop is much faster then my old one.', 'then', 'than', '"then" berarti lalu. Perbandingan memakai "than".', { focus: 'than-from' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Which is better for the trip to Malang, the train or the bus?\nB: ___', [
      ["The train. It's more comfortable than the bus.", true],
      ["The train. It's comfortabler than the bus.", '"comfortable" kata sifat panjang: more comfortable.', 'more-er'],
      ["The train. It's more comfortable from the bus.", 'Perbandingan memakai "than".', 'than-from'],
      ["The train. It's the more comfortable than the bus.", 'Comparative tidak memakai "the": more comfortable than.', 'superlative-the'],
    ], 'Kata sifat panjang: more ... than.', { focus: 'more-er' }),
  ],
});
