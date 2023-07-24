import fastify, { FastifyRequest } from "fastify";
import next from "next";
import { parse } from "url";
import metricsPlugin from "fastify-metrics";

const port = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV !== "production";
const app = next({ dev: isDev, hostname: "localhost", port });
const handle = app.getRequestHandler();
const server = fastify({
  logger: {
    level: isDev ? "debug" : "info",
  },
});

app.prepare().then(async () => {
  // Setup prometheus metrics plugin
  await server.register(metricsPlugin, {
    endpoint: "/api/metrics",
    defaultMetrics: {
      enabled: true,
      labels: {
        name: "next-prometheus-example",
        version: "0.1.0",
      },
    },
    routeMetrics: {
      groupStatusCodes: true,
      routeBlacklist: ["/api/metrics"],
      customLabels: {
        name: "next-prometheus-example",
        version: "0.1.0",
      },
      overrides: {
        labels: {
          // This is a custom label for the route name. It will try to use pathname or urls if not provided.
          getRouteLabel: (request: FastifyRequest) => {
            if (request.routeConfig.statsId) {
              return request.routeConfig.statsId;
            }
            const parsedUrl = parse(request.url, true);
            return parsedUrl.pathname ?? request.url;
          },
        },
      },
    },
  });

  server.all("*", async (request, response) => {
    return handle(request.raw, response.raw, parse(request.url, true));
  });
  server
    .listen({
      port,
      host: "0.0.0.0",
    })
    .then(() => {
      console.log("server started");
    });
});
