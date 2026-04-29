# Wordivate — Client

Frontend aplikasi kuis kata real-time **Wordivate**. Dibangun dengan **React** + **Vite**, berkomunikasi ke server via **Socket.IO**, dan menampilkan word cloud interaktif menggunakan **D3**.

---

## Tech Stack

| Paket            | Versi   | Kegunaan                       |
| ---------------- | ------- | ------------------------------ |
| react            | ^19.2.5 | UI library utama               |
| react-dom        | ^19.2.5 | Rendering ke DOM               |
| react-router     | ^7.14.2 | Client-side routing            |
| socket.io-client | ^4.8.3  | Komunikasi real-time ke server |
| d3               | ^7.9.0  | Visualisasi data (word cloud)  |
| d3-cloud         | ^1.2.9  | Layout algoritma word cloud    |
| vite             | ^8.0.10 | Build tool & dev server        |

---

## Struktur Folder

```
client/
├── index.html
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                  # Entry point React
    ├── App.jsx                   # Root component, routing, tema
    ├── index.css                 # Global styles & DaisyUI theming
    ├── App.css
    ├── assets/                   # Font & gambar statis
    ├── context/
    │   ├── SocketContext.jsx     # Provider & hook koneksi Socket.IO
    │   └── ThemeContext.jsx      # Provider & hook tema (light/dark)
    ├── views/
    │   ├── Home.jsx              # Halaman beranda
    │   ├── HostLobby.jsx         # Lobby host: buat room & generate soal
    │   ├── HostGame.jsx          # Tampilan host saat game berlangsung
    │   ├── PlayerJoin.jsx        # Form masuk room untuk pemain
    │   ├── PlayerGame.jsx        # Tampilan pemain saat game berlangsung
    │   └── Leaderboard.jsx       # Hasil akhir & peringkat
    └── components/
        └── WordCloud.jsx         # Komponen word cloud interaktif (D3)
```

---

## Setup & Menjalankan

### 1. Install dependensi

```bash
npm install
```

### 2. Buat file `.env`

```env
VITE_SOCKET_URL=http://localhost:3000
```

> Jika `VITE_SOCKET_URL` tidak diset, client akan fallback ke `http://localhost:3000`.

### 3. Jalankan client

```bash
# Development (HMR aktif)
npm run dev

# Build production
npm run build

# Preview hasil build
npm run preview
```

Client akan berjalan di `http://localhost:5173` secara default.

---

## Routing

Semua route didaftarkan di `App.jsx` menggunakan React Router v7.

| Path           | Komponen      | Deskripsi                                           |
| -------------- | ------------- | --------------------------------------------------- |
| `/`            | `Home`        | Halaman utama, pilihan buat atau masuk room         |
| `/host`        | `HostLobby`   | Lobby host: buat room, generate soal, tunggu pemain |
| `/host/game`   | `HostGame`    | Tampilan host selama game berlangsung               |
| `/play`        | `PlayerJoin`  | Form masuk room (kode + nickname)                   |
| `/play/game`   | `PlayerGame`  | Tampilan pemain untuk menjawab soal                 |
| `/leaderboard` | `Leaderboard` | Halaman hasil akhir & peringkat                     |

---

## Context API

### SocketContext

**File:** `src/context/SocketContext.jsx`

Menyediakan instance Socket.IO ke seluruh komponen aplikasi. Koneksi dibuat sekali saat aplikasi dimount dan otomatis terputus saat unmount.

#### Penggunaan

Bungkus komponen yang butuh socket dengan `<SocketProvider>`, lalu gunakan hook `useSocket()` untuk mendapatkan instance-nya.

```jsx
import { useSocket } from "../context/SocketContext";

function MyComponent() {
  const socket = useSocket();

  const handleClick = () => {
    socket?.emit("create_room");
  };
}
```

> `useSocket()` bisa mengembalikan `null` sebelum koneksi terbentuk, selalu periksa dengan optional chaining (`socket?.`).

#### Konfigurasi Koneksi

```js
// Diambil dari env, fallback ke localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

// Selalu menggunakan transport WebSocket (tidak polling)
io(SOCKET_URL, { transports: ["websocket"] });
```

---

### ThemeContext

**File:** `src/context/ThemeContext.jsx`

Mengelola tema tampilan aplikasi (light/dark). Tema disimpan di `localStorage` dan diterapkan ke atribut `data-theme` pada `<html>`.

| Tema     | Alias      | Keterangan  |
| -------- | ---------- | ----------- |
| `autumn` | Light mode | Tema terang |
| `dim`    | Dark mode  | Tema gelap  |

#### Penggunaan

```jsx
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return <button onClick={toggleTheme}>Mode saat ini: {theme}</button>;
}
```

#### Value yang Tersedia

| Property      | Tipe       | Deskripsi                                  |
| ------------- | ---------- | ------------------------------------------ |
| `theme`       | `string`   | Tema aktif saat ini (`"autumn"` / `"dim"`) |
| `toggleTheme` | `function` | Toggle antara light dan dark mode          |
| `setTheme`    | `function` | Set tema secara langsung                   |

---

## Halaman & Socket Events

Setiap halaman berlangganan dan mengirim event Socket.IO sesuai perannya. Berikut pemetaan lengkapnya.

---

### Home (`/`)

Halaman beranda. Tidak menggunakan socket. Menyediakan dua tombol navigasi:

- **Buat Room** → navigasi ke `/host`
- **Masuk Room** → navigasi ke `/play`

---

### HostLobby (`/host`)

Halaman lobby untuk host. Mengelola pembuatan room, generate soal via AI, dan menunggu pemain bergabung.

#### Events yang Dikirim (Emit)

| Event                | Payload             | Keterangan                     |
| -------------------- | ------------------- | ------------------------------ |
| `create_room`        | _(tidak ada)_       | Membuat room baru              |
| `generate_questions` | `{ topic: string }` | Meminta Gemini membuat soal    |
| `start_game`         | _(tidak ada)_       | Memulai game setelah soal siap |

#### Events yang Didengarkan (On)

| Event             | Payload                 | Aksi di Client                                    |
| ----------------- | ----------------------- | ------------------------------------------------- |
| `room_created`    | `{ roomCode: string }`  | Menampilkan kode room ke host                     |
| `player_joined`   | `{ players: Player[] }` | Memperbarui daftar pemain                         |
| `questions_ready` | `{ count: number }`     | Menandai soal siap, menampilkan tombol mulai game |
| `gemini_error`    | `{ message: string }`   | Menampilkan pesan error generate soal             |
| `game_started`    | _(tidak ada)_           | Navigasi host ke `/host/game`                     |

#### State Management

| State            | Tipe       | Deskripsi                          |
| ---------------- | ---------- | ---------------------------------- |
| `roomCode`       | `string`   | Kode room yang dibuat              |
| `players`        | `Player[]` | Daftar pemain yang sudah bergabung |
| `topic`          | `string`   | Input topik soal dari host         |
| `loading`        | `boolean`  | Status sedang generate soal        |
| `questionsReady` | `boolean`  | Soal sudah siap di-generate        |
| `questionCount`  | `number`   | Jumlah soal yang berhasil dibuat   |
| `geminiError`    | `string`   | Pesan error dari Gemini (jika ada) |

---

### HostGame (`/host/game`)

Tampilan host selama permainan berlangsung. Menampilkan soal aktif, word cloud jawaban pemain, dan kontrol navigasi soal.

#### Events yang Dikirim (Emit)

| Event                  | Payload       | Keterangan                                     |
| ---------------------- | ------------- | ---------------------------------------------- |
| `get_current_question` | _(tidak ada)_ | Meminta data soal aktif (dipanggil saat mount) |
| `next_question`        | _(tidak ada)_ | Lanjut ke soal berikutnya                      |
| `end_game`             | _(tidak ada)_ | Mengakhiri game dan memulai penilaian          |

#### Events yang Didengarkan (On)

| Event              | Payload                  | Aksi di Client                                |
| ------------------ | ------------------------ | --------------------------------------------- |
| `new_question`     | `{ index, text, total }` | Menampilkan soal baru, mereset daftar jawaban |
| `wordcloud_update` | `{ answers: string[] }`  | Memperbarui word cloud dengan jawaban terbaru |
| `grading_start`    | _(tidak ada)_            | Menampilkan status loading penilaian          |
| `show_leaderboard` | _(tidak ada)_            | Navigasi ke `/leaderboard`                    |

#### State Management

| State                  | Tipe       | Deskripsi                                 |
| ---------------------- | ---------- | ----------------------------------------- |
| `question`             | `string`   | Teks soal yang sedang aktif               |
| `currentQuestionIndex` | `number`   | Index soal saat ini (0-based)             |
| `totalQuestions`       | `number`   | Total jumlah soal                         |
| `loading`              | `boolean`  | Status sedang proses penilaian AI         |
| `answers`              | `string[]` | Daftar jawaban pemain untuk soal saat ini |
| `isLastQuestion`       | `boolean`  | Apakah soal saat ini adalah soal terakhir |

---

### PlayerJoin (`/play`)

Halaman form untuk pemain bergabung ke room.

#### Events yang Dikirim (Emit)

| Event       | Payload                                  | Keterangan                           |
| ----------- | ---------------------------------------- | ------------------------------------ |
| `join_room` | `{ roomCode: string, nickname: string }` | Bergabung ke room dengan kode & nama |

> `roomCode` secara otomatis dikonversi ke huruf kapital sebelum dikirim.  
> `nickname` disimpan ke `sessionStorage` untuk digunakan di halaman leaderboard.

#### Events yang Didengarkan (On)

| Event           | Payload                 | Aksi di Client                            |
| --------------- | ----------------------- | ----------------------------------------- |
| `join_error`    | `{ message: string }`   | Menampilkan pesan error, kembali ke form  |
| `player_joined` | `{ players: Player[] }` | Memperbarui daftar pemain di lobby tunggu |
| `game_started`  | _(tidak ada)_           | Navigasi pemain ke `/play/game`           |

#### State Management

| State      | Tipe       | Deskripsi                                       |
| ---------- | ---------- | ----------------------------------------------- |
| `roomCode` | `string`   | Input kode room dari pengguna                   |
| `nickname` | `string`   | Input nama panggilan dari pengguna              |
| `errorMsg` | `string`   | Pesan error join (dari server)                  |
| `joined`   | `boolean`  | Apakah pemain sudah berhasil mengirim join_room |
| `players`  | `Player[]` | Daftar pemain di room (untuk tampilan lobby)    |

---

### PlayerGame (`/play/game`)

Tampilan pemain selama permainan berlangsung. Menampilkan soal aktif dan form pengiriman jawaban.

#### Events yang Dikirim (Emit)

| Event                  | Payload                                     | Keterangan                                |
| ---------------------- | ------------------------------------------- | ----------------------------------------- |
| `get_current_question` | _(tidak ada)_                               | Meminta soal aktif saat mount / reconnect |
| `submit_answer`        | `{ questionIndex: number, answer: string }` | Mengirimkan jawaban untuk soal saat ini   |

> Hanya kata pertama dari input yang dikirim. Input otomatis dikonversi ke huruf kecil sebelum dikirim ke server.

#### Events yang Didengarkan (On)

| Event              | Payload                  | Aksi di Client                              |
| ------------------ | ------------------------ | ------------------------------------------- |
| `new_question`     | `{ index, text, total }` | Menampilkan soal baru, mereset form jawaban |
| `grading_start`    | _(tidak ada)_            | Menampilkan layar "Menghitung hasil..."     |
| `show_leaderboard` | _(tidak ada)_            | Navigasi ke `/leaderboard`                  |

#### State Management

| State       | Tipe             | Deskripsi                                   |
| ----------- | ---------------- | ------------------------------------------- |
| `question`  | `Question\|null` | Data soal aktif (`{ index, text, total }`)  |
| `answer`    | `string`         | Input jawaban dari pengguna                 |
| `submitted` | `boolean`        | Apakah jawaban sudah dikirim untuk soal ini |
| `grading`   | `boolean`        | Apakah sedang dalam proses penilaian AI     |

---

### Leaderboard (`/leaderboard`)

Menampilkan hasil akhir permainan. Tampilan berbeda antara host dan pemain, dideteksi via `sessionStorage`.

- **Host** → melihat podium top 3, semua peringkat, dan kunci jawaban.
- **Pemain** → melihat peringkat diri sendiri, skor, akurasi, dan detail benar/salah per soal.

#### Events yang Dikirim (Emit)

| Event             | Payload       | Keterangan                                              |
| ----------------- | ------------- | ------------------------------------------------------- |
| `get_leaderboard` | _(tidak ada)_ | Meminta ulang data leaderboard (berguna saat reconnect) |

#### Events yang Didengarkan (On)

| Event              | Payload                   | Aksi di Client               |
| ------------------ | ------------------------- | ---------------------------- |
| `show_leaderboard` | `{ rankings: Ranking[] }` | Menampilkan data leaderboard |

#### Deteksi Peran

```js
// Nickname disimpan saat join, diambil saat leaderboard
const myNickname = sessionStorage.getItem("nickname");
const isPlayer = !!myNickname; // false jika host
```

Saat tombol "Main Lagi" ditekan, `nickname` dihapus dari `sessionStorage` dan pengguna diarahkan ke `/`.

---

## Komponen

### WordCloud

**File:** `src/components/WordCloud.jsx`

Komponen visualisasi word cloud interaktif yang merender jawaban pemain menggunakan D3 + d3-cloud. Mendukung animasi masuk/keluar kata dan efek _scatter_ saat kursor melewati kata.

#### Props

| Prop      | Tipe       | Default | Deskripsi                                  |
| --------- | ---------- | ------- | ------------------------------------------ |
| `answers` | `string[]` | `[]`    | Array jawaban pemain yang akan ditampilkan |
| `height`  | `number`   | `300`   | Tinggi area SVG word cloud dalam piksel    |

#### Contoh Penggunaan

```jsx
import WordCloud from "../components/WordCloud";

// answers: jawaban dari event wordcloud_update
<WordCloud answers={answers} height={300} />;
```

#### Cara Kerja

1. **Frekuensi kata** — setiap kata dihitung kemunculannya; kata yang lebih sering muncul ditampilkan lebih besar (ukuran font antara 18px – 80px).
2. **Layout** — d3-cloud mengatur posisi kata agar tidak tumpang tindih.
3. **Animasi enter/update/exit** — kata baru muncul dengan fade-in, kata lama yang hilang melakukan fade-out.
4. **Efek scatter mouse** — saat kursor mendekati kata, kata-kata tersebar menjauh dengan collision detection agar tidak saling tumpang tindih, lalu kembali ke batas SVG.
5. **Responsif** — lebar otomatis menyesuaikan ukuran container via `ResizeObserver`.

---

## Tipe Data

Berikut tipe data yang digunakan di seluruh client sebagai referensi.

```ts
type Player = {
  nickname: string;
};

type Question = {
  index: number; // 0-based
  text: string;
  total: number;
};

type AnswerDetail = {
  questionIndex: number;
  questionText: string;
  baseAnswer: string; // kunci jawaban dari Gemini
  answer: string; // jawaban pemain
  correct: boolean;
};

type Ranking = {
  rank: number;
  nickname: string;
  score: number;
  total: number;
  answers: AnswerDetail[];
};
```

---

## Alur Penggunaan

### Alur Host

```
/ (Home)
  └─ Klik "Buat Room" → /host (HostLobby)
       ├─ emit: create_room
       ├─ on:   room_created   → tampilkan kode room
       ├─ emit: generate_questions { topic }
       ├─ on:   questions_ready → aktifkan tombol "Mulai Game"
       ├─ emit: start_game
       └─ on:   game_started → /host/game (HostGame)
            ├─ emit: get_current_question
            ├─ on:   new_question     → tampilkan soal
            ├─ on:   wordcloud_update → perbarui word cloud
            ├─ emit: next_question    (per soal)
            ├─ emit: end_game         (soal terakhir)
            ├─ on:   grading_start   → tampilkan loading
            └─ on:   show_leaderboard → /leaderboard
```

### Alur Pemain

```
/ (Home)
  └─ Klik "Masuk Room" → /play (PlayerJoin)
       ├─ emit: join_room { roomCode, nickname }
       ├─ on:   join_error    → tampilkan error
       ├─ on:   player_joined → tampilkan daftar pemain
       └─ on:   game_started → /play/game (PlayerGame)
            ├─ emit: get_current_question
            ├─ on:   new_question  → tampilkan soal baru
            ├─ emit: submit_answer { questionIndex, answer }
            ├─ on:   grading_start → tampilkan layar menghitung
            └─ on:   show_leaderboard → /leaderboard
```
