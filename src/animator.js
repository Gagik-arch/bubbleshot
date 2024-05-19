class Animator {
    static count = 0;

    static request = (fn) => {
        return typeof requestAnimationFrame !== typeof undefined
            ? requestAnimationFrame(fn)
            : setTimeout(fn);
    };

    static timeouts = {
        default: 400,
        slow: 700,
        fast: 150,
    };

    static animate(
        callback,
        timeout = Animator.timeouts.default,
        {
            from = 0,
            to = 1,
            multiplier = 1,
            easing = Animator.easing.easeOutExpo,
        } = {}
    ) {
        this.count++;
        let passed = 0;
        let date = Date.now();
        const fn = () => {
            passed += Date.now() - date;
            const done = passed >= timeout;
            const factor = passed / timeout;
            const state = easing((factor > 1 ? 1 : factor) * multiplier);
            callback?.(from + (to - from) * state, done);
            date = Date.now();
            done && this.count--;
            !done && Animator.request(fn);
        };
        fn();
    }

    static dimensions = (
        from = [0, 0],
        to = [0, 0],
        callback,
        { timeout, multiplier = 1 } = {}
    ) => {
        Animator.animate(
            (state, done) => {
                const stateArray = [];
                for (let i = 0; i < from.length; i++) {
                    const fromNum = from[i];
                    const toNum = to[i];
                    const step = fromNum + (toNum - fromNum) * state;
                    stateArray.push(step);
                }
                callback?.(stateArray, done);
            },
            timeout,
            { multiplier }
        );
    };

    static easing = {
        linear: (x) => x,

        easeInSine: (x) => -Math.cos(x * (Math.PI / 2)) + 1,
        easeInQuad: (x) => Math.pow(x, 2),
        easeInCubic: (x) => Math.pow(x, 3),
        easeInQuart: (x) => Math.pow(x, 4),
        easeInQuint: (x) => Math.pow(x, 5),
        easeInExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * (x - 1))),
        easeInCirc: (x) => -(Math.sqrt(1 - x * x) - 1),
        easeInBack: (x) => x * x * ((1.70158 + 1) * x - 1.70158),

        easeOutSine: (x) => Math.sin(x * (Math.PI / 2)),
        easeOutQuad: (x) => -(Math.pow(x - 1, 2) - 1),
        easeOutCubic: (x) => Math.pow(x - 1, 3) + 1,
        easeOutQuart: (x) => -(Math.pow(x - 1, 4) - 1),
        easeOutQuint: (x) => Math.pow(x - 1, 5) + 1,
        easeOutExpo: (x) => (x === 1 ? 1 : -Math.pow(2, -10 * x) + 1),
        easeOutCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
        easeOutBack: (x) => (x = x - 1) * x * ((1.70158 + 1) * x + 1.70158) + 1,

        easeInOutSine: (x) => -0.5 * (Math.cos(Math.PI * x) - 1),
        easeInOutQuad: (x) =>
            (x /= 0.5) < 1 ? 0.5 * Math.pow(x, 2) : -0.5 * ((x -= 2) * x - 2),
        easeInOutCubic: (x) =>
            (x /= 0.5) < 1
                ? 0.5 * Math.pow(x, 3)
                : 0.5 * (Math.pow(x - 2, 3) + 2),
        easeInOutQuart: (x) =>
            (x /= 0.5) < 1
                ? 0.5 * Math.pow(x, 4)
                : -0.5 * ((x -= 2) * Math.pow(x, 3) - 2),
        easeInOutQuint: (x) =>
            (x /= 0.5) < 1
                ? 0.5 * Math.pow(x, 5)
                : 0.5 * (Math.pow(x - 2, 5) + 2),
        easeInOutExpo: (x) => {
            if (x === 0 || x === 1) return x;
            if ((x /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (x - 1));
            return 0.5 * (-Math.pow(2, -10 * --x) + 2);
        },
        easeInOutCirc: (x) =>
            (x /= 0.5) < 1
                ? -0.5 * (Math.sqrt(1 - x * x) - 1)
                : 0.5 * (Math.sqrt(1 - (x -= 2) * x) + 1),
        easeInOutBack: (x) => {
            let s = 1.70158;
            if ((x /= 0.5) < 1)
                return 0.5 * (x * x * (((s *= 1.525) + 1) * x - s));
            return 0.5 * ((x -= 2) * x * (((s *= 1.525) + 1) * x + s) + 2);
        },

        elastic: (x) =>
            -1 *
                Math.pow(4, -8 * x) *
                Math.sin(((x * 6 - 1) * (2 * Math.PI)) / 2) +
            1,

        swingTo: (x) => {
            const s = 1.70158;
            return (x -= 1) * x * ((s + 1) * x + s) + 1;
        },
        swingFrom: (x) => {
            const s = 1.70158;
            return x * x * ((s + 1) * x - s);
        },
        swingFromTo: (x) => {
            let s = 1.70158;
            return (x /= 0.5) < 1
                ? 0.5 * (x * x * (((s *= 1.525) + 1) * x - s))
                : 0.5 * ((x -= 2) * x * (((s *= 1.525) + 1) * x + s) + 2);
        },

        bounce: (x) => {
            if (x < 1 / 2.75) {
                return 7.5625 * x * x;
            } else if (x < 2 / 2.75) {
                return 7.5625 * (x -= 1.5 / 2.75) * x + 0.75;
            } else if (x < 2.5 / 2.75) {
                return 7.5625 * (x -= 2.25 / 2.75) * x + 0.9375;
            } else {
                return 7.5625 * (x -= 2.625 / 2.75) * x + 0.984375;
            }
        },
        bouncePast: (x) => {
            if (x < 1 / 2.75) {
                return 7.5625 * x * x;
            } else if (x < 2 / 2.75) {
                return 2 - (7.5625 * (x -= 1.5 / 2.75) * x + 0.75);
            } else if (x < 2.5 / 2.75) {
                return 2 - (7.5625 * (x -= 2.25 / 2.75) * x + 0.9375);
            } else {
                return 2 - (7.5625 * (x -= 2.625 / 2.75) * x + 0.984375);
            }
        },

        easeFromTo: (x) =>
            (x /= 0.5) < 1
                ? 0.5 * Math.pow(x, 4)
                : -0.5 * ((x -= 2) * Math.pow(x, 3) - 2),
        easeFrom: (x) => Math.pow(x, 4),
        easeTo: (x) => Math.pow(x, 0.25),
    };
}

//
// Animator.dimensions([1, 2], [-2, 1], (state, done) => {
// 	console.log(state)
// }, {timeout: 1000})

// Animator.animate((state) => {
// 	console.log(state)
// })

export default Animator;
