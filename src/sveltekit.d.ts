declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            validation?: import("./types.ts").ValidationResults;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
