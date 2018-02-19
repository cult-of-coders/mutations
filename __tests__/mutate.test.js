import { mutate } from 'meteor/cultofcoders:mutations';
import {
    SOME_MUTATION,
    SOME_MUTATION_WITH_PARAMS,
    SOME_MUTATION_INVALID,
    SOME_MUTATION_EXCEPTION,
} from './boot';
import { expect, assert } from 'meteor/practicalmeteor:chai';

describe('mutate', function() {
    it('Should call the mutation', async function(done) {
        mutate(SOME_MUTATION).then(result => {
            assert.isString(result);
            done();
        });
    });
    it('Should call the mutation with params', async function(done) {
        mutate(SOME_MUTATION_WITH_PARAMS, { title: 'DEMO' })
            .then(result => {
                assert.equal(result, 'DEMO');
                done();
            })
            .catch(err => done(err));
    });
    it('Should throw exception when calling invalid mutation', function() {
        expect(() => {
            mutate(SOME_MUTATION_INVALID, { title: 'DEMO' }).then(result => {
                assert.equal(result.title, 'DEMO');
            });
        }).to.throw();
    });
    it('Should throw exception inside the method on server', function(done) {
        mutate(SOME_MUTATION_EXCEPTION, { title: 'DEMO' }).catch(err => {
            done();
        });
    });
});
