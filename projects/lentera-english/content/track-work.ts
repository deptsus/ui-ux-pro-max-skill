// Jalur Khusus (Rilis 11) · Bahasa Inggris untuk Kerja — wawancara, email, rapat.
// The first lesson is free; the rest are Premium (set in content/index.ts).
import { arrange, construct, dlg, fill, fix, lesson, listen, match, mc, read, spot, tf, tr } from './dsl';

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

export const workPhone = lesson({
  id: 'work-phone',
  title: 'Telepon Kerja',
  summary: 'Mengangkat telepon, menanyakan maksud, meninggalkan pesan, dan mengeja dengan jelas.',
  topic: 'work.phone',
  objectives: [
    'Membuka dan menjawab telepon kerja dengan ungkapan standar.',
    'Meminta orang mengulang atau mengeja: Could you repeat that? / Could you spell that?',
    'Meninggalkan dan menerima pesan: Can I take a message? / Could you ask him to call me back?',
  ],
  intro: 'Telepon terasa lebih sulit daripada bicara langsung karena tidak ada gerak tubuh dan suara sering terputus. Kabar baiknya, percakapan telepon kerja memakai ungkapan yang hampir selalu sama. Kuasai ungkapan itu dan kamu bisa fokus pada isinya.',
  teaching: [
    {
      heading: 'Membuka telepon',
      body: 'Saat mengangkat, sebut nama perusahaan dan namamu. Saat menelepon, perkenalkan diri dengan "This is ..." (bukan "I am ..." yang terdengar janggal di telepon) lalu sebut maksudmu.',
      examples: [
        { en: 'Good morning, Lentera Logistics, Rina speaking. How can I help you?', id: 'Selamat pagi, Lentera Logistics, dengan Rina. Ada yang bisa saya bantu?' },
        { en: "Hello, this is Budi from PT Maju. I'm calling about the invoice.", id: 'Halo, saya Budi dari PT Maju. Saya menelepon soal tagihan.' },
        { en: 'Could I speak to Ms. Sari, please?', id: 'Boleh saya bicara dengan Bu Sari?' },
      ],
    },
    {
      heading: 'Kalau tidak jelas',
      body: 'Jangan pura-pura mengerti. Minta diulang atau dieja dengan sopan. Untuk nama dan email, eja huruf demi huruf.',
      table: [
        ['Situasi', 'Ungkapan'],
        ['Tidak dengar', 'Sorry, could you repeat that, please?'],
        ['Terlalu cepat', 'Could you speak a little more slowly, please?'],
        ['Nama/email', 'Could you spell that for me, please?'],
        ['Memastikan', 'So that is Thursday at 10 a.m., right?'],
      ],
    },
    {
      heading: 'Pesan',
      body: 'Kalau orang yang dicari tidak ada, tawarkan untuk mencatat pesan. Kalau kamu yang menelepon, minta ditelepon balik.',
      examples: [
        { en: "I'm afraid she's in a meeting. Can I take a message?", id: 'Maaf, beliau sedang rapat. Boleh saya catat pesannya?' },
        { en: 'Could you ask him to call me back this afternoon?', id: 'Bisakah Anda minta dia menelepon saya kembali sore ini?' },
      ],
    },
  ],
  demo: [
    ['Hello, this is Dina from Bank Sentosa.', 'Hello, I am Dina from Bank Sentosa.', 'Di telepon, perkenalan memakai "This is ...".'],
    ['Sorry, could you repeat that, please?', 'What? Say again.', 'Terlalu langsung untuk telepon kerja; minta dengan sopan.'],
    ["I'm afraid he's not available. Can I take a message?", 'He is not here. Call again later.', 'Tawarkan mencatat pesan, jangan menyuruh menelepon ulang.'],
  ],
  guided: [
    mc(1, 'Bagaimana memperkenalkan diri saat menelepon?', null, [
      ['Hello, this is Andi from PT Sinar.', true],
      ['Hello, I am Andi from PT Sinar.', 'Di telepon, penutur asli memakai "This is ...".'],
      ['Hello, my name Andi from PT Sinar.', 'Kurang kata kerja "is"; dan di telepon lebih wajar "This is ...".'],
    ], 'Perkenalan di telepon: This is + nama.'),
    match(1, 'Pasangkan situasi dengan ungkapannya.', [
      ['Tidak dengar jelas', 'Could you repeat that, please?'],
      ['Butuh ejaan nama', 'Could you spell that, please?'],
      ['Orangnya tidak ada', 'Can I take a message?'],
      ['Ingin ditelepon balik', 'Could you ask her to call me back?'],
    ], 'Empat ungkapan inti telepon kerja.'),
    fill(1, "I'm ___ about the delivery date.", ['calling'], '"I\'m calling about ..." menyatakan maksud menelepon.', { call: ['Setelah "I\'m", pakai -ing: calling.'] }),
    listen(1, 'Good afternoon, Mitra Travel, Yudi speaking.', 'Siapa yang mengangkat telepon?', [
      ['Yudi', true],
      ['Mitra', 'Mitra Travel adalah nama perusahaannya.'],
      ['Tidak disebut', 'Nama disebut setelah nama perusahaan: "Yudi speaking".'],
    ], 'Pola standar: nama perusahaan, lalu "... speaking".'),
  ],
  independent: [
    tr(2, 'Boleh saya bicara dengan Pak Hendra?', ['Could I speak to Mr. Hendra, please?', 'Could I speak to Mr Hendra, please?', 'May I speak to Mr. Hendra, please?', 'Can I speak to Mr. Hendra, please?', 'Could I speak with Mr. Hendra, please?'], 'Could/May I speak to + nama, please?'),
    fix(2, 'Sorry, can you say again?', ['Sorry, could you repeat that, please?', 'Sorry, could you say that again, please?', 'Sorry, could you repeat that?', 'Sorry, can you repeat that, please?'], 'Pakai "repeat that" atau "say that again".', { 'Sorry, can you say again?': ['Kalimatnya belum diubah.'] }),
    construct(2, 'I / afraid / she / in a meeting', ["I'm afraid she's in a meeting.", 'I am afraid she is in a meeting.', "I'm afraid she is in a meeting."], '"I\'m afraid ..." melunakkan kabar yang kurang menyenangkan.'),
    spot(2, 'Could you ask him to calling me back?', 'calling', 'call', 'ask someone to + kata kerja dasar: to call me back.'),
  ],
  homework: [
    arrange(2, 'Boleh saya catat pesannya?', 'Can I take a message', ['make', 'write'], 'Ungkapan tetap: take a message.'),
    listen(2, 'Hi, this is Lina from Delta Print. Could you ask Mr. Arif to call me back before five?', 'Apa yang diminta Lina?', [
      ['Pak Arif meneleponnya kembali sebelum pukul lima.', true],
      ['Pak Arif datang ke Delta Print.', 'Lina minta ditelepon balik, bukan didatangi.'],
      ['Pesanan dicetak sebelum pukul lima.', 'Yang dibatasi pukul lima adalah telepon baliknya.'],
    ], 'Kunci: "call me back before five".'),
    tf(2, '"Could you spell that, please?" dipakai untuk meminta lawan bicara mengeja kata atau nama.', true, 'spell = mengeja.', 'Pernyataan ini benar.'),
  ],
  mastery: [
    tr(3, 'Halo, saya Rina dari PT Cahaya. Saya menelepon soal pesanan kami.', ['Hello, this is Rina from PT Cahaya. I am calling about our order.', "Hello, this is Rina from PT Cahaya. I'm calling about our order.", "Hi, this is Rina from PT Cahaya. I'm calling about our order."], 'This is + nama; I\'m calling about + hal.', { 'Hello, I am Rina from PT Cahaya. I am calling about our order.': ['Di telepon, perkenalan memakai "This is ...".'] }),
    fix(3, 'He is not here. Call again tomorrow.', ["I'm afraid he isn't available. Can I take a message?", "I'm afraid he's not here. Can I take a message?", "I'm afraid he's not available. Can I take a message?", "I'm afraid he is not available. Can I take a message?"], 'Lunakkan dengan "I\'m afraid ..." dan tawarkan mencatat pesan.', { 'He is not here. Call again tomorrow.': ['Kalimatnya belum diubah.'] }),
    dlg(3, 'Pilih jawaban terbaik.', 'Penelepon: "My email is r-a-h-m-a-t at gmail dot com." (kamu ragu)', [
      ['Sorry, could you spell that again more slowly, please?', true],
      ["OK, I've got it.", 'Jangan pura-pura mengerti; email yang salah membuat pesan tidak sampai.'],
      ['What?', 'Terlalu singkat dan terdengar kasar.'],
    ], 'Untuk data penting, minta dieja ulang dengan sopan.'),
  ],
});

export const workPresentation = lesson({
  id: 'work-presentation',
  title: 'Presentasi Singkat',
  summary: 'Membuka, mengatur alur, membaca data dari grafik, dan menutup presentasi.',
  topic: 'work.presentation',
  objectives: [
    'Membuka presentasi dan menyebut tujuannya: Today I\'d like to talk about ...',
    'Menandai alur dengan kata penanda: First, Next, Finally.',
    'Menjelaskan grafik: increased, decreased, remained stable, by/to.',
  ],
  intro: 'Presentasi kerja yang baik tidak butuh kosakata sulit. Yang dibutuhkan adalah peta yang jelas untuk pendengar: apa yang akan dibahas, di mana posisi sekarang, dan apa kesimpulannya. Kata penanda membuat pendengar tidak tersesat.',
  teaching: [
    {
      heading: 'Pembukaan',
      body: 'Sapa, sebut topik, lalu beri peta isi presentasi.',
      examples: [
        { en: "Good morning, everyone. Today I'd like to talk about our sales in the third quarter.", id: 'Selamat pagi semuanya. Hari ini saya ingin membahas penjualan kita di kuartal ketiga.' },
        { en: "First, I'll show the results. Then, I'll explain the reasons. Finally, I'll suggest next steps.", id: 'Pertama, saya tunjukkan hasilnya. Lalu saya jelaskan penyebabnya. Terakhir, saya usulkan langkah berikutnya.' },
      ],
    },
    {
      heading: 'Menjelaskan grafik',
      body: 'Pakai kata kerja perubahan. "by" menyebut besarnya perubahan; "to" menyebut angka akhirnya.',
      table: [
        ['Naik', 'Turun', 'Tetap'],
        ['increased / rose', 'decreased / fell', 'remained stable'],
        ['Sales increased by 20%.', 'Costs fell to 40 million.', 'Prices remained stable.'],
      ],
    },
    {
      heading: 'Penutup dan tanya jawab',
      body: 'Ringkas pesan utama, lalu undang pertanyaan.',
      examples: [
        { en: 'To sum up, online orders are growing fast.', id: 'Singkatnya, pesanan daring tumbuh cepat.' },
        { en: 'Thank you for listening. Are there any questions?', id: 'Terima kasih sudah mendengarkan. Ada pertanyaan?' },
      ],
    },
  ],
  demo: [
    ["Today I'd like to talk about our new app.", 'Today I want to tell about our new app.', '"talk about" atau "tell you about"; "tell about" kurang tepat.'],
    ['Sales increased by 15% in June.', 'Sales were increase 15% in June.', 'Pakai kata kerja lampau "increased" dan "by" untuk besarnya perubahan.'],
    ['Thank you for listening. Are there any questions?', 'Thank you for your listening. Any question?', '"Thank you for listening" tanpa "your"; "any questions" jamak.'],
  ],
  guided: [
    mc(1, 'Pilih kalimat pembuka yang tepat.', null, [
      ["Today I'd like to talk about our marketing plan.", true],
      ['Today I want to tell about our marketing plan.', '"tell" butuh orang: tell you about ...; atau pakai "talk about".'],
      ['Today I will explanation our marketing plan.', '"explanation" kata benda; pakai kata kerja "explain".'],
    ], 'Pembuka standar: Today I\'d like to talk about ...'),
    mc(2, 'Pilih kata yang tepat.', 'Our costs fell ___ 30% last year, from 100 million to 70 million.', [
      ['by', true],
      ['to', '"to" menyebut angka akhirnya (to 70 million), bukan besarnya perubahan.'],
      ['at', '"at" tidak dipakai untuk besarnya perubahan.'],
    ], '"by" = besarnya perubahan (30%).'),
    match(1, 'Pasangkan kata penanda dengan fungsinya.', [
      ['First,', 'Memulai bagian pertama'],
      ['Next,', 'Pindah ke bagian berikutnya'],
      ['Finally,', 'Bagian terakhir'],
      ['To sum up,', 'Meringkas'],
    ], 'Kata penanda membuat alur presentasi jelas.'),
    tf(1, '"Prices remained stable" berarti harga tidak berubah.', true, 'remain stable = tetap.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fill(2, 'The number of users ___ (naik) to 5,000 in March.', ['increased', 'rose', 'grew'], 'Kata kerja lampau untuk kenaikan: increased/rose/grew.', { increase: ['Pakai bentuk lampau: increased.'], raised: ['"raise" butuh objek; untuk angka yang naik sendiri pakai rose/increased.'] }),
    tr(2, 'Singkatnya, penjualan daring tumbuh dengan cepat.', ['To sum up, online sales are growing fast.', 'To sum up, online sales are growing quickly.', 'In summary, online sales are growing fast.', 'To sum up, online sales grew quickly.', 'To sum up, online sales are growing rapidly.'], 'To sum up / In summary + kalimat.'),
    fix(2, 'Thank you for your listening.', ['Thank you for listening.'], 'Ungkapan tetapnya tanpa "your".', { 'Thank you for your listening.': ['Kalimatnya belum diubah.'] }),
    construct(2, 'first / I / show / the results (will)', ["First, I'll show the results.", 'First, I will show the results.'], 'First, + I\'ll + kata kerja dasar.'),
  ],
  homework: [
    arrange(2, 'Biaya turun sebesar sepuluh persen.', 'Costs fell by ten percent', ['to', 'falled'], 'fell (lampau dari fall) + by + besarnya perubahan.', { alt: ['Costs fell by 10 percent'] }),
    read(2, 'Good morning, everyone. Today I\'d like to talk about our customer survey. First, I\'ll show the results. Next, I\'ll explain the main complaints. Finally, I\'ll suggest three changes.', 'Apa yang dibahas di bagian kedua?', [
      ['Keluhan utama pelanggan.', true],
      ['Hasil survei.', 'Itu bagian pertama (First).'],
      ['Tiga usulan perubahan.', 'Itu bagian terakhir (Finally).'],
    ], 'Bagian kedua ditandai "Next".'),
    spot(2, 'Our profit increase by 12% last year.', 'increase', 'increased', 'Kejadian tahun lalu memakai bentuk lampau: increased.'),
  ],
  mastery: [
    tr(3, 'Hari ini saya ingin membahas hasil penjualan bulan Juni.', ["Today I'd like to talk about the sales results for June.", 'Today I would like to talk about the sales results for June.', "Today I'd like to talk about June's sales results.", "Today I'd like to talk about the June sales results."], "Today I'd like to talk about + topik.", { 'Today I want to tell about the sales results for June.': ['Pakai "talk about".'] }),
    fill(3, 'Downloads fell ___ 8,000 to 6,000 after the update.', ['from'], 'from + angka awal, to + angka akhir.', { by: ['"by" untuk besarnya perubahan; di sini dari 8.000 ke 6.000: from ... to.'] }),
    fix(3, 'Any question? Thank you for your listening.', ['Thank you for listening. Are there any questions?', 'Thank you for listening. Do you have any questions?', 'Are there any questions? Thank you for listening.'], '"questions" jamak, dan "Thank you for listening" tanpa your.', { 'Any question? Thank you for your listening.': ['Kalimatnya belum diubah.'] }),
  ],
});

export const workCv = lesson({
  id: 'work-cv',
  title: 'CV dan Surat Lamaran',
  summary: 'Kata kerja aksi di CV, bentuk lampau yang konsisten, dan kalimat pembuka surat lamaran.',
  topic: 'work.cv',
  objectives: [
    'Menulis poin pengalaman dengan kata kerja aksi: managed, led, increased.',
    'Memakai bentuk lampau untuk pekerjaan lama dan present untuk pekerjaan sekarang, secara konsisten.',
    'Membuka surat lamaran: I am writing to apply for the position of ...',
  ],
  intro: 'Perekrut membaca CV dalam hitungan detik. Poin pengalaman yang dibuka dengan kata kerja aksi dan berisi angka lebih cepat dipahami daripada kalimat panjang seperti "I was responsible for doing many things". Surat lamaran juga punya kalimat pembuka yang baku.',
  teaching: [
    {
      heading: 'Kata kerja aksi dan angka',
      body: 'Mulai setiap poin dengan kata kerja aksi, tanpa "I". Tambahkan angka bila bisa.',
      table: [
        ['Lemah', 'Kuat'],
        ['I was responsible for social media.', 'Managed three social media accounts with 20,000 followers.'],
        ['Helped to sell products.', 'Increased monthly sales by 15%.'],
        ['Did training for new staff.', 'Trained 12 new staff members.'],
      ],
    },
    {
      heading: 'Bentuk waktu yang konsisten',
      body: 'Pekerjaan yang sudah selesai: bentuk lampau (managed, led). Pekerjaan sekarang: bentuk present (manage, lead). Jangan mencampur dalam satu bagian.',
      examples: [
        { en: 'Sales Assistant, Toko Maju (2021–2023): Served 80 customers a day.', id: 'Pramuniaga, Toko Maju (2021–2023): Melayani 80 pelanggan per hari.' },
        { en: 'Sales Supervisor, Toko Jaya (2023–now): Lead a team of five.', id: 'Supervisor Penjualan, Toko Jaya (2023–sekarang): Memimpin tim lima orang.' },
      ],
    },
    {
      heading: 'Surat lamaran',
      body: 'Kalimat pertama menyebut posisi dan sumber lowongan. Paragraf berikutnya menghubungkan pengalamanmu dengan kebutuhan perusahaan.',
      examples: [
        { en: 'I am writing to apply for the position of Admin Officer advertised on your website.', id: 'Saya menulis untuk melamar posisi Staf Admin yang diiklankan di situs web Anda.' },
        { en: 'I would welcome the opportunity to discuss my application with you.', id: 'Saya akan senang mendapat kesempatan membicarakan lamaran saya dengan Anda.' },
      ],
    },
  ],
  demo: [
    ['Increased monthly sales by 15%.', 'I was responsible to increase the sales.', 'Kata kerja aksi + angka lebih kuat dan jelas.'],
    ['I am writing to apply for the position of Data Analyst.', 'I want to apply job Data Analyst.', 'Kalimat pembuka baku dan tata bahasanya lengkap.'],
    ['Trained 12 new staff members.', 'Training 12 new staff.', 'Poin CV dibuka dengan kata kerja bentuk lampau, bukan -ing.'],
  ],
  guided: [
    mc(1, 'Poin CV mana yang paling kuat?', null, [
      ['Reduced delivery errors by 30% in six months.', true],
      ['I was responsible for delivery.', 'Tidak menunjukkan hasil; mulai dengan kata kerja aksi dan angka.'],
      ['Doing many tasks about delivery.', 'Tidak jelas dan memakai -ing.'],
    ], 'Kata kerja aksi + hasil terukur.'),
    match(1, 'Pasangkan kata kerja aksi dengan artinya.', [
      ['managed', 'mengelola'],
      ['led', 'memimpin'],
      ['trained', 'melatih'],
      ['reduced', 'mengurangi'],
    ], 'Kata kerja aksi yang sering dipakai di CV.'),
    fill(1, 'I am writing to apply ___ the position of Graphic Designer.', ['for'], 'apply for + posisi.', { to: ['apply for a position; "apply to" untuk perusahaan.'] }),
    tf(1, 'Untuk pekerjaan yang sudah selesai, poin CV memakai bentuk lampau seperti "managed".', true, 'Pekerjaan lama: bentuk lampau.', 'Pernyataan ini benar.'),
  ],
  independent: [
    fix(2, 'I was responsible to train new staff.', ['Trained new staff.', 'Trained new staff members.', 'I trained new staff.'], 'Pakai kata kerja aksi: Trained new staff.', { 'I was responsible to train new staff.': ['Kalimatnya belum diubah.'] }),
    construct(2, 'increase / customer satisfaction / by 20% (poin CV, lampau)', ['Increased customer satisfaction by 20%.'], 'Kata kerja aksi lampau + by + angka.'),
    tr(2, 'Saya menulis untuk melamar posisi Staf Keuangan.', ['I am writing to apply for the position of Finance Officer.', "I'm writing to apply for the position of Finance Officer.", 'I am writing to apply for the Finance Officer position.', 'I am writing to apply for the position of Finance Staff.'], 'I am writing to apply for the position of ...', { 'I want to apply job Finance Officer.': ['Pakai kalimat pembuka baku.'] }),
    spot(2, 'Leading a team of four designers in 2022.', 'Leading', 'Led', 'Pekerjaan yang sudah selesai: bentuk lampau "Led".'),
  ],
  homework: [
    arrange(2, 'Mengelola anggaran 50 juta rupiah.', 'Managed a budget of 50 million rupiah', ['Managing', 'manage'], 'Kata kerja aksi lampau di awal poin.'),
    mc(2, 'Pilih kalimat penutup surat lamaran yang paling tepat.', null, [
      ['I would welcome the opportunity to discuss my application with you.', true],
      ['Please accept me, I really need this job.', 'Terdengar memohon, bukan profesional.'],
      ['Thanks before for your attention.', '"Thanks before" tidak wajar dalam bahasa Inggris.'],
    ], 'Penutup profesional menawarkan diskusi lebih lanjut.'),
    tf(2, '"Responsible for doing many things" adalah poin CV yang kuat.', false, 'Terlalu umum. Poin kuat memakai kata kerja aksi dan angka.', 'Pernyataan ini salah.'),
  ],
  mastery: [
    tr(3, 'Meningkatkan penjualan bulanan sebesar 25%.', ['Increased monthly sales by 25%.', 'Increased monthly sales by 25 percent.', 'Raised monthly sales by 25%.', 'Boosted monthly sales by 25%.'], 'Kata kerja aksi lampau + by + angka.', { 'Increasing monthly sales by 25%.': ['Pakai bentuk lampau, bukan -ing.'] }),
    fix(3, 'I want to apply job as Marketing Staff in your company.', ['I am writing to apply for the position of Marketing Staff at your company.', 'I am writing to apply for the Marketing Staff position at your company.', "I'm writing to apply for the position of Marketing Staff at your company.", 'I am writing to apply for the position of Marketing Officer at your company.'], 'Kalimat pembuka baku: I am writing to apply for the position of ... at ...', { 'I want to apply job as Marketing Staff in your company.': ['Kalimatnya belum diubah.'] }),
    read(3, 'Customer Service Officer, Bank Mandiri Jaya (2020–2024)\n• Answered 60 customer calls a day.\n• Reduced complaint response time from 48 to 24 hours.\n• Trained 8 new team members.', 'Poin mana yang menunjukkan hasil perbaikan proses?', [
      ['Mempercepat waktu respons keluhan dari 48 menjadi 24 jam.', true],
      ['Menjawab 60 telepon per hari.', 'Itu menunjukkan beban kerja, bukan perbaikan.'],
      ['Melatih 8 anggota tim baru.', 'Itu pengalaman melatih, bukan perbaikan proses.'],
    ], '"Reduced ... from 48 to 24 hours" menunjukkan perbaikan yang terukur.'),
  ],
});
