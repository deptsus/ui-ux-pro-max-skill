// B1 – C2: satu pelajaran lengkap per level. Unit lain di level ini masih
// berada di silabus (lihat syllabus.ts) dan ditandai "sedang disusun".
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const presentPerfect = lesson({
  id: 'b1-present-perfect',
  title: 'Present Perfect vs Simple Past',
  summary: 'Membedakan pengalaman dan hasil yang masih relevan dari kejadian lampau yang sudah selesai.',
  topic: 'b1.present-perfect',
  objectives: [
    'Membentuk present perfect: have/has + bentuk ketiga (past participle).',
    'Memilih present perfect atau simple past berdasarkan penanda waktu.',
    'Memakai for dan since dengan tepat.',
  ],
  intro: 'Bahasa Indonesia memakai "sudah" atau "pernah" untuk banyak situasi. Bahasa Inggris membaginya menjadi dua tense. Kuncinya satu pertanyaan: apakah kalimat menyebut WAKTU SELESAI yang spesifik? Jika ya, simple past. Jika tidak, atau jika masih berlanjut sampai sekarang, present perfect.',
  teaching: [
    {
      heading: 'Bentuk dan makna',
      body: 'Present perfect = have/has + bentuk ketiga. Tense ini menghubungkan masa lalu dengan sekarang: pengalaman hidup (pernah), kejadian yang hasilnya masih terasa, atau keadaan yang dimulai dulu dan masih berlangsung.',
      examples: [
        { en: 'I have visited Bali twice.', id: 'Saya sudah dua kali mengunjungi Bali.', note: 'Pengalaman. Kapan tepatnya tidak penting.' },
        { en: 'She has lost her keys.', id: 'Dia kehilangan kuncinya.', note: 'Hasilnya masih terasa: sekarang kuncinya belum ketemu.' },
        { en: 'We have lived here since 2019.', id: 'Kami tinggal di sini sejak 2019.', note: 'Masih tinggal di sini sampai sekarang.' },
      ],
    },
    {
      heading: 'Penanda waktu menentukan tense',
      body: 'Waktu yang sudah selesai (yesterday, last year, in 2015, two days ago, when I was a child) mewajibkan simple past. Present perfect TIDAK boleh dipakai bersama penanda itu.',
      table: [
        ['Simple past', 'Present perfect'],
        ['yesterday, last week, in 2015, ago', 'ever, never, already, yet, just'],
        ['when I was young', 'for (lamanya), since (titik awal)'],
        ['I saw that film last week.', 'I have seen that film.'],
      ],
    },
    {
      heading: 'For atau since?',
      body: 'For diikuti LAMANYA waktu (for three years, for a long time). Since diikuti TITIK AWAL (since 2019, since Monday, since I was a child).',
    },
  ],
  demo: [
    ['I saw him yesterday.', 'I have seen him yesterday.', '"yesterday" adalah waktu yang sudah selesai, jadi wajib simple past.'],
    ['She has worked here for five years.', 'She has worked here since five years.', '"five years" adalah lamanya waktu, jadi memakai "for".'],
    ['Have you ever eaten durian?', 'Did you ever eat durian?', 'Menanyakan pengalaman seumur hidup memakai present perfect.'],
  ],
  guided: [
    mc(2, 'Pilih bentuk yang tepat.', 'I ___ to Singapore in 2022.', [
      ['went', true],
      ['have gone', '"in 2022" adalah waktu yang sudah selesai, jadi simple past.', 'perfect-vs-past'],
      ['have been', '"in 2022" adalah waktu yang sudah selesai, jadi simple past.', 'perfect-vs-past'],
      ['go', 'Kejadiannya di masa lalu.'],
    ], 'Ada penanda waktu selesai ("in 2022"), jadi simple past: went.', { focus: 'perfect-vs-past', hint: 'Apakah kalimat menyebut waktu yang sudah selesai?' }),
    match(2, 'Pasangkan kata kerja dengan bentuk ketiganya (past participle).', [
      ['see', 'seen'],
      ['eat', 'eaten'],
      ['go', 'gone'],
      ['write', 'written'],
    ], 'Bentuk ketiga dipakai setelah have/has.', { focus: 'participle' }),
    fill(2, 'We have known each other ___ 2015.', ['since'], '"2015" adalah titik awal, jadi "since".', { for: ['"for" diikuti lamanya waktu (for ten years). "2015" adalah titik awal.', 'since-for'] }, { focus: 'since-for', hint: '2015 itu lamanya waktu atau titik awal?' }),
    tf(2, 'Kalimat "She has finished her homework last night." sudah benar.', false, '"last night" adalah waktu selesai, jadi harus simple past: "She finished her homework last night."', 'Present perfect tidak boleh dipakai bersama penanda waktu yang sudah selesai.', { focus: 'perfect-vs-past', tag: 'perfect-vs-past', hint: 'Perhatikan penanda waktunya.' }),
  ],
  independent: [
    fill(3, 'He has lived in Makassar ___ ten years.', ['for'], '"ten years" adalah lamanya waktu, jadi "for".', { since: ['"since" diikuti titik awal (since 2015), bukan lamanya waktu.', 'since-for'] }, { focus: 'since-for' }),
    tr(3, 'Apakah kamu pernah mencoba rendang?', ['Have you ever tried rendang', 'Have you tried rendang', 'Have you ever eaten rendang', 'Have you ever had rendang'], 'Pengalaman seumur hidup: Have + you + ever + bentuk ketiga.', { 'did you ever try rendang': ['Pengalaman tanpa waktu spesifik memakai present perfect: Have you ever tried ...?', 'perfect-vs-past'], 'have you ever try rendang': ['Setelah have dipakai bentuk ketiga: tried.', 'participle'] }, { focus: 'perfect-vs-past' }),
    fix(3, 'I have bought this phone two months ago.', ['I bought this phone two months ago'], '"two months ago" adalah waktu selesai, jadi simple past.', undefined, { focus: 'perfect-vs-past' }),
    spot(3, 'She has went to the dentist three times this year.', 'went', 'gone', 'Setelah "has" dipakai bentuk ketiga: gone (atau been).', { focus: 'participle' }),
  ],
  homework: [
    construct(3, 'never / I / seen / have / snow', ['I have never seen snow', "I've never seen snow"], 'Subjek + have + never + bentuk ketiga + objek.', undefined, { focus: 'participle' }),
    dlg(3, 'Lengkapi percakapan berikut.', 'A: Have you finished the report yet?\nB: ___', [
      ['Yes, I finished it this morning.', true],
      ['Yes, I have finished it this morning.', '"this morning" (sudah lewat) adalah waktu selesai, jadi simple past.', 'perfect-vs-past'],
      ['Yes, I finish it this morning.', 'Kejadiannya sudah selesai, jadi perlu bentuk lampau.'],
      ['Yes, I did finished it.', 'Setelah "did" dipakai bentuk dasar.'],
    ], 'Pertanyaan memakai present perfect, tetapi begitu jawaban menyebut waktu selesai, tense berubah menjadi simple past.', { focus: 'perfect-vs-past' }),
    fill(3, 'I ___ my grandmother since last Lebaran. (not / see)', ["haven't seen", 'have not seen'], '"since" menandakan keadaan yang berlanjut sampai sekarang: have not + seen.', { "didn't see": ['"since last Lebaran" berarti sampai sekarang, jadi present perfect.', 'perfect-vs-past'], "haven't saw": ['Setelah have dipakai bentuk ketiga: seen.', 'participle'] }, { focus: 'perfect-vs-past', prompt: 'Lengkapi dengan bentuk kata kerja yang tepat.' }),
  ],
  mastery: [
    mc(3, 'Pilih kalimat yang benar.', null, [
      ['I have already eaten, thanks.', true],
      ['I have already ate, thanks.', 'Setelah "have" dipakai bentuk ketiga: eaten.', 'participle'],
      ['I already eaten, thanks.', 'Present perfect membutuhkan "have".'],
      ['I have already eat, thanks.', 'Setelah "have" dipakai bentuk ketiga: eaten.', 'participle'],
    ], 'have + already + bentuk ketiga (eaten).', { focus: 'participle' }),
    fill(3, 'My sister ___ in London when she was a student. (live)', ['lived'], '"when she was a student" adalah masa yang sudah selesai, jadi simple past.', { 'has lived': ['Masa itu sudah berakhir, jadi simple past.', 'perfect-vs-past'] }, { focus: 'perfect-vs-past', prompt: 'Lengkapi dengan bentuk kata kerja yang tepat.' }),
    fill(3, 'They have been married ___ 2010.', ['since'], '"2010" adalah titik awal.', { for: ['"for" diikuti lamanya waktu.', 'since-for'] }, { focus: 'since-for' }),
    tr(4, 'Saya sudah bekerja di sini selama tiga tahun.', ['I have worked here for three years', "I've worked here for three years", 'I have been working here for three years', "I've been working here for three years"], 'Masih bekerja sampai sekarang: have worked + for + lamanya waktu.', { 'i worked here for three years': ['Simple past berarti kamu sudah tidak bekerja di sana. Kalimat ini masih berlangsung.', 'perfect-vs-past'], 'i have worked here since three years': ['"three years" lamanya waktu: for.', 'since-for'] }, { focus: 'perfect-vs-past' }),
    fix(4, 'Did you ever been to Lombok?', ['Have you ever been to Lombok'], 'Pengalaman seumur hidup: Have you ever been ...?', undefined, { focus: 'perfect-vs-past' }),
  ],
});

export const passive = lesson({
  id: 'b2-passive',
  title: 'Passive Voice di Berbagai Tense',
  summary: 'Memindahkan fokus ke objek dengan be + past participle.',
  topic: 'b2.passive',
  objectives: [
    'Membentuk kalimat pasif: be (sesuai tense) + past participle.',
    'Mengubah kalimat aktif menjadi pasif di simple present, simple past, present perfect, dan modal.',
    'Memutuskan kapan pelaku (by ...) perlu disebut.',
  ],
  intro: 'Bahasa Indonesia sangat sering memakai awalan di- ("Surat itu dikirim kemarin"). Padanannya dalam bahasa Inggris adalah passive voice. Rumusnya satu: be + past participle. Yang berubah mengikuti tense hanyalah "be"-nya.',
  teaching: [
    {
      heading: 'Rumus: be + past participle',
      body: 'Kata kerja utama selalu bentuk ketiga. Tense ditunjukkan oleh to be.',
      table: [
        ['Tense', 'Aktif', 'Pasif'],
        ['Simple present', 'They make cars here.', 'Cars are made here.'],
        ['Simple past', 'Someone stole my bike.', 'My bike was stolen.'],
        ['Present perfect', 'They have cancelled the flight.', 'The flight has been cancelled.'],
        ['Modal', 'You must wear a helmet.', 'A helmet must be worn.'],
      ],
    },
    {
      heading: 'Kapan pasif dipakai',
      body: 'Pakai pasif ketika pelaku tidak diketahui, tidak penting, atau sudah jelas, dan ketika kamu ingin menonjolkan hal yang dikenai tindakan. Sebutkan pelaku dengan "by" hanya jika informasinya penting.',
      examples: [
        { en: 'The bridge was built in 1998.', id: 'Jembatan itu dibangun pada 1998.', note: 'Siapa yang membangun tidak penting.' },
        { en: 'This song was written by Ismail Marzuki.', id: 'Lagu ini ditulis oleh Ismail Marzuki.', note: 'Pelaku penting, jadi disebut.' },
      ],
    },
  ],
  demo: [
    ['The letter was sent yesterday.', 'The letter sent yesterday.', 'Pasif wajib memakai to be: was sent.'],
    ['English is spoken in many countries.', 'English is speak in many countries.', 'Kata kerja utama harus bentuk ketiga: spoken.'],
    ['The room has been cleaned.', 'The room has cleaned.', 'Present perfect pasif: has + been + bentuk ketiga.'],
  ],
  guided: [
    mc(3, 'Pilih bentuk pasif yang tepat.', 'This temple ___ in the 9th century.', [
      ['was built', true],
      ['built', 'Tanpa to be, kalimat berarti "candi ini membangun".', 'passive-be'],
      ['is built', 'Abad ke-9 adalah masa lalu, jadi to be-nya "was".'],
      ['was build', 'Kata kerja utama harus bentuk ketiga: built.', 'passive-participle'],
    ], 'Simple past pasif: was + built.', { focus: 'passive-be', hint: 'Rumus: be + bentuk ketiga. Tense-nya lampau.' }),
    fill(3, 'Rice ___ grown in many parts of Indonesia.', ['is'], 'Fakta umum (simple present) dan "rice" tunggal: is grown.', { are: ['"Rice" tidak bisa dihitung dan dianggap tunggal.'], was: ['Ini fakta yang masih berlaku, jadi simple present.'] }, { focus: 'passive-be', hint: 'Fakta umum memakai simple present.' }),
    arrange(3, 'Penerbangan itu telah dibatalkan.', 'The flight has been cancelled', ['was', 'being'], 'Present perfect pasif: has + been + cancelled.', { focus: 'passive-be', hint: 'has + been + bentuk ketiga.' }),
    tf(3, 'Kalimat "The report must be finish by Friday." sudah benar.', false, 'Setelah "be", kata kerja harus bentuk ketiga: "must be finished".', 'Modal pasif: modal + be + bentuk ketiga.', { focus: 'passive-participle', tag: 'passive-participle', hint: 'Periksa bentuk kata kerja setelah "be".' }),
  ],
  independent: [
    tr(4, 'Jendela itu dipecahkan oleh anak-anak.', ['The window was broken by the children', 'The window was broken by children', 'The window was broken by the kids'], 'Simple past pasif + pelaku: was broken by ...', { 'the window broken by the children': ['Pasif membutuhkan to be: was broken.', 'passive-be'], 'the window was broke by the children': ['Bentuk ketiga "break" adalah "broken".', 'passive-participle'] }, { focus: 'passive-be' }),
    fix(3, 'My wallet stolen on the bus this morning.', ['My wallet was stolen on the bus this morning'], 'Pasif membutuhkan to be: was stolen.', undefined, { focus: 'passive-be' }),
    fill(4, 'The new road ___ next month. (will / open)', ['will be opened'], 'Modal pasif: will + be + bentuk ketiga.', { 'will opened': ['Setelah modal dibutuhkan "be": will be opened.', 'passive-be'], 'will be open': ['Setelah "be" dipakai bentuk ketiga: opened.', 'passive-participle'] }, { focus: 'passive-be', prompt: 'Lengkapi dengan bentuk pasif yang tepat.' }),
    spot(3, 'These shoes are make in Bandung.', 'make', 'made', 'Bentuk ketiga "make" adalah "made".', { focus: 'passive-participle' }),
  ],
  homework: [
    construct(3, 'taught / in this school / English / is', ['English is taught in this school'], 'Subjek (yang dikenai) + is + bentuk ketiga + keterangan.', undefined, { focus: 'passive-be' }),
    tr(4, 'Semua tiket sudah terjual.', ['All the tickets have been sold', 'All tickets have been sold', 'All of the tickets have been sold'], 'Present perfect pasif jamak: have been sold.', { 'all the tickets have sold': ['Present perfect pasif membutuhkan "been".', 'passive-be'], 'all the tickets has been sold': ['"tickets" jamak, jadi "have".'] }, { focus: 'passive-be' }),
    read(3, 'Batik is made by applying wax to cloth before it is dyed. The technique has been practised in Java for centuries. In 2009, Indonesian batik was recognised by UNESCO as a Masterpiece of Oral and Intangible Heritage of Humanity.', 'According to the text, what happened in 2009?', [
      ['Batik was recognised by UNESCO.', true],
      ['Batik was invented in Java.', 'Teks menyebut teknik ini sudah dipraktikkan berabad-abad.'],
      ['Wax was first applied to cloth.', 'Itu penjelasan cara membuat batik, bukan kejadian tahun 2009.'],
      ['UNESCO was founded in Indonesia.', 'Teks tidak menyebut hal ini.'],
    ], 'Kalimat terakhir: "In 2009, Indonesian batik was recognised by UNESCO ..."'),
  ],
  mastery: [
    fill(3, 'Hundreds of trees ___ planted last year.', ['were'], 'Simple past, subjek jamak: were planted.', { was: ['"trees" jamak.', 'was-were'], are: ['"last year" menandakan lampau.'] }, { focus: 'passive-be' }),
    mc(3, 'Pilih bentuk pasif dari: "They have repaired the bridge."', null, [
      ['The bridge has been repaired.', true],
      ['The bridge has repaired.', 'Tanpa "been", kalimat masih aktif.', 'passive-be'],
      ['The bridge was been repaired.', 'Present perfect memakai "has been", bukan "was been".', 'passive-be'],
      ['The bridge have been repaired.', '"The bridge" tunggal: has.'],
    ], 'have repaired → has been repaired.', { focus: 'passive-be' }),
    fix(4, 'The winners will announce tomorrow.', ['The winners will be announced tomorrow'], 'Para pemenang diumumkan (dikenai tindakan): will be announced.', undefined, { focus: 'passive-be' }),
    tr(4, 'Bahasa Inggris digunakan di seluruh dunia.', ['English is used all over the world', 'English is used around the world', 'English is spoken all over the world', 'English is spoken around the world', 'English is used throughout the world'], 'Simple present pasif: is used / is spoken.', { 'english used all over the world': ['Pasif membutuhkan to be: is used.', 'passive-be'] }, { focus: 'passive-be' }),
    spot(4, 'The documents must be sign by the manager.', 'sign', 'signed', 'Setelah "be": bentuk ketiga, signed.', { focus: 'passive-participle' }),
  ],
});

export const inversion = lesson({
  id: 'c1-inversion',
  title: 'Inversi untuk Penekanan',
  summary: 'Membalik subjek dan kata bantu setelah keterangan negatif di awal kalimat.',
  topic: 'c1.inversion',
  objectives: [
    'Mengenali keterangan negatif/pembatas yang memicu inversi: never, rarely, not only, no sooner, hardly, under no circumstances.',
    'Menyusun inversi dengan kata bantu yang tepat (do/does/did, have/had, modal).',
    'Memakai inversi secara wajar dalam tulisan formal.',
  ],
  intro: 'Dalam tulisan formal, pidato, dan esai akademik, penutur mahir sering memindahkan keterangan negatif ke awal kalimat untuk memberi tekanan. Ketika itu terjadi, urutan subjek dan kata bantu dibalik seperti dalam pertanyaan. Struktur ini menjadi salah satu penanda kemahiran C1.',
  teaching: [
    {
      heading: 'Pola dasar',
      body: 'Keterangan negatif + kata bantu + subjek + kata kerja utama. Jika kalimat asalnya tidak punya kata bantu, tambahkan do/does/did, dan kata kerja utama kembali ke bentuk dasar.',
      table: [
        ['Urutan biasa', 'Dengan inversi'],
        ['I have never seen such a view.', 'Never have I seen such a view.'],
        ['She rarely complains.', 'Rarely does she complain.'],
        ['He not only sings but also composes.', 'Not only does he sing, but he also composes.'],
        ['You must not open this door under any circumstances.', 'Under no circumstances must you open this door.'],
      ],
    },
    {
      heading: 'Pasangan tetap',
      body: '"No sooner ... than" dan "Hardly/Scarcely ... when" biasanya memakai past perfect. Keduanya berarti "baru saja ... ketika ...".',
      examples: [
        { en: 'No sooner had we arrived than it started to rain.', id: 'Baru saja kami tiba, hujan mulai turun.' },
        { en: 'Hardly had she sat down when the phone rang.', id: 'Baru saja dia duduk, telepon berdering.' },
      ],
    },
    {
      heading: 'Catatan register',
      body: 'Inversi terdengar formal dan dramatis. Pakai secukupnya dalam esai, laporan, atau pidato. Dalam percakapan sehari-hari, urutan biasa lebih wajar.',
    },
  ],
  demo: [
    ['Never have I felt so welcome.', 'Never I have felt so welcome.', 'Setelah "Never" di awal kalimat, kata bantu mendahului subjek: have I.'],
    ['Rarely does he arrive late.', 'Rarely does he arrives late.', 'Setelah "does", kata kerja kembali ke bentuk dasar: arrive.'],
    ['No sooner had I left than she called.', 'No sooner had I left when she called.', '"No sooner" berpasangan dengan "than". "When" berpasangan dengan "hardly/scarcely".'],
  ],
  guided: [
    mc(4, 'Pilih kelanjutan yang benar.', 'Seldom ___ such dedication in a new employee.', [
      ['have we seen', true],
      ['we have seen', 'Setelah "Seldom" di awal kalimat, kata bantu harus mendahului subjek.', 'inversion-order'],
      ['we saw', 'Tidak ada inversi dan tidak ada kata bantu.', 'inversion-order'],
      ['have seen we', 'Urutannya: kata bantu + subjek + kata kerja utama.', 'inversion-order'],
    ], 'Seldom + have + we + seen.', { focus: 'inversion-order', hint: 'Susun seperti pertanyaan: kata bantu dulu, lalu subjek.' }),
    arrange(4, 'Belum pernah saya melihat matahari terbenam seindah ini.', 'Never have I seen such a beautiful sunset', ['did', 'saw'], 'Never + have + I + seen ...', { focus: 'inversion-order', hint: 'Mulai dengan "Never", lalu kata bantu.' }),
    fill(4, 'Not only ___ she speak French, but she also teaches it.', ['does'], 'Kalimat asal "She speaks French" tidak punya kata bantu, jadi tambahkan "does".', { did: ['Bagian kedua ("teaches") memakai present, jadi kata bantunya "does".'], is: ['"speak" kata kerja biasa: does.'] }, { focus: 'inversion-order', hint: 'Kalimat asalnya: She speaks French.' }),
    tf(4, 'Kalimat "Under no circumstances you should share your password." sudah benar.', false, 'Setelah "Under no circumstances", modal mendahului subjek: "should you share".', 'Frasa negatif di awal kalimat mewajibkan inversi.', { focus: 'inversion-order', tag: 'inversion-order', hint: 'Di mana posisi "should"?' }),
  ],
  independent: [
    fix(4, 'Rarely she talks about her childhood.', ['Rarely does she talk about her childhood'], 'Tambahkan "does", lalu kata kerja kembali ke bentuk dasar.', { 'rarely does she talks about her childhood': ['Setelah "does", kata kerja bentuk dasar: talk.', 'does-base'], 'rarely talks she about her childhood': ['Kata kerja biasa tidak bisa dibalik langsung. Pakai kata bantu "does".', 'inversion-order'] }, { focus: 'inversion-order' }),
    fill(5, 'No sooner had the meeting started ___ the fire alarm went off.', ['than'], '"No sooner" selalu berpasangan dengan "than".', { when: ['"when" berpasangan dengan hardly/scarcely. "No sooner" memakai "than".', 'inversion-pair'], then: ['"then" berarti "kemudian". Pasangan "No sooner" adalah "than".', 'inversion-pair'] }, { focus: 'inversion-pair' }),
    tr(5, 'Baru saja saya tertidur, telepon berdering. (mulai dengan "Hardly")', ['Hardly had I fallen asleep when the phone rang', 'Hardly had I fallen asleep when the telephone rang'], 'Hardly + had + subjek + bentuk ketiga + when + simple past.', { 'hardly i had fallen asleep when the phone rang': ['Setelah "Hardly", "had" mendahului subjek.', 'inversion-order'], 'hardly had i fallen asleep than the phone rang': ['"Hardly" berpasangan dengan "when".', 'inversion-pair'] }, { focus: 'inversion-order' }),
    spot(4, 'Little did they knew about the risks involved.', 'knew', 'know', 'Setelah "did", kata kerja bentuk dasar: know.', { focus: 'inversion-order' }),
  ],
  homework: [
    construct(4, 'had / never / before / such chaos / I / witnessed', ['Never before had I witnessed such chaos', 'Never had I witnessed such chaos before'], 'Never (before) + had + I + witnessed ...', undefined, { focus: 'inversion-order' }),
    fix(5, 'Only after the results were published the committee admitted its mistake.', ['Only after the results were published did the committee admit its mistake'], '"Only after ..." di awal kalimat memicu inversi pada klausa utama: did the committee admit.', undefined, { focus: 'inversion-order' }),
    mc(4, 'Dalam situasi mana inversi PALING wajar dipakai?', null, [
      ['Paragraf penutup sebuah esai akademik', true],
      ['Pesan singkat kepada teman dekat', 'Dalam pesan santai, inversi terdengar kaku dan berlebihan.'],
      ['Memesan makanan di warung', 'Percakapan sehari-hari memakai urutan biasa.'],
      ['Mengobrol di grup keluarga', 'Percakapan sehari-hari memakai urutan biasa.'],
    ], 'Inversi adalah ciri register formal dan tertulis.'),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang benar.', null, [
      ['Not until I got home did I realise my mistake.', true],
      ['Not until I got home I realised my mistake.', 'Klausa utama setelah "Not until ..." wajib inversi.', 'inversion-order'],
      ['Not until did I get home I realised my mistake.', 'Inversi terjadi pada klausa UTAMA, bukan pada klausa setelah "until".', 'inversion-order'],
      ['Not until I got home did I realised my mistake.', 'Setelah "did", kata kerja bentuk dasar: realise.', 'does-base'],
    ], 'Not until + klausa waktu + did + subjek + kata kerja dasar.', { focus: 'inversion-order' }),
    fill(4, 'Hardly had we sat down ___ the lights went out.', ['when'], '"Hardly" berpasangan dengan "when".', { than: ['"than" berpasangan dengan "No sooner".', 'inversion-pair'] }, { focus: 'inversion-pair' }),
    fix(5, 'Never I have read such a moving story.', ['Never have I read such a moving story'], 'Never + have + I + read.', undefined, { focus: 'inversion-order' }),
    tr(5, 'Dalam keadaan apa pun pintu ini tidak boleh dibuka. (mulai dengan "Under no circumstances")', ['Under no circumstances should this door be opened', 'Under no circumstances must this door be opened', 'Under no circumstances may this door be opened', 'Under no circumstances is this door to be opened'], 'Under no circumstances + modal + subjek + be + bentuk ketiga.', { 'under no circumstances this door should be opened': ['Modal harus mendahului subjek.', 'inversion-order'] }, { focus: 'inversion-order' }),
    fill(5, 'So absorbed ___ she in the novel that she missed her stop.', ['was'], 'Pola "So + kata sifat + be + subjek + that ...": So absorbed was she.', { did: ['Kalimat asal memakai to be ("She was so absorbed"), jadi yang dibalik adalah "was".', 'inversion-order'] }, { focus: 'inversion-order' }),
  ],
});

export const subjunctive = lesson({
  id: 'c2-subjunctive',
  title: 'Subjunctive Formal dan Pengandaian Lanjut',
  summary: 'Bentuk mandative subjunctive dan struktur pengandaian yang dipakai dalam bahasa resmi.',
  topic: 'c2.subjunctive',
  objectives: [
    'Memakai mandative subjunctive setelah suggest, insist, demand, recommend, it is essential that.',
    'Memakai "were" untuk pengandaian yang berlawanan dengan kenyataan.',
    'Menyusun pengandaian formal tanpa "if": Were I..., Had she..., Should you...',
  ],
  intro: 'Pada level C2 kamu tidak hanya dituntut benar, tetapi juga peka terhadap register. Subjunctive jarang terdengar dalam obrolan, tetapi wajib dikuasai untuk dokumen hukum, notulen rapat, surat resmi, dan tulisan akademik.',
  teaching: [
    {
      heading: 'Mandative subjunctive',
      body: 'Setelah kata kerja atau ungkapan yang menyatakan tuntutan, saran, atau keharusan, klausa "that" memakai kata kerja BENTUK DASAR untuk semua subjek. Tidak ada -s, tidak ada bentuk lampau. Negatifnya: not + bentuk dasar.',
      examples: [
        { en: 'The board insists that he resign.', id: 'Dewan menuntut agar dia mengundurkan diri.', note: 'Bukan "resigns".' },
        { en: 'It is essential that every member be informed.', id: 'Setiap anggota wajib diberi tahu.', note: 'Bukan "is informed".' },
        { en: 'We recommend that she not sign the contract.', id: 'Kami menyarankan agar dia tidak menandatangani kontrak itu.' },
      ],
    },
    {
      heading: 'Were untuk yang tidak nyata',
      body: 'Untuk pengandaian yang berlawanan dengan kenyataan sekarang, bahasa baku memakai "were" untuk semua subjek: If I were, if she were, I wish it were.',
    },
    {
      heading: 'Pengandaian tanpa if',
      body: 'Dalam register formal, "if" dapat dihilangkan dengan membalik subjek dan kata bantu.',
      table: [
        ['Dengan if', 'Inversi formal'],
        ['If I were in your position, ...', 'Were I in your position, ...'],
        ['If she had known, ...', 'Had she known, ...'],
        ['If you should need help, ...', 'Should you need help, ...'],
      ],
    },
  ],
  demo: [
    ['They demanded that the report be published.', 'They demanded that the report is published.', 'Setelah "demand that", pakai bentuk dasar: be.'],
    ['If I were you, I would apologise.', 'If I am you, I would apologise.', 'Pengandaian tidak nyata memakai "were".'],
    ['Had we left earlier, we would have caught the train.', 'Had we left earlier, we would catch the train.', 'Pengandaian lampau: had + bentuk ketiga, would have + bentuk ketiga.'],
  ],
  guided: [
    mc(5, 'Pilih bentuk yang tepat untuk register formal.', 'The committee recommends that the proposal ___ revised.', [
      ['be', true],
      ['is', 'Setelah "recommend that", pakai bentuk dasar (subjunctive), bukan "is".', 'subjunctive-base'],
      ['will be', 'Mandative subjunctive tidak memakai "will".', 'subjunctive-base'],
      ['was', 'Bentuk lampau tidak dipakai di sini.', 'subjunctive-base'],
    ], 'recommend + that + subjek + bentuk dasar: be revised.', { focus: 'subjunctive-base', hint: 'Bentuk dasar dari is/are/was adalah ...' }),
    fill(5, 'It is vital that she ___ the deadline. (meet)', ['meet'], 'Bentuk dasar untuk semua subjek, tanpa -s.', { meets: ['Subjunctive tidak mengambil -s, walaupun subjeknya "she".', 'subjunctive-base'] }, { focus: 'subjunctive-base', prompt: 'Tulis bentuk kata kerja yang tepat.', hint: 'Tanpa -s, tanpa perubahan tense.' }),
    arrange(5, 'Seandainya saya berada di posisi Anda, saya akan menerima tawaran itu.', 'Were I in your position I would accept the offer', ['was', 'if'], 'Inversi formal: Were + I + ..., I would ...', { focus: 'subjunctive-were', hint: 'Mulai dengan "Were" tanpa "if".' }),
    tf(5, 'Kalimat "The judge ordered that the witness not be named." sudah benar.', true, 'Negatif subjunctive: not + bentuk dasar ("not be named").', 'Bentuk ini memang terlihat tidak biasa, tetapi benar: tidak perlu "does not" atau "is not".', { focus: 'subjunctive-base', hint: 'Bagaimana bentuk negatif subjunctive?' }),
  ],
  independent: [
    fix(5, 'The doctor insisted that he stops smoking immediately.', ['The doctor insisted that he stop smoking immediately'], 'Setelah "insist that": bentuk dasar, stop.', { 'the doctor insisted that he stopped smoking immediately': ['Subjunctive memakai bentuk dasar, bukan bentuk lampau.', 'subjunctive-base'] }, { focus: 'subjunctive-base' }),
    fill(5, '___ you require further information, please contact our office.', ['Should'], '"Should you require ..." = "If you should require ...", bentuk sopan dan formal.', { if: ['Benar secara tata bahasa, tetapi soal meminta bentuk inversi formal: Should.'], would: ['Inversi pengandaian memakai should, were, atau had.', 'subjunctive-were'] }, { focus: 'subjunctive-were', prompt: 'Lengkapi dengan satu kata untuk membuat pengandaian formal tanpa "if".' }),
    tr(5, 'Seandainya dia (perempuan) tahu, dia pasti sudah memberi tahu kami. (mulai dengan "Had")', ['Had she known she would have told us', 'Had she known she would have informed us', 'Had she known about it she would have told us'], 'Had + subjek + bentuk ketiga, subjek + would have + bentuk ketiga.', { 'had she known she would tell us': ['Akibat di masa lampau memakai would have + bentuk ketiga.', 'subjunctive-were'] }, { focus: 'subjunctive-were' }),
    spot(5, 'If the chairman was present today, the motion would certainly pass.', 'was', 'were', 'Ketua sebenarnya tidak hadir. Pengandaian tidak nyata dalam bahasa baku memakai "were".', { focus: 'subjunctive-were' }),
  ],
  homework: [
    construct(5, 'that / essential / it is / be / all data / encrypted', ['It is essential that all data be encrypted'], 'It is essential that + subjek + be + bentuk ketiga.', undefined, { focus: 'subjunctive-base' }),
    fix(5, 'If I was the minister, I would reform the curriculum.', ['If I were the minister I would reform the curriculum', 'Were I the minister I would reform the curriculum'], 'Pengandaian tidak nyata dalam bahasa baku: If I were.', undefined, { focus: 'subjunctive-were' }),
    mc(5, 'Kalimat mana yang paling cocok untuk notulen rapat resmi?', null, [
      ['It was proposed that the budget be increased by ten per cent.', true],
      ['Someone said we should make the budget bigger, like ten per cent.', 'Terlalu santai untuk notulen resmi.'],
      ['It was proposed that the budget is increased by ten per cent.', 'Setelah "propose that", pakai subjunctive: be increased.', 'subjunctive-base'],
      ['They want the budget goes up ten per cent.', 'Struktur "want + subjek + kata kerja berkonjugasi" tidak benar.'],
    ], 'Pasif + mandative subjunctive adalah gaya khas notulen resmi.', { focus: 'subjunctive-base' }),
  ],
  mastery: [
    fill(5, 'The regulations require that each applicant ___ two references. (provide)', ['provide'], 'Bentuk dasar tanpa -s.', { provides: ['Subjunctive tidak mengambil -s.', 'subjunctive-base'], provided: ['Subjunctive tidak mengikuti tense kalimat induk.', 'subjunctive-base'] }, { focus: 'subjunctive-base', prompt: 'Tulis bentuk kata kerja yang tepat.' }),
    mc(5, 'Pilih kalimat yang benar.', null, [
      ['Had I been told earlier, I would have made other arrangements.', true],
      ['Had I been told earlier, I would make other arrangements.', 'Akibat lampau memakai would have + bentuk ketiga.', 'subjunctive-were'],
      ['Had I told earlier, I would have made other arrangements.', 'Maknanya pasif ("diberi tahu"): had I been told.'],
      ['If had I been told earlier, I would have made other arrangements.', 'Inversi menggantikan "if". Keduanya tidak dipakai bersamaan.', 'subjunctive-were'],
    ], 'Had + subjek + been + bentuk ketiga, ... would have + bentuk ketiga.', { focus: 'subjunctive-were' }),
    fix(5, 'She suggested that he does not attend the hearing.', ['She suggested that he not attend the hearing'], 'Negatif subjunctive: not + bentuk dasar.', undefined, { focus: 'subjunctive-base' }),
    tr(5, 'Sangat penting agar setiap peserta hadir tepat waktu. (mulai dengan "It is crucial that")', ['It is crucial that every participant be on time', 'It is crucial that each participant be on time', 'It is crucial that every participant arrive on time', 'It is crucial that each participant arrive on time', 'It is crucial that every participant be present on time'], 'It is crucial that + subjek + bentuk dasar.', { 'it is crucial that every participant is on time': ['Pakai bentuk dasar "be", bukan "is".', 'subjunctive-base'], 'it is crucial that every participant arrives on time': ['Subjunctive tidak mengambil -s: arrive.', 'subjunctive-base'] }, { focus: 'subjunctive-base' }),
    fill(5, '___ it not for your support, the project would have failed.', ['Were'], '"Were it not for ..." = "If it were not for ...".', { was: ['Bentuk inversi yang baku adalah "Were".', 'subjunctive-were'], had: ['"Had it not been for ..." memakai "been". Kalimat ini memakai "Were it not for".', 'subjunctive-were'] }, { focus: 'subjunctive-were' }),
  ],
});
