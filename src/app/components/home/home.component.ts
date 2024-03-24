import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app-service.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  commonUrl = 'http://localhost:8080/file/templates'
  templates: any
  subscribe = new Subscription()

  constructor(
    private _service: AppService,
    private _rotuer: Router,
  ){}

  ngOnInit(): void {
    this._service.getTemplates().subscribe({
      next: (res) => {
        this.templates = res
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  getImage(image: string) {
    return `${this.commonUrl}/${image}`
  }

  redirect(temp: any) {
    this._rotuer.navigate(['/editor'])
    localStorage.setItem('selectedTemp', temp.template)
  }
}
