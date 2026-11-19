import { handleContact } from "./contact.js";

export default {
  /**
   * @param {Request} request
   * @param {Record<string, any>} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") {
      return handleContact(request, env, {
        fetch: globalThis.fetch.bind(globalThis),
        log: console,
      });
    }
    return env.ASSETS.fetch(request);
  },
};
