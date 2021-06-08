export default siren;
declare namespace siren {
    function isEntity(o: any): boolean;
    function entity(o: any, basePath: any): any;
    function isLink(l: any): boolean;
    function isSubEntity(o: any): boolean;
    function isSubEntityEmbeddedLink(o: any): boolean;
    function request(o: any): Request;
}
