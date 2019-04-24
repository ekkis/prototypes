var assert = require('assert').strict
const jsp = require('../index')

describe('Objects', () => {
	before(() => {
		jsp.install()
	})
	describe('keys', () => {
		it('Base case', () => {
			var o = {a: 1, b: 2}
			var actual = o.keys()
			var expected = Object.keys(o)
			assert.ok(Array.isArray(expected))
			assert.deepEqual(actual, expected)
		})            
	})
	describe('isEmpty', () => {
		it('Has no attributes', () => {
			assert.ok({}.isEmpty())
		})            
		it('Has attributes', () => {
			assert.ok(!{a: 1, b: 2}.isEmpty())
		})            
	})
	describe('map', () => {
		it('Base case', () => {
			var r = (o, k, acc) => { acc[k + '_'] = o[k] + 1 }
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
		it('String signature - defaults', () => {
			var o = {a: 1, b: 2, c: 3}
			var actual = o.keyval({})
			var expected = 'a=1\nb=2\nc=3'
			assert.equal(actual, expected)
		})
		it('String signature - specific', () => {
			var o = {a: 1, b: 2, c: 3}
			var actual = o.keyval({ks: ':', rs: ';'})
			var expected = 'a:1;b:2;c:3'
			assert.equal(actual, expected)
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
	describe('mv/p', () => {
		it('Renames', () => {
			var input = {a:1, b:2}
			var opts = {a: 'c', b: 'd'}
			var expected = {c:1, d:2}
			assert.deepEqual(input.mv(opts), expected, 'mv failed')
			assert.deepEqual(input.mvp(opts), expected, 'mvp failed')
		})
		it('Collisions overwrite', () => {
			var input = {a:1, b:2}
			var opts = {a: 'b'}
			var expected = {b: 1}
			assert.deepEqual(input.mv(opts), expected, 'mv failed')
			assert.deepEqual(input.mvp(opts), expected, 'mvp failed')
		})
		it('Removes', () => {
			var input = {a: 1, b: 2, c: 3, d: 4}
			var opts = {a: '', b: undefined, c: null}
			var expected = {d:4}
			assert.deepEqual(input.mv(opts), expected, 'mv failed')
			assert.deepEqual(input.mvp(opts), expected, 'mvp failed')
		})
		it('Returnless', () => {
			var actual = {a: 1, b: 2}
			var opts = {a: 'c', b: 'd'}
			actual.mvp(opts)
			assert.deepEqual(actual, {a:1, b:2}, 'mvp failed')
			actual.mv(opts)
			assert.deepEqual(actual, {c:1, d:2}, 'mv failed')
		})
	})
	describe('rm/p', () => {
		it('Base case', () => {
			var input = {a:1, b:2}
			var expected = {b:2}
			assert.deepEqual(input.rm('a'), expected, 'rm failed')
			assert.deepEqual(input.rmp('a'), expected, 'rmp failed')
		})
		it('Multiple arguments', () => {
			var input = {a:1, b:2, c:3}
			var expected = {b:2}
			assert.deepEqual(input.rm('a', 'c'), expected, 'rm failed')
			assert.deepEqual(input.rmp('a', 'c'), expected, 'rmp failed')
		})
		it('Accepts array', () => {
			var input = {a:1, b:2, c:3, d:4}
			var opts = ['b', 'd']
			var expected = {a:1, c:3}
			assert.deepEqual(input.rm(...opts), expected, 'rm failed')
			assert.deepEqual(input.rmp(...opts), expected, 'rmp failed')
		})
		it('Returnless', () => {
			var actual = {a:1, b:2}
			actual.rmp('a')
			assert.deepEqual(actual, {a:1, b:2}, 'rmp failed')
			actual.rm('a')
			assert.deepEqual(actual, {b:2}, 'rmp failed')
		})
	})
	describe('notIn', () => {
		it('Congruent set', () => {
			var input = {a:1, b:2, c:3}
			var actual = input.notIn(input)
			assert.equal(actual.length, 0)
		})
		it('Excess attributes', () => {
			var input = {a:1, b:2, c:3}
			var actual = input.notIn({a:1, b:2})
			assert.equal(actual.length, 1)
			assert.equal(actual[0], 'c')
		})
		it('Complement test', () => {
			var input = {a:1, b:2}
			var actual = input.notIn({a:1, b:2, c:3})
			assert.equal(actual.length, 0)
		})
	})
	describe('getpath', () => {
		it('Empty object', () => {
			var actual = {}.getpath('a/b/c')
			var expected = undefined
			assert.equal(actual, expected)
		})
		it('Value exists', () => {
			var actual = {a: {b: {c: 3}}}.getpath('a/b/c')
			var expected = 3
			assert.equal(actual, expected)
		})
		it('Dot notation', () => {
			var actual = {a: {b: {c: 3}}}.getpath('a.b.c')
			var expected = 3
			assert.equal(actual, expected)
		})
	})
	describe('setpath', () => {
		it('Base case', () => {
			var actual = {};
			actual.setpath('a/b/c', 3)
			var expected = {a: {b: {c: 3}}}
			assert.deepEqual(actual, expected)
		})
		it('Path exists', () => {
			var actual = {a: {b: {c: 0}}};
			actual.setpath('a/b/c', 1)
			var expected = {a: {b: {c: 1}}}
			assert.deepEqual(actual, expected)
		})
		it('Dot notation', () => {
			var actual = {};
			actual.setpath('a.b.c', 3)
			var expected = {a: {b: {c: 3}}}
			assert.deepEqual(actual, expected)
		})
	})
})