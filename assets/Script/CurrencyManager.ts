import { _decorator, Component, Node, Label } from 'cc';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('CurrencyManager')
export class CurrencyManager extends Component {

    private static _instance: CurrencyManager;
    public static get instance(): CurrencyManager {
        return this._instance;
    }

    onLoad() {
        CurrencyManager._instance = this;
    }
    
    @property({ type: Label }) public coinText: Label | null = null;
    @property({ type: Label }) public diamondText: Label | null = null;

    start() {
        this.loadCoin();
        this.loadDiamond();
    }

    private updateUI() {
        if (this.coinText) {
            this.coinText.string = `${GameData.instance.gold}`;
        }
        
        if (this.diamondText) {
            this.diamondText.string = `${GameData.instance.diamonds}`;
        }
    
    }

    update(deltaTime: number) {
        this.updateUI();
    }

    // 添加金币
    public addCoin(amount: number) {
        GameData.instance.gold += amount;
        this.saveCoin();
    }

    // 减少金币
    public reduceCoin(amount: number) {
        GameData.instance.gold -= amount;
        this.saveCoin();
    }

    // 添加钻石
    public addDiamond(amount: number) {
        GameData.instance.diamonds += amount;
        this.saveDiamond();
    }

    // 减少钻石
    public reduceDiamond(amount: number) {
        GameData.instance.diamonds -= amount;
        this.saveDiamond();
    }

    // 读取金币
    private loadCoin() {
        const coin = localStorage.getItem("Coin");
        if (coin) {
            const coinData = JSON.parse(coin);
            GameData.instance.gold = coinData.gold;
        }
    }

    // 储存金币
    private saveCoin() {
        localStorage.setItem("Coin", JSON.stringify({
            gold: GameData.instance.gold,
            diamonds: GameData.instance.diamonds
        }));
    }
    
    // 读取钻石
    private loadDiamond() {
        const diamond = localStorage.getItem("Diamond");
        if (diamond) {
            const diamondData = JSON.parse(diamond);
            GameData.instance.diamonds = diamondData.diamonds;
        }
    }

    // 储存钻石
    private saveDiamond() {
        localStorage.setItem("Diamond", JSON.stringify({
            gold: GameData.instance.gold,
            diamonds: GameData.instance.diamonds
        }));
    }

}


