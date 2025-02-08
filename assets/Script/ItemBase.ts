import { _decorator, Component, resources, Sprite, SpriteFrame, Vec3 } from 'cc';
import { tween } from 'cc';
import { GridCell } from './GridCell';
import { ItemManager } from './ItemManager';

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
    @property public itemEmitProbabilities: number[] = [1, 1, 1, 1];
    @property public itemParentGrid: GridCell | null = null;
    private isLaunchable: boolean = false;

    constructor() {
        super();
        this.uniqueID = uniqueIDCounter++;
    }

    public async init(itemID: number) {
        this.itemID = itemID;
        const itemData = await this.loadItemData(itemID);
        if (!itemData) {
            console.error(`ItemBase: Cannot find item data for itemID ${itemID}`);
            return;
        }

        this.itemType = itemData.type;
        this.itemName = itemData.name;
        this.itemDescription = itemData.description;
        this.itemLevel = itemData.level;
        this.itemNextLevelID = itemData.nextLevelID;
        this.itemEmitItemIDs = itemData.emitItemIDs;
        this.itemEmitProbabilities = itemData.emitProbabilities;

        resources.load(itemData.icon, SpriteFrame, (err, spriteFrame) => {
            if (!err) {
                this.node.getComponent(Sprite).spriteFrame = spriteFrame;
            } else {
                console.error("ItemBase: Load icon failed", err);
            }
        });
    }

    private async loadItemData(itemID: number): Promise<any> {
        return new Promise((resolve) => {
            resources.load("data/itemData", (err, jsonAsset) => {
                if (err) {
                    console.error("ItemBase: Load itemData failed", err);
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

    public launch() {
        if (!this.isLaunchable) return;
        
        console.log(`ItemBase: Item ${this.itemID} launched`);

        if (this.itemType === 1) {
            const newItemID = this.getRandomEmitItem();
            if (newItemID !== null) {
                console.log(`ItemBase: Launch item ${newItemID}`);
                ItemManager.instance.launchItem(newItemID, this.itemParentGrid);
            }
        } else {
            console.log(`ItemBase: Item ${this.itemID} is not launchable`);
        }
    }


    private getRandomEmitItem(): number | null {
        if (this.itemEmitItemIDs.length === 0 || this.itemEmitProbabilities.length === 0) {
            console.warn("ItemBase: Emit item list is empty");
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
