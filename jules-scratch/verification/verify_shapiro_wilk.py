import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Navigate to the local HTML file
        await page.goto(f'file://{file_path}')

        # 1. Click the "Verifica Validazione" tab
        validation_tab_button = page.get_by_role("button", name="Verifica Validazione")
        await validation_tab_button.click()

        # 2. Select the Shapiro-Wilk test from the dropdown
        validation_select = page.locator("#validation-test-select")
        await validation_select.select_option("unichim_179_1_esempio_1")

        # 3. Click the "Esegui Test di Verifica" button
        run_button = page.get_by_role("button", name="Esegui Test di Verifica")
        await run_button.click()

        # 4. Wait for the results container to be visible and contain the "SUPERATO" text
        results_container = page.locator("#validation-results-container")
        await expect(results_container).to_be_visible()

        # Check for the "SUPERATO" status, which indicates the 1% tolerance logic is working
        overall_status = results_container.locator("h3 > span")
        await expect(overall_status).to_have_text("SUPERATO")

        # 5. Take a screenshot of the results container
        screenshot_path = 'jules-scratch/verification/shapiro_wilk_validation.png'
        await results_container.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())