import nodePath from "node:path";
import { path } from "../lib/index.js";

console.log( nodePath.resolve("./") );
console.log( import.meta.url );
console.log( "----------" );
console.log( path.dirname(import.meta.url) );