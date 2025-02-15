import { ItemUseStrategy } from '../../ItemUseStrategy';
import { ItemBase } from '../ItemBase';
import { ItemManager } from '../ItemManager';

export class ConsumableItemStrategy implements ItemUseStrategy {
    async use(item: ItemBase): Promise<boolean> {
        if (item.itemType !== 2) {
            console.error(`ConsumableItemStrategy: 物品 ${item.itemID} 不是可使用道具`);
            return false;
        }

        // 在这里添加具体的使用逻辑
        console.log(`ConsumableItemStrategy: 使用物品 ${item.itemID}`);
        
        // 示例：移除物品
        ItemManager.instance.removeItem(item);

        return true;
    }
}