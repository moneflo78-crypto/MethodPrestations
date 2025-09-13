// =================================================================================
// JULES'S REFACTORED SCRIPT - STATE-DRIVEN ARCHITECTURE (v2.2 - FINAL)
// =================================================================================

// --- STATISTICAL CONSTANTS & BUSINESS LOGIC ---
const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]};
const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}};

function shapiroWilk(data) {
    const sorted = data.slice().sort((a, b) => a - b);
    const n = sorted.length;
    if (n < 3 || n > 26) {
        return { W: NaN, kp: NaN, error: "Calcolo supportato per campioni da 3 a 26 dati." };
    }
    const mean = data.reduce((a, b) => a + b) / n;
    const S2 = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);

    if (S2 < 1e-19) return { W: 1, kp: Infinity, isNormal: true };
    const a_half = a_coeffs_table[n];
    const a = new Array(n);
    for(let i=0; i < Math.ceil(n/2); i++) {
        a[i] = -a_half[i];
        a[n-1-i] = a_half[i];
    }
    if (n % 2 === 1) a[Math.floor(n/2)] = 0;
    const W = Math.pow(sorted.reduce((sum, val, i) => sum + a[i] * val, 0), 2) / S2;
    const W_prime = Math.min(W, 1.0);
    const {g, e, f} = kp_coeffs_table[n];
    const kp = g + e * Math.log((W_prime - f) / (1 - W_prime));
    return { W: W_prime, kp: isNaN(kp) ? Infinity : kp, isNormal: kp > -1.645 };
}

const DEFAULT_GLASSWARE_LIBRARY = {
    'Matraccio 5 mL': { volume: 5, uncertainty: 0.04 }, 'Matraccio 10 mL': { volume: 10, uncertainty: 0.04 }, 'Matraccio 20 mL': { volume: 20, uncertainty: 0.04 }, 'Matraccio 25 mL': { volume: 25, uncertainty: 0.04 }, 'Matraccio 50 mL': { volume: 50, uncertainty: 0.08 }, 'Matraccio 100 mL': { volume: 100, uncertainty: 0.1 }, 'Matraccio 200 mL': { volume: 200, uncertainty: 0.15 }, 'Matraccio 250 mL': { volume: 250, uncertainty: 0.15 }, 'Matraccio 500 mL': { volume: 500, uncertainty: 0.25 }, 'Matraccio 1000 mL': { volume: 1000, uncertainty: 0.6 }, 'Matraccio 2000 mL': { volume: 2000, uncertainty: 0.6 }, 'Matraccio 5000 mL': { volume: 5000, uncertainty: 1.2 }
};
const DEFAULT_PIPETTE_LIBRARY = {
    "041CHR": { "calibrationPoints": [ { "volume": 0.002, "U_rel_percent": 3.9 }, { "volume": 0.01, "U_rel_percent": 0.95 }, { "volume": 0.02, "U_rel_percent": 0.49 } ] }, "042CHR": { "calibrationPoints": [ { "volume": 0.05, "U_rel_percent": 0.74 }, { "volume": 0.1, "U_rel_percent": 0.52 }, { "volume": 0.2, "U_rel_percent": 0.32 } ] }, "043CHR": { "calibrationPoints": [ { "volume": 0.1, "U_rel_percent": 2.1 }, { "volume": 0.5, "U_rel_percent": 0.57 }, { "volume": 1, "U_rel_percent": 0.4 } ] },
};

// --- UTILITY FUNCTIONS ---
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// --- INITIAL STATE DEFINITION ---
function getInitialAppState() {
    return {
        version: '2.1.0',
        ui: {
            activeTab: 'frontespizio',
        },
        project: {
            objective: '',
            method: '',
            component: ''
        },
        samples: [],
        results: {}, // key is sample.id
        libraries: {
            glassware: deepCopy(DEFAULT_GLASSWARE_LIBRARY),
            pipettes: deepCopy(DEFAULT_PIPETTE_LIBRARY),
        }
    };
}

let appState = getInitialAppState();

// --- STATE MANAGEMENT ---
function render() {
    console.log("Rendering UI from state:", appState);
    renderTabs();
    renderProjectInfo();
    renderSamplesAndResults();
}

// --- RENDER FUNCTIONS ---
function renderTabs() {
    document.querySelectorAll('[data-tab-name]').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tabName === appState.ui.activeTab);
    });
    document.querySelectorAll('[id^="content-"]').forEach(content => {
        content.classList.toggle('hidden', content.id !== `content-${appState.ui.activeTab}`);
    });
}

function renderProjectInfo() {
    document.getElementById('project-objective').value = appState.project.objective;
    document.getElementById('project-method').value = appState.project.method;
    document.getElementById('project-component').value = appState.project.component;
}

function renderSamplesAndResults() {
    const container = document.getElementById('samples-container');
    const resultsContainer = document.getElementById('results-container');
    container.innerHTML = '';
    resultsContainer.innerHTML = '';

    appState.samples.forEach(sample => {
        const sampleCard = document.createElement('div');
        sampleCard.className = 'sample-card bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-4';
        sampleCard.innerHTML = `
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Campione ${sample.id}</h3>
                <button data-sample-id="${sample.id}" class="btn-remove-sample text-gray-400 hover:text-red-500">
                    <svg class="pointer-events-none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dati</label>
                    <textarea data-sample-id="${sample.id}" data-field="rawData" rows="4" class="data-input w-full p-2 border border-gray-300 rounded-md">${sample.rawData || ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome Campione</label>
                    <input data-sample-id="${sample.id}" data-field="name" type="text" class="name-input w-full p-2 border border-gray-300 rounded-md" value="${sample.name || ''}">
                    <label class="block text-sm font-medium text-gray-700 mt-2 mb-1">Valore Atteso</label>
                    <input data-sample-id="${sample.id}" data-field="expectedValue" type="number" class="expected-input w-full p-2 border border-gray-300 rounded-md" value="${sample.expectedValue || ''}">
                </div>
            </div>`;
        container.appendChild(sampleCard);

        const result = appState.results[sample.id];
        if (result) {
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500';
            let contentHTML = `<h4 class="text-lg font-bold text-gray-900">${sample.name}</h4>`;

            if (result.error) {
                contentHTML += `<p class="mt-3 text-red-600 font-semibold p-2 bg-red-50 rounded-md">${result.error}</p>`;
            } else if (result.normality) {
                const normality = result.normality;
                const passFail = normality.isNormal ? '<span class="text-green-600 font-semibold">Passato</span>' : '<span class="text-red-600 font-semibold">Fallito</span>';
                contentHTML += `
                    <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <span>Test di Normalità (Shapiro-Wilk):</span> <span>${passFail}</span>
                        <span>Valore calcolato (kp):</span> <span class="font-semibold">${normality.kp.toFixed(3)}</span>
                    </div>
                `;
            }
            resultCard.innerHTML = contentHTML;
            resultsContainer.appendChild(resultCard);
        }
    });
}

// --- ACTIONS ---
function actionSwitchTab(tabName) {
    appState.ui.activeTab = tabName;
    render();
}

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

function actionCalculateAll() {
    appState.results = {}; // Clear previous results

    appState.samples.forEach(sample => {
        const rawData = sample.rawData;
        let data;
        if (rawData.includes('.')) {
            data = rawData.split(/[\s,]+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n));
        } else {
            const standardizedData = rawData.replace(/,/g, '.');
            data = standardizedData.split(/\s+/).filter(d => d.trim() !== '').map(Number).filter(n => !isNaN(n));
        }

        if (data.length < 3) {
            appState.results[sample.id] = { error: "Sono necessari almeno 3 punti dati per il test." };
            return; // continue to next sample
        }

        const normalityResult = shapiroWilk(data);
        appState.results[sample.id] = {
            normality: normalityResult,
        };
    });

    render();
}


function actionResetData() {
    appState = getInitialAppState();
    actionAddSample();
}

function actionSaveData() {
    const stateString = JSON.stringify(appState, null, 2);
    const blob = new Blob([stateString], { type: 'application/json' });
    const now = new Date();
    const datePart = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const timePart = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const fileName = `dati_analisi_laboratorio_${datePart}_${timePart}.json`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
        } catch (error) {
            alert(`Errore nel caricamento: ${error.message}`);
        } finally {
            event.target.value = null;
        }
    };
    reader.readAsText(file);
}

// --- MAIN APP SETUP ---
function main() {
    document.getElementById('btn-add-sample').addEventListener('click', actionAddSample);
    document.getElementById('calculate-btn').addEventListener('click', actionCalculateAll);
    document.getElementById('btn-load-data').addEventListener('click', () => document.getElementById('load-data-input').click());
    document.getElementById('load-data-input').addEventListener('change', actionLoadData);
    document.getElementById('btn-save-data').addEventListener('click', actionSaveData);

    const samplesContainer = document.getElementById('samples-container');
    samplesContainer.addEventListener('click', e => {
        if (e.target.closest('.btn-remove-sample')) {
            actionRemoveSample(parseInt(e.target.closest('.btn-remove-sample').dataset.sampleId, 10));
        }
    });
    samplesContainer.addEventListener('input', e => {
        if (e.target.dataset.sampleId) {
            actionUpdateSample(parseInt(e.target.dataset.sampleId, 10), e.target.dataset.field, e.target.value);
        }
    });

    document.querySelector('nav[aria-label="Tabs"]').addEventListener('click', e => {
        if (e.target.closest('button.tab-btn')) {
            actionSwitchTab(e.target.closest('button.tab-btn').dataset.tabName);
        }
    });

    document.getElementById('project-objective').addEventListener('input', e => { appState.project.objective = e.target.value; });
    document.getElementById('project-method').addEventListener('input', e => { appState.project.method = e.target.value; });
    document.getElementById('project-component').addEventListener('input', e => { appState.project.component = e.target.value; });

    actionAddSample();
}

document.addEventListener('DOMContentLoaded', main);
