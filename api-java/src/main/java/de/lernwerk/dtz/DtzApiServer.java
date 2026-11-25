package de.lernwerk.dtz;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Small JDK-only API shell for local integration tests. Production deployment
 * must add authentication, persistence, rate limiting, CORS allow-listing and TLS.
 */
public final class DtzApiServer {
    private DtzApiServer() {}

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/health", exchange -> respond(exchange, 200, "{\"status\":\"UP\"}"));
        server.createContext("/api/v1/app-config", exchange -> respond(exchange, 200,
                "{\"levels\":[\"A1\",\"A2\",\"B1\"],\"defaultLanguage\":\"tr\",\"guestMode\":true,\"offlineFirst\":true}"));
        server.createContext("/", exchange -> respond(exchange, 404, "{\"error\":\"Not found\"}"));
        server.start();
        System.out.println("LernWerk API demo listening on http://127.0.0.1:" + port);
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            body = "{\"error\":\"Method not allowed\"}";
            status = 405;
        }
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.sendResponseHeaders(status, bytes.length);
        try (var output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }
}
