import { CommonModule, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

type CarScrapped = {
  make: string;
  model: string;
  image: string;
  link: string;
  price: number;
  description?: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    SelectButtonModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  stateOptions: any[] = [
    { label: 'Gallery', value: 'gallery' },
    { label: 'List', value: 'list' },
  ];
  stateSelected: string = 'gallery';
  isList: boolean = false;
  apiUrl: string = 'https://api.findcar.myshort.pl/';
  title = 'CarScrapper';
  scrapped: CarScrapped[] = [];
  scrappedUi: CarScrapped[] = [];
  selectedIndex: number = 0;
  refreshAvailable: boolean = true;
  sortIcon: string = '';

  constructor(private http: HttpClient, private primengConfig: PrimeNGConfig) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    let url = this.apiUrl + 'home';
    this.http.get<CarScrapped[]>(url).subscribe({
      next: (result: CarScrapped[]) => {
        this.scrapped = result.sort((a, b) => a.make.localeCompare(b.make));
        this.scrappedUi = structuredClone(this.scrapped);
      },
      error: () => (this.refreshAvailable = true),
    });
  }
  sync() {
    this.refreshAvailable = false;
    let url = this.apiUrl + 'home/sync';
    this.http.put<CarScrapped[]>(url, null).subscribe({
      next: (result: CarScrapped[]) => {
        this.scrapped = result.sort((a, b) => a.make.localeCompare(b.make));
        this.selectedIndex = 0;

        this.refreshAvailable = true;
      },
      error: () => (this.refreshAvailable = true),
    });
  }
  getGoogleLink(car: CarScrapped) {
    let url =
      'https://www.google.com/search?q=[CAR_NAME]&sca_esv=e3c3b1085bd2627c&sca_upv=1&udm=2&biw=1680&bih=915&ei=ozvtZuvDJ8SGxc8PpOHmkQw&ved=0ahUKEwiroZealtGIAxVEQ_EDHaSwOcIQ4dUDCBA&uact=5&oq=bmw+x5&gs_lp=Egxnd3Mtd2l6LXNlcnAiBmJtdyB4NTIIEAAYgAQYsQMyCBAAGIAEGLEDMgUQABiABDIIEAAYgAQYsQMyCBAAGIAEGLEDMggQABiABBixAzIIEAAYgAQYsQMyBRAAGIAEMgUQABiABDIIEAAYgAQYsQNIswhQ3ARY0AZwAXgAkAEAmAE8oAFxqgEBMrgBA8gBAPgBAZgCA6ACfMICDRAAGIAEGLEDGEMYigXCAhAQABiABBixAxhDGIMBGIoFwgIEEAAYA5gDAIgGAZIHATOgB-oI&sclient=gws-wiz-serp';
    let carName = car.make + '+' + car.model + '+' + new Date().getFullYear();
    carName = carName.replaceAll(' ', '+');
    url = url.replace('[CAR_NAME]', carName);
    return url;
  }
  refresh(id: number) {
    if (this.selectedIndex == 0) {
      if (!confirm('Jesteś pewien?\nTo chwilę potrwa...')) return;
    }
    this.refreshAvailable = false;
    let url = this.apiUrl + 'home/' + (id == 0 ? '' : id);
    this.http.put<CarScrapped[]>(url, null).subscribe({
      next: (result: CarScrapped[]) => {
        this.scrapped = result.sort((a, b) => a.make.localeCompare(b.make));

        let opt = this.getOptions()[this.selectedIndex];
        this.optChange({
          target: { value: opt, selectedIndex: this.selectedIndex },
        });

        this.refreshAvailable = true;
      },
      error: () => (this.refreshAvailable = true),
    });
  }
  optChange(e: any) {
    let opt = e.target.value;
    this.selectedIndex = e.target.selectedIndex;
    if (this.selectedIndex == 0) {
      this.scrappedUi = structuredClone(this.scrapped);
      return;
    }

    this.scrappedUi = structuredClone(
      this.scrapped.filter((x) => x.make == opt)
    );
  }
  getNames() {
    let result: string[] = [];
    let names = this.scrappedUi.map((x) => x.make);
    names.forEach((x) => {
      if (!result.includes(x)) result.push(x);
    });
    return result;
  }
  getOptions() {
    let result: string[] = ['--- All ---'];
    let names = this.scrapped.map((x) => x.make);
    names.forEach((x) => {
      if (!result.includes(x)) result.push(x);
    });
    return result;
  }
  filterItems(make: string) {
    var result = this.scrappedUi.filter((x) => x.make == make);
    result.sort((a, b) => a.price - b.price);
    return result;
  }
  togglePriceSorting() {
    if (this.sortIcon == '' || this.sortIcon == 'down') {
      this.sortDescending();
      this.sortIcon = 'up';
      return;
    }
    this.sortAscending();
    this.sortIcon = 'down';
  }
  sortAscending() {
    this.scrappedUi = this.scrappedUi.sort((a, b) => b.price - a.price);
  }
  sortDescending() {
    this.scrappedUi = this.scrappedUi.sort((a, b) => a.price - b.price);
  }
}
