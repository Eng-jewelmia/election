
export interface Member {
  id: string;
  serial: number;
  photo_url: string;
  name: string;
  mobile: string;
  village: string;
  distance: string;
  org_yes_no: 'হ্যাঁ' | 'না';
  org_name: string;
  position: string;
  vote_center: string;
  remarks: string;
  created_at: string;
}

export interface AppConfig {
  unionName: string;
  wardNo: string;
  selectedCenter: string;
  allCenters: string[];
  collectorName: string;
  collectorMobile: string;
}
