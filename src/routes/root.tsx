import React from "react";
import { NavLink, Outlet, useNavigation } from "react-router-dom";
import { QueryType } from "../config";

const nav = [
  {
    title: "全部任务",
    to: `pending/${QueryType.all}`,
  },
  {
    title: "本周全部任务",
    to: `pending/${QueryType.currentWeek}`,
  },
  {
    title: "上周已完成",
    to: `pending/${QueryType.lastWeek}`,
  },
  {
    title: "全部已完成",
    to: `pending/${QueryType.completed}`,
  },
];

function Root() {
  const navigation = useNavigation();

  return (
    <div
      className={`todoRoot ${navigation.state === "loading" ? "loading" : ""}`}
    >
      <nav>
        <ul className="taskMenu">
          {nav.map(({ title, to }) => (
            <li key={to}>
              <NavLink
                className={({ isActive, isPending, isTransitioning }) => {
                  return isActive ? "active" : "";
                }}
                to={to}
              >
                {title}
              </NavLink>
            </li>
          ))}
        </ul>
        {navigation.state === "loading" && (
          <div className="loadingSpanner">
            <span className="text">loading...</span>
          </div>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Root;
