import { OkPacket } from "mysql2";
import { dal } from "../utils/dal";
import { deleteImage } from "../utils/image-helpers";
import { NotFoundError, ValidationError } from "@yd/restify";
import { VacationModel, VacationWithLikes } from "../models/vacation.model";

class VacationService {

    async getAll(userId: number): Promise<VacationWithLikes[]> {
        const vacations = await dal.execute(
            `SELECT vacations.*,
                    COUNT(likes.userId) AS likesCount,
                    EXISTS(SELECT 1 FROM likes WHERE userId = ? AND vacationId = vacations.id) AS isLikedByUser
             FROM vacations
             LEFT JOIN likes ON vacations.id = likes.vacationId
             GROUP BY vacations.id
             ORDER BY vacations.startDate ASC`,
            [userId]
        ) as VacationWithLikes[];

       
        vacations.forEach(vacation => {
            vacation.isLikedByUser = Boolean(vacation.isLikedByUser);
            vacation.likesCount = Number(vacation.likesCount);
        });

        return vacations;
    }

    async getById(vacationId: number): Promise<VacationModel> {
        const vacations = await dal.execute(
            "SELECT * FROM vacations WHERE id = ?",
            [vacationId]
        ) as VacationModel[];

        if (vacations.length === 0) {
            throw new NotFoundError("Vacation not found.");
        }

        return vacations[0];
    }

    async create(vacation: VacationModel): Promise<VacationModel> {
        this.validate(vacation);

        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(vacation.startDate) < today) {
            throw new ValidationError("Start date cannot be in the past.");
        }

        const result = await dal.execute(
            "INSERT INTO vacations (destination, description, startDate, endDate, price, imageFileName) VALUES (?, ?, ?, ?, ?, ?)",
            [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, vacation.imageFileName]
        ) as OkPacket;

        vacation.id = result.insertId;
        return vacation;
    }

    async update(vacation: VacationModel): Promise<VacationModel> {
        const existing = await this.getById(vacation.id!);

       
        if (!vacation.imageFileName) {
            vacation.imageFileName = existing.imageFileName;
        } else if (vacation.imageFileName !== existing.imageFileName) {
            
            deleteImage(existing.imageFileName);
        }

        this.validate(vacation);

        await dal.execute(
            "UPDATE vacations SET destination = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageFileName = ? WHERE id = ?",
            [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, vacation.imageFileName, vacation.id!]
        );

        return vacation;
    }

    async delete(vacationId: number): Promise<void> {
        const vacation = await this.getById(vacationId);
        deleteImage(vacation.imageFileName);
        await dal.execute("DELETE FROM vacations WHERE id = ?", [vacationId]);
    }

    private validate(vacation: VacationModel): void {
        if (!vacation.destination || !vacation.description || !vacation.startDate || !vacation.endDate || vacation.price === undefined || !vacation.imageFileName) {
            throw new ValidationError("All fields are required.");
        }
        if (vacation.price < 0 || vacation.price > 10000) {
            throw new ValidationError("Price must be between 0 and 10,000.");
        }
        if (new Date(vacation.endDate) <= new Date(vacation.startDate)) {
            throw new ValidationError("End date must be after start date.");
        }
    }
}

export const vacationService = new VacationService();
