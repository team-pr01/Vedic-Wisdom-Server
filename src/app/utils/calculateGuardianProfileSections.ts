/* eslint-disable @typescript-eslint/no-explicit-any */
export const profileSectionWeights = {
  profilePicture: 5,
  personalInformation: 80,
  emergencyInformation: 15,
};

// Utility to check if value is non-empty
export const isNonEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value !== 0;
  if (Array.isArray(value)) return value.some((v) => isNonEmpty(v));

  // Treat Date as non-empty
  if (value instanceof Date) return true;

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return false;
    return keys.some((k) => isNonEmpty(value[k]));
  }

  return true;
};

// Main calculation function
export const calculateGuardianProfileSections = (guardian: any): number => {
  let total = 0;

  // 1️⃣ Profile Picture (5%)
  if (isNonEmpty(guardian.imageUrl)) {
    total += profileSectionWeights.profilePicture;
  }

  // 2️⃣ Personal Information (80%) — INCLUDING SOCIAL MEDIA
  const personal = guardian.personalInformation || {};
  const social = guardian.socialMediaInformation || {};

  const personalFields = [
    // personal info
    personal.address,
    personal.dateOfBirth,
    personal.nationality,
    personal.religion,
    personal.additionalPhoneNumber,

    // social media (counted as personal)
    social.facebook,
  ];

  const personalFilled = personalFields.filter(isNonEmpty).length;

  total +=
    (personalFilled / personalFields.length) *
    profileSectionWeights.personalInformation;

  // 3️⃣ Emergency Information (15%)
  const emergency = guardian.emergencyInformation || {};
  const emergencyFields = [
    emergency.emergencyContactPersonName,
    emergency.phoneNumber,
    emergency.relation,
    emergency.address,
  ];

  const emergencyFilled = emergencyFields.filter(isNonEmpty).length;

  total +=
    (emergencyFilled / emergencyFields.length) *
    profileSectionWeights.emergencyInformation;

  return Math.round(total);
};