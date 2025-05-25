export interface Challenge {
  id: string;
  name: string;
  slug: string;
  completedAt: string;
  completedLanguages: string[];
}

export interface ChallengesResponse {
  data: Challenge[];
  totalPages: number;
  totalItems: number;
}

export async function fetchAllCompletedChallenges(
  username: string,
): Promise<ChallengesResponse[]> {
  if (!username || typeof username !== "string") {
    throw new Error("Username is required");
  }

  try {
    const firstResponse = await fetch(
      `https://www.codewars.com/api/v1/users/${encodeURIComponent(username)}/code-challenges/completed?page=0`,
    );

    if (!firstResponse.ok) {
      if (firstResponse.status === 404) {
        throw new Error(`User "${username}" not found`);
      }
      throw new Error(`Failed to fetch data: ${firstResponse.status}`);
    }

    const firstData: ChallengesResponse = await firstResponse.json();

    if (!firstData?.data || !Array.isArray(firstData.data)) {
      throw new Error("Invalid response format");
    }

    const allChallenges: Challenge[] = [...firstData.data];

    const fetchPromises: Promise<ChallengesResponse>[] = [];
    for (let page = 1; page < firstData.totalPages; page++) {
      fetchPromises.push(
        fetch(
          `https://www.codewars.com/api/v1/users/${encodeURIComponent(username)}/code-challenges/completed?page=${page}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        ).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch page ${page}: ${response.status}`);
          }
          return response.json();
        }),
      );
    }

    const remainingResponses = await Promise.all(fetchPromises);
    remainingResponses.forEach((response) => {
      allChallenges.push(...response.data);
    });

    return {
      totalPages: firstData.totalPages,
      totalItems: firstData.totalItems,
      data: allChallenges.sort(
        (a, b) =>
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
      ),
    };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
}
