//? Node
import path from "path";
//? Libraries
import express, { Router, Request, Response } from "express";
import cors from "cors";

//? Interfaces
import { IServerOptions } from "../domain/interfaces/server.option";
import { createServer } from "http";
//? socket
import { Server as ServerIO } from "socket.io";
import { SocketService } from "./socket/socket.service";

import { env } from "../config/env.adapter";

export class Server {
  private readonly app: express.Application = express();
  private readonly port: number;
  private readonly routes: Router;
  private readonly publicPath: string;

  constructor(options: IServerOptions) {
    const { port, routes, publicPath } = options;
    this.port = port;
    this.routes = routes;
    this.publicPath = publicPath || "public";
  }

  async start() {
    //* Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    const allowedOrigins = [
      "http://localhost:5173",
      "https://transferable-lawana-roadworthy.ngrok-free.dev",
      env.FRONTEND_URL,
      "https://jezedev.pro",
      "https://www.jezedev.pro",
    ];
    // *cors
    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "ngrok-skip-browser-warning",
        ],
      }),
    );

    //* Public path
    this.app.use(express.static(this.publicPath));

    //* Routes
    this.app.use(this.routes);

    // route no defined example (spa)
    this.app.get(/(.*)/, (req: Request, res: Response) => {
      res.sendFile(path.resolve(this.publicPath, "index.html"));
    });

    // * socket io
    const server = createServer(this.app);
    const io = new ServerIO(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "ngrok-skip-browser-warning",
        ],
      },
    });

    //? Inicializar el servicio singleton de Socket.IO
    SocketService.init(io);

    //* Start server (usando httpServer para que Socket.IO funcione)
    server.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
      console.log(`Socket.IO ready on ws://localhost:${this.port}`);
    });
  }
}
