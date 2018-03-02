import {
    SOME_MUTATION,
    SOME_MUTATION_WITH_PARAMS,
    SOME_MUTATION_INVALID,
    SOME_MUTATION_EXCEPTION,
} from './boot';
import { expect, assert } from 'meteor/practicalmeteor:chai';

describe('mutate', function() {
    it('Should call the mutation', async function(done) {
        SOME_MUTATION.run().then(result => {
            assert.isString(result);
            done();
        });
    });

    it('Should call the mutation with params', async function(done) {
        SOME_MUTATION_WITH_PARAMS.run({ title: 'DEMO' })
            .then(result => {
                assert.equal(result, 'DEMO');
                done();
            })
            .catch(err => done(err));
    });

    it('Should throw exception inside the method on server', function(done) {
        SOME_MUTATION_EXCEPTION.run({ title: 'DEMO' }).catch(err => {
            done();
        });
    });
});
