// Branching stories (Rilis 5): illustrated scenes like the other stories, but
// at each turn the learner chooses what their character says. Each choice is
// graded like a conversation reply (grammar and how natural it sounds), and
// the choices decide which scene comes next and how the story ends.
// "correct: false" always means a grammar error; a grammatical but tactless
// reply is correct with low naturalness and may lead to a weaker ending.
import type { StoryChoice, StoryNode, StoryScene } from '@/lib/content/types';
import { C, at, say, tell, type StoryDraft } from './stories';

const ch = (text: string, correct: boolean, natural: StoryChoice['natural'], note: string, next: string, better?: string): StoryChoice => ({ text, correct, natural, note, next, ...(better ? { better } : {}) });
const choose = (id: string, scene: StoryScene, ask: string, choices: StoryChoice[]): StoryNode => ({ id, scene, ask, choices });
const end = (id: string, scene: StoryScene, good: boolean, title: string, text: string): StoryNode => ({ id, scene, ending: { good, title, text } });

export const branchStories: StoryDraft[] = [
  {
    id: 'story-cafe-interview', level: 'B1', title: 'Wawancara di Kafe', premium: true,
    summary: 'Sari melamar kerja akhir pekan di sebuah kafe. Kamu yang menentukan jawabannya kepada Tom, sang manajer.',
    characters: [C.sari, C.tom],
    questions: [],
    scenes: [
      { backdrop: 'cafe', actors: [at('sari', 'left', 'stand', 'left'), at('tom', 'right')], lines: [
        tell('On Saturday morning, Sari goes to a small café near the station for a job interview.', 'Sabtu pagi, Sari datang ke sebuah kafe kecil dekat stasiun untuk wawancara kerja.'),
        say('tom', "Hi, you must be Sari. I'm Tom, the manager. Thanks for coming in.", 'Hai, kamu pasti Sari. Saya Tom, manajernya. Terima kasih sudah datang.', 'wave'),
        say('sari', 'Nice to meet you, Tom. Thank you for inviting me.', 'Senang bertemu Anda, Tom. Terima kasih sudah mengundang saya.', 'happy'),
      ] },
    ],
    branch: {
      as: 'sari', start: 'n1',
      nodes: [
        choose('n1', { backdrop: 'cafe', actors: [at('sari', 'left'), at('tom', 'right', 'think')], lines: [
          say('tom', 'So, have you ever worked in a café before?', 'Jadi, apakah kamu pernah bekerja di kafe sebelumnya?', 'think'),
        ] }, 'Apa jawaban Sari?', [
          ch("No, I haven't, but I've helped at my aunt's food stall for two years.", true, 3, 'Present perfect untuk pengalaman ("I haven\'t", "I\'ve helped ... for two years"), lalu pengalaman yang relevan. Jujur dan meyakinkan.', 'n2'),
          ch('No, I never worked in a café before.', false, 2, 'Dengan "ever ... before" (pengalaman sampai sekarang) pakai present perfect: I\'ve never worked.', 'n2', "No, I've never worked in a café, but I've helped at my aunt's stall."),
          ch('No. Is that a problem?', true, 1, 'Tata bahasanya benar, tetapi terdengar defensif dan melewatkan kesempatan menunjukkan pengalaman lain.', 'n1b', "No, I haven't, but I've worked at my aunt's food stall."),
        ]),
        choose('n1b', { backdrop: 'cafe', actors: [at('sari', 'left', 'sad'), at('tom', 'right')], lines: [
          say('tom', 'Not necessarily. Tell me a bit about yourself.', 'Belum tentu. Ceritakan sedikit tentang dirimu.'),
        ] }, 'Sari ingin memperbaiki kesan pertama. Apa yang ia katakan?', [
          ch("Sorry, that came out wrong. I'm a student, and I've been helping at my aunt's stall since I was fifteen.", true, 3, 'Meminta maaf singkat lalu memberi informasi yang berguna, dengan present perfect continuous + since.', 'n2'),
          ch('I am student and I like coffee.', false, 1, 'Butuh artikel sebelum pekerjaan: I am a student. Jawabannya juga terlalu tipis untuk wawancara.', 'n2', "I'm a student, and I've worked at my aunt's stall for two years."),
        ]),
        choose('n2', { backdrop: 'cafe', actors: [at('sari', 'left'), at('tom', 'right', 'point')], lines: [
          say('tom', 'OK. What would you do if a customer complained about their order?', 'Oke. Apa yang akan kamu lakukan kalau pelanggan mengeluhkan pesanannya?', 'point'),
        ] }, 'Apa jawaban Sari?', [
          ch("I'd apologise, listen carefully, and offer to make it again.", true, 3, 'Second conditional dijawab dengan "I\'d + bentuk dasar", dan tiga langkah yang jelas.', 'n3'),
          ch('If a customer will complain, I apologise.', false, 1, 'Bagian if tidak memakai will. Untuk pengandaian: If a customer complained, I would apologise.', 'n3', "If a customer complained, I'd apologise and offer to make it again."),
          ch("I'd tell them the coffee is fine.", true, 1, 'Tata bahasanya benar, tetapi membantah pelanggan bukan jawaban yang dicari manajer.', 'n3', "I'd apologise and ask what was wrong with it."),
        ]),
        choose('n3', { backdrop: 'cafe', actors: [at('sari', 'left'), at('tom', 'right', 'happy')], lines: [
          say('tom', 'Great answer. Last question: can you work on Saturday mornings?', 'Jawaban bagus. Pertanyaan terakhir: bisakah kamu bekerja Sabtu pagi?', 'happy'),
        ] }, 'Apa jawaban Sari?', [
          ch("Yes, I can. I'm free every Saturday until two o'clock.", true, 3, 'Jawaban pendek yang tepat ("Yes, I can") ditambah informasi yang membantu manajer menyusun jadwal.', 'e-good'),
          ch("Yes, I'm used to get up early.", false, 2, '"be used to" (terbiasa) diikuti -ing: I\'m used to getting up early.', 'e-good', "Yes, I'm used to getting up early."),
          ch("Maybe. I don't really like mornings.", true, 1, 'Jujur dan gramatikal, tetapi meragukan dalam wawancara untuk shift pagi.', 'e-ok', "Yes, I can. Mornings are fine for me."),
        ]),
        end('e-good', { backdrop: 'cafe', actors: [at('sari', 'left', 'happy'), at('tom', 'right', 'wave')], lines: [
          say('tom', "I'd like to offer you the job. Can you start next Saturday?", 'Saya ingin menawarimu pekerjaan ini. Bisa mulai Sabtu depan?', 'happy'),
          say('sari', "Yes, definitely! Thank you so much, Tom.", 'Ya, tentu! Terima kasih banyak, Tom.', 'happy'),
        ] }, true, 'Diterima!', 'Sari menjawab dengan jelas, jujur, dan sopan. Tom menawarinya pekerjaan mulai Sabtu depan.'),
        end('e-ok', { backdrop: 'cafe', actors: [at('sari', 'left', 'think'), at('tom', 'right')], lines: [
          say('tom', "Thanks, Sari. We'll let you know by Friday.", 'Terima kasih, Sari. Kami akan mengabarimu paling lambat Jumat.'),
          tell('Sari walks home, wondering whether her last answer was a mistake.', 'Sari berjalan pulang, bertanya-tanya apakah jawaban terakhirnya keliru.'),
        ] }, false, 'Menunggu kabar', 'Wawancaranya berjalan cukup baik, tetapi jawaban terakhir membuat Tom ragu. Coba lagi untuk mendapatkan akhir terbaik.'),
      ],
    },
  },
  {
    id: 'story-wrong-file', level: 'B2', title: 'File yang Salah', premium: true,
    summary: 'Dimas magang di sebuah toko dan mengirim daftar harga lama kepada pelanggan besar. Kamu yang menentukan cara Dimas menghadapinya.',
    characters: [C.dimas, C.emma],
    questions: [],
    scenes: [
      { backdrop: 'shop', actors: [at('dimas', 'left', 'stand', 'left'), at('emma', 'right', 'surprised')], lines: [
        tell("It's Monday morning at the shop where Dimas is doing his internship. Ms Emma, the manager, looks worried.", 'Senin pagi di toko tempat Dimas magang. Bu Emma, manajernya, tampak cemas.'),
        say('emma', 'Dimas, have you got a minute? We have a problem.', 'Dimas, ada waktu sebentar? Kita punya masalah.', 'surprised'),
      ] },
    ],
    branch: {
      as: 'dimas', start: 'n1',
      nodes: [
        choose('n1', { backdrop: 'shop', actors: [at('dimas', 'left', 'think'), at('emma', 'right')], lines: [
          say('emma', "The client says they received last year's price list from you on Friday. What happened?", 'Klien bilang mereka menerima daftar harga tahun lalu darimu hari Jumat. Apa yang terjadi?'),
        ] }, 'Apa jawaban Dimas?', [
          ch("I'm afraid I sent the wrong file. I should have checked it before sending it.", true, 3, 'Mengakui kesalahan dengan sopan ("I\'m afraid") dan "should have + bentuk ketiga" untuk penyesalan.', 'n2'),
          ch("It wasn't me. The system must have sent it.", true, 1, 'Tata bahasanya benar (must have + bentuk ketiga), tetapi menyalahkan sistem tanpa memeriksa membuat atasan curiga.', 'n1b', "Let me check. I'm afraid I may have sent the wrong file."),
          ch("I'm afraid I've sent the wrong file on Friday.", false, 2, 'Dengan waktu lampau yang jelas ("on Friday") pakai past simple: I sent.', 'n2', "I'm afraid I sent the wrong file on Friday."),
        ]),
        choose('n1b', { backdrop: 'shop', actors: [at('dimas', 'left', 'sad'), at('emma', 'right', 'point')], lines: [
          say('emma', 'Really? The email came from your account.', 'Masa? Emailnya dikirim dari akunmu.', 'point'),
        ] }, 'Bagaimana Dimas memperbaiki situasinya?', [
          ch("You're right, I'm sorry. I sent it by mistake, and I should have admitted it straight away.", true, 3, 'Mengakui dengan jujur dan cepat memulihkan kepercayaan.', 'n2'),
          ch('OK, maybe I sent it, but nobody told me which file to use.', true, 1, 'Gramatikal, tetapi tetap mengalihkan kesalahan.', 'n2', "I'm sorry. I sent it by mistake. Could you show me where the latest files are?"),
        ]),
        choose('n2', { backdrop: 'shop', actors: [at('dimas', 'left'), at('emma', 'right', 'think')], lines: [
          say('emma', 'These things happen. What did the client say exactly?', 'Hal seperti ini bisa terjadi. Apa persisnya kata klien?', 'think'),
        ] }, 'Dimas melaporkan ucapan klien. Pilih kalimatnya.', [
          ch('She said that they had already printed the old prices, and she asked whether we could send the new list today.', true, 3, 'Reported speech yang tepat: tense mundur (had printed) dan pertanyaan tidak langsung (whether we could).', 'n3'),
          ch('She said that they have already printed the old prices and asked could we send the new list.', false, 2, 'Tense perlu dimundurkan (had printed), dan pertanyaan tidak langsung memakai urutan biasa: whether we could send.', 'n3', 'She said they had already printed the old prices and asked whether we could send the new list.'),
          ch("She was angry. I don't remember the details.", true, 1, 'Gramatikal, tetapi tidak membantu atasan memahami masalahnya.', 'n3', 'She said they had already printed the old prices.'),
        ]),
        choose('n3', { backdrop: 'shop', actors: [at('dimas', 'left'), at('emma', 'right')], lines: [
          say('emma', "OK, I'll call her. How can we make sure this doesn't happen again?", 'Oke, saya akan meneleponnya. Bagaimana caranya supaya ini tidak terulang?'),
        ] }, 'Apa usul Dimas?', [
          ch("If I had used the shared folder, I would have seen the latest version. From now on, I'll always check it first.", true, 3, 'Third conditional untuk menganalisis penyebab, lalu janji konkret ke depan.', 'e-good'),
          ch('If I would have used the shared folder, I would have seen it.', false, 2, 'Bagian if dalam third conditional: If I had used ...', 'e-good', 'If I had used the shared folder, I would have seen the right version.'),
          ch('I wish the client would read things more carefully.', true, 1, 'Gramatikal (wish + would), tetapi menyalahkan klien atas kesalahan sendiri.', 'e-ok', "I'll always use the shared folder from now on."),
        ]),
        end('e-good', { backdrop: 'shop', actors: [at('dimas', 'left', 'happy'), at('emma', 'right', 'happy')], lines: [
          say('emma', 'Good. That was honest, and that matters more than one wrong file.', 'Bagus. Itu jujur, dan itu lebih penting daripada satu file yang salah.', 'happy'),
          tell('By lunchtime, the client has the new price list and a short apology from Dimas.', 'Menjelang makan siang, klien sudah menerima daftar harga baru dan permintaan maaf singkat dari Dimas.'),
        ] }, true, 'Kepercayaan terjaga', 'Dimas mengakui kesalahannya, melaporkan masalah dengan jelas, dan mengusulkan perbaikan. Bu Emma justru makin percaya padanya.'),
        end('e-ok', { backdrop: 'shop', actors: [at('dimas', 'left', 'sad'), at('emma', 'right')], lines: [
          say('emma', "Let's talk about this again at the end of the week.", 'Kita bicarakan lagi soal ini di akhir minggu.'),
          tell('Dimas realises that blaming others has not helped.', 'Dimas sadar bahwa menyalahkan orang lain tidak membantu.'),
        ] }, false, 'Masih ada yang mengganjal', 'Masalahnya selesai, tetapi sikap Dimas membuat Bu Emma ragu. Coba lagi dengan jawaban yang lebih bertanggung jawab.'),
      ],
    },
  },
  {
    id: 'story-park-meeting', level: 'C1', title: 'Rapat Warga: Taman atau Parkir?', premium: true,
    summary: 'Dewan kota ingin mengubah taman dekat stasiun menjadi tempat parkir. Sari mewakili para pelajar di rapat warga. Kamu yang menyusun argumennya.',
    characters: [C.sari, C.joko, C.tom],
    questions: [],
    scenes: [
      { backdrop: 'park', time: 'evening', actors: [at('joko', 'left'), at('sari', 'center', 'stand', 'fade'), at('tom', 'right')], lines: [
        tell('A public meeting is being held in the park near the station. The council wants to turn it into a car park.', 'Rapat warga diadakan di taman dekat stasiun. Dewan kota ingin mengubahnya menjadi tempat parkir.'),
        say('joko', 'Good evening, everyone. Tonight we will hear from residents and local businesses.', 'Selamat malam, semuanya. Malam ini kita akan mendengar pendapat warga dan pemilik usaha setempat.'),
      ] },
    ],
    branch: {
      as: 'sari', start: 'n1',
      nodes: [
        choose('n1', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left', 'point'), at('sari', 'center'), at('tom', 'right')], lines: [
          say('joko', 'Sari, you asked to speak on behalf of the students. Please go ahead.', 'Sari, kamu meminta waktu bicara mewakili para pelajar. Silakan.', 'point'),
        ] }, 'Bagaimana Sari membuka?', [
          ch("Thank you, Pak Joko. I'd like to explain why we believe the park should stay.", true, 3, 'Pembukaan formal yang sopan dan langsung menyatakan posisi.', 'n2'),
          ch('Thanks. So, basically, the car park idea is rubbish.', true, 1, 'Gramatikal, tetapi register terlalu santai dan menghina untuk rapat resmi.', 'n1b', "Thank you. I'd like to explain why we oppose the car park."),
          ch('Thank you. I want to explain why do we believe the park should stay.', false, 2, 'Pertanyaan tidak langsung memakai urutan biasa: why we believe.', 'n2', "Thank you. I'd like to explain why we believe the park should stay."),
        ]),
        choose('n1b', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left', 'sad'), at('sari', 'center'), at('tom', 'right')], lines: [
          say('joko', 'Please keep it respectful, Sari.', 'Mohon tetap santun, Sari.', 'sad'),
        ] }, 'Apa yang Sari katakan?', [
          ch('Of course, I apologise. Let me explain our reasons properly.', true, 3, 'Permintaan maaf formal lalu kembali ke argumen.', 'n2'),
          ch("Sorry, but it is rubbish.", true, 1, 'Mengulang hinaan membuat ketua rapat dan warga lain kehilangan simpati.', 'n2', 'I apologise. Let me explain why we disagree.'),
        ]),
        choose('n2', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left'), at('sari', 'center', 'think'), at('tom', 'right', 'point')], lines: [
          say('tom', "With respect, the shops are losing customers. People say there's nowhere to park.", 'Maaf, toko-toko kehilangan pelanggan. Orang bilang tidak ada tempat parkir.', 'point'),
        ] }, 'Sari menanggapi Tom. Pilih jawabannya.', [
          ch('I do understand that. However, it is estimated that most of your customers walk from the station, so a car park may not bring as many as you hope.', true, 3, '"I do understand" mengakui keberatan, pasif impersonal "it is estimated that" menyampaikan data, dan "may" menjaga klaim tetap berhati-hati.', 'n3'),
          ch('It is said the shoppers to come by train.', false, 2, 'Pola impersonal: It is said that shoppers come by train, atau Shoppers are said to come by train.', 'n3', 'Most shoppers are said to come by train.'),
          ch('Nobody cares about parking.', true, 1, 'Gramatikal, tetapi meremehkan kekhawatiran pemilik toko.', 'n3', 'I understand the concern, but most customers arrive on foot.'),
        ]),
        choose('n3', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left', 'think'), at('sari', 'center'), at('tom', 'right')], lines: [
          say('joko', 'So what do you propose instead?', 'Jadi, apa usulanmu sebagai gantinya?', 'think'),
        ] }, 'Apa usulan Sari?', [
          ch('We suggest that the council add bike racks and a shuttle bus from the station, which would cost far less than a car park.', true, 3, '"suggest that the council add" (subjunctive formal) dan argumen biaya yang konkret.', 'e-good'),
          ch('We suggest the council to build bike racks instead.', false, 2, 'Tidak ada pola "suggest someone to". Pakai: suggest that the council build ...', 'e-good', 'We suggest that the council build bike racks instead.'),
          ch('Just leave the park alone.', true, 1, 'Gramatikal, tetapi tidak menawarkan solusi untuk masalah pemilik toko.', 'e-ok', 'We suggest keeping the park and adding a shuttle from the station.'),
        ]),
        end('e-good', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left', 'happy'), at('sari', 'center', 'happy'), at('tom', 'right', 'happy')], lines: [
          say('tom', "Actually, a shuttle from the station would help my shop too.", 'Sebenarnya, bus antar dari stasiun juga akan membantu toko saya.', 'happy'),
          say('joko', 'Then I propose we try it for six months before deciding on the car park.', 'Kalau begitu saya usulkan kita coba selama enam bulan sebelum memutuskan soal parkir.', 'happy'),
        ] }, true, 'Taman tetap ada', 'Sari mendengarkan, menjawab dengan data, dan menawarkan solusi. Bahkan Tom setuju. Dewan sepakat mencoba bus antar selama enam bulan.'),
        end('e-ok', { backdrop: 'park', time: 'evening', actors: [at('joko', 'left'), at('sari', 'center', 'sad'), at('tom', 'right')], lines: [
          say('joko', 'Thank you. The council will make its decision next month.', 'Terima kasih. Dewan akan memutuskan bulan depan.'),
        ] }, false, 'Keputusan ditunda', 'Sari menyampaikan pendapat, tetapi tanpa solusi yang meyakinkan pemilik toko. Coba lagi dengan usulan yang konkret.'),
      ],
    },
  },
  {
    id: 'story-deadline-deal', level: 'C2', title: 'Negosiasi di Menit Terakhir', premium: true,
    summary: 'Proyek aplikasi Tom terlambat dua minggu, dan kliennya, Bu Emma, kecewa. Kamu yang menentukan cara Tom bernegosiasi.',
    characters: [C.tom, C.emma],
    questions: [],
    scenes: [
      { backdrop: 'cafe', actors: [at('tom', 'left', 'stand', 'left'), at('emma', 'right', 'sad')], lines: [
        tell("Tom has asked Ms Emma, his biggest client, to meet him at a café. The app his team is building won't be ready on time.", 'Tom meminta Bu Emma, klien terbesarnya, bertemu di sebuah kafe. Aplikasi yang dibuat timnya tidak akan selesai tepat waktu.'),
        say('emma', "I'll be honest, Tom. A two-week delay is not what we signed up for.", 'Terus terang, Tom. Keterlambatan dua minggu bukan yang kami sepakati.', 'sad'),
      ] },
    ],
    branch: {
      as: 'tom', start: 'n1',
      nodes: [
        choose('n1', { backdrop: 'cafe', actors: [at('tom', 'left', 'think'), at('emma', 'right')], lines: [
          say('emma', 'So, what do you have to say?', 'Jadi, apa yang mau kamu sampaikan?'),
        ] }, 'Bagaimana Tom menanggapi?', [
          ch("I completely understand, and I won't pretend it's ideal. Much as we'd like to deliver on time, rushing would mean cutting corners on security.", true, 3, 'Mengakui kekecewaan, lalu konsesi "Much as ..." dan idiom "cutting corners" menjelaskan alasannya tanpa membela diri.', 'n2'),
          ch("It's only two weeks. It's not a big deal.", true, 1, 'Gramatikal, tetapi meremehkan masalah klien.', 'n1b', "I understand, and I'm sorry. Two weeks is a real problem for you."),
          ch("Much as we'd like to deliver on time, but rushing would be risky.", false, 2, '"Much as" sudah bermakna "walaupun", jadi tidak diikuti "but".', 'n2', "Much as we'd like to deliver on time, rushing would be risky."),
        ]),
        choose('n1b', { backdrop: 'cafe', actors: [at('tom', 'left', 'sad'), at('emma', 'right', 'point')], lines: [
          say('emma', 'It is a big deal for us. Our campaign starts on the first.', 'Itu masalah besar bagi kami. Kampanye kami mulai tanggal satu.', 'point'),
        ] }, 'Tom perlu memperbaiki suasana. Apa katanya?', [
          ch("You're right, and I'm sorry. I didn't mean to play it down. Let me explain what we can do.", true, 3, 'Permintaan maaf yang tulus dan langsung beralih ke solusi.', 'n2'),
          ch('Well, campaigns can move too.', true, 1, 'Gramatikal, tetapi memindahkan beban masalah kepada klien.', 'n2', "I'm sorry. Let me show you how we can still support your campaign."),
        ]),
        choose('n2', { backdrop: 'cafe', actors: [at('tom', 'left'), at('emma', 'right', 'think')], lines: [
          say('emma', 'So what are you offering?', 'Jadi apa tawaranmu?', 'think'),
        ] }, 'Apa tawaran Tom?', [
          ch('Were we to launch a basic version on the first, the full app could follow two weeks later, albeit without online payment at first.', true, 3, 'Inversi kondisional formal "Were we to ..." dan "albeit" + frasa menyampaikan kompromi dengan presisi.', 'n3'),
          ch('If we would launch a basic version, the full app could follow later.', false, 2, 'Bagian if tidak memakai would: If we launched ..., atau Were we to launch ...', 'n3', 'If we launched a basic version on the first, the full app could follow later.'),
          ch("Nothing, I'm afraid. The new date is the new date.", true, 1, 'Gramatikal, tetapi menutup negosiasi tanpa kompromi.', 'n3', 'We could launch a basic version on the first and the full app two weeks later.'),
        ]),
        choose('n3', { backdrop: 'cafe', actors: [at('tom', 'left'), at('emma', 'right', 'happy')], lines: [
          say('emma', "That could work. But I'd want the new dates in writing.", 'Itu bisa jalan. Tetapi saya ingin tanggal barunya tertulis.', 'happy'),
        ] }, 'Apa jawaban Tom?', [
          ch("Of course. I'd suggest that we add the new dates to the contract as a short amendment, so we're all on the same page.", true, 3, '"suggest that we add" dan idiom "on the same page" yang wajar dalam rapat bisnis.', 'e-good'),
          ch("Of course. I'd suggest that we putting it in writing today.", false, 2, 'Setelah "suggest that we", bentuk dasar: put.', 'e-good', "Of course. I'd suggest that we put it in writing today."),
          ch('Is that really necessary? You can trust us.', true, 1, 'Gramatikal, tetapi menolak permintaan wajar setelah proyek terlambat merusak kepercayaan.', 'e-ok', "Of course. I'll send you an amendment this afternoon."),
        ]),
        end('e-good', { backdrop: 'cafe', actors: [at('tom', 'left', 'happy'), at('emma', 'right', 'happy')], lines: [
          say('emma', "All right, Tom. Send me the amendment today and let's make it work.", 'Baiklah, Tom. Kirimkan perubahannya hari ini dan mari kita jalankan.', 'happy'),
          tell('Tom leaves the café with a new plan and, perhaps more importantly, the client still on his side.', 'Tom meninggalkan kafe dengan rencana baru dan, yang mungkin lebih penting, klien yang tetap berpihak padanya.'),
        ] }, true, 'Kesepakatan tercapai', 'Tom mengakui masalahnya, menawarkan kompromi yang presisi, dan memberi kepastian tertulis. Hubungan dengan klien justru menguat.'),
        end('e-ok', { backdrop: 'cafe', actors: [at('tom', 'left', 'sad'), at('emma', 'right')], lines: [
          say('emma', 'I need to discuss this with my director. I will let you know.', 'Saya perlu membicarakan ini dengan direktur saya. Nanti saya kabari.'),
        ] }, false, 'Belum ada kesepakatan', 'Tawaran Tom masuk akal, tetapi sikapnya membuat Bu Emma ragu. Coba lagi untuk mencapai kesepakatan.'),
      ],
    },
  },
];
