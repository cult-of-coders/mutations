import { mutateAOP, mutationAOP } from './aop';

export let debug = {
    isEnabled: Meteor.isDevelopment || process.env,
};

export function disableDebugging() {
    debug.isEnabled = false;
}

mutateAOP.addBefore(({ config, params, context }) => {
    if (debug.isEnabled) {
        const time = new Date();
        console.log(
            `[mutations][${config.name}] Calling with params:`,
            `${JSON.stringify(params, 4)}`
        );
    }
});

mutateAOP.addAfter(({ config, params, context, result, error }) => {
    if (debug.isEnabled) {
        const time = new Date();

        if (!error) {
            console.log(`[mutations][${config.name}] Received result:`, result);
        } else {
            console.error(`[mutations][${config.name}] Received error:`, error);
        }
    }
});

mutationAOP.addBefore(({ config, params, context }) => {
    if (debug.isEnabled) {
        const time = new Date();
        console.log(
            `[${time.getTime()}][${
                config.name
            }] Received call with params: ${JSON.stringify(params)}`
        );
    }
});
