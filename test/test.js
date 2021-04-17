import $iren from '../index.js';

const test = QUnit.test;

let entity;

QUnit.module('$iren', {
    beforeEach: function () {
        entity = {
            'properties': {
                'value': 42,
                'name': 'siren'
            }
        };
    }
});

test('unwrapped entity is not an entity', assert => {
    assert.false($iren.isEntity(null));
    assert.false($iren.isEntity(undefined));
    assert.false($iren.isEntity(true));
    assert.false($iren.isEntity('siren'));
    assert.false($iren.isEntity(entity));
});

test('can unwrap', assert => {
    const r = $iren.unwrap(entity);

    assert.true($iren.isEntity(r));
    assert.deepEqual(r, { 'value': 42, 'name': 'siren' });
});

test('cannot unwrap null or undefined', assert => {
    assert.equal($iren.unwrap(null), null);
    assert.equal($iren.unwrap(undefined), undefined);
});

test('can unwrap entity without property', assert => {
    assert.deepEqual($iren.unwrap({}), {});
});

test('unwrap already unwrapped entity has no effect', assert => {
    const r = $iren.unwrap(entity);

    assert.equal(r, $iren.unwrap(r));
});

test('can safely get siren context for null', assert => {
    const sirentWrapper = $iren(null);

    assert.equal(sirentWrapper.title, '');
});

test('can safely get siren context for undefined', assert => {
    const sirentWrapper = $iren(undefined);

    assert.equal(sirentWrapper.title, '');
});

test('can safely get siren context for not unwrapped entity', assert => {
    const sirentWrapper = $iren({});

    assert.equal(sirentWrapper.title, '');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For class and title, $iren', {
    beforeEach: function () {
        entity = {
            'class': ['entityclass'],
            'title': "my entity",
            'properties': {
                'value': 42,
                'name': 'siren'
            }
        };
    }
});

test('can know class', assert => {
    const r = $iren.unwrap(entity);

    assert.true($iren(r).hasClass('entityclass'));
    assert.deepEqual($iren(r).class, ['entityclass']);
    assert.false($iren(r).hasClass('unknow class'));
});

test('can process entity with no class', assert => {
    const r = $iren.unwrap({});

    assert.false($iren(r).hasClass('entityclass'));
    assert.deepEqual($iren(r).class, []);
});

test('can get title', assert => {
    const r = $iren.unwrap(entity);

    assert.equal($iren(r).title, 'my entity');
});

test('can process entity with no title', assert => {
    const r = $iren.unwrap({});

    assert.equal($iren(r).title, '');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For links, $iren', {
    beforeEach: function () {
        entity = {
            'class': ['entityclass'],
            'title': "my entity",
            'properties': {
                'value': 42,
                'name': 'siren'
            },
            'links': [
                {
                    'rel': 'self',
                    'href': 'http://localhost/json',
                    'type': 'application/json'
                },
                {
                    'rel': 'alternate',
                    'href': 'http://localhost/image',
                    'type': 'image/png'
                },
                {
                    'rel': 'alternate',
                    'href': 'http://localhost/pdf',
                    'type': 'application/pdf'
                }
            ]
        };
    }
});

test('can check link declaration', assert => {
    const r = $iren.unwrap(entity);

    assert.true($iren(r).hasLink('self'));
    assert.true($iren(r).hasLink({ rel: 'self' }));
    assert.true($iren(r).hasLink({ rel: 'self', type: 'application/json' }));
    assert.true($iren(r).hasLink('alternate'));

    assert.false($iren(r).hasLink('collection'));
    assert.false($iren(r).hasLink({ rel: 'self', type: 'application/pdf' }));
});

test('can check link for entity without any link', assert => {
    const r = $iren.unwrap({});

    assert.false($iren(r).hasLink('self'));
    assert.false($iren(r).hasLink({ rel: 'self' }));
});

test('can get link by rel', assert => {
    const r = $iren.unwrap(entity);

    const link = $iren(r).link('self');

    assert.deepEqual(link, {
        'rel': 'self',
        'href': 'http://localhost/json',
        'type': 'application/json'
    });

    assert.true($iren.isLink(link));
});

test('can get first link when multiple links', assert => {
    const r = $iren.unwrap(entity);

    const link = $iren(r).link('alternate');

    assert.deepEqual(link, {
        'rel': 'alternate',
        'href': 'http://localhost/image',
        'type': 'image/png'
    });
});

test('can get link by multiple criteria', assert => {
    const r = $iren.unwrap(entity);

    const link = $iren(r).link({ rel: 'self', type: 'application/json' });

    assert.deepEqual(link, {
        'rel': 'self',
        'href': 'http://localhost/json',
        'type': 'application/json'
    });
});

test('can get link by criteria without rel', assert => {
    const r = $iren.unwrap(entity);

    const link = $iren(r).link({ type: 'application/pdf' });

    assert.deepEqual(link, {
        'rel': 'alternate',
        'href': 'http://localhost/pdf',
        'type': 'application/pdf'
    });
});

test('can get no link when no link provided in the entity', assert => {
    const r = $iren.unwrap({});

    const link = $iren(r).link("self");

    assert.deepEqual(link, {});
});

test('can get all links when multiple links', assert => {
    const r = $iren.unwrap(entity);

    const links = $iren(r).links('alternate');

    assert.deepEqual(links, [
        {
            'rel': 'alternate',
            'href': 'http://localhost/image',
            'type': 'image/png'
        },
        {
            'rel': 'alternate',
            'href': 'http://localhost/pdf',
            'type': 'application/pdf'
        }
    ]);
});

test('can get links by multiple criteria', assert => {
    const r = $iren.unwrap(entity);

    const links = $iren(r).links({ rel: 'self', type: 'application/json' });

    assert.deepEqual(links, [
        {
            'rel': 'self',
            'href': 'http://localhost/json',
            'type': 'application/json'
        }
    ]);
});

test('can get no links', assert => {
    const r = $iren.unwrap(entity);

    const links = $iren(r).links("collection");

    assert.deepEqual(links, []);
});

test('can get no links when no link provided in the entity', assert => {
    const r = $iren.unwrap({});

    const links = $iren(r).links("self");

    assert.deepEqual(links, []);
});
