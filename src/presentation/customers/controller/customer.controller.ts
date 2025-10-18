import { Request, Response } from "express";
import {
  HttpCustomErrors,
  CustomerRepository,
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomerByIdDto,
  DeleteCustomerByIdDto,
  SearchCustomersDto,
  GetCustomersUseCaseImpl,
  CreateCustomerUseCaseImpl,
  UpdateCustomerUseCaseImpl,
  DeleteCustomerUseCaseImpl,
  GetCustomerByIdUseCaseImpl,
  SearchCustomersUseCaseImpl
} from "../../../domain";

export class CustomerController {
  constructor(
    private readonly customerRepository: CustomerRepository
  ) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  getAllCustomers = async (req: Request, res: Response) => {
    new GetCustomersUseCaseImpl(this.customerRepository)
      .execute()
      .then(customers => {
        //? Remover contraseñas de la respuesta
        const customersWithoutPassword = customers.map(({ password, ...rest }) => rest);
        return res.status(200).json({ customers: customersWithoutPassword });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  getCustomerById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, getCustomerByIdDto] = GetCustomerByIdDto.create({ id });
    if (error) return res.status(400).json({ error: error });
    if (!getCustomerByIdDto) return res.status(400).json({ error: "Cliente no encontrado" });

    new GetCustomerByIdUseCaseImpl(this.customerRepository)
      .execute(getCustomerByIdDto)
      .then(customer => {
        if (!customer) return res.status(404).json({ error: "Cliente no encontrado" });
        
        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;
        return res.status(200).json({ customer: customerWithoutPassword });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  createCustomer = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createCustomerDto] = CreateCustomerDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createCustomerDto) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateCustomerUseCaseImpl(this.customerRepository)
      .execute(createCustomerDto)
      .then(customer => {
        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;
        return res.status(201).json({
          message: "Cliente creado exitosamente",
          customer: customerWithoutPassword
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  updateCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const [error, updateCustomerDto] = UpdateCustomerDto.create({ id, ...body });
    if (error) return res.status(400).json({ error: error });
    if (!updateCustomerDto) return res.status(400).json({ error: "Cliente no encontrado" });

    new UpdateCustomerUseCaseImpl(this.customerRepository)
      .execute(updateCustomerDto)
      .then(customer => {
        if (!customer) return res.status(404).json({ error: "Cliente no encontrado" });
        
        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;
        return res.status(200).json({
          message: "Cliente actualizado exitosamente",
          customer: customerWithoutPassword
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, deleteCustomerDto] = DeleteCustomerByIdDto.create({ id: id });
    if (error) return res.status(400).json({ error: error });
    if (!deleteCustomerDto) return res.status(400).json({ error: "Id de cliente no encontrado" });

    new DeleteCustomerUseCaseImpl(this.customerRepository)
      .execute(deleteCustomerDto)
      .then(customer => {
        if (!customer) return res.status(404).json({ error: "Cliente no encontrado" });
        
        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;
        return res.status(200).json({
          message: "Cliente eliminado exitosamente",
          customer: customerWithoutPassword
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  searchCustomers = async (req: Request, res: Response) => {
    const query = req.query;
    const [error, searchCustomersDto] = SearchCustomersDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!searchCustomersDto) return res.status(400).json({ error: "Parámetros de búsqueda inválidos" });

    new SearchCustomersUseCaseImpl(this.customerRepository)
      .execute(searchCustomersDto)
      .then(result => {
        //? Remover contraseñas de la respuesta
        const customersWithoutPassword = result.customers.map(({ password, ...rest }) => rest);
        return res.status(200).json({
          ...result,
          customers: customersWithoutPassword
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };
}

