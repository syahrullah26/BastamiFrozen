export interface ApiResponse<T > {
  status: boolean;
  message: string;
  data: {
    data: T;
  };
}

export interface PaginatedApiResponse<T, S = Record<string, unknown>> {
  status: boolean;
  message: string;
  data: DataResourcePaginate<T, S>;
}

export interface DataResourcePaginate<T, S = Record<string, unknown>> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    stats: S;
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
