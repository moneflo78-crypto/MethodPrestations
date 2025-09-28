#############################################################
# GUIDA PER L'UTILIZZATORE - Valutazione delle Prestazioni  #
#############################################################

## INTRODUZIONE
Benvenuto! Questa guida ti accompagnerà passo dopo passo nell'utilizzo dell'applicazione "Valutazione delle prestazioni del metodo applicato". Imparerai a inserire i tuoi dati, eseguire le analisi, calcolare l'incertezza e generare report completi e personalizzati.

L'applicazione è strutturata in schede (tab) che seguono un flusso logico di lavoro:
1.  **Frontespizio:** Inserisci le informazioni generali del tuo progetto.
2.  **Analisi Statistica:** Inserisci i dati grezzi dei tuoi campioni ed esegui i calcoli statistici di base.
3.  **Incertezza di Preparazione:** Modella i passaggi di preparazione dei campioni (diluizioni, estrazioni, ecc.) per calcolarne l'incertezza.
4.  **Incertezza di Taratura:** Calcola l'incertezza derivante dal tuo modello di calibrazione (retta o fattore di risposta).
5.  **Incertezza Estesa:** Combina tutti i contributi per ottenere l'incertezza estesa finale per ogni campione.
6.  **Report:** Genera report dettagliati in formato PDF, Excel o Word.
7.  **Gestione Librerie:** Personalizza le librerie di vetreria e pipette.

---

### IL MENU FILE: GESTIRE I TUOI PROGETTI

Nell'angolo in alto a destra, trovi il menu **File**, che è il centro di controllo per i tuoi progetti.

- **Nuovo:** Crea un progetto vuoto. Se hai delle modifiche non salvate, ti verrà chiesto di confermare per evitare di perdere il lavoro.
- **Apri...:** Carica un progetto precedentemente salvato dal tuo computer. I progetti sono salvati in formato `.json`.
- **Salva:** Se il progetto ha già un nome, lo salva sovrascrivendo la versione precedente. Se è un nuovo progetto, si comporterà come "Salva con nome...".
- **Salva con nome...:** Ti permette di salvare il progetto attuale in un nuovo file `.json`, scegliendo nome e posizione.
- **Duplica:** Crea una copia esatta del progetto attuale e ti chiede di salvarla con un nuovo nome. Utile per creare variazioni di un'analisi senza partire da zero.
- **Apri Recente:** Mostra un sottomenu con gli ultimi 5 progetti aperti, per un accesso rapido.

**Importante:** L'applicazione ti avvisa della presenza di modifiche non salvate tramite un indicatore di stato sotto il titolo (es. "progetto.json (modificato)").

---

### FLUSSO DI LAVORO CONSIGLIATO

#### 1. Frontespizio
In questa prima scheda, inserisci le informazioni che identificano la tua analisi:
- **Nome Progetto:** Un nome descrittivo. Verrà usato anche come nome di default per il file di salvataggio.
- **Obiettivo:** Lo scopo dell'analisi.
- **Metodo:** Il metodo analitico utilizzato (es. "EPA 8270D", "Metodo Interno LI-01").
- **Componente di Interesse:** L'analita che stai misurando (es. "Benzene", "Glifosato").

#### 2. Analisi Statistica
Questa è la scheda dove inserire i dati grezzi.
1.  **Aggiungi Campioni:** Clicca su **"Aggiungi Campione"** per creare una nuova scheda per ogni campione o livello di concentrazione che vuoi analizzare.
2.  **Inserisci i Dati:** In ogni scheda campione, inserisci:
    - **Nome:** Un nome univoco per il campione (es. "CRM 10 ppb", "Spike Livello Basso").
    - **Dati:** Incolla o digita i risultati delle tue misure replicate. I numeri possono essere separati da spazi, virgole o "a capo".
    - **Valore Atteso (Opzionale):** Se stai analizzando un materiale di riferimento certificato (CRM) o uno spike, inserisci qui il suo valore nominale. Questo è **fondamentale** per calcolare il recupero e per attivare la sezione di calcolo dell'incertezza dello spike.
    - **Unità:** Seleziona l'unità di misura corretta.
3.  **Calcola:** Una volta inseriti tutti i dati, clicca sul pulsante verde **"Calcola"**. L'applicazione eseguirà l'analisi statistica di base, i test di normalità e la ricerca di outlier. I risultati appariranno nella sezione "Report Finale" in fondo alla pagina.

#### 3. Incertezza di Preparazione
In questa scheda puoi calcolare l'incertezza derivante dalla preparazione di standard e campioni. È divisa in tre sezioni a scomparsa (accordion).

- **Incertezza nella preparazione delle soluzioni di taratura:** Qui puoi modellare come hai preparato ogni standard della curva di taratura, partendo da un materiale di riferimento.
- **Preparazione dei matrix spike:** Questa sezione si attiva solo per i campioni per cui hai inserito un "Valore Atteso" nella scheda precedente. Permette di calcolare l'incertezza associata alla preparazione dello spike.
  - **Novità:** All'inizio della sezione, troverai una casella di controllo che ti permette di **usare un materiale di riferimento di partenza unico** per tutti i campioni. Selezionando questa opzione, potrai inserire una sola volta i dati del materiale (concentrazione, incertezza, **codice prodotto** e **lotto**), semplificando l'inserimento quando tutti gli spike originano dallo stesso standard madre.
  - Se non selezioni questa opzione, potrai definire un materiale di partenza diverso per ogni singolo campione, inserendo anche in questo caso il codice prodotto e il lotto specifici.
- **Trattamenti di campioni e estratti:** Questa potente sezione ti permette di calcolare l'incertezza per una catena di trattamenti (diluizioni, estrazioni, concentrazioni) applicati a un campione.
    1. Clicca su **"+ Aggiungi Campione da Trattare"**.
    2. Seleziona il campione di partenza (che può essere un campione base o il risultato di uno spike).
    3. Aggiungi i passaggi di trattamento cliccando sui pulsanti **"Diluizione"**, **"Estrazione"** o **"Concentrazione"**. Per ogni passaggio, inserisci i dati richiesti (volumi, pipette, matracci) usando le librerie personalizzabili. L'applicazione calcolerà l'incertezza propagata passo dopo passo.

#### 4. Incertezza di Taratura
Qui calcoli il contributo di incertezza del modello di calibrazione.
1.  **Scegli il Metodo:**
    - **Retta dei Minimi Quadrati:** Se usi una curva di taratura a più punti. Inserisci le coppie di dati (concentrazione e segnale) per ogni punto.
    - **Fattore di Risposta:** Se usi una calibrazione a singolo punto. Inserisci il criterio di accettabilità (es. RSD% massimo) per il fattore di risposta.
2.  **Calcolo Opzionale da ICV:** Se vuoi considerare la variabilità dei controlli di taratura, inserisci il tuo criterio di accettabilità nel campo **MAX_RSD_ICV%**. L'applicazione userà il contributo peggiore (e quindi più conservativo) tra il modello e l'ICV.
3.  **Seleziona i Campioni:** Scegli per quali campioni (trattati nella sezione precedente) vuoi calcolare l'incertezza di taratura, oppure inserisci una concentrazione manuale.
4.  **Calcola:** Clicca su **"Calcola Incertezza di Taratura"** per visualizzare i risultati.

#### 5. Incertezza Estesa
Questa scheda è di sola lettura e rappresenta il punto finale dell'analisi.
- **Riepilogo:** Mostra una tabella che riassume tutti i contributi di incertezza calcolati nelle sezioni precedenti (ripetibilità, preparazione, taratura, eventuale bias).
- **Risultati Finali:** Calcola l'incertezza estesa finale (U e U%) combinando tutti i contributi e applicando il fattore di copertura corretto (k), calcolato tramite i gradi di libertà effettivi (formula di Welch-Satterthwaite).

---

### LA SEZIONE REPORT: COMUNICARE I TUOI RISULTATI

Questa è una delle sezioni più potenti. Permette di creare report personalizzati e professionali. È divisa in due sotto-schede.

#### Report Progetto Singolo
Permette di creare un report dettagliato per il progetto attualmente caricato.

**Opzioni di Configurazione:**
- **Organizza report per:**
  - **Campione:** Il report sarà strutturato per campione. Per ogni campione, verranno mostrate tutte le caratteristiche selezionate (statistica, preparazione, ecc.).
  - **Caratteristica:** Il report sarà strutturato per caratteristica. Per ogni caratteristica (es. "Analisi Statistica"), verranno mostrati i risultati per tutti i campioni.
- **Scegli la rappresentazione:**
  - **Estesa:** Genera un report molto dettagliato, con tabelle e spiegazioni per ogni sezione. Ideale per una documentazione completa.
  - **Compatta:** Genera una singola tabella riassuntiva, perfetta per confronti rapidi e visualizzazioni sintetiche.
- **Griglia delle sezioni:** Permette di scegliere quali informazioni includere nel report. Puoi selezionare intere sezioni (es. "Analisi statistica") o singoli elementi (es. solo le "Statistiche descrittive").

**Formati di Esportazione:**
- **PDF:** Ideale per la condivisione e l'archiviazione.
- **Excel:** Utile per ulteriori elaborazioni dei dati.
- **Word:** Permette di modificare e integrare facilmente il report in altri documenti.

#### Report Multiprogetto
Questa funzionalità unica ti permette di confrontare i risultati di più analisi.
1.  **Carica Progetti:** Clicca su **"Carica Progetti (.json)"** e seleziona più file di progetto salvati in precedenza. L'applicazione li caricherà in memoria.
2.  **Configura e Esporta:** Scegli come raggruppare i dati (per campione o per caratteristica) e clicca sul formato di esportazione desiderato. Il report multiprogetto genera tabelle comparative che affiancano i risultati dei diversi progetti, rendendo immediato il confronto delle prestazioni nel tempo o tra diverse condizioni.

---

### GESTIONE LIBRERIE
In questa scheda puoi personalizzare gli strumenti volumetrici per farli corrispondere a quelli del tuo laboratorio.
- **Vetreria:** Aggiungi, modifica o rimuovi matracci, specificando volume e tolleranza.
- **Pipette:** Aggiungi, modifica o rimuovi pipette, specificando per ognuna i punti di calibrazione (volume e incertezza relativa %).
- **Importa/Esporta:** Puoi salvare le tue librerie personalizzate in un file `.json` per condividerle o per tenerne un backup.

Le modifiche alle librerie vengono salvate automaticamente nel browser.