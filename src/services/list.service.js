import { List, Task } from "#models";
import { NotFoundError, ConflictError } from "#errors";

export class ListServiceClass {
  async createList(userId, { title, color }) {
    const existingList = await List.findOne({
      user: userId,
      title: title.trim(),
    });

    if (existingList) {
      throw new ConflictError({
        message: "A list with this title already exists.",
      });
    }

    return List.create({
      title,
      color,
      user: userId,
    });
  }

  async getLists(userId, isArchived) {
    const filter = { user: userId };
    if (typeof isArchived === "boolean") {
      filter.isArchived = isArchived;
    }

    return List.find(filter).sort({ createdAt: -1 });
  }

  async getListById(userId, listId) {
    const list = await List.findOne({ _id: listId, user: userId });
    if (!list) {
      throw new NotFoundError({ message: "List not found." });
    }
    return list;
  }

  async updateList(userId, listId, updateData) {
    if (updateData.title) {
      const duplicate = await List.findOne({
        _id: { $ne: listId },
        user: userId,
        title: updateData.title.trim(),
      });

      if (duplicate) {
        throw new ConflictError({
          message: "Another list with this title already exists.",
        });
      }
    }

    const list = await List.findOneAndUpdate(
      { _id: listId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!list) {
      throw new NotFoundError({ message: "List not found." });
    }

    return list;
  }

  async deleteList(userId, listId) {
    const list = await List.findOneAndDelete({ _id: listId, user: userId });
    if (!list) {
      throw new NotFoundError({ message: "List not found." });
    }

    await Task.deleteMany({ list: listId });

    return { message: "List deleted successfully." };
  }
}

export const ListService = new ListServiceClass();
