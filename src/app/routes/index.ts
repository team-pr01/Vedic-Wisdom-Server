import { Router } from "express";
import { AuthRoute } from "../modules/auth/auth.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { UserRoutes } from "../modules/users/users.route";
import { TempleRoutes } from "../modules/temple/temple.route";
import { FoodRoutes } from "../modules/food/food.routes";
import { VastuRoutes } from "../modules/vastu/vastu.route";
import { VastuTipsRoutes } from "../modules/vastuTips/vastuTips.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoute,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/temple",
    route: TempleRoutes,
  },
  {
    path: "/food",
    route: FoodRoutes,
  },
  {
    path: "/vastu",
    route: VastuRoutes,
  },
  {
    path: "/vastu-tips",
    route: VastuTipsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
