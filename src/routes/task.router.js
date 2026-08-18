import { Router } from "express";
import { TaskController } from "#controllers";
import { ValidateMiddleware, AuthMiddleware } from "#middlewares";
import {
  createTaskContract,
  getTasksContract,
  updateTaskContract,
  reorderTasksContract,
  deleteTaskContract,
} from "#contracts";

export const taskRouter = Router({ mergeParams: true });

taskRouter.use(AuthMiddleware.authenticate);

taskRouter
  .route("/lists/:listId/tasks")
  .post(
    ValidateMiddleware.validate(createTaskContract),
    TaskController.createTask,
  )
  .get(ValidateMiddleware.validate(getTasksContract), TaskController.getTasks);

taskRouter.patch(
  "/lists/:listId/tasks/reorder",
  ValidateMiddleware.validate(reorderTasksContract),
  TaskController.reorderTasks,
);

taskRouter
  .route("/tasks/:id")
  .patch(
    ValidateMiddleware.validate(updateTaskContract),
    TaskController.updateTask,
  )
  .delete(
    ValidateMiddleware.validate(deleteTaskContract),
    TaskController.deleteTask,
  );
