import fastify from "fastify";
import next from "next";
import { parse } from "url";

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
