import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import InputDock from "./pages/InputDock";
import BrainstormingBoard from "./pages/BrainstormingBoard";
import CanvasLayer from "./pages/CanvasLayer";
import ActionBar from "./pages/ActionBar";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/input",
    Component: InputDock,
  },
  {
    path: "/brainstorm",
    Component: BrainstormingBoard,
  },
  {
    path: "/canvas",
    Component: CanvasLayer,
  },
  {
    path: "/export",
    Component: ActionBar,
  },
]);
