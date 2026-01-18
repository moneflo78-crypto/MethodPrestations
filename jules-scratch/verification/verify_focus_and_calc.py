import os
import time
from playwright.sync_api import sync_playwright

def verify_sst_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # 1. Setup SST
        tab_statistica = page.locator('#tab-statistica')
        tab_statistica.click()
        page.locator('#btn-add-sample').click()
        page.wait_for_selector('.sample-card')
        sample_card = page.locator('.sample-card').first
        sample_card.locator('.mode-select').select_option('sst')
        sample_card.locator('.btn-add-sst-row').click()

        # 2. Test Focus Retention (The User Issue)
        print("Testing focus retention on typing...")
        m1_input = sample_card.locator('input[data-field="m1"]').first
        m1_input.click()

        # Type '1'
        page.keyboard.type("1")
        # Check if still focused
        if not m1_input.is_visible():
             # If re-rendered, the old handle might be stale or detached, but is_visible might check validity.
             # Better check: compare active element.
             pass

        # We need to re-locate active element to see if it matches our desired field
        # But if render happened, the DOM node is different.
        # If render happened, the focus would be lost (body would be active element usually).

        active_tag = page.evaluate("document.activeElement.tagName")
        print(f"Active element tag after typing '1': {active_tag}")

        if active_tag != "INPUT":
            print("FAILED: Focus lost after typing '1'.")
        else:
            print("PASSED: Focus retained after typing '1'.")

        # Type '0'
        page.keyboard.type("0")

        # Blur to trigger change event
        m1_input.blur()

        # 3. Fill M0 and Verify Calculation
        print("Filling M0 and checking calculation...")
        m0_input = sample_card.locator('input[data-field="m0"]').first
        m0_input.fill("5")
        m0_input.blur()

        # Allow time for render
        time.sleep(0.5)

        # Check Net Weight (should be 10 - 5 = 5.0000)
        # Using a more specific locator strategy
        # Find the row, then looking for the cell.
        row = sample_card.locator('table tbody tr').first
        cells = row.locator('td').all_inner_texts()
        print(f"Cells in row: {cells}")

        # Cell 0: index
        # Cell 1: M1 input
        # Cell 2: M0 input
        # Cell 3: Net Weight (The one we added)
        # Cell 4: Delete button

        net_weight = cells[3].strip()
        print(f"Net Weight found: '{net_weight}'")

        if net_weight == "5.0000":
            print("PASSED: Net Weight calculation correct.")
        else:
            print(f"FAILED: Expected '5.0000', got '{net_weight}'")

        browser.close()

if __name__ == "__main__":
    verify_sst_changes()
