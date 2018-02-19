import { mutation, mutate } from 'meteor/cultofcoders:mutations';

export const SOME_MUTATION = {
    name: 'some_mutation',
};

export const SOME_MUTATION_WITH_PARAMS = {
    name: 'some_mutation_with_params',
    params: {
        title: String,
    },
};

export const SOME_MUTATION_INVALID = {
    namex: 'some_mutation_invalid',
};

export const SOME_MUTATION_EXCEPTION = {
    name: 'some_mutation_exception',
};

if (Meteor.isServer) {
    mutation(SOME_MUTATION, function(context) {
        return 'Hello!';
    });
    mutation(SOME_MUTATION_EXCEPTION, function(context) {
        throw 'Oh no!';
    });

    mutation(SOME_MUTATION_WITH_PARAMS, function(context, { title }) {
        return title;
    });
}
