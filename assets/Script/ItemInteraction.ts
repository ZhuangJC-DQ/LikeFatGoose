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
            console.error("ItemInteraction: ItemBase 组件丢失");
            return;
        }

        // 监听触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        this.startPos.set(this.itemBase.itemParentGrid.node.position);
        this.dragging = true;
    
        // 提高 Z 轴，确保拖拽物品在最上层
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
    
        const touchPos = event.getUILocation(); // 获取当前触摸点
        const worldPos = new Vec3(touchPos.x, touchPos.y, 0);
    
        // **只有当触摸点在格子范围外时，才执行拖拽**
        if (this.isInsideGridCell(this.itemBase.itemParentGrid, worldPos)) {
            return; // 如果仍在当前格子内，直接返回，不执行拖拽
        }
    
        // **转换触摸点为局部坐标**
        const localPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
    
        // **使用 Tween 进行平滑移动**
        tween(this.node)
            .to(0.08, { position: localPos }, { easing: 'quadOut' }) // 0.08 秒的缓动
            .start();
    
        this.launchable = false;
    }

    private onTouchEnd(event: EventTouch) {
        if (!this.dragging || !this.itemBase) return;
        this.dragging = false;
    
        // **可选**：恢复原始层级，避免影响后续操作
        this.node.setSiblingIndex(0);
    
        const worldPos = this.node.getWorldPosition();
        const gridCell = this.findGridCellAtPosition(worldPos);
    
        if(gridCell == this.itemBase.itemParentGrid) {
            if(this.launchable && this.itemBase.getLaunchable()) {
                this.itemBase.launch();
                this.launchable = false;
            }
            
            // **回到原位置**       
            tween(this.node)
                .to(0.3, { position: this.startPos }, { easing: 'quadOut' })
                .start();
            const baseBounce: number = 1.0
            // 🌟 计算最终的初始跳动参数
            const randomFactor = 0.2 + Math.random() * 0.3; // 0.2 ~ 0.5 之间的随机扰动
            const bounceScale = baseBounce * randomFactor; // 结合基础参数 & 随机因子
    
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
                .to(0.04, { scale: new Vec3(1, 1, 1) }, { easing: "quadOut" })  // 归位
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

    /** 查找当前世界坐标下的 GridCell */
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

    /** 判断 worldPos 是否在某个 GridCell 内 */
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

    // 把物品移动到新的 GridCell
    private moveToGridCell(gridCell: GridCell) {
        if (!this.itemBase) return;

        // 释放原格子的物品
        this.itemBase.itemParentGrid?.removeItem();

        // 绑定新格子
        this.itemBase.itemParentGrid = gridCell;
        gridCell.setItem(this.itemBase);

        // **平滑移动到新位置**
        tween(this.node)
            .to(0.3, { position: gridCell.node.position }, { easing: 'quadOut' })
            .start();
    }

}
