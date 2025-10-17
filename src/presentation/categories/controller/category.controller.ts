import { Request, Response } from "express";
import {
  HttpCustomErrors,
  CategoryRepository,
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoryByIdDto,
  DeleteCategoryByIdDto,
  SearchCategoriesDto,
  GetCategoriesUseCaseImpl,
  CreateCategoryUseCaseImpl,
  UpdateCategoryUseCaseImpl,
  DeleteCategoryUseCaseImpl,
  GetCategoryByIdUseCaseImpl,
  SearchCategoriesUseCaseImpl
} from "../../../domain";

export class CategoryController {
  constructor(
    private readonly categoryRepository: CategoryRepository
  ) {}

  private handleHttpStatusError = (error: unknown, res: Response) => {
    if (error instanceof HttpCustomErrors) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  };

  getAllCategories = async (req: Request, res: Response) => {
    new GetCategoriesUseCaseImpl(this.categoryRepository)
      .execute()
      .then(categories => {
        return res.status(200).json({ categories });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, getCategoryByIdDto] = GetCategoryByIdDto.create({ id });
    if (error) return res.status(400).json({ error: error });
    if (!getCategoryByIdDto) return res.status(400).json({ error: "Categoría no encontrada" });

    new GetCategoryByIdUseCaseImpl(this.categoryRepository)
      .execute(getCategoryByIdDto)
      .then(category => {
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
        return res.status(200).json({ category });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  createCategory = async (req: Request, res: Response) => {
    const body = req.body;

    const [error, createCategoryDto] = CreateCategoryDto.create(body);
    if (error) return res.status(400).json({ error: error });
    if (!createCategoryDto) return res.status(400).json({ error: "Datos incorrectos" });

    new CreateCategoryUseCaseImpl(this.categoryRepository)
      .execute(createCategoryDto)
      .then(category => {
        return res.status(201).json({
          message: "Categoría creada exitosamente",
          category
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const [error, updateCategoryDto] = UpdateCategoryDto.create({ id, ...body });
    if (error) return res.status(400).json({ error: error });
    if (!updateCategoryDto) return res.status(400).json({ error: "Categoría no encontrada" });

    new UpdateCategoryUseCaseImpl(this.categoryRepository)
      .execute(updateCategoryDto)
      .then(category => {
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
        return res.status(200).json({
          message: "Categoría actualizada exitosamente",
          category
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    const [error, deleteCategoryDto] = DeleteCategoryByIdDto.create({ id: id });
    if (error) return res.status(400).json({ error: error });
    if (!deleteCategoryDto) return res.status(400).json({ error: "Id de categoría no encontrado" });

    new DeleteCategoryUseCaseImpl(this.categoryRepository)
      .execute(deleteCategoryDto)
      .then(category => {
        if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
        return res.status(200).json({
          message: "Categoría eliminada exitosamente",
          category
        });
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };

  searchCategories = async (req: Request, res: Response) => {
    const query = req.query;
    const [error, searchCategoriesDto] = SearchCategoriesDto.create(query);
    if (error) return res.status(400).json({ error: error });
    if (!searchCategoriesDto) return res.status(400).json({ error: "Parámetros de búsqueda inválidos" });

    new SearchCategoriesUseCaseImpl(this.categoryRepository)
      .execute(searchCategoriesDto)
      .then(result => {
        return res.status(200).json(result);
      })
      .catch(error => {
        return this.handleHttpStatusError(error, res);
      });
  };
}

