export const LIB_NAME = "Kitva";
export const LIB_NAME_LC = LIB_NAME.toLowerCase();

export const HTTP_METHODS = ["GET", "POST", "DELETE", "PUT", "PATCH"] as const;
export const HTTP_PARTS = ["body", "headers", "queries", "params"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];
export type HttpPart = (typeof HTTP_PARTS)[number];
//
