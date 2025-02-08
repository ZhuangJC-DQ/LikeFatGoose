import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ItemInformation')
export class ItemInformation extends Component {
    @property(Label) public itemNameLabel: Label | null = null;
    @property(Label) public itemDescriptionLabel: Label | null = null;

    /** 更新 UI 显示 */
    public updateUI(name: string, level: number, description: string) {
        if (this.itemNameLabel) this.itemNameLabel.string = `${name} Lv.${level}`;
        if (this.itemDescriptionLabel) this.itemDescriptionLabel.string = `${description}`;
    }
}
