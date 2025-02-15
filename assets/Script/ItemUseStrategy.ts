import { ItemBase } from './ItemBase'; // Adjust the path as necessary

export interface ItemUseStrategy {
    use(item: ItemBase): Promise<boolean>;
}