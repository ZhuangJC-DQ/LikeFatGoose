import { _decorator, Component, Node } from 'cc';
import { ItemInformation } from './ItemInformation';
import { ItemBase } from '../Item/ItemBase';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    private static _instance: UIManager;
    public static get instance(): UIManager {
        return this._instance;
    }

    @property(Node) public itemInformationNode: Node | null = null;

    private itemInformation: ItemInformation | null = null;

    onLoad() {
        UIManager._instance = this;
        if (this.itemInformationNode) {
            this.itemInformation = this.itemInformationNode.getComponent(ItemInformation);
        }
    }

    /** 更新物品信息 UI */
    public updateItemInformation(item: ItemBase) {
        if (this.itemInformation) {
            this.itemInformation.updateUI(item.itemName, item.itemLevel, item.itemDescription);
        }
    }
}
