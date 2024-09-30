type BattleMonsterConfig = {
    monsterDetails: BattleMonsterDetails;
    scaleHealthBarBackgroundImageByY?: number;
};

type BattleMonsterDetails = {
    name: string;
    assetKey: string;
    assetFrame: number;
    currentLevel: number;
    maxHp: number;
    currentHp: number;
    baseAttack: number;
    attackIds: number[];
};

type Coordinate = {
    x: number;
    y: number;
};

type Attack = {
    id: number;
    name: string;
    animationName: string;
};
