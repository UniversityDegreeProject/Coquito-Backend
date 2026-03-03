import { Server as SocketIOServer } from "socket.io";

/**
 * * Singleton que almacena la instancia de Socket.IO Server.
 * * Permite emitir eventos en tiempo real desde cualquier parte del backend
 * * (controllers, use cases) sin necesidad de pasar la referencia manualmente.
 */
export class SocketService {
  private static io: SocketIOServer | null = null;

  static init(io: SocketIOServer): void {
    SocketService.io = io;

    io.on("connection", (socket) => {
      console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
      });
    });
  }

  static emit<T>(event: string, data: T): void {
    if (!SocketService.io) {
      console.warn("[SocketService] No inicializado, evento ignorado:", event);
      return;
    }
    SocketService.io.emit(event, data);
  }

  static getIO(): SocketIOServer | null {
    return SocketService.io;
  }
}
