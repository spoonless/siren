import siren from '../index.js';

const test = QUnit.test;

let entity;
let otherEntity;

QUnit.module('siren', {
    beforeEach: function () {
        entity = {
            'properties': {
                'value': 42,
                'name': 'siren'
            }
        };
    }
});

test('can check none entity', assert => {
    assert.false(siren.isEntity(null));
    assert.false(siren.isEntity(undefined));
    assert.false(siren.isEntity(true));
    assert.false(siren.isEntity('siren'));
    assert.false(siren.isEntity(entity));
});

test('can create entity', assert => {
    const r = siren.entity(entity);

    assert.true(siren.isEntity(r));
    assert.deepEqual(r.properties, { value: 42, name: 'siren' });
});

test('can create entity from null or undefined', assert => {
    assert.true(siren.isEntity(siren.entity(null)));
    assert.deepEqual(siren.entity(null).properties, {});

    assert.true(siren.isEntity(siren.entity(undefined)));
});

test('can create entity without property', assert => {
    const r = siren.entity({});
    assert.true(siren.isEntity(r));
});

test('do not create an entity from an entity', assert => {
    const r = siren.entity(entity);

    assert.equal(siren.entity(r), r);
});

test('can get property', assert => {
    const e = siren.entity(entity);

    assert.equal(e.property('value'), 42);
    assert.equal(e.property('value', 50), 42);
    assert.equal(e.property('unknown', "no value"), "no value");
    assert.equal(e.property('unknown', undefined));
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For class and title, siren', {
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
    const e = siren.entity(entity);

    assert.true(e.hasClass('entityclass'));
    assert.deepEqual(e.class, ['entityclass']);
    assert.false(e.hasClass('unknow class'));
});

test('can process entity with no class', assert => {
    const e = siren.entity({});

    assert.false(e.hasClass('entityclass'));
    assert.deepEqual(e.class, []);
});

test('can get title', assert => {
    const e = siren.entity(entity);

    assert.equal(e.title, 'my entity');
});

test('can process entity with no title', assert => {
    const e = siren.entity({});

    assert.equal(e.title, '');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For links, siren', {
    beforeEach: function () {
        entity = {
            'links': [
                {
                    'rel': ['self'],
                    'href': 'http://localhost/json',
                    'type': 'application/json'
                },
                {
                    'rel': ['collection', 'author'],
                    'href': 'http://localhost/authors'
                },
                {
                    'rel': ['alternate'],
                    'href': 'http://localhost/image',
                    'type': 'image/png'
                },
                {
                    'rel': ['alternate'],
                    'href': 'http://localhost/pdf',
                    'type': 'application/pdf'
                }
            ]
        };
    }
});

test('can check link declaration', assert => {
    const e = siren.entity(entity);

    assert.true(e.hasLink('self'));
    assert.true(e.hasLink(['self']));
    assert.true(e.hasLink({ rel: ['self'] }));
    assert.true(e.hasLink({ rel: ['self'], type: 'application/json' }));
    assert.true(e.hasLink('alternate'));
    assert.true(e.hasLink(['author', 'collection']));

    assert.false(e.hasLink('collection'));
    assert.false(e.hasLink({ rel: 'self', type: 'application/pdf' }));
});

test('can check link for entity without any link', assert => {
    const e = siren.entity({});

    assert.false(e.hasLink('self'));
    assert.false(e.hasLink({ rel: ['self'] }));
});

test('can get link by rel', assert => {
    const e = siren.entity(entity);

    const link = e.link('self');

    assert.deepEqual(link, {
        'rel': ['self'],
        'href': 'http://localhost/json',
        'type': 'application/json'
    });

    assert.true(siren.isLink(link));
});

test('can get first link when multiple links', assert => {
    const e = siren.entity(entity);

    const link = e.link('alternate');

    assert.deepEqual(link, {
        'rel': ['alternate'],
        'href': 'http://localhost/image',
        'type': 'image/png'
    });
});

test('can get link by multiple criteria', assert => {
    const e = siren.entity(entity);

    const link = e.link({ rel: ['self'], type: 'application/json' });

    assert.deepEqual(link, {
        'rel': ['self'],
        'href': 'http://localhost/json',
        'type': 'application/json'
    });
});

test('can get link by criteria without rel', assert => {
    const e = siren.entity(entity);

    const link = e.link({ type: 'application/pdf' });

    assert.deepEqual(link, {
        'rel': ['alternate'],
        'href': 'http://localhost/pdf',
        'type': 'application/pdf'
    });
});

test('can get no link when no link provided in the entity', assert => {
    const e = siren.entity({});

    const link = e.link("self");

    assert.deepEqual(link, {});
});

test('can get all links when multiple links with one rel', assert => {
    const e = siren.entity(entity);

    const links = e.links('alternate');

    assert.deepEqual(links, [
        {
            'rel': ['alternate'],
            'href': 'http://localhost/image',
            'type': 'image/png'
        },
        {
            'rel': ['alternate'],
            'href': 'http://localhost/pdf',
            'type': 'application/pdf'
        }
    ]);
});

test('can get all links when multiple links with an array of rel', assert => {
    const e = siren.entity(entity);

    const links = e.links(['alternate']);

    assert.deepEqual(links, [
        {
            'rel': ['alternate'],
            'href': 'http://localhost/image',
            'type': 'image/png'
        },
        {
            'rel': ['alternate'],
            'href': 'http://localhost/pdf',
            'type': 'application/pdf'
        }
    ]);
});

test('can get links by multiple criteria', assert => {
    const e = siren.entity(entity);

    const links = e.links({ rel: ['self'], type: 'application/json' });

    assert.deepEqual(links, [
        {
            'rel': ['self'],
            'href': 'http://localhost/json',
            'type': 'application/json'
        }
    ]);
});

test('can get no links', assert => {
    const e = siren.entity(entity);

    const links = e.links("collection");

    assert.deepEqual(links, []);
});

test('can get no links when no link provided in the entity', assert => {
    const e = siren.entity({});

    const links = e.links("self");

    assert.deepEqual(links, []);
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For sub-entities, siren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'class': ['myclass'],
                    'title': 'my sub entity',
                    'rel': ['alternate'],
                    'href': 'http://localhost'
                },
                {
                    'rel': ['item'],
                    'href': 'http://localhost'
                },
                {
                    'rel': ['collection', 'search'],
                    'href': 'http://localhost'
                }
            ]
        };
    }
});

test('can check sub entity by rel does not exist', assert => {
    const e = siren.entity({});

    assert.false(e.hasEntity("alternate"));
});

test('can check sub entity by rel', assert => {
    const e = siren.entity(entity);

    assert.true(e.hasEntity("alternate"));
    assert.true(e.hasEntity(["alternate"]));
    assert.true(e.hasEntity("item"));
    assert.true(e.hasEntity(["search", "collection"]));
    assert.false(e.hasEntity("collection"));
});

test('can check sub entity by rel after getting one entity', assert => {
    const e = siren.entity(entity);

    e.entity("alternate");

    assert.true(e.hasEntity("alternate"));
    assert.true(e.hasEntity("item"));
    assert.false(e.hasEntity("collection"));
});

test('can get sub entity by rel', assert => {
    const e = siren.entity(entity);

    const subEntity = e.entity("alternate");

    assert.equal(subEntity.title, 'my sub entity');
    assert.true(subEntity.hasClass('myclass'));
    assert.true(siren.isEntity(subEntity));
    assert.true(siren.isSubEntity(subEntity));
    assert.true(siren.isSubEntityEmbeddedLink(subEntity));
});

test('can get sub entities by one rel', assert => {
    const e = siren.entity(entity);

    const subEntities = e.entities("alternate");

    assert.equal(subEntities.length, 1);
    assert.equal(subEntities[0].title, 'my sub entity');
});

test('can get sub entities by an array of rel', assert => {
    const e = siren.entity(entity);

    const subEntities = e.entities(["search", "collection"]);

    assert.equal(subEntities.length, 1);
    assert.deepEqual(subEntities[0].rel, ["collection", "search"]);
});

test('cannot get sub entity when it does not exist', assert => {
    const e = siren.entity({});

    const subEntity = e.entity("alternate");

    assert.false(siren.isSubEntityEmbeddedLink(subEntity));
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For creating request, siren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'rel': ['item'],
                    'links': [
                        {
                            'rel': ['self'],
                            'href': 'http://localhost/itementity'
                        }
                    ]
                },
                {
                    'rel': ['alternate'],
                    'href': 'http://localhost/subentity'
                }
            ],
            'links': [
                {
                    'rel': ['self'],
                    'href': 'http://localhost/self'
                },
                {
                    'rel': ['alternate'],
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
    const e = siren.entity(entity);

    const r = siren.request(e);

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/self');
    assert.equal(r.headers.get('Accept'), 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
});

test('can get request with rel', assert => {
    const e = siren.entity(entity);

    const r = siren.request(e.link('alternate'));

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/alternate');
});

test('can get request with specific content-type', assert => {
    const e = siren.entity(entity);

    const r = siren.request(e.link('alternate'));

    assert.equal(r.headers.get('Accept'), 'image/png');
});

test('cannot get request when self link not available', assert => {
    const e = siren.entity({});

    assert.throws(() => {
        siren.request(e);
    })
});

test('can get request for entity with self link', assert => {
    const e = siren.entity(entity);

    const r = siren.request(e.entity('item'));

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/itementity');
    assert.equal(r.headers.get('Accept'), 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
});

test('can get request for sub entity embedded link', assert => {
    const e = siren.entity(entity);

    const r = siren.request(e.entity('alternate'));

    assert.equal(r.method, 'GET');
    assert.equal(r.url, 'http://localhost/subentity');
    assert.equal(r.headers.get('Accept'), 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For post construct, siren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'rel': ['item'],
                    'href': './subentity',
                    'links': [
                        {
                            'rel': ['self'],
                            'href': './subentity/self'
                        }
                    ]
                }
            ],
            'links': [
                {
                    'rel': ['self'],
                    'href': './self'
                }
            ]
        };
    }
});

function postConstruct(e) {
    siren.visitLinks(e, link => {
        link.href = new URL(link.href, 'http://localhost');
    });
}

test('can create absolute URL for link with post construct function', assert => {
    const e = siren.entity(entity, postConstruct);

    const l = e.link('self');
    assert.equal(l.href, 'http://localhost/self');
});

test('can create absolute URL for sub-entity with post construct function', assert => {
    const e = siren.entity(entity, postConstruct);

    const subEntity = e.entity('item');
    assert.equal(subEntity.href, 'http://localhost/subentity');
});

test('can create absolute URL for sub-entity link with post construct function', assert => {
    const e = siren.entity(entity, postConstruct);

    const l = e.entity('item').link('self');
    assert.equal(l.href, 'http://localhost/subentity/self');
});

test('can create absolute URL by visiting link', assert => {
    const e = siren.entity(entity);

    siren.visitLinks(e.entity('item').link('self'), link => {
        link.href = new URL(link.href, 'http://localhost');
    });

    const l = e.entity('item').link('self');
    assert.equal(l.href, 'http://localhost/subentity/self');
});

test('can create absolute URL for sub-entity by recursively visiting links', assert => {
    const e = siren.entity(entity);

    siren.visitLinks(e, link => {
        link.href = new URL(link.href, 'http://localhost');
    }, true);

    const subEntity = e.entity('item');
    assert.equal(subEntity.href, 'http://localhost/subentity');
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For JSON, siren', {
    beforeEach: function () {
        entity = {
            'entities': [
                {
                    'rel': ['item'],
                    'href': './subentity',
                    'links': [
                        {
                            'rel': ['self'],
                            'href': './subentity/self'
                        }
                    ]
                }
            ],
            'links': [
                {
                    'rel': ['self'],
                    'href': './self'
                }
            ]
        };
    }
});

test('can convert to JSON', assert => {
    const e = siren.entity(entity);

    const json = JSON.stringify(e);

    assert.deepEqual(JSON.parse(json), entity);
});

///////////////////////////////////////////////////////////////////////

QUnit.module('For different entities, siren', {});

test('can check equality', assert => {
    const e = siren.entity({
        'links': [
            {
                'rel': ['self'],
                'href': './self'
            }
        ]
    });

    assert.false(siren.equal(null, null));
    assert.false(siren.equal(null, e));
    assert.false(siren.equal(e, null));
    assert.false(siren.equal(e, siren.entity({})));
});

test('can check equality for entities with same self link', assert => {
    const result = siren.equal(
        siren.entity({
            'links': [
                {
                    'rel': ['self'],
                    'href': './self'
                }
            ]
        }),
        siren.entity({
            'links': [
                {
                    'rel': ['self'],
                    'href': './self'
                }
            ]
        })
    );

    assert.true(result);
});

test('can check equality for entities with no self link', assert => {
    const result = siren.equal(
        siren.entity({
        }),
        siren.entity({
        })
    );

    assert.false(result);
});

test('can check equality for sub entities with same href link', assert => {
    const result = siren.equal(
        siren.entity({
            'rel': 'item',
            'href': './self'
        }),
        siren.entity({
            'rel': 'item',
            'href': './self'
        })
    );

    assert.true(result);
});


test('can check equality for entity and sub entity', assert => {
    const result = siren.equal(
        siren.entity({
            'rel': 'item',
            'href': './self'
        }),
        siren.entity({
            'links': [
                {
                    'rel': ['self'],
                    'href': './self'
                }
            ]
        })
    );

    assert.true(result);
});
