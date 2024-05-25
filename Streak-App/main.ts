class StreakApp {
  displayingDiv = document.querySelector<HTMLInputElement>('.activities');
  inputText = document.querySelector<HTMLInputElement>('#text');
  inputDate = document.querySelector<HTMLInputElement>('#date');
  saveBtn = document.querySelector<HTMLInputElement>('#submission-button');
  errorMessage: any = document.querySelector<HTMLParagraphElement>('.error-message');
  showActivity = document.querySelector('.refresh') as HTMLButtonElement;
  clearBtn = document.querySelector('.clear-btn') as HTMLButtonElement;

  myArray: any = [];
  jsonFile: any;
  
  constructor() {
    this.saveBtn?.addEventListener('click',
      () => {
        this.displayItemsOnUI();

        let inputTextHolder = this.inputText?.value;
        let inputDateHolder = this.inputDate?.value;

        let currentDate = new Date();
        let selectedDate = new Date(inputDateHolder!);

        currentDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        let numberOfDays = Math.ceil((Math.abs(currentDate.getTime() - selectedDate.getTime())) / (1000 * 60 * 60 * 24));

        let isValid = inputTextHolder !== '' && inputDateHolder !== '';

        if (isValid) {

          let change1 = `Activity: ${inputTextHolder}`;
          let change2 = `Start Date: ${inputDateHolder}`;
          let change3 = `Days progressed: ${numberOfDays}`;

          let AppendObject = {
            activity: change1,
            date: change2,
            days: change3
          }

          this.myArray.push(AppendObject)

          this.jsonFile = JSON.stringify(this.myArray);

          this.storeInDatabase();
        }
        else {
          this.errorMessage.textContent = 'Please Enter Appropriate Values';

          setTimeout(() => {
            this.errorMessage.textContent = '';
          }, 2500);

        }
      }
    )

    this.showActivity.addEventListener('click', () => {
      this.displayItemsOnUI();
    })

    this.clearBtn.addEventListener('click', () => {
      let allDeleter = document.querySelectorAll('.activities .activity-diagram')
      allDeleter.forEach(box => {
        box.remove();
      })
    })

  }

  displayItemsOnUI() {
    let fetchedData = new Promise(async(resolve, reject) => {
      try {
        let data = await fetch('http://localhost:3000/activities');

        let dataFetched = await data.json();

        dataFetched.forEach((objectItem: any, index: number) => {

          let allDeleter = document.querySelectorAll('.activities .activity-diagram')
          allDeleter.forEach(box => {
            box.remove();
          })
          
          let activityDiagram = document.createElement('div');
          activityDiagram.className = 'activity-diagram';

          let imageView = document.createElement('img');
          imageView.setAttribute('src', 'icons/stopped.png');

          let activity = document.createElement('h2');
          activity.textContent = objectItem.activity;

          let startDate = document.createElement('h3');
          startDate.textContent = objectItem.date;

          let daysCount = document.createElement('h4');
          daysCount.textContent = objectItem.days;

          let deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete';
          deleteBtn.textContent = 'Delete';

          activityDiagram.appendChild(imageView);
          activityDiagram.appendChild(activity);
          activityDiagram.appendChild(startDate);
          activityDiagram.appendChild(daysCount);
          activityDiagram.appendChild(deleteBtn);
          this.displayingDiv?.appendChild(activityDiagram);

          deleteBtn.addEventListener('click', () => {
            let myNuber = index;
            this.deleteAnItem(myNuber);
          })
        });

        resolve(dataFetched);
      } catch (error) {
        reject('error fetching data from fake database "db.json"')
      }
    })
  }

  storeInDatabase() {
    let setter = new Promise<any>(async (resolve, reject) => {
      try {

        let setData = await fetch('http://localhost:3000/activities', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: this.jsonFile
        })

        resolve(setData);

        if (!setData.ok) {
          console.log(`Error: ${setData.statusText}`);
        }
        
      } catch (error) {
        reject('Error connecting to the server')
      }
    })
  }

  deleteAnItem(arg: number) {
    let deletingVar = new Promise<any>(async (resolve, reject) => {
      try {
        let mainDeleter = await fetch('http://localhost:3000/activities', {
          method: 'DELETE'
        });

        resolve(mainDeleter);

        if (mainDeleter.ok) {
          this.myArray = this.myArray.splice(arg, 1);
          this.storeInDatabase();
          this.displayItemsOnUI();
        }
        else {
          console.log('There was an error in sending the data');
        }
      } catch (error) {
        reject(`error`)
      }
    })
  }

}

let runMyApp = new StreakApp();