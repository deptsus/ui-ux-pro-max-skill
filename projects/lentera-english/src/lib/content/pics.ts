// Vocabulary illustrations (Rilis 15): the keys the content may use, with the
// English word and its Indonesian meaning. The drawings live in
// src/components/pics/Pic.tsx; the validator checks every key against this list.
export const PICS = {
  // food and drink
  apple: ['apple', 'apel'], banana: ['banana', 'pisang'], orange: ['orange', 'jeruk'], mango: ['mango', 'mangga'], watermelon: ['watermelon', 'semangka'],
  rice: ['rice', 'nasi'], bread: ['bread', 'roti'], egg: ['egg', 'telur'], milk: ['milk', 'susu'], water: ['water', 'air'], noodles: ['noodles', 'mi'], cake: ['cake', 'kue'],
  // animals
  cat: ['cat', 'kucing'], dog: ['dog', 'anjing'], bird: ['bird', 'burung'], fish: ['fish', 'ikan'], chicken: ['chicken', 'ayam'], cow: ['cow', 'sapi'], rabbit: ['rabbit', 'kelinci'], elephant: ['elephant', 'gajah'],
  // school
  book: ['book', 'buku'], pen: ['pen', 'pena'], pencil: ['pencil', 'pensil'], bag: ['bag', 'tas'], ruler: ['ruler', 'penggaris'], eraser: ['eraser', 'penghapus'], table: ['table', 'meja'], chair: ['chair', 'kursi'], clock: ['clock', 'jam dinding'],
  // home
  bed: ['bed', 'tempat tidur'], door: ['door', 'pintu'], window: ['window', 'jendela'], lamp: ['lamp', 'lampu'], house: ['house', 'rumah'],
  // transport
  car: ['car', 'mobil'], bus: ['bus', 'bus'], bicycle: ['bicycle', 'sepeda'], motorbike: ['motorbike', 'sepeda motor'], plane: ['plane', 'pesawat'], boat: ['boat', 'perahu'],
  // nature and weather
  sun: ['sun', 'matahari'], rain: ['rain', 'hujan'], cloud: ['cloud', 'awan'], tree: ['tree', 'pohon'], flower: ['flower', 'bunga'],
  // clothes and things
  shirt: ['shirt', 'baju'], hat: ['hat', 'topi'], shoes: ['shoes', 'sepatu'], ball: ['ball', 'bola'], box: ['box', 'kotak'], phone: ['phone', 'ponsel'], umbrella: ['umbrella', 'payung'],
  // colours
  red: ['red', 'merah'], blue: ['blue', 'biru'], green: ['green', 'hijau'], yellow: ['yellow', 'kuning'], black: ['black', 'hitam'], white: ['white', 'putih'], purple: ['purple', 'ungu'], pink: ['pink', 'merah muda'], brown: ['brown', 'cokelat'],
} as const satisfies Record<string, readonly [en: string, id: string]>;

export type PicKey = keyof typeof PICS;
export const isPic = (k: string | undefined): k is PicKey => !!k && k in PICS;
/** Swatch colours for the colour keys. */
export const COLOR_PICS = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#facc15', black: '#1f2937', white: '#ffffff', purple: '#8b5cf6', pink: '#f9a8d4', brown: '#92400e' } as const satisfies Partial<Record<PicKey, string>>;
