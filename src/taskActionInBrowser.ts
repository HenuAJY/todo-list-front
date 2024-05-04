async function addMockTask() {
  const taskList = await getTaskList();
  const current = new Date();
  const idSet = new Set();
  for (let i = 0; i < 100; i++) {
    let id: string = Math.random().toString(36).substring(2);
    while (idSet.has(id)) {
      id = Math.random().toString(36).substring(2);
    }
    idSet.add(id);
    const offset = Math.floor(Math.random() * 30);
    const date = new Date(current);
    date.setDate(date.getDate() - offset);

    const task: Task = {
      completed: Math.random() > 0.3,
      completedDate: 0,
      createDate: date.getTime(),
      description: "",
      id,
      title: String.fromCharCode(
        ...Array.from(
          { length: 15 * Math.random() + 4 },
          () => 97 + Math.floor(Math.random() * 26),
        ),
      ),
    };

    if (task.completed) {
      task.completedDate = new Date(
        task.createDate + Math.random() * 1000 * 60 * 60 * 24 * 7,
      ).getTime();
    }

    taskList.push(task);
  }
  saveTaskList(taskList);
}

window.addMockTask = addMockTask;

export const taskAction: TaskAction = {
  async addTask(taskTitle: string) {
    const taskList = await getTaskList();
    const id: string = Math.random().toString(36).substring(2);
    const task: Task = {
      completed: false,
      completedDate: 0,
      createDate: Date.now(),
      description: "",
      id,
      title: taskTitle,
    };
    taskList.push(task);
    saveTaskList(taskList);
  },
  async completeTaskById(id: string, done: boolean): Promise<void> {
    const taskList = await getTaskList();
    const task = taskList.find((task) => task.id === id);
    if (task) {
      task.completedDate = Date.now();
      task.completed = done;
      saveTaskList(taskList);
    }
  },
  async getPendingTaskList(): Promise<Task[]> {
    const taskList = await getTaskList();
    return taskList.filter(({ completed }) => !completed);
  },
  async getCompletedTask(): Promise<Task[]> {
    const taskList = await getTaskList();
    return taskList.filter(({ completed }) => completed);
  },
  async deleteTaskById(id: string): Promise<void> {
    const taskList = await getTaskList();
    const deleteIndex = taskList.findIndex((task) => task.id === id);
    if (deleteIndex > -1) {
      taskList.splice(deleteIndex, 1);
      saveTaskList(taskList);
    }
  },
  async getCurrentWeekTask(): Promise<Task[]> {
    const taskList = await getTaskList();
    const result: Task[] = [];
    for (const task of taskList) {
      if (!task.completed || completedInCurrentWeek(task)) {
        result.push(task);
      }
    }
    return result;
  },
  async getDetailTaskById(id: string): Promise<DetailTask | undefined> {
    const taskList = await getTaskList();
    const task = taskList.find((task) => task.id === id);
    if (task) {
      const taskDetail = await getTaskDetail(id);
      return {
        ...task,
        detail: taskDetail,
      };
    }
  },
  async saveTaskDetail(id: string, detail: string): Promise<void> {
    const details = await getAllDetails();
    details[id] = detail;
    await saveDetails(details);
  },
  async updateTaskTitle(id: string, title: string): Promise<void> {
    const taskList = await getTaskList();
    const task = taskList.find((task) => task.id === id);
    if (task) {
      task.title = title;
      saveTaskList(taskList);
    }
  },
  async getAllTask(): Promise<Task[]> {
    const taskList = await getTaskList();
    return taskList;
  },
  async getLastWeekCompletedTask(): Promise<Task[]> {
    const taskList = await getTaskList();
    const result = [];
    for (const task of taskList) {
      if (task.completed && inLastWeek(task)) {
        result.push(task);
      }
    }
    return result;
  }
};

async function fakeNetWork() {
  return await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 1000),
  );
}

function getCurrentWeekRange(): [Date, Date] {
  const current = new Date();
  current.setHours(0);
  current.setMinutes(0);
  current.setSeconds(0);

  const day = current.getDay();
  const date = current.getDate();
  const start = new Date(current);
  const end = new Date(current);
  if (day === 0) {
    start.setDate(date - 6);
    end.setDate(date + 1);
  } else {
    start.setDate(date - day + 1);
    end.setDate(start.getDate() + 7);
  }

  return [start, end];
}

function completedInCurrentWeek(task: Task): boolean {
  const date = new Date(task.completedDate);
  const [start, end] = getCurrentWeekRange();
  return date >= start && date < end;
}

async function getTaskList() {
  await fakeNetWork();
  return JSON.parse(localStorage.getItem("taskList") || "[]") as Task[];
}

async function saveTaskList(tasks: Task[]) {
  await fakeNetWork();
  localStorage.setItem("taskList", JSON.stringify(tasks));
}

async function getAllDetails(): Promise<Record<string, string>> {
  await fakeNetWork();
  return JSON.parse(localStorage.getItem("taskDetail") || "{}");
}

async function saveDetails(details: Record<string, string>) {
  localStorage.setItem("taskDetail", JSON.stringify(details));
}

async function getTaskDetail(id: string): Promise<string> {
  const details = await getAllDetails();
  return details[id] || "";
}

function inLastWeek(task: Task): boolean {
  const date = new Date(task.createDate);
  date.setDate(date.getDate() + 7);
  const [start, end] = getCurrentWeekRange();
  return date >= start && date < end;
}

