import { zh_CN, Faker, fakerZH_CN } from "@faker-js/faker";
import {addData} from "./indexedDB";

/**
 * 添加测试数据
 */
export async function addMockTask() {
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
      title: fakerZH_CN.lorem.words(20),
    };

    if (task.completed) {
      task.completedDate = new Date(
        task.createDate + Math.random() * 1000 * 60 * 60 * 24 * 7,
      ).getTime();
    }
    await addData("TASKS", task);
  }
}
