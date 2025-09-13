let sampleCounter = 0;
let sampleStates = {};
let projectData = {
    objective: '',
    method: '',
    component: ''
};

// --- NUOVA GESTIONE LIBRERIE ---
let glasswareLibrary = {};
let pipetteLibrary = {};

// Valori di default per il primo avvio
const DEFAULT_GLASSWARE_LIBRARY = {
    'Matraccio 5 mL': { volume: 5, uncertainty: 0.04 }, 'Matraccio 10 mL': { volume: 10, uncertainty: 0.04 }, 'Matraccio 20 mL': { volume: 20, uncertainty: 0.04 }, 'Matraccio 25 mL': { volume: 25, uncertainty: 0.04 }, 'Matraccio 50 mL': { volume: 50, uncertainty: 0.08 }, 'Matraccio 100 mL': { volume: 100, uncertainty: 0.1 }, 'Matraccio 200 mL': { volume: 200, uncertainty: 0.15 }, 'Matraccio 250 mL': { volume: 250, uncertainty: 0.15 }, 'Matraccio 500 mL': { volume: 500, uncertainty: 0.25 }, 'Matraccio 1000 mL': { volume: 1000, uncertainty: 0.6 }, 'Matraccio 2000 mL': { volume: 2000, uncertainty: 0.6 }, 'Matraccio 5000 mL': { volume: 5000, uncertainty: 1.2 }
};
const DEFAULT_PIPETTE_LIBRARY = {
    "041CHR": { "calibrationPoints": [ { "volume": 0.002, "U_rel_percent": 3.9 }, { "volume": 0.01, "U_rel_percent": 0.95 }, { "volume": 0.02, "U_rel_percent": 0.49 } ] }, "042CHR": { "calibrationPoints": [ { "volume": 0.05, "U_rel_percent": 0.74 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] }, "043CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.1 }, { "volume": 0.5, "U_rel_percent": 0.57 }, { "volume": 1, "U_rel_percent": 0.4 } ] }, "045CHR": { "calibrationPoints": [ { "volume": 0.01, "U_rel_percent": 4.6 }, { "volume": 0.05, "U_rel_percent": 0.85 }, { "volume": 0.1, "U_rel_percent": 0.52 } ] }, "046CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.6 }, { "volume": 0.5, "U_rel_percent": 0.36 }, { "volume": 1, "U_rel_percent": 0.34 } ] }, "048CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.0 }, { "volume": 0.5, "U_rel_percent": 0.36 }, { "volume": 1, "U_rel_percent": 0.37 } ] }, "051CHR": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.8 }, { "volume": 2.5, "U_rel_percent": 0.52 }, { "volume": 5, "U_rel_percent": 0.35 } ] }, "052CHR": { "calibrationPoints": [ { "volume": 0.2, "U_rel_percent": 1.3 }, { "volume": 0.5, "U_rel_percent": 0.31 }, { "volume": 1, "U_rel_percent": 0.26 } ] }, "054CHR": { "calibrationPoints": [ { "volume": 0.01, "U_rel_percent": 4.1 }, { "volume": 0.05, "U_rel_percent": 0.95 }, { "volume": 0.1, "U_rel_percent": 0.52 } ] }, "055CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 2.3 }, { "volume": 0.1, "U_rel_percent": 0.54 }, { "volume": 0.2, "U_rel_percent": 0.34 } ] }, "061CHR": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.2 }, { "volume": 2.5, "U_rel_percent": 1.1 }, { "volume": 5, "U_rel_percent": 0.46 } ] }, "051PRE": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 5.1 }, { "volume": 0.5, "U_rel_percent": 0.53 }, { "volume": 1, "U_rel_percent": 0.21 } ] }, "052PRE": { "calibrationPoints": [ { "volume": 0.03, "U_rel_percent": 3 }, { "volume": 0.13, "U_rel_percent": 0.63 }, { "volume": 0.25, "U_rel_percent": 0.32 } ] }, "053PRE": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.6 }, { "volume": 2.5, "U_rel_percent": 0.39 }, { "volume": 5, "U_rel_percent": 0.28 } ] }, "025SPE": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 1.7 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] }, "063CHR_basso range": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.7 }, { "volume": 0.5, "U_rel_percent": 0.31 }, { "volume": 0.1, "U_rel_percent": 0.21 } ] }, "063CHR_alto range": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 0.46 }, { "volume": 2.5, "U_rel_percent": 0.21 }, { "volume": 5, "U_rel_percent": 0.21 } ] }, "064CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.3 }, { "volume": 0.5, "U_rel_percent": 0.38 }, { "volume": 1, "U_rel_percent": 0.38 } ] }, "065CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 2.1 }, { "volume": 0.1, "U_rel_percent": 0.65 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] }, "066CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 1.7 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] }, "067CHR": { "calibrationPoints": [ { "volume": 1, "U_rel_percent": 0.3 }, { "volume": 5, "U_rel_percent": 0.21 }, { "volume": 10, "U_rel_percent": 0.25 } ] }, "040SPE_basso range": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.4 }, { "volume": 0.5, "U_rel_percent": 0.55 }, { "volume": 1, "U_rel_percent": 0.21 } ] }, "040SPE_alto range": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 0.9 }, { "volume": 2.5, "U_rel_percent": 0.21 }, { "volume": 5, "U_rel_percent": 0.21 } ] }, "084PRE": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.5 }, { "volume": 0.5, "U_rel_percent": 0.32 }, { "volume": 1, "U_rel_percent": 0.31 } ] }, "085PRE": { "calibrationPoints": [ { "volume": 1, "U_rel_percent": 1.4 }, { "volume": 5, "U_rel_percent": 0.65 }, { "volume": 10, "U_rel_percent": 0.40 } ] }
};

function initializeAppLibraries() {
    try {
        const savedGlassware = localStorage.getItem('lab_glasswareLibrary');
        const savedPipettes = localStorage.getItem('lab_pipetteLibrary');

        if (savedGlassware) {
            glasswareLibrary = JSON.parse(savedGlassware);
        } else {
            glasswareLibrary = { ...DEFAULT_GLASSWARE_LIBRARY };
            localStorage.setItem('lab_glasswareLibrary', JSON.stringify(glasswareLibrary));
        }

        if (savedPipettes) {
            pipetteLibrary = JSON.parse(savedPipettes);
        } else {
            pipetteLibrary = { ...DEFAULT_PIPETTE_LIBRARY };
            localStorage.setItem('lab_pipetteLibrary', JSON.stringify(pipetteLibrary));
        }
    } catch (e) {
        console.error("Errore durante il caricamento delle librerie dal localStorage:", e);
        glasswareLibrary = { ...DEFAULT_GLASSWARE_LIBRARY };
        pipetteLibrary = { ...DEFAULT_PIPETTE_LIBRARY };
    }
    renderLibraryTables();
}

function saveLibrariesToStorage() {
    localStorage.setItem('lab_glasswareLibrary', JSON.stringify(glasswareLibrary));
    localStorage.setItem('lab_pipetteLibrary', JSON.stringify(pipetteLibrary));
}

// --- FINE NUOVA GESTIONE LIBRERIE ---

function switchTab(tabName) {
    ['frontespizio', 'statistica', 'taratura', 'preparazione', 'librerie', 'validazione'].forEach(t => {
        document.getElementById(`content-${t}`).classList.add('hidden');
        document.getElementById(`tab-${t}`).classList.remove('active');
    });
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'taratura') {
        populateAnalysisSamplesList('analysis-sample-checklist', 'reg-check-');
        populateAnalysisSamplesList('rf-sample-checklist', 'rf-check-');
    }
    if (tabName === 'preparazione') {
        populateSpikeCalculators();
    }
    if (tabName === 'librerie') {
        renderLibraryTables();
        switchLibrarySubTab('vetreria'); // Assicura che la prima sottoscheda sia sempre visibile
    }
     if (tabName === 'validazione') {
        populateValidationTests();
    }
}

function switchLibrarySubTab(subTabName) {
    // Nasconde tutti i contenuti delle sottoschede
    document.getElementById('subcontent-vetreria').classList.add('hidden');
    document.getElementById('subcontent-pipette').classList.add('hidden');

    // Rimuove la classe 'active' da tutti i pulsanti delle sottoschede
    document.getElementById('subtab-vetreria').classList.remove('active');
    document.getElementById('subtab-pipette').classList.remove('active');

    // Mostra il contenuto e attiva il pulsante della sottoscheda selezionata
    document.getElementById(`subcontent-${subTabName}`).classList.remove('hidden');
    document.getElementById(`subtab-${subTabName}`).classList.add('active');
}

function setupProjectDataListeners() {
    document.getElementById('project-objective').oninput = (e) => projectData.objective = e.target.value;
    document.getElementById('project-method').oninput = (e) => projectData.method = e.target.value;
    document.getElementById('project-component').oninput = (e) => projectData.component = e.target.value;
}

function selectCalibrationMethod(method) {
    document.getElementById('calibration-choice').classList.add('hidden');
    document.getElementById(`${method}-calculator`).classList.remove('hidden');
}

function addSample() {
    sampleCounter++;
    const container = document.getElementById('samples-container');
    const sampleId = `sample-${sampleCounter}`;
    const card = document.createElement('div');
    card.id = sampleId;
    card.className = 'sample-card bg-white p-6 rounded-lg shadow-md border border-gray-200';
    card.innerHTML = `<div class="flex justify-between items-start"><h3 class="text-xl font-semibold text-gray-800 mb-4">Campione ${sampleCounter}</h3><button onclick="removeSample('${sampleId}')" class="text-gray-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Dati (con "." o "," come decimale)</label><textarea rows="4" class="data-input w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 10.1, 10.2 o incolla da Excel 10,1 10,2..."></textarea></div><div><label class="block text-sm font-medium text-gray-700 mb-1">Nome Campione</label><input type="text" class="name-input w-full p-2 border border-gray-300 rounded-md" placeholder="Es: Standard Livello 1"><label class="block text-sm font-medium text-gray-700 mt-2 mb-1">Valore Atteso</label><input type="number" class="expected-input w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 10.0"></div></div>`;
    container.appendChild(card);
}

window.onload = () => {
     addSample();
     for(let i=0; i<5; i++) { addRegressionRow(); }
     setupProjectDataListeners();
     initializeAppLibraries(); // NUOVA FUNZIONE DI INIZIALIZZAZIONE
     populateValidationTests(); // NUOVA FUNZIONE PER LA VALIDAZIONE
};

function removeSample(sampleId) { document.getElementById(sampleId).remove(); delete sampleStates[sampleId]; }

const choiceModal = {
    backdrop: document.getElementById('choice-modal-backdrop'), content: document.getElementById('choice-modal-content'), title: document.getElementById('choice-modal-title'), body: document.getElementById('choice-modal-body'), footer: document.getElementById('choice-modal-footer'),
    show(title, bodyContent, buttons) {
        return new Promise(resolve => {
            this.title.textContent = title; this.body.innerHTML = bodyContent; this.footer.innerHTML = '';
            const clickHandler = async (value) => { await this.hide(); resolve(value); };
            buttons.forEach(btn => { const buttonEl = document.createElement('button'); buttonEl.textContent = btn.text; buttonEl.className = btn.class; buttonEl.onclick = () => clickHandler(btn.value); this.footer.appendChild(buttonEl); });
            this.backdrop.classList.remove('hidden'); setTimeout(() => { this.backdrop.classList.remove('opacity-0'); this.content.classList.remove('scale-95'); }, 10);
        });
    },
    hide() { return new Promise(resolve => { this.backdrop.classList.add('opacity-0'); this.content.classList.add('scale-95'); setTimeout(() => { this.backdrop.classList.add('hidden'); resolve(); }, 300); }); }
};

const primaryBtnClass = "bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700";
const secondaryBtnClass = "bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300";

function shapiroWilk(data) { const sorted = data.slice().sort((a, b) => a - b); const n = sorted.length; const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}}; if (n < 3 || n > 26) { return { W: NaN, kp: NaN, error: "Calcolo supportato per campioni da 3 a 26 dati." }; } const mean = ss.mean(sorted); const S2 = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0); if (S2 < 1e-19) return { W: 1, kp: Infinity }; const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]}; const a_half = a_coeffs_table[n]; const a = new Array(n); for(let i=0; i < Math.ceil(n/2); i++) { a[i] = -a_half[i]; a[n-1-i] = a_half[i]; } if (n % 2 === 1) a[Math.floor(n/2)] = 0; const W = Math.pow(sorted.reduce((sum, val, i) => sum + a[i] * val, 0), 2) / S2; const W_prime = Math.min(W, 1.0); const {g, e, f} = kp_coeffs_table[n]; const kp = g + e * Math.log((W_prime - f) / (1 - W_prime)); return { W: W_prime, kp: isNaN(kp) ? Infinity : kp }; }
async function calculateAll() { toggleLoading(true); document.getElementById('results-container').innerHTML = ''; document.getElementById('export-buttons').classList.add('hidden'); sampleStates = {}; const sampleDivs = document.querySelectorAll('.sample-card'); for (const sampleDiv of sampleDivs) { const sampleId = sampleDiv.id; const rawData = sampleDiv.querySelector('.data-input').value; let data; if (rawData.includes('.')) { data = rawData.split(/[\s,]+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n)); } else { const standardizedData = rawData.replace(/,/g, '.'); data = standardizedData.split(/\s+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n)); } const name = sampleDiv.querySelector('.name-input').value || `Campione #${sampleId.split('-')[1]}`; const expectedValue = parseFloat(sampleDiv.querySelector('.expected-input').value); const sampleState = { id: sampleId, name: name, originalData: [...data], currentData: [...data], expectedValue: expectedValue, log: [], finalStats: null, error: null, geminiResponse: null }; sampleStates[sampleId] = sampleState; if (data.length < 3) { sampleState.error = "Sono necessari almeno 3 punti dati per il test."; } else { await processSample(sampleState); } displayReport(sampleState); } if (Object.keys(sampleStates).length > 0) { document.getElementById('export-buttons').classList.remove('hidden'); } toggleLoading(false); }
async function processSample(state) { let iteration = 0; while (iteration < 5) { iteration++; const data = state.currentData; if (data.length < 3) { state.error = "Dati insufficienti per continuare l'analisi."; return; } const normalityResult = shapiroWilk(data); if(normalityResult.error) { state.error = normalityResult.error; return; } const isNormal = normalityResult.kp > -1.645; state.log.push(`Test di Normalità (Shapiro-Wilk): ${isNormal ? 'Passato' : 'Fallito'} (kp=${normalityResult.kp.toFixed(3)})`); let outliers = []; let testChoice = ''; if (isNormal) { const choice = await choiceModal.show(`[${state.name}] - Test Dati Anomali`, `<p>La distribuzione dei dati sembra Normale.</p><p class="mt-2">Scegli il test per la verifica di dati anomali:</p><ul class="list-disc list-inside mt-2 text-sm"><li><b>Grubbs:</b> Ideale per identificare un singolo anomalo in campioni normali. (Consigliato)</li><li><b>Huber (MAD):</b> Metodo robusto, meno sensibile alla normalità.</li></ul>`, [{ text: "Usa Grubbs", value: 'grubbs', class: primaryBtnClass }, { text: "Usa Huber (MAD)", value: 'huber', class: secondaryBtnClass }]); testChoice = choice; state.log.push({ text: `Scelta utente: test di ${choice}.`, type: 'decision' }); outliers = (choice === 'grubbs') ? findGrubbsOutliers(data) : findMadOutliers(data); } else { testChoice = 'huber'; state.log.push({ text: `Distribuzione non normale. Eseguo test robusto per anomalie (Huber/MAD).`, type: 'warning' }); outliers = findMadOutliers(data); } if (outliers.length > 0) { const outlierStr = outliers.map(o => o.value).join(', '); state.log.push({ text: `Test ${testChoice}: Rilevati dati anomali: ${outlierStr}.`, type: 'warning' }); const remove = await choiceModal.show(`[${state.name}] - Dati Anomali Rilevati`, `<p>Sono stati identificati i seguenti dati anomali: <strong>${outlierStr}</strong>.</p><p class="mt-2">Vuoi rimuoverli e rieseguire l'analisi di normalità sul set di dati pulito?</p>`, [{ text: "Rimuovi e Riprova", value: true, class: primaryBtnClass }, { text: "Mantieni i dati", value: false, class: secondaryBtnClass }]); if (remove) { state.log.push({ text: `Decisione: rimozione dei dati anomali.`, type: 'decision' }); const outlierValues = outliers.map(o => o.value); state.currentData = state.currentData.filter(d => !outlierValues.includes(d)); if (state.currentData.length < 3) { state.error = "Dati insufficienti dopo la rimozione degli anomali."; return; } continue; } else { state.log.push({ text: `Decisione: mantenimento dei dati anomali.`, type: 'decision' }); if (!isNormal) { state.error = "I calcoli non possono procedere su dati non normali contenenti anomalie non rimosse."; return; } } } else { state.log.push(`Test ${testChoice}: Nessun dato anomalo riscontrato.`); } break; } if (iteration >= 5) { state.error = "Raggiunto limite di iterazioni nella rimozione di anomalie."; return; } state.log.push("Processo di validazione completato. Calcolo delle statistiche descrittive."); state.finalStats = calculateStatistics(state.currentData, state.expectedValue); }
function calculateStatistics(data, expectedValue) { const n = data.length; if (n === 0) return { n: 0, mean: NaN, min: NaN, max: NaN, variance: NaN, stdDev: NaN, cvPercent: NaN, recovery: NaN, repeatabilityLimitAbs: NaN, repeatabilityLimitRel: NaN }; const mean = ss.mean(data); const min = ss.min(data); const max = ss.max(data); const variance = n > 1 ? ss.variance(data) : 0; const stdDev = n > 1 ? ss.standardDeviation(data) : 0; const cvPercent = mean !== 0 ? (stdDev / mean) * 100 : 0; const recovery = !isNaN(expectedValue) && expectedValue !== 0 ? (mean / expectedValue) * 100 : null; const repeatabilityLimitAbs = 2.8 * stdDev; const repeatabilityLimitRel = mean !== 0 ? (repeatabilityLimitAbs / mean) * 100 : 0; return { n, mean, min, max, variance, stdDev, cvPercent, recovery, repeatabilityLimitAbs, repeatabilityLimitRel }; }
function findMadOutliers(data) { if (data.length < 3) return []; const median = ss.median(data); const deviations = data.map(d => Math.abs(d - median)); const mad = ss.median(deviations); if (mad < 1e-9) return []; const threshold = 3.5; return data.map((value, index) => ({ value, index })).filter(d => (Math.abs(d.value - median) / mad) > threshold); }
function findGrubbsOutliers(data) { if (data.length < 3) return []; const n = data.length; const mean = ss.mean(data); const stdDev = ss.standardDeviation(data); if (stdDev < 1e-9) return []; const deviations = data.map(d => Math.abs(d - mean)); const maxDeviation = Math.max(...deviations); const G = maxDeviation / stdDev; const grubbsCriticalValues = { 3:1.155, 4:1.481, 5:1.715, 6:1.887, 7:2.020, 8:2.126, 9:2.215, 10:2.290, 11:2.355, 12:2.412, 15:2.549, 20:2.709, 25:2.822, 30:2.908 }; const criticalN = Object.keys(grubbsCriticalValues).reverse().find(key => n >= parseInt(key)) || 3; if (G > grubbsCriticalValues[criticalN]) { const outlierIndex = deviations.indexOf(maxDeviation); return [{ value: data[outlierIndex], index: outlierIndex }]; } return []; }
async function getGeminiInsights(sampleId) { const state = sampleStates[sampleId]; const outputDiv = document.getElementById(`gemini-insights-${sampleId}`); if (!state || !state.finalStats || outputDiv.innerHTML.includes('Analisi in corso')) return; outputDiv.innerHTML = '<p class="text-gray-500 italic">✨ Analisi in corso da parte di Gemini...</p>'; const systemPrompt = "Analizzare i dati statistici forniti in modo oggettivo e tecnico. L'output deve essere un'interpretazione impersonale dei risultati, seguita da azioni consigliate basate esclusivamente sui dati presentati. Non adottare una persona o un ruolo. Rispondere in italiano."; const userPrompt = `Analizzare i seguenti dati per il campione chiamato "${state.name}":\n\n**Contesto:**\n- Dati originali: ${state.originalData.join(', ')}\n- Dati finali usati per il calcolo: ${state.currentData.join(', ')}\n${!isNaN(state.expectedValue) ? `- Valore atteso: ${state.expectedValue}` : ''}\n\n**Log dell'Analisi:**\n${state.log.map(item => `- ${typeof item === 'string' ? item : item.text}`).join('\n')}\n\n**Statistiche Finali:**\n- Media: ${state.finalStats.mean.toFixed(4)}\n- Deviazione Standard: ${state.finalStats.stdDev.toFixed(4)}\n- Coefficiente di Variazione (CV%): ${state.finalStats.cvPercent.toFixed(2)}%\n- Limite di Ripetibilità (r): ${state.finalStats.repeatabilityLimitAbs.toFixed(4)}\n${state.finalStats.recovery !== null ? `- Recupero: ${state.finalStats.recovery.toFixed(2)}%` : ''}\n\n**Richiesta:**\nGenerare un'analisi strutturata in due sezioni separate, usando il formato Markdown:\n\n##### 1. Interpretazione dei Risultati\nFornire un paragrafo che riassuma il significato di questi risultati, commentando la normalità, gli anomali, la precisione (CV% e limite di ripetibilità) e, se applicabile, l'accuratezza (recupero).\n\n##### 2. Azioni Consigliate\nFornire un elenco di 2-3 azioni pratiche o punti di indagine basati sull'analisi. Se i risultati sono buoni, confermare la qualità dei dati.`; try { const response = await callGeminiWithExponentialBackoff(systemPrompt, userPrompt); state.geminiResponse = response; outputDiv.innerHTML = marked.parse(response); } catch (error) { console.error("Gemini API call failed:", error); outputDiv.innerHTML = `<p class="text-red-600 font-semibold">Errore durante la chiamata a Gemini. Controlla la console per i dettagli.</p>`; } }
async function callGeminiWithExponentialBackoff(systemPrompt, userPrompt, retries = 3, delay = 1000) { const apiKey = ""; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`; const payload = { contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] } }; for (let i = 0; i < retries; i++) { try { const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const result = await response.json(); if (result.candidates?.[0].content?.parts?.[0]) return result.candidates[0].content.parts[0].text; throw new Error("Risposta non valida dall'API di Gemini."); } catch (error) { console.warn(`Attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`); if (i === retries - 1) throw error; await new Promise(resolve => setTimeout(resolve, delay)); delay *= 2; } } }
function toggleLoading(isLoading) { document.getElementById('calc-icon').classList.toggle('hidden', isLoading); document.getElementById('loading-spinner').classList.toggle('hidden', !isLoading); document.getElementById('calc-btn-text').textContent = isLoading ? 'Elaborazione...' : 'Elabora e Calcola'; document.getElementById('calculate-btn').disabled = isLoading; }
function displayReport(state) { const container = document.getElementById('results-container'); const card = document.createElement('div'); card.className = 'bg-white p-5 rounded-lg shadow-md border-l-4 ' + (state.error ? 'border-red-500' : 'border-blue-500'); let statsHtml = '<p class="text-gray-500 italic mt-4">Calcoli non eseguiti.</p>'; let geminiButtonHtml = ''; if (state.finalStats) { const { n, mean, min, max, variance, stdDev, cvPercent, recovery, repeatabilityLimitAbs, repeatabilityLimitRel } = state.finalStats; const format = (num) => typeof num === 'number' ? num.toFixed(4) : 'N/A'; const formatPerc = (num) => typeof num === 'number' ? num.toFixed(2) + '%' : 'N/A'; statsHtml = `<div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><span>Numero dati (n):</span> <span class="font-semibold">${n}</span><span>Media:</span> <span class="font-semibold">${format(mean)}</span><span>Minimo:</span> <span class="font-semibold">${format(min)}</span><span>Massimo:</span> <span class="font-semibold">${format(max)}</span><span>Varianza:</span> <span class="font-semibold">${format(variance)}</span><span>Dev. Standard:</span> <span class="font-semibold">${format(stdDev)}</span><span>CV (%):</span> <span class="font-semibold">${formatPerc(cvPercent)}</span><span>Limite Rip. (r):</span> <span class="font-semibold">${format(repeatabilityLimitAbs)}</span><span>Limite Rip. Rel. (%):</span> <span class="font-semibold">${formatPerc(repeatabilityLimitRel)}</span>${recovery !== null ? `<span>Recupero (%):</span> <span class="font-semibold">${formatPerc(recovery)}</span>` : ''}</div>`; geminiButtonHtml = `<div class="mt-4"><button onclick="getGeminiInsights('${state.id}')" class="bg-indigo-600 text-white font-semibold py-2 px-3 text-sm rounded-lg shadow-md hover:bg-indigo-700 transition duration-300">✨ Interpreta Risultati</button></div>`; } const logHtml = state.log.map(item => typeof item === 'string' ? `<li>${item}</li>` : `<li class="${item.type}">${item.text}</li>`).join(''); card.innerHTML = `<h4 class="text-lg font-bold ${state.error ? 'text-red-800' : 'text-gray-900'}">${state.name}</h4><div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-3"><div><h5 class="font-semibold text-gray-600 mb-2">Log Analisi</h5><ul class="analysis-log text-sm space-y-1">${logHtml}</ul>${state.error ? `<p class="mt-3 text-red-600 font-semibold p-2 bg-red-50 rounded-md">${state.error}</p>` : ''}</div><div><h5 class="font-semibold text-gray-600 mb-2">Risultati Finali</h5><p class="text-xs text-gray-500">Dati usati: ${state.currentData.join(', ')}</p>${statsHtml}${geminiButtonHtml}<div id="gemini-insights-${state.id}" class="gemini-output mt-4 text-sm bg-indigo-50 p-3 rounded-md border border-indigo-200"></div></div></div>`; container.appendChild(card); document.getElementById(`gemini-insights-${state.id}`).innerHTML = ''; }
function prepareDataForExport() { const states = Object.values(sampleStates); if (states.length === 0) return null; const headers = states.map(s => s.name); const body = []; const labels = []; const maxDataPoints = Math.max(...states.map(s => s.currentData.length)); for (let i = 0; i < maxDataPoints; i++) { labels.push(`Dato ${i + 1}`); body.push(states.map(s => s.currentData[i] ?? '')); } const statLabels = { n: "Numero dati (n)", mean: "Media", min: "Minimo", max: "Massimo", variance: "Varianza", stdDev: "Dev. Standard", cvPercent: "CV (%)", repeatabilityLimitAbs: "Limite Rip. (r)", repeatabilityLimitRel: "Limite Rip. Rel. (%)", recovery: "Recupero (%)" }; for (const key in statLabels) { if (states.some(s => s.finalStats && s.finalStats[key] !== null && s.finalStats[key] !== undefined)) { labels.push(statLabels[key]); body.push(states.map(s => { if (!s.finalStats || s.finalStats[key] === null || s.finalStats[key] === undefined) return ''; const val = s.finalStats[key]; if (key.includes('Percent') || key.includes('Rel')) return val.toFixed(2) + '%'; return typeof val === 'number' ? val.toFixed(4) : val; })); } } const maxLogItems = Math.max(...states.map(s => s.log.length)); for (let i = 0; i < maxLogItems; i++) { labels.push(`Log ${i + 1}`); body.push(states.map(s => s.log[i] ? (typeof s.log[i] === 'string' ? s.log[i] : s.log[i].text) : '')); } if (states.some(s => s.geminiResponse)) { labels.push("Interpretazione IA"); body.push(states.map(s => (s.geminiResponse || '').replace(/<[^>]*>/g, ''))); } const tableData = body.map((row, i) => [labels[i], ...row]); return { headers: ["Parametro", ...headers], body: tableData }; }
function exportToPDF() { const data = prepareDataForExport(); if (!data) return; const { jsPDF } = window.jspdf; const doc = new jsPDF(); doc.autoTable({ head: [data.headers], body: data.body, }); doc.save('report_analisi_statistica.pdf'); }
function exportToExcel() { const data = prepareDataForExport(); if (!data) return; const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.body]); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Report"); XLSX.writeFile(workbook, "report_analisi_statistica.xlsx"); }
function exportToWord() { const data = prepareDataForExport(); if (!data) return; let htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>' + data.headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>'; data.body.forEach(row => { htmlContent += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'; }); htmlContent += '</tbody></table></body></html>'; const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'report_analisi_statistica.doc'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }
const manualContent = `# Manuale Utente: Suite di Analisi per Laboratorio\n\n## 1. Scopo del Documento\n\nQuesto manuale descrive il funzionamento della Suite di Analisi. Lo scopo è fornire a analisti e tecnici di laboratorio uno strumento per la validazione preliminare dei dati, il calcolo dei parametri statistici fondamentali e la stima dell'incertezza di taratura.\n\n---\n\n## 2. Guida all'Uso: Analisi Statistica\n\n#### Passaggio 1: Inserimento Dati\n1.  **Aggiungi Campioni:** Clicca su **"Aggiungi Campione"** per ogni set di dati da analizzare.\n2.  **Inserisci i Dati:** L'area di testo riconosce automaticamente il formato:\n    * **Decimale con punto (es. \`10.1\`):** I valori possono essere separati da virgola, spazio o invio.\n    * **Decimale con virgola (es. \`10,1\`):** Ideale per il copia-incolla da Excel. I valori devono essere separati da spazio, tab o invio.\n3.  **Dettagli:** Assegna un **Nome Campione** e, se applicabile, un **Valore Atteso** per il calcolo del recupero.\n\n#### Passaggio 2: Avvio dell'Analisi e Processo Guidato\nClicca su **"Elabora e Calcola"**. Il software ti guiderà in modo interattivo attraverso i test di normalità e la gestione di eventuali dati anomali.\n\n---\n\n## 3. Guida all'Uso: Incertezza di Taratura\n\nQuesta sezione permette di calcolare l'incertezza derivante dalla retta di taratura secondo il metodo dei minimi quadrati.\n\n#### Passaggio 1: Inserimento Dati di Taratura\n1.  Naviga alla scheda **"Incertezza di Taratura"** e scegli **"Retta dei Minimi Quadrati"**.\n2.  **Inserisci i Punti:** Compila la tabella con le coppie di valori **Concentrazione (x)** e **Risposta Strumentale (y)**.\n3.  **Copia-Incolla da Excel:** Puoi copiare un'intera colonna di dati da Excel e incollarla nella prima cella vuota della colonna corrispondente (x o y) nella tabella. Il software compilerà automaticamente le righe sottostanti, aggiungendone di nuove se necessario.\n\n#### Passaggio 2: Dati del Campione Incognito\n1.  **Risposta Strumentale (y_k):** Inserisci la risposta media ottenuta per il tuo campione incognito.\n2.  **N. Repliche (p):** Indica su quante repliche è stata calcolata la risposta media del campione (es. se hai fatto 3 letture e hai inserito la media, p=3).\n\n#### Passaggio 3: Calcolo\nClicca su **"Calcola Incertezza"** per ottenere i parametri della retta e l'incertezza standard e estesa sulla concentrazione del campione.`;

function showManual() { const modalBody = document.getElementById('manual-modal-body'); modalBody.innerHTML = marked.parse(manualContent); MathJax.typesetPromise([modalBody]); const backdrop = document.getElementById('manual-modal-backdrop'); backdrop.classList.remove('hidden'); setTimeout(() => backdrop.classList.remove('opacity-0'), 10); }
function hideManual() { const backdrop = document.getElementById('manual-modal-backdrop'); backdrop.classList.add('opacity-0'); setTimeout(() => backdrop.classList.add('hidden'), 300); }

// --- FUNZIONI PER INCERTEZZA DI TARATURA ---

let regressionRowCount = 0;
function addRegressionRow() { regressionRowCount++; const container = document.getElementById('regression-table-container'); const row = document.createElement('div'); row.className = 'grid grid-cols-12 gap-2 items-center'; row.innerHTML = ` <span class="col-span-1 text-sm text-gray-500 text-right">${regressionRowCount}.</span> <div class="col-span-5"><input type="number" class="w-full p-1 border border-gray-300 rounded-md regression-x" placeholder="Conc. (x)"></div> <div class="col-span-5"><input type="number" class="w-full p-1 border border-gray-300 rounded-md regression-y" placeholder="Risposta (y)"></div> <div class="col-span-1"><button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-100">&times;</button></div> `; const xInput = row.querySelector('.regression-x'); const yInput = row.querySelector('.regression-y'); xInput.addEventListener('paste', handlePaste); yInput.addEventListener('paste', handlePaste); container.appendChild(row); }
function handlePaste(event) { event.preventDefault(); const pastedText = (event.clipboardData || window.clipboardData).getData('text'); const lines = pastedText.trim().split(/\r\n|\n|\r/); const targetInput = event.target; const targetClass = targetInput.classList.contains('regression-x') ? 'regression-x' : 'regression-y'; const allInputsOfClass = Array.from(document.querySelectorAll(`.${targetClass}`)); let startIndex = allInputsOfClass.indexOf(targetInput); lines.forEach((line, i) => { const currentInputIndex = startIndex + i; if (currentInputIndex >= allInputsOfClass.length) { addRegressionRow(); const updatedInputs = Array.from(document.querySelectorAll(`.${targetClass}`)); if(updatedInputs[currentInputIndex]) { updatedInputs[currentInputIndex].value = line.trim().replace(',', '.'); } } else { allInputsOfClass[currentInputIndex].value = line.trim().replace(',', '.'); } }); }

function populateAnalysisSamplesList(containerId, checkboxPrefix) {
    const container = document.getElementById(containerId); container.innerHTML = '';
    const validSamples = Object.values(sampleStates).filter(s => s.finalStats && !isNaN(s.expectedValue));
    if (validSamples.length === 0) { container.innerHTML = '<p class="text-sm text-gray-500">Nessun risultato con Valore Atteso disponibile.</p>'; } else { validSamples.forEach(s => { const div = document.createElement('div'); div.className = 'flex items-center'; const checkboxId = `${checkboxPrefix}${s.id}`; div.innerHTML = `<input id="${checkboxId}" value="${s.id}" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded"> <label for="${checkboxId}" class="ml-2 block text-sm text-gray-900">${s.name}</label>`; container.appendChild(div); }); }
}
function toggleRegressionCheckboxes(checked) { document.querySelectorAll('#analysis-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = checked); }
function toggleRfCheckboxes(checked) { document.querySelectorAll('#rf-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = checked); }

function calculateRegressionUncertainty() { const x_inputs = document.querySelectorAll('.regression-x'); const y_inputs = document.querySelectorAll('.regression-y'); const resultsDiv = document.getElementById('regression-results'); resultsDiv.innerHTML = ''; resultsDiv.classList.add('hidden'); const x_vals = []; const y_vals = []; for(let i = 0; i < x_inputs.length; i++) { const x_val = parseFloat(x_inputs[i].value); const y_val = parseFloat(y_inputs[i].value); if (!isNaN(x_val) && !isNaN(y_val)) { x_vals.push(x_val); y_vals.push(y_val); } } if (x_vals.length < 3) { resultsDiv.innerHTML = `<p class="text-red-600">Sono necessari almeno 3 punti per la retta di taratura.</p>`; resultsDiv.classList.remove('hidden'); return; } const n = x_vals.length; const sum_x = ss.sum(x_vals); const sum_y = ss.sum(y_vals); const sum_x_sq = ss.sum(x_vals.map(x => x*x)); const sum_xy = ss.sum(x_vals.map((x, i) => x * y_vals[i])); const b = (n * sum_xy - sum_x * sum_y) / (n * sum_x_sq - sum_x * sum_x); const a = (sum_y / n) - b * (sum_x / n); if (isNaN(a) || isNaN(b)) { resultsDiv.innerHTML = `<p class="text-red-600">Impossibile calcolare i parametri della retta. Controlla i dati di taratura.</p>`; resultsDiv.classList.remove('hidden'); return; } const s_y_num = ss.sum(y_vals.map((y, i) => Math.pow(y - (a + b * x_vals[i]), 2))); const s_y = Math.sqrt(s_y_num / (n - 2)); const mean_x = sum_x / n; const sum_x_dev_sq = ss.sum(x_vals.map(x => Math.pow(x - mean_x, 2))); const selectedSamples = Array.from(document.querySelectorAll('#analysis-sample-checklist input:checked')).map(cb => cb.value); if (selectedSamples.length > 0) { const results = []; selectedSamples.forEach(sampleId => { const state = sampleStates[sampleId]; if(state) { const x_k = state.expectedValue; const p = 1; const y_k = a + b * x_k; const u_xk = (s_y / Math.abs(b)) * Math.sqrt((1/p) + (1/n) + (Math.pow(x_k - mean_x, 2) / sum_x_dev_sq)); const U_xk = 2 * u_xk; results.push({ name: state.name, x_k, y_k, u_xk, U_xk }); } }); displayMultiLevelResults(results); } else { const y_k = parseFloat(document.getElementById('regression-y-k').value); const p = parseInt(document.getElementById('regression-p').value); if (isNaN(y_k) || isNaN(p) || p < 1) { resultsDiv.innerHTML = `<p class="text-red-600">Se non si selezionano campioni, inserire una risposta valida e un numero di repliche (p >= 1).</p>`; resultsDiv.classList.remove('hidden'); return; } const x_k = (y_k - a) / b; const u_xk = (s_y / Math.abs(b)) * Math.sqrt((1/p) + (1/n) + (Math.pow(x_k - mean_x, 2) / sum_x_dev_sq)); const U_xk = 2 * u_xk; displaySingleLevelResult({ x_k, u_xk, U_xk, a, b, s_y }); } }
function displaySingleLevelResult(data) { const { x_k, u_xk, U_xk, a, b, s_y } = data; const resultsDiv = document.getElementById('regression-results'); const format = (num, digits=5) => typeof num === 'number' ? num.toFixed(digits) : 'N/A'; resultsDiv.innerHTML = ` <h3 class="text-lg font-semibold text-gray-800 mb-2">Risultati del Calcolo</h3> <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"> <span>Pendenza (b):</span><span class="font-semibold">${format(b)}</span> <span>Intercetta (a):</span><span class="font-semibold">${format(a)}</span> <span>Dev. Std. Residui (s_y):</span><span class="font-semibold">${format(s_y)}</span> <span class="mt-2 font-bold col-span-2 border-t pt-2">Risultato Campione Incognito:</span> <span>Concentrazione Calcolata (x_k):</span><span class="font-semibold">${format(x_k)}</span> <span>Incertezza Standard u(x_k):</span><span class="font-semibold">${format(u_xk)}</span> <span class="font-bold text-blue-700">Incertezza Estesa U(x_k) (k=2):</span><span class="font-bold text-blue-700">${format(U_xk)}</span> </div> `; resultsDiv.classList.remove('hidden'); }
function displayMultiLevelResults(results) { const resultsDiv = document.getElementById('regression-results'); const format = (num, digits=5) => typeof num === 'number' ? num.toFixed(digits) : 'N/A'; let tableHTML = ` <h3 class="text-lg font-semibold text-gray-800 mb-2">Risultati di Incertezza per Livello</h3> <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200 text-sm"> <thead class="bg-gray-50"> <tr> <th class="px-4 py-2 text-left font-medium text-gray-500">Livello Analizzato</th> <th class="px-4 py-2 text-left font-medium text-gray-500">Valore Atteso (x_k)</th> <th class="px-4 py-2 text-left font-medium text-gray-500">Risposta Teorica (y_k)</th> <th class="px-4 py-2 text-left font-medium text-gray-500">u(x_k)</th> <th class="px-4 py-2 text-left font-medium text-gray-500">U(x_k) (k=2)</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-200">`; results.forEach(res => { tableHTML += `<tr> <td class="px-4 py-2 font-medium text-gray-900">${res.name}</td> <td class="px-4 py-2">${format(res.x_k)}</td> <td class="px-4 py-2">${format(res.y_k)}</td> <td class="px-4 py-2">${format(res.u_xk)}</td> <td class="px-4 py-2 font-bold text-blue-700">${format(res.U_xk)}</td> </tr>`; }); tableHTML += `</tbody></table></div>`; resultsDiv.innerHTML = tableHTML; resultsDiv.classList.remove('hidden'); }
function calculateResponseFactorUncertainty() { const resultsDiv = document.getElementById('rf-results'); resultsDiv.innerHTML = ''; resultsDiv.classList.add('hidden'); const u_rel_percent = parseFloat(document.getElementById('rf-uncertainty-percent').value); if (isNaN(u_rel_percent) || u_rel_percent <= 0) { resultsDiv.innerHTML = `<p class="text-red-600">Inserire un valore valido per l'incertezza relativa (%).</p>`; resultsDiv.classList.remove('hidden'); return; } const selectedSamples = Array.from(document.querySelectorAll('#rf-sample-checklist input:checked')).map(cb => cb.value); if (selectedSamples.length === 0) { resultsDiv.innerHTML = `<p class="text-red-600">Selezionare almeno un livello di concentrazione.</p>`; resultsDiv.classList.remove('hidden'); return; } const u_rel = u_rel_percent / 100; const results = []; selectedSamples.forEach(sampleId => { const state = sampleStates[sampleId]; if (state) { const x_k = state.expectedValue; const u_xk = x_k * u_rel; const U_xk = 2 * u_xk; results.push({ name: state.name, x_k, u_xk, U_xk }); } }); displayResponseFactorResults(results); }
function displayResponseFactorResults(results) { const resultsDiv = document.getElementById('rf-results'); const format = (num, digits=5) => typeof num === 'number' ? num.toFixed(digits) : 'N/A'; let tableHTML = ` <h3 class="text-lg font-semibold text-gray-800 mb-2">Risultati di Incertezza per Livello</h3> <div class="overflow-x-auto"> <table class="min-w-full divide-y divide-gray-200 text-sm"> <thead class="bg-gray-50"> <tr> <th class="px-4 py-2 text-left font-medium text-gray-500">Livello Analizzato</th> <th class="px-4 py-2 text-left font-medium text-gray-500">Valore Atteso (x_k)</th> <th class="px-4 py-2 text-left font-medium text-gray-500">Incertezza Standard u(x_k)</th> <th class="px-4 py-2 text-left font-medium text-gray-500">Incertezza Estesa U(x_k) (k=2)</th> </tr> </thead> <tbody class="bg-white divide-y divide-gray-200">`; results.forEach(res => { tableHTML += `<tr> <td class="px-4 py-2 font-medium text-gray-900">${res.name}</td> <td class="px-4 py-2">${format(res.x_k)}</td> <td class="px-4 py-2">${format(res.u_xk)}</td> <td class="px-4 py-2 font-bold text-blue-700">${format(res.U_xk)}</td> </tr>`; }); tableHTML += `</tbody></table></div>`; resultsDiv.innerHTML = tableHTML; resultsDiv.classList.remove('hidden'); }
function backToCalibrationChoice() { document.getElementById('regression-calculator').classList.add('hidden'); document.getElementById('responseFactor-calculator').classList.add('hidden'); document.getElementById('calibration-choice').classList.remove('hidden'); resetRegressionCalculator(); resetResponseFactorCalculator(); }
function resetRegressionCalculator() { const container = document.getElementById('regression-table-container'); container.innerHTML = ''; regressionRowCount = 0; for(let i=0; i<5; i++) { addRegressionRow(); } document.getElementById('regression-y-k').value = ''; document.getElementById('regression-p').value = '1'; toggleRegressionCheckboxes(false); const resultsDiv = document.getElementById('regression-results'); resultsDiv.innerHTML = ''; resultsDiv.classList.add('hidden'); }
function resetResponseFactorCalculator() { document.getElementById('rf-uncertainty-percent').value = ''; toggleRfCheckboxes(false); const resultsDiv = document.getElementById('rf-results'); resultsDiv.innerHTML = ''; resultsDiv.classList.add('hidden'); }
function toggleAccordion(button) { const content = button.nextElementSibling; button.querySelector('svg').classList.toggle('rotate-180'); content.classList.toggle('open'); }
function populateSpikeCalculators() {
    const container = document.getElementById('spike-calculators-container');
    container.innerHTML = '';
    const validSamples = Object.values(sampleStates).filter(s => s.finalStats && !isNaN(s.expectedValue));
    if (validSamples.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">Nessun campione con "Valore Atteso" disponibile da analizzare. Compila la scheda Analisi Statistica.</p>';
        return;
    }
    validSamples.forEach(sample => {
        const card = document.createElement('div');
        card.id = `spike-card-${sample.id}`;
        card.dataset.mean = sample.finalStats.mean;
        card.dataset.stdev = sample.finalStats.stdDev;
        card.className = 'p-4 border rounded-lg space-y-4';
        card.innerHTML = `
            <h4 class="font-semibold text-gray-700">Preparazione per: <span class="text-indigo-600">${sample.name}</span> (Valore Nominale: ${sample.expectedValue})</h4>
            <div class="space-y-2">
                <h5 class="text-sm font-semibold text-gray-600">Materiale di Partenza (Stock)</h5>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label class="block text-xs font-medium">Concentrazione</label><input type="number" data-sample-id="${sample.id}" oninput="updateSpikeConcentrations('${sample.id}')" class="w-full p-2 border border-gray-300 rounded-md" placeholder="es. 1000"></div>
                    <div><label class="block text-xs font-medium">Incertezza Standard</label><input type="number" data-sample-id="${sample.id}" class="w-full p-2 border border-gray-300 rounded-md" placeholder="es. 5"></div>
                </div>
            </div>
            <div class="space-y-2 pt-4 border-t">
                <h5 class="text-sm font-semibold text-gray-600">Passaggi di Diluizione</h5>
                <div id="spike-dilutions-${sample.id}" class="space-y-4"></div>
                <button onclick="addSpikeDilutionStep('${sample.id}')" class="mt-2 text-sm bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-md hover:bg-blue-200">+ Aggiungi Diluizione</button>
            </div>
            <div class="pt-4 border-t">
                <button onclick="calculateSpikeUncertainty('${sample.id}')" class="bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition">Calcola</button>
                <button onclick="resetSpikeCalculator('${sample.id}')" class="ml-4 text-sm bg-red-100 text-red-800 font-semibold py-1 px-3 rounded-md hover:bg-red-200">Reset</button>
                <div id="spike-results-${sample.id}" class="hidden mt-4"></div>
            </div>
        `;
        container.appendChild(card);
    });
}
let spikeDilutionCounters = {};
let prelievoCounters = {};

function addSpikeDilutionStep(sampleId) {
    if (!spikeDilutionCounters[sampleId]) spikeDilutionCounters[sampleId] = 0;
    spikeDilutionCounters[sampleId]++;
    const stepIndex = spikeDilutionCounters[sampleId];

    const container = document.getElementById(`spike-dilutions-${sampleId}`);
    const stepDiv = document.createElement('div');
    stepDiv.className = 'dilution-step border-l-4 pl-4 space-y-3';
    stepDiv.dataset.stepIndex = stepIndex;
    stepDiv.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <h6 class="font-medium text-sm text-gray-600">Diluizione #${stepIndex}</h6>
                <button onclick="removeSpikeDilutionStep(this, '${sampleId}')" class="text-red-500 hover:text-red-700 text-xs font-semibold p-1 rounded hover:bg-red-100">Rimuovi</button>
            </div>
            <p class="text-xs text-indigo-600 font-mono" id="intermediate-conc-${sampleId}-${stepIndex}">Concentrazione Intermedia: -</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div class="space-y-2">
                <label class="block text-xs font-medium">Prelievi</label>
                <div class="prelievi-container space-y-2">
                    <!-- Prelievi dinamici qui -->
                </div>
                <button onclick="addPrelievoStep(this, '${sampleId}', ${stepIndex})" class="mt-1 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">+ Aggiungi Prelievo</button>
            </div>
            <div class="space-y-2">
                <label class="block text-xs font-medium">Diluizione</label>
                 <div class="dilution-inputs-container">
                    <select onchange="handleGlasswareSelection(this)" class="w-full p-2 border border-gray-300 rounded-md mb-2"></select>
                    <div class="flex space-x-2">
                        <input type="number" oninput="updateSpikeConcentrations('${sampleId}')" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Volume">
                        <input type="number" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Tolleranza">
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(stepDiv);
    addPrelievoStep(stepDiv.querySelector('.prelievi-container'), sampleId, stepIndex); // Aggiunge il primo prelievo
    populateGlasswareDropdown(stepDiv.querySelector('select[onchange="handleGlasswareSelection(this)"]'));
}

function addPrelievoStep(element, sampleId, stepIndex) {
    const container = element.classList.contains('prelievi-container') ? element : element.parentElement.querySelector('.prelievi-container');
    const prelievoDiv = document.createElement('div');
    prelievoDiv.className = 'prelievo-step bg-gray-50 p-2 rounded-md border';
    prelievoDiv.innerHTML = `
        <div class="flex justify-end"><button onclick="removePrelievoStep(this, '${sampleId}')" class="text-gray-400 hover:text-red-500 text-xs font-bold -mt-1 -mr-1">✕</button></div>
        <select onchange="handlePipetteVolumeChange(this)" class="w-full p-1 border border-gray-300 rounded-md mb-1 text-sm bg-white"></select>
        <div class="flex space-x-2">
           <input type="number" oninput="handlePipetteVolumeChange(this)" class="w-full p-1 border border-gray-300 rounded-md text-sm" placeholder="Volume">
           <input type="number" class="w-full p-1 border border-gray-300 rounded-md bg-gray-100 text-sm" placeholder="Incertezza" readonly>
        </div>
        <p class="volume-error-msg text-red-600 text-xs h-4"></p>
    `;
    container.appendChild(prelievoDiv);
    populatePipetteDropdown(prelievoDiv.querySelector('select'));
}

function removePrelievoStep(buttonElement, sampleId) {
    const prelievoDiv = buttonElement.closest('.prelievo-step');
    prelievoDiv.remove();
    updateSpikeConcentrations(sampleId);
}

function removeSpikeDilutionStep(buttonElement, sampleId) {
    const stepDiv = buttonElement.closest('.dilution-step');
    if (stepDiv) stepDiv.remove();

    const container = document.getElementById(`spike-dilutions-${sampleId}`);
    const remainingSteps = container.querySelectorAll('.dilution-step');

    remainingSteps.forEach((step, index) => {
        const newStepIndex = index + 1;
        step.dataset.stepIndex = newStepIndex;
        step.querySelector('h6').textContent = `Diluizione #${newStepIndex}`;
        const p = step.querySelector('p[id^="intermediate-conc-"]');
        if (p) p.id = `intermediate-conc-${sampleId}-${newStepIndex}`;
        const addBtn = step.querySelector('button[onclick^="addPrelievoStep"]');
        if(addBtn) addBtn.setAttribute('onclick', `addPrelievoStep(this, '${sampleId}', ${newStepIndex})`);
    });
    spikeDilutionCounters[sampleId] = remainingSteps.length;
    updateSpikeConcentrations(sampleId);
}

function updateSpikeConcentrations(sampleId) {
    const card = document.getElementById(`spike-card-${sampleId}`);
    let concentrationIn = parseFloat(card.querySelector('input[placeholder="es. 1000"]').value);
    const dilutionSteps = card.querySelectorAll('.dilution-step');

    dilutionSteps.forEach((step) => {
        const stepIndex = step.dataset.stepIndex;
        let totalPrelievoVol = 0;
        step.querySelectorAll('.prelievo-step').forEach(prelievo => {
            const vol = parseFloat(prelievo.querySelector('input[placeholder="Volume"]').value);
            if (!isNaN(vol)) totalPrelievoVol += vol;
        });

        const diluizioneVolInput = step.querySelector('.dilution-inputs-container input[placeholder="Volume"]');
        const diluizioneVol = parseFloat(diluizioneVolInput.value);
        const resultP = step.querySelector(`#intermediate-conc-${sampleId}-${stepIndex}`);

        let concentrationOut = NaN;

        if (resultP && !isNaN(concentrationIn) && totalPrelievoVol > 0 && !isNaN(diluizioneVol) && diluizioneVol > 0) {
            concentrationOut = concentrationIn * (totalPrelievoVol / diluizioneVol);
            resultP.textContent = `Concentrazione Intermedia: ${concentrationOut.toPrecision(5)}`;
        } else if (resultP) {
            resultP.textContent = 'Concentrazione Intermedia: -';
        }

        concentrationIn = concentrationOut; // L'output di questo step diventa l'input del successivo
    });
}

function calculateSpikeUncertainty(sampleId) {
    const card = document.getElementById(`spike-card-${sampleId}`);
    const resultsDiv = document.getElementById(`spike-results-${sampleId}`);
    resultsDiv.innerHTML = '';

    // --- PASSAGGIO 1: Raccolta Dati ---
    const targetSample = sampleStates[sampleId];
    if (!targetSample) {
         resultsDiv.innerHTML = '<p class="text-red-600">Stato del campione non trovato.</p>';
         resultsDiv.classList.remove('hidden');
         return;
    }
    const finalConcNominal = targetSample.expectedValue;

    const mean = parseFloat(card.dataset.mean);
    const stdDev = parseFloat(card.dataset.stdev);

    if (isNaN(mean) || isNaN(stdDev)) {
         resultsDiv.innerHTML = `<p class="text-red-600">Errore nel recuperare i dati statistici dalla card per il campione ${targetSample.name}.</p>`;
         resultsDiv.classList.remove('hidden');
         return;
    }

    const stockConc = parseFloat(card.querySelector('input[placeholder="es. 1000"]').value);
    const stockUnc = parseFloat(card.querySelector('input[placeholder="es. 5"]').value);

    if (isNaN(stockConc) || isNaN(stockUnc) || stockConc <= 0) {
        resultsDiv.innerHTML = '<p class="text-red-600">Inserire valori validi per la soluzione stock.</p>';
        resultsDiv.classList.remove('hidden');
        return;
    }

    const dilutionStepsInputs = [];
    let calculatedConc = stockConc;
    let error = false;
    const dilutionSteps = card.querySelectorAll('.dilution-step');

    dilutionSteps.forEach(step => {
        const prelievi = [];
        let totalPrelievoVol = 0;
        step.querySelectorAll('.prelievo-step').forEach(prelievoDiv => {
            const vol = parseFloat(prelievoDiv.querySelector('input[placeholder="Volume"]').value);
            const unc = parseFloat(prelievoDiv.querySelector('input[placeholder="Incertezza"]').value);
            const pipetteId = prelievoDiv.querySelector('select').value;
            if(isNaN(vol) || isNaN(unc) || !pipetteId) error = true;
            prelievi.push({vol, unc, pipetteId});
            totalPrelievoVol += vol;
        });

        const diluizioneVol = parseFloat(step.querySelector('.dilution-inputs-container input[placeholder="Volume"]').value);
        const diluizioneUnc = parseFloat(step.querySelector('.dilution-inputs-container input[placeholder="Tolleranza"]').value);
        const glasswareName = step.querySelector('.dilution-inputs-container select').value;

        if (isNaN(diluizioneVol) || isNaN(diluizioneUnc) || glasswareName === 'manual') error = true;

        dilutionStepsInputs.push({ prelievi, totalPrelievoVol, diluizioneVol, diluizioneUnc, glasswareName });
        calculatedConc *= (totalPrelievoVol / diluizioneVol);
    });

    if (error) {
        resultsDiv.innerHTML = `<p class="text-red-600">Controllare che tutti i campi (inclusi i menù a tendina) siano compilati correttamente.</p>`;
        resultsDiv.classList.remove('hidden');
        return;
    }

    // --- PASSAGGIO 2: Calcolo Contributi di Tipo B ---
    let sumOfSquaresB = 0;
    const stock_u_std = stockUnc / Math.sqrt(3);
    sumOfSquaresB += Math.pow(stock_u_std / stockConc, 2);

    dilutionStepsInputs.forEach(step => {
        let prelievo_u_abs_sq_sum = 0;
        step.prelievi.forEach(p => {
            const u_std = p.unc / Math.sqrt(3);
            prelievo_u_abs_sq_sum += Math.pow(u_std, 2);
        });
        const prelievo_u_abs_comb = Math.sqrt(prelievo_u_abs_sq_sum);

        if(step.totalPrelievoVol > 0){
            sumOfSquaresB += Math.pow(prelievo_u_abs_comb / step.totalPrelievoVol, 2);
        }

        const diluizione_u_std = step.diluizioneUnc / Math.sqrt(3);
        sumOfSquaresB += Math.pow(diluizione_u_std / step.diluizioneVol, 2);
    });

    const sumOfSquaresA = Math.pow(stdDev / mean, 2);

    const totalSumOfSquares = sumOfSquaresB + sumOfSquaresA;
    const u_rel_composita = Math.sqrt(totalSumOfSquares);
    const u_abs_composita = u_rel_composita * finalConcNominal;
    const u_rel_composita_percent = u_rel_composita * 100;

    const format = (num, digits = 3) => typeof num === 'number' ? num.toPrecision(digits) : 'N/A';

    let detailsHtml = '<h4 class="text-md font-semibold text-gray-800 mt-4 mb-2">Dettaglio Preparazione</h4><ul class="text-sm space-y-2 border-l-2 pl-4 ml-2 border-gray-200">';
    let intermediateConcTracker = stockConc;
    dilutionStepsInputs.forEach((d, index) => {
         intermediateConcTracker *= (d.totalPrelievoVol / d.diluizioneVol);
         let prelieviSummary = d.prelievi.map(p => `${p.vol} mL (Pipetta: ${p.pipetteId})`).join(' + ');
        detailsHtml += `<li><strong>Passo ${index + 1}:</strong> Prelievo di ${prelieviSummary} e diluizione a ${d.diluizioneVol} mL (Matraccio: ${d.glasswareName}).<br><span class="text-xs text-indigo-600">Concentrazione Intermedia: ${format(intermediateConcTracker)}</span></li>`;
    });
    detailsHtml += '</ul>';

    resultsDiv.innerHTML = `
        <h4 class="text-md font-semibold text-gray-800 mb-2">Risultati Incertezza Composita</h4>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span>Concentrazione Nominale Finale:</span><span class="font-semibold">${finalConcNominal}</span>
            <span>Concentrazione Finale Calcolata:</span><span class="font-semibold">${format(calculatedConc)}</span>
            <span class="font-bold text-blue-700">Incertezza Composita Relativa (%):</span><span class="font-bold text-blue-700">${format(u_rel_composita_percent)}%</span>
            <span class="font-bold text-blue-700">Incertezza Composita Assoluta:</span><span class="font-bold text-blue-700">${format(u_abs_composita)}</span>
        </div>
        ${detailsHtml}
    `;
    resultsDiv.classList.remove('hidden');
}
function resetSpikeCalculator(sampleId) {
    const card = document.getElementById(`spike-card-${sampleId}`);
    card.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
    card.querySelector(`#spike-dilutions-${sampleId}`).innerHTML = '';
    spikeDilutionCounters[sampleId] = 0;
    const resultsDiv = document.getElementById(`spike-results-${sampleId}`);
    resultsDiv.innerHTML = '';
    resultsDiv.classList.add('hidden');
}
function populateGlasswareDropdown(selectElement) {
    selectElement.innerHTML = '';
    const manualOption = document.createElement('option');
    manualOption.value = 'manual';
    manualOption.textContent = 'Inserimento Manuale';
    selectElement.appendChild(manualOption);

    for (const name in glasswareLibrary) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    }
}

function populatePipetteDropdown(selectElement) {
    selectElement.innerHTML = '<option value="">Seleziona Pipetta...</option>'; // Aggiunge un'opzione di default
    for (const id in pipetteLibrary) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        selectElement.appendChild(option);
    }
}

function handlePipetteVolumeChange(element) {
    const parentDiv = element.closest('.prelievo-step');
    const pipetteSelect = parentDiv.querySelector('select');
    const volInput = parentDiv.querySelectorAll('input[type="number"]')[0];
    const uncInput = parentDiv.querySelectorAll('input[type="number"]')[1];
    const errorP = parentDiv.querySelector('.volume-error-msg');
    const sampleId = element.closest('[id^="spike-card-"]').id.replace('spike-card-','');

    const pipetteId = pipetteSelect.value;
    const volume = parseFloat(volInput.value);

    uncInput.value = '';
    errorP.textContent = '';

    if (pipetteId && !isNaN(volume) && volume > 0) {
        const pipette = pipetteLibrary[pipetteId];
        if (!pipette) return;

        const points = pipette.calibrationPoints;
        if (points.length === 0) return;

        const volumes = points.map(p => p.volume);
        const minVolume = Math.min(...volumes);
        const maxVolume = Math.max(...volumes);

        if (volume < minVolume || volume > maxVolume) {
            errorP.textContent = `Volume fuori range (${minVolume}-${maxVolume} mL)`;
            return;
        }

        const getStdUncertainty = (point) => (point.U_rel_percent / 2 / 100) * point.volume;

        const sortedPoints = [...points].sort((a, b) => Math.abs(a.volume - volume) - Math.abs(b.volume - volume));

        let uncertaintyToUse;
        if (sortedPoints.length === 1) {
            uncertaintyToUse = getStdUncertainty(sortedPoints[0]);
        } else {
            const unc1 = getStdUncertainty(sortedPoints[0]);
            const unc2 = getStdUncertainty(sortedPoints[1]);
            uncertaintyToUse = Math.max(unc1, unc2);
        }
        uncInput.value = uncertaintyToUse.toExponential(2);
    }
     updateSpikeConcentrations(sampleId);
}
function handleGlasswareSelection(selectElement) {
    const selectedValue = selectElement.value;
    const parentDiv = selectElement.parentElement;
    const volInput = parentDiv.querySelectorAll('input[type="number"]')[0];
    const uncInput = parentDiv.querySelectorAll('input[type="number"]')[1];
    const sampleId = selectElement.closest('[id^="spike-card-"]').id.replace('spike-card-','');

    if (selectedValue === 'manual') {
        volInput.value = '';
        uncInput.value = '';
        volInput.readOnly = false;
        uncInput.readOnly = false;
    } else {
        const glassware = glasswareLibrary[selectedValue];
        volInput.value = glassware.volume;
        uncInput.value = glassware.uncertainty;
        volInput.readOnly = true;
        uncInput.readOnly = true;
    }
    updateSpikeConcentrations(sampleId);
}

// --- NUOVE FUNZIONI PER GESTIONE LIBRERIE (CORRETTE E CON MODIFICA ID) ---

const formModal = {
    backdrop: document.getElementById('form-modal-backdrop'),
    content: document.getElementById('form-modal-content'),
    title: document.getElementById('form-modal-title'),
    body: document.getElementById('form-modal-body'),
    footer: document.getElementById('form-modal-footer'),

    show({ title, bodyHtml, buttons }) {
        return new Promise(resolve => {
            this.title.textContent = title;
            this.body.innerHTML = bodyHtml;
            this.footer.innerHTML = '';

            const clickHandler = (isConfirm) => {
                if (!isConfirm) {
                    this.hide();
                    resolve(null);
                    return;
                }

                const inputs = this.body.querySelectorAll('input, textarea');
                let data = {};
                let isValid = true;
                inputs.forEach(input => {
                    if (input.required && !input.value) {
                       isValid = false;
                       input.classList.add('border-red-500');
                    } else {
                       input.classList.remove('border-red-500');
                    }
                    data[input.id] = input.value;
                });

                if(isValid) {
                    this.hide();
                    resolve(data);
                }
            };

            buttons.forEach(btn => {
                const buttonEl = document.createElement('button');
                buttonEl.textContent = btn.text;
                buttonEl.className = btn.class;
                buttonEl.onclick = () => clickHandler(btn.isConfirm);
                this.footer.appendChild(buttonEl);
            });

            this.backdrop.classList.remove('hidden');
            setTimeout(() => {
                this.backdrop.classList.remove('opacity-0');
                this.content.classList.remove('scale-95');
            }, 10);
        });
    },

    hide() {
        this.backdrop.classList.add('opacity-0');
        this.content.classList.add('scale-95');
        setTimeout(() => {
            this.backdrop.classList.add('hidden');
        }, 300);
    }
};

async function showAlert(message) {
    await choiceModal.show("Informazione", `<p>${message}</p>`, [
        { text: "OK", value: true, class: primaryBtnClass }
    ]);
}


function renderLibraryTables() {
    const glasswareTbody = document.getElementById('glassware-library-table');
    const pipetteTbody = document.getElementById('pipette-library-table');
    glasswareTbody.innerHTML = '';
    pipetteTbody.innerHTML = '';

    // Render Vetreria
    for (const name in glasswareLibrary) {
        const item = glasswareLibrary[name];
        const row = glasswareTbody.insertRow();
        row.innerHTML = `
            <td>${name}</td>
            <td>${item.volume}</td>
            <td>${item.uncertainty}</td>
            <td class="space-x-2">
                <button onclick="editGlasswareItem('${name}')" class="text-blue-600 hover:underline text-xs">Modifica</button>
                <button onclick="duplicateGlasswareItem('${name}')" class="text-green-600 hover:underline text-xs">Duplica</button>
                <button onclick="deleteGlasswareItem('${name}')" class="text-red-600 hover:underline text-xs">Rimuovi</button>
            </td>
        `;
    }

    // Render Pipette
    for (const id in pipetteLibrary) {
        const item = pipetteLibrary[id];
        const pointsSummary = item.calibrationPoints.map(p => `${p.volume}mL`).join(', ');
        const row = pipetteTbody.insertRow();
        row.innerHTML = `
            <td>${id}</td>
            <td>${pointsSummary || 'Nessun punto'}</td>
            <td class="space-x-2">
                <button onclick="editPipetteItem('${id}')" class="text-blue-600 hover:underline text-xs">Modifica</button>
                <button onclick="duplicatePipetteItem('${id}')" class="text-green-600 hover:underline text-xs">Duplica</button>
                <button onclick="deletePipetteItem('${id}')" class="text-red-600 hover:underline text-xs">Rimuovi</button>
            </td>
        `;
    }
}

async function addGlasswareItem() {
    const bodyHtml = `
        <div>
            <label for="gw-name" class="block text-sm font-medium text-gray-700">Nome Vetreria</label>
            <input type="text" id="gw-name" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: Matraccio 100 mL">
        </div>
        <div>
            <label for="gw-volume" class="block text-sm font-medium text-gray-700">Volume (mL)</label>
            <input type="number" id="gw-volume" step="any" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 100">
        </div>
        <div>
            <label for="gw-uncertainty" class="block text-sm font-medium text-gray-700">Tolleranza (± mL)</label>
            <input type="number" id="gw-uncertainty" step="any" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 0.1">
        </div>`;

    const data = await formModal.show({
        title: "Aggiungi Nuova Vetreria", bodyHtml,
        buttons: [
            { text: "Annulla", isConfirm: false, class: secondaryBtnClass },
            { text: "Salva", isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (data) {
        const { 'gw-name': name, 'gw-volume': volumeStr, 'gw-uncertainty': uncertaintyStr } = data;
        if (!name || glasswareLibrary[name]) {
            return showAlert("Nome non valido o già esistente.");
        }
        const volume = parseFloat(volumeStr);
        const uncertainty = parseFloat(uncertaintyStr);

        if (isNaN(volume) || isNaN(uncertainty)) {
            return showAlert("Valori numerici non validi.");
        }
        glasswareLibrary[name] = { volume, uncertainty };
        saveLibrariesToStorage();
        renderLibraryTables();
    }
}

async function editGlasswareItem(originalName) {
    const item = glasswareLibrary[originalName];
    const bodyHtml = `
        <div>
            <label for="gw-new-name" class="block text-sm font-medium text-gray-700">Nome Vetreria</label>
            <input type="text" id="gw-new-name" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${originalName}">
        </div>
        <div>
            <label for="gw-volume" class="block text-sm font-medium text-gray-700">Volume (mL)</label>
            <input type="number" id="gw-volume" step="any" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${item.volume}">
        </div>
        <div>
            <label for="gw-uncertainty" class="block text-sm font-medium text-gray-700">Tolleranza (± mL)</label>
            <input type="number" id="gw-uncertainty" step="any" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${item.uncertainty}">
        </div>`;

    const data = await formModal.show({
        title: `Modifica '${originalName}'`, bodyHtml,
        buttons: [
            { text: "Annulla", isConfirm: false, class: secondaryBtnClass },
            { text: "Salva Modifiche", isConfirm: true, class: primaryBtnClass }
        ]
    });

    if(data) {
        const newName = data['gw-new-name'].trim();
        const newVolume = parseFloat(data['gw-volume']);
        const newUncertainty = parseFloat(data['gw-uncertainty']);

        if (!newName) {
            return showAlert("Il nome non può essere vuoto.");
        }
        if (newName !== originalName && glasswareLibrary[newName]) {
            return showAlert(`Il nome '${newName}' è già in uso. Scegli un nome univoco.`);
        }

        if (!isNaN(newVolume) && !isNaN(newUncertainty)) {
            const updatedItem = { volume: newVolume, uncertainty: newUncertainty };
            if (newName !== originalName) {
                delete glasswareLibrary[originalName];
            }
            glasswareLibrary[newName] = updatedItem;
            saveLibrariesToStorage();
            renderLibraryTables();
        } else {
            showAlert("Valori di volume o tolleranza non validi.");
        }
    }
}

async function deleteGlasswareItem(name) {
    const confirmed = await choiceModal.show("Conferma Eliminazione", `<p>Sei sicuro di voler eliminare '<strong>${name}</strong>'?</p>`, [
        { text: "Annulla", value: false, class: secondaryBtnClass },
        { text: "Elimina", value: true, class: "bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700" }
    ]);
    if (confirmed) {
        delete glasswareLibrary[name];
        saveLibrariesToStorage();
        renderLibraryTables();
    }
}

async function duplicateGlasswareItem(name) {
    const originalItem = glasswareLibrary[name];
    if (!originalItem) return;

    let newName = `${name} (copia)`;
    let counter = 2;
    while (glasswareLibrary[newName]) {
        newName = `${name} (copia ${counter})`;
        counter++;
    }
    glasswareLibrary[newName] = { ...originalItem };
    saveLibrariesToStorage();
    renderLibraryTables();
}

async function addPipetteItem() {
    const bodyHtml = `<div><label for="pip-id" class="block text-sm font-medium text-gray-700">ID Univoco Pipetta</label><input type="text" id="pip-id" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 099CHR"></div>`;
    const data = await formModal.show({
        title: "Aggiungi Nuova Pipetta", bodyHtml,
        buttons: [
            { text: "Annulla", isConfirm: false, class: secondaryBtnClass },
            { text: "Crea", isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (data) {
        const id = data['pip-id'];
        if (!id || pipetteLibrary[id]) {
            return showAlert("ID non valido o già esistente.");
        }
        pipetteLibrary[id] = { calibrationPoints: [] };
        saveLibrariesToStorage();
        renderLibraryTables();
        await showAlert(`Pipetta '${id}' creata. Ora aggiungi i punti di taratura tramite il pulsante 'Modifica'.`);
    }
}

async function editPipetteItem(originalId) {
    const item = pipetteLibrary[originalId];
    const pointsString = JSON.stringify(item.calibrationPoints, null, 2);
    const bodyHtml = `
        <div>
            <label for="pip-new-id" class="block text-sm font-medium text-gray-700">ID Univoco Pipetta</label>
            <input type="text" id="pip-new-id" required class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${originalId}">
        </div>
        <div>
            <p class="text-sm mt-4">Modifica i punti di taratura per <strong>${originalId}</strong>. Mantieni la struttura JSON.</p>
            <textarea id="pipette-points" rows="8" class="mt-2 w-full p-2 border border-gray-300 rounded-md font-mono text-sm">${pointsString}</textarea>
        </div>`;

    const data = await formModal.show({
        title: `Modifica Pipetta '${originalId}'`, bodyHtml,
        buttons: [
            { text: "Annulla", isConfirm: false, class: secondaryBtnClass },
            { text: "Salva", isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (data) {
        const newId = data['pip-new-id'].trim();
        if (!newId) {
            return showAlert("L'ID non può essere vuoto.");
        }
        if (newId !== originalId && pipetteLibrary[newId]) {
            return showAlert(`L'ID '${newId}' è già in uso. Scegli un ID univoco.`);
        }

        try {
            const newPoints = JSON.parse(data['pipette-points']);
            if (Array.isArray(newPoints) && newPoints.every(p => typeof p.volume === 'number' && typeof p.U_rel_percent === 'number')) {
                const updatedItem = { calibrationPoints: newPoints };
                if (newId !== originalId) {
                    delete pipetteLibrary[originalId];
                }
                pipetteLibrary[newId] = updatedItem;
                saveLibrariesToStorage();
                renderLibraryTables();
            } else {
                showAlert("Formato JSON non valido. Ogni punto deve avere le chiavi 'volume' e 'U_rel_percent' con valori numerici.");
            }
        } catch (e) {
            showAlert("Errore nel formato JSON: " + e.message);
        }
    }
}

async function deletePipetteItem(id) {
    const confirmed = await choiceModal.show("Conferma Eliminazione", `<p>Sei sicuro di voler eliminare la pipetta '<strong>${id}</strong>'?</p>`, [
        { text: "Annulla", value: false, class: secondaryBtnClass },
        { text: "Elimina", value: true, class: "bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700" }
    ]);
    if (confirmed) {
        delete pipetteLibrary[id];
        saveLibrariesToStorage();
        renderLibraryTables();
    }
}

async function duplicatePipetteItem(id) {
    const originalItem = pipetteLibrary[id];
    if (!originalItem) return;

    let newId = `${id}_copia`;
    let counter = 2;
    while (pipetteLibrary[newId]) {
        newId = `${id}_copia_${counter}`;
        counter++;
    }
    pipetteLibrary[newId] = JSON.parse(JSON.stringify(originalItem));
    saveLibrariesToStorage();
    renderLibraryTables();
}

function exportLibraries() {
    const dataToExport = { glassware: glasswareLibrary, pipettes: pipetteLibrary };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "suite_laboratorio_librerie.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importLibraries() {
    document.getElementById('import-file-input').click();
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.glassware && importedData.pipettes) {
                const confirmed = await choiceModal.show("Conferma Importazione", "<p>Importando questo file sovrascriverai le librerie attuali. Continuare?</p>", [
                     { text: "Annulla", value: false, class: secondaryBtnClass },
                     { text: "Sovrascrivi", value: true, class: primaryBtnClass }
                ]);
                if (confirmed) {
                    glasswareLibrary = importedData.glassware;
                    pipetteLibrary = importedData.pipettes;
                    saveLibrariesToStorage();
                    renderLibraryTables();
                    await showAlert("Librerie importate con successo!");
                }
            } else {
                await showAlert("File non valido. La struttura deve contenere le chiavi 'glassware' e 'pipettes'.");
            }
        } catch (err) {
            await showAlert("Errore durante la lettura del file. Assicurati che sia un file JSON valido.");
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

// --- NUOVE FUNZIONI PER LA VERIFICA DELLA VALIDAZIONE ---

const validationTestCases = {
    'ASTM-E178-Grubbs': {
        name: "Test di Grubbs per Outlier Singolo (ASTM E178-16a)",
        description: "Verifica la corretta identificazione di un singolo dato anomalo (outlier) in un set di dati, basandosi sui valori critici e gli esempi forniti dalla norma.",
        reference: "ASTM E178-16a, Table A1.1",
        inputData: [10.2, 10.5, 10.3, 10.1, 10.4, 10.7, 14.1],
        expectedOutput: {
            outliers: [14.1],
            notes: "Il valore 14.1 dovrebbe essere identificato come outlier."
        },
        runTest: function() {
            const outliersFound = findGrubbsOutliers(this.inputData);
            return {
                outliers: outliersFound.map(o => o.value)
            };
        },
        compare: function(actualResult) {
            const expected = JSON.stringify(this.expectedOutput.outliers.sort());
            const actual = JSON.stringify(actualResult.outliers.sort());
            const pass = expected === actual;

            return {
                pass: pass,
                expectedDetails: `Outlier attesi: ${this.expectedOutput.outliers.join(', ')}`,
                actualDetails: `Outlier identificati: ${actualResult.outliers.join(', ') || 'Nessuno'}`
            };
        }
    },
    'Shapiro-Wilk-Normal': {
        name: "Test di Shapiro-Wilk (Dati Normali)",
        description: "Verifica che il test di Shapiro-Wilk calcoli correttamente il parametro Kp per un set di dati di riferimento, confrontandolo con il valore atteso dalla norma.",
        reference: "Manuale Unichim n. 179/1 edizione 2011, paragrafo 12 (esempio 1)",
        inputData: [0.72, 0.73, 0.73, 0.75, 0.76, 0.80, 0.78, 0.80, 0.74, 0.74, 0.63, 0.64],
        expectedOutput: {
            kp: -1.331,
            notes: "Il test deve restituire un valore Kp il più vicino possibile a -1.331. I calcoli intermedi vengono eseguiti con arrotondamenti specifici (S² e b a 4 cifre, W a 3 cifre) per replicare la norma."
        },
        runTest: function() {
            // Usiamo la funzione specifica per la validazione con precisione controllata per ogni passaggio
            return shapiroWilkWithDetails(this.inputData, { S2: 4, b: 4, W: 3 });
        },
        compare: function(actualResult) {
            const pass = actualResult.kp.toFixed(3) === this.expectedOutput.kp.toFixed(3);
            let actualDetailsHTML = `
                <p>Valore Kp ottenuto: ${actualResult.kp.toFixed(3)}</p>
                <h5 class="font-semibold mt-3 text-gray-600">Dati Intermedi Calcolati (Passo 1):</h5>
                <ul class="text-xs list-disc list-inside mt-1 space-y-1 font-mono">
                    <li><strong>Media:</strong> ${actualResult.mean.toFixed(6)}</li>
                    <li><strong>Somma quadrati (S²):</strong> ${actualResult.S2.toFixed(6)}</li>
                    <li><strong>Valore b:</strong> ${actualResult.b.toFixed(6)}</li>
                    <li><strong>Valore b² (numeratore):</strong> ${actualResult.b_squared.toFixed(6)}</li>
                    <li><strong>Statistica W (b²/S²):</strong> ${actualResult.W.toFixed(6)}</li>
                </ul>
                <h5 class="font-semibold mt-3 text-gray-600">Input per Calcolo Finale di Kp (Passo 2):</h5>
                <ul class="text-xs list-disc list-inside mt-1 space-y-1 font-mono">
                    <li><strong>W' (W corretto):</strong> ${actualResult.W_prime.toFixed(6)}</li>
                    <li><strong>Costante g:</strong> ${actualResult.g}</li>
                    <li><strong>Costante e:</strong> ${actualResult.e}</li>
                    <li><strong>Costante f:</strong> ${actualResult.f}</li>
                </ul>
            `;
            return {
                pass: pass,
                expectedDetails: `Valore Kp atteso: ${this.expectedOutput.kp}`,
                actualDetails: actualDetailsHTML
            };
        }
    },
    'Shapiro-Wilk-NonNormal': {
        name: "Test di Shapiro-Wilk (Dati Non Normali)",
        description: "Verifica che il test di Shapiro-Wilk classifichi correttamente un set di dati con una chiara asimmetria, che non dovrebbe essere considerato normale. Il test è superato se il valore calcolato di Kp è minore o uguale a -1.645.",
        reference: "Esempio da manuale statistico standard (distribuzione asimmetrica)",
        inputData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 20],
        expectedOutput: {
            isNormal: false,
            notes: "Il test dovrebbe classificare i dati come NON provenienti da una distribuzione normale (Kp <= -1.645)."
        },
        runTest: function() {
            // Usiamo la funzione di calcolo con i dettagli, ma senza arrotondamento forzato
            return shapiroWilkWithDetails(this.inputData);
        },
        compare: function(actualResult) {
            const pass = actualResult.isNormal === this.expectedOutput.isNormal;

            let actualDetailsHTML = `
                <p>Esito ottenuto: ${actualResult.isNormal ? 'Normale' : 'Non Normale'} (Kp = ${actualResult.kp.toFixed(3)})</p>
                <h5 class="font-semibold mt-3 text-gray-600">Dati Intermedi Calcolati (Passo 1):</h5>
                <ul class="text-xs list-disc list-inside mt-1 space-y-1 font-mono">
                    <li><strong>Media:</strong> ${actualResult.mean.toFixed(6)}</li>
                    <li><strong>Somma quadrati (S²):</strong> ${actualResult.S2.toFixed(6)}</li>
                    <li><strong>Valore b:</strong> ${actualResult.b.toFixed(6)}</li>
                    <li><strong>Valore b² (numeratore):</strong> ${actualResult.b_squared.toFixed(6)}</li>
                    <li><strong>Statistica W (b²/S²):</strong> ${actualResult.W.toFixed(6)}</li>
                </ul>
                <h5 class="font-semibold mt-3 text-gray-600">Input per Calcolo Finale di Kp (Passo 2):</h5>
                <ul class="text-xs list-disc list-inside mt-1 space-y-1 font-mono">
                    <li><strong>W' (W corretto):</strong> ${actualResult.W_prime.toFixed(6)}</li>
                    <li><strong>Costante g:</strong> ${actualResult.g}</li>
                    <li><strong>Costante e:</strong> ${actualResult.e}</li>
                    <li><strong>Costante f:</strong> ${actualResult.f}</li>
                </ul>
            `;

            return {
                pass: pass,
                expectedDetails: `Esito atteso: Non Normale (Kp <= -1.645)`,
                actualDetails: actualDetailsHTML
            };
        }
    }
};

function shapiroWilkWithDetails(data, precisionConfig = null) {
    const round = (value, decimals) => {
        if (decimals === null || typeof decimals === 'undefined') return value;
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    const sorted = data.slice().sort((a, b) => a - b);
    const n = sorted.length;
    if (n < 3 || n > 26) { return { error: "Calcolo supportato per campioni da 3 a 26 dati." }; }

    const mean = ss.mean(sorted);
    let S2 = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    if (precisionConfig && typeof precisionConfig.S2 !== 'undefined') {
        S2 = round(S2, precisionConfig.S2);
    }

    const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]};
    const a_half = a_coeffs_table[n];
    const a = new Array(n);
    for(let i=0; i < Math.ceil(n/2); i++) { a[i] = -a_half[i]; a[n-1-i] = a_half[i]; }
    if (n % 2 === 1) a[Math.floor(n/2)] = 0;

    let b = sorted.reduce((sum, val, i) => sum + a[i] * val, 0);
    if (precisionConfig && typeof precisionConfig.b !== 'undefined') {
        b = round(b, precisionConfig.b);
    }

    const b_squared = Math.pow(b, 2);
    let W = b_squared / S2;
    if (precisionConfig && typeof precisionConfig.W !== 'undefined') {
        W = round(W, precisionConfig.W);
    }

    const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}};
    const W_prime = Math.min(W, 1.0);
    const {g, e, f} = kp_coeffs_table[n];
    const kp = g + e * Math.log((W_prime - f) / (1 - W_prime));

    return { isNormal: kp > -1.645, kp, mean, S2, b, b_squared, W, W_prime, g, e, f };
}


function populateValidationTests() {
    const select = document.getElementById('validation-test-select');
    select.innerHTML = '<option value="">-- Seleziona un test --</option>';
    for (const key in validationTestCases) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = validationTestCases[key].name;
        select.appendChild(option);
    }
}

function displaySelectedTestInfo() {
    const select = document.getElementById('validation-test-select');
    const detailsContainer = document.getElementById('test-details-container');
    const runBtn = document.getElementById('run-validation-btn');
    const resultsContainer = document.getElementById('validation-results-container');

    const testKey = select.value;
    if (!testKey) {
        detailsContainer.classList.add('hidden');
        runBtn.disabled = true;
        resultsContainer.classList.add('hidden');
        return;
    }

    const testCase = validationTestCases[testKey];
    detailsContainer.innerHTML = `
        <h4 class="font-semibold text-gray-800">Dettagli del Test</h4>
        <p class="text-sm"><strong class="font-medium">Riferimento:</strong> ${testCase.reference}</p>
        <p class="text-sm"><strong class="font-medium">Descrizione:</strong> ${testCase.description}</p>
        <div class="mt-2">
            <p class="text-sm font-medium">Dati di Input:</p>
            <code class="text-sm block bg-gray-100 p-2 rounded-md font-mono">${JSON.stringify(testCase.inputData)}</code>
        </div>
         <div class="mt-2">
            <p class="text-sm font-medium">Risultato Atteso:</p>
             <p class="text-sm text-gray-600">${testCase.expectedOutput.notes}</p>
        </div>
    `;
    detailsContainer.classList.remove('hidden');
    runBtn.disabled = false;
    resultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
}

function runValidationTest() {
    const select = document.getElementById('validation-test-select');
    const resultsContainer = document.getElementById('validation-results-container');
    const testKey = select.value;
    if (!testKey) return;

    const testCase = validationTestCases[testKey];
    const actualResult = testCase.runTest();
    const comparison = testCase.compare(actualResult);

    const statusClass = comparison.pass ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800';
    const statusText = comparison.pass ? 'PASSATO' : 'FALLITO';

    resultsContainer.innerHTML = `
        <h3 class="text-xl font-bold text-gray-800 mb-4">Risultati della Verifica</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 border rounded-lg bg-gray-50">
                <h4 class="font-semibold text-gray-700 mb-2">Risultato Atteso (da Riferimento)</h4>
                <p class="text-sm">${comparison.expectedDetails}</p>
            </div>
            <div class="p-4 border rounded-lg bg-gray-50">
                <h4 class="font-semibold text-gray-700 mb-2">Risultato Ottenuto (dal Software)</h4>
                <div class="text-sm">${comparison.actualDetails}</div>
            </div>
        </div>
        <div class="mt-6 p-4 border-l-4 rounded-md ${statusClass}">
            <h4 class="font-bold text-lg">Verdetto Finale: ${statusText}</h4>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
}
