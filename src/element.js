import { genRandomNumber } from "./utils";
import Vector from "./vector";
import { restitution } from "./constants";
import { Colors } from "./constants";

class Element {
    velocity = new Vector(0, 0);

    constructor(vector, radius) {
        this.color = Colors.blueBackground;
        this.position = vector;
        this.radius = radius;
        this.id = genRandomNumber(1_000_000_000, radius * 9_999_999_999);
        this.mass = 4 * Math.PI * this.radius ** 2;
    }

    collisionNorm(element) {
        const collisionVector = element.position.subtract(this.position);
        const magnitute = this.position.magnitude(element.position);

        return new Vector(
            collisionVector.x / magnitute,
            collisionVector.y / magnitute
        );
    }

    move(element) {
        const velocities = this.calculateVelocity(element);
        if (!velocities) return;

        this.velocity = velocities[0];
        element.velocity = velocities[1];
    }

    calculateVelocity(element) {
        const norm = this.collisionNorm(element);

        let relativeVelocity = this.velocity.subtract(element.velocity);
        const speed = relativeVelocity.dotProduct(norm);
        if (speed < 0) {
            return;
        }
        let impulse = (2 * speed) / (this.mass + element.mass);
        const element1 = new Vector(
            this.velocity.x - impulse * element.mass * norm.x * restitution,
            this.velocity.y - impulse * element.mass * norm.y * restitution
        );
        const element2 = new Vector(
            element.velocity.x + impulse * this.mass * norm.x * restitution,
            element.velocity.y + impulse * this.mass * norm.y * restitution
        );

        return [element1, element2];
    }

    update(secondsPassed) {
        this.position.x += this.velocity.x * secondsPassed || 0;
        this.position.y += this.velocity.y * secondsPassed || 0;
    }

    changeColor(color) {
        this.color = color;
    }
}

export default Element;
