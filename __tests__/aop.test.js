import { AOP } from '../lib/aop';

describe('AOP', function() {
    it('Should dispatch befores', function() {
        const aop = new AOP();

        let inBefore1 = false;
        let inBefore2 = false;
        aop.addBefore(value => {
            inBefore1 = value;
        });
        aop.addBefore(value => {
            inBefore2 = value;
        });

        aop.executeBefores(true);

        assert.isTrue(inBefore1);
        assert.isTrue(inBefore2);
    });
    it('Should dispatch afters', function() {
        const aop = new AOP();

        let inAfter1 = false;
        let inAfter2 = false;
        aop.addBefore(value => {
            inAfter1 = value;
        });
        aop.addBefore(value => {
            inAfter2 = value;
        });

        aop.executeBefores(true);

        assert.isTrue(inAfter1);
        assert.isTrue(inAfter2);
    });
});
