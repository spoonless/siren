const entitySymbol = Symbol();
const subEntitiesSymbol = Symbol();
const postConstructSymbol = Symbol();

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

class SirenEntity {
    constructor(e, postConstructFn) {
        this[entitySymbol] = e;
        if (typeof postConstructFn === 'function') {
            this[postConstructSymbol] = postConstructFn;
            postConstructFn(this);
        }
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
        if (this[entitySymbol].properties === null || this[entitySymbol].properties === undefined) {
            this[entitySymbol].properties = {};
        }
        return this[entitySymbol].properties;
    }

    /**
     * For entity and embedded sub entity, returns the href from self link (if existing).
     * For sub entity, returns the href attribute.
     */
    get href() {
        if (!this[entitySymbol].href) {
            return this.link('self').href
        }
        return this[entitySymbol].href;
    }

    get rel() {
        return this[entitySymbol].rel;
    }

    property(name, defaultValue) {
        const value = this.properties[name];
        if (value === null || value === undefined) {
            return defaultValue;
        }
        return value;
    }

    setProperty(name, value) {
        this[entitySymbol].properties[name] = value;
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
                if (areEqual(param, l.rel)) {
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

    setLink(link) {
        if (this[entitySymbol].links === null || this[entitySymbol].links === undefined) {
            this[entitySymbol].links = [];
        }
        const links = this[entitySymbol].links;
        for (let i = 0; i < links.length; ++i) {
            if (areEqual(links[i].rel, link.rel)) {
                links[i] = link;
                return;
            }
        }
        this[entitySymbol].links.push(link)
    }

    setLinkHref(rel, href) {
        if (this[entitySymbol].links === null || this[entitySymbol].links === undefined) {
            this[entitySymbol].links = [];
        }
        if (!Array.isArray(rel)) {
            rel = [rel];
        }
        for (const link of this[entitySymbol].links) {
            if (areEqual(link.rel, rel)) {
                link.href = href;
                return;
            }
        }
        this[entitySymbol].links.push({
            "rel": rel,
            "href": href
        })
    }

    addLink(link) {
        if (this[entitySymbol].links === null || this[entitySymbol].links === undefined) {
            this[entitySymbol].links = [];
        }
        this[entitySymbol].links.push(link)
    }

    hasEntity(rel, className) {
        if (this[entitySymbol].entities) {
            if (typeof rel === 'string') {
                rel = [rel];
            }
            if (typeof className === 'string') {
                className = [className];
            }    
            for (const e of this[entitySymbol].entities) {
                if (areEqual(e.rel, rel)) {
                    if (className) {
                        if (areEqual(e.class, className)) {
                            return true;
                        }
                    } else {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    entities(rel, className) {
        if (!this[subEntitiesSymbol] && this[entitySymbol].entities) {
            this[subEntitiesSymbol] = this[entitySymbol].entities.map(e => siren.entity(e, this[postConstructSymbol]));
        }
        if (!rel) {
            return this[subEntitiesSymbol] || [];
        }
        if (typeof rel === 'string') {
            rel = [rel];
        }
        if (typeof className === 'string') {
            className = [className];
        }
        if (!className) {
            return this.entities().filter(e => areEqual(e.rel, rel));
        }
        return this.entities().filter(e => areEqual(e.rel, rel)).filter(e => areEqual(e.class, className));
    }

    entity(rel, className) {
        if (typeof rel === 'string') {
            rel = [rel];
        }
        if (typeof className === 'string') {
            className = [className];
        }
        for (const e of this.entities()) {
            if (areEqual(e.rel, rel)) {
                if (className) {
                    if (areEqual(e.class, className)) {
                        return e;
                    }
                } else {
                    return e;
                }
            }
        }
        return emptyEntity;
    }

    toJSON() {
        return this[entitySymbol];
    }
}

const emptyEntity = Object.freeze(new SirenEntity({}));
const emptyLink = Object.freeze({});

/**
 * The siren namespace
 */
const siren = {}

/**
 * Mime-type for Siren document
 */
siren.mimeType = 'application/vnd.siren+json';

/**
 * Returns a siren entity repesenting the object.
 *
 * The returned object has methods to explore the entity.
 * If the object in parameter is already a siren entity,
 * this function has no effect and returns the object itself.
 * If the reference in parameter is null or undefined, this
 * function returns an empty entity (no properties, no link, no embedded entity)
 * @param {Object} o The object for which to create a siren entity
 * @param {Function} postConstructFn A post construct function
 * called after the entity creation (and each embedded entity creation)
 * @returns {SirenEntity} the siren entity
 */
siren.entity = function (o, postConstructFn) {
    if (!o) {
        return emptyEntity;
    }
    if (siren.isEntity(o)) {
        return o;
    }
    return new SirenEntity(o, postConstructFn);
};

/**
 * @param {Object} o The object to check
 * @returns {boolean} true if the object is siren entity
 */
siren.isEntity = function (o) {
    return o instanceof SirenEntity;
};

/**
 * @param {Object} l The link to check
 * @returns {boolean} true if the object is a link (has href and rel attributes).
 * An embedded link entity is a link.
 */

siren.isLink = function (l) {
    return !!(l && l.href && l.rel);
};

/**
 * @param {Object} o The object to check
 * @returns {boolean} true if the object is siren sub entity (has a rel attribute).
 */
siren.isSubEntity = function (o) {
    return !!(siren.isEntity(o) && o.rel);
};

/**
 * @param {Object} o The object to check
 * @returns {boolean} true if the object is siren sub entity embedded link (has rel and href attributes).
 */
siren.isSubEntityEmbeddedLink = function (o) {
    return !!(siren.isEntity(o) && siren.isLink(o));
};

/**
 * @param {Object} o A link, a siren entity or a siren sub entity embedded link
 * @returns {Request} A request object that can be passed to the fetch function.
 */
siren.request = function (o) {
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
        headers.set('Accept', `${siren.mimeType},application/json;q=0.9,*/*;q=0.8`);
    }
    return new Request(link.href, { method: 'GET', headers: headers });
};

/**
 * Allows to visit each link (and sub entity embedded link).
 *
 * You have the opportunity to update the links (for instance, update href to create an absolute URL).
 *
 * @param {Object} e A link, a siren entity or a siren sub entity
 * @param {Function} visitorFn The visitor function which will receive the link or entity as parameter
 * @param {boolean} includeSubEntities true if the visit should be recursive and includes the sub entities.
 */
siren.visitLinks = function (e, visitorFn, includeSubEntities = false) {
    if (siren.isEntity(e)) {
        if (typeof e[entitySymbol].href === 'string') {
            visitorFn(e[entitySymbol]);
        }
        for (const l of e.links()) {
            if (siren.isLink(l)) {
                visitorFn(l);
            }
        }
        if (includeSubEntities) {
            for (const sube of e.entities()) {
                siren.visitLinks(sube, visitorFn);
            }
        }
    }
    else if (siren.isLink(e)) {
        visitorFn(e);
    }
};

/**
 * Compares href URI to check if two entities/links are equal.
 *
 * For entities, self link is used to extract the reference URI.
 * For sub embedded entities and links, the href attribute is used to extract reference URI.
 *
 * @param {Object} e1 An entity or link
 * @param {Object} e2 An entity or link
 * @returns {boolean} true if these entities/links have the same URI
 */
siren.same = function (e1, e2) {
    if (!e1 || !e2) {
        return false;
    }
    const href1 = e1.href;
    const href2 = e2.href;
    return !!href1 && href1 === href2;
}

export default siren;