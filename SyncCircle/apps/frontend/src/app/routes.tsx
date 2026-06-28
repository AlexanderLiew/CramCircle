import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Timetable } from "./pages/Timetable";
import { Notes } from "./pages/Notes";
import { AIPlanner } from "./pages/AIPlanner";
import { Friends } from "./pages/Friends";
import { GroupChat } from "./pages/GroupChat";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";

function isAuthed() {
  return localStorage.getItem("synccircle_auth") === "true";
}

function ProtectedLayout() {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Auth,
  },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "timetable", Component: Timetable },
      { path: "notes", Component: Notes },
      { path: "ai-planner", Component: AIPlanner },
      { path: "friends", Component: Friends },
      { path: "group-chat", Component: GroupChat },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
    ],
  },
]);
