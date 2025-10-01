import { Router } from "express";

export interface IServerOptions {
  port : number;
  publicPath? : string;
  routes : Router;
}