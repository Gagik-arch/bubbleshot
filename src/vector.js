import CMath from "./math";
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector = new Vector(0, 0)) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    normalize(vector = new Vector(0, 0)) {
        const magnitute = this.magnitude(vector);
        return new Vector(this.x / magnitute, this.y / magnitute);
    }

    magnitude(vector = new Vector(0, 0)) {
        let dx = vector.x - this.x;
        let dy = vector.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    direction(vector) {
        const result =
            (Math.atan2(vector.y - this.y, vector.x - this.x) * 180) / Math.PI;

        return result > 0 ? result : 360 + result;
    }

    getInvertedVector(vector) {
        const zeroChanged = vector.subtract(this);
        return this.add(new Vector(-zeroChanged.x, -zeroChanged.y));
    }

    getVectorWithRadius(radius, angle) {
        angle = CMath.degreeToRadian(-angle);

        return new Vector(
            this.x + radius * Math.cos(angle),
            this.y + -radius * Math.sin(angle)
        );
    }
}

export default Vector;
