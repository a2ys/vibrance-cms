export interface Event {
  id: number;
  event_name: string;
  club_name: string;
  event_type: string;
  event_for: string;
  poster_path: string;
  start_date_time: string;
  end_date_time: string;
  price_per_person: number;
  participation_type: string;
  event_venue: string;
  short_description: string;
  long_description: string;
  is_special_event: boolean | number;
  registration_link: string;
  team_size: string;
}

export interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
  httpEtag?: string;
}
