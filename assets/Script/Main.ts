import { _decorator, Component, Node, find } from 'cc';
import { GameManager } from './GameManager';
import { GridManager } from './Grid/GridManager';
import { ItemManager } from './Item/ItemManager';
import { UIManager } from './UI/UIManager';
import { GameData } from './GameData';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        console.log("Game Starting...");
        
        // 初始化所有单例管理类
        GameManager.instance.init();
        const gridContainer = find("Canvas/GridContainer"); // 网格容器
        const itemContainer = find("Canvas/ItemContainer"); // 物品容器

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
        // 添加测试代码，在 GridManager 中初始化两个物品
        ItemManager.instance.createItem(1);
        ItemManager.instance.createItem(1);
        ItemManager.instance.createItem(2);
        ItemManager.instance.createItem(3);
        // UIManager.instance.initUI();
        GameData.instance.loadData();

        console.log("All Managers Initialized");
    }
}
