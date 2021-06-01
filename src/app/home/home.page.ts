import { Component,OnInit, Input } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { request } from 'request';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
@Injectable()
export class HomePage implements OnInit {


  
  public details : Detail[] = [];
  public headers : HttpHeaders;
  public etudiant: string;
  @Input() public currentDate: Date = new Date();
  public currentSemaine : String[];
  public printable: Detail[] = [];
  public cours: any[][] = [];  
  public uid: string;
  public grp: string;
  public ready:boolean = false;
  public result :any[] = [];
  public weekNumber : Number = this.getWeekNumber(new Date()).valueOf();
  public colorCard : Number[];

  constructor(private http: HttpClient,private route: ActivatedRoute,private router: Router) {
   
   
  }

  updateMyDate($event) {
   this.currentDate = new Date(Date.parse($event.value)); 
   this.weekNumber  = this.getWeekNumber(this.currentDate) ;
   this.createEdt(this.weekNumber.valueOf());
  }

  ngOnInit(): void {
    this.getData(this.route.snapshot.paramMap.get('uid'),this.route.snapshot.paramMap.get('grp')); //récupère les données en fonction des params d'url
  }


  previousWeek(){
    if(this.weekNumber.valueOf() > 1 && this.weekNumber.valueOf() <= 53) this.weekNumber = this.weekNumber.valueOf() - 1 //N°Semaine -1
    this.createEdt(this.weekNumber.valueOf()); //création du edt avec le nouveau N° semaine
  }

  nextWeek(){
    if(this.weekNumber.valueOf() >= 1 && this.weekNumber.valueOf() < 53) this.weekNumber = this.weekNumber.valueOf() + 1 //N°Semaine + 1
    this.createEdt(this.weekNumber.valueOf()); //création du edt avec le nouveau N° semaine
  }


  createEdt(wkNbr : number){ //création de l'edt en fonction du N° Semaine
    // console.log(wkNbr)
    this.result = [];   // initialisation à vide 
    this.cours = [];
    this.currentSemaine = this.getDateRangeOfWeek(wkNbr) //tableau de tout les jours de la semaine en fonction du N° semaine de l'année
    console.log(this.currentSemaine)
    this.details.forEach(detail => {
      this.currentSemaine.forEach(jour =>{
        if(detail.date.full == jour){
          this.printable.push(detail);
          let key = detail.date.full.split(' ')[0];
          if(this.cours[key] === undefined) this.cours[key] =  [];
          this.cours[key].push(detail);
        }
      })
    });

    this.result = [this.cours["lundi"],this.cours["mardi"],this.cours["mercredi"],this.cours["jeudi"],this.cours["vendredi"],this.cours["samedi"]]; //réorganise la semaine dans l'ordre

    this.result.forEach((array , key) => { // this.result sont les données retourné à la vue 
      if(array != undefined){
        array.sort(function(a,b){ //tries les heures des cours de la journée dans l'ordre chronologique
          var c = a.heureDebut;
          var d = b.heureDebut;                   
          
          return c > d ? 1 : -1
          
        });
      }else{
        this.result[key] = [{date : { full : this.currentSemaine[key] } }]; //créer des jours vides, pour les jours ou il n'y pas cours
      }
      
    });

    //  console.log(this.result)
  }


  getData(uid, grp = "") {
    let url : string = "https://edt-univ-nc-api.netlify.app/.netlify/functions/api/";    //url d'api + l'universitaire ID (pseudo utilisateur)
    url += uid 

  

    this.http.get<any>(url).forEach((value)=>{
      let json = value;
      if(json.VCALENDAR){
        this.etudiant = json.VCALENDAR[0]["X-WR-CALNAME"];
        let cours = json.VCALENDAR[0].VEVENT;
        if(cours != undefined){
        cours.forEach(cours => {
           if(cours.SUMMARY.includes(grp)){ //en fonction du groupe choisi ou pas

            let matiere = cours.SUMMARY;
            let date = this.convertDate(cours.DTSTART).date;
            let debut = `${this.convertDate(cours.DTSTART).heure}`;
            let fin =  `${this.convertDate(cours.DTEND).heure}`;
            let type;
            


            matiere = matiere.split('\\n').join(';').split('\\').join(' ')

            matiere =  matiere.split(',').join('');
           matiere = matiere.replace(/ *\([^)]*\) */g, ""); //retire des informations inutiles REGEX

           matiere = matiere.replace('[Edt-Ens]', ""); //retire des informations inutiles
            
           matiere = matiere.split(";").join('<br>');
            
                
              if(cours.SUMMARY.includes("Cm") || cours.SUMMARY.includes("CM")) type = "Cm";
              if(cours.SUMMARY.includes("Td")) type = "Td";
              if(cours.SUMMARY.includes("Tp")) type = "Tp";
              if(cours.SUMMARY.includes("Colles")) type = "Colles";
              if(cours.SUMMARY.includes("Seminaire")) type = "Seminaire";
              
  
            this.details.push(new Detail(date,type,matiere,debut,fin,cours.SUMMARY.includes("CON"))); //un Detail représente un cour de l'emploie du tmps
          }
      });

      this.createEdt(this.weekNumber.valueOf()); // création de l'edt à la date du jour

      this.ready = true; //prêt à afficher ! permet de stoper l'animation de chargement

      }else{
         this.getOut("Vous avez terminé votre cursus universitaire"); //renvoie au portail si erreur
      }
    }
    else{
        this.getOut("Cet identifiant n'existe pas"); //renvoie au portail si erreur
    }
  });
}


  getOut(message){
    this.router.navigate(['/form'], { queryParams: { ErrorMessage: message } }); // navigation -> portail
  }


  getWeekNumber(date : Date) : Number{ //récupère le N° de la Semaine en fonction de la Date en paramêtre

    const today = date;
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.valueOf() - firstDayOfYear.valueOf()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  }


  getDateRangeOfWeek(weekNo : Number) : String[]{ // récupère toutes les dates de la N semaine en paramêtre

    var today = new Date();

    let week = [];

    let numOfdaysPastSinceLastMonday = today.getDay() - 1;
    today.setDate(today.getDate() - numOfdaysPastSinceLastMonday);
    var weekNoToday = this.getWeekNumber(new Date());
    var weeksInTheFuture =  weekNo.valueOf() - weekNoToday.valueOf();
    today.setDate(today.getDate() +  7 * weeksInTheFuture );

    for (let i = 0; i < 7; i++) {
      if(i>0) today.setDate(today.getDate() + 1);
      let formdate = new Date(`${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`);
      let strDate = formdate.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      week.push(strDate);
    }

    return week;
};

  
 convertDate(date) : any { //Parse la date
  let y =date.substring(0,4);
  let M = date.substring(4,6);
  let d = date.substring(6,8);

  let h = date.substring(9,11);
  let m = date.substring(11,13);
  let s = date.substring(13,15);

  let formdate = new Date(`${y}-${M}-${d}T${h}:${m}:${s}`);
  formdate = this.AddHours(formdate,11);

  let strDate = formdate.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  let strJourSemaine = formdate.toLocaleDateString("fr-FR", { weekday: 'long' });
  strJourSemaine = strJourSemaine.charAt(0).toUpperCase() + strJourSemaine.substring(1).toLowerCase();
  let strJour = formdate.toLocaleDateString("fr-FR", { day: 'numeric' });
  let strMonth = formdate.toLocaleDateString("fr-FR", {month: 'long' });
  let strYear = formdate.toLocaleDateString("fr-FR", { year: 'numeric' });
  let strHeure = formdate.toLocaleDateString("fr-FR", { hour : "numeric",minute : "numeric" });

  strHeure = strHeure.substr(strHeure.length - 5)


  return {
     'date' : {
       full : strDate,
       jourSemaine : strJourSemaine,
       jour : strJour,
       mois : strMonth,
       annee : strYear,
     },
     'heure' : strHeure,
  };


 
}


  AddHours(date,hour){ // permet d'ajouter des heures
    date.setHours(date.getHours()+hour);
    return date;
  }


}


export class Detail { //Représente un cour 

  public type : String;
  public ctrl : Boolean;
  public date : any;
  public matiere : string;
  public heureDebut : string;
  public heureFin : string;

  constructor(date,type,matiere,heureDebut,heureFin,ctrl){
    this.date = date;
    this.ctrl = ctrl;
    this.type = type;
    this.matiere = matiere;
    this.heureDebut = heureDebut;
    this.heureFin = heureFin;
  }
}

