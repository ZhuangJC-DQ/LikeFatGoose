import { _decorator, Component, Node, Prefab, instantiate, find, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ItemDescriptionButton')
export class ItemDescriptionButton extends Component {
    @property(Prefab)
    itemDescriptionPrefab: Prefab | null = null; // 预制体引用

    private itemDescriptionInstance: Node | null = null; // 生成的预制体实例

    onLoad() {
        // 绑定按钮点击事件
        this.node.on(Node.EventType.TOUCH_END, this.onButtonClick, this);
    }

    private onButtonClick() {
        const prefabName = "ItemDescriptionInstance"; // 预制体实例的名称
    
        // 通过名称查找是否已经存在实例
        const existingInstance = find("Canvas/ItemDescriptionInstance");
        if (existingInstance) {
            // 如果已经存在实例，则不再生成
            return;
        }
    
        // 生成预制体
        if (this.itemDescriptionPrefab) {
            this.itemDescriptionInstance = instantiate(this.itemDescriptionPrefab);
            const canvas = find('Canvas');
            if (canvas) {
                canvas.addChild(this.itemDescriptionInstance);
    
                // 为生成的预制体实例命名
                this.itemDescriptionInstance.name = prefabName;
    
                // 将预制体放置在屏幕正中央
                this.itemDescriptionInstance.setPosition(0, 0, 0);
            }
        }
    }
}