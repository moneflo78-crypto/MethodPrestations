# GUIDA UTENTE

Benvenuto in **UncCalib Web**. Questa applicazione ti guida passo dopo passo nel calcolo dell'incertezza estesa dei tuoi metodi analitici. Non è richiesta alcuna installazione: apri la pagina nel tuo browser e inizia a lavorare.

---

### IL CONCETTO CHIAVE
Il software è progettato per essere **dinamico e flessibile**. Non esiste un unico modo per calcolare l'incertezza: tutto dipende da come hai condotto l'esperimento.
- Hai usato uno standard certificato?
- Hai fatto diluizioni o estrazioni?
- Hai usato una curva di taratura?

Rispondendo a queste domande nelle varie schede, il software costruirà automaticamente il "bilancio di incertezza" corretto per il tuo caso specifico.

---

### GESTIONE DEI DATI E SALVATAGGIO
- **Tutto locale:** I tuoi dati non lasciano mai il tuo computer. Vengono elaborati direttamente dal tuo browser per la massima sicurezza e privacy.
- **Salvataggio Progetto:** Usa il pulsante **"File" -> "Salva Progetto (.json)"** per scaricare un file con tutto il tuo lavoro. Potrai ricaricarlo in qualsiasi momento usando **"Carica Dati"** o trascinandolo nella finestra (drag & drop).

**Nota importante sul versionamento:** Quando carichi un vecchio progetto, il software aggiorna automaticamente i dati al formato più recente, preservando tutte le tue informazioni. Se salvi il progetto dopo averlo caricato, verrà creato un nuovo file con l'indicazione "(modificato)" nel nome. Se usi "Salva con nome", puoi scegliere tu il titolo (es. "progetto.json (modificato)").

---

### FLUSSO DI LAVORO CONSIGLIATO

#### 1. Frontespizio
In questa prima scheda, inserisci le informazioni che identificano la tua analisi:
- **Nome Progetto:** Un nome descrittivo. Verrà usato anche come nome di default per il file di salvataggio.
- **Obiettivo:** Lo scopo dell'analisi.
- **Metodo:** Seleziona il metodo analitico dal menu a tendina. Questa lista è popolata dalla **Libreria Metodi** (vedi sezione "Gestione Librerie"), che ti permette di pre-configurare i criteri di incertezza massima per ogni metodo.
- **Componente di Interesse:** L'analita che stai misurando (es. "Benzene", "Glifosato").

#### 2. Analisi dei Campioni
Questa è la scheda dove inserire i dati grezzi.
1.  **Aggiungi Campioni:** Clicca su **"Aggiungi Campione"** per creare una nuova scheda per ogni campione o livello di concentrazione che vuoi analizzare.
2.  **Configurazione Campione:**
    - **Nome:** Un nome univoco per il campione (es. "CRM 10 ppb", "Spike Livello Basso").
    - **Modalità Analisi:** Scegli tra:
        - **Standard:** Per analisi chimiche classiche dove si dispone direttamente della concentrazione o del segnale.
        - **Solidi Sospesi (SST):** Una modalità specifica per la gravimetria differenziale. In questa modalità, dovrai inserire il **Peso Lordo ($M_1$)** e la **Tara ($M_0$)** per ogni replica in una tabella dedicata. Dovrai inoltre selezionare la **Bilancia** e la **Vetreria** (solitamente un cilindro) utilizzate.
    - **Dati:**
        - In modalità **Standard**, incolla o digita i risultati delle tue misure replicate nel campo di testo (numeri separati da spazi o a capo).
        - In modalità **SST**, usa la tabella per inserire le coppie di pesi ($M_1$, $M_0$) per ogni replica. Puoi aggiungere o rimuovere righe secondo necessità.
    - **Valore Atteso (Opzionale):** Se stai analizzando un materiale di riferimento certificato (CRM) o uno spike, inserisci qui il suo valore nominale. Questo è **fondamentale** per calcolare il recupero.
        - *Nota per SST:* Il valore atteso deve essere espresso in **mg/L**.
    - **Unità:** Seleziona l'unità di misura corretta. (In modalità SST è fissa a mg/L).
3.  **Calcola:** Una volta inseriti tutti i dati, clicca sul pulsante verde **"Calcola"**. L'applicazione eseguirà l'analisi statistica di base, i test di normalità e la ricerca di outlier. I risultati appariranno nella sezione "Report Finale" in fondo alla pagina.

#### 3. Incertezza di Preparazione
In questa scheda puoi calcolare l'incertezza derivante dalla preparazione di standard e campioni. È divisa in tre sezioni a scomparsa (accordion).

- **Incertezza nella preparazione delle soluzioni di taratura:** Qui puoi modellare come hai preparato ogni standard della curva di taratura, partendo da un materiale di riferimento.
- **Preparazione dei matrix spike:** Questa sezione si attiva solo per i campioni per cui hai inserito un "Valore Atteso" nella scheda precedente. Permette di calcolare l'incertezza associata alla preparazione dello spike.
  - **Opzione Materiale Unico:** All'inizio della sezione, troverai una casella di controllo che ti permette di **usare un materiale di riferimento di partenza unico** per tutti i campioni. Selezionando questa opzione, potrai inserire una sola volta i dati del materiale (concentrazione, incertezza, **codice prodotto** e **lotto**), semplificando l'inserimento quando tutti gli spike originano dallo stesso standard madre.
  - Se non selezioni questa opzione, potrai definire un materiale di partenza diverso per ogni singolo campione, inserendo anche in questo caso il codice prodotto e il lotto specifici.
- **Trattamenti di campioni e estratti:** Questa potente sezione ti permette di calcolare l'incertezza per una catena di trattamenti (diluizioni, estrazioni, concentrazioni) applicati a un campione.
    1. Clicca su **"+ Aggiungi Campione da Trattare"**.
    2. Seleziona il campione di partenza (che può essere un campione base o il risultato di uno spike).
    3. Aggiungi i passaggi di trattamento cliccando sui pulsanti **"Diluizione"**, **"Estrazione"** o **"Concentrazione"**. Per ogni passaggio, inserisci i dati richiesti (volumi, pipette, matracci) usando le librerie personalizzabili. L'applicazione calcolerà l'incertezza propagata passo dopo passo.
    - **Novità nel trattamento di Estrazione:** Quando aggiungi un passaggio di estrazione, ora puoi specificare come viene determinato il volume finale. Puoi scegliere tra:
        - **Matraccio:** Il metodo classico, in cui l'estratto viene portato a un volume definito da un matraccio.
        - **Pipetta:** Un nuovo metodo in cui il volume finale è la somma di una o più aliquote prelevate con pipette. Questo è utile per tecniche come la microestrazione.

#### 4. Incertezza di Taratura
Qui calcoli il contributo di incertezza del modello di calibrazione.
1.  **Scegli il Metodo:**
    - **Retta dei Minimi Quadrati:** Se usi una curva di taratura a più punti. Inserisci le coppie di dati (concentrazione e segnale) per ogni punto.
    - **Fattore di Risposta:** Se usi una calibrazione a singolo punto. Inserisci il criterio di accettabilità (es. RSD% massimo) per il fattore di risposta.
2.  **Calcolo Opzionale da ICV:** Se vuoi considerare la variabilità dei controlli di taratura, inserisci il tuo criterio di accettabilità nel campo **MAX_RSD_ICV%**. L'applicazione userà il contributo peggiore (e quindi più conservativo) tra il modello e l'ICV.
3.  **Seleziona i Campioni:** Scegli per quali campioni (trattati nella sezione precedente) vuoi calcolare l'incertezza di taratura, oppure inserisci una concentrazione manuale.
    - **Nota per analisi "tal quale":** Se il tuo metodo non prevede trattamenti, la lista dei campioni selezionabili includerà automaticamente i campioni di preparazione dei **matrix spike** (solo quelli che non hanno subito ulteriori trattamenti). Questo garantisce che si possa sempre calcolare un'incertezza di taratura basata su dati pertinenti, anche in assenza di campioni trattati.
4.  **Calcola:** Clicca su **"Calcola Incertezza di Taratura"** per visualizzare i risultati.

#### 5. Incertezza Estesa
Questa scheda è di sola lettura e rappresenta il punto finale dell'analisi.
- **Riepilogo:** Mostra una tabella che riassume tutti i contributi di incertezza calcolati nelle sezioni precedenti (ripetibilità, preparazione, taratura, eventuale bias).
  - Per i campioni **SST**, i contributi mostrati saranno specifici: Ripetibilità ($u_r$), Peso Netto ($u_{Wnet}$) e Volume ($u_V$).
- **Risultati Finali:** Calcola l'incertezza estesa finale (U e U%) combinando tutti i contributi e applicando il fattore di copertura corretto (k).
- **Calcolo dell'Incertezza Massima Garantita:** In cima alla scheda, è presente una casella di controllo **"Mostra Incertezza Massima Garantita"**. Selezionandola, l'applicazione eseguirà un secondo calcolo di incertezza, parallelo a quello sperimentale. Questo calcolo non si basa sui dati misurati (come il CV%), ma utilizza i **criteri massimi di accettabilità** definiti nella libreria dei metodi (U rif.%, U ICV%, CV max%). Il risultato è un'incertezza "garantita" che rappresenta la prestazione massima (cioè, nel caso peggiore) che il metodo può avere rispettando i suoi stessi criteri.

---

### GESTIONE LIBRERIE
In questa scheda puoi personalizzare gli strumenti volumetrici e le bilance per farli corrispondere a quelli del tuo laboratorio. La gestione è organizzata in quattro sotto-schede:

- **Vetreria:** Aggiungi, modifica o rimuovi matracci e cilindri, specificando volume e tolleranza.
- **Pipette:** Aggiungi, modifica o rimuovi pipette, specificando per ognuna i punti di calibrazione (volume e incertezza relativa %).
- **Bilance:** Aggiungi, modifica o rimuovi bilance. Per ogni bilancia puoi inserire (se disponibili) i seguenti parametri, presi dal certificato di taratura:
    - **ID Bilancia:** Identificativo univoco (obbligatorio).
    - **Pesata Minima (g):** La pesata minima operativa.
    - **Portata (g):** La capacità massima della bilancia.
    - **Coefficiente alfa gl (g):** Coefficiente di incertezza (linearità/bias).
    - **Coefficiente beta gl (adim.):** Coefficiente di incertezza proporzionale.
- **Metodi e Criteri:** Aggiungi o modifica i metodi analitici. Per ogni metodo, puoi definire i criteri di incertezza massima garantita (U rif.%, U ICV%, CV max%) che verranno utilizzati nel calcolo dell'incertezza garantita.
- **Importa/Esporta:** Puoi salvare le tue librerie personalizzate (vetreria, pipette, bilance e metodi) in un unico file `.json` per condividerle o per tenerne un backup.

Le modifiche alle librerie vengono salvate automaticamente nel browser.

---

### VERIFICA VALIDAZIONE
Questa nuova scheda è dedicata alla garanzia della qualità del software stesso.
Permette di eseguire una serie di **casi di test standardizzati** (tratti da guide ufficiali come Eurachem e Unichim) per verificare che gli algoritmi di calcolo dell'applicazione funzionino correttamente.

1.  **Seleziona Test:** Scegli un caso di test dal menu a tendina (es. "Eurachem A1: Retta di Taratura").
2.  **Leggi Descrizione:** Verrà mostrata una descrizione del test e dei dati di input utilizzati.
3.  **Esegui:** Clicca su "Esegui Test di Verifica".
4.  **Risultati:** Il sistema calcolerà i risultati e li confronterà con i valori attesi dalla letteratura, evidenziando in verde (PASS) o rosso (FAIL) la conformità.

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
