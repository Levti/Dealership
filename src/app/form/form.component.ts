import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  userDetailsForm!: FormGroup;
  hobbiesList: string[] = ['Reading', 'Cooking', 'Sports', 'Traveling', 'Gaming'];
  favoriteColors: string[] = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple'];
  numOfSeats: number[] = [2,3,4,5,6,7];
  isSubmitted: boolean = false;
  totalVisitors: number = 0;
  totalSubmissions: number = 0;
  successfulSubmissions: number = 0;

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar, private router: Router) {}

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  
  ngOnInit(): void {
    const storedVisitors = localStorage.getItem('totalVisitors');
    if (storedVisitors) {
      this.totalVisitors = parseInt(storedVisitors);
    }

    const storedSubmissions = localStorage.getItem('successfulSubmissions');
    if (storedSubmissions) {
      this.successfulSubmissions = parseInt(storedSubmissions);
    }

    this.incrementTotalVisitors();

    this.userDetailsForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      hobbies: ['', Validators.required],
      favoriteColor: ['', Validators.required],
      requiredSeats: ['', [Validators.required, Validators.min(2), Validators.max(7)]], // min max validators are redundant.
      motorType: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.userDetailsForm.valid && !this.isSubmitted) {
      this.isSubmitted = true;

      let storedData: any[] = JSON.parse(localStorage.getItem('userDetails') || '[]');
      storedData.push(this.userDetailsForm.value);
      
          try { // No benefit from using try-catch here, but we assume we are dealing with a server.
            localStorage.setItem('userDetails', JSON.stringify(storedData));
          } 
          catch (error) {
            console.error('Error ', error);
          }
    
      this.totalSubmissions++;
      this.successfulSubmissions++;

          try { // Dealing with a 'server'.
          localStorage.setItem('successfulSubmissions', this.successfulSubmissions.toString());
          } 
          catch (error) {
          console.error('Error ', error);
          }


      this.snackBar.open('Your request was sent and a mail with your match will be sent to you!', 'Close', {
        duration: 5000, 
        verticalPosition: 'bottom', 
        horizontalPosition: 'center' 
      });
    } 
    else if (this.isSubmitted) {
      this.snackBar.open('Already submitted!', 'Close', {
        duration: 5000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
    else {
      this.snackBar.open('Please fill the form correctly!', 'Close', {
        duration: 5000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }

  incrementTotalVisitors() {
    this.totalVisitors++;
    localStorage.setItem('totalVisitors', this.totalVisitors.toString()); 
    // Total visitors will increase if a page is refreshed just to demonstrate the functionality. In a real case, it is a good idea to check if browser cookies are unique.
  }
}
