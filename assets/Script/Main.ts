import { _decorator, Component, Node, find } from 'cc';
import { GameManager } from './GameManager';
import { GridManager } from './GridManager';
import { ItemManager } from './ItemManager';
import { UIManager } from './UI/UIManager';
import { GameData } from './GameData';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        console.log("Game Starting...");
        
        GameManager.instance.init();
        const gridContainer = find("Canvas/GridContainer");
        const itemContainer = find("Canvas/ItemContainer");

        if (gridContainer) {
            GridManager.instance.initGrid(gridContainer);
        } else {
            console.error("GridContainer not found in scene.");
        }

        if (itemContainer) {
            ItemManager.instance.initItems(itemContainer);
        } else {
            console.error("ItemContainer not found in scene.");
        }
        ItemManager.instance.createItem(0);
        ItemManager.instance.createItem(1);
        // UIManager.instance.initUI();
        GameData.instance.loadData();

        console.log("All Managers Initialized");
    }
}
