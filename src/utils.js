import CMath from "./math";
import Vector from "./vector";

export const genRandomNumber = (min = 0, max = 10) => {
    if (min > max) throw new Error("max num must be greater than min");

    return min + Math.floor(Math.random() * (max - min));
};

export const getVectorWithRadius = (centerVector, radius, angle) => {
    angle = CMath.degreeToRadian(-angle);

    return new Vector(
        centerVector.x + radius * Math.cos(angle),
        centerVector.y + -radius * Math.sin(angle)
    );
};

export const generateColor = () => {
    const r = genRandomNumber(50, 230);
    const b = genRandomNumber(50, 230);
    const g = genRandomNumber(50, 230);
    return `rgba(${r},${g},${b},1)`;
};

export const calcVelosity = (directionVector, element, rubberLength) => {
    const N = 600;

    const speed = Math.sqrt((2 * N * rubberLength) / element.mass);

    return new Vector(
        (directionVector.x - element.position.x) * speed,
        (directionVector.y - element.position.y) * speed
    );
};

export const cssVars = (name) => {
    return getComputedStyle(document.body).getPropertyValue("--" + name);
};
