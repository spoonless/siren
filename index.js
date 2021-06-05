const sirenSymbol = Symbol();
const entitySymbol = Symbol();
const subEntitiesSymbol = Symbol();
const factoryRegitry = Symbol();

class SirenError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function areEqual(a, b) {
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.every(e => b.includes(e));
    } else {
        return a === b;
    }
}

class EntityWrapper {
    constructor(e) {
        this[entitySymbol] = e;
    }

    hasClass(c) {
        if (this[entitySymbol].class) {
            return this[entitySymbol].class.includes(c);
        }
        return false;
    }

    get class() {
        return this[entitySymbol].class || [];
    }

    get title() {
        return this[entitySymbol].title || '';
    }

    get href() {
        return this[entitySymbol].href;
    }

    get rel() {
        return this[entitySymbol].rel;
    }

    links(param) {
        const links = this[entitySymbol].links || [];
        if (!param) {
            return links;
        }
        if (typeof param === 'string') {
            param = [param];
        }
        if (Array.isArray(param)) {
            return links.filter(l => areEqual(l.rel, param));
        }
        return links.filter(l => {
            for (const p in param) {
                if (!areEqual(param[p], l[p])) {
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
            param = [param];
        }
        if (Array.isArray(param)) {
            for (const l of this.links()) {
                if (areEqual(l.rel, param)) {
                    return l;
                }
            }
        } else {
            for (const l of this.links()) {
                let found = true;
                for (const p in param) {
                    if (!areEqual(param[p], l[p])) {
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

    hasEntity(rel) {
        if (this[entitySymbol].entities) {
            if (typeof rel === 'string') {
                rel = [rel];
            }
            for (const e of this[entitySymbol].entities) {
                if (areEqual(e.rel, rel)) {
                    return true;
                }
            }
            return false;
        }
        return this.entity(rel) !== emptyEntity;
    }

    entities(rel) {
        if (this[entitySymbol].entities) {
            this[subEntitiesSymbol] = this[entitySymbol].entities.map(e => $iren.unwrap(e));
            delete this[entitySymbol].entities;
        }
        if (!rel) {
            return this[subEntitiesSymbol] || [];
        }
        if (typeof rel === 'string') {
            rel = [rel];
        }
        return this.entities().filter(e => areEqual($iren(e).rel, rel));
    }

    entity(rel) {
        if (typeof rel === 'string') {
            rel = [rel];
        }
        for (const e of this.entities()) {
            if (areEqual($iren(e).rel, rel)) {
                return e;
            }
        }
        return emptyEntity;
    }
}

const emptyEntity = Object.freeze(new EntityWrapper({}));
const emptyLink = Object.freeze({});

function $iren(o) {
    if (!o) {
        return emptyEntity;
    }
    if (o[entitySymbol]) {
        return o;
    }
    if (!o[sirenSymbol]) {
        return emptyEntity;
    }
    return o[sirenSymbol];
}

$iren.unwrap = function (o, factoryCallback) {
    if (!o) {
        return o;
    }
    if (o[sirenSymbol]) {
        return o;
    }
    if (o[entitySymbol]) {
        return o[entitySymbol].properties;
    }
    if (!o.properties) {
        o.properties = {};
    }
    let e;
    if (factoryCallback) {
        e = factoryCallback(o.properties);
    } else {
        const factoryCallback = $iren.findFactory(o.class);
        e = factoryCallback ? factoryCallback(o.properties) : o.properties;
    }
    e[sirenSymbol] = new EntityWrapper(o);
    return e;
}

$iren.isEntity = function (o) {
    return !!(o && o[sirenSymbol]);
}

$iren.isLink = function (l) {
    return !!(l && l.href && l.rel);
}

$iren.isSubEntity = function (o) {
    return !!(this.isEntity(o) && this(o).rel);
}

$iren.isSubEntityEmbeddedLink = function (o) {
    return !!(this.isEntity(o) && this.isLink($iren(o)));
}

$iren.registerFactory = function (className, factoryCallback) {
    if (!this[factoryRegitry]) {
        this[factoryRegitry] = new Map();
    }
    this[factoryRegitry].set(className, factoryCallback);
}

$iren.findFactory = function (classNames) {
    const factoryRegistry = this[factoryRegitry];
    if (factoryRegistry) {
        for (const className of classNames) {
            const factory = factoryRegistry.get(className);
            if (factory) {
                return factory;
            }
        }
    }
    return null;
}

$iren.request = function (o) {
    let link;
    if ($iren.isLink(o)) {
        link = o;
    } else if ($iren.isLink($iren(o))) {
        link = $iren(o)
    } else {
        link = $iren(o).link('self');
    }
    if (!$iren.isLink(link)) {
        throw new SirenError('No link information found to create request for this entity');
    }
    const headers = new Headers();
    if (link.type) {
        headers.set('Accept', link.type);
    } else {
        headers.set('Accept', 'application/vnd.siren+json,application/json;q=0.9,*/*;q=0.8');
    }
    return new Request(link.href, { method: 'GET', headers: headers });
}

export default $iren;
