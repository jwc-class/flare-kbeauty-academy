/** Row joined with course for account / learn APIs */

export type EnrollmentWithCourse = {
  id: string;
  granted_at: string;
  expires_at: string | null;
  status: string;
  course: {
    id: string;
    title: string | null;
    slug: string | null;
    thumbnail_url: string | null;
  };
};

export type CourseLessonPublic = {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  description: string | null;
  video_provider: string | null;
  video_ref: string | null;
  is_free_preview: boolean;
};
