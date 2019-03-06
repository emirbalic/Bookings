import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  isLoading = false;
  loginMode = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {}

  onLogin() {
    // this.isLoading = true;
    this.authService.login();
    this.loadingController
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingElement => {
        loadingElement.present();
        setTimeout(() => {
          // this.isLoading = false;
          loadingElement.dismiss();
          this.router.navigateByUrl('places/tabs/discover');
        }, 1500);
      });
  }
  onSwitchMode() {
    this.loginMode = !this.loginMode;
    console.log(this.loginMode);
  }
  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    if (this.loginMode) {
      // request to login
    } else {
      // request to signup
    }
  }
}
