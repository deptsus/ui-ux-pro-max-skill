// C1 · Bab 1 · Unit 1 — Inversi dan Cleft (lanjutan)
// C1 · Bab 2 · Unit 1 — Gaya Akademik
import { construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const cleft = lesson({
  id: 'c1-cleft',
  title: 'Cleft Sentences: It is ... that / What ... is',
  summary: 'Memberi penekanan dengan memecah kalimat menjadi dua bagian.',
  topic: 'c1.cleft',
  objectives: [
    'Membentuk it-cleft: It is/was + bagian yang ditekankan + who/that.',
    'Membentuk what-cleft: What + klausa + is/was + fokus, termasuk "What she did was ...".',
    'Menjaga kesesuaian subjek dan kata kerja dalam kalimat cleft.',
  ],
  intro: 'Untuk menekankan sesuatu, bahasa Indonesia memakai "-lah" atau urutan kata: "Rinalah yang menelepon polisi." Bahasa Inggris memecah kalimat menjadi dua bagian: "It was Rina who called the police." Struktur ini sangat berguna untuk mengoreksi kesalahpahaman dan menonjolkan poin utama dalam presentasi.',
  teaching: [
    {
      heading: 'It-cleft',
      body: '"It" selalu diikuti is/was tunggal, walaupun bagian yang ditekankan jamak. Untuk orang pakai who (atau that); untuk lainnya pakai that. Kata kerja di dalam klausa who/that mengikuti bagian yang ditekankan: "It is the prices that worry me."',
      table: [
        ['Kalimat biasa', 'Penekanan'],
        ['Rina called the police.', 'It was Rina who called the police.'],
        ['Rina called the police.', 'It was the police that Rina called.'],
        ['We met in Bandung.', 'It was in Bandung that we met.'],
      ],
    },
    {
      heading: 'What-cleft',
      body: 'What + klausa + is/was + fokus. Untuk menekankan tindakan, pakai "What + subjek + did was + bentuk dasar (atau to + bentuk dasar)". Bentuk sejenis: "All I want is ...", "The thing I like most is ...".',
      examples: [
        { en: 'What I need is a long holiday.', id: 'Yang saya butuhkan adalah liburan panjang.' },
        { en: 'What he did was apologise to everyone.', id: 'Yang dia lakukan adalah meminta maaf kepada semua orang.' },
        { en: 'All I want is some peace and quiet.', id: 'Yang saya mau hanyalah ketenangan.' },
      ],
    },
    {
      heading: 'The reason why ... is that',
      body: 'Untuk menjelaskan alasan secara formal: "The reason (why) I left is that ...". Dalam percakapan, "is because" juga sering dipakai. Jangan menambahkan "it" sebelum is.',
    },
  ],
  demo: [
    ['It was the students who complained.', 'It were the students who complained.', '"It" selalu diikuti is/was tunggal, walaupun yang ditekankan jamak.'],
    ['What I need is more time.', 'What I need it is more time.', 'Klausa "What I need" sudah menjadi subjek. Jangan tambahkan "it".'],
    ['What she did was call the manager.', 'What she did was called the manager.', 'Setelah "What ... did was", pakai bentuk dasar atau to + bentuk dasar.'],
  ],
  vocab: ['emphasise', 'concern', 'priority'],
  guided: [
    mc(3, 'Pilih kalimat yang menekankan SIAPA yang menemukan dompet itu.', null, [
      ['It was Andi who found the wallet.', true],
      ['It was Andi which found the wallet.', 'Untuk orang pakai who (atau that).', 'cleft-it'],
      ['It were Andi who found the wallet.', '"It" selalu diikuti was (tunggal).', 'cleft-it'],
      ['Andi it was who found the wallet.', 'Urutannya: It + was + fokus + who.', 'cleft-it'],
    ], 'It + was + orang yang ditekankan + who.', { focus: 'cleft-it' }),
    fill(3, 'It ___ my parents who taught me to read.', ['was'], '"It" selalu diikuti is/was tunggal.', {
      were: ['Walaupun "my parents" jamak, cleft tetap memakai "It was".', 'cleft-it'],
    }, { focus: 'cleft-it' }),
    match(3, 'Pasangkan kalimat biasa dengan bentuk cleft-nya.', [
      ['I need a holiday.', 'What I need is a holiday.'],
      ['She called the police.', 'What she did was call the police.'],
      ['Dewi won the prize.', 'It was Dewi who won the prize.'],
      ['We met in Bandung.', 'It was in Bandung that we met.'],
    ], 'What-cleft menekankan benda atau tindakan; it-cleft menekankan orang, waktu, atau tempat.', { focus: 'cleft-what' }),
    tf(3, 'Kalimat "What I don\'t understand it is why he left." sudah benar.', false, 'Tidak ada "it" tambahan: "What I don\'t understand is why he left."', 'Klausa "What ..." sudah menjadi subjek; jangan tambahkan "it".', { focus: 'cleft-what', tag: 'cleft-what' }),
  ],
  independent: [
    tr(4, 'Yang saya butuhkan sekarang adalah secangkir kopi.', ['What I need now is a cup of coffee', 'What I need right now is a cup of coffee', 'Right now what I need is a cup of coffee'], 'What-cleft: What I need (now) is ...', {
      'what i need now it is a cup of coffee': ['Jangan tambahkan "it".', 'cleft-what'],
      'what i need now is cup of coffee': ['Perlu artikel: a cup of coffee.'],
      'that i need now is a cup of coffee': ['Cleft yang diawali klausa memakai "What".', 'cleft-what'],
    }, { focus: 'cleft-what' }),
    fill(4, 'What the manager did ___ cancel all the meetings. (be)', ['was'], '"What ... did" (lampau) + was + bentuk dasar.', {
      is: ['Kejadiannya lampau ("did"): was.'],
      were: ['Klausa "What ..." dianggap tunggal: was.', 'cleft-what'],
    }, { focus: 'cleft-verb', prompt: 'Tulis bentuk to be yang tepat dari kata dalam kurung.' }),
    spot(4, 'It is the rising prices that worries most families.', 'worries', 'worry', 'Kata kerja setelah "that" mengikuti bagian yang ditekankan (the rising prices, jamak): worry.', { focus: 'cleft-it' }),
    construct(4, 'all / want / I / is / honesty', ['All I want is honesty'], 'All + klausa + is + fokus.', undefined, { focus: 'cleft-what' }),
  ],
  homework: [
    read(4, 'Many people think it was the price that made the new phone fail. In fact, what customers complained about most was the battery. It was only after the company replaced the battery that sales began to rise again. What the company learned is that price matters less than reliability.', 'According to the text, what was the main problem with the phone?', [
      ['The battery', true],
      ['The price', 'Teks menyebut banyak orang MENGIRA harganya, tetapi "In fact" menunjukkan sebaliknya.'],
      ['The camera', 'Tidak disebut.'],
      ['The design', 'Tidak disebut.'],
    ], 'Cleft "what customers complained about most was the battery" menonjolkan masalah utamanya.'),
    construct(4, 'that / it / in 2010 / was / moved / we / to Bogor', ['It was in 2010 that we moved to Bogor', 'It was to Bogor that we moved in 2010'], 'It + was + bagian yang ditekankan + that + sisa kalimat.', undefined, { focus: 'cleft-it' }),
    fix(4, 'What she did was called her lawyer.', ['What she did was call her lawyer', 'What she did was to call her lawyer'], 'Setelah "What ... did was", bentuk dasar atau to + bentuk dasar.', undefined, { focus: 'cleft-verb' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang paling tepat untuk mengoreksi: "Bukan Budi yang memecahkan jendela, tetapi Joko."', null, [
      ["It wasn't Budi who broke the window; it was Joko.", true],
      ["It weren't Budi who broke the window; it were Joko.", 'It + was/wasn\'t (tunggal).', 'cleft-it'],
      ["It wasn't Budi which broke the window; it was Joko.", 'Untuk orang pakai who.', 'cleft-it'],
      ["What broke the window wasn't Budi; it was Joko.", '"What" untuk benda atau hal, bukan orang. Untuk orang pakai It was ... who.', 'cleft-what'],
    ], 'It-cleft untuk mengoreksi siapa pelakunya.', { focus: 'cleft-it' }),
    fill(4, '___ I like most about this city is the food.', ['What', 'The thing'], 'What-cleft: What I like most ... is ...', {
      that: ['Cleft yang diawali klausa memakai "What".', 'cleft-what'],
      which: ['Di awal kalimat cleft dipakai "What".', 'cleft-what'],
      it: ['"It" dipakai pada it-cleft (It is the food that ...), bukan di sini.', 'cleft-what'],
    }, { focus: 'cleft-what' }),
    tr(5, 'Kemacetanlah yang membuat kami terlambat.', ['It was the traffic that made us late', 'It was the traffic jam that made us late', 'It was the traffic jams that made us late', 'It was the traffic which made us late', 'It was the traffic jam which made us late', 'It was the heavy traffic that made us late'], 'It + was + fokus + that + sisa kalimat.', {
      'it were the traffic that made us late': ['"It" diikuti was.', 'cleft-it'],
      'the traffic it was that made us late': ['Urutannya: It was + fokus + that ...', 'cleft-it'],
    }, { focus: 'cleft-it' }),
    spot(4, 'It were my brothers who fixed the roof.', 'were', 'was', '"It" selalu diikuti is/was tunggal.', { focus: 'cleft-it' }),
    fix(5, 'The reason why I called you it is that I need your help.', ['The reason why I called you is that I need your help', 'The reason I called you is that I need your help', 'The reason why I called you is because I need your help', 'The reason I called you is because I need your help'], 'Tidak ada "it" tambahan sebelum is.', undefined, { focus: 'cleft-what' }),
  ],
});

export const hedging = lesson({
  id: 'c1-hedging',
  title: 'Hedging',
  summary: 'Menyesuaikan kekuatan klaim dengan bukti dalam tulisan akademik dan profesional.',
  topic: 'c1.hedging',
  objectives: [
    'Melunakkan klaim dengan modal (may, might, could) dan kata kerja (suggest, indicate, appear, seem, tend).',
    'Memakai bentuk yang benar: seem/appear/tend to + bentuk dasar; be likely to; it is likely that.',
    'Menghindari klaim berlebihan (prove, always, definitely) dan hedging yang berlebihan.',
  ],
  intro: 'Dalam tulisan akademik dan laporan kerja, kekuatan klaim harus sesuai dengan bukti. Penulis yang menulis "This proves that ..." berdasarkan survei kecil dianggap tidak cermat. Penutur bahasa Inggris memakai hedging untuk melunakkan klaim, tanpa membuatnya kabur.',
  teaching: [
    {
      heading: 'Alat hedging',
      table: [
        ['Jenis', 'Contoh'],
        ['modal', 'The results may indicate a link.'],
        ['kata kerja', 'The data suggest ... / appear to show ... / seem to confirm ...'],
        ['kata sifat dan keterangan', 'It is likely that ...; possibly; probably'],
        ['pembatas', 'to some extent; in most cases; generally'],
      ],
      body: 'Pilih satu atau dua alat yang sesuai dengan kekuatan bukti.',
    },
    {
      heading: 'Bentuk yang benar',
      body: 'seem / appear / tend + to + bentuk dasar ("seems to be", "appears to have improved"). "X is likely to + bentuk dasar" atau "It is likely that + klausa".',
      examples: [
        { en: 'Prices seem to be rising.', id: 'Harga tampaknya sedang naik.' },
        { en: 'The new method appears to have improved results.', id: 'Metode baru tampaknya telah memperbaiki hasil.' },
        { en: 'It is likely that the meeting will be postponed.', id: 'Kemungkinan besar rapatnya akan ditunda.' },
      ],
    },
    {
      heading: 'Jangan berlebihan, jangan terlalu banyak',
      body: '"prove", "always", "all", dan "definitely" terlalu kuat untuk satu penelitian kecil. Sebaliknya, terlalu banyak hedging ("It might possibly perhaps suggest ...") membuat tulisan lemah dan sulit dipercaya.',
    },
  ],
  demo: [
    ['The data suggest that sleep affects memory.', 'The data prove that sleep affects memory.', 'Satu penelitian jarang "membuktikan". "suggest" lebih tepat untuk bukti terbatas.'],
    ['Prices seem to be rising.', 'Prices seem rising.', 'seem + to + bentuk dasar: seem to be rising.'],
    ['Students are likely to benefit from the programme.', 'Students are likely benefit from the programme.', 'be likely + to + bentuk dasar.'],
  ],
  vocab: ['indicate', 'tend', 'likely'],
  guided: [
    mc(3, 'Pilih kalimat yang paling tepat untuk laporan penelitian dengan 40 responden.', null, [
      ['The results suggest that online classes may reduce student stress.', true],
      ['The results prove that online classes always reduce student stress.', '"prove" dan "always" terlalu kuat untuk 40 responden.', 'overclaim'],
      ['The results definitely show that online classes reduce all student stress.', '"definitely" dan "all" melebihi bukti yang ada.', 'overclaim'],
      ['The results might possibly perhaps suggest that online classes could reduce stress.', 'Terlalu banyak hedging membuat klaimnya kabur.', 'over-hedge'],
    ], 'Satu atau dua hedge (suggest, may) sesuai untuk bukti terbatas.', { focus: 'overclaim' }),
    fill(3, 'Younger customers tend ___ shop online more often.', ['to'], 'tend + to + bentuk dasar.', {
      for: ['Polanya tend + to + bentuk dasar.', 'hedge-form'],
      'to be': ['Cukup "tend to shop", tanpa "be".', 'hedge-form'],
    }, { focus: 'hedge-form' }),
    match(3, 'Pasangkan klaim yang terlalu kuat dengan versi yang lebih hati-hati.', [
      ['This proves the theory.', 'This supports the theory.'],
      ['All teenagers use TikTok.', 'Most teenagers appear to use TikTok.'],
      ['The policy will fail.', 'The policy is likely to fail.'],
      ['Coffee causes insomnia.', 'Coffee may contribute to insomnia.'],
    ], 'Ganti kata yang terlalu kuat dengan hedge yang sesuai.', { focus: 'overclaim' }),
    tf(3, 'Kalimat "The new drug seems reducing pain." sudah benar.', false, 'seem + to + bentuk dasar: "The new drug seems to reduce pain."', 'Setelah seem dan appear dipakai to + bentuk dasar.', { focus: 'hedge-form', tag: 'hedge-form' }),
  ],
  independent: [
    construct(4, 'likely / prices / are / rise / to / next year', ['Prices are likely to rise next year', 'Next year prices are likely to rise'], 'Subjek + be likely + to + bentuk dasar.', {
      'prices are likely rise next year': ['be likely + TO + bentuk dasar.', 'hedge-form'],
    }, { focus: 'hedge-form' }),
    fill(4, 'It is ___ that the number of tourists will increase after the new airport opens.', ['likely', 'probable'], 'It is likely that + klausa.', {
      'likely to': ['Dengan "It is ... that", cukup "likely".', 'hedge-form'],
      definitely: ['"definitely" bukan kata sifat dan terlalu kuat untuk perkiraan.', 'overclaim'],
      sure: ['"sure" terlalu kuat untuk perkiraan semacam ini.', 'overclaim'],
    }, { focus: 'hedge-form' }),
    spot(4, 'This small survey proves that most students prefer morning classes.', 'proves', 'suggests', 'Survei kecil tidak membuktikan; "suggests" lebih sesuai dengan buktinya.', { focus: 'overclaim' }),
    dlg(4, 'Lengkapi percakapan rapat berikut.', 'A: So, will the new app increase sales?\nB: ___', [
      ["It's too early to say, but the first figures suggest it might.", true],
      ['Yes, it will definitely double our sales.', 'Terlalu yakin tanpa data yang cukup.', 'overclaim'],
      ['The first figures seem show an increase.', 'seem + to + bentuk dasar: seem to show.', 'hedge-form'],
      ['It might possibly perhaps maybe increase sales.', 'Terlalu banyak hedging; satu atau dua sudah cukup.', 'over-hedge'],
    ], 'Klaim yang hati-hati dan didukung data awal.', { focus: 'overclaim' }),
  ],
  homework: [
    read(5, 'A recent study of 120 office workers in Surabaya found that those who took a short walk after lunch reported higher energy levels in the afternoon. The researchers note, however, that the participants recorded their own energy levels, and that the study lasted only four weeks. They conclude that walking breaks may improve afternoon productivity, but that larger studies are needed.', "Which statement best reflects the researchers' conclusion?", [
      ['Walking breaks may help, but more research is needed.', true],
      ['Walking breaks definitely improve productivity.', 'Peneliti memakai "may" dan meminta penelitian yang lebih besar.', 'overclaim'],
      ['Walking breaks have no effect.', 'Ada temuan positif, walaupun terbatas.'],
      ['The study proves that all office workers should walk.', 'Kesimpulannya jauh lebih hati-hati.', 'overclaim'],
    ], '"walking breaks may improve afternoon productivity, but ... larger studies are needed."'),
    fix(4, 'The results appear show a strong link.', ['The results appear to show a strong link'], 'appear + to + bentuk dasar.', undefined, { focus: 'hedge-form' }),
    construct(4, 'seems / the economy / to / recovering / be', ['The economy seems to be recovering'], 'Subjek + seems + to be + -ing.', undefined, { focus: 'hedge-form' }),
  ],
  mastery: [
    mc(4, 'Pilih versi yang paling tepat untuk abstrak ilmiah.', null, [
      ['These findings indicate that the policy may have reduced traffic accidents.', true],
      ['These findings prove the policy reduced traffic accidents everywhere.', '"prove" dan "everywhere" melebihi bukti.', 'overclaim'],
      ['These findings indicate the policy may reduced traffic accidents.', 'may + have + bentuk ketiga: may have reduced.', 'hedge-form'],
      ['These findings could perhaps possibly indicate a slight reduction maybe.', 'Terlalu banyak hedging.', 'over-hedge'],
    ], 'indicate + may have + bentuk ketiga: hati-hati tetapi jelas.', { focus: 'overclaim' }),
    fill(4, 'The new teaching method appears ___ improved reading scores. (have)', ['to have'], 'appear + to have + bentuk ketiga untuk hasil yang sudah terjadi.', {
      have: ['Setelah appear, pakai "to": appears to have improved.', 'hedge-form'],
      'to has': ['Setelah "to", bentuk dasar: to have.', 'hedge-form'],
      having: ['appear + to + bentuk dasar.', 'hedge-form'],
    }, { focus: 'hedge-form', prompt: 'Lengkapi dengan bentuk yang tepat dari kata dalam kurung.' }),
    tr(5, 'Mahasiswa cenderung belajar pada malam hari.', ['Students tend to study at night', 'University students tend to study at night', 'College students tend to study at night', 'Students tend to study in the evening'], 'tend + to + bentuk dasar.', {
      'students tend study at night': ['tend + to + bentuk dasar.', 'hedge-form'],
      'students are tend to study at night': ['"tend" adalah kata kerja, jadi tanpa "are".', 'hedge-form'],
      'students tend to studying at night': ['Setelah "to", bentuk dasar: study.', 'hedge-form'],
    }, { focus: 'hedge-form' }),
    spot(4, 'It is likely to the meeting will be postponed.', 'to', 'that', '"It is likely" + that + klausa. Bentuk "likely to" dipakai dengan subjek: The meeting is likely to be postponed.', { focus: 'hedge-form' }),
    construct(5, 'appears / the problem / have / to / been / solved', ['The problem appears to have been solved'], 'Subjek + appears + to have been + bentuk ketiga.', undefined, { focus: 'hedge-form' }),
  ],
});

export const nominalisation = lesson({
  id: 'c1-nominalisation',
  title: 'Nominalisation',
  summary: 'Memadatkan gagasan dengan kata benda untuk gaya akademik dan formal.',
  topic: 'c1.nominalisation',
  objectives: [
    'Mengubah kata kerja dan kata sifat menjadi kata benda (decide → decision, grow → growth).',
    'Mengubah klausa menjadi frasa kata benda, termasuk keterangan (-ly) menjadi kata sifat.',
    'Memakai preposisi pasangan: increase in, impact on, demand for, cause of.',
  ],
  intro: 'Tulisan akademik dan laporan resmi memadatkan informasi dengan kata benda. "Harga naik dengan cepat, sehingga permintaan turun" menjadi "The rapid increase in prices led to a decline in demand." Kalimatnya lebih padat dan lebih formal, tetapi tiga hal harus tepat: bentuk kata bendanya, kata sifatnya, dan preposisinya.',
  teaching: [
    {
      heading: 'Kata kerja dan sifat menjadi kata benda',
      table: [
        ['Kata kerja / sifat', 'Kata benda'],
        ['decide', 'decision'],
        ['grow', 'growth'],
        ['fail', 'failure'],
        ['analyse', 'analysis'],
        ['arrive', 'arrival'],
        ['important', 'importance'],
        ['able', 'ability'],
      ],
      body: 'Akhirannya tidak selalu sama; periksa kamus bila ragu.',
    },
    {
      heading: 'Dari klausa ke frasa',
      body: 'Keterangan (-ly) berubah menjadi kata sifat, dan pelaku memakai \'s atau "of".',
      examples: [
        { en: 'Prices increased rapidly. → the rapid increase in prices', id: 'Harga naik dengan cepat. → kenaikan harga yang cepat' },
        { en: "The government decided to raise taxes. → the government's decision to raise taxes", id: 'Pemerintah memutuskan menaikkan pajak. → keputusan pemerintah untuk menaikkan pajak' },
      ],
    },
    {
      heading: 'Preposisi pasangan',
      body: 'Hafalkan kata benda bersama preposisinya; terjemahan "dari" atau "terhadap" tidak selalu cocok.',
      table: [
        ['Kata benda', 'Preposisi', 'Contoh'],
        ['increase / decrease / decline / rise', 'in', 'an increase in sales'],
        ['effect / impact / influence', 'on', 'the impact of social media on teenagers'],
        ['demand / need / reason', 'for', 'the demand for electric cars'],
        ['cause / analysis / completion', 'of', 'the cause of the flood'],
      ],
    },
  ],
  demo: [
    ['The rapid growth of the city caused problems.', 'The rapidly growth of the city caused problems.', 'Di depan kata benda pakai kata sifat: rapid growth.'],
    ['There was a sharp increase in prices.', 'There was a sharp increase of prices.', '"increase" untuk hal yang naik berpasangan dengan "in".'],
    ['The analysis of the data took months.', 'The analyse of the data took months.', 'Kata bendanya "analysis"; "analyse" adalah kata kerja.'],
  ],
  vocab: ['decline', 'impact', 'demand'],
  guided: [
    match(3, 'Pasangkan kata kerja dengan kata bendanya.', [
      ['decide', 'decision'],
      ['grow', 'growth'],
      ['fail', 'failure'],
      ['arrive', 'arrival'],
    ], 'Akhiran kata benda berbeda-beda: -sion, -th, -ure, -al.', { focus: 'noun-form' }),
    mc(3, 'Pilih frasa kata benda yang tepat.', 'Sales dropped sharply. → There was a ___.', [
      ['sharp drop in sales', true],
      ['sharply drop in sales', 'Di depan kata benda pakai kata sifat: sharp.', 'nominal-adjective'],
      ['sharp drop of sales', 'Untuk hal yang naik atau turun pakai "in": drop in sales.', 'nominal-preposition'],
      ['sharp dropping sales', 'Kata bendanya "drop", diikuti "in".', 'noun-form'],
    ], 'Kata sifat + kata benda + in.', { focus: 'nominal-adjective' }),
    fill(3, 'Social media has a strong impact ___ young people.', ['on'], 'impact + on.', {
      to: ['"impact" berpasangan dengan "on".', 'nominal-preposition'],
      for: ['"impact" berpasangan dengan "on".', 'nominal-preposition'],
      in: ['"impact" berpasangan dengan "on".', 'nominal-preposition'],
    }, { focus: 'nominal-preposition' }),
    tf(3, '"The analyse of the results" adalah frasa kata benda yang benar.', false, 'Kata bendanya "analysis": the analysis of the results.', '"analyse" adalah kata kerja, bukan kata benda.', { focus: 'noun-form', tag: 'noun-form' }),
  ],
  independent: [
    fill(4, 'The ___ of the new bridge has reduced travel time. (complete)', ['completion'], 'complete → completion.', {
      complete: ['Setelah "The" diperlukan kata benda: completion.', 'noun-form'],
      completing: ['Dalam gaya akademik, pakai kata benda: completion.', 'noun-form'],
      completement: ['Kata bendanya "completion".', 'noun-form'],
    }, { focus: 'noun-form', prompt: 'Tulis bentuk kata benda dari kata dalam kurung.' }),
    construct(4, 'in / a / increase / significant / there / unemployment / was', ['There was a significant increase in unemployment'], 'There was + a + kata sifat + kata benda + in + ...', undefined, { focus: 'nominal-preposition' }),
    spot(4, 'The government announced a reduce in fuel prices.', 'reduce', 'reduction', 'Setelah "a" diperlukan kata benda: reduction.', { focus: 'noun-form' }),
    tr(5, 'Permintaan akan mobil listrik meningkat.', ['The demand for electric cars is increasing', 'Demand for electric cars is increasing', 'The demand for electric cars is rising', 'Demand for electric cars is rising', 'The demand for electric cars has increased', 'Demand for electric cars has increased', 'The demand for electric cars is growing', 'Demand for electric cars is growing', 'The demand for electric cars has risen', 'Demand for electric cars has risen'], 'demand + for.', {
      'the demand of electric cars is increasing': ['"demand" berpasangan dengan "for".', 'nominal-preposition'],
      'the demand to electric cars is increasing': ['"demand" berpasangan dengan "for".', 'nominal-preposition'],
    }, { focus: 'nominal-preposition' }),
  ],
  homework: [
    read(5, 'The report explains that the decline in tourist numbers last year was mainly caused by the closure of the airport for repairs. Its authors argue that the reopening of the airport, together with the introduction of cheaper flights, should lead to a gradual recovery of the industry.', 'According to the report, what mainly caused the decline in tourists?', [
      ['The airport was closed for repairs.', true],
      ['Flights became cheaper.', 'Penerbangan murah disebut sebagai faktor pemulihan, bukan penyebab penurunan.'],
      ['The industry recovered.', 'Pemulihan adalah perkiraan ke depan.'],
      ['The airport reopened.', 'Pembukaan kembali adalah faktor pemulihan.'],
    ], '"the decline ... was mainly caused by the closure of the airport for repairs"'),
    fix(4, 'The rapidly development of technology has changed education.', ['The rapid development of technology has changed education'], 'Di depan kata benda pakai kata sifat: rapid development.', undefined, { focus: 'nominal-adjective' }),
    fill(4, 'There is a growing need ___ qualified nurses in rural areas.', ['for'], 'need (kata benda) + for.', {
      of: ['"need" (kata benda) berpasangan dengan "for".', 'nominal-preposition'],
      to: ['"a need for" + kata benda.', 'nominal-preposition'],
    }, { focus: 'nominal-preposition' }),
  ],
  mastery: [
    mc(4, 'Pilih versi yang paling ringkas dan akademik dari: "Because the company failed to respond quickly, customers lost trust."', null, [
      ["The company's failure to respond quickly led to a loss of customer trust.", true],
      ["The company's fail to respond quickly led to a loss of customer trust.", 'Kata bendanya "failure".', 'noun-form'],
      ["The company's failure to respond quickly led to a lose of customer trust.", 'Kata benda dari "lose" adalah "loss".', 'noun-form'],
      ["The company's failure of responding quickly led to a loss of customer trust.", 'Polanya "failure to + bentuk dasar".', 'nominal-preposition'],
    ], 'failure to + bentuk dasar; loss of ...', { focus: 'noun-form' }),
    fill(4, 'The ___ of the new policy surprised many economists. (introduce)', ['introduction'], 'introduce → introduction.', {
      introduce: ['Setelah "The" diperlukan kata benda: introduction.', 'noun-form'],
      introducing: ['Dalam gaya akademik, pakai kata benda: introduction.', 'noun-form'],
      introducement: ['Kata bendanya "introduction".', 'noun-form'],
    }, { focus: 'noun-form', prompt: 'Tulis bentuk kata benda dari kata dalam kurung.' }),
    tr(5, 'Dampak media sosial terhadap remaja sangat besar.', ['The impact of social media on teenagers is huge', 'The impact of social media on teenagers is very big', 'The impact of social media on teenagers is enormous', 'The impact of social media on teenagers is significant', 'The impact of social media on teenagers is very large', 'The impact of social media on teenagers is very significant', 'The impact of social media on young people is huge', 'The impact of social media on young people is significant', 'Social media has a huge impact on teenagers', 'Social media has a significant impact on teenagers'], 'impact of X on Y.', {
      'the impact of social media to teenagers is huge': ['"impact" berpasangan dengan "on".', 'nominal-preposition'],
      'the impact of social media for teenagers is huge': ['"impact" berpasangan dengan "on".', 'nominal-preposition'],
    }, { focus: 'nominal-preposition' }),
    spot(4, 'There has been a sharp decline of student numbers.', 'of', 'in', 'decline + in.', { focus: 'nominal-preposition' }),
    construct(5, 'the / of / arrival / the guests / delayed / heavy rain / was / by', ['The arrival of the guests was delayed by heavy rain'], 'Frasa kata benda (the arrival of the guests) sebagai subjek.', undefined, { focus: 'noun-form' }),
  ],
});

export const discourseMarkers = lesson({
  id: 'c1-discourse',
  title: 'Discourse Markers',
  summary: 'Menghubungkan gagasan dengan however, moreover, therefore, although, dan despite.',
  topic: 'c1.discourse',
  objectives: [
    'Memilih penghubung menurut fungsinya: kontras, tambahan, akibat, contoh.',
    'Memakai tanda baca yang tepat di sekitar however dan therefore.',
    'Membedakan although (+ klausa) dari despite / in spite of (+ kata benda atau -ing), dan tidak memakai although bersama but.',
  ],
  intro: 'Penghubung membuat argumen mudah diikuti. Tiga kesalahan khas penutur bahasa Indonesia: "however" dipakai seperti "but" dengan koma saja; "despite" diikuti klausa lengkap ("Despite it was raining"); dan "walaupun ... tetapi" diterjemahkan menjadi "Although ..., but ...".',
  teaching: [
    {
      heading: 'Fungsi',
      table: [
        ['Fungsi', 'Penghubung'],
        ['kontras', 'however, nevertheless, whereas, although, despite, on the other hand'],
        ['tambahan', 'moreover, furthermore, in addition'],
        ['akibat', 'therefore, consequently, as a result'],
        ['contoh', 'for instance, for example'],
      ],
      body: '"whereas" dan "while" membandingkan dua hal dalam satu kalimat.',
    },
    {
      heading: 'Tanda baca: however',
      body: '"However", "therefore", dan "moreover" menghubungkan dua kalimat, bukan dua klausa dengan koma. Pakai titik atau titik koma sebelumnya, dan koma sesudahnya.',
      examples: [
        { en: 'The hotel was cheap. However, it was very noisy.', id: 'Hotelnya murah. Namun, sangat bising.' },
        { en: 'The hotel was cheap; however, it was very noisy.', id: 'Hotelnya murah; namun, sangat bising.', note: '"The hotel was cheap, however it was noisy" adalah kesalahan tanda baca.' },
      ],
    },
    {
      heading: 'Although atau despite?',
      table: [
        ['Penghubung', 'Diikuti', 'Contoh'],
        ['although / even though', 'klausa (subjek + kata kerja)', 'Although it was raining, we went out.'],
        ['despite / in spite of', 'kata benda atau -ing', 'Despite the rain, we went out. / Despite feeling tired, she finished.'],
      ],
      body: 'Tidak ada "despite of". Jangan memakai "although" dan "but" dalam satu kalimat; pilih salah satu.',
    },
  ],
  demo: [
    ['The flat is small. However, it is in a great location.', 'The flat is small, however it is in a great location.', '"However" menghubungkan dua kalimat: pakai titik atau titik koma sebelumnya.'],
    ['Despite the heavy rain, the concert continued.', 'Despite it rained heavily, the concert continued.', '"Despite" diikuti kata benda atau -ing, bukan klausa.'],
    ['Although he was tired, he kept working.', 'Although he was tired, but he kept working.', 'Jangan memakai "although" dan "but" bersamaan.'],
  ],
  vocab: ['whereas', 'furthermore', 'consequently'],
  guided: [
    mc(3, 'Pilih penghubung yang tepat.', 'The project was well planned. ___, it failed because of a lack of funding.', [
      ['However', true],
      ['Therefore', '"Therefore" menyatakan akibat, padahal kalimat kedua berlawanan dengan yang pertama.', 'marker-meaning'],
      ['Moreover', '"Moreover" menambah informasi yang searah, bukan berlawanan.', 'marker-meaning'],
      ['Despite', '"Despite" diikuti kata benda, bukan koma dan klausa.', 'despite-although'],
    ], 'Kontras antara dua kalimat → However.', { focus: 'marker-meaning' }),
    fill(3, '___ the traffic, we arrived on time.', ['Despite', 'In spite of'], 'Despite / In spite of + kata benda.', {
      although: ['"Although" diikuti klausa (subjek + kata kerja), bukan kata benda saja.', 'despite-although'],
      'despite of': ['Tidak ada "despite of".', 'despite-although'],
      however: ['"However" tidak langsung diikuti kata benda seperti ini.', 'marker-meaning'],
    }, { focus: 'despite-although' }),
    match(3, 'Pasangkan penghubung dengan fungsinya.', [
      ['therefore', 'akibat'],
      ['moreover', 'tambahan'],
      ['nevertheless', 'kontras'],
      ['for instance', 'contoh'],
    ], 'Kenali fungsi setiap penghubung sebelum memakainya.', { focus: 'marker-meaning' }),
    tf(3, 'Kalimat "Despite it was late, she called me." sudah benar.', false, '"Despite" tidak diikuti klausa: "Although it was late, she called me." atau "Despite the late hour, she called me."', '"Despite" diikuti kata benda atau bentuk -ing.', { focus: 'despite-although', tag: 'despite-although' }),
  ],
  independent: [
    fill(4, 'My sister loves spicy food, ___ I prefer sweet dishes.', ['whereas', 'while'], 'Membandingkan dua hal yang berlawanan dalam satu kalimat → whereas / while.', {
      however: ['"however" tidak menghubungkan dua klausa dengan koma saja.', 'however-punctuation'],
      despite: ['"despite" tidak diikuti klausa.', 'despite-although'],
      therefore: ['Kalimat ini kontras, bukan akibat.', 'marker-meaning'],
    }, { focus: 'marker-meaning' }),
    construct(4, 'although / the exam / difficult / was / passed / everyone', ['Although the exam was difficult, everyone passed', 'Everyone passed although the exam was difficult'], 'Although + klausa, + klausa utama.', {
      'although the exam was difficult but everyone passed': ['Jangan memakai "although" dan "but" bersamaan.', 'despite-although'],
    }, { focus: 'despite-although' }),
    fix(4, 'Despite of the delay, the flight landed safely.', ['Despite the delay, the flight landed safely', 'In spite of the delay, the flight landed safely'], 'Tidak ada "despite of": Despite the delay / In spite of the delay.', undefined, { focus: 'despite-although' }),
    dlg(4, 'Pilih kalimat penutup terbaik untuk paragraf ini.', 'The new bus lanes have reduced travel times by 20%. Fewer people are driving into the city centre, and air quality has improved. ___', [
      ['Therefore, the scheme should be extended to other cities.', true],
      ['However, the scheme should be extended to other cities.', '"However" menandakan kontras, padahal kesimpulannya searah dengan bukti.', 'marker-meaning'],
      ['For instance, the scheme should be extended to other cities.', '"For instance" memperkenalkan contoh, bukan kesimpulan.', 'marker-meaning'],
      ['Despite, the scheme should be extended to other cities.', '"Despite" butuh kata benda sesudahnya.', 'despite-although'],
    ], 'Kesimpulan dari bukti yang searah → Therefore.', { focus: 'marker-meaning' }),
  ],
  homework: [
    read(5, 'Working from home has clear advantages. Employees save time and money on commuting; moreover, many report better concentration. Nevertheless, the arrangement is not suitable for everyone. Young employees, for instance, may miss the informal learning that happens in an office. Consequently, many companies are now choosing a hybrid model.', 'Why are many companies choosing a hybrid model?', [
      ['Working from home has benefits but does not suit everyone.', true],
      ['Working from home has no advantages.', 'Teks justru menyebut keuntungan yang jelas.'],
      ['Young employees prefer working from home.', 'Teks menyebut mereka mungkin kehilangan pembelajaran informal di kantor.'],
      ['Commuting has become cheaper.', 'Tidak disebut.'],
    ], '"Nevertheless ..." lalu "Consequently ..." menunjukkan bahwa model hibrida adalah akibat dari keuntungan dan keterbatasan itu.'),
    mc(4, 'Pilih penulisan yang benar.', null, [
      ['The hotel was expensive. However, the service was excellent.', true],
      ['The hotel was expensive, however the service was excellent.', 'Koma saja tidak cukup untuk menghubungkan dua kalimat dengan "however".', 'however-punctuation'],
      ['The hotel was expensive however, the service was excellent.', 'Sebelum "however" perlu titik atau titik koma.', 'however-punctuation'],
      ['The hotel was expensive. However the service, was excellent.', 'Koma diletakkan setelah "However", bukan di tengah klausa.', 'however-punctuation'],
    ], 'Titik (atau titik koma) sebelum "However", koma sesudahnya.', { focus: 'however-punctuation' }),
    construct(4, 'consequently / the factory / closed / lost / hundreds of workers / their jobs', ['The factory closed. Consequently, hundreds of workers lost their jobs', 'The factory closed and consequently hundreds of workers lost their jobs'], 'Sebab, lalu "Consequently" + akibat.', undefined, { focus: 'marker-meaning' }),
  ],
  mastery: [
    mc(4, 'Pilih kalimat yang benar.', null, [
      ['In spite of feeling ill, Maya gave her presentation.', true],
      ['In spite of she felt ill, Maya gave her presentation.', '"In spite of" diikuti kata benda atau -ing, bukan klausa.', 'despite-although'],
      ['Although feeling ill, but Maya gave her presentation.', 'Jangan memakai "although" dan "but" bersamaan.', 'despite-although'],
      ['Despite of feeling ill, Maya gave her presentation.', 'Tidak ada "despite of".', 'despite-although'],
    ], 'In spite of + -ing.', { focus: 'despite-although' }),
    fill(4, 'Public transport in the city is cheap and reliable. ___, many people still prefer to drive.', ['Nevertheless', 'However', 'Even so', 'Still'], 'Kontras antara dua kalimat → Nevertheless / However.', {
      therefore: ['Kalimat kedua berlawanan dengan yang pertama, bukan akibatnya.', 'marker-meaning'],
      moreover: ['"Moreover" menambah informasi yang searah.', 'marker-meaning'],
      despite: ['"Despite" diikuti kata benda.', 'despite-although'],
    }, { focus: 'marker-meaning' }),
    tr(5, 'Walaupun hujan deras, pertandingan tetap dilanjutkan.', ['Although it was raining heavily, the match continued', 'Although it rained heavily, the match continued', 'Despite the heavy rain, the match continued', 'In spite of the heavy rain, the match continued', 'Although it was raining heavily, the match went on', 'Despite the heavy rain, the match went on', 'Even though it was raining heavily, the match continued', 'Although there was heavy rain, the match continued', 'Even though it rained heavily, the match continued', 'In spite of the heavy rain, the match went on'], 'Although + klausa, atau Despite / In spite of + kata benda.', {
      'although it was raining heavily but the match continued': ['Jangan memakai "although" dan "but" bersamaan.', 'despite-although'],
      'despite it was raining heavily the match continued': ['"Despite" tidak diikuti klausa.', 'despite-although'],
    }, { focus: 'despite-although' }),
    fix(4, 'Although the price was high, but we bought the house.', ['Although the price was high, we bought the house', 'The price was high, but we bought the house'], 'Pilih salah satu: although ATAU but.', undefined, { focus: 'despite-although' }),
    construct(5, 'whereas / the north / is / the south / dry / is / wet', ['The north is dry, whereas the south is wet', 'The south is wet, whereas the north is dry', 'Whereas the north is dry, the south is wet', 'Whereas the south is wet, the north is dry'], 'Dua klausa yang dibandingkan dengan whereas.', undefined, { focus: 'marker-meaning' }),
  ],
});
