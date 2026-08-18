import express from "express";

import { ListController, TaskController } from "#controllers";

import { ValidateMiddleware, AuthMiddleware } from "#middlewares";
import {
  createListContract,
  getListsContract,
  getListByIdContract,
  updateListContract,
  deleteListContract,
  createTaskContract,
  getTasksContract,
  updateTaskContract,
  reorderTasksContract,
  deleteTaskContract,
} from "#contracts";

export const listRouter = express.Router();
listRouter.use(AuthMiddleware.authenticate);
listRouter
  .route("/")
  .get(ValidateMiddleware.validate(getListsContract), ListController.getLists)
  .post(
    ValidateMiddleware.validate(createListContract),
    ListController.createList,
  );

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

listRouter
  .route("/:listId/tasks")
  .get(ValidateMiddleware.validate(getTasksContract), TaskController.getTasks)
  .post(
    ValidateMiddleware.validate(createTaskContract),
    TaskController.createTask,
  );

listRouter
  .route("/:listId/tasks/reorder")
  .patch(
    ValidateMiddleware.validate(reorderTasksContract),
    TaskController.reorderTasks,
  );

export const taskRouter = express.Router();
taskRouter.use(AuthMiddleware.authenticate);

taskRouter
  .route("/:taskId")
  .patch(
    ValidateMiddleware.validate(updateTaskContract),
    TaskController.updateTask,
  )
  .delete(
    ValidateMiddleware.validate(deleteTaskContract),
    TaskController.deleteTask,
  );
