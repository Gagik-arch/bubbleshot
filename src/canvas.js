import {
    genRandomNumber,
    getVectorWithRadius,
    calcVelosity,
    cssVars,
} from "./utils";
import Element from "./element";
import Vector from "./vector";
import { restitution, Colors } from "./constants";

class Canvas {
    ctx;
    elements = [];
    canvas;
    mouse = null;
    selectedElement = null;
    oldTimeStamp;
    maxDrawLength = 500;

    constructor(width = window.innerWidth, height = window.innerHeight) {
        const root = document.getElementById("app");
        const canvas = document.createElement("canvas");
        root.appendChild(canvas);

        this.canvas = canvas;
        this.resize(width, height);

        this.ctx = canvas.getContext("2d");

        this.maxDrawLength = (this.canvas.width + this.canvas.height) / 4;

        for (let i = 0; i < 15; i++) {
            this.generateElement(i);
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    generateElement(i) {
        const radius = genRandomNumber(30, 90);

        let x = genRandomNumber(radius, this.canvas.width - radius);
        let y = genRandomNumber(radius, this.ctx.canvas.height - radius);
        const vector = new Vector(x, y);

        let elementIsAvailable = this.elements.find((element) => {
            return (
                element.position.magnitude(vector) <=
                element.radius + radius + 1
            );
        });

        if (elementIsAvailable) {
            return this.generateElement(i);
        } else {
            return this.elements.push(new Element(vector, radius));
        }
    }

    draw(timeStamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;

        this.detectElementsCollision();

        this.elements.forEach((element) => {
            this.drawCircle(
                element.position,
                element.radius,
                element.color,
                Colors.blueBorder
            );
        });
        this.drawTrajectoryAndPower();

        this.elements.forEach((element) => element.update(secondsPassed));

        this.oldTimeStamp = timeStamp;
    }

    drawTrajectoryAndPower() {
        if (this.selectedElement != null && this.mouse != null) {
            const direction = this.selectedElement.position.magnitude(
                this.mouse
            );
            if (direction < this.selectedElement.radius) {
                return;
            }
            const powerAangle = this.selectedElement.position.direction(
                this.mouse
            );
            const powerStartVector =
                this.selectedElement.position.getVectorWithRadius(
                    this.selectedElement.radius,
                    powerAangle
                );
            const magnitute = this.selectedElement.position.magnitude(
                this.mouse
            );
            const angle = this.selectedElement.position.direction(this.mouse);
            const length =
                magnitute <= this.maxDrawLength
                    ? magnitute
                    : this.maxDrawLength;
            const to = getVectorWithRadius(
                this.selectedElement.position,
                length,
                angle
            );

            this.drawLine(powerStartVector, to, false);

            const trajectoryHeight = powerStartVector.magnitude(to);

            this.drawTrajectory(trajectoryHeight);
        }
    }

    detectEdgeVector(position, start, trajectoryHeight) {
        const filterefElements = this.elements.filter(
            (element) => element.id !== this.selectedElement.id
        );
        let distance = 1;
        let to = position.multiply(distance).add(start);

        let element = null;

        while (
            distance <= trajectoryHeight &&
            !element &&
            to.y >= this.selectedElement.radius &&
            to.y <= this.canvas.height - this.selectedElement.radius &&
            to.x >= this.selectedElement.radius &&
            to.x <= this.canvas.width - this.selectedElement.radius
        ) {
            to = position.multiply(distance).add(start);
            element = filterefElements.find((element) => {
                const d = to.magnitude(element.position);
                return d <= this.selectedElement.radius + element.radius;
            });
            distance++;
        }

        if (
            to.y <= this.selectedElement.radius ||
            to.y >= this.canvas.height - this.selectedElement.radius
        ) {
            return new Vector(
                to.x,
                to.y <= this.selectedElement.radius ? Math.ceil(to.y) : to.y
            );
        } else if (
            Math.ceil(to.x) >= this.selectedElement.radius ||
            to.x <= this.canvas.width - this.selectedElement.radiuss
        ) {
            return new Vector(
                to.x <= this.selectedElement.radius ? Math.ceil(to.x) : to.x,
                to.y
            );
        }
    }

    drawTrajectory(
        trajectoryHeight,
        from = this.selectedElement.position,
        direction
    ) {
        const _direction = direction
            ? this.changeEdgeTrajectoryDirection(from, direction)
            : from.subtract(this.mouse).normalize();
        let to = this.detectEdgeVector(_direction, from, trajectoryHeight);

        if (!to) return;

        this.drawLine(from, to, true, Colors.red);
        const height = from.magnitude(to);
        this.drawCircle(
            to,
            this.selectedElement.radius,
            "transparent",
            Colors.red,
            true
        );

        const interactedElement = this.elements
            .filter((element) => element.id !== this.selectedElement.id)
            .find(
                (element) =>
                    to.magnitude(element.position) <=
                    this.selectedElement.radius + element.radius
            );

        this.elements.forEach((element) =>
            element.changeColor(Colors.blueBackground)
        );

        if (
            to.y === this.selectedElement.radius ||
            Math.floor(to.y) ===
                this.canvas.height - this.selectedElement.radius ||
            Math.floor(to.x) === this.selectedElement.radius ||
            Math.floor(to.x) === this.canvas.width - this.selectedElement.radius
        ) {
            return this.drawTrajectory(
                trajectoryHeight - height,
                to,
                _direction
            );
        } else if (interactedElement) {
            if (interactedElement) {
                interactedElement.changeColor(Colors.blueBorder);
            }
            const newElement = new Element(to, this.selectedElement.radius);

            newElement.velocity = calcVelosity(
                to,
                new Element(from, this.selectedElement.radius),
                height
            );
            const velocities = newElement.calculateVelocity(interactedElement);
            if (!velocities) return;

            this.drawLine(
                newElement.position,
                newElement.position.add(velocities[0]),
                true,
                Colors.red
            );
            this.drawLine(
                interactedElement.position,
                interactedElement.position.add(velocities[1]),
                true,
                Colors.red
            );
        } else {
            return this.drawLine(from, to, true);
        }
    }

    changeEdgeTrajectoryDirection(vector, direction) {
        let newDirection = new Vector(direction.x, direction.y);

        if (vector.x === this.selectedElement.radius) {
            newDirection.x = Math.abs(direction.x);
        } else if (
            vector.x >=
            this.canvas.width - this.selectedElement.radius
        ) {
            newDirection.x = -Math.abs(direction.x);
        } else if (vector.y === this.selectedElement.radius) {
            newDirection.y = Math.abs(direction.y);
        } else if (
            vector.y >=
            this.canvas.height - this.selectedElement.radius
        ) {
            newDirection.y = -Math.abs(direction.y);
        }
        return newDirection;
    }

    detectElementsCollision() {
        let el1;
        let el2;

        for (let i = 0; i < this.elements.length; i++) {
            el1 = this.elements[i];
            if (el1.position.x - el1.radius <= 0) {
                el1.velocity.x = Math.abs(el1.velocity.x) * restitution;
            } else if (el1.position.x + el1.radius > this.canvas.width) {
                el1.velocity.x = -Math.abs(el1.velocity.x) * restitution;
            }
            if (el1.position.y - el1.radius <= 0) {
                el1.velocity.y = Math.abs(el1.velocity.y) * restitution;
            } else if (el1.position.y + el1.radius >= this.canvas.height) {
                el1.velocity.y = -Math.abs(el1.velocity.y) * restitution;
            }

            for (let j = i + 1; j < this.elements.length; j++) {
                el2 = this.elements[j];
                const magnitude = el1.position.magnitude(el2.position);

                if (magnitude <= el1.radius + el2.radius) {
                    el1.move(el2);
                }
            }
        }
    }

    getMousePos(e) {
        const pos = this.canvas.getBoundingClientRect();
        const x = e.clientX - pos.left;
        const y = e.clientY - pos.top;
        return new Vector(x, y);
    }

    findElement(vector) {
        return this.elements.find(
            (element) =>
                element.position.magnitude(vector) <= element.radius + 1
        );
    }

    strike(element) {
        const rubberLength = element.position.magnitude(this.mouse);

        if (rubberLength < element.radius) {
            return;
        }

        const invertedPos = element.position.getInvertedVector(this.mouse);

        const velosity = calcVelosity(invertedPos, element, rubberLength);

        element.velocity.x = velosity.x;
        element.velocity.y = velosity.y;
    }

    onMouseDown(e) {
        const position = this.getMousePos(e);
        const element = this.findElement(position);

        if (element) {
            this.selectedElement = element;
        }
    }

    onMouseMove(e) {
        if (this.selectedElement !== null) {
            this.mouse = this.getMousePos(e);
        }
    }

    onMouseUp() {
        if (this.selectedElement) {
            const element = { ...this.selectedElement };
            if (this.mouse) {
                this.strike(element);
            }
        }
        this.selectedElement = null;

        this.mouse = null;
        this.elements.forEach((element) =>
            element.changeColor(Colors.blueBackground)
        );
    }

    drawCircle(vector, radius, backgroundColor, borderColor, dashed = false) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = backgroundColor;
        this.ctx.arc(vector.x, vector.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = borderColor;
        if (dashed) {
            this.ctx.setLineDash([10, 5]);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    drawLine(from, to, dashed = false, color = Colors.black, arrow = false) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;

        if (dashed) {
            this.ctx.strokeStyle = Colors.red;
            this.ctx.setLineDash([10, 5]);
        }

        this.ctx.lineWidth = 1;
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
        if (arrow) {
            const headlen = 10;
            const angle = Math.atan2(to.y - from.y, to.x - from.x);

            this.ctx.lineTo(
                to.x - headlen * Math.cos(angle + Math.PI / 7),
                to.y - headlen * Math.sin(angle + Math.PI / 7)
            );

            this.ctx.lineTo(to.x, to.y);
            this.ctx.lineTo(
                to.x - headlen * Math.cos(angle - Math.PI / 7),
                to.y - headlen * Math.sin(angle - Math.PI / 7)
            );
            this.ctx.stroke();
        }

        this.ctx.closePath();
        this.ctx.restore();
    }
}

export default Canvas;
