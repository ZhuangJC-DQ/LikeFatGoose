import { _decorator, Component, resources, Sprite, SpriteFrame, Vec3 } from 'cc';
import { tween } from 'cc';
import { GridCell } from './GridCell';
import { ItemManager } from './ItemManager'; // 确保导入 ItemManager

const { ccclass, property } = _decorator;

let uniqueIDCounter = 0;

@ccclass('ItemBase')
export class ItemBase extends Component {
    public uniqueID: number;
    @property public itemID: number = 0;
    @property public itemType: number = 0;
    @property public itemName: string = "";
    @property public itemDescription: string = "";
    @property public itemLevel: number = 1;
    @property public itemNextLevelID: number = 0;
    @property public itemEmitItemIDs: number[] = [0, 0, 0, 0];
    @property public itemEmitProbabilities: number[] = [1, 1, 1, 1]; // 权重
    @property public itemParentGrid: GridCell | null = null; // 记录所在格子
    private isLaunchable: boolean = false;

    constructor() {
        super();
        this.uniqueID = uniqueIDCounter++;
    }

    public async init(itemID: number) {
        this.itemID = itemID;
        const itemData = await this.loadItemData(itemID);
        if (!itemData) {
            console.error(`ItemBase: 未找到 ID ${itemID} 的物品数据`);
            return;
        }

        this.itemType = itemData.type;
        this.itemName = itemData.name;
        this.itemDescription = itemData.description;
        this.itemLevel = itemData.level;
        this.itemNextLevelID = itemData.nextLevelID;
        this.itemEmitItemIDs = itemData.emitItemIDs;
        this.itemEmitProbabilities = itemData.emitProbabilities;

        // 加载物品图标
        resources.load(itemData.icon, SpriteFrame, (err, spriteFrame) => {
            if (!err) {
                this.node.getComponent(Sprite).spriteFrame = spriteFrame;
            } else {
                console.error("ItemBase: 图标加载失败", err);
            }
        });
    }

    private async loadItemData(itemID: number): Promise<any> {
        return new Promise((resolve) => {
            resources.load("data/itemData", (err, jsonAsset) => {
                if (err) {
                    console.error("ItemBase: 物品数据加载失败", err);
                    resolve(null);
                    return;
                }
                const itemData = (jsonAsset as any).json;
                resolve(itemData[itemID]);
            });
        });
    }

    public setLaunchable(launchable: boolean) {
        this.isLaunchable = launchable;
    }
    

    public getLaunchable(): boolean {
        return this.isLaunchable;
    }

    /** 🎯 发射物品或使用物品 */
    public launch() {
        if (!this.isLaunchable) return;
        
        console.log(`ItemBase: 物品 ${this.itemID} 发射!`);

        if (this.itemType === 1) {
            // 🎯 物品类型为发射器，随机选择一个物品进行发射
            const newItemID = this.getRandomEmitItem();
            if (newItemID !== null) {
                console.log(`ItemBase: 生成新物品 ID ${newItemID}`);
                ItemManager.instance.launchItem(newItemID, this.itemParentGrid);  // 修改这里
            }
        } else {
            console.log(`ItemBase: 物品 ${this.itemID} 无法被发射`);
        }
    }


    /** 🎲 根据权重随机选择一个要发射的物品 */
    private getRandomEmitItem(): number | null {
        if (this.itemEmitItemIDs.length === 0 || this.itemEmitProbabilities.length === 0) {
            console.warn("ItemBase: 发射器没有可发射的物品");
            return null;
        }

        const totalWeight = this.itemEmitProbabilities.reduce((sum, weight) => sum + weight, 0);
        const rand = Math.random() * totalWeight;
        
        let cumulativeWeight = 0;
        for (let i = 0; i < this.itemEmitItemIDs.length; i++) {
            cumulativeWeight += this.itemEmitProbabilities[i];
            if (rand < cumulativeWeight) {
                return this.itemEmitItemIDs[i];
            }
        }
        return null;
    }
}
