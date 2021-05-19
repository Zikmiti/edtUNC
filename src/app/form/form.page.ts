import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {

  @Input()
  public uid : string = '';
  
  public grps : string = '';
  public options : string[] = ["Tout","9A","9C","9B"]

  constructor(private router: Router) { }

  ngOnInit() {
  }

  change(value){
    this.grps = value;
  }

  navigate(){
    // this.router.config.push({path: 'form', loadChildren:`/home/${this.uid}/${this.grp}`})
    if(this.uid != '') this.router.navigateByUrl(`/home/${this.uid}/${this.grps}`);
    
  }
}
