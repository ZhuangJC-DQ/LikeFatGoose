import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {
    private static _instance: GameData;
    public level: number = 1;
    public stamina: number = 100;
    public maxStamina: number = 100; // 添加体力上限
    public gold: number = 0;
    public diamonds: number = 0;
    
    private constructor() {}
    public static get instance(): GameData {
        if (!this._instance) {
            this._instance = new GameData();
        }
        return this._instance;
    }
    public loadData() {
        console.log("GameData Loaded");
    }
}