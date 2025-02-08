import { _decorator, Component, Node, Vec3, UITransform, EventTouch } from 'cc';
import { tween } from 'cc';
import { GridManager } from './GridManager';
import { GridCell } from './GridCell';
import { ItemBase } from './ItemBase';
import { ItemManager } from './ItemManager';

const { ccclass, property } = _decorator;

@ccclass('ItemInteraction')
export class ItemInteraction extends Component {
    private startPos: Vec3 = new Vec3();
    private dragging: boolean = false;
    private launchable: boolean = false;
    private itemBase: ItemBase | null = null;

    onLoad() {
        this.itemBase = this.getComponent(ItemBase);
        if (!this.itemBase) {
            console.error("ItemInteraction: ItemBase component not found!");
            return;
        }

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        this.startPos.set(this.itemBase.itemParentGrid.node.position);
        this.dragging = true;
    
        this.node.setSiblingIndex(this.node.parent!.children.length - 1);
    
        if (ItemManager.instance.getLaunchableItem() === this.itemBase) {
            this.launchable = true;
        } else {
            this.launchable = false;
        }
        ItemManager.instance.setLaunchableItem(this.itemBase);
    }
    
    private onTouchMove(event: EventTouch) {
        if (!this.dragging || !this.itemBase.itemParentGrid) return;
    
        const touchPos = event.getUILocation();
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
    
        if (this.isInsideGridCell(this.itemBase.itemParentGrid, worldPos)) {
            return;
        }
    
        const localPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
    
        tween(this.node)
            .to(0.08, { position: localPos }, { easing: 'quadOut' })
            .start();
    
        this.launchable = false;
    }

    private onTouchEnd(event: EventTouch) {
        if (!this.dragging || !this.itemBase) return;
        this.dragging = false;
    
        this.node.setSiblingIndex(0);
    
        const worldPos = this.node.getWorldPosition();
        const gridCell = this.findGridCellAtPosition(worldPos);
    
        if(gridCell == this.itemBase.itemParentGrid) {
            if(this.launchable && this.itemBase.getLaunchable()) {
                this.itemBase.launch();
                this.launchable = false;
            }
            
            tween(this.node)
                .to(0.3, { position: this.startPos }, { easing: 'quadOut' })
                .start();
            const baseBounce: number = 1.0
            const randomFactor = 0.2 + Math.random() * 0.3;
            const bounceScale = baseBounce * randomFactor;
    
            // 构建一个果冻弹跳动画
            tween(this.node)
                .to(0.08, { scale: new Vec3(1 + 0.5 * bounceScale, 1 - 0.5 * bounceScale, 1) }, { easing: "quadOut" })  // 水平拉长
                .to(0.08, { scale: new Vec3(1 - 0.5 * bounceScale, 1 + 0.5 * bounceScale, 1) }, { easing: "quadOut" })  // 垂直拉长
                .to(0.07, { scale: new Vec3(1 + 0.25 * bounceScale, 1 - 0.25 * bounceScale, 1) }, { easing: "quadOut" }) // 振幅减小
                .to(0.07, { scale: new Vec3(1 - 0.25 * bounceScale, 1 + 0.25 * bounceScale, 1) }, { easing: "quadOut" })
                .to(0.06, { scale: new Vec3(1 + 0.1 * bounceScale, 1 - 0.1 * bounceScale, 1) }, { easing: "quadOut" })
                .to(0.06, { scale: new Vec3(1 - 0.1 * bounceScale, 1 + 0.1 * bounceScale, 1) }, { easing: "quadOut" })
                .to(0.05, { scale: new Vec3(1 + 0.05 * bounceScale, 1 - 0.05 * bounceScale, 1) }, { easing: "quadOut" })
                .to(0.05, { scale: new Vec3(1 - 0.05 * bounceScale, 1 + 0.05 * bounceScale, 1) }, { easing: "quadOut" })
                .to(0.04, { scale: new Vec3(1, 1, 1) }, { easing: "quadOut" })
                .start();
        }
        else {
            if (gridCell) {
                if (!gridCell.hasItem()) {
                    this.moveToGridCell(gridCell);
                } else {
                    const otherItem = gridCell.getItem();
                    if (otherItem) {
                        ItemManager.instance.handleItemOverlap(this.itemBase, otherItem);
                    }
                }
            } else {

                this.node.pauseSystemEvents(true);

                // **回到原位置**       
                tween(this.node)
                    .to(0.3, { position: this.startPos }, { easing: 'quadOut' })
                    .call(() => {
                        this.node.resumeSystemEvents(true);
                    })
                    .start();
            }
        }
    }

    private findGridCellAtPosition(worldPos: Vec3): GridCell | null {
        const gridCells = GridManager.instance.gridCells;
        for (let row = 0; row < gridCells.length; row++) {
            for (let col = 0; col < gridCells[row].length; col++) {
                const cell = gridCells[row][col];
                if (this.isInsideGridCell(cell, worldPos)) {
                    return cell;
                }
            }
        }
        return null;
    }

    private isInsideGridCell(gridCell: GridCell, worldPos: Vec3): boolean {
        const cellPos = gridCell.node.getWorldPosition();
        const cellSize = gridCell.node.getComponent(UITransform)?.contentSize || { width: 100, height: 100 };

        return (
            worldPos.x >= cellPos.x - cellSize.width / 2 &&
            worldPos.x <= cellPos.x + cellSize.width / 2 &&
            worldPos.y >= cellPos.y - cellSize.height / 2 &&
            worldPos.y <= cellPos.y + cellSize.height / 2
        );
    }

    private moveToGridCell(gridCell: GridCell) {
        if (!this.itemBase) return;

        this.itemBase.itemParentGrid?.removeItem();

        this.itemBase.itemParentGrid = gridCell;
        gridCell.setItem(this.itemBase);

        tween(this.node)
            .to(0.3, { position: gridCell.node.position }, { easing: 'quadOut' })
            .start();
    }

}
