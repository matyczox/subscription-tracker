# 💳 Subscription Tracker (Web App)

> Nowoczesna, elegancka aplikacja webowa do zarządzania subskrypcjami i śledzenia miesięcznych kosztów — stworzona przy wsparciu AI.

![React](https://img.shields.io/badge/React-18+-blue?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-latest-purple?logo=vite)
![Status](https://img.shields.io/badge/Status-Active_Development-orange)

---

## ✨ Funkcje

| Status | Funkcja | Opis |
|--------|---------|------|
| ✅ | **Dodawanie subskrypcji** | Interaktywne modalne dodawanie nowych subskrypcji |
| ✅ | **Lista subskrypcji** | Kolorowa, nowoczesna tabela ze wszystkimi aktywnymi subskrypcjami |
| ✅ | **Podsumowanie miesięczne** | Koszty z normalizacją rocznych na miesięczne i świetną wizualizacją |
| ✅ | **Przechowywanie danych** | Bezpieczny zapis bezpośrednio w pamięci przeglądarki (LocalStorage) |

---

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js (v16+)
- npm lub yarn

### Kroki

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/matyczox/subscription-tracker.git
cd subscription-tracker

# 2. Zainstaluj zależności
npm install

# 3. Uruchom aplikację deweloperską
npm run dev
```

Otwórz w przeglądarce adres `http://localhost:5173/`, aby zobaczyć aplikację w akcji.

## 🧪 Testy

Projekt posiada skonfigurowane środowisko testowe **Vitest** oraz 5 przechodzących testów jednostkowych badających główną logikę przechowywania i transformacji danych.

```bash
npm run test
```

*Status testów*: ✅ Wszystkie 5 testów przechodzi pomyślnie.

---

## 📝 Licencja

Projekt edukacyjny.

---

## 🤖 Wkład AI (AI Contribution)

Zgodnie z wymogami projektu, aplikacja została stworzona z użyciem narzędzi opartych na Sztucznej Inteligencji (np. Gemini/Cursor).
- **Projekty samodzielne**: Wstępny pomysł na działanie aplikacji, logika biznesowa przeliczania częstotliwości płatności, wytyczne architektury React + Vite.
- **Wygenerowane z asystą AI**: Struktura wizualna (Glassmorphism), konfiguracja komponentów Recharts (wykresy kołowe / osie czasu), dodane testy jednostkowe Vitest. Z asystentem rozwiązywaliśmy również problemy z formatami LocalStorage na wielu widokach oraz konwersją walut. Cały proces obejmował współpracę nad optymalizacją i dostarczaniem docelowej dokumentacji (wytyczne).
