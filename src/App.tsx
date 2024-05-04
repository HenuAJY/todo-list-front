import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
} from "react-router-dom";
import Root from "./routes/root";
import PendingTask, {
  action as pendingAction,
  loader as pendingLoader,
} from "./routes/pending";
import TaskDetail, { loader as detailLoader } from "./routes/taskDetail";
import { QueryType } from "./config";
import { taskAction } from "./taskActionInBrowser";
import {initTaskAction} from "./taskAction";

initTaskAction(taskAction);

const router = createBrowserRouter([
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
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
