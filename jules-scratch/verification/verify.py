from playwright.sync_api import sync_playwright, expect
import os

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        # Get the absolute path to the HTML file
        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # 1. Navigate to the correct tab
        page.get_by_role("button", name="Analisi Statistica").click()

        # Define a robust locator for the textarea
        data_textarea = page.locator('textarea[data-field="rawData"]')

        # 2. Input normally distributed data
        data_textarea.fill("13.5, 13.5, 13.6, 13.8, 13.9, 14.0, 14.2, 14.5, 14.5, 14.6, 14.8, 14.9, 15.2, 15.5, 15.6")

        # 3. Click the main calculate button
        page.get_by_role("button", name="Elabora e Calcola").click()

        # DEBUG: Wait for something to happen and take a screenshot
        page.wait_for_timeout(2000) # Give it more time
        page.screenshot(path="jules-scratch/verification/debug.png")

        # 4. Check the results container content
        results_html = page.locator("#results-container").inner_html()
        print(f"RESULTS CONTAINER HTML: {results_html}")

        browser.close()

if __name__ == '__main__':
    main()
