import { MONSTER_ASSET_KEYS, UI_ASSET_KEYS } from "@/assets/asset-key";
import { DIRECTION } from "@/common/direction";
import Text from "@/ui/text";
import { exhaustiveGuard } from "@/utils/guard";
import { BATTLE_UI_TEXT_STYLE } from "./battle-menu-config";
import {
    ACTIVE_BATTLE_MENU,
    ATTACK_MOVE_OPTIONS,
    BATTLE_MENU_OPTIONS,
} from "./battle-menu-option";
import { PlayerBattleMonster } from "@/battle/monsters/player-battle-monster";

const BATTLE_MENU_CURSOR_POS = Object.freeze({
    x: 42,
    y: 38,
});

const ATTACK_MENU_CURSOR_POS = Object.freeze({
    x: 42,
    y: 38,
});

export class BattleMenu {
    private scene;
    private mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private moveSelectionSubBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container;
    private battleTextGameObjectLine1: Phaser.GameObjects.Text;
    private battleTextGameObjectLine2: Phaser.GameObjects.Text;
    private mainBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private attackBattleMenuCursorPhaserImageGameObject: Phaser.GameObjects.Image;
    private selectedBattleMenuOption: keyof typeof BATTLE_MENU_OPTIONS;
    private selectedAttackMenuOption: keyof typeof ATTACK_MOVE_OPTIONS;
    private activeBattleMenu: keyof typeof ACTIVE_BATTLE_MENU;

    private queuedInfoPanelMessages: string[] = [];
    private queuedInfoPanelCallback: (() => void) | undefined = undefined;
    private waitingForPlayerInput = false;
    private selectedAttackIndex: number | undefined = undefined;

    private activePlayerMonster: PlayerBattleMonster;

    constructor(scene: Phaser.Scene, activePlayerMonster: PlayerBattleMonster) {
        this.scene = scene;
        this.activePlayerMonster = activePlayerMonster;
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;

        //render out the main info and sub info panes
        this.createMainInfoPane();
        this.createMainBattleMenu();
        this.createMonsterAttackSubMenu();
    }

    get selectedAttack() {
        if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return this.selectedAttackIndex;
        }
        return undefined;
    }

    // ------------------ public methods ------------------

    public showMainBattleMenu() {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN;
        this.battleTextGameObjectLine1.setText("what should");
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(1);
        this.battleTextGameObjectLine1.setAlpha(1);
        this.battleTextGameObjectLine2.setAlpha(1);

        this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
        this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
            BATTLE_MENU_CURSOR_POS.x,
            BATTLE_MENU_CURSOR_POS.y
        );
        this.selectedAttackIndex = undefined;
    }

    public hideMainBattleMenu() {
        this.mainBattleMenuPhaserContainerGameObject.setAlpha(0);
        this.battleTextGameObjectLine1.setAlpha(0);
        this.battleTextGameObjectLine2.setAlpha(0);
    }

    public showMonsterAttackSubMenu() {
        this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT;
        this.moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(1);
        this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
            ATTACK_MENU_CURSOR_POS.x,
            ATTACK_MENU_CURSOR_POS.y
        );
    }

    public hideMonsterAttackSubMenu() {
        this.moveSelectionSubBattleMenuPhaserContainerGameObject.setAlpha(0);
    }

    public handlePlayerInput(input: "OK" | "CANCEL" | keyof typeof DIRECTION) {
        if (
            this.waitingForPlayerInput &&
            (input === "CANCEL" || input === "OK")
        ) {
            this.updateInfoPaneWithMessage();
            return;
        }

        if (input === "CANCEL") {
            this.switchToMainBattleMenu();
            return;
        }
        if (input === "OK") {
            if (this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
                this.handlePlayerChooseMainBattleOption();
                return;
            }

            if (
                this.activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
            ) {
                this.handlePlayerChooseAttack();
                return;
            }

            return;
        }

        this.updateSelectedBattleMenuOptionFromInput(input);
        this.moveMainBattleMenuCursor();
        this.updateSelectedMoveMenuOptionFromInput(input);
        this.moveMoveBattleMenuCursor();
    }

    public updateInfoPaneMessagesAndWaitForInput(
        messages: string[],
        callback: () => void
    ) {
        this.queuedInfoPanelMessages = messages;
        this.queuedInfoPanelCallback = callback;

        this.updateInfoPaneWithMessage();
    }

    // ------------------ private methods ------------------

    private updateInfoPaneWithMessage() {
        this.waitingForPlayerInput = false;
        this.battleTextGameObjectLine1.setText("").setAlpha(1);

        //check if all messages have been displayed from the queue and call the callback
        if (this.queuedInfoPanelMessages.length === 0) {
            if (this.queuedInfoPanelCallback) {
                this.queuedInfoPanelCallback();
                this.queuedInfoPanelCallback = undefined;
            }

            return;
        }

        //get first message from the queue and animate message
        const messageToDisplay = this.queuedInfoPanelMessages.shift();
        if (messageToDisplay) {
            this.battleTextGameObjectLine1.setText(messageToDisplay);
        }
        this.waitingForPlayerInput = true;
    }

    private createMainInfoPane() {
        const padding = 4;
        const rectHeight = 132;
        this.scene.add
            .rectangle(
                padding,
                this.scene.scale.height - (rectHeight - padding * 2) - padding,
                this.scene.scale.width - padding * 2,
                rectHeight - padding * 2,
                0xede4f3,
                1
            )

            .setOrigin(0)
            .setStrokeStyle(padding * 2, 0xe4434a, 1);
    }

    private createMainInfoSubPane() {
        const rectWidth = 500;
        const rectHeight = 124;
        return this.scene.add
            .rectangle(0, 0, rectWidth, rectHeight, 0xede4f3, 1)

            .setOrigin(0)
            .setStrokeStyle(8, 0x905ac2, 1);
    }

    private createMainBattleMenu() {
        this.battleTextGameObjectLine1 = new Text(
            this.scene,
            20,
            468,
            "what should",
            BATTLE_UI_TEXT_STYLE
        );

        this.scene.add.existing(this.battleTextGameObjectLine1);

        this.battleTextGameObjectLine2 = new Text(
            this.scene,
            20,
            512,
            `${this.activePlayerMonster.name} do next?`,
            BATTLE_UI_TEXT_STYLE
        );

        this.scene.add.existing(this.battleTextGameObjectLine2);

        this.mainBattleMenuCursorPhaserImageGameObject = this.scene.add
            .image(
                BATTLE_MENU_CURSOR_POS.x,
                BATTLE_MENU_CURSOR_POS.y,
                UI_ASSET_KEYS.CURSOR,
                0
            )
            .setOrigin(0.5)
            .setScale(2.5);

        this.mainBattleMenuPhaserContainerGameObject = this.scene.add.container(
            520,
            448,
            [
                this.createMainInfoSubPane(),
                new Text(
                    this.scene,
                    55,
                    22,
                    BATTLE_MENU_OPTIONS.FIGHT,
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    240,
                    22,
                    BATTLE_MENU_OPTIONS.SWITCH,
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    55,
                    70,
                    BATTLE_MENU_OPTIONS.ITEM,
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    240,
                    70,
                    BATTLE_MENU_OPTIONS.FLEE,
                    BATTLE_UI_TEXT_STYLE
                ),
                this.mainBattleMenuCursorPhaserImageGameObject,
            ]
        );

        this.hideMainBattleMenu();
    }

    private createMonsterAttackSubMenu() {
        this.attackBattleMenuCursorPhaserImageGameObject = this.scene.add
            .image(
                ATTACK_MENU_CURSOR_POS.x,
                ATTACK_MENU_CURSOR_POS.y,
                UI_ASSET_KEYS.CURSOR,
                0
            )
            .setOrigin(0.5)
            .setScale(2.5);

        const attackNames: string[] = [];
        for (let i = 0; i < 4; i++) {
            attackNames.push(this.activePlayerMonster.attacks[i]?.name || "-");
        }

        this.moveSelectionSubBattleMenuPhaserContainerGameObject =
            this.scene.add.container(0, 448, [
                new Text(
                    this.scene,
                    55,
                    22,
                    attackNames[0],
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    240,
                    22,
                    attackNames[1],
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    55,
                    70,
                    attackNames[2],
                    BATTLE_UI_TEXT_STYLE
                ),
                new Text(
                    this.scene,
                    240,
                    70,
                    attackNames[3],
                    BATTLE_UI_TEXT_STYLE
                ),
                this.attackBattleMenuCursorPhaserImageGameObject,
            ]);
        this.hideMonsterAttackSubMenu();
    }

    private updateSelectedBattleMenuOptionFromInput(
        direction: keyof typeof DIRECTION
    ) {
        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case DIRECTION.DOWN:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case DIRECTION.DOWN:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case DIRECTION.UP:
                case DIRECTION.RIGHT:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FLEE;
                    return;
                case DIRECTION.UP:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.ITEM;
                    return;
                case DIRECTION.UP:
                    this.selectedBattleMenuOption = BATTLE_MENU_OPTIONS.SWITCH;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }

        exhaustiveGuard(this.selectedBattleMenuOption);
    }

    private moveMainBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
            return;
        }
        switch (this.selectedBattleMenuOption) {
            case BATTLE_MENU_OPTIONS.FIGHT:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    BATTLE_MENU_CURSOR_POS.x,
                    BATTLE_MENU_CURSOR_POS.y
                );
                return;
            case BATTLE_MENU_OPTIONS.SWITCH:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    BATTLE_MENU_CURSOR_POS.y
                );
                return;
            case BATTLE_MENU_OPTIONS.ITEM:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    BATTLE_MENU_CURSOR_POS.x,
                    86
                );
                return;
            case BATTLE_MENU_OPTIONS.FLEE:
                this.mainBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    86
                );
                return;
            default:
                exhaustiveGuard(this.selectedBattleMenuOption);
        }
    }

    private updateSelectedMoveMenuOptionFromInput(
        direction: keyof typeof DIRECTION
    ) {
        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case DIRECTION.DOWN:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.UP:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case DIRECTION.DOWN:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case DIRECTION.UP:
                case DIRECTION.RIGHT:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
            switch (direction) {
                case DIRECTION.RIGHT:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4;
                    return;
                case DIRECTION.UP:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1;
                    return;
                case DIRECTION.LEFT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }
        if (this.selectedAttackMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
            switch (direction) {
                case DIRECTION.LEFT:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3;
                    return;
                case DIRECTION.UP:
                    this.selectedAttackMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2;
                    return;
                case DIRECTION.RIGHT:
                case DIRECTION.DOWN:
                case DIRECTION.NONE:
                    return;
                default:
                    exhaustiveGuard(direction);
            }
        }

        exhaustiveGuard(this.selectedAttackMenuOption);
    }
    private moveMoveBattleMenuCursor() {
        if (this.activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT) {
            return;
        }
        switch (this.selectedAttackMenuOption) {
            case ATTACK_MOVE_OPTIONS.MOVE_1:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    ATTACK_MENU_CURSOR_POS.x,
                    ATTACK_MENU_CURSOR_POS.y
                );
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_2:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    BATTLE_MENU_CURSOR_POS.y
                );
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_3:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    BATTLE_MENU_CURSOR_POS.x,
                    86
                );
                return;
            case ATTACK_MOVE_OPTIONS.MOVE_4:
                this.attackBattleMenuCursorPhaserImageGameObject.setPosition(
                    228,
                    86
                );
                return;
        }
    }

    private switchToMainBattleMenu() {
        this.hideMonsterAttackSubMenu();
        this.showMainBattleMenu();
    }

    private handlePlayerChooseMainBattleOption() {
        this.hideMainBattleMenu();

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT) {
            this.showMonsterAttackSubMenu();
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.SWITCH) {
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_SWITCH;
            this.updateInfoPaneMessagesAndWaitForInput(
                ["You have no other monsters in your party..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.ITEM) {
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_ITEM;
            this.updateInfoPaneMessagesAndWaitForInput(
                ["Your bag is empty..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        if (this.selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FLEE) {
            this.activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_FLEE;
            this.updateInfoPaneMessagesAndWaitForInput(
                ["You fail to run away..."],
                () => {
                    this.switchToMainBattleMenu();
                }
            );
            return;
        }

        exhaustiveGuard(this.selectedBattleMenuOption);
    }

    private handlePlayerChooseAttack() {
        let selectedMoveIndex = 0;
        switch (this.selectedAttackMenuOption) {
            case ATTACK_MOVE_OPTIONS.MOVE_1:
                selectedMoveIndex = 0;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_2:
                selectedMoveIndex = 1;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_3:
                selectedMoveIndex = 2;
                break;
            case ATTACK_MOVE_OPTIONS.MOVE_4:
                selectedMoveIndex = 3;
                break;
            default:
                exhaustiveGuard(this.selectedAttackMenuOption);
        }

        this.selectedAttackIndex = selectedMoveIndex;
    }
}
