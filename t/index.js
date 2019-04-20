var assert = require('assert').strict
const jsp = require('../index')

describe('Package functions', () => {
    describe('Lister', () => {
        it('Expands categories', () => {
            var actual = jsp.ls('array');
            var expected = Object.keys(jsp.extensions.array)
                .map(k => 'array:' + k)
            assert.deepEqual(actual, expected)
        })
        it('Individual functions', () => {
            var expected = ['unique', 'trim', 'flat'];
            var actual = jsp.ls(expected);
            assert.deepEqual(actual, expected)
        })
        it('Supports mixes', () => {
            var actual = jsp.ls('object', 'trim')
            var expected = Object.keys(jsp.extensions.object)
            assert.equal(actual.length, expected.length + 1)
        })
    })
    describe('Installer', () => {
        before(() => {
            if (Array.prototype.last) delete Array.prototype.last
        })
        it('Handles a single function', () => {
            jsp.install('array:last')
            assert.ok(!!Array.prototype.last)
        })
        it('Supports groups', () => {
            jsp.install('object')
            var expected = Object.keys(jsp.extensions.object)
            var actual = expected.filter(k => Object.prototype[k])
            assert.equal(actual.length, expected.length)
        })
        it('Preserves object enumerability', () => {
            jsp.install('object:keys');
            var ok = true, o = {};
            for (var i in o) ok = false;
            assert.ok(ok, 'Object space polluted')
        })
        it('Niladic call', () => {
            jsp.install()
            var actual = 0, expected = 0;
            Object.keys(jsp.extensions).map(x => {
                var k = Object.keys(jsp.extensions[x]);
                expected += k.length;
                actual += k.filter(k => {
                    var o = eval(x.tc());
                    return !!o.prototype[k];
                }).length;
            });
            assert.equal(actual, expected)
        })
    })
    describe('Uninstaller', () => {
        before(() => {
            jsp.install('array:last')
        })
        it('Single function', () => {
            jsp.uninstall('array:last')
            assert.ok(!Array.prototype.last, 'Failed uninstallation')
        })
        it('Supports groups', () => {
            jsp.uninstall('object')
            var keys = Object.keys(jsp.extensions.object)
            var expected = keys.filter(k => !Object.prototype[k])
            assert.equal(keys.length, expected.length)
        })
    })
})
describe('Prototypes', () => {
    beforeEach(() => {
        jsp.install()
    })
    describe('Arrays', () => {
        describe('unique', () => {
            it('Handles empty arrays', () => {
                var actual = [].unique();
                assert.deepEqual(actual, [])
            })
            it('Handles simple arrays', () => {
                var actual = [2, 3, 2, 5, 2].unique()
                assert.equal(actual.length, 3)
            })
            it('Handles arrays with objects', () => {
                var actual = [{n: 1}, {n: 2}, {n: 1}]
                assert.equal(actual.length, 3)
            })
        })
        describe('trim', () => {
            it('Empty array', () => {
                var actual = [].trim()
                assert.ok(Array.isArray(actual))
                assert.equal(actual.length, 0)
            })
            it('Base case', () => {
                var actual = ['  test\t'].trim()
                assert.deepEqual(actual, ['test'])
            })
            it('Multiple elements', () => {
                var actual = ['  test\t', '\t\ttest 2   '].trim()
                assert.deepEqual(actual, ['test', 'test 2'])
            })
            it('Non strings - objects', () => {
                var actual = ['  test\t', {x: 1}].trim()
                assert.deepEqual(actual, ['test', {x: 1}])
            })
            it('Array non recursion', () => {
                var actual = ['  test\t', [' inner ', '\tinner\t']].trim()
                assert.deepEqual(actual, ['test', [' inner ', '\tinner\t']])
            })
            it('Trims empty elements', () => {
                var actual = ['x','','y'].trim(true)
                var expected = ['x','y']
                assert.deepEqual(actual, expected)
            })
        })
        describe('flat', () => {
            it('Handles empty arrays', () => {
                var actual = [].flat()
                assert.ok(Array.isArray(actual))
                assert.equal(actual.length, 0)
            })
            it('Flat input', () => {
                var actual = [1, 3, 3];
                assert.deepEqual(actual.flat(), actual)
            })
            it('Base case', () => {
                var actual = [1, [2,3], 4].flat();
                assert.deepEqual(actual, [1,2,3,4])
            })
            it('Recursive', () => {
                var actual = [1, [2,[3,4]], 5].flat(2);
                assert.deepEqual(actual, [1,2,3,4,5])
            })
        })
        describe('last', () => {
            it('Empty array', () => {
                var actual = [].last();
                assert.equal(actual, undefined);
            })
            it('Niladic call', () => {
                var actual = [1,2,3].last();
                assert.equal(actual, 3)
            })
            it('Position specifier', () => {
                var actual = [1,2,3].last(1);
                assert.equal(actual, 2)
            })
        })
        describe('upack', () => {
            it('Empty array', () => {
                var actual = [].unpack()
                assert.ok(Array.isArray(actual))
                assert.equal(actual.length, 0)
            })
            it('Empty array with modifier', () => {
                var actual = [].unpack(true)
                assert.equal(typeof actual, 'undefined')
            })
            it('Array with single element (integer)', () => {
                var actual = [3].unpack()
                assert.equal(typeof actual, 'number')
                assert.equal(actual, 3)
            })
            it('Array with single element (object)', () => {
                var actual = [{n: 1}].unpack()
                assert.deepEqual(actual, {n: 1})
            })
            it('Array with multiple elements', () => {
                var actual = 'a/b/c'.split('/').unpack()
                assert.deepEqual(actual, ['a', 'b', 'c'])
            })
        })
        describe('keyval', () => {
            it('Base case', () => {
                var r = [
                    {k: 'a', v: 1}, 
                    {k: 'b', v: 2}, 
                    {k: 'c', v: 3}
                ]
                var expected = {a: 1, b: 2, c: 3}
                var actual = r.keyval()
                assert.deepEqual(actual, expected)
            })
            it('Named fields', () => {
                var r = [
                    {key: 'a', val: 1}, 
                    {key: 'b', val: 2}, 
                    {key: 'c', val: 3}
                ]
                var expected = {a: 1, b: 2, c: 3}
                var actual = r.keyval('key', 'val')
                assert.deepEqual(actual, expected)
            })
        })
        describe('is methods', () => {
            it('isStr', () => {
                assert.ok(![].isStr())
            })
            it('isArr', () => {
                assert.ok([].isArr())
            })
            it('isObj', () => {
                assert.ok(![].isObj())
            })
        })
    })
    describe('Strings', () => {
        describe('sprintf', () => {
            it('Base case', () => {
                var actual = 'math: %{a} + %{b}'.sprintf({a: 1, b: 2})
                assert.equal(actual, 'math: 1 + 2')
            })
            it('Missing parameters', () => {
                var actual = 'math: %{a} + %{b}'.sprintf()
                assert.equal(actual, 'math: %{a} + %{b}')
            })
            it('String parameter', () => {
                var actual = 'math: %{a} + %{a}'.sprintf('')
                assert.equal(actual, 'math: %{a} + %{a}')
            })
            it('Multiple instances', () => {
                var actual = 'math: %{a} + %{a}'.sprintf({a: 1})
                assert.equal(actual, 'math: 1 + 1')
            })
        })
        describe('trimln', () => {
            it('Trims leading spaces', () => {
                var actual = '   x'.trimln()
                assert.equal(actual, 'x')
            })
            it('Trims leading tabs', () => {
                var actual = '\t\tx'.trimln()
                assert.equal(actual, 'x')
            })
            it('Trims mixed whitespace', () => {
                var actual = ' \tx'.trimln()
                assert.equal(actual, 'x')
            })
            it('Joins multilines', () => {
                var actual = 'line1\nline2\nline3'.trimln()
                assert.equal(actual, 'line1 line2 line3')
            })
            it('Respects double lines', () => {
                var actual = 'line1\n\nline2\n\nline3'.trimln()
                assert.equal(actual, 'line1 \nline2 \nline3')
            })
        })
        describe('case functions', () => {
            var s = 'in a littLe bOOk';
            it ('Uppercases', () => {
                var actual = s.uc()
                var expected = s.toUpperCase()
                assert.equal(actual, expected)
            })
            it ('Lowercases', () => {
                var actual = s.lc()
                var expected = s.toLowerCase()
                assert.equal(actual, expected)
            })
            it ('Titlecases', () => {
                var actual = s.tc()
                var expected = 'In a Little Book'
                assert.equal(actual, expected)
            })
        })
        describe('is methods', () => {
            it('isStr', () => {
                assert.ok(''.isStr())
            })
            it('isArr', () => {
                assert.ok(!''.isArr())
            })
            it('isObj', () => {
                assert.ok(!''.isObj())
            })
        })
    })
    describe('Objects', () => {
        describe('keys', () => {
            it('Base case', () => {
                var o = {a: 1, b: 2}
                var actual = o.keys()
                var expected = Object.keys(o)
                assert.deepEqual(actual, expected)
            })            
        })
        describe('map', () => {
            it('Base case', () => {
                var r = (o, k, acc) => { acc[k + '_'] = o[k] + 1; return acc }
                var actual = {a: 1, b: 2}.map(r)
                var expected = {a_: 2, b_: 3}
                assert.deepEqual(actual, expected)
            })            
        })
        describe('keyval', () => {
            it('Base case', () => {
                var o = {a: 1, b: 2, c: 3}
                var actual = o.keyval()
                var expected = [
                    {k: 'a', v: 1}, 
                    {k: 'b', v: 2}, 
                    {k: 'c', v: 3}
                ]
                assert.deepEqual(actual, expected)
            })            
            it('Named fields', () => {
                var o = {a: 1, b: 2, c: 3}
                var actual = o.keyval('key', 'val')
                var expected = [
                    {key: 'a', val: 1}, 
                    {key: 'b', val: 2}, 
                    {key: 'c', val: 3}
                ]
                assert.deepEqual(actual, expected)
            })            
        })
        describe('concat', () => {
            it('Base case', () => {
                var expected = {a:1, b:2}
                var actual = {}.concat({a:1}, {b:2})
                assert.deepEqual(actual, expected)
            })
            it('Overwrites', () => {
                var actual = {a:1, b:2}.concat({a:3})
                var expected = {a:3, b:2}
                assert.deepEqual(actual, expected)
            })
        })
        describe('mv', () => {
            it('Renames', () => {
                var actual = {a: 1, b: 2}.mv({a: 'c', b: 'd'})
                var expected = {c:1, d:2}
                assert.deepEqual(actual, expected)
            })
            it('Removes', () => {
                var actual = {a: 1, b: 2, c: 3, d: 4}.mv({a: '', b: undefined, c: null})
                var expected = {d:4}
                assert.deepEqual(actual, expected)
            })
        })
        describe('rm', () => {
            it('Base case', () => {
                var actual = {a:1, b:2}.rm('a')
                var expected = {b:2}
                assert.deepEqual(actual, expected)
            })
            it('Multiple arguments', () => {
                var actual = {a:1, b:2, c:3}.rm('a', 'c')
                var expected = {b:2}
                assert.deepEqual(actual, expected)
            })
            it('Accepts array', () => {
                var actual = {a:1, b:2, c:3, d:4}.rm(...['b', 'd'])
                var expected = {a:1, c:3}
                assert.deepEqual(actual, expected)
            })
        })
        describe('is methods', () => {
            it('isStr', () => {
                assert.ok(!{}.isStr())
            })
            it('isArr', () => {
                assert.ok(!{}.isArr())
            })
            it('isObj', () => {
                assert.ok({}.isObj())
            })
        })
    })
})
