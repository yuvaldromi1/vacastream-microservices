import { appConfig } from "./utils/app-config";
import express from "express";
import path from "path";
import { parseUserHeaders } from "./middleware/user-headers.middleware";
import { vacationController } from "./controllers/vacation.controller";
import { likeController } from "./controllers/like.controller";
import { reportController } from "./controllers/report.controller";
import { errorMiddleware, routeNotFound } from "@yd/restify";

class App {

    public start(): void {
        try {
            const server = express();
            server.use(express.json());

        
            server.use("/api/vacations/images", express.static(path.join(__dirname, "uploads")));

          
            server.use(parseUserHeaders);

         
            server.use(vacationController.router);
            server.use(likeController.router);
            server.use(reportController.router);

           
            server.use(routeNotFound);
            server.use(errorMiddleware);

            server.listen(appConfig.port, () => console.log("Listening on http://localhost:" + appConfig.port));
        }
        catch (err: unknown) {
            console.error(err);
        }
    }
}

const app = new App();
app.start();
