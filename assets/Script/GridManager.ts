import { _decorator, Component, Node, instantiate, Prefab, Vec3 } from 'cc';
import { GridCell } from './GridCell';
import { ItemBase } from './ItemBase';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

const GRID_ROWS = 9;
const GRID_COLS = 7;
const CELL_SIZE = 150; // 格子大小（可以根据实际预制体大小调整）

@ccclass('GridManager')
export class GridManager extends Component {
    private static _instance: GridManager;
    public static get instance(): GridManager {
        return this._instance;
    }

    @property({ type: Prefab }) gridPrefab: Prefab | null = null;
    public gridCells: GridCell[][] = [];

    onLoad() {
        GridManager._instance = this;
    }

    public initGrid(parentNode: Node) {
        if (!this.gridPrefab) {
            console.error("GridManager: gridPrefab is null!");
            return;
        }

        this.gridCells = [];
        const startX = -((GRID_COLS - 1) * CELL_SIZE) / 2;
        const startY = ((GRID_ROWS - 1) * CELL_SIZE) / 2;

        for (let row = 0; row < GRID_ROWS; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < GRID_COLS; col++) {
                const gridNode = instantiate(this.gridPrefab);
                parentNode.addChild(gridNode);

                const gridCell = gridNode.getComponent(GridCell)!;
                gridCell.row = row;
                gridCell.col = col;
                this.gridCells[row][col] = gridCell;

                const posX = startX + col * CELL_SIZE;
                const posY = startY - row * CELL_SIZE;
                gridNode.setPosition(new Vec3(posX, posY, 0));
            }
        }

        console.log("Grid Initialized");
    }

    public findEmptyCell(): GridCell | null {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (!this.gridCells[row][col].hasItem()) {
                    return this.gridCells[row][col]; // 找到空位就返回
                }
            }
        }
        return null; // 没有空位返回 null
    }
    
    public placeItem(item: ItemBase): boolean {
        const emptyCell = this.findEmptyCell();
        if (emptyCell) {
            emptyCell.setItem(item);
            return true;
        }
        return false;
    }

    public getCell(row: number, col: number): GridCell | null {
        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            return this.gridCells[row][col];
        }
        return null;
    }
}