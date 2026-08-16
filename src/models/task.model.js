import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [50, "Task title cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: [true, "Task must belong to a list"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Fast lookups for ordered tasks inside a specific list
taskSchema.index({ list: 1, isCompleted: 1, order: 1 });

export const Task = mongoose.model("Task", taskSchema);
