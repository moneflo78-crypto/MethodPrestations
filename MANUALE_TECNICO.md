# MANUALE TECNICO - CALCOLO DELL'INCERTEZZA ESTESA

Questo documento descrive in dettaglio le formule matematiche e le procedure utilizzate dall'applicazione per il calcolo dell'incertezza estesa dei risultati analitici.

## INDICE

1.  **Principi Generali**
2.  **Statistiche di Base (Analisi Statistica)**
    *   2.1 Media e Deviazione Standard
    *   2.2 Test di Normalità (Shapiro-Wilk)
    *   2.3 Rilevazione Outlier (Grubbs, Dixon, Huber)
    *   2.4 Ripetibilità e Recupero
3.  **Incertezza di Taratura**
    *   3.1 Metodo Retta dei Minimi Quadrati (Regressione Lineare)
    *   3.2 Metodo Fattore di Risposta Medio (RF)
4.  **Incertezza di Preparazione (Matrix Spike & Trattamenti)**
    *   4.1 Contributo da Soluzioni Standard (Spike/Calibrazione)
    *   4.2 Contributo da Diluizione
    *   4.3 Contributo da Estrazione
    *   4.4 Contributo da Concentrazione
    *   *Nota sull'esclusione della Ripetibilità*
5.  **Incertezza Estesa Finale**
    *   5.1 Combinazione dei Contributi (Welch-Satterthwaite)
    *   5.2 Gradi di Libertà Effettivi e Fattore di Copertura
    *   5.3 Calcolo dell'Incertezza Estesa (U)
6.  **Calcolo dell'Incertezza per Solidi Sospesi Totali (SST)**
    *   6.1 Formula Generale
    *   6.2 Contributo Peso Netto
    *   6.3 Contributo Volume
    *   6.4 Ripetibilità
7.  **Tabelle di Riferimento**
8.  **Calcolo dell'Incertezza Massima Garantita**
9.  **Regole di Arrotondamento e Presentazione dei Risultati**
10. **Validazione del Software**

---

### SEZIONE 1: PRINCIPI GENERALI

Il software calcola l'incertezza di misura secondo i principi della guida **GUM (Guide to the Expression of Uncertainty in Measurement)** e della guida **Eurachem/CITAC "Quantifying Uncertainty in Analytical Measurement"**.

L'incertezza estesa ($U$) è ottenuta moltiplicando l'incertezza standard composta ($u_c$) per un fattore di copertura ($k$).
$$U = k \cdot u_c$$

Il fattore $k$ è determinato in base ai gradi di libertà effettivi ($\nu_{eff}$) del sistema, calcolati tramite la formula di Welch-Satterthwaite, per garantire un livello di fiducia del 95% (usando la distribuzione t di Student).

---

### SEZIONE 2: STATISTICHE DI BASE (ANALISI STATISTICA)

Questa sezione analizza i dati grezzi inseriti per ogni campione (repliche).

#### 2.1 Media e Deviazione Standard
- **Media ($\bar{x}$):** Somma dei valori divisa per il numero di osservazioni ($n$).
  $$ \bar{x} = \frac{\sum x_i}{n} $$
- **Deviazione Standard ($s$):** Misura della dispersione dei dati attorno alla media.
  $$ s = \sqrt{\frac{\sum (x_i - \bar{x})^2}{n-1}} $$
- **Coefficiente di Variazione (CV%):** La deviazione standard relativa espressa in percentuale.
  $$ CV\% = \frac{s}{|\bar{x}|} \cdot 100 $$

#### 2.2 Test di Normalità (Shapiro-Wilk)
Verifica se i dati seguono una distribuzione normale (gaussiana).
- **Statistica $W$:** Calcolata in base alla varianza e a una stima della pendenza della retta di probabilità.
  $$ W = \frac{(\sum a_i x_{(i)})^2}{\sum (x_i - \bar{x})^2} $$
  dove $x_{(i)}$ sono i dati ordinati e $a_i$ sono coefficienti tabulati.
- **Normalità:** Se il valore $W$ è superiore a un valore critico (o se la variabile normalizzata $kp > -1.645$ per $\alpha=0.05$), i dati sono considerati normali.

#### 2.3 Rilevazione Outlier
Se i dati sono normali, l'utente può scegliere tra:
- **Test di Grubbs:** Ideale per rilevare un singolo outlier in una distribuzione normale univariata.
  $$ G = \frac{\max|x_i - \bar{x}|}{s} $$
  Se $G > G_{critico}$, il valore è un outlier.
- **Test di Dixon:** Adatto per piccoli campioni ($n \le 25$). Si basa sui rapporti tra le differenze dei valori ordinati.

Se i dati **non** sono normali, viene proposto:
- **Test di Huber:** Metodo robusto basato sulla Mediana e sulla MAD (Median Absolute Deviation).
  $$ z_i = \frac{|x_i - \text{mediana}|}{\text{MAD}} $$
  Se $z_i > 4.5$, il valore è considerato anomalo.

#### 2.4 Ripetibilità e Recupero
- **Limite di Ripetibilità ($r$):** L'intervallo entro cui si attende che cada la differenza assoluta tra due risultati di prova ottenuti nelle stesse condizioni con una probabilità del 95%.
  $$ r = t_{95, n-1} \cdot s \cdot \sqrt{2} $$
- **Recupero ($R\%$):** Rapporto tra la concentrazione media calcolata e il valore atteso (nominale).
  $$ R\% = \frac{\bar{x}}{\text{Valore Atteso}} \cdot 100 $$
  *Nota:* Per gli SST, la concentrazione media è calcolata come $(\bar{W}_{net} \cdot 1000) / V_{cilindro}$.

---

### SEZIONE 3: INCERTEZZA DI TARATURA

Il software calcola l'incertezza derivante dalla curva di calibrazione.

#### 3.1 Metodo Retta dei Minimi Quadrati
Utilizza una regressione lineare $y = a + bx$.
L'incertezza standard della concentrazione $x_{campione}$ calcolata a partire da un segnale misurato $y_k$ è data da:

$$ u(x_{campione}) = \frac{s_{y/x}}{b} \sqrt{\frac{1}{p} + \frac{1}{n} + \frac{(y_k - \bar{y})^2}{b^2 \sum (x_i - \bar{x})^2}} $$

Dove:
- $s_{y/x}$: Deviazione standard residua della regressione.
- $b$: Pendenza della retta.
- $p$: Numero di repliche effettuate sul campione ($y_k$).
- $n$: Numero di punti della retta di taratura.
- $\bar{y}, \bar{x}$: Medie dei segnali e delle concentrazioni della taratura.

#### 3.2 Metodo Fattore di Risposta Medio (RF)
Se la taratura usa un fattore di risposta medio ($RF = \frac{\text{Area}}{\text{Conc}}$), l'incertezza relativa è la deviazione standard relativa degli $RF$ calcolati per ogni livello.

$$ u_{rel}(taratura) = \frac{s_{RF}}{\bar{RF}} = CV_{RF} $$

---

### SEZIONE 4: INCERTEZZA DI PREPARAZIONE

Questa sezione calcola l'incertezza composta relativa ($u_{c, rel}$) di tutti i passaggi di preparazione del campione (diluizioni, estrazioni, ecc.).

#### Formula Generale di Propagazione
Per ogni operazione (moltiplicazione/divisione), le incertezze relative si sommano in quadratura:
$$ u_{c, rel} = \sqrt{\sum u_{rel, i}^2} $$

**Nota Importante:** In questa fase viene calcolata solo l'incertezza derivante dalla strumentazione volumetrica e dalla preparazione dello standard/spike. Il contributo di ripetibilità del campione (CV%) **NON** è incluso in questo calcolo, ma viene aggiunto separatamente nel calcolo dell'incertezza estesa finale (vedi Sezione 5) per evitare doppi conteggi.

#### 4.1 Contributo da Soluzioni Standard
Se si parte da uno standard certificato:
$$ u_{rel}(std) = \frac{U_{certificato}}{k_{cert} \cdot C_{nominale}} $$
Generalmente $k_{cert}=2$.

#### 4.2 Contributo da Diluizione ($C_1 V_1 = C_2 V_2$)
Coinvolge l'incertezza del prelievo ($V_1$, pipetta) e del volume finale ($V_2$, matraccio).
- **Vetreria (Matracci):** Distribuzione triangolare ($\sqrt{3}$).
  $$ u(V) = \frac{\text{Tolleranza}}{\sqrt{3}} \quad \Rightarrow \quad u_{rel}(V) = \frac{u(V)}{V_{nominale}} $$
- **Pipette:** L'incertezza è calcolata interpolando o selezionando il valore massimo tra i punti di taratura della pipetta utilizzata per il volume specifico.
  $$ u_{rel}(Pipetta) = \frac{u(V_{prelevato})}{V_{prelevato}} $$

#### 4.3 Contributo da Estrazione
Simile alla diluizione, considera il volume di campione/solvente iniziale e il volume dell'estratto finale.
$$ u_{rel}(Estrazione) = \sqrt{u_{rel}(V_{iniziale})^2 + u_{rel}(V_{finale})^2} $$
Se il volume finale è ottenuto sommando aliquote, l'incertezza è la combinazione delle incertezze delle singole pipettate.

#### 4.4 Contributo da Concentrazione
Considera la riduzione di volume da un matraccio iniziale a uno finale.
$$ u_{rel}(Conc.) = \sqrt{u_{rel}(V_{iniziale})^2 + u_{rel}(V_{finale})^2} $$

---

### SEZIONE 5: INCERTEZZA ESTESA FINALE

Combina tutti i contributi precedenti per ottenere il risultato finale.

#### 5.1 Combinazione dei Contributi
$$ u_c(y) = y \cdot \sqrt{u_{rel}(Ripetibilità)^2 + u_{rel}(Taratura)^2 + u_{rel}(Preparazione)^2 + \dots} $$

I contributi tipici sono:
- **Ripetibilità:** $u_{rel} = \frac{s}{\bar{x}}$ (CV% calcolato direttamente sui campioni).
- **Taratura:** Dal calcolo della retta o RF.
- **Preparazione:** Dal calcolo dei passaggi di diluizione/estrazione.
- **Bias (Opzionale):** Se il test di accuratezza sul Matrix Spike fallisce, l'incertezza associata alla preparazione dello spike viene aggiunta come contributo di Bias.

#### 5.2 Gradi di Libertà Effettivi ($\nu_{eff}$)
Calcolati con la formula di Welch-Satterthwaite per gestire contributi con diversi gradi di affidabilità (es. ripetibilità con $n-1$ gradi, tolleranze vetreria con $\infty$ gradi).

$$ \nu_{eff} = \frac{u_c(y)^4}{\sum \frac{u_i(y)^4}{\nu_i}} $$

#### 5.3 Calcolo dell'Incertezza Estesa ($U$)
1.  Si determina il fattore di copertura $k$ dalla distribuzione t di Student per $\nu_{eff}$ gradi di libertà al 95% di fiducia (spesso $k \approx 2$).
2.  $$ U = k \cdot u_c(y) $$

---

### SEZIONE 6: CALCOLO DELL'INCERTEZZA PER SOLIDI SOSPESI TOTALI (SST)

Per la determinazione dei solidi sospesi, il calcolo dell'incertezza segue un modello specifico basato sulla pesata differenziale e sul volume filtrato.

#### 6.1 Formula Generale
L'incertezza composta relativa percentuale associata a SST ($u_{SST}\%$) è data da:

$$ u_{SST}\% = \sqrt{u_r\%^2 + u_{Wnet}\%^2 + u_V\%^2} $$

Dove:
- $u_r\%$: Ripetibilità sulla misura globale (CV% delle concentrazioni misurate).
- $u_{Wnet}\%$: Incertezza relativa sul peso netto.
- $u_V\%$: Incertezza relativa sul volume prelevato.

#### 6.2 Contributo Peso Netto ($u_{Wnet}\%$)
Il peso netto medio $R$ (in grammi) viene retro-calcolato dalla concentrazione media ($\bar{x}_{conc}$) e dal volume utilizzato ($V_L$):
$$ R = (\bar{x}_{conc} \cdot V_L) / 1000 $$

L'incertezza standard della bilancia ($u_L$) è derivata dai parametri $\alpha$ (linearità/bias costante) e $\beta$ (errore proporzionale) della bilancia, memorizzati nella libreria:
$$ U_{gl} = \alpha + \beta \cdot R $$
$$ u_L = \frac{U_{gl}}{2} $$
(Si assume un fattore di copertura $k=2$ per i dati della bilancia).

Poiché il peso netto è una differenza di due pesate indipendenti ($M_1$ e $M_0$), l'incertezza si propaga con un fattore $\sqrt{2}$:
$$ u_{Wnet} = \sqrt{2} \cdot u_L $$

L'incertezza relativa è quindi:
$$ u_{Wnet}\% = \frac{u_{Wnet}}{R} \cdot 100 $$

#### 6.3 Contributo Volume ($u_V\%$)
Dipende dalla classe del cilindro o matraccio utilizzato per la misurazione del campione.
$$ u_V = \frac{\text{Tolleranza}}{\sqrt{3}} $$
(Distribuzione rettangolare).

$$ u_V\% = \frac{u_V}{V_{nominale}} \cdot 100 $$

#### 6.4 Ripetibilità ($u_r\%$)
È il coefficiente di variazione (CV%) calcolato sulle $n$ determinazioni (concentrazioni):
$$ u_r\% = CV\% $$

---

### SEZIONE 7: TABELLE DI RIFERIMENTO E DATI

#### 7.1 Valori T di Student (95% fiducia, due code)
Utilizzati per il calcolo dell'intervallo di fiducia e del limite di ripetibilità.
- `dof` = gradi di libertà ($n-1$)

| dof | t value |   | dof | t value |   | dof | t value |
|-----|---------|---|-----|---------|---|-----|---------|
| 1   | 12.706  |   | 11  | 2.201   |   | 21  | 2.080   |
| 2   | 4.303   |   | 12  | 2.179   |   | 22  | 2.074   |
| 3   | 3.182   |   | 13  | 2.160   |   | 23  | 2.069   |
| 4   | 2.776   |   | 14  | 2.145   |   | 24  | 2.064   |
| 5   | 2.571   |   | 15  | 2.131   |   | 25  | 2.060   |
| 6   | 2.447   |   | 16  | 2.120   |   | 26  | 2.056   |
| 7   | 2.365   |   | 17  | 2.110   |   | 27  | 2.052   |
| 8   | 2.306   |   | 18  | 2.101   |   | 28  | 2.048   |
| 9   | 2.262   |   | 19  | 2.093   |   | 29  | 2.045   |
| 10  | 2.228   |   | 20  | 2.086   |   | 30  | 2.042   |
| >30 | 1.960   |   |     |         |   |     |         |

#### 7.2 Valori Critici del Test di Grubbs (α = 0.05)
Utilizzati per identificare un singolo outlier in un campione.
- `n` = dimensione del campione

| n  | G critico |   | n  | G critico |
|----|-----------|---|----|-----------|
| 3  | 1.155     |   | 15 | 2.549     |
| 4  | 1.481     |   | 16 | 2.585     |
| 5  | 1.715     |   | 17 | 2.620     |
| 6  | 1.887     |   | 18 | 2.651     |
| 7  | 2.020     |   | 19 | 2.681     |
| 8  | 2.126     |   | 20 | 2.709     |
| 9  | 2.215     |   | 21 | 2.733     |
| 10 | 2.290     |   | 22 | 2.758     |
| 11 | 2.355     |   | 23 | 2.781     |
| 12 | 2.412     |   | 24 | 2.802     |
| 13 | 2.462     |   | 25 | 2.822     |
| 14 | 2.507     |   | 26 | 2.841     |

#### 7.3 Coefficienti per il Test di Shapiro-Wilk
Queste tabelle contengono i coefficienti `a_i`, `g`, `e`, `f` necessari per il calcolo, per n da 3 a 26.

**Tabella `a_coeffs_table` (Completa):**
- **n=3:** [0.7071]
- **n=4:** [0.6872, 0.1677]
- **n=5:** [0.6646, 0.2413]
- **n=6:** [0.6431, 0.2806, 0.0875]
- **n=7:** [0.6233, 0.3031, 0.1401]
- **n=8:** [0.6052, 0.3164, 0.1743, 0.0561]
- **n=9:** [0.5888, 0.3244, 0.1976, 0.0947]
- **n=10:** [0.5739, 0.3291, 0.2141, 0.1224, 0.0399]
- **n=11:** [0.5601, 0.3315, 0.2260, 0.1429, 0.0695]
- **n=12:** [0.5475, 0.3325, 0.2347, 0.1586, 0.0922, 0.0303]
- **n=13:** [0.5359, 0.3325, 0.2412, 0.1707, 0.1099, 0.0539]
- **n=14:** [0.5251, 0.3318, 0.2460, 0.1802, 0.1240, 0.0727, 0.0240]
- **n=15:** [0.5150, 0.3306, 0.2495, 0.1878, 0.1353, 0.0880, 0.0433]
- **n=16:** [0.5056, 0.3290, 0.2521, 0.1939, 0.1447, 0.1005, 0.0593, 0.0196]
- **n=17:** [0.4968, 0.3273, 0.2540, 0.1988, 0.1524, 0.1109, 0.0725, 0.0359]
- **n=18:** [0.4886, 0.3253, 0.2553, 0.2027, 0.1587, 0.1197, 0.0837, 0.0496, 0.0153]
- **n=19:** [0.4808, 0.3232, 0.2561, 0.2059, 0.1641, 0.1271, 0.0932, 0.0612, 0.0303]
- **n=20:** [0.4734, 0.3211, 0.2565, 0.2085, 0.1686, 0.1334, 0.1013, 0.0711, 0.0422, 0.0140]
- **n=21:** [0.4643, 0.3185, 0.2578, 0.2119, 0.1736, 0.1399, 0.1092, 0.0804, 0.0530, 0.0263]
- **n=22:** [0.4590, 0.3156, 0.2571, 0.2131, 0.1764, 0.1443, 0.1150, 0.0878, 0.0618, 0.0368, 0.0122]
- **n=23:** [0.4542, 0.3126, 0.2563, 0.2139, 0.1787, 0.1480, 0.1201, 0.0941, 0.0696, 0.0459, 0.0228]
- **n=24:** [0.4493, 0.3098, 0.2554, 0.2145, 0.1807, 0.1512, 0.1245, 0.0997, 0.0764, 0.0539, 0.0321, 0.0107]
- **n=25:** [0.4450, 0.3069, 0.2543, 0.2148, 0.1822, 0.1539, 0.1283, 0.1046, 0.0823, 0.0610, 0.0403, 0.0200]
- **n=26:** [0.4407, 0.3043, 0.2533, 0.2151, 0.1836, 0.1563, 0.1316, 0.1089, 0.0876, 0.0672, 0.0476, 0.0284, 0.0094]

**Tabella `kp_coeffs_table` (Completa):**
| n  | g | e | f |
|----|---|---|---|
| 3  | -0.625 | 0.386  | 0.75     |
| 4  | -1.107 | 0.714  | 0.6297   |
| 5  | -1.53  | 0.935  | 0.5521   |
| 6  | -2.01  | 1.138  | 0.4963   |
| 7  | -2.356 | 1.245  | 0.4533   |
| 8  | -2.696 | 1.333  | 0.4186   |
| 9  | -2.968 | 1.4    | 0.39     |
| 10 | -3.262 | 1.471  | 0.366    |
| 11 | -3.485 | 1.515  | 0.3451   |
| 12 | -3.731 | 1.571  | 0.327    |
| 13 | -3.936 | 1.613  | 0.3111   |
| 14 | -4.155 | 1.655  | 0.2969   |
| 15 | -4.373 | 1.695  | 0.2842   |
| 16 | -4.567 | 1.724  | 0.2727   |
| 17 | -4.713 | 1.739  | 0.2622   |
| 18 | -4.885 | 1.77   | 0.2528   |
| 19 | -5.018 | 1.786  | 0.244    |
| 20 | -5.153 | 1.802  | 0.2359   |
| 21 | -5.291 | 1.818  | 0.2284   |
| 22 | -5.413 | 1.835  | 0.2207   |
| 23 | -5.508 | 1.848  | 0.2157   |
| 24 | -5.605 | 1.862  | 0.2106   |
| 25 | -5.704 | 1.876  | 0.2063   |
| 26 | -5.803 | 1.89   | 0.202    |

#### 7.4 Librerie di Vetreria, Pipette e Bilance
Il codice contiene tre librerie predefinite:
- **`DEFAULT_GLASSWARE_LIBRARY`**: Associa a ogni tipo di matraccio (e cilindro) il suo volume nominale e la sua tolleranza (incertezza assoluta).
  - Esempio: `"Matraccio 50 mL": { "volume": 50, "uncertainty": 0.08 }`
- **`DEFAULT_PIPETTE_LIBRARY`**: Associa a ogni modello di pipetta una serie di punti di calibrazione, ognuno con un volume e un'incertezza estesa relativa percentuale (`U_rel_percent`).
  - Esempio: `"043CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.1 }, ... ] }`
- **`DEFAULT_BALANCES_LIBRARY`**: Associa a ogni bilancia i parametri di taratura per il calcolo dell'incertezza di pesata (funzionalità futura).
  - Parametri: `minWeight` (Pesata minima), `capacity` (Portata), `alpha` (Coefficiente α), `beta` (Coefficiente β).

Queste librerie sono utilizzate per recuperare i valori di incertezza per i calcoli della Sezione 4.

---------------------------------------------------

### SEZIONE 8: CALCOLO DELL'INCERTEZZA MASSIMA GARANTITA

L'applicazione offre un calcolo parallelo dell'incertezza, definito "massima garantita". Questo approccio non utilizza i dati sperimentali (come la deviazione standard delle misure), ma si basa sui criteri di accettabilità massimi definiti nella libreria dei metodi e sulle tolleranze massime degli strumenti. Il risultato rappresenta l'incertezza massima che il metodo può avere pur rimanendo conforme ai suoi stessi criteri. Tutti i contributi sono combinati in quadratura e i gradi di libertà effettivi sono considerati infiniti (k=2).

#### 8.1 Contributo del Materiale di Riferimento
- **Formula:** `u_rel = (U_rif% / 100) / 2`
- **Termini:**
  - `U_rif%`: Criterio di incertezza massima per il materiale di riferimento, definito nella libreria del metodo. Si assume una distribuzione normale (k=2).

#### 8.2 Contributo della Ripetibilità
- **Formula:** `u_rel = CV_max% / 100`
- **Termini:**
  - `CV_max%`: Criterio del coefficiente di variazione massimo, definito nella libreria del metodo. Il CV% è già un'incertezza tipo relativa.

#### 8.3 Contributo della Taratura
- **Formula:** `u_rel = (U_ICV% / 100) / sqrt(3)`
- **Termini:**
  - `U_ICV%`: Criterio di incertezza massima per il controllo di taratura (ICV), definito nella libreria del metodo. Si assume una distribuzione rettangolare.

#### 8.4 Contributo della Preparazione
L'incertezza di preparazione garantita viene calcolata propagando le incertezze massime di ogni componente.

1.  **Contributo Vetreria Volumetrica (Matracci):**
    - L'incertezza si basa sulla tolleranza massima trovata nella libreria per un dato volume nominale.
    - **Formula:** `u_rel = (Tolleranza_max / Volume_nominale) / sqrt(3)`

2.  **Contributo Pipette:**
    - L'incertezza si basa sull'incertezza massima garantita per un dato volume di prelievo. Questa viene determinata trovando il gruppo di pipette "equivalenti" (con gli stessi punti di calibrazione) e prendendo l'incertezza massima per l'intervallo di volume di interesse all'interno di quel gruppo.
    - **Formula:** `u_rel = (U_pipetta_garantita% / 100) / 2 / sqrt(3)`

---------------------------------------------------

### SEZIONE 9: REGOLE DI ARROTONDAMENTO E PRESENTAZIONE DEI RISULTATI

L'applicazione utilizza un approccio standardizzato per la formattazione di tutti i risultati numerici, sia nell'interfaccia utente che nei report finali. La logica è implementata nella funzione `formatNumberWithRules` e segue queste regole per garantire coerenza e leggibilità.

#### 9.1 Logica Generale di Formattazione
La formattazione si basa sul concetto di "cifre significative" in relazione all'ordine di grandezza del numero. La regola principale è:

- **d = 4 - e**
  - **e:** è l'esponente del numero in notazione scientifica (es. per 123.45, e=2; per 0.0123, e=-2).
  - **d:** è il numero di cifre decimali da visualizzare.

Questa regola mira a mantenere circa 4 o 5 cifre significative totali per la maggior parte dei numeri.

#### 9.2 Regole Specifiche

1.  **Numeri molto grandi o molto piccoli (Notazione Scientifica):**
    - **Condizione:** Se il valore assoluto di un numero è `> 10000` o `< 0.00001`, viene automaticamente convertito in notazione scientifica.
    - **Precisione:** Il numero di cifre decimali nella notazione scientifica è determinato dalla stessa regola `d = 4 - e`.
    - **Esempi:**
      - `123456` diventa `1.23e+5` (e=5, d= -1, ma la precisione è gestita per mantenere le cifre significative).
      - `0.000009876` diventa `9.8760e-6` (e=-6, d=10, qui la regola si adatta per la notazione scientifica).

2.  **Numeri "Normali":**
    - **Condizione:** Per i numeri che non rientrano nella condizione precedente.
    - **Precisione:** Il numero di cifre decimali è calcolato come `d = 4 - e`.
    - **Esempi:**
      - `123.4567` -> `e=2`, `d = 4-2=2`. Il risultato sarà `123.46`.
      - `1.234567` -> `e=0`, `d = 4-0=4`. Il risultato sarà `1.2346`.
      - `0.012345` -> `e=-2`, `d = 4-(-2)=6`. Il risultato sarà `0.012345`.

3.  **Numeri Interi Grandi (con `d < 0`):**
    - **Condizione:** Se la regola `d = 4 - e` produce un numero di decimali negativo (es. per `12345`, `e=4`, `d=0` ma per `87654`, `e=4`, `d=0` ma la regola si spinge oltre). In questi casi, i numeri vengono arrotondati alla decina, centinaia, ecc., più vicina.
    - **Esempio:** Un valore come `87654` verrebbe arrotondato e visualizzato come `87650` se la regola lo richiedesse (anche se la notazione scientifica per `>10000` ha la precedenza).

#### 9.3 Regola di Arrotondamento ("Regola del Cinque")
L'applicazione utilizza l'arrotondamento standard "round half to even" o "round half to odd" a seconda dell'implementazione del browser, che è lo standard per la maggior parte dei calcoli scientifici per minimizzare il bias. In pratica, quando la cifra da scartare è un 5, il numero viene arrotondato alla cifra pari più vicina.
- Esempio: `2.5` -> `2`, `3.5` -> `4`.

#### 9.4 Gestione dei Valori Speciali
- I valori non numerici, `null` o `undefined` vengono visualizzati come **"N/A"**.
- Il valore `0` viene sempre visualizzato come **"0"**.

---------------------------------------------------

### SEZIONE 10: VALIDAZIONE DEL SOFTWARE

La funzionalità "Verifica Validazione" permette di eseguire una serie di casi di test standardizzati per verificare l'accuratezza degli algoritmi di calcolo implementati nel software. I risultati calcolati dall'applicazione vengono confrontati con i valori attesi pubblicati in guide ufficiali.

I criteri di accettabilità per il superamento del test sono:
- **Conformità numerica:** La differenza relativa percentuale tra il valore calcolato ($V_{calc}$) e il valore atteso ($V_{att}$) viene calcolata come $\frac{|V_{calc} - V_{att}|}{V_{att}} \cdot 100$. Il test è superato se tale differenza è $\le 1\%$, salvo diversa specificazione (es. per calcoli con arrotondamenti intermedi specifici).
- **Conformità logica:** I risultati qualitativi o booleani (es. "il test di Shapiro-Wilk indica normalità", "il valore X è un outlier") devono corrispondere esattamente all'atteso.
- **Verifica Passaggi Intermedi:** Per calcoli complessi (es. Regressione), il sistema verifica non solo il risultato finale ma anche i parametri intermedi (es. pendenza, intercetta) per garantire la correttezza dell'intero algoritmo.

#### Casi di Test Implementati

1.  **Eurachem Guide (2nd ed. 2014) - Esempio A1: Retta di Taratura**
    - **Obiettivo:** Verificare il calcolo dei parametri della regressione lineare (pendenza $b$, intercetta $a$, deviazione standard residua $s_{yx}$) e dell'incertezza standard ($u(x)$) associata a un campione incognito.
    - **Dati:** Serie di calibrazione a 6 punti (0-100 mg/L) e un campione incognito.

2.  **Unichim 179/1 (Ed. 2011) - Esempio 1: Statistiche Descrittive**
    - **Obiettivo:** Verificare il calcolo di Media, Deviazione Standard e Limite di Ripetibilità ($r$).

3.  **Unichim 179/1 (Ed. 2011) - Esempio 1: Test di Normalità Shapiro-Wilk**
    - **Obiettivo:** Verificare il calcolo della statistica $W$ e del parametro normalizzato $kp$.

4.  **Unichim 179/1 (Ed. 2011) - Esempio 1: Test di Grubbs**
    - **Obiettivo:** Verificare l'identificazione di un singolo outlier in una distribuzione normale.

5.  **Unichim 179/1 (Ed. 2011) - Esempio 1: Test di Dixon**
    - **Obiettivo:** Verificare l'identificazione di outlier in piccoli campioni ($n \le 25$) utilizzando il rapporto tra intervalli (Q-test).

6.  **Unichim 179/1 (Ed. 2011) - Esempio 1: Test di Huber**
    - **Obiettivo:** Verificare il calcolo di statistiche robuste (Mediana, MAD) e l'identificazione di outlier in distribuzioni non normali.

7.  **Test Sintetico: Incertezza da Fattore di Risposta**
    - **Obiettivo:** Verificare il calcolo dell'incertezza di taratura utilizzando il metodo del Fattore di Risposta (RF). Controlla la selezione del massimo tra il contributo di taratura (criterio accettabilità) e il contributo ICV (controllo taratura).

8.  **Test Sintetico: Incertezza SST (Solidi Sospesi Totali)**
    - **Obiettivo:** Verificare la logica specifica per l'analisi SST, che include il retro-calcolo del peso netto dalla concentrazione, l'applicazione dei coefficienti di bilancia ($\alpha, \beta$) e la combinazione con incertezza di volume e ripetibilità.

9.  **Test Sintetico: Catena di Trattamento (Diluizione)**
    - **Obiettivo:** Verificare la propagazione dell'incertezza attraverso una catena di trattamento (es. diluizione: Pipetta + Matraccio). Controlla il calcolo dell'incertezza relativa composta ($u_{rel} = \sqrt{u_{pip}^2 + u_{flask}^2}$).

10. **Test Sintetico: Incertezza Estesa (Aggregazione)**
    - **Obiettivo:** Verificare l'algoritmo finale di aggregazione (Root Sum Square) dei contributi (Ripetibilità, Bias, Taratura) e il calcolo dei gradi di libertà effettivi ($\nu_{eff}$) e del fattore di copertura $k$.
