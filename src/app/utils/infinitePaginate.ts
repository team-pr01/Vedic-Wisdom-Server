/* eslint-disable @typescript-eslint/no-explicit-any */
export const infinitePaginate = async (
  model: any,
  query: any,
  skip: number,
  limit: number,
  populate: any[] = []
) => {
  let dbQuery = model.find(query);

  populate.forEach((pop) => {
    dbQuery = dbQuery.populate(pop);
  });

  const [data, filteredTotal] = await Promise.all([
    dbQuery.skip(skip).limit(limit).sort({ createdAt: -1 }),
    model.countDocuments(query),
  ]);

  return {
    data,
    meta: {
      filteredTotal,
      skip,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
      hasMore: skip + data.length < filteredTotal,
    },
  };
};