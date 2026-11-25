import { dal } from "../utils/dal";
import { stringify } from "csv-stringify/sync";

interface ReportRow {
    destination: string;
    likesCount: number;
}

class ReportService {

    async getLikesReport(): Promise<ReportRow[]> {
        const rows = await dal.execute(
            `SELECT vacations.destination, COUNT(likes.userId) AS likesCount
             FROM vacations 
             LEFT JOIN likes ON vacations.id = likes.vacationId
             GROUP BY vacations.id, vacations.destination
             ORDER BY likesCount DESC`
        ) as ReportRow[];

        
        rows.forEach(row => {
            row.likesCount = Number(row.likesCount);
        });

        return rows;
    }

    async getCsv(): Promise<string> {
        const rows = await this.getLikesReport();
        const csv = stringify(rows, {
            header: true,
            columns: [
                { key: "destination", header: "Destination" },
                { key: "likesCount", header: "Likes" }
            ]
        });
        return csv;
    }
}

export const reportService = new ReportService();
