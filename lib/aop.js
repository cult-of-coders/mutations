class AOP {
    befores = [];
    afters = [];

    addBefore(fn) {
        check(fn, Function);

        this.befores.push(fn);
    }

    addAfter(fn) {
        check(fn, Function);

        this.afters.push(fn);
    }

    executeBefores(...args) {
        this.befores.forEach(fn => fn.call(null, ...args));
    }

    executeAfters(...args) {
        this.afters.forEach(fn => fn.call(null, ...args));
    }
}

const mutateAOP = new AOP();
const mutationAOP = new AOP();

export { AOP, mutateAOP, mutationAOP };
