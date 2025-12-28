import { NextFunction, Request, Response } from "express";
import { JwtAdapter } from "../../config";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserEntity } from "../../domain/entities";

export class AuthMiddleware {
  private readonly jwtAdapter: JwtAdapter;
  private readonly userRepository: UserRepository;

  constructor(jwtAdapter: JwtAdapter, userRepository: UserRepository) {
    this.jwtAdapter = jwtAdapter;
    this.userRepository = userRepository;
  }

  public validateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const authorization = req.header("Authorization");
    if (!authorization)
      return res.status(401).json({ error: "No token provided" });
    if (!authorization.startsWith("Bearer "))
      return res.status(401).json({ error: "Invalid Bearer token" });

    const token = authorization.split(" ")[1] || "";

    try {
      const payload = await this.jwtAdapter.verifyToken<{ id: string }>(token);
      if (!payload) return res.status(401).json({ error: "Invalid token" });

      const user = await this.userRepository.getUserById({ id: payload.id });
      if (!user)
        return res
          .status(401)
          .json({ error: "Invalid token - user not found" });

      // Inyectar usuario en request para uso posterior
      (req as any).user = user;
      if (req.body) {
        req.body.user = user; // Para compatibilidad con algunos controladores si los hay
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
