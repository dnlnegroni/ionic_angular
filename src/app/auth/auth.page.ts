import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { present } from '@ionic/core/dist/types/utils/overlays';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'Loggin in...'
    }).then(loadingEl => {
      loadingEl.present();
      let authObs: Observable<AuthResponseData>;
      if (this.isLogin) {
        authObs = this.authService.login(email, password);
      } else {
        authObs = this.authService.signup(email, password);
      }
      authObs.subscribe(resData => {
        console.log(resData);
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      }, errRes => {
        loadingEl.dismiss();
        const code = errRes.error.error.message;
        let message = 'Could not sign you up, please try again later';
        if (code === 'EMAIL_EXISTS') {
          message = 'This email address already exists!';
        } else if (code === 'EMAIL_NOT_FOUND') {
          message = 'Email address could not be found!';
        } else if (code === 'INVALID_PASSWORD') {
          message = 'This password is not correct!';
        }
        this.showAlert(message);
      });
    });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    this.authenticate(email, password);
  }

  private showAlert(message: string){
    this.alertCtrl
    .create({
      header: ' Auth Failed',
      message: message,
      buttons: ['Ok']
    })
    .then(alertEl => {
      alertEl.present();
    });
  }

}
