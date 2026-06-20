# World Cup Simulator

## Overview

Website World Cup yang menampilkan:

1. Live standings
2. Match schedule
3. Match results
4. World Cup simulator
5. Knockout bracket simulator

Tidak menggunakan database.

Data diambil dari external provider dan disimpan sementara menggunakan cache.

---

## Goals

Membuat website yang memungkinkan user:

- melihat klasemen World Cup
- melihat jadwal pertandingan
- melakukan simulasi skor pertandingan
- melihat hasil klasemen setelah simulasi
- memprediksi bracket knockout

---

## Non Goals

- User account
- Authentication
- Admin panel
- Database persistence
- Betting
- Real money prediction

---

## MVP Features

### Standings

Menampilkan:

- Group A-L
- Team
- Played
- Win
- Draw
- Loss
- GF
- GA
- GD
- Points

### Matches

Menampilkan:

- Match date
- Team Home
- Team Away
- Status
- Score

### Simulator

User dapat:

- Mengubah skor pertandingan
- Menambah skor pertandingan yang belum dimainkan

Sistem akan:

- Recalculate standings
- Recalculate ranking
- Recalculate qualification

### Knockout Simulator

User dapat memilih pemenang:

- Round of 32
- Round of 16
- Quarter Final
- Semi Final
- Final

Sistem menghasilkan:

- Predicted Champion

### Shareable Simulation

Generate URL:

/simulator?data=ENCODED_STATE

User dapat share hasil simulasi.

---

## Success Metrics

- User dapat membuka website tanpa login
- Standings tampil kurang dari 2 detik
- Simulator update kurang dari 100ms