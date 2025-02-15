import { _decorator, Component, Label } from "cc";
import { EventSystem } from "../EventSystem";
import { GameData } from "../GameData";
const { ccclass, property } = _decorator;

@ccclass("StaminaUI")
export class StaminaUI extends Component {
  @property({ type: Label }) public staminaText: Label | null = null;

  onLoad() {
    EventSystem.instance.on(
      "staminaChanged",
      this.updateStaminaText.bind(this)
    );
    this.updateStaminaText(GameData.instance.stamina);
  }

  private updateStaminaText(stamina: number) {
    if (this.staminaText) {
      this.staminaText.string = `${stamina}/${GameData.instance.maxStamina}`;
    }
  }

  onDestroy() {
    EventSystem.instance.off(
      "staminaChanged",
      this.updateStaminaText.bind(this)
    );
  }
}
