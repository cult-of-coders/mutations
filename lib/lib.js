import { check, Match } from 'meteor/check';

export function validateDefaultParams(params) {
    check(config, {
        name: String,
        params: Match.Maybe(Object),
    });
}
