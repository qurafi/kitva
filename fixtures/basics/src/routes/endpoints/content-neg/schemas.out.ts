// Code generated by Kitva, DO NOT EDIT 

import type { RewriteHandlers } from "kitva/generated"
import type { RequestHandler } from "./$types.js";

export interface GET_queries {
a: string
b: boolean
}


export interface Schemas {
	GET: {
		queries: GET_queries
	}
}

type RequestHandlers = RewriteHandlers<Schemas, RequestHandler>;

export type GETHandler = RequestHandlers["GET"];