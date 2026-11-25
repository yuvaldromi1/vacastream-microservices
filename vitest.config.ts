import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@yd/restify": path.resolve(__dirname, "Libraries/@YD/restify/src/index.ts"),
            "@yd/jwt": path.resolve(__dirname, "Libraries/@YD/jwt/src/index.ts"),
        },
    },
    test: {
        include: ["tests/**/*.test.ts"],
        environment: "node",
    },
});
