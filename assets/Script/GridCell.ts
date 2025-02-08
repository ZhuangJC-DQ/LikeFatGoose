import { _decorator, Component, Node, CCInteger} from 'cc';
import { ItemBase } from './ItemBase';

const { ccclass, property } = _decorator;

@ccclass('GridCell')
export class GridCell extends Component {
    @property({ type: CCInteger }) row: CCInteger = 0;
    @property({ type: CCInteger }) col: CCInteger = 0;
    @property private item: ItemBase | null = null;

    public setItem(item: ItemBase) {
        if (this.item) {
            console.warn(`GridCell (${this.row}, ${this.col}) 已经有物品`);
            return;
        }
        this.item = item;
        console.log(`GridCell (${this.row}, ${this.col}) 设置物品 ${item.itemID}`);
    }
    
    public getItem(): ItemBase {
        return this.item;
    }

    public removeItem() {
        this.item = null;
    }

    public hasItem(): boolean {
        return this.item !== null;
    }
}


