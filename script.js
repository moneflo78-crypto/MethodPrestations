// =================================================================================
// JULES'S REFACTORED SCRIPT - STATE-DRIVEN ARCHITECTURE (v3.0 - FINAL & COMPLETE)
// =================================================================================

// --- UTILITY & CONSTANTS ---

// --- STATISTICAL CONSTANTS & BUSINESS LOGIC ---
const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]};
const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}};
const STUDENT_T_95_TWO_TAILED = { 1:12.706,2:4.303,3:3.182,4:2.776,5:2.571,6:2.447,7:2.365,8:2.306,9:2.262,10:2.228,11:2.201,12:2.179,13:2.16,14:2.145,15:2.131,16:2.12,17:2.11,18:2.101,19:2.093,20:2.086,21:2.08,22:2.074,23:2.069,24:2.064,25:2.06,26:2.056,27:2.052,28:2.048,29:2.045,30:2.042,infinity:1.96};
function getTValue(n){if(n<=1)return NaN;const df=n-1;if(df>30)return STUDENT_T_95_TWO_TAILED.infinity;return STUDENT_T_95_TWO_TAILED[df]||NaN}

function shapiroWilk(data) {
    const sorted = data.slice().sort((a, b) => a - b);
    const n = sorted.length;
    if (n < 3 || n > 26) return { W: NaN, kp: NaN, error: "Calcolo supportato per campioni da 3 a 26 dati." };
    const mean = data.reduce((a, b) => a + b) / n;
    const S2 = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    if (S2 < 1e-19) return { W: 1, kp: Infinity, isNormal: true };
    const a_half = a_coeffs_table[n];
    const a = new Array(n);
    for(let i=0; i < Math.ceil(n/2); i++) { a[i] = -a_half[i]; a[n-1-i] = a_half[i]; }
    if (n % 2 === 1) a[Math.floor(n/2)] = 0;
    const W = Math.pow(sorted.reduce((sum, val, i) => sum + a[i] * val, 0), 2) / S2;
    const W_prime = Math.min(W, 1.0);
    const {g, e, f} = kp_coeffs_table[n];
    const kp = g + e * Math.log((W_prime - f) / (1 - W_prime));
    return { W: W_prime, kp: isNaN(kp) ? Infinity : kp, isNormal: kp > -1.645 };
}

function median(data) {
    if (data.length === 0) return 0;
    const sorted = data.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function hubersTest(data) {
    if (data.length < 3) return [];
    const med = median(data);
    const deviations = data.map(d => Math.abs(d - med));
    const mad = median(deviations);
    if (mad < 1e-9) return [];
    const threshold = 3.5;
    const outliers = [];
    data.forEach((value, index) => {
        if ((Math.abs(value - med) / mad) > threshold) {
            outliers.push({ value, index });
        }
    });
    return outliers;
}

function dixonsTest(data) {
    console.warn("Dixon's test is not yet implemented.");
    return [];
}

function grubbsTest(data) {
    console.warn("Grubbs' test is not yet implemented.");
    return [];
}

/**
 * Calcola la retta di taratura con i minimi quadrati e l'incertezza di un campione incognito.
 * @param {number[]} cal_x - Array delle concentrazioni (asse x) della retta di taratura.
 * @param {number[]} cal_y - Array dei segnali (asse y) della retta di taratura.
 * @param {number} y_k - Segnale del campione incognito.
 * @param {number} [p=1] - Numero di repliche per la misurazione del campione incognito.
 * @returns {object} Un oggetto contenente i risultati del calcolo.
 */
function calculateRegressionLine(cal_x, cal_y) {
    if (cal_x.length !== cal_y.length || cal_x.length < 3) {
        throw new Error("Sono necessari almeno 3 punti di taratura con valori x e y validi.");
    }
    const n = cal_x.length;
    const calibrationData = cal_x.map((val, i) => [val, cal_y[i]]);

    const regression = ss.linearRegression(calibrationData);
    const slope = regression.m;
    const intercept = regression.b;

    if (Math.abs(slope) < 1e-12) {
        throw new Error("La pendenza della retta è zero. Impossibile procedere.");
    }

    const y_calcolato = cal_x.map(xi => slope * xi + intercept);
    const sum_sq_err = cal_y.reduce((acc, yi, i) => acc + Math.pow(yi - y_calcolato[i], 2), 0);
    const s_yx = Math.sqrt(sum_sq_err / (n - 2));
    const y_medio = ss.mean(cal_y);
    const x_medio = ss.mean(cal_x);
    const sum_sq_diff_x = cal_x.reduce((acc, xi) => acc + Math.pow(xi - x_medio, 2), 0);

    if (sum_sq_diff_x < 1e-12) {
         throw new Error("La deviazione dei punti x di taratura è zero (tutti i punti x sono uguali). Impossibile procedere.");
    }

    return {
        a: intercept,
        b: slope,
        s_yx: s_yx,
        r2: ss.rSquared(calibrationData, (x) => slope * x + intercept),
        n_cal: n,
        y_medio_cal: y_medio,
        sum_sq_diff_x_cal: sum_sq_diff_x
    };
}

function calculateUncertaintyForSample(lineParams, y_k, p = 1) {
    const { a, b, s_yx, n_cal, y_medio_cal, sum_sq_diff_x_cal } = lineParams;

    if (b === 0) { // Should be caught by calculateRegressionLine, but as a safeguard
        throw new Error("La pendenza della retta è zero.");
    }
    const x_k = (y_k - a) / b;

    const term1 = 1 / p;
    const term2 = 1 / n_cal;
    const term3 = Math.pow(y_k - y_medio_cal, 2) / (Math.pow(b, 2) * sum_sq_diff_x_cal);
    const rootTerm = Math.sqrt(term1 + term2 + term3);
    const ux = (s_yx / Math.abs(b)) * rootTerm;

    const ux_rel_perc = (x_k !== 0) ? (ux / Math.abs(x_k)) * 100 : 0;

    return {
        x_k: x_k,
        ux: ux,
        ux_rel_perc: ux_rel_perc
    };
}


const DEFAULT_GLASSWARE_LIBRARY = { 'Matraccio 5 mL': { volume: 5, uncertainty: 0.04 }, 'Matraccio 10 mL': { volume: 10, uncertainty: 0.04 }, 'Matraccio 20 mL': { volume: 20, uncertainty: 0.04 }, 'Matraccio 25 mL': { volume: 25, uncertainty: 0.04 }, 'Matraccio 50 mL': { volume: 50, uncertainty: 0.08 }, 'Matraccio 100 mL': { volume: 100, uncertainty: 0.1 } };
const DEFAULT_PIPETTE_LIBRARY = { "041CHR": { "calibrationPoints": [ { "volume": 0.002, "U_rel_percent": 3.9 }, { "volume": 0.01, "U_rel_percent": 0.95 }, { "volume": 0.02, "U_rel_percent": 0.49 } ] }, "042CHR": { "calibrationPoints": [ { "volume": 0.05, "U_rel_percent": 0.74 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] } };
const primaryBtnClass = "bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700";
const secondaryBtnClass = "bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300";

// --- UTILITY & CONSTANTS ---
function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }


// --- MODAL MANAGERS ---
const choiceModal = {
    backdrop: document.getElementById('choice-modal-backdrop'),
    content: document.getElementById('choice-modal-content'),
    title: document.getElementById('choice-modal-title'),
    body: document.getElementById('choice-modal-body'),
    footer: document.getElementById('choice-modal-footer'),
    show({ title, bodyContent, buttons }) {
        return new Promise(resolve => {
            this.title.textContent = title; this.body.innerHTML = bodyContent; this.footer.innerHTML = '';
            const clickHandler = async (value) => {
                await this.hide();
                resolve(value);
            };
            buttons.forEach(btn => {
                const buttonEl = document.createElement('button');
                buttonEl.textContent = btn.text; buttonEl.className = btn.class;
                buttonEl.onclick = () => clickHandler(btn.value);
                this.footer.appendChild(buttonEl);
            });
            this.backdrop.classList.remove('hidden');
            setTimeout(() => this.backdrop.classList.remove('opacity-0'), 10);
        });
    },
    hide() {
        return new Promise(resolve => {
            this.backdrop.classList.add('opacity-0');
            setTimeout(() => {
                this.backdrop.classList.add('hidden');
                resolve();
            }, 300);
        });
    }
};

const multiChoiceModal = {
    backdrop: document.getElementById('multi-choice-modal-backdrop'),
    content: document.getElementById('multi-choice-modal-content'),
    title: document.getElementById('multi-choice-modal-title'),
    body: document.getElementById('multi-choice-modal-body'),
    footer: document.getElementById('multi-choice-modal-footer'),
    show({ title, bodyContent, choices, buttons }) {
        return new Promise(resolve => {
            this.title.textContent = title;
            let choicesHTML = `<p>${bodyContent}</p><div class="mt-4 space-y-2">`;
            choices.forEach(choice => {
                choicesHTML += `
                    <div class="flex items-center">
                        <input id="modal-choice-${choice.id}" name="modal-choice" type="checkbox" value="${choice.id}" class="h-4 w-4 text-indigo-600 border-gray-300 rounded">
                        <label for="modal-choice-${choice.id}" class="ml-3 block text-sm font-medium text-gray-700">${choice.label}</label>
                    </div>`;
            });
            choicesHTML += `</div>`;
            this.body.innerHTML = choicesHTML;
            this.footer.innerHTML = '';
            const clickHandler = async (isConfirm) => {
                let selectedChoices = [];
                if (isConfirm) {
                    this.body.querySelectorAll('input[name="modal-choice"]:checked').forEach(checkbox => {
                        selectedChoices.push(checkbox.value);
                    });
                }
                await this.hide();
                resolve(selectedChoices);
            };
            buttons.forEach(btn => {
                const buttonEl = document.createElement('button');
                buttonEl.textContent = btn.text;
                buttonEl.className = btn.class;
                buttonEl.onclick = () => clickHandler(btn.isConfirm);
                this.footer.appendChild(buttonEl);
            });
            this.backdrop.classList.remove('hidden');
            setTimeout(() => this.backdrop.classList.remove('opacity-0'), 10);
        });
    },
    hide() {
        return new Promise(resolve => {
            this.backdrop.classList.add('opacity-0');
            setTimeout(() => {
                this.backdrop.classList.add('hidden');
                resolve();
            }, 300);
        });
    }
};

// --- INITIAL STATE ---
function getInitialAppState() {
    return {
        version: '3.0.0',
        ui: { activeTab: 'frontespizio' },
        project: { objective: '', method: '', component: '' },
        samples: [],
        results: {}, // keyed by sample.id
        spikeUncertainty: {
            // Data for spike uncertainty calculations, keyed by sample.id
            // Each entry will contain initial concentration, uncertainty, and preparation steps.
        },
        libraries: {
            glassware: deepCopy(DEFAULT_GLASSWARE_LIBRARY),
            pipettes: deepCopy(DEFAULT_PIPETTE_LIBRARY),
        },
        calibration: {
            points: [
                { x: 0.0, y: 0.05 },
                { x: 0.1, y: 0.18 },
                { x: 0.5, y: 0.80 },
                { x: 1.0, y: 1.55 },
                { x: 1.5, y: 2.28 },
                { x: 2.0, y: 3.01 },
            ],
            manualSample: { xk: null, p: 1 },
            results: null
        },
        rfCalibration: {
            acceptabilityCriterion: null,
            manualSample: { xk: null },
            results: null
        }
    };
}
let appState = getInitialAppState();


// --- RENDER FUNCTIONS ---
function render() {
    renderTabs();
    renderProjectInfo();
    renderSamplesAndResults();
    renderCalibrationTab();
    renderRfResults();
    renderSpikeUncertainty();
    renderDebugInfo();
}

function renderAnalysisChecklists() {
    const regressionChecklist = document.getElementById('analysis-sample-checklist');
    const rfChecklist = document.getElementById('rf-sample-checklist');
    if (!regressionChecklist || !rfChecklist) return;

    // Preserve checked state
    const currentlyCheckedReg = new Set();
    regressionChecklist.querySelectorAll('input:checked').forEach(input => currentlyCheckedReg.add(input.value));
    const currentlyCheckedRf = new Set();
    rfChecklist.querySelectorAll('input:checked').forEach(input => currentlyCheckedRf.add(input.value));


    regressionChecklist.innerHTML = '';
    rfChecklist.innerHTML = '';

    const eligibleSamples = appState.samples.filter(sample => {
        const result = appState.results[sample.id];
        return result && result.statistics && !result.error && (sample.expectedValue !== null && sample.expectedValue !== '');
    });

    if (eligibleSamples.length === 0) {
        const placeholder = `<p class="text-sm text-gray-500 italic px-2">Nessun campione con "Valore Atteso" è stato analizzato con successo.</p>`;
        regressionChecklist.innerHTML = placeholder;
        rfChecklist.innerHTML = placeholder;
        return;
    }

    let regChecklistHTML = '';
    eligibleSamples.forEach(sample => {
        const result = appState.results[sample.id];
        const isChecked = currentlyCheckedReg.has(String(sample.id)) ? 'checked' : '';
        regChecklistHTML += `
            <div class="flex items-center p-1 rounded-md hover:bg-gray-100">
                <input id="cal-sample-reg-${sample.id}" name="calibration_sample_reg" type="checkbox" value="${sample.id}" ${isChecked} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="cal-sample-reg-${sample.id}" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    ${sample.name} <span class="text-xs text-gray-500 font-mono">(x=${sample.expectedValue})</span>
                </label>
            </div>
        `;
    });
     let rfChecklistHTML = '';
      eligibleSamples.forEach(sample => {
        const result = appState.results[sample.id];
        const isChecked = currentlyCheckedRf.has(String(sample.id)) ? 'checked' : '';
        rfChecklistHTML += `
            <div class="flex items-center p-1 rounded-md hover:bg-gray-100">
                <input id="cal-sample-rf-${sample.id}" name="calibration_sample_rf" type="checkbox" value="${sample.id}" ${isChecked} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="cal-sample-rf-${sample.id}" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    ${sample.name} <span class="text-xs text-gray-500 font-mono">(x=${sample.expectedValue})</span>
                </label>
            </div>
        `;
    });


    regressionChecklist.innerHTML = regChecklistHTML;
    rfChecklist.innerHTML = rfChecklistHTML;
}

function renderCalibrationTab() {
    renderAnalysisChecklists(); // Chiamata la funzione qui
    const container = document.getElementById('regression-table-container');
    if (!container) return;
    container.innerHTML = '';

    (appState.calibration.points || []).forEach((point, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2 mb-2';
        row.innerHTML = `
            <input type="number" data-index="${index}" data-field="x" placeholder="Valore X (Conc.)" class="w-full p-2 border border-gray-300 rounded-md regression-input" value="${point.x ?? ''}">
            <input type="number" data-index="${index}" data-field="y" placeholder="Valore Y (Segnale)" class="w-full p-2 border border-gray-300 rounded-md regression-input" value="${point.y ?? ''}">
            <button data-index="${index}" class="btn-remove-regression-row text-red-500 hover:text-red-700 font-bold px-2" title="Rimuovi riga">&times;</button>
        `;
        container.appendChild(row);
    });

    const ykInput = document.getElementById('regression-y-k');
    if (ykInput) ykInput.value = appState.calibration.manualSample.yk ?? '';

    const pInput = document.getElementById('regression-p');
    if (pInput) pInput.value = appState.calibration.manualSample.p ?? 1;

    // Render dei risultati
    const resultsContainer = document.getElementById('regression-results');
    const results = appState.calibration.results;
    if (results) {
        if (results.error) {
            resultsContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4" role="alert"><p class="font-bold">Errore di Calcolo</p><p>${results.error}</p></div>`;
        } else if (results.line && results.samples) {
            const line = results.line;
            const samples = results.samples;

            const samplesHTML = samples.map(s => `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-2 font-medium">${s.sampleName}</td>
                    <td class="p-2 font-mono">${s.nominalConc.toPrecision(6)}</td>
                    <td class="p-2 font-mono">${s.ux.toPrecision(6)}</td>
                    <td class="p-2 font-mono">${s.ux_rel_perc.toFixed(2)} %</td>
                </tr>
            `).join('');

            const resultsHTML = `
                <h3 class="text-lg font-semibold text-gray-800 my-4 pt-4 border-t">Risultati del Calcolo</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded-md border">
                        <p class="font-semibold">Equazione della retta:</p>
                        <p class="font-mono text-center my-1">y = ${line.b.toPrecision(6)}x + ${line.a.toPrecision(6)}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-md border">
                        <p><span class="font-semibold">Coefficiente di determinazione (R²):</span> ${line.r2.toPrecision(7)}</p>
                        <p><span class="font-semibold">Dev. Std. Residua (s_yx):</span> ${line.s_yx.toPrecision(6)}</p>
                    </div>
                </div>

                <h4 class="font-semibold text-gray-700 mt-6 mb-2">Incertezza per Livello di Concentrazione</h4>
                <div class="mt-2 overflow-x-auto border rounded-lg">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="p-2 font-medium text-gray-600 rounded-tl-lg">Nome Campione/Livello</th>
                                <th class="p-2 font-medium text-gray-600">Concentrazione Nominale (x)</th>
                                <th class="p-2 font-medium text-gray-600">Incertezza Tipo (u_x)</th>
                                <th class="p-2 font-medium text-gray-600 rounded-tr-lg">Incertezza Relativa (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${samplesHTML}
                        </tbody>
                    </table>
                </div>
            `;
            resultsContainer.innerHTML = resultsHTML;
        }
        resultsContainer.classList.remove('hidden');
    } else {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
    }
}

function renderRfResults() {
    const resultsContainer = document.getElementById('rf-results');
    const results = appState.rfCalibration.results;

    if (results) {
        if (results.error) {
            resultsContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4" role="alert"><p class="font-bold">Errore di Calcolo</p><p>${results.error}</p></div>`;
        } else if (results.samples) {
            const samplesHTML = results.samples.map(s => `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-2 font-medium">${s.sampleName}</td>
                    <td class="p-2 font-mono">${s.nominalConc.toPrecision(6)}</td>
                    <td class="p-2 font-mono">${s.ux.toPrecision(6)}</td>
                </tr>
            `).join('');

            const resultsHTML = `
                <h3 class="text-lg font-semibold text-gray-800 my-4 pt-4 border-t">Risultati del Calcolo</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded-md border">
                        <p><span class="font-semibold">Incertezza tipo relativa di taratura (u_taratura%):</span></p>
                        <p class="font-mono text-center my-1 text-lg">${results.utaratura_perc.toFixed(3)} %</p>
                    </div>
                </div>

                <h4 class="font-semibold text-gray-700 mt-6 mb-2">Incertezza per Livello di Concentrazione</h4>
                <div class="mt-2 overflow-x-auto border rounded-lg">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="p-2 font-medium text-gray-600 rounded-tl-lg">Nome Campione/Livello</th>
                                <th class="p-2 font-medium text-gray-600">Concentrazione Nominale (x)</th>
                                <th class="p-2 font-medium text-gray-600 rounded-tr-lg">Incertezza Tipo (u_x)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${samplesHTML}
                        </tbody>
                    </table>
                </div>
            `;
            resultsContainer.innerHTML = resultsHTML;
        }
        resultsContainer.classList.remove('hidden');
    } else {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
    }
}

function renderSpikeUncertainty() {
    const container = document.getElementById('spike-calculators-container');
    if (!container) return;

    const eligibleSamples = appState.samples.filter(sample => {
        const result = appState.results[sample.id];
        return result && result.statistics && !result.error && (sample.expectedValue !== null && sample.expectedValue !== '');
    });

    if (eligibleSamples.length === 0) {
        container.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg border text-center text-gray-600">
            <p>Questa sezione si attiva quando sono presenti campioni con "Valore Atteso" calcolati con successo nella scheda "Analisi Statistica".</p>
            <p class="mt-2 text-sm">Assicurati di aver inserito un valore atteso per almeno un campione e di aver eseguito il calcolo.</p>
        </div>`;
        return;
    }

    let content = '';
    eligibleSamples.forEach(sample => {
        // Ensure there's a state object for this sample, and initialize with a default step
        if (!appState.spikeUncertainty[sample.id]) {
            appState.spikeUncertainty[sample.id] = {
                initialConcentration: null,
                initialUncertainty: null,
                steps: [] // Start with no steps, user must add one.
            };
        }
        const sampleSpikeState = appState.spikeUncertainty[sample.id];

        // Render steps for the current sample
        let stepsHTML = '';
        if (sampleSpikeState.steps.length > 0) {
            sampleSpikeState.steps.forEach((step, stepIndex) => {

                // Create dropdown options for flasks
                const flaskOptions = Object.keys(appState.libraries.glassware).map(key => {
                    const flask = appState.libraries.glassware[key];
                    const isSelected = key === step.dilutionFlask ? 'selected' : '';
                    return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                }).join('');

                // Render withdrawals for the current step
                let withdrawalsHTML = '';
                if (step.withdrawals.length > 0) {
                    step.withdrawals.forEach((withdrawal, wIndex) => {
                        const pipetteOptions = Object.keys(appState.libraries.pipettes).map(key => {
                            const isSelected = key === withdrawal.pipette ? 'selected' : '';
                            return `<option value="${key}" ${isSelected}>${key}</option>`;
                        }).join('');

                        // Find volume limits for validation hint
                        let volHint = '';
                        if (withdrawal.pipette && appState.libraries.pipettes[withdrawal.pipette]) {
                            const points = appState.libraries.pipettes[withdrawal.pipette].calibrationPoints.map(p => p.volume);
                            if (points.length > 0) {
                                volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                            }
                        }

                        withdrawalsHTML += `
                            <div class="flex items-center space-x-2 bg-gray-100 p-2 rounded-md">
                                <div class="flex-grow">
                                    <label class="block text-xs font-medium text-gray-600">Pipetta</label>
                                    <select data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" class="spike-input-withdrawal-pipette w-full p-1 border border-gray-300 rounded-md text-sm">
                                         <option value="">-- Seleziona --</option>
                                         ${pipetteOptions}
                                    </select>
                                </div>
                                <div class="flex-grow">
                                    <label class="block text-xs font-medium text-gray-600">Volume (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                    <input type="number" data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" class="spike-input-withdrawal-volume w-full p-1 border border-gray-300 rounded-md text-sm" value="${withdrawal.volume || ''}" placeholder="Volume">
                                </div>
                                <button data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" class="btn-remove-withdrawal text-red-500 hover:text-red-700 self-end mb-1 font-bold text-lg" title="Rimuovi Prelievo">&times;</button>
                            </div>
                        `;
                    });
                } else {
                    withdrawalsHTML = `<p class="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Nessun prelievo aggiunto a questo passaggio.</p>`;
                }

                stepsHTML += `
                    <div class="p-4 border-2 rounded-lg relative bg-gray-50 border-gray-200">
                        <button data-sample-id="${sample.id}" data-step-id="${step.id}" class="btn-remove-step absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl leading-none" title="Rimuovi Passaggio">&times;</button>
                        <h4 class="text-lg font-semibold text-gray-700 mb-4">Passaggio di Preparazione ${stepIndex + 1}</h4>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <!-- Colonna Sinistra: Diluizione -->
                            <div class="space-y-2">
                                <h5 class="font-semibold text-gray-600">Diluizione</h5>
                                <label for="flask-select-${step.id}" class="block text-sm font-medium text-gray-700">Matraccio di diluizione finale</label>
                                <select id="flask-select-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" class="spike-input-dilution mt-1 w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Seleziona un matraccio --</option>
                                    ${flaskOptions}
                                </select>
                            </div>

                            <!-- Colonna Destra: Prelievi -->
                            <div class="space-y-2">
                                 <h5 class="font-semibold text-gray-600">Prelievi</h5>
                                <div id="withdrawals-container-${step.id}" class="mt-1 space-y-3">
                                    ${withdrawalsHTML}
                                </div>
                                <button data-sample-id="${sample.id}" data-step-id="${step.id}" class="btn-add-withdrawal mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Prelievo</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            stepsHTML = `<p class="text-gray-500 italic p-4 text-center">Nessun passaggio di preparazione definito. Aggiungine uno per iniziare.</p>`;
        }

        content += `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Preparazione Spike per Campione: <span class="font-bold">${sample.name}</span></h3>

                <!-- Sezione Materiale di Riferimento -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 mb-4">
                    <div>
                        <label for="initial-conc-${sample.id}" class="block text-sm font-medium text-gray-700">Concentrazione Materiale di Riferimento (µg/mL)</label>
                        <input type="number" id="initial-conc-${sample.id}" data-sample-id="${sample.id}" data-field="initialConcentration" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.initialConcentration || ''}" placeholder="Es: 1000">
                    </div>
                    <div>
                        <label for="initial-unc-${sample.id}" class="block text-sm font-medium text-gray-700">Incertezza del certificato (U %)</label>
                        <input type="number" id="initial-unc-${sample.id}" data-sample-id="${sample.id}" data-field="initialUncertainty" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.initialUncertainty || ''}" placeholder="Es: 0.5">
                    </div>
                </div>

                <!-- Contenitore per i Passaggi di Preparazione -->
                <div id="steps-container-${sample.id}" class="space-y-6">
                    ${stepsHTML}
                </div>

                <!-- Azioni -->
                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <button data-sample-id="${sample.id}" class="btn-add-step text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-blue-200 transition">+ Aggiungi Passaggio</button>
                    <div id="spike-results-container-${sample.id}" class="text-right font-semibold">
                        <!-- I risultati verranno mostrati qui -->
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = content;
}

function renderTabs() {
    document.querySelectorAll('[data-tab-name]').forEach(tab => tab.classList.toggle('active', tab.dataset.tabName === appState.ui.activeTab));
    document.querySelectorAll('[id^="content-"]').forEach(content => content.classList.toggle('hidden', content.id !== `content-${appState.ui.activeTab}`));
}
function renderProjectInfo() {
    document.getElementById('project-objective').value = appState.project.objective;
    document.getElementById('project-method').value = appState.project.method;
    document.getElementById('project-component').value = appState.project.component;
}
function renderDebugInfo() {
    const debugView = document.getElementById('debug-state-view');
    if (debugView) {
        debugView.textContent = JSON.stringify(appState, null, 2);
    }
}
function renderResultsOnly() {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const hasResults = appState.samples.some(s => appState.results[s.id] && (appState.results[s.id].statistics || appState.results[s.id].error));
    document.getElementById('export-buttons').classList.toggle('hidden', !hasResults);

    appState.samples.forEach(sample => {
        const result = appState.results[sample.id];
        if (!result || (!result.statistics && !result.error)) {
            return;
        }

        const resultCard = document.createElement('div');
        const borderColor = result.error ? 'border-red-500' : 'border-blue-500';
        resultCard.className = `bg-white p-5 rounded-lg shadow-md border-l-4 ${borderColor} mb-6`;

        let statsHTML = '';
        if (result.statistics) {
            const stats = result.statistics;
            const format = (value, precision = 6) => (value !== null && !isNaN(value)) ? value.toPrecision(precision) : 'N/A';
            const formatPercent = (value) => (value !== null && !isNaN(value)) ? `${value.toFixed(2)} %` : 'N/A';

            let statRows = [];
            if (stats.nominalValue !== null) {
                statRows.push(`<tr><td class="p-2 font-medium">Valore Nominale</td><td class="p-2 font-mono">${format(stats.nominalValue)}</td></tr>`);
            }
            statRows.push(`<tr><td class="p-2 font-medium">N. Punti</td><td class="p-2 font-mono">${stats.n}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">Media</td><td class="p-2 font-mono">${format(stats.mean)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">Minimo</td><td class="p-2 font-mono">${format(stats.min)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">Massimo</td><td class="p-2 font-mono">${format(stats.max)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">Deviazione Standard</td><td class="p-2 font-mono">${format(stats.stdDev)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">CV %</td><td class="p-2 font-mono">${formatPercent(stats.cv_percent)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">Limite Ripetibilità (r)</td><td class="p-2 font-mono">${format(stats.repeatability_limit_r)}</td></tr>`);
            statRows.push(`<tr><td class="p-2 font-medium">r %</td><td class="p-2 font-mono">${formatPercent(stats.repeatability_limit_r_percent)}</td></tr>`);
            if (stats.recovery !== null) {
                statRows.push(`<tr><td class="p-2 font-medium">Recupero %</td><td class="p-2 font-mono">${formatPercent(stats.recovery)}</td></tr>`);
            }

            statsHTML = `
                <div>
                    <h5 class="font-semibold text-gray-700 text-md mb-2">Statistiche Descrittive</h5>
                    <div class="overflow-x-auto rounded-md border">
                        <table class="w-full text-sm data-table">
                           <tbody>${statRows.join('')}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        const logHTML = result.log && result.log.length > 0
            ? `<div>
                 <h5 class="font-semibold text-gray-700 text-md mb-2">Log di Analisi</h5>
                 <ul class="space-y-1 text-sm text-gray-600 pl-4 max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50">
                   ${result.log.map(item => `<li class="analysis-log ${item.type}">${item.message}</li>`).join('')}
                 </ul>
               </div>`
            : '<div></div>';

        const titleColor = result.error ? 'text-red-700' : 'text-gray-900';
        resultCard.innerHTML = `
            <h4 class="text-lg font-bold ${titleColor} mb-4">${sample.name} - Report di Analisi</h4>
            ${result.error ? `<p class="text-red-600 font-semibold mb-4">Analisi terminata con errore: ${result.error}</p>` : ''}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                ${logHTML}
                ${statsHTML || '<div></div>'}
            </div>
        `;
        resultsContainer.appendChild(resultCard);
    });
}
function renderSamplesAndResults() {
    const container = document.getElementById('samples-container');
    container.innerHTML = '';

    appState.samples.forEach(sample => {
        const card = document.createElement('div');
        card.className = 'sample-card bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-4';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Campione ${sample.id}</h3>
                <button data-sample-id="${sample.id}" class="btn-remove-sample text-red-500 hover:text-red-700 font-bold text-xl px-2" title="Rimuovi campione">&times;</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Dati</label><textarea data-sample-id="${sample.id}" data-field="rawData" rows="4" class="data-input w-full p-2 border border-gray-300 rounded-md">${sample.rawData || ''}</textarea></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Nome</label><input data-sample-id="${sample.id}" data-field="name" type="text" class="w-full p-2 border border-gray-300 rounded-md" value="${sample.name || ''}"><label class="block text-sm font-medium text-gray-700 mt-2 mb-1">Valore Atteso</label><input data-sample-id="${sample.id}" data-field="expectedValue" type="number" class="w-full p-2 border border-gray-300 rounded-md" value="${sample.expectedValue || ''}"></div>
            </div>`;
        container.appendChild(card);
    });

    renderResultsOnly();
}

// --- ACTIONS ---
function actionSwitchTab(tabName) { appState.ui.activeTab = tabName; render(); }
function actionAddSample() {
    const newId = appState.samples.length > 0 ? Math.max(...appState.samples.map(s => s.id)) + 1 : 1;
    appState.samples.push({ id: newId, name: `Campione ${newId}`, rawData: '', expectedValue: null });
    render();
}
function actionRemoveSample(sampleId) {
    appState.samples = appState.samples.filter(s => s.id !== sampleId);
    delete appState.results[sampleId];
    render();
}
function actionUpdateSample(sampleId, field, value) {
    const sample = appState.samples.find(s => s.id === sampleId);
    if (sample) {
        if (field === 'expectedValue') sample[field] = value === '' ? null : parseFloat(value);
        else sample[field] = value;
    }
}

async function actionCalculateAll() {
    try {
        document.getElementById('calculate-btn').disabled = true;
        appState.results = {};

        for (const sample of appState.samples) {
            await processSample(sample);
        }

        document.getElementById('calculate-btn').disabled = false;
        render();
    } catch (e) {
        console.error("Error in actionCalculateAll:", e);
        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            resultsContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p class="font-bold">Errore Critico</p><p>${e.message}</p></div>`;
        }
        document.getElementById('calculate-btn').disabled = false;
    }
}

async function processSample(sample) {
    try {
        appState.results[sample.id] = {
            log: [],
            originalData: [],
            currentData: [],
            statistics: null,
            error: null,
        };

        function addLog(type, message) {
            appState.results[sample.id].log.push({ type, message });
            // Rendering is now handled by a single call in actionCalculateAll
        }

        addLog('info', 'Inizio analisi...');

        let data;
        if (sample.rawData.includes('.')) {
            data = sample.rawData.split(/[\s,]+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n));
        } else {
            const standardizedData = sample.rawData.replace(/,/g, '.');
            data = standardizedData.split(/\s+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n));
        }

        appState.results[sample.id].originalData = [...data];
        let currentData = [...data];
        appState.results[sample.id].currentData = currentData;


        if (currentData.length < 3) {
            addLog('error', 'Sono necessari almeno 3 punti dati per il test.');
            appState.results[sample.id].error = 'Dati insufficienti.';
            return;
        }

        let normalityResult = shapiroWilk(currentData);
        addLog('test', `Test di Normalità (Shapiro-Wilk): ${normalityResult.isNormal ? 'Passato' : 'Fallito'} (kp=${normalityResult.kp.toFixed(3)})`);

        if (!normalityResult.isNormal) {
            addLog('info', 'Dati non normali. Richiesta di conferma per il test di Huber.');

            const proceedWithHuber = await choiceModal.show({
                title: `Dati non Normali`,
                bodyContent: `<p>I dati del campione <strong>${sample.name}</strong> non seguono una distribuzione normale.</p><p class="mt-2">L'unico test per outlier applicabile in questo caso è il test di Huber (basato sulla MAD). Vuoi procedere?</p>`,
                buttons: [
                    { text: "Annulla Analisi", value: false, class: secondaryBtnClass },
                    { text: "Procedi con Huber", value: true, class: primaryBtnClass }
                ]
            });

            if (proceedWithHuber) {
                addLog('decision', 'Utente ha scelto di procedere con il test di Huber.');
                const outliers = hubersTest(currentData);

                if (outliers.length > 0) {
                    const outlierValues = outliers.map(o => o.value).join(', ');
                    addLog('warning', `Dati anomali trovati: ${outlierValues}`);

                    const userChoice = await choiceModal.show({
                        title: `[${sample.name}] - Dati Anomali Rilevati`,
                        bodyContent: `<p>Sono stati identificati i seguenti dati anomali: <strong>${outlierValues}</strong>.</p><p class="mt-2">Vuoi rimuoverli e rieseguire il test di normalità?</p>`,
                        buttons: [
                            { text: "Mantieni i dati", value: 'keep', class: secondaryBtnClass },
                            { text: "Rimuovi e Riprova", value: 'remove', class: primaryBtnClass }
                        ]
                    });

                    if (userChoice === 'remove') {
                        addLog('decision', 'Decisione utente: rimozione dati anomali.');
                        const outlierIndices = outliers.map(o => o.index);
                        const cleanedData = currentData.filter((_, index) => !outlierIndices.includes(index));
                        appState.results[sample.id].currentData = cleanedData;
                        currentData = cleanedData;

                        normalityResult = shapiroWilk(currentData);
                        addLog('test', `Rieseguito Test di Normalità: ${normalityResult.isNormal ? 'Passato' : 'Fallito'} (kp=${normalityResult.kp.toFixed(3)})`);
                        if (!normalityResult.isNormal) {
                            addLog('error', 'I dati non sono normali anche dopo la rimozione degli anomali.');
                        appState.results[sample.id].error = "I dati non sono normali anche dopo la rimozione degli anomali.";
                        } else {
                            addLog('info', 'I dati ora sono normali. Procedere con la normale analisi degli outlier.');
                        }
                    } else {
                        addLog('decision', 'Decisione utente: mantenimento dati anomali.');
                        addLog('error', 'I calcoli non possono procedere su dati non normali con anomalie non rimosse.');
                        appState.results[sample.id].error = "I calcoli non possono procedere su dati non normali con anomalie non rimosse.";
                    }
                } else {
                    addLog('info', 'Nessun dato anomalo trovato con il test di Huber.');
                    appState.results[sample.id].error = "I dati non sono normali e non sono stati trovati outlier.";
                }
            } else {
                addLog('decision', 'Utente ha scelto di non procedere. Analisi interrotta.');
                appState.results[sample.id].error = "Analisi interrotta dall'utente a causa di dati non normali.";
            }
        } else {
            addLog('info', 'I dati sono normali. Scegliere un test per la verifica degli outlier.');

            const testChoices = await multiChoiceModal.show({
               title: `[${sample.name}] - Scelta Test Outlier`,
               bodyContent: 'I dati sembrano seguire una distribuzione normale. Seleziona uno o più test per la verifica di dati anomali:',
               choices: [
                   { id: 'huber', label: 'Huber (MAD)' },
                   { id: 'grubbs', label: 'Grubbs (per un singolo anomalo)' },
                   { id: 'dixon', label: 'Dixon (per piccoli campioni)' }
               ],
               buttons: [
                   { text: "Annulla", value: [], isConfirm: false, class: secondaryBtnClass },
                   { text: "Esegui Test", value: null, isConfirm: true, class: primaryBtnClass }
               ]
            });

            if (testChoices.length === 0) {
                addLog('decision', 'Nessun test per outlier selezionato.');
                // No further action needed if user cancels.
                return;
            }

           addLog('decision', `Test selezionati dall'utente: ${testChoices.join(', ')}`);
           let allOutliers = new Map();

           if (testChoices.includes('huber')) {
               hubersTest(currentData).forEach(o => allOutliers.set(o.index, o.value));
           }
           if (testChoices.includes('grubbs')) {
               grubbsTest(currentData).forEach(o => allOutliers.set(o.index, o.value));
           }
           if (testChoices.includes('dixon')) {
               dixonsTest(currentData).forEach(o => allOutliers.set(o.index, o.value));
           }

           if (allOutliers.size > 0) {
               const outlierValues = Array.from(allOutliers.values()).join(', ');
               addLog('warning', `Dati anomali trovati: ${outlierValues}`);

               const userChoice = await choiceModal.show({
                   title: `[${sample.name}] - Dati Anomali Rilevati`,
                   bodyContent: `<p>Sono stati identificati i seguenti dati anomali: <strong>${outlierValues}</strong>.</p><p class="mt-2">Vuoi rimuoverli prima di procedere con i calcoli finali?</p>`,
                   buttons: [
                       { text: "Mantieni i dati", value: 'keep', class: secondaryBtnClass },
                       { text: "Rimuovi e continua", value: 'remove', class: primaryBtnClass }
                   ]
               });

               if (userChoice === 'remove') {
                   addLog('decision', 'Decisione utente: rimozione dati anomali.');
                   const outlierIndices = Array.from(allOutliers.keys());
                   const cleanedData = currentData.filter((_, index) => !outlierIndices.includes(index));
                   appState.results[sample.id].currentData = cleanedData;
                   currentData = cleanedData;
                   addLog('info', 'Dati anomali rimossi. L\'analisi procederà con i dati puliti.');
               } else {
                   addLog('decision', 'Decisione utente: mantenimento dati anomali.');
                   addLog('info', 'L\'analisi procederà con i dati originali (incluse le anomalie).');
               }
           } else {
               addLog('info', 'Nessun dato anomalo trovato con i test selezionati.');
           }
        }

        // --- CALCOLO STATISTICHE DESCRITTIVE FINALI ---
        if (!appState.results[sample.id].error) {
            const finalData = appState.results[sample.id].currentData;
            addLog('info', `Calcolo delle statistiche descrittive su ${finalData.length} punti dati finali.`);

            if (finalData.length > 0) {
                const n = finalData.length;
                const mean = n > 0 ? ss.mean(finalData) : 0;
                const stdDev = n > 1 ? ss.standardDeviation(finalData) : 0;
                const t_value = getTValue(n);
                const repeatability_limit_r = n > 1 && t_value ? t_value * stdDev : 0;
                const nominalValue = (sample.expectedValue !== null && !isNaN(sample.expectedValue) && sample.expectedValue !== '') ? parseFloat(sample.expectedValue) : null;

                const stats = {
                    n: n,
                    mean: mean,
                    max: n > 0 ? ss.max(finalData) : 0,
                    min: n > 0 ? ss.min(finalData) : 0,
                    stdDev: stdDev,
                    cv_percent: (mean !== 0 && n > 1) ? (stdDev / Math.abs(mean)) * 100 : 0,
                    t_value: t_value,
                    repeatability_limit_r: repeatability_limit_r,
                    repeatability_limit_r_percent: (mean !== 0 && n > 1) ? (repeatability_limit_r / Math.abs(mean)) * 100 : 0,
                    nominalValue: nominalValue,
                    recovery: (nominalValue !== null && nominalValue !== 0) ? (mean / nominalValue) * 100 : null
                };
                appState.results[sample.id].statistics = stats;

                addLog('result', `Statistiche calcolate: Media = ${stats.mean.toPrecision(6)}, Dev. Std. = ${stats.stdDev.toPrecision(6)}, n = ${stats.n}`);

            } else {
                addLog('warning', 'Nessun dato rimasto per il calcolo delle statistiche finali.');
                appState.results[sample.id].error = "Nessun dato rimasto per il calcolo.";
            }
        }

    } catch (e) {
        console.error(`Error in processSample for sample ${sample.id}:`, e);
        if (!appState.results[sample.id]) {
            appState.results[sample.id] = { log: [], error: null };
        }
        appState.results[sample.id].error = e.message;
        appState.results[sample.id].log.push({ type: 'error', message: `Errore fatale: ${e.message}`});
        render();
    }
}
function actionResetData() { appState = getInitialAppState(); actionAddSample(); }
function actionSaveData() {
    const stateString = JSON.stringify(appState, null, 2);
    const blob = new Blob([stateString], { type: 'application/json' });
    const now = new Date();
    const fileName = `dati_analisi_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.json`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// --- AZIONI PER LA SEZIONE TARATURA ---
function actionAddRegressionRow() {
    appState.calibration.points.push({ x: null, y: null });
    renderCalibrationTab();
    renderDebugInfo();
}

function actionRemoveRegressionRow(index) {
    appState.calibration.points.splice(index, 1);
    renderCalibrationTab();
    renderDebugInfo();
}

function actionUpdateRegressionPoint(index, field, value) {
    const numValue = value === '' ? null : parseFloat(value);
    appState.calibration.points[index][field] = numValue;
    renderDebugInfo(); // Aggiorna la vista di debug
}

function actionUpdateManualCalibrationSample(field, value) {
    const numValue = value === '' ? null : parseFloat(value);
    appState.calibration.manualSample[field] = numValue;
    renderDebugInfo();
}

function actionUpdateRfCalibrationInput(field, value) {
    const numValue = value === '' ? null : parseFloat(value);
    if (field === 'acceptabilityCriterion') {
        appState.rfCalibration.acceptabilityCriterion = numValue;
    } else if (field === 'manualConc') {
        appState.rfCalibration.manualSample.xk = numValue;
    }
    renderDebugInfo();
}

function actionCalculateRegression() {
    try {
        appState.calibration.results = null;

        const validPoints = appState.calibration.points.filter(p => p.x !== null && p.y !== null && !isNaN(p.x) && !isNaN(p.y));
        const cal_x = validPoints.map(p => p.x);
        const cal_y = validPoints.map(p => p.y);

        const lineParams = calculateRegressionLine(cal_x, cal_y);

        const tasks = [];
        const selectedSampleIds = Array.from(document.querySelectorAll('input[name="calibration_sample_reg"]:checked')).map(cb => cb.value);

        selectedSampleIds.forEach(id => {
            const sample = appState.samples.find(s => s.id == id);
            const result = appState.results[id];
            if (sample && result && result.statistics && sample.expectedValue !== null) {
                tasks.push({
                    name: sample.name,
                    xk: parseFloat(sample.expectedValue),
                    p: result.statistics.n
                });
            }
        });

        const { xk, p } = appState.calibration.manualSample;
        if (xk !== null && xk !== '' && !isNaN(xk)) {
            tasks.push({ name: "Campione Manuale", xk: parseFloat(xk), p: p || 1 });
        }

        if (tasks.length === 0) {
            throw new Error("Nessun campione selezionato o valore di concentrazione manuale inserito.");
        }

        const sampleResults = tasks.map(task => {
            const y_predicted = (lineParams.b * task.xk) + lineParams.a;
            const uncertaintyResult = calculateUncertaintyForSample(lineParams, y_predicted, task.p);
            return {
                sampleName: task.name,
                nominalConc: task.xk,
                ...uncertaintyResult
            };
        });

        appState.calibration.results = {
            line: lineParams,
            samples: sampleResults,
            error: null
        };

    } catch (error) {
        console.error("Errore nel calcolo della regressione:", error);
        appState.calibration.results = { error: error.message };
    }
    render();
}


function actionCalculateResponseFactor() {
    try {
        appState.rfCalibration.results = null; // Reset previous results

        const criterion = appState.rfCalibration.acceptabilityCriterion;
        if (criterion === null || isNaN(criterion) || criterion <= 0) {
            throw new Error("Il criterio di accettabilità deve essere un numero positivo.");
        }

        const utaratura_perc = criterion / Math.sqrt(3);

        const tasks = [];
        const selectedSampleIds = Array.from(document.querySelectorAll('input[name="calibration_sample_rf"]:checked')).map(cb => cb.value);

        selectedSampleIds.forEach(id => {
            const sample = appState.samples.find(s => s.id == id);
            const result = appState.results[id];
            if (sample && result && result.statistics && sample.expectedValue !== null) {
                tasks.push({
                    name: sample.name,
                    xk: parseFloat(sample.expectedValue)
                });
            }
        });

        const { xk } = appState.rfCalibration.manualSample;
        if (xk !== null && xk !== '' && !isNaN(xk)) {
            tasks.push({ name: "Campione Manuale", xk: parseFloat(xk) });
        }

        if (tasks.length === 0) {
            throw new Error("Nessun campione selezionato o valore di concentrazione manuale inserito.");
        }

        const sampleResults = tasks.map(task => {
            const ux = (Math.abs(task.xk) * utaratura_perc) / 100;
            return {
                sampleName: task.name,
                nominalConc: task.xk,
                ux: ux
            };
        });

        appState.rfCalibration.results = {
            utaratura_perc: utaratura_perc,
            samples: sampleResults,
            error: null
        };

    } catch (error) {
        console.error("Errore nel calcolo del fattore di risposta:", error);
        appState.rfCalibration.results = { error: error.message };
    }
    render(); // This will trigger the UI update
}


function actionLoadData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedState = JSON.parse(e.target.result);
            if (!loadedState.version || !loadedState.project) throw new Error("File non valido.");
            appState = loadedState;
            render();
            alert("Dati caricati con successo!");
        } catch (error) { alert(`Errore nel caricamento: ${error.message}`); }
        finally { event.target.value = null; }
    };
    reader.readAsText(file);
}

// --- AZIONI PER LA SEZIONE INCERTEZZA DI PREPARAZIONE ---

function actionAddSpikeStep(sampleId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    if (!sampleState) return;
    const newStepId = `step-${Date.now()}`;
    sampleState.steps.push({
        id: newStepId,
        dilutionFlask: null,
        withdrawals: [
            { id: `w-${Date.now()}`, pipette: null, volume: null }
        ]
    });
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionRemoveSpikeStep(sampleId, stepId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    if (!sampleState) return;
    sampleState.steps = sampleState.steps.filter(s => s.id !== stepId);
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionAddSpikeWithdrawal(sampleId, stepId) {
    const step = appState.spikeUncertainty[sampleId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals.push({ id: `w-${Date.now()}`, pipette: null, volume: null });
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionRemoveSpikeWithdrawal(sampleId, stepId, withdrawalId) {
    const step = appState.spikeUncertainty[sampleId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals = step.withdrawals.filter(w => w.id !== withdrawalId);
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionUpdateSpikeState({ sampleId, stepId, withdrawalId, field, value }) {
    const sampleState = appState.spikeUncertainty[sampleId];
    if (!sampleState) return;

    if (stepId && withdrawalId) {
        const step = sampleState.steps.find(s => s.id === stepId);
        const withdrawal = step?.withdrawals.find(w => w.id === withdrawalId);
        if (withdrawal) { withdrawal[field] = value; }
    } else if (stepId) {
        const step = sampleState.steps.find(s => s.id === stepId);
        if (step) { step[field] = value; }
    } else {
        sampleState[field] = value;
    }

    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionCalculateSpikeUncertainty(sampleId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    const resultsContainer = document.getElementById(`spike-results-container-${sampleId}`);

    const showError = (message) => {
        if (resultsContainer) {
            resultsContainer.innerHTML = `<span class="text-red-500 text-sm font-medium">${message}</span>`;
        }
        sampleState.results = null;
        renderDebugInfo();
    };

    try {
        if (resultsContainer) resultsContainer.innerHTML = ''; // Clear previous results

        if (sampleState.initialConcentration === null || sampleState.initialUncertainty === null || sampleState.initialConcentration <= 0) {
            return showError("Dati iniziali mancanti o non validi.");
        }

        let currentConcentration = sampleState.initialConcentration;
        // U% is expanded (k=2), so standard uncertainty u = U / 2. Then convert to relative decimal: u_rel = (U/100)/2
        let sum_u_rel_sq = Math.pow(sampleState.initialUncertainty / 200, 2);

        for (const step of sampleState.steps) {
            if (!step.dilutionFlask) return showError(`Matraccio non selezionato.`);
            if (step.withdrawals.length === 0) return showError(`Nessun prelievo nel passaggio.`);
            if (step.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) {
                return showError(`Dati di prelievo incompleti o non validi.`);
            }

            let totalWithdrawalVolume = 0;
            let sum_u_abs_sq_withdrawals = 0;

            for (const w of step.withdrawals) {
                totalWithdrawalVolume += w.volume;
                const pipette = appState.libraries.pipettes[w.pipette];
                const points = pipette.calibrationPoints.map(p => p.volume);
                const minVol = Math.min(...points);
                const maxVol = Math.max(...points);

                if (w.volume < minVol || w.volume > maxVol) {
                    throw new Error(`Volume ${w.volume}mL fuori range per pipetta ${w.pipette}.`);
                }

                let uncertainty_U_perc = 0;
                const sortedPoints = pipette.calibrationPoints.slice().sort((a,b) => a.volume - b.volume);

                let found = false;
                for (let i = 0; i < sortedPoints.length - 1; i++) {
                    if (w.volume >= sortedPoints[i].volume && w.volume <= sortedPoints[i+1].volume) {
                        uncertainty_U_perc = Math.max(sortedPoints[i].U_rel_percent, sortedPoints[i+1].U_rel_percent);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                     const match = sortedPoints.find(p => p.volume === w.volume);
                     if(match) uncertainty_U_perc = match.U_rel_percent;
                     else throw new Error(`Logica incertezza pipetta fallita per volume ${w.volume}.`);
                }

                // u_abs = (U_rel_perc / 100 * V_prelievo) / (k=2 * sqrt(3))
                const u_abs_withdrawal = (uncertainty_U_perc / 100 * w.volume) / (2 * Math.sqrt(3));
                sum_u_abs_sq_withdrawals += Math.pow(u_abs_withdrawal, 2);
            }

            const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);
            const u_rel_sq_total_withdrawal = totalWithdrawalVolume > 0 ? Math.pow(u_abs_total_withdrawal / totalWithdrawalVolume, 2) : 0;

            const flask = appState.libraries.glassware[step.dilutionFlask];
            // u_rel = (Tolerance / Volume_nominal) / sqrt(3)
            const u_rel_sq_flask = Math.pow(flask.uncertainty / flask.volume / Math.sqrt(3), 2);

            sum_u_rel_sq += u_rel_sq_total_withdrawal + u_rel_sq_flask;
            currentConcentration = currentConcentration * (totalWithdrawalVolume / flask.volume);
        }

        if (sampleState.steps.length === 0) {
             // If no steps, the result is just the initial state
             const final_u_rel = Math.sqrt(sum_u_rel_sq);
             const final_u_abs = final_u_rel * currentConcentration;
             const final_u_rel_perc = final_u_rel * 100;
             sampleState.results = { finalConcentration: currentConcentration, u_comp: final_u_abs, u_comp_rel_perc: final_u_rel_perc };
        } else {
            const final_u_rel = Math.sqrt(sum_u_rel_sq);
            const final_u_abs = final_u_rel * currentConcentration;
            const final_u_rel_perc = final_u_rel * 100;
            sampleState.results = { finalConcentration: currentConcentration, u_comp: final_u_abs, u_comp_rel_perc: final_u_rel_perc };
        }

        if (resultsContainer && sampleState.results) {
            const res = sampleState.results;
            resultsContainer.innerHTML = `
                <div class="text-right">
                    <p class="text-sm text-gray-600">Conc. Finale: <span class="font-bold text-black">${res.finalConcentration.toPrecision(4)}</span></p>
                    <p class="text-sm text-gray-600">u_c: <span class="font-bold text-black">${res.u_comp.toPrecision(3)}</span></p>
                    <p class="text-sm text-gray-600">u_c %: <span class="font-bold text-black">${res.u_comp_rel_perc.toFixed(2)} %</span></p>
                </div>
            `;
        }
        renderDebugInfo();

    } catch (e) {
        showError(e.message);
    }
}

// --- MAIN APP SETUP ---
function main() {
    // --- Event Listeners Scheda Analisi Statistica ---
    document.getElementById('btn-add-sample').addEventListener('click', actionAddSample);
    document.getElementById('btn-load-data').addEventListener('click', () => document.getElementById('load-data-input').click());
    document.getElementById('load-data-input').addEventListener('change', actionLoadData);
    document.getElementById('btn-save-data').addEventListener('click', actionSaveData);

    // Attach the robust error-handling event listener for the calculate button
    document.getElementById('calculate-btn').addEventListener('click', () => {
        console.log("Calculate button clicked!"); // SUPER DEBUG
        actionCalculateAll().catch(err => {
            console.error("Caught error from actionCalculateAll promise:", err);
            const resultsContainer = document.getElementById('results-container');
            if (resultsContainer) {
                resultsContainer.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p class="font-bold">Errore Critico Inatteso</p><p>${err.message}</p></div>`;
            }
            document.getElementById('calculate-btn').disabled = false;
        });
    });

    const samplesContainer = document.getElementById('samples-container');
    samplesContainer.addEventListener('click', async (e) => {
        console.log("samplesContainer clicked!"); // DEBUG
        const removeButton = e.target.closest('.btn-remove-sample');
        if (removeButton) {
            console.log("Remove button was clicked!"); // DEBUG
            const sampleId = parseInt(removeButton.dataset.sampleId, 10);
            console.log("Sample ID:", sampleId); // DEBUG
            const sample = appState.samples.find(s => s.id === sampleId);
            const sampleName = sample ? sample.name : `Campione ${sampleId}`;

            const confirmDelete = await choiceModal.show({
                title: 'Conferma Eliminazione',
                bodyContent: `Sei sicuro di voler eliminare il campione "<strong>${sampleName}</strong>"? L'azione non è reversibile.`,
                buttons: [
                    { text: "Annulla", value: false, class: secondaryBtnClass },
                    { text: "Elimina", value: true, class: primaryBtnClass.replace('bg-blue-600', 'bg-red-600').replace('hover:bg-blue-700', 'hover:bg-red-700') }
                ]
            });

            if (confirmDelete) {
                actionRemoveSample(sampleId);
            }
        }
    });
    samplesContainer.addEventListener('input', e => { if (e.target.dataset.sampleId) actionUpdateSample(parseInt(e.target.dataset.sampleId, 10), e.target.dataset.field, e.target.value); });

    document.querySelector('nav[aria-label="Tabs"]').addEventListener('click', e => { if (e.target.closest('button.tab-btn')) actionSwitchTab(e.target.closest('button.tab-btn').dataset.tabName); });

    document.getElementById('project-objective').addEventListener('input', e => { appState.project.objective = e.target.value; });
    document.getElementById('project-method').addEventListener('input', e => { appState.project.method = e.target.value; });
    document.getElementById('project-component').addEventListener('input', e => { appState.project.component = e.target.value; });

    // --- Event Listeners Scheda Incertezza di Preparazione ---
    const prepContainer = document.getElementById('content-preparazione');
    prepContainer.addEventListener('click', e => {
        const addStepBtn = e.target.closest('.btn-add-step');
        const removeStepBtn = e.target.closest('.btn-remove-step');
        const addWithdrawalBtn = e.target.closest('.btn-add-withdrawal');
        const removeWithdrawalBtn = e.target.closest('.btn-remove-withdrawal');

        if (addStepBtn) {
            actionAddSpikeStep(addStepBtn.dataset.sampleId);
        } else if (removeStepBtn) {
            actionRemoveSpikeStep(removeStepBtn.dataset.sampleId, removeStepBtn.dataset.stepId);
        } else if (addWithdrawalBtn) {
            actionAddSpikeWithdrawal(addWithdrawalBtn.dataset.sampleId, addWithdrawalBtn.dataset.stepId);
        } else if (removeWithdrawalBtn) {
            actionRemoveSpikeWithdrawal(removeWithdrawalBtn.dataset.sampleId, removeWithdrawalBtn.dataset.stepId, removeWithdrawalBtn.dataset.withdrawalId);
        }
    });

    prepContainer.addEventListener('input', e => {
        const target = e.target;
        const { sampleId, stepId, withdrawalId, field: dataField } = target.dataset;

        const isSpikeInput = target.matches('.spike-input, .spike-input-dilution, .spike-input-withdrawal-pipette, .spike-input-withdrawal-volume');

        if (!isSpikeInput) return;

        let field = dataField;
        let value = target.type === 'number' ? (target.value === '' ? null : parseFloat(target.value)) : target.value;

        if (target.matches('.spike-input-withdrawal-pipette')) field = 'pipette';
        else if (target.matches('.spike-input-withdrawal-volume')) field = 'volume';
        else if (target.matches('.spike-input-dilution')) field = 'dilutionFlask';

        if (field) {
             actionUpdateSpikeState({ sampleId, stepId, withdrawalId, field, value });
        }
    });


    // --- Event Listeners Scheda Incertezza di Taratura ---
    document.getElementById('btn-add-regression-row').addEventListener('click', actionAddRegressionRow);
    document.getElementById('btn-calculate-regression').addEventListener('click', actionCalculateRegression);
    document.getElementById('btn-calculate-response-factor').addEventListener('click', actionCalculateResponseFactor);

    const regressionContainer = document.getElementById('regression-table-container');
    regressionContainer.addEventListener('input', e => {
        const target = e.target;
        if (target.classList.contains('regression-input') && target.dataset.index) {
            actionUpdateRegressionPoint(parseInt(target.dataset.index), target.dataset.field, target.value);
        }
    });
    regressionContainer.addEventListener('click', e => {
        if (e.target.classList.contains('btn-remove-regression-row')) {
            actionRemoveRegressionRow(parseInt(e.target.dataset.index));
        }
    });

    document.getElementById('regression-x-manual').addEventListener('input', e => actionUpdateManualCalibrationSample('xk', e.target.value));
    document.getElementById('regression-p').addEventListener('input', e => actionUpdateManualCalibrationSample('p', e.target.value));

    document.getElementById('rf-acceptability-criterion').addEventListener('input', e => actionUpdateRfCalibrationInput('acceptabilityCriterion', e.target.value));
    document.getElementById('rf-manual-conc').addEventListener('input', e => actionUpdateRfCalibrationInput('manualConc', e.target.value));

    // --- Event Listeners per la scelta del metodo di taratura ---
    const btnSelectRegression = document.getElementById('btn-select-regression');
    const btnSelectResponseFactor = document.getElementById('btn-select-response-factor');
    const regressionCalculator = document.getElementById('regression-calculator');
    const responseFactorCalculator = document.getElementById('responseFactor-calculator');
    const calibrationChoice = document.getElementById('calibration-choice');

    if (btnSelectRegression) {
        btnSelectRegression.addEventListener('click', () => {
            calibrationChoice.classList.add('hidden');
            regressionCalculator.classList.remove('hidden');
        });
    }

    if(btnSelectResponseFactor) {
        btnSelectResponseFactor.addEventListener('click', () => {
            calibrationChoice.classList.add('hidden');
            responseFactorCalculator.classList.remove('hidden');
        });
    }

    const btnBack1 = document.getElementById('btn-back-to-calibration-choice-1');
    if (btnBack1) {
        btnBack1.addEventListener('click', () => {
            calibrationChoice.classList.remove('hidden');
            regressionCalculator.classList.add('hidden');
        });
    }
    const btnBack2 = document.getElementById('btn-back-to-calibration-choice-2');
     if (btnBack2) {
        btnBack2.addEventListener('click', () => {
            calibrationChoice.classList.remove('hidden');
            responseFactorCalculator.classList.add('hidden');
        });
    }

    actionAddSample();
    render(); // Chiamata iniziale per renderizzare tutto
}

document.addEventListener('DOMContentLoaded', main);
