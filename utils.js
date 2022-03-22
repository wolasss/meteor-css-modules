import { createHash } from 'crypto';

export function sha1(contents) {
  var hash = createHash('sha1');
  hash.update(contents);
  return hash.digest('hex');
};

export function toPairs(obj) {
    var pairs = [];
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty(prop, obj)) {
            pairs[pairs.length] = [prop, obj[prop]];
        }
    }
    return pairs;
}
