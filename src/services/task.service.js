import { Task, List } from "#models";
import { NotFoundError } from "#errors";

export class TaskServiceClass {
  async _verifyListOwnership(userId, listId) {
    const list = await List.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new NotFoundError({ message: "List not found." });
    }
    return list;
  }

  async createTask(userId, listId, taskData) {
    await this._verifyListOwnership(userId, listId);

    let order = taskData.order;
    if (order === undefined) {
      const lastTask = await Task.findOne({ list: listId }).sort({ order: -1 });
      order = lastTask ? lastTask.order + 1 : 0;
    }

    return Task.create({
      ...taskData,
      list: listId,
      order,
    });
  }

  async getTasks(userId, listId, isCompleted) {
    await this._verifyListOwnership(userId, listId);

    console.log("db:", Task.db.name);
    console.log("collection:", Task.collection.name);

    const filter = { list: listId };
    if (typeof isCompleted === "boolean") {
      filter.isCompleted = isCompleted;
    }

    return Task.find(filter).sort({ order: 1, createdAt: -1 });
  }

  async updateTask(userId, taskId, updateData) {
    const task = await Task.findById(taskId).populate("list");

    console.log("TASK:", task);
    console.log("TASK LIST:", task?.list);
    console.log("LIST OWNER:", task?.list?.user);
    console.log("REQUEST USER:", userId);
    console.log("taskId:", taskId);
    console.log("task:", task);
    console.log("db:", Task.db.name);
    console.log("collection:", Task.collection.name);

    if (!task || task.list.user.toString() !== userId.toString()) {
      throw new NotFoundError({ message: "Task not found." });
    }

    Object.assign(task, updateData);
    await task.save();

    return task;
  }

  async reorderTasks(userId, listId, items) {
    await this._verifyListOwnership(userId, listId);

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item._id, list: listId },
        update: { $set: { order: item.order } },
      },
    }));

    await Task.bulkWrite(bulkOps);
    return { message: "Tasks reordered successfully." };
  }

  async deleteTask(userId, taskId) {
    const task = await Task.findById(taskId).populate("list");

    if (!task || task.list.user.toString() !== userId.toString()) {
      throw new NotFoundError({ message: "Task not found." });
    }

    await task.deleteOne();
    return { message: "Task deleted successfully." };
  }
}

export const TaskService = new TaskServiceClass();
