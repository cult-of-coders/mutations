# Mutations

[![Build Status](https://api.travis-ci.org/cult-of-coders/mutations.svg?branch=master)](https://travis-ci.org/cult-of-coders/mutations)

This is a new way to think about how you deal with mutations in Meteor. (a very opinionated way!)

We go with Meteor on the road of [CQRS](https://martinfowler.com/bliki/CQRS.html) and we want to separate fully
the way we deal with fetching data and performing mutations.

This package heavily recommends [Grapher](https://github.com/cult-of-coders/grapher/issues) for doing the heavy lifting of data fetching. Even if you do not use MongoDB, you can use Grapher's queries for anything that you wish by using [Resolver Queries](https://github.com/cult-of-coders/grapher/blob/master/docs/named_queries.md#resolvers)

Advantages that this approach offers:

*   Separates concerns for methods and avoids using strings, rather as modules
*   Easy separation between client-side code and server-side
*   Uses promise-only approach
*   Provides great logging for development to see what's going on
*   Powerful ability to extend mutations by adding hooks before and after calling and execution

How does it compare to _ValidatedMethod_ ?

*   Easily separates server code from client code

### Defining our mutations

This approach aims at bringing a little bit of structure into your mutations:

```js
// file: /imports/api/mutations/defs.js
import { wrap, Mutation } from 'meteor/cultofcoders:mutations';

export const todoAdd = wrap({
    name: 'todos.add',
    params: {
        listId: String,
        todo: Object,
    },
});

export const todoRemove = new Mutation({
    name: 'todos.remove',
    params: {
        todoId: String,
    },
});

// wrap(config) === new Mutation(config)
// Just different syntax
```

Params should be in the form of something that [check](https://docs.meteor.com/api/check.html) can handle.
Always use params as objects when you send out to methods for clarity.

### Adding handler to our mutation

```js
// you can put this SERVER ONLY or SERVER AND CLIENT
// file: /imports/api/mutations/index.js

import { todoAdd, todoRemove } from './defs';

// notice that now the context is pass as an argument, no longer have to use `this.userId`
todoAdd.setHandler((context, params) => {
    const { listId, todo } = params;
    // ALWAYS DELEGATE. MUTATIONS SHOULD BE DUMB!
    return TodoService.addTodo(context.userId, listId, todo);
});
```

If your mutations are many, and as your app grows that would be the case, decouple them into separate files,
based on the concern they're tackling like: `/imports/api/mutations/items.js`

### Calling our mutations

```js
// CLIENT
import { todoAdd, todoRemove } from '...';

// somewhere in your frontend layer...
onAddButton() {
    const todo = this.getTodo();

    todoAdd.run({
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
import { Mutation } from 'meteor/cultofcoders:mutations';

Mutation.isDebugEnabled = false;
```

### Hook into the package!

The beauty of this package is that it allows you to hook into the befores and afters of the calls.

For example:

```js
import { Mutation } from 'meteor/cultofcoders:mutations';

// Runs 1st
Mutation.addBeforeCall(({ config, params }) => {
    // Do something before calling the mutation (most likely on client)
});

// Runs 2nd
Mutation.addBeforeExecution(({ context, config, params }) => {
    // Do something before executing the mutation (most likely on server)
    // Maybe run some checks based on some custom configs ?
});

// Runs 3rd
Mutation.addAfterExecution(({ context, config, params, result, error }) => {
    // Do something after mutation has been executed (most likely on server)
    // You could log the errors and send them somewhere?
});

// Runs 4th
Mutation.addAfterCall(({ config, params, result, error }) => {
    // Do something after response has been returned (most likely on client)
    // Maybe do some logging or dispatch an event? Maybe useful with Redux?
});
```

This allows us to do some nice things like, here's some wild examples:

```js
// file: /imports/api/mutations/defs.js
export const todoAdd = wrap({
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
Mutation.addBeforeExecution(function permissionCheck({
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

// Optionally add the expect AOP to securely write methods and prevent from returning bad data
Mutation.addAfterExecution(function expectCheck({
    config,
    result
}) {
    if (config.expect) {
        check(result, config.expect);
    }
})

// file: /imports/api/mutations/aop/provider.js
Mutation.addBeforeExecution(function provider({
    context,
    config,
    params
}) => {
    if (config.provider == Providers.LIST) {
        // Inject it in params, so the handler can access it from there
        params.list = Lists.findOne(listId);
    }
})
```

You can also hook into individual mutations having the same exact syntax:

```js
addTodo.addBeforeCall(function () { ... });
addTodo.addBeforeExecutionCall(function () { ... });
addTodo.addAfterExecutionCall(function () { ... });
addTodo.addAfterCall(function () { ... });
```

### What happens if you have 100+ methods ?

Decouple, but keep them centralized in, keep `api/mutations/defs/index.js` as an aggregator:

```js
// /imports/api/mutations/defs/index.js

export { todoAdd, todoRemove, todoEdit } from './todo.defs.js';
export { todoAdd, todoRemove, todoEdit } from './list.defs.js';
```

Feel free to submit an issue if you have any ideas for improvement!
