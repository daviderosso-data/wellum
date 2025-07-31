# Wellum


connette persone, professionisti e strutture per rendere il movimento e il benessere accessibili, sociali e sostenibili.

Wellum è una web‑app che ha lo scopo di connettere persone, personal trainer e strutture sportive per rendere il movimento e il benessere accessibili, sociali e sostenibili. 

La piattaforma nella sua versione 1.0.0 permette di creare schede di allenamento personalizzate, eseguire allenamenti guidati, registrare i propri progressi e consultare una libreria di esercizi con immagini e video.

# Tecnologie utilizzate

## Frontend
### React con TypeScript

- Vite come bundler e dev‑server

- Tailwind CSS per lo styling

- Clerk per autenticazione e gestione degli utenti

- React Router per il routing client‑side

## Backend
### Node.js con Express

- MongoDB con Mongoose per la persistenza

- Multer per l’upload delle immagini

- express-mongo-sanitize per prevenire injection Mongo

# Funzionalità principali

- Autenticazione: registrazione e login tramite Clerk.

- Libreria esercizi: elenca esercizi con nome, descrizione, gruppo muscolare, immagine e video esplicativo. È possibile filtrare per gruppo muscolare e caricare nuovi esercizi (per utenti autorizzati).

- Schede di allenamento: crea, modifica e cancella schede che raggruppano esercizi con numero di serie, ripetizioni, carichi e note.

- **Allenamento guidato**: seleziona una scheda e segui un workout step‑by‑step con timer, pausa e possibilità di registrare il peso utilizzato. Al termine è possibile salvare l’allenamento nel calendario.

- Agenda: visualizza gli allenamenti completati su un calendario mensile; consente di vedere la durata totale e i dettagli del workout e di eliminare allenamenti.

# Installazione
### Prerequisiti

- Node.js v18 o superiore e npm/yarn

- MongoDB (può essere anche un cluster Atlas)

## Clonazione del repository

git clone https://github.com/daviderosso-data/wellum.git
cd wellum
Configurazione dell’ambiente
Copiare i file .env.example sia in client/ che in server/ (se disponibili) e rinominarli .env.


# Installazione delle dipendenze

## installa pacchetti server
cd server
npm install

## installa pacchetti client
cd ../client
npm install

# Avvio dell’applicazione
### Avviare il backend:

cd server
npm start

### In un’altra shell avviare il frontend:

cd client
npm run dev

Con entrambe le parti in esecuzione, si può aprire il browser all’indirizzo del client per interagire con Wellum.

# Guida rapida all’utilizzo

- Registrazione – Crea un account tramite il pulsante di registrazione. Il sistema utilizza Clerk per gestire le credenziali e la sessione.

- Creazione di una scheda – Accedi alla sezione Schede, clicca su “Crea una nuova scheda”, assegna un nome e aggiungi gli esercizi desiderati specificando serie, ripetizioni, peso e note opzionali.

- Allenamento guidato – Dalla dashboard seleziona una delle tue schede, scegli il tempo di recupero tra una serie e l’altra e avvia l’allenamento. L’applicazione ti mostrerà ogni esercizio con timer integrato e ti permetterà di segnare i carichi utilizzati.

- Libreria esercizi – Consulta l’elenco degli esercizi esistenti, filtrali per gruppo muscolare o aggiungi nuovi esercizi (se autorizzato) caricando un’immagine e specificando un video YouTube facoltativo.

- Agenda – Visualizza gli allenamenti salvati in un calendario mensile. Cliccando su un giorno vedrai i dettagli e potrai eventualmente eliminare le sessioni.

# Contatti
Davide Rosso
daviderosso.data@gmail.com 
