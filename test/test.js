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

    assert.equal($iren.unwrap(r), r);
});

test('unwrap entity context returns entity', assert => {
    const r = $iren.unwrap(entity);

    assert.equal($iren.unwrap($iren(r)), r);
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

test('can ask for siren context on context itself', assert => {
    const e = $iren.unwrap(entity);

    assert.equal($iren($iren(e)).title, 'my entity');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For links, $iren', {
    beforeEach: function () {
        entity = {
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

///////////////////////////////////////////////////////////////////////

QUnit.module('For sub-entities, $iren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'class': ['myclass'],
                    'title': 'my sub entity',
                    'rel': 'alternate',
                    'href': 'http://localhost'
                },
                {
                    'rel': 'item',
                    'href': 'http://localhost'
                }
            ]
        };
    }
});

test('can check sub entity by rel', assert => {
    const r = $iren.unwrap(entity);

    assert.true($iren(r).hasEntity("alternate"));
    assert.true($iren(r).hasEntity("item"));
    assert.false($iren(r).hasEntity("collection"));
});

test('can check sub entity by rel after getting one entity', assert => {
    const r = $iren.unwrap(entity);

    $iren(r).entity("alternate");

    assert.true($iren(r).hasEntity("alternate"));
    assert.true($iren(r).hasEntity("item"));
    assert.false($iren(r).hasEntity("collection"));
});

test('can get sub entity by rel', assert => {
    const r = $iren.unwrap(entity);

    const e = $iren(r).entity("alternate");

    assert.equal($iren(e).title, 'my sub entity');
    assert.true($iren(e).hasClass('myclass'));
    assert.true($iren.isEntity(e));
    assert.true($iren.isSubEntity(e));
    assert.true($iren.isSubEntityEmbeddedLink(e));
});

test('can get sub entities by rel', assert => {
    const r = $iren.unwrap(entity);

    const e = $iren(r).entities("alternate");

    assert.deepEqual(e, [{}]);
});

test('cannot get sub entity', assert => {
    const r = $iren.unwrap({});

    const e = $iren(r).entity("alternate");

    assert.false($iren.isSubEntityEmbeddedLink(e));
});


///////////////////////////////////////////////////////////////////////

QUnit.module('For creating request, $iren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'rel': 'alternate',
                    'href': 'http://localhost/subentity'
                }
            ],
            links: [
                {
                    'rel': 'self',
                    'href': 'http://localhost/self'
                },
                {
                    'rel': 'alternate',
                    'href': 'http://localhost/alternate',
                    'type': 'image/png'
                }
            ]
        };
    }
});

// Create stubs when running test outside a browser
if (typeof global !== 'undefined') {
    // Stub for Request class
    global.Request = function (url, options) {
        this.url = url;
        this.method = options.method;
        this.headers = options.headers;
    }

    // Stub for Headers class
    global.Headers = Map;
}

test('can get request when self link available', assert => {
    const e = $iren.unwrap(entity);

    const r = $iren.request(e);

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/self');
    assert.equal(r.headers.get('Accept'), 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
});

test('can get request with rel', assert => {
    const e = $iren.unwrap(entity);

    const r = $iren.request($iren(e).link('alternate'));

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/alternate');
});

test('can get request with specific content-type', assert => {
    const e = $iren.unwrap(entity);

    const r = $iren.request($iren(e).link('alternate'));

    assert.equal(r.headers.get('Accept'), 'image/png');
});

test('cannot get request when self link not available', assert => {
    const e = $iren.unwrap({});

    assert.throws(() => {
        $iren.request(e);
    })
});

test('can get request for sub entity embedded link', assert => {
    const e = $iren.unwrap(entity);

    const r = $iren.request($iren(e).entity('alternate'));

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/subentity');
    assert.equal(r.headers.get('Accept'), 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
});


///////////////////////////////////////////////////////////////////////

QUnit.module('With factory, $iren', {
    beforeEach: function () {
        entity = {
            class: ['customClass'],
            properties: {
                'name': 'myentity',
            },
            entities: [
                {
                    class: ['customClass'],
                    rel: 'alternate',
                    properties: {
                        'name': 'mysubentity',
                    }
                },
                {
                    class: ['collectionClass', 'customClass'],
                    rel: 'collection',
                    properties: {
                        'name': 'mysubcollection',
                    }
                }
            ]
        };
    }
});

class MyCustomClass {

    constructor(properties) {
        Object.assign(this, properties);
    }

}

test('can unwrap with custom class', assert => {
    const e = $iren.unwrap(entity, p => new MyCustomClass(p));

    assert.true(e instanceof MyCustomClass);
    assert.equal(e.name, 'myentity');
});


test('can register factory for custom class', assert => {
    $iren.registerFactory('customClass', p => new MyCustomClass(p));

    const e = $iren.unwrap(entity);

    assert.true(e instanceof MyCustomClass);
});

test('can register factory for custom class for sub entity', assert => {
    $iren.registerFactory('customClass', p => new MyCustomClass(p));
    const e = $iren.unwrap(entity);

    const sube = $iren(e).entity('alternate');

    assert.true(sube instanceof MyCustomClass);
    assert.equal(sube.name, 'mysubentity');
});


test('can register factory for custom class for sub entity with multiple classes', assert => {
    $iren.registerFactory('customClass', p => new MyCustomClass(p));
    const e = $iren.unwrap(entity);

    const sube = $iren(e).entity('collection');

    assert.true(sube instanceof MyCustomClass);
    assert.equal(sube.name, 'mysubcollection');
});
