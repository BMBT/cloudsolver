import { FirestoreStore } from "@google-cloud/connect-firestore";
import { NextFunction, Request, Response, Router } from "express";
import expressSession from "express-session";

import { login } from "../auth/auth";
import { signup } from "../auth/signup";
import { route as fileRoute } from "../user/file/fileController";
import { getUserSessionById } from "../session/sessionService";
import { route as userRoute } from "../user/userController";
import { route as clusterRoute } from "../cluster/clusterController";
import { env } from "./environment";
import firestore from "./googleFirestore";

const session = expressSession({
    name: "cloudsolver.sid",
    store: new FirestoreStore({
        dataset: firestore(),
        kind: "Session"
    }),
    secret: env.NODE_ENV === "prod" ? env.EXPRESS_COOKIE_SECRET : "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: process.env.NODE_ENV === "prod",
        secure: process.env.NODE_ENV === "prod",
        sameSite: process.env.NODE_ENV === "prod" ? "none" : "strict"
    }
});

const userInfo = (req: Request, res: Response, next: NextFunction) => 
    "username" in req.body && "password" in req.body ? next() : res.status(400).send("Wrong information");

const userSession = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.session.userId)
        return res.status(401).send("Unauthorized request");
    const userSession = await getUserSessionById(req.sessionID);
    if(!userSession)
        return res.status(403).send("Session do not exist");
    if(userSession.userId !== req.session.userId)
        return res.status(403).send("Error in cookie");
    next();
}

const route = Router();

route.use(session);
route.post("/signup", userInfo, signup);
route.post("/login", userInfo, login);
route.use(userSession);
route.use("/user", userRoute);
route.use("/file", fileRoute);
route.use("/cluster", clusterRoute);

export { route };