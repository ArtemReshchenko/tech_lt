import { test } from './fixtures/saucedemo-fixtures';

test.describe('Saucedemo UI Automation', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('Successful login using standard_user', async ({ loginPage, inventoryPage }) => {
        await loginPage.login('standard_user');
        await inventoryPage.verifyIsOnPage();
    });

    test('Failed login using locked_out_user', async ({ loginPage }) => {
        await loginPage.login('locked_out_user');
        await loginPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
    });

    test('Add a product to the cart', async ({ loginPage, inventoryPage, cartPage }) => {
        await loginPage.login('standard_user');
        await inventoryPage.verifyIsOnPage();

        const itemToAdd = 'Sauce Labs Backpack';
        await inventoryPage.addItemToCart(itemToAdd);

        await inventoryPage.goToCart();
        await cartPage.verifyItemInCart(itemToAdd);
    });

    test('Start the checkout process', async ({ loginPage, inventoryPage, cartPage, checkoutPage }) => {
        await loginPage.login('standard_user');
        await inventoryPage.verifyIsOnPage();

        const itemToAdd = 'Sauce Labs Fleece Jacket';
        await inventoryPage.addItemToCart(itemToAdd);

        await inventoryPage.goToCart();
        await cartPage.verifyItemInCart(itemToAdd);

        await cartPage.proceedToCheckout();

        await checkoutPage.fillInformation('John', 'Doe', '12345');
        await checkoutPage.continue();

        await checkoutPage.verifyIsOnStepTwo();
    });
});
