import fetch from "node-fetch";

export interface ISearchUser {
  address: `0x${string}`;
  twitterUsername: string;
  twitterName: string;
  twitterPfpUrl: string;
}
export interface ISearchUsersResponse {
  users: ISearchUser[];
}
export async function friendFromUsername(username: string) {
  const qp = new URLSearchParams({
    username,
  });
  const response = await fetch(
    `https://prod-api.kosetto.com/search/users?${qp.toString()}`,
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9",
        Authorization: process.env.FT_TOKEN,
        "cache-control": "no-cache",
        "content-type": "application/json",
        referer: "https://www.friend.tech/",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      method: "GET",
    }
  );
  const json: ISearchUsersResponse = await response.json();
  // find the user that matches the username exactly
  const ln = username.toLowerCase();
  const user = json.users?.find((u) => u.twitterUsername.toLowerCase() === ln);
  if (!user) {
    return null;
  }
  return user;
}
