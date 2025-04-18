import { _decorator, Component, Node, Label } from 'cc';
import { GameData } from './GameData';
import { EventSystem } from './EventSystem';
const { ccclass, property } = _decorator;

@ccclass('StaminaManager')
export class StaminaManager extends Component {
    private static _instance: StaminaManager;
    public static get instance(): StaminaManager {
        return this._instance;
    }

    onLoad() {
        StaminaManager._instance = this;
    }

    private staminaRecoveryRate: number = 10 * 1000; // 5 分钟恢复 1 点
    private lastRecoveryTime: number = Date.now(); // 上次恢复时间

    @property({ type: Label }) public staminaText: Label | null = null;
    @property({ type: Label }) public staminaTimerText: Label | null = null;

    private getRemainingTime(): number {
        if (GameData.instance.stamina >= GameData.instance.maxStamina) return 0;

        const now = Date.now();
        const timeSinceLastRecovery = now - this.lastRecoveryTime;
        return this.staminaRecoveryRate - (timeSinceLastRecovery % this.staminaRecoveryRate);
    }

    private updateUI() {
        if (this.staminaText) {
            this.staminaText.string = `${GameData.instance.stamina}/${GameData.instance.maxStamina}`;
        }
    
        if (this.staminaTimerText) {
            if (GameData.instance.stamina >= GameData.instance.maxStamina) {
                this.staminaTimerText.string = ""; // 体力满时隐藏倒计时
            } else {
                const remainingTime = this.getRemainingTime();
                const minutes = Math.floor(remainingTime / 60000);
                const seconds = Math.floor((remainingTime % 60000) / 1000);
                this.staminaTimerText.string = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            }
        }
    }

    start() {
        this.loadStaminaData();
        this.schedule(() => {
            this.recoverStamina(); // 计算离线恢复
        },0.5);
        this.schedule(() => {
            this.updateUI();
        }, 1);
    }

    /** ⚡ 消耗体力 */
    public useStamina(amount: number): boolean {
        if (GameData.instance.stamina < amount) return false;
        GameData.instance.stamina -= amount;
        this.saveStaminaData();
        this.updateUI();
        EventSystem.instance.emit('staminaChanged', GameData.instance.stamina);

        return true;
    }


    /** ❤️ 增加体力 */
    public addStamina(amount: number) {
        GameData.instance.stamina = Math.min(GameData.instance.maxStamina, GameData.instance.stamina + amount);
        this.saveStaminaData();
        this.updateUI();
        EventSystem.instance.emit('staminaChanged', GameData.instance.stamina);
    }

    /** 💾 读取体力数据 */
    private loadStaminaData() {
        const data = localStorage.getItem("staminaData");
        if (data) {
            const parsed = JSON.parse(data);
            GameData.instance.stamina = parsed.stamina || GameData.instance.maxStamina;
            this.lastRecoveryTime = parsed.lastRecoveryTime || Date.now();
        }
    }

    /** 💾 存储体力数据 */
    private saveStaminaData() {
        localStorage.setItem("staminaData", JSON.stringify({
            stamina: GameData.instance.stamina,
            lastRecoveryTime: this.lastRecoveryTime
        }));
    }

    /** 🎯 获取当前体力 */
    public getCurrentStamina(): number {
        return GameData.instance.stamina;
    }

    /** ⏳ 获取体力恢复倒计时 */
    public getRecoveryCountdown(): string {
        const remainingTime = this.getRemainingTime();
        if (remainingTime <= 0) return "00:00";

        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    /** ♻ 计算并恢复体力 */
    private recoverStamina() {
        if (GameData.instance.stamina >= GameData.instance.maxStamina) {
            // 体力满了，停止计时，不再执行恢复逻辑
            this.lastRecoveryTime = Date.now();
            setTimeout(() => this.recoverStamina(), 500);
        }
    
        const now = Date.now();
        const elapsedTime = now - this.lastRecoveryTime;
        const recoverAmount = Math.floor(elapsedTime / this.staminaRecoveryRate);
    
        if (recoverAmount > 0) {
            GameData.instance.stamina = Math.min(GameData.instance.maxStamina, GameData.instance.stamina + recoverAmount);
            this.lastRecoveryTime += recoverAmount * this.staminaRecoveryRate;
            this.saveStaminaData();
        }
    }
}