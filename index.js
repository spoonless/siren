const sirenSymbol = Symbol();

class SirenError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function createRequest(link, init) {
    let internalInit = init;
    if (link.type) {
        internalInit = Object.create(internalInit);
        internalInit.headers = new Headers(init.headers || []);
        internalInit.headers.append('Accept', link.type);
    }
    return new Request(link.href, internalInit);
}

// TODO Check if headers are merged correctly or not.
async function executeRequest(entity, method, init) {
    let link = entity.link('self');
    if (!$iren.isLink(link) && $iren.isSubEntityEmbeddedLink(entity)) {
        link = entity;
    } else {
        throw new SirenError("Unable to load because it is not a sub entity and no self link found");
    }
    const request = createRequest(link, init);
    const options = { method: method };
    if (method === 'PUT') {
        options.body = JSON.stringify(entity.properties);
        options.headers = {
            'Content-type': 'application/json'
        }
    }
    const response = await fetch(request, options);
    if (!response.ok) {
        throw new SirenError(`Cannot load entity from ${request.url}. Status code is ${response.status}`);
    }
    const contentType = response.headers.get('Content-type');
    if (contentType === 'application/json' || contentType === 'application/vnd.siren+json') {
        const json = await response.json();
        Object.keys(entity.properties).filter(k => !json.hasOwnProperty(k)).forEach(k => delete entity.properties[k]);
        Object.assign(entity.properties, json.properties);
        entity.properties[sirenSymbol] = new EntityWrapper(json);
        entity.properties[sirenSymbol].rel = entity.rel;
        entity.properties[sirenSymbol].href = entity.href;
        json.properties = entity.properties;
    } else if (method === 'GET') {
        throw new SirenError(`Cannot load because of unexpected content-type ${application / json}`);
    }
    return entity.properties;
}

class EntityWrapper {
    constructor(e) {
        this[sirenSymbol] = e;
    }

    hasClass(c) {
        return this.class.includes(c);
    }

    get class() {
        return this[sirenSymbol].class || [];
    }

    get title() {
        return this[sirenSymbol].title || '';
    }

    links(param) {
        const links = this[sirenSymbol].links || [];
        if (!param) {
            return links;
        }
        if (typeof param === 'string') {
            return links.filter(l => l.rel === param);
        }
        return links.filter(l => {
            for (const p in param) {
                if (param[p] !== l[p]) {
                    return false;
                }
            }
            return true;
        });
    }

    hasLink(param) {
        return $iren.isLink(this.link(param));
    }

    link(param) {
        if (typeof param === 'string') {
            for (const l of this.links()) {
                if (l.rel === param) {
                    return l;
                }
            }
        } else {
            for (const l of this.links()) {
                let found = true;
                for (const p in param) {
                    if (param[p] !== l[p]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    return l;
                }
            }
        }
        return emptyLink;
    }

    request(param, init = {}) {
        const link = this.link(param);
        if (!link.href) {
            throw new SirenError(`No href found for link ${param}`);
        }
        return createRequest(link, init);
    }

    requests(param, init) {
        return this.links(param).map(l => createRequest(l, init));
    }

    async reload(init) {
        return await executeRequest(this, 'GET', init);
    }

    async put(init) {
        return await executeRequest(this, 'PUT', init);
    }
}

const emptyEntity = Object.freeze(new EntityWrapper({}));
const emptyLink = Object.freeze({});

function $iren(o) {
    if (!o || !o[sirenSymbol]) {
        return emptyEntity;
    }
    return o[sirenSymbol];
}

$iren.unwrap = function (o) {
    if (!o) {
        return o;
    }
    if (o[sirenSymbol]) {
        return o;
    }
    if (!o.properties) {
        o.properties = {};
    }
    const e = o.properties;
    e[sirenSymbol] = new EntityWrapper(o);
    Reflect.defineProperty(e, '$iren', {
        get: function () {
            return this[sirenSymbol];
        }
    });
    return e;
}

$iren.isEntity = function (o) {
    return !!(o && o[sirenSymbol]);
}

$iren.isLink = function (l) {
    return !!(l && l.href && l.rel);
}

$iren.isSubEntity = function (o) {
    return !!($iren.isEntity(o) && o[sirenSymbol].rel);
}

$iren.isSubEntityEmbeddedLink = function (o) {
    return !!($iren.isEntity(o) && $iren.isLink(o));
}

export default $iren;

/*
* TODO
* create an entity from a JS class or another objet
* manage subentities
* delete an entity?
*/