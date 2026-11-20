export interface Tuition {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  daysPerWeek: number;
  description: string;
  bannerImage: string;
  tutorName: string;
  status: string;
  isActive: boolean;
}

export interface TuitionApiResponse {
  success: boolean;
  message: string;
  total: number;
  data: Tuition[];
}
