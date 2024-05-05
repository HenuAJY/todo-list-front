const DB_NAME = "TASK_LIST";
const TASK_TABLE_NAME = "TASKS";
const DETAIL_TABLE_NAME = "DETAILS";
let db: IDBDatabase;
let taskStore: IDBObjectStore;
let detailStore: IDBObjectStore;

async function initDB(): Promise<void> {
  if (db) {
    return;
  }
  return await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME);
    request.addEventListener("error", (e) => {
      console.error("打开数据库报错", e);
    });
    request.addEventListener("success", (e) => {
      db = request.result;
      console.log("打开数据库成功");
      console.log(db);
      resolve();
    });
    request.addEventListener("upgradeneeded", (e) => {
      // console.log("数据库升级，在这个事件里创建表");
      const db = e.target?.result;

      //创建任务表
      if (!db.objectStoreNames.contains(TASK_TABLE_NAME)) {
        taskStore = db.createObjectStore(TASK_TABLE_NAME, { keyPath: "id" });
        taskStore.createIndex("id", "id", { unique: true });
        taskStore.createIndex("completed", "completed", { unique: false });
      }
      //创建任务详情表
      if (!db.objectStoreNames.contains(DETAIL_TABLE_NAME)) {
        detailStore = db.createObjectStore(DETAIL_TABLE_NAME, {
          keyPath: "taskId",
        });
        detailStore.createIndex("taskId", "taskId", { unique: true });
      }
    });
  });
}

export async function addData<T>(tableName: string, data: T): Promise<void> {
  await initDB();
  return await new Promise((resolve, reject) => {
    const trans = db.transaction(tableName, "readwrite");
    const store = trans.objectStore(tableName);
    const req = store.add(data);
    req.addEventListener("error", (e) => {
      console.error("新增失败", e);
      reject(e);
    });
    req.addEventListener("success", (e) => {
      console.log("新增成功");
      resolve();
    });
  });
}

async function deleteData(
  conditions: { tableName: string; id: string }[],
): Promise<void> {
  await initDB();
  const trans = db.transaction(
    conditions.map(({ tableName }) => tableName),
    "readwrite",
  );
  const requests = conditions.map(({ tableName, id }) => {
    return new Promise((resolve, reject) => {
      const store = trans.objectStore(tableName);
      const req = store.delete(id);
      req.addEventListener("error", (e) => {
        console.error("删除失败", e);
        reject(e);
      });
      req.addEventListener("success", (e) => {
        console.log("删除成功");
        resolve(void 0);
      });
    });
  });
  await Promise.all(requests);
}

async function updateData<T>(tableName: string, data: T): Promise<void> {
  await initDB();
  const trans = db.transaction(tableName, "readwrite");
  return await new Promise((resolve, reject) => {
    const store = trans.objectStore(tableName);
    const request = store.put(data);
    request.addEventListener("error", (e) => {
      reject(e);
    });
    request.addEventListener("success", (e) => {
      resolve();
    });
  });
}

async function getDataById<T>(
  tableName: string,
  id: string,
): Promise<T | undefined> {
  await initDB();
  const trans = db.transaction(tableName);
  return await new Promise((resolve, reject) => {
    const store = trans.objectStore(tableName);
    const request = store.get(id);
    request.addEventListener("error", (e) => {
      reject(e);
    });
    request.addEventListener("success", (e) => {
      const data = request.result;
      resolve(data);
    });
  });
}

async function getAlData<T>(tableName: string): Promise<T[]> {
  await initDB();
  const trans = db.transaction(tableName);
  return await new Promise((resolve, reject) => {
    const store = trans.objectStore(tableName);
    const request = store.openCursor();
    const result: T[] = [];
    request.addEventListener("error", (e) => {
      reject(e);
    });
    request.addEventListener("success", (e) => {
      const cursor = e.target?.result;
      if (cursor) {
        console.log(cursor);
        result.push(cursor.value);
        cursor.continue();
      } else {
        console.log("已获取全部数据");
        resolve(result);
      }
    });
  });
}

export const taskAction: TaskAction = {
  async addTask(taskTitle: string): Promise<void> {
    const task: Task = {
      completed: false,
      completedDate: 0,
      createDate: Date.now(),
      description: "",
      id: Date.now() + Math.random().toString(16).substring(2),
      title: taskTitle,
    };
    const detail: Detail = {
      taskId: task.id,
      detail: "",
    };
    try {
      await addData(TASK_TABLE_NAME, task);
      await addData(DETAIL_TABLE_NAME, detail);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async completeTaskById(id: string, done: boolean): Promise<void> {
    try {
      const task = await getDataById<Task>(TASK_TABLE_NAME, id);
      if (task) {
        task.completed = done;
        task.completedDate = Date.now();
        await updateData(TASK_TABLE_NAME, task);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async deleteTaskById(id: string): Promise<void> {
    try {
      await deleteData([
        { tableName: TASK_TABLE_NAME, id },
        { tableName: DETAIL_TABLE_NAME, id },
      ]);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async getAllTask(): Promise<Task[]> {
    try {
      const allTask = await getAlData<Task>(TASK_TABLE_NAME);
      return allTask;
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async getCompletedTask(): Promise<Task[]> {
    const allTask = await getAlData<Task>(TASK_TABLE_NAME);
    return allTask.filter(({ completed }) => completed);
  },
  async getCurrentWeekTask(): Promise<Task[]> {
    const allTask = await getAlData<Task>(TASK_TABLE_NAME);
    const result: Task[] = [];
    for (const task of allTask) {
      if (!task.completed || completedInCurrentWeek(task)) {
        result.push(task);
      }
    }
    return result;
  },
  async getDetailTaskById(id: string): Promise<DetailTask | undefined> {
    try {
      const task = await getDataById<Task>(TASK_TABLE_NAME, id);
      const detail = await getDataById<Detail>(DETAIL_TABLE_NAME, id);
      if (task) {
        const detailTask: DetailTask = {
          ...task,
          ...(detail || { taskId: task.id, detail: "" }),
        };
        return detailTask;
      }
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async getLastWeekCompletedTask(): Promise<Task[]> {
    try {
      const taskList = await getAlData<Task>(TASK_TABLE_NAME);
      const result = [];
      for (const task of taskList) {
        if (task.completed && inLastWeek(task)) {
          result.push(task);
        }
      }
      return result;
    } catch (e) {
      return Promise.reject(e);
    }
  },
  getPendingTaskList(): Promise<Task[]> {
    return Promise.resolve([]);
  },
  async saveTaskDetail(id: string, detail: string): Promise<void> {
    const taskDetail: Detail = {
      taskId: id,
      detail,
    };
    try {
      await updateData(DETAIL_TABLE_NAME, taskDetail);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  async updateTaskTitle(id: string, title: string): Promise<void> {
    const task = await getDataById<Task>(TASK_TABLE_NAME, id);
    if (!task) {
      return;
    }
    task.title = title;
    try {
      await updateData(TASK_TABLE_NAME, task);
    } catch (e) {
      return Promise.reject(e);
    }
  },
};

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

function inLastWeek(task: Task): boolean {
  const date = new Date(task.createDate);
  date.setDate(date.getDate() + 7);
  const [start, end] = getCurrentWeekRange();
  return date >= start && date < end;
}
