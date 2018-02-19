# Mutations

This is a new way to think about how you deal with mutations in Meteor. (a very opinionated way!)

We go with Meteor on the road of [CQRS](https://martinfowler.com/bliki/CQRS.html) and we want to separate fully
the way we deal with fetching data and performing mutations.

This package heavily recommends [Grapher](https://github.com/cult-of-coders/grapher/issues) for doing the heavy lifting
of data fetching. Even if you do not use MongoDB, you can use Grapher's queries for anything that you wish by using
[Resolver Queries](https://github.com/cult-of-coders/grapher/blob/master/docs/named_queries.md#resolvers)

Advantages that this approach offers:

* Separates concerns for methods and avoids using strings
* Going on this modular approach allows easy separation of code server and client
* Goes only promise-only approach
* Provides great logging for development to see what's going on
* Embedded and very extensible mutations using AOP

### Defining our mutations

This approach aims at bringing a little bit of structure into your mutations:

```js
// file: /imports/api/mutations/defs.js
export const TODO_ADD = {
    name: 'todo_add',
    params: {
        listId: String,
        todo: Object,
    },
};

export const TODO_REMOVE = {
    name: 'todo_remove',
    params: {
        todoId: String,
    },
};
```

Params should be in the form of something that [check](https://docs.meteor.com/api/check.html) can handle.
Always use params as objects when you send out to methods for clarity.

### Adding handler to our mutation

```js
// you can put this SERVER ONLY or SERVER AND CLIENT
// file: /imports/api/mutations/index.js

import { TODO_ADD, TODO_REMOVE } from './defs';
import { mutation } from 'meteor/cultofcoders:mutations';

// notice that now the context is pass as an argument, no longer have to use `this.userId`
mutation(TODO_ADD, (context, params) => {
    const { listId, todo } = params;
    // ALWAYS DELEGATE. MUTATIONS SHOULD BE DUMB!
    return TodoService.addTodo(context.userId, listId, todo);
});
```

If your mutations are many, and as your app grows that would be the case, decouple them into separate files,
based on the concern they're tackling like: `/imports/api/mutations/items.js`

```js
// CLIENT
import { TODO_ADD, TODO_REMOVE } from '...';
import { mutate } from 'meteor/cultofcoders:mutations';


// somewhere in your frontend layer...
onAddButton() {
    const todo = this.getTodo();

    mutate(TODO_ADD, {
        listId: this.props.listId,
        todo,
    }).then((todoId) => {

    })
}
```

### Logging

For convenience, we'll show in the `console` the what calls are made and what responses are received, so you have full visibility.

By default, if `Meteor.isDevelopment` is `true`, logging is enabled , to disable this functionality.

```js
import { disableDebugging } from 'meteor/cultofcoders:mutations';

disableDebugging();
```

### AOP

The beauty of this package is that it allows you to hook into the befores and afters of the calls.

For example:

```js
import { mutateAOP, mutationAOP } from 'meteor/cultofcoders:mutations';

mutateAOP.addBefore(({ config, params }) => {
    // Do something before calling the mutation (most likely on client)
});

mutateAOP.addAfter(({ config, params, result, error }) => {
    // Do something after response has been returned (most likely on client)
    // Maybe do some logging or dispatch an event? Maybe useful with Redux?
});

mutationAOP.addBefore(({ context, config, params }) => {
    // Do something before executing the mutation (most likely on server)
    // Maybe run some checks based on some custom configs ?
});

mutationAOP.addAfter(({ context, config, params, result, error }) => {
    // Do something after mutation has been executed (most likely on server)
    // You could log the errors and send them somewhere?
});
```

This allows us to do some nice things like, here's some wild examples:

```js
// file: /imports/api/mutations/defs.js
export const TODO_ADD = {
    name: 'todo_add',
    params: {
        listId: String,
        todo: Object,
    },

    // Your own convention of permission checking
    permissions: [ListPermissions.ADMIN],

    // Set expectations of what the response would look like
    // This makes it very easy for frontend devs to just look at the def and know how to use this
    expect: {
        todoId: String,
    },

    // Inject data into params based on a parameter
    provider: Providers.LIST,
};
```

```js
// file: /imports/api/mutations/aop/permissions.js
mutationAOP.addBefore(function permissionCheck({
    context,
    config,
    params
}) => {
    const {permissions} = config;
    const {listId} = params;

    if (permissions) {
        // throw exception if listId is undefined
        ListPermissionService.runChecks(context.userId, listId, permissions);
    }
})

// Optionally
mutationAOP.addAfter(function expectCheck({
    config,
    result
}) {
    if (config.expect) {
        check(result, config.expect);
    }
})

// file: /imports/api/mutations/aop/provider.js
mutationAOP.addBefore(function permissionCheck({
    context,
    config,
    params
}) => {
    if (config.provider == Providers.LIST) {
        params.list = Lists.findOne(listId);
    }
})
```

### What happens if you have 100+ methods ?

Decouple, but keep them centralized in, keep `api/mutations/defs/index.js` as an aggregator:

```js
// /imports/api/mutations/defs/index.js

export { TODO_ADD, TODO_REMOVE, TODO_EDIT } from './todo.defs.js';
export { LIST_ADD, LIST_REMOVE, LIST_EDIT } from './list.defs.js';
```

Feel free to submit an issue if you have any ideas for improvement!
