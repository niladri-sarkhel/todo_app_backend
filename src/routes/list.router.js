import express from "express";

import { ListController } from "#controllers";
import { validateContract } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createListContract,
  getListsContract,
  getListByIdContract,
  updateListContract,
  deleteListContract,
} from "../contracts/list.contract.js";

export const listRouter = express.Router();

// Secure all list routes with authentication middleware
listRouter.use(authenticate);

listRouter
  .route("/")
  .post(validateContract(createListContract), ListController.createList)
  .get(validateContract(getListsContract), ListController.getLists);

listRouter
  .route("/:id")
  .get(validateContract(getListByIdContract), ListController.getListById)
  .patch(validateContract(updateListContract), ListController.updateList)
  .delete(validateContract(deleteListContract), ListController.deleteList);
