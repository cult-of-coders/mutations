import { wrap, Mutation } from 'meteor/cultofcoders:mutations';

export const SOME_MUTATION = wrap({
    name: 'some_mutation',
});

export const SOME_MUTATION_WITH_PARAMS = wrap({
    name: 'some_mutation_with_params',
    params: {
        title: String,
    },
});

export const SOME_MUTATION_EXCEPTION = new Mutation({
    name: 'some_mutation_exception',
});

if (Meteor.isServer) {
    SOME_MUTATION.setHandler(function(context) {
        return 'Hello!';
    });

    SOME_MUTATION_EXCEPTION.setHandler(function(context) {
        throw 'Oh no!';
    });

    SOME_MUTATION_WITH_PARAMS.setHandler(function(context, { title }) {
        return title;
    });
}
