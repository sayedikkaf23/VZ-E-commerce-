import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
interface MenuItem {
  name: string;
  link: string;
}
@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Method to upload form data
  adminLogin(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.url}/user/login`, data); // Sending email and password as JSON
  }
  getUserDetails(page: number, limit: number, searchTerm?: string): Observable<any> {
    const params: any = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
 
    return this.http.get<any>(`${this.url}/user/submissions`, { params });
  }
  getBusinessBank(page: number, limit: number): Observable<any> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<any>(`${this.url}/user/getBusinessBank`, { params });
  }
  getPersonalBank(page: number, limit: number): Observable<any> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<any>( `${this.url}/user/getPersonalBank`, { params });
    // Adjust path as needed for your route
  }

  addRisk( name: string, isActive: boolean): Observable<any> {
    const data = {
      name,
      isActive
    };
  
    return this.http.post(`${this.url}/risk/addrisk`, data);
  }
  getRisk(): Observable<any> {
    return this.http.get(`${this.url}/risk/getallrisk`); 
  }

  getActiveRisk(): Observable<any> {
    return this.http.get(`${this.url}/risk/getrisk`); 
  }

  updateRiskStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.url}/risk/updaterisk/${id}/status`, { isActive });
  }

  getServices(): Observable<any> {
    return this.http.get(`${this.url}/user/services`); // GET request to fetch user services
  }

  addService(serviceName: string, description: string, isActive: boolean): Observable<any> {
    const data = {
      serviceName,
      description,
      isActive
    };
  
    return this.http.post(`${this.url}/user/services`, data);
  }



  updateService(
    serviceId: string,
    serviceData: any,
    file: File | null
  ): Observable<any> {
    const formData = new FormData();
    formData.append('serviceName', serviceData.serviceName);
    formData.append('description', serviceData.description);
    formData.append('isActive', serviceData.isActive.toString()); // Convert boolean to string

    if (file) {
      formData.append('icon', file); // Append the file if provided
    }

    return this.http.put(`${this.url}/user/services/${serviceId}`, formData); // PUT request to update the service
  }
  deleteService(serviceId: string): Observable<any> {
    return this.http.delete(`${this.url}/user/services/${serviceId}`); // DELETE request to remove the service
  }
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.url}/user/menu-items`);
  }
  checkStatus(data: { CustomerId: string; CompanyName: string }): Observable<any> {
    return this.http.post(`${this.url}/user/checkStatus`, data); // POST request to check status
  }
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, data); // POST request to /auth/login
  }
  updateKycStatus(data: { id: string; kycStatus: string ,QuotePaymentId:string}): Observable<any> {
    return this.http.post(`${this.url}/user/updateKycStatus`, data); // POST request to check status
  }


  // Get all country risks
getCountryRisks() {
  return this.http.get<any[]>(`${this.url}/api/country-risk/all`);
}

// Add a new country risk
addCountryRisk(data: { country: string, risk: string }) {
  return this.http.post(`${this.url}/api/country-risk/add`, data);
}

// Update existing country risk
updateCountryRisk(id: string, data: { country: string, risk: string }) {
  return this.http.put(`${this.url}/api/country-risk/update/${id}`, data);
}

// Delete country risk
deleteCountryRisk(id: string) {
  return this.http.delete(`${this.url}/api/country-risk/delete/${id}`);
}
// Get all product risks
getProductRisks(): Observable<any[]> {
  return this.http.get<any[]>(`${this.url}/api/product-risk/all`);
}

// Add a new product or multiple products
// Add one or more products
addProductRisk(data: any | any[]): Observable<any> {
  return this.http.post(`${this.url}/api/product-risk/add`, data);
}


updateProductRisk(id: string, data: any): Observable<any> {
  return this.http.put(`${this.url}/api/product-risk/update`, [{ _id: id, ...data }]);
}



// Delete one or more products
deleteProductRisk(id: string): Observable<any> {
  return this.http.request('delete', `${this.url}/api/product-risk/delete`, {
    body: { ids: [id] }
  });
}

getFilteredProductsByCountry(data: {
  country: string;
  selectedProductIds: string[];
  isAutoApproved: boolean;
}) {
  return this.http.post<any>(`${this.url}/api/customer/get-by-country-risk`, data);
}


}
