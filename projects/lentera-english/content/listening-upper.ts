// Listening practice for B1–C2 (tahap 3). Each item is one recording with
// comprehension questions (gist, detail, inference, attitude) and, where it
// helps, one dictation line taken word for word from the recording. Wrong
// options explain what the learner probably heard or assumed, with a focus on
// traps typical for Indonesian speakers (dropped -s/-ed endings, contractions,
// "half past ten" vs "setengah sepuluh", homophones, signposting words).
import { dictation, listen } from './dsl';
import type { ListeningDraft } from './listening';

const L = { topic: 'skill.listening' } as const;
const WF = { topic: 'skill.listening', focus: 'weak-forms' } as const;

// ---------------------------------------------------------------- B1
const B1_CONTRACTIONS = "I'd like a coffee, please. We'll call you tomorrow. She's finished her report. I can't come on Saturday.";
const B1_VOICEMAIL = "Hi, this is Lisa from Bright Smile Dental Clinic. I'm calling about your appointment on Thursday at two o'clock. Unfortunately, Doctor Lee is ill this week, so we need to move it. We can offer you Monday at half past ten, or Tuesday at four. Please call us back before Friday. Thank you, and sorry for the trouble.";

// ---------------------------------------------------------------- B2
const B2_SLEEP = "Many students believe that staying up late is the best way to prepare for an exam. However, research suggests the opposite. When we sleep, the brain replays what we learned during the day and stores it in long-term memory. In one study, students who slept for eight hours after learning a list of words remembered about twenty per cent more than students who stayed awake. So if you have an exam on Friday, Thursday night is not the time to start studying. Start a week earlier, and let sleep do part of the work.";
const B2_MEETING = "Right, everyone, just a quick update before we finish. The client has asked us to bring the launch forward by two weeks, so the new date is the third of June instead of the seventeenth. I know that's tight. To make it work, we'll postpone the mobile version until July and focus on the website first. Ken, could you let the design team know this afternoon? And if anyone thinks they'll need extra help, please tell me by Wednesday, not at the last minute.";
const B2_NEWS = "The city council has announced that the main road through the city centre will be closed to cars every Sunday from next month. The scheme was tested in March, and according to the council, air pollution fell by almost a third on the test days. Local shop owners, however, are divided. Some reported more customers on foot, while others said their sales had dropped because people could not park nearby. The scheme will be reviewed after six months.";

// ---------------------------------------------------------------- C1
const C1_LECTURE = "Today I'd like to look at why people are so often poor at judging risk. Take flying, for instance. Statistically, it's far safer than driving, yet a surprising number of people who drive every day without a second thought are terrified of getting on a plane. Part of the explanation, it seems, lies in control. Behind the wheel, we feel in charge, even though many accidents involve factors we can't control at all. Another factor is how memorable an event is. A plane crash makes headlines around the world, whereas the thousands of deaths on the roads each year rarely make the news. That said, I'd be wary of concluding that people are simply irrational. Fear of the unfamiliar may well have served us rather well in the past.";
const C1_REMOTE = "I wouldn't say remote work has failed. Not at all. What I would say is that we underestimated what the office was actually doing for us. It wasn't so much about the desks or the meetings as about the conversations nobody planned: the quick question by the coffee machine, or a junior colleague overhearing how a senior one handles a difficult client. Those things are hard to schedule. So the companies that are getting it right aren't necessarily the ones bringing everyone back five days a week. They're the ones being deliberate about when people come in, and why.";
const C1_SURVEY = "Let me turn now to the survey results. We received just over twelve hundred responses, which is roughly double last year's figure. The vast majority of respondents, around eighty per cent, said they were satisfied with the service overall. However, satisfaction among users aged over sixty dropped slightly, from seventy-one to sixty-eight per cent. The most common complaint, mentioned by roughly one in five people, was how long it took to reach a real person on the phone. Given that, our first priority for next year is not a new feature but a faster support line.";

// ---------------------------------------------------------------- C2
const C2_APP = "Another year, another revolutionary app that promises to make us more productive. This one, I'm told, will give me back two hours a day by sending reminders to my phone telling me to stop checking my phone. Forgive me if I'm not entirely won over. The trouble with most productivity tools isn't that they don't work; it's that they work on the wrong problem. Few of us are short of reminders. What we're short of is the willingness to let some things go undone. No app, however beautifully designed, is going to make that decision for us.";
const C2_TAX = "Supporters of a sugar tax point to falling consumption wherever one has been introduced, and that much is hard to dispute. Granted, people buy fewer sugary drinks when they cost more. But it doesn't follow that they end up any healthier. If they simply switch to sweets or cakes, which the tax doesn't cover, the overall effect could be negligible. Be that as it may, I'm not arguing against the tax as such. My point is that we shouldn't judge it by sales figures alone, but by whether rates of diabetes and obesity actually come down.";
const C2_MOVE = "It was only when the last box had been carried out that I noticed how loud the flat had become. Every step echoed. For eleven years, those rooms had absorbed our arguments, our parties, the endless piano practice from next door. Now they gave everything back. My sister, ever practical, was already writing down the meter readings. I stood in the doorway a moment longer than I needed to. Not once in all those years had I thought of the place as beautiful. I'm not sure I'd call it beautiful now, either. But I knew I would miss it.";

export const listeningUpper: ListeningDraft[] = [
  {
    id: 'listen-b1-contractions', level: 'B1', title: 'Kontraksi yang sering terlewat', kind: 'sentence', premium: true,
    transcript: B1_CONTRACTIONS,
    translation: 'Saya mau secangkir kopi. Kami akan meneleponmu besok. Dia sudah menyelesaikan laporannya. Saya tidak bisa datang hari Sabtu.',
    questions: [
      listen(2, "I'd like a coffee, please.", 'Kalimat mana yang kamu dengar?', [
        ["I'd like a coffee, please.", true],
        ['I like a coffee, please.', 'Setelah "I" ada bunyi /d/ yang sangat pendek: I\'d = I would. "I\'d like" dipakai untuk memesan atau meminta dengan sopan; "I like" berarti suka secara umum.', 'weak-forms'],
        ['I liked a coffee, please.', 'Bentuk lampau "liked" tidak cocok dengan permintaan yang memakai "please", dan bunyi /t/ di akhir "liked" tidak terdengar.'],
      ], '"I\'d like" (= I would like) diucapkan /aɪd laɪk/. Bunyi /d/ hampir menyatu dengan /l/, jadi dengarkan jeda kecil setelah "I".', WF),
      listen(2, "We'll call you tomorrow.", 'Kalimat mana yang kamu dengar?', [
        ["We'll call you tomorrow.", true],
        ['We call you tomorrow.', 'Ada bunyi /l/ samar setelah "we": we\'ll = we will. Untuk rencana besok, bahasa Inggris memerlukan "will" atau "be going to".', 'weak-forms'],
        ['We called you tomorrow.', 'Bentuk lampau "called" bertentangan dengan "tomorrow", dan tidak ada bunyi /d/ setelah "call".'],
      ], '"We\'ll" diucapkan /wiːl/, hampir sama dengan "wheel". Bunyi /l/ itulah satu-satunya tanda "will".', WF),
      listen(3, "She's finished her report.", 'Kalimat mana yang artinya sama dengan yang kamu dengar?', [
        ['She has finished her report.', true],
        ['She is finishing her report.', '"\'s" di sini berarti "has", karena diikuti bentuk ketiga "finished". Kalau artinya "is", kata kerjanya berakhiran -ing: She\'s finishing.', 'weak-forms'],
        ['She finishes her report.', 'Ada "\'s" setelah "She", dan kata kerjanya "finished", bukan "finishes".'],
      ], '"She\'s" bisa berarti "she is" atau "she has". Petunjuknya kata kerja sesudahnya: bentuk ketiga (finished) berarti has; bentuk -ing berarti is.', WF),
      listen(3, "I can't come on Saturday.", 'Apakah pembicara bisa datang hari Sabtu?', [
        ["No, the speaker can't come.", true],
        ['Yes, the speaker can come.', 'Bunyi /t/ di akhir "can\'t" sering hampir hilang. Petunjuknya tekanan: "can" dalam kalimat positif biasanya lemah dan cepat /kən/, sedangkan "can\'t" diucapkan penuh dan bertekanan.', 'weak-forms'],
      ], 'Dalam kalimat, "can" positif biasanya diucapkan lemah /kən/, sedangkan "can\'t" bertekanan dengan vokal penuh: /kænt/ (Amerika) atau /kɑːnt/ (Inggris).', WF),
    ],
  },
  {
    id: 'listen-b1-voicemail', level: 'B1', title: 'Pesan suara dari klinik gigi', kind: 'passage', premium: true,
    transcript: B1_VOICEMAIL,
    translation: 'Halo, ini Lisa dari Klinik Gigi Bright Smile. Saya menelepon tentang janji temu Anda hari Kamis pukul dua. Sayangnya, Dokter Lee sakit minggu ini, jadi kami perlu memindahkannya. Kami bisa menawarkan Senin pukul setengah sebelas, atau Selasa pukul empat. Mohon telepon kami kembali sebelum hari Jumat. Terima kasih, dan maaf merepotkan.',
    questions: [
      listen(3, B1_VOICEMAIL, 'Why does the clinic need to change the appointment?', [
        ['Because the dentist is ill', true],
        ['Because the clinic is closed on Thursday', 'Pesan tidak menyebut klinik tutup. Alasannya: "Doctor Lee is ill this week".'],
        ['Because the patient asked to change it', 'Kliniklah yang menelepon dan meminta perubahan, bukan pasien.'],
      ], '"Doctor Lee is ill this week, so we need to move it." Kata "so" memperkenalkan akibat; alasannya ada tepat sebelum "so".', L),
      listen(3, B1_VOICEMAIL, 'Which new times does the clinic offer?', [
        ['Monday at 10.30 or Tuesday at 4.00', true],
        ['Monday at 9.30 or Tuesday at 4.00', '"half past ten" berarti tiga puluh menit lewat pukul sepuluh = 10.30. Jangan disamakan dengan "setengah sepuluh" dalam bahasa Indonesia, yang berarti 9.30.'],
        ['Thursday at 2.00 or Monday at 10.30', 'Kamis pukul dua adalah jadwal lama yang dibatalkan.'],
      ], '"half past ten" = 10.30, dan "four" = 4.00. Dalam bahasa Inggris, "half past" menghitung dari jam sebelumnya: half past ten = setengah sebelas.', L),
      listen(2, B1_VOICEMAIL, 'What should the listener do?', [
        ['Call the clinic back before Friday', true],
        ['Go to the clinic on Friday', '"before Friday" = sebelum hari Jumat, dan yang diminta adalah menelepon kembali, bukan datang.'],
        ['Wait for another call from Lisa', 'Lisa meminta pendengar yang menelepon: "Please call us back".'],
      ], '"call (someone) back" = menelepon kembali. "before Friday" = paling lambat sebelum hari Jumat.', L),
      dictation(3, "I'm calling about your appointment on Thursday at two o'clock.", "I'm calling ___ your appointment on Thursday at two o'clock.", ['about'],
        '"call about something" = menelepon mengenai sesuatu. Kata depan pendek seperti "about" diucapkan cepat /əˈbaʊt/ dan sering menyatu dengan kata sebelumnya.',
        { for: ['"calling for" berarti menelepon untuk meminta atau menjemput sesuatu. Yang terdengar "calling about" = menelepon mengenai.'] }, L),
    ],
  },
  {
    id: 'listen-b2-sleep', level: 'B2', title: 'Podcast: tidur dan ingatan', kind: 'passage', premium: true,
    transcript: B2_SLEEP,
    translation: 'Banyak pelajar percaya bahwa begadang adalah cara terbaik bersiap untuk ujian. Namun, penelitian menunjukkan kebalikannya. Saat kita tidur, otak memutar ulang apa yang kita pelajari sepanjang hari dan menyimpannya dalam ingatan jangka panjang. Dalam satu penelitian, pelajar yang tidur delapan jam setelah mempelajari daftar kata mengingat sekitar dua puluh persen lebih banyak daripada pelajar yang tetap terjaga. Jadi kalau ujianmu hari Jumat, Kamis malam bukan waktunya mulai belajar. Mulailah seminggu lebih awal, dan biarkan tidur mengerjakan sebagian tugasnya.',
    questions: [
      listen(3, B2_SLEEP, 'What is the main point of the talk?', [
        ['Sleep helps us remember what we have learned.', true],
        ['Students should study late at night before an exam.', 'Itu keyakinan banyak pelajar yang justru dibantah: "However, research suggests the opposite."'],
        ['Studying for eight hours is better than a short session.', '"eight hours" adalah lamanya tidur dalam penelitian, bukan lamanya belajar.'],
      ], 'Kalimat setelah "However" sering membawa gagasan utama: penelitian menunjukkan kebalikannya, karena tidur membantu otak menyimpan ingatan.', L),
      listen(3, B2_SLEEP, 'How much more did the students who slept remember?', [
        ['About 20% more', true],
        ['About 8% more', '"eight" muncul pada "eight hours" (lamanya tidur), bukan pada persentase.'],
        ['About 12% more', 'Yang terdengar "twenty" /ˈtwenti/ dengan tekanan di depan, bukan "twelve" /twelv/.'],
      ], '"remembered about twenty per cent more" = mengingat sekitar 20% lebih banyak.', L),
      listen(4, B2_SLEEP, 'What does the speaker advise?', [
        ['Start studying several days before the exam.', true],
        ['Study all night before the exam.', 'Pembicara justru berkata malam sebelum ujian "is not the time to start studying".'],
        ['Sleep instead of studying.', 'Pembicara menyarankan mulai belajar lebih awal lalu "let sleep do part of the work", bukan berhenti belajar.'],
      ], '"Start a week earlier, and let sleep do part of the work." Tidur membantu, tetapi hanya untuk materi yang sudah dipelajari.', L),
      dictation(3, 'However, research suggests the opposite.', 'However, research ___ the opposite.', ['suggests'],
        'Subjek "research" tunggal, jadi kata kerjanya memakai -s: suggests. Bunyi /s/ di akhir pendek, tetapi tetap harus ditulis.',
        { suggest: ['Subjek "research" tunggal (orang ketiga), jadi kata kerjanya ber-s: suggests. Dengarkan bunyi /s/ di akhir kata.', 'third-person-s'] }, L),
    ],
  },
  {
    id: 'listen-b2-meeting', level: 'B2', title: 'Rapat singkat: jadwal berubah', kind: 'passage', premium: true,
    transcript: B2_MEETING,
    translation: 'Baik, semuanya, kabar singkat sebelum kita selesai. Klien meminta kita memajukan peluncuran dua minggu, jadi tanggal barunya 3 Juni, bukan tanggal 17. Saya tahu itu mepet. Supaya bisa, kita tunda versi ponsel sampai Juli dan fokus ke situs web dulu. Ken, bisa tolong kabari tim desain sore ini? Dan kalau ada yang merasa butuh bantuan tambahan, tolong beri tahu saya paling lambat Rabu, jangan pada menit terakhir.',
    questions: [
      listen(3, B2_MEETING, 'What has the client asked for?', [
        ['An earlier launch', true],
        ['A later launch', '"bring forward" = memajukan (lebih awal). Untuk mengundurkan dipakai "put back" atau "postpone".'],
        ['A cheaper launch', 'Tidak ada pembicaraan tentang biaya; yang berubah hanya tanggalnya.'],
      ], '"bring the launch forward by two weeks" = memajukan peluncuran dua minggu: dari 17 Juni menjadi 3 Juni.', L),
      listen(3, B2_MEETING, 'What is the new launch date?', [
        ['3 June', true],
        ['17 June', '"the seventeenth" adalah tanggal lama: "the third of June instead of the seventeenth".'],
        ['13 June', 'Yang terdengar "third" /θɜːd/ (satu suku kata), bukan "thirteenth" /θɜːˈtiːnθ/.'],
      ], '"the third of June instead of the seventeenth" = 3 Juni, menggantikan 17 Juni.', L),
      listen(3, B2_MEETING, 'What will happen to the mobile version?', [
        ['Work on it will wait until July.', true],
        ['It will be launched first.', 'Yang didahulukan adalah situs web: "focus on the website first".'],
        ['It will be cancelled.', '"postpone" = menunda, bukan membatalkan (cancel).'],
      ], '"we\'ll postpone the mobile version until July" = versi ponsel ditunda sampai Juli.', L),
      listen(4, B2_MEETING, 'What does the manager ask the team to do?', [
        ['Say early if they need extra help', true],
        ['Tell the client about the change by Wednesday', '"by Wednesday" adalah batas waktu memberi tahu manajer, bukan klien.'],
        ['Inform the design team this afternoon', 'Itu tugas khusus untuk Ken, bukan untuk seluruh tim.'],
      ], '"please tell me by Wednesday, not at the last minute" = beri tahu saya paling lambat Rabu, jangan menunggu saat-saat terakhir.', L),
    ],
  },
  {
    id: 'listen-b2-news', level: 'B2', title: 'Berita: jalan bebas mobil setiap Minggu', kind: 'passage', premium: true,
    transcript: B2_NEWS,
    translation: 'Dewan kota mengumumkan bahwa jalan utama yang melintasi pusat kota akan ditutup untuk mobil setiap hari Minggu mulai bulan depan. Program ini diuji pada bulan Maret, dan menurut dewan kota, polusi udara turun hampir sepertiga pada hari-hari uji coba. Namun, para pemilik toko setempat terbelah. Sebagian melaporkan lebih banyak pembeli yang datang berjalan kaki, sementara yang lain mengatakan penjualan mereka turun karena orang tidak bisa parkir di dekat situ. Program ini akan ditinjau setelah enam bulan.',
    questions: [
      listen(3, B2_NEWS, 'What will happen every Sunday?', [
        ['Cars will not be allowed on the main road.', true],
        ['The main road will be repaired.', '"closed to cars" = ditutup untuk mobil, bukan ditutup untuk perbaikan.'],
        ['Shops in the city centre will close.', 'Yang ditutup jalannya untuk mobil, bukan tokonya.'],
      ], '"will be closed to cars every Sunday" = setiap Minggu mobil tidak boleh melintas.', L),
      listen(3, B2_NEWS, 'What happened to air pollution on the test days?', [
        ['It fell by about a third.', true],
        ['It fell by about three per cent.', '"a third" = sepertiga (sekitar 33%), bukan tiga persen.'],
        ['It rose by about a third.', '"fell" adalah bentuk lampau "fall" = turun, bukan naik.'],
      ], '"air pollution fell by almost a third" = polusi udara turun hampir sepertiga.', L),
      listen(4, B2_NEWS, 'How do local shop owners feel about the scheme?', [
        ['They have different opinions.', true],
        ['They all support it.', '"divided" = terbelah: sebagian senang, sebagian tidak.'],
        ['They all oppose it.', 'Sebagian pemilik toko justru melaporkan lebih banyak pembeli.'],
      ], '"are divided" lalu "Some ..., while others ..." menandakan pendapat yang berbeda-beda.', L),
      dictation(3, 'The scheme will be reviewed after six months.', 'The scheme will be ___ after six months.', ['reviewed'],
        'Setelah "will be" dipakai bentuk ketiga (kalimat pasif): will be reviewed = akan ditinjau. Bunyi /d/ di akhir sering samar, tetapi tetap harus ditulis.',
        { review: ['Setelah "will be" dipakai bentuk ketiga (pasif): reviewed. Bunyi /d/ di akhir memang pendek, tetapi itulah penanda pasifnya.'] }, L),
    ],
  },
  {
    id: 'listen-c1-lecture', level: 'C1', title: 'Kuliah: mengapa kita salah menilai risiko', kind: 'passage', premium: true,
    transcript: C1_LECTURE,
    translation: 'Hari ini saya ingin membahas mengapa orang begitu sering keliru menilai risiko. Ambil contoh terbang. Secara statistik, terbang jauh lebih aman daripada menyetir, namun cukup banyak orang yang menyetir setiap hari tanpa berpikir dua kali justru takut naik pesawat. Sebagian penjelasannya, tampaknya, terletak pada kendali. Di balik kemudi, kita merasa memegang kendali, padahal banyak kecelakaan melibatkan faktor yang sama sekali tidak bisa kita kendalikan. Faktor lainnya adalah seberapa mudah suatu peristiwa diingat. Kecelakaan pesawat menjadi berita utama di seluruh dunia, sedangkan ribuan kematian di jalan raya setiap tahun jarang diberitakan. Meski begitu, saya berhati-hati untuk tidak menyimpulkan bahwa manusia sekadar tidak rasional. Rasa takut pada hal yang asing bisa jadi justru cukup berguna bagi kita di masa lalu.',
    questions: [
      listen(4, C1_LECTURE, "What is the lecture mainly about?", [
        ['Why people misjudge how dangerous things are', true],
        ['Why flying is safer than driving', 'Itu hanya contoh ("Take flying, for instance"), bukan topik utama.'],
        ['How to reduce road accidents', 'Kecelakaan jalan disebut sebagai pembanding; cara menguranginya tidak dibahas.'],
      ], 'Pembuka "Today I\'d like to look at ..." menyebut topiknya: mengapa orang keliru menilai risiko. Kalimat sesudahnya berisi contoh dan penjelasan.', L),
      listen(4, C1_LECTURE, 'According to the lecturer, why do drivers feel safe?', [
        ['They feel they are in control.', true],
        ['Most accidents are caused by other drivers.', 'Pembicara berkata kecelakaan melibatkan faktor yang tidak bisa dikendalikan, tetapi tidak menyebut pengemudi lain.'],
        ['Road accidents are rarely serious.', 'Pembicara menyebut "thousands of deaths on the roads each year": kecelakaan jalan justru serius, hanya jarang diberitakan.'],
      ], '"Behind the wheel, we feel in charge" = di balik kemudi, kita merasa memegang kendali.', L),
      listen(5, C1_LECTURE, 'What does "That said" introduce?', [
        ['A point that limits the argument before it', true],
        ['A summary of the whole lecture', '"That said" tidak merangkum; ia memberi batasan pada argumen sebelumnya.'],
        ['An example that supports the point before it', 'Contoh diperkenalkan dengan "for instance". "That said" memperkenalkan pertimbangan yang berlawanan arah.'],
      ], '"That said" = meskipun begitu. Setelahnya pembicara mengingatkan agar tidak menyimpulkan bahwa manusia sekadar tidak rasional.', L),
      listen(5, C1_LECTURE, "What is the lecturer's attitude in the last two sentences?", [
        ['Cautious: fear of the unfamiliar may once have been useful.', true],
        ['Critical: people are simply irrational.', '"I\'d be wary of concluding that people are simply irrational" = pembicara justru berhati-hati agar tidak menyimpulkan itu.'],
        ['Certain: fear of the unfamiliar is always helpful.', '"may well have served us" adalah hedging; pembicara tidak berkata "always".'],
      ], '"I\'d be wary of ..." dan "may well have ..." adalah bahasa hati-hati (hedging) khas akademik: pembicara menawarkan kemungkinan, bukan kepastian.', L),
      dictation(4, "Statistically, it's far safer than driving.", "Statistically, it's ___ safer than driving.", ['far'],
        '"far" menguatkan bentuk perbandingan: far safer = jauh lebih aman. Penguat lain yang lazim: much, a lot, considerably.',
        {
          more: ['"more safer" salah karena "safer" sudah bentuk perbandingan. Yang terdengar "far safer" = jauh lebih aman.'],
          very: ['"very" tidak dipakai sebelum bentuk perbandingan. Untuk menguatkan perbandingan pakai far, much, atau a lot.'],
        }, L),
    ],
  },
  {
    id: 'listen-c1-remote', level: 'C1', title: 'Wawancara radio: kerja jarak jauh', kind: 'passage', premium: true,
    transcript: C1_REMOTE,
    translation: 'Saya tidak akan mengatakan kerja jarak jauh gagal. Sama sekali tidak. Yang akan saya katakan adalah kita meremehkan apa yang sebenarnya diberikan kantor kepada kita. Intinya bukan meja atau rapat, melainkan obrolan yang tidak direncanakan siapa pun: pertanyaan singkat di dekat mesin kopi, atau pegawai junior yang ikut mendengar cara seniornya menangani klien yang sulit. Hal-hal seperti itu sulit dijadwalkan. Jadi perusahaan yang berhasil belum tentu yang menyuruh semua orang kembali lima hari seminggu. Mereka adalah perusahaan yang sengaja merencanakan kapan orang datang ke kantor, dan untuk apa.',
    questions: [
      listen(4, C1_REMOTE, "What is the speaker's overall view of remote work?", [
        ['It has not failed, but some of its costs were underestimated.', true],
        ['It has failed and should end.', 'Pembicara membuka dengan "I wouldn\'t say remote work has failed. Not at all."'],
        ['It is better than office work in every way.', 'Pembicara justru menunjukkan apa yang hilang tanpa kantor.'],
      ], 'Pola "I wouldn\'t say X. What I would say is Y" menolak satu kesimpulan lalu menawarkan pandangan yang lebih tepat.', L),
      listen(5, C1_REMOTE, 'According to the speaker, what did the office mainly provide?', [
        ['Unplanned conversations and informal learning', true],
        ['Desks and meeting rooms', 'Pola "not so much A as B" berarti "bukan terutama A, melainkan B". Meja dan rapat adalah A; yang ditekankan adalah B.'],
        ['Closer contact with clients', 'Klien hanya disebut sebagai contoh situasi yang didengar pegawai junior.'],
      ], '"It wasn\'t so much about X as about Y" = intinya bukan X, melainkan Y: obrolan yang tidak direncanakan.', L),
      listen(5, C1_REMOTE, 'Which companies are "getting it right"?', [
        ['Those that plan carefully when and why staff meet in person', true],
        ['Those that bring everyone back five days a week', '"aren\'t necessarily the ones bringing everyone back five days a week" = belum tentu perusahaan seperti itu.'],
        ['Those that let staff decide everything themselves', 'Pembicara menekankan "being deliberate" (sengaja dan terencana), bukan membebaskan sepenuhnya.'],
      ], '"They\'re the ones being deliberate about when people come in, and why." deliberate = disengaja dan dipikirkan matang.', L),
      dictation(4, 'What I would say is that we underestimated what the office was actually doing for us.', 'What I would say is that we ___ what the office was actually doing for us.', ['underestimated'],
        '"underestimate" = meremehkan, menilai terlalu rendah. Bentuk lampaunya diakhiri bunyi /ɪd/ karena kata dasarnya berakhiran t.',
        {
          underestimate: ['Kejadiannya sudah lampau, jadi bentuknya "underestimated". Bunyi /ɪd/ di akhir terdengar jelas karena kata dasarnya berakhiran t.'],
          overestimated: ['Yang terdengar "under-" (meremehkan), bukan "over-" (melebih-lebihkan). Satu awalan ini membalik seluruh makna.'],
        }, L),
    ],
  },
  {
    id: 'listen-c1-survey', level: 'C1', title: 'Presentasi: hasil survei pelanggan', kind: 'passage', premium: true,
    transcript: C1_SURVEY,
    translation: 'Sekarang saya beralih ke hasil survei. Kami menerima sedikit di atas seribu dua ratus tanggapan, kira-kira dua kali lipat jumlah tahun lalu. Sebagian besar responden, sekitar delapan puluh persen, mengatakan mereka puas dengan layanan secara keseluruhan. Namun, kepuasan pengguna berusia di atas enam puluh tahun turun sedikit, dari tujuh puluh satu menjadi enam puluh delapan persen. Keluhan yang paling sering, disebut oleh kira-kira satu dari lima orang, adalah lamanya waktu untuk bisa berbicara dengan petugas sungguhan lewat telepon. Karena itu, prioritas pertama kami tahun depan bukan fitur baru, melainkan layanan bantuan yang lebih cepat.',
    questions: [
      listen(4, C1_SURVEY, 'How many responses did they receive?', [
        ['A little more than 1,200', true],
        ['Exactly 1,200', '"just over" = sedikit di atas, bukan tepat.'],
        ['About 600', 'Sekitar 600 adalah perkiraan jumlah tahun lalu: tahun ini "roughly double last year\'s figure".'],
      ], '"just over twelve hundred" = sedikit di atas 1.200. "twelve hundred" adalah cara lazim menyebut 1.200.', L),
      listen(4, C1_SURVEY, 'What happened to satisfaction among older users?', [
        ['It fell a little.', true],
        ['It rose a little.', '"dropped slightly" = turun sedikit, dari 71% menjadi 68%.'],
        ['It fell sharply.', 'Turunnya hanya tiga poin, jadi "slightly" (sedikit), bukan "sharply" (tajam).'],
      ], '"satisfaction ... dropped slightly, from seventy-one to sixty-eight per cent".', L),
      listen(5, C1_SURVEY, 'What will be the first priority next year, and why?', [
        ['A faster support line, because waiting to speak to a person was the top complaint', true],
        ['A new feature, because most users are satisfied', '"not a new feature but a faster support line" = justru bukan fitur baru.'],
        ['Better service for users over sixty, because their satisfaction fell', 'Penurunan itu disebut, tetapi prioritasnya didasarkan pada keluhan yang paling sering ("Given that, ...").'],
      ], '"Given that" merujuk pada keluhan yang paling sering: lamanya menunggu untuk berbicara dengan petugas.', L),
      dictation(4, 'The most common complaint, mentioned by roughly one in five people, was how long it took to reach a real person on the phone.', 'The most common complaint, mentioned by roughly one in ___ people, was how long it took to reach a real person on the phone.', ['five', '5'],
        '"one in five" = satu dari lima (sekitar 20%). Pola "one in + angka" sangat sering dipakai dalam presentasi data.',
        { four: ['Yang terdengar "five" /faɪv/ dengan bunyi /v/ di akhir, bukan "four" /fɔː/.'] }, L),
    ],
  },
  {
    id: 'listen-c2-app', level: 'C2', title: 'Kolom opini: aplikasi produktivitas', kind: 'passage', premium: true,
    transcript: C2_APP,
    translation: 'Tahun baru, aplikasi "revolusioner" baru yang menjanjikan kita lebih produktif. Yang ini, katanya, akan mengembalikan dua jam sehari saya dengan mengirim pengingat ke ponsel saya yang menyuruh saya berhenti mengecek ponsel. Maafkan saya kalau saya belum sepenuhnya yakin. Masalah kebanyakan alat produktivitas bukan karena alat itu tidak berfungsi, melainkan karena alat itu menggarap masalah yang salah. Hanya sedikit dari kita yang kekurangan pengingat. Yang kita kurang adalah kerelaan untuk membiarkan sebagian hal tidak terselesaikan. Tidak ada aplikasi, seindah apa pun desainnya, yang akan mengambil keputusan itu untuk kita.',
    questions: [
      listen(5, C2_APP, "What is the writer's attitude towards the new app?", [
        ['Sceptical', true],
        ['Enthusiastic', '"Forgive me if I\'m not entirely won over" adalah cara halus untuk berkata "saya tidak yakin".'],
        ['Neutral', 'Penulis jelas mengambil sikap: ia meragukan aplikasi itu dan alat sejenisnya.'],
      ], '"not entirely won over" adalah understatement: kedengarannya lunak, tetapi maksudnya penulis sama sekali tidak yakin.', L),
      listen(5, C2_APP, 'What is ironic about the app?', [
        ['It sends phone reminders to stop people checking their phones.', true],
        ['It takes two hours a day to use.', '"give me back two hours a day" = mengembalikan dua jam, bukan menghabiskan dua jam.'],
        ['It is beautifully designed but does not work.', 'Penulis justru berkata masalahnya "isn\'t that they don\'t work".'],
      ], 'Ironinya: aplikasi yang ingin mengurangi pemakaian ponsel bekerja dengan cara mengirim notifikasi ke ponsel.', L),
      listen(5, C2_APP, 'According to the writer, what is the real problem?', [
        ['People are unwilling to leave some tasks undone.', true],
        ['People do not receive enough reminders.', '"Few of us are short of reminders" = hampir tidak ada yang kekurangan pengingat.'],
        ['Productivity apps do not work.', '"isn\'t that they don\'t work; it\'s that they work on the wrong problem" = masalahnya bukan aplikasinya tidak berfungsi.'],
      ], '"What we\'re short of is the willingness to let some things go undone." Kalimat cleft "What we\'re short of is ..." menandai inti argumen.', L),
      dictation(4, "Forgive me if I'm not entirely won over.", "Forgive me if I'm not entirely ___ over.", ['won'],
        '"be won over" = berhasil diyakinkan atau dibujuk. "won" adalah bentuk ketiga "win" dan diucapkan /wʌn/, persis seperti "one".',
        {
          one: ['"one" dan "won" diucapkan sama /wʌn/. Ungkapannya "be won over" = berhasil diyakinkan, dengan "won" dari kata kerja "win".'],
          want: ['"want" diucapkan /wɒnt/ dengan bunyi /t/ di akhir. Yang terdengar "won" /wʌn/ dari ungkapan "be won over".'],
        }, L),
    ],
  },
  {
    id: 'listen-c2-tax', level: 'C2', title: 'Debat: pajak gula', kind: 'passage', premium: true,
    transcript: C2_TAX,
    translation: 'Pendukung pajak gula menunjuk turunnya konsumsi di mana pun pajak itu diterapkan, dan hal itu sulit dibantah. Memang, orang membeli lebih sedikit minuman manis ketika harganya lebih mahal. Tetapi tidak otomatis berarti mereka menjadi lebih sehat. Kalau mereka sekadar beralih ke permen atau kue, yang tidak dikenai pajak itu, dampak keseluruhannya bisa sangat kecil. Bagaimanapun, saya tidak menentang pajaknya itu sendiri. Maksud saya, kita tidak boleh menilainya hanya dari angka penjualan, tetapi dari apakah angka diabetes dan obesitas benar-benar turun.',
    questions: [
      listen(5, C2_TAX, 'Which point does the speaker accept?', [
        ['The tax reduces sales of sugary drinks.', true],
        ['The tax makes people healthier.', '"it doesn\'t follow that they end up any healthier" = belum tentu membuat orang lebih sehat; justru ini yang diragukan.'],
        ['The tax should cover sweets and cakes.', 'Pembicara menyebut permen dan kue tidak dikenai pajak, tetapi tidak mengusulkan agar pajaknya diperluas.'],
      ], '"that much is hard to dispute" dan "Granted, ..." menandai bagian yang diakui benar sebelum pembicara menyanggah.', L),
      listen(5, C2_TAX, 'What does "it doesn\'t follow that" mean here?', [
        ['It is not a logical result that', true],
        ['It is a direct result that', 'Kebalikannya. "it doesn\'t follow that ..." = tidak otomatis berarti ...'],
        ['It happens later that', '"follow" di sini bukan "terjadi sesudahnya", melainkan "dapat disimpulkan secara logis".'],
      ], '"it doesn\'t follow that X" = dari fakta sebelumnya tidak bisa disimpulkan X. Ungkapan ini sering dipakai untuk menyanggah lompatan logika.', L),
      listen(5, C2_TAX, "What is the speaker's main argument?", [
        ['The tax should be judged by health results, not sales.', true],
        ['The tax should be abolished.', '"I\'m not arguing against the tax as such" = pembicara tidak menentang pajaknya.'],
        ['The tax should be raised.', 'Tidak ada usulan untuk menaikkan tarif pajak.'],
      ], '"we shouldn\'t judge it by sales figures alone, but by whether rates of diabetes and obesity actually come down."', L),
      dictation(5, "If they simply switch to sweets or cakes, which the tax doesn't cover, the overall effect could be negligible.", "If they simply switch to sweets or cakes, which the tax doesn't cover, the overall effect could be ___.", ['negligible'],
        '"negligible" /ˈneɡlɪdʒəbl/ = sangat kecil sehingga bisa diabaikan. Akhiran -ible diucapkan lemah /əbl/.',
        {
          negligent: ['"negligent" = lalai (sifat orang). Yang terdengar "negligible" = sangat kecil sehingga bisa diabaikan.'],
          negligable: ['Ejaannya "negligible" dengan -ible. Akhiran -able dan -ible berbunyi sama, jadi ejaan ini perlu dihafal.'],
        }, L),
    ],
  },
  {
    id: 'listen-c2-move', level: 'C2', title: 'Cerita pendek: hari pindahan', kind: 'passage', premium: true,
    transcript: C2_MOVE,
    translation: 'Baru setelah kotak terakhir diangkut keluar, saya menyadari betapa riuhnya flat itu sekarang. Setiap langkah bergema. Selama sebelas tahun, ruangan-ruangan itu menyerap pertengkaran kami, pesta kami, latihan piano tetangga yang tak ada habisnya. Kini semuanya dipantulkan kembali. Kakak saya, yang selalu praktis, sudah mencatat angka meteran. Saya berdiri di ambang pintu sedikit lebih lama dari yang perlu. Tidak sekali pun selama bertahun-tahun itu saya menganggap tempat itu indah. Saya juga tidak yakin akan menyebutnya indah sekarang. Tetapi saya tahu saya akan merindukannya.',
    questions: [
      listen(5, C2_MOVE, 'Why had the flat become so loud?', [
        ['It was empty, so every sound echoed.', true],
        ['The neighbours were practising the piano.', 'Latihan piano tetangga adalah kenangan selama sebelas tahun, bukan penyebab gema hari itu.'],
        ['The narrator and the sister were arguing.', 'Pertengkaran adalah kenangan masa lalu yang dulu "diserap" ruangan.'],
      ], 'Setelah kotak terakhir keluar, ruangan kosong: "Every step echoed." Dulu ruangan menyerap suara; kini memantulkannya ("gave everything back").', L),
      listen(5, C2_MOVE, 'How is the sister different from the narrator?', [
        ['She focuses on practical tasks rather than feelings.', true],
        ['She is sadder than the narrator about leaving.', '"ever practical" dan sibuk mencatat meteran menunjukkan ia tidak larut dalam perasaan.'],
        ['She wants to stay in the flat.', 'Tidak ada petunjuk bahwa ia ingin tinggal.'],
      ], '"My sister, ever practical, was already writing down the meter readings" kontras dengan narator yang berdiri lebih lama di ambang pintu.', L),
      listen(5, C2_MOVE, 'How does the narrator feel at the end?', [
        ['Attached to the flat, although it was never beautiful to them', true],
        ['Relieved to leave an ugly flat', '"But I knew I would miss it" menunjukkan keterikatan, bukan rasa lega.'],
        ['Proud of how beautiful the flat was', '"Not once ... had I thought of the place as beautiful" = narator tidak pernah menganggapnya indah.'],
      ], 'Narator tidak menganggap flat itu indah, tetapi tetap akan merindukannya. Perasaannya tersirat dari tindakan (berdiri lebih lama) dan kalimat terakhir.', L),
      dictation(4, 'Not once in all those years had I thought of the place as beautiful.', 'Not once in all those years ___ I thought of the place as beautiful.', ['had'],
        'Setelah ungkapan negatif "Not once" di awal kalimat terjadi inversi: had + subjek + bentuk ketiga. Ceritanya lampau, jadi dipakai past perfect.',
        {
          have: ['Ceritanya di masa lampau, jadi bentuknya "had" (past perfect). Setelah "Not once" terjadi inversi: had + I + thought.'],
          did: ['"did" diikuti bentuk dasar (did I think). Yang terdengar "had I thought": past perfect dengan inversi setelah "Not once".'],
        }, L),
    ],
  },
];
