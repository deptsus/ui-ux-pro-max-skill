// Jalur Khusus (Rilis 11) · Bahasa Inggris untuk Kerja — wawancara, email, rapat.
// The first lesson is free; the rest are Premium (set in content/index.ts).
import { arrange, construct, dlg, fill, fix, lesson, match, mc, read, spot, tf, tr } from './dsl';

export const workInterview = lesson({
  id: 'work-interview-intro',
  title: 'Wawancara Kerja: Memperkenalkan Diri',
  summary: 'Menjawab "Tell me about yourself" dengan rapi: sekarang, pengalaman, lalu alasan melamar.',
  topic: 'work.interview-intro',
  objectives: [
    'Menyusun jawaban "Tell me about yourself" dalam tiga bagian: sekarang, pengalaman, dan alasan melamar.',
    'Memakai "I work as" dan "I have worked ... for/since" tanpa "I am work".',
    'Memakai ungkapan yang tepat: responsible for, interested in, graduated from.',
  ],
  intro: 'Pertanyaan pertama hampir di setiap wawancara kerja berbahasa Inggris adalah "Can you tell me about yourself?" Pewawancara tidak meminta riwayat hidup lengkap. Mereka ingin mendengar siapa kamu sekarang, pengalaman apa yang relevan, dan mengapa kamu cocok untuk posisi ini, dalam satu sampai dua menit.',
  teaching: [
    {
      heading: 'Tiga bagian jawaban',
      body: 'Mulai dari sekarang (pekerjaan atau studi saat ini), lanjut ke pengalaman yang relevan, lalu tutup dengan alasan kamu melamar. Urutan ini membuat jawabanmu jelas dan mudah diikuti.',
      table: [
        ['Bagian', 'Contoh'],
        ['Sekarang', 'I work as a customer service officer at a bank in Bandung.'],
        ['Pengalaman', "I have worked in customer service for three years, and I've handled more than fifty calls a day."],
        ['Alasan', "I'm interested in this position because I want to grow in a larger company."],
      ],
    },
    {
      heading: 'Bekerja sebagai: work as, bukan am work',
      body: 'Untuk pekerjaan sekarang, pakai simple present: "I work as ..." atau "I am a ...". Jangan menggabungkan am dan work. Untuk lamanya pengalaman sampai sekarang, pakai present perfect dengan for (lamanya) atau since (titik awal).',
      examples: [
        { en: 'I work as a graphic designer.', id: 'Saya bekerja sebagai desainer grafis.', note: 'Bukan "I am work as a graphic designer."' },
        { en: 'I have worked here since 2022.', id: 'Saya sudah bekerja di sini sejak 2022.' },
        { en: 'I graduated from Universitas Padjadjaran in 2021.', id: 'Saya lulus dari Universitas Padjadjaran pada 2021.', note: 'graduated from, bukan graduated in + nama kampus.' },
      ],
    },
    {
      heading: 'Pasangan kata yang sering salah',
      body: 'Beberapa kata selalu berpasangan dengan preposisi tertentu. Hafalkan sebagai satu kesatuan.',
      table: [
        ['Benar', 'Salah yang sering muncul'],
        ['responsible for', 'responsible to / responsible about'],
        ['interested in', 'interested on / interested with'],
        ['experience in sales', 'experience on sales'],
        ['good at communicating', 'good in communicate'],
      ],
    },
  ],
  demo: [
    ['I work as an accountant at a small company.', 'I am work as an accountant at a small company.', 'Simple present cukup "I work"; am dan work tidak dipakai bersama.'],
    ['I have worked in marketing for four years.', 'I am working in marketing for four years.', 'Lamanya sesuatu sampai sekarang memakai present perfect, bukan present continuous.'],
    ["I'm interested in this position because I enjoy working with data.", "I'm interested on this position because I enjoy working with data.", 'interested selalu berpasangan dengan in.'],
  ],
  guided: [
    mc(1, 'Pilih kalimat pembuka yang paling tepat untuk "Tell me about yourself".', null, [
      ['I work as a sales executive at a property company in Surabaya.', true],
      ['I am work as a sales executive at a property company in Surabaya.', 'am dan work tidak dipakai bersama; cukup "I work as".'],
      ['I working as a sales executive at a property company in Surabaya.', 'Kata kerja tanpa am/is/are tidak boleh berakhiran -ing di sini; pakai "I work".'],
    ], 'Pekerjaan saat ini memakai simple present: "I work as + pekerjaan".'),
    fill(1, 'I am responsible ___ training new staff.', ['for'], '"Responsible for" berarti bertanggung jawab atas sesuatu.', { to: ['responsible selalu berpasangan dengan for, bukan to.'] }),
    mc(2, 'Pilih kata yang tepat.', 'I have worked in customer service ___ 2020.', [
      ['since', true],
      ['for', 'for diikuti lamanya waktu (three years), bukan tahun mulai.'],
      ['from', 'Dalam present perfect, titik awal memakai since.'],
    ], '2020 adalah titik awal, jadi memakai since.'),
    match(1, 'Pasangkan bagian jawaban dengan contohnya.', [
      ['Sekarang', 'I study accounting at a polytechnic in Malang.'],
      ['Pengalaman', 'I have done two internships in auditing.'],
      ['Alasan melamar', 'I want to start my career in a public accounting firm.'],
    ], 'Jawaban yang baik bergerak dari sekarang, ke pengalaman, lalu ke alasan melamar.'),
  ],
  independent: [
    fix(2, 'I am work as a nurse at a private hospital.', ['I work as a nurse at a private hospital.'], 'Pakai simple present: "I work as ...".', { 'I am work as a nurse at a private hospital.': ['Masih ada "am" sebelum work.'] }),
    construct(2, 'I / work / in logistics / for / five years (present perfect)', ['I have worked in logistics for five years.'], 'Present perfect: have + worked; for diikuti lamanya waktu.', { 'I am working in logistics for five years.': ['Lamanya sampai sekarang memakai present perfect, bukan present continuous.'] }),
    tr(2, 'Saya tertarik pada posisi ini karena saya suka bekerja dengan orang.', ["I'm interested in this position because I like working with people.", 'I am interested in this position because I like working with people.', "I'm interested in this position because I enjoy working with people."], 'interested in + posisi; like/enjoy + -ing.', { 'I am interested on this position because I like working with people.': ['interested selalu memakai in.'] }),
    spot(2, 'I graduated in Universitas Brawijaya last year.', 'in', 'from', 'Lulus dari kampus: graduated from + nama kampus. "in" dipakai untuk tahun: graduated in 2022.'),
  ],
  homework: [
    arrange(2, 'Saya sudah bekerja di bidang penjualan selama dua tahun.', 'I have worked in sales for two years', ['since', 'am'], 'Present perfect + for + lamanya waktu.'),
    dlg(2, 'Pilih jawaban terbaik untuk pewawancara.', 'Interviewer: Can you tell me a little about yourself?', [
      ["Sure. I'm a junior web developer at a start-up in Yogyakarta. I've built websites for about twenty clients, and I'd like to work on bigger projects in your team.", true],
      ['I was born in 1999. I have two sisters. My hobby is football.', 'Data pribadi seperti ini tidak relevan; fokus pada pekerjaan, pengalaman, dan alasan melamar.'],
      ['I am web developer, I want this job because the salary is high.', 'Kurang artikel "a", dan menyebut gaji sebagai alasan utama terdengar kurang profesional.'],
    ], 'Jawaban terbaik singkat, relevan, dan mengikuti urutan sekarang → pengalaman → alasan.'),
    fill(2, 'I am good ___ solving problems under pressure.', ['at'], '"Good at" + kata benda atau -ing.', { in: ['Untuk kemampuan, pakai good at.'] }),
  ],
  mastery: [
    tr(3, 'Saya sudah bekerja sebagai guru sejak 2019.', ['I have worked as a teacher since 2019.', "I've worked as a teacher since 2019.", 'I have been working as a teacher since 2019.'], 'Present perfect + since + titik awal.', { 'I am working as a teacher since 2019.': ['Pakai present perfect, bukan present continuous, untuk "sejak".'], 'I work as a teacher since 2019.': ['Dengan since, kata kerjanya present perfect: have worked.'] }),
    construct(3, 'I / responsible / manage / the social media accounts (present simple, -ing)', ['I am responsible for managing the social media accounts.', "I'm responsible for managing the social media accounts."], 'responsible for + -ing.', { 'I am responsible to manage the social media accounts.': ['responsible for + -ing, bukan to + kata kerja.'] }),
    read(3, 'Hello, my name is Dewi. I work as an administrative assistant at a logistics company in Semarang. I have worked there for two years. I manage schedules, prepare reports, and answer client emails. I am interested in this position because I want to use my English every day and learn more about international shipping.', 'Mengapa Dewi melamar posisi ini?', [
      ['Dia ingin memakai bahasa Inggris setiap hari dan belajar tentang pengiriman internasional.', true],
      ['Dia sudah bekerja dua tahun di perusahaan itu.', 'Itu pengalamannya, bukan alasan melamar.'],
      ['Dia ingin pindah ke Semarang.', 'Dia sudah bekerja di Semarang; teks tidak menyebut keinginan pindah.'],
    ], 'Alasan muncul setelah "I am interested in this position because ...".'),
  ],
});

export const workEmail = lesson({
  id: 'work-email',
  title: 'Email Kerja yang Sopan',
  summary: 'Pembuka, tujuan, permintaan sopan, lampiran, dan penutup email profesional.',
  topic: 'work.email',
  objectives: [
    'Membuka email dengan salam dan tujuan yang jelas ("I am writing to ...").',
    'Meminta sesuatu dengan sopan: Could you please ...? / Would it be possible to ...?',
    'Menutup email dengan ungkapan yang wajar: Thank you in advance, Best regards.',
  ],
  intro: 'Email kerja dalam bahasa Inggris biasanya lebih langsung daripada email berbahasa Indonesia, tetapi tetap sopan. Kesalahan kecil seperti "Thanks before" atau "I want you to send" bisa terdengar aneh atau kasar bagi pembaca. Pelajaran ini memberi kerangka yang bisa langsung kamu pakai.',
  teaching: [
    {
      heading: 'Kerangka email',
      body: 'Email kerja yang baik punya lima bagian pendek. Satu paragraf untuk satu tujuan.',
      table: [
        ['Bagian', 'Contoh'],
        ['Salam', 'Dear Ms. Rahma, / Hi Andi,'],
        ['Tujuan', 'I am writing to confirm our meeting on Friday.'],
        ['Isi atau permintaan', 'Could you please send me the latest price list?'],
        ['Lampiran', 'Please find attached the signed contract.'],
        ['Penutup', 'Thank you in advance. Best regards, Budi'],
      ],
    },
    {
      heading: 'Meminta dengan sopan',
      body: '"I want you to ..." terdengar seperti perintah. Pakai bentuk pertanyaan dengan could atau would. "Please kindly" berlebihan; cukup "please" atau "kindly", jangan keduanya.',
      examples: [
        { en: 'Could you please send me the invoice by Thursday?', id: 'Bisakah Anda mengirimkan tagihannya paling lambat Kamis?' },
        { en: 'Would it be possible to move the meeting to 3 p.m.?', id: 'Apakah rapatnya bisa dipindah ke pukul 15.00?' },
        { en: 'I would appreciate it if you could reply by Monday.', id: 'Saya akan berterima kasih jika Anda bisa membalas paling lambat Senin.' },
      ],
    },
    {
      heading: 'Ungkapan khas Indonesia yang perlu diganti',
      body: 'Beberapa ungkapan adalah terjemahan langsung dari bahasa Indonesia dan tidak dipakai penutur asli.',
      table: [
        ['Hindari', 'Pakai'],
        ['Thanks before.', 'Thank you in advance.'],
        ['Please kindly check.', 'Please check. / Could you please check?'],
        ['Dear Sir/Madam (padahal nama diketahui)', 'Dear Mr. Hendra,'],
        ['I attach the file in this email.', 'Please find attached the file.'],
      ],
    },
  ],
  demo: [
    ['Could you please send me the report by Friday?', 'I want you to send me the report by Friday.', '"I want you to" terdengar seperti perintah; bentuk pertanyaan dengan could lebih sopan.'],
    ['Thank you in advance for your help.', 'Thanks before for your help.', '"Thanks before" adalah terjemahan langsung "terima kasih sebelumnya" dan tidak dipakai dalam bahasa Inggris.'],
    ['Please find attached my CV.', 'Please kindly find attached my CV.', '"please" dan "kindly" berlebihan bila dipakai bersama.'],
  ],
  guided: [
    mc(1, 'Pilih kalimat tujuan email yang paling tepat.', null, [
      ['I am writing to ask about the job vacancy on your website.', true],
      ['I write this email for asking about the job vacancy on your website.', '"for asking" tidak tepat; pakai "I am writing to ask ...".'],
      ['Here I want to ask the job vacancy on your website.', 'Terdengar kaku dan kurang "about": ask about something.'],
    ], 'Pembuka standar: "I am writing to + kata kerja dasar".'),
    mc(1, 'Mana penutup yang wajar untuk email kerja?', null, [
      ['Best regards,', true],
      ['Thanks before,', 'Ungkapan ini terjemahan langsung dan tidak dipakai penutur asli.'],
      ['See you, bye bye!', 'Terlalu santai untuk email kerja.'],
    ], '"Best regards", "Kind regards", atau "Sincerely" lazim dipakai.'),
    fill(1, 'Could you ___ send me the meeting agenda?', ['please', 'kindly'], 'Permintaan sopan: Could you please + kata kerja dasar. "kindly" juga benar, sedikit lebih formal.', { want: ['"Could you want" tidak bermakna; pakai please.'] }),
    match(1, 'Pasangkan bagian email dengan contohnya.', [
      ['Salam', 'Dear Mr. Pratama,'],
      ['Tujuan', 'I am writing to confirm the delivery date.'],
      ['Lampiran', 'Please find attached the purchase order.'],
      ['Penutup', 'Kind regards,'],
    ], 'Lima bagian email: salam, tujuan, isi, lampiran, penutup.'),
  ],
  independent: [
    fix(2, 'Thanks before for your quick response.', ['Thank you in advance for your quick response.', 'Thanks in advance for your quick response.'], 'Ganti "Thanks before" dengan "Thank you in advance".', { 'Thanks before for your quick response.': ['Kalimatnya belum diubah.'] }),
    tr(2, 'Bisakah Anda mengirimkan tagihannya hari ini?', ['Could you please send the invoice today?', 'Could you send the invoice today?', 'Could you please send me the invoice today?', 'Could you send me the invoice today?'], 'Permintaan sopan: Could you (please) + send ...?', { 'I want you to send the invoice today.': ['Terdengar seperti perintah; pakai bentuk pertanyaan.'] }),
    construct(2, 'it / possible / move / the meeting / to Thursday (Would ...?)', ['Would it be possible to move the meeting to Thursday?'], 'Would it be possible to + kata kerja dasar?'),
    spot(2, 'I am writing for confirm our meeting on Friday.', 'for', 'to', 'Pembuka email: I am writing to + kata kerja dasar (to confirm).'),
  ],
  homework: [
    arrange(2, 'Saya menulis untuk mengonfirmasi pesanan kami.', 'I am writing to confirm our order', ['for', 'confirming'], 'I am writing to + kata kerja dasar.'),
    read(2, 'Dear Ms. Lestari,\nI am writing to follow up on our phone call yesterday. Could you please send me the updated quotation for 200 units? We would like to place the order before the end of the month.\nThank you in advance.\nBest regards,\nRizky', 'Apa yang diminta Rizky?', [
      ['Penawaran harga terbaru untuk 200 unit.', true],
      ['Jadwal telepon berikutnya.', 'Telepon sudah terjadi kemarin; email ini menindaklanjutinya.'],
      ['Pembatalan pesanan.', 'Rizky justru ingin memesan sebelum akhir bulan.'],
    ], 'Permintaannya ada di kalimat "Could you please send me the updated quotation ...".'),
    tf(2, '"Dear Sir/Madam" paling tepat dipakai ketika kamu sudah tahu nama penerimanya.', false, 'Jika nama penerima diketahui, pakai namanya: "Dear Mr. Hendra,". "Dear Sir/Madam" untuk penerima yang tidak diketahui.', 'Pernyataan ini salah: nama penerima lebih sopan dan personal.'),
  ],
  mastery: [
    tr(3, 'Terlampir CV dan portofolio saya.', ['Please find attached my CV and portfolio.', 'Please find my CV and portfolio attached.', 'I have attached my CV and portfolio.', "I've attached my CV and portfolio."], 'Please find attached ... / I have attached ...', { 'I attach my CV and portfolio in this email.': ['Kurang wajar; pakai "Please find attached ..." atau "I have attached ...".'] }),
    fix(3, 'I want you to reply before Monday.', ['Could you please reply before Monday?', 'Could you reply before Monday?', 'I would appreciate it if you could reply before Monday.', 'Could you please reply by Monday?'], 'Ubah perintah menjadi permintaan sopan.', { 'I want you to reply before Monday.': ['Kalimatnya belum diubah.'] }),
    dlg(3, 'Pilih balasan email yang paling profesional.', 'Email dari klien: "Could you send the revised design by tomorrow?"', [
      ['Thank you for your email. I will send the revised design by 5 p.m. tomorrow. Best regards, Sinta', true],
      ['Ok noted.', 'Terlalu singkat untuk klien; tidak ada salam dan kepastian waktu.'],
      ['Thanks before, I will try if I have time.', '"Thanks before" tidak wajar, dan jawabannya tidak memberi kepastian.'],
    ], 'Balasan profesional berterima kasih, memberi kepastian, lalu ditutup dengan sopan.'),
  ],
});

export const workMeeting = lesson({
  id: 'work-meeting',
  title: 'Rapat: Menyampaikan Pendapat dengan Sopan',
  summary: 'Memberi pendapat, setuju, tidak setuju, dan menyela dengan sopan dalam rapat.',
  topic: 'work.meeting',
  objectives: [
    'Memberi pendapat dengan "In my opinion" atau "I think", bukan "According to me".',
    'Setuju dan tidak setuju dengan sopan: I agree / I see your point, but ...',
    'Menghindari kesalahan umum: I am agree, discuss about.',
  ],
  intro: 'Dalam rapat berbahasa Inggris, cara menyampaikan pendapat sama pentingnya dengan isinya. Tidak setuju secara langsung ("You are wrong") terdengar kasar. Penutur asli biasanya mengakui pendapat orang lain dulu, lalu menyampaikan pandangan sendiri.',
  teaching: [
    {
      heading: 'Memberi pendapat',
      body: '"According to me" jarang dipakai penutur asli. Pakai "In my opinion", "I think", atau "From my point of view". Untuk usul, pakai "I suggest we ..." atau "How about ...-ing?".',
      examples: [
        { en: 'In my opinion, we should launch the product in March.', id: 'Menurut saya, kita sebaiknya meluncurkan produknya pada Maret.' },
        { en: 'I suggest we test it with ten customers first.', id: 'Saya usul kita mengujinya dulu dengan sepuluh pelanggan.' },
        { en: 'How about meeting again on Friday?', id: 'Bagaimana kalau kita bertemu lagi hari Jumat?' },
      ],
    },
    {
      heading: 'Setuju dan tidak setuju',
      body: '"Agree" adalah kata kerja, jadi "I agree", bukan "I am agree". Untuk tidak setuju, akui dulu pendapat orang lain.',
      table: [
        ['Setuju', 'Tidak setuju dengan sopan'],
        ['I agree with you.', "I see your point, but I'm not sure that's the best option."],
        ["That's a good idea.", "That's a good point. However, we also need to think about the budget."],
        ['Exactly.', "I'm afraid I don't agree."],
      ],
    },
    {
      heading: 'Menyela dan meminta penjelasan',
      body: '"Discuss" langsung diikuti objek, tanpa "about". Untuk menyela, minta izin dulu.',
      examples: [
        { en: "Sorry to interrupt, but could I add something?", id: 'Maaf menyela, boleh saya menambahkan sesuatu?' },
        { en: 'Could you explain that again, please?', id: 'Bisakah Anda menjelaskannya lagi?' },
        { en: "Let's discuss the timeline.", id: 'Mari kita bahas jadwalnya.', note: 'Bukan "discuss about the timeline".' },
      ],
    },
  ],
  demo: [
    ['I agree with Rina.', 'I am agree with Rina.', 'agree adalah kata kerja; tidak perlu am.'],
    ['In my opinion, the deadline is too short.', 'According to me, the deadline is too short.', '"According to me" jarang dipakai; "In my opinion" lebih wajar.'],
    ["Let's discuss the budget.", "Let's discuss about the budget.", 'discuss langsung diikuti objek.'],
  ],
  guided: [
    mc(1, 'Pilih kalimat yang benar.', null, [
      ['I agree with your idea.', true],
      ['I am agree with your idea.', 'agree sudah kata kerja; am tidak perlu.'],
      ['I agreeing with your idea.', 'Bentuk -ing tanpa am/is/are tidak lengkap; cukup "I agree".'],
    ], '"I agree with ..." adalah bentuk yang benar.'),
    mc(1, 'Mana cara tidak setuju yang paling sopan?', null, [
      ["I see your point, but I'm worried about the cost.", true],
      ["You're wrong.", 'Terlalu langsung dan terdengar kasar di rapat.'],
      ['No, that idea is bad.', 'Menilai ide sebagai "bad" tanpa alasan terdengar kasar.'],
    ], 'Akui pendapat orang lain, lalu sampaikan kekhawatiranmu.'),
    fill(1, "Let's discuss ___ new schedule.", ['the'], 'discuss langsung diikuti objek: discuss the new schedule.', { about: ['discuss tidak memakai about.'], 'about the': ['discuss tidak memakai about.'] }),
    match(1, 'Pasangkan fungsi dengan ungkapannya.', [
      ['Memberi pendapat', 'In my opinion, ...'],
      ['Mengusulkan', 'I suggest we ...'],
      ['Menyela', 'Sorry to interrupt, but ...'],
      ['Tidak setuju', "I'm afraid I don't agree."],
    ], 'Setiap fungsi punya ungkapan yang lazim.'),
  ],
  independent: [
    fix(2, 'According to me, we need more time.', ['In my opinion, we need more time.', 'I think we need more time.', 'From my point of view, we need more time.'], 'Pakai "In my opinion" atau "I think".', { 'According to me, we need more time.': ['Kalimatnya belum diubah.'] }),
    spot(2, 'Sorry for interrupt, but could I add something?', 'for', 'to', 'Ungkapan tetapnya "Sorry to interrupt": to + kata kerja dasar.'),
    tr(2, 'Maaf menyela, boleh saya menambahkan sesuatu?', ['Sorry to interrupt, but could I add something?', 'Sorry to interrupt, but can I add something?', 'Sorry to interrupt, could I add something?', 'Sorry to interrupt, may I add something?', 'Sorry to interrupt, but may I add something?'], 'Sorry to interrupt, but could I + kata kerja dasar?'),
    construct(2, 'I / suggest / we / ask the client first', ['I suggest we ask the client first.', 'I suggest that we ask the client first.'], 'I suggest (that) we + kata kerja dasar.', { 'I suggest we to ask the client first.': ['Setelah "I suggest we", pakai kata kerja dasar tanpa to.'] }),
  ],
  homework: [
    arrange(2, 'Menurut saya, tenggatnya terlalu singkat.', 'In my opinion the deadline is too short', ['According', 'me'], 'In my opinion + kalimat.'),
    dlg(2, 'Pilih tanggapan terbaik.', 'Manager: "I think we should cancel the event because of the weather."', [
      ["That's a good point. However, we could move it indoors instead of cancelling.", true],
      ['I am disagree.', '"disagree" adalah kata kerja: "I disagree", dan tanpa alasan terdengar kasar.'],
      ['According to me no.', 'Tidak lengkap dan "According to me" tidak wajar.'],
    ], 'Akui pendapat, lalu tawarkan alternatif.'),
    tf(2, '"How about meeting on Friday?" adalah cara yang wajar untuk mengusulkan waktu rapat.', true, '"How about + -ing?" lazim untuk mengusulkan sesuatu.', 'Pernyataan ini benar: How about + -ing dipakai untuk usul.'),
  ],
  mastery: [
    tr(3, 'Saya setuju dengan Budi, tetapi kita juga perlu memikirkan anggarannya.', ['I agree with Budi, but we also need to think about the budget.', 'I agree with Budi, but we also need to consider the budget.', 'I agree with Budi, but we need to think about the budget too.'], 'I agree with ... , but we also need to ...', { 'I am agree with Budi, but we also need to think about the budget.': ['agree tanpa am.'] }),
    fix(3, 'I am agree that we discuss about the price later.', ['I agree that we discuss the price later.', 'I agree that we should discuss the price later.', 'I agree we discuss the price later.'], 'Dua perbaikan: "I agree" (tanpa am) dan "discuss the price" (tanpa about).', { 'I agree that we discuss about the price later.': ['about setelah discuss masih ada.'], 'I am agree that we discuss the price later.': ['"am" sebelum agree masih ada.'] }),
    read(3, 'Rina: I suggest we send the survey to all customers.\nDoni: I see your point, but that might take too long. How about starting with fifty customers?\nRina: That sounds reasonable. Let\'s discuss the questions tomorrow.', 'Apa usul Doni?', [
      ['Memulai survei dengan lima puluh pelanggan.', true],
      ['Mengirim survei ke semua pelanggan.', 'Itu usul Rina, yang ditanggapi Doni.'],
      ['Membatalkan survei.', 'Doni tidak mengusulkan pembatalan, hanya memulai dari yang lebih kecil.'],
    ], 'Usul Doni ada setelah "How about ...".'),
  ],
});
