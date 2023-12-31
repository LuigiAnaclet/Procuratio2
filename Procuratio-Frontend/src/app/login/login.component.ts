// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  user: any = {};
  returnUrl!: string;

  constructor(private userService: UserService,private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {}

  login(): void {
    this.userService.login(this.user).subscribe(
      (response) => {
        this.userService.getUser(this.user.email).subscribe(
          (data: User) => {
              this.user=data;
              this.authService.login(this.user);
              this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigateByUrl(this.returnUrl);
          });
        /**/
      },
      (error) => {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(this.returnUrl);
      }
    );
  }
}
