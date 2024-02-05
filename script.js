const apikey = '950213f6-43cf-4fcc-b2f5-0a60bf2afd20';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', function() {

// Funkcja odpowiedzialna za pobieranie zadań.
    function apiListTasks() {
      return fetch(
        apihost + '/api/tasks',{
          headers: { Authorization: apikey }
        }
      ).then(
        function(resp) {
          if(!resp.ok) {
            alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
          }
          return resp.json();
        }
      )
    }
// Funkcja odpowiedzialna za stworzenie wyglądów i obiektów.
    function renderTask(taskId, title, description, status) {
        const section = document.createElement('section');
        section.className = 'card mt-5 shadow-sm';
        document.querySelector('main').appendChild(section);
        section.id = taskId;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement('div');
        headerDiv.appendChild(headerLeftDiv);

        const h5 = document.createElement('h5');
        h5.innerText = title;
        headerLeftDiv.appendChild(h5);

        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle text-muted';
        h6.innerText = description;
        headerLeftDiv.appendChild(h6);

        const headerRightDiv = document.createElement('div');
        headerDiv.appendChild(headerRightDiv);

        if(status == 'open'){
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
            finishButton.innerText = 'Finish';
            headerRightDiv.appendChild(finishButton);
            finishButton.addEventListener('click', function(e){
              e.preventDefault();
              apiUpdateTask(taskId, title, description, status).then(function(resp){
                console.log(resp);
                const toHide = document.getElementById(`${taskId}`).querySelectorAll('.js-task-open-only');
                // toHide.querySelectorAll('.js-task-open-only')
                toHide.forEach(element => {
                  element.remove()
                });
              })

              
            })
     
        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        headerRightDiv.appendChild(deleteButton);
        // obsługa guzika do usuwania zadań
        deleteButton.addEventListener('click', function(){
          apiDelateTask(taskId).then(
            section.remove()
          )
        })

        const ul = document.createElement('ul');
        ul.className = 'list-group list-group-flush';
        section.appendChild(ul);

        
        if(status == 'open'){
          const formDiv = document.createElement('div');
          formDiv.className = 'card-body js-task-open-only';
          section.appendChild(formDiv);
  
          const form = document.createElement('form');
          formDiv.appendChild(form);
  
          const divInForm = document.createElement('div');
          divInForm.className = 'input-group';
          form.appendChild(divInForm);


          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = 'Operation description';
          input.className = 'form-control';
          input.minLength = '5';
          divInForm.appendChild(input);
        
          const addButton = document.createElement('button');
          addButton.className = 'btn btn-info';
          addButton.innerText = 'Add';
          divInForm.appendChild(addButton);
          addButton.addEventListener('click', function(e){
            e.preventDefault();
            apiCreateOperationForTask(taskId, input.value).then(function(resp){
              renderOperation(ul, resp.data.task.status, resp.data.id, resp.data.description, resp.data.timeSpent)
            });
          })
        }

        apiListOperationsForTask(taskId).then(function (response){
            response.data.forEach(function(operation){
              renderOperation(ul, operation.task.status, operation.id, operation.description, operation.timeSpent)})
          })
        }
      
// połączenie dwóch funkcji wyżej i ich wywołanie.
    apiListTasks().then(function(response){
        response.data.forEach(function(task){
            renderTask(task.id, task.title, task.description, task.status)
        })
    })

// funckja do pobrania operacji
    function apiListOperationsForTask(taskId) {
        return fetch(apihost + '/api/tasks/' + taskId + '/operations',{
            headers: { Authorization: apikey }}).then(function (resp) {

          if (!resp.ok) {
            alert("Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny");
          }
          return resp.json();
        });
      }

      //funckja do tworzenia operacji w opisie 
    function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      // operationsList to lista <ul>
      operationsList.appendChild(li);

      const descriptionDiv = document.createElement("div");
      descriptionDiv.innerText = operationDescription;
      li.appendChild(descriptionDiv);

      const time = document.createElement("span");
      time.className = "badge badge-success badge-pill ml-2";
      time.innerText = timeFormating(timeSpent);
      descriptionDiv.appendChild(time);

      if(status == 'open'){
        const timeButtonDiv = document.createElement('div');
        li.appendChild(timeButtonDiv);

        const button15m = document.createElement('button');
        button15m.innerText = '+15m';
        button15m.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        button15m.addEventListener('click', function(e){
          e.preventDefault();
          timeSpent += 15;
          apiUpdateOperation(operationId, operationDescription, timeSpent).then(function(resp){
            time.innerText = timeFormating(timeSpent);
          })
        })

        const button1h = document.createElement('button');
        button1h.innerText = '+1h';
        button1h.className = 'btn btn-outline-success btn-sm mr-2 js-task-open-only';
        button1h.addEventListener('click', function(e){
          e.preventDefault();
          timeSpent += 60;
          apiUpdateOperation(operationId, operationDescription, timeSpent).then(function(resp){
            time.innerText = timeFormating(timeSpent);
          })
        })

        const buttonDelete = document.createElement('button');
        buttonDelete.innerText = 'Delete';
        buttonDelete.className = 'btn btn-outline-danger btn-sm js-task-open-only';
        buttonDelete.addEventListener('click', function(e){
          e.preventDefault();
          apiDeleteOperation(operationId).then(function(resp){
            li.remove();
          })
        })

        timeButtonDiv.appendChild(button15m);
        timeButtonDiv.appendChild(button1h);
        timeButtonDiv.appendChild(buttonDelete);
      }
    }

    // zmiana czasu z liczb na format
    function timeFormating(time){
      if(time < 60){
        return(time + 'm')
      }else{return(`${Math.floor(time / 60)}h ${time % 60}m`)}
    }

    //tworzenie nowyuch zadań
    function apiCreateTask(title, description) {
      return fetch(
        apihost + '/api/tasks',
        {
          headers: { Authorization: apikey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title, description: description, status: 'open' }),
          method: 'POST'
        }
      ).then(
        function(resp) {
          if(!resp.ok) {
            alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
          }
          return resp.json();
        }
      )
    }

    // obsługa danych wysłanych z formularza.
    const addTaskButon = this.querySelector('.btn-info');
    addTaskButon.addEventListener('click', function(e){
      e.preventDefault();
      const form = document.querySelector('.js-task-adding-form');
      const title = form[0].value;
      const description = form[1].value;

      apiCreateTask(title, description).then(function(response){
        renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
      });

      form[0].value = '';
      form[1].value = '';

    })

    //usuwanie zadań
    function apiDelateTask(taskID){
      return fetch(
        apihost + `/api/tasks/` + taskID, {
          headers: {Authorization: apikey},
          method: 'DELETE'
        }
        ).then(
          function(resp) {
            if(!resp.ok) {
              alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
          }
        )
      }

      //dodawanie operacji
      function apiCreateOperationForTask(taskId, description){
        return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',{
          headers: { Authorization: apikey, 'Content-Type': 'application/json' },
          body: JSON.stringify({description: description, timeSpent: 0}),
          method: 'POST'
        }
      ).then(
        function(resp) {
          if(!resp.ok) {
            alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
          }
          return resp.json();
        }
      )
    }

    //dodawanie czasu do operacji.
    function apiUpdateOperation(operationId, description, timeSpent){
      return fetch(
        apihost + '/api/operations/' + operationId,{
          headers: { Authorization: apikey, 'Content-Type': 'application/json' },
          body: JSON.stringify({description: description, timeSpent: timeSpent}),
          method: 'PUT'
      }
    ).then(
      function(resp) {
        if(!resp.ok) {
          alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
        }
        return resp.json();
      }
    )
  }

  //usuwanie operacji
  function apiDeleteOperation(operationId){
    return fetch(
      apihost + '/api/operations/' + operationId,{
        headers: { Authorization: apikey},
        method: 'DELETE'
    }
  ).then(
    function(resp) {
      if(!resp.ok) {
        alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
      }
      return resp.json();
    }
  )
}

//obsłucga przyciksu finish
function apiUpdateTask(taskId, title, description, status){
  return fetch(
    apihost + '/api/tasks/' + taskId,{
      headers: { Authorization: apikey, 'Content-Type': 'application/json' },
      body: JSON.stringify({description: description, title: title, status: "closed"}),
      method: 'PUT'
  }
).then(
  function(resp) {
    if(!resp.ok) {
      alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
    }
    return resp.json();
  }
)
}

});
