import express from "express";

import { ListController } from "#controllers";

import { ValidateMiddleware, AuthMiddleware } from "#middlewares";
import {
  createListContract,
  getListsContract,
  getListByIdContract,
  updateListContract,
  deleteListContract,
} from "#contracts";

export const listRouter = express.Router();

listRouter.use(AuthMiddleware.authenticate);

listRouter
  .route("/")
  .post(
    ValidateMiddleware.validate(createListContract),
    ListController.createList,
  )
  .get(ValidateMiddleware.validate(getListsContract), ListController.getLists);

listRouter
  .route("/:id")
  .get(
    ValidateMiddleware.validate(getListByIdContract),
    ListController.getListById,
  )
  .patch(
    ValidateMiddleware.validate(updateListContract),
    ListController.updateList,
  )
  .delete(
    ValidateMiddleware.validate(deleteListContract),
    ListController.deleteList,
  );
