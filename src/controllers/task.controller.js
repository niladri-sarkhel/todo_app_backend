import { TaskService } from "#services";

export class TaskControllerClass {
  createTask = async (req, res, next) => {
    try {
      const task = await TaskService.createTask(
        req.user.id,
        req.params.listId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req, res, next) => {
    try {
      const isCompleted =
        req.query.isCompleted !== undefined
          ? req.query.isCompleted === "true"
          : undefined;

      const tasks = await TaskService.getTasks(
        req.user.id,
        req.params.listId,
        isCompleted,
      );

      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req, res, next) => {
    try {
      const task = await TaskService.updateTask(
        req.user.id,
        req.params.taskId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  reorderTasks = async (req, res, next) => {
    try {
      const result = await TaskService.reorderTasks(
        req.user.id,
        req.params.listId,
        req.body.tasks,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req, res, next) => {
    try {
      const result = await TaskService.deleteTask(
        req.user.id,
        req.params.taskId,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const TaskController = new TaskControllerClass();
