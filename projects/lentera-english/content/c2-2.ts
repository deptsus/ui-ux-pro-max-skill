// C2 · Bab 1 · Unit 1 — Subjunctive (lanjutan): ellipsis dan substitution
// C2 · Bab 2 · Unit 1 — Nuansa Makna
import { construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const ellipsis = lesson({
  id: 'c2-ellipsis',
  title: 'Ellipsis dan Substitution',
  summary: 'Menghindari pengulangan dengan so, not, kata bantu, one/ones, dan do so.',
  topic: 'c2.ellipsis',
  objectives: [
    'Menjawab dengan so dan not setelah think, hope, expect, dan afraid.',
    'Memakai kata bantu yang tepat untuk menggantikan frasa kerja (so do I, neither can she, but she has).',
    'Mengganti kata benda dengan one/ones dan frasa kerja dengan do so.',
  ],
  intro: 'Penutur mahir jarang mengulang kata. Bahasa Indonesia berkata "Saya rasa iya" dan "Semoga tidak"; terjemahan harfiahnya ("I think yes", "I hope no") langsung terdengar asing. Bahasa Inggris memakai so dan not, kata bantu, serta one/ones untuk menggantikan bagian yang sudah jelas.',
  teaching: [
    {
      heading: 'So dan not',
      table: [
        ['Bahasa Indonesia', 'Bahasa Inggris'],
        ['Saya rasa iya.', 'I think so.'],
        ['Saya rasa tidak.', "I don't think so. / I think not. (formal)"],
        ['Semoga iya.', 'I hope so.'],
        ['Semoga tidak.', 'I hope not.'],
        ['Sayangnya tidak.', "I'm afraid not."],
      ],
      body: 'Pola yang sama dipakai dengan expect, suppose, dan guess.',
    },
    {
      heading: 'Kata bantu menggantikan frasa kerja',
      body: 'Pakai kata bantu yang sama dengan kalimat pertama: can → can, have → have, be → be; kata kerja biasa → do/does/did. "So" untuk menyetujui kalimat positif, "neither/nor" untuk kalimat negatif, dengan urutan kata bantu + subjek.',
      examples: [
        { en: 'She can speak Arabic, and so can her brother.', id: 'Dia bisa berbahasa Arab, begitu juga kakaknya.' },
        { en: "I don't eat meat, and neither does my sister.", id: 'Saya tidak makan daging, begitu juga adik saya.' },
        { en: "I haven't finished yet, but Dimas has.", id: 'Saya belum selesai, tetapi Dimas sudah.' },
      ],
    },
    {
      heading: 'One, ones, dan do so',
      body: '"one/ones" menggantikan kata benda terhitung yang sudah disebut ("I prefer the blue one"). Kata sifat tidak berdiri sendiri: "a new one", bukan "a new". "do so" (formal) menggantikan frasa kerja: "Applicants must register online. Those who fail to do so ..."',
    },
  ],
  demo: [
    ['A: Will it rain? B: I hope not.', 'A: Will it rain? B: I hope no.', 'Jawaban "tidak" setelah hope, think, atau afraid memakai "not".'],
    ['She likes jazz, and so do I.', 'She likes jazz, and so am I.', 'Kata bantunya mengikuti kalimat pertama: likes → do.'],
    ['These shoes are too small. Do you have bigger ones?', 'These shoes are too small. Do you have bigger one?', '"shoes" jamak, jadi "ones".'],
  ],
  vocab: ['presumably', 'reluctant', 'concede'],
  guided: [
    mc(4, 'Pilih jawaban yang tepat.', "A: Do you think the meeting will be cancelled?\nB: I hope ___. I've prepared all week.", [
      ['not', true],
      ['no', '"I hope no" tidak dipakai. Pakai "I hope not".', 'so-not'],
      ["don't", 'Bentuknya "I hope not".', 'so-not'],
      ['so', 'Dia sudah bersiap seminggu, jadi berharap rapatnya TIDAK dibatalkan.', 'so-not'],
    ], 'Berharap tidak → I hope not.', { focus: 'so-not' }),
    fill(4, "My brother can't swim, and neither ___ I.", ['can'], 'Kata bantu mengikuti kalimat pertama (can\'t → can).', {
      do: ['Kalimat pertama memakai "can", jadi "neither can I".', 'aux-ellipsis'],
      am: ['Kalimat pertama memakai "can".', 'aux-ellipsis'],
      "can't": ['Setelah "neither", kata bantu berbentuk positif: neither can I.', 'aux-ellipsis'],
    }, { focus: 'aux-ellipsis' }),
    match(4, 'Pasangkan ucapan dengan tanggapan yang setuju.', [
      ['I love durian.', 'So do I.'],
      ["I'm not hungry.", 'Neither am I.'],
      ['I have been to Japan.', 'So have I.'],
      ["I didn't see the film.", 'Neither did I.'],
    ], 'Kata bantu mengikuti kalimat pertama; so untuk positif, neither untuk negatif.', { focus: 'aux-ellipsis' }),
    tf(4, 'Jawaban "I think yes." untuk pertanyaan "Is she coming?" sudah benar.', false, 'Yang benar: "I think so."', 'Setelah think, hope, expect, dan afraid dipakai "so" (ya) atau "not" (tidak).', { focus: 'so-not', tag: 'so-not' }),
  ],
  independent: [
    tr(4, 'A: Will we be late? B: Saya rasa tidak.', ["I don't think so", 'I think not'], '"Saya rasa tidak" = I don\'t think so (atau I think not, lebih formal).', {
      'i think no': ['Setelah think, jawaban "tidak" memakai "not": I think not / I don\'t think so.', 'so-not'],
      "i don't think": ['Tambahkan "so": I don\'t think so.', 'so-not'],
      "i don't think no": ['Pakai "I don\'t think so".', 'so-not'],
    }, { focus: 'so-not', prompt: 'Terjemahkan jawaban B ke dalam bahasa Inggris.' }),
    fill(4, "I don't like these sunglasses. Can I try the black ___?", ['ones'], '"sunglasses" jamak → ones.', {
      one: ['"sunglasses" jamak, jadi "ones".', 'one-ones'],
      it: ['Untuk "yang hitam", ganti kata benda dengan one/ones.', 'one-ones'],
      them: ['"them" merujuk ke kacamata yang sama. Untuk "yang hitam", pakai "the black ones".', 'one-ones'],
    }, { focus: 'one-ones' }),
    spot(4, 'Dani speaks French, and so does his parents.', 'does', 'do', '"his parents" jamak: so do his parents.', { focus: 'aux-ellipsis' }),
    dlg(4, 'Lengkapi percakapan berikut.', 'A: Is the last train still running at this hour?\nB: ___', [
      ["I'm afraid not. It left at eleven.", true],
      ["I'm afraid no. It left at eleven.", 'Pakai "I\'m afraid not".', 'so-not'],
      ["I'm afraid so. It left at eleven.", '"so" berarti ya, padahal keretanya sudah berangkat.', 'so-not'],
      ['I afraid not. It left at eleven.', 'Perlu "am": I\'m afraid not.'],
    ], 'Kabar buruk yang sopan: I\'m afraid not.', { focus: 'so-not' }),
  ],
  homework: [
    read(5, 'Applicants who wish to attend the interview in person should confirm by Friday. Those who do not do so will be offered an online interview instead. Most candidates are expected to choose the in-person option, although some, presumably those living abroad, will not.', 'What will happen to applicants who do not confirm by Friday?', [
      ['They will be offered an online interview.', true],
      ['They will lose their place.', 'Teks menyebut mereka ditawari wawancara daring.'],
      ['They must travel from abroad.', 'Tidak disebut sebagai kewajiban.'],
      ['They will be interviewed in person anyway.', 'Yang tidak mengonfirmasi ditawari wawancara daring.'],
    ], '"do so" menggantikan "confirm by Friday".'),
    construct(4, "neither / I / and / did / she / didn't / call", ["She didn't call, and neither did I"], 'Kalimat negatif + neither + kata bantu + subjek.', undefined, { focus: 'aux-ellipsis' }),
    fix(4, 'My laptop is very old, so I want to buy a new.', ['My laptop is very old, so I want to buy a new one'], 'Kata sifat tidak berdiri sendiri: a new one.', undefined, { focus: 'one-ones' }),
  ],
  mastery: [
    mc(5, 'Pilih tanggapan yang paling tepat.', "A: I haven't been to Raja Ampat yet.", [
      ["Neither have I, but I'd love to go.", true],
      ["Neither did I, but I'd love to go.", 'Kalimat A memakai "haven\'t", jadi "Neither have I".', 'aux-ellipsis'],
      ["So have I, but I'd love to go.", 'Untuk menyetujui kalimat negatif, pakai "Neither".', 'aux-ellipsis'],
      ["Neither I have, but I'd love to go.", 'Urutannya: Neither + kata bantu + subjek.', 'aux-ellipsis'],
    ], 'Negatif dengan have → Neither have I.', { focus: 'aux-ellipsis' }),
    fill(5, 'A: Will the results be published today?\nB: I expect ___; the committee met yesterday.', ['so'], 'Mengharapkan "ya" → I expect so.', {
      yes: ['Setelah expect dipakai "so", bukan "yes".', 'so-not'],
      not: ['Rapatnya sudah diadakan, jadi kemungkinan besar "ya".', 'so-not'],
      it: ['Pakai "so": I expect so.', 'so-not'],
    }, { focus: 'so-not' }),
    tr(5, 'Saya tidak suka kopi, dan dia (perempuan) juga tidak.', ["I don't like coffee, and neither does she", "I don't like coffee, and she doesn't either", "I don't like coffee, and nor does she"], 'Kalimat negatif → neither does she / she doesn\'t either / nor does she.', {
      "i don't like coffee and she too": ['Untuk kalimat negatif: neither does she / she doesn\'t either.', 'aux-ellipsis'],
      "i don't like coffee and neither she does": ['Urutannya: neither + does + she.', 'aux-ellipsis'],
      "i don't like coffee and so does she": ['"so" untuk kalimat positif. Untuk negatif pakai neither.', 'aux-ellipsis'],
      "i don't like coffee and she doesn't too": ['Untuk kalimat negatif pakai "either", bukan "too".', 'aux-ellipsis'],
    }, { focus: 'aux-ellipsis' }),
    spot(5, 'These cups are dirty. Could you bring me a clean ones?', 'ones', 'one', '"a" + tunggal: a clean one.', { focus: 'one-ones' }),
    construct(5, "has / I / not / she / but / have / finished", ['I have not finished, but she has', 'She has finished, but I have not'], 'Kata bantu (has / have not) menggantikan frasa kerja yang sudah disebut.', undefined, { focus: 'aux-ellipsis' }),
  ],
});

export const collocations = lesson({
  id: 'c2-collocations',
  title: 'Kolokasi Idiomatis',
  summary: 'Pasangan kata yang terdengar wajar: make/do, heavy rain, pay attention, reach a consensus.',
  topic: 'c2.collocations',
  objectives: [
    'Membedakan kolokasi dengan make dan do.',
    'Memakai pasangan kata sifat + kata benda yang wajar (heavy rain, strong coffee, high price).',
    'Memakai pasangan kata kerja + kata benda (pay attention, take a risk, commit a crime, draw a conclusion).',
  ],
  intro: 'Kolokasi adalah pasangan kata yang "terdengar benar" bagi penutur asli. Terjemahan harfiah sering menghasilkan pasangan yang dimengerti tetapi janggal: "hujan deras" bukan "strong rain", dan "membuat kesalahan" memang "make a mistake" (bukan do), tetapi "melakukan riset" justru "do research".',
  teaching: [
    {
      heading: 'Make atau do?',
      table: [
        ['make (menghasilkan / membuat)', 'do (melakukan kegiatan / pekerjaan)'],
        ['make a mistake, make a decision, make progress', 'do research, do homework, do business'],
        ['make an effort, make a profit, make a complaint', 'do the dishes, do someone a favour, do damage'],
      ],
      body: 'Polanya tidak selalu logis; hafalkan sebagai pasangan.',
    },
    {
      heading: 'Kata sifat + kata benda',
      body: 'Terjemahan harfiah sering terdengar janggal. Pakai pasangan yang lazim di kolom kanan.',
      table: [
        ['Janggal (terjemahan harfiah)', 'Wajar'],
        ['strong rain', 'heavy rain'],
        ['crowded traffic', 'heavy traffic'],
        ['expensive price', 'high price'],
        ['thick coffee', 'strong coffee'],
        ['heavy mistake', 'serious mistake'],
      ],
    },
    {
      heading: 'Kata kerja + kata benda',
      body: 'Pelajari kata benda bersama kata kerjanya, bukan kata per kata.',
      table: [
        ['Pasangan', 'Contoh'],
        ['pay attention', 'Please pay attention to the instructions.'],
        ['take a risk', 'She took a big risk when she started the business.'],
        ['commit a crime', 'He committed the crime alone.'],
        ['draw / reach a conclusion', 'We drew a clear conclusion from the data.'],
        ['reach an agreement / a consensus', 'The two sides reached an agreement.'],
        ['meet a deadline', 'We worked all night to meet the deadline.'],
      ],
    },
  ],
  demo: [
    ['I made a mistake in the report.', 'I did a mistake in the report.', '"mistake" berpasangan dengan "make".'],
    ['There was heavy rain last night.', 'There was strong rain last night.', '"hujan deras" = heavy rain.'],
    ['We need to draw a conclusion from the data.', 'We need to make a conclusion from the data.', '"conclusion" berpasangan dengan draw atau reach.'],
  ],
  vocab: ['consensus', 'deliberate', 'commitment'],
  guided: [
    mc(4, 'Pilih kolokasi yang tepat.', 'We need to ___ a decision before Friday.', [
      ['make', true],
      ['do', '"decision" berpasangan dengan "make".', 'make-do'],
      ['give', 'Bukan "give a decision".', 'make-do'],
      ['create', '"create" tidak berpasangan dengan "decision".', 'make-do'],
    ], 'make a decision.', { focus: 'make-do' }),
    match(4, 'Pasangkan kata kerja dengan kata bendanya.', [
      ['commit', 'a crime'],
      ['pay', 'attention'],
      ['take', 'a risk'],
      ['meet', 'a deadline'],
    ], 'Pasangan kata kerja + kata benda yang wajar.', { focus: 'verb-noun-collocation' }),
    fill(4, "There's always ___ traffic on the toll road on Friday evenings.", ['heavy', 'bad'], '"Macet parah" = heavy traffic (atau bad traffic).', {
      crowded: ['"crowded" untuk tempat yang penuh orang, bukan lalu lintas.', 'adj-noun-collocation'],
      many: ['"traffic" tidak dihitung dengan "many".', 'adj-noun-collocation'],
      strong: ['"strong" tidak berpasangan dengan "traffic".', 'adj-noun-collocation'],
      busy: ['"busy" dipakai untuk jalan ("a busy road"), bukan "busy traffic".', 'adj-noun-collocation'],
    }, { focus: 'adj-noun-collocation' }),
    tf(4, '"do research" adalah kolokasi yang wajar.', true, 'Benar. "research" berpasangan dengan "do" (atau "carry out / conduct research").', '"do research" memang kolokasi yang wajar; yang keliru adalah "make research".', { focus: 'make-do' }),
  ],
  independent: [
    tr(4, 'Dia (laki-laki) membuat banyak kesalahan dalam tes itu.', ['He made a lot of mistakes in the test', 'He made many mistakes in the test', 'He made lots of mistakes in the test', 'He made a lot of mistakes on the test', 'He made many mistakes on the test', 'He made a lot of mistakes in that test', 'He made many mistakes in that test'], '"mistake" berpasangan dengan "make".', {
      'he did a lot of mistakes in the test': ['"mistake" berpasangan dengan "make".', 'make-do'],
      'he did many mistakes in the test': ['"mistake" berpasangan dengan "make".', 'make-do'],
    }, { focus: 'make-do' }),
    fill(4, "Could you ___ me a favour and water my plants while I'm away?", ['do'], '"do someone a favour".', {
      make: ['"favour" berpasangan dengan "do".', 'make-do'],
      give: ['Kolokasinya "do someone a favour".', 'make-do'],
    }, { focus: 'make-do' }),
    spot(4, 'The coffee in this café is too thick for me.', 'thick', 'strong', '"Kopi kental/pekat" = strong coffee.', { focus: 'adj-noun-collocation' }),
    dlg(4, 'Lengkapi percakapan berikut.', 'A: Did the committee agree on the new budget?\nB: ___', [
      ["Not yet. They're still trying to reach a consensus.", true],
      ["Not yet. They're still trying to make a consensus.", '"consensus" berpasangan dengan "reach".', 'verb-noun-collocation'],
      ["Not yet. They're still trying to do a consensus.", '"consensus" berpasangan dengan "reach".', 'verb-noun-collocation'],
      ["Not yet. They're still trying to arrive a consensus.", '"arrive" butuh "at"; yang paling umum "reach a consensus".', 'verb-noun-collocation'],
    ], 'reach a consensus.', { focus: 'verb-noun-collocation' }),
  ],
  homework: [
    read(5, 'Dear Mr Hartono, Thank you for your email. I apologise for the delay; we have been doing some maintenance on our system. I fully understand your complaint, and I can assure you that we take it seriously. We have made several changes to prevent the problem from happening again, and we will do our best to meet the new deadline. Kind regards, Lestari', "What has Lestari's company done about the problem?", [
      ['Made several changes to prevent it from happening again', true],
      ['Ignored the complaint', 'Dia menulis "we take it seriously".'],
      ['Cancelled the deadline', 'Mereka berusaha memenuhi tenggat yang baru.'],
      ['Asked Mr Hartono to do maintenance', 'Perusahaan sendiri yang melakukan pemeliharaan.'],
    ], '"We have made several changes to prevent the problem from happening again."'),
    construct(4, 'risk / a / took / she / big', ['She took a big risk'], 'take a risk.', undefined, { focus: 'verb-noun-collocation' }),
    fix(4, 'Prices in this area are very expensive.', ['Prices in this area are very high'], 'Harga itu "high"; barangnya yang "expensive".', undefined, { focus: 'adj-noun-collocation' }),
  ],
  mastery: [
    mc(5, 'Pilih kalimat dengan kolokasi yang paling wajar.', null, [
      ['The police believe he committed the crime alone.', true],
      ['The police believe he did the crime alone.', '"crime" berpasangan dengan "commit".', 'verb-noun-collocation'],
      ['The police believe he made the crime alone.', '"crime" berpasangan dengan "commit".', 'verb-noun-collocation'],
      ['The police believe he performed the crime alone.', '"crime" berpasangan dengan "commit".', 'verb-noun-collocation'],
    ], 'commit a crime.', { focus: 'verb-noun-collocation' }),
    fill(5, 'Learning a new language takes time, but you are ___ real progress.', ['making'], '"make progress".', {
      doing: ['"progress" berpasangan dengan "make".', 'make-do'],
      getting: ['Kolokasi yang wajar: make progress.', 'make-do'],
      having: ['Kolokasi yang wajar: make progress.', 'make-do'],
    }, { focus: 'make-do' }),
    tr(5, 'Tolong perhatikan instruksinya.', ['Please pay attention to the instructions', 'Please pay attention to the instruction', 'Pay attention to the instructions, please'], '"Memperhatikan" = pay attention to.', {
      'please give attention to the instructions': ['"attention" berpasangan dengan "pay".', 'verb-noun-collocation'],
      'please make attention to the instructions': ['"attention" berpasangan dengan "pay".', 'verb-noun-collocation'],
      'please pay attention for the instructions': ['Polanya "pay attention to".', 'verb-noun-collocation'],
    }, { focus: 'verb-noun-collocation' }),
    spot(5, 'Despite the strong rain, the ceremony went ahead.', 'strong', 'heavy', '"Hujan deras" = heavy rain.', { focus: 'adj-noun-collocation' }),
    construct(5, 'a / conclusion / we / drew / from / the results / clear', ['We drew a clear conclusion from the results'], 'draw a conclusion.', undefined, { focus: 'verb-noun-collocation' }),
  ],
});

export const understatement = lesson({
  id: 'c2-understatement',
  title: 'Ironi dan Understatement',
  summary: 'Memahami makna tersirat: not bad, a bit of a problem, not uncommon, dan ironi.',
  topic: 'c2.understatement',
  objectives: [
    'Menangkap maksud sebenarnya dari understatement ("not ideal" = buruk, "not bad" = bagus).',
    'Memahami dan memakai litotes: not uncommon, not without, not exactly.',
    'Mengenali ironi dari konteks dan menyampaikan ketidaksetujuan dengan halus.',
  ],
  intro: 'Penutur bahasa Inggris, terutama di Inggris, sering mengatakan lebih sedikit daripada yang dimaksud. "That\'s not ideal" bisa berarti "itu bencana", dan "Your idea is interesting" bisa berarti penolakan. Membaca makna tersirat ini sangat penting di rapat, email kerja, dan percakapan sehari-hari.',
  teaching: [
    {
      heading: 'Understatement',
      body: 'Kalimat di kiri terdengar lunak, tetapi maksudnya jauh lebih kuat.',
      table: [
        ['Yang diucapkan', 'Yang dimaksud'],
        ["It's not bad.", 'Bagus.'],
        ["It's a bit of a problem.", 'Masalahnya serius.'],
        ["I'm not entirely convinced.", 'Saya tidak setuju.'],
        ["That's not ideal.", 'Itu buruk sekali.'],
        ['We had a slight disagreement.', 'Kami bertengkar.'],
      ],
    },
    {
      heading: 'Litotes: menyangkal kebalikannya',
      body: '"not un-", "not without", dan "not exactly" menegaskan sesuatu secara halus. Setelah "is not" diperlukan kata sifat (not unusual), bukan kata keterangan (not unusually).',
      examples: [
        { en: "It's not uncommon for flights to be delayed in the rainy season.", id: 'Penerbangan cukup sering tertunda pada musim hujan.' },
        { en: 'The plan is not without risks.', id: 'Rencana itu punya risiko.' },
        { en: "The hotel wasn't exactly cheap.", id: 'Hotelnya mahal.' },
      ],
    },
    {
      heading: 'Ironi',
      body: 'Ironi mengatakan kebalikan dari maksud dan dikenali dari konteks serta nada. "Oh, great. Another meeting." biasanya berarti tidak senang. Dalam situasi formal, sarkasme berisiko menyinggung; ungkapan halus lebih aman.',
    },
  ],
  demo: [
    ["I'm not entirely convinced this will work.", 'This will definitely not work.', 'Dalam diskusi profesional, keraguan biasanya disampaikan dengan halus.'],
    ['There may be a slight problem with the schedule.', 'Your schedule is a disaster.', 'Ungkapan halus seperti "a slight problem" lebih diterima dalam email kerja.'],
    ["It's not unusual for prices to rise before Lebaran.", "It's not unusually for prices to rise before Lebaran.", 'Setelah "is not" diperlukan kata sifat: unusual.'],
  ],
  vocab: ['subtle', 'sarcastic', 'entirely'],
  guided: [
    mc(4, 'Apa maksud B?', "A: How was your first week at the new job?\nB: Well, it wasn't exactly relaxing.", [
      ['The week was stressful.', true],
      ['The week was very relaxing.', '"wasn\'t exactly relaxing" berarti sama sekali tidak santai.', 'literal-reading'],
      ['B did not start the job.', 'B jelas sudah bekerja seminggu.'],
      ['B is not sure how the week was.', 'B menyampaikan pendapat dengan halus, bukan ragu.', 'literal-reading'],
    ], '"not exactly + kata sifat" berarti kebalikannya.', { focus: 'literal-reading' }),
    match(4, 'Pasangkan ungkapan dengan maksud sebenarnya.', [
      ["It's not bad.", 'It is good.'],
      ["It's a bit of a problem.", 'It is a serious problem.'],
      ["I'm not entirely convinced.", 'I disagree.'],
      ["It's not uncommon.", 'It happens quite often.'],
    ], 'Understatement mengatakan lebih sedikit daripada yang dimaksud.', { focus: 'literal-reading' }),
    fill(4, 'It is not ___ for flights to be delayed during the rainy season; it happens quite often. (common)', ['uncommon'], 'Litotes: not + un- = cukup sering.', {
      common: ['"not common" berarti jarang, padahal kalimatnya "it happens quite often".', 'litotes'],
      uncommonly: ['Setelah "is not" diperlukan kata sifat: uncommon.', 'litotes'],
    }, { focus: 'litotes', prompt: 'Tulis bentuk kata yang tepat dari kata dalam kurung.' }),
    tf(4, 'Jika rekan kerja berkata "Oh, perfect. The printer is broken again.", dia sedang senang.', false, 'Ini ironi: kata "perfect" dipakai untuk menyatakan kesal karena printernya rusak lagi.', 'Konteksnya (printer rusak lagi) menunjukkan bahwa "perfect" bermakna kebalikannya.', { focus: 'irony-cue', tag: 'irony-cue' }),
  ],
  independent: [
    construct(4, "not / I'm / convinced / entirely", ["I'm not entirely convinced"], 'Ungkapan halus untuk tidak setuju.', undefined, { focus: 'literal-reading' }),
    read(5, 'Email from a client: "Thank you for the draft design. It is certainly an interesting direction. However, we wonder whether it might be a little too bold for our older customers. Perhaps we could discuss a few alternatives next week?"', 'What does the client really think of the design?', [
      ['They are not happy with it and want changes.', true],
      ['They love it and will use it.', '"interesting direction", "a little too bold", dan "alternatives" adalah penolakan halus.', 'literal-reading'],
      ['They have not looked at it yet.', 'Mereka jelas sudah melihatnya.'],
      ['They want it to be even bolder.', 'Mereka khawatir desainnya terlalu berani.', 'literal-reading'],
    ], 'Pujian samar diikuti "However" dan usulan alternatif = penolakan yang sopan.', { focus: 'literal-reading' }),
    fill(5, 'The new policy is not ___ risks, so we should plan carefully.', ['without'], '"not without risks" = ada risikonya.', {
      with: ['Litotes memakai "not without".', 'litotes'],
      no: ['Pakai "not without".', 'litotes'],
    }, { focus: 'litotes' }),
    dlg(5, 'Pilih tanggapan yang paling sopan dalam rapat formal.', 'A (manajer): I suggest we launch the product next month.\nB: ___', [
      ["That's an interesting idea, but I'm not sure we'll be ready by then.", true],
      ["That's a terrible idea. We won't be ready.", 'Terlalu langsung untuk rapat formal dengan atasan.', 'literal-reading'],
      ['Not bad idea, but not ready.', 'Kalimatnya tidak lengkap dan kurang sopan.'],
      ['Oh, wonderful. Another impossible deadline.', 'Ini sarkasme; berisiko menyinggung manajer.', 'irony-cue'],
    ], 'Pengakuan positif + keraguan yang halus.', { focus: 'literal-reading' }),
  ],
  homework: [
    read(5, "Rizal's review of a restaurant: \"The view was spectacular and the staff were friendly. The food, on the other hand, was not exactly memorable: the soup was a touch salty and the steak was slightly overcooked. All in all, it wasn't the worst meal I've had this year.\"", "What is Rizal's overall opinion of the food?", [
      ['It was disappointing.', true],
      ['It was excellent.', '"not exactly memorable" dan "wasn\'t the worst" adalah cara halus mengatakan mengecewakan.', 'literal-reading'],
      ['It was the worst meal of the year.', 'Dia berkata "wasn\'t the worst"; bukan yang terburuk, tetapi juga tidak bagus.', 'literal-reading'],
      ['He did not eat the food.', 'Dia mengomentari sup dan steaknya.'],
    ], 'Understatement: "not exactly memorable" dan "a touch salty" menunjukkan kekecewaan.'),
    fix(5, 'It is not unusually to see monkeys near this temple.', ['It is not unusual to see monkeys near this temple'], 'Setelah "is not" diperlukan kata sifat: unusual.', undefined, { focus: 'litotes' }),
    mc(4, 'Pilih ungkapan yang paling halus untuk mengatakan bahwa laporan rekan kerja mengandung banyak kesalahan.', null, [
      ['There are a few points we might want to look at again.', true],
      ['Your report is full of mistakes.', 'Terlalu langsung untuk rekan kerja.', 'literal-reading'],
      ['Your report is perfect.', 'Tidak jujur; laporannya mengandung kesalahan.', 'irony-cue'],
      ['Oh, brilliant work, as usual.', 'Sarkasme dapat menyinggung.', 'irony-cue'],
    ], 'Kritik yang halus dan membangun.', { focus: 'literal-reading' }),
  ],
  mastery: [
    mc(5, 'Apa maksud manajer?', '"Your presentation was... interesting. Perhaps next time we could have a few more figures and slightly fewer jokes."', [
      ['The presentation needs to be more serious and data-based.', true],
      ['The presentation was perfect.', '"interesting" dengan jeda, lalu saran perbaikan, menunjukkan kritik halus.', 'literal-reading'],
      ['The manager wants more jokes.', 'Dia justru meminta lebih sedikit lelucon.', 'literal-reading'],
      ['The manager did not watch it.', 'Dia mengomentari isinya.'],
    ], 'Pujian samar + saran = kritik halus.', { focus: 'literal-reading' }),
    fill(5, 'Getting tickets for the final was not ___ easy; we queued for six hours. (exact)', ['exactly'], '"not exactly easy" = sulit.', {
      exact: ['Di depan kata sifat diperlukan kata keterangan: exactly.', 'litotes'],
      very: ['Maknanya mirip, tetapi kata dalam kurung adalah "exact": exactly.'],
    }, { focus: 'litotes', prompt: 'Tulis bentuk kata yang tepat dari kata dalam kurung.' }),
    tr(5, 'Itu bukan ide yang buruk.', ["That's not a bad idea", "It's not a bad idea", "That isn't a bad idea", "It isn't a bad idea"], '"not a bad idea" = ide yang cukup bagus.', {
      "that's not bad idea": ['Perlu artikel: a bad idea.'],
      "that's not a bad ideas": ['"a" + tunggal: idea.'],
    }, { focus: 'literal-reading' }),
    spot(5, 'It was not uncommonly for the meetings to run late.', 'uncommonly', 'uncommon', 'Setelah "was not" diperlukan kata sifat: uncommon.', { focus: 'litotes' }),
    construct(5, "a / bit / it's / of / problem / a", ["It's a bit of a problem"], 'Understatement: a bit of a problem.', undefined, { focus: 'literal-reading' }),
  ],
});

export const advancedModality = lesson({
  id: 'c2-modality',
  title: 'Modalitas Lanjut',
  summary: 'Menyimpulkan dan menyesali masa lalu dengan must/might/can\'t/should have, needn\'t have.',
  topic: 'c2.modality',
  objectives: [
    'Menyimpulkan masa lalu dengan must / might / could / can\'t have + bentuk ketiga.',
    'Menyatakan penyesalan dan kritik dengan should / shouldn\'t have + bentuk ketiga.',
    'Membedakan needn\'t have (sudah dilakukan, ternyata tidak perlu) dari didn\'t need to.',
  ],
  intro: '"Dia pasti sudah pergi", "Seharusnya saya tidak bilang begitu", "Kamu tidak perlu repot-repot membawanya." Bahasa Indonesia memakai kata keterangan; bahasa Inggris memakai modal + have + bentuk ketiga. Bentuk "have" tidak pernah berubah, dan setelahnya selalu bentuk ketiga.',
  teaching: [
    {
      heading: 'Menyimpulkan masa lalu',
      body: 'Pilih modal menurut kekuatan bukti, lalu tambahkan have + bentuk ketiga. "have" tidak pernah berubah menjadi has atau had.',
      table: [
        ['Keyakinan', 'Bentuk', 'Contoh'],
        ['hampir pasti', 'must have + bentuk ketiga', 'The ground is wet. It must have rained.'],
        ['mungkin', 'might / may / could have + bentuk ketiga', 'She might have missed the bus.'],
        ['hampir pasti tidak', "can't / couldn't have + bentuk ketiga", "He can't have seen us; he was asleep."],
      ],
    },
    {
      heading: 'Penyesalan dan kritik',
      examples: [
        { en: 'I should have saved more money.', id: 'Seharusnya saya menabung lebih banyak.' },
        { en: "You shouldn't have shouted at him.", id: 'Seharusnya kamu tidak membentaknya.' },
        { en: 'We could have won if we had trained harder.', id: 'Kita bisa saja menang kalau berlatih lebih keras.', note: 'Kesempatan yang terlewat.' },
      ],
      body: '"must have" untuk kesimpulan, bukan untuk kritik.',
    },
    {
      heading: "Needn't have atau didn't need to?",
      body: 'Bedanya terletak pada apakah tindakannya sudah dilakukan.',
      table: [
        ['Bentuk', 'Arti', 'Contoh'],
        ["needn't have + bentuk ketiga", 'Sudah dilakukan, ternyata tidak perlu.', "I needn't have cooked; they had already eaten."],
        ["didn't need to + bentuk dasar", 'Tidak perlu (biasanya memang tidak dilakukan).', "I didn't need to cook, so I relaxed."],
      ],
    },
  ],
  demo: [
    ['She must have left already.', 'She must had left already.', 'Bentuknya must + have (selalu "have") + bentuk ketiga.'],
    ['You should have told me earlier.', 'You should have tell me earlier.', 'Setelah should have, bentuk ketiga: told.'],
    ["He can't have stolen it; he was with me all day.", "He mustn't have stolen it; he was with me all day.", 'Kesimpulan negatif tentang masa lalu memakai can\'t have.'],
  ],
  vocab: ['hindsight', 'inevitable', 'bound'],
  guided: [
    mc(4, 'Pilih bentuk yang tepat.', 'The streets are wet. It ___ during the night.', [
      ['must have rained', true],
      ['must rained', 'Bentuknya must + have + bentuk ketiga.', 'modal-have-pp'],
      ['must have rain', 'Setelah have, bentuk ketiga: rained.', 'modal-have-pp'],
      ["can't have rained", 'Jalan yang basah adalah bukti kuat bahwa hujan turun.', 'modal-past-meaning'],
    ], 'Bukti kuat tentang masa lalu → must have + bentuk ketiga.', { focus: 'modal-have-pp' }),
    fill(4, "I'm sorry. I ___ have shouted at you yesterday.", ["shouldn't"], 'Penyesalan: shouldn\'t have + bentuk ketiga.', {
      "mustn't": ['"mustn\'t have" tidak dipakai untuk penyesalan. Pakai shouldn\'t have.', 'modal-past-meaning'],
      "couldn't": ['"couldn\'t have" berarti tidak mungkin. Untuk menyesal pakai shouldn\'t have.', 'modal-past-meaning'],
      "wouldn't": ['Untuk penyesalan pakai shouldn\'t have.', 'modal-past-meaning'],
    }, { focus: 'modal-past-meaning' }),
    match(4, 'Pasangkan kalimat dengan maknanya.', [
      ['She must have forgotten.', 'Saya hampir yakin dia lupa.'],
      ['She might have forgotten.', 'Mungkin dia lupa.'],
      ["She can't have forgotten.", 'Tidak mungkin dia lupa.'],
      ["She shouldn't have forgotten.", 'Dia seharusnya tidak lupa.'],
    ], 'must have: hampir pasti; might have: mungkin; can\'t have: tidak mungkin; shouldn\'t have: kritik.', { focus: 'modal-past-meaning' }),
    tf(4, 'Kalimat "We needn\'t have booked a table; the restaurant was almost empty." berarti kami tidak memesan meja.', false, 'Artinya kami SUDAH memesan meja, dan ternyata tidak perlu.', '"needn\'t have + bentuk ketiga" berarti sudah dilakukan tetapi ternyata tidak perlu.', { focus: 'neednt-didnt-need', tag: 'neednt-didnt-need' }),
  ],
  independent: [
    tr(5, 'Seharusnya kamu memberi tahu saya lebih awal.', ['You should have told me earlier', 'You should have told me sooner', 'You should have let me know earlier', 'You should have let me know sooner'], 'Kritik: should have + bentuk ketiga.', {
      'you should told me earlier': ['Bentuknya should + have + bentuk ketiga.', 'modal-have-pp'],
      'you should have tell me earlier': ['Setelah have, bentuk ketiga: told.', 'modal-have-pp'],
      'you must have told me earlier': ['"must have" berarti kesimpulan, bukan kritik. Pakai should have.', 'modal-past-meaning'],
    }, { focus: 'modal-have-pp' }),
    fill(5, 'There was no traffic, so we ___ to leave so early. (not need)', ["didn't need"], 'Diikuti "to leave", jadi didn\'t need (to).', {
      "needn't have": ['Setelah titik-titik ada "to leave", jadi bentuknya didn\'t need (to).', 'neednt-didnt-need'],
      "needn't": ['Diikuti "to": didn\'t need to.', 'neednt-didnt-need'],
      "don't need": ['Kejadiannya masa lalu: didn\'t need.', 'neednt-didnt-need'],
    }, { focus: 'neednt-didnt-need', prompt: 'Tulis bentuk yang tepat dari kata dalam kurung.' }),
    spot(5, 'You should have went to the doctor sooner.', 'went', 'gone', 'should have + bentuk ketiga: gone.', { focus: 'modal-have-pp' }),
    dlg(5, 'Lengkapi percakapan berikut.', "A: I brought an umbrella, but it didn't rain at all.\nB: ___", [
      ["Oh well, you needn't have brought it, then.", true],
      ["Oh well, you needn't bring it, then.", 'Kejadiannya sudah lewat: needn\'t have brought.', 'neednt-didnt-need'],
      ["Oh well, you mustn't have brought it, then.", '"mustn\'t" tidak dipakai untuk hal yang tidak perlu.', 'modal-past-meaning'],
      ["Oh well, you needn't have bring it, then.", 'Setelah have, bentuk ketiga: brought.', 'modal-have-pp'],
    ], 'Sudah dilakukan, ternyata tidak perlu → needn\'t have + bentuk ketiga.', { focus: 'neednt-didnt-need' }),
  ],
  homework: [
    read(5, "When Pak Yanto got home, the front door was open and the TV was on, but nobody was there. His wife can't have left it open; she had been at work all day. His son might have come home early from school, or the neighbour, who has a spare key, could have come in to feed the cat. In hindsight, he thinks he should have locked the door more carefully that morning.", 'Who almost certainly did NOT leave the door open?', [
      ["Pak Yanto's wife", true],
      ['His son', 'Anaknya disebut sebagai kemungkinan ("might have").', 'modal-past-meaning'],
      ['The neighbour', 'Tetangga juga sebuah kemungkinan ("could have").', 'modal-past-meaning'],
      ['We cannot know', '"can\'t have left it open" menunjukkan hampir pasti bukan istrinya.', 'modal-past-meaning'],
    ], '"His wife can\'t have left it open" = hampir pasti bukan istrinya.'),
    construct(5, 'have / must / they / the wrong turn / taken', ['They must have taken the wrong turn'], 'must + have + bentuk ketiga.', undefined, { focus: 'modal-have-pp' }),
    fix(5, "She can't has forgotten our meeting; I reminded her this morning.", ["She can't have forgotten our meeting; I reminded her this morning"], '"have" tidak pernah berubah menjadi "has" setelah modal.', undefined, { focus: 'modal-have-pp' }),
  ],
  mastery: [
    mc(5, 'Pilih kalimat yang paling tepat.', 'Situasi: Kamu sudah memasak banyak untuk tamu, ternyata mereka sudah makan.', [
      ["I needn't have cooked so much.", true],
      ["I didn't need to cook so much, so I didn't.", 'Kamu sudah memasak, jadi needn\'t have cooked.', 'neednt-didnt-need'],
      ["I mustn't have cooked so much.", '"mustn\'t have" tidak dipakai di sini.', 'modal-past-meaning'],
      ["I needn't have cook so much.", 'Setelah have, bentuk ketiga: cooked.', 'modal-have-pp'],
    ], 'Sudah dilakukan, ternyata tidak perlu.', { focus: 'neednt-didnt-need' }),
    fill(5, 'They ___ have arrived yet; their flight only left an hour ago.', ["can't", "couldn't"], 'Hampir pasti belum → can\'t / couldn\'t have.', {
      "mustn't": ['Kesimpulan negatif: can\'t have.', 'modal-past-meaning'],
      "shouldn't": ['"shouldn\'t have" untuk kritik atau penyesalan.', 'modal-past-meaning'],
      must: ['Pesawatnya baru berangkat sejam lalu; mereka hampir pasti belum tiba.', 'modal-past-meaning'],
    }, { focus: 'modal-past-meaning' }),
    tr(5, 'Dia (perempuan) mungkin ketinggalan kereta tadi pagi.', ['She might have missed the train this morning', 'She may have missed the train this morning', 'She could have missed the train this morning'], 'Kemungkinan di masa lalu: might / may / could have + bentuk ketiga.', {
      'she might missed the train this morning': ['Bentuknya might + have + bentuk ketiga.', 'modal-have-pp'],
      'she might have miss the train this morning': ['Setelah have, bentuk ketiga: missed.', 'modal-have-pp'],
      'she must have missed the train this morning': ['"must have" berarti hampir pasti, sedangkan kalimatnya "mungkin".', 'modal-past-meaning'],
    }, { focus: 'modal-have-pp' }),
    spot(5, 'With hindsight, we could have saving a lot of money.', 'saving', 'saved', 'could have + bentuk ketiga: saved.', { focus: 'modal-have-pp' }),
    construct(5, 'told / have / should / you / the truth / me', ['You should have told me the truth'], 'should + have + bentuk ketiga.', undefined, { focus: 'modal-have-pp' }),
  ],
});
