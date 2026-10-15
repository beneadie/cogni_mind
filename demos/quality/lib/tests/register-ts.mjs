// PURPOSE: Lets node:test load the Quality lib's extensionless TypeScript imports ("../contracts") without a bundler.
// ROLE: test (loader hook). USED BY: the TESTS command in docs/quality/STATUS.md (--import).
// tsconfig does not allow ".ts" in import paths, and Node's type stripping needs them, so this retries with ".ts".

import { registerHooks } from "node:module";

/** Resolve hook: on a missing relative module, try the same path with ".ts". */
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error?.code !== "ERR_MODULE_NOT_FOUND" || !/^\.{1,2}\//.test(specifier)) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});
