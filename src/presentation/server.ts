//? Node
import path from 'path';
//? Libraries
import express, { Router, Request, Response } from 'express';
import cors from 'cors';

//? Interfaces
import { IServerOptions } from '../domain/interfaces/server.option';

export class Server {
  private readonly app : express.Application = express();
  private readonly port : number;
  private readonly routes : Router;
  private readonly publicPath : string;

  constructor(options : IServerOptions) {
    const { port, routes, publicPath } = options;
    this.port = port;
    this.routes = routes;
    this.publicPath = publicPath || "public";
  }


  async start() {
    //* Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use(cors());
    
    //* Public path
    this.app.use(express.static(this.publicPath));


    //* Routes
    this.app.use(this.routes);
    
    // route no defined example (spa)
    this.app.get(/(.*)/, (req: Request, res: Response) => {
      res.sendFile(path.resolve(this.publicPath, "index.html"));
    });

    //* Start server
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}