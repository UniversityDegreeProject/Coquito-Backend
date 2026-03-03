import { Request, Response } from "express";
import {
  HttpCustomErrors,
  CustomerRepository,
  CreateCustomerDto,
  UpdateCustomerDto,
  GetCustomerByIdDto,
  DeleteCustomerByIdDto,
  GetCustomersUseCaseImpl,
  CreateCustomerUseCaseImpl,
  UpdateCustomerUseCaseImpl,
  DeleteCustomerUseCaseImpl,
  GetCustomerByIdUseCaseImpl,
  CustomersOptionalFiltersDto,
} from "../../../domain";
import { BcryptAdapter } from "../../../config";
import { SocketService } from "../../socket/socket.service";

export class CustomerController {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  getCustomers = async (req: Request, res: Response) => {
    const [error, customersOptionalFiltersDto] =
      CustomersOptionalFiltersDto.create(req.query);
    if (error) return res.status(400).json({ error: error });
    if (!customersOptionalFiltersDto)
      return res
        .status(400)
        .json({ error: "Parámetros de búsqueda inválidos" });

    new GetCustomersUseCaseImpl(this.customerRepository)
      .execute(customersOptionalFiltersDto)
      .then(({ data, ...restPagination }) => {
        //? Removemos la contraseña para que no devuelva en el endpoint

        const customerWithoutPassword = data.map((customer) => {
          const { password, ...rest } = customer;
          return rest;
        });

        return res.status(200).json({
          data: customerWithoutPassword,
          ...restPagination,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  getCustomerById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, getCustomerByIdDto] = GetCustomerByIdDto.create({ id });
    if (error) return res.status(400).json({ error: error });
    if (!getCustomerByIdDto)
      return res.status(400).json({ error: "Cliente no encontrado" });

    new GetCustomerByIdUseCaseImpl(this.customerRepository)
      .execute(getCustomerByIdDto)
      .then((customer) => {
        if (!customer)
          return res.status(404).json({ error: "Cliente no encontrado" });

        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;
        return res.status(200).json({ customer: customerWithoutPassword });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  createCustomer = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createCustomerDto] = CreateCustomerDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createCustomerDto)
      return res.status(400).json({ error: "Datos incorrectos" });

    new CreateCustomerUseCaseImpl(this.customerRepository, this.bcryptAdapter)
      .execute(createCustomerDto)
      .then((customer) => {
        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;

        SocketService.emit("client:created", {
          customer: customerWithoutPassword,
        });

        return res.status(201).json({
          message: "Cliente creado exitosamente",
          customer: customerWithoutPassword,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  updateCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const [error, updateCustomerDto] = UpdateCustomerDto.create({
      id,
      ...body,
    });
    if (error) return res.status(400).json({ error: error });
    if (!updateCustomerDto)
      return res.status(400).json({ error: "Cliente no encontrado" });

    new UpdateCustomerUseCaseImpl(this.customerRepository, this.bcryptAdapter)
      .execute(updateCustomerDto)
      .then((customer) => {
        if (!customer)
          return res.status(404).json({ error: "Cliente no encontrado" });

        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;

        SocketService.emit("client:updated", {
          customer: customerWithoutPassword,
        });

        return res.status(200).json({
          message: "Cliente actualizado exitosamente",
          customer: customerWithoutPassword,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };

  deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, deleteCustomerDto] = DeleteCustomerByIdDto.create({ id: id });
    if (error) return res.status(400).json({ error: error });
    if (!deleteCustomerDto)
      return res.status(400).json({ error: "Id de cliente no encontrado" });

    new DeleteCustomerUseCaseImpl(this.customerRepository)
      .execute(deleteCustomerDto)
      .then((customer) => {
        if (!customer)
          return res.status(404).json({ error: "Cliente no encontrado" });

        //? Remover contraseña de la respuesta
        const { password, ...customerWithoutPassword } = customer;

        SocketService.emit("client:deleted", {
          customer: customerWithoutPassword,
        });

        return res.status(200).json({
          message: "Cliente eliminado exitosamente",
          customer: customerWithoutPassword,
        });
      })
      .catch((error) => {
        return this.handleHttpStatusError(error, res);
      });
  };
}
