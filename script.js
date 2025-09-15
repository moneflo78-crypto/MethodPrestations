// =================================================================================
// JULES'S REFACTORED SCRIPT - STATE-DRIVEN ARCHITECTURE (v3.0 - FINAL & COMPLETE)
// =================================================================================

// --- UTILITY & CONSTANTS ---

// --- STATISTICAL CONSTANTS & BUSINESS LOGIC ---
const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]};
const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}};

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
            const clickHandler = value => { this.hide(); resolve(value); };
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
        this.backdrop.classList.add('opacity-0');
        setTimeout(() => this.backdrop.classList.add('hidden'), 300);
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
            const clickHandler = (isConfirm) => {
                let selectedChoices = [];
                if (isConfirm) {
                    this.body.querySelectorAll('input[name="modal-choice"]:checked').forEach(checkbox => {
                        selectedChoices.push(checkbox.value);
                    });
                }
                this.hide();
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
        this.backdrop.classList.add('opacity-0');
        setTimeout(() => this.backdrop.classList.add('hidden'), 300);
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
        libraries: {
            glassware: deepCopy(DEFAULT_GLASSWARE_LIBRARY),
            pipettes: deepCopy(DEFAULT_PIPETTE_LIBRARY),
        }
    };
}
let appState = getInitialAppState();


// --- RENDER FUNCTIONS ---
function render() {
    renderTabs();
    renderProjectInfo();
    renderSamplesAndResults();
    renderDebugInfo();
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
    resultsContainer.innerHTML = ''; // Clear only the results

    appState.samples.forEach(sample => {
        const result = appState.results[sample.id];
        if (result && result.log && result.log.length > 0) {
            const resultCard = document.createElement('div');
            resultCard.className = `bg-white p-5 rounded-lg shadow-md border-l-4 ${result.error ? 'border-red-500' : 'border-blue-500'}`;
            const logHTML = result.log.map(item => `<li class="analysis-log ${item.type}">${item.message}</li>`).join('');
            resultCard.innerHTML = `<h4 class="text-lg font-bold text-gray-900">${sample.name} - Log di Analisi</h4><ul class="space-y-1 mt-2 text-sm">${logHTML}</ul>`;
            resultsContainer.appendChild(resultCard);
        }
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
                        } else {
                            addLog('info', 'I dati ora sono normali. Procedere con la normale analisi degli outlier.');
                        }
                    } else {
                        addLog('decision', 'Decisione utente: mantenimento dati anomali.');
                        addLog('error', 'I calcoli non possono procedere su dati non normali con anomalie non rimosse.');
                    }
                } else {
                    addLog('info', 'Nessun dato anomalo trovato con il test di Huber.');
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

// --- MAIN APP SETUP ---
function main() {
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

    actionAddSample();
}

document.addEventListener('DOMContentLoaded', main);
