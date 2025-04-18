import { _decorator, Component, Node, Prefab, instantiate, find, Vec3 } from 'cc';
import { tween } from 'cc';
import { GridManager } from '../Grid/GridManager';
import { GridCell } from '../Grid/GridCell';
import { ItemBase } from './ItemBase';
import { UIManager } from '../UI/UIManager';
import { StaminaManager } from '../StaminaManager';

const { ccclass, property } = _decorator;

@ccclass('ItemManager')
export class ItemManager extends Component {
    private static _instance: ItemManager;

    @property(Prefab)
    public itemPrefab: Prefab | null = null; // 物品预制体

    private itemContainer: Node | null = null; // 物品容器
    
    private currentLaunchableItem: ItemBase | null = null; // 当前可发射状态的物品

    public static get instance(): ItemManager {
        return this._instance;
    }

    onLoad() {
        ItemManager._instance = this;
    }

    public initItems(parentNode: Node) {
        if (!this.itemPrefab) {
            console.error("ItemManager: itemPrefab is null!");
            return;
        }

        this.itemContainer = parentNode;
        console.log("ItemManager Initialized");
    }
    
    public async createItem(itemID: number): Promise<boolean> {
        if (!this.itemContainer) {
            console.error("ItemManager: itemContainer 未初始化");
            return false;
        }
    
        const emptyCell = GridManager.instance.findEmptyCell();
        if (!emptyCell) {
            console.warn("ItemManager: 没有空余格子");
            return false;
        }
    
        if (!this.itemPrefab) {
            console.error("ItemManager: itemPrefab 为空");
            return false;
        }
    
        // 生成物品预制体
        const newItemNode = instantiate(this.itemPrefab);
        this.itemContainer.addChild(newItemNode);
    
        // 获取 ItemBase 组件
        const newItem = newItemNode.getComponent(ItemBase);
        if (!newItem) {
            console.error("ItemManager: 物品创建失败，ItemBase 组件丢失");
            return false;
        }
    
        newItem.init(itemID);
        newItem.itemParentGrid = emptyCell;
    
        emptyCell.setItem(newItem);
    
        // **确保物品位置正确**
        newItemNode.setPosition(emptyCell.node.position);
    
        console.log(`ItemManager: 物品 ${itemID} 创建成功，放置在 (${emptyCell.node.position.x}, ${emptyCell.node.position.y})`);
        return true;
    }

    public async createItemToGrid(itemID: number, parentGrid?: GridCell): Promise<boolean> {
        if (!this.itemContainer) {
            console.error("ItemManager: itemContainer 未初始化");
            return false;
        }
    
        let targetGrid = parentGrid || GridManager.instance.findEmptyCell();
    
        if (!targetGrid) {
            console.warn("ItemManager: 没有空余格子");
            return false;
        }
    
        if (!this.itemPrefab) {
            console.error("ItemManager: itemPrefab 为空");
            return false;
        }
    
        // 生成物品预制体
        const newItemNode = instantiate(this.itemPrefab);
        this.itemContainer.addChild(newItemNode);
    
        // 获取 ItemBase 组件
        const newItem = newItemNode.getComponent(ItemBase);
        if (!newItem) {
            console.error("ItemManager: 物品创建失败，ItemBase 组件丢失");
            return false;
        }
    
        await newItem.init(itemID);
        newItem.itemParentGrid = targetGrid;
    
        targetGrid.setItem(newItem);
    
        // **初始设置为缩小状态**
        newItemNode.setScale(0, 0, 0);
        newItemNode.setPosition(targetGrid.node.position);

        this.setLaunchableItem(newItem);
    
        // **播放缩放动画**
        tween(newItemNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    
        console.log(`ItemManager: 物品 ${itemID} 创建成功，放置在 (${targetGrid.node.position.x}, ${targetGrid.node.position.y})`);
    
        return true;
    }

    /** 🎯 物品发射（带动画） */
    public async launchItem(itemID: number, startCell: GridCell): Promise<boolean> {
        if (!this.itemContainer) {
            console.error("ItemManager: itemContainer 未初始化");
            return false;
        }

        if (!this.itemPrefab) {
            console.error("ItemManager: itemPrefab 为空");
            return false;
        }
        if(StaminaManager.instance.getCurrentStamina() < 1)
        {
            console.log("ItemManager: 体力不足");
            return false;
        }
        // 🔍 使用 BFS 查找最近的空格子
        const emptyCell = this.findNearestEmptyCell(startCell);
        if (!emptyCell) {
            console.warn("ItemManager: 没有找到可用格子，无法发射");
            return false;
        }

        // 生成物品预制体
        const newItemNode = instantiate(this.itemPrefab);
        this.itemContainer.addChild(newItemNode);

        // 获取 ItemBase 组件
        const newItem = newItemNode.getComponent(ItemBase);
        if (!newItem) {
            console.error("ItemManager: 物品创建失败，ItemBase 组件丢失");
            return false;
        }

        newItem.init(itemID);
        newItem.itemParentGrid = emptyCell;
        emptyCell.setItem(newItem);

        // **动画效果：从发射器位置平滑移动到目标位置**
        const ANIMATION_DURATION = 0.3; // 动画时长（秒）
        const startPosition = startCell.node.position;
        const targetPosition = emptyCell.node.position;
        
        newItemNode.setPosition(startPosition); // 初始位置设为发射器位置

        // 禁用触摸事件，避免刚发射的物品被重复点击
        newItemNode.pauseSystemEvents(true);

        StaminaManager.instance.useStamina(1);

        await new Promise((resolve) => {
            tween(newItemNode)
                .to(ANIMATION_DURATION, { position: targetPosition }, { easing: "cubicOut" }) // 平滑移动
                .call(resolve) // 动画完成后 resolve
                .start();
        });

        newItemNode.resumeSystemEvents(true);

        console.log(`ItemManager: 物品 ${itemID} 发射完成，放置在 (${targetPosition.x}, ${targetPosition.y})`);
        return true;
    }


    public removeItem(item: ItemBase) {
        if (item.itemParentGrid) {
            item.itemParentGrid.removeItem();
        }

        item.node.destroy();

    }

    // 使用和移除物品
    public useItem(item: ItemBase) {
        if (item.itemParentGrid) {
            item.itemParentGrid.removeItem();
        }

        item.startDisappearAnimation();
    }

    // 设置当前可发射状态的物品
    public setLaunchableItem(item: ItemBase | null) {
        if (this.currentLaunchableItem) {
            // 取消之前的可发射状态
            this.currentLaunchableItem.setLaunchable(false);
        }
        this.currentLaunchableItem = item;
        UIManager.instance.updateItemInformation(this.currentLaunchableItem);
        if (item) {
            item.setLaunchable(true);
        }
    }

    // 获取当前可发射状态的物品
    public getLaunchableItem(): ItemBase | null {
        return this.currentLaunchableItem;
    }

    /** 处理物品重叠（合成或交换） */
    public handleItemOverlap(thisItem: ItemBase, otherItem: ItemBase) {
        if (!thisItem || !otherItem) return;

        // ✅ **合成逻辑**：如果两者 `itemID` 相同
        if (thisItem.itemID === otherItem.itemID) {
            const nextLevelID = thisItem.itemNextLevelID;

            // 确保 `nextLevelID` 有效
            if (nextLevelID > 0) {
                console.log(`合成物品: ${thisItem.itemID} + ${otherItem.itemID} -> ${nextLevelID}`);

                const parentGrid = otherItem.itemParentGrid;

                // 移除两个物品
                ItemManager.instance.removeItem(thisItem);
                ItemManager.instance.removeItem(otherItem);

                // 生成新物品
                if (parentGrid) {
                    ItemManager.instance.createItemToGrid(nextLevelID, parentGrid);
                }
            } else {
                console.warn("无法合成: 物品没有下一级合成 ID");
                this.swapItems(thisItem, otherItem);
            }
        } else {
            // ❌ **否则，执行交换**
            this.swapItems(thisItem, otherItem);
        }
    }

    /** 交换两个物品的位置，使用广度优先遍历算法找到合适的腾挪位置 */
    public swapItems(thisItem: ItemBase, otherItem: ItemBase) {
        if (!thisItem || !otherItem.itemParentGrid) return;

        const myOldCell = thisItem.itemParentGrid;
        const otherOldCell = otherItem.itemParentGrid;

        if (!myOldCell || !otherOldCell) return;

        console.log(`交换物品: ${thisItem.itemID} ↔ ${otherItem.itemID}`);

        // 使用 BFS 逆时针查找最近的空位
        const emptyCell = this.findNearestEmptyCellExclude(otherOldCell, myOldCell);
        
        if (emptyCell) {
            console.log(`找到合适的空位: (${emptyCell.row}, ${emptyCell.col})，腾挪物品`);
            
            
            otherItem.itemParentGrid?.removeItem();
            emptyCell.setItem(otherItem);
            otherItem.itemParentGrid = emptyCell;

            // **交换 GridCell 的 item 绑定**
            myOldCell.removeItem();
            otherOldCell.removeItem();
            otherOldCell.setItem(thisItem);
            thisItem.itemParentGrid = otherOldCell;

            // **移动 otherItem 到找到的空位**
            tween(otherItem.node)
                .to(0.3, { position: emptyCell.node.position }, { easing: 'quadOut' })
                .start();
                
            // **平滑动画交换位置**
            tween(thisItem.node)
                .to(0.3, { position: otherOldCell.node.position }, { easing: 'quadOut' })
                .start();
        } else {
            console.log("没有找到空位，执行直接交换逻辑");

            // **交换 GridCell 的 item 绑定**
            myOldCell.removeItem();
            otherOldCell.removeItem();
            myOldCell.setItem(otherItem);
            otherOldCell.setItem(thisItem);
            thisItem.itemParentGrid = otherOldCell;
            otherItem.itemParentGrid = myOldCell;

            // **平滑动画交换位置**
            tween(thisItem.node)
                .to(0.3, { position: otherOldCell.node.position }, { easing: 'quadOut' })
                .start();
            tween(otherItem.node)
                .to(0.3, { position: myOldCell.node.position }, { easing: 'quadOut' })
                .start();
        }
    }

    /**
     * 广度优先搜索，查找最近的空格子
     */
    private findNearestEmptyCell(startCell: GridCell): GridCell | null {
        const directions = [
            { x: 0, y: -1 },  // 上
            { x: -1, y: -1 }, // 左上
            { x: -1, y: 0 }, // 左
            { x: -1, y: 1 },// 左下
            { x: 0, y: 1 }, // 下
            { x: 1, y: 1 }, // 右下
            { x: 1, y: 0 },  // 右
            { x: 1, y: -1 },  // 右上
        ];
    
        const queue: GridCell[] = [startCell];
        const visited = new Set<GridCell>([startCell]);
    
        while (queue.length > 0) {
            const current = queue.pop()!; // BFS 处理当前格子
    
            for (const dir of directions) {
                const nextCell = GridManager.instance.getCell(current.row + dir.y, current.col + dir.x);
                if (nextCell && !visited.has(nextCell)) {
                    if (!nextCell.hasItem()) {
                        return nextCell; // 找到空位直接返回
                    }
    
                    visited.add(nextCell);
                    queue.unshift(nextCell); // 继续遍历
                }
            }
        }
        return null; // 没找到空位
    }
    
    /**
     * 广度优先搜索，查找最近的空格子，包含替换者的格子
     */
    private findNearestEmptyCellExclude(startCell: GridCell, excludeCell: GridCell): GridCell | null {
        const directions = [
            { x: 0, y: -1 },  // 上
            { x: -1, y: -1 }, // 左上
            { x: -1, y: 0 }, // 左
            { x: -1, y: 1 },// 左下
            { x: 0, y: 1 }, // 下
            { x: 1, y: 1 }, // 右下
            { x: 1, y: 0 },  // 右
            { x: 1, y: -1 },  // 右上
        ];

        const queue: GridCell[] = [startCell];
        const visited = new Set<GridCell>();
        visited.add(startCell);

        while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;

            for (const dir of directions) {
                const nextCell = GridManager.instance.getCell(current.row + dir.y, current.col + dir.x);
                if (nextCell && !visited.has(nextCell)) {
                    visited.add(nextCell);
                    
                    if (!nextCell.hasItem() && nextCell !== excludeCell) {
                        return nextCell; // 找到最近的空位
                    }
                    
                    queue.push(nextCell);
                }
            }
        }
        return null; // 没找到空位
    }
}
