// C2 · Bab 3 (Rilis 5) — inversi lanjutan, konsesi formal, idiom dunia kerja,
// dan pembentukan kata. Premium.
import { construct, fill, fix, lesson, match, mc, read, tf, tr } from './dsl';

export const inversionAdvLesson = lesson({
  id: 'c2-inversion-adv',
  title: 'Inversi Lanjutan: So, Such, Not until',
  summary: 'Penekanan formal dengan So ... that, Such ... that, Not until, dan Only after.',
  topic: 'c2.inversion-adv',
  objectives: [
    'Memakai So + kata sifat/keterangan + kata kerja bantu + subjek + that.',
    'Memakai Such + be + kata benda + that.',
    'Membalik subjek di klausa utama setelah Not until, Only after, dan Only when.',
  ],
  intro: 'Di C1 kamu belajar inversi setelah Never, Rarely, dan Not only. Di C2, inversi dipakai untuk efek dramatis dalam tulisan formal dan sastra: "So difficult was the exam that half the class failed." Kuncinya ada pada letak inversi: setelah "Not until ...", yang dibalik adalah klausa utama, bukan klausa waktunya.',
  teaching: [
    {
      heading: 'So ... that',
      body: 'So + kata sifat + be + subjek + that ..., atau So + kata keterangan + do/does/did + subjek + bentuk dasar + that ...',
      examples: [
        { en: 'So difficult was the exam that half the class failed.', id: 'Begitu sulitnya ujian itu sehingga setengah kelas gagal.' },
        { en: 'So quickly did she speak that nobody understood.', id: 'Begitu cepatnya ia bicara sehingga tidak ada yang mengerti.' },
      ],
    },
    {
      heading: 'Such ... that',
      body: 'Such + be + kata benda (atau frasa kata benda) + that ... Bentuk be mengikuti kata bendanya.',
      examples: [
        { en: 'Such was the demand that the tickets sold out in an hour.', id: 'Begitu besarnya permintaan sehingga tiket habis dalam satu jam.' },
        { en: 'Such were the risks that the project was cancelled.', id: 'Begitu besarnya risiko itu sehingga proyeknya dibatalkan.' },
      ],
    },
    {
      heading: 'Not until, Only after, Only when',
      body: 'Klausa waktu tetap berurutan biasa; inversinya ada di klausa utama: Not until I got home did I realise ...',
      table: [
        ['Benar', 'Salah'],
        ['Not until I got home did I realise.', 'Not until did I get home I realised.'],
        ['Only after the meeting did we hear the news.', 'Only after the meeting we heard the news.'],
        ['Only when the rain stopped did we go out.', 'Only when did the rain stop we went out.'],
      ],
    },
  ],
  demo: [
    ['So difficult was the exam that half the class failed.', 'So difficult the exam was that half the class failed.', 'Setelah "So + kata sifat" di awal, kata kerja mendahului subjek.'],
    ['Not until I got home did I realise I had lost my wallet.', 'Not until did I get home I realised I had lost my wallet.', 'Inversi ada di klausa utama, bukan di klausa "Not until".'],
    ['Such was the demand that the tickets sold out in an hour.', 'Such the demand was that the tickets sold out in an hour.', 'Pola: Such + be + kata benda + that.'],
  ],
  vocab: ['scarcely', 'unprecedented'],
  guided: [
    mc(4, 'Pilih bentuk yang tepat.', '___ the storm that all flights were cancelled.', [
      ['Such was', true],
      ['So was', '"So" diikuti kata sifat. Dengan kata benda (the storm), pakai Such was.', 'so-such-inversion'],
      ['Such the storm was', 'Pola: Such + be + kata benda.', 'so-such-inversion'],
    ], 'Such + be + kata benda + that.', { focus: 'so-such-inversion' }),
    mc(4, 'Pilih bentuk yang tepat.', 'Not until the results were published ___ how well she had done.', [
      ['did she realise', true],
      ['she realised', 'Setelah "Not until ..." di awal, klausa utama dibalik: did she realise.', 'not-until-inversion'],
      ['did she realised', 'Setelah did, bentuk dasar: realise.', 'not-until-inversion'],
    ], 'Not until + klausa, lalu did + subjek + bentuk dasar.', { focus: 'not-until-inversion' }),
    fill(4, 'So loud ___ the music that the neighbours complained. (be)', ['was'], 'So + kata sifat + was + subjek.', {
      were: ['"the music" tunggal: was.', 'so-such-inversion'],
      is: ['Kejadiannya lampau (complained): was.'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'so-such-inversion' }),
    tf(4, '"Only after he left did I notice his bag" benar secara tata bahasa.', true, 'Klausa "Only after he left" tetap biasa; klausa utamanya dibalik: did I notice.', 'Kalimat ini benar.', { focus: 'not-until-inversion', tag: 'not-until-inversion' }),
  ],
  independent: [
    construct(4, 'so / quickly / did / she / speak / that / nobody / understood', ['So quickly did she speak that nobody understood'], 'So + kata keterangan + did + subjek + bentuk dasar.', {
      'so quickly she spoke that nobody understood': ['Setelah "So quickly" di awal, inversi: did she speak.', 'so-such-inversion'],
    }, { focus: 'so-such-inversion' }),
    fix(4, 'Not until the end of the film I understood the title.', ['Not until the end of the film did I understand the title', 'I did not understand the title until the end of the film'], 'Inversi di klausa utama: did I understand.', undefined, { focus: 'not-until-inversion' }),
    tr(4, 'Baru setelah membaca surat itu dia mengerti. (mulai dengan "Only after")', ['Only after reading the letter did he understand', 'Only after reading the letter did she understand', 'Only after he read the letter did he understand', 'Only after she read the letter did she understand', 'Only after he had read the letter did he understand', 'Only after she had read the letter did she understand'], 'Only after + klausa/-ing, lalu did + subjek + bentuk dasar.', {
      'only after reading the letter he understood': ['Setelah "Only after ..." di awal, inversi: did he understand.', 'not-until-inversion'],
      'only after reading the letter she understood': ['Setelah "Only after ..." di awal, inversi: did she understand.', 'not-until-inversion'],
    }, { focus: 'not-until-inversion' }),
    mc(4, 'Pilih kalimat yang benar.', null, [
      ['Such were the delays that we missed our connection.', true],
      ['So were the delays that we missed our connection.', 'Dengan kata benda (the delays) pakai Such.', 'so-such-inversion'],
      ['Such the delays were that we missed our connection.', 'Pola: Such + were + kata benda.', 'so-such-inversion'],
    ], 'Such + be + kata benda + that.', { focus: 'so-such-inversion' }),
  ],
  homework: [
    read(4, 'Not until the 1990s did scientists fully understand how much plastic was entering the oceans. Such was the scale of the problem that some beaches were covered in waste. Only after several countries banned single-use bags did the situation begin to improve, and so slowly did it change at first that many people doubted the bans would work.', 'When did the situation begin to improve?', [
      ['After several countries banned single-use bags', true],
      ['In the 1990s', 'Pada 1990-an ilmuwan baru memahami masalahnya.'],
      ['When beaches were covered in waste', 'Itu menggambarkan besarnya masalah, bukan perbaikannya.'],
    ], '"Only after several countries banned single-use bags did the situation begin to improve".'),
    fill(4, 'Such ___ his anger that he could not speak. (be)', ['was'], 'Such + was + kata benda tunggal.', {
      were: ['"his anger" tunggal: was.', 'so-such-inversion'],
      is: ['Kejadiannya lampau (could not speak): was.'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'so-such-inversion' }),
    construct(4, 'not until / the following morning / did / we / hear / the news', ['Not until the following morning did we hear the news'], 'Not until + waktu, lalu did + subjek + bentuk dasar.', {
      'not until the following morning we heard the news': ['Inversi: did we hear.', 'not-until-inversion'],
    }, { focus: 'not-until-inversion' }),
  ],
  mastery: [
    mc(4, 'Pilih bentuk yang tepat.', 'Only when the rain stopped ___ out.', [
      ['did we go', true],
      ['we went', 'Setelah "Only when ..." di awal, inversi: did we go.', 'not-until-inversion'],
      ['did we went', 'Setelah did, bentuk dasar: go.', 'not-until-inversion'],
    ], 'Only when + klausa, lalu did + subjek + bentuk dasar.', { focus: 'not-until-inversion' }),
    mc(4, 'Pilih awal kalimat yang tepat.', '___ that we decided to stay another week.', [
      ['So beautiful was the island', true],
      ['So beautiful the island was', 'Inversi: So beautiful was the island.', 'so-such-inversion'],
      ['Such beautiful was the island', '"beautiful" kata sifat, jadi pakai So.', 'so-such-inversion'],
    ], 'So + kata sifat + be + subjek + that.', { focus: 'so-such-inversion' }),
    fill(4, 'Not until the lights went out ___ the danger. (we / notice)', ['did we notice'], 'Inversi di klausa utama: did we notice.', {
      'we noticed': ['Setelah Not until ..., inversi: did we notice.', 'not-until-inversion'],
      'did we noticed': ['Setelah did, bentuk dasar: notice.', 'not-until-inversion'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'not-until-inversion' }),
    tr(4, 'Begitu tinggi ombaknya sehingga kapal tidak bisa berlayar. (mulai dengan "So")', ['So high were the waves that the boat could not sail', 'So high were the waves that the ship could not sail', 'So big were the waves that the boat could not sail', 'So big were the waves that the ship could not sail', 'So high were the waves that the boats could not sail', 'So large were the waves that the boat could not sail', 'So large were the waves that the ship could not sail'], 'So + kata sifat + were + the waves + that.', {
      'so high the waves were that the boat could not sail': ['Inversi: So high were the waves.', 'so-such-inversion'],
      'so high was the waves that the boat could not sail': ['"the waves" jamak: were.', 'so-such-inversion'],
    }, { focus: 'so-such-inversion' }),
    construct(4, 'such / was / the demand / that / the tickets / sold out / in an hour', ['Such was the demand that the tickets sold out in an hour'], 'Such + was + kata benda + that.', {
      'such the demand was that the tickets sold out in an hour': ['Pola: Such was the demand.', 'so-such-inversion'],
    }, { focus: 'so-such-inversion' }),
  ],
});

export const concessionLesson = lesson({
  id: 'c2-concession',
  title: 'Konsesi Formal: albeit, much as, however',
  summary: 'Mengakui sisi lain secara formal dengan albeit, notwithstanding, much as, dan pola kata sifat + as.',
  topic: 'c2.concession',
  objectives: [
    'Memakai albeit dengan kata sifat, kata keterangan, atau frasa, bukan klausa lengkap.',
    'Memakai pola konsesi: Tired as she was, Much as I admire him.',
    'Memakai However + kata sifat/keterangan + subjek + kata kerja, dan notwithstanding + kata benda.',
  ],
  intro: '"Although" dan "despite" sudah kamu kuasai. Tulisan C2 memakai alat yang lebih ringkas dan formal: "The plan worked, albeit slowly", "Much as I admire him, I disagree", "However hard he tries, ...". Masing-masing punya pola tetap, dan kesalahan paling umum adalah menaruh klausa lengkap setelah albeit.',
  teaching: [
    {
      heading: 'albeit dan notwithstanding',
      body: 'albeit (= although) diikuti kata sifat, kata keterangan, atau frasa, bukan subjek + kata kerja. notwithstanding (= despite) diikuti kata benda dan sangat formal.',
      examples: [
        { en: 'The plan worked, albeit slowly.', id: 'Rencana itu berhasil, walaupun lambat.' },
        { en: 'Notwithstanding the delay, the bridge was completed on budget.', id: 'Meskipun terlambat, jembatan itu selesai sesuai anggaran.' },
      ],
    },
    {
      heading: 'Kata sifat + as + subjek + kata kerja',
      body: 'Pola formal untuk "walaupun ...": kata sifat/keterangan di depan, lalu as (atau though) + subjek + kata kerja. "Much as" + klausa berarti "walaupun saya sangat ...".',
      examples: [
        { en: 'Tired as she was, she kept working.', id: 'Walaupun lelah, dia tetap bekerja.' },
        { en: 'Much as I admire him, I cannot agree.', id: 'Walaupun saya sangat mengaguminya, saya tidak bisa setuju.' },
      ],
    },
    {
      heading: 'However + kata sifat/keterangan',
      body: 'However di sini berarti "seberapa pun". Kata sifat atau keterangan langsung mengikutinya, baru subjek dan kata kerja.',
      table: [
        ['Benar', 'Salah'],
        ['However hard he tries, he cannot win.', 'However he tries hard, he cannot win.'],
        ['The results were positive, albeit limited.', 'The results were positive, albeit they were limited.'],
        ['Tired as she was, she kept working.', 'Tired as was she, she kept working.'],
      ],
    },
  ],
  demo: [
    ['The plan worked, albeit slowly.', 'The plan worked, albeit it was slow.', 'albeit diikuti kata sifat/keterangan/frasa, bukan klausa lengkap.'],
    ['Tired as she was, she kept working.', 'Tired as was she, she kept working.', 'Urutannya: kata sifat + as + subjek + kata kerja.'],
    ['However hard he tries, he cannot win.', 'However he tries hard, he cannot win.', 'However + kata sifat/keterangan langsung, lalu subjek + kata kerja.'],
  ],
  vocab: ['albeit', 'notwithstanding'],
  guided: [
    mc(4, 'Pilih kata yang tepat.', 'The event was a success, ___ a small one.', [
      ['albeit', true],
      ['despite', '"despite" berarti meskipun ada hambatan, tidak cocok untuk menambahkan batasan "a small one".', 'albeit-pattern'],
      ['however', '"however" tidak dipakai seperti ini di tengah kalimat.', 'albeit-pattern'],
    ], 'albeit + frasa: albeit a small one.', { focus: 'albeit-pattern' }),
    mc(4, 'Pilih awal kalimat yang tepat.', '___ I respect your opinion, I cannot agree.', [
      ['Much as', true],
      ['Despite', '"Despite" diikuti kata benda atau -ing, bukan klausa.', 'concession-clause'],
      ['However', '"However" di awal seperti ini perlu kata sifat/keterangan: However much I respect ...', 'concession-clause'],
    ], 'Much as + klausa = walaupun saya sangat ...', { focus: 'concession-clause' }),
    fill(4, 'Strange ___ it may seem, the experiment worked. (as)', ['as', 'though'], 'Pola: kata sifat + as + subjek + kata kerja.', {
      like: ['Pola konsesi memakai as atau though: Strange as it may seem.', 'concession-clause'],
    }, { prompt: 'Lengkapi dengan kata yang tepat.', focus: 'concession-clause' }),
    tf(4, '"albeit" bisa diikuti klausa lengkap seperti "albeit it was expensive".', false, 'albeit diikuti kata sifat, keterangan, atau frasa: albeit expensive.', 'albeit tidak diikuti subjek + kata kerja.', { focus: 'albeit-pattern', tag: 'albeit-pattern' }),
  ],
  independent: [
    construct(4, 'however / hard / he / tries / he / cannot / win', ['However hard he tries he cannot win'], 'However + kata keterangan + subjek + kata kerja.', {
      'however he tries hard he cannot win': ['However + kata keterangan langsung: However hard he tries.', 'concession-clause'],
    }, { focus: 'concession-clause' }),
    fix(4, 'The results were positive, albeit they were limited.', ['The results were positive, albeit limited', 'The results were positive, although they were limited', 'The results were positive, though they were limited'], 'albeit + kata sifat (limited), atau although + klausa.', undefined, { focus: 'albeit-pattern' }),
    tr(4, 'Walaupun lelah, dia tetap bekerja. (mulai dengan "Tired")', ['Tired as she was, she kept working', 'Tired as he was, he kept working', 'Tired as she was, she continued working', 'Tired as he was, he continued working', 'Tired as she was, she continued to work', 'Tired as he was, he continued to work', 'Tired though she was, she kept working', 'Tired though he was, he kept working', 'Tired as she was, she kept on working', 'Tired as he was, he kept on working'], 'Kata sifat + as + subjek + kata kerja.', {
      'tired as was she she kept working': ['Urutan: Tired as she was.', 'concession-clause'],
      'tired she was she kept working': ['Perlu "as": Tired as she was.', 'concession-clause'],
    }, { focus: 'concession-clause' }),
    mc(4, 'Pilih kalimat yang benar.', null, [
      ['Notwithstanding the delay, the bridge was completed on budget.', true],
      ['Notwithstanding the bridge was delayed, it was completed on budget.', 'notwithstanding diikuti kata benda, bukan klausa.', 'concession-clause'],
      ['Albeit the delay, the bridge was completed on budget.', 'albeit tidak membuka kalimat dengan kata benda seperti despite.', 'albeit-pattern'],
    ], 'notwithstanding + kata benda.', { focus: 'concession-clause' }),
  ],
  homework: [
    read(4, 'The new metro line opened last month, albeit two years later than planned. Expensive as it was, the project has already reduced traffic in the city centre by a third. Much as residents welcome the change, many complain that tickets are too costly. However high the fares may seem, the operator insists they are among the lowest in the region.', 'What does "albeit two years later than planned" tell us?', [
      ['The line opened, but late.', true],
      ['The line will open in two years.', 'Jalurnya sudah dibuka bulan lalu.'],
      ['The line opened earlier than planned.', '"later than planned" berarti terlambat.'],
    ], 'albeit + frasa menambahkan batasan: dibuka, walaupun dua tahun terlambat.'),
    fill(4, 'He agreed to help, ___ reluctantly. (pilih: albeit / despite)', ['albeit'], 'albeit + kata keterangan.', {
      despite: ['despite diikuti kata benda atau -ing, bukan kata keterangan.', 'albeit-pattern'],
    }, { prompt: 'Lengkapi dengan pilihan yang tepat dari kurung.', focus: 'albeit-pattern' }),
    construct(4, 'much as / I / love / my job / I / need / a break', ['Much as I love my job I need a break'], 'Much as + klausa, lalu klausa utama.', {
      'much i love my job i need a break': ['Pakai "Much as": Much as I love my job, ...', 'concession-clause'],
    }, { focus: 'concession-clause' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang benar.', null, [
      ['The hotel was comfortable, albeit rather expensive.', true],
      ['The hotel was comfortable, albeit it was rather expensive.', 'albeit tidak diikuti klausa lengkap.', 'albeit-pattern'],
      ['The hotel was comfortable, albeit of rather expensive.', 'Tidak perlu "of": albeit rather expensive.', 'albeit-pattern'],
    ], 'albeit + kata sifat.', { focus: 'albeit-pattern' }),
    mc(4, 'Pilih bentuk yang tepat.', '___, the bus will not wait.', [
      ['However late you are', true],
      ['However you are late', 'However + kata sifat langsung: However late you are.', 'concession-clause'],
      ['However late are you', 'Setelah However + kata sifat, urutannya biasa: you are.', 'concession-clause'],
    ], 'However + kata sifat + subjek + kata kerja.', { focus: 'concession-clause' }),
    fill(4, 'Much ___ I would like to help, I have no time this week.', ['as'], 'Pola konsesi: Much as + klausa.', {
      like: ['Pola konsesi: Much as.', 'concession-clause'],
      though: ['Pola baku untuk "Much ..." adalah Much as.', 'concession-clause'],
    }, { prompt: 'Lengkapi dengan kata yang tepat.', focus: 'concession-clause' }),
    tr(4, 'Rencana itu berhasil, walaupun lambat. (pakai albeit)', ['The plan worked, albeit slowly', 'The plan succeeded, albeit slowly'], 'albeit + kata keterangan.', {
      'the plan worked albeit it was slow': ['albeit + kata keterangan: albeit slowly.', 'albeit-pattern'],
      'the plan worked albeit slow': ['Yang dijelaskan cara berhasilnya, jadi kata keterangan: slowly.', 'albeit-pattern'],
    }, { focus: 'albeit-pattern' }),
    construct(4, 'however / tired / you / are / finish / the report / today', ['However tired you are finish the report today'], 'However + kata sifat + subjek + kata kerja, lalu perintah.', {
      'however you are tired finish the report today': ['However + kata sifat langsung: However tired you are.', 'concession-clause'],
    }, { focus: 'concession-clause' }),
  ],
});

export const workIdiomsLesson = lesson({
  id: 'c2-work-idioms',
  title: 'Idiom di Dunia Kerja',
  summary: 'Idiom yang sering terdengar di rapat dan email kantor, bentuknya yang tetap, dan kapan tidak memakainya.',
  topic: 'c2.work-idioms',
  objectives: [
    'Memahami idiom kerja yang umum: on the same page, back to square one, cut corners, a tall order.',
    'Memakai idiom dengan bentuk yang tepat (kata depan dan kata yang tidak boleh diganti).',
    'Memilih register: idiom wajar dalam rapat dan email antarrekan, bukan dalam laporan resmi.',
  ],
  intro: 'Idiom membuat bahasa terdengar alami, tetapi bentuknya tidak boleh diubah sedikit pun: "on the same page", bukan "in the same page"; "back to square one", bukan "back to the start square". Idiom juga punya register: wajar dalam rapat dan email antarrekan, tetapi terlalu santai untuk laporan tahunan.',
  teaching: [
    {
      heading: 'Memulai dan menyelaraskan',
      body: 'get the ball rolling = memulai. touch base = menghubungi sebentar untuk saling memberi kabar. be on the same page = sepaham.',
      examples: [
        { en: "Let's get the ball rolling with a quick introduction.", id: 'Mari kita mulai dengan perkenalan singkat.' },
        { en: "I'll touch base with you after lunch.", id: 'Saya akan menghubungimu sebentar setelah makan siang.' },
      ],
    },
    {
      heading: 'Usaha dan jalan pintas',
      body: 'go the extra mile = berusaha lebih dari yang diminta. hit the ground running = langsung produktif sejak awal. cut corners = mengambil jalan pintas dengan mengorbankan mutu.',
      examples: [
        { en: 'She always goes the extra mile for her clients.', id: 'Dia selalu berusaha lebih untuk kliennya.' },
        { en: 'We cannot afford to cut corners on safety.', id: 'Kita tidak boleh mengambil jalan pintas soal keselamatan.' },
      ],
    },
    {
      heading: 'Masalah dan hasil',
      body: 'back to square one = kembali ke awal. a tall order = permintaan yang sangat sulit. the bottom line = hal terpenting (atau laba akhir).',
      table: [
        ['Idiom', 'Arti', 'Bentuk yang salah'],
        ['back to square one', 'kembali ke awal', 'back to square zero'],
        ['a tall order', 'permintaan yang sulit', 'a high order'],
        ['on the same page', 'sepaham', 'in the same page'],
      ],
    },
  ],
  demo: [
    ["Let's make sure we're all on the same page.", "Let's make sure we're all in the same page.", 'Bentuk tetap: on the same page.'],
    ['The client rejected the design, so we are back to square one.', 'The client rejected the design, so we are back to square zero.', 'Bentuk tetap: back to square one.'],
    ['We cannot afford to cut corners on safety.', 'We cannot afford to cut angles on safety.', 'Idiomnya cut corners.'],
  ],
  vocab: ['stakeholder', 'workload'],
  guided: [
    mc(4, 'Apa arti "a tall order" dalam kalimat ini?', 'Finishing the app in two weeks is a tall order.', [
      ['Permintaan yang sangat sulit', true],
      ['Pesanan dalam jumlah besar', 'Itu makna harfiah. Idiom ini berarti permintaan yang sulit dipenuhi.', 'idiom-meaning'],
      ['Perintah dari atasan', '"order" di sini bagian dari idiom, bukan perintah.', 'idiom-meaning'],
    ], 'a tall order = permintaan yang sangat sulit.', { focus: 'idiom-meaning' }),
    match(4, 'Pasangkan idiom dengan artinya.', [
      ['get the ball rolling', 'memulai'],
      ['go the extra mile', 'berusaha lebih dari yang diminta'],
      ['cut corners', 'mengambil jalan pintas yang mengorbankan mutu'],
      ['back to square one', 'kembali ke awal'],
    ], 'Hafalkan idiom beserta maknanya, bukan kata per kata.', { focus: 'idiom-meaning' }),
    fill(4, "Let's ___ the ball rolling with a quick introduction. (get / make)", ['get'], 'Bentuk tetap: get the ball rolling.', {
      make: ['Idiomnya get the ball rolling.', 'idiom-form'],
    }, { prompt: 'Pilih kata yang tepat dari kurung.', focus: 'idiom-form' }),
    tf(4, '"to cut corners" berarti menghemat waktu atau biaya dengan mengorbankan mutu.', true, 'cut corners selalu bermakna negatif: jalan pintas yang mengurangi mutu atau keamanan.', 'Kalimat ini benar.', { focus: 'idiom-meaning', tag: 'idiom-meaning' }),
  ],
  independent: [
    mc(4, 'Pilih idiom yang paling tepat.', 'The new manager learned quickly and ___ from her first day.', [
      ['hit the ground running', true],
      ['went back to square one', 'Itu berarti kembali ke awal, tidak cocok dengan "learned quickly".', 'idiom-meaning'],
      ['cut corners', 'Itu bermakna negatif (jalan pintas yang mengorbankan mutu).', 'idiom-meaning'],
    ], 'hit the ground running = langsung produktif sejak awal.', { focus: 'idiom-meaning' }),
    fix(4, 'We need to be on the same line before the meeting.', ['We need to be on the same page before the meeting'], 'Bentuk tetap: on the same page.', undefined, { focus: 'idiom-form' }),
    construct(4, 'she / always / goes / the extra mile / for / her clients', ['She always goes the extra mile for her clients'], 'Bentuk tetap: go the extra mile.', {
      'she always goes the extra miles for her clients': ['Bentuk tetap: the extra mile (tunggal).', 'idiom-form'],
    }, { focus: 'idiom-form' }),
    tr(4, 'Kita harus berpikir kreatif untuk masalah ini. (pakai idiom "think outside the box")', ['We need to think outside the box for this problem', 'We have to think outside the box for this problem', 'We must think outside the box for this problem', 'We need to think outside the box on this problem', 'We have to think outside the box on this problem', 'We need to think outside the box to solve this problem', 'We have to think outside the box to solve this problem', 'We must think outside the box to solve this problem'], 'think outside the box = berpikir kreatif.', {
      'we need to think outside the boxes for this problem': ['Bentuk tetap: the box (tunggal).', 'idiom-form'],
    }, { focus: 'idiom-form' }),
  ],
  homework: [
    read(4, "Hi team, quick update. The client wasn't happy with our first proposal, so we're back to square one. I know a new draft by Friday is a tall order, but let's not cut corners: the bottom line is that this contract matters more than any other this year. I'll touch base with each of you tomorrow so we're all on the same page. Thanks for going the extra mile! Rina", 'What is Rina worried that the team might do?', [
      ['Do the work quickly but badly', true],
      ['Refuse to write a new proposal', 'Tim tidak menolak; Rina hanya mengakui tenggatnya sulit.'],
      ['Contact the client without her', 'Rina sendiri yang akan menghubungi setiap anggota tim.'],
    ], '"let\'s not cut corners" = jangan mengambil jalan pintas yang mengorbankan mutu.'),
    mc(4, 'Server rusak, semua data hilang, dan tim harus mulai dari nol. Idiom yang tepat:', null, [
      ['We were back to square one.', true],
      ['We were on the same page.', 'Itu berarti sepaham.', 'idiom-meaning'],
      ['We went the extra mile.', 'Itu berarti berusaha lebih.', 'idiom-meaning'],
    ], 'back to square one = kembali ke awal.', { focus: 'idiom-meaning' }),
    fill(4, "I'll touch ___ with you after lunch.", ['base'], 'Bentuk tetap: touch base.', {
      basis: ['Bentuk tetap: touch base.', 'idiom-form'],
      bases: ['Bentuk tetap: touch base (tunggal).', 'idiom-form'],
    }, { prompt: 'Lengkapi idiom berikut.', focus: 'idiom-form' }),
  ],
  mastery: [
    mc(4, '"The bottom line is that we need more customers." Artinya:', null, [
      ['Inti persoalannya, kita butuh lebih banyak pelanggan.', true],
      ['Baris terakhir laporan menyebut kita butuh pelanggan.', 'Itu makna harfiah. Idiom ini berarti hal terpenting.', 'idiom-meaning'],
      ['Kita berada di peringkat terbawah dalam hal pelanggan.', 'Tidak ada makna peringkat di sini.', 'idiom-meaning'],
    ], 'the bottom line = hal terpenting.', { focus: 'idiom-meaning' }),
    mc(4, 'Kalimat mana yang terlalu santai untuk laporan tahunan resmi?', null, [
      ['The sales team hit the ground running and smashed it.', true],
      ['Sales increased by 12 per cent in the second quarter.', 'Kalimat ini sudah formal dan cocok untuk laporan.', 'idiom-meaning'],
      ['The new team became productive within its first month.', 'Kalimat ini sudah formal; begini cara menyampaikan makna "hit the ground running" di laporan.', 'idiom-meaning'],
    ], 'Idiom dan slang ("smashed it") wajar di rapat, tetapi terlalu santai untuk laporan resmi.', { focus: 'idiom-meaning' }),
    fill(4, "We're all ___ the same page now, so let's start.", ['on'], 'Bentuk tetap: on the same page.', {
      in: ['Bentuk tetap: on the same page.', 'idiom-form'],
      at: ['Bentuk tetap: on the same page.', 'idiom-form'],
    }, { prompt: 'Lengkapi dengan kata depan yang tepat.', focus: 'idiom-form' }),
    construct(4, 'finishing / the report / by Monday / is / a tall order', ['Finishing the report by Monday is a tall order'], 'a tall order = permintaan yang sulit.', {
      'finishing the report by monday is a high order': ['Idiomnya a tall order.', 'idiom-form'],
    }, { focus: 'idiom-form' }),
    tr(4, 'Kita harus langsung produktif begitu proyek dimulai. (pakai idiom "hit the ground running")', ['We have to hit the ground running when the project starts', 'We need to hit the ground running when the project starts', 'We must hit the ground running when the project starts', 'We have to hit the ground running as soon as the project starts', 'We need to hit the ground running as soon as the project starts', 'We must hit the ground running as soon as the project starts', 'We have to hit the ground running once the project starts', 'We need to hit the ground running once the project starts'], 'hit the ground running = langsung produktif sejak awal.', {
      'we have to hit the floor running when the project starts': ['Bentuk tetap: hit the ground running.', 'idiom-form'],
    }, { focus: 'idiom-form' }),
  ],
});

export const wordFormationLesson = lesson({
  id: 'c2-word-formation',
  title: 'Pembentukan Kata: Prefiks dan Sufiks',
  summary: 'Memakai prefiks (under-, over-, mis-, counter-, out-) dan sufiks untuk mengubah makna dan kelas kata.',
  topic: 'c2.word-formation',
  objectives: [
    'Memahami makna prefiks under-, over-, mis-, counter-, dan out-.',
    'Mengenali kelas kata dari sufiksnya (-ity, -ment, -tion; -ive, -able; -ise, -ify).',
    'Memilih bentuk kata yang tepat sesuai posisinya dalam kalimat.',
  ],
  intro: 'Penutur C2 bisa menebak dan membentuk kata yang belum pernah mereka lihat: "counterproductive", "outnumber", "minimise". Prefiks mengubah makna, sufiks mengubah kelas kata. Bahasa Indonesia juga punya imbuhan (me-, -kan, ke-an), jadi cara berpikirnya sudah kamu kenal; yang perlu dihafal adalah imbuhan bahasa Inggrisnya.',
  teaching: [
    {
      heading: 'Prefiks: mengubah makna',
      body: 'under- = terlalu sedikit/rendah, over- = berlebihan, mis- = salah, counter- = melawan/sebaliknya, out- = melebihi.',
      table: [
        ['Prefiks', 'Makna', 'Contoh'],
        ['under-', 'terlalu rendah', 'underestimate, underpaid'],
        ['over-', 'berlebihan', 'overestimate, overcrowded, overrated'],
        ['mis-', 'salah', 'misunderstand, misinterpret'],
        ['counter-', 'melawan', 'counterproductive, counterargument'],
        ['out-', 'melebihi', 'outnumber, outperform'],
      ],
    },
    {
      heading: 'Sufiks: mengubah kelas kata',
      body: 'Kata benda: -ity, -ment, -ness, -tion. Kata sifat: -ive, -able, -ous, -al. Kata kerja: -ise/-ize, -ify, -en.',
      examples: [
        { en: 'The availability of clean water is still a problem.', id: 'Ketersediaan air bersih masih menjadi masalah.' },
        { en: 'We need to simplify the process.', id: 'Kita perlu menyederhanakan prosesnya.' },
      ],
    },
    {
      heading: 'Posisi menentukan bentuk',
      body: 'Setelah the/a atau sebelum of: kata benda. Sebelum kata benda atau setelah be/very/highly: kata sifat. Setelah to atau modal (can, need to): kata kerja.',
      examples: [
        { en: 'Her ideas were highly creative.', id: 'Ide-idenya sangat kreatif.' },
        { en: 'The implementation took six months.', id: 'Penerapannya memakan waktu enam bulan.' },
      ],
    },
  ],
  demo: [
    ['The plan proved counterproductive.', 'The plan proved antiproductive.', 'Prefiks untuk "berdampak sebaliknya" adalah counter-.'],
    ['I misunderstood the instructions.', 'I disunderstood the instructions.', 'Prefiks untuk "salah paham" adalah mis-.'],
    ['The company needs to modernise its systems.', 'The company needs to modernity its systems.', 'Setelah "to", perlu kata kerja (modernise), bukan kata benda (modernity).'],
  ],
  vocab: ['counterproductive', 'underestimate'],
  guided: [
    mc(4, 'Biayanya jauh lebih tinggi dari perkiraan kami. Pilih kata yang tepat.', 'We ___ the cost.', [
      ['underestimated', true],
      ['overestimated', 'Itu berarti memperkirakan terlalu tinggi, kebalikan dari maksud kalimat.', 'prefix-meaning'],
      ['misestimated', 'Bukan bentuk yang lazim; untuk "terlalu rendah" pakai under-.', 'prefix-meaning'],
    ], 'under- = terlalu rendah.', { focus: 'prefix-meaning' }),
    mc(4, 'Pilih bentuk kata yang tepat.', 'The ___ of the new system took six months.', [
      ['implementation', true],
      ['implement', 'Setelah "The", perlu kata benda: implementation.', 'suffix-class'],
      ['implementive', 'Bukan kata bahasa Inggris; yang diperlukan kata benda.', 'suffix-class'],
    ], 'Setelah the dan sebelum of: kata benda (-tion).', { focus: 'suffix-class' }),
    match(4, 'Pasangkan prefiks dengan maknanya.', [
      ['under-', 'terlalu rendah'],
      ['over-', 'berlebihan'],
      ['mis-', 'salah'],
      ['out-', 'melebihi'],
    ], 'Prefiks mengubah makna kata dasarnya.', { focus: 'prefix-meaning' }),
    fill(4, 'Our team was ___ by the other side, ten players to fifteen. (number)', ['outnumbered'], 'Kalah jumlah: outnumbered.', {
      overnumbered: ['Prefiks untuk "melebihi jumlah" adalah out-: outnumbered.', 'prefix-meaning'],
      numbered: ['Perlu prefiks out-: outnumbered.', 'prefix-meaning'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'prefix-meaning' }),
  ],
  independent: [
    fill(4, 'Her ideas were highly ___ and original. (create)', ['creative'], 'Setelah highly: kata sifat (-ive).', {
      creation: ['Setelah "highly", perlu kata sifat: creative.', 'suffix-class'],
      creativity: ['Perlu kata sifat: creative.', 'suffix-class'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'suffix-class' }),
    mc(4, 'Pilih kata yang tepat.', "Please don't ___ my words. That isn't what I meant.", [
      ['misinterpret', true],
      ['underinterpret', 'Bukan kata yang lazim; untuk "salah menafsirkan" pakai mis-.', 'prefix-meaning'],
      ['counterinterpret', 'Bukan kata yang lazim; counter- berarti melawan.', 'prefix-meaning'],
    ], 'mis- = salah.', { focus: 'prefix-meaning' }),
    construct(4, 'banning / phones / could / prove / counterproductive', ['Banning phones could prove counterproductive'], 'counterproductive = berdampak sebaliknya.', undefined, { focus: 'prefix-meaning' }),
    tr(4, 'Kita perlu menyederhanakan prosesnya.', ['We need to simplify the process', 'We have to simplify the process', 'We must simplify the process'], 'Kata kerja dengan sufiks -ify: simplify.', {
      'we need to simple the process': ['"simple" kata sifat. Kata kerjanya: simplify.', 'suffix-class'],
      'we need to simplicity the process': ['"simplicity" kata benda. Kata kerjanya: simplify.', 'suffix-class'],
    }, { focus: 'suffix-class' }),
  ],
  homework: [
    read(4, 'The city centre has become seriously overcrowded, and many experts believe that the council underestimated the growth of the population. Some measures, such as closing roads to cars, proved counterproductive because traffic simply moved to smaller streets. A new plan aims to modernise public transport and improve the availability of affordable housing outside the centre.', 'What does "overcrowded" mean here?', [
      ['There are too many people.', true],
      ['There are not enough people.', 'over- berarti berlebihan, bukan kurang.'],
      ['The people are angry.', '"crowded" berkaitan dengan jumlah orang, bukan perasaan.'],
    ], 'over- + crowded = terlalu padat.'),
    fill(4, 'We need to ___ the risk of fire. (minimum)', ['minimise', 'minimize'], 'Setelah "to": kata kerja (-ise).', {
      minimum: ['Setelah "to", perlu kata kerja: minimise.', 'suffix-class'],
      minimal: ['Kata sifat; perlu kata kerja: minimise.', 'suffix-class'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'suffix-class' }),
    mc(4, 'Pilih kata yang tepat.', 'Everyone was talking about the film, but it was disappointing. It was ___.', [
      ['overrated', true],
      ['underrated', 'Itu berarti dinilai terlalu rendah, kebalikan dari maksud kalimat.', 'prefix-meaning'],
      ['misrated', 'Bukan kata yang lazim.', 'prefix-meaning'],
    ], 'over- + rated = dinilai terlalu tinggi.', { focus: 'prefix-meaning' }),
  ],
  mastery: [
    mc(4, 'Pilih bentuk kata yang tepat.', 'The ___ of the bridge is still under discussion.', [
      ['safety', true],
      ['safe', 'Setelah "The" dan sebelum "of": kata benda.', 'suffix-class'],
      ['safely', 'Kata keterangan; yang diperlukan kata benda.', 'suffix-class'],
    ], 'Kata benda: safety.', { focus: 'suffix-class' }),
    mc(4, 'Pilih kata yang tepat.', 'The protesters were ___ by the police, who had three times as many officers.', [
      ['outnumbered', true],
      ['overnumbered', 'Prefiks untuk "kalah jumlah" adalah out-.', 'prefix-meaning'],
      ['undernumbered', 'Bukan kata yang lazim.', 'prefix-meaning'],
    ], 'out- = melebihi.', { focus: 'prefix-meaning' }),
    fill(4, 'I think you ___ the difficulty of the exam. It was much easier than you said. (estimate)', ['overestimated'], 'Kesulitannya dibesar-besarkan: overestimated.', {
      underestimated: ['Ujiannya lebih mudah dari yang dikatakan, jadi kesulitannya diperkirakan terlalu tinggi: overestimated.', 'prefix-meaning'],
      estimated: ['Perlu prefiks over-.', 'prefix-meaning'],
    }, { prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.', focus: 'prefix-meaning' }),
    tr(4, 'Ketersediaan air bersih masih menjadi masalah.', ['The availability of clean water is still a problem', 'The availability of clean water remains a problem', 'The availability of clean water is still an issue', 'The availability of clean water remains an issue'], 'Kata benda dengan sufiks -ity: availability.', {
      'the available of clean water is still a problem': ['Setelah "The", perlu kata benda: availability.', 'suffix-class'],
    }, { focus: 'suffix-class' }),
    construct(4, 'the decision / was / based on / a misunderstanding', ['The decision was based on a misunderstanding'], 'mis- + understanding = kesalahpahaman.', undefined, { focus: 'prefix-meaning' }),
  ],
});
