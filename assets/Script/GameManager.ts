import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager {
    private static _instance: GameManager;
    private constructor() {}
    public static get instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }
    public init() {
        console.log("GameManager Initialized");
    }
}

