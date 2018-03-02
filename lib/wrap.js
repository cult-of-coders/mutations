import Mutation from './mutation.class';

export default function wrap(config) {
    return new Mutation(config);
}
