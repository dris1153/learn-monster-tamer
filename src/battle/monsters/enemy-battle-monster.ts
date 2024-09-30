import { BattleMonster } from "./battle-monster";

const ENEMY_POSITION: Coordinate = Object.freeze({ x: 768, y: 144 });

export class EnemyBattleMonster extends BattleMonster {
    constructor(scene: Phaser.Scene, config: BattleMonsterConfig) {
        super(
            scene,
            { ...config, scaleHealthBarBackgroundImageByY: 0.8 },
            ENEMY_POSITION
        );
    }
}
