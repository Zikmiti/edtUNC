import { noUndefined } from '@angular/compiler/src/util';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { filter } from 'rxjs/operators'
@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {

  @Input()
  public uid : string = '';
  
  public grps : string = '';
  public options : string[] = [" ","9A","9C","9B","GRP1","GRP2","GRP3","GRP4","GRP5"]

  constructor(private router: Router,private route: ActivatedRoute,public toastController: ToastController) { 
    this.route = route;
  }


  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 10000,
      cssClass: "centerToast",
    });
    toast.present();
  }


  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
     if(queryParams.ErrorMessage != undefined) this.presentToast(queryParams.ErrorMessage);
    });
  }

  change(value){
    this.grps = value;
  }

  navigate(){
    // this.router.config.push({path: 'form', loadChildren:`/home/${this.uid}/${this.grp}`})
    if(this.uid != '') this.router.navigateByUrl(`/home/${this.uid}/${this.grps}`);
    
  }
}
