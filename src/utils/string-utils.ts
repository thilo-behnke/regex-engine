import Character from "../model/character";

const explode = (s: string) => {
    return s.split('');
}

const explodeToCharacters = (s: string) => {
    return explode(s).map(it => new Character(it));
}

export {
    explode,
    explodeToCharacters
}
