/// <reference lib="webworker" />

import { Serwist, type PrecacheEntry, NetworkFirst, StaleWhileRevalidate } from "serwist";
import { defaultCache } from "@serwist/next/worker";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    ...defaultCache,
    {
      matcher: ({ request }) => request.destination === "style" || request.destination === "script" || request.destination === "image",
      handler: new StaleWhileRevalidate({ cacheName: "assets" }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api"),
      handler: new NetworkFirst({ cacheName: "api-network-first", networkTimeoutSeconds: 5 }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(Promise.resolve());
  }
});
