import {
  CustomerDatasource,
  CustomerEntity,
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomerByIdDto,
  DeleteCustomerByIdDto,
  HttpCustomErrors,
  PaginateResponse,
  CustomersOptionalFiltersDto,
} from "../../domain";
import { prismaClient } from "../../data/postgres";

export class CustomerDatasourceImpl implements CustomerDatasource {
  constructor() {}

  private generateUrl(
    search: string | undefined,
    type: string | undefined,
    page: number,
    limit: number
  ): string {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (type) params.append("type", type);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `/customers?${params.toString()}`;
  }

  // * Obtener todos los clientes
  async getCustomers(
    customersOptionalFiltersDto: CustomersOptionalFiltersDto
  ): Promise<PaginateResponse<CustomerEntity>> {
    const { page, limit, search, type } = customersOptionalFiltersDto;

    // ? construimos el objeto para el where de la consulta a la base de datos
    const where: any = {};

    if (search && search.trim() !== "") {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [customers, total] = await Promise.all([
      prismaClient.customer.findMany({
        where: where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "asc" },
      }),

      prismaClient.customer.count({ where: where }),
    ]);

    return {
      data: customers.map((customer) => CustomerEntity.mapFromPrisma(customer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextPage:
        page < Math.ceil(total / limit)
          ? this.generateUrl(search, type, page + 1, limit)
          : null,
      previousPage:
        page > 1 ? this.generateUrl(search, type, page - 1, limit) : null,
    };
  }

  // * Obtener cliente por ID
  async getCustomerById(id: GetCustomerByIdDto): Promise<CustomerEntity> {
    const customer = await prismaClient.customer.findUnique({
      where: { id: id.id },
    });

    if (!customer) throw HttpCustomErrors.notFound("Cliente no encontrado");

    return CustomerEntity.mapFromPrisma(customer);
  }

  // * Crear cliente
  async createCustomer(customer: CreateCustomerDto): Promise<CustomerEntity> {
    const { email, password, firstName, lastName, address, phone, type } =
      customer;
    //? Verificar que el email no esté en uso (si se proporciona)
    if (email) {
      const existingCustomer = await prismaClient.customer.findUnique({
        where: { email },
      });

      if (existingCustomer) {
        throw HttpCustomErrors.badRequest(
          "El correo electronico ya esta siendo usado por otra persona"
        );
      }
    }

    //? Crear cliente
    const newCustomer = await prismaClient.customer.create({
      data: {
        firstName,
        lastName,
        email,
        password: password!,
        address,
        phone,
        type,
      },
    });

    return CustomerEntity.mapFromPrisma(newCustomer);
  }

  // * Actualizar cliente
  async updateCustomer(customer: UpdateCustomerDto): Promise<CustomerEntity> {
    const { id, email } = customer;

    //? Verificar que el cliente existe
    const customerToUpdate = await prismaClient.customer.findUnique({
      where: { id },
    });
    if (!customerToUpdate)
      throw HttpCustomErrors.notFound("Cliente no encontrado");

    //? Validar que el email no esté en uso por OTRO cliente
    if (email) {
      const existingCustomer = await prismaClient.customer.findUnique({
        where: { email },
      });

      //? Solo lanzar error si el email pertenece a OTRO cliente (no al cliente actual)
      if (existingCustomer && existingCustomer.id !== id) {
        throw HttpCustomErrors.badRequest(
          "El correo electronico ya esta siendo usado por otra persona"
        );
      }
    }

    //? Preparar datos de actualización
    const updatedData = customer.values;

    //? Actualizar cliente
    const updatedCustomer = await prismaClient.customer.update({
      where: { id },
      data: updatedData,
    });

    return CustomerEntity.mapFromPrisma(updatedCustomer);
  }

  // * Eliminar cliente
  async deleteCustomer(id: DeleteCustomerByIdDto): Promise<CustomerEntity> {
    const customerToDelete = await prismaClient.customer.findUnique({
      where: { id: id.id },
      include: {
        sales: true,
      },
    });

    if (!customerToDelete)
      throw HttpCustomErrors.notFound("Cliente no encontrado");

    //? Verificar si tiene ventas asociadas
    if (customerToDelete.sales.length > 0) {
      throw HttpCustomErrors.badRequest(
        `No se puede eliminar el cliente porque tiene ${customerToDelete.sales.length} venta(s) asociada(s)`
      );
    }

    const customer = await prismaClient.customer.delete({
      where: { id: id.id },
    });

    return CustomerEntity.mapFromPrisma(customer);
  }
}
