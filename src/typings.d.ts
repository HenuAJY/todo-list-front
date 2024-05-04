declare interface Task {
  id: string;
  title: string;
  description: string;
  createDate: number;
  completed: boolean;
  completedDate: number;
}

declare interface DetailTask extends Task {
  detail: string;
}

declare type Action<T> = React.ComponentProps<T>["action"];
declare type Loader<T> = React.ComponentProps<T>["loader"];

declare interface TaskAction {
  addTask(taskTitle: string): Promise<void>;

  completeTaskById(id: string, done: boolean): Promise<void>;

  getPendingTaskList(): Promise<Task[]>;

  getCompletedTask(): Promise<Task[]>;

  deleteTaskById(id: string): Promise<void>;

  getCurrentWeekTask(): Promise<Task[]>;

  getDetailTaskById(id: string): Promise<DetailTask | undefined>;

  saveTaskDetail(id: string, detail: string): Promise<void>;

  updateTaskTitle(id: string, title: string): Promise<void>;

  getAllTask(): Promise<Task[]>;

  getLastWeekCompletedTask(): Promise<Task[]>;
}
