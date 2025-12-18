import { HttpCustomErrors } from "../errors/http-custom-errors";
import { UserEntity } from "./user.entity";
import { CustomerEntity } from "./customer.entity";
import { CashRegisterEntity } from "./cash-register.entity";

/**
 * Entidad para Sale Item (producto en la venta)
 */
export class SaleItemEntity {
  constructor(
    public id: string,
    public saleId: string,
    public productId: string,
    public quantity: number,
    public unitPrice: number,
    public total: number,
    public createdAt: Date,
    public product?: any // Evitar dependencia circular
  ) {}

  public static mapFromPrisma(prismaSaleItem: {
    [key: string]: any;
  }): SaleItemEntity {
    const {
      id,
      saleId,
      productId,
      quantity,
      unitPrice,
      total,
      createdAt,
      product,
    } = prismaSaleItem;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!saleId) throw HttpCustomErrors.badRequest("saleId es requerido");
    if (!productId) throw HttpCustomErrors.badRequest("productId es requerido");
    if (quantity === undefined || quantity === null)
      throw HttpCustomErrors.badRequest("quantity es requerido");
    if (unitPrice === undefined || unitPrice === null)
      throw HttpCustomErrors.badRequest("unitPrice es requerido");
    if (total === undefined || total === null)
      throw HttpCustomErrors.badRequest("total es requerido");

    //? Convertir Decimal de Prisma a number
    const unitPriceNumber =
      typeof unitPrice === "object" && "toNumber" in unitPrice
        ? unitPrice.toNumber()
        : Number(unitPrice);

    const totalNumber =
      typeof total === "object" && "toNumber" in total
        ? total.toNumber()
        : Number(total);

    //? Validar fecha
    let createdAtDate: Date;
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (
        isNaN(createdAtDate.getTime()) ||
        createdAtDate.toString() === "Invalid Date"
      ) {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    } else {
      createdAtDate = new Date();
    }

    return new SaleItemEntity(
      id,
      saleId,
      productId,
      quantity,
      unitPriceNumber,
      totalNumber,
      createdAtDate,
      product
    );
  }
}

/**
 * Entidad para Sale (Venta)
 */
export class SaleEntity {
  constructor(
    public id: string,
    public saleNumber: string,
    public customerId: string,
    public userId: string,
    public cashRegisterId: string | null,
    public subtotal: number,
    public tax: number,
    public total: number,
    public paymentMethod: string,
    public amountPaid: number,
    public change: number,
    public status: string,
    public notes: string | null,
    public createdAt: Date,
    public updatedAt: Date | null,
    public completedAt: Date | null,
    public items?: SaleItemEntity[],
    public customer?: CustomerEntity,
    public user?: UserEntity,
    public cashRegister?: CashRegisterEntity
  ) {}

  public static mapFromPrisma(prismaSale: { [key: string]: any }): SaleEntity {
    const {
      id,
      saleNumber,
      customerId,
      userId,
      cashRegisterId,
      subtotal,
      tax,
      total,
      paymentMethod,
      amountPaid,
      change,
      status,
      notes,
      createdAt,
      updatedAt,
      completedAt,
      items,
      customer,
      user,
      cashRegister,
    } = prismaSale;

    if (!id) throw HttpCustomErrors.badRequest("id es requerido");
    if (!saleNumber)
      throw HttpCustomErrors.badRequest("saleNumber es requerido");
    if (!customerId)
      throw HttpCustomErrors.badRequest("customerId es requerido");
    if (!userId) throw HttpCustomErrors.badRequest("userId es requerido");
    if (subtotal === undefined || subtotal === null)
      throw HttpCustomErrors.badRequest("subtotal es requerido");
    if (tax === undefined || tax === null)
      throw HttpCustomErrors.badRequest("tax es requerido");
    if (total === undefined || total === null)
      throw HttpCustomErrors.badRequest("total es requerido");
    if (!paymentMethod)
      throw HttpCustomErrors.badRequest("paymentMethod es requerido");
    if (amountPaid === undefined || amountPaid === null)
      throw HttpCustomErrors.badRequest("amountPaid es requerido");
    if (change === undefined || change === null)
      throw HttpCustomErrors.badRequest("change es requerido");
    if (!status) throw HttpCustomErrors.badRequest("status es requerido");

    //? Convertir Decimal de Prisma a number
    const subtotalNumber =
      typeof subtotal === "object" && "toNumber" in subtotal
        ? subtotal.toNumber()
        : Number(subtotal);

    const taxNumber =
      typeof tax === "object" && "toNumber" in tax
        ? tax.toNumber()
        : Number(tax);

    const totalNumber =
      typeof total === "object" && "toNumber" in total
        ? total.toNumber()
        : Number(total);

    const amountPaidNumber =
      typeof amountPaid === "object" && "toNumber" in amountPaid
        ? amountPaid.toNumber()
        : Number(amountPaid);

    const changeNumber =
      typeof change === "object" && "toNumber" in change
        ? change.toNumber()
        : Number(change);

    //? Validar fechas
    let createdAtDate: Date;
    if (createdAt) {
      createdAtDate = new Date(createdAt);
      if (
        isNaN(createdAtDate.getTime()) ||
        createdAtDate.toString() === "Invalid Date"
      ) {
        throw HttpCustomErrors.badRequest("createdAt no es una fecha válida");
      }
    } else {
      createdAtDate = new Date();
    }

    let updatedAtDate: Date | null = null;
    if (updatedAt) {
      updatedAtDate = new Date(updatedAt);
      if (
        isNaN(updatedAtDate.getTime()) ||
        updatedAtDate.toString() === "Invalid Date"
      ) {
        throw HttpCustomErrors.badRequest("updatedAt no es una fecha válida");
      }
    }

    let completedAtDate: Date | null = null;
    if (completedAt) {
      completedAtDate = new Date(completedAt);
      if (
        isNaN(completedAtDate.getTime()) ||
        completedAtDate.toString() === "Invalid Date"
      ) {
        throw HttpCustomErrors.badRequest("completedAt no es una fecha válida");
      }
    }

    //? Mapear items si existen
    const itemsEntities = items
      ? items.map((item: any) => SaleItemEntity.mapFromPrisma(item))
      : undefined;

    //? Mapear relaciones si existen
    const customerEntity = customer
      ? CustomerEntity.mapFromPrisma(customer)
      : undefined;
    const userEntity = user ? UserEntity.mapFromPrisma(user) : undefined;
    const cashRegisterEntity = cashRegister
      ? CashRegisterEntity.mapFromPrisma(cashRegister)
      : undefined;

    return new SaleEntity(
      id,
      saleNumber,
      customerId,
      userId,
      cashRegisterId ?? null,
      subtotalNumber,
      taxNumber,
      totalNumber,
      paymentMethod,
      amountPaidNumber,
      changeNumber,
      status,
      notes ?? null,
      createdAtDate,
      updatedAtDate,
      completedAtDate,
      itemsEntities,
      customerEntity,
      userEntity,
      cashRegisterEntity
    );
  }
}
