export class NavItems {
  constructor(
    public readonly title: string,
    public readonly path: string,
    public readonly pathMatch: string[],
    public readonly icon: string,
    public readonly children?: NavItems[],
    public isDivider = false
  ) {}
}

const dashboard = new NavItems("dashboard", "/", ["/"], "ic_menu_dashboard");
const pigManagement = new NavItems("pigManagement", "/pig-management", ["/pig-management", "/pig-management/:id"], "ic_menu_pig");
const deviceManagement = new NavItems("deviceManagement", "/device-management", ["/device-management", "/device-management/:id"], "ic_menu_device");
const feedManagement = new NavItems(
  "feedManagement",
  "/feed-management",
  ["/feed-management", "/feed-management/feed-curve", "/feed-management/forage", "/feed-management/feed-plan", "/feed-management/feed-curve/:id", "/feed-management/feed-plan/:id"],
  "ic_menu_feed"
);
// const feedManagement = new NavItems("feedManagement", "/feed-management", ["/feed-management"], "ic_menu_dashboard_selected", [
//   new NavItems("feedCurve", "/feed-curve", ["/feed-curve"], ""),
//   new NavItems("feedPlan", "/feed-plan", ["/feed-plan"], ""),
//   new NavItems("feedPolicy", "/feed-policy", ["/feed-policy"], ""),
// ]);

export const allNavItems = [dashboard, pigManagement, deviceManagement, feedManagement];

export function createNavItems() {
  return allNavItems;
}
