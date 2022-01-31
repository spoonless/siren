export default siren;
declare namespace siren {
    const mimeType: string;
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
    function entity(o: any, postConstructFn: Function): SirenEntity;
    /**
     * @param {Object} o The object to check
     * @returns {boolean} true if the object is siren entity
     */
    function isEntity(o: any): boolean;
    /**
     * @param {Object} l The link to check
     * @returns {boolean} true if the object is a link (has href and rel attributes).
     * An embedded link entity is a link.
     */
    function isLink(l: any): boolean;
    /**
     * @param {Object} o The object to check
     * @returns {boolean} true if the object is siren sub entity (has a rel attribute).
     */
    function isSubEntity(o: any): boolean;
    /**
     * @param {Object} o The object to check
     * @returns {boolean} true if the object is siren sub entity embedded link (has rel and href attributes).
     */
    function isSubEntityEmbeddedLink(o: any): boolean;
    /**
     * @param {Object} o A link, a siren entity or a siren sub entity embedded link
     * @returns {Request} A request object that can be passed to the fetch function.
     */
    function request(o: any): Request;
    /**
     * Allows to visit each link (and sub entity embedded link).
     *
     * You have the opportunity to update the links (for instance, update href to create an absolute URL).
     *
     * @param {Object} e A link, a siren entity or a siren sub entity
     * @param {Function} visitorFn The visitor function which will receive the link or entity as parameter
     * @param {boolean} includeSubEntities true if the visit should be recursive and includes the sub entities.
     */
    function visitLinks(e: any, visitorFn: Function, includeSubEntities?: boolean): void;
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
    function same(e1: any, e2: any): boolean;
}
declare class SirenEntity {
    constructor(e: any, postConstructFn: any);
    hasClass(c: any): any;
    get class(): any;
    get title(): any;
    get properties(): any;
    /**
     * For entity and embedded sub entity, returns the href from self link (if existing).
     * For sub entity, returns the href attribute.
     */
    get href(): any;
    get rel(): any;
    property(name: any, defaultValue: any): any;
    setProperty(name: any, value: any): void;
    links(param: any): any;
    hasLink(param: any): boolean;
    link(param: any): any;
    setLink(link: any): void;
    setLinkHref(rel: any, href: any): void;
    addLink(link: any): void;
    hasEntity(rel: any): boolean;
    entities(rel: any): any;
    entity(rel: any): any;
    toJSON(): any;
    [entitySymbol]: any;
    [postConstructSymbol]: any;
    [subEntitiesSymbol]: any;
}
declare const entitySymbol: unique symbol;
declare const postConstructSymbol: unique symbol;
declare const subEntitiesSymbol: unique symbol;
