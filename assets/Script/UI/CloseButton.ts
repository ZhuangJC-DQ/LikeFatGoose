import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CloseButton')
export class CloseButton extends Component {
    onLoad() {
        // 绑定按钮点击事件
        this.node.on(Node.EventType.TOUCH_END, this.onCloseButtonClick, this);
    }

    private onCloseButtonClick() {
        // 获取父节点
        const parentNode = this.node.parent;
        if (parentNode) {
            // 销毁父节点（包括自身）
            parentNode.destroy();
        }
    }
}