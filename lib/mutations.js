import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { mutateAOP, mutationAOP } from './aop';
import { debug } from './debug';

const createMutator = (config, functionBody) => {
    check(config, {
        name: String,
        params: Match.Maybe(Object),
    });

    const { name, params } = config;

    Meteor.methods({
        [name](params = {}) {
            mutationAOP.executeBefores({
                context: this,
                config,
                params,
            });

            if (config.params) {
                check(params, config.params);
            }

            let error, result;
            try {
                result = functionBody.call(null, this, params);
            } catch (e) {
                error = e;
            }

            mutationAOP.executeAfters({
                context: this,
                config,
                params,
                result,
                error,
            });

            if (error) {
                throw error;
            }

            return result;
        },
    });
};

export default createMutator;
