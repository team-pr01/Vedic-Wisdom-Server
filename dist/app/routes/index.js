"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const admin_route_1 = require("../modules/admin/admin.route");
const users_route_1 = require("../modules/users/users.route");
const temple_route_1 = require("../modules/temple/temple.route");
const food_routes_1 = require("../modules/food/food.routes");
const vastu_route_1 = require("../modules/vastu/vastu.route");
const vastuTips_routes_1 = require("../modules/vastuTips/vastuTips.routes");
const news_route_1 = require("../modules/news/news.route");
const ai_route_1 = require("../modules/ai/ai.route");
const reels_route_1 = require("../modules/reels/reels.route");
const course_route_1 = require("../modules/course/course.route");
const ayurveda_route_1 = require("../modules/ayurveda/ayurveda.route");
const job_route_1 = require("../modules/job/job.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoute,
    },
    {
        path: "/admin",
        route: admin_route_1.AdminRoutes,
    },
    {
        path: "/user",
        route: users_route_1.UserRoutes,
    },
    {
        path: "/temple",
        route: temple_route_1.TempleRoutes,
    },
    {
        path: "/food",
        route: food_routes_1.FoodRoutes,
    },
    {
        path: "/vastu",
        route: vastu_route_1.VastuRoutes,
    },
    {
        path: "/vastu-tips",
        route: vastuTips_routes_1.VastuTipsRoutes,
    },
    {
        path: "/news",
        route: news_route_1.NewsRoutes,
    },
    {
        path: "/ai",
        route: ai_route_1.AiRoutes,
    },
    {
        path: "/reels",
        route: reels_route_1.ReelsRoutes,
    },
    {
        path: "/course",
        route: course_route_1.CourseRoutes,
    },
    {
        path: "/ayurveda",
        route: ayurveda_route_1.AyurvedaRoutes,
    },
    {
        path: "/job",
        route: job_route_1.JobRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
