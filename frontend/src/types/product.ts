export interface ProductUnit {
  id: number;
  unit_name: string;
  conversion_factor: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  stock: number;
  units: ProductUnit[];
}
