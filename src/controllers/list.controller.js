import { ListService } from "#services";

export class ListControllerClass {
  createList = async (req, res, next) => {
    try {
      const list = await ListService.createList(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  };

  getLists = async (req, res, next) => {
    try {
      const isArchived =
        req.query.isArchived !== undefined
          ? req.query.isArchived === "true"
          : undefined;

      const lists = await ListService.getLists(req.user.id, isArchived);
      return res.status(200).json({
        success: true,
        data: lists,
      });
    } catch (error) {
      next(error);
    }
  };

  getListById = async (req, res, next) => {
    try {
      const list = await ListService.getListById(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  };

  updateList = async (req, res, next) => {
    try {
      const list = await ListService.updateList(
        req.user.id,
        req.params.id,
        req.body,
      );
      return res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteList = async (req, res, next) => {
    try {
      const result = await ListService.deleteList(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const ListController = new ListControllerClass();
