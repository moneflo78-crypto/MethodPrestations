import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the application.
        page.goto("http://localhost:8000")

        # 2. Go to the "Gestione Librerie" tab and take an initial screenshot.
        library_tab_button = page.get_by_role("button", name="Gestione Librerie")
        expect(library_tab_button).to_be_visible()
        library_tab_button.click()

        glassware_subtab_button = page.get_by_role("button", name="Vetreria", exact=True)
        expect(glassware_subtab_button).to_be_visible()
        glassware_subtab_button.click()

        page.screenshot(path="jules-scratch/verification/01_before_load.png")

        # 3. Trigger the file upload.
        file_input = page.locator("#load-data-input")
        dummy_project_path = os.path.abspath("jules-scratch/verification/dummy_project.json")
        file_input.set_input_files(dummy_project_path)

        # 4. Wait for the file load to complete by checking the file status indicator.
        # This is the most robust way to wait for the async operation to finish.
        status_indicator = page.locator("#file-status-text")
        # The project is loaded but not yet saved by the user, so the status is "(modificato)" (modified).
        expect(status_indicator).to_contain_text("dummy_project.json (modificato)")

        # 5. Verify library preservation.
        # Go back to the library tab to ensure we are checking the correct view.
        library_tab_button.click()
        glassware_subtab_button.click()

        # The default library has "Matraccio 5 mL". The dummy project does not.
        # If this is visible, the library was preserved.
        expect(page.get_by_text("Matraccio 5 mL")).to_be_visible()

        # Take a screenshot of the final state of the library.
        page.screenshot(path="jules-scratch/verification/02_after_load.png")

        # 6. Verify project name update.
        # Go to the "Frontespizio" tab to make the input visible.
        frontespizio_tab_button = page.get_by_role("button", name="Frontespizio")
        expect(frontespizio_tab_button).to_be_visible()
        frontespizio_tab_button.click()

        project_name_input = page.locator("#project-name")
        expect(project_name_input).to_have_value("Dummy Project From File")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)