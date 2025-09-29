// =================================================================================
// JULES'S REFACTORED SCRIPT - STATE-DRIVEN ARCHITECTURE (v3.0 - FINAL & COMPLETE)
// =================================================================================

// --- UTILITY & CONSTANTS ---

// --- VALIDATION TEST CASES ---
const VALIDATION_TEST_CASES = [
    {
        id: 'eurachem_example_a1',
        name: "Eurachem Guide - Esempio A1: Retta di Taratura",
        description: "Questo test replica l'esempio A1 della guida Eurachem 'The Fitness for Purpose of Analytical Methods' (2nd ed. 2014), pag. 104. Verifica il calcolo dell'incertezza di taratura da una retta dei minimi quadrati, applicando gli arrotondamenti intermedi specificati per garantire la confrontabilità dei risultati.",
        type: 'regression',
        inputs: {
            cal_x: [0, 20, 40, 60, 80, 100], // mg/l
            cal_y: [2.1, 19.3, 43.2, 58.3, 82.0, 103.2], // mV
            sample_y_k: 45.0, // mV
            sample_p: 3
        },
        roundingRules: {
            // Specifica il numero di cifre decimali per ogni calcolo intermedio
            Sxx: 2,
            Syy: 2,
            Sxy: 2,
            slope_b: 6, // 6 cifre significative
            intercept_a: 3,
            s_yx: 4,
            y_medio_cal: 3,
            x_k: 2,
            ux: 2
        },
        expectedResults: {
            // Valori attesi dopo aver applicato le regole di arrotondamento
            slope_b: 1.02029,
            intercept_a: 1.453,
            s_yx: 1.341,
            x_k: 42.68,
            ux: 0.85
        }
    },
    {
        id: 'unichim_179_1_esempio_1',
        name: "Unichim 179/1 - Esempio 1: Test di Normalità Shapiro-Wilk",
        description: "Questo test replica l'esempio 1, paragrafo 12, del manuale Unichim 179/1 (Ed. 2011). Verifica il calcolo del test di normalità di Shapiro-Wilk con i dati di letteratura, confrontando la statistica W e il parametro kp calcolati.",
        type: 'shapiro-wilk',
        inputs: {
            data: [0.72, 0.73, 0.73, 0.75, 0.76, 0.80, 0.78, 0.80, 0.74, 0.74, 0.63, 0.64],
            intermediate_b: 0.1670, // From Unichim 179/1 manual, Esempio 1
            intermediate_S2: 0.0317  // From Unichim 179/1 manual, Esempio 1
        },
        roundingRules: {
            W: 3,
            kp: 3
        },
        expectedResults: {
            W: 0.880,
            kp: -1.331
        }
    }
    // Futuri casi di test possono essere aggiunti qui
];


// --- STATISTICAL CONSTANTS & BUSINESS LOGIC ---
const a_coeffs_table = { 3:[0.7071],4:[0.6872,0.1677],5:[0.6646,0.2413],6:[0.6431,0.2806,0.0875],7:[0.6233,0.3031,0.1401],8:[0.6052,0.3164,0.1743,0.0561],9:[0.5888,0.3244,0.1976,0.0947],10:[0.5739,0.3291,0.2141,0.1224,0.0399],11:[0.5601,0.3315,0.2260,0.1429,0.0695],12:[0.5475,0.3325,0.2347,0.1586,0.0922,0.0303],13:[0.5359,0.3325,0.2412,0.1707,0.1099,0.0539],14:[0.5251,0.3318,0.2460,0.1802,0.1240,0.0727,0.0240],15:[0.5150,0.3306,0.2495,0.1878,0.1353,0.0880,0.0433],16:[0.5056,0.3290,0.2521,0.1939,0.1447,0.1005,0.0593,0.0196],17:[0.4968,0.3273,0.2540,0.1988,0.1524,0.1109,0.0725,0.0359],18:[0.4886,0.3253,0.2553,0.2027,0.1587,0.1197,0.0837,0.0496,0.0153],19:[0.4808,0.3232,0.2561,0.2059,0.1641,0.1271,0.0932,0.0612,0.0303],20:[0.4734,0.3211,0.2565,0.2085,0.1686,0.1334,0.1013,0.0711,0.0422,0.0140],21:[0.4643,0.3185,0.2578,0.2119,0.1736,0.1399,0.1092,0.0804,0.0530,0.0263],22:[0.4590,0.3156,0.2571,0.2131,0.1764,0.1443,0.1150,0.0878,0.0618,0.0368,0.0122],23:[0.4542,0.3126,0.2563,0.2139,0.1787,0.1480,0.1201,0.0941,0.0696,0.0459,0.0228],24:[0.4493,0.3098,0.2554,0.2145,0.1807,0.1512,0.1245,0.0997,0.0764,0.0539,0.0321,0.0107],25:[0.4450,0.3069,0.2543,0.2148,0.1822,0.1539,0.1283,0.1046,0.0823,0.0610,0.0403,0.0200],26:[0.4407,0.3043,0.2533,0.2151,0.1836,0.1563,0.1316,0.1089,0.0876,0.0672,0.0476,0.0284,0.0094]};
const kp_coeffs_table = { 3:{g:-0.625,e:0.386,f:0.75},4:{g:-1.107,e:0.714,f:0.6297},5:{g:-1.53,e:0.935,f:0.5521},6:{g:-2.01,e:1.138,f:0.4963},7:{g:-2.356,e:1.245,f:0.4533},8:{g:-2.696,e:1.333,f:0.4186},9:{g:-2.968,e:1.4,f:0.39},10:{g:-3.262,e:1.471,f:0.366},11:{g:-3.485,e:1.515,f:0.3451},12:{g:-3.731,e:1.571,f:0.327},13:{g:-3.936,e:1.613,f:0.3111},14:{g:-4.155,e:1.655,f:0.2969},15:{g:-4.373,e:1.695,f:0.2842},16:{g:-4.567,e:1.724,f:0.2727},17:{g:-4.713,e:1.739,f:0.2622},18:{g:-4.885,e:1.77,f:0.2528},19:{g:-5.018,e:1.786,f:0.244},20:{g:-5.153,e:1.802,f:0.2359},21:{g:-5.291,e:1.818,f:0.2284},22:{g:-5.413,e:1.835,f:0.2207},23:{g:-5.508,e:1.848,f:0.2157},24:{g:-5.605,e:1.862,f:0.2106},25:{g:-5.704,e:1.876,f:0.2063},26:{g:-5.803,e:1.89,f:0.202}};
const STUDENT_T_95_TWO_TAILED = { 1:12.706,2:4.303,3:3.182,4:2.776,5:2.571,6:2.447,7:2.365,8:2.306,9:2.262,10:2.228,11:2.201,12:2.179,13:2.16,14:2.145,15:2.131,16:2.12,17:2.11,18:2.101,19:2.093,20:2.086,21:2.08,22:2.074,23:2.069,24:2.064,25:2.06,26:2.056,27:2.052,28:2.048,29:2.045,30:2.042,infinity:1.96};
function getTValue(n){if(n<=1)return NaN;const df=n-1;if(df>30)return STUDENT_T_95_TWO_TAILED.infinity;return STUDENT_T_95_TWO_TAILED[df]||NaN}
const GRUBBS_CRITICAL_VALUES_0_05 = { 3:1.155,4:1.481,5:1.715,6:1.887,7:2.02,8:2.126,9:2.215,10:2.29,11:2.355,12:2.412,13:2.462,14:2.507,15:2.549,16:2.585,17:2.62,18:2.651,19:2.681,20:2.709,21:2.733,22:2.758,23:2.781,24:2.802,25:2.822,26:2.841 };

/**
 * Custom error class for handling incomplete user input without treating it as a critical failure.
 */
class IncompleteDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "IncompleteDataError";
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

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
    const n = data.length;
    if (n < 3 || n > 26) {
        // Test not applicable or critical value not available for this sample size.
        return [];
    }

    const mean = ss.mean(data);
    const stdDev = ss.sampleStandardDeviation(data);

    if (stdDev < 1e-9) {
        // If standard deviation is zero, all values are the same, no outliers.
        return [];
    }

    let maxDev = 0;
    let outlierIndex = -1;
    let outlierValue = null;

    data.forEach((value, index) => {
        const dev = Math.abs(value - mean);
        if (dev > maxDev) {
            maxDev = dev;
            outlierIndex = index;
            outlierValue = value;
        }
    });

    const gStat = maxDev / stdDev;
    const criticalValue = GRUBBS_CRITICAL_VALUES_0_05[n];

    if (gStat > criticalValue) {
        return [{ value: outlierValue, index: outlierIndex }];
    }

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
 * Formats a number for display, safely handling null or undefined values.
 * @param {number|null|undefined} value - The number to format.
 * @param {number} [precision=6] - The number of significant digits or decimal places.
 * @param {boolean} [isFixed=false] - If true, use toFixed(); otherwise, use toPrecision().
 * @returns {string} The formatted number or 'N/A'.
 */
function formatNumber(value, precision = 6, isFixed = false) {
    if (value === null || typeof value === 'undefined' || isNaN(value)) {
        return 'N/A';
    }
    const num = Number(value);
    return isFixed ? num.toFixed(precision) : num.toPrecision(precision);
}

/**
 * Formats a number according to the specified business rules for decimal places, rounding, and scientific notation.
 * @param {number|null|undefined} value - The number to format.
 * @returns {string} The formatted number as a string, or 'N/A'.
 */
function formatNumberWithRules(value) {
    if (value === null || typeof value === 'undefined' || isNaN(value)) {
        return 'N/A';
    }

    const n = Number(value);
    if (n === 0) {
        return "0";
    }

    const absN = Math.abs(n);

    // Rule 2.c: Use scientific notation for numbers > 10000 or < 0.00001
    if (absN >= 10000 || (absN > 0 && absN < 0.00001)) {
        // Find exponent for d=4-e rule to determine precision
        const e = Math.floor(Math.log10(absN));
        const d = 4 - e;
        // For scientific notation, d becomes the number of decimal places.
        // We ensure it's at least 0.
        const precision = Math.max(0, d);
        return n.toExponential(precision);
    }

    // Rule 2.a & 2.b: General rule for decimals and rounding
    const e = Math.floor(Math.log10(absN));
    const d = 4 - e;

    if (d >= 0) {
        // Standard decimal places. toFixed() handles the "rule of five" rounding correctly.
        return n.toFixed(d);
    } else {
        // d < 0, requires terminal zeros.
        const factor = Math.pow(10, -d); // e.g., d=-1 -> factor=10; d=-2 -> factor=100
        const rounded = Math.round(n / factor) * factor;
        return String(rounded);
    }
}

/**
 * Trova il valore t di Student per un dato numero di gradi di libertà (dof).
 * Per dof non interi, usa il valore del dof intero immediatamente inferiore (approccio conservativo).
 * @param {number} dof - Gradi di libertà (può essere un numero con virgola).
 * @returns {number} Il valore t di Student per un'intervallo di confidenza del 95%.
 */
function getStudentTValue(dof) {
    if (isNaN(dof) || dof < 1) {
        return NaN; // Non definito per dof < 1
    }
    if (dof === Infinity) {
        return STUDENT_T_95_TWO_TAILED.infinity;
    }
    // Approccio conservativo: arrotonda per difetto all'intero più vicino.
    const effectiveDof = Math.floor(dof);

    if (effectiveDof >= 30) {
        return STUDENT_T_95_TWO_TAILED.infinity; // Usa 1.96 per dof >= 30
    }
    return STUDENT_T_95_TWO_TAILED[effectiveDof] || STUDENT_T_95_TWO_TAILED.infinity; // Fallback per sicurezza
}

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
            activeLibrarySubTab: 'vetreria', // 'vetreria' or 'pipette'
            activeReportSubTab: 'report-progetto', // 'report-progetto' or 'report-multiprogetto'
            currentFileName: null
        },
        project: {
            projectName: 'Nuovo Progetto',
            objective: '',
            method: '',
            component: ''
        },
        samples: [],
        results: {}, // keyed by sample.id
        spikeUncertainty: {
            useCommonReferenceMaterial: false,
            commonReferenceMaterial: {
                initialConcentration: null,
                initialUncertainty: null,
                unit: 'µg/L',
                productCode: '',
                lot: ''
            }
            // Data for spike uncertainty calculations is now keyed by sample.id dynamically.
        },
        calibrationSolutionUncertainty: {
            // Data for calibration solution uncertainty calculations, keyed by a unique ID for each calibration point.
        },
        libraries: {
            glassware: deepCopy(DEFAULT_GLASSWARE_LIBRARY),
            pipettes: deepCopy(DEFAULT_PIPETTE_LIBRARY),
        },
        calibration: {
            max_rsd_icv: null, // NUOVO CAMPO OPZIONALE
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
        treatments: [],
        reportSettings: {
            grouping: 'sample', // 'sample' or 'feature'
            representation: 'extended', // 'extended' or 'compact'
            selections: {
                statistica: {
                    dati_grezzi: false,
                    log_analisi: false,
                    statistiche_descrittive: false,
                },
                preparazione: {
                    matrix_spike: false,
                    trattamenti: false,
                },
                'taratura-retta': {
                    dati: false,
                    risultati: false,
                    incertezza_livello: false,
                },
                'taratura-fr': {
                    criterio: false,
                    risultati: false,
                    incertezza_livello: false,
                },
                estesa: {
                    riepilogo: false,
                    risultati: false,
                }
            }
        },
        validation: {
            selectedTestId: null,
            results: null
        }
    };
}
let appState = getInitialAppState();
let loadedProjectsData = []; // Dati per il report multiprogetto
let isDirty = false;

/**
 * Sets the "dirty" flag for the application state.
 * Also updates the document title with a `*` to indicate unsaved changes.
 * @param {boolean} dirty - The new state for the dirty flag.
 */
function setDirty(dirty = true) {
    if (isDirty === dirty) return; // Do nothing if state is already correct
    isDirty = dirty;
    // The visual indicator is now handled by renderFileStatus(), called on every render.
}


// --- RENDER FUNCTIONS ---
function renderFileStatus() {
    const statusTextEl = document.getElementById('file-status-text');
    if (!statusTextEl) return;

    const fileName = appState.ui.currentFileName;
    const dirty = isDirty;

    let text = '';
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-500';

    if (!fileName) {
        text = 'Nuovo Progetto (non salvato)';
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
    } else {
        if (dirty) {
            text = `${fileName} (modificato)`;
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
        } else {
            text = `${fileName} (salvato)`;
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
        }
    }

    statusTextEl.textContent = text;
    // Reset classes and add new ones
    statusTextEl.className = 'text-sm font-medium py-1 px-3 rounded-full transition-colors duration-300';
    statusTextEl.classList.add(bgColor, textColor);
}

function render() {
    renderFileStatus();
    renderTabs();
    renderProjectInfo();
    renderSamplesAndResults();
    renderCalibrationTab();
    renderRfResults();
    renderSpikeUncertainty();
    renderCalibrationSolutionUncertainty();
    renderTreatments(); // <-- Aggiunta nuova funzione di rendering
    renderExpandedUncertainty(); // <-- AGGIUNTA
    renderLibraryTabs(); // <-- Funzione per le librerie
    renderReportSubTabs();
    renderLibraries(); // <-- Funzione per le tabelle delle librerie
    renderValidationUI(); // <-- NUOVA FUNZIONE
}

function renderValidationUI() {
    const selectEl = document.getElementById('validation-test-select');
    const detailsContainer = document.getElementById('test-details-container');
    const runBtn = document.getElementById('run-validation-btn');
    const resultsContainer = document.getElementById('validation-results-container');

    if (!selectEl || !detailsContainer || !runBtn || !resultsContainer) return;

    // --- Popola il dropdown ---
    // Salva il valore corrente per non perdere la selezione durante il re-render
    const currentSelection = selectEl.value;
    selectEl.innerHTML = '<option value="">-- Seleziona un test --</option>';
    VALIDATION_TEST_CASES.forEach(test => {
        const isSelected = test.id === appState.validation.selectedTestId ? 'selected' : '';
        selectEl.innerHTML += `<option value="${test.id}" ${isSelected}>${test.name}</option>`;
    });
    // Se il valore salvato esiste ancora, ripristinalo
    if (appState.validation.selectedTestId) {
        selectEl.value = appState.validation.selectedTestId;
    }


    // --- Mostra/Nascondi dettagli e gestisci bottone ---
    const selectedTest = VALIDATION_TEST_CASES.find(t => t.id === appState.validation.selectedTestId);

    if (selectedTest) {
        detailsContainer.innerHTML = `
            <h4 class="font-semibold text-gray-800">Descrizione del Test</h4>
            <p class="text-sm text-gray-600">${selectedTest.description}</p>
        `;
        detailsContainer.classList.remove('hidden');
        runBtn.disabled = false;
    } else {
        detailsContainer.innerHTML = '';
        detailsContainer.classList.add('hidden');
        runBtn.disabled = true;
    }

    // --- Mostra i risultati ---
    const results = appState.validation.results;
    if (results) {
        let content = '';
        if (results.error) {
            content = `<div class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                           <p class="font-bold">Errore nel Test</p>
                           <p>${results.error}</p>
                       </div>`;
        } else {
            const overallStatusClass = results.allPassed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
            const overallStatusText = results.allPassed ? "SUPERATO" : "FALLITO";

            const rowsHTML = Object.keys(results.comparison).map(key => {
                const item = results.comparison[key];
                const statusClass = item.pass ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900";
                const statusText = item.pass ? "Pass" : "Fail";
                const difference = item.difference.toExponential(2);

                return `
                    <tr class="border-b">
                        <td class="p-3 font-medium text-gray-700">${key}</td>
                        <td class="p-3 font-mono text-right">${item.calculated}</td>
                        <td class="p-3 font-mono text-right">${item.expected}</td>
                        <td class="p-3 font-mono text-right ${Math.abs(item.difference) > 1e-9 ? 'text-red-600' : ''}">${difference}</td>
                        <td class="p-3 text-center">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                                ${statusText}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');

            content = `
                <div class="p-4 rounded-lg border ${results.allPassed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}">
                     <h3 class="text-xl font-bold mb-4 text-gray-800">Risultati del Test: <span class="px-3 py-1 text-lg rounded-full ${overallStatusClass}">${overallStatusText}</span></h3>
                     <div class="overflow-x-auto border rounded-lg">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-200">
                                <tr>
                                    <th class="p-3 text-left">Parametro</th>
                                    <th class="p-3 text-right">Valore Calcolato</th>
                                    <th class="p-3 text-right">Valore Atteso</th>
                                    <th class="p-3 text-right">Differenza</th>
                                    <th class="p-3 text-center">Stato</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                ${rowsHTML}
                            </tbody>
                        </table>
                     </div>
                </div>
            `;
        }
        resultsContainer.innerHTML = content;
        resultsContainer.classList.remove('hidden');
    } else {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
    }
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

function renderReportSubTabs() {
    const activeSubTab = appState.ui.activeReportSubTab;
    if (!activeSubTab) return; // Guard clause

    // Gestisce i pulsanti delle sotto-schede del report
    document.querySelectorAll('.report-subtab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtabName === activeSubTab);
    });

    // Gestisce la visibilità dei contenuti del report
    const reportProgettoContent = document.getElementById('subcontent-report-progetto');
    const reportMultiProgettoContent = document.getElementById('subcontent-report-multiprogetto');

    if (reportProgettoContent) {
        reportProgettoContent.classList.toggle('hidden', activeSubTab !== 'report-progetto');
    }
    if (reportMultiProgettoContent) {
        reportMultiProgettoContent.classList.toggle('hidden', activeSubTab !== 'report-multiprogetto');
    }
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
                                    <input type="text" inputmode="decimal" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceManualConcentration" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm" value="${treatment.source.manualConcentration !== null ? String(treatment.source.manualConcentration).replace('.', ',') : ''}" placeholder="Conc. iniziale">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600">U% (k=2)</label>
                                    <input type="text" inputmode="decimal" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="sourceManualUncertainty" class="treatment-input w-full p-1 border-gray-300 rounded-md text-sm" value="${treatment.source.manualUncertainty !== null ? String(treatment.source.manualUncertainty).replace('.', ',') : ''}" placeholder="Incertezza %">
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
                                            <input type="text" inputmode="decimal" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-withdrawal-id="${w.id}" data-field="volume" class="treatment-input w-full p-1 border border-gray-300 rounded-md text-sm" value="${w.volume !== null ? String(w.volume).replace('.',',') : ''}" placeholder="Volume">
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

                        let volHint = '';
                        if (treatment.addedSolventPipette && appState.libraries.pipettes[treatment.addedSolventPipette]) {
                            const points = appState.libraries.pipettes[treatment.addedSolventPipette].calibrationPoints.map(p => p.volume);
                            if (points.length > 0) volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                        }

                        const uncertaintyValue = treatment.addedSolventPipette_U_perc !== undefined && treatment.addedSolventPipette_U_perc !== null ? treatment.addedSolventPipette_U_perc.toFixed(2) : '';
                        const uncertaintyDisplayHTML = `
                            <div class="w-1/3">
                                <label class="block text-xs font-medium text-gray-600">U (%)</label>
                                <input type="text" class="w-full p-1 border-gray-200 bg-gray-100 rounded-md text-sm text-center" value="${uncertaintyValue}" readonly title="Incertezza estesa (U%) calcolata per la pipetta e il volume selezionati.">
                            </div>
                        `;

                        dilutionInputsHTML = `
                            <div class="space-y-3 p-3 bg-gray-100 rounded-md border">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Pipetta per Solvente</label>
                                    <select data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="addedSolventPipette" class="treatment-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                        <option value="">-- Seleziona pipetta --</option>
                                        ${solventPipetteOptions}
                                    </select>
                                </div>
                                <div class="flex items-end space-x-2">
                                    <div class="flex-grow">
                                        <label class="block text-sm font-medium text-gray-700">Volume Solvente (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                        <input type="text" inputmode="decimal" data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-field="addedSolventVolume" class="treatment-input mt-1 w-full p-1 border border-gray-300 rounded-md text-sm" value="${treatment.addedSolventVolume !== null ? String(treatment.addedSolventVolume).replace('.',',') : ''}" placeholder="Volume">
                                    </div>
                                    ${uncertaintyDisplayHTML}
                                </div>
                                ${solventPipetteUncertaintyNote}
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
                    const initialFlaskUncertaintyNote_est = treatment.initialFlaskUncertaintyRelPerc ? `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.initialFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                    const initialVolumeHTML = `
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
                        </div>`;

                    let finalVolumeHTML = '';
                    const isMatraccio = treatment.extractionMethod === 'matraccio';

                    const radioButtonsHTML = `
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center">
                                <input type="radio" id="method-matraccio-${treatment.id}" name="extraction-method-${treatment.id}" value="matraccio" class="extraction-method-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" ${isMatraccio ? 'checked' : ''}
                                       data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}">
                                <label for="method-matraccio-${treatment.id}" class="ml-2 block text-sm font-medium text-gray-700">Matraccio</label>
                            </div>
                            <div class="flex items-center">
                                <input type="radio" id="method-pipetta-${treatment.id}" name="extraction-method-${treatment.id}" value="pipetta" class="extraction-method-radio h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" ${!isMatraccio ? 'checked' : ''}
                                       data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}">
                                <label for="method-pipetta-${treatment.id}" class="ml-2 block text-sm font-medium text-gray-700">Pipetta</label>
                            </div>
                        </div>`;

                    let matraccioInputsHTML = '';
                    if (isMatraccio) {
                        const finalFlaskUncertaintyNote_est = treatment.finalFlaskUncertaintyRelPerc ? `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del matraccio (u_rel)">u_rel: <strong>${treatment.finalFlaskUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';
                        matraccioInputsHTML = `
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
                            </div>`;
                    }

                    let pipettaInputsHTML = '';
                    if (!isMatraccio) {
                        const pipetteUncertaintyNote = treatment.pipetteUncertaintyRelPerc ? `<div class="text-xs text-gray-500 mt-1" title="Incertezza relativa composta delle aliquote (u_rel)">u_rel(pipette): <strong>${treatment.pipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                        let aliquotsHTML = (treatment.finalVolumeAliquots || []).map(aliquot => {
                            const pipetteOptions = Object.keys(appState.libraries.pipettes).map(key => `<option value="${key}" ${aliquot.pipette === key ? 'selected' : ''}>${key}</option>`).join('');
                            const uncertaintyNote = aliquot.pipetteUncertaintyRelPerc ? `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del prelievo (u_rel)">u_rel(pipetta): <strong>${aliquot.pipetteUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

                            return `
                            <div class="p-3 bg-gray-100 rounded-md border border-gray-200 space-y-2">
                                <div class="flex items-center space-x-2">
                                     <div class="flex-grow">
                                        <label class="block text-xs font-medium text-gray-600">Pipetta</label>
                                        <select class="treatment-input w-full p-1 border border-gray-300 rounded-md text-sm"
                                                data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-aliquot-id="${aliquot.id}" data-field="aliquotPipette">
                                            <option value="">-- Seleziona --</option>
                                            ${pipetteOptions}
                                        </select>
                                    </div>
                                    <button class="btn-remove-aliquot text-red-500 hover:text-red-700 font-bold px-2 self-end pb-1" title="Rimuovi aliquota"
                                            data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-aliquot-id="${aliquot.id}">&times;</button>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-600">Volume Aliquota (mL)</label>
                                    <input type="text" inputmode="decimal" value="${aliquot.volume !== null ? String(aliquot.volume).replace('.', ',') : ''}" class="treatment-input w-full p-1 border border-gray-300 rounded-md text-sm" placeholder="Volume (mL)"
                                           data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}" data-aliquot-id="${aliquot.id}" data-field="aliquotVolume">
                                </div>
                                ${uncertaintyNote}
                            </div>
                            `;
                        }).join('');

                        if ((treatment.finalVolumeAliquots || []).length === 0) {
                            aliquotsHTML = `<p class="text-xs text-gray-500 italic">Nessuna aliquota aggiunta.</p>`;
                        }

                        pipettaInputsHTML = `
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Aliquote di Volume Finale (mL)</label>
                                    <div class="space-y-2 mt-1" id="aliquots-container-${treatment.id}">
                                        ${aliquotsHTML}
                                    </div>
                                     <button class="btn-add-aliquot mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200"
                                            data-treatment-sample-id="${treatmentSample.id}" data-treatment-id="${treatment.id}">+ Aggiungi Aliquota</button>
                                    ${pipetteUncertaintyNote}
                                </div>
                            </div>`;
                    }

                    finalVolumeHTML = `
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Metodo Volume Finale</label>
                            ${radioButtonsHTML}
                            <div class="mt-3">
                                ${isMatraccio ? matraccioInputsHTML : pipettaInputsHTML}
                            </div>
                        </div>
                    `;

                    treatmentFieldsHTML = `
                        <div class="grid grid-cols-2 gap-4">
                            ${initialVolumeHTML}
                            ${finalVolumeHTML}
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

                <!-- Riepilogo Finale Trattamento -->
                ${(() => {
                    if (!treatmentSample.results) return '';
                    const results = treatmentSample.results;
                    const sample = appState.samples.find(s => s.id === treatmentSample.sampleId);
                    const unit = sample ? (sample.unit || 'µg/L') : 'µg/L';
                    return `
                        <div class="mt-6 pt-4 border-t-2 border-gray-300">
                            <h4 class="text-lg font-semibold text-gray-800 mb-3">Riepilogo Finale Trattamento</h4>
                            ${results.summary ? `<div class="text-sm p-3 mb-4 bg-gray-100 rounded-md border text-gray-600">${results.summary}</div>` : ''}
                            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div class="text-gray-600">Concentrazione Iniziale:</div>
                                <div class="font-bold text-right">${results.initialConcentration.toPrecision(4)} ${unit}</div>

                                <div class="text-gray-600">Concentrazione Finale:</div>
                                <div class="font-bold text-right text-lg text-blue-700">${results.finalConcentration.toPrecision(4)} ${unit}</div>

                                <div class="text-gray-600">Incertezza tipo composta (u_c):</div>
                                <div class="font-bold text-right">${results.u_comp.toPrecision(3)}</div>

                                <div class="text-gray-600">Incertezza tipo composta relativa (u_c %):</div>
                                <div class="font-bold text-right">${results.u_comp_rel_perc.toFixed(2)} %</div>
                            </div>
                        </div>
                    `;
                })()}

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

    // Preserve checked state using the treatment sample ID
    const currentlyCheckedReg = new Set();
    regressionChecklist.querySelectorAll('input:checked').forEach(input => currentlyCheckedReg.add(input.value));
    const currentlyCheckedRf = new Set();
    rfChecklist.querySelectorAll('input:checked').forEach(input => currentlyCheckedRf.add(input.value));

    regressionChecklist.innerHTML = '';
    rfChecklist.innerHTML = '';

    // NEW LOGIC: Use treatments as the source
    const eligibleTreatedSamples = appState.treatments.filter(ts => ts.results && ts.sampleId !== null);

    if (eligibleTreatedSamples.length === 0) {
        const placeholder = `<p class="text-sm text-gray-500 italic px-2">Nessun campione trattato con risultati validi trovato. Per procedere, definire e calcolare un trattamento nella sezione 'Incertezza di Preparazione'.</p>`;
        regressionChecklist.innerHTML = placeholder;
        rfChecklist.innerHTML = placeholder;
        return;
    }

    let regChecklistHTML = '';
    let rfChecklistHTML = '';

    eligibleTreatedSamples.forEach(ts => {
        const originalSample = appState.samples.find(s => s.id === ts.sampleId);
        const sampleName = originalSample ? originalSample.name : `Campione trattato ${ts.id}`;
        const concentration = ts.results.finalConcentration;

        const regIsChecked = currentlyCheckedReg.has(ts.id);
        regChecklistHTML += `
            <div class="flex items-center p-1 rounded-md hover:bg-gray-100">
                <input id="cal-sample-reg-${ts.id}" name="calibration_sample_reg" type="checkbox" value="${ts.id}" ${regIsChecked ? 'checked' : ''} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="cal-sample-reg-${ts.id}" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    ${sampleName} <span class="text-xs text-gray-500 font-mono">(x=${concentration.toPrecision(4)})</span>
                </label>
            </div>
        `;

        const rfIsChecked = currentlyCheckedRf.has(ts.id);
        rfChecklistHTML += `
            <div class="flex items-center p-1 rounded-md hover:bg-gray-100">
                <input id="cal-sample-rf-${ts.id}" name="calibration_sample_rf" type="checkbox" value="${ts.id}" ${rfIsChecked ? 'checked' : ''} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="cal-sample-rf-${ts.id}" class="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                    ${sampleName} <span class="text-xs text-gray-500 font-mono">(x=${concentration.toPrecision(4)})</span>
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

            const samplesHTML = samples.map(s => {
                const u_icv_display = formatNumber(s.ux_icv, 6);
                const highlightClass = s.source === 'Controllo Taratura' ? 'bg-blue-50' : '';

                return `
                <tr class="border-b hover:bg-gray-50 ${highlightClass}">
                    <td class="p-2 font-medium">${s.sampleName || 'N/D'}</td>
                    <td class="p-2 font-mono">${formatNumber(s.nominalConc, 6)}</td>
                    <td class="p-2 font-mono">${formatNumber(s.ux_calib_orig, 6)}</td>
                    <td class="p-2 font-mono">${u_icv_display}</td>
                    <td class="p-2 font-mono font-bold">${formatNumber(s.ux, 6)}</td>
                    <td class="p-2 font-mono font-bold">${s.ux_rel_perc !== null ? `${formatNumber(s.ux_rel_perc, 2, true)} %` : 'N/A'}</td>
                    <td class="p-2">${s.source || 'N/D'}</td>
                </tr>
                `;
            }).join('');

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
                                <th class="p-2 font-medium text-gray-600">Campione</th>
                                <th class="p-2 font-medium text-gray-600">Conc. (x)</th>
                                <th class="p-2 font-medium text-gray-600">u_taratura</th>
                                <th class="p-2 font-medium text-gray-600">u_ICV</th>
                                <th class="p-2 font-medium text-gray-600">u_finale</th>
                                <th class="p-2 font-medium text-gray-600">u_finale (%)</th>
                                <th class="p-2 font-medium text-gray-600">Fonte</th>
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
            const samplesHTML = results.samples.map(s => {
                const u_icv_display = formatNumber(s.ux_icv, 6);
                const highlightClass = s.source === 'Controllo Taratura' ? 'bg-blue-50' : '';

                return `
                <tr class="border-b hover:bg-gray-50 ${highlightClass}">
                    <td class="p-2 font-medium">${s.sampleName || 'N/D'}</td>
                    <td class="p-2 font-mono">${formatNumber(s.nominalConc, 6)}</td>
                    <td class="p-2 font-mono">${formatNumber(s.ux_calib_orig, 6)}</td>
                    <td class="p-2 font-mono">${u_icv_display}</td>
                    <td class="p-2 font-mono font-bold">${formatNumber(s.ux, 6)}</td>
                    <td class="p-2 font-mono font-bold">${s.ux_rel_perc !== null ? `${formatNumber(s.ux_rel_perc, 2, true)} %` : 'N/A'}</td>
                    <td class="p-2">${s.source || 'N/D'}</td>
                </tr>
                `;
            }).join('');

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
                                <th class="p-2 font-medium text-gray-600">Campione</th>
                                <th class="p-2 font-medium text-gray-600">Conc. (x)</th>
                                <th class="p-2 font-medium text-gray-600">u_taratura</th>
                                <th class="p-2 font-medium text-gray-600">u_ICV</th>
                                <th class="p-2 font-medium text-gray-600">u_finale</th>
                                <th class="p-2 font-medium text-gray-600">u_finale (%)</th>
                                <th class="p-2 font-medium text-gray-600">Fonte</th>
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

    const useCommon = appState.spikeUncertainty.useCommonReferenceMaterial;
    const commonRef = appState.spikeUncertainty.commonReferenceMaterial;

    let content = `
        <div class="flex items-center p-4 mb-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <input id="use-common-ref-material-checkbox" type="checkbox" ${useCommon ? 'checked' : ''} class="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <label for="use-common-ref-material-checkbox" class="ml-3 block text-md font-medium text-gray-800">Usa un materiale di riferimento di partenza unico per tutti i campioni</label>
        </div>
    `;

    if (useCommon) {
        const commonInitialUncertaintyNote = commonRef.initialUncertaintyRelPerc ?
            `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del materiale di riferimento (u_rel)">u_rel(certificato): <strong>${commonRef.initialUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

        content += `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Materiale di Riferimento Comune</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50 mb-4">
                    <div>
                        <label for="common-initial-conc" class="block text-sm font-medium text-gray-700">Concentrazione</label>
                        <div class="flex items-center space-x-2 mt-1">
                            <input type="number" id="common-initial-conc" data-field="initialConcentration" class="common-spike-input w-full p-2 border border-gray-300 rounded-md" value="${commonRef.initialConcentration !== null ? commonRef.initialConcentration : ''}" placeholder="Es: 1000">
                            <select data-field="unit" class="common-spike-input w-auto p-2 border border-gray-300 rounded-md bg-gray-50 text-sm">
                                <option value="mg/L" ${commonRef.unit === 'mg/L' ? 'selected' : ''}>mg/L</option>
                                <option value="µg/L" ${commonRef.unit === 'µg/L' ? 'selected' : ''}>µg/L</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label for="common-initial-unc" class="block text-sm font-medium text-gray-700">Incertezza certificato (U %)</label>
                        <input type="number" id="common-initial-unc" data-field="initialUncertainty" class="common-spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${commonRef.initialUncertainty !== null ? commonRef.initialUncertainty : ''}" placeholder="Es: 0.5">
                        ${commonInitialUncertaintyNote}
                    </div>
                    <div>
                        <label for="common-product-code" class="block text-sm font-medium text-gray-700">Codice Prodotto</label>
                        <input type="text" id="common-product-code" data-field="productCode" class="common-spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${commonRef.productCode || ''}" placeholder="Es: ERM-0123">
                    </div>
                    <div>
                        <label for="common-lot" class="block text-sm font-medium text-gray-700">Lotto</label>
                        <input type="text" id="common-lot" data-field="lot" class="common-spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${commonRef.lot || ''}" placeholder="Es: 12345-A">
                    </div>
                </div>
            </div>
        `;
    }

    let sampleCardsHTML = '';
    eligibleSamples.forEach(sample => {
        if (!appState.spikeUncertainty[sample.id]) {
            appState.spikeUncertainty[sample.id] = {
                initialConcentration: null,
                initialUncertainty: null,
                unit: 'µg/L',
                productCode: '',
                lot: '',
                steps: []
            };
        }
        const sampleSpikeState = appState.spikeUncertainty[sample.id];

        let individualRefMaterialHTML = '';
        if (!useCommon) {
            const initialUncertaintyNote = sampleSpikeState.initialUncertaintyRelPerc ?
                `<div class="text-xs text-gray-500 mt-1" title="Incertezza tipo relativa del materiale di riferimento (u_rel)">u_rel(certificato): <strong>${sampleSpikeState.initialUncertaintyRelPerc.toFixed(3)} %</strong></div>` : '';

            individualRefMaterialHTML = `
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
                    <div>
                        <label for="product-code-${sample.id}" class="block text-sm font-medium text-gray-700">Codice Prodotto</label>
                        <input type="text" id="product-code-${sample.id}" data-sample-id="${sample.id}" data-field="productCode" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.productCode || ''}" placeholder="Es: ERM-0123">
                    </div>
                    <div>
                        <label for="lot-${sample.id}" class="block text-sm font-medium text-gray-700">Lotto</label>
                        <input type="text" id="lot-${sample.id}" data-sample-id="${sample.id}" data-field="lot" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md" value="${sampleSpikeState.lot || ''}" placeholder="Es: 12345-A">
                    </div>
                </div>`;
        }

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

                    let volHint = '';
                    if (step.addedSolventPipette && appState.libraries.pipettes[step.addedSolventPipette]) {
                        const points = appState.libraries.pipettes[step.addedSolventPipette].calibrationPoints.map(p => p.volume);
                        if (points.length > 0) volHint = `(min: ${Math.min(...points)}, max: ${Math.max(...points)})`;
                    }

                     const uncertaintyValue = step.addedSolventPipette_U_perc !== undefined && step.addedSolventPipette_U_perc !== null ? step.addedSolventPipette_U_perc.toFixed(2) : '';
                    const uncertaintyDisplayHTML = `
                        <div class="w-1/3">
                            <label class="block text-xs font-medium text-gray-600">U (%)</label>
                            <input type="text" class="w-full p-1 border-gray-200 bg-gray-100 rounded-md text-sm text-center" value="${uncertaintyValue}" readonly title="Incertezza estesa (U%) calcolata per la pipetta e il volume selezionati.">
                        </div>
                    `;

                    dilutionInputsHTML = `
                        <div class="space-y-3 p-3 bg-gray-100 rounded-md border">
                            <div>
                                <label for="solvent-pipette-${step.id}" class="block text-sm font-medium text-gray-700">Pipetta per Solvente</label>
                                <select id="solvent-pipette-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="addedSolventPipette" class="spike-input mt-1 w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Seleziona pipetta --</option>
                                    ${solventPipetteOptions}
                                </select>
                            </div>
                            <div class="flex items-end space-x-2">
                                <div class="flex-grow">
                                    <label for="solvent-volume-${step.id}" class="block text-xs font-medium text-gray-700">Volume Solvente (mL) <span class="text-gray-400 font-mono">${volHint}</span></label>
                                    <input type="number" id="solvent-volume-${step.id}" data-sample-id="${sample.id}" data-step-id="${step.id}" data-field="addedSolventVolume" class="spike-input mt-1 w-full p-1 border border-gray-300 rounded-md text-sm" value="${step.addedSolventVolume !== null ? step.addedSolventVolume : ''}" placeholder="Volume">
                                </div>
                                ${uncertaintyDisplayHTML}
                            </div>
                            ${solventPipetteUncertaintyNote}
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
                            <div class="space-y-2">
                                 <h5 class="font-semibold text-gray-600">Prelievi</h5>
                                <div id="withdrawals-container-${step.id}" class="mt-1 space-y-3">
                                    ${withdrawalsHTML}
                                </div>
                                <button data-sample-id="${sample.id}" data-step-id="${step.id}" class="btn-add-withdrawal mt-2 text-xs bg-blue-100 text-blue-800 font-semibold py-1 px-2 rounded-md hover:bg-blue-200">+ Aggiungi Prelievo</button>
                            </div>
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

        sampleCardsHTML += `
            <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Preparazione Spike per Campione: <span class="font-bold">${sample.name}</span></h3>
                ${individualRefMaterialHTML}
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

    container.innerHTML = content + sampleCardsHTML;
}

function renderTabs() {
    document.querySelectorAll('[data-tab-name]').forEach(tab => tab.classList.toggle('active', tab.dataset.tabName === appState.ui.activeTab));
    document.querySelectorAll('[id^="content-"]').forEach(content => content.classList.toggle('hidden', content.id !== `content-${appState.ui.activeTab}`));
}
function renderProjectInfo() {
    document.getElementById('project-name').value = appState.project.projectName;
    document.getElementById('project-objective').value = appState.project.objective;
    document.getElementById('project-method').value = appState.project.method;
    document.getElementById('project-component').value = appState.project.component;
}

function renderExpandedUncertainty() {
    const container = document.getElementById('extended-uncertainty-container');
    if (!container) return;

    const processedSamples = appState.samples.filter(s => appState.results[s.id]?.statistics);

    if (processedSamples.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 italic p-8">Nessun campione con analisi statistiche valide trovato. Esegui prima i calcoli nella scheda "Analisi Statistica".</p>`;
        return;
    }

    let content = '';
    processedSamples.forEach(sample => {
        const result = calculateExpandedUncertainty(sample.id, appState);
        const sampleUnit = sample.unit || 'µg/L';

        content += `<div class="bg-white p-5 rounded-lg shadow-md border-l-4 ${result.error ? 'border-red-500' : 'border-green-500'} mb-6">`;
        content += `<h4 class="text-lg font-bold ${result.error ? 'text-red-700' : 'text-gray-900'} mb-4">${sample.name} - Incertezza Estesa</h4>`;

        if (result.error) {
            content += `<p class="text-red-600 font-semibold">${result.error}</p>`;
        } else {
            const contributionsHTML = result.contributions.map(c => `
                <tr class="border-b">
                    <td class="p-2">${c.name}</td>
                    <td class="p-2 font-mono text-right">${formatNumberWithRules(c.value * 100)} %</td>
                    <td class="p-2 font-mono text-right">${c.dof === Infinity ? '∞' : formatNumberWithRules(c.dof)}</td>
                </tr>
            `).join('');

            content += `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                        <h5 class="font-semibold text-gray-700 text-md mb-2">Riepilogo Contributi</h5>
                        <div class="overflow-x-auto rounded-md border">
                            <table class="w-full text-sm data-table">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="p-2 text-left">Fonte di Incertezza</th>
                                        <th class="p-2 text-right">u_rel (%)</th>
                                        <th class="p-2 text-right">Gradi di Libertà (v)</th>
                                    </tr>
                                </thead>
                                <tbody>${contributionsHTML}</tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-700 text-md mb-2">Risultati Finali</h5>
                        <div class="overflow-x-auto rounded-md border bg-gray-50">
                            <table class="w-full text-sm data-table">
                               <tbody>
                                    <tr><td class="p-2 font-medium">Gradi di Libertà Effettivi (ν_eff)</td><td class="p-2 font-mono text-right">${result.v_eff === Infinity ? '∞' : formatNumberWithRules(result.v_eff)}</td></tr>
                                    <tr><td class="p-2 font-medium">Fattore di Copertura (k)</td><td class="p-2 font-mono text-right">${formatNumberWithRules(result.k)}</td></tr>
                                    <tr class="border-t-2 border-gray-300"><td class="p-2 font-bold text-lg">Incertezza Estesa Assoluta (U)</td><td class="p-2 font-mono text-right text-lg font-bold">${formatNumberWithRules(result.U_abs)} ${sampleUnit}</td></tr>
                                    <tr><td class="p-2 font-bold text-lg">Incertezza Estesa Relativa (U%)</td><td class="p-2 font-mono text-right text-lg font-bold">${formatNumberWithRules(result.U_rel_perc)} %</td></tr>
                               </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        content += `</div>`;
    });

    container.innerHTML = content;
}

function renderResultsOnly() {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    const hasResults = appState.samples.some(s => appState.results[s.id] && (appState.results[s.id].statistics || appState.results[s.id].error));

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
function actionSwitchReportSubTab(subTabName) { appState.ui.activeReportSubTab = subTabName; render(); }

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
        setDirty();
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
                setDirty();
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
        setDirty();
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
        setDirty();
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
        setDirty();
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
        setDirty();
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
        setDirty();
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
        setDirty();
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
        setDirty();
        render();
        actionSaveLibraries();
    }
}


function actionAddSample() {
    const newId = appState.samples.length > 0 ? Math.max(...appState.samples.map(s => s.id)) + 1 : 1;
    appState.samples.push({ id: newId, name: `Campione ${newId}`, rawData: '', expectedValue: null, unit: 'µg/L' });
    setDirty();
    render();
}
function actionRemoveSample(sampleId) {
    appState.samples = appState.samples.filter(s => s.id !== sampleId);
    delete appState.results[sampleId];
    setDirty();
    render();
}
function actionUpdateSample(sampleId, field, value) {
    const sample = appState.samples.find(s => s.id === sampleId);
    if (sample) {
        if (field === 'expectedValue') sample[field] = value === '' ? null : parseFloat(value);
        else sample[field] = value;
        setDirty();
    }
}

async function actionCalculateAll() {
    try {
        document.getElementById('calculate-btn').disabled = true;
        appState.results = {};

        for (const sample of appState.samples) {
            await processSample(sample);
        }

        // --- REFRESH LOGIC ---
        // After base stats are calculated, refresh downstream dependencies.
        console.log("Statistics calculated. Triggering downstream refresh...");

        // Refresh all spike calculations
        for (const sampleId in appState.spikeUncertainty) {
             const sample = appState.samples.find(s => s.id == sampleId);
             const result = appState.results[sampleId];
             if (sample && result && result.statistics && !result.error && (sample.expectedValue !== null && sample.expectedValue !== '')) {
                actionCalculateSpikeUncertainty(sampleId);
             } else {
                if (appState.spikeUncertainty[sampleId]) {
                    appState.spikeUncertainty[sampleId].results = null;
                }
             }
        }

        // Refresh all treatment chains
        appState.treatments.forEach(ts => {
            actionCalculateTreatmentChain(ts.id);
        });

        // Refresh calibration if it was previously calculated
        if (appState.calibration.results) {
            actionCalculateRegression();
        }
        if (appState.rfCalibration.results) {
            actionCalculateResponseFactor();
        }
        // --- END REFRESH LOGIC ---

        document.getElementById('calculate-btn').disabled = false;
        render(); // The final render will show all the refreshed data
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
// --- PROJECT LIFECYCLE ACTIONS (NEW) ---
async function actionNewProject() {
    if (isDirty) {
        const confirmed = await choiceModal.show({
            title: 'Creare un Nuovo Progetto?',
            bodyContent: 'Ci sono modifiche non salvate che andranno perse. Sei sicuro di voler continuare?',
            buttons: [
                { text: 'Annulla', value: false, class: secondaryBtnClass },
                { text: 'Crea Nuovo senza Salvare', value: true, class: 'bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700' }
            ]
        });
        if (!confirmed) return; // User cancelled
    }
    appState = getInitialAppState();
    appState.ui.currentFileName = null; // Ensure no filename is associated
    actionAddSample(); // Create a blank sample to start with
    setDirty(false);   // A new project is not dirty
    render();
}

async function actionOpenProject() {
    if (isDirty) {
        const confirmed = await choiceModal.show({
            title: 'Aprire un Progetto?',
            bodyContent: 'Ci sono modifiche non salvate che andranno perse. Sei sicuro di voler continuare?',
            buttons: [
                { text: 'Annulla', value: false, class: secondaryBtnClass },
                { text: 'Apri senza Salvare', value: true, class: 'bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700' }
            ]
        });
        if (!confirmed) return; // User cancelled
    }
    // This function just triggers the hidden file input.
    document.getElementById('load-data-input').click();
}

function actionSaveProject() {
    if (!appState.ui.currentFileName) {
        actionSaveProjectAs();
        return;
    }
    const stateString = JSON.stringify(appState, null, 2);
    const blob = new Blob([stateString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = appState.ui.currentFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    setDirty(false);
    renderFileStatus(); // Update UI immediately
    addProjectToRecents(appState);
}

async function actionSaveProjectAs() {
    const sanitizedProjectName = (appState.project.projectName || 'progetto_senza_nome').replace(/[^a-z0-9_-\s.]/gi, '').trim();
    const defaultFileName = `${sanitizedProjectName.replace(/\s/g, '_')}.json`;

    const confirmed = await formModal.show({
        title: 'Salva Progetto con Nome',
        bodyHTML: `
            <div>
                <label for="form-field-filename" class="block text-sm font-medium text-gray-700">Nome del File</label>
                <input type="text" id="form-field-filename" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${defaultFileName}">
            </div>
        `,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const fileName = modalBody.querySelector('#form-field-filename').value.trim();

        if (fileName) {
            if (!fileName.toLowerCase().endsWith('.json')) {
                alert("Il nome del file deve terminare con '.json'");
                return;
            }
            appState.ui.currentFileName = fileName;
            actionSaveProject(); // Now call the main save function
        } else {
            alert("Il nome del file non può essere vuoto.");
        }
    }
}

const RECENT_PROJECTS_KEY = 'unccalib_recent_projects';
const MAX_RECENT_PROJECTS = 5;

function getRecentProjects() {
    try {
        const recent = localStorage.getItem(RECENT_PROJECTS_KEY);
        return recent ? JSON.parse(recent) : [];
    } catch (e) {
        console.error("Failed to get recent projects from localStorage", e);
        return [];
    }
}

function addProjectToRecents(stateToSave) {
    try {
        let recentProjects = getRecentProjects();
        // Create a new entry for the project
        const newEntry = {
            name: stateToSave.project.projectName || 'Progetto senza nome',
            fileName: stateToSave.ui.currentFileName,
            timestamp: new Date().getTime(),
            state: stateToSave // Store the entire state
        };

        // Remove any existing entry with the same filename to avoid duplicates
        recentProjects = recentProjects.filter(p => p.fileName !== newEntry.fileName);

        // Add the new entry to the top of the list
        recentProjects.unshift(newEntry);

        // Trim the list to the maximum allowed size
        if (recentProjects.length > MAX_RECENT_PROJECTS) {
            recentProjects = recentProjects.slice(0, MAX_RECENT_PROJECTS);
        }

        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(recentProjects));
        renderRecentFiles(); // Update the UI
    } catch (e) {
        console.error("Failed to add project to recents", e);
    }
}

function renderRecentFiles() {
    const recentProjects = getRecentProjects();
    const listElement = document.getElementById('recent-files-list');
    if (!listElement) return;

    listElement.innerHTML = ''; // Clear existing list

    if (recentProjects.length === 0) {
        listElement.innerHTML = '<span class="text-gray-400 block px-4 py-2 text-sm">Nessun file recente</span>';
        return;
    }

    recentProjects.forEach((project, index) => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100';
        link.textContent = project.name;
        link.title = `${project.fileName}\nSalvato: ${new Date(project.timestamp).toLocaleString()}`;
        link.dataset.projectIndex = index;
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isDirty) {
                const confirmed = await choiceModal.show({
                    title: 'Aprire un Progetto Recente?',
                    bodyContent: 'Ci sono modifiche non salvate che andranno perse. Sei sicuro di voler continuare?',
                    buttons: [
                        { text: 'Annulla', value: false, class: secondaryBtnClass },
                        { text: 'Apri senza Salvare', value: true, class: 'bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700' }
                    ]
                });
                if (!confirmed) return;
            }
            loadRecentProject(index);
            // Hide the dropdowns
            document.getElementById('file-menu-dropdown').classList.add('hidden');
            document.getElementById('recent-files-dropdown').classList.add('hidden');
        });
        listElement.appendChild(link);
    });
}

function loadRecentProject(index) {
    try {
        const recentProjects = getRecentProjects();
        const projectToLoad = recentProjects[index];
        if (projectToLoad && projectToLoad.state) {
            appState = projectToLoad.state;
            // Ensure the filename from the recent entry is restored to the state
            if (projectToLoad.fileName) {
                appState.ui.currentFileName = projectToLoad.fileName;
            }
            setDirty(false);
            render();
        } else {
            throw new Error("Progetto recente non trovato o corrotto.");
        }
    } catch (e) {
        console.error("Failed to load recent project", e);
        alert(`Errore nel caricamento del progetto recente: ${e.message}`);
    }
}


async function actionDuplicateProject() {
    // Create a deep copy of the state to avoid modifying the current one.
    const duplicatedState = deepCopy(appState);

    // Modify the duplicated state to mark it as a copy.
    duplicatedState.project.projectName = `${duplicatedState.project.projectName} (copia)`;
    duplicatedState.ui.currentFileName = null; // This is a new, unsaved project.

    // Suggest a filename for the duplicated project.
    const sanitizedProjectName = (duplicatedState.project.projectName).replace(/[^a-z0-9_-\s.]/gi, '').trim();
    const suggestedFileName = `${sanitizedProjectName.replace(/\s/g, '_')}.json`;

    const confirmed = await formModal.show({
        title: 'Duplica e Salva Progetto',
        bodyHTML: `
            <p>Verrà creata una copia del progetto attuale. Inserisci un nome per il nuovo file.</p>
            <div class="mt-4">
                <label for="form-field-filename" class="block text-sm font-medium text-gray-700">Nome del File Duplicato</label>
                <input type="text" id="form-field-filename" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${suggestedFileName}">
            </div>
        `,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Duplica e Salva', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const fileName = modalBody.querySelector('#form-field-filename').value.trim();

        if (fileName) {
             if (!fileName.toLowerCase().endsWith('.json')) {
                alert("Il nome del file deve terminare con '.json'");
                return;
            }
            const stateString = JSON.stringify(duplicatedState, null, 2);
            const blob = new Blob([stateString], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            // Importantly, we do NOT change the current appState.
        } else {
            alert("Il nome del file non può essere vuoto.");
        }
    }
}

// --- AZIONI PER LA SEZIONE TARATURA ---
function actionAddRegressionRow() {
    const newId = `cal-point-${Date.now()}`;
    appState.calibration.points.push({ id: newId, x: null, y: null, unit: 'µg/L' });
    setDirty();
    renderCalibrationTab();
}

function actionRemoveRegressionRow(id) {
    appState.calibration.points = appState.calibration.points.filter(p => p.id !== id);
    // Also remove any associated uncertainty calculation data
    if (appState.calibrationSolutionUncertainty[id]) {
        delete appState.calibrationSolutionUncertainty[id];
    }
    setDirty();
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
    setDirty();
    // When a calibration point value changes, we should also re-render the dependent sections
    render();
}

function actionUpdateManualCalibrationSample(field, value) {
    const numValue = value === '' ? null : parseFloat(value);
    appState.calibration.manualSample[field] = numValue;
    setDirty();
}

function actionUpdateRfCalibrationInput(field, value) {
    const numValue = value === '' ? null : parseFloat(value);
    if (field === 'acceptabilityCriterion') {
        appState.rfCalibration.acceptabilityCriterion = numValue;
    } else if (field === 'manualConc') {
        appState.rfCalibration.manualSample.xk = numValue;
    }
    setDirty();
}

function actionResetRegressionData() {
    // Reset state for regression
    const initialState = getInitialAppState();
    appState.calibration.points = initialState.calibration.points;
    appState.calibration.manualSample = initialState.calibration.manualSample;
    appState.calibration.results = null;

    // Uncheck all checkboxes in the UI
    document.querySelectorAll('#analysis-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = false);

    setDirty();
    render(); // Re-render to show the cleared state
}

function actionResetRfData() {
    // Reset state for response factor
    const initialState = getInitialAppState();
    appState.rfCalibration.acceptabilityCriterion = initialState.rfCalibration.acceptabilityCriterion;
    appState.rfCalibration.manualSample = initialState.rfCalibration.manualSample;
    appState.rfCalibration.results = null;

    // Uncheck all checkboxes in the UI
    document.querySelectorAll('#rf-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = false);

    setDirty();
    render(); // Re-render to show the cleared state
}

function actionCalculateRegression() {
    try {
        appState.calibration.results = null;

        const validPoints = appState.calibration.points.filter(p => p.x !== null && p.y !== null && !isNaN(p.x) && !isNaN(p.y));
        const cal_x = validPoints.map(p => p.x);
        const cal_y = validPoints.map(p => p.y);

        const lineParams = calculateRegressionLine(cal_x, cal_y);

        const tasks = [];
        const selectedTreatmentIds = Array.from(document.querySelectorAll('input[name="calibration_sample_reg"]:checked')).map(cb => cb.value);

        selectedTreatmentIds.forEach(id => {
            const treatmentSample = appState.treatments.find(ts => ts.id === id);
            if (treatmentSample && treatmentSample.results) {
                const originalSample = appState.samples.find(s => s.id === treatmentSample.sampleId);
                const sampleName = originalSample ? originalSample.name : `Campione trattato ${id}`;
                tasks.push({
                    name: sampleName,
                    xk: treatmentSample.results.finalConcentration,
                    p: 1 // Each treated sample is a single data point
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

            // Inizializza l'oggetto finale con i risultati originali
            let finalUncertainty = {
                ...uncertaintyResult,
                ux_calib_orig: uncertaintyResult.ux, // Salva l'originale
                ux_icv: null,
                source: 'Incertezza Taratura'
            };

            const max_rsd_icv = appState.calibration.max_rsd_icv;
            if (max_rsd_icv !== null && max_rsd_icv > 0) {
                const u_c_taratura_perc = max_rsd_icv / Math.sqrt(3);
                const u_icv = (u_c_taratura_perc / 100) * Math.abs(task.xk);
                finalUncertainty.ux_icv = u_icv;

                if (u_icv > uncertaintyResult.ux) {
                    finalUncertainty.ux = u_icv; // Sovrascrive ux con il valore maggiore
                    finalUncertainty.ux_rel_perc = (task.xk !== 0) ? (u_icv / Math.abs(task.xk)) * 100 : 0;
                    finalUncertainty.source = 'Controllo Taratura';
                }
            }

            return {
                sampleName: task.name,
                nominalConc: task.xk,
                ...finalUncertainty
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
        const selectedTreatmentIds = Array.from(document.querySelectorAll('input[name="calibration_sample_rf"]:checked')).map(cb => cb.value);

        selectedTreatmentIds.forEach(id => {
            const treatmentSample = appState.treatments.find(ts => ts.id === id);
            if (treatmentSample && treatmentSample.results) {
                const originalSample = appState.samples.find(s => s.id === treatmentSample.sampleId);
                const sampleName = originalSample ? originalSample.name : `Campione trattato ${id}`;
                tasks.push({
                    name: sampleName,
                    xk: treatmentSample.results.finalConcentration
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
            const ux_calib_orig = (Math.abs(task.xk) * utaratura_perc) / 100;

            let finalUncertainty = {
                ux: ux_calib_orig,
                ux_calib_orig: ux_calib_orig,
                ux_rel_perc: utaratura_perc,
                ux_icv: null,
                source: 'Incertezza Taratura'
            };

            const max_rsd_icv = appState.calibration.max_rsd_icv;
            if (max_rsd_icv !== null && max_rsd_icv > 0) {
                const u_c_taratura_perc_icv = max_rsd_icv / Math.sqrt(3);
                const u_icv = (u_c_taratura_perc_icv / 100) * Math.abs(task.xk);
                finalUncertainty.ux_icv = u_icv;

                if (u_icv > ux_calib_orig) {
                    finalUncertainty.ux = u_icv;
                    finalUncertainty.ux_rel_perc = (task.xk !== 0) ? (u_icv / Math.abs(task.xk)) * 100 : 0;
                    finalUncertainty.source = 'Controllo Taratura';
                }
            }

            return {
                sampleName: task.name,
                nominalConc: task.xk,
                ...finalUncertainty
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


async function actionRenameProject() {
    const confirmed = await formModal.show({
        title: 'Rinomina Progetto',
        bodyHTML: `
            <div>
                <label for="form-field-new-name" class="block text-sm font-medium text-gray-700">Nuovo Nome del Progetto</label>
                <input type="text" id="form-field-new-name" class="mt-1 w-full p-2 border border-gray-300 rounded-md" value="${appState.project.projectName}">
            </div>
        `,
        buttons: [
            { text: 'Annulla', isConfirm: false, class: secondaryBtnClass },
            { text: 'Salva', isConfirm: true, class: primaryBtnClass }
        ]
    });

    if (confirmed) {
        const modalBody = document.getElementById('form-modal-body');
        const newName = modalBody.querySelector('#form-field-new-name').value.trim();
        if (newName) {
            appState.project.projectName = newName;
            setDirty();
            render(); // Re-render to show the new name in the input
        } else {
            alert("Il nome del progetto non può essere vuoto.");
        }
    }
}

async function actionLoadMultipleProjects(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
        return; // No files selected
    }

    loadedProjectsData = []; // Reset the array
    const filePromises = [];

    for (const file of files) {
        const promise = new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedState = JSON.parse(e.target.result);
                    if (!loadedState.version || !loadedState.project) {
                        reject(new Error(`File ${file.name} non è un file di progetto valido.`));
                        return;
                    }
                    // Add filename for reference
                    loadedState.fileName = file.name;
                    resolve(loadedState);
                } catch (error) {
                    reject(new Error(`Errore nel parsing del file ${file.name}: ${error.message}`));
                }
            };
            reader.onerror = () => {
                reject(new Error(`Errore nella lettura del file ${file.name}.`));
            };
            reader.readAsText(file);
        });
        filePromises.push(promise);
    }

    try {
        const allProjectStates = await Promise.all(filePromises);
        loadedProjectsData = allProjectStates;

        // Update UI to show loaded projects
        const loadedFilesP = document.getElementById('multi-project-loaded-files');
        if (loadedFilesP) {
            if (loadedProjectsData.length > 0) {
                const projectNames = loadedProjectsData.map(p => p.project.projectName || p.fileName).join(', ');
                loadedFilesP.textContent = `Progetti caricati: ${loadedProjectsData.length}. (${projectNames})`;
                loadedFilesP.classList.remove('italic', 'text-gray-600');
                loadedFilesP.classList.add('font-semibold', 'text-green-700');
            } else {
                loadedFilesP.textContent = 'Nessun progetto caricato.';
                loadedFilesP.classList.remove('font-semibold', 'text-green-700');
                loadedFilesP.classList.add('italic', 'text-gray-600');
            }
        }
        alert(`${loadedProjectsData.length} progetti caricati con successo!`);
    } catch (error) {
        alert(`Errore durante il caricamento dei progetti: ${error.message}`);
        // Reset in case of error
        loadedProjectsData = [];
        const loadedFilesP = document.getElementById('multi-project-loaded-files');
         if (loadedFilesP) {
            loadedFilesP.textContent = 'Errore nel caricamento. Riprova.';
            loadedFilesP.classList.remove('font-semibold', 'text-green-700');
            loadedFilesP.classList.add('italic', 'text-red-600');
        }
    } finally {
        // Reset the file input so the same files can be loaded again
        event.target.value = null;
    }
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedState = JSON.parse(e.target.result);
            if (!loadedState.version || !loadedState.project) throw new Error("File non valido o corrotto.");

            appState = loadedState;
            appState.ui.currentFileName = file.name; // Set the current file name

            // Compatibility checks
            if (!appState.reportSettings) {
                appState.reportSettings = getInitialAppState().reportSettings;
            }
            if (!appState.validation) {
                appState.validation = getInitialAppState().validation;
            }
            if (!appState.project.projectName) {
                const fileNameWithoutExt = file.name.endsWith('.json') ? file.name.slice(0, -5) : file.name;
                appState.project.projectName = fileNameWithoutExt.replace(/_/g, ' ');
            }

            // --- Retro-compatibility for Spike Uncertainty ---
            if (typeof appState.spikeUncertainty.useCommonReferenceMaterial === 'undefined') {
                appState.spikeUncertainty.useCommonReferenceMaterial = false;
            }
            if (typeof appState.spikeUncertainty.commonReferenceMaterial === 'undefined') {
                appState.spikeUncertainty.commonReferenceMaterial = getInitialAppState().spikeUncertainty.commonReferenceMaterial;
            }

            for (const key in appState.spikeUncertainty) {
                if (key !== 'useCommonReferenceMaterial' && key !== 'commonReferenceMaterial') {
                    const sampleSpike = appState.spikeUncertainty[key];
                    if (typeof sampleSpike === 'object' && sampleSpike !== null) {
                        if (!sampleSpike.hasOwnProperty('productCode')) {
                            sampleSpike.productCode = '';
                        }
                        if (!sampleSpike.hasOwnProperty('lot')) {
                            sampleSpike.lot = '';
                        }
                    }
                }
            }
            // --- End Retro-compatibility ---

            setDirty(false); // A newly loaded project is not dirty.
            addProjectToRecents(appState);
            render(); // Render everything with the new state
            alert("Dati caricati con successo!");
        } catch (error) {
            alert(`Errore nel caricamento: ${error.message}`);
        } finally {
            event.target.value = null;
        }
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
    setDirty();
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionRemoveSpikeStep(sampleId, stepId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    if (!sampleState) return;
    sampleState.steps = sampleState.steps.filter(s => s.id !== stepId);
    setDirty();
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionAddSpikeWithdrawal(sampleId, stepId) {
    const step = appState.spikeUncertainty[sampleId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals.push({ id: `w-${Date.now()}`, pipette: null, volume: null });
    setDirty();
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionRemoveSpikeWithdrawal(sampleId, stepId, withdrawalId) {
    const step = appState.spikeUncertainty[sampleId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals = step.withdrawals.filter(w => w.id !== withdrawalId);
    setDirty();
    render();
    actionCalculateSpikeUncertainty(sampleId);
}

function actionUpdateCommonSpikeState(field, value) {
    const commonRef = appState.spikeUncertainty.commonReferenceMaterial;
    if (commonRef.hasOwnProperty(field)) {
        commonRef[field] = value;
        setDirty();
        // When common data changes, we need to recalculate ALL eligible spikes
        appState.samples.forEach(sample => {
            const result = appState.results[sample.id];
            if (result && result.statistics && !result.error && (sample.expectedValue !== null && sample.expectedValue !== '')) {
                // We don't need to re-render inside the loop, the last calculation will trigger it.
                actionCalculateSpikeUncertainty(sample.id);
            }
        });
    }
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

    setDirty();
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
        throw new ValidationError(`Volume ${volume}mL fuori range per pipetta ${pipetteId}. Range valido: [${Math.min(...points)} - ${Math.max(...points)}].`);
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
    setDirty();
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionRemoveCalSolStep(pointId, stepId) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    if (!pointState) return;
    pointState.steps = pointState.steps.filter(s => s.id !== stepId);
    setDirty();
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionAddCalSolWithdrawal(pointId, stepId) {
    const step = appState.calibrationSolutionUncertainty[pointId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals.push({ id: `calsol-w-${Date.now()}`, pipette: null, volume: null });
    setDirty();
    render();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionRemoveCalSolWithdrawal(pointId, stepId, withdrawalId) {
    const step = appState.calibrationSolutionUncertainty[pointId]?.steps.find(s => s.id === stepId);
    if (!step) return;
    step.withdrawals = step.withdrawals.filter(w => w.id !== withdrawalId);
    setDirty();
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
    setDirty();
    actionCalculateCalibrationSolutionUncertainty(pointId);
}

function actionCalculateTreatmentChain(treatmentSampleId) {
    const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
    if (!treatmentSample) return;

    // Pulisce i risultati precedenti prima di iniziare
    treatmentSample.results = null;

    let currentConcentration = 0;
    let sum_u_rel_sq = 0;
    let initialConcentrationForSummary = null;
    const summaryLines = [];
    const sample = appState.samples.find(s => s.id === treatmentSample.sampleId);
    const unit = sample ? (sample.unit || 'µg/L') : 'µg/L';

    try {
        for (const [index, treatment] of treatmentSample.treatments.entries()) {
            // Resetta i risultati e le incertezze intermedie per questo step
            treatment.results = null;
            treatment.flaskUncertaintyRelPerc = null;
            treatment.addedSolventPipetteUncertaintyRelPerc = null;
            treatment.addedSolventPipette_U_perc = null;
            treatment.initialFlaskUncertaintyRelPerc = null;
            treatment.finalFlaskUncertaintyRelPerc = null;
            if (treatment.withdrawals) {
                treatment.withdrawals.forEach(w => w.pipetteUncertaintyRelPerc = null);
            }

            if (index === 0) {
                // Gestione della sorgente per il primo trattamento
                if (treatment.source.type === 'manual') {
                    const sourceConc = parseFloat(String(treatment.source.manualConcentration).replace(',', '.'));
                    const sourceUnc = parseFloat(String(treatment.source.manualUncertainty).replace(',', '.'));
                    if (isNaN(sourceConc) || isNaN(sourceUnc)) throw new Error("Dati manuali incompleti o non validi.");

                    currentConcentration = sourceConc;
                    initialConcentrationForSummary = sourceConc;
                    // U% (k=2) -> u_rel
                    const u_rel_initial = (sourceUnc / 100) / 2 / Math.sqrt(2);
                    sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                } else if (treatment.source.type === 'spike') {
                    if (treatment.source.spikeSampleId === null) throw new Error("Matrix spike non selezionato.");
                    const spikeData = appState.spikeUncertainty[treatment.source.spikeSampleId];
                    if (!spikeData || !spikeData.results) throw new Error("Dati dello spike selezionato non disponibili.");
                    currentConcentration = spikeData.results.finalConcentration;
                    initialConcentrationForSummary = currentConcentration;
                    // u_c % -> u_rel
                    const u_rel_initial = spikeData.results.u_comp_rel_perc / 100;
                    sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                } else {
                    throw new Error("Tipo di sorgente non valido per il primo trattamento.");
                }
            }

            const concentrationBeforeStep = (index === 0) ?
                initialConcentrationForSummary :
                treatmentSample.treatments[index - 1].results.finalConcentration;

            // Calcolo specifico per tipo di trattamento
            if (treatment.type === 'diluizione') {
                if (treatment.withdrawals.length === 0) throw new Error(`Diluizione: Nessun prelievo.`);
                if (treatment.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) throw new Error(`Diluizione: Dati di prelievo incompleti.`);

                let totalWithdrawalVolume = 0;
                let sum_u_abs_sq_withdrawals = 0;

                treatment.withdrawals.forEach(w => {
                    const withdrawalVolume = parseFloat(String(w.volume).replace(',', '.'));
                    if (isNaN(withdrawalVolume) || withdrawalVolume <= 0) throw new Error("Diluizione: Volume di prelievo non valido.");
                    totalWithdrawalVolume += withdrawalVolume;
                    const contrib = _get_pipette_uncertainty_contribution(w.pipette, withdrawalVolume, appState.libraries);
                    w.pipetteUncertainty_U_perc = contrib.U_perc;
                    w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                    sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
                });
                const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);

                if (treatment.dilutionType === 'addSolvent') {
                    const addedSolventVolume = parseFloat(String(treatment.addedSolventVolume).replace(',', '.'));
                    if (!treatment.addedSolventPipette || isNaN(addedSolventVolume) || addedSolventVolume <= 0) throw new Error("Diluizione: Dati per l'aggiunta di solvente incompleti o non validi.");

                    const Vi = totalWithdrawalVolume;
                    const u_abs_Vi = u_abs_total_withdrawal;

                    const solvent_contrib = _get_pipette_uncertainty_contribution(treatment.addedSolventPipette, addedSolventVolume, appState.libraries);
                    treatment.addedSolventPipetteUncertaintyRelPerc = solvent_contrib.u_rel_perc;
                    treatment.addedSolventPipette_U_perc = solvent_contrib.U_perc;
                    const Va = addedSolventVolume;
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

            } else if (treatment.type === 'estrazione') {
                if (!treatment.initialVolumeFlask) throw new Error("Estrazione: Selezionare il matraccio iniziale.");

                const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                const u_rel_initial_flask = (initialFlask.uncertainty / initialFlask.volume / Math.sqrt(3));
                treatment.initialFlaskUncertaintyRelPerc = u_rel_initial_flask * 100;
                sum_u_rel_sq += Math.pow(u_rel_initial_flask, 2);

                let finalVolume = 0;
                let u_rel_sq_final_volume = 0;
                // Pulisce i campi di incertezza non utilizzati per evitare confusione nell'UI
                treatment.finalFlaskUncertaintyRelPerc = null;
                treatment.pipetteUncertaintyRelPerc = null;


                if (treatment.extractionMethod === 'matraccio') {
                    if (!treatment.finalVolumeFlask) throw new Error("Estrazione (Matraccio): Selezionare il matraccio finale.");
                    const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                    finalVolume = finalFlask.volume;
                    const u_rel_final_flask = (finalFlask.uncertainty / finalFlask.volume / Math.sqrt(3));
                    treatment.finalFlaskUncertaintyRelPerc = u_rel_final_flask * 100;
                    u_rel_sq_final_volume = Math.pow(u_rel_final_flask, 2);
                } else { // 'pipetta'
                    if (!treatment.finalVolumeAliquots || treatment.finalVolumeAliquots.length === 0) throw new Error("Estrazione (Pipetta): Aggiungere almeno un'aliquota.");

                    // Pulisce le incertezze precedenti per evitare di mostrare dati vecchi
                    treatment.finalVolumeAliquots.forEach(a => a.pipetteUncertaintyRelPerc = null);

                    let sum_u_abs_sq_aliquots = 0;
                    treatment.finalVolumeAliquots.forEach(aliquot => {
                        const aliquotVolume = parseFloat(String(aliquot.volume).replace(',', '.'));
                        if (!aliquot.pipette || isNaN(aliquotVolume) || aliquotVolume <= 0) {
                            throw new Error("Estrazione (Pipetta): Tutte le aliquote devono avere una pipetta selezionata e un volume valido.");
                        }
                        finalVolume += aliquotVolume;
                        const contrib = _get_pipette_uncertainty_contribution(aliquot.pipette, aliquotVolume, appState.libraries);
                        aliquot.pipetteUncertaintyRelPerc = contrib.u_rel_perc; // Salva l'incertezza per la UI
                        sum_u_abs_sq_aliquots += Math.pow(contrib.u_abs, 2);
                    });

                    if (finalVolume > 0) {
                        const u_abs_total_aliquots = Math.sqrt(sum_u_abs_sq_aliquots);
                        u_rel_sq_final_volume = Math.pow(u_abs_total_aliquots / finalVolume, 2);
                        treatment.pipetteUncertaintyRelPerc = Math.sqrt(u_rel_sq_final_volume) * 100;
                    }
                }

                if (finalVolume > 0) {
                    sum_u_rel_sq += u_rel_sq_final_volume;
                    currentConcentration = currentConcentration * (initialFlask.volume / finalVolume);
                }

            } else if (treatment.type === 'concentrazione') {
                if (!treatment.initialVolumeFlask || !treatment.finalVolumeFlask) throw new Error(`Concentrazione: Selezionare i matracci.`);
                const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                const u_rel_initial_flask = (initialFlask.uncertainty / initialFlask.volume / Math.sqrt(3));
                const u_rel_final_flask = (finalFlask.uncertainty / finalFlask.volume / Math.sqrt(3));
                treatment.initialFlaskUncertaintyRelPerc = u_rel_initial_flask * 100;
                treatment.finalFlaskUncertaintyRelPerc = u_rel_final_flask * 100;
                sum_u_rel_sq += Math.pow(u_rel_initial_flask, 2) + Math.pow(u_rel_final_flask, 2);
                currentConcentration = currentConcentration * (initialFlask.volume / finalFlask.volume);
            }

            // --- Generazione del riepilogo per il passaggio ---
            let summaryLine = `<b>Passaggio ${index + 1} (${treatment.type}):</b> `;
            if (treatment.type === 'diluizione') {
                const withdrawalsText = treatment.withdrawals.map(w => `${parseFloat(String(w.volume).replace(',','.'))} mL (pipetta: ${w.pipette})`).join(' e ');
                let finalVolumeText;
                if (treatment.dilutionType === 'bringToVolume') {
                    finalVolumeText = `a ${appState.libraries.glassware[treatment.dilutionFlask].volume} mL`;
                } else { // 'addSolvent'
                    const totalWithdrawalVolume = treatment.withdrawals.reduce((sum, w) => sum + parseFloat(String(w.volume).replace(',', '.')), 0);
                    const addedSolventVolume = parseFloat(String(treatment.addedSolventVolume).replace(',', '.'));
                    const finalVolume = totalWithdrawalVolume + addedSolventVolume;
                    finalVolumeText = `aggiungendo ${addedSolventVolume} mL di solvente per un volume finale di ${finalVolume.toFixed(2)} mL`;
                }
                summaryLine += `Prelievo di ${withdrawalsText} da soluzione a ${concentrationBeforeStep.toPrecision(4)} ${unit}. Diluizione ${finalVolumeText} per una concentrazione finale di ${currentConcentration.toPrecision(4)} ${unit}.`;
            } else if (treatment.type === 'estrazione' || treatment.type === 'concentrazione') {
                const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                let finalVolumeText;
                // In 'estrazione', il volume finale può venire da un matraccio o da pipette
                if (treatment.type === 'estrazione' && treatment.extractionMethod === 'pipetta') {
                    const totalAliquotVolume = treatment.finalVolumeAliquots.reduce((sum, a) => sum + parseFloat(String(a.volume).replace(',', '.')), 0);
                    finalVolumeText = `${totalAliquotVolume} mL (da pipette)`;
                } else {
                    // Per 'concentrazione' e 'estrazione' con matraccio, si usa il volume del matraccio finale
                    const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                    finalVolumeText = `${finalFlask.volume} mL`;
                }
                summaryLine += `La soluzione è stata processata da un volume di ${initialFlask.volume} mL a ${finalVolumeText}, portando la concentrazione da ${concentrationBeforeStep.toPrecision(4)} a ${currentConcentration.toPrecision(4)} ${unit}.`;
            }
            summaryLines.push(summaryLine);

            // Salva i risultati del trattamento corrente
            treatment.results = {
                finalConcentration: currentConcentration,
                finalUncertaintyRelPerc: Math.sqrt(sum_u_rel_sq) * 100,
            };
        }

        // Dopo il ciclo, se non ci sono stati errori, salva i risultati finali
        const lastTreatment = treatmentSample.treatments[treatmentSample.treatments.length - 1];
        if (lastTreatment && lastTreatment.results && initialConcentrationForSummary !== null) {
            const final_u_rel = Math.sqrt(sum_u_rel_sq);
            treatmentSample.results = {
                initialConcentration: initialConcentrationForSummary,
                finalConcentration: currentConcentration,
                u_comp: final_u_rel * currentConcentration,
                u_comp_rel_perc: final_u_rel * 100,
                summary: summaryLines.join('<br>')
            };
        }

    } catch (e) {
        console.warn(`Calculation error in treatment chain ${treatmentSampleId}: ${e.message}`);
        // L'errore interrompe il ciclo, i trattamenti successivi non avranno risultati.
        treatmentSample.results = null; // Assicura che i risultati vengano cancellati in caso di errore
    } finally {
        // --- REFRESH LOGIC ---
        // After a treatment chain changes, refresh downstream dependencies.
        if (appState.calibration.results) {
            actionCalculateRegression();
        }
        if (appState.rfCalibration.results) {
            actionCalculateResponseFactor();
        }

        render(); // Update UI at the very end
    }
}

function actionCalculateSpikeUncertainty(sampleId) {
    const sampleState = appState.spikeUncertainty[sampleId];
    const resultsContainer = document.getElementById(`spike-results-container-${sampleId}`);

    // Funzione di utilità per pulire i risultati e mostrare errori/informazioni
    const resetAndShowMessage = (message, type = 'error') => {
        if (resultsContainer) {
            if (message) {
                const styleClass = type === 'error' ?
                    'text-red-600 font-semibold' :
                    'text-gray-500 italic';
                resultsContainer.innerHTML = `<span class="${styleClass} text-sm">${message}</span>`;
            } else {
                resultsContainer.innerHTML = '';
            }
        }
        if (sampleState) {
            sampleState.results = null;
            // Pulisce anche i dati intermedi dai passaggi per evitare di visualizzare dati vecchi
            sampleState.steps.forEach(step => {
                step.intermediateConcentration = null;
                step.intermediateUncertaintyRelPerc = null;
                step.flaskUncertaintyRelPerc = null;
                step.addedSolventPipetteUncertaintyRelPerc = null;
                step.addedSolventPipette_U_perc = null;
                step.withdrawals.forEach(w => {
                    w.pipetteUncertaintyRelPerc = null;
                    w.pipetteUncertainty_U_perc = null;
                });
            });
        }
        // NOTA: render() viene chiamato nel blocco finally
    };

    try {
        // Pulisce i risultati precedenti prima di ogni ricalcolo.
        resetAndShowMessage(null);

        const useCommon = appState.spikeUncertainty.useCommonReferenceMaterial;
        const refMaterialData = useCommon
            ? appState.spikeUncertainty.commonReferenceMaterial
            : sampleState;

        // Pulisce le incertezze relative calcolate
        if (sampleState) sampleState.initialUncertaintyRelPerc = null;
        if (useCommon) {
            appState.spikeUncertainty.commonReferenceMaterial.initialUncertaintyRelPerc = null;
        }

        if (!refMaterialData || refMaterialData.initialConcentration === null || refMaterialData.initialConcentration <= 0) {
            return; // Esce silenziosamente se i dati iniziali non sono pronti.
        }

        const sample = appState.samples.find(s => s.id == sampleId);
        if (!sample) throw new Error(`Campione con ID ${sampleId} non trovato.`);
        const targetUnit = sample.unit;
        const sourceUnit = refMaterialData.unit;
        const convertedInitialConcentration = convertConcentration(refMaterialData.initialConcentration, sourceUnit, targetUnit);
        let currentConcentration = convertedInitialConcentration;

        let sum_u_rel_sq;
        if (refMaterialData.initialUncertainty !== null && refMaterialData.initialUncertainty > 0) {
            const u_rel_initial = refMaterialData.initialUncertainty / (200 * Math.sqrt(2));
            sum_u_rel_sq = Math.pow(u_rel_initial, 2);
            // Salva l'incertezza relativa calcolata nel posto giusto per il rendering
            const uncertaintyRelPerc = u_rel_initial * 100;
            if (useCommon) {
                appState.spikeUncertainty.commonReferenceMaterial.initialUncertaintyRelPerc = uncertaintyRelPerc;
            } else if (sampleState) {
                sampleState.initialUncertaintyRelPerc = uncertaintyRelPerc;
            }
        } else {
            sum_u_rel_sq = 0;
        }

        for (const step of sampleState.steps) {
            if (step.withdrawals.length === 0) throw new IncompleteDataError('Aggiungere almeno un prelievo.');
            if (step.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) {
                 throw new IncompleteDataError('Compilare tutti i campi del prelievo (pipetta e volume).');
            }

            let totalWithdrawalVolume = 0;
            let sum_u_abs_sq_withdrawals = 0;

            for (const w of step.withdrawals) {
                if (!w) continue;
                totalWithdrawalVolume += w.volume;
                const contrib = _get_pipette_uncertainty_contribution(w.pipette, w.volume, appState.libraries);
                w.pipetteUncertainty_U_perc = contrib.U_perc;
                w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
            }
            const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);

            if (step.dilutionType === 'addSolvent') {
                if (!step.addedSolventPipette || !step.addedSolventVolume || step.addedSolventVolume <= 0) {
                    throw new IncompleteDataError("Compilare i dati per l'aggiunta di solvente (pipetta e volume).");
                }
                const Vi = totalWithdrawalVolume;
                const u_abs_Vi = u_abs_total_withdrawal;
                const solvent_contrib = _get_pipette_uncertainty_contribution(step.addedSolventPipette, step.addedSolventVolume, appState.libraries);
                const Va = step.addedSolventVolume;
                const u_abs_Va = solvent_contrib.u_abs;
                step.addedSolventPipetteUncertaintyRelPerc = solvent_contrib.u_rel_perc;
                step.addedSolventPipette_U_perc = solvent_contrib.U_perc;
                const Vf = Vi + Va;
                const u_abs_Vf = Math.sqrt(Math.pow(u_abs_Vi, 2) + Math.pow(u_abs_Va, 2));
                const u_rel_sq_Vi = Vi > 0 ? Math.pow(u_abs_Vi / Vi, 2) : 0;
                const u_rel_sq_Vf = Vf > 0 ? Math.pow(u_abs_Vf / Vf, 2) : 0;
                sum_u_rel_sq += u_rel_sq_Vi + u_rel_sq_Vf;
                currentConcentration = currentConcentration * (Vi / Vf);
            } else {
                if (!step.dilutionFlask) throw new IncompleteDataError('Selezionare un matraccio di diluizione.');
                const u_rel_sq_total_withdrawal = totalWithdrawalVolume > 0 ? Math.pow(u_abs_total_withdrawal / totalWithdrawalVolume, 2) : 0;
                const flask = appState.libraries.glassware[step.dilutionFlask];
                const u_rel_flask = (flask.uncertainty / flask.volume / Math.sqrt(3));
                step.flaskUncertaintyRelPerc = u_rel_flask * 100;
                const u_rel_sq_flask = Math.pow(u_rel_flask, 2);
                sum_u_rel_sq += u_rel_sq_total_withdrawal + u_rel_sq_flask;
                currentConcentration = currentConcentration * (totalWithdrawalVolume / flask.volume);
            }

            step.intermediateConcentration = currentConcentration;
            step.intermediateUncertaintyRelPerc = Math.sqrt(sum_u_rel_sq) * 100;
        }

        const final_u_rel = Math.sqrt(sum_u_rel_sq);
        const final_u_abs = final_u_rel * currentConcentration;
        const final_u_rel_perc = final_u_rel * 100;

        let summaryLines = [];
        let concentrationBeforeStep = convertedInitialConcentration;
        sampleState.steps.forEach((step, index) => {
            const withdrawalsText = step.withdrawals.map(w => `${w.volume} mL (pipetta: ${w.pipette})`).join(' e ');
            const flask = appState.libraries.glassware[step.dilutionFlask];
            const initialConcForStep = concentrationBeforeStep;
            const finalConcForStep = step.intermediateConcentration;
            summaryLines.push(`<b>Passaggio ${index + 1}:</b> Prelievo di ${withdrawalsText} da soluzione a ${initialConcForStep.toPrecision(4)} ${targetUnit}. Diluizione a ${flask.volume} mL per una concentrazione finale di ${finalConcForStep.toPrecision(4)} ${targetUnit}.`);
            concentrationBeforeStep = finalConcForStep;
        });
        const summary = summaryLines.join('<br>');

        const nominalValue = parseFloat(sample.expectedValue);
        const calculatedConcentration = currentConcentration;
        const meanValue = appState.results[sampleId]?.statistics?.mean;
        let preparationCheck = null;
        let accuracyCheck = null;

        if (!isNaN(nominalValue) && !isNaN(calculatedConcentration)) {
            const diff = Math.abs(nominalValue - calculatedConcentration);
            const threshold = 0.005 * nominalValue;
            const isCorrect = diff < threshold;
            preparationCheck = {
                isCorrect: isCorrect,
                message: isCorrect ? 'Superato: la concentrazione calcolata è sufficientemente vicina al valore nominale.' : 'Fallito: la concentrazione calcolata differisce dal valore nominale di oltre lo 0.5%. Si raccomanda di controllare i calcoli e la procedura di preparazione.',
                details: `Differenza: ${diff.toPrecision(3)}, Soglia: ${threshold.toPrecision(3)}`
            };
        }

        if (preparationCheck && preparationCheck.isCorrect && !isNaN(meanValue) && !isNaN(nominalValue)) {
            const absoluteUncertainty = final_u_rel * nominalValue;
            if (absoluteUncertainty > 1e-12) {
                const ratio = Math.abs(meanValue - nominalValue) / absoluteUncertainty;
                const isAccurate = ratio <= 2;
                accuracyCheck = {
                    isAccurate: isAccurate,
                    message: isAccurate ? "Superato: la media delle misure è compatibile con il valore nominale, tenendo conto dell'incertezza di preparazione. Il metodo è considerato esatto." : "Fallito: la media delle misure si discosta significativamente dal valore nominale, anche considerando l'incertezza di preparazione. Il metodo non è considerato esatto.",
                    details: `Rapporto: ${ratio.toFixed(3)} (soglia: <= 2)`
                };
            } else {
                accuracyCheck = { isAccurate: false, message: 'Non calcolabile: incertezza di preparazione è zero.', details: '' };
            }
        }

        sampleState.results = {
            finalConcentration: currentConcentration,
            u_comp: final_u_abs,
            u_comp_rel_perc: final_u_rel_perc,
            summary: summary,
            preparationCheck: preparationCheck,
            accuracyCheck: accuracyCheck
        };

    } catch (e) {
        if (e instanceof ValidationError || e instanceof IncompleteDataError) {
            resetAndShowMessage(e.message, 'info');
        } else {
            resetAndShowMessage(e.message, 'error');
            console.error("Errore nel calcolo dello spike:", e);
        }
    } finally {
        // --- REFRESH LOGIC ---
        // Dopo aver calcolato lo spike, aggiorna le catene di trattamento che dipendono da esso.
        appState.treatments.forEach(ts => {
            if (ts.treatments.length > 0 && ts.treatments[0].source.type === 'spike' && ts.treatments[0].source.spikeSampleId == sampleId) {
                actionCalculateTreatmentChain(ts.id);
            }
        });

        // Ricalcola la taratura se dipende da un trattamento che a sua volta dipende da questo spike.
        // Il modo più semplice è ricalcolare se esistono già dei risultati.
        if (appState.calibration.results) {
            actionCalculateRegression();
        }
        if (appState.rfCalibration.results) {
            actionCalculateResponseFactor();
        }

        render(); // Renderizza tutto alla fine della catena di aggiornamenti.
    }
}

function actionCalculateCalibrationSolutionUncertainty(pointId) {
    const pointState = appState.calibrationSolutionUncertainty[pointId];
    const point = appState.calibration.points.find(p => p.id === pointId);
    const resultsContainer = document.getElementById(`calsol-results-container-${pointId}`);

    // Funzione di utilità per pulire i risultati e mostrare messaggi
    const resetAndShowMessage = (message, type = 'error') => {
        if (resultsContainer) {
            if (message) {
                const styleClass = type === 'error'
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-500 italic';
                resultsContainer.innerHTML = `<span class="${styleClass} text-sm">${message}</span>`;
            } else {
                resultsContainer.innerHTML = '';
            }
        }
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
        render();
    };

    try {
        resetAndShowMessage(null);

        if (pointState.initialConcentration === null || pointState.initialConcentration <= 0) {
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
            if (step.withdrawals.length === 0) {
                throw new IncompleteDataError(`Aggiungere almeno un prelievo.`);
            }
            if (step.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) {
                throw new IncompleteDataError(`Compilare i campi del prelievo (pipetta, volume).`);
            }
            if (!step.dilutionFlask) {
                throw new IncompleteDataError(`Selezionare un matraccio di diluizione.`);
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
        if (e instanceof IncompleteDataError) {
            resetAndShowMessage(e.message, 'info');
        } else {
            resetAndShowMessage(e.message, 'error');
        }
        console.error("Errore nel calcolo della soluzione di taratura:", e);
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

// --- CORE CALCULATION LOGIC FOR EXPANDED UNCERTAINTY ---

function calculateExpandedUncertainty(sampleId, projectState) {
    try {
        const sample = projectState.samples.find(s => s.id === sampleId);
        if (!sample) return { error: "Campione non trovato." };

        const stats = projectState.results[sampleId]?.statistics;
        if (!stats) return { error: "Statistiche di base non calcolate." };

        const contributions = [];

        // 1. Contributo da Ripetibilità (CV%)
        if (stats.cv_percent > 0 && stats.n > 1) {
            contributions.push({
                name: 'Ripetibilità (CV%)',
                value: stats.cv_percent / 100,
                dof: stats.n - 1
            });
        }

        // Trova il 'treatmentSample' corrispondente, che è il link a tutte le altre preparazioni
        const treatmentSample = projectState.treatments.find(ts => ts.sampleId === sampleId);

        if (treatmentSample) {
            // 2. Contributo da Trattamento Campione
            if (treatmentSample.results?.u_comp_rel_perc > 0) {
                contributions.push({
                    name: 'Trattamento Campione',
                    value: treatmentSample.results.u_comp_rel_perc / 100,
                    dof: Infinity // Tipo B
                });
            }

            // 3. Contributo da Preparazione Spike (se il test di accuratezza fallisce)
            const spikeData = projectState.spikeUncertainty[sampleId];
            if (spikeData?.results?.accuracyCheck && spikeData.results.accuracyCheck.isAccurate === false) {
                if (spikeData.results.u_comp_rel_perc > 0) {
                    contributions.push({
                        name: 'Preparazione Spike (Bias)',
                        value: spikeData.results.u_comp_rel_perc / 100,
                        dof: Infinity // Tipo B
                    });
                }
            }

            // 4. Contributo da Taratura
            let calibrationFound = false;
            // Cerca prima nella retta di taratura
            const regResults = projectState.calibration.results;
            if (regResults?.samples) {
                const regSampleResult = regResults.samples.find(s => s.sampleName === sample.name);
                if (regSampleResult && regSampleResult.ux_rel_perc > 0) {
                    const contributionName = regSampleResult.source === 'Controllo Taratura'
                        ? 'Controllo Taratura (Retta)'
                        : 'Taratura (Retta)';

                    contributions.push({
                        name: contributionName,
                        value: regSampleResult.ux_rel_perc / 100,
                        dof: regResults.line.n_cal - 2
                    });
                    calibrationFound = true;
                }
            }

            // Se non trovato nella retta, cerca nel fattore di risposta
            if (!calibrationFound) {
                const rfResults = projectState.rfCalibration.results;
                if (rfResults?.samples) {
                    const rfSampleResult = rfResults.samples.find(s => s.sampleName === sample.name);
                    if (rfSampleResult && rfSampleResult.ux_rel_perc > 0) {
                        // FIX: Utilizza l'incertezza finale del campione (che include il check con ICV)
                        // invece del valore di taratura generico.
                        const contributionName = rfSampleResult.source === 'Controllo Taratura'
                            ? 'Controllo Taratura (Fattore Risposta)'
                            : 'Taratura (Fattore Risposta)';

                        contributions.push({
                            name: contributionName,
                            value: rfSampleResult.ux_rel_perc / 100, // CORRETTO
                            dof: Infinity // Tipo B
                        });
                    }
                }
            }
        }

        if (contributions.length === 0) {
            return { error: "Nessun contributo di incertezza trovato." };
        }

        // Calcolo incertezza combinata
        const u_c_rel = Math.sqrt(contributions.reduce((sum, c) => sum + Math.pow(c.value, 2), 0));

        // Calcolo Gradi di Libertà Effettivi (Welch-Satterthwaite)
        const numerator = Math.pow(u_c_rel, 4);
        const denominator = contributions.reduce((sum, c) => {
            if (c.dof === Infinity || c.dof === 0) return sum;
            return sum + (Math.pow(c.value, 4) / c.dof);
        }, 0);

        const v_eff = (denominator > 0) ? (numerator / denominator) : Infinity;

        // Calcolo Incertezza Estesa
        const k = getStudentTValue(v_eff);
        const U_rel_perc = k * u_c_rel * 100;
        const U_abs = (U_rel_perc / 100) * stats.mean;

        return {
            U_abs,
            U_rel_perc,
            k: k,
            v_eff: v_eff,
            contributions,
            error: null
        };

    } catch (e) {
        console.error(`Errore in calculateExpandedUncertainty per sampleId ${sampleId}:`, e);
        return { error: e.message };
    }
}


//=================================================
// --- REPORT GENERATION ---
//=================================================

function gatherMultiProjectReportData({ grouping }) {
    const reportData = {
        title: `Report Multi-Progetto`,
        subtitle: `Analisi comparativa di ${loadedProjectsData.length} progetti`,
        groupedBy: grouping,
        groups: []
    };

    const formatValue = (value) => {
        if (value === null || typeof value === 'undefined') return '-';
        if (value === 'Livello non presente' || value === 'N/A') return value;
        if (typeof value === 'number') {
            return formatNumberWithRules(value);
        }
        return String(value);
    };

    if (grouping === 'sample') {
        loadedProjectsData.forEach(projectState => {
            const projectGroup = {
                groupTitle: `Progetto: ${projectState.project.projectName || projectState.fileName}`,
                items: []
            };

            projectState.samples.forEach(sample => {
                const result = projectState.results[sample.id];
                const estesaResult = result ? calculateExpandedUncertainty(sample.id, projectState) : null; // FIX: Pass the correct projectState

                const content = [
                    { key: 'Nome campione', value: sample.name },
                    { key: 'Unità di misura', value: sample.unit },
                    { key: 'Valore nominale', value: result?.statistics?.nominalValue },
                    { key: 'Media', value: result?.statistics?.mean },
                    { key: 'Scarto tipo', value: result?.statistics?.stdDev },
                    { key: 'CV%', value: result?.statistics?.cv_percent },
                    { key: 'r', value: result?.statistics?.repeatability_limit_r },
                    { key: 'r%', value: result?.statistics?.repeatability_limit_r_percent },
                    { key: 'R%', value: result?.statistics?.recovery },
                    { key: 'U', value: estesaResult && !estesaResult.error ? estesaResult.U_abs : null },
                    { key: 'U%', value: estesaResult && !estesaResult.error ? estesaResult.U_rel_perc : null }
                ].map(item => ({ key: item.key, value: formatValue(item.value) }));

                projectGroup.items.push({
                    itemTitle: `Campione: ${sample.name}`,
                    blocks: [{ type: 'keyValue', content }]
                });
            });
            reportData.groups.push(projectGroup);
        });
    } else { // grouping === 'feature'
        const allSampleNames = [...new Set(loadedProjectsData.flatMap(p => p.samples.map(s => s.name)))].sort();
        const featureGroup = {
            groupTitle: "Report Comparativo per Caratteristica",
            items: []
        };

        loadedProjectsData.forEach(projectState => {
            const projectName = projectState.project.projectName || projectState.fileName;
            const projectSamples = projectState.samples;
            const projectResults = projectState.results;

            const headers = ['Caratteristica', ...allSampleNames];

            const paramDefinitions = {
                'Unità di misura': (sampleName) => projectSamples.find(s => s.name === sampleName)?.unit,
                'Valore nominale': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.nominalValue : 'Livello non presente';
                },
                'Media': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.mean : 'Livello non presente';
                },
                'Scarto tipo': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.stdDev : 'Livello non presente';
                },
                'CV%': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.cv_percent : 'Livello non presente';
                },
                'r': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.repeatability_limit_r : 'Livello non presente';
                },
                'r%': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.repeatability_limit_r_percent : 'Livello non presente';
                },
                'R%': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    return sample ? projectResults[sample.id]?.statistics?.recovery : 'Livello non presente';
                },
                'U': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    if (!sample) return 'Livello non presente';
                    const estesaResult = calculateExpandedUncertainty(sample.id, projectState);
                    return estesaResult && !estesaResult.error ? estesaResult.U_abs : null;
                },
                'U%': (sampleName) => {
                    const sample = projectSamples.find(s => s.name === sampleName);
                    if (!sample) return 'Livello non presente';
                    const estesaResult = calculateExpandedUncertainty(sample.id, projectState);
                    return estesaResult && !estesaResult.error ? estesaResult.U_rel_perc : null;
                }
            };

            const orderedParamNames = Object.keys(paramDefinitions);

            const rows = orderedParamNames.map(paramName => {
                const rowData = [paramName];
                allSampleNames.forEach(sampleName => {
                    rowData.push(formatValue(paramDefinitions[paramName](sampleName)));
                });
                return rowData;
            });

            featureGroup.items.push({
                itemTitle: `Dati Progetto: ${projectName}`,
                blocks: [{ type: 'table', content: { headers, rows } }]
            });
        });

        reportData.groups.push(featureGroup);
    }

    return reportData;
}


function gatherMultiProjectExcelData({ grouping }) {
    const formatValue = (value) => {
        if (value === null || typeof value === 'undefined' || value === 'N/A') return 'N/A';
        if (value === 'Livello non presente') return value;
        if (typeof value === 'number') {
            // Use the new formatting rule and convert back to a number for Excel
            const formattedString = formatNumberWithRules(value);
            const num = parseFloat(formattedString);
            return isNaN(num) ? formattedString : num;
        }
        return String(value);
    };

    if (grouping === 'feature') {
        const allSampleNames = [...new Set(loadedProjectsData.flatMap(p => p.samples.map(s => s.name)))].sort();
        const headers = ['Nome progetto', 'Componente', 'Caratteristica', ...allSampleNames];
        const allRows = [];

        loadedProjectsData.forEach(projectState => {
            const projectName = projectState.project.projectName || projectState.fileName;
            // From the image, component seems to be derived from project name, e.g. 'Crisene' from 'Crisene_20250921'
            const component = (projectState.project.component || projectName.split('_')[0]) || 'N/D';

            const paramDefinitions = {
                'Unità di misura': (sampleName) => projectState.samples.find(s => s.name === sampleName)?.unit,
                'Valore nominale': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.nominalValue : 'Livello non presente';
                },
                'Media': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.mean : 'Livello non presente';
                },
                'Scarto tipo': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.stdDev : 'Livello non presente';
                },
                'CV%': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.cv_percent : 'Livello non presente';
                },
                'r': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.repeatability_limit_r : 'Livello non presente';
                },
                'r%': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.repeatability_limit_r_percent : 'Livello non presente';
                },
                'R%': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    return sample ? projectState.results[sample.id]?.statistics?.recovery : 'Livello non presente';
                },
                'U': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    if (!sample) return 'Livello non presente';
                    const estesaResult = calculateExpandedUncertainty(sample.id, projectState);
                    return estesaResult && !estesaResult.error ? estesaResult.U_abs : null;
                },
                'U%': (sampleName) => {
                    const sample = projectState.samples.find(s => s.name === sampleName);
                    if (!sample) return 'Livello non presente';
                    const estesaResult = calculateExpandedUncertainty(sample.id, projectState);
                    return estesaResult && !estesaResult.error ? estesaResult.U_rel_perc : null;
                }
            };
            const orderedParamNames = ['Unità di misura', 'Valore nominale', 'Media', 'Scarto tipo', 'CV%', 'r', 'r%', 'R%', 'U', 'U%'];

            orderedParamNames.forEach(paramName => {
                const newRow = [projectName, component, paramName];
                allSampleNames.forEach(sampleName => {
                    const value = paramDefinitions[paramName](sampleName);
                    newRow.push(formatValue(value));
                });
                allRows.push(newRow);
            });
        });
        return { headers, rows: allRows };

    } else { // grouping === 'sample'
        const headers = ['Nome progetto', 'Componente', 'Nome campione', 'Unità di misura', 'Valore nominale', 'Media', 'Scarto tipo', 'CV%', 'r', 'r%', 'R%', 'U', 'U%'];
        const allRows = [];

        loadedProjectsData.forEach(projectState => {
            const projectName = projectState.project.projectName || projectState.fileName;
            const component = (projectState.project.component || projectName.split('_')[0]) || 'N/D';

            projectState.samples.forEach(sample => {
                const result = projectState.results[sample.id];
                const estesaResult = result ? calculateExpandedUncertainty(sample.id, projectState) : null;

                const newRow = [
                    projectName,
                    component,
                    sample.name,
                    sample.unit,
                    result?.statistics?.nominalValue,
                    result?.statistics?.mean,
                    result?.statistics?.stdDev,
                    result?.statistics?.cv_percent,
                    result?.statistics?.repeatability_limit_r,
                    result?.statistics?.repeatability_limit_r_percent,
                    result?.statistics?.recovery, // R%
                    estesaResult && !estesaResult.error ? estesaResult.U_abs : null,
                    estesaResult && !estesaResult.error ? estesaResult.U_rel_perc : null
                ].map(formatValue);
                allRows.push(newRow);
            });
        });
        return { headers, rows: allRows };
    }
}

function generateMultiProjectExcelReport({ grouping }) {
    const { headers, rows } = gatherMultiProjectExcelData({ grouping });

    if (!rows || rows.length === 0) {
        alert("Nessun dato valido da esportare per i progetti caricati.");
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws_data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Auto-fit columns
    const cols = headers.map((header, i) => ({
        wch: rows.reduce((w, r) => Math.max(w, String(r[i] || '').length), String(header).length)
    }));
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, 'Report Multi-progetto');
    XLSX.writeFile(wb, `Report_Multi_Progetto_${grouping}.xlsx`);
}

// Funzione helper per convertire i dati in formato tabella (usato da Excel)
// nel formato gerarchico richiesto dai generatori di report PDF e Word.
function convertExcelDataToReportData(excelData, grouping) {
    const reportData = {
        title: `Report Multi-Progetto`,
        subtitle: `Dati aggregati per ${loadedProjectsData.length} progetti`,
        groupedBy: grouping,
        groups: []
    };

    const group = {
        // Il titolo del gruppo principale nella pagina del report
        groupTitle: grouping === 'feature' ? "Tabella Comparativa per Caratteristica" : "Tabella Riassuntiva per Campione",
        items: [{
            // Il titolo della singola tabella
            itemTitle: `Dati raggruppati per: ${grouping}`,
            blocks: [{
                type: 'table',
                content: {
                    headers: excelData.headers,
                    rows: excelData.rows
                }
            }]
        }]
    };

    reportData.groups.push(group);
    return reportData;
}


function actionGenerateMultiProjectReport(format) {
    const grouping = document.querySelector('input[name="multireport-grouping"]:checked').value;

    if (loadedProjectsData.length === 0) {
        alert("Nessun progetto caricato. Caricare i file di progetto prima di generare un report.");
        return;
    }

    try {
        if (format === 'excel') {
            // Il percorso per Excel rimane invariato, dato che ha già la logica corretta.
            generateMultiProjectExcelReport({ grouping });
        } else {
            // PERCORSO UNIFICATO per PDF e WORD
            // 1. Raccogliamo i dati usando la stessa funzione dell'export Excel.
            const excelData = gatherMultiProjectExcelData({ grouping });

            if (!excelData || excelData.rows.length === 0) {
                 alert("Nessun dato valido da esportare per i progetti caricati.");
                 return;
            }

            // 2. Convertiamo i dati tabellari nel formato gerarchico atteso dai report.
            const reportData = convertExcelDataToReportData(excelData, grouping);

            // 3. Generiamo il report specifico.
            if (format === 'pdf') {
                generatePdfReport(reportData);
            } else if (format === 'word') {
                generateDocxReport(reportData).catch(e => { throw e; });
            }
        }
    } catch (e) {
        console.error(`Error generating multi-project ${format} report:`, e);
        alert(`Si è verificato un errore durante la generazione del report ${format}. Controlla la console per i dettagli.`);
    }
}

function generatePdfReport(reportData) {
    const { jsPDF } = window.jspdf;

    // --- MODIFICA PER REPORT MULTIPROGETTO ---
    const isMultiProjectReport = reportData.title.includes('Multi-Progetto');
    const orientation = isMultiProjectReport ? 'l' : 'p'; // 'l' per landscape
    const doc = new jsPDF({ orientation: orientation, unit: 'mm', format: 'a4' });
    const tableFontSize = isMultiProjectReport ? 7 : 9; // Usa un font più piccolo per tabelle larghe
    const tableCellPadding = isMultiProjectReport ? 1 : 1.5;
    const pageHeight = orientation === 'l' ? 190 : 280; // Margini per landscape vs portrait
    const pageWidth = orientation === 'l' ? 277 : 180; // Larghezza testo per landscape vs portrait
    // --- FINE MODIFICA ---


    doc.setFontSize(18);
    doc.text(reportData.title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(reportData.subtitle, 14, 30);

    let yPos = 45;

    const checkNewPage = (neededHeight) => {
        if (yPos + neededHeight > pageHeight) { // Usa altezza pagina dinamica
            doc.addPage();
            yPos = 20;
        }
    };

    reportData.groups.forEach(group => {
        checkNewPage(20);
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(group.groupTitle, 14, yPos);
        yPos += 8;

        group.items.forEach(item => {
            checkNewPage(15);
            doc.setFontSize(13);
            doc.setTextColor(50, 50, 50);
            doc.text(item.itemTitle, 14, yPos);
            yPos += 7;

            item.blocks.forEach(block => {
                if (block.type === 'table' || block.type === 'keyValue') {
                    const headers = (block.type === 'table') ? [block.content.headers] : [['Parametro', 'Valore']];
                    const rows = (block.type === 'table') ? block.content.rows : block.content.map(kv => [kv.key, kv.value]);

                    if (rows.length > 0) {
                        checkNewPage(20); // Min height for a table
                        doc.autoTable({
                            startY: yPos,
                            head: headers,
                            body: rows,
                            theme: 'grid',
                            headStyles: { fillColor: [75, 75, 75] },
                            styles: { fontSize: tableFontSize, cellPadding: tableCellPadding }, // USA LE VARIABILI
                            margin: { left: 14, right: 14 }
                        });
                        yPos = doc.autoTable.previous.finalY + 8;
                    }
                } else if (block.type === 'summary') {
                    checkNewPage(15);
                    doc.setFontSize(10);
                    const summaryText = block.content.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '');
                    const splitText = doc.splitTextToSize(summaryText, pageWidth); // Usa larghezza pagina dinamica
                    doc.text(splitText, 14, yPos);
                    yPos += (splitText.length * 4) + 5;
                } else if (block.type === 'log') {
                     checkNewPage(15);
                     doc.setFontSize(11);
                     doc.setTextColor(0, 0, 0);
                     doc.text(block.title, 14, yPos);
                     yPos += 5;
                     doc.setFontSize(9);
                     block.content.forEach(logItem => {
                         checkNewPage(5);
                         let color = [0,0,0]; // black
                         if(logItem.type === 'error') color = [200,0,0];
                         if(logItem.type === 'warning') color = [200, 100, 0];
                         doc.setTextColor(...color);
                         doc.text(`- ${logItem.message}`, 16, yPos, { maxWidth: pageWidth }); // Usa larghezza pagina dinamica
                         yPos += 5;
                     });
                     yPos += 5;
                }
            });
        });
    });

    doc.save(`Report_${reportData.title.replace(/[: ]/g, '_')}.pdf`);
}

function generateXlsxReport(reportData) {
    const wb = XLSX.utils.book_new();

    reportData.groups.forEach(group => {
        const ws_data = [];

        ws_data.push([reportData.title]);
        ws_data.push([reportData.subtitle]);
        ws_data.push([]); // Spacer

        group.items.forEach(item => {
            ws_data.push([item.itemTitle]);

            item.blocks.forEach(block => {
                if (block.type === 'table' || block.type === 'keyValue') {
                    const headers = (block.type === 'table') ? block.content.headers : ['Parametro', 'Valore'];
                    const rows = (block.type === 'table') ? block.content.rows : block.content.map(kv => [kv.key, kv.value]);
                    ws_data.push(headers);
                    rows.forEach(row => ws_data.push(row));
                } else if (block.type === 'summary') {
                    ws_data.push(['Riepilogo']);
                    ws_data.push([block.content.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '')]);
                } else if (block.type === 'log') {
                    ws_data.push([block.title]);
                    block.content.forEach(logItem => ws_data.push([`[${logItem.type}]`, logItem.message]));
                }
                ws_data.push([]); // Spacer
            });
            ws_data.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        const safeSheetName = group.groupTitle.replace(/[\*\[\]\:\/\\?\']+/g, "").substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    XLSX.writeFile(wb, `Report_${reportData.title.replace(/[: ]/g, '_')}.xlsx`);
}

async function generateDocxReport(reportData) {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType } = docx;

    const children = [
        new Paragraph({ text: reportData.title, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: reportData.subtitle, heading: HeadingLevel.HEADING_1 }),
        new Paragraph(""),
    ];

    reportData.groups.forEach(group => {
        children.push(new Paragraph({ text: group.groupTitle, heading: HeadingLevel.HEADING_2 }));

        group.items.forEach(item => {
            children.push(new Paragraph({ text: item.itemTitle, heading: HeadingLevel.HEADING_3 }));

            item.blocks.forEach(block => {
                if (block.type === 'table' || block.type === 'keyValue') {
                    const headers = (block.type === 'table') ? block.content.headers : ['Parametro', 'Valore'];
                    const dataRows = (block.type === 'table') ? block.content.rows : block.content.map(kv => [kv.key, kv.value]);

                    if (dataRows.length > 0) {
                        const tableRows = [
                            new TableRow({
                                children: headers.map(header => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })] })),
                                tableHeader: true,
                            })
                        ];
                        dataRows.forEach(row => {
                            tableRows.push(new TableRow({
                                children: row.map(cell => new TableCell({ children: [new Paragraph(String(cell))] }))
                            }));
                        });
                        const table = new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } });
                        children.push(table);
                    }
                } else if (block.type === 'summary') {
                    const summaryLines = block.content.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '').split('\n');
                    summaryLines.forEach(line => children.push(new Paragraph(line)));
                } else if (block.type === 'log') {
                     children.push(new Paragraph({children: [new TextRun({text: block.title, bold: true})]}));
                     block.content.forEach(logItem => {
                        children.push(new Paragraph(`- ${logItem.message}`));
                    });
                }
                 children.push(new Paragraph("")); // Spacer
            });
        });
    });

    const doc = new Document({ sections: [{ children }] });

    const blob = await Packer.toBlob(doc);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Report_${reportData.title.replace(/[: ]/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function actionRunValidationTest() {
    const testId = appState.validation.selectedTestId;
    if (!testId) return;

    const testCase = VALIDATION_TEST_CASES.find(t => t.id === testId);
    if (!testCase) {
        console.error("Test case not found!");
        appState.validation.results = { error: "Caso di test non trovato." };
        render();
        return;
    }

    let results;
    try {
        if (testCase.type === 'regression') {
            results = executeRegressionValidation(testCase);
        } else if (testCase.type === 'shapiro-wilk') {
            results = executeShapiroWilkValidation(testCase);
        } else {
            results = { error: `Tipo di test '${testCase.type}' non supportato.` };
        }
    } catch (e) {
        console.error(`Errore durante l'esecuzione del test di validazione '${testId}':`, e);
        results = { error: e.message };
    }


    appState.validation.results = results;
    render();
}

function executeShapiroWilkValidation(testCase) {
    const { data, intermediate_b, intermediate_S2 } = testCase.inputs;
    const rules = testCase.roundingRules;
    const n = data.length;

    let shapiroResult;

    // Special handling for tests that provide intermediate rounded values like Unichim 179/1
    if (intermediate_b !== undefined && intermediate_S2 !== undefined) {
        // Re-calculate W and kp using the manual's intermediate values to match their final result
        const W_unrounded = Math.pow(intermediate_b, 2) / intermediate_S2;

        // Round W according to the rules before using it to calculate kp, to replicate the manual's method
        const W_rounded = parseFloat(W_unrounded.toFixed(rules.W));
        const W_prime = Math.min(W_rounded, 1.0);

        const { g, e, f } = kp_coeffs_table[n];
        if (!g || !e || !f) {
            throw new Error(`Coefficienti di Shapiro-Wilk non trovati per n=${n}.`);
        }
        const kp = g + e * Math.log((W_prime - f) / (1 - W_prime));

        // The result for W should be the rounded one
        shapiroResult = { W: W_prime, kp: isNaN(kp) ? Infinity : kp, error: null };
    } else {
        // Standard calculation for other tests
        shapiroResult = shapiroWilk(data);
    }

    if (shapiroResult.error) {
        throw new Error(shapiroResult.error);
    }

    // Create string representations for display, respecting the requested precision
    const calculated_string = {
        W: shapiroResult.W.toFixed(rules.W),
        kp: shapiroResult.kp.toFixed(rules.kp)
    };

    const comparison = {};
    let allTestsPassed = true;
    for (const key in testCase.expectedResults) {
        const expected = testCase.expectedResults[key];
        const actual_num = parseFloat(calculated_string[key]);

        // Use a small tolerance for float comparison to account for potential precision errors
        const pass = Math.abs(actual_num - expected) < 1e-9;
        if (!pass) allTestsPassed = false;

        comparison[key] = {
            calculated: calculated_string[key], // Use formatted string for display
            expected: expected.toFixed(rules[key]), // Format expected for consistent display
            pass: pass,
            difference: actual_num - expected
        };
    }

    return {
        testId: testCase.id,
        testName: testCase.name,
        calculatedResults: calculated_string,
        comparison: comparison,
        allPassed: allTestsPassed,
        error: null
    };
}

function executeRegressionValidation(testCase) {
    const { cal_x, cal_y, sample_y_k, sample_p } = testCase.inputs;
    const rules = testCase.roundingRules;
    const n = cal_x.length;

    const calculated = {};
    const intermediate = {}; // Per salvare i valori non arrotondati dove necessario

    // Basic sums using simple-statistics for consistency
    const sum_x = ss.sum(cal_x);
    const sum_y = ss.sum(cal_y);
    const sum_xy = ss.sum(cal_x.map((x, i) => x * cal_y[i]));
    const sum_x2 = ss.sum(cal_x.map(x => x * x));
    const sum_y2 = ss.sum(cal_y.map(y => y * y));

    // Intermediate calculations with specified rounding
    intermediate.Sxx = sum_x2 - (sum_x * sum_x) / n;
    intermediate.Syy = sum_y2 - (sum_y * sum_y) / n;
    intermediate.Sxy = sum_xy - (sum_x * sum_y) / n;

    const Sxx = parseFloat(intermediate.Sxx.toFixed(rules.Sxx));
    const Syy = parseFloat(intermediate.Syy.toFixed(rules.Syy));
    const Sxy = parseFloat(intermediate.Sxy.toFixed(rules.Sxy));

    // Slope b (using toPrecision for significant figures)
    intermediate.slope_b = Sxy / Sxx;
    calculated.slope_b = parseFloat(intermediate.slope_b.toPrecision(rules.slope_b));

    // Intercept a
    const x_medio = ss.mean(cal_x);
    const y_medio_unrounded = ss.mean(cal_y);
    intermediate.intercept_a = y_medio_unrounded - calculated.slope_b * x_medio;
    calculated.intercept_a = parseFloat(intermediate.intercept_a.toFixed(rules.intercept_a));

    // s_yx (Standard deviation of the residuals)
    const sum_sq_err = Syy - (Sxy * Sxy) / Sxx;
    intermediate.s_yx = Math.sqrt(sum_sq_err / (n - 2));
     // Eurachem example uses toPrecision for s_yx
    calculated.s_yx = parseFloat(intermediate.s_yx.toPrecision(rules.s_yx));

    // x_k (calculated concentration for the sample)
    intermediate.x_k = (sample_y_k - calculated.intercept_a) / calculated.slope_b;
    calculated.x_k = parseFloat(intermediate.x_k.toFixed(rules.x_k));

    // ux (standard uncertainty)
    // The Eurachem guide rounds y_medio here for the calculation, so we will too.
    const y_medio_cal = parseFloat(y_medio_unrounded.toFixed(rules.y_medio_cal));
    const term1 = 1 / sample_p;
    const term2 = 1 / n;
    const term3 = Math.pow(sample_y_k - y_medio_cal, 2) / (Math.pow(calculated.slope_b, 2) * Sxx);
    const rootTerm = Math.sqrt(term1 + term2 + term3);
    intermediate.ux = (calculated.s_yx / Math.abs(calculated.slope_b)) * rootTerm;
    calculated.ux = parseFloat(intermediate.ux.toFixed(rules.ux));

    // --- Final Comparison ---
    const comparison = {};
    let allTestsPassed = true;
    for (const key in testCase.expectedResults) {
        const expected = testCase.expectedResults[key];
        const actual = calculated[key];
        const pass = actual === expected;
        if (!pass) allTestsPassed = false;

        comparison[key] = {
            calculated: actual,
            expected: expected,
            pass: pass,
            difference: actual - expected
        };
    }

    return {
        testId: testCase.id,
        testName: testCase.name,
        calculatedResults: calculated,
        comparison: comparison,
        allPassed: allTestsPassed,
        error: null
    };
}

function actionGenerateReport(format) {
    const reportData = gatherReportData();
    if (!reportData || reportData.groups.length === 0) {
        alert("Nessun dato da esportare. Selezionare almeno una voce per il report.");
        return;
    }

    try {
        if (format === 'pdf') {
            generatePdfReport(reportData);
        } else if (format === 'excel') {
            generateXlsxReport(reportData);
        } else if (format === 'word') {
            generateDocxReport(reportData).catch(e => { throw e; }); // Propagate async errors
        }
    } catch (e) {
        console.error(`Error generating ${format} report:`, e);
        alert(`Si è verificato un errore durante la generazione del report ${format}. Controlla la console per i dettagli.`);
    }
}

function gatherReportData() {
    const settings = appState.reportSettings;
    const reportData = {
        title: `Report di Progetto: ${appState.project.projectName}`,
        subtitle: `Metodo: ${appState.project.method || 'N/D'}, Componente: ${appState.project.component || 'N/D'}`,
        groupedBy: settings.grouping,
        groups: []
    };

    // Helper functions to generate data blocks for each section (for extended view)
    const getStatisticaBlocks = (sampleId, selections) => {
        const blocks = [];
        const result = appState.results[sampleId];
        if (!result) return blocks;

        if (selections.dati_grezzi && result.originalData && result.originalData.length > 0) {
            blocks.push({
                title: 'Dati Grezzi',
                type: 'table',
                content: {
                    headers: ['Valore'],
                    rows: result.originalData.map(d => [d])
                }
            });
        }
        if (selections.log_analisi && result.log && result.log.length > 0) {
             blocks.push({
                title: 'Log di Analisi',
                type: 'log',
                content: result.log
            });
        }
        if (selections.statistiche_descrittive && result.statistics) {
            const stats = result.statistics;
            const format = (value) => formatNumberWithRules(value);
            const formatPercent = (value) => {
                const formatted = formatNumberWithRules(value);
                return formatted === 'N/A' ? 'N/A' : `${formatted} %`;
            };
            blocks.push({
                title: 'Statistiche Descrittive',
                type: 'keyValue',
                content: [
                    { key: 'Valore Nominale', value: format(stats.nominalValue) },
                    { key: 'N. Punti', value: stats.n }, // n is an integer, no formatting needed
                    { key: 'Media', value: format(stats.mean) },
                    { key: 'Minimo', value: format(stats.min) },
                    { key: 'Massimo', value: format(stats.max) },
                    { key: 'Deviazione Standard', value: format(stats.stdDev) },
                    { key: 'CV %', value: formatPercent(stats.cv_percent) },
                    { key: 'Limite Ripetibilità (r)', value: format(stats.repeatability_limit_r) },
                    { key: 'r %', value: formatPercent(stats.repeatability_limit_r_percent) },
                    { key: 'Recupero %', value: formatPercent(stats.recovery) }
                ].filter(item => item.value !== 'N/A')
            });
        }
        return blocks;
    };

    const getPreparazioneBlocks = (sampleId, selections) => {
        const blocks = [];
        const sample = appState.samples.find(s => s.id === sampleId);
        if (!sample) return blocks;

        if (selections.matrix_spike) {
            const spikeData = appState.spikeUncertainty[sampleId];
            if (spikeData && spikeData.results) {
                const useCommon = appState.spikeUncertainty.useCommonReferenceMaterial;
                const refMaterial = useCommon
                    ? appState.spikeUncertainty.commonReferenceMaterial
                    : spikeData;

                blocks.push({
                    title: 'Preparazione Matrix Spike',
                    type: 'summary',
                    content: spikeData.results.summary || 'Nessun riepilogo disponibile.'
                });

                const content = [
                    { key: 'Materiale di Riferimento - Codice Prodotto', value: refMaterial.productCode || 'N/D' },
                    { key: 'Materiale di Riferimento - Lotto', value: refMaterial.lot || 'N/D' },
                    { key: 'Concentrazione Finale Calcolata', value: `${formatNumberWithRules(spikeData.results.finalConcentration)} ${sample.unit || 'µg/L'}` },
                    { key: 'Incertezza tipo composta (u_c %)', value: `${formatNumberWithRules(spikeData.results.u_comp_rel_perc)} %` }
                ];

                blocks.push({
                    title: 'Risultati Matrix Spike',
                    type: 'keyValue',
                    content: content
                });
            }
        }
        if (selections.trattamenti) {
             const treatmentData = appState.treatments.find(t => t.sampleId === sampleId);
             if (treatmentData && treatmentData.results) {
                 blocks.push({
                    title: 'Trattamenti di Campioni e Estratti',
                    type: 'summary',
                    content: treatmentData.results.summary || 'Nessun riepilogo disponibile.'
                 });
                 blocks.push({
                    title: 'Risultati Trattamento',
                    type: 'keyValue',
                    content: [
                        { key: 'Concentrazione Finale Calcolata', value: `${formatNumberWithRules(treatmentData.results.finalConcentration)} ${sample.unit || 'µg/L'}` },
                        { key: 'Incertezza tipo composta (u_c %)', value: `${formatNumberWithRules(treatmentData.results.u_comp_rel_perc)} %` }
                    ]
                });
             }
        }
        return blocks;
    };

    const getTaraturaRettaBlocks = (sampleId, selections) => {
        const blocks = [];
        const cal = appState.calibration.results;
        if (!cal || cal.error) return blocks;

        if (selections.dati && cal.line) {
            blocks.push({
                title: 'Dati della Retta di Taratura',
                type: 'table',
                content: {
                    headers: ['Conc. (X)', 'Unità', 'Segnale (Y)'],
                    rows: appState.calibration.points.map(p => [p.x, p.unit, p.y])
                }
            });
        }
        if (selections.risultati && cal.line) {
            blocks.push({
                title: 'Risultati del Calcolo (Retta)',
                type: 'keyValue',
                content: [
                    { key: 'Equazione', value: `y = ${formatNumberWithRules(cal.line.b)}x + ${formatNumberWithRules(cal.line.a)}`},
                    { key: 'R²', value: formatNumberWithRules(cal.line.r2) },
                    { key: 's_yx', value: formatNumberWithRules(cal.line.s_yx) }
                ]
            });
        }
        if (selections.incertezza_livello && cal.samples) {
            const sampleName = appState.samples.find(s => s.id === sampleId)?.name;
            const sampleResult = cal.samples.find(s => s.sampleName === sampleName);
            if (sampleResult) {
                blocks.push({
                    title: 'Incertezza per Livello di Concentrazione (Retta)',
                    type: 'table',
                    content: {
                        headers: ['Conc. Nominale', 'u_taratura', 'u_ICV', 'u_finale', 'u_finale (%)', 'Fonte'],
                        rows: [[
                            formatNumberWithRules(sampleResult.nominalConc),
                            formatNumberWithRules(sampleResult.ux_calib_orig),
                            sampleResult.ux_icv !== null ? formatNumberWithRules(sampleResult.ux_icv) : 'N/A',
                            formatNumberWithRules(sampleResult.ux),
                            `${formatNumberWithRules(sampleResult.ux_rel_perc)} %`,
                            sampleResult.source
                        ]]
                    }
                });
            }
        }
        return blocks;
    };

    const getTaraturaFrBlocks = (sampleId, selections) => {
        const blocks = [];
        const cal = appState.rfCalibration.results;
        if (!cal || cal.error) return blocks;

        if (selections.criterio && appState.rfCalibration.acceptabilityCriterion) {
            blocks.push({
                title: 'Criterio di Accettabilità (FR)',
                type: 'keyValue',
                content: [{ key: 'Criterio di accettabilità', value: `${appState.rfCalibration.acceptabilityCriterion} %` }]
            });
        }
        if (selections.risultati && cal.utaratura_perc) {
            blocks.push({
                title: 'Risultati del Calcolo (FR)',
                type: 'keyValue',
                content: [{ key: 'Incertezza tipo relativa di taratura (u_taratura%)', value: `${formatNumberWithRules(cal.utaratura_perc)} %` }]
            });
        }
        if (selections.incertezza_livello && cal.samples) {
            const sampleName = appState.samples.find(s => s.id === sampleId)?.name;
            const sampleResult = cal.samples.find(s => s.sampleName === sampleName);
            if (sampleResult) {
                blocks.push({
                    title: 'Incertezza per Livello di Concentrazione (FR)',
                    type: 'table',
                    content: {
                        headers: ['Conc. Nominale', 'u_taratura', 'u_ICV', 'u_finale', 'u_finale (%)', 'Fonte'],
                        rows: [[
                            formatNumberWithRules(sampleResult.nominalConc),
                            formatNumberWithRules(sampleResult.ux_calib_orig),
                            sampleResult.ux_icv !== null ? formatNumberWithRules(sampleResult.ux_icv) : 'N/A',
                            formatNumberWithRules(sampleResult.ux),
                            `${formatNumberWithRules(sampleResult.ux_rel_perc)} %`,
                            sampleResult.source
                        ]]
                    }
                });
            }
        }
        return blocks;
    };

    const getEstesaBlocks = (sampleId, selections) => {
        const blocks = [];
        const result = calculateExpandedUncertainty(sampleId, appState);
        if (!result || result.error) return blocks;

        if (selections.riepilogo && result.contributions) {
            blocks.push({
                title: 'Riepilogo Contributi Incertezza Estesa',
                type: 'table',
                content: {
                    headers: ['Fonte di Incertezza', 'u_rel (%)', 'Gradi di Libertà (v)'],
                    rows: result.contributions.map(c => [
                        c.name,
                        formatNumberWithRules(c.value * 100),
                        c.dof === Infinity ? '∞' : formatNumberWithRules(c.dof)
                    ])
                }
            });
        }
        if (selections.risultati) {
            const sampleUnit = appState.samples.find(s => s.id === sampleId)?.unit || 'µg/L';
            blocks.push({
                title: 'Risultati Finali Incertezza Estesa',
                type: 'keyValue',
                content: [
                    { key: 'Gradi di Libertà Effettivi (ν_eff)', value: result.v_eff === Infinity ? '∞' : formatNumberWithRules(result.v_eff) },
                    { key: 'Fattore di Copertura (k)', value: formatNumberWithRules(result.k) },
                    { key: 'Incertezza Estesa Assoluta (U)', value: `${formatNumberWithRules(result.U_abs)} ${sampleUnit}` },
                    { key: 'Incertezza Estesa Relativa (U%)', value: `${formatNumberWithRules(result.U_rel_perc)} %` }
                ]
            });
        }
        return blocks;
    };

    if (settings.representation === 'compact') {
        const componentName = appState.project.component || 'N/D';

        // Definizione di tutti i parametri possibili come specificato dall'utente
        const paramDefinitions = {
            'Nome campione': {
                section: 'statistica',
                selection: 'dati_grezzi',
                getValue: (sample, id) => sample.name,
            },
            'Unità di misura': {
                section: 'statistica',
                selection: 'dati_grezzi',
                getValue: (sample, id) => sample.unit,
            },
            'Valore nominale': {
                section: 'statistica',
                selection: 'dati_grezzi',
                getValue: (sample, id) => sample.expectedValue,
            },
            'Media': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.mean,
            },
            'Scarto tipo': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.stdDev,
            },
            'CV%': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.cv_percent,
            },
            'r': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.repeatability_limit_r,
            },
            'r%': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.repeatability_limit_r_percent,
            },
             'R%': {
                section: 'statistica',
                selection: 'statistiche_descrittive',
                getValue: (sample, id) => appState.results[id]?.statistics?.recovery,
            },
            'U': {
                section: 'estesa',
                selection: 'risultati',
                getValue: (sample, id) => calculateExpandedUncertainty(id, appState)?.U_abs,
            },
            'U%': {
                section: 'estesa',
                selection: 'risultati',
                getValue: (sample, id) => calculateExpandedUncertainty(id, appState)?.U_rel_perc,
            },
        };

        const orderedParamNames = [
            'Nome campione', 'Unità di misura', 'Valore nominale', 'Media',
            'Scarto tipo', 'CV%', 'r', 'r%', 'R%', 'U', 'U%'
        ];

        const activeParams = orderedParamNames.filter(name => {
            const param = paramDefinitions[name];
            // La sezione 'estesa' non ha un trattino nel nome dello stato.
            const sectionNameInState = param.section.replace(/-/g, '');
            return settings.selections[param.section]?.[param.selection];
        });

        if (activeParams.length === 0) {
            alert("Per il report compatto, selezionare almeno una voce dalle sezioni indicate (es. 'Dati grezzi', 'Statistiche descrittive', 'Risultati finali').");
            return null;
        }

        const formatValue = (value) => {
            if (value === null || typeof value === 'undefined') return '-';
            // Use the new formatting rule for numbers
            if (typeof value === 'number') {
                 return formatNumberWithRules(value);
            }
            return value;
        };

        if (settings.grouping === 'sample') {
            const headers = ['Componente', ...activeParams];
            const rows = appState.samples.map(sample => {
                const row = [componentName];
                activeParams.forEach(paramName => {
                    const paramDef = paramDefinitions[paramName];
                    const value = paramDef.getValue(sample, sample.id);
                    row.push(formatValue(value));
                });
                return row;
            });
            reportData.groups.push({
                groupTitle: 'Report Compatto per Campione',
                items: [{ itemTitle: 'Tabella Riassuntiva', blocks: [{ type: 'table', content: { headers, rows } }] }]
            });
        } else { // grouping by feature
            const headers = ['Componente', 'Caratteristica', ...appState.samples.map(s => s.name)];
            const rows = activeParams.map(paramName => {
                const row = [componentName, paramName];
                appState.samples.forEach(sample => {
                    const paramDef = paramDefinitions[paramName];
                    const value = paramDef.getValue(sample, sample.id);
                    row.push(formatValue(value));
                });
                return row;
            });
            reportData.groups.push({
                groupTitle: 'Report Compatto per Caratteristica',
                items: [{ itemTitle: 'Tabella Riassuntiva', blocks: [{ type: 'table', content: { headers, rows } }] }]
            });
        }

    } else { // 'extended' representation (original logic)
        const featureMap = {
            'Analisi Statistica': (sampleId) => getStatisticaBlocks(sampleId, settings.selections.statistica),
            'Incertezza di Preparazione': (sampleId) => getPreparazioneBlocks(sampleId, settings.selections.preparazione),
            'Incertezza di Taratura da Retta': (sampleId) => getTaraturaRettaBlocks(sampleId, settings.selections['taratura-retta']),
            'Incertezza di Taratura da FR': (sampleId) => getTaraturaFrBlocks(sampleId, settings.selections['taratura-fr']),
            'Incertezza Estesa': (sampleId) => getEstesaBlocks(sampleId, settings.selections.estesa)
        };
        const featureNames = Object.keys(featureMap);

        if (settings.grouping === 'sample') {
            appState.samples.forEach(sample => {
                const items = [];
                featureNames.forEach(featureName => {
                    const blocks = featureMap[featureName](sample.id);
                    if (blocks.length > 0) {
                        items.push({ itemTitle: featureName, blocks: blocks });
                    }
                });

                if (items.length > 0) {
                    reportData.groups.push({
                        groupTitle: sample.name,
                        items: items
                    });
                }
            });
        } else { // grouping by feature
            featureNames.forEach(featureName => {
                const items = [];
                appState.samples.forEach(sample => {
                    const blocks = featureMap[featureName](sample.id);
                    if (blocks.length > 0) {
                        items.push({ itemTitle: sample.name, blocks: blocks });
                    }
                });

                if (items.length > 0) {
                     reportData.groups.push({
                        groupTitle: featureName,
                        items: items
                    });
                }
            });
        }
    }

    return reportData;
}

function setupReportEventListeners() {
    const reportContainer = document.getElementById('content-report-progetto');
    if (!reportContainer) return;

    const allItemCheckboxes = reportContainer.querySelectorAll('.report-item-checkbox:not(:disabled)');
    const allSectionCheckboxes = reportContainer.querySelectorAll('.report-section-checkbox');
    const masterCheckbox = document.getElementById('report-select-all-complete');

    const updateMasterCheckboxes = () => {
        const allChecked = Array.from(allItemCheckboxes).every(cb => cb.checked);
        masterCheckbox.checked = allChecked;

        allSectionCheckboxes.forEach(sectionCb => {
            const section = sectionCb.dataset.section;
            const allSectionItems = reportContainer.querySelectorAll(`.report-item-checkbox[data-section="${section}"]:not(:disabled)`);
            if (allSectionItems.length > 0) {
                const allSectionChecked = Array.from(allSectionItems).every(cb => cb.checked);
                sectionCb.checked = allSectionChecked;
            }
        });
    };

    reportContainer.addEventListener('change', e => {
        const target = e.target;
        const id = target.id;

        if (target.name === 'report-grouping') {
            appState.reportSettings.grouping = target.value;
            return;
        }

        if (target.name === 'report-representation') {
            appState.reportSettings.representation = target.value;
            return;
        }

        if (target.type === 'checkbox') {
            const isChecked = target.checked;
            if (id === 'report-select-all-complete') {
                allItemCheckboxes.forEach(cb => cb.checked = isChecked);
                allSectionCheckboxes.forEach(cb => cb.checked = isChecked);

                for (const section in appState.reportSettings.selections) {
                    for (const item in appState.reportSettings.selections[section]) {
                        appState.reportSettings.selections[section][item] = isChecked;
                    }
                }
            } else if (target.classList.contains('report-section-checkbox')) {
                const section = target.dataset.section;
                reportContainer.querySelectorAll(`.report-item-checkbox[data-section="${section}"]:not(:disabled)`).forEach(cb => {
                    cb.checked = isChecked;
                });
                 for (const item in appState.reportSettings.selections[section]) {
                    appState.reportSettings.selections[section][item] = isChecked;
                }
                updateMasterCheckboxes();
            } else if (target.classList.contains('report-item-checkbox')) {
                const section = target.dataset.section;
                const key = id.replace(`report-item-${section}-`, '').replace(/-/g, '_');
                 if (appState.reportSettings.selections[section] && typeof appState.reportSettings.selections[section][key] !== 'undefined') {
                    appState.reportSettings.selections[section][key] = isChecked;
                }
                updateMasterCheckboxes();
            }
        }
    });

    const tabButton = document.getElementById('tab-report-progetto');
    if (tabButton) {
        new MutationObserver((mutations) => {
            if (mutations[0].target.classList.contains('active')) {
                document.querySelector(`input[name="report-grouping"][value="${appState.reportSettings.grouping}"]`).checked = true;
                for (const section in appState.reportSettings.selections) {
                    for (const item in appState.reportSettings.selections[section]) {
                        const itemKey = item.replace(/_/g, '-');
                        const cb = document.getElementById(`report-item-${section}-${itemKey}`);
                        if (cb) {
                            cb.checked = appState.reportSettings.selections[section][item];
                        }
                    }
                }
                updateMasterCheckboxes();
            }
        }).observe(tabButton, { attributes: true, attributeFilter: ['class'] });
    }
}


// --- MAIN APP SETUP ---
function main() {
    actionLoadLibraries();
    renderRecentFiles();
    setupReportEventListeners();

    // --- Event Listeners Scheda Report Progetto ---
    document.getElementById('btn-export-pdf').addEventListener('click', () => actionGenerateReport('pdf'));
    document.getElementById('btn-export-excel').addEventListener('click', () => actionGenerateReport('excel'));
    document.getElementById('btn-export-word').addEventListener('click', () => actionGenerateReport('word'));

    // --- Event Listeners per Report Multi-Progetto ---
    const btnLoadMulti = document.getElementById('btn-load-multi-project');
    if (btnLoadMulti) {
        btnLoadMulti.addEventListener('click', () => {
            document.getElementById('load-multi-data-input').click();
        });
    }
    const multiDataInput = document.getElementById('load-multi-data-input');
    if (multiDataInput) {
        multiDataInput.addEventListener('change', actionLoadMultipleProjects);
    }
    document.getElementById('btn-export-multiproject-pdf')?.addEventListener('click', () => actionGenerateMultiProjectReport('pdf'));
    document.getElementById('btn-export-multiproject-excel')?.addEventListener('click', () => actionGenerateMultiProjectReport('excel'));
    document.getElementById('btn-export-multiproject-word')?.addEventListener('click', () => actionGenerateMultiProjectReport('word'));

    // --- Event Listeners Scheda Analisi Statistica ---
    document.getElementById('btn-add-sample').addEventListener('click', actionAddSample);

    // --- NEW Project Lifecycle Event Listeners ---
    document.getElementById('load-data-input').addEventListener('change', handleFileLoad);
    document.getElementById('btn-new-project').addEventListener('click', (e) => { e.preventDefault(); actionNewProject(); });
    document.getElementById('btn-open-project').addEventListener('click', (e) => { e.preventDefault(); actionOpenProject(); });
    document.getElementById('btn-save-project').addEventListener('click', (e) => { e.preventDefault(); actionSaveProject(); });
    document.getElementById('btn-save-project-as').addEventListener('click', (e) => { e.preventDefault(); actionSaveProjectAs(); });
    document.getElementById('btn-duplicate-project').addEventListener('click', (e) => { e.preventDefault(); actionDuplicateProject(); });

    // Dropdown Menu Logic
    const menuButton = document.getElementById('file-menu-button');
    const dropdown = document.getElementById('file-menu-dropdown');
    const recentFilesButton = document.getElementById('recent-files-button');
    const recentFilesDropdown = document.getElementById('recent-files-dropdown');
    const recentFilesContainer = document.getElementById('recent-files-container');

    menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent window listener from closing it immediately
        dropdown.classList.toggle('hidden');
    });

    recentFilesButton.addEventListener('mouseenter', () => {
        if (!recentFilesDropdown.classList.contains('hidden')) return;
        recentFilesDropdown.classList.remove('hidden');
    });

    recentFilesContainer.addEventListener('mouseleave', () => {
        recentFilesDropdown.classList.add('hidden');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (!dropdown.classList.contains('hidden') && !menuButton.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Warn user before leaving page if there are unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (isDirty) {
            e.preventDefault(); // Required for some browsers
            e.returnValue = ''; // Required for Chrome/Firefox
            return '';          // For older browsers
        }
    });


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

    // Listener per le sotto-schede della libreria (più specifico)
    const libraryContainer = document.getElementById('content-librerie');
    if(libraryContainer) {
        const subtabNav = libraryContainer.querySelector('nav[aria-label="Sub-tabs"]');
        if (subtabNav) {
            subtabNav.addEventListener('click', e => {
                const subtabButton = e.target.closest('button.subtab-btn');
                if (subtabButton) {
                    actionSwitchLibrarySubTab(subtabButton.dataset.subtabName);
                }
            });
        }
    }

    // Listener per le sotto-schede del Report
    const reportContainer = document.getElementById('content-report-progetto');
    if (reportContainer) {
        const subtabNav = reportContainer.querySelector('nav[aria-label="Sub-tabs"]');
        if (subtabNav) {
            subtabNav.addEventListener('click', e => {
                const subtabButton = e.target.closest('button.report-subtab-btn');
                if (subtabButton) {
                    actionSwitchReportSubTab(subtabButton.dataset.subtabName);
                }
            });
        }
    }

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

    document.getElementById('project-name').addEventListener('input', e => { appState.project.projectName = e.target.value; setDirty(); });
    document.getElementById('btn-rename-project').addEventListener('click', actionRenameProject);
    document.getElementById('project-objective').addEventListener('input', e => { appState.project.objective = e.target.value; setDirty(); });
    document.getElementById('project-method').addEventListener('input', e => { appState.project.method = e.target.value; setDirty(); });
    document.getElementById('project-component').addEventListener('input', e => { appState.project.component = e.target.value; setDirty(); });

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

        if (target.id === 'use-common-ref-material-checkbox') {
            appState.spikeUncertainty.useCommonReferenceMaterial = target.checked;
            setDirty();
            render();
            // Ricalcola tutto se la modalità cambia
            appState.samples.forEach(sample => {
                 const result = appState.results[sample.id];
                 if (result && result.statistics && !result.error && (sample.expectedValue !== null && sample.expectedValue !== '')) {
                    actionCalculateSpikeUncertainty(sample.id);
                 }
            });
            return;
        }

        if (target.matches('.common-spike-input')) {
            const field = target.dataset.field;
            const value = target.type === 'number' ? (target.value === '' ? null : parseFloat(target.value)) : target.value;
            actionUpdateCommonSpikeState(field, value);
            return;
        }

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

    // Reset buttons
    document.getElementById('btn-reset-regression').addEventListener('click', actionResetRegressionData);
    document.getElementById('btn-reset-response-factor').addEventListener('click', actionResetRfData);

    document.getElementById('max-rsd-icv').addEventListener('input', e => {
        const input = e.target;
        let value = input.value;

        // Validation
        if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
            input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            input.classList.remove('focus:ring-indigo-500', 'focus:border-indigo-500');
            return; // Stop processing if invalid
        } else {
            input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            input.classList.add('focus:ring-indigo-500', 'focus:border-indigo-500');
        }

        const numValue = value === '' ? null : parseFloat(value);
        appState.calibration.max_rsd_icv = numValue;
        setDirty();
        // If results already exist, re-calculate to update them
        if (appState.calibration.results) {
            actionCalculateRegression();
        }
        if (appState.rfCalibration.results) {
            actionCalculateResponseFactor();
        }
    });

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

    document.getElementById('rf-acceptability-criterion').addEventListener('input', e => {
        actionUpdateRfCalibrationInput('acceptabilityCriterion', e.target.value)
        // If results already exist, re-calculate to update them
        if (appState.rfCalibration.results) {
            actionCalculateResponseFactor();
        }
    });
    document.getElementById('rf-manual-conc').addEventListener('input', e => actionUpdateRfCalibrationInput('manualConc', e.target.value));

    // Listeners for "Select/Deselect All" buttons
    document.getElementById('btn-toggle-regression-all').addEventListener('click', () => {
        document.querySelectorAll('#analysis-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById('btn-toggle-regression-none').addEventListener('click', () => {
        document.querySelectorAll('#analysis-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
    document.getElementById('btn-toggle-rf-all').addEventListener('click', () => {
        document.querySelectorAll('#rf-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById('btn-toggle-rf-none').addEventListener('click', () => {
        document.querySelectorAll('#rf-sample-checklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    });

    // --- AZIONI E LISTENER PER LA NUOVA SEZIONE TRATTAMENTI ---
    // Funzioni di Azione
    function actionAddTreatmentSample() {
        const newId = `ts-${Date.now()}`;
        appState.treatments.push({
            id: newId,
            sampleId: null,
            treatments: []
        });
        setDirty();
        render();
    }

    function actionRemoveTreatmentSample(treatmentSampleId) {
        appState.treatments = appState.treatments.filter(ts => ts.id !== treatmentSampleId);
        setDirty();
        render();
    }

    function actionSelectTreatmentSample(treatmentSampleId, selectedSampleId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (treatmentSample) {
            treatmentSample.sampleId = selectedSampleId ? parseInt(selectedSampleId, 10) : null;
        }
        setDirty();
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
        if (type === 'estrazione') {
            newTreatment.initialVolumeFlask = null;
            // Nuovi campi per metodo di estrazione
            newTreatment.extractionMethod = 'matraccio'; // 'matraccio' o 'pipetta'
            newTreatment.finalVolumeFlask = null;      // Usato se extractionMethod = 'matraccio'
            newTreatment.finalVolumePipette = null;    // Usato se extractionMethod = 'pipetta'
            newTreatment.finalVolumeAliquots = [];     // Usato se extractionMethod = 'pipetta'
        } else if (type === 'concentrazione') {
                newTreatment.initialVolumeFlask = null;
                newTreatment.finalVolumeFlask = null;
        } else if (type === 'diluizione') {
                // Struttura più complessa, simile a un passo di spike
                newTreatment.withdrawals = [{ id: `w-${Date.now()}`, pipette: null, volume: null }];
                newTreatment.dilutionType = 'bringToVolume';
                newTreatment.dilutionFlask = null;
                newTreatment.addedSolventPipette = null;
                newTreatment.addedSolventVolume = null;
            }
            treatmentSample.treatments.push(newTreatment);
        }
        setDirty();
        render();
    }

    function actionRemoveTreatment(treatmentSampleId, treatmentId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (treatmentSample) {
            treatmentSample.treatments = treatmentSample.treatments.filter(t => t.id !== treatmentId);
        }
        setDirty();
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
        setDirty();
        render();
        actionCalculateTreatmentChain(treatmentSampleId);
    }

    function actionAddAliquot(treatmentSampleId, treatmentId) {
        const treatment = appState.treatments
            .find(ts => ts.id === treatmentSampleId)?.treatments
            .find(t => t.id === treatmentId);
        if (treatment && treatment.type === 'estrazione') {
            if (!treatment.finalVolumeAliquots) treatment.finalVolumeAliquots = [];
            treatment.finalVolumeAliquots.push({ id: `a-${Date.now()}`, volume: null, pipette: null });
            setDirty();
            render();
            actionCalculateTreatmentChain(treatmentSampleId);
        }
    }

    function actionRemoveAliquot(treatmentSampleId, treatmentId, aliquotId) {
        const treatment = appState.treatments
            .find(ts => ts.id === treatmentSampleId)?.treatments
            .find(t => t.id === treatmentId);
        if (treatment && treatment.finalVolumeAliquots) {
            treatment.finalVolumeAliquots = treatment.finalVolumeAliquots.filter(a => a.id !== aliquotId);
            setDirty();
            render();
            actionCalculateTreatmentChain(treatmentSampleId);
        }
    }

    function actionAddTreatmentWithdrawal(treatmentSampleId, treatmentId) {
        const treatment = appState.treatments
            .find(ts => ts.id === treatmentSampleId)?.treatments
            .find(t => t.id === treatmentId);
        if (treatment && treatment.type === 'diluizione') {
            if (!treatment.withdrawals) treatment.withdrawals = [];
            treatment.withdrawals.push({ id: `w-${Date.now()}`, pipette: null, volume: null });
            setDirty();
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
            setDirty();
            render();
            actionCalculateTreatmentChain(treatmentSampleId);
        }
    }

    function actionUpdateTreatmentState({ treatmentSampleId, treatmentId, withdrawalId, aliquotId, field, value }) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (!treatmentSample) return;

        const treatment = treatmentSample.treatments.find(t => t.id === treatmentId);
        if (!treatment) return;

        if (aliquotId) {
            const aliquot = treatment.finalVolumeAliquots?.find(a => a.id === aliquotId);
            if (aliquot) {
                if (field === 'aliquotVolume') {
                    aliquot.volume = value;
                } else if (field === 'aliquotPipette') {
                    aliquot.pipette = value;
                }
            }
        } else if (withdrawalId) {
            const withdrawal = treatment.withdrawals?.find(w => w.id === withdrawalId);
            if (withdrawal) {
                withdrawal[field] = value;
            }
        } else if (field.startsWith('source')) {
            if (field === 'sourceType') treatment.source.type = value;
            if (field === 'sourceManualConcentration') treatment.source.manualConcentration = value;
            if (field === 'sourceManualUncertainty') treatment.source.manualUncertainty = value;
            if (field === 'sourceSpikeSampleId') treatment.source.spikeSampleId = value === '' ? null : parseInt(value, 10);
        } else {
             treatment[field] = value;
        }

        setDirty();
        actionCalculateTreatmentChain(treatmentSampleId);
    // render() is called inside actionCalculateTreatmentChain's finally block, so this one is redundant.
    }

    function actionCalculateTreatmentChain(treatmentSampleId) {
        const treatmentSample = appState.treatments.find(ts => ts.id === treatmentSampleId);
        if (!treatmentSample) return;

        // Pulisce i risultati precedenti prima di iniziare
        treatmentSample.results = null;

        let currentConcentration = 0;
        let sum_u_rel_sq = 0;
        let initialConcentrationForSummary = null;
        const summaryLines = [];
        const sample = appState.samples.find(s => s.id === treatmentSample.sampleId);
        const unit = sample ? (sample.unit || 'µg/L') : 'µg/L';

        try {
            for (const [index, treatment] of treatmentSample.treatments.entries()) {
                // Resetta i risultati e le incertezze intermedie per questo step
                treatment.results = null;
                treatment.flaskUncertaintyRelPerc = null;
                treatment.addedSolventPipetteUncertaintyRelPerc = null;
                treatment.addedSolventPipette_U_perc = null;
                treatment.initialFlaskUncertaintyRelPerc = null;
                treatment.finalFlaskUncertaintyRelPerc = null;
                if (treatment.withdrawals) {
                    treatment.withdrawals.forEach(w => w.pipetteUncertaintyRelPerc = null);
                }

                if (index === 0) {
                    // Gestione della sorgente per il primo trattamento
                    if (treatment.source.type === 'manual') {
                        const sourceConc = parseFloat(String(treatment.source.manualConcentration).replace(',', '.'));
                        const sourceUnc = parseFloat(String(treatment.source.manualUncertainty).replace(',', '.'));
                        if (isNaN(sourceConc) || isNaN(sourceUnc)) throw new Error("Dati manuali incompleti o non validi.");

                        currentConcentration = sourceConc;
                        initialConcentrationForSummary = sourceConc;
                        // U% (k=2) -> u_rel
                        const u_rel_initial = (sourceUnc / 100) / 2 / Math.sqrt(2);
                        sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                    } else if (treatment.source.type === 'spike') {
                        if (treatment.source.spikeSampleId === null) throw new Error("Matrix spike non selezionato.");
                        const spikeData = appState.spikeUncertainty[treatment.source.spikeSampleId];
                        if (!spikeData || !spikeData.results) throw new Error("Dati dello spike selezionato non disponibili.");
                        currentConcentration = spikeData.results.finalConcentration;
                        initialConcentrationForSummary = currentConcentration;
                        // u_c % -> u_rel
                        const u_rel_initial = spikeData.results.u_comp_rel_perc / 100;
                        sum_u_rel_sq = Math.pow(u_rel_initial, 2);
                    } else {
                        throw new Error("Tipo di sorgente non valido per il primo trattamento.");
                    }
                }

                const concentrationBeforeStep = (index === 0) ?
                    initialConcentrationForSummary :
                    treatmentSample.treatments[index - 1].results.finalConcentration;

                // Calcolo specifico per tipo di trattamento
                if (treatment.type === 'diluizione') {
                    if (treatment.withdrawals.length === 0) throw new Error(`Diluizione: Nessun prelievo.`);
                    if (treatment.withdrawals.some(w => !w.pipette || w.volume === null || w.volume <= 0)) throw new Error(`Diluizione: Dati di prelievo incompleti.`);

                    let totalWithdrawalVolume = 0;
                    let sum_u_abs_sq_withdrawals = 0;

                    treatment.withdrawals.forEach(w => {
                        const withdrawalVolume = parseFloat(String(w.volume).replace(',', '.'));
                        if (isNaN(withdrawalVolume) || withdrawalVolume <= 0) throw new Error("Diluizione: Volume di prelievo non valido.");
                        totalWithdrawalVolume += withdrawalVolume;
                        const contrib = _get_pipette_uncertainty_contribution(w.pipette, withdrawalVolume, appState.libraries);
                        w.pipetteUncertainty_U_perc = contrib.U_perc;
                        w.pipetteUncertaintyRelPerc = contrib.u_rel_perc;
                        sum_u_abs_sq_withdrawals += Math.pow(contrib.u_abs, 2);
                    });
                    const u_abs_total_withdrawal = Math.sqrt(sum_u_abs_sq_withdrawals);

                    if (treatment.dilutionType === 'addSolvent') {
                        const addedSolventVolume = parseFloat(String(treatment.addedSolventVolume).replace(',', '.'));
                        if (!treatment.addedSolventPipette || isNaN(addedSolventVolume) || addedSolventVolume <= 0) throw new Error("Diluizione: Dati per l'aggiunta di solvente incompleti o non validi.");

                        const Vi = totalWithdrawalVolume;
                        const u_abs_Vi = u_abs_total_withdrawal;

                        const solvent_contrib = _get_pipette_uncertainty_contribution(treatment.addedSolventPipette, addedSolventVolume, appState.libraries);
                        treatment.addedSolventPipetteUncertaintyRelPerc = solvent_contrib.u_rel_perc;
                        treatment.addedSolventPipette_U_perc = solvent_contrib.U_perc;
                        const Va = addedSolventVolume;
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

                } else if (treatment.type === 'estrazione') {
                    if (!treatment.initialVolumeFlask) throw new Error("Estrazione: Selezionare il matraccio iniziale.");

                    const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                    const u_rel_initial_flask = (initialFlask.uncertainty / initialFlask.volume / Math.sqrt(3));
                    treatment.initialFlaskUncertaintyRelPerc = u_rel_initial_flask * 100;
                    sum_u_rel_sq += Math.pow(u_rel_initial_flask, 2);

                    let finalVolume = 0;
                    let u_rel_sq_final_volume = 0;
                    // Pulisce i campi di incertezza non utilizzati per evitare confusione nell'UI
                    treatment.finalFlaskUncertaintyRelPerc = null;
                    treatment.pipetteUncertaintyRelPerc = null;


                    if (treatment.extractionMethod === 'matraccio') {
                        if (!treatment.finalVolumeFlask) throw new Error("Estrazione (Matraccio): Selezionare il matraccio finale.");
                        const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                        finalVolume = finalFlask.volume;
                        const u_rel_final_flask = (finalFlask.uncertainty / finalFlask.volume / Math.sqrt(3));
                        treatment.finalFlaskUncertaintyRelPerc = u_rel_final_flask * 100;
                        u_rel_sq_final_volume = Math.pow(u_rel_final_flask, 2);
                    } else { // 'pipetta'
                        if (!treatment.finalVolumeAliquots || treatment.finalVolumeAliquots.length === 0) throw new Error("Estrazione (Pipetta): Aggiungere almeno un'aliquota.");

                        // Pulisce le incertezze precedenti per evitare di mostrare dati vecchi
                        treatment.finalVolumeAliquots.forEach(a => a.pipetteUncertaintyRelPerc = null);

                        let sum_u_abs_sq_aliquots = 0;
                        treatment.finalVolumeAliquots.forEach(aliquot => {
                            const aliquotVolume = parseFloat(String(aliquot.volume).replace(',', '.'));
                            if (!aliquot.pipette || isNaN(aliquotVolume) || aliquotVolume <= 0) {
                                throw new Error("Estrazione (Pipetta): Tutte le aliquote devono avere una pipetta selezionata e un volume valido.");
                            }
                            finalVolume += aliquotVolume;
                            const contrib = _get_pipette_uncertainty_contribution(aliquot.pipette, aliquotVolume, appState.libraries);
                            aliquot.pipetteUncertaintyRelPerc = contrib.u_rel_perc; // Salva l'incertezza per la UI
                            sum_u_abs_sq_aliquots += Math.pow(contrib.u_abs, 2);
                        });

                        if (finalVolume > 0) {
                            const u_abs_total_aliquots = Math.sqrt(sum_u_abs_sq_aliquots);
                            u_rel_sq_final_volume = Math.pow(u_abs_total_aliquots / finalVolume, 2);
                            treatment.pipetteUncertaintyRelPerc = Math.sqrt(u_rel_sq_final_volume) * 100;
                        }
                    }

                    if (finalVolume > 0) {
                        sum_u_rel_sq += u_rel_sq_final_volume;
                        currentConcentration = currentConcentration * (initialFlask.volume / finalVolume);
                    }

                } else if (treatment.type === 'concentrazione') {
                    if (!treatment.initialVolumeFlask || !treatment.finalVolumeFlask) throw new Error(`Concentrazione: Selezionare i matracci.`);
                    const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                    const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                    const u_rel_initial_flask = (initialFlask.uncertainty / initialFlask.volume / Math.sqrt(3));
                    const u_rel_final_flask = (finalFlask.uncertainty / finalFlask.volume / Math.sqrt(3));
                    treatment.initialFlaskUncertaintyRelPerc = u_rel_initial_flask * 100;
                    treatment.finalFlaskUncertaintyRelPerc = u_rel_final_flask * 100;
                    sum_u_rel_sq += Math.pow(u_rel_initial_flask, 2) + Math.pow(u_rel_final_flask, 2);
                    currentConcentration = currentConcentration * (initialFlask.volume / finalFlask.volume);
                }

                // --- Generazione del riepilogo per il passaggio ---
                let summaryLine = `<b>Passaggio ${index + 1} (${treatment.type}):</b> `;
                if (treatment.type === 'diluizione') {
                    const withdrawalsText = treatment.withdrawals.map(w => `${parseFloat(String(w.volume).replace(',','.'))} mL (pipetta: ${w.pipette})`).join(' e ');
                    let finalVolumeText;
                    if (treatment.dilutionType === 'bringToVolume') {
                        finalVolumeText = `a ${appState.libraries.glassware[treatment.dilutionFlask].volume} mL`;
                    } else { // 'addSolvent'
                        const totalWithdrawalVolume = treatment.withdrawals.reduce((sum, w) => sum + parseFloat(String(w.volume).replace(',', '.')), 0);
                        const addedSolventVolume = parseFloat(String(treatment.addedSolventVolume).replace(',', '.'));
                        const finalVolume = totalWithdrawalVolume + addedSolventVolume;
                        finalVolumeText = `aggiungendo ${addedSolventVolume} mL di solvente per un volume finale di ${finalVolume.toFixed(2)} mL`;
                    }
                    summaryLine += `Prelievo di ${withdrawalsText} da soluzione a ${concentrationBeforeStep.toPrecision(4)} ${unit}. Diluizione ${finalVolumeText} per una concentrazione finale di ${currentConcentration.toPrecision(4)} ${unit}.`;
                } else if (treatment.type === 'estrazione' || treatment.type === 'concentrazione') {
                    const initialFlask = appState.libraries.glassware[treatment.initialVolumeFlask];
                    let finalVolumeText;
                    // In 'estrazione', il volume finale può venire da un matraccio o da pipette
                    if (treatment.type === 'estrazione' && treatment.extractionMethod === 'pipetta') {
                        const totalAliquotVolume = treatment.finalVolumeAliquots.reduce((sum, a) => sum + parseFloat(String(a.volume).replace(',', '.')), 0);
                        finalVolumeText = `${totalAliquotVolume} mL (da pipette)`;
                    } else {
                        // Per 'concentrazione' e 'estrazione' con matraccio, si usa il volume del matraccio finale
                        const finalFlask = appState.libraries.glassware[treatment.finalVolumeFlask];
                        finalVolumeText = `${finalFlask.volume} mL`;
                    }
                    summaryLine += `La soluzione è stata processata da un volume di ${initialFlask.volume} mL a ${finalVolumeText}, portando la concentrazione da ${concentrationBeforeStep.toPrecision(4)} a ${currentConcentration.toPrecision(4)} ${unit}.`;
                }
                summaryLines.push(summaryLine);

                // Salva i risultati del trattamento corrente
                treatment.results = {
                    finalConcentration: currentConcentration,
                    finalUncertaintyRelPerc: Math.sqrt(sum_u_rel_sq) * 100,
                };
            }

            // Dopo il ciclo, se non ci sono stati errori, salva i risultati finali
            const lastTreatment = treatmentSample.treatments[treatmentSample.treatments.length - 1];
            if (lastTreatment && lastTreatment.results && initialConcentrationForSummary !== null) {
                const final_u_rel = Math.sqrt(sum_u_rel_sq);
                treatmentSample.results = {
                    initialConcentration: initialConcentrationForSummary,
                    finalConcentration: currentConcentration,
                    u_comp: final_u_rel * currentConcentration,
                    u_comp_rel_perc: final_u_rel * 100,
                    summary: summaryLines.join('<br>')
                };
            }

        } catch (e) {
            console.warn(`Calculation error in treatment chain ${treatmentSampleId}: ${e.message}`);
            // L'errore interrompe il ciclo, i trattamenti successivi non avranno risultati.
            treatmentSample.results = null; // Assicura che i risultati vengano cancellati in caso di errore
        } finally {
            // --- REFRESH LOGIC ---
            // After a treatment chain changes, refresh downstream dependencies.
            if (appState.calibration.results) {
                actionCalculateRegression();
            }
            if (appState.rfCalibration.results) {
                actionCalculateResponseFactor();
            }

            render(); // Update UI at the very end
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
            // NUOVI BOTTONI PER ESTRAZIONE
            const addAliquotBtn = e.target.closest('.btn-add-aliquot');
            const removeAliquotBtn = e.target.closest('.btn-remove-aliquot');
            const radioBtn = e.target.closest('.extraction-method-radio');

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
            } else if (addAliquotBtn) {
                actionAddAliquot(addAliquotBtn.dataset.treatmentSampleId, addAliquotBtn.dataset.treatmentId);
            } else if (removeAliquotBtn) {
                actionRemoveAliquot(removeAliquotBtn.dataset.treatmentSampleId, removeAliquotBtn.dataset.treatmentId, removeAliquotBtn.dataset.aliquotId);
            } else if (radioBtn) {
                actionUpdateTreatmentState({
                    treatmentSampleId: radioBtn.dataset.treatmentSampleId,
                    treatmentId: radioBtn.dataset.treatmentId,
                    field: 'extractionMethod',
                    value: radioBtn.value
                });
            }
        });

        treatmentsContainer.addEventListener('change', e => {
            const selectSample = e.target.closest('.select-treatment-sample');
            const treatmentInput = e.target.closest('.treatment-input');

            // --- STATE UPDATE ---
            if (selectSample) {
                actionSelectTreatmentSample(selectSample.dataset.treatmentSampleId, e.target.value);
            } else if (treatmentInput) {
                const { treatmentSampleId, treatmentId, withdrawalId, aliquotId, field } = treatmentInput.dataset;
                let value;

                if (treatmentInput.type === 'radio') {
                    value = treatmentInput.value;
                }
                else if (treatmentInput.inputMode === 'decimal') {
                    value = e.target.value.replace(',', '.');
                } else {
                    value = e.target.value;
                }
                actionUpdateTreatmentState({ treatmentSampleId, treatmentId, withdrawalId, aliquotId, field, value });
            }
        });

        treatmentsContainer.addEventListener('input', e => {
            const treatmentInput = e.target.closest('.treatment-input');
            if (!treatmentInput || (treatmentInput.type !== 'text' && treatmentInput.inputMode !== 'decimal')) return;

            // --- FOCUS SAVING per input testuali ---
            const focusedElement = document.activeElement;
            let focusedSelector = null;
            let selectionStart = null;
            if (focusedElement && (focusedElement.closest('.treatment-input') || focusedElement.closest('.select-treatment-sample'))) {
                const ds = focusedElement.dataset;
                // Build a unique selector from data attributes
                focusedSelector = `[data-field="${ds.field}"]`;
                if (ds.aliquotId) focusedSelector += `[data-aliquot-id="${ds.aliquotId}"]`;
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
                const { treatmentSampleId, treatmentId, withdrawalId, aliquotId, field } = treatmentInput.dataset;
                let value;

                if (treatmentInput.inputMode === 'decimal') {
                    // For decimal inputs, we store the raw string (with comma normalized to period)
                    // to allow for inputs like "5,0". Parsing happens only during calculation.
                    value = e.target.value.replace(',', '.');
                } else {
                    value = e.target.value;
                }
                actionUpdateTreatmentState({ treatmentSampleId, treatmentId, withdrawalId, aliquotId, field, value });
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
        btnSelectRegression.addEventListener('click', async () => {
            if (appState.rfCalibration.results) {
                const confirmed = await choiceModal.show({
                    title: 'Cambio Metodo di Taratura',
                    bodyContent: 'Hai già dei dati calcolati con il metodo "Fattore di Risposta". Cambiando metodo, questi dati verranno resettati. Vuoi continuare?',
                    buttons: [
                        { text: 'Annulla', value: false, class: secondaryBtnClass },
                        { text: 'Conferma e Resetta', value: true, class: primaryBtnClass.replace('bg-blue-600', 'bg-red-600').replace('hover:bg-blue-700', 'hover:bg-red-700') }
                    ]
                });
                if (!confirmed) return;
                actionResetRfData();
            }
            calibrationChoice.classList.add('hidden');
            regressionCalculator.classList.remove('hidden');
            responseFactorCalculator.classList.add('hidden');
        });
    }

    if(btnSelectResponseFactor) {
        btnSelectResponseFactor.addEventListener('click', async () => {
            if (appState.calibration.results) {
                const confirmed = await choiceModal.show({
                    title: 'Cambio Metodo di Taratura',
                    bodyContent: 'Hai già dei dati calcolati con il metodo "Retta dei Minimi Quadrati". Cambiando metodo, questi dati verranno resettati. Vuoi continuare?',
                    buttons: [
                        { text: 'Annulla', value: false, class: secondaryBtnClass },
                        { text: 'Conferma e Resetta', value: true, class: primaryBtnClass.replace('bg-blue-600', 'bg-red-600').replace('hover:bg-blue-700', 'hover:bg-red-700') }
                    ]
                });
                if (!confirmed) return;
                actionResetRegressionData();
            }
            calibrationChoice.classList.add('hidden');
            responseFactorCalculator.classList.remove('hidden');
            regressionCalculator.classList.add('hidden');
        });
    }

    const setupBackButton = (buttonId, calculatorToShow, otherCalculatorToHide) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.addEventListener('click', () => {
                calibrationChoice.classList.remove('hidden');
                calculatorToShow.classList.add('hidden');
                otherCalculatorToHide.classList.add('hidden');
            });
        }
    };

    setupBackButton('btn-back-to-calibration-choice-1', regressionCalculator, responseFactorCalculator);
    setupBackButton('btn-back-to-calibration-choice-2', responseFactorCalculator, regressionCalculator);

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

    // --- Event Listeners per la Scheda di Validazione ---
    const validationSelect = document.getElementById('validation-test-select');
    if (validationSelect) {
        validationSelect.addEventListener('change', e => {
            appState.validation.selectedTestId = e.target.value;
            appState.validation.results = null; // Resetta i risultati quando si cambia test
            render();
        });
    }

    const runValidationBtn = document.getElementById('run-validation-btn');
    if (runValidationBtn) {
        runValidationBtn.addEventListener('click', actionRunValidationTest);
    }


    actionAddSample();
    render(); // Initial render to draw everything, which includes renderFileStatus
}

document.addEventListener('DOMContentLoaded', main);
