import numpy as np

def calcola_incertezza_minimi_quadrati(x: list[float], y: list[float]) -> list[dict]:
    """
    Calcola la retta dei minimi quadrati e l'incertezza di taratura per ogni punto.

    Args:
        x: Lista dei valori nominali delle concentrazioni (variabile indipendente).
        y: Lista dei valori di segnale strumentale (variabile dipendente).

    Returns:
        Una lista di dizionari, ognuno contenente:
        - 'x': il valore di concentrazione originale.
        - 'ux': l'incertezza tipo sulla x calcolata.
        - 'ux_rel_perc': l'incertezza tipo relativa percentuale.
    """
    if len(x) != len(y):
        raise ValueError("Le liste x e y devono avere la stessa dimensione.")
    if len(x) < 3:
        raise ValueError("Sono necessari almeno 3 punti per il calcolo.")

    x_np = np.array(x)
    y_np = np.array(y)

    # Passo 1: Calcolo della retta dei minimi quadrati (y = b*x + a)
    b, a = np.polyfit(x_np, y_np, 1)

    # Passo 2: Calcolo dei valori di y sulla retta di regressione
    y_calcolato = b * x_np + a

    # Passo 3: Calcolo della deviazione standard residua (s_yx)
    n = len(x_np)
    s_yx = np.sqrt(np.sum((y_np - y_calcolato)**2) / (n - 2))

    # Passo 4: Calcolo dei termini necessari per la formula dell'incertezza
    y_medio = np.mean(y_np)
    x_medio = np.mean(x_np)
    sum_sq_diff_x = np.sum((x_np - x_medio)**2)

    risultati = []

    # Passo 5: Calcolo dell'incertezza per ogni punto di taratura
    for i in range(n):
        xi = x_np[i]
        y_calcolato_i = y_calcolato[i]

        # Formula: ux = (s_yx / b) * sqrt(1 + 1/n + ((y_medio - y_calcolato_i)^2) / (b^2 * sum((x-x_medio)^2)))
        termine_radice = np.sqrt(1 + (1/n) + ((y_medio - y_calcolato_i)**2) / (b**2 * sum_sq_diff_x))
        ux = (s_yx / abs(b)) * termine_radice

        # Calcolo dell'incertezza relativa percentuale
        ux_rel_perc = (ux / xi) * 100 if xi != 0 else 0

        risultati.append({
            'x': xi,
            'ux': ux,
            'ux_rel_perc': ux_rel_perc
        })

    return risultati

if __name__ == '__main__':
    # Dati di esempio per la taratura
    concentrazioni = [0.0, 0.1, 0.5, 1.0, 1.5, 2.0]
    segnali = [0.05, 0.18, 0.80, 1.55, 2.28, 3.01]

    try:
        incertezza_risultati = calcola_incertezza_minimi_quadrati(concentrazioni, segnali)

        print("Risultati del Calcolo dell'Incertezza di Taratura:")
        print("-" * 60)
        print(f"{'Concentrazione (x)':<20} | {'Incertezza Tipo (ux)':<25} | {'Ux Relativa (%)':<15}")
        print("-" * 60)

        for res in incertezza_risultati:
            print(f"{res['x']:<20.4f} | {res['ux']:<25.6f} | {res['ux_rel_perc']:<15.2f}")

    except (ValueError, np.linalg.LinAlgError) as e:
        print(f"Errore durante il calcolo: {e}")
