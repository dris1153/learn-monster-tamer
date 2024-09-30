import Boot from "./Boot";
import { AUTO, Game } from "phaser";
import PreloaderScene from "./scenes/PreloaderScene";
import BattleScene from "./scenes/BattleScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    pixelArt: false,
    backgroundColor: "#000000",
    autoMobilePipeline: true,
    autoFocus: true,
    // fullscreenTarget: "game-container",
    scale: {
        width: 1024,
        height: 576,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, PreloaderScene, BattleScene],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false,
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

