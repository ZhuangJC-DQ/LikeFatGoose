import { ItemUseStrategy } from '../ItemUseStrategy';
import { ItemBase } from '../ItemBase';
import { ItemManager } from '../ItemManager';

export class LaunchItemStrategy implements ItemUseStrategy {
    async use(item: ItemBase): Promise<boolean> {
        if (item.itemType !== 1) {
            console.error(`LaunchItemStrategy: 物品 ${item.itemID} 不是发射器`);
            return false;
        }

        const newItemID = item.getRandomEmitItem();
        if (newItemID !== null) {
            console.log(`LaunchItemStrategy: 生成新物品 ID ${newItemID}`);
            return await ItemManager.instance.launchItem(newItemID, item.itemParentGrid);
        }

        return false;
    }
}