import Mutation from './mutation.class';

Object.assign(Mutation, {
    isDebugEnabled: Meteor.isDevelopment || process.env.MUTATION_DEBUG_ENABLED,
});

Mutation.addBeforeCall(({ config, params, context }) => {
    if (Mutation.isDebugEnabled) {
        console.log(`[mutations][${config.name}] Calling with params:`, params);
    }
});

Mutation.addAfterCall(({ config, params, context, result, error }) => {
    if (Mutation.isDebugEnabled) {
        const time = new Date();

        if (!error) {
            console.log(`[mutations][${config.name}] Received result:`, result);
        } else {
            console.error(`[mutations][${config.name}] Received error:`, error);
        }
    }
});

Mutation.addBeforeExecution(({ config, params, context }) => {
    if (Mutation.isDebugEnabled) {
        const time = new Date();
        console.log(
            `[mutations][${
                config.name
            }] Received call with params: ${JSON.stringify(params)}`
        );
    }
});
