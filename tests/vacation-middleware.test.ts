import { describe, it, expect, vi } from "vitest";
import { ForbiddenError } from "@yd/restify";
import { requireAdmin, requireUser } from "../Backend/Vacation/src/middleware/role.middleware";
import { parseUserHeaders } from "../Backend/Vacation/src/middleware/user-headers.middleware";

function headers(values: Record<string, string>): any {
    return { header: (name: string) => values[name] };
}

describe("parseUserHeaders", () => {
    it("builds req.user from the gateway headers", () => {
        const req = headers({ "x-user-id": "3", "x-user-role": "admin", "x-user-firstname": "Admin", "x-user-lastname": "Demo" });
        parseUserHeaders(req, {} as any, vi.fn());
        expect(req.user).toEqual({ userId: 3, role: "admin", firstName: "Admin", lastName: "Demo" });
    });

    it("leaves req.user empty when the gateway sent no user", () => {
        const req = headers({});
        parseUserHeaders(req, {} as any, vi.fn());
        expect(req.user).toBeUndefined();
    });
});

describe("role middleware", () => {
    it("requireAdmin lets admins through and blocks users", () => {
        const ok = vi.fn();
        requireAdmin({ user: { role: "admin" } } as any, {} as any, ok);
        expect(ok).toHaveBeenCalledWith();

        const blocked = vi.fn();
        requireAdmin({ user: { role: "user" } } as any, {} as any, blocked);
        expect(blocked.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
    });

    it("requireUser blocks admins and anonymous requests", () => {
        const admin = vi.fn();
        requireUser({ user: { role: "admin" } } as any, {} as any, admin);
        expect(admin.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);

        const anonymous = vi.fn();
        requireUser({} as any, {} as any, anonymous);
        expect(anonymous.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
    });
});
