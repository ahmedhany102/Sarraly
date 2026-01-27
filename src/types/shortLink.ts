export interface ShortLink {
  id: number;
  code: string;
  original_url: string;
  resource_type?: 'product' | 'store' | 'category' | 'section';
  resource_id?: string;
  visits: number;
  created_at: string;
  updated_at: string;
}

export interface CreateShortLinkRequest {
  original_url: string;
  resource_type?: ShortLink['resource_type'];
  resource_id?: string;
}

export interface ShortLinkResponse {
  code: string;
  short_url: string;
  original_url: string;
}
