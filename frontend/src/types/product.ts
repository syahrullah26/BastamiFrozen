export interface ProductUnit {
  id: number;
  unit_name: string;
  conversion_factor: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  stock: number;
  units: ProductUnit[];
}

export interface ProductUnitRequest {
  unit_name: string;
  conversion_factor: number;
  price: number;
}
export interface ProductRequest {
  name: string;
  image: string;
  stock: number;
  units: ProductUnitRequest[];
}

export interface EditProductFormInput {
  name: string;
  stock: number;
  image?: string | null;
  units: {
    unit_name: string;
    conversion_factor: number;
    price: number;
  }[];
}
