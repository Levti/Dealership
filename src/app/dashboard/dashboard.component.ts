import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('maleChart') maleChart!: ElementRef;
  @ViewChild('femaleChart') femaleChart!: ElementRef;
  @ViewChild('hobbyChart') hobbyChart!: ElementRef;

  citiesData: { city: string, count: number }[] = [];
  mostVisitedCity: string | undefined;

  ngAfterViewInit(): void {
    const data = JSON.parse(localStorage.getItem('userDetails') || '[]');
    const maleData = this.filterDataByGender(data, 'Male');
    const femaleData = this.filterDataByGender(data, 'Female');
    
    const maleCounts = this.countEngineTypes(maleData);
    const femaleCounts = this.countEngineTypes(femaleData);
    const hobbyCounts = this.countHobbies(data);
    this.citiesData = this.countCities(data);

    const motorLabels = ['Fuel', 'Electric'];

    this.createChart('Number of entries male', maleCounts, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)', motorLabels, this.maleChart.nativeElement);
    this.createChart('Number of entries female', femaleCounts, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)', motorLabels, this.femaleChart.nativeElement);
    this.createPieChart('Number of entries', hobbyCounts, this.getColors(Object.keys(hobbyCounts)), this.hobbyChart.nativeElement);

    this.setMostVisitedCity();
  }

  filterDataByGender(data: any[], gender: string): any[] {
    return data.filter(entry => entry.gender === gender);
  }

  countEngineTypes(data: any[]): any {
    const counts: { [key: string]: number } = { 'Fuel': 0, 'Electric': 0 };

    data.forEach(entry => {
      const motorType = entry.motorType;
      if (motorType === 'Fuel' || motorType === 'Electric') {
        counts[motorType] = (counts[motorType] || 0) + 1;
      }
    });

    return counts;
  }

  countHobbies(data: any[]): any {
    const counts: { [key: string]: number } = {};
    data.forEach(entry => {
      const hobbies = entry.hobbies;
      if (hobbies) {
        hobbies.forEach((hobby: string) => {
          counts[hobby] = (counts[hobby] || 0) + 1;
        });
      }
    });
    return counts;
  }

  countCities(data: any[]): { city: string, count: number }[] {
    const counts: { [city: string]: number } = {};
    data.forEach(entry => {
      const city = entry.city;
      counts[city] = (counts[city] || 0) + 1;
    });

    const citiesData = Object.keys(counts).map(city => ({ city, count: counts[city] }));

    citiesData.sort((a, b) => b.count - a.count);

    return citiesData;
  }

  setMostVisitedCity(): void {
    debugger;
    if (this.citiesData.length === 1) {
        this.mostVisitedCity = this.citiesData[0].city;
    } else if (this.citiesData.length > 1) {
        const topCity = this.citiesData[0];
        const isTie = this.citiesData.every(city => city.count === topCity.count);
        if (isTie) {
            this.mostVisitedCity = "Tie";
        } else {
            this.mostVisitedCity = topCity.city;
        }
    } else {
        this.mostVisitedCity = undefined;
    }
    }

  

  createChart(gender: string, counts: { [key: string]: number }, backgroundColor: string, borderColor: string, labels: string[], chartElement: any): void {
    const ctx = chartElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar', // There are better charts for this kind of data, but I didn't see support for them in Chart.js library. for example stacked bar chart could work better.
      data: {
        labels: labels,
        datasets: [{
          label: gender,
          data: Object.values(counts),
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  createPieChart(label: string, counts: { [key: string]: number }, colors: string[], chartElement: any): void {
    const ctx = chartElement.getContext('2d');
  
    if (Object.keys(counts).length === 0) {
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available for pie chart', chartElement.width / 2, chartElement.height / 2);
      return;
    }

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: label,
          data: Object.values(counts),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'start',
          },
        },
      },
    });
  }
  

  getColors(labels: string[]): string[] {
    return labels.map(label => this.getRandomColor());
  }

  getRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  getSuccessRate(): number {
    const storedSubmissions = localStorage.getItem('successfulSubmissions');
    const storedTotalSubmissions = localStorage.getItem('totalVisitors');
  
    let successfulSubmissions = 0;
    let totalSubmissions = 0;
  
    if (storedSubmissions) {
      successfulSubmissions = parseInt(storedSubmissions);
    }
    
    if (storedTotalSubmissions) {
      totalSubmissions = parseInt(storedTotalSubmissions);
    }
  
    if (totalSubmissions === 0) {
      return 0;
    }
    
    const successRate = (successfulSubmissions / totalSubmissions) * 100;
    return parseFloat(successRate.toFixed(1));
  }
}  
