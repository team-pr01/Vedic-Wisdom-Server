/* eslint-disable @typescript-eslint/no-explicit-any */

export const profileSectionWeights = {
  personalInformation: 25,
  educationalInformation: 30,
  tuitionPreference: 20,
  identityInformation: 15,
  profilePicture: 10,
};

// Utility to check if value is non-empty
export const isNonEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return false;

  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return value !== 0;
  if (Array.isArray(value)) return value.some((v) => isNonEmpty(v));

  if (value instanceof Date) return true;

  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return false;
    return keys.some((k) => isNonEmpty(value[k]));
  }

  return true;
};

export const calculateProfileSections = (tutor: any) => {
  let total = 0;

  // 1. Profile Picture (10%)
  if (isNonEmpty(tutor.imageUrl)) {
    total += profileSectionWeights.profilePicture;
  }

  // 2. Personal Information (25%)
  const personal = tutor.personalInformation || {};
  const personalFields = [
    "overview",
    "additionalPhoneNumber",
    "address",
    "dateOfBirth",
    "fatherName",
    "motherName",
    "fatherPhoneNumber",
    "motherPhoneNumber",
    "emergencyContactNumber",
    "religion",
  ];

  const personalFilled = personalFields.filter((f) =>
    isNonEmpty(personal[f])
  ).length;

  total +=
    (personalFilled / personalFields.length) *
    profileSectionWeights.personalInformation;

  // 3. Educational Information (30%)
  const edu = tutor.educationalInformation || [];
  const maxEduItems = 3;

  if (Array.isArray(edu) && edu.length > 0) {
    const eduCount = Math.min(edu.length, maxEduItems);
    total +=
      (eduCount / maxEduItems) *
      profileSectionWeights.educationalInformation;
  }

  // 4. Tuition Preference (20%)
  const tuition = tutor.tuitionPreference || {};
  const tuitionFields = [
    "expectedSalary",
    "tuitionStyle",
    "preferredCategories",
    "preferredClasses",
    "preferredSubjects",
    "preferredCities",
    "preferredLocations",
    "placeOfTuition",
    "tutoringMethod",
  ];

  const tuitionFilled = tuitionFields.filter((f) =>
    isNonEmpty(tuition[f])
  ).length;

  total +=
    (tuitionFilled / tuitionFields.length) *
    profileSectionWeights.tuitionPreference;

  // 5. Identity / Credential (15%) — full if at least 1 file uploaded
  const identity = tutor.identityInformation || [];

  if (Array.isArray(identity)) {
    const hasAtLeastOneFile = identity.some((i) =>
      isNonEmpty(i.file)
    );

    if (hasAtLeastOneFile) {
      total += profileSectionWeights.identityInformation;
    }
  }

  return Math.round(total);
};