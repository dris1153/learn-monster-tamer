import Text from "@/ui/text";
import { BattleMonster } from "./battle-monster";

const PLAYER_POSITION: Coordinate = Object.freeze({ x: 256, y: 316 });

export class PlayerBattleMonster extends BattleMonster {
    private healthBarTextGameObject: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, config: BattleMonsterConfig) {
        super(scene, config, PLAYER_POSITION);
        this.phaserGameObject.setFlipX(true);
        this.phaserHealthBarGameContainer.setPosition(556, 318);

        this.addHealthBarComponents();
    }

    private setHealthBarText() {
        this.healthBarTextGameObject.setText(
            `${this.currentHealth}/${this.maxHealth}`
        );
    }

    private addHealthBarComponents() {
        this.healthBarTextGameObject = new Text(this.scene, 443, 80, "", {
            color: "#7E3D3F",
            fontSize: "16px",
        }).setOrigin(1, 0);
        this.setHealthBarText();
        this.phaserHealthBarGameContainer.add(this.healthBarTextGameObject);
    }

    takeDamage(damage: number, callback: () => void): void {
        super.takeDamage(damage, callback);
        this.setHealthBarText();
    }
}
