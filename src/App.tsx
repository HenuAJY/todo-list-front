import { taskAction } from "./dataApi/indexedDB";
import React from "react";
import { RouterProvider, redirect, createHashRouter } from "react-router-dom";
import Root from "./routes/root";
import PendingTask, {
  action as pendingAction,
  loader as pendingLoader,
} from "./routes/pending";
import TaskDetail, { loader as detailLoader } from "./routes/taskDetail";
import { QueryType } from "./config";
import { initTaskAction } from "./taskAction";
import { addMockTask } from "./dataApi/mock";

initTaskAction(taskAction);

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        loader: ({ request }) => {
          return redirect(`/pending/${QueryType.all}`);
        },
        element: <div>哈哈哈</div>,
      },
      {
        path: "/pending/:type",
        action: pendingAction,
        loader: pendingLoader,
        element: <PendingTask />,
      },
    ],
  },
  {
    path: "/taskdetail/:taskid",
    loader: detailLoader,
    element: <TaskDetail />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
      <button
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
        }}
        onClick={addMockTask}
      >
        添加模拟数据
      </button>
    </>
  );
}

export default App;
