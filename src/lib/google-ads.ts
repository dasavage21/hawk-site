/**
 * Google Ads API Integration Utility (Mock)
 *
 * In a production environment, this would use the 'google-ads-api' library
 * and require GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN.
 */

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  budget: number;
}

export async function createGoogleAdsCampaign(data: {
  name: string;
  budget: number;
}): Promise<GoogleAdsCampaign> {
  console.log("Mock: Creating Google Ads campaign", data);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: `g-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    status: "ENABLED",
    budget: data.budget,
  };
}

export async function getGoogleAdsPerformance(campaignId: string) {
  console.log("Mock: Fetching performance for", campaignId);

  return {
    clicks: Math.floor(Math.random() * 100),
    impressions: Math.floor(Math.random() * 1000),
    conversions: Math.floor(Math.random() * 10),
    cost: Math.floor(Math.random() * 5000), // in cents
  };
}
