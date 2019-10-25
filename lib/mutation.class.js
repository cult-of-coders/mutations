import { Meteor } from 'meteor/meteor';
import AOP from './aop';
import { check, Match } from 'meteor/check';

export default class Mutation {
    static callAOP = new AOP();
    static executionAOP = new AOP();

    constructor(config) {
        Mutation.checkDefaultConfig(config);

        this.config = config;
        this.callAOP = new AOP();
        this.executionAOP = new AOP();
    }

    /**
     * @param {Function} fn
     */
    static addBeforeCall(fn) {
        this.callAOP.addBefore(fn);
    }

    /**
     * @param {Function} fn
     */
    static addAfterCall(fn) {
        this.callAOP.addAfter(fn);
    }

    /**
     * @param {Function} fn
     */
    static addBeforeExecution(fn) {
        this.executionAOP.addBefore(fn);
    }

    /**
     * @param {Function} fn
     */
    static addAfterExecution(fn) {
        this.executionAOP.addAfter(fn);
    }

    /**
     * @param {Object} config
     */
    static checkDefaultConfig(config) {
        check(config, Object);
        if (typeof config.name !== 'string') {
            throw new Meteor.Error(
                'invalid-config',
                'You must provide a "name" property to your mutation config.'
            );
        }
        
        if (config.validate && typeof config.validate !== 'function') {
            throw new Meteor.Error(
                'invalid-config',
                `"validate" can only be a function in mutation '${config.name}'`
            );
        }
    }

    /**
     * @param {Function} fn
     */
    addBeforeCall(fn) {
        this.callAOP.addBefore(fn);
    }

    /**
     * @param {Function} fn
     */
    addAfterCall(fn) {
        this.callAOP.addAfter(fn);
    }

    /**
     * @param {Function} fn
     */
    addBeforeExecution(fn) {
        this.executionAOP.addBefore(fn);
    }

    /**
     * @param {Function} fn
     */
    addAfterExecution(fn) {
        this.executionAOP.addAfter(fn);
    }

    /**
     * Runs the mutation inside a promise
     * @param {Object} callParams
     * @param {Object} options Meteor options https://docs.meteor.com/api/methods.html#Meteor-apply
     * @returns {Promise}
     */
    run(callParams = {}, options = {}) {
        const config = this.config;

        const aopData = { config, params: callParams };
        Mutation.callAOP.executeBefores(aopData);
        this.callAOP.executeBefores(aopData);

        const { name, params } = config;

        return new Promise((resolve, reject) => {
            Meteor.apply(name, [callParams], options, (error, result) => {
                const aopData = {
                    config,
                    params: callParams,
                    result,
                    error,
                };

                Mutation.callAOP.executeAfters(aopData);
                this.callAOP.executeAfters(aopData);

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Creates the Meteor Method and the handler for it
     * @param {Function} fn
     */
    setHandler(fn) {
        const config = this.config;
        const { name, params } = config;
        const self = this;

        Meteor.methods({
            [name](params = {}) {
                if (config.validate) {
                    config.validate(params);
                } else if (config.params) {
                    check(params, config.params);
                }

                let aopData = {
                    context: this,
                    config,
                    params,
                };

                Mutation.executionAOP.executeBefores(aopData);
                self.executionAOP.executeBefores(aopData);

                let error, result;
                try {
                    result = fn.call(null, { context: this, params });
                } catch (e) {
                    error = e;
                }

                aopData = {
                    context: this,
                    config,
                    params,
                    result,
                    error,
                };

                Mutation.executionAOP.executeAfters(aopData);
                self.executionAOP.executeAfters(aopData);

                if (error) {
                    throw error;
                }

                return result;
            },
        });
    }
}
