// Real-life simulations. Every line and every piece of feedback is written
// by hand; the app only walks the dialogue tree.
import type { Cefr, Scenario, ScenarioNode } from '@/lib/content/types';

type O = [text: string, correct: boolean, natural: 1 | 2 | 3, grammar: string, alternatives: string[], next: string];
type N = [id: string, speaker: string, line: string, lineId: string, options: O[]];

const scenario = (id: string, title: string, level: Cefr, premium: boolean, setting: string, goal: string, closing: string, nodes: N[]): Scenario => ({
  id, title, level, premium, setting, goal, closing,
  start: nodes[0][0],
  nodes: nodes.map(([nid, speaker, line, lineId, options]): ScenarioNode => ({
    id: nid, speaker, line, lineId,
    options: options.map(([text, correct, natural, grammar, alternatives, next]) => ({ text, correct, natural, grammar, alternatives, next })),
  })),
});

export const scenarios: Scenario[] = [
  scenario('introduce', 'Memperkenalkan Diri', 'A1', false, 'Hari pertama di kelas bahasa Inggris. Seorang teman baru menyapamu.', 'Menyapa, menyebut nama dan asal, lalu menutup perkenalan dengan sopan.', 'Kamu berhasil berkenalan. Tiga langkahnya: sapa, sebut nama dan asal, lalu tanya balik.', [
    ['n1', 'Emma', "Hi! I'm Emma. What's your name?", 'Hai! Saya Emma. Siapa namamu?', [
      ["Hi, Emma. I'm Dimas. Nice to meet you.", true, 3, 'Sapaan + "I\'m" + nama, ditutup dengan "Nice to meet you". Lengkap dan wajar.', ['Hello, Emma. My name is Dimas.'], 'n2'],
      ['My name Dimas.', false, 1, 'Kalimat ini tidak punya kata kerja. Tambahkan "is": My name is Dimas.', ['My name is Dimas.', "I'm Dimas."], 'r1'],
      ['I am Dimas.', true, 2, 'Benar secara tata bahasa, tetapi terasa kaku karena tidak membalas sapaan Emma.', ["Hi, I'm Dimas.", "Hi, Emma. I'm Dimas."], 'n2'],
    ]],
    ['r1', 'Emma', "Sorry, what's your name again?", 'Maaf, siapa namamu tadi?', [
      ['My name is Dimas.', true, 3, 'Sekarang kalimatnya lengkap: subjek + is + nama.', ["I'm Dimas."], 'n2'],
      ['Name Dimas.', false, 1, 'Masih belum ada subjek lengkap dan kata kerja. Pola: My name is ...', ['My name is Dimas.'], 'n2'],
      ["It's Dimas.", true, 3, 'Jawaban pendek yang sangat wajar ketika nama ditanyakan ulang.', ['Dimas.'], 'n2'],
    ]],
    ['n2', 'Emma', 'Nice to meet you, Dimas. Where are you from?', 'Senang bertemu denganmu, Dimas. Kamu dari mana?', [
      ["I'm from Bandung, Indonesia. And you?", true, 3, '"I\'m from" + tempat, lalu bertanya balik dengan "And you?".', ['I come from Bandung. How about you?'], 'n3'],
      ['I from Bandung.', false, 1, 'Setelah "I" harus ada "am": I am from Bandung.', ["I'm from Bandung."], 'n3'],
      ['From Bandung.', true, 2, 'Bisa dimengerti dan lazim dalam obrolan cepat, tetapi kurang ramah karena tidak bertanya balik.', ["I'm from Bandung. And you?"], 'n3'],
    ]],
    ['n3', 'Emma', "I'm from Manchester, in England. Are you a new student here?", 'Saya dari Manchester, Inggris. Apakah kamu murid baru di sini?', [
      ['Yes, I am. This is my first day.', true, 3, 'Jawaban singkat "Yes, I am" + informasi tambahan. Sangat wajar.', ["Yes, I am. It's my first day."], 'end'],
      ['Yes, I do.', false, 1, 'Pertanyaannya memakai "Are you ...?", jadi jawabannya "Yes, I am", bukan "Yes, I do".', ['Yes, I am.'], 'end'],
      ['Yes, I am new student.', false, 2, 'Kurang artikel: "a new student".', ['Yes, I am a new student.'], 'end'],
    ]],
  ]),
  scenario('restaurant', 'Memesan Makanan di Restoran', 'A1', false, 'Kamu duduk di sebuah restoran. Pelayan datang ke mejamu.', 'Memesan makanan dan minuman dengan sopan, lalu meminta tagihan.', 'Pesananmu selesai. Ingat: "I\'d like ..." dan "Could I have ...?" jauh lebih sopan daripada "I want ...".', [
    ['n1', 'Waiter', 'Good evening. Are you ready to order?', 'Selamat malam. Apakah Anda siap memesan?', [
      ["Yes, I'd like the fried rice, please.", true, 3, '"I\'d like" (= I would like) adalah cara sopan untuk memesan. "please" melengkapinya.', ['Could I have the fried rice, please?', "I'll have the fried rice, please."], 'n2'],
      ['I want fried rice.', true, 2, 'Benar secara tata bahasa, tetapi "I want" terdengar terlalu langsung di restoran.', ["I'd like the fried rice, please."], 'n2'],
      ['Give me fried rice.', true, 1, 'Kalimat perintah seperti ini terdengar kasar kepada pelayan.', ['Could I have the fried rice, please?'], 'r1'],
    ]],
    ['r1', 'Waiter', 'Of course... One fried rice. Anything else?', 'Tentu... Satu nasi goreng. Ada lagi?', [
      ['Sorry. Could I also have some water, please?', true, 3, '"Could I have ...?" memperbaiki kesan dan terdengar sopan.', ['And a glass of water, please.'], 'n3'],
      ['Water.', true, 1, 'Satu kata saja terdengar ketus. Tambahkan "please" atau pakai kalimat lengkap.', ['Some water, please.'], 'n3'],
      ['I am want water.', false, 1, '"am" dan "want" tidak dipakai bersama. Pilih: "I want water" atau, lebih sopan, "I\'d like some water."', ["I'd like some water, please."], 'n3'],
    ]],
    ['n2', 'Waiter', 'Certainly. And what would you like to drink?', 'Baik. Dan Anda ingin minum apa?', [
      ['Iced tea, please.', true, 3, 'Jawaban pendek + "please" sangat lazim saat memesan.', ["I'd like an iced tea, please."], 'n3'],
      ["I'd like a iced tea.", false, 2, '"iced" diawali bunyi vokal, jadi artikelnya "an": an iced tea.', ["I'd like an iced tea."], 'n3'],
      ['I drink iced tea.', false, 1, 'Simple present berarti kebiasaan ("saya biasa minum es teh"), bukan pesanan saat ini.', ["I'll have an iced tea, please."], 'n3'],
    ]],
    ['n3', 'Waiter', 'Here you are. Enjoy your meal! ... Was everything all right?', 'Silakan. Selamat menikmati! ... Apakah semuanya memuaskan?', [
      ['Yes, it was delicious. Could I have the bill, please?', true, 3, '"was" karena makannya sudah selesai. "Could I have the bill?" adalah cara baku meminta tagihan.', ['It was great, thank you. The bill, please.'], 'end'],
      ['Yes, it is delicious. I want pay.', false, 1, 'Makanannya sudah habis, jadi "was". Setelah "want" perlu "to": I want to pay.', ['It was delicious. Can I pay now, please?'], 'end'],
      ['Yes, thank you. Bill, please.', true, 2, 'Bisa diterima. Lebih halus bila memakai "the bill" atau kalimat lengkap.', ['Could we have the bill, please?'], 'end'],
    ]],
  ]),
  scenario('directions', 'Menanyakan Arah', 'A2', true, 'Kamu tersesat di kota dan mencari stasiun kereta. Kamu menghampiri seorang pejalan kaki.', 'Membuka dengan sopan, menanyakan arah, dan memastikan kamu memahaminya.', 'Kamu menemukan jalanmu. Membuka dengan "Excuse me" dan mengulang petunjuk adalah kebiasaan yang sangat membantu.', [
    ['n1', 'Passer-by', '(sedang berjalan melewatimu)', '', [
      ['Excuse me, could you tell me how to get to the train station?', true, 3, '"Excuse me" untuk membuka, lalu pertanyaan tidak langsung "could you tell me how to get to ...".', ['Excuse me, how do I get to the train station?'], 'n2'],
      ['Where is train station?', false, 2, 'Kurang artikel "the", dan tanpa pembuka terdengar mendadak.', ['Excuse me, where is the train station?'], 'n2'],
      ['Hey, station where?', false, 1, 'Urutan kata mengikuti bahasa Indonesia. Bahasa Inggris: Where is the station?', ['Excuse me, where is the station?'], 'r1'],
    ]],
    ['r1', 'Passer-by', 'Sorry? I didn\'t catch that.', 'Maaf? Saya tidak menangkap maksudmu.', [
      ['Sorry. Where is the train station, please?', true, 3, 'Urutan benar: Where + is + the train station.', ['How can I get to the train station?'], 'n2'],
      ['Train station is where?', false, 1, 'Kata tanya harus di depan: Where is the train station?', ['Where is the train station?'], 'n2'],
      ['I look for the train station.', false, 2, 'Untuk sesuatu yang sedang berlangsung, pakai present continuous: I\'m looking for ...', ["I'm looking for the train station."], 'n2'],
    ]],
    ['n2', 'Passer-by', 'Sure. Go straight ahead, then turn left at the traffic lights. It\'s next to the bank.', 'Tentu. Jalan lurus, lalu belok kiri di lampu lalu lintas. Letaknya di sebelah bank.', [
      ['So I go straight and turn left at the lights. Is it far?', true, 3, 'Mengulang petunjuk untuk memastikan, lalu bertanya lanjutan dengan urutan "Is it ...?".', ['Straight, then left at the lights. Got it. How far is it?'], 'n3'],
      ['Is far?', false, 1, 'Kalimat butuh subjek: Is it far?', ['Is it far?'], 'n3'],
      ['Okay. It is far?', false, 2, 'Dalam pertanyaan, to be pindah ke depan: Is it far?', ['Is it far from here?'], 'n3'],
    ]],
    ['n3', 'Passer-by', 'No, it\'s about five minutes on foot.', 'Tidak, sekitar lima menit berjalan kaki.', [
      ['Great. Thank you very much for your help.', true, 3, 'Penutup yang sopan dan lengkap.', ['Thanks a lot. Have a nice day!'], 'end'],
      ['Thanks you.', false, 1, 'Pilih salah satu: "Thanks" atau "Thank you". "Thanks you" tidak ada.', ['Thank you.', 'Thanks.'], 'end'],
      ['Okay.', true, 1, 'Tidak salah, tetapi tidak berterima kasih setelah dibantu terasa kurang sopan.', ['Okay, thank you so much.'], 'end'],
    ]],
  ]),
  scenario('shopping', 'Berbelanja Pakaian', 'A2', true, 'Kamu berada di toko pakaian dan ingin membeli kemeja.', 'Menanyakan ukuran, harga, dan memutuskan untuk membeli.', 'Belanjamu selesai. "Do you have this in ...?" dan "How much is it?" adalah dua pertanyaan kunci.', [
    ['n1', 'Shop assistant', 'Hello. Can I help you?', 'Halo. Ada yang bisa saya bantu?', [
      ["Yes, please. I'm looking for a shirt.", true, 3, '"I\'m looking for" (sedang mencari) memakai present continuous.', ['Yes, I need a shirt.'], 'n2'],
      ['Yes. I look a shirt.', false, 1, '"look" butuh "for", dan untuk kegiatan saat ini pakai "I\'m looking for".', ["I'm looking for a shirt."], 'n2'],
      ["No, thanks. I'm just looking.", true, 3, 'Ungkapan baku untuk menolak bantuan dengan sopan.', ["I'm just browsing, thanks."], 'n1b'],
    ]],
    ['n1b', 'Shop assistant', 'No problem. Let me know if you need anything. ... Do you like that blue shirt?', 'Tidak masalah. Beri tahu saya jika butuh sesuatu. ... Anda suka kemeja biru itu?', [
      ['Yes, I do. Do you have it in a medium?', true, 3, 'Jawaban singkat "Yes, I do", lalu menanyakan ukuran dengan "in a medium".', ['Yes. Have you got this in medium?'], 'n3'],
      ['Yes, I am.', false, 1, 'Pertanyaannya "Do you like ...?", jadi jawabannya "Yes, I do".', ['Yes, I do.'], 'n3'],
      ['Yes, I like.', false, 2, '"like" butuh objek: Yes, I like it.', ['Yes, I like it.'], 'n3'],
    ]],
    ['n2', 'Shop assistant', 'What size are you?', 'Ukuran Anda berapa?', [
      ["I'm a medium. Do you have this one in blue?", true, 3, '"I\'m a medium" adalah cara lazim menyebut ukuran.', ['Medium, please. Is there a blue one?'], 'n3'],
      ['My size medium.', false, 1, 'Kurang kata kerja: My size is medium.', ["I'm a medium.", 'My size is medium.'], 'n3'],
      ['I wear medium size.', true, 2, 'Bisa dimengerti. Penutur asli lebih sering berkata "I\'m a medium" atau "I take a medium".', ['I take a medium.'], 'n3'],
    ]],
    ['n3', 'Shop assistant', 'Here you are. The fitting room is over there.', 'Ini dia. Kamar pasnya di sebelah sana.', [
      ['Thank you. It fits well. How much is it?', true, 3, '"It fits" dengan -s karena subjeknya "it". "How much is it?" untuk satu benda.', ["It's perfect. How much does it cost?"], 'n4'],
      ['It fit. How much?', false, 2, 'Subjek "it" membutuhkan -s: It fits. "How much?" boleh, tetapi kalimat lengkap lebih sopan.', ['It fits. How much is it?'], 'n4'],
      ['How much are it?', false, 1, '"it" tunggal: How much is it?', ['How much is it?'], 'n4'],
    ]],
    ['n4', 'Shop assistant', "It's two hundred thousand rupiah.", 'Harganya dua ratus ribu rupiah.', [
      ["Great, I'll take it. Can I pay by card?", true, 3, '"I\'ll take it" adalah ungkapan baku saat memutuskan membeli.', ["I'll take it. Do you accept cards?"], 'end'],
      ['I take it.', false, 2, 'Keputusan spontan memakai "will": I\'ll take it.', ["I'll take it."], 'end'],
      ["That's a bit expensive. Do you have anything cheaper?", true, 3, 'Cara sopan untuk menolak harga dan mencari pilihan lain.', ['Is there a discount?'], 'end'],
    ]],
  ]),
  scenario('hotel', 'Reservasi Hotel', 'A2', true, 'Kamu tiba di meja resepsionis hotel untuk check-in.', 'Menyebutkan reservasi, mengonfirmasi detail kamar, dan menanyakan fasilitas.', 'Check-in selesai. Menyebut "I have a reservation under the name ..." langsung memperlancar proses.', [
    ['n1', 'Receptionist', 'Good afternoon. Welcome to the Garden Hotel. How can I help you?', 'Selamat siang. Selamat datang di Garden Hotel. Ada yang bisa saya bantu?', [
      ['Good afternoon. I have a reservation under the name Putri.', true, 3, '"under the name ..." adalah ungkapan baku untuk menyebut nama pemesan.', ['Hello. I booked a room. My name is Putri.'], 'n2'],
      ['I has a reservation.', false, 1, '"I" berpasangan dengan "have", bukan "has".', ['I have a reservation.'], 'n2'],
      ["I'd like to check in, please.", true, 3, 'Ungkapan sopan dan langsung ke tujuan.', ['Checking in, please.'], 'n2'],
    ]],
    ['n2', 'Receptionist', 'Thank you, Ms Putri. A double room for two nights, is that right?', 'Terima kasih, Bu Putri. Kamar double untuk dua malam, betul?', [
      ["Yes, that's right. Is breakfast included?", true, 3, 'Mengonfirmasi, lalu bertanya dengan pasif sederhana "Is breakfast included?".', ['Correct. Does the price include breakfast?'], 'n3'],
      ['Yes. Breakfast include?', false, 1, 'Perlu to be dan bentuk ketiga: Is breakfast included?', ['Is breakfast included?'], 'n3'],
      ['No, I booked for three nights, actually.', true, 3, '"actually" melunakkan koreksi. "booked" memakai simple past.', ["Actually, it's three nights."], 'n2b'],
    ]],
    ['n2b', 'Receptionist', "Let me check... You're right, three nights. I'm sorry about that.", 'Biar saya periksa... Anda benar, tiga malam. Mohon maaf.', [
      ["That's all right. Is breakfast included?", true, 3, '"That\'s all right" menerima permintaan maaf dengan ramah.', ['No problem. Does it include breakfast?'], 'n3'],
      ['No problem. I am not angry to you.', false, 2, 'Kata depannya "with": angry with you. Kalimat ini juga terasa berlebihan.', ["No problem at all."], 'n3'],
      ['Okay.', true, 1, 'Tidak salah, tetapi singkat sekali untuk menanggapi permintaan maaf.', ["That's okay, thank you."], 'n3'],
    ]],
    ['n3', 'Receptionist', "Yes, breakfast is served from six to ten. Here is your key card. You're in room 305.", 'Ya, sarapan disajikan pukul enam sampai sepuluh. Ini kartu kunci Anda. Kamar Anda nomor 305.', [
      ['Thank you. What time is check-out?', true, 3, 'Urutan pertanyaan: What time + is + subjek.', ['Thanks. When do I need to check out?'], 'end'],
      ['What time check-out is?', false, 1, 'To be mendahului subjek dalam pertanyaan: What time is check-out?', ['What time is check-out?'], 'end'],
      ['Thank you. Is there Wi-Fi in the room?', true, 3, '"Is there ...?" untuk menanyakan keberadaan fasilitas.', ['Does the room have Wi-Fi?'], 'end'],
    ]],
  ]),
  scenario('friends', 'Mengobrol dengan Teman dari Luar Negeri', 'A2', true, 'Teman barumu dari Australia bertanya tentang akhir pekanmu.', 'Menceritakan kegiatan lampau dan bertanya balik.', 'Obrolanmu mengalir. Bercerita dengan simple past dan bertanya balik membuat percakapan hidup.', [
    ['n1', 'Jack', 'Hey! How was your weekend?', 'Hei! Bagaimana akhir pekanmu?', [
      ['It was great, thanks. I went to the beach with my family.', true, 3, '"was" dan "went": dua bentuk lampau untuk menceritakan akhir pekan yang sudah lewat.', ['Pretty good! We went to the beach.'], 'n2'],
      ['It is great. I go to the beach.', false, 1, 'Akhir pekan sudah lewat, jadi pakai bentuk lampau: It was great. I went ...', ['It was great. I went to the beach.'], 'n2'],
      ['It was great. I goed to the beach.', false, 2, '"go" tidak beraturan: bentuk lampaunya "went".', ['I went to the beach.'], 'n2'],
    ]],
    ['n2', 'Jack', 'Nice! Which beach did you go to?', 'Asyik! Kamu pergi ke pantai mana?', [
      ['We went to Pangandaran. Have you ever been there?', true, 3, 'Simple past untuk ceritamu, present perfect ("Have you ever been") untuk menanyakan pengalaman.', ['Pangandaran, in West Java. Do you know it?'], 'n3'],
      ['We did go to Pangandaran.', true, 2, 'Benar, tetapi "did go" memberi penekanan yang tidak diperlukan di sini.', ['We went to Pangandaran.'], 'n3'],
      ['We went Pangandaran.', false, 2, '"go" membutuhkan "to" sebelum nama tempat.', ['We went to Pangandaran.'], 'n3'],
    ]],
    ['n3', 'Jack', "No, I haven't, but I'd love to. What did you do there?", 'Belum, tapi saya ingin sekali. Apa yang kamu lakukan di sana?', [
      ['We swam, ate seafood, and watched the sunset. What about you?', true, 3, 'Tiga kata kerja lampau sejajar (swam, ate, watched), lalu bertanya balik.', ['We swam and had seafood. How about your weekend?'], 'end'],
      ['We swimmed and eated seafood.', false, 1, '"swim" dan "eat" tidak beraturan: swam, ate.', ['We swam and ate seafood.'], 'end'],
      ["We didn't do much. We just relaxed.", true, 3, '"didn\'t" + bentuk dasar "do", lalu "relaxed" (lampau).', ['Nothing special. We just took it easy.'], 'end'],
    ]],
  ]),
  scenario('airport', 'Percakapan di Bandara', 'B1', true, 'Kamu berada di konter check-in bandara untuk penerbangan internasional.', 'Menyerahkan dokumen, menjawab pertanyaan bagasi, dan menanyakan gerbang.', 'Check-in berhasil. Menjawab dengan kalimat lengkap dan present perfect ("I\'ve packed ...") terdengar meyakinkan.', [
    ['n1', 'Check-in agent', 'Good morning. May I see your passport and booking confirmation, please?', 'Selamat pagi. Boleh saya lihat paspor dan konfirmasi pemesanan Anda?', [
      ['Of course. Here you are.', true, 3, '"Here you are" adalah ungkapan baku saat menyerahkan sesuatu.', ['Sure, here they are.'], 'n2'],
      ['Yes, this.', true, 1, 'Dimengerti, tetapi terlalu singkat. Pakai "Here you are."', ['Here you are.'], 'n2'],
      ['Yes, I give you.', false, 1, '"give" membutuhkan objek, dan ungkapan yang wajar adalah "Here you are".', ['Here you are.'], 'n2'],
    ]],
    ['n2', 'Check-in agent', 'Thank you. Are you checking in any bags today?', 'Terima kasih. Apakah Anda menitipkan bagasi hari ini?', [
      ['Yes, just this suitcase. Could I have a window seat, if possible?', true, 3, '"Could I have ...?" + "if possible" adalah permintaan yang sangat sopan.', ["One bag. Is a window seat available?"], 'n3'],
      ['Yes, one luggage.', false, 2, '"luggage" tidak bisa dihitung. Pakai "one bag" atau "one piece of luggage".', ['Yes, one bag.', 'Yes, one piece of luggage.'], 'n3'],
      ['No, I only have hand luggage.', true, 3, '"hand luggage" (bagasi kabin) tanpa artikel karena tidak bisa dihitung.', ["No, I'm travelling with carry-on only."], 'n3'],
    ]],
    ['n3', 'Check-in agent', 'Did you pack your bags yourself?', 'Apakah Anda mengemas tas Anda sendiri?', [
      ['Yes, I packed them myself.', true, 3, 'Simple past "packed" + kata ganti refleksif "myself".', ['Yes, I did.'], 'n4'],
      ['Yes, I packed them by my own.', false, 2, 'Ungkapannya "on my own" atau "by myself", bukan "by my own".', ['Yes, I packed them by myself.'], 'n4'],
      ['Yes, I do.', false, 1, 'Pertanyaannya memakai "Did", jadi jawabannya "Yes, I did".', ['Yes, I did.'], 'n4'],
    ]],
    ['n4', 'Check-in agent', "Here's your boarding pass. Boarding starts at 9:40.", 'Ini pas naik Anda. Naik pesawat dimulai pukul 9.40.', [
      ['Thank you. Which gate does the flight leave from?', true, 3, 'Pertanyaan dengan "does" + bentuk dasar "leave", preposisi "from" di akhir.', ['Thanks. Which gate is it?'], 'end'],
      ['Which gate the flight leaves?', false, 1, 'Pertanyaan butuh kata bantu: Which gate does the flight leave from?', ['Which gate does it leave from?'], 'end'],
      ['Thank you. Has the flight been delayed?', true, 3, 'Present perfect pasif untuk menanyakan status terkini.', ['Is the flight on time?'], 'end'],
    ]],
  ]),
  scenario('travel', 'Menghadapi Masalah Saat Bepergian', 'B1', true, 'Kereta yang akan kamu naiki dibatalkan. Kamu mendatangi loket informasi.', 'Menjelaskan masalah, menanyakan pilihan, dan meminta pengembalian dana dengan sopan.', 'Masalahmu teratasi. Menjelaskan situasi dengan tenang lalu bertanya "What are my options?" selalu efektif.', [
    ['n1', 'Staff', 'Hello. How can I help?', 'Halo. Ada yang bisa saya bantu?', [
      ['Hi. My train to Surabaya has been cancelled. What are my options?', true, 3, 'Present perfect pasif untuk kabar terbaru, lalu pertanyaan terbuka.', ['My train was cancelled. Is there another one today?'], 'n2'],
      ['My train cancelled.', false, 1, 'Kereta itu "dibatalkan", jadi pasif: has been cancelled / was cancelled.', ['My train has been cancelled.'], 'n2'],
      ['You cancelled my train! I want my money!', true, 1, 'Tata bahasanya benar, tetapi nada menuduh biasanya memperlambat bantuan.', ["I'm afraid my train has been cancelled. Could you help me?"], 'r1'],
    ]],
    ['r1', 'Staff', "I understand it's frustrating. Let's see what we can do.", 'Saya mengerti ini menjengkelkan. Mari kita lihat apa yang bisa dilakukan.', [
      ["Sorry, I'm just stressed. Is there a later train?", true, 3, 'Meminta maaf singkat lalu kembali ke pertanyaan yang jelas.', ['Apologies. Could I get on the next train?'], 'n2'],
      ['There is later train?', false, 1, 'Pertanyaan: Is there a later train? (to be di depan, dengan artikel).', ['Is there a later train?'], 'n2'],
      ['Fine. What can you do?', true, 2, 'Benar, tetapi masih terdengar ketus.', ['What would you suggest?'], 'n2'],
    ]],
    ['n2', 'Staff', "There's a train at 4 p.m., or you can get a full refund.", 'Ada kereta pukul 4 sore, atau Anda bisa mendapat pengembalian dana penuh.', [
      ["I'd rather take the 4 p.m. train. Do I need a new ticket?", true, 3, '"I\'d rather" + bentuk dasar untuk menyatakan pilihan.', ["I'll take the four o'clock train, please."], 'n3'],
      ["I'd rather to take the 4 p.m. train.", false, 2, 'Setelah "would rather" tidak ada "to": I\'d rather take.', ["I'd rather take the 4 p.m. train."], 'n3'],
      ["I'd prefer a refund, please. How long will it take?", true, 3, '"I\'d prefer" + kata benda, lalu pertanyaan masa depan dengan "will".', ['Could I have a refund? When will I receive it?'], 'n3'],
    ]],
    ['n3', 'Staff', "I'll sort that out for you now. Is there anything else?", 'Saya urus sekarang. Ada lagi?', [
      ["No, that's everything. Thank you for your help.", true, 3, 'Penutup yang lengkap dan sopan.', ["That's all, thanks. I appreciate it."], 'end'],
      ['No, thanks for help me.', false, 2, 'Setelah preposisi "for" dipakai bentuk -ing: thanks for helping me.', ['Thanks for helping me.', 'Thanks for your help.'], 'end'],
      ['Could you tell me where the waiting room is?', true, 3, 'Pertanyaan tidak langsung: setelah "where", subjek mendahului kata kerja (the waiting room is).', ['Where is the waiting room?'], 'end'],
    ]],
  ]),
  scenario('university', 'Percakapan di Kampus', 'B1', true, 'Kamu mahasiswa pertukaran dan menemui dosen pembimbing pada jam konsultasi.', 'Meminta perpanjangan tenggat dan menjelaskan alasan dengan sopan.', 'Dosenmu setuju. Permintaan yang jelas, alasan yang jujur, dan usulan tanggal baru adalah kunci.', [
    ['n1', 'Dr Hall', 'Come in. What can I do for you?', 'Silakan masuk. Ada yang bisa saya bantu?', [
      ['Thank you for seeing me. I was wondering if I could have an extension on my essay.', true, 3, '"I was wondering if I could ..." adalah bentuk permintaan paling sopan dalam konteks akademik.', ['Would it be possible to get an extension on my essay?'], 'n2'],
      ['I want more time for my essay.', true, 1, 'Benar, tetapi terlalu langsung untuk berbicara dengan dosen.', ['Could I possibly have a few more days for my essay?'], 'n2'],
      ['Can you give me extension?', false, 2, 'Kurang artikel "an", dan "Could" lebih sopan daripada "Can".', ['Could you give me an extension?'], 'n2'],
    ]],
    ['n2', 'Dr Hall', 'I see. May I ask why you need more time?', 'Begitu. Boleh saya tahu mengapa Anda butuh waktu tambahan?', [
      ["I've been ill for the past week, so I haven't been able to finish my research.", true, 3, 'Present perfect ("I\'ve been ill", "haven\'t been able") untuk keadaan yang berlanjut sampai sekarang.', ['I was sick last week and fell behind with my reading.'], 'n3'],
      ['I am ill since last week.', false, 2, 'Dengan "since" pakai present perfect: I have been ill since last week.', ["I've been ill since last week."], 'n3'],
      ['Because I had many tasks.', true, 2, 'Bisa diterima, tetapi kurang spesifik. "a lot of assignments" lebih wajar daripada "many tasks".', ["I've had a lot of assignments due at the same time."], 'n3'],
    ]],
    ['n3', 'Dr Hall', "I'm sorry to hear that. How much more time do you need?", 'Saya turut prihatin. Berapa lama lagi waktu yang Anda butuhkan?', [
      ['Would it be all right if I submitted it next Monday?', true, 3, '"Would it be all right if I + bentuk lampau" adalah pola pengandaian sopan.', ['Could I hand it in by next Monday?'], 'end'],
      ['I will submit next Monday.', false, 2, '"submit" butuh objek "it", dan kalimat ini terdengar seperti pemberitahuan, bukan permintaan.', ['Could I submit it next Monday?'], 'end'],
      ['Three days more would be enough, if that is acceptable.', true, 3, 'Sopan dan jelas. "Three more days" adalah urutan yang lebih lazim.', ['Three more days would be enough.'], 'end'],
    ]],
  ]),
  scenario('interview', 'Wawancara Kerja', 'B2', true, 'Kamu diwawancarai untuk posisi staf pemasaran di perusahaan internasional.', 'Memperkenalkan pengalaman, menjelaskan kekuatan, dan bertanya tentang peran.', 'Wawancaramu berjalan baik. Jawaban terstruktur dengan contoh konkret meninggalkan kesan profesional.', [
    ['n1', 'Interviewer', 'Thank you for coming in. Could you tell me a little about yourself?', 'Terima kasih sudah datang. Bisakah Anda menceritakan sedikit tentang diri Anda?', [
      ["Certainly. I've worked in digital marketing for three years, mainly managing social media campaigns.", true, 3, 'Present perfect + "for three years" (masih berlangsung), diikuti rincian yang relevan.', ['Of course. I have three years of experience in digital marketing.'], 'n2'],
      ['I am working in digital marketing since three years.', false, 1, 'Pakai present perfect dan "for" untuk lamanya waktu: I have worked ... for three years.', ["I've been working in digital marketing for three years."], 'n2'],
      ['My name is Rizky, I am 25 years old, and I live with my parents.', true, 1, 'Benar, tetapi tidak relevan. Pewawancara menanyakan latar belakang profesionalmu.', ["I'm a marketing graduate with three years of experience."], 'n2'],
    ]],
    ['n2', 'Interviewer', 'What would you say is your greatest strength?', 'Menurut Anda, apa kekuatan terbesar Anda?', [
      ["I'd say it's my ability to analyse data. For example, I increased engagement by 40% in my last role.", true, 3, 'Klaim + bukti konkret. "increased ... by 40%" memakai simple past untuk pencapaian yang sudah selesai.', ['My strongest skill is data analysis.'], 'n3'],
      ['I am a hard worker and I never have weakness.', false, 1, '"weakness" perlu artikel/jamak ("any weaknesses"), dan klaim ini tidak meyakinkan.', ["I'm hard-working, and I'm always looking for ways to improve."], 'n3'],
      ['I am good in communicating with people.', false, 2, 'Preposisinya "at": good at communicating.', ["I'm good at communicating with people."], 'n3'],
    ]],
    ['n3', 'Interviewer', 'Why do you want to work for our company?', 'Mengapa Anda ingin bekerja di perusahaan kami?', [
      ["I've followed your campaigns for years, and I'd welcome the chance to contribute to a team with such a strong reputation.", true, 3, 'Menunjukkan riset, memakai "I\'d welcome the chance to ..." yang formal.', ["I admire your work, and I believe my skills match the role."], 'n4'],
      ['Because the salary is high.', true, 1, 'Jujur, tetapi merugikanmu. Fokuslah pada kontribusi dan kecocokan.', ['The role matches my skills and career goals.'], 'n4'],
      ['I am interesting in your company.', false, 1, '"interesting" = menarik; "interested" = tertarik. Yang benar: I am interested in ...', ["I'm very interested in your company."], 'n4'],
    ]],
    ['n4', 'Interviewer', 'Do you have any questions for us?', 'Apakah Anda punya pertanyaan untuk kami?', [
      ['Yes. Could you tell me what a typical day in this role looks like?', true, 3, 'Pertanyaan tidak langsung: setelah "what", urutan pernyataan (a typical day ... looks like).', ['How would you describe the team I would be working with?'], 'end'],
      ['Could you tell me what does a typical day look like?', false, 2, 'Dalam pertanyaan tidak langsung tidak ada inversi: what a typical day looks like.', ['Could you tell me what a typical day looks like?'], 'end'],
      ["No, I don't.", true, 1, 'Benar, tetapi tidak bertanya memberi kesan kurang berminat.', ['Yes, what are the next steps in the process?'], 'end'],
    ]],
  ]),
  scenario('workplace', 'Komunikasi di Tempat Kerja', 'B2', true, 'Dalam rapat tim, rekanmu mengusulkan tenggat yang menurutmu tidak realistis.', 'Menyatakan ketidaksetujuan secara profesional dan mengusulkan alternatif.', 'Rapat berakhir dengan kesepakatan. Ketidaksetujuan yang disertai alasan dan solusi dihargai di lingkungan profesional.', [
    ['n1', 'Sarah', "So I suggest we launch next Friday. What does everyone think?", 'Jadi saya usul kita meluncurkan Jumat depan. Bagaimana menurut kalian?', [
      ["I see your point, but I'm concerned that next Friday might be too tight for testing.", true, 3, 'Mengakui pendapat dulu, lalu menyatakan kekhawatiran dengan "might" agar tidak terkesan menyerang.', ["That's an option, although I wonder whether we'd have enough time to test."], 'n2'],
      ["I don't agree. It's impossible.", true, 1, 'Benar, tetapi terlalu keras untuk rapat. Lunakkan dan beri alasan.', ["I'm not sure that's realistic, given the testing we still need to do."], 'n2'],
      ['I am not agree with you.', false, 1, '"agree" adalah kata kerja, jadi negatifnya "I don\'t agree".', ["I don't quite agree.", "I'm afraid I disagree."], 'n2'],
    ]],
    ['n2', 'Sarah', 'Fair enough. What would you propose instead?', 'Masuk akal. Lalu apa usulmu?', [
      ['How about pushing the launch back by a week? That would give us time to fix any issues.', true, 3, '"How about + -ing" untuk mengusulkan, lalu "would" untuk akibat yang diandaikan.', ['What if we launched a week later?'], 'n3'],
      ['How about to push the launch one week?', false, 2, 'Setelah "How about" dipakai bentuk -ing: How about pushing ...', ['How about pushing the launch back a week?'], 'n3'],
      ['I suggest to delay it.', false, 2, '"suggest" tidak diikuti "to": I suggest delaying it / I suggest (that) we delay it.', ['I suggest we delay it.', 'I suggest delaying it.'], 'n3'],
    ]],
    ['n3', 'Sarah', 'The client is expecting it next Friday, though.', 'Tapi klien mengharapkannya Jumat depan.', [
      ["In that case, could we deliver the core features on Friday and the rest the following week?", true, 3, 'Kompromi yang jelas, dibuka dengan "In that case" dan permintaan sopan "could we".', ['Then perhaps we could release it in two phases.'], 'end'],
      ["If we will launch on Friday, there will be bugs.", false, 2, 'Klausa "if" tidak memakai "will": If we launch on Friday, there will be bugs.', ['If we launch on Friday, there will be bugs.'], 'end'],
      ["Then it's your responsibility if it fails.", true, 1, 'Benar secara tata bahasa, tetapi menyalahkan rekan merusak kerja sama.', ["I understand. Let's agree on which risks we're willing to accept."], 'end'],
    ]],
  ]),
];
