import React, { memo, useState } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { Button, Checkbox, Input, List } from "antd";
import { taskAction } from "../taskAction";
import { Link, Route, useLoaderData, useSubmit } from "react-router-dom";
import { QueryType } from "../config";


export const action: Action<typeof Route> = async ({ request }) => {
  const data = await request.json();
  const { type, payload } = data;
  if (type === "addTask") {
    await taskAction.addTask(payload);
  } else if (type === "delTask") {
    await taskAction.deleteTaskById(payload);
  } else if (type === "doneTask") {
    await taskAction.completeTaskById(payload.id, payload.done);
  }
  return {};
};

type LoaderReturnType = {
  taskList: Task[];
};

export const loader: Loader<typeof Route> = async ({
  params,
}): Promise<LoaderReturnType> => {
  const type = params.type as QueryType;
  let taskList: Task[] = [];
  if (type === QueryType.all) {
    //查询所有任务
    taskList = await taskAction.getAllTask();
  } else if (type === QueryType.currentWeek) {
    //查询本周任务
    taskList = await taskAction.getCurrentWeekTask();
  } else if (type === QueryType.lastWeek) {
    //查询上周任务
    taskList = await taskAction.getLastWeekCompletedTask();
  } else if (type === QueryType.completed) {
    taskList = await taskAction.getCompletedTask();
  }
  return { taskList };
};

const TaskItem = memo(function TaskItem({ task }: { task: Task }) {
  const submit = useSubmit();
  const handleTaskDone = (e: CheckboxChangeEvent) => {
    submit(
      { type: "doneTask", payload: { id: task.id, done: e.target.checked } },
      { method: "post", encType: "application/json", replace: true },
    );
  };
  const handleDelete = () => {
    submit(
      { type: "delTask", payload: task.id },
      { method: "post", encType: "application/json", replace: true },
    );
  };

  return (
    <div className={`taskItem ${task.completed ? "completed" : ""}`}>
      <List.Item
        extra={
          <Button
            className="btnDelTask"
            danger
            onClick={handleDelete}
            size="small"
          >
            删除
          </Button>
        }
        actions={[]}
      >
        <List.Item.Meta
          avatar={
            <Checkbox checked={task.completed} onChange={handleTaskDone} />
          }
          description={`创建时间：${new Date(task.createDate).toLocaleDateString()};完成时间：${task.completed ? new Date(task.completedDate).toLocaleDateString() : "未完成"}`}
          style={{ alignItems: "center" }}
          title={
            <Link to={`/taskdetail/${task.id}`}>
              <pre className={"taskTitle"}>{task.title || "该任务暂无标题"}</pre>
            </Link>
          }
        />
      </List.Item>
    </div>
  );
});

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="taskList">
      <List
        className="list"
        dataSource={tasks}
        renderItem={(item, index) => <TaskItem task={item} />}
        rowKey="id"
      />
    </div>
  );
}

function FooterInput() {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskTitle(e.target.value);
  };

  const submit = useSubmit();
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      submit(
        { type: "addTask", payload: taskTitle },
        { method: "post", encType: "application/json", replace: true },
      );
      setTaskTitle("");
    }
  };
  return (
    <div className="footerInput">
      <Input.TextArea
        name="taskTitle"
        onChange={handleTextChange}
        onKeyUp={handleKeyUp}
        placeholder="输入任务，按Ctrl+Enter保存"
        style={{ resize: "none" }}
        value={taskTitle}
      ></Input.TextArea>
    </div>
  );
}

function PendingTask() {
  const { taskList } = useLoaderData() as LoaderReturnType;

  return (
    <div className="pendingTask">
      <TaskList tasks={taskList} />
      <div className="addTaskPanel">
        <FooterInput />
      </div>
    </div>
  );
}

export default PendingTask;
