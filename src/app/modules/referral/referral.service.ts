/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { User } from "../auth/auth.model";
import AppError from "../../errors/AppError";
import Referral from "./referral.model";
import CoinTransaction from "./coinTransaction/coinTransaction.model";
import { generateUniqueReferralCode } from "../../utils/generateReferralCode";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { Types } from "mongoose";

/* Generate Referral Code */
const generateReferralCode = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user?.referralCode) {
        return user?.referralCode;
    }

    const code = await generateUniqueReferralCode();

    user.referralCode = code;

    await user.save();

    return code;
};

/* Handle Referral During Signup */
const handleReferralReward = async (
    newUserId: string,
    referralCode: string
) => {

    const referrer = await User.findOne({ referralCode });

    if (!referrer) return null;

    if (referrer._id.toString() === newUserId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Self referral not allowed");
    }

    // get current referral count for rank
    const referralCount = await Referral.countDocuments({
        referrer: referrer._id,
    });

    const rank = referralCount + 1;

    const referral = await Referral.create({
        referrer: referrer._id,
        referredUser: newUserId,
        rank,
    });

    referrer.referralCount += 1;

    let coins = 0;

    if (referrer.referralCount === 2) {
        coins = 10;
        referrer.premiumUnlocked = true;
    } else if (referrer.referralCount > 2) {
        coins = 5;
    }

    if (coins > 0) {
        referrer.coins += coins;

        await CoinTransaction.create({
            userId: referrer._id,
            coins,
            type: "REFERRAL",
            referenceId: referral._id,
        });
    }

    await referrer.save();

    return referral;
};

/* Get My Referrals */
const getMyReferrals = async (
  userId: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {
    referrer: new Types.ObjectId(userId),
  };

  return infinitePaginate(Referral, query, skip, limit, [
    {
      path: "referredUser",
      select: "name profilePicture",
    },
  ]);
};

/* Get All Referrals of An User */
const getAllReferralsOfAnUser = async (
  userId: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {
    referrer: new Types.ObjectId(userId),
  };

  return infinitePaginate(Referral, query, skip, limit, [
    {
      path: "referredUser",
      select: "name profilePicture",
    },
  ]);
};

/* Get My Coin Transactions */
const getMyCoins = async (userId: string) => {
    return CoinTransaction.find({ userId }).sort({ createdAt: -1 });
};

export const ReferralServices = {
    generateReferralCode,
    handleReferralReward,
    getMyReferrals,
    getAllReferralsOfAnUser,
    getMyCoins,
};