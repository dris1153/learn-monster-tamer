import Phaser from "phaser";

export default class Text extends Phaser.GameObjects.Text {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, x, y, text, {
            fontStyle: "bold",
            ...(style || {}),
        });
    }
}
