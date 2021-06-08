const entitySymbol = Symbol();
const subEntitiesSymbol = Symbol();

class SirenError extends Error {
    constructor(msg) {
        super(msg);
    }
}

function areEqual(a, b) {
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.length === b.length && a.every(e => b.includes(e));
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

    get properties() {
        return this[entitySymbol].properties || {};
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
            return links.filter(l => areEqual(param, l.rel));
        }
        return links.filter(l => {
            for (const p in param) {
                if (!areEqual(l[p], param[p])) {
                    return false;
                }
            }
            return true;
        });
    }

    hasLink(param) {
        return siren.isLink(this.link(param));
    }

    link(param) {
        if (typeof param === 'string') {
            param = [param];
        }
        if (Array.isArray(param)) {
            for (const l of this.links()) {
                if (areEqual(param, l.rel, )) {
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
            this[subEntitiesSymbol] = this[entitySymbol].entities.map(e => siren.entity(e));
            delete this[entitySymbol].entities;
        }
        if (!rel) {
            return this[subEntitiesSymbol] || [];
        }
        if (typeof rel === 'string') {
            rel = [rel];
        }
        return this.entities().filter(e => areEqual(e.rel, rel));
    }

    entity(rel) {
        if (typeof rel === 'string') {
            rel = [rel];
        }
        for (const e of this.entities()) {
            if (areEqual(e.rel, rel)) {
                return e;
            }
        }
        return emptyEntity;
    }
}

const emptyEntity = Object.freeze(new EntityWrapper({}));
const emptyLink = Object.freeze({});

const siren = {
    isEntity: function (o) {
        return o instanceof EntityWrapper;
    },
    entity: function (o) {
        if (!o) {
            return emptyEntity;
        }
        if (siren.isEntity(o)) {
            return o;
        }
        return new EntityWrapper(o);
    },
    isLink: function (l) {
        return !!(l && l.href && l.rel);
    },
    isSubEntity: function (o) {
        return !!(siren.isEntity(o) && o.rel);
    },
    isSubEntityEmbeddedLink: function (o) {
        return !!(siren.isEntity(o) && siren.isLink(o));
    },
    request: function (o) {
        let link;
        if (siren.isLink(o)) {
            link = o;
        } else if (siren.isEntity(o)) {
            link = o.link('self');
        }
        if (!siren.isLink(link)) {
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
}

export default siren;