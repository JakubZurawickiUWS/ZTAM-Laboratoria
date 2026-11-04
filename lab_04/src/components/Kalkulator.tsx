import { useCallback, useEffect, useState } from 'react';

import { IonButton, IonCard, IonCardContent, IonCol, IonGrid, IonRow } from '@ionic/react';

const komunikatDzielenia = 'Nie można dzielić przez zero';

const wykonajDzialanie = (a: number, b: number, dzialanie: string): number | null => {
  switch (dzialanie) {
    case '+':
      return a + b;

    case '−':
      return a - b;

    case '×':
      return a * b;

    case '÷':
      return b === 0 ? null : a / b;

    default:
      return null;
  }
};

const formatujWynik = (liczba: number): string => {
  if (!Number.isFinite(liczba)) {
    return 'Błąd obliczeń';
  }

  return String(parseFloat(liczba.toFixed(10)));
};

const Kalkulator: React.FC = () => {
  const [wyswietlacz, setWyswietlacz] = useState('0');

  const [poprzedniaLiczba, setPoprzedniaLiczba] = useState<number | null>(null);

  const [wybraneDzialanie, setWybraneDzialanie] = useState<string | null>(null);

  const [oczekujeNowejLiczby, setOczekujeNowejLiczby] = useState(false);

  const obsluzPrzycisk = useCallback(
    (znak: string) => {
      const czyBlad = wyswietlacz === komunikatDzielenia || wyswietlacz === 'Błąd obliczeń';

      // C - wyczyszczenie wszystkiego
      if (znak === 'C') {
        setWyswietlacz('0');
        setPoprzedniaLiczba(null);
        setWybraneDzialanie(null);
        setOczekujeNowejLiczby(false);
        return;
      }

      // Cofanie ostatniej cyfry
      if (znak === '⌫') {
        if (czyBlad || oczekujeNowejLiczby) {
          setWyswietlacz('0');
          setOczekujeNowejLiczby(false);
          return;
        }

        if (wyswietlacz.length <= 1) {
          setWyswietlacz('0');
          return;
        }

        const nowyTekst = wyswietlacz.slice(0, -1);

        setWyswietlacz(nowyTekst === '-' || nowyTekst === '' ? '0' : nowyTekst);

        return;
      }

      // Zmiana znaku liczby
      if (znak === '±') {
        if (czyBlad) {
          return;
        }

        if (oczekujeNowejLiczby && poprzedniaLiczba !== null) {
          setWyswietlacz('-0');
          setOczekujeNowejLiczby(false);
          return;
        }

        if (wyswietlacz.startsWith('-')) {
          setWyswietlacz(wyswietlacz.slice(1));
        } else {
          setWyswietlacz('-' + wyswietlacz);
        }

        setOczekujeNowejLiczby(false);
        return;
      }

      // Obliczanie procentów
      if (znak === '%') {
        if (czyBlad) {
          return;
        }

        const liczba = Number(wyswietlacz);
        let wynik: number;

        if (poprzedniaLiczba !== null && (wybraneDzialanie === '+' || wybraneDzialanie === '−')) {
          wynik = (poprzedniaLiczba * liczba) / 100;
        } else {
          wynik = liczba / 100;
        }

        setWyswietlacz(formatujWynik(wynik));
        setOczekujeNowejLiczby(false);
        return;
      }

      // Przycisk równa się
      if (znak === '=') {
        if (poprzedniaLiczba === null || wybraneDzialanie === null || czyBlad) {
          return;
        }

        const drugaLiczba = Number(wyswietlacz);

        const wynik = wykonajDzialanie(poprzedniaLiczba, drugaLiczba, wybraneDzialanie);

        if (wynik === null) {
          setWyswietlacz(komunikatDzielenia);
        } else {
          setWyswietlacz(formatujWynik(wynik));
        }

        setPoprzedniaLiczba(null);
        setWybraneDzialanie(null);
        setOczekujeNowejLiczby(true);
        return;
      }

      // Wybór działania oraz liczenie łańcuchowe
      if (['+', '−', '×', '÷'].includes(znak)) {
        if (czyBlad) {
          return;
        }

        const aktualnaLiczba = Number(wyswietlacz);

        if (poprzedniaLiczba !== null && wybraneDzialanie !== null && !oczekujeNowejLiczby) {
          const wynik = wykonajDzialanie(poprzedniaLiczba, aktualnaLiczba, wybraneDzialanie);

          if (wynik === null) {
            setWyswietlacz(komunikatDzielenia);
            setPoprzedniaLiczba(null);
            setWybraneDzialanie(null);
            setOczekujeNowejLiczby(true);
            return;
          }

          const tekstWyniku = formatujWynik(wynik);

          if (tekstWyniku === 'Błąd obliczeń') {
            setWyswietlacz(tekstWyniku);
            setPoprzedniaLiczba(null);
            setWybraneDzialanie(null);
            setOczekujeNowejLiczby(true);
            return;
          }

          setWyswietlacz(tekstWyniku);
          setPoprzedniaLiczba(Number(tekstWyniku));
        } else if (poprzedniaLiczba === null) {
          setPoprzedniaLiczba(aktualnaLiczba);
        }

        setWybraneDzialanie(znak);
        setOczekujeNowejLiczby(true);
        return;
      }

      // Kropka dziesiętna
      if (znak === '.') {
        if (czyBlad || oczekujeNowejLiczby) {
          setWyswietlacz('0.');
          setOczekujeNowejLiczby(false);
          return;
        }

        if (!wyswietlacz.includes('.')) {
          setWyswietlacz(wyswietlacz + '.');
        }

        return;
      }

      // Wpisywanie cyfr
      if (/^[0-9]$/.test(znak)) {
        if (czyBlad || oczekujeNowejLiczby) {
          setWyswietlacz(znak);
        } else if (wyswietlacz === '0') {
          setWyswietlacz(znak);
        } else if (wyswietlacz === '-0') {
          setWyswietlacz('-' + znak);
        } else {
          setWyswietlacz(wyswietlacz + znak);
        }

        setOczekujeNowejLiczby(false);
      }
    },
    [wyswietlacz, poprzedniaLiczba, wybraneDzialanie, oczekujeNowejLiczby],
  );

  // Obsługa klawiatury
  useEffect(() => {
    const obsluzKlawiature = (event: KeyboardEvent) => {
      // Nie przechwytujemy pisania w polach BMI
      const edycjaPola = event
        .composedPath()
        .some(
          (element) =>
            element instanceof HTMLElement &&
            (element.matches('input, textarea, select, ion-input, ion-textarea') || element.isContentEditable),
        );

      if (edycjaPola || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      let znak: string | null = null;

      if (/^[0-9]$/.test(event.key)) {
        znak = event.key;
      } else {
        switch (event.key) {
          case '+':
            znak = '+';
            break;

          case '-':
            znak = '−';
            break;

          case '*':
            znak = '×';
            break;

          case '/':
            znak = '÷';
            break;

          case '.':
          case ',':
            znak = '.';
            break;

          case '%':
            znak = '%';
            break;

          case '=':
          case 'Enter':
            znak = '=';
            break;

          case 'Backspace':
            znak = '⌫';
            break;

          case 'Escape':
          case 'Delete':
            znak = 'C';
            break;

          case 'F9':
            znak = '±';
            break;
        }
      }

      if (znak !== null) {
        event.preventDefault();
        obsluzPrzycisk(znak);
      }
    };

    window.addEventListener('keydown', obsluzKlawiature);

    return () => {
      window.removeEventListener('keydown', obsluzKlawiature);
    };
  }, [obsluzPrzycisk]);

  // Cztery kolumny przycisków
  const przyciski = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['C', '0', '.', '+'],
    ['±', '%', '⌫', '='],
  ];

  return (
    <IonCard>
      <IonCardContent>
        <h2>Kalkulator matematyczny</h2>

        <p
          style={{
            textAlign: 'right',
            minHeight: '20px',
          }}
        >
          {poprzedniaLiczba !== null ? `${poprzedniaLiczba} ${wybraneDzialanie}` : ''}
        </p>

        <h1
          style={{
            textAlign: 'right',
            overflowWrap: 'anywhere',
            minHeight: '45px',
          }}
        >
          {wyswietlacz}
        </h1>

        <IonGrid>
          {przyciski.map((wiersz, indeks) => (
            <IonRow key={indeks}>
              {wiersz.map((przycisk) => (
                <IonCol size="3" key={przycisk}>
                  <IonButton expand="block" onClick={() => obsluzPrzycisk(przycisk)}>
                    {przycisk}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          ))}
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default Kalkulator;
