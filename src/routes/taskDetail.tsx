import React, { useEffect, useRef, useState } from "react";
import { Route, useLoaderData } from "react-router-dom";
import { taskAction } from "../taskAction";
import {LeftOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router";

export const loader: React.ComponentProps<typeof Route>["loader"] = async ({
  params,
}) => {
  const { taskid } = params;
  const task = await taskAction.getDetailTaskById(taskid as string);
  if (!task) {
    throw new Error(`任务id:${taskid}对应的任务不存在`);
  }
  console.log(params);
  return { task };
};

function debounce(func: Function, wait: number) {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

function useDelaySave(
  detailTask: DetailTask,
  delay: number,
): [boolean, () => Promise<void>] {
  const [saving, setSaving] = useState(false);
  const firstMount = useRef(true);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!firstMount.current) {
      timer = setTimeout(manualSave, delay);
    }

    return () => {
      firstMount.current = false;
      clearTimeout(timer);
    };
  }, [detailTask, delay]);

  const manualSave = async () => {
    setSaving(true);
    await taskAction.updateTaskTitle(detailTask.id, detailTask.title);
    await taskAction.saveTaskDetail(detailTask.id, detailTask.detail);
    setSaving(false);
  };

  return [saving, manualSave];
}

function TaskDetail() {
  const { task } = useLoaderData() as { task: DetailTask };
  const [detailTask, setTaskDetail] = useState<DetailTask>(task);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [saving, manualSave] = useDelaySave(detailTask, 10000);
  const saveRef = useRef(manualSave);
  const navigate = useNavigate();
  saveRef.current = manualSave;

  useEffect(() => {
    return () => {
      //组件卸载时自动保存
      saveRef.current();
    };
  }, []);

  useEffect(() => {
    titleRef.current!.textContent = task.title;
    detailRef.current!.innerHTML = task.detail;
  }, [task]);

  const handleTitleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    setTaskDetail({
      ...detailTask,
      title: e.currentTarget.textContent || "",
    });
  };

  const handleDetailInput = (e: React.FormEvent<HTMLDivElement>) => {
    setTaskDetail({
      ...detailTask,
      detail: e.currentTarget.innerHTML,
    });
  };

  const handleSave = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e);
    if (e.ctrlKey && e.code === "KeyS") {
      e.preventDefault();
      e.stopPropagation();
      manualSave();
    }
  };

  return (
    <div className="taskDetail" onKeyDown={handleSave}>
      <nav className={"taskDetailNav"}>
        <LeftOutlined onClick={() => {
          navigate(-1);
        }} />
        <span className={`savingSpanner ${saving ? "saving" : ""}`}>
          正在保存...
        </span>
      </nav>
      <div className="detail">
        <div className="detailInner">
          <h2
            className="taskTitle"
            contentEditable="true"
            data-placeholder="任务标题"
            onInput={handleTitleInput}
            ref={titleRef}
          />
          <div
            className="taskDetailContent"
            contentEditable="true"
            data-placeholder="任务详情"
            onInput={handleDetailInput}
            ref={detailRef}
          />
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
