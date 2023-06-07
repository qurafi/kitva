/// <reference types="ajv-build-tools/types" />

declare module "rfdc/default" {
    declare const clone: ReturnType<typeof import("rfdc")>;
    export default clone;
}
