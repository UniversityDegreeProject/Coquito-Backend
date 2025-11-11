import { HttpCustomErrors } from "../errors/http-custom-errors";
import { UserEntity } from "./user.entity";

export class CashRegisterEntity {
  constructor(
    public id: string,
    public userId: string,
    public openingAmount: number,
    public openedAt: Date,
    public closingAmount: number | null,
    public expectedAmount: number | null,
    public difference: number | null,
    public closedAt: Date | null,
    public totalSales: number,
    public totalOrders: number,
    public cashSales: number,
    public cardSales: number,
    public qrSales: number,
    public status: string,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date | null,
    public user?: UserEntity
  ) {}

  public static mapFromPrisma(prismaCashRegister: { [key: string]: any }): CashRegisterEntity {
    const {
      id,
      userId,
      openingAmount,
      openedAt,
      closingAmount,
      expectedAmount,
      difference,
      closedAt,
      totalSales,
      totalOrders,
      cashSales,
      cardSales,
      qrSales,
      status,
      notes,
      createdAt,
      updatedAt,
      user
    } = prismaCashRegister;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!userId) throw HttpCustomErrors.badRequest("userId es requerido");
    if (openingAmount === undefined || openingAmount === null) throw HttpCustomErrors.badRequest("openingAmount es requerido");
    if (!openedAt) throw HttpCustomErrors.badRequest("openedAt es requerido");
    if (!status) throw HttpCustomErrors.badRequest("status es requerido");

    //? Convertir Decimal de Prisma a number
    const openingAmountNumber = typeof openingAmount === 'object' && 'toNumber' in openingAmount 
      ? openingAmount.toNumber() 
      : Number(openingAmount);

    const closingAmountNumber = closingAmount
      ? (typeof closingAmount === 'object' && 'toNumber' in closingAmount 
          ? closingAmount.toNumber() 
          : Number(closingAmount))
      : null;

    const expectedAmountNumber = expectedAmount
      ? (typeof expectedAmount === 'object' && 'toNumber' in expectedAmount 
          ? expectedAmount.toNumber() 
          : Number(expectedAmount))
      : null;

    const differenceNumber = difference
      ? (typeof difference === 'object' && 'toNumber' in difference 
          ? difference.toNumber() 
          : Number(difference))
      : null;

    const totalSalesNumber = typeof totalSales === 'object' && 'toNumber' in totalSales 
      ? totalSales.toNumber() 
      : Number(totalSales);

    const cashSalesNumber = typeof cashSales === 'object' && 'toNumber' in cashSales 
      ? cashSales.toNumber() 
      : Number(cashSales);

    const cardSalesNumber = typeof cardSales === 'object' && 'toNumber' in cardSales 
      ? cardSales.toNumber() 
      : Number(cardSales);

    const qrSalesNumber = typeof qrSales === 'object' && 'toNumber' in qrSales 
      ? qrSales.toNumber() 
      : Number(qrSales);

    //? Validar fechas
    let openedAtDate: Date;
    if (openedAt) {
      openedAtDate = new Date(openedAt);
      if (isNaN(openedAtDate.getTime()) || openedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("openedAt no es una fecha válida");
      }
    } else {
      openedAtDate = new Date();
    }

    let closedAtDate: Date | null = null;
    if (closedAt) {
      closedAtDate = new Date(closedAt);
      if (isNaN(closedAtDate.getTime()) || closedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("closedAt no es una fecha válida");
      }
    }

    let createdAtDate: Date;
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (isNaN(createdAtDate.getTime()) || createdAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    } else {
      createdAtDate = new Date();
    }

    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (isNaN(updatedAtDate.getTime()) || updatedAtDate.toString() === "Invalid Date") {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha válida");
      }
    }

    //? Mapear usuario si existe
    const userEntity = user ? UserEntity.mapFromPrisma(user) : undefined;

    return new CashRegisterEntity(
      id,
      userId,
      openingAmountNumber,
      openedAtDate,
      closingAmountNumber,
      expectedAmountNumber,
      differenceNumber,
      closedAtDate,
      totalSalesNumber,
      totalOrders,
      cashSalesNumber,
      cardSalesNumber,
      qrSalesNumber,
      status,
      notes ?? null,
      createdAtDate,
      updatedAtDate,
      userEntity
    );
  }
}

