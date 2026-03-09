import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly checkoutButton: Locator;
    readonly inventoryItemName: Locator;

    constructor(page: Page) {
        this.page = page;
        this.checkoutButton = page.locator('[data-test="checkout"]');
        this.inventoryItemName = page.locator('.inventory_item_name');
    }

    async verifyItemInCart(itemName: string) {
        await expect(this.inventoryItemName.filter({ hasText: itemName })).toBeVisible();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }
}
