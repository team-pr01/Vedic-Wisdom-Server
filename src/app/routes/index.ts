import { Router } from "express";
import { AuthRoute } from "../modules/auth/auth.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { UserRoutes } from "../modules/users/users.route";
import { TempleRoutes } from "../modules/temple/temple.route";
import { FoodRoutes } from "../modules/food/food.routes";
import { VastuRoutes } from "../modules/vastu/vastu.route";
import { VastuTipsRoutes } from "../modules/vastuTips/vastuTips.routes";
import { NewsRoutes } from "../modules/news/news.route";
import { AiRoutes } from "../modules/ai/ai.route";
import { ReelsRoutes } from "../modules/reels/reels.route";
import { CourseRoutes } from "../modules/course/course.route";
import { AyurvedaRoutes } from "../modules/ayurveda/ayurveda.route";
import { JobRoutes } from "../modules/job/job.route";
import { ApplicationRoutes } from "../modules/job/applications/application.route";
import { ReferralRoutes } from "../modules/referral/referral.route";
import { VendorRoutes } from "../modules/shop/vendor/vendor.route";
import { ProductRoutes } from "../modules/shop/product/product.route";
import { AudioBookRoutes } from "../modules/audioBook/audioBook.route";
import { AudioTracksRoutes } from "../modules/audioBook/audioTrack/audiotracks.route";

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
  {
    path: "/news",
    route: NewsRoutes,
  },
  {
    path: "/ai",
    route: AiRoutes,
  },
  {
    path: "/reels",
    route: ReelsRoutes,
  },
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/ayurveda",
    route: AyurvedaRoutes,
  },
  {
    path: "/job",
    route: JobRoutes,
  },
  {
    path: "/application",
    route: ApplicationRoutes,
  },
  {
    path: "/referral",
    route: ReferralRoutes,
  },
  {
    path: "/product",
    route: ProductRoutes,
  },
  {
    path: "/vendor",
    route: VendorRoutes,
  },
  {
    path: "/audioBook",
    route: AudioBookRoutes,
  },
  {
    path: "/audioTracks",
    route: AudioTracksRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
