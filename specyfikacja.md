# Specyfikacja Projektu: Subscription Tracker

## 1. Opis Funkcjonalności
Aplikacja "Subscription Tracker" służy do zarządzania i monitorowania cyklicznych wydatków (subskrypcji). Główne funkcjonalności to:
- **Dodawanie subskrypcji**: Możliwość wprowadzenia nowej subskrypcji z podaniem nazwy, kosztu, waluty, cyklu rozliczeniowego i kategorii.
- **Lista subskrypcji**: Podgląd wszystkich aktywnych i wstrzymanych subskrypcji w formie przejrzystej tabeli.
- **Edycja i usuwanie**: Pozwala na modyfikację istniejących wpisów oraz ich całkowite usunięcie (z potwierdzeniem).
- **Dashboard (Podsumowanie)**: Prezentacja kluczowych wskaźników finansowych, takich jak miesięczne i roczne koszty, podzielone na kategorie (wykresy kołowe) oraz trendy wydatków.
- **Zarządzanie stanem (Pauza/Aktywacja)**: Użytkownik może tymczasowo zawiesić subskrypcję, co wyklucza ją z miesięcznego bilansu kosztów.
- **Ustawienia i Personalizacja**: Możliwość zmiany waluty aplikacji (PLN, USD, EUR, GBP), ustawienie miesięcznego budżetu, powiadomień oraz importowanie/eksportowanie danych do pliku JSON.

## 2. Wygląd aplikacji
Aplikacja została zaprojektowana w oparciu o styl "Glassmorphism" i domyślny ciemny motyw (Dark Mode).
- **Kolorystyka**: Głębokie odcienie fioletu i czerni (`#0a0616`), z gradientowymi akcentami neonowymi (`#7c3aed`, `#2563eb`).
- **Układ**: 
  - Strona główna z kafelkami statystyk przypiętymi do góry.
  - Wykresy umieszczone centralnie za pomocą Recharts.
  - Tabela subskrypcji z dolnym lub modalnym formularzem edycji.
  - Górny pasek nawigacyjny do przełączania się między "Dashboardem" a "Ustawieniami".

## 3. Wymagania Techniczne
- **Framework Frontendowy**: React (w wersji 19+) oparty na bundlerze Vite.
- **Język**: JavaScript (ES6+).
- **Stylizacja**: Vanilla CSS, wspomagane zaawansowanymi funkcjami CSS (Grid, Flexbox, Zmienne CSS).
- **Zarządzanie Stanem**: Context API (plik `SubscriptionContext.jsx`).
- **Nawigacja**: `react-router-dom`.
- **Wykresy**: Biblioteka `recharts`.
- **Baza danych / Przechowywanie danych**: Brak zewnętrznego backendu. Wszystkie dane użytkownika przechowywane są w pamięci przeglądarki (Web Storage API - `localStorage`).

## 4. Schemat Struktur Danych
Główną i najważniejszą strukturą w aplikacji jest obiekt `Subscription` oraz obiekt `Settings`.

### Obiekt `Subscription` (Zapisywane w tablicy w LocalStorage pod kluczem `subtrack_subscriptions`)
```json
{
  "id": "abc123xyz",           // string (unikalny identyfikator)
  "name": "Netflix",           // string (nazwa subskrypcji)
  "cost": "49.99",             // string/number (kwota)
  "currency": "PLN",           // string (kod waluty)
  "billingCycle": "monthly",   // string ('weekly', 'monthly', 'quarterly', 'yearly')
  "category": "entertainment", // string
  "status": "active",          // string ('active' | 'paused')
  "startDate": "2023-11-20"    // string (data ISO)
}
```

### Obiekt `Settings` (Zapisywane w LocalStorage pod kluczem `subtrack_settings`)
```json
{
  "currency": "PLN",           // string (domyślna waluta)
  "monthlyBudget": 500,        // number (limit ostrzegawczy)
  "notificationsEnabled": true // boolean
}
```

## 5. Przypadki użycia (Use Cases)
1. **Dodanie nowej subskrypcji**: Użytkownik otwiera aplikację, klika "Dodaj subskrypcję", wprowadza kwotę 50 PLN za siłownię. Aplikacja natychmiast przelicza całkowity koszt miesięczny na Dashboardzie i dodaje element lokalnie za pomocą `utils/storage.js`.
2. **Przekroczenie budżetu**: Przy dodawaniu usługi przekraczającej ustalony budżet (np. 1000 PLN zdefiniowane w pliku `Settings`), system zgłasza błąd za pomocą komponentu `react-hot-toast` ostrzegając o złym stanie finansów.
