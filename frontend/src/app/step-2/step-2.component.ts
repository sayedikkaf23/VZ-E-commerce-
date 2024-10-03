import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClientModule along with HttpClient
import { FormsModule } from '@angular/forms';
import { FormDataService } from '../service/form-data.service'; // Adjust the path as necessary
import { ToastrService } from 'ngx-toastr';  // Import ToastrService

declare const AOS: any;
declare const $: any;
@Component({
  selector: 'app-step-2',
  standalone: true,
  imports: [FormsModule, HttpClientModule], // Add HttpClientModule to the imports array
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

  constructor(private formDataService: FormDataService, private http: HttpClient) {
    // Retrieve the Step 1 data from the service when Step 2 initializes
    this.step1Data = this.formDataService.getStep1Data();
    console.log('Step 1 data:', this.step1Data);
  }

  // Handle file input changes
  onFileChange(event: any, fieldName: string) {
    if (fieldName === 'passport') {
      this.files.passport = event.target.files[0];
    } else if (fieldName === 'salaryStatements') {
      // Store all files as an array under the same field name without indices
      this.files.salaryStatements = Array.from(event.target.files);
    }
  }
  
  ngAfterViewInit() {
    AOS.init(); // Initialize AOS animations

    $(window).scroll(() => {
      const height = $(window).scrollTop();
      if (height > 50) {
        $('html').addClass('sticky');
      } else {
        $('html').removeClass('sticky');
      }
    });

    $(document).ready(() => {
      $('.scrollToTop').click((event: any) => {
        event.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        return false;
      });

      $('.navbar-toggle').click(() => {
        $('html').toggleClass('menu-show');
      });

      $('.header-menu-overlay').click(() => {
        $('html').removeClass('menu-show');
      });
    });
  }
  // Later in your code when constructing FormData to send to the server
 

  onSubmit() {
    const formDataToSend = new FormData();

    // Append Step 1 data
    for (const key in this.step1Data) {
      if (this.step1Data.hasOwnProperty(key)) {
        formDataToSend.append(key, this.step1Data[key]);
      }
    }
console.log(this.formData.nationality)
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
      // Append each file under the same name 'salaryStatements'
      this.files.salaryStatements.forEach(file => {
        formDataToSend.append('salaryStatements', file);
      });
    }

    // Send data to backend
    this.http.post('http://localhost:3000/user/submit', formDataToSend).subscribe(
      (response) => {
        console.log('Success:', response);
        // alert('Form submitted successfully!'); // Show success toast
        alert('Form submitted successfully')

        // Optionally navigate to another page after success
      },
      (error) => {
        console.error('Error:', error);
        alert(error)
        // alert('Form submission failed. Please try again.'); // Show error toast
        alert('Form submission failed. Please try again')

      }
    );
  }
}

