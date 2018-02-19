import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { mutateAOP } from './aop';
import debug from './debug';

const mutate = (config, callParams = {}) => {
    check(config, {
        name: String,
        params: Match.Maybe(Object),
    });

    mutateAOP.executeBefores({
        config,
        params: callParams,
    });

    const { name, params } = config;

    return new Promise((resolve, reject) => {
        Meteor.call(name, callParams, (error, result) => {
            mutateAOP.executeAfters({
                config,
                params,
                result,
                error,
            });

            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export default mutate;
