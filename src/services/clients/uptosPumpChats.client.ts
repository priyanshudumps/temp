import config from "../../config/config";
import logger from "../../config/logger";

const BASE_URL = "https://pump.uptos.xyz";

interface ThreadItem {
  id: number;
  img: string | null;
  content: string;
  createdBy: string;
  replyTo: number | null;
  tokenAddr: string;
  createdAt: string;
  likeC: number;
  userName: string;
  userImg: string;
  isDev: boolean;
  liked: boolean;
}

interface ThreadResponse {
  threads: ThreadItem[];
  totalCount: number;
}

interface ThreadParams {
  page?: number;
  pageSize?: number;
  userAddr?: string;
}

/**
 * Fetches thread data for a specific token
 * 
 * @param tokenAddr - The token address to fetch thread data for
 * @param params - Optional parameters including page, pageSize, and userAddr
 * @returns A promise resolving to the thread data and total count
 */
const getThreadsByTokenAddress = async (
  tokenAddr: string, 
  params: ThreadParams = {}
): Promise<ThreadResponse> => {
  try {
    const queryParams: ThreadParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      userAddr: params.userAddr || ""
    };
    
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
    
    const url = `${BASE_URL}/token/${tokenAddr}/api/thread`;
    const response = await fetch(`${url}?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns an array with two elements:
    // First element: Array of thread items
    // Second element: Total count
    return {
      threads: data[0],
      totalCount: data[1]
    };
  } catch (error) {
    logger.error(`Error fetching thread data from Pump API: ${error}`);
    return {
      threads: [],
      totalCount: 0
    };
  }
};

export {
  getThreadsByTokenAddress,
  type ThreadItem,
  type ThreadResponse,
  type ThreadParams
};