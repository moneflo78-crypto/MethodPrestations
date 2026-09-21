import numpy as np
import time
from unccalib import calcola_incertezza_minimi_quadrati

def benchmark(n_points=1000, n_iterations=100):
    x = np.linspace(1, 100, n_points).tolist()
    y = (2.5 * np.array(x) + 1.2 + np.random.normal(0, 0.5, n_points)).tolist()

    start_time = time.time()
    for _ in range(n_iterations):
        _ = calcola_incertezza_minimi_quadrati(x, y)
    end_time = time.time()

    avg_time = (end_time - start_time) / n_iterations
    print(f"Benchmark with {n_points} points: {avg_time:.6f} seconds per call (average over {n_iterations} iterations)")
    return avg_time

if __name__ == "__main__":
    benchmark(1000, 100)
    benchmark(10000, 10)
