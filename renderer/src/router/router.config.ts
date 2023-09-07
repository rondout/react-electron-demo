export enum Pathnames {
  dashboard = "/",
  pig_manage = "/pig-management",
  pig_detail = "/pig-management/:id",
  device_manage = "/device-management",
  device_detail = "/device-management/:id",
  feed_manage = "/feed-management",
  feed_curve = "/feed-management/feed-curve",
  feed_plan = "/feed-management/feed-plan",
  feed_forage = "/feed-management/forage",
  feed_curve_detail = "/feed-management/feed-curve/:id",
  feed_plan_detail = "/feed-management/feed-plan/:id",
  login = "/login",
}

const pathnameTitleMap = new Map<Pathnames, string>([
  //   [Pathnames.root, "pathnames.root"],
  [Pathnames.dashboard, "dashboard"],
  [Pathnames.pig_manage, "pig_manage"],
  [Pathnames.pig_detail, "pig_detail"],
  [Pathnames.device_manage, "device_manage"],
  [Pathnames.device_detail, "device_detail"],
  [Pathnames.feed_manage, "feed_manage"],
  [Pathnames.feed_curve, "feed_curve"],
  [Pathnames.feed_plan, "feed_plan"],
  [Pathnames.feed_forage, "feed_forage"],
  [Pathnames.feed_curve_detail, "feed_curve_detail"],
  [Pathnames.feed_plan_detail, "feed_plan_detail"],
  [Pathnames.login, "login"],
]);

export class BreadCrumbFactory {
  public title: string;
  constructor(path: Pathnames, public linkPath?: Pathnames) {
    this.title = pathnameTitleMap.get(path);
  }
}

// export const singleBreadcrumbMap = new Map<Pathnames, BreadCrumbFactory>([]);

// Object.values(Pathnames).forEach((v) => {
//   singleBreadcrumbMap.set(v, new BreadCrumbFactory(v));
// });

export const BreadcrumbsMap = new Map<Pathnames, BreadCrumbFactory>([
  [Pathnames.dashboard, new BreadCrumbFactory(Pathnames.dashboard)],
  [Pathnames.pig_manage, new BreadCrumbFactory(Pathnames.pig_manage)],
  [Pathnames.pig_detail, new BreadCrumbFactory(Pathnames.pig_detail, Pathnames.pig_manage)],
  [Pathnames.device_manage, new BreadCrumbFactory(Pathnames.device_manage)],
  [Pathnames.device_detail, new BreadCrumbFactory(Pathnames.device_detail, Pathnames.device_manage)],
  [Pathnames.feed_manage, new BreadCrumbFactory(Pathnames.feed_manage)],
  [Pathnames.feed_curve, new BreadCrumbFactory(Pathnames.feed_curve)],
  [Pathnames.feed_plan, new BreadCrumbFactory(Pathnames.feed_plan)],
  [Pathnames.feed_forage, new BreadCrumbFactory(Pathnames.feed_forage)],
  [Pathnames.feed_curve_detail, new BreadCrumbFactory(Pathnames.feed_curve_detail, Pathnames.feed_curve)],
  [Pathnames.feed_plan_detail, new BreadCrumbFactory(Pathnames.feed_plan_detail, Pathnames.feed_plan)],
  [Pathnames.login, new BreadCrumbFactory(Pathnames.login)],
]);
