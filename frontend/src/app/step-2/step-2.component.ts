import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { FormsModule } from '@angular/forms';
import { FormDataService } from '../service/form-data.service'; // Adjust path if needed
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-step-2',
  standalone: true,
  imports: [
    FormsModule, 
    HttpClientModule // Ensure HttpClientModule is in imports
  ], 
  templateUrl: './step-2.component.html',
  styleUrls: ['./step-2.component.css'],
})
export class Step2Component {
  formData: any = {
    nationalityfile: '',
    working: '',
    salary: '',
    emiratesId: '',
  };

  files: { passport?: File; salaryStatements?: File[] } = {};
  step1Data: any = {}; // To store Step 1 data

  constructor(
    private formDataService: FormDataService,
    private userService: UserService, // Correct typo in userService
    private http: HttpClient // HttpClient is injected correctly
  ) {
    // Retrieve Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data();
    console.log('Step 1 data:', this.step1Data);
  }

  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      this.files.salaryStatements = Array.from(event.target.files);
    }
  }

  onSubmit() {
    const formDataToSend = new FormData();

    // Append Step 1 data
    for (const key in this.step1Data) {
      if (this.step1Data.hasOwnProperty(key)) {
        formDataToSend.append(key, this.step1Data[key]);
      }
    }

    // Append Step 2 data
    formDataToSend.append('nationalityfile', this.formData.nationalityfile);
    formDataToSend.append('working', this.formData.working);
    formDataToSend.append('salary', this.formData.salary);
    formDataToSend.append('emiratesId', this.formData.emiratesId);

    // Append files
    if (this.files.passport) {
      formDataToSend.append('passport', this.files.passport);
    }
    if (this.files.salaryStatements) {
      this.files.salaryStatements.forEach(file => {
        formDataToSend.append('salaryStatements', file);
      });
    }

    // Send data to backend
    this.userService.uploadUserData(formDataToSend).subscribe(
      (response) => {
        console.log('Success:', response);
        // Optionally navigate to another page after success
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
