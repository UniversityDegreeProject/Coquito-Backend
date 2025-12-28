import { prismaClient } from "../../data/postgres";

interface CreateActivityLogParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Servicio centralizado para registrar actividades del sistema
 */
export class ActivityLogger {
  /**
   * Registra una actividad en el sistema
   */
  static async log(params: CreateActivityLogParams): Promise<void> {
    try {
      const {
        userId,
        action,
        entity,
        entityId,
        description,
        metadata,
        ipAddress,
        userAgent,
      } = params;

      await prismaClient.activityLog.create({
        data: {
          userId,
          action,
          entity,
          entityId: entityId || null,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (error) {
      // No lanzar error para no interrumpir el flujo principal
      console.error("Error al registrar actividad:", error);
    }
  }

  /**
   * Helper para registrar creación de entidad
   */
  static async logCreate(
    userId: string,
    entity: string,
    entityId: string,
    entityName: string,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: "CREATE",
      entity,
      entityId,
      description: `Creó ${entity.toLowerCase()}: ${entityName}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  /**
   * Helper para registrar actualización de entidad
   */
  static async logUpdate(
    userId: string,
    entity: string,
    entityId: string,
    entityName: string,
    changes?: Record<string, any>,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: "UPDATE",
      entity,
      entityId,
      description: `Actualizó ${entity.toLowerCase()}: ${entityName}`,
      metadata: changes,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  /**
   * Helper para registrar eliminación de entidad
   */
  static async logDelete(
    userId: string,
    entity: string,
    entityId: string,
    entityName: string,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: "DELETE",
      entity,
      entityId,
      description: `Eliminó ${entity.toLowerCase()}: ${entityName}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  /**
   * Helper para registrar inicio de sesión
   */
  static async logLogin(
    userId: string,
    userEmail: string,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: "LOGIN",
      entity: "Auth",
      description: `Inició sesión: ${userEmail}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  }

  /**
   * Helper para registrar cierre de sesión
   */
  static async logLogout(
    userId: string,
    userEmail: string,
    req?: any
  ): Promise<void> {
    await this.log({
      userId,
      action: "LOGOUT",
      entity: "Auth",
      description: `Cerró sesión: ${userEmail}`,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  }
}
