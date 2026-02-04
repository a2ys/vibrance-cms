export interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  image_path: string;
}

export interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
  httpEtag?: string;
}
