export interface Instagram120ReelItem {
  pk: string;
  id: string;
  code: string;
  media_type: number;
  play_count?: number;
  like_count?: number;
  comment_count?: number;
  image_versions2?: {
    candidates?: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  user?: {
    pk: string;
    id: string;
  };
  product_type?: string;
}

export interface Instagram120ReelsResponse {
  result: {
    edges: Array<{
      node: {
        media: Instagram120ReelItem;
      };
    }>;
  };
}

export interface Instagram120MediaResponse {
  caption?: {
    text: string;
  };
  user?: {
    username: string;
    full_name?: string;
  };
}
