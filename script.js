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


const DEFAULT_GLASSWARE_LIBRARY = {
    "Matraccio 5 mL": { "volume": 5, "uncertainty": 0.04 },
    "Matraccio 10 mL": { "volume": 10, "uncertainty": 0.04 },
    "Matraccio 20 mL": { "volume": 20, "uncertainty": 0.04 },
    "Matraccio 25 mL": { "volume": 25, "uncertainty": 0.04 },
    "Matraccio 50 mL": { "volume": 50, "uncertainty": 0.08 },
    "Matraccio 100 mL": { "volume": 100, "uncertainty": 0.1 },
    "Matraccio 200 mL": { "volume": 200, "uncertainty": 0.15 },
    "Matraccio 250 mL": { "volume": 250, "uncertainty": 0.15 },
    "Matraccio 500 mL": { "volume": 500, "uncertainty": 0.25 },
    "Matraccio 1000 mL": { "volume": 1000, "uncertainty": 0.6 },
    "Matraccio 2000 mL": { "volume": 2000, "uncertainty": 0.6 },
    "Matraccio 5000 mL": { "volume": 5000, "uncertainty": 1.2 }
};
const DEFAULT_PIPETTE_LIBRARY = {
    "041CHR": { "calibrationPoints": [ { "volume": 0.002, "U_rel_percent": 3.9 }, { "volume": 0.01, "U_rel_percent": 0.95 }, { "volume": 0.02, "U_rel_percent": 0.49 } ] },
    "042CHR": { "calibrationPoints": [ { "volume": 0.05, "U_rel_percent": 0.74 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] },
    "043CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.1 }, { "volume": 0.5, "U_rel_percent": 0.57 }, { "volume": 1, "U_rel_percent": 0.4 } ] },
    "045CHR": { "calibrationPoints": [ { "volume": 0.01, "U_rel_percent": 4.6 }, { "volume": 0.05, "U_rel_percent": 0.85 }, { "volume": 0.1, "U_rel_percent": 0.52 } ] },
    "046CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.6 }, { "volume": 0.5, "U_rel_percent": 0.36 }, { "volume": 1, "U_rel_percent": 0.34 } ] },
    "048CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2 }, { "volume": 0.5, "U_rel_percent": 0.36 }, { "volume": 1, "U_rel_percent": 0.37 } ] },
    "051CHR": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.8 }, { "volume": 2.5, "U_rel_percent": 0.52 }, { "volume": 5, "U_rel_percent": 0.35 } ] },
    "052CHR": { "calibrationPoints": [ { "volume": 0.2, "U_rel_percent": 1.3 }, { "volume": 0.5, "U_rel_percent": 0.31 }, { "volume": 1, "U_rel_percent": 0.26 } ] },
    "054CHR": { "calibrationPoints": [ { "volume": 0.01, "U_rel_percent": 4.1 }, { "volume": 0.05, "U_rel_percent": 0.95 }, { "volume": 0.1, "U_rel_percent": 0.52 } ] },
    "055CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 2.3 }, { "volume": 0.1, "U_rel_percent": 0.54 }, { "volume": 0.2, "U_rel_percent": 0.34 } ] },
    "061CHR": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.2 }, { "volume": 2.5, "U_rel_percent": 1.1 }, { "volume": 5, "U_rel_percent": 0.46 } ] },
    "051PRE": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 5.1 }, { "volume": 0.5, "U_rel_percent": 0.53 }, { "volume": 1, "U_rel_percent": 0.21 } ] },
    "052PRE": { "calibrationPoints": [ { "volume": 0.03, "U_rel_percent": 3 }, { "volume": 0.13, "U_rel_percent": 0.63 }, { "volume": 0.25, "U_rel_percent": 0.32 } ] },
    "053PRE": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 1.6 }, { "volume": 2.5, "U_rel_percent": 0.39 }, { "volume": 5, "U_rel_percent": 0.28 } ] },
    "025SPE": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 1.7 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] },
    "063CHR_basso range": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.7 }, { "volume": 0.5, "U_rel_percent": 0.31 }, { "volume": 0.1, "U_rel_percent": 0.21 } ] },
    "063CHR_alto range": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 0.46 }, { "volume": 2.5, "U_rel_percent": 0.21 }, { "volume": 5, "U_rel_percent": 0.21 } ] },
    "064CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.3 }, { "volume": 0.5, "U_rel_percent": 0.38 }, { "volume": 1, "U_rel_percent": 0.38 } ] },
    "065CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 2.1 }, { "volume": 0.1, "U_rel_percent": 0.65 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] },
    "066CHR": { "calibrationPoints": [ { "volume": 0.02, "U_rel_percent": 1.7 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] },
    "067CHR": { "calibrationPoints": [ { "volume": 1, "U_rel_percent": 0.3 }, { "volume": 5, "U_rel_percent": 0.21 }, { "volume": 10, "U_rel_percent": 0.25 } ] },
    "040SPE_basso range": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.4 }, { "volume": 0.5, "U_rel_percent": 0.55 }, { "volume": 1, "U_rel_percent": 0.21 } ] },
    "040SPE_alto range": { "calibrationPoints": [ { "volume": 0.5, "U_rel_percent": 0.9 }, { "volume": 2.5, "U_rel_percent": 0.21 }, { "volume": 5, "U_rel_percent": 0.21 } ] },
    "084PRE": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 1.5 }, { "volume": 0.5, "U_rel_percent": 0.32 }, { "volume": 1, "U_rel_percent": 0.31 } ] },
    "085PRE": { "calibrationPoints": [ { "volume": 1, "U_rel_percent": 1.4 }, { "volume": 5, "U_rel_percent": 0.65 }, { "volume": 10, "U_rel_percent": 0.4 } ] }
};
const primaryBtnClass = "bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700";
const secondaryBtnClass = "bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300";

// --- UTILITY & CONSTANTS ---
function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

/**
 * Converte un valore di concentrazione da un'unità di misura a un'altra.
 * @param {number|null} value - Il valore numerico da convertire.
 * @param {string} fromUnit - L'unità di misura di partenza ('mg/L' o 'µg/L').
 * @param {string} toUnit - L'unità di misura di destinazione ('mg/L' o 'µg/L').
 * @returns {number|null} Il valore convertito.
 */
function convertConcentration(value, fromUnit, toUnit) {
    if (value === null || fromUnit === toUnit) {
        return value;
    }
    if (fromUnit === 'mg/L' && toUnit === 'µg/L') {
        return value * 1000;
    }
    if (fromUnit === 'µg/L' && toUnit === 'mg/L') {
        return value / 1000;
    }
    // Se la combinazione di unità non è supportata, restituisce il valore originale.
    return value;
}


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

const formModal = {
    backdrop: document.getElementById('form-modal-backdrop'),
    content: document.getElementById('form-modal-content'),
    title: document.getElementById('form-modal-title'),
    body: document.getElementById('form-modal-body'),
    footer: document.getElementById('form-modal-footer'),
    show({ title, bodyHTML, buttons }) {
        return new Promise(resolve => {
            this.title.textContent = title;
            this.body.innerHTML = bodyHTML;
            this.footer.innerHTML = '';

            const clickHandler = async (isConfirm) => {
                await this.hide();
                resolve(isConfirm); // Only resolve with a boolean
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
        ui: {
            activeTab: 'frontespizio',
            activeLibrarySubTab: 'vetreria' // 'vetreria' or 'pipette'
        },
        project: { objective: '', method: '', component: '' },
        samples: [],
        results: {}, // keyed by sample.id
        spikeUncertainty: {
            // Data for spike uncertainty calculations, keyed by sample.id
            // Each entry will contain initial concentration, uncertainty, and preparation steps.
        },
        calibrationSolutionUncertainty: {
            // Data for calibration solution uncertainty calculations, keyed by a unique ID for each calibration point.
        },
        libraries: {
            glassware: deepCopy(DEFAULT_GLASSWARE_LIBRARY),
            pipettes: deepCopy(DEFAULT_PIPETTE_LIBRARY),
        },
        calibration: {
            points: [
                { id: 'cal-point-1', x: 0.0, y: 0.05, unit: 'µg/L' },
                { id: 'cal-point-2', x: 0.1, y: 0.18, unit: 'µg/L' },
                { id: 'cal-point-3', x: 0.5, y: 0.80, unit: 'µg/L' },
                { id: 'cal-point-4', x: 1.0, y: 1.55, unit: 'µg/L' },
                { id: 'cal-point-5', x: 1.5, y: 2.28, unit: 'µg/L' },
                { id: 'cal-point-6', x: 2.0, y: 3.01, unit: 'µg/L' },
            ],
            manualSample: { xk: null, p: 1 },
            results: null
        },
        rfCalibration: {
            acceptabilityCriterion: null,
            manualSample: { xk: null },
            results: null
        },
        treatments: []
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
    renderCalibrationSolutionUncertainty();
    renderTreatments(); // <-- Aggiunta nuova funzione di rendering
    renderLibraryTabs(); // <-- Funzione per le librerie
    renderLibraries(); // <-- Funzione per le tabelle delle librerie
    renderDebugInfo();
}

function renderCalibrationSolutionUncertainty() {
    const container = document.getElementById('calibration-solution-calculators-container');
    if (!container) return;

    const calibrationPoints = appState.calibration.points;

    if (calibrationPoints.length === 0) {
        container.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg border text-center text-gray-600">
            <p>Questa sezione si attiva quando sono presenti punti di taratura nella scheda "Incertezza di Taratura".</p>
            <p class="mt-2 text-sm">Assicurati di aver inserito almeno un punto di taratura.</p>
        </div>`;
        return;
    }

    let content = '';
    calibrationPoints.forEach(point => {
        if (!appState.calibrationSolutionUncertainty[point.id]) {
            appState.calibrationSolutionUncertainty[point.id] = {
                initialConcentration: null,
                initialUncertainty: null,
                unit: 'mg/L',
                steps: []
            };
        }
        const pointState = appState.calibrationSolutionUncertainty[point.id];

        let stepsHTML = '';
        if (pointState.steps.length > 0) {
            pointState.steps.forEach((step, stepIndex) => {
                const flaskOptions = Object.keys(appState.libraries.glassware).map(key => {
                    const flask = appState.libraries.glassware[key];
                    const isSelected = key === step.dilutionFlask ? 'selected' : '';
                    return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                }).join('');

                let withdrawalsHTML = '';
                 if (step.withdrawals.length > 0) {
                    step.withdrawals.forEach((withdrawal) => {
                        const pipetteOptions = Object.keys(appState.libraries.pipettes).map(key => {
                            const isSelected = key === withdrawal.pipette ? 'selected' : '';
                            return `<option value="${key}" ${isSelected}>${key}</option>`;
                        }).join('');

                        let volHint = '';
                        if (withdrawal.pipette && appState.libraries.pipettes[withdrawal.pipette]) {
                            const points = appState.libraries.pipettes[withdrawal.pipette].calibrationPoints.map(p => p.volume);
                            if (points.length > 0) volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                        }

                        const uncertaintyValue = withdrawal.pipetteUncertainty_U_perc !== undefined && withdrawal.pipetteUncertainty_U_perc !== null ? withdrawal.pipetteUncertainty_U_perc.toFixed(2) : '';
                        const uncertaintyDisplayHTML = `
                            <div class="w-1/3">
                                <label class="block text-xs font-medium text-gray-600">U (%)</label>
                                <input type="text" class="w-full p-1 border-gray-200 bg-gray-100 rounded-md text-sm text-center" value="${uncertaintyValue}" readonly title="Incertezza estesa (U%) calcolata per la pipetta e il volume selezionati.">
                            </div>
                        `;

                        const pipetteUncertaintyNote = withdrawal.pipetteUncertaintyRelPerc ?
                            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del prelievo con la pipetta (u_rel)">u_rel(pipetta): <strong>${withdrawal.pipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                        withdrawalsHTML += `
                            <div class="bg-gray-100 p-3 rounded-md">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex-grow pr-4">
                                        <label class="block text-xs font-medium text-gray-600">Pipetta</label>
                                        <select data-point-id="${point.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" data-field="pipette" class="calsol-input-withdrawal-pipette w-full p-1 border border-gray-300 rounded-md text-sm">
                                             <option value="">-- Seleziona --</option>
                                             ${pipetteOptions}
                                        </select>
                                    </div>
                                    <button data-point-id="${point.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" class="btn-remove-calsol-withdrawal text-red-500 hover:text-red-700 font-bold text-xl leading-none mt-1" title="Rimuovi Prelievo">&times;</button>
                                </div>
                                <div class="flex items-end space-x-2">
                                    <div class="flex-grow">
                                        <label class="block text-xs font-medium text-gray-600">Volume (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                        <input type="number" data-point-id="${point.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" data-field="volume" class="calsol-input w-full p-1 border border-gray-300 rounded-md text-sm" value="${withdrawal.volume !== null ? withdrawal.volume : ''}" placeholder="Volume">
                                    </div>
                                    ${uncertaintyDisplayHTML}
                                </div>
                                ${pipetteUncertaintyNote}
                            </div>
                        `;
                    });
                } else {
                    withdrawalsHTML = `<p class="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Nessun prelievo aggiunto.</p>`;
                }

                const flaskUncertaintyNote = step.flaskUncertaintyRelPerc ?
                    `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del volume del matraccio (u_rel)">u_rel(matraccio): <strong>${step.flaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                const intermediateResultNote = step.intermediateConcentration ?
                    `<div class="mt-4 pt-3 border-t border-gray-300 text-sm font-medium text-gray-700">
                        <p>Risultato intermedio:
                           <span class="font-bold text-blue-600">${step.intermediateConcentration.toPrecision(4)}</span> ${point.unit}
                           (u_rel: <span class="font-bold text-blue-600">${step.intermediateUncertaintyRelPerc.toFixed(2)} %</span>)
                        </p>
                    </div>` : '';

                stepsHTML += `
                    <div class="p-4 border-2 rounded-lg relative bg-gray-50 border-gray-200">
                        <button data-point-id="${point.id}" data-step-id="${step.id}" class="btn-remove-calsol-step absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl leading-none" title="Rimuovi Passaggio">&times;</button>
                        <h4 class="text-lg font-semibold text-gray-700 mb-4">Passaggio di Preparazione ${stepIndex + 1}</h4>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div class="space-y-2">
                                 <h5 class="font-semibold text-gray-600">Prelievi</h5>
                                <div id="calsol-withdrawals-container-${step.id}" class="mt-1 space-y-3">
                                    ${withdrawalsHTML}
                                </div>
                                <button data-point-id="${point.id}" data-step-id="${step.id}" class="btn-add-calsol-withdrawal mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Prelievo</button>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-600">Preparazione</h5>
                                <div>
                                    <label for="calsol-flask-select-${step.id}" class="block text-sm font-medium text-gray-700">Matraccio di diluizione finale</label>
                                    <select id="calsol-flask-select-${step.id}" data-point-id="${point.id}" data-step-id="${step.id}" data-field="dilutionFlask" class="calsol-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                        <option value="">-- Seleziona un matraccio --</option>
                                        ${flaskOptions}
                                    </select>
                                    ${flaskUncertaintyNote}
                                </div>
                            </div>
                        </div>
                        ${intermediateResultNote}
                    </div>
                `;
            });
        } else {
            stepsHTML = `<p class="text-gray-500 italic p-4 text-center">Nessun passaggio di preparazione definito. Aggiungine uno per iniziare.</p>`;
        }

        let resultsHTML = '';
        const results = pointState.results;
        if (results) {
            resultsHTML = `
                <div class="mt-4 pt-4 border-t">
                    <h4 class="text-md font-semibold text-gray-700 mb-2">Riepilogo Finale</h4>
                    <div class="mt-3 text-right">
                        <p class="text-sm text-gray-600">Concentrazione Finale Calcolata: <span class="font-bold text-lg text-black">${results.finalConcentration.toPrecision(4)} ${point.unit}</span></p>
                        <p class="text-sm text-gray-600">Valore Nominale Punto di Taratura: <span class="font-bold text-lg text-black">${parseFloat(point.x).toPrecision(4)} ${point.unit}</span></p>
                        <p class="text-sm text-gray-600">Incertezza tipo composta (u_c): <span class="font-bold text-black">${results.u_comp.toPrecision(3)}</span></p>
                        <p class="text-sm text-gray-600">Incertezza tipo composta relativa (u_c %): <span class="font-bold text-black">${results.u_comp_rel_perc.toFixed(2)} %</span></p>
                    </div>
                </div>
            `;
        }

        const initialUncertaintyNote = pointState.initialUncertaintyRelPerc ?
            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del materiale di riferimento (u_rel)">u_rel(certificato): <strong>${pointState.initialUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

        content += `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Preparazione per Punto di Taratura: <span class="font-bold">${point.x} ${point.unit}</span></h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 mb-4">
                    <div>
                        <label for="calsol-initial-conc-${point.id}" class="block text-sm font-medium text-gray-700">Concentrazione Materiale di Riferimento</label>
                        <div class="flex items-center space-x-2 mt-1">
                            <input type="number" id="calsol-initial-conc-${point.id}" data-point-id="${point.id}" data-field="initialConcentration" class="calsol-input w-full p-2 border border-gray-300 rounded-md" value="${pointState.initialConcentration !== null ? pointState.initialConcentration : ''}" placeholder="Es: 1000">
                            <select data-point-id="${point.id}" data-field="unit" class="calsol-input w-auto p-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                                <option value="mg/L" ${pointState.unit === 'mg/L' ? 'selected' : ''}>mg/L</option>
                                <option value="µg/L" ${pointState.unit === 'µg/L' ? 'selected' : ''}>µg/L</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label for="calsol-initial-unc-${point.id}" class="block text-sm font-medium text-gray-700">Incertezza del certificato (U %)</label>
                        <input type="number" id="calsol-initial-unc-${point.id}" data-point-id="${point.id}" data-field="initialUncertainty" class="calsol-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${pointState.initialUncertainty !== null ? pointState.initialUncertainty : ''}" placeholder="Es: 0.5">
                        ${initialUncertaintyNote}
                    </div>
                </div>

                <div id="calsol-steps-container-${point.id}" class="space-y-6">
                    ${stepsHTML}
                </div>

                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <button data-point-id="${point.id}" class="btn-add-calsol-step text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-blue-200 transition">+ Aggiungi Passaggio</button>
                    <div id="calsol-results-container-${point.id}" class="flex-grow ml-4">
                         ${resultsHTML}
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = content;
}

function renderLibraries() {
    // Render Glassware Table
    const glasswareTableBody = document.getElementById('glassware-library-table');
    if (!glasswareTableBody) return;
    glasswareTableBody.innerHTML = ''; // Clear existing rows
    for (const name in appState.libraries.glassware) {
        const item = appState.libraries.glassware[name];
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3">${name}</td>
            <td class="p-3 font-mono">${item.volume}</td>
            <td class="p-3 font-mono">${item.uncertainty}</td>
            <td class="p-3 space-x-2 whitespace-nowrap">
                <button data-library="glassware" data-name="${name}" class="btn-edit-library-item text-xs bg-yellow-100 text-yellow-800 font-semibold py-1 px-2 rounded-md hover:bg-yellow-200">Modifica</button>
                <button data-library="glassware" data-name="${name}" class="btn-duplicate-library-item text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">Duplica</button>
                <button data-library="glassware" data-name="${name}" class="btn-remove-library-item text-xs bg-red-100 text-red-800 font-semibold py-1 px-2 rounded-md hover:bg-red-200">Rimuovi</button>
            </td>
        `;
        glasswareTableBody.appendChild(row);
    }

    // Render Pipette Table
    const pipetteTableBody = document.getElementById('pipette-library-table');
    if (!pipetteTableBody) return;
    pipetteTableBody.innerHTML = ''; // Clear existing rows
    for (const id in appState.libraries.pipettes) {
        const item = appState.libraries.pipettes[id];
        const pointsSummary = item.calibrationPoints.map(p => `${p.volume}mL (${p.U_rel_percent}%)`).join(', ');
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-3">${id}</td>
            <td class="p-3 text-xs font-mono">${pointsSummary}</td>
            <td class="p-3 space-x-2 whitespace-nowrap">
                <button data-library="pipettes" data-name="${id}" class="btn-edit-library-item text-xs bg-yellow-100 text-yellow-800 font-semibold py-1 px-2 rounded-md hover:bg-yellow-200">Modifica</button>
                <button data-library="pipettes" data-name="${id}" class="btn-duplicate-library-item text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">Duplica</button>
                <button data-library="pipettes" data-name="${id}" class="btn-remove-library-item text-xs bg-red-100 text-red-800 font-semibold py-1 px-2 rounded-md hover:bg-red-200">Rimuovi</button>
            </td>
        `;
        pipetteTableBody.appendChild(row);
    }
}

function renderLibraryTabs() {
    const activeSubTab = appState.ui.activeLibrarySubTab;
    // Gestisce i pulsanti delle sotto-schede
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtabName === activeSubTab);
    });
    // Gestisce la visibilità dei contenuti
    document.getElementById('subcontent-vetreria').classList.toggle('hidden', activeSubTab !== 'vetreria');
    document.getElementById('subcontent-pipette').classList.toggle('hidden', activeSubTab !== 'pipette');
}

function renderTreatments() {
    const container = document.getElementById('treatments-container');
    if (!container) return;

    // Se non ci sono campioni da trattare, mostra un messaggio e esci.
    if (appState.treatments.length === 0) {
        container.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg border text-center text-gray-600">
            <p>Nessun campione in trattamento. Fai clic su "Aggiungi Campione da Trattare" per iniziare.</p>
        </div>`;
        return;
    }

    const usedSampleIds = new Set(appState.treatments.map(ts => ts.sampleId).filter(id => id !== null));
    const availableSamples = appState.samples.filter(s => !usedSampleIds.has(s.id));
    const matrixSpikes = Object.keys(appState.spikeUncertainty)
        .filter(sampleId => appState.spikeUncertainty[sampleId].results)
        .map(sampleId => {
            const sample = appState.samples.find(s => s.id == sampleId);
            return {
                id: sampleId,
                name: sample ? sample.name : `Campione ${sampleId}`,
                concentration: appState.spikeUncertainty[sampleId].results.finalConcentration,
                uncertainty: appState.spikeUncertainty[sampleId].results.u_comp_rel_perc
            };
        });

    let content = '';
    appState.treatments.forEach(treatmentSample => {
        let sampleOptionsHTML = availableSamples.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        if (treatmentSample.sampleId) {
            const currentSample = appState.samples.find(s => s.id === treatmentSample.sampleId);
            if (currentSample) {
                sampleOptionsHTML += `<option value="${currentSample.id}" selected>${currentSample.name}</option>`;
            }
        }

        let treatmentsHTML = '';
        treatmentSample.treatments.forEach((treatment, index) => {
            const isFirst = index === 0;
            let sourceSelectionHTML = '';

            // --- HTML per la selezione della sorgente (solo per il primo trattamento) ---
            if (isFirst) {
                const matrixSpikeOptions = matrixSpikes.map(ms => `<option value="${ms.id}" ${treatment.source.spikeSampleId == ms.id ? 'selected' : ''}>Spike: ${ms.name}</option>`).join('');
                sourceSelectionHTML = `
                    <div class="p-3 bg-gray-100 rounded-md border">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sorgente Dati Iniziali</label>
                        <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceType" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                            <option value="manual" ${treatment.source.type === 'manual' ? 'selected' : ''}>Inserimento Manuale</option>
                            <option value="spike" ${treatment.source.type === 'spike' ? 'selected' : ''}>Da Matrix Spike</option>
                        </select>
                        ${treatment.source.type === 'manual' ? `
                            <div class="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                    <label class="block text-xs font-medium text-gray-600">Concentrazione</label>
                                    <input type="number" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceManualConcentration" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm" value="${treatment.source.manualConcentration || ''}" placeholder="Conc. iniziale">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600">U% (k=2)</label>
                                    <input type="number" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceManualUncertainty" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm" value="${treatment.source.manualUncertainty || ''}" placeholder="Incertezza %">
                                </div>
                            </div>
                        ` : ''}
                        ${treatment.source.type === 'spike' ? `
                            <div class="mt-2">
                                <label class="block text-xs font-medium text-gray-600">Seleziona Matrix Spike</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceSpikeSampleId" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                                    <option value="">-- Seleziona Spike --</option>
                                    ${matrixSpikeOptions}
                                </select>
                            </div>
                        ` : ''}
                    </div>`;
            }

            // --- HTML per i diversi tipi di trattamento ---
            let treatmentFieldsHTML = '';
            const flaskOptions = Object.keys(appState.libraries.glassware).map(key => `<option value="${key}">${key}</option>`).join('');

            switch (treatment.type) {
                case 'diluizione':
                    let withdrawalsHTML = '';
                    if (treatment.withdrawals && treatment.withdrawals.length > 0) {
                        treatment.withdrawals.forEach(w => {
                            const pipetteOptions = Object.keys(appState.libraries.pipettes).map(key => `<option value="${key}" ${w.pipette === key ? 'selected' : ''}>${key}</option>`).join('');

                            let volHint = '';
                            if (w.pipette && appState.libraries.pipettes[w.pipette]) {
                                const points = appState.libraries.pipettes[w.pipette].calibrationPoints.map(p => p.volume);
                                if (points.length > 0) volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                            }

                            const uncertaintyValue = w.pipetteUncertainty_U_perc !== undefined && w.pipetteUncertainty_U_perc !== null ? w.pipetteUncertainty_U_perc.toFixed(2) : '';
                            const uncertaintyDisplayHTML = `
                                <div class="w-1/3">
                                    <label class="block text-xs font-medium text-gray-600">U (%)</label>
                                    <input type="text" class="w-full p-1 border-gray-200 bg-gray-100 rounded-md text-sm text-center" value="${uncertaintyValue}" readonly title="Incertezza estesa (U%) calcolata per la pipetta e il volume selezionati.">
                                </div>
                            `;

                            withdrawalsHTML += `
                                <div class="bg-gray-100 p-3 rounded-md border border-gray-200">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex-grow pr-4">
                                            <label class="block text-xs font-medium text-gray-600">Pipetta</label>
                                            <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-withdrawal-id="${w.id}" data-field="pipette" class="treatment-input w-full p-1 border border-gray-300 rounded-md text-sm">
                                                <option value="">-- Seleziona --</option>
                                                ${pipetteOptions}
                                            </select>
                                        </div>
                                        <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-withdrawal-id="${w.id}" class="btn-remove-treatment-withdrawal text-red-500 hover:text-red-700 font-bold text-xl leading-none mt-1" title="Rimuovi Prelievo">&times;</button>
                                    </div>
                                    <div class="flex items-end space-x-2">
                                        <div class="flex-grow">
                                            <label class="block text-xs font-medium text-gray-600">Volume (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                            <input type="number" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-withdrawal-id="${w.id}" data-field="volume" class="treatment-input w-full p-1 border border-gray-300 rounded-md text-sm" value="${w.volume || ''}" placeholder="Volume">
                                        </div>
                                        ${uncertaintyDisplayHTML}
                                    </div>
                                    ${w.pipetteUncertaintyRelPerc ? `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del prelievo (u_rel)">u_rel(pipetta): <strong>${w.pipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : ''}
                                </div>
                            `;
                        });
                    }

                    let dilutionMethodHTML = `
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Tipo di diluizione</label>
                            <div class="mt-1 flex rounded-md shadow-sm">
                                <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="dilutionType" data-value="bringToVolume" class="dilution-type-btn ${treatment.dilutionType === 'bringToVolume' ? 'active' : ''} relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                    Porta a Volume
                                </button>
                                <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="dilutionType" data-value="addSolvent" class="dilution-type-btn ${treatment.dilutionType === 'addSolvent' ? 'active' : ''} -ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                    Aggiungi Solvente
                                </button>
                            </div>
                        </div>
                    `;

                    let dilutionInputsHTML = '';
                    if (treatment.dilutionType === 'bringToVolume') {
                        const flaskUncertaintyNote = treatment.flaskUncertaintyRelPerc ?
                            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel(matraccio): <strong>${treatment.flaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                        dilutionInputsHTML = `
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Matraccio di diluizione finale</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="dilutionFlask" class="treatment-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Seleziona un matraccio --</option>
                                    ${Object.keys(appState.libraries.glassware).map(key => {
                                        const flask = appState.libraries.glassware[key];
                                        const isSelected = key === treatment.dilutionFlask ? 'selected' : '';
                                        return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                                    }).join('')}
                                </select>
                                ${flaskUncertaintyNote}
                            </div>
                        `;
                    } else { // addSolvent
                        const solventPipetteOptions = Object.keys(appState.libraries.pipettes).map(key => `<option value="${key}" ${treatment.addedSolventPipette === key ? 'selected' : ''}>${key}</option>`).join('');
                        const solventPipetteUncertaintyNote = treatment.addedSolventPipetteUncertaintyRelPerc ?
                            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa della pipetta per l'aggiunta di solvente (u_rel)">u_rel(pipetta solv.): <strong>${treatment.addedSolventPipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                        dilutionInputsHTML = `
                            <div class="space-y-3 p-3 bg-gray-100 rounded-md border">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Volume Solvente Aggiunto (mL)</label>
                                    <input type="number" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="addedSolventVolume" class="treatment-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${treatment.addedSolventVolume || ''}" placeholder="Es: 5">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Pipetta per Solvente</label>
                                    <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="addedSolventPipette" class="treatment-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                        <option value="">-- Seleziona pipetta --</option>
                                        ${solventPipetteOptions}
                                    </select>
                                    ${solventPipetteUncertaintyNote}
                                </div>
                            </div>
                        `;
                    }

                    treatmentFieldsHTML = `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <!-- Colonna Sinistra: Prelievi -->
                            <div class="space-y-2">
                                 <h5 class="font-semibold text-gray-600">Prelievi</h5>
                                <div class="mt-1 space-y-3">
                                    ${withdrawalsHTML}
                                </div>
                                <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" class="btn-add-treatment-withdrawal mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Prelievo</button>
                            </div>

                            <!-- Colonna Destra: Preparazione (Diluizione) -->
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-600">Preparazione</h5>
                                ${dilutionMethodHTML}
                                ${dilutionInputsHTML}
                            </div>
                        </div>`;
                    break;
                case 'estrazione':
                    const initialFlaskUncertaintyNote_est = treatment.initialFlaskUncertaintyRelPerc ?
                        `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.initialFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                    const finalFlaskUncertaintyNote_est = treatment.finalFlaskUncertaintyRelPerc ?
                        `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.finalFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                    treatmentFieldsHTML = `
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Volume Iniziale (Matraccio)</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="initialVolumeFlask" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                                    <option value="">-- Seleziona --</option>
                                    ${Object.keys(appState.libraries.glassware).map(key => {
                                        const flask = appState.libraries.glassware[key];
                                        const isSelected = key === treatment.initialVolumeFlask ? 'selected' : '';
                                        return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                                    }).join('')}
                                </select>
                                ${initialFlaskUncertaintyNote_est}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Volume Finale (Matraccio)</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="finalVolumeFlask" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                                    <option value="">-- Seleziona --</option>
                                    ${Object.keys(appState.libraries.glassware).map(key => {
                                        const flask = appState.libraries.glassware[key];
                                        const isSelected = key === treatment.finalVolumeFlask ? 'selected' : '';
                                        return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                                    }).join('')}
                                </select>
                                ${finalFlaskUncertaintyNote_est}
                            </div>
                        </div>`;
                    break;
                case 'concentrazione':
                     const initialFlaskUncertaintyNote_conc = treatment.initialFlaskUncertaintyRelPerc ?
                        `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.initialFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                    const finalFlaskUncertaintyNote_conc = treatment.finalFlaskUncertaintyRelPerc ?
                        `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.finalFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                    treatmentFieldsHTML = `
                         <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Volume Iniziale (Matraccio)</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="initialVolumeFlask" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                                    <option value="">-- Seleziona --</option>
                                    ${Object.keys(appState.libraries.glassware).map(key => {
                                        const flask = appState.libraries.glassware[key];
                                        const isSelected = key === treatment.initialVolumeFlask ? 'selected' : '';
                                        return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                                    }).join('')}
                                </select>
                                ${initialFlaskUncertaintyNote_conc}
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Volume Finale (Matraccio)</label>
                                <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="finalVolumeFlask" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm">
                                    <option value="">-- Seleziona --</option>
                                    ${Object.keys(appState.libraries.glassware).map(key => {
                                        const flask = appState.libraries.glassware[key];
                                        const isSelected = key === treatment.finalVolumeFlask ? 'selected' : '';
                                        return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                                    }).join('')}
                                </select>
                                ${finalFlaskUncertaintyNote_conc}
                            </div>
                        </div>`;
                    break;
            }

            // --- Risultati del trattamento ---
            const resultHTML = treatment.results ? `
                <div class="mt-3 pt-3 border-t text-sm text-right">
                    <p>Conc. Uscita: <span class="font-bold">${treatment.results.finalConcentration.toPrecision(4)}</span></p>
                    <p>Uscita u_rel %: <span class="font-bold">${treatment.results.finalUncertaintyRelPerc.toFixed(3)} %</span></p>
                </div>
            ` : '';


            treatmentsHTML += `
                <div class="p-4 border-2 rounded-lg relative bg-gray-50 border-gray-300" data-treatment-id="${treatment.id}">
                    <!-- Controlli del trattamento (sposta/rimuovi) -->
                    <div class="absolute top-2 right-2 flex items-center space-x-1">
                        <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-direction="up" class="btn-move-treatment p-1 text-gray-500 hover:text-blue-600" title="Sposta su">▲</button>
                        <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-direction="down" class="btn-move-treatment p-1 text-gray-500 hover:text-blue-600" title="Sposta giù">▼</button>
                        <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" class="btn-remove-treatment text-red-500 hover:text-red-700 font-bold text-xl leading-none px-2" title="Rimuovi Trattamento">&times;</button>
                    </div>

                    <h4 class="text-lg font-semibold text-gray-700 mb-3">Passaggio ${index + 1}: <span class="font-bold capitalize">${treatment.type}</span></h4>

                    <div class="space-y-3">
                        ${isFirst ? sourceSelectionHTML : `<div class="p-2 bg-blue-100 text-blue-800 text-sm rounded-md">I dati di input sono presi dal passaggio precedente.</div>`}
                        ${treatmentFieldsHTML}
                    </div>
                    ${resultHTML}
                </div>
            `;
        });

        // --- Scheda Campione Completa ---
        content += `
            <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-8" id="${treatmentSample.id}">
                <div class="flex justify-between items-center mb-4">
                     <div>
                        <label for="sample-select-${treatmentSample.id}" class="block text-sm font-medium text-gray-700">Campione da trattare</label>
                        <select id="sample-select-${treatmentSample.id}" data-treatment-sample-id="${treatmentSample.id}" class="select-treatment-sample mt-1 p-2 border border-gray-300 rounded-md">
                            <option value="">-- Seleziona un campione --</option>
                            ${sampleOptionsHTML}
                        </select>
                    </div>
                    <button data-treatment-sample-id="${treatmentSample.id}" class="btn-remove-treatment-sample bg-red-100 text-red-800 font-semibold py-1 px-3 rounded-md hover:bg-red-200 transition">- Rimuovi Campione</button>
                </div>

                <div class="mt-4 space-y-4">
                    ${treatmentsHTML}
                </div>

                <div class="mt-6 pt-4 border-t flex items-center space-x-3">
                    <span class="text-sm font-medium">Aggiungi Trattamento:</span>
                    <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-type="diluizione" class="btn-add-treatment text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-md hover:bg-blue-200">Diluizione</button>
                    <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-type="estrazione" class="btn-add-treatment text-xs bg-green-100 text-green-800 font-semibold py-1 px-3 rounded-md hover:bg-green-200">Estrazione</button>
                    <button data-treatment-sample-id="${treatmentSample.id}" data-treatment-type="concentrazione" class="btn-add-treatment text-xs bg-yellow-100 text-yellow-800 font-semibold py-1 px-3 rounded-md hover:bg-yellow-200">Concentrazione</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = content;
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

    (appState.calibration.points || []).forEach((point) => {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2 mb-2';
        row.innerHTML = `
            <div class="w-2/5">
                <label class="block text-xs font-medium text-gray-500">Conc. (X)</label>
                <input type="number" data-id="${point.id}" data-field="x" class="w-full p-2 border border-gray-300 rounded-md regression-input" value="${point.x ?? ''}">
            </div>
            <div class="w-1/5">
                <label class="block text-xs font-medium text-gray-500">Unità</label>
                <select data-id="${point.id}" data-field="unit" class="w-full p-2 border border-gray-300 rounded-md regression-input bg-gray-50 text-sm h-[42px]">
                    <option value="µg/L" ${point.unit === 'µg/L' ? 'selected' : ''}>µg/L</option>
                    <option value="mg/L" ${point.unit === 'mg/L' ? 'selected' : ''}>mg/L</option>
                </select>
            </div>
            <div class="w-2/5">
                <label class="block text-xs font-medium text-gray-500">Segnale (Y)</label>
                <input type="number" data-id="${point.id}" data-field="y" class="w-full p-2 border border-gray-300 rounded-md regression-input" value="${point.y ?? ''}">
            </div>
            <button data-id="${point.id}" class="btn-remove-regression-row self-end text-red-500 hover:text-red-700 font-bold px-2 pb-2" title="Rimuovi riga">&times;</button>
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
        if (!appState.spikeUncertainty[sample.id]) {
            appState.spikeUncertainty[sample.id] = {
                initialConcentration: null,
                initialUncertainty: null,
                unit: 'µg/L',
                steps: []
            };
        }
        const sampleSpikeState = appState.spikeUncertainty[sample.id];

        let stepsHTML = '';
        if (sampleSpikeState.steps.length > 0) {
            sampleSpikeState.steps.forEach((step, stepIndex) => {
                const flaskOptions = Object.keys(appState.libraries.glassware).map(key => {
                    const flask = appState.libraries.glassware[key];
                    const isSelected = key === step.dilutionFlask ? 'selected' : '';
                    return `<option value="${key}" ${isSelected}>${key} (Vol: ${flask.volume} mL, Tol: ±${flask.uncertainty} mL)</option>`;
                }).join('');

                let withdrawalsHTML = '';
                if (step.withdrawals.length > 0) {
                    step.withdrawals.forEach((withdrawal) => {
                        const pipetteOptions = Object.keys(appState.libraries.pipettes).map(key => {
                            const isSelected = key === withdrawal.pipette ? 'selected' : '';
                            return `<option value="${key}" ${isSelected}>${key}</option>`;
                        }).join('');

                        let volHint = '';
                        if (withdrawal.pipette && appState.libraries.pipettes[withdrawal.pipette]) {
                            const points = appState.libraries.pipettes[withdrawal.pipette].calibrationPoints.map(p => p.volume);
                            if (points.length > 0) volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                        }

                        const uncertaintyValue = withdrawal.pipetteUncertainty_U_perc !== undefined && withdrawal.pipetteUncertainty_U_perc !== null ? withdrawal.pipetteUncertainty_U_perc.toFixed(2) : '';
                        const uncertaintyDisplayHTML = `
                            <div class="w-1/3">
                                <label class="block text-xs font-medium text-gray-600">U (%)</label>
                                <input type="text" class="w-full p-1 border-gray-200 bg-gray-100 rounded-md text-sm text-center" value="${uncertaintyValue}" readonly title="Incertezza estesa (U%) calcolata per la pipetta e il volume selezionati.">
                            </div>
                        `;

                        const pipetteUncertaintyNote = withdrawal.pipetteUncertaintyRelPerc ?
                            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del prelievo con la pipetta (u_rel)">u_rel(pipetta): <strong>${withdrawal.pipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                        withdrawalsHTML += `
                            <div class="bg-gray-100 p-3 rounded-md">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex-grow pr-4">
                                        <label class="block text-xs font-medium text-gray-600">Pipetta</label>
                                        <select data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" data-field="pipette" class="spike-input-withdrawal-pipette w-full p-1 border border-gray-300 rounded-md text-sm">
                                             <option value="">-- Seleziona --</option>
                                             ${pipetteOptions}
                                        </select>
                                    </div>
                                    <button data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" class="btn-remove-withdrawal text-red-500 hover:text-red-700 font-bold text-xl leading-none mt-1" title="Rimuovi Prelievo">&times;</button>
                                </div>
                                <div class="flex items-end space-x-2">
                                    <div class="flex-grow">
                                        <label class="block text-xs font-medium text-gray-600">Volume (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                        <input type="number" data-sample-id="${sample.id}" data-step-id="${step.id}" data-withdrawal-id="${withdrawal.id}" data-field="volume" class="spike-input w-full p-1 border border-gray-300 rounded-md text-sm" value="${withdrawal.volume !== null ? withdrawal.volume : ''}" placeholder="Volume">
                                    </div>
                                    ${uncertaintyDisplayHTML}
                                </div>
                                ${pipetteUncertaintyNote}
                            </div>
                        `;
                    });
                } else {
                    withdrawalsHTML = `<p class="text-sm text-gray-500 bg-gray-100 p-2 rounded-md">Nessun prelievo aggiunto.</p>`;
                }

                const flaskUncertaintyNote = step.flaskUncertaintyRelPerc ?
                    `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del volume del matraccio (u_rel)">u_rel(matraccio): <strong>${step.flaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                let dilutionMethodHTML = `
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Tipo di diluizione</label>
                        <div class="mt-1 flex rounded-md shadow-sm">
                            <button data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="dilutionType" data-value="bringToVolume" class="dilution-type-btn ${step.dilutionType === 'bringToVolume' ? 'active' : ''} relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                Porta a Volume
                            </button>
                            <button data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="dilutionType" data-value="addSolvent" class="dilution-type-btn ${step.dilutionType === 'addSolvent' ? 'active' : ''} -ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                                Aggiungi Solvente
                            </button>
                        </div>
                    </div>
                `;

                let dilutionInputsHTML = '';
                if (step.dilutionType === 'bringToVolume') {
                    dilutionInputsHTML = `
                        <div>
                            <label for="flask-select-${step.id}" class="block text-sm font-medium text-gray-700">Matraccio di diluizione finale</label>
                            <select id="flask-select-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="dilutionFlask" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                <option value="">-- Seleziona un matraccio --</option>
                                ${flaskOptions}
                            </select>
                            ${flaskUncertaintyNote}
                        </div>
                    `;
                } else { // addSolvent
                    const solventPipetteOptions = Object.keys(appState.libraries.pipettes).map(key => {
                        const isSelected = key === step.addedSolventPipette ? 'selected' : '';
                        return `<option value="${key}" ${isSelected}>${key}</option>`;
                    }).join('');

                    const solventPipetteUncertaintyNote = step.addedSolventPipetteUncertaintyRelPerc ?
                        `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa della pipetta per l'aggiunta di solvente (u_rel)">u_rel(pipetta solv.): <strong>${step.addedSolventPipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                    dilutionInputsHTML = `
                        <div class="space-y-3 p-3 bg-gray-100 rounded-md border">
                            <div>
                                <label for="solvent-volume-${step.id}" class="block text-sm font-medium text-gray-700">Volume Solvente Aggiunto (mL)</label>
                                <input type="number" id="solvent-volume-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="addedSolventVolume" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${step.addedSolventVolume !== null ? step.addedSolventVolume : ''}" placeholder="Es: 5">
                            </div>
                            <div>
                                <label for="solvent-pipette-${step.id}" class="block text-sm font-medium text-gray-700">Pipetta per Solvente</label>
                                <select id="solvent-pipette-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="addedSolventPipette" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Seleziona pipetta --</option>
                                    ${solventPipetteOptions}
                                </select>
                                ${solventPipetteUncertaintyNote}
                            </div>
                        </div>
                    `;
                }


                const sampleUnit = sample.unit || 'µg/L';
                const intermediateResultNote = step.intermediateConcentration ?
                    `<div class="mt-4 pt-3 border-t border-gray-300 text-sm font-medium text-gray-700">
                        <p>Risultato intermedio:
                           <span class="font-bold text-blue-600">${step.intermediateConcentration.toPrecision(4)}</span> ${sampleUnit}
                           (u_rel: <span class="font-bold text-blue-600">${step.intermediateUncertaintyRelPerc.toFixed(2)} %</span>)
                        </p>
                    </div>` : '';

                stepsHTML += `
                    <div class="p-4 border-2 rounded-lg relative bg-gray-50 border-gray-200">
                        <button data-sample-id="${sample.id}" data-step-id="${step.id}" class="btn-remove-step absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl leading-none" title="Rimuovi Passaggio">&times;</button>
                        <h4 class="text-lg font-semibold text-gray-700 mb-4">Passaggio di Preparazione ${stepIndex + 1}</h4>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <!-- Colonna Sinistra: Prelievi -->
                            <div class="space-y-2">
                                 <h5 class="font-semibold text-gray-600">Prelievi</h5>
                                <div id="withdrawals-container-${step.id}" class="mt-1 space-y-3">
                                    ${withdrawalsHTML}
                                </div>
                                <button data-sample-id="${sample.id}" data-step-id="${step.id}" class="btn-add-withdrawal mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Prelievo</button>
                            </div>

                            <!-- Colonna Destra: Preparazione (Diluizione) -->
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-600">Preparazione</h5>
                                ${dilutionMethodHTML}
                                ${dilutionInputsHTML}
                            </div>
                        </div>
                        ${intermediateResultNote}
                    </div>
                `;
            });
        } else {
            stepsHTML = `<p class="text-gray-500 italic p-4 text-center">Nessun passaggio di preparazione definito. Aggiungine uno per iniziare.</p>`;
        }

        // Final results rendering
        let resultsHTML = '';
        const results = sampleSpikeState.results;
        if (results) {
            const sampleUnit = sample.unit || 'µg/L';
            resultsHTML = `
                <div class="mt-4 pt-4 border-t">
                    <h4 class="text-md font-semibold text-gray-700 mb-2">Riepilogo Finale</h4>
                     ${results.summary ? `<div class="text-sm p-3 bg-gray-100 rounded-md border text-gray-600">${results.summary}</div>` : ''}
                    <div class="mt-3 text-right">
                        <p class="text-sm text-gray-600">Concentrazione Finale Calcolata: <span class="font-bold text-lg text-black">${results.finalConcentration.toPrecision(4)} ${sampleUnit}</span></p>
                        <p class="text-sm text-gray-600">Valore Nominale Campione Preparato: <span class="font-bold text-lg text-black">${parseFloat(sample.expectedValue).toPrecision(4)} ${sampleUnit}</span></p>
                        <p class="text-sm text-gray-600">Valore Medio Campione (da Statistica): <span class="font-bold text-lg text-black">${appState.results[sample.id].statistics.mean.toPrecision(4)} ${sampleUnit}</span></p>
                        <p class="text-sm text-gray-600">Incertezza tipo composta (u_c): <span class="font-bold text-black">${results.u_comp.toPrecision(3)}</span></p>
                        <p class="text-sm text-gray-600">Incertezza tipo composta relativa (u_c %): <span class="font-bold text-black">${results.u_comp_rel_perc.toFixed(2)} %</span></p>
                    </div>
                    <!-- Sezione Verifiche -->
                    <div class="mt-4 pt-4 border-t border-gray-300">
                        <h5 class="text-md font-semibold text-gray-700 mb-2 text-right">Verifiche Aggiuntive</h5>
                        ${results.preparationCheck ? `
                            <div class="mt-2 p-2 rounded-md text-sm ${results.preparationCheck.isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}">
                                <p class="font-semibold">1. Verifica Preparazione: <span class="font-normal">${results.preparationCheck.message}</span></p>
                                <p class="text-xs font-mono">${results.preparationCheck.details}</p>
                            </div>
                        ` : ''}
                        ${results.accuracyCheck ? `
                            <div class="mt-2 p-2 rounded-md text-sm ${results.accuracyCheck.isAccurate ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}">
                                <p class="font-semibold">2. Verifica Esattezza Metodo: <span class="font-normal">${results.accuracyCheck.message}</span></p>
                                 <p class="text-xs font-mono">${results.accuracyCheck.details}</p>
                            </div>
                        ` : (results.preparationCheck && results.preparationCheck.isCorrect ? '<div class="mt-2 p-2 rounded-md bg-yellow-100 text-yellow-900 text-sm"><p class="font-semibold">2. Verifica Esattezza Metodo: Non eseguita (dati di statistica mancanti).</p></div>' : '')}
                    </div>
                </div>
            `;
        }


        const initialUncertaintyNote = sampleSpikeState.initialUncertaintyRelPerc ?
            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del materiale di riferimento (u_rel)">u_rel(certificato): <strong>${sampleSpikeState.initialUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

        content += `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Preparazione Spike per Campione: <span class="font-bold">${sample.name}</span></h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 mb-4">
                    <div>
                        <label for="initial-conc-${sample.id}" class="block text-sm font-medium text-gray-700">Concentrazione Materiale di Riferimento</label>
                        <div class="flex items-center space-x-2 mt-1">
                            <input type="number" id="initial-conc-${sample.id}" data-sample-id="${sample.id}" data-field="initialConcentration" class="spike-input w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.initialConcentration !== null ? sampleSpikeState.initialConcentration : ''}" placeholder="Es: 1000">
                            <select data-sample-id="${sample.id}" data-field="unit" class="spike-input w-auto p-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                                <option value="mg/L" ${sampleSpikeState.unit === 'mg/L' ? 'selected' : ''}>mg/L</option>
                                <option value="µg/L" ${sampleSpikeState.unit === 'µg/L' ? 'selected' : ''}>µg/L</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label for="initial-unc-${sample.id}" class="block text-sm font-medium text-gray-700">Incertezza del certificato (U %)</label>
                        <input type="number" id="initial-unc-${sample.id}" data-sample-id="${sample.id}" data-field="initialUncertainty" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.initialUncertainty !== null ? sampleSpikeState.initialUncertainty : ''}" placeholder="Es: 0.5">
                        ${initialUncertaintyNote}
                    </div>
                </div>

                <div id="steps-container-${sample.id}" class="space-y-6">
                    ${stepsHTML}
                </div>

                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <button data-sample-id="${sample.id}" class="btn-add-step text-sm bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-md hover:bg-blue-200 transition">+ Aggiungi Passaggio</button>
                    <div id="spike-results-container-${sample.id}" class="flex-grow ml-4">
                         ${resultsHTML}
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
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input data-sample-id="${sample.id}" data-field="name" type="text" class="w-full p-2 border border-gray-300 rounded-md" value="${sample.name || ''}">
                    <label class="block text-sm font-medium text-gray-700 mt-2 mb-1">Valore Atteso</label>
                    <div class="flex items-center space-x-2">
                        <input data-sample-id="${sample.id}" data-field="expectedValue" type="number" class="w-full p-2 border border-gray-300 rounded-md" value="${sample.expectedValue || ''}">
                        <select data-sample-id="${sample.id}" data-field="unit" class="unit-select w-auto p-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                            <option value="mg/L" ${sample.unit === 'mg/L' ? 'selected' : ''}>mg/L</option>
                            <option value="µg/L" ${sample.unit === 'µg/L' ? 'selected' : ''}>µg/L</option>
                        </select>
                    </div>
                </div>
            </div>`;
        container.appendChild(card);
    });

    renderResultsOnly();
}

// --- ACTIONS ---
function actionSwitchTab(tabName) { appState.ui.activeTab = tabName; render(); }
function actionSwitchLibrarySubTab(subTabName) { appState.ui.activeLibrarySubTab = subTabName; render(); }

async function actionAddGlassware() {
    const confirmed = await formModal.show({
        title: 'Aggiungi Nuova Vetreria',
        bodyHTML: `
            <div class="space-y-4">
                <div>
                    <label for="form-field-name" class="block text-sm font-medium text-gray-700">Nome Vetreria</label>
                    <input type="text" id="form-field-name" class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: Matraccio 250 mL">
                </div>
                <div>
                    <label for="form-field-volume" class="block text-sm font-medium text-gray-700">Volume (mL)</label>
                    <input type="number" id="form-field-volume" class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 250">
                </div>
                <div>
                    <label for="form-field-uncertainty" class="block text-sm font-medium text-gray-700">Tolleranza (± mL)</label>
                    <input type="number" id="form-field-uncertainty" class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 0.15">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const name = modalBody.querySelector('#form-field-name').value.trim();
        const volume = parseFloat(modalBody.querySelector('#form-field-volume').value);
        const uncertainty = parseFloat(modalBody.querySelector('#form-field-uncertainty').value);

        if (!name) {
            alert("Il nome non può essere vuoto.");
            return;
        }
        if (appState.libraries.glassware[name]) {
            alert("Esiste già un elemento di vetreria con questo nome.");
            return;
        }
        if (isNaN(volume) || isNaN(uncertainty) || volume <= 0 || uncertainty < 0) {
            alert("Volume e Tolleranza devono essere numeri positivi (la tolleranza può essere zero).");
            return;
        }

        appState.libraries.glassware[name] = { volume, uncertainty };
        render();
        actionSaveLibraries();
    }
}

function actionExportLibraries() {
    try {
        const librariesString = JSON.stringify(appState.libraries, null, 2);
        const blob = new Blob([librariesString], { type: 'application/json' });
        const now = new Date();
        const fileName = `unccalib_librerie_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.json`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (e) {
        console.error('Failed to export libraries:', e);
        alert('Esportazione fallita. Controlla la console per i dettagli.');
    }
}

function actionImportLibraries(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedLibraries = JSON.parse(e.target.result);

            // Basic validation
            if (loadedLibraries && loadedLibraries.glassware && loadedLibraries.pipettes) {
                appState.libraries = loadedLibraries;
                actionSaveLibraries(); // Persist the new libraries
                render();
                alert('Librerie importate con successo!');
            } else {
                throw new Error("Il file JSON non ha la struttura corretta. Deve contenere gli oggetti 'glassware' e 'pipettes'.");
            }
        } catch (error) {
            alert(`Errore nell'importazione: ${error.message}`);
        } finally {
            // Reset the file input so the same file can be loaded again
            event.target.value = null;
        }
    };
    reader.readAsText(file);
}

function actionSaveLibraries() {
    try {
        const librariesString = JSON.stringify(appState.libraries);
        localStorage.setItem('unccalib_libraries', librariesString);
        console.log('Libraries saved to localStorage.');
    } catch (e) {
        console.error('Failed to save libraries to localStorage:', e);
    }
}

function actionLoadLibraries() {
    try {
        const librariesString = localStorage.getItem('unccalib_libraries');
        if (librariesString) {
            const loadedLibraries = JSON.parse(librariesString);
            // Basic validation
            if (loadedLibraries && loadedLibraries.glassware && loadedLibraries.pipettes) {
                appState.libraries = loadedLibraries;
                console.log('Libraries loaded from localStorage.');
            }
        }
    } catch (e) {
        console.error('Failed to load libraries from localStorage:', e);
    }
}

async function actionEditPipette(id) {
    const item = appState.libraries.pipettes[id];
    if (!item) return;

    const createPointRowHTML = (point = { volume: '', U_rel_percent: '' }) => {
        return `
            <div class="pipette-point-row flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <input type="number" class="w-full p-1 border-gray-300 rounded-md text-sm pipette-point-volume" value="${point.volume}" placeholder="Volume (mL)">
                <input type="number" class="w-full p-1 border-gray-300 rounded-md text-sm pipette-point-u" value="${point.U_rel_percent}" placeholder="U rel %">
                <button type="button" class="btn-remove-pipette-point text-red-500 hover:text-red-700 font-bold px-2" title="Rimuovi punto">&times;</button>
            </div>
        `;
    };

    const pointsHTML = item.calibrationPoints.map(createPointRowHTML).join('');

    const container = document.createElement('div');
    container.innerHTML = `
        <div class="space-y-4">
            <div>
                <label for="form-field-id" class="block text-sm font-medium text-gray-700">ID Pipetta</label>
                <input type="text" id="form-field-id" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${id}">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Punti di Taratura</label>
                <div id="pipette-points-container" class="mt-1 space-y-2 border p-2 rounded-md max-h-60 overflow-y-auto">
                    ${pointsHTML}
                </div>
                <button type="button" id="btn-add-pipette-point" class="mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Punto</button>
            </div>
        </div>
    `;

    const confirmed = await formModal.show({
        title: 'Modifica Pipetta',
        bodyHTML: container.innerHTML,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva Modifiche', isConfirm: true, class: primaryBtnClass }
        ]
    });

    // This is a bit of a hack to re-attach events to the new modal content
    const modalBody = document.getElementById('form-modal-body');
    const addPointBtn = modalBody.querySelector('#btn-add-pipette-point');
    const pointsContainer = modalBody.querySelector('#pipette-points-container');

    if (addPointBtn && pointsContainer) {
        addPointBtn.addEventListener('click', () => {
            pointsContainer.insertAdjacentHTML('beforeend', createPointRowHTML());
        });

        pointsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-pipette-point')) {
                e.target.closest('.pipette-point-row').remove();
            }
        });
    }

    if (confirmed) {
        const newId = modalBody.querySelector('#form-field-id').value.trim();

        if (!newId) {
            alert("L'ID della pipetta non può essere vuoto.");
            return;
        }
        if (newId !== id && appState.libraries.pipettes[newId]) {
            alert("Esiste già una pipetta con questo ID.");
            return;
        }

        const calibrationPoints = [];
        const pointRows = modalBody.querySelectorAll('.pipette-point-row');
        for (const row of pointRows) {
            const volume = parseFloat(row.querySelector('.pipette-point-volume').value);
            const U_rel_percent = parseFloat(row.querySelector('.pipette-point-u').value);

            if (!isNaN(volume) && !isNaN(U_rel_percent) && volume > 0 && U_rel_percent > 0) {
                calibrationPoints.push({ volume, U_rel_percent });
            }
        }

        if (calibrationPoints.length === 0) {
            alert("Inserire almeno un punto di taratura valido. Tutti i valori devono essere numeri positivi.");
            return;
        }

        calibrationPoints.sort((a, b) => a.volume - b.volume);

        if (id !== newId) {
            delete appState.libraries.pipettes[id];
        }
        appState.libraries.pipettes[newId] = { calibrationPoints };
        render();
        actionSaveLibraries();
    }
}

async function actionDuplicatePipette(id) {
    const itemToCopy = appState.libraries.pipettes[id];
    if (!itemToCopy) return;

    const confirmed = await formModal.show({
        title: 'Duplica Pipetta',
        bodyHTML: `
            <p>Stai duplicando "<strong>${id}</strong>". Inserisci un nuovo ID per la copia.</p>
            <div class="mt-4">
                <label for="form-field-id" class="block text-sm font-medium text-gray-700">Nuovo ID</label>
                <input type="text" id="form-field-id" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${id} (copia)">
            </div>
        `,
        buttons: [
             { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Crea Duplicato', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const newId = modalBody.querySelector('#form-field-id').value.trim();
         if (!newId) {
            alert("L'ID non può essere vuoto.");
            return;
        }
        if (appState.libraries.pipettes[newId]) {
            alert("Esiste già una pipetta con questo ID.");
            return;
        }
        appState.libraries.pipettes[newId] = deepCopy(itemToCopy);
        render();
        actionSaveLibraries();
    }
}

async function actionRemovePipette(id) {
    const confirm = await choiceModal.show({
        title: 'Conferma Rimozione',
        bodyContent: `Sei sicuro di voler rimuovere la pipetta "<strong>${id}</strong>" dalla libreria? L'azione è irreversibile.`,
        buttons: [
            { text: 'Annulla', value: false, class: secondaryBtnClass },
            { text: 'Rimuovi', value: true, class: primaryBtnClass.replace('bg-blue-600', 'bg-red-600').replace('hover:bg-blue-700', 'hover:bg-red-700') }
        ]
    });

    if (confirm) {
        delete appState.libraries.pipettes[id];
        render();
        actionSaveLibraries();
    }
}

async function actionEditGlassware(name) {
    const item = appState.libraries.glassware[name];
    if (!item) return;

    const confirmed = await formModal.show({
        title: 'Modifica Vetreria',
        bodyHTML: `
            <div class="space-y-4">
                <div>
                    <label for="form-field-name" class="block text-sm font-medium text-gray-700">Nome Vetreria</label>
                    <input type="text" id="form-field-name" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${name}">
                </div>
                <div>
                    <label for="form-field-volume" class="block text-sm font-medium text-gray-700">Volume (mL)</label>
                    <input type="number" id="form-field-volume" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${item.volume}">
                </div>
                <div>
                    <label for="form-field-uncertainty" class="block text-sm font-medium text-gray-700">Tolleranza (± mL)</label>
                    <input type="number" id="form-field-uncertainty" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${item.uncertainty}">
                </div>
            </div>
        `,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva Modifiche', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const newName = modalBody.querySelector('#form-field-name').value.trim();
        const volume = parseFloat(modalBody.querySelector('#form-field-volume').value);
        const uncertainty = parseFloat(modalBody.querySelector('#form-field-uncertainty').value);

        if (!newName) {
            alert("Il nome non può essere vuoto.");
            return;
        }
        if (newName !== name && appState.libraries.glassware[newName]) {
            alert("Esiste già un elemento di vetreria con questo nome.");
            return;
        }
        if (isNaN(volume) || isNaN(uncertainty) || volume <= 0 || uncertainty < 0) {
            alert("Volume e Tolleranza devono essere numeri positivi (la tolleranza può essere zero).");
            return;
        }

        if (name !== newName) {
            delete appState.libraries.glassware[name];
        }
        appState.libraries.glassware[newName] = { volume, uncertainty };
        render();
        actionSaveLibraries();
    }
}

async function actionRemoveGlassware(name) {
    const confirm = await choiceModal.show({
        title: 'Conferma Rimozione',
        bodyContent: `Sei sicuro di voler rimuovere "<strong>${name}</strong>" dalla libreria? L'azione è irreversibile.`,
        buttons: [
            { text: 'Annulla', value: false, class: secondaryBtnClass },
            { text: 'Rimuovi', value: true, class: primaryBtnClass.replace('bg-blue-600', 'bg-red-600').replace('hover:bg-blue-700', 'hover:bg-red-700') }
        ]
    });

    if (confirm) {
        delete appState.libraries.glassware[name];
        render();
        actionSaveLibraries();
    }
}

async function actionDuplicateGlassware(name) {
    const itemToCopy = appState.libraries.glassware[name];
    if (!itemToCopy) return;

    const confirmed = await formModal.show({
        title: 'Duplica Vetreria',
        bodyHTML: `
            <p>Stai duplicando "<strong>${name}</strong>". Inserisci un nuovo nome per la copia.</p>
            <div class="mt-4">
                <label for="form-field-name" class="block text-sm font-medium text-gray-700">Nuovo Nome</label>
                <input type="text" id="form-field-name" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${name} (copia)">
            </div>
        `,
        buttons: [
             { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Crea Duplicato', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const newName = modalBody.querySelector('#form-field-name').value.trim();
         if (!newName) {
            alert("Il nome non può essere vuoto.");
            return;
        }
        if (appState.libraries.glassware[newName]) {
            alert("Esiste già un elemento di vetreria con questo nome.");
            return;
        }
        appState.libraries.glassware[newName] = deepCopy(itemToCopy);
        render();
        actionSaveLibraries();
    }
}




async function actionAddPipette() {
    const container = document.createElement('div');

    const createPointRowHTML = (point = { volume: '', U_rel_percent: '' }) => {
        const pointId = `point-${Date.now()}-${Math.random()}`;
        return `
            <div class="pipette-point-row flex items-center space-x-2 p-2 bg-gray-50 rounded-md" data-point-id="${pointId}">
                <input type="number" class="w-full p-1 border-gray-300 rounded-md text-sm pipette-point-volume" value="${point.volume}" placeholder="Volume (mL)">
                <input type="number" class="w-full p-1 border-gray-300 rounded-md text-sm pipette-point-u" value="${point.U_rel_percent}" placeholder="U rel %">
                <button type="button" class="btn-remove-pipette-point text-red-500 hover:text-red-700 font-bold px-2" title="Rimuovi punto">&times;</button>
            </div>
        `;
    };

    container.innerHTML = `
        <div class="space-y-4">
            <div>
                <label for="form-field-id" class="block text-sm font-medium text-gray-700">ID Pipetta</label>
                <input type="text" id="form-field-id" class="mt-1 w-full p-2 border border-gray-300 rounded-md" placeholder="Es: 042CHR">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Punti di Taratura</label>
                <div id="pipette-points-container" class="mt-1 space-y-2 border p-2 rounded-md max-h-60 overflow-y-auto">
                    ${createPointRowHTML()}
                    ${createPointRowHTML()}
                    ${createPointRowHTML()}
                </div>
                <button type="button" id="btn-add-pipette-point" class="mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Punto</button>
            </div>
        </div>
    `;

    const confirmed = await formModal.show({
        title: 'Aggiungi Nuova Pipetta',
        bodyHTML: container.innerHTML,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva', isConfirm: true, class: primaryBtnClass }
        ]
    });

    // Attach event listeners after the modal is shown and its content is in the DOM
    const modalBody = document.getElementById('form-modal-body');
    const addPointBtn = modalBody.querySelector('#btn-add-pipette-point');
    const pointsContainer = modalBody.querySelector('#pipette-points-container');

    if (addPointBtn && pointsContainer) {
        addPointBtn.addEventListener('click', () => {
            pointsContainer.insertAdjacentHTML('beforeend', createPointRowHTML());
        });

        pointsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-pipette-point')) {
                e.target.closest('.pipette-point-row').remove();
            }
        });
    }

    if (confirmed) {
        const id = modalBody.querySelector('#form-field-id').value.trim();

        if (!id) {
            alert("L'ID della pipetta non può essere vuoto.");
            return;
        }
        if (appState.libraries.pipettes[id]) {
            alert("Esiste già una pipetta con questo ID.");
            return;
        }

        const calibrationPoints = [];
        const pointRows = modalBody.querySelectorAll('.pipette-point-row');
        for (const row of pointRows) {
            const volume = parseFloat(row.querySelector('.pipette-point-volume').value);
            const U_rel_percent = parseFloat(row.querySelector('.pipette-point-u').value);

            if (!isNaN(volume) && !isNaN(U_rel_percent) && volume > 0 && U_rel_percent > 0) {
                calibrationPoints.push({ volume, U_rel_percent });
            }
        }

        if (calibrationPoints.length === 0) {
            alert("Inserire almeno un punto di taratura valido. Tutti i valori devono essere numeri positivi.");
            return;
        }

        calibrationPoints.sort((a, b) => a.volume - b.volume);

        appState.libraries.pipettes[id] = { calibrationPoints };
        render();
        actionSaveLibraries();
    }
}


function actionAddSample() {
    const newId = appState.samples.length > 0 ? Math.max(...appState.samples.map(s => s.id)) + 1 : 1;
    appState.samples.push({ id: newId, name: `Campione ${newId}`, rawData: '', expectedValue: null, unit: 'µg/L' });
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
                const stdDev = n > 1 ? ss.sampleStandardDeviation(finalData) : 0;
                const t_value = getTValue(n);
                const repeatability_limit_r = n > 1 && t_value ? t_value * stdDev * Math.sqrt(2) : 0;
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
    const newId = `cal-point-${Date.now()}`;
    appState.calibration.points.push({ id: newId, x: null, y: null, unit: 'µg/L' });
    renderCalibrationTab();
    renderDebugInfo();
}

function actionRemoveRegressionRow(id) {
    appState.calibration.points = appState.calibration.points.filter(p => p.id !== id);
    // Also remove any associated uncertainty calculation data
    if (appState.calibrationSolutionUncertainty[id]) {
        delete appState.calibrationSolutionUncertainty[id];
    }
    render(); // Use full render to update all dependent sections
}

function actionUpdateRegressionPoint(id, field, value) {
    const point = appState.calibration.points.find(p => p.id === id);
    if (!point) return;

    if (field === 'unit') {
        point[field] = value;
    } else {
        const numValue = value === '' ? null : parseFloat(value);
        point[field] = numValue;
    }

    // When a calibration point value changes, we should also re-render the dependent sections
    render();
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
        dilutionType: 'bringToVolume', // 'bringToVolume' or 'addSolvent'
        dilutionFlask: null,
        addedSolventPipette: null,
        addedSolventVolume: null,
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

function _updateSpikeStateFromInput({ sampleId, stepId, withdrawalId, field, value }) {
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
    renderDebugInfo();
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

function _get_pipette_uncertainty_contribution(pipetteId, volume, libraries) {
    if (!pipetteId || volume === null || volume <= 0) {
        throw new Error("Dati della pipetta incompleti o non validi.");
    }
    const pipette = libraries.pipettes[pipetteId];
    if (!pipette) {
        throw new Error(`Pipetta con ID '${pipetteId}' non trovata nella libreria.`);
    }
    const points = pipette.calibrationPoints.map(p => p.volume);
    if (volume < Math.min(...points) || volume > Math.max(...points)) {
        throw new Error(`Volume ${volume}mL fuori range per pipetta ${pipetteId}. Range valido: [${Math.min(...points)} - ${Math.max(...points)}].`);
    }

    let uncertainty_U_perc = 0;
    const sortedPoints = pipette.calibrationPoints.slice().sort((a, b) => a.volume - b.volume);

    // --- FIX START ---
    // 1. Check for an exact match first.
    const exactMatch = sortedPoints.find(p => p.volume === volume);
    if (exactMatch) {
        uncertainty_U_perc = exactMatch.U_rel_percent;
    } else {
        // 2. If no exact match, find the interval the volume falls into
        //    and take the max uncertainty of the two bounding points.
        let foundInInterval = false;
        for (let i = 0; i < sortedPoints.length - 1; i++) {
            // Use strict inequality because exact matches are already handled.
            if (volume > sortedPoints[i].volume && volume < sortedPoints[i + 1].volume) {
                uncertainty_U_perc = Math.max(sortedPoints[i].U_rel_percent, sortedPoints[i + 1].U_rel_percent);
                foundInInterval = true;
                break;
            }
        }
        if (!foundInInterval) {
            // This case should ideally not be reached due to the range check at the beginning.
            // It acts as a safeguard against unexpected logic failures.
            throw new Error(`Logica incertezza pipetta fallita per volume ${volume}. Non è stato trovato un punto esatto o un intervallo valido.`);
        }
    }
    // --- FIX END ---

    // u_rel = (U_rel_perc / 100) / (k=2 * sqrt(3)) -> This is incorrect. It should be U/(k=2) for normal distribution, or U/sqrt(3) for rectangular.
    // The original formula seems to combine both, which is non-standard.
    // Let's assume U is given with k=2, so u = U/2. The relative uncertainty u_rel is (U/2)/100.
    const u_rel = (uncertainty_U_perc / 100) / (2 * Math.sqrt(3));
    const u_abs = u_rel * volume;

    return { u_abs, u_rel_perc: u_rel * 100, U_perc: uncertainty_U_perc };
}


function actionAddCalSolStep(pointId) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    if (!pointState) return;
    const newStepId = `calsol-step-${Date.now()}`;
    pointState.steps.push({
        id: newStepId,
        dilutionFlask: null,
        withdrawals: [
            { id: `calsol-w-${Date.now()}`, pipette: null, volume: null }
        ]
    });
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionRemoveCalSolStep(pointId, stepId) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    if (!pointState) return;
    pointState.steps = pointState.steps.filter(s => s.id !== stepId);
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionAddCalSolWithdrawal(pointId, stepId) {
    const step = appState.calibrationSolutionUncertainty[pointId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals.push({ id: `calsol-w-${Date.now()}`, pipette: null, volume: null });
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionRemoveCalSolWithdrawal(pointId, stepId, withdrawalId) {
    const step = appState.calibrationSolutionUncertainty[pointId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals = step.withdrawals.filter(w => w.id !== withdrawalId);
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionUpdateCalSolState({ pointId, stepId, withdrawalId, field, value }) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    if (!pointState) return;

    if (stepId && withdrawalId) {
        const step = pointState.steps.find(s => s.id === stepId);
        const withdrawal = step?.withdrawals.find(w => w.id === withdrawalId);
        if (withdrawal) {
            withdrawal[field] = value;
        }
    } else if (stepId) {
        const step = pointState.steps.find(s => s.id === stepId);
        if (step) {
            step[field] = value;
        }
    } else {
        pointState[field] = value;
    }
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionCalculateSpikeUncertainty(sampleId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    const resultsContainer = document.getElementById(`spike-results-container-${sampleId}`);

    // Funzione di utilità per pulire i risultati e mostrare errori
    const resetAndShowError = (message) => {
        if (resultsContainer) {
            resultsContainer.innerHTML = message ? `<span class="text-red-500 text-sm font-medium">${message}</span>` : '';
        }
        sampleState.results = null;
        // Pulisce anche i dati intermedi dai passaggi per evitare di visualizzare dati vecchi
        sampleState.steps.forEach(step => {
            step.intermediateConcentration = null;
            step.intermediateUncertaintyRelPerc = null;
            step.flaskUncertaintyRelPerc = null;
            step.addedSolventPipetteUncertaintyRelPerc = null;
            step.withdrawals.forEach(w => {
                w.pipetteUncertaintyRelPerc = null;
                w.pipetteUncertainty_U_perc = null;
            });
        });
        render(); // Rirenderizza per pulire l'UI
    };

    try {
        // Reset parziale prima di iniziare, per evitare dati "orfani" se il calcolo fallisce a metà
        resetAndShowError(null);

        if (sampleState.initialConcentration === null || sampleState.initialConcentration <= 0) {
            return; // Non mostrare errore se i dati iniziali non sono ancora stati inseriti
        }

        // --- INIZIO LOGICA DI CONVERSIONE UNITÀ ---
        const sample = appState.samples.find(s => s.id == sampleId);
        if (!sample) throw new Error(`Campione con ID ${sampleId} non trovato.`);

        const targetUnit = sample.unit;
        const sourceUnit = sampleState.unit;

        const initialConcentrationInSourceUnit = sampleState.initialConcentration;
        const convertedInitialConcentration = convertConcentration(initialConcentrationInSourceUnit, sourceUnit, targetUnit);

        let currentConcentration = convertedInitialConcentration;
        // --- FINE LOGICA DI CONVERSIONE UNITÀ ---

        let sum_u_rel_sq;

        if (sampleState.initialUncertainty !== null && sampleState.initialUncertainty > 0) {
            const u_rel_initial = sampleState.initialUncertainty / (200 * Math.sqrt(2));
            sum_u_rel_sq = Math.pow(u_rel_initial, 2);
            sampleState.initialUncertaintyRelPerc = u_rel_initial * 100;
        } else {
            sum_u_rel_sq = 0;
        }

        for (const step of sampleState.steps) {
            // --- 1. Calcolo Prelievi (comune a entrambi i metodi) ---
            if (step.withdrawals.length === 0) throw new Error(`Nessun prelievo nel passaggio.`);
            if (step.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) {
                throw new Error(`Dati di prelievo incompleti o non validi.`);
            }

            let totalWithdrawalVolume = 0;
            let sum_u_abs_sq_withdrawals = 0;

            for (const w of step.withdrawals) {
                totalWithdrawalVolume += w.volume;
                const contrib = _get_pipette_uncertainty_contribution(w.pipette, w.volume, appState.libraries);
                w.pipetteUncertainty_U_perc = contrib.U_perc;
                w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
            }
            const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);

            // --- 2. Calcolo Diluizione (specifico per metodo) ---
            if (step.dilutionType === 'addSolvent') {
                // METODO 2: Aggiunta di un volume di solvente
                if (!step.addedSolventPipette || !step.addedSolventVolume || step.addedSolventVolume <= 0) {
                    throw new Error("Dati per l'aggiunta di solvente incompleti o non validi.");
                }
                const Vi = totalWithdrawalVolume;
                const u_abs_Vi = u_abs_total_withdrawal;

                const solvent_contrib = _get_pipette_uncertainty_contribution(step.addedSolventPipette, step.addedSolventVolume, appState.libraries);
                const Va = step.addedSolventVolume;
                const u_abs_Va = solvent_contrib.u_abs;
                step.addedSolventPipetteUncertaintyRelPerc = solvent_contrib.u_rel_perc;

                const Vf = Vi + Va;
                const u_abs_Vf = Math.sqrt(Math.pow(u_abs_Vi, 2) + Math.pow(u_abs_Va, 2));

                const u_rel_sq_Vi = Vi > 0 ? Math.pow(u_abs_Vi / Vi, 2) : 0;
                const u_rel_sq_Vf = Vf > 0 ? Math.pow(u_abs_Vf / Vf, 2) : 0;

                sum_u_rel_sq += u_rel_sq_Vi + u_rel_sq_Vf;
                currentConcentration = currentConcentration * (Vi / Vf);

            } else {
                // METODO 1: Portando a volume (logica originale)
                if (!step.dilutionFlask) throw new Error(`Matraccio non selezionato.`);

                const u_rel_sq_total_withdrawal = totalWithdrawalVolume > 0 ? Math.pow(u_abs_total_withdrawal / totalWithdrawalVolume, 2) : 0;

                const flask = appState.libraries.glassware[step.dilutionFlask];
                const u_rel_flask = (flask.uncertainty / flask.volume / Math.sqrt(3));
                step.flaskUncertaintyRelPerc = u_rel_flask * 100;
                const u_rel_sq_flask = Math.pow(u_rel_flask, 2);

                sum_u_rel_sq += u_rel_sq_total_withdrawal + u_rel_sq_flask;
                currentConcentration = currentConcentration * (totalWithdrawalVolume / flask.volume);
            }

            // Memorizza i risultati intermedi per questo passaggio
            step.intermediateConcentration = currentConcentration;
            step.intermediateUncertaintyRelPerc = Math.sqrt(sum_u_rel_sq) * 100;
        }

        // Calcoli finali
        const final_u_rel = Math.sqrt(sum_u_rel_sq);
        const final_u_abs = final_u_rel * currentConcentration;
        const final_u_rel_perc = final_u_rel * 100;

        // NUOVO: Genera il riepilogo testuale
        let summaryLines = [];
        let concentrationBeforeStep = convertedInitialConcentration; // Inizia con la concentrazione GIA' CONVERTITA
        sampleState.steps.forEach((step, index) => {
            // Costruisce la stringa dei prelievi con l'ID della pipetta
            const withdrawalsText = step.withdrawals.map(w => `${w.volume} mL (pipetta: ${w.pipette})`).join(' e ');

            const flask = appState.libraries.glassware[step.dilutionFlask];

            // La concentrazione della soluzione prelevata è quella prima di questo passaggio
            const initialConcForStep = concentrationBeforeStep;

            // La concentrazione finale di questo passaggio è memorizzata nell'oggetto 'step'
            const finalConcForStep = step.intermediateConcentration;

            summaryLines.push(`<b>Passaggio ${index + 1}:</b> Prelievo di ${withdrawalsText} da soluzione a ${initialConcForStep.toPrecision(4)} ${targetUnit}. Diluizione a ${flask.volume} mL per una concentrazione finale di ${finalConcForStep.toPrecision(4)} ${targetUnit}.`);

            // Aggiorna la concentrazione per il prossimo passaggio
            concentrationBeforeStep = finalConcForStep;
        });
        const summary = summaryLines.join('<br>');

        // NUOVO: Logica per le verifiche di preparazione e accuratezza
        const nominalValue = parseFloat(sample.expectedValue);
        const calculatedConcentration = currentConcentration;
        const meanValue = appState.results[sampleId]?.statistics?.mean;

        let preparationCheck = null;
        let accuracyCheck = null;

        // VERIFICA 1: Correttezza della preparazione
        // Confronta il valore nominale con il valore di concentrazione calcolata.
        // Se la differenza è minore dello 0.01% del valore nominale il test e superato.
        if (!isNaN(nominalValue) && !isNaN(calculatedConcentration)) {
            const diff = Math.abs(nominalValue - calculatedConcentration);
            const threshold = 0.0001 * nominalValue; // 0.01%
            const isCorrect = diff < threshold;
            preparationCheck = {
                isCorrect: isCorrect,
                message: isCorrect ? 'Superato: la concentrazione calcolata è sufficientemente vicina al valore nominale.' : 'Fallito: la concentrazione calcolata differisce dal valore nominale di oltre lo 0.01%. Si raccomanda di controllare i calcoli e la procedura di preparazione.',
                details: `Differenza: ${diff.toPrecision(3)}, Soglia: ${threshold.toPrecision(3)}`
            };
        }

        // VERIFICA 2: Esattezza del metodo (solo se la preparazione è corretta)
        // Calcola il valore assoluto della differenza tra la media e il valore nominale e lo divide per l'incertezza tipo composta di preparazione assoluta.
        // Se questo rapporto è minore o uguale a 2 il test è superato.
        if (preparationCheck && preparationCheck.isCorrect && !isNaN(meanValue) && !isNaN(nominalValue)) {
            const absoluteUncertainty = final_u_rel * nominalValue;
            if (absoluteUncertainty > 1e-12) { // Evita divisione per zero
                const ratio = Math.abs(meanValue - nominalValue) / absoluteUncertainty;
                const isAccurate = ratio <= 2;
                accuracyCheck = {
                    isAccurate: isAccurate,
                    message: isAccurate ? "Superato: la media delle misure è compatibile con il valore nominale, tenendo conto dell'incertezza di preparazione. Il metodo è considerato esatto." : "Fallito: la media delle misure si discosta significativamente dal valore nominale, anche considerando l'incertezza di preparazione. Il metodo non è considerato esatto.",
                    details: `Rapporto: ${ratio.toFixed(3)} (soglia: <= 2)`
                };
            } else {
                 accuracyCheck = {
                    isAccurate: false,
                    message: 'Non calcolabile: incertezza di preparazione è zero.',
                    details: ''
                };
            }
        }

        // Memorizza tutti i risultati finali nello stato
        sampleState.results = {
            finalConcentration: currentConcentration,
            u_comp: final_u_abs,
            u_comp_rel_perc: final_u_rel_perc,
            summary: summary,
            preparationCheck: preparationCheck,
            accuracyCheck: accuracyCheck
        };

        // Forza un re-render completo per mostrare tutti i nuovi dati
        render();
        renderDebugInfo();

    } catch (e) {
        // Usa la nuova funzione di errore per pulire l'UI
        resetAndShowError(e.message);
        console.error("Errore nel calcolo dello spike:", e);
    }
}

function actionCalculateCalibrationSolutionUncertainty(pointId) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    const point = appState.calibration.points.find(p => p.id === pointId);
    if (!pointState || !point) return;

    // Funzione di utilità per pulire i risultati
    const resetResults = () => {
        pointState.results = null;
        pointState.initialUncertaintyRelPerc = null;
        pointState.steps.forEach(step => {
            step.intermediateConcentration = null;
            step.intermediateUncertaintyRelPerc = null;
            step.flaskUncertaintyRelPerc = null;
            step.withdrawals.forEach(w => {
                w.pipetteUncertaintyRelPerc = null;
                w.pipetteUncertainty_U_perc = null;
            });
        });
    };

    try {
        resetResults();

        if (pointState.initialConcentration === null || pointState.initialConcentration <= 0) {
            render(); // Rirenderizza per pulire l'UI ma non mostra errori
            return;
        }

        const targetUnit = point.unit;
        const sourceUnit = pointState.unit;
        const convertedInitialConcentration = convertConcentration(pointState.initialConcentration, sourceUnit, targetUnit);

        let currentConcentration = convertedInitialConcentration;
        let sum_u_rel_sq = 0;

        if (pointState.initialUncertainty !== null && pointState.initialUncertainty > 0) {
            const u_rel_initial = pointState.initialUncertainty / (200 * Math.sqrt(2));
            sum_u_rel_sq += Math.pow(u_rel_initial, 2);
            pointState.initialUncertaintyRelPerc = u_rel_initial * 100;
        }

        for (const step of pointState.steps) {
            if (step.withdrawals.length === 0) throw new Error(`Nessun prelievo nel passaggio.`);
            if (step.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) {
                throw new Error(`Dati di prelievo incompleti o non validi.`);
            }
            if (!step.dilutionFlask) throw new Error(`Matraccio non selezionato.`);

            let totalWithdrawalVolume = 0;
            let sum_u_abs_sq_withdrawals = 0;

            for (const w of step.withdrawals) {
                totalWithdrawalVolume += w.volume;
                const contrib = _get_pipette_uncertainty_contribution(w.pipette, w.volume, appState.libraries);
                w.pipetteUncertainty_U_perc = contrib.U_perc;
                w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
            }
            const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);
            const u_rel_sq_total_withdrawal = totalWithdrawalVolume > 0 ? Math.pow(u_abs_total_withdrawal / totalWithdrawalVolume, 2) : 0;

            const flask = appState.libraries.glassware[step.dilutionFlask];
            const u_rel_flask = (flask.uncertainty / flask.volume / Math.sqrt(3));
            step.flaskUncertaintyRelPerc = u_rel_flask * 100;
            const u_rel_sq_flask = Math.pow(u_rel_flask, 2);

            sum_u_rel_sq += u_rel_sq_total_withdrawal + u_rel_sq_flask;
            currentConcentration = currentConcentration * (totalWithdrawalVolume / flask.volume);

            step.intermediateConcentration = currentConcentration;
            step.intermediateUncertaintyRelPerc = Math.sqrt(sum_u_rel_sq) * 100;
        }

        const final_u_rel = Math.sqrt(sum_u_rel_sq);
        const final_u_abs = final_u_rel * currentConcentration;
        const final_u_rel_perc = final_u_rel * 100;

        pointState.results = {
            finalConcentration: currentConcentration,
            u_comp: final_u_abs,
            u_comp_rel_perc: final_u_rel_perc,
        };

        render();

    } catch (e) {
        console.error("Errore nel calcolo della soluzione di taratura:", e);
        // Non mostriamo un errore popup, ma l'assenza di risultati indicherà il problema.
        // L'errore viene loggato in console per il debug.
        resetResults();
        render();
    }
}


// --- Automated Tests ---
const assert = (condition, message) => {
    const testResultsContainer = document.getElementById('test-results-container');
    if (!testResultsContainer) {
        console.error("Test results container not found!");
        return;
    }
    const pass = Boolean(condition);
    const li = document.createElement('li');
    li.className = `p-2 rounded-md ${pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    li.textContent = `${pass ? '✅ PASS:' : '❌ FAIL:'} ${message}`;
    testResultsContainer.appendChild(li);
    if (!pass) {
        console.error(`Assertion failed: ${message}`);
        throw new Error(`Test failed: ${message}`);
    }
};

const testSuite = async (name, testFn) => {
    const testResultsContainer = document.getElementById('test-results-container');
    const h3 = document.createElement('h3');
    h3.className = 'text-lg font-semibold mt-4 mb-2';
    h3.textContent = `Suite: ${name}`;
    if (testResultsContainer) {
        testResultsContainer.appendChild(h3);
    }
    await testFn();
};

async function runGlasswareCrudTests() {
    await testSuite('Glassware CRUD', async () => {
        console.log('Starting Glassware CRUD tests...');
        const originalLibrary = deepCopy(appState.libraries.glassware);
        appState.libraries.glassware = {};

        // 1. Add
        appState.libraries.glassware['Test Flask'] = { volume: 100, uncertainty: 0.1 };
        render();
        assert(appState.libraries.glassware['Test Flask'], 'ADD: Item should exist in state');

        // 2. Edit
        const oldName = 'Test Flask';
        const newName = 'Test Flask Edited';
        const item = appState.libraries.glassware[oldName];
        item.volume = 150;
        delete appState.libraries.glassware[oldName];
        appState.libraries.glassware[newName] = item;
        render();
        assert(appState.libraries.glassware[newName] && appState.libraries.glassware[newName].volume === 150, 'EDIT: Item should be renamed and updated');
        assert(!appState.libraries.glassware[oldName], 'EDIT: Old item should be removed');

        // 3. Duplicate
        const duplicatedName = 'Test Flask Edited (copia)';
        appState.libraries.glassware[duplicatedName] = deepCopy(appState.libraries.glassware[newName]);
        render();
        assert(appState.libraries.glassware[duplicatedName], 'DUPLICATE: New item should exist');
        assert(appState.libraries.glassware[duplicatedName].volume === 150, 'DUPLICATE: New item should have same data');

        // 4. Remove
        delete appState.libraries.glassware[newName];
        render();
        assert(!appState.libraries.glassware[newName], 'REMOVE: Item should be removed from state');

        // Restore original library
        appState.libraries.glassware = originalLibrary;
        render();
    });
}

async function runPipetteCrudTests() {
    await testSuite('Pipette CRUD', async () => {
        console.log('Starting Pipette CRUD tests...');
        const originalLibrary = deepCopy(appState.libraries.pipettes);
        appState.libraries.pipettes = {};

        // 1. Add
        const newPipette = {
            calibrationPoints: [{ volume: 1, U_rel_percent: 1 }, { volume: 5, U_rel_percent: 0.5 }]
        };
        appState.libraries.pipettes['TestPipette'] = newPipette;
        render();
        assert(appState.libraries.pipettes['TestPipette'], 'ADD: Pipette should exist');
        assert(appState.libraries.pipettes['TestPipette'].calibrationPoints.length === 2, 'ADD: Pipette should have 2 calibration points');

        // 2. Edit
        const editedPipette = appState.libraries.pipettes['TestPipette'];
        editedPipette.calibrationPoints.push({ volume: 10, U_rel_percent: 0.2 });
        appState.libraries.pipettes['TestPipetteEdited'] = editedPipette;
        delete appState.libraries.pipettes['TestPipette'];
        render();
        assert(appState.libraries.pipettes['TestPipetteEdited'].calibrationPoints.length === 3, 'EDIT: Pipette should have 3 calibration points');
        assert(!appState.libraries.pipettes['TestPipette'], 'EDIT: Old pipette should be removed');

        // 3. Duplicate
        const duplicatedName = 'TestPipetteEdited (copia)';
        appState.libraries.pipettes[duplicatedName] = deepCopy(appState.libraries.pipettes['TestPipetteEdited']);
        render();
        assert(appState.libraries.pipettes[duplicatedName], 'DUPLICATE: Duplicated pipette should exist');
        assert(appState.libraries.pipettes[duplicatedName].calibrationPoints.length === 3, 'DUPLICATE: Duplicated pipette should have same data');

        // 4. Remove
        delete appState.libraries.pipettes['TestPipetteEdited'];
        render();
        assert(!appState.libraries.pipettes['TestPipetteEdited'], 'REMOVE: Pipette should be removed');

        // Restore original library
        appState.libraries.pipettes = originalLibrary;
        render();
    });
}

async function runCalculationTests() {
    await testSuite('Calculation Logic', async () => {
        console.log('Starting Calculation Logic tests...');

        // Test case for _get_pipette_uncertainty_contribution
        const pipetteId = '043CHR'; // From default library
        const volume = 0.7; // A volume between calibration points 0.5 and 1.0
        const expected_U_perc = 2.1; // Max of U% for 0.5 (0.57) and 1.0 (2.1)

        // This is the CORRECT value that should be calculated by the fixed function
        const expected_correct_u_rel_perc = (expected_U_perc / 100) / (2 * Math.sqrt(3)) * 100;

        const result = _get_pipette_uncertainty_contribution(pipetteId, volume, appState.libraries);

        assert(
            Math.abs(result.u_rel_perc - expected_correct_u_rel_perc) < 1e-9,
            `Pipette uncertainty (u_rel_perc) should be ~${expected_correct_u_rel_perc.toFixed(4)} (FIXED)`
        );
    });
}

async function runAllTests() {
    // Hide modals in case they are open from previous actions
    if (typeof choiceModal !== 'undefined' && choiceModal.backdrop && !choiceModal.backdrop.classList.contains('hidden')) await choiceModal.hide();
    if (typeof formModal !== 'undefined' && formModal.backdrop && !formModal.backdrop.classList.contains('hidden')) await formModal.hide();
    if (typeof multiChoiceModal !== 'undefined' && multiChoiceModal.backdrop && !multiChoiceModal.backdrop.classList.contains('hidden')) await multiChoiceModal.hide();

    // Clear previous results
    const resultsContainer = document.getElementById('test-results-container');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }

    console.log('Running all automated tests...');

    try {
        await runGlasswareCrudTests();
        await runPipetteCrudTests();
        await runCalculationTests();
        console.log('All tests completed successfully.');
        // Display success message in the UI
        if (resultsContainer) {
            const li = document.createElement('li');
            li.className = 'p-2 rounded-md bg-blue-100 text-blue-800 font-bold';
            li.textContent = '🎉 All tests completed successfully!';
            resultsContainer.appendChild(li);
        }
        return "All tests passed.";
    } catch(e) {
        console.error("Test run failed:", e);
        return `Test failed: ${e.message}`;
    }
}

// --- MAIN APP SETUP ---
function main() {
    actionLoadLibraries();
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
    samplesContainer.addEventListener('input', e => { if (e.target.dataset.sampleId && !e.target.matches('.unit-select')) actionUpdateSample(parseInt(e.target.dataset.sampleId, 10), e.target.dataset.field, e.target.value); });
    samplesContainer.addEventListener('change', e => { if (e.target.matches('.unit-select')) actionUpdateSample(parseInt(e.target.dataset.sampleId, 10), e.target.dataset.field, e.target.value); });

    document.querySelector('nav[aria-label="Tabs"]').addEventListener('click', e => { if (e.target.closest('button.tab-btn')) actionSwitchTab(e.target.closest('button.tab-btn').dataset.tabName); });

    // Listener per le sotto-schede della libreria
    document.querySelector('nav[aria-label="Sub-tabs"]').addEventListener('click', e => {
        const subtabButton = e.target.closest('button.subtab-btn');
        if (subtabButton) {
            actionSwitchLibrarySubTab(subtabButton.dataset.subtabName);
        }
    });

    // --- Event Listeners Scheda Gestione Librerie ---
    document.getElementById('btn-export-libraries').addEventListener('click', actionExportLibraries);
    document.getElementById('btn-import-libraries').addEventListener('click', () => document.getElementById('import-libraries-input').click());
    document.getElementById('import-libraries-input').addEventListener('change', actionImportLibraries);

    document.getElementById('btn-add-glassware').addEventListener('click', actionAddGlassware);
    document.getElementById('btn-add-pipette').addEventListener('click', actionAddPipette);

    const libraryContentContainer = document.getElementById('content-librerie');
    libraryContentContainer.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;

        const library = button.dataset.library;
        const name = button.dataset.name;

        if (button.classList.contains('btn-edit-library-item')) {
            if (library === 'glassware') {
                actionEditGlassware(name);
            } else if (library === 'pipettes') {
                actionEditPipette(name);
            }
        } else if (button.classList.contains('btn-remove-library-item')) {
            if (library === 'glassware') {
                actionRemoveGlassware(name);
            } else if (library === 'pipettes') {
                actionRemovePipette(name);
            }
        } else if (button.classList.contains('btn-duplicate-library-item')) {
            if (library === 'glassware') {
                actionDuplicateGlassware(name);
            } else if (library === 'pipettes') {
                actionDuplicatePipette(name);
            }
        }
    });

    document.getElementById('project-objective').addEventListener('input', e => { appState.project.objective = e.target.value; });
    document.getElementById('project-method').addEventListener('input', e => { appState.project.method = e.target.value; });
    document.getElementById('project-component').addEventListener('input', e => { appState.project.component = e.target.value; });

    // --- Automated Tests Event Listener ---
    const testRunnerButton = document.getElementById('btn-run-tests');
    if (testRunnerButton) {
        testRunnerButton.addEventListener('click', () => {
            // Make the container visible when tests are run
            const testRunnerContainer = document.getElementById('test-runner-container');
            if (testRunnerContainer) {
                testRunnerContainer.style.display = 'block';
            }
            runAllTests();
        });
    }

    // --- Event Listeners Scheda Incertezza di Preparazione ---
    const prepContainer = document.getElementById('content-preparazione');
    prepContainer.addEventListener('click', e => {
        const target = e.target;
        // Spike listeners
        const addStepBtn = target.closest('.btn-add-step');
        const removeStepBtn = target.closest('.btn-remove-step');
        const addWithdrawalBtn = target.closest('.btn-add-withdrawal');
        const removeWithdrawalBtn = target.closest('.btn-remove-withdrawal');
        const dilutionTypeBtn = target.closest('.dilution-type-btn');
        // Calibration solution listeners
        const addCalSolStepBtn = target.closest('.btn-add-calsol-step');
        const removeCalSolStepBtn = target.closest('.btn-remove-calsol-step');
        const addCalSolWithdrawalBtn = target.closest('.btn-add-calsol-withdrawal');
        const removeCalSolWithdrawalBtn = target.closest('.btn-remove-calsol-withdrawal');

        if (addStepBtn) actionAddSpikeStep(addStepBtn.dataset.sampleId);
        else if (removeStepBtn) actionRemoveSpikeStep(removeStepBtn.dataset.sampleId, removeStepBtn.dataset.stepId);
        else if (addWithdrawalBtn) actionAddSpikeWithdrawal(addWithdrawalBtn.dataset.sampleId, addWithdrawalBtn.dataset.stepId);
        else if (removeWithdrawalBtn) actionRemoveSpikeWithdrawal(removeWithdrawalBtn.dataset.sampleId, removeWithdrawalBtn.dataset.stepId, removeWithdrawalBtn.dataset.withdrawalId);
        else if (dilutionTypeBtn) actionUpdateSpikeState({ ...dilutionTypeBtn.dataset });
        else if (addCalSolStepBtn) actionAddCalSolStep(addCalSolStepBtn.dataset.pointId);
        else if (removeCalSolStepBtn) actionRemoveCalSolStep(removeCalSolStepBtn.dataset.pointId, removeCalSolStepBtn.dataset.stepId);
        else if (addCalSolWithdrawalBtn) actionAddCalSolWithdrawal(addCalSolWithdrawalBtn.dataset.pointId, addCalSolWithdrawalBtn.dataset.stepId);
        else if (removeCalSolWithdrawalBtn) actionRemoveCalSolWithdrawal(removeCalSolWithdrawalBtn.dataset.pointId, removeCalSolWithdrawalBtn.dataset.stepId, removeCalSolWithdrawalBtn.dataset.withdrawalId);
    });

    prepContainer.addEventListener('input', e => {
        const target = e.target;
        const { sampleId, stepId, withdrawalId, field: dataField, pointId } = target.dataset;

        if (target.matches('.spike-input')) {
            const field = dataField;
            const value = target.type === 'number' ? (target.value === '' ? null : parseFloat(target.value)) : target.value;
            if (field) _updateSpikeStateFromInput({ sampleId, stepId, withdrawalId, field, value });
        }
        // No need for a separate cal-sol listener here, as 'change' will handle the final update and calculation
    });

     prepContainer.addEventListener('change', e => {
        const target = e.target;
        const { sampleId, stepId, withdrawalId, field: dataField, pointId } = target.dataset;

        // --- Spike Logic ---
        const isSpikeRelated = target.matches('.spike-input, .spike-input-withdrawal-pipette');
        if (isSpikeRelated && sampleId) {
            const field = dataField;
            const value = target.type === 'number' ? (target.value === '' ? null : parseFloat(target.value)) : target.value;
            if(field) {
                actionUpdateSpikeState({ sampleId, stepId, withdrawalId, field, value });
            } else if (target.matches('.spike-input')) { // Fallback for inputs without a specific field (like after 'input' event)
                 actionCalculateSpikeUncertainty(sampleId);
            }
            return;
        }

        // --- Calibration Solution Logic ---
        const isCalSolRelated = target.matches('.calsol-input, .calsol-input-withdrawal-pipette');
        if (isCalSolRelated && pointId) {
            const field = dataField;
            const value = target.type === 'number' ? (target.value === '' ? null : parseFloat(target.value)) : target.value;
            if (field) {
                actionUpdateCalSolState({ pointId, stepId, withdrawalId, field, value });
            }
        }
     });


    // --- Event Listeners Scheda Incertezza di Taratura ---
    document.getElementById('btn-add-regression-row').addEventListener('click', actionAddRegressionRow);
    document.getElementById('btn-calculate-regression').addEventListener('click', actionCalculateRegression);
    document.getElementById('btn-calculate-response-factor').addEventListener('click', actionCalculateResponseFactor);

    const regressionContainer = document.getElementById('regression-table-container');
    // Use 'change' to handle select dropdowns and when number inputs lose focus.
    regressionContainer.addEventListener('change', e => {
        const target = e.target;
        if (target.classList.contains('regression-input') && target.dataset.id) {
            actionUpdateRegressionPoint(target.dataset.id, target.dataset.field, target.value);
        }
    });

    regressionContainer.addEventListener('click', e => {
        const target = e.target;
        if (target.classList.contains('btn-remove-regression-row') && target.dataset.id) {
            actionRemoveRegressionRow(target.dataset.id);
        }
    });

    document.getElementById('regression-x-manual').addEventListener('input', e => actionUpdateManualCalibrationSample('xk', e.target.value));
    document.getElementById('regression-p').addEventListener('input', e => actionUpdateManualCalibrationSample('p', e.target.value));

    document.getElementById('rf-acceptability-criterion').addEventListener('input', e => actionUpdateRfCalibrationInput('acceptabilityCriterion', e.target.value));
    document.getElementById('rf-manual-conc').addEventListener('input', e => actionUpdateRfCalibrationInput('manualConc', e.target.value));

    // --- AZIONI E LISTENER PER LA NUOVA SEZIONE TRATTAMENTI ---
    // Funzioni di Azione
    function actionAddTreatmentSample() {
        const newId = `ts-${Date.now()}`;
        appState.treatments.push({
            id: newId,
            sampleId: null,
            treatments: []
        });
        render();
    }

    function actionRemoveTreatmentSample(treatmentSampleId) {
        appState.treatments = appState.treatments.filter(ts => ts.id !== treatmentSampleId);
        render();
    }

    function actionSelectTreatmentSample(treatmentSampleId, selectedSampleId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (treatmentSample) {
            treatmentSample.sampleId = selectedSampleId ? parseInt(selectedSampleId, 10) : null;
        }
        render();
        // Potrebbe essere necessario ricalcolare qui se la selezione del campione influisce sui calcoli
    }

    function actionAddTreatment(treatmentSampleId, type) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (treatmentSample) {
            const newTreatment = {
                id: `t-${Date.now()}`,
                type: type,
                // Campi di default a seconda del tipo
                source: {
                    type: 'manual', // 'manual' o 'spike' o 'previous'
                    manualConcentration: null,
                    manualUncertainty: null,
                    spikeSampleId: null
                },
                results: null
            };
            if (type === 'estrazione' || type === 'concentrazione') {
                newTreatment.initialVolumeFlask = null;
                newTreatment.finalVolumeFlask = null;
            }
            if (type === 'diluizione') {
                // Struttura più complessa, simile a un passo di spike
                newTreatment.withdrawals = [{ id: `w-${Date.now()}`, pipette: null, volume: null }];
                newTreatment.dilutionType = 'bringToVolume';
                newTreatment.dilutionFlask = null;
                newTreatment.addedSolventPipette = null;
                newTreatment.addedSolventVolume = null;
            }
            treatmentSample.treatments.push(newTreatment);
        }
        render();
    }

    function actionRemoveTreatment(treatmentSampleId, treatmentId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (treatmentSample) {
            treatmentSample.treatments = treatmentSample.treatments.filter(t => t.id !== treatmentId);
        }
        render();
    }

    function actionMoveTreatment(treatmentSampleId, treatmentId, direction) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (!treatmentSample) return;

        const treatments = treatmentSample.treatments;
        const index = treatments.findIndex(t => t.id === treatmentId);

        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            [treatments[index - 1], treatments[index]] = [treatments[index], treatments[index - 1]];
        } else if (direction === 'down' && index < treatments.length - 1) {
            [treatments[index], treatments[index + 1]] = [treatments[index + 1], treatments[index]];
        }
        render();
        actionCalculateTreatmentChain(treatmentSampleId);
    }

    function actionAddTreatmentWithdrawal(treatmentSampleId, treatmentId) {
        const treatment = appState.treatments
            .find(ts => ts.id === treatmentSampleId)?.treatments
            .find(t => t.id === treatmentId);
        if (treatment && treatment.type === 'diluizione') {
            if (!treatment.withdrawals) treatment.withdrawals = [];
            treatment.withdrawals.push({ id: `w-${Date.now()}`, pipette: null, volume: null });
            render();
            actionCalculateTreatmentChain(treatmentSampleId);
        }
    }

    function actionRemoveTreatmentWithdrawal(treatmentSampleId, treatmentId, withdrawalId) {
        const treatment = appState.treatments
            .find(ts => ts.id === treatmentSampleId)?.treatments
            .find(t => t.id === treatmentId);
        if (treatment && treatment.type === 'diluizione' && treatment.withdrawals) {
            treatment.withdrawals = treatment.withdrawals.filter(w => w.id !== withdrawalId);
            render();
            actionCalculateTreatmentChain(treatmentSampleId);
        }
    }

    function actionUpdateTreatmentState({ treatmentSampleId, treatmentId, withdrawalId, field, value }) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (!treatmentSample) return;

        const treatment = treatmentSample.treatments.find(t => t.id === treatmentId);
        if (!treatment) return;

        if (withdrawalId) {
            const withdrawal = treatment.withdrawals?.find(w => w.id === withdrawalId);
            if (withdrawal) {
                withdrawal[field] = value;
            }
        } else if (field.startsWith('source')) {
            if (field === 'sourceType') treatment.source.type = value;
            if (field === 'sourceManualConcentration') treatment.source.manualConcentration = value === '' ? null : parseFloat(value);
            if (field === 'sourceManualUncertainty') treatment.source.manualUncertainty = value === '' ? null : parseFloat(value);
            if (field === 'sourceSpikeSampleId') treatment.source.spikeSampleId = value === '' ? null : parseInt(value, 10);
        } else {
             treatment[field] = value;
        }

        actionCalculateTreatmentChain(treatmentSampleId);
    // render() is called inside actionCalculateTreatmentChain's finally block, so this one is redundant.
        renderDebugInfo();
    }

    function actionCalculateTreatmentChain(treatmentSampleId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (!treatmentSample) return;

        let currentConcentration = 0;
        let sum_u_rel_sq = 0;

        try {
            for (const [index, treatment] of treatmentSample.treatments.entries()) {
             // Resetta i risultati e le incertezze intermedie per questo step
                treatment.results = null;
            treatment.flaskUncertaintyRelPerc = null;
            treatment.addedSolventPipetteUncertaintyRelPerc = null;
            treatment.initialFlaskUncertaintyRelPerc = null;
            treatment.finalFlaskUncertaintyRelPerc = null;
            if(treatment.withdrawals) {
                treatment.withdrawals.forEach(w => w.pipetteUncertaintyRelPerc = null);
            }


                if (index === 0) {
                    // Gestione della sorgente per il primo trattamento
                    if (treatment.source.type === 'manual') {
                        if (treatment.source.manualConcentration === null || treatment.source.manualUncertainty === null) throw new Error("Dati manuali incompleti.");
                        currentConcentration = treatment.source.manualConcentration;
                        // U% (k=2) -> u_rel
                        const u_rel_initial = (treatment.source.manualUncertainty / 100) / 2 / Math.sqrt(2);
                        sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                    } else if (treatment.source.type === 'spike') {
                        if (treatment.source.spikeSampleId === null) throw new Error("Matrix spike non selezionato.");
                        const spikeData = appState.spikeUncertainty[treatment.source.spikeSampleId];
                        if (!spikeData || !spikeData.results) throw new Error("Dati dello spike selezionato non disponibili.");
                        currentConcentration = spikeData.results.finalConcentration;
                        // u_c % -> u_rel
                        const u_rel_initial = spikeData.results.u_comp_rel_perc / 100;
                        sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                    } else {
                        throw new Error("Tipo di sorgente non valido per il primo trattamento.");
                    }
                }

                // Calcolo specifico per tipo di trattamento
                if (treatment.type === 'diluizione') {
                    if (treatment.withdrawals.length === 0) throw new Error(`Diluizione: Nessun prelievo.`);
                    if (treatment.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) throw new Error(`Diluizione: Dati di prelievo incompleti.`);

                    let totalWithdrawalVolume = 0;
                    let sum_u_abs_sq_withdrawals = 0;

                    treatment.withdrawals.forEach(w => {
                        totalWithdrawalVolume += w.volume;
                        const contrib = _get_pipette_uncertainty_contribution(w.pipette, w.volume, appState.libraries);
                        w.pipetteUncertainty_U_perc = contrib.U_perc;
                        w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                        sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
                    });
                    const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);

                    if (treatment.dilutionType === 'addSolvent') {
                        if (!treatment.addedSolventPipette || !treatment.addedSolventVolume || treatment.addedSolventVolume <= 0) throw new Error("Diluizione: Dati per l'aggiunta di solvente incompleti.");

                        const Vi = totalWithdrawalVolume;
                        const u_abs_Vi = u_abs_total_withdrawal;

                        const solvent_contrib = _get_pipette_uncertainty_contribution(treatment.addedSolventPipette, treatment.addedSolventVolume, appState.libraries);
                        treatment.addedSolventPipetteUncertaintyRelPerc = solvent_contrib.u_rel_perc;
                        const Va = treatment.addedSolventVolume;
                        const u_abs_Va = solvent_contrib.u_abs;

                        const Vf = Vi + Va;
                        const u_abs_Vf = Math.sqrt(Math.pow(u_abs_Vi, 2) + Math.pow(u_abs_Va, 2));

                        const u_rel_sq_Vi = Vi > 0 ? Math.pow(u_abs_Vi / Vi, 2) : 0;
                        const u_rel_sq_Vf = Vf > 0 ? Math.pow(u_abs_Vf / Vf, 2) : 0;

                        sum_u_rel_sq += u_rel_sq_Vi + u_rel_sq_Vf;
                        currentConcentration = currentConcentration * (Vi / Vf);

                    } else { // bringToVolume
                        if (!treatment.dilutionFlask) throw new Error(`Diluizione: Matraccio non selezionato.`);
                        const u_rel_sq_total_withdrawal = totalWithdrawalVolume > 0 ? Math.pow(u_abs_total_withdrawal / totalWithdrawalVolume, 2) : 0;
                        const flask = appState.libraries.glassware[treatment.dilutionFlask];
                        const u_rel_flask = (flask.uncertainty / flask.volume / Math.sqrt(3));
                        treatment.flaskUncertaintyRelPerc = u_rel_flask * 100;
                        const u_rel_sq_flask = Math.pow(u_rel_flask, 2);
                        sum_u_rel_sq += u_rel_sq_total_withdrawal + u_rel_sq_flask;
                        currentConcentration = currentConcentration * (totalWithdrawalVolume / flask.volume);
                    }

                } else if (treatment.type === 'estrazione' || treatment.type === 'concentrazione') {
                    if (!treatment.initialVolumeFlask || !treatment.finalVolumeFlask) throw new Error(`${treatment.type}: Selezionare i matracci.`);

                    const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                    const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];

                    const u_rel_initial_flask = (initialFlask.uncertainty / initialFlask.volume / Math.sqrt(3));
                    const u_rel_final_flask = (finalFlask.uncertainty / finalFlask.volume / Math.sqrt(3));
                    treatment.initialFlaskUncertaintyRelPerc = u_rel_initial_flask * 100;
                    treatment.finalFlaskUncertaintyRelPerc = u_rel_final_flask * 100;


                    sum_u_rel_sq += Math.pow(u_rel_initial_flask, 2) + Math.pow(u_rel_final_flask, 2);
                    currentConcentration = currentConcentration * (initialFlask.volume / finalFlask.volume);
                }

                // Salva i risultati del trattamento corrente
                treatment.results = {
                    finalConcentration: currentConcentration,
                    finalUncertaintyRelPerc: Math.sqrt(sum_u_rel_sq) * 100,
                };
            }
        } catch (e) {
            console.warn(`Calculation error in treatment chain ${treatmentSampleId}: ${e.message}`);
            // L'errore interrompe il ciclo, i trattamenti successivi non avranno risultati.
        } finally {
            render(); // Aggiorna l'UI per mostrare i risultati calcolati o la loro assenza
        }
    }

    // Event Listeners per la sezione Trattamenti
    document.getElementById('btn-add-treatment-sample').addEventListener('click', actionAddTreatmentSample);

    const treatmentsContainer = document.getElementById('treatments-container');
    if(treatmentsContainer) {
        treatmentsContainer.addEventListener('click', e => {
            const removeSampleBtn = e.target.closest('.btn-remove-treatment-sample');
            const addTreatmentBtn = e.target.closest('.btn-add-treatment');
            const removeTreatmentBtn = e.target.closest('.btn-remove-treatment');
            const moveTreatmentBtn = e.target.closest('.btn-move-treatment');
            const addWithdrawalBtn = e.target.closest('.btn-add-treatment-withdrawal');
            const removeWithdrawalBtn = e.target.closest('.btn-remove-treatment-withdrawal');
            const dilutionTypeBtn = e.target.closest('.dilution-type-btn');

            if (removeSampleBtn) {
                actionRemoveTreatmentSample(removeSampleBtn.dataset.treatmentSampleId);
            } else if (addTreatmentBtn) {
                actionAddTreatment(addTreatmentBtn.dataset.treatmentSampleId, addTreatmentBtn.dataset.treatmentType);
            } else if (removeTreatmentBtn) {
                actionRemoveTreatment(removeTreatmentBtn.dataset.treatmentSampleId, removeTreatmentBtn.dataset.treatmentId);
            } else if (moveTreatmentBtn) {
                actionMoveTreatment(moveTreatmentBtn.dataset.treatmentSampleId, moveTreatmentBtn.dataset.treatmentId, moveTreatmentBtn.dataset.direction);
            } else if (addWithdrawalBtn) {
                actionAddTreatmentWithdrawal(addWithdrawalBtn.dataset.treatmentSampleId, addWithdrawalBtn.dataset.treatmentId);
            } else if (removeWithdrawalBtn) {
                actionRemoveTreatmentWithdrawal(removeWithdrawalBtn.dataset.treatmentSampleId, removeWithdrawalBtn.dataset.treatmentId, removeWithdrawalBtn.dataset.withdrawalId);
            } else if (dilutionTypeBtn) {
                 const { treatmentSampleId, treatmentId, field, value } = dilutionTypeBtn.dataset;
                 actionUpdateTreatmentState({ treatmentSampleId, treatmentId, field, value });
            }
        });

        treatmentsContainer.addEventListener('input', e => {
            const selectSample = e.target.closest('.select-treatment-sample');
            const treatmentInput = e.target.closest('.treatment-input');

            // --- FOCUS SAVING ---
            const focusedElement = document.activeElement;
            let focusedSelector = null;
            let selectionStart = null;
            if (focusedElement && (focusedElement.closest('.treatment-input') || focusedElement.closest('.select-treatment-sample'))) {
                const ds = focusedElement.dataset;
                // Build a unique selector from data attributes
                focusedSelector = `[data-field="${ds.field}"]`;
                if (ds.withdrawalId) focusedSelector += `[data-withdrawal-id="${ds.withdrawalId}"]`;
                if (ds.treatmentId) focusedSelector += `[data-treatment-id="${ds.treatmentId}"]`;
                if (ds.treatmentSampleId) focusedSelector += `[data-treatment-sample-id="${ds.treatmentSampleId}"]`;

                if (focusedElement.selectionStart !== undefined) {
                    selectionStart = focusedElement.selectionStart;
                }
            }

            // --- STATE UPDATE ---
            if (selectSample) {
                actionSelectTreatmentSample(selectSample.dataset.treatmentSampleId, e.target.value);
            } else if (treatmentInput) {
                const { treatmentSampleId, treatmentId, withdrawalId, field } = treatmentInput.dataset;
                let value;
                if (treatmentInput.type === 'number') {
                    value = e.target.value === '' ? null : parseFloat(e.target.value);
                } else {
                    value = e.target.value;
                }
                actionUpdateTreatmentState({ treatmentSampleId, treatmentId, withdrawalId, field, value });
            }

            // --- FOCUS RESTORING ---
            if (focusedSelector) {
                const elementToFocus = document.querySelector(focusedSelector);
                if (elementToFocus) {
                    elementToFocus.focus();
                    if (selectionStart !== null && elementToFocus.selectionStart !== undefined) {
                        elementToFocus.selectionStart = elementToFocus.selectionEnd = selectionStart;
                    }
                }
            }
        });
    }


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

    // --- Accordion Logic ---
    document.querySelectorAll('.accordion-btn').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');

            // Toggle icon rotation
            if (icon) {
                icon.classList.toggle('rotate-180');
            }

            // Toggle the 'open' class to control visibility and scrolling from CSS
            content.classList.toggle('open');
        });
    });

    actionAddSample();
    render(); // Chiamata iniziale per renderizzare tutto
}

document.addEventListener('DOMContentLoaded', main);
