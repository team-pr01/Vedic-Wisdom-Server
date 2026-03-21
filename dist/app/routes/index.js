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
const application_route_1 = require("../modules/job/applications/application.route");
const referral_route_1 = require("../modules/referral/referral.route");
const vendor_route_1 = require("../modules/shop/vendor/vendor.route");
const product_route_1 = require("../modules/shop/product/product.route");
const audioBook_route_1 = require("../modules/audioBook/audioBook.route");
const audiotracks_route_1 = require("../modules/audioBook/audioTrack/audiotracks.route");
const emergency_route_1 = require("../modules/emergency/emergency.route");
const books_route_1 = require("../modules/book/books/books.route");
const bookText_route_1 = require("../modules/book/texts/bookText.route");
const reportMantra_route_1 = require("../modules/book/reportMantra/reportMantra.route");
const categories_route_1 = require("../modules/categories/categories.route");
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
    {
        path: "/application",
        route: application_route_1.ApplicationRoutes,
    },
    {
        path: "/referral",
        route: referral_route_1.ReferralRoutes,
    },
    {
        path: "/product",
        route: product_route_1.ProductRoutes,
    },
    {
        path: "/vendor",
        route: vendor_route_1.VendorRoutes,
    },
    {
        path: "/audioBook",
        route: audioBook_route_1.AudioBookRoutes,
    },
    {
        path: "/audioTracks",
        route: audiotracks_route_1.AudioTracksRoutes,
    },
    {
        path: "/book",
        route: books_route_1.BooksRoutes,
    },
    {
        path: "/book-text",
        route: bookText_route_1.BookTextRoutes,
    },
    {
        path: "/reportMantra",
        route: reportMantra_route_1.ReportMantraRoutes
    },
    {
        path: "/emergency",
        route: emergency_route_1.EmergencyRoutes,
    },
    {
        path: "/category",
        route: categories_route_1.CategoryRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
