import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # 1. Naviga all'applicazione tramite il server locale
    app_url = "http://localhost:8000/index.html"
    page.goto(app_url)

    # Attendi che l'overlay di caricamento scompaia
    loading_overlay = page.locator("#loading-overlay")
    expect(loading_overlay).to_be_hidden(timeout=10000)

    # 2. Configura il progetto nel Frontespizio
    page.get_by_role("button", name="Frontespizio").click()
    page.locator("#project-method-select").select_option("metodo_metalli")

    # 3. Vai alla scheda "Analisi Statistica" e inserisci i dati
    page.get_by_role("button", name="Analisi Statistica").click()
    sample_card = page.locator('.sample-card').first
    sample_card.locator('textarea[data-field="rawData"]').fill("10.1, 10.2, 10.3, 10.0, 9.9, 10.1, 10.2")
    sample_card.locator('input[data-field="expectedValue"]').fill("10.0")

    # 4. Vai alla scheda "Incertezza di Preparazione" e configura un trattamento
    page.get_by_role("button", name="Incertezza di Preparazione").click()
    page.get_by_role("button", name="+ Aggiungi Campione da Trattare").click()
    page.locator('.select-treatment-sample').select_option(label="Campione 1")
    page.get_by_role("button", name="Concentrazione").click()
    page.locator('[data-field="initialVolumeFlask"]').select_option(label="Matraccio 100 mL (Vol: 100 mL, Tol: ±0.1 mL)")
    page.locator('[data-field="finalVolumeFlask"]').select_option(label="Matraccio 50 mL (Vol: 50 mL, Tol: ±0.08 mL)")
    page.locator('[data-field="sourceManualConcentration"]').fill("200")
    page.locator('[data-field="sourceManualUncertainty"]').fill("1.5")

    # 5. Torna ad "Analisi Statistica" ed esegui i calcoli
    page.get_by_role("button", name="Analisi Statistica").click()
    page.get_by_role("button", name="Calcola").click()

    modal = page.locator("#multi-choice-modal-backdrop")
    expect(modal).to_be_visible()
    modal.get_by_label("Huber (MAD)").check()
    modal.get_by_label("Grubbs (per un singolo anomalo)").check()
    modal.get_by_role("button", name="Esegui Test").click()
    expect(modal).to_be_hidden()
    expect(page.locator("#results-section h2")).to_have_text("Report Finale")

    # 6. Vai alla scheda "Incertezza Estesa"
    page.get_by_role("button", name="Incertezza Estesa").click()
    expect(page.locator("#extended-uncertainty-container > div").first).to_be_visible()
    expect(page.get_by_role("heading", name="Campione 1 - Incertezza Estesa (da dati sperimentali)")).to_be_visible()

    # 7. Attiva l'opzione per l'incertezza garantita
    page.get_by_label("Calcola Incertezza Massima Garantita").check()

    # 8. Verifica che la nuova sezione per l'incertezza garantita sia apparsa
    guaranteed_heading = page.get_by_role("heading", name="Campione 1 - Incertezza Massima Garantita (da criteri)")
    expect(guaranteed_heading).to_be_visible()

    # 9. Scorri fino in fondo alla pagina per assicurarti che tutto sia visibile
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)

    # 10. Cattura lo screenshot per la verifica finale
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)