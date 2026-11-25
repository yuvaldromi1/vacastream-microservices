import { describe, it, expect, vi } from "vitest";
import {
    StatusCode, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError,
    sendSuccess, sendCreated, sendNoContent, asyncHandler, errorMiddleware, routeNotFound,
} from "@yd/restify";

function mockResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
}

describe("client errors", () => {
    it("map each error class to the right HTTP status", () => {
        expect(new NotFoundError().status).toBe(StatusCode.NotFound);
        expect(new ValidationError("bad").status).toBe(StatusCode.BadRequest);
        expect(new UnauthorizedError().status).toBe(StatusCode.Unauthorized);
        expect(new ForbiddenError().status).toBe(StatusCode.Forbidden);
        expect(new ConflictError("dup").status).toBe(StatusCode.Conflict);
    });
});

describe("response helpers", () => {
    it("sendSuccess wraps data in { success, data }", () => {
        const res = mockResponse();
        sendSuccess(res, [1, 2]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, data: [1, 2] });
    });

    it("sendCreated returns 201 and sendNoContent returns 204", () => {
        const created = mockResponse();
        sendCreated(created, { id: 1 });
        expect(created.status).toHaveBeenCalledWith(201);

        const empty = mockResponse();
        sendNoContent(empty);
        expect(empty.status).toHaveBeenCalledWith(204);
    });
});

describe("errorMiddleware", () => {
    it("returns the client error message and status", () => {
        const res = mockResponse();
        vi.spyOn(console, "error").mockImplementation(() => {});
        errorMiddleware(new ValidationError("Price must be positive."), {} as any, res, vi.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "Price must be positive." });
    });

    it("hides internal details of unexpected errors", () => {
        const res = mockResponse();
        vi.spyOn(console, "error").mockImplementation(() => {});
        errorMiddleware(new Error("connection string leaked"), {} as any, res, vi.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, error: "Internal server error." });
    });

    it("routeNotFound forwards a 404 error", () => {
        const next = vi.fn();
        routeNotFound({ originalUrl: "/api/nothing" } as any, mockResponse(), next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(NotFoundError);
    });
});

describe("asyncHandler", () => {
    it("passes rejected promises to next()", async () => {
        const next = vi.fn();
        const error = new Error("boom");
        asyncHandler(async () => { throw error; })({} as any, mockResponse(), next);
        await new Promise(r => setTimeout(r, 0));
        expect(next).toHaveBeenCalledWith(error);
    });
});
