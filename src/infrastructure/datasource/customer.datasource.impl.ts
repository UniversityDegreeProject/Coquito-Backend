import { prismaClient } from "../../data/postgres";
import { 
  CustomerDatasource, 
  CustomerEntity, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  GetCustomerByIdDto, 
  DeleteCustomerByIdDto, 
  SearchCustomersDto,
  HttpCustomErrors 
} from "../../domain";
import { BcryptAdapter } from "../../config";

export class CustomerDatasourceImpl implements CustomerDatasource {
  
  constructor(
    private readonly bcrypt: BcryptAdapter
  ) {}

  /**
   * Genera una contraseña automática en formato: PrimeraLetra + restoEnMinúsculas + @
   * Ejemplo: firstName="Jesus" => "Jesus@"
   */
  private generateDefaultPassword(firstName: string): string {
    // Primera letra en mayúscula + resto en minúsculas + @
    const password = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() + "@";
    return password;
  }

  // * Obtener todos los clientes
  async getCustomers(): Promise<CustomerEntity[]> {
    const customers = await prismaClient.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return customers.map(customer => CustomerEntity.mapFromPrisma(customer));
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
    const { firstName, lastName, email, phone, address, type } = customer;

    //? Verificar que el email no esté en uso (si se proporciona)
    if (email) {
      const existingCustomer = await prismaClient.customer.findUnique({
        where: { email }
      });

      if (existingCustomer) {
        throw HttpCustomErrors.badRequest("El email ya está registrado");
      }
    }

    //? Generar contraseña automática: "Jesus@"
    const defaultPassword = this.generateDefaultPassword(firstName);
    
    //? Hash de contraseña
    const hashedPassword = await this.bcrypt.hash(defaultPassword);

    //? Crear cliente
    const newCustomer = await prismaClient.customer.create({
      data: {
        firstName,
        lastName,
        email: email ?? null,
        phone: phone ?? null,
        address: address ?? null,
        password: hashedPassword,
        type: type ?? "Regular",
      },
    });

    return CustomerEntity.mapFromPrisma(newCustomer);
  }

  // * Actualizar cliente
  async updateCustomer(customer: UpdateCustomerDto): Promise<CustomerEntity> {
    const { id, email, password } = customer;

    //? Verificar que el cliente existe
    const customerToUpdate = await prismaClient.customer.findUnique({
      where: { id },
    });
    if (!customerToUpdate) throw HttpCustomErrors.notFound("Cliente no encontrado");

    //? Validar que el email no esté en uso por OTRO cliente
    if (email) {
      const existingCustomer = await prismaClient.customer.findUnique({
        where: { email },
      });

      //? Solo lanzar error si el email pertenece a OTRO cliente (no al cliente actual)
      if (existingCustomer && existingCustomer.id !== id) {
        throw HttpCustomErrors.badRequest("El email ya está en uso");
      }
    }

    //? Preparar datos de actualización
    const updateData = customer.values;

    //? Si se actualiza la contraseña, hashearla
    if (password) {
      updateData.password = await this.bcrypt.hash(password);
    }

    //? Actualizar cliente
    const updatedCustomer = await prismaClient.customer.update({
      where: { id },
      data: updateData,
    });

    return CustomerEntity.mapFromPrisma(updatedCustomer);
  }

  // * Eliminar cliente
  async deleteCustomer(id: DeleteCustomerByIdDto): Promise<CustomerEntity> {
    const customerToDelete = await prismaClient.customer.findUnique({
      where: { id: id.id },
      include: {
        orders: true
      }
    });

    if (!customerToDelete) throw HttpCustomErrors.notFound("Cliente no encontrado");

    //? Verificar si tiene órdenes asociadas
    if (customerToDelete.orders.length > 0) {
      throw HttpCustomErrors.badRequest(
        `No se puede eliminar el cliente porque tiene ${customerToDelete.orders.length} orden(es) asociada(s)`
      );
    }

    const customer = await prismaClient.customer.delete({
      where: { id: id.id },
    });

    return CustomerEntity.mapFromPrisma(customer);
  }

  // * Buscar clientes con filtros
  async searchCustomers(searchCustomersDto: SearchCustomersDto): Promise<{
    customers: CustomerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, type, page, limit } = searchCustomersDto;

    //? Construir el objeto where para Prisma
    const where: any = {};

    //? Búsqueda general (firstName, lastName, email, phone, address)
    if (search && search.trim() !== "") {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    //? Filtro por tipo
    if (type) {
      where.type = type;
    }

    //? Paginación
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prismaClient.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prismaClient.customer.count({ where }),
    ]);

    //? Calcular total de páginas
    const totalPages = Math.ceil(total / limit);

    return {
      customers: customers.map(customer => CustomerEntity.mapFromPrisma(customer)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

