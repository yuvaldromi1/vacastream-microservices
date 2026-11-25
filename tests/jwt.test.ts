import { describe, it, expect, vi, beforeEach } from "vitest";
import { createToken, verifyToken, jwtMiddleware } from "@yd/jwt";
import { UnauthorizedError } from "@yd/restify";

const payload = { userId: 7, role: "admin" as const, firstName: "Admin", lastName: "Demo" };

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
});

describe("createToken / verifyToken", () => {
    it("round-trips the payload", () => {
        const decoded = verifyToken(createToken(payload));
        expect(decoded).toMatchObject(payload);
    });

    it("rejects a token signed with another secret", () => {
        const token = createToken(payload);
        process.env.JWT_SECRET = "another-secret";
        expect(() => verifyToken(token)).toThrow();
    });

    it("throws a clear error when JWT_SECRET is missing", () => {
        delete process.env.JWT_SECRET;
        expect(() => createToken(payload)).toThrow("JWT_SECRET");
    });
});

describe("jwtMiddleware", () => {
    function request(authorization?: string): any {
        return { header: (name: string) => (name === "authorization" ? authorization : undefined) };
    }

    it("attaches the user to the request for a valid token", () => {
        const req = request("Bearer " + createToken(payload));
        const next = vi.fn();
        jwtMiddleware(req, {} as any, next);
        expect(next).toHaveBeenCalledWith();
        expect(req.user).toMatchObject(payload);
    });

    it("rejects a request without a token", () => {
        const next = vi.fn();
        jwtMiddleware(request(), {} as any, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
    });

    it("rejects an invalid token", () => {
        const next = vi.fn();
        jwtMiddleware(request("Bearer not-a-real-token"), {} as any, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
    });
});
