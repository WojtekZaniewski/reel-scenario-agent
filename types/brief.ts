export type ContentType = 'reel' | 'carousel' | 'post';

export interface Brief {
  contentType: ContentType;
  treatment: string;
  targetAudience: string;
  tone: string;
  notes?: string;
  industry: string;
  reelFormat: string;
  carouselFormat?: string;
  postFormat?: string;
  duration: string;
  numberOfSlides?: string;
  language: string;
  controversyLevel: number;
}
