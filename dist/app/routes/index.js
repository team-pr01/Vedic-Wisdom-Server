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
const popup_route_1 = require("../modules/popup/popup.route");
const project_route_1 = require("../modules/project/project.route");
const consultants_route_1 = require("../modules/consultancyService/consultants/consultants.route");
const consultations_route_1 = require("../modules/consultancyService/consultations/consultations.route");
const reels_route_1 = require("../modules/reels/reels.route");
const subscriptionPlan_routes_1 = require("../modules/subscriptionService/subsccriptionPlan/subscriptionPlan.routes");
const subscription_routes_1 = require("../modules/subscriptionService/subscription/subscription.routes");
const quiz_route_1 = require("../modules/quiz/quiz.route");
const message_route_1 = require("../modules/message/message.route");
const chat_route_1 = require("../modules/chat/chat.route");
const coinPackage_route_1 = require("../modules/coin/coinPackage/coinPackage.route");
const coinTransaction_route_1 = require("../modules/coin/coinTransaction/coinTransaction.route");
const savedBook_routes_1 = require("../modules/savedItem/savedBook.routes");
const audioBookPurchase_routes_1 = require("../modules/audioBookPurchase/audioBookPurchase.routes");
const vedicKnowledge_routes_1 = require("../modules/rag/vedicKnowledge/vedicKnowledge.routes");
const chat_routes_1 = require("../modules/rag/chat/chat.routes");
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
        path: "/audio-book",
        route: audioBook_route_1.AudioBookRoutes,
    },
    {
        path: "/audio-track",
        route: audiotracks_route_1.AudioTracksRoutes,
    },
    {
        path: "/audio-book-purchase",
        route: audioBookPurchase_routes_1.AudioBookPurchaseRoutes,
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
    {
        path: "/popup",
        route: popup_route_1.PopupRoutes,
    },
    {
        path: "/project",
        route: project_route_1.ProjectRoutes,
    },
    {
        path: "/consultant",
        route: consultants_route_1.ConsultantsRoutes,
    },
    {
        path: "/consultation",
        route: consultations_route_1.ConsultationRoutes,
    },
    {
        path: "/subscription-plan",
        route: subscriptionPlan_routes_1.SubscriptionPlanRoutes,
    },
    {
        path: "/subscription",
        route: subscription_routes_1.SubscriptionRoutes,
    },
    {
        path: "/quiz",
        route: quiz_route_1.QuizRoutes,
    },
    {
        path: "/chat",
        route: chat_route_1.ChatRoutes,
    },
    {
        path: "/message",
        route: message_route_1.MessageRoutes,
    },
    {
        path: "/coin-package",
        route: coinPackage_route_1.CoinPackageRoutes,
    },
    {
        path: "/coin-transaction",
        route: coinTransaction_route_1.CoinTransactionRoutes,
    },
    {
        path: "/saved-item",
        route: savedBook_routes_1.SavedItemRoutes,
    },
    {
        path: "/ai-chat",
        route: chat_routes_1.AIChatRoutes,
    },
    {
        path: "/vedic-knowledge",
        route: vedicKnowledge_routes_1.VedicKnowledgeRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
