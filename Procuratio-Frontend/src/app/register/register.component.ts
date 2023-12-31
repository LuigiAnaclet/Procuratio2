import { AfterViewInit, Component, EventEmitter, Input, Output,  ViewChild, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import intlTelInput from 'intl-tel-input';
import { NgForm, FormControl, Validators } from '@angular/forms';
declare var intlTelInputUtils: { numberFormat: { E164: any; }; };
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit,OnDestroy{
  @ViewChild('telInput')
  telInput!: { nativeElement: Element; };
  @ViewChild('registerForm') registerForm!: NgForm;
    @Input() phoneNumber = '';
    @Input() cssClass = 'form-control';
    iti!: intlTelInput.Plugin;
    isInvalid = false;
    selectedCountryCode: any;
    submitted = false;
    returnUrl!: string;

  user: User = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: ''
  };

  constructor(private userService: UserService,private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService) {}

  register(form: NgForm): void {
    this.submitted = true;
    if (!this.isInvalid && this.registerForm.valid) {
      if (this.authService.isUserLoggedIn()){
        this.userService.register(this.user).subscribe(
          (response) => {
            this.router.navigateByUrl('/');
          },
          (error) => {
            console.error('Registration failed:', error);
            this.router.navigateByUrl('/register');
          }
        );
      }
      else {
        this.userService.register(this.user).subscribe(
        (response) => {
          this.authService.login(this.user);
          this.router.navigateByUrl('/');
        },
        (error) => {
          console.error('Registration failed:', error);
          this.router.navigateByUrl('/register');
        }
      );}
      
    }
  }
  ngAfterViewInit(){
    this.iti = intlTelInput(this.telInput.nativeElement, {
        utilsScript: "assets/scripts/utils.js",
        nationalMode: false,
        formatOnDisplay: true
    });
    this.selectedCountryCode = this.iti.getSelectedCountryData().dialCode;
}
ngOnDestroy(){
    this.iti.destroy();
}

onFocus = () =>{
    if(this.user.phone == undefined || this.user.phone == ""){
        var getCode = this.iti.getSelectedCountryData().dialCode;
        this.user.phone = "+" + getCode + " ";
    }
}

onBlur = ()=>{
    this.isInvalid = false;
    if(this.user.phone != undefined && this.user.phone.trim()){
        if(this.iti.isValidNumber()){
            this.isInvalid = false;
        }
        else{
            this.isInvalid = true;
        }
    }   
}

onInputKeyPress = (event: KeyboardEvent) =>{
    const allowedChars = /[0-9\+\-\ ]/;
const allowedCtrlChars = /[axcv]/; // Allows copy-pasting
const allowedOtherKeys = [
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'Home',
  'End',
  'Insert',
  'Delete',
  'Backspace',
];

if (
  !allowedChars.test(event.key) &&
  !(event.ctrlKey && allowedCtrlChars.test(event.key)) &&
  !allowedOtherKeys.includes(event.key)
) {
  event.preventDefault();
}
}

formatIntlTelInput() {
    if (typeof intlTelInputUtils !== 'undefined') {
        var currentText = this.iti.getNumber(intlTelInputUtils.numberFormat.E164);
        if (typeof currentText === 'string') {
            this.iti.setNumber(currentText);
        }
    }
}
}
