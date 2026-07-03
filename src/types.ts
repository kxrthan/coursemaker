export interface CourseFile {
  id: string;
  name: string;
  path: string;
  url: string;
  type: 'video' | 'material' | 'image' | 'other';
  completed: boolean;
  file: File;
  subtitleFile?: File;
}

export interface CourseModule {
  id: string;
  name: string;
  files: CourseFile[];
  completedFiles: number;
  totalFiles: number;
}

export interface Course {
  id: string;
  name: string;
  modules: CourseModule[];
}
