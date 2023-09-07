import React, { useEffect } from "react";
import { createHashRouter, useNavigate } from "react-router-dom";
import DeviceDetails from "../components/devices/details/DeviceDetails";
import FeedCurveDetail from "../components/feedManagement/details/FeedCurveDetail";
import FeedPlanDetail from "../components/feedManagement/details/FeedPlanDetail";
import FeedCurve from "../components/feedManagement/FeedCurve";
import FeedPlan from "../components/feedManagement/FeedPlan";
import ForageManagement from "../components/feedManagement/ForageManagement";
import MainLayout from "../components/layouts/MainLayout";
import NotFound from "../components/layouts/NotFound";
import PigDetail from "../components/pigManagement/detail/PigDetail";
import Dashboard from "../views/Dashboard";
import DeviceManagement from "../views/DeviceManagement";
import FeedManagement from "../views/FeedManagement";
import Login from "../views/Login";
import PigManagement from "../views/PigManagement";
import { Pathnames } from "./router.config";

export interface RouteWithArgs {
  path: string;
  auth?: string[];
  children?: RouteWithArgs[];
  element?: React.ReactNode | null;
  errorElement?: React.ReactNode | null;
}

export const routes: RouteWithArgs[] = [
  {
    path: "",
    auth: [],
    element: <MainLayout />,
    errorElement: <h1>Crashed</h1>,
    children: [
      { path: Pathnames.dashboard, element: <Dashboard /> },
      { path: Pathnames.pig_manage, element: <PigManagement /> },
      { path: Pathnames.pig_detail, element: <PigDetail /> },
      { path: Pathnames.device_manage, element: <DeviceManagement /> },
      { path: Pathnames.device_detail, element: <DeviceDetails /> },
      {
        path: Pathnames.feed_manage,
        element: <FeedManagement />,
        children: [
          { path: "", element: <Redirect to={Pathnames.feed_curve} /> },
          { path: Pathnames.feed_curve, element: <FeedCurve /> },
          { path: Pathnames.feed_plan, element: <FeedPlan /> },
          { path: Pathnames.feed_forage, element: <ForageManagement /> },
        ],
      },
      { path: Pathnames.feed_curve_detail, element: <FeedCurveDetail /> },
      { path: Pathnames.feed_plan_detail, element: <FeedPlanDetail /> },
      { path: "*", auth: [""], element: <NotFound /> },
    ],
  },
  { path: "/login", auth: [""], element: <Login /> },
  { path: "*", auth: [""], element: <NotFound /> },
];

export const router = createHashRouter(routes, {});

// 重定向组件
export function Redirect(props: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(props.to);
  }, [props.to, navigate]);
  return null;
}
