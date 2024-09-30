import {
    BATTLE_ASSET_KEYS,
    DATA_ASSET_KEYS,
    MONSTER_ASSET_KEYS,
} from "@/assets/asset-key";
import { HealthBar } from "../ui/health-bar";
import Text from "@/ui/text";

export class BattleMonster {
    protected scene: Phaser.Scene;
    protected monsterDetails: BattleMonsterDetails;
    protected phaserGameObject: Phaser.GameObjects.Image;
    protected healthBar: HealthBar;
    protected currentHealth: number;
    protected maxHealth: number;
    protected monsterAttacks: Attack[];
    protected phaserHealthBarGameContainer: Phaser.GameObjects.Container;

    constructor(
        scene: Phaser.Scene,
        config: BattleMonsterConfig,
        position: Coordinate
    ) {
        this.scene = scene;
        this.monsterDetails = config.monsterDetails;
        this.currentHealth = this.monsterDetails.currentHp;
        this.maxHealth = this.monsterDetails.maxHp;
        this.monsterAttacks = [];

        this.phaserGameObject = this.scene.add.image(
            position.x,
            position.y,
            this.monsterDetails.assetKey,
            this.monsterDetails.assetFrame
        );

        this.createHealthBarComponent(config?.scaleHealthBarBackgroundImageByY);

        const data: Attack[] = this.scene.cache.json.get(
            DATA_ASSET_KEYS.ATTACKS
        );

        this.monsterDetails.attackIds.forEach((attackId) => {
            const monsterAttack = data.find((attack) => attack.id === attackId);
            if (monsterAttack !== undefined) {
                this.monsterAttacks.push(monsterAttack);
            }
        });
    }

    get isFainted(): boolean {
        return this.currentHealth <= 0;
    }

    get name(): string {
        return this.monsterDetails.name;
    }

    get attacks(): Attack[] {
        return [...this.monsterAttacks];
    }

    get baseAttack(): number {
        return this.monsterDetails.baseAttack;
    }

    get level(): number {
        return this.monsterDetails.currentLevel;
    }

    takeDamage(damage: number, callback: () => void) {
        // update current monster health bar and animate health bar
        this.currentHealth -= damage;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        this.healthBar.setMeterPercentageAnimated(
            this.currentHealth / this.maxHealth,
            {
                callback,
            }
        );
    }

    private createHealthBarComponent(
        scaleHealthBarBackgroundImageByY: number = 1
    ) {
        this.healthBar = new HealthBar(this.scene, 34, 34);
        const monsterNameGameText = new Text(this.scene, 30, 20, this.name, {
            color: "#7E3D3F",
            fontSize: "32px",
        });
        const healthBarBgImage = this.scene.add
            .image(0, 0, BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND)
            .setOrigin(0)
            .setScale(1, scaleHealthBarBackgroundImageByY);

        const monsterHealthBarLevelText = new Text(
            this.scene,
            monsterNameGameText.width + 35,
            23,
            `L${this.level}`,
            {
                color: "#ED474B",
                fontSize: "28px",
            }
        );

        const monsterHpText = new Text(this.scene, 30, 55, "HP", {
            color: "#FF6505",
            fontSize: "24px",
            fontStyle: "bold italic",
        });

        this.phaserHealthBarGameContainer = this.scene.add.container(0, 0, [
            healthBarBgImage,
            monsterNameGameText,
            this.healthBar.container,
            monsterHealthBarLevelText,
            monsterHpText,
        ]);
    }
}
