import { setup } from "./setup.js";
import { error } from "../utils/index.js";

try {
    await setup(process.cwd());
} catch (e) {
    error("failed to setup kitva", e);
}
