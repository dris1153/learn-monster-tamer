import { BATTLE_BACKGROUND_ASSET_KEYS } from "@/assets/asset-key";

export class Background {
    private scene: Phaser.Scene;
    private backgroundGameObject: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.backgroundGameObject = this.scene.add
            .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
            .setOrigin(0)
            .setAlpha(0);
    }

    showForest() {
        this.backgroundGameObject
            .setTexture(BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
            .setAlpha(1);
    }
}
