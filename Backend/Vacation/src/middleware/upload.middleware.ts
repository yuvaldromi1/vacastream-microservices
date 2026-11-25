import multer, { Multer } from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import { ValidationError } from "@yd/restify";
import { getUploadsDir } from "../utils/image-helpers";

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, getUploadsDir());
    },
    filename: (_req, file, callback) => {
        const ext = path.extname(file.originalname);
        callback(null, uuid() + ext);
    }
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
    const allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        callback(null, true);
    } else {
        callback(new ValidationError("Only image files are allowed (jpg, jpeg, png, gif, webp)."));
    }
};

export const uploadMiddleware: Multer = multer({ storage, fileFilter });
