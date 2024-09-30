// You can write more code here

/* START OF COMPILED CODE */

import { MONSTER_ASSET_KEYS } from "@/assets/asset-key";
import Phaser from "phaser";
import { SCENE_KEYS } from "../scene-keys";
import { BattleMenu } from "@/battle/ui/menu/battle-menu";
import { DIRECTION } from "@/common/direction";
import { Background } from "@/battle/background";

import { EnemyBattleMonster } from "@/battle/monsters/enemy-battle-monster";
import { PlayerBattleMonster } from "@/battle/monsters/player-battle-monster";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BattleScene extends Phaser.Scene {
    private battleMenu: BattleMenu;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    private activeEnemyMonster: EnemyBattleMonster;
    private activePlayerMonster: PlayerBattleMonster;

    private activePlayerAttackIndex: number;

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

    init() {
        this.activePlayerAttackIndex = -1;
    }

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

            this.activePlayerAttackIndex = this.battleMenu.selectedAttack;

            if (
                !this.activePlayerMonster.attacks[this.activePlayerAttackIndex]
            ) {
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

    private handleBattleSequence() {
        // general battle flow
        // show attack used, brief pause
        // then play attack animation, brief pause
        // then play damage animation, brief pause
        // then play health bar animation, brief pause
        // then repeat the steps above for the other monster

        // handle it

        this.playAttack();
    }

    private playAttack() {
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [
                `${this.activePlayerMonster.name} used ${this.activePlayerMonster.attacks[0].name}`,
            ],
            () => {
                this.time.delayedCall(500, () => {
                    console.log("take it");
                    this.activeEnemyMonster.takeDamage(20, () => {
                        this.enemyAttack();
                    });
                });
            }
        );
    }

    private enemyAttack() {
        this.battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [
                `${this.activeEnemyMonster.name} used ${this.activeEnemyMonster.attacks[0].name}`,
            ],
            () => {
                this.time.delayedCall(500, () => {
                    this.activePlayerMonster.takeDamage(20, () => {
                        this.battleMenu.showMainBattleMenu();
                    });
                });
            }
        );
    }

    /* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
