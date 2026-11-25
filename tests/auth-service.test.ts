import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { ConflictError, UnauthorizedError, ValidationError } from "@yd/restify";
import { verifyToken } from "@yd/jwt";

const execute = vi.fn();
vi.mock("../Backend/Auth/src/utils/dal", () => ({ dal: { execute: (...args: unknown[]) => execute(...args) } }));

const { authService } = await import("../Backend/Auth/src/services/auth.service");

const validUser = { firstName: "Dana", lastName: "Levi", email: "dana@demo.com", password: "User1234!" };

beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    execute.mockReset();
});

describe("authService.register", () => {
    it("validates required fields, email format and password length", async () => {
        await expect(authService.register({ ...validUser, firstName: "" })).rejects.toBeInstanceOf(ValidationError);
        await expect(authService.register({ ...validUser, email: "not-an-email" })).rejects.toBeInstanceOf(ValidationError);
        await expect(authService.register({ ...validUser, password: "123" })).rejects.toBeInstanceOf(ValidationError);
        expect(execute).not.toHaveBeenCalled();
    });

    it("rejects an email that is already registered", async () => {
        execute.mockResolvedValueOnce([{ id: 1 }]);
        await expect(authService.register(validUser)).rejects.toBeInstanceOf(ConflictError);
    });

    it("stores a hashed password and returns a user token", async () => {
        execute.mockResolvedValueOnce([]).mockResolvedValueOnce({ insertId: 42 });
        const token = await authService.register(validUser);

        const insertParams = execute.mock.calls[1][1];
        expect(insertParams[3]).not.toBe(validUser.password);
        expect(await bcrypt.compare(validUser.password, insertParams[3])).toBe(true);
        expect(verifyToken(token)).toMatchObject({ userId: 42, role: "user", firstName: "Dana" });
    });
});

describe("authService.login", () => {
    it("returns a token with the user's role for correct credentials", async () => {
        const hash = await bcrypt.hash("Admin1234!", 10);
        execute.mockResolvedValueOnce([{ id: 1, firstName: "Admin", lastName: "Demo", email: "admin@demo.com", password: hash, role: "admin" }]);
        const token = await authService.login({ email: "admin@demo.com", password: "Admin1234!" });
        expect(verifyToken(token)).toMatchObject({ userId: 1, role: "admin" });
    });

    it("rejects a wrong password", async () => {
        const hash = await bcrypt.hash("Admin1234!", 10);
        execute.mockResolvedValueOnce([{ id: 1, firstName: "Admin", lastName: "Demo", email: "admin@demo.com", password: hash, role: "admin" }]);
        await expect(authService.login({ email: "admin@demo.com", password: "wrong-password" })).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("rejects an unknown email", async () => {
        execute.mockResolvedValueOnce([]);
        await expect(authService.login({ email: "nobody@demo.com", password: "whatever1" })).rejects.toBeInstanceOf(UnauthorizedError);
    });
});
