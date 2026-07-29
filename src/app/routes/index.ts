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
import { CourseRoutes } from "../modules/course/course.route";
import { AyurvedaRoutes } from "../modules/ayurveda/ayurveda.route";
import { JobRoutes } from "../modules/job/job.route";
import { ApplicationRoutes } from "../modules/job/applications/application.route";
import { ReferralRoutes } from "../modules/referral/referral.route";
import { VendorRoutes } from "../modules/shop/vendor/vendor.route";
import { ProductRoutes } from "../modules/shop/product/product.route";
import { AudioBookRoutes } from "../modules/audioBook/audioBook.route";
import { AudioTracksRoutes } from "../modules/audioBook/audioTrack/audiotracks.route";
import { EmergencyRoutes } from "../modules/emergency/emergency.route";
import { BooksRoutes } from "../modules/book/books/books.route";
import { BookTextRoutes } from "../modules/book/texts/bookText.route";
import { ReportMantraRoutes } from "../modules/book/reportMantra/reportMantra.route";
import { CategoryRoutes } from "../modules/categories/categories.route";
import { PopupRoutes } from "../modules/popup/popup.route";
import { ProjectRoutes } from "../modules/project/project.route";
import { ConsultantsRoutes } from "../modules/consultancyService/consultants/consultants.route";
import { ConsultationRoutes } from "../modules/consultancyService/consultations/consultations.route";
import { ReelsRoutes } from "../modules/reels/reels.route";
import { SubscriptionPlanRoutes } from "../modules/subscriptionService/subsccriptionPlan/subscriptionPlan.routes";
import { SubscriptionRoutes } from "../modules/subscriptionService/subscription/subscription.routes";
import { QuizRoutes } from "../modules/quiz/quiz.route";
import { MessageRoutes } from "../modules/message/message.route";
import { ChatRoutes } from "../modules/chat/chat.route";
import { CoinPackageRoutes } from "../modules/coin/coinPackage/coinPackage.route";
import { CoinTransactionRoutes } from "../modules/coin/coinTransaction/coinTransaction.route";
import { SavedItemRoutes } from "../modules/savedItem/savedBook.routes";
import { AudioBookPurchaseRoutes } from "../modules/audioBookPurchase/audioBookPurchase.routes";
import { VedicKnowledgeRoutes } from "../modules/rag/vedicKnowledge/vedicKnowledge.routes";

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
    path: "/audio-book",
    route: AudioBookRoutes,
  },
  {
    path: "/audio-track",
    route: AudioTracksRoutes,
  },
  {
    path: "/audio-book-purchase",
    route: AudioBookPurchaseRoutes,
  },
  {
    path: "/book",
    route: BooksRoutes,
  },
  {
    path: "/book-text",
    route: BookTextRoutes,
  },
  {
    path: "/reportMantra",
    route: ReportMantraRoutes
  },
  {
    path: "/emergency",
    route: EmergencyRoutes,
  },
  {
    path: "/category",
    route: CategoryRoutes,
  },
  {
    path: "/popup",
    route: PopupRoutes,
  },
  {
    path: "/project",
    route: ProjectRoutes,
  },
  {
    path: "/consultant",
    route: ConsultantsRoutes,
  },
  {
    path: "/consultation",
    route: ConsultationRoutes,
  },
  {
    path: "/subscription-plan",
    route: SubscriptionPlanRoutes,
  },
  {
    path: "/subscription",
    route: SubscriptionRoutes,
  },
  {
    path: "/quiz",
    route: QuizRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/message",
    route: MessageRoutes,
  },
  {
    path: "/coin-package",
    route: CoinPackageRoutes,
  },
  {
    path: "/coin-transaction",
    route: CoinTransactionRoutes,
  },
  {
    path: "/saved-item",
    route: SavedItemRoutes,
  },
  {
    path: "/vedic-knowledge",
    route: VedicKnowledgeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
