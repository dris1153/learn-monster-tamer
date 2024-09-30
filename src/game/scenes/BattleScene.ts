// You can write more code here

/* START OF COMPILED CODE */

import { BATTLE_ASSET_KEYS, MONSTER_ASSET_KEYS } from "@/assets/asset-key";
import Phaser from "phaser";
import { SCENE_KEYS } from "../scene-keys";
import Text from "@/ui/text";
import { BattleMenu } from "@/battle/ui/menu/battle-menu";
import { DIRECTION } from "@/common/direction";
import { Background } from "@/battle/background";
import { HealthBar } from "@/battle/ui/health-bar";
import { BattleMonster } from "@/battle/monsters/battle-monster";
import { EnemyBattleMonster } from "@/battle/monsters/enemy-battle-monster";
import { PlayerBattleMonster } from "@/battle/monsters/player-battle-monster";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BattleScene extends Phaser.Scene {
    private battleMenu: BattleMenu;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerMonster: PlayerBattleMonster;

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE,
        });

        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }

    /* START-USER-CODE */

    // Write your code here

    create() {
        const background = new Background(this);
        background.showForest();

        //render out the player and enemy monsters
        // this.add.image(768, 144, MONSTER_ASSET_KEYS.CARNODUSK, 0);
        this.add
            .image(256, 316, MONSTER_ASSET_KEYS.IGUANIGNITE, 0)
            .setFlipX(true);

        this.activeEnemyMonster = new EnemyBattleMonster(this, {
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                maxHp: 25,
                currentHp: 25,
                attackIds: [1],
                baseAttack: 5,
                currentLevel: 5,
            },
        });

        this.activePlayerMonster = new PlayerBattleMonster(this, {
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                maxHp: 25,
                currentHp: 25,
                attackIds: [2],
                baseAttack: 5,
                currentLevel: 5,
            },
        });

        this.battleMenu = new BattleMenu(this, this.activePlayerMonster);
        this.battleMenu.showMainBattleMenu();

        if (this.input.keyboard) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }
    }

    update(time: number, delta: number): void {
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
            this.cursorKeys.space
        );
        if (wasSpaceKeyPressed) {
            this.battleMenu.handlePlayerInput("OK");

            //check if the player selected an attack, and update display text
            if (this.battleMenu.selectedAttack === undefined) {
                return;
            }

            this.battleMenu.hideMonsterAttackSubMenu();
            // this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            //     ["Your monster attacks the enemy"],
            //     () => {
            //         this.battleMenu.showMainBattleMenu();
            //     }
            // );
            this.handleBattleSequence();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursorKeys.shift)) {
            this.battleMenu.handlePlayerInput("CANCEL");
            return;
        }

        let selectedDirection: keyof typeof DIRECTION = DIRECTION.NONE;

        if (this.cursorKeys.left.isDown) {
            selectedDirection = DIRECTION.LEFT;
        } else if (this.cursorKeys.right.isDown) {
            selectedDirection = DIRECTION.RIGHT;
        } else if (this.cursorKeys.up.isDown) {
            selectedDirection = DIRECTION.UP;
        } else if (this.cursorKeys.down.isDown) {
            selectedDirection = DIRECTION.DOWN;
        }

        if (selectedDirection !== DIRECTION.NONE) {
            this.battleMenu.handlePlayerInput(selectedDirection);
        }
    }

    private handleBattleSequence() {}

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here

