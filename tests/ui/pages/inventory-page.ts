import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly title: Locator;
    readonly shoppingCartLink: Locator;
    readonly inventoryItem: Locator;
    readonly addToCartButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.title = page.locator('.title');
        this.shoppingCartLink = page.locator('.shopping_cart_link');
        this.inventoryItem = page.locator('.inventory_item');
        this.addToCartButton = page.locator('button[data-test^="add-to-cart-"]');
    }

    async verifyIsOnPage() {
        await expect(this.title).toHaveText('Products');
    }

    async addItemToCart(itemName: string) {
        await this.inventoryItem.filter({ hasText: itemName }).locator(this.addToCartButton).click();
    }

    async goToCart() {
        await this.shoppingCartLink.click();
    }
}
