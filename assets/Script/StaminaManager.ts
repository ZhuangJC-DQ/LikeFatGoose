import { _decorator, Component, Node, Label } from 'cc';
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

    private maxStamina: number = 100; // 体力上限
    private currentStamina: number = 100; // 当前体力
    private staminaRecoveryRate: number = 10 * 1000; // 5 分钟恢复 1 点
    private lastRecoveryTime: number = Date.now(); // 上次恢复时间

    @property({ type: Label }) public staminaText: Label | null = null;
    @property({ type: Label }) public staminaTimerText: Label | null = null;

    constructor() {
        super();
        // this.loadStaminaData();
        // this.recoverStamina(); // 计算离线恢复
    }

    private getRemainingTime(): number {
        if (this.currentStamina >= this.maxStamina) return 0;

        const now = Date.now();
        const timeSinceLastRecovery = now - this.lastRecoveryTime;
        return this.staminaRecoveryRate - (timeSinceLastRecovery % this.staminaRecoveryRate);
    }

    private updateUI() {
        if (this.staminaText) {
            this.staminaText.string = `${this.currentStamina}/${this.maxStamina}`;
        }
    
        if (this.staminaTimerText) {
            if (this.currentStamina >= this.maxStamina) {
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
s
    /** ⚡ 消耗体力 */
    public useStamina(amount: number): boolean {
        if (this.currentStamina < amount) return false;
        this.currentStamina -= amount;
        this.saveStaminaData();
        this.updateUI();

        return true;
    }

    /** ❤️ 增加体力 */
    public addStamina(amount: number) {
        this.currentStamina = Math.min(this.maxStamina, this.currentStamina + amount);
        this.saveStaminaData();
        this.updateUI();
    }

    /** 💾 读取体力数据 */
    private loadStaminaData() {
        const data = localStorage.getItem("staminaData");
        if (data) {
            const parsed = JSON.parse(data);
            this.currentStamina = parsed.currentStamina || this.maxStamina;
            this.lastRecoveryTime = parsed.lastRecoveryTime || Date.now();
        }
    }

    /** 💾 存储体力数据 */
    private saveStaminaData() {
        localStorage.setItem("staminaData", JSON.stringify({
            currentStamina: this.currentStamina,
            lastRecoveryTime: this.lastRecoveryTime
        }));
    }

    /** 🎯 获取当前体力 */
    public getCurrentStamina(): number {
        return this.currentStamina;
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
        if (this.currentStamina >= this.maxStamina) {
            // 体力满了，停止计时，不再执行恢复逻辑
            this.lastRecoveryTime = Date.now();
            setTimeout(() => this.recoverStamina(), 500);
        }
    
        const now = Date.now();
        const elapsedTime = now - this.lastRecoveryTime;
        const recoverAmount = Math.floor(elapsedTime / this.staminaRecoveryRate);
    
        if (recoverAmount > 0) {
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + recoverAmount);
            this.lastRecoveryTime += recoverAmount * this.staminaRecoveryRate;
            this.saveStaminaData();
        }
    }
    
}
